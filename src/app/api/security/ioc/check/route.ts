import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { checkIOC } from '@/services/security';

function extractToken(req: NextRequest): string | undefined {
  const cookieToken = req.cookies.get('token')?.value;
  if (cookieToken) return cookieToken;
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);
  return undefined;
}

export async function POST(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    await verifyToken(token);

    const { value, type } = await req.json();

    if (!value || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: value, type' },
        { status: 400 }
      );
    }

    if (!['ip', 'domain', 'url', 'hash'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be: ip, domain, url, or hash' },
        { status: 400 }
      );
    }

    const result = checkIOC({ value, type });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('IOC check error:', error);
    return NextResponse.json({ error: 'Failed to check IOC' }, { status: 500 });
  }
}
