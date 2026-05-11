import type { FolderNode, QuestionnaireDataType } from './types';
// question.service.ts
import { Buffer } from 'node:buffer';
import { parseStringPromise } from 'xml2js';
import { saveQuestionnaire } from '@/app/api/questionnaire/repository';
import { generateRandomPassword } from '@/lib/utils';

const formatIBAN = (iban: string) => {
  return iban.replace(/(.{4})/g, '$1 ').trim();
};

const maskCard = (card: string) => {
  return `****${card.slice(-4)}`;
};

class NextCloudOperations {
  private NEXTCLOUD_AUTH = `Basic ${Buffer.from(`${process.env.NEXTCLOUD_USER}:${process.env.NEXTCLOUD_PASS}`).toString('base64')}`;
  private account: Record<string, any>;
  private password: string;
  private rootClientFolder: string = 'API_Klienten';
  constructor() {
    this.account = {};
    this.password = '';
  }

  private async timedFetch(label: string, url: string, options?: RequestInit) {
    const start = Date.now();
    try {
      const res = await fetch(url, options);
      const duration = Date.now() - start;
      console.warn(`⏱️ ${label} → ${duration}ms (status: ${res.status})`);
      return res;
    } catch (err) {
      const duration = Date.now() - start;
      console.error(`❌ ${label} failed after ${duration}ms`, err);
      throw err;
    }
  }

  public setAccount(account: Record<string, any>) {
    this.account = account;
    this.password = generateRandomPassword(12);
  }

