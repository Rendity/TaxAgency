import type { NextRequest } from 'next/server';
import type { QuestionnaireDataType } from './types';
import { NextResponse } from 'next/server';
import { isAssignCompanyGroup, processNextCloud, validateEmail } from '@/app/api/questionnaire/service';
import { logger } from '@/libs/Logger';
import { createExtendedSchema } from './types';

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) {
    return NextResponse.json({ message: 'Email is required' }, { status: 400 });
  }
  const company = req.nextUrl.searchParams.get('company');
  if (!company) {
    return NextResponse.json({ message: 'Company is required' }, { status: 400 });
  }
  const found = await validateEmail(email);
  if (found) {
    const exists = await isAssignCompanyGroup(email, company);
    if (exists) {
      return NextResponse.json({ message: 'Email found' }, { status: 400 });
    }
  }
  return NextResponse.json({ message: `Email not found` }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    if (payload) {
      const data = await createExtendedSchema(`${payload.clientId}_${payload.companyName}`).parseAsync(payload) as QuestionnaireDataType;
      const result = await processNextCloud(data);
      return NextResponse.json(result);
    }
  } catch (e) {
    logger.error(e, `Error`);
  }
  return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
}
