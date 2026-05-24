import type { FolderNode, QuestionnaireDataType } from './types';
// question.service.ts
import { Buffer } from 'node:buffer';
import { readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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

  public async uploadFile(remotePath: string, content: Buffer | string) {
    const baseUrl = `${process.env.NEXTCLOUD_BASE_URL}/remote.php/dav/files/${encodeURIComponent(process.env.NEXTCLOUD_USER ?? '')}/${encodeURIComponent(this.rootClientFolder)}/`;
    const url = `${baseUrl}${this.encodePath(remotePath)}`;

    const requestOptions: RequestInit = {
      method: 'PUT',
      headers: {
        Authorization: this.NEXTCLOUD_AUTH,
      },
      body: content,
      redirect: 'follow' as RequestRedirect,
    };

    const response = await this.timedFetch(
      `uploadFile(${remotePath})`,
      url,
      requestOptions,
    );

    if (response.ok || response.status === 201) {
      console.warn(`File uploaded successfully: ${remotePath}`);
      return true;
    }
    console.warn(`Unable to upload file: ${remotePath} (status: ${response.status})`);
    return false;
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

  public async processFolders(groupName: string, doubleEntry: boolean, folderTree: FolderNode[] = [], ablageTree: FolderNode[] = [], pendingUploads: PendingUpload[] = []) {
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

        const credentialsUpload = pendingUploads.find(
          upload => upload.type === 'credentials',
        );

        if (credentialsUpload?.localFilePath && credentialsUpload?.remotePath) {
          pendingUploads.push({
            type: 'inline',
            localFilePath: credentialsUpload.localFilePath,
            remotePath: credentialsUpload.remotePath.replace(
              `${parentFolder}/10_Kassa/`,
              `${monthFolder}/10_Kassa/`,
            ),
          });
        }

        const advisorUpload = pendingUploads.find(
          upload => upload.type === 'advisor',
        );

        if (advisorUpload?.localFilePath && advisorUpload?.remotePath) {
          pendingUploads.push({
            type: 'inline',
            localFilePath: advisorUpload.localFilePath,
            remotePath: advisorUpload.remotePath.replace(
              `${parentFolder}/5_Bank/`,
              `${monthFolder}/5_Bank/`,
            ),
          });
        }
        await this.createFolderTree(monthFolder, folderTree);
      }

      pendingUploads = pendingUploads.filter(
        item => !['credentials', 'advisor'].includes(item.type),
      );
    }
  }
}

type PendingUpload = {
  type: 'advisor' | 'credentials' | 'inline';
  remotePath: string;
  localFilePath: string;
};

function createTempFile(fileName: string, content: string): string {
  const localPath = join(tmpdir(), `${Date.now()}_${fileName}`);
  writeFileSync(localPath, content, 'utf-8');
  return localPath;
}

