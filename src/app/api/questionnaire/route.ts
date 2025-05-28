// import { db } from '@/libs/DB';
// import { logger } from '@/libs/Logger';
// import { QuestionnaireSchema } from '@/models/Schema';
// import { CounterValidation } from '@/validations/CounterValidation';
// import { sql } from 'drizzle-orm';
// import { headers } from 'next/headers';
// import { NextResponse } from 'next/server';
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { formSchema } from '@/components/Questionnaire/formSchema';

// export const PUT = async (request: Request) => {
//   const json = await request.json();
//   const parse = CounterValidation.safeParse(json);

//   if (!parse.success) {
//     return NextResponse.json(parse.error.format(), { status: 422 });
//   }

//   // `x-e2e-random-id` is used for end-to-end testing to make isolated requests
//   // The default value is 0 when there is no `x-e2e-random-id` header
//   const id = Number((await headers()).get('x-e2e-random-id')) ?? 0;

//   const count = await db
//     .insert(QuestionnaireSchema)
//     .values({ id, count: parse.data.increment })
//     .onConflictDoUpdate({
//       target: QuestionnaireSchema.id,
//       set: { count: sql`${QuestionnaireSchema.count} + ${parse.data.increment}` },
//     })
//     .returning();

//   logger.info('Counter has been incremented');

//   return NextResponse.json({
//     count: count[0]?.count,
//   });
// };

import type { NextRequest } from 'next/server';
import type { z } from 'zod';
import { Buffer } from 'node:buffer';
import { formSchema } from '@/components/Questionnaire/formSchema';
import { NextResponse } from 'next/server';

// Extend schema to include extra fields
// Extract the base object schema, extend it, then reapply effects if needed
const extendedSchema = (formSchema as z.ZodEffects<z.ZodObject<any>>)._def.schema as z.ZodObject<any>;

const NEXTCLOUD_BASE_URL = 'http://localhost';

const NEXTCLOUD_AUTH = `Basic ${Buffer.from(`${process.env.NEXTCLOUD_USER}:${process.env.NEXTCLOUD_PASS}`).toString('base64')}`;

// Helper: Create Nextcloud user
const createNextcloudUser = async (username: string, email: string) => {
  const res = await fetch(`${NEXTCLOUD_BASE_URL}/ocs/v1.php/cloud/users`, {
    method: 'POST',
    headers: {
      'Authorization': NEXTCLOUD_AUTH,
      'OCS-APIRequest': 'true',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      userid: username,
      password: 'Temp123!',
      email,
    }),
  });

  if (!res.ok && res.status !== 409) {
    throw new Error(`Failed to create user: ${await res.text()}`);
  }
};

// Helper: Create folder at path
const createFolder = async (username: string, fullPath: string) => {
  const url = `${NEXTCLOUD_BASE_URL}/remote.php/dav/files/${encodeURIComponent(username)}/${encodeURIComponent(fullPath)}/`;

  const res = await fetch(url, {
    method: 'MKCOL',
    headers: { Authorization: NEXTCLOUD_AUTH },
  });

  if (!res.ok && res.status !== 405) {
    throw new Error(`Failed to create folder "${fullPath}"`);
  }
};

// Masking helpers
const maskIBAN = (iban: string) => `IBAN_${iban.slice(0, 2)}************${iban.slice(-4)}`;
const maskCard = (card: string) => `Card_**** **** **** ${card.slice(-4)}`;

// Recursive folder creation
const createFolderTree = async (username: string, basePath: string, tree: FolderNode[]) => {
  for (const node of tree) {
    const fullPath = `${basePath}/${node.name}`;
    await createFolder(username, fullPath);
    if (node.children) {
      await createFolderTree(username, fullPath, node.children);
    }
  }
};

// Folder node type
type FolderNode = {
  name: string;
  children?: FolderNode[];
};

export async function GET(_req: NextRequest) {
  return NextResponse.json({ message: 'Working' }, { status: 200 });
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.data) {
      const data = extendedSchema.parse(body) as z.infer<typeof extendedSchema>;
      const username = data.email;
      const parentFolder = `${data.clientId}-${data.companyName.replace(/\s+/g, '_')}`;

      // Step 1: Create user if it doesn't exist
      await createNextcloudUser(username, data.email);

      // Step 2: Build the folder tree
      const folderTree: FolderNode[] = [];

      if (data.payrollAccounting === 'Yes') {
        folderTree.push({ name: 'Payroll' });
      }

      if (data.outgoingInvoices === 'Yes') {
        folderTree.push({ name: 'Invoices/Outgoing' });
      }

      if (data.incomingInvoices === 'Yes') {
        folderTree.push({ name: 'Invoices/Incoming' });
      }

      if (data.recurringBills === 'Yes') {
        folderTree.push({ name: 'Bills/Recurring' });
      }

      // Banking section
      const bankingChildren: FolderNode[] = [];

      if (data.ibans.length > 0) {
        const ibanNodes = data.ibans.map((iban: string) => ({
          name: maskIBAN(iban),
        }));
        bankingChildren.push({ name: 'IBANs', children: ibanNodes });
      }

      if (data.creditCards.length > 0) {
        const cardNodes = data.creditCards.map((card: string) => ({
          name: maskCard(card),
        }));
        bankingChildren.push({ name: 'Credit Cards', children: cardNodes });
      }

      if (bankingChildren.length > 0) {
        folderTree.push({ name: 'Banking', children: bankingChildren });
      }

      if (data.paypal === 'Yes') {
        folderTree.push({ name: 'Online Payments/PayPal' });
      }

      if (data.cashDesk === 'Yes') {
        folderTree.push({ name: 'Cash Desk' });
      }

      if (data.inventory === 'Yes') {
        folderTree.push({ name: 'Inventory' });
      }

      // if (data.additionalCategory) {
      //   folderTree.push({ name: `Additional/${data.additionalCategory}` });
      // }

      // Create each dynamic category as a sibling folder
      if (data.filingCategories.length > 0) {
        folderTree.push(
          ...data.filingCategories.map((cat: any) => ({
            name: cat,
          })),
        );
      }

      // Step 3: Create the parent folder
      await createFolder(username, parentFolder);

      // Step 4: Recursively create subfolders
      await createFolderTree(username, parentFolder, folderTree);
    }

    return NextResponse.json({ success: true, created: new Date().toISOString() });
  } catch (err: any) {
    console.error('Submit error:', err);
    return NextResponse.json({ message: 'Submission failed' }, { status: 400 });
  }
}
