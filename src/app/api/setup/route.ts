import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { addSetupHash, getSetupHash } from '@/app/api/setup/service';
import { logger } from '@/libs/Logger';
import { SetupFormSchema } from '@/app/api/setup/model';

export async function GET(req: NextRequest) {
  const hash = req.nextUrl.searchParams.get('hash') || '';
  if (!hash) {
    return NextResponse.json({ message: 'Hash is required' }, { status: 400 });
  }
  const hashObject = await getSetupHash(hash);
  if (hashObject) {
    return NextResponse.json(hashObject.payload, { status: 200 });
  }
  return NextResponse.json({ message: `hash not found` }, { status: 400 });
}

export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ message: 'Ungültiges JSON im Request.' }, { status: 400 });
  }

  const parsed = SetupFormSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({
      message: 'Bitte überprüfen Sie die eingegebenen Klientendaten.',
      errors: parsed.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  try {
    const result = await addSetupHash(parsed.data);
    if (!result) {
      throw new Error('Setup link was not saved');
    }
    return NextResponse.json(result);
  } catch (error) {
    logger.error(error, 'Failed to create setup link');
    return NextResponse.json({
      message: 'Der Link konnte wegen eines Serverfehlers nicht erstellt werden. Bitte versuchen Sie es später erneut.',
    }, { status: 500 });
  }
}