function cleanupTempFiles(uploads: PendingUpload[]) {
  for (const upload of uploads) {
    try {
      unlinkSync(upload.localFilePath);
    } catch {
      // ignore cleanup errors
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
  const pendingUploads: PendingUpload[] = [];

  const currentYear = new Date().getFullYear();
  const groupName = `${data.clientId}_${data.companyName}`;
  let basePath = groupName;
  if (data.doubleEntry) {
    basePath = `${groupName}/${currentYear}`;
  }
  basePath = `${basePath}/Buchhaltung ${currentYear}`;

  // BELONGS TO STEP # 2
  if (data.payrollAccounting === 'Yes') {
    // folderTree.push({ name: 'Payroll' });
    addPathToTree(folderTree, ['1_Lohnverrechnung']);
  }

  // IBANS
  addPathToTree(folderTree, ['5_Bank']);
  if (data.ibans && data.ibans.length > 0) {
    data.ibans.forEach((iban: { value: string }) => {
      if (data.doubleEntry) {
        addPathToTree(folderTree, ['5_Bank', formatIBAN(iban.value)]);
      } else {
        addPathToTree(folderTree, ['5_Bank', formatIBAN(iban.value), 'VERBUCHT']);
      }
    });
  }
  if (data.camtIbans && data.camtIbans.length > 0) {
    data.camtIbans.forEach((iban: { value: string; advisorName?: string; advisorContact?: string }) => {
      addPathToTree(folderTree, ['5_Bank', formatIBAN(iban.value)]);

      if (iban.advisorName || iban.advisorContact) {
        const content = `Advisor Name: ${iban.advisorName || 'N/A'}\nAdvisor Contact: ${iban.advisorContact || 'N/A'}`;
        const ibanClean = iban.value.replace(/\s/g, '');
        const localPath = createTempFile(`advisor_${ibanClean}.txt`, content);
        const remotePath = `${basePath}/5_Bank/${formatIBAN(iban.value)}/ADVISOR_DETAILS.txt`;
        pendingUploads.push({ type: 'advisor', remotePath, localFilePath: localPath });
      }
    });
  }
  if (data.hasPaymentProviders === 'Yes' && data.paymentProviders) {
    addPathToTree(folderTree, ['9_PaymentServices']);
    data.paymentProviders.forEach((provider: { name: string; checked: boolean }) => {
      if (provider.checked) {
        addPathToTree(folderTree, ['9_PaymentServices', provider.name]);
      }
    });
  }

  // CREDIT CARDS
  if (data.creditCards && data.creditCards.length > 0) {
    data.creditCards.forEach((cc: { value: string }) => {
      addPathToTree(folderTree, ['8_Kreditkartenabrechnungen', maskCard(cc.value)]);
    });
  }

  // INVESTORY FOLDER
  if (data.inventory === 'Yes') {
    addPathToTree(folderTree, ['11_Inventur']);
  }

  // OPTIONAL FOLDER
  if (data.agmSettlements === 'Yes') {
    addPathToTree(folderTree, ['7_HV-Abrechnungen']);
  }

  if (data.hasCashBalance === 'Yes') {
    if (data.doubleEntry) {
      addPathToTree(folderTree, ['12_Barbelege']);
    } else {
      addPathToTree(folderTree, ['12_Barbelege', 'VERBUCHT']);
    }
  }

  if (
    data.usesRegisterCash === 'Yes'
    || (data.usesRegisterCash === 'No' && data.usesHandCash === 'Yes')) {
    if (data.doubleEntry) {
      addPathToTree(folderTree, ['10_Kassa']);
    } else {
      addPathToTree(folderTree, ['10_Kassa', 'VERBUCHT']);
    }
  }

  if (data.usesRegisterCash === 'Yes' && data.cashDeskSystem) {
    let nameOfService = data.cashDeskSystem.selected[0];
    if (nameOfService === '__other__' && data.cashDeskSystem.other) {
      nameOfService = data.cashDeskSystem.other;
    }
    if (nameOfService) {
      // Under both directories
      addPathToTree(folderTree, ['10_Kassa', nameOfService]);
      addPathToTree(folderTree, ['3_Ausgangsrechnungen', nameOfService]);

      if (data.cashDeskSystem.grantAccess === 'Yes') {
        const cleanServiceName = nameOfService.replace(/\s/g, '');
        const remotePath = `${basePath}/10_Kassa/${nameOfService}/CREDENTIALS.txt`;
        const content = `Username: ${data.cashDeskSystem.username || 'N/A'}\nPassword: ${data.cashDeskSystem.password || 'N/A'}`;
        const localPath = createTempFile(`credentials_${cleanServiceName}.txt`, content);
        pendingUploads.push({ type: 'credentials', remotePath, localFilePath: localPath });
      }
    }
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
    if (data.onlineShopName !== undefined && data.onlineShopName.trim() !== '') {
      addPathToTree(folderTree, ['3_Ausgangsrechnungen', data.onlineShopName.trim()]);
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
  // ################ SINGLE ENTRY ################
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

    // STEP # 6 MANDATORY FOLDER
    addPathToTree(folderTree, ['4_Rechnungen']);
    // STEP # 6-1 OPTIONAL FOLDER
    if (data.recurringBills === 'Yes') {
      addPathToTree(folderTree, ['4_Rechnungen', 'Dauerrechnungen']);
    }
  }

  // LOOP THROUGH EACH ACCOUNT AND CREATE A FOLDER FOR EACH
  const accounts = data.accounts || [];
  if (accounts.length === 0) {
    throw new Error('No accounts provided for Nextcloud operations');
  }

  const operations = new NextCloudOperations();

  await operations.createGroup(groupName);

  // CREATE FOLDER TREE
  await operations.processFolders(groupName, data.doubleEntry, folderTree, ablageTree, pendingUploads);

  // UPLOAD PENDING FILES
  try {
    for (const upload of pendingUploads) {
      const content = readFileSync(upload.localFilePath, 'utf-8');
      await operations.uploadFile(upload.remotePath, content);
    }
  } finally {
    cleanupTempFiles(pendingUploads);
  }

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
