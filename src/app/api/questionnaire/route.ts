import type { NextRequest } from 'next/server';
import type { QuestionnaireDataType } from './types';
import { NextResponse } from 'next/server';
import { processNextCloud, validateEmail } from '@/app/api/questionnaire/service';
import { logger } from '@/libs/Logger';
import { extendedSchema } from './types';

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) {
    return NextResponse.json({ message: 'Email is required' }, { status: 400 });
  }
  const found = await validateEmail(email);
  if (found) {
    return NextResponse.json({ message: 'Email found' }, { status: 400 });
  }
  return NextResponse.json({ message: `Email not found` }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    if (payload) {
      const data = await extendedSchema.parseAsync(payload) as QuestionnaireDataType;
      const result = await processNextCloud(data);
      return NextResponse.json(result);
    }
  } catch (e) {
    logger.error(e, `Error`);
  }
  return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
}
