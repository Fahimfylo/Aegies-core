import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken } from '@/lib/jwt';
import { getLiveThreatFeed } from '@/services/security/threat-intel.service';

export async function POST(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    await verifyToken(token);

    const { severity, category, limit } = await req.json();

    let feed = getLiveThreatFeed(limit || 50);

    if (severity) {
      feed = feed.filter(e => e.severity === severity);
    }
    if (category) {
      feed = feed.filter(e => e.category === category);
    }

    return NextResponse.json({ feed }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch filtered feed' }, { status: 500 });
  }
}
