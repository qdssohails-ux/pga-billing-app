import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma'; // Adjust import path if your Prisma client is located elsewhere

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Accept either 'q' or 'search' parameter
    const query = (searchParams.get('q') || searchParams.get('search') || '').trim();
    const category = (searchParams.get('category') || '').trim();

    // Build Prisma query dynamically
    const whereClause: any = {};

    // Filter by Category (ignore if 'All' or empty)
    if (category && category !== 'All') {
      whereClause.category = {
        equals: category,
        mode: 'insensitive',
      };
    }

    // Filter by Search Query across Name, SKU, and Barcode
    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } },
        { barcode: { contains: query, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Database query error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products from database', details: error.message },
      { status: 500 }
    );
  }
}