  public async createNextcloudUser() {
    const payload = new URLSearchParams({
      userid: this.account.email,
      password: this.password,
      displayName: `${this.account.firstName} ${this.account.lastName}`,
      email: this.account.email,
    });

    const url = `${process.env.NEXTCLOUD_BASE_URL}/ocs/v1.php/cloud/users`;

    const myHeaders = new Headers();
    myHeaders.append('OCS-APIRequest', 'true');
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
    myHeaders.append('Authorization', this.NEXTCLOUD_AUTH);

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      redirect: 'follow',
      body: payload,
    };
    try {
      const response = await this.timedFetch(
        `createUser(${this.account.email})`,
        url,
        requestOptions,
      );

      if (!response.ok) {
        console.warn('unable to create user', response);
        throw new Error(`Failed to create user: ${response.status} ${response.statusText}`);
      }
      const text = await response.text();
      // Parse the XML to JSON
      const json = await parseStringPromise(text);
      const users = json?.ocs?.data?.[0]?.id || [];
      if (Array.isArray(users)) {
        const found = users.filter((email: string) => {
          return email.toLowerCase() === this.account.email.toLowerCase();
        });
        if (found.length > 0) {
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Nextcloud POST failed:', error);
      return false;
    }
  };

  public async getUserGroups(userId: string) {
    const url = `${process.env.NEXTCLOUD_BASE_URL}/ocs/v1.php/cloud/users/${encodeURIComponent(userId)}/groups`;

    const myHeaders = new Headers();
    myHeaders.append('OCS-APIRequest', 'true');
    myHeaders.append('Accept', 'application/json');
    myHeaders.append('Authorization', this.NEXTCLOUD_AUTH);

    const requestOptions: RequestInit = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow',
    };

    const response = await this.timedFetch(
      `getUserGroups(${userId})`,
      url,
      requestOptions,
    );

    if (!response.ok) {
      console.warn('unable to fetch groups', response);
      throw new Error(`Failed to fetch groups: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    // groups are inside data.ocs.data.groups
    return data.ocs.data.groups;
  };

  public async searchUser(email: string) {
    const data = new URLSearchParams({
      search: email,
    });
    const url = `${process.env.NEXTCLOUD_BASE_URL}/ocs/v1.php/cloud/users?${data}`;
    const requestOptions: RequestInit = {
      method: 'GET',
      headers: {
        'Authorization': this.NEXTCLOUD_AUTH,
        'OCS-APIRequest': 'true',
      },
    };
    const response = await this.timedFetch(
      `searchUser(${email})`,
      url,
      requestOptions,
    );
    if (!response.ok) {
      console.warn('unable to search user', response);
      throw new Error(`Failed to search user: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();

    // Parse the XML to JSON
    const json = await parseStringPromise(text);
    const users = json?.ocs?.data?.[0]?.users || [];
    if (Array.isArray(users)) {
      const found = users.filter((user: any) => {
        if (!user.element || !Array.isArray(user.element)) {
          return false; // Skip if user.element is not an array
        }
        if (user.element.length === 0) {
          return false; // Skip if user.element is empty
        }
        return user.element[0].toLowerCase() === email.toLowerCase();
      });
      return found.length > 0;
    }
    return false;
  };

  private encodePath(remotePath: string) {
    return remotePath
      .split('/')
      .filter(Boolean)
      .map(decodeURIComponent)
      .map(encodeURIComponent)
      .join('/');
  }

  public async createFolder(fullPath: string) {
    const baseUrl = `${process.env.NEXTCLOUD_BASE_URL}/remote.php/dav/files/${encodeURIComponent(process.env.NEXTCLOUD_USER ?? '')}/${encodeURIComponent(this.rootClientFolder)}/`;
    let preappend = '';
    if (fullPath !== '') {
      preappend = `${this.encodePath(fullPath)}/`;
    }
    const url = `${baseUrl}${preappend}`;
    const requestOptions: RequestInit = {
      method: 'MKCOL',
      headers: {
        Authorization: this.NEXTCLOUD_AUTH,
      },
      redirect: 'follow' as RequestRedirect,
    };

    const response = await this.timedFetch(
      `createFolder(${fullPath})`,
      url,
      requestOptions,
    );
    if (response.ok && (response.status === 201 || response.status === 405)) {
      console.warn('folder created successfully');
      return true;
    }
    console.warn('unable to create folder');
    return false;
  }

  // Recursive folder creation
  public async createFolderTree(basePath: string, tree: FolderNode[]) {
    for (const node of tree) {
      const fullPath = [basePath, node.name].join('/').replace(/\/+/g, '/');

      try {
        await this.createFolder(fullPath);
      } catch (err) {
        console.error(`❌ Failed to create folder: ${fullPath}`, err);
        continue;
      }

      if (node.children?.length) {
        await this.createFolderTree(fullPath, node.children);
      }
    }
  }

  public async shareFolderWithGroup(FOLDER_PATH: string, groupName: string) {
    const url = `${process.env.NEXTCLOUD_BASE_URL}/ocs/v2.php/apps/files_sharing/api/v1/shares`;
    const urlencoded = new URLSearchParams({
      path: `/${this.rootClientFolder}/${FOLDER_PATH}`,
      shareType: '1',
      shareWith: groupName,
      permissions: '31',
    });
    const requestOptions: RequestInit = {
      method: 'POST',
      headers: {
        'OCS-APIRequest': 'true',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': this.NEXTCLOUD_AUTH,
      },
      body: urlencoded,
      redirect: 'follow',
    };

    const response = await this.timedFetch(
      `shareFolder(${`/${this.rootClientFolder}/${FOLDER_PATH}`}) with group(${groupName})`,
      url,
      requestOptions,
    );
    if (response.ok) {
      console.warn('shared folder with group successfully');
    } else {
      console.warn('unable to share folder with group');
    }
  }

  public async createGroup(groupName: string) {
    const url = `${process.env.NEXTCLOUD_BASE_URL}/ocs/v2.php/cloud/groups`;

    const myHeaders = new Headers();
    myHeaders.append('OCS-APIRequest', 'true');
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
    myHeaders.append('Authorization', this.NEXTCLOUD_AUTH);

    const urlencoded = new URLSearchParams({
      groupid: groupName,
    });

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: urlencoded,
      redirect: 'follow',
    };

    const response = await this.timedFetch(
      `createGroup(${groupName})`,
      url,
      requestOptions,
    );

    if (!response.ok) {
      console.warn('unable to create group', response);
    }
  }

  public async assignGroup(groupName: string) {
    const url = `${process.env.NEXTCLOUD_BASE_URL}/ocs/v1.php/cloud/users/${encodeURIComponent(this.account.email)}/groups`;

    const urlencoded = new URLSearchParams({
      groupid: groupName,
    });

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': this.NEXTCLOUD_AUTH,
        'OCS-APIRequest': 'true',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: urlencoded,
      redirect: 'follow',
    };

    const response = await this.timedFetch(
      `assignGroup(${groupName}) to (${this.account.email})`,
      url,
      requestOptions,
    );
    if (response.ok) {
      console.warn(`assigned succesfully`);
    } else {
      console.warn(`unable to assign group to user.`);
    }
  }

