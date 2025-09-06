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
  try {
    const payload = await req.json();
    if (payload) {
      const data = SetupFormSchema.parse(payload);

      const result = await addSetupHash(data);
      return NextResponse.json(result);
    }
  } catch (e) {
    logger.error(e, `Error`);
  }
  return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
}
