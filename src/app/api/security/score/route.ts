import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/lib/jwt';
import { calculateSecurityScore } from '@/services/security/score.service';

export async function GET(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const payload = await verifyToken(token);

    const result = await calculateSecurityScore(payload.userId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Security score error:', error);
    return NextResponse.json({ error: 'Failed to calculate security score' }, { status: 500 });
  }
}