  public async processFolders(groupName: string, doubleEntry: boolean, folderTree: FolderNode[] = [], ablageTree: FolderNode[] = []) {
    let parentFolder = groupName;
    await this.createFolder(parentFolder);

    await this.shareFolderWithGroup(parentFolder, groupName);

    const currentYear = new Date().getFullYear();
    if (doubleEntry) {
      parentFolder = `${parentFolder}/${currentYear}`;
      await this.createFolder(parentFolder);
    }

    parentFolder = `${parentFolder}/Buchhaltung ${currentYear}`;
    await this.createFolder(parentFolder);

    if (doubleEntry) {
      await this.createFolderTree(parentFolder, folderTree);
    } else {
    // Ablage Record Entry
      await this.createFolderTree(parentFolder, ablageTree);

      for (let i = 0; i < 12; i++) {
        const date = new Date(currentYear, i); // Year doesn't matter
        const monthName = date.toLocaleString('en-US', { month: 'long' });
        const monthFolder = `${parentFolder}/${monthName}`;
        await this.createFolder(monthFolder);

        await this.createFolderTree(monthFolder, folderTree);
      }
    }
  }
}

export async function createQuestion(data: Record<string, any>) {
  return await saveQuestionnaire(data);
}

function addPathToTree(tree: FolderNode[], path: string[]) {
  if (path.length === 0) {
    return;
  }

  const [head, ...tail] = path;
  let node = tree.find(n => n.name === head);
  if (!node) {
    node = { name: head as string };
    tree.push(node);
  }

  if (tail.length > 0) {
    if (!node.children) {
      node.children = [];
    }
    addPathToTree(node.children, tail);
  }
}

