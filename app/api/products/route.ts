import { NextResponse } from 'next/server';

// Temporary mock data or replace with your database queries (e.g. Prisma)
const mockProducts = [
  {
    id: '1',
    sku: 'SMK-001',
    name: 'Classic Cigarettes',
    category: 'Smoking Products',
    unit: 'Pack',
    sellingPrice: 15.0,
    stockQty: 50,
    reorderLevel: 10,
    batchNumber: 'B101',
    barcode: '123456789',
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const category = searchParams.get('category') || 'All';

    let filtered = mockProducts;

    if (category !== 'All') {
      filtered = filtered.filter((p) => p.category === category);
    }

    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.sku.toLowerCase().includes(search) ||
          p.barcode?.toLowerCase().includes(search)
      );
    }

    return NextResponse.json(filtered, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}