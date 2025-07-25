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
  private clientBasicAuth: string;
  private rootClientFolder: string = 'Klienten';
  constructor() {
    this.account = {};
    this.password = '';
    this.clientBasicAuth = '';
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
    try {
      const res = await fetch(`${process.env.NEXTCLOUD_BASE_URL}/ocs/v1.php/cloud/users`, {
        method: 'POST',
        headers: {
          'Authorization': this.NEXTCLOUD_AUTH,
          'OCS-APIRequest': 'true',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: payload,
      });
      const text = await res.text();
      if (!res.ok && res.status !== 200) {
        throw new Error(`Failed to create user: ${text}`);
      }
      // Parse the XML to JSON
      const json = await parseStringPromise(text);
      const users = json?.ocs?.data?.[0]?.id || [];
      if (Array.isArray(users)) {
        const found = users.filter((email: string) => {
          return email.toLowerCase() === this.account.email.toLowerCase();
        });
        if (found.length > 0) {
          this.clientBasicAuth = `Basic ${Buffer.from(`${this.account.email}:${this.password}`).toString('base64')}`;
          await this.createFolder('');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Nextcloud POST failed:', error);
      return false;
    }
  };

  public async searchUser(email: string) {
    const data = new URLSearchParams({
      search: email,
    });
    const res = await fetch(`${process.env.NEXTCLOUD_BASE_URL}/ocs/v1.php/cloud/users?${data}`, {
      method: 'GET',
      headers: {
        'Authorization': this.NEXTCLOUD_AUTH,
        'OCS-APIRequest': 'true',
      },
    });
    const text = await res.text();

    if (!res.ok && res.status !== 200) {
      throw new Error(`Failed to search user: ${text}`);
    }

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
    const baseUrl = `${process.env.NEXTCLOUD_BASE_URL}/remote.php/dav/files/${encodeURIComponent(this.account.email)}/${encodeURIComponent(this.rootClientFolder)}/`;
    let preappend = '';
    if (fullPath !== '') {
      preappend = `${this.encodePath(fullPath)}/`;
    }
    const url = `${baseUrl}${preappend}`;
    console.warn(`Creating folder "${url}"`);
    const myHeaders = new Headers();
    myHeaders.append('Authorization', this.clientBasicAuth);
    const requestOptions: RequestInit = {
      method: 'MKCOL',
      headers: myHeaders,
      redirect: 'follow' as RequestRedirect,
    };
    try {
      const res = await fetch(url, requestOptions);
      if (res.status !== 201 && res.status !== 405) {
        console.warn(`Failed to create folder "${url}"`);
        return false;
      }
      return true;
    } catch (e) {
      console.warn(e);
    }
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
    if (data.filingCategories.length > 0) {
      data.filingCategories.forEach((cat: string) => {
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
    if (data.ibans.length > 0) {
      data.ibans.forEach((iban: { value: string }) => {
        addPathToTree(folderTree, ['5_Bank', formatIBAN(iban.value)]);
      });
    }

    // STEP # 9 - CREDIT CARDS
    if (data.creditCards.length > 0) {
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
    if (data.filingCategories.length > 0) {
      data.filingCategories.forEach((cat: string) => {
        addPathToTree(ablageTree, ['2_Ablage', cat]);
      });
    }
    // STEP # 4
    addPathToTree(folderTree, ['5_Bank']);
    if (data.ibans.length > 0) {
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
    if (data.creditCards.length > 0) {
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
  for (const account of accounts) {
    operations.setAccount(account);
    const response = await operations.createNextcloudUser().catch((err) => {
      console.error('Error creating Nextcloud user:', err);
      return false;
    }).then((bool) => {
      return bool;
    });
    if (response) {
      const currentYear = new Date().getFullYear();
      let parentFolder = `${data.clientId}_${data.companyName}`;
      await operations.createFolder(parentFolder);

      if (data.doubleEntry) {
        parentFolder = `${parentFolder}/${currentYear}`;
        await operations.createFolder(parentFolder);
      }
      parentFolder = `${parentFolder}/Buchhaltung ${currentYear}`;
      await operations.createFolder(parentFolder);

      if (data.doubleEntry) {
        await operations.createFolderTree(parentFolder, folderTree);
      } else {
        // Ablage Record Entry
        await operations.createFolderTree(parentFolder, ablageTree);

        for (let i = 0; i < 12; i++) {
          const date = new Date(currentYear, i); // Year doesn't matter
          const monthName = date.toLocaleString('en-US', { month: 'long' });
          const monthFolder = `${parentFolder}/${monthName}`;
          await operations.createFolder(monthFolder);

          await operations.createFolderTree(monthFolder, folderTree);
        }
      }
    }
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
