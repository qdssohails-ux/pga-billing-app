import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const products = await prisma.product.findMany({
    where: { active: true },
    select: { id: true, stockQty: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  });
  return NextResponse.json(products);
}
