import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const started = Date.now();
  try {
    // DB connectivity check
    const dbStarted = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStarted;

    // Basic stats (non-fatal if they fail)
    let totalBlocks = 0;
    let totalContacts = 0;
    try {
      [totalBlocks, totalContacts] = await Promise.all([
        prisma.block.count(),
        prisma.contactMessage.count(),
      ]);
    } catch {}

    const body = {
      status: 'healthy' as const,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
      uptime: Math.floor(process.uptime()),
      database: { status: 'connected' as const, latency: dbLatency },
      stats: { totalBlocks, totalContacts },
    };

    return NextResponse.json(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Response-Time': `${Date.now() - started}ms`,
      },
    });
  } catch (error: any) {
    const body = {
      status: 'unhealthy' as const,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
      uptime: Math.floor(process.uptime()),
      database: { status: 'error' as const },
      error: error?.message || 'Unknown error',
    };
    return NextResponse.json(body, {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Response-Time': `${Date.now() - started}ms`,
      },
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