export async function processNextCloud(data: QuestionnaireDataType) {
  // Step 2: Build the folder tree
  const folderTree: FolderNode[] = [];
  const ablageTree: FolderNode[] = [];

  // BELONGS TO STEP # 2
  if (data.payrollAccounting === 'Yes') {
    // folderTree.push({ name: 'Payroll' });
    addPathToTree(folderTree, ['1_Lohnverrechnung']);
  }

  if (data.doubleEntry) {
    // BELONGS TO STEP # 3
    // Create each dynamic category as a sibling folder
    // HOW TO HANDLE DYNAMIC CATEGORIES
    addPathToTree(folderTree, ['2_Ablage']);
    if (data.filingCategories && data.filingCategories.length > 0) {
      data.filingCategories.filter((cat): cat is string => typeof cat === 'string').forEach((cat) => {
        addPathToTree(folderTree, ['2_Ablage', cat]);
      });
    }

    // STEP # 4 MANDATORY FOLDER
    addPathToTree(folderTree, ['3_Ausgangsrechnungen']);

    // STEP # 5 OPTIONAL FOLDER
    if (data.agmSettlements === 'Yes') {
      addPathToTree(folderTree, ['7_HV-Abrechnungen']);
    }

    // STEP # 6 MANDATORY FOLDER
    addPathToTree(folderTree, ['4_Eingangsrechnungen']);
    // STEP # 6-1 OPTIONAL FOLDER
    if (data.recurringBills === 'Yes') {
      addPathToTree(folderTree, ['4_Eingangsrechnungen', 'Dauerrechnungen']);
    }

    // STEP # 7 OPTIONAL FOLDERS
    if (data.person && data.person.length > 0) {
      data.person.forEach((person: { firstName: string; lastName: string }) => {
        addPathToTree(folderTree, ['6_Barauslagen', `${person.firstName} ${person.lastName}`]);
      });
    }

    // STEP # 8 - IBANS
    addPathToTree(folderTree, ['5_Bank']);
    if (data.ibans && data.ibans.length > 0) {
      data.ibans.forEach((iban: { value: string }) => {
        addPathToTree(folderTree, ['5_Bank', formatIBAN(iban.value)]);
      });
    }

    // STEP # 9 - CREDIT CARDS
    if (data.creditCards && data.creditCards.length > 0) {
      data.creditCards.forEach((cc: { value: string }) => {
        addPathToTree(folderTree, ['8_Kreditkartenabrechnungen', maskCard(cc.value)]);
      });
    }

    // STEP # 10 - PAYPAL
    if (data.paypal === 'Yes') {
      addPathToTree(folderTree, ['9_PayPal']);
    }
    // STEP # 11 - CASH Register
    if (data.cashDesk === 'Yes') {
      addPathToTree(folderTree, ['10_Kassa']);
    }
    // STEP # 12 - Investory
    if (data.inventory === 'Yes') {
      addPathToTree(folderTree, ['11_Inventur']);
    }
  } else {
    // BELONGS TO STEP # 3
    // Create each dynamic category as a sibling folder
    // HOW TO HANDLE DYNAMIC CATEGORIES
    addPathToTree(ablageTree, ['2_Ablage']);
    if (data.filingCategories && data.filingCategories.length > 0) {
      data.filingCategories.filter((cat): cat is string => typeof cat === 'string').forEach((cat) => {
        addPathToTree(ablageTree, ['2_Ablage', cat]);
      });
    }
    // STEP # 4
    addPathToTree(folderTree, ['5_Bank']);
    if (data.ibans && data.ibans.length > 0) {
      data.ibans.forEach((iban: { value: string }) => {
        addPathToTree(folderTree, ['5_Bank', formatIBAN(iban.value), 'VERBUCHT']);
      });
    }

    // STEP # 5 OPTIONAL FOLDER
    if (data.agmSettlements === 'Yes') {
      addPathToTree(folderTree, ['7_HV-Abrechnungen']);
    }

    // STEP # 6 MANDATORY FOLDER
    addPathToTree(folderTree, ['4_Rechnungen']);
    // STEP # 6-1 OPTIONAL FOLDER
    if (data.recurringBills === 'Yes') {
      addPathToTree(folderTree, ['4_Rechnungen', 'Dauerrechnungen']);
    }

    // STEP # 7 - CREDIT CARDS
    if (data.creditCards && data.creditCards.length > 0) {
      data.creditCards.forEach((cc: { value: string }) => {
        addPathToTree(folderTree, ['8_Kreditkartenabrechnungen', maskCard(cc.value)]);
      });
    }

    // STEP # 8 - PAYPAL
    if (data.paypal === 'Yes') {
      addPathToTree(folderTree, ['9_PayPal']);
    }
    // STEP # 9 - CASH
    if (data.cashrecipiets === 'Yes') {
      addPathToTree(folderTree, ['12_Barbelege', 'VERBUCHT']);
    }
    // STEP # 10 - CASH Register
    if (data.cashDesk === 'Yes') {
      addPathToTree(folderTree, ['10_Kassa', 'VERBUCHT']);
    }
    // STEP # 11 - Investory
    if (data.inventory === 'Yes') {
      addPathToTree(folderTree, ['11_Inventur']);
    }
  }

  // LOOP THROUGH EACH ACCOUNT AND CREATE A FOLDER FOR EACH
  const accounts = data.accounts || [];
  if (accounts.length === 0) {
    throw new Error('No accounts provided for Nextcloud operations');
  }

  const operations = new NextCloudOperations();
  const groupName = `${data.clientId}_${data.companyName}`;

  await operations.createGroup(groupName);

  // CREATE FOLDER TREE
  await operations.processFolders(groupName, data.doubleEntry, folderTree, ablageTree);

  // Find or Create Group
  for (const account of accounts) {
    operations.setAccount(account);
    await operations.createNextcloudUser().catch((err) => {
      console.error('Error creating Nextcloud user:', err);
      return false;
    }).then((bool) => {
      return bool;
    });
    await operations.assignGroup(groupName);
  }
  return await saveQuestionnaire(data);
}

export async function validateEmail(email: string) {
  const operations = new NextCloudOperations();
  return await operations.searchUser(email).catch((err) => {
    console.error('Error searching for user:', err);
    return false;
  }).then((found) => {
    return found;
  });
}

export async function isAssignCompanyGroup(email: string, company: string) {
  const operations = new NextCloudOperations();
  return await operations
    .getUserGroups(email)
    .then((groups: string[]) => {
      if (!groups || groups.length === 0) {
        return false;
      }

      // case-insensitive match for safety
      return groups.some((g: string) => g.toLowerCase() === company.toLowerCase());
    })
    .catch((err) => {
      console.error('Error searching for user:', err);
      return false;
    });
}
