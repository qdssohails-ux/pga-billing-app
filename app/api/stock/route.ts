import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma'; // or your db client

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'All';

  const products = await prisma.product.findMany({
    where: {
      AND: [
        // Skip category filter if 'All' is selected
        category !== 'All' ? { category: category } : {},
        // Filter by search string if provided
        search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { sku: { contains: search, mode: 'insensitive' } },
            { barcode: { contains: search, mode: 'insensitive' } },
          ],
        } : {},
      ],
    },
  });

  return NextResponse.json(products);
}