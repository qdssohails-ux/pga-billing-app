import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { stockUpdateSchema } from '@/app/lib/validators';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  const category = request.nextUrl.searchParams.get('category')?.trim() ?? '';

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(category ? { category } : {}),
      ...(q ? {
        OR: [
          { sku: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } },
          { barcode: { contains: q, mode: 'insensitive' } },
        ]
      } : {}),
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(products.map((p) => ({
    ...p,
    costPrice: Number(p.costPrice),
    sellingPrice: Number(p.sellingPrice),
  })));
}

export async function PATCH(request: NextRequest) {
  try {
    const body = stockUpdateSchema.parse(await request.json());
    const product = await prisma.product.update({
      where: { id: body.productId },
      data: { stockQty: body.stockQty },
    });
    return NextResponse.json({
      ...product,
      costPrice: Number(product.costPrice),
      sellingPrice: Number(product.sellingPrice),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to update stock.' }, { status: 400 });
  }
}
