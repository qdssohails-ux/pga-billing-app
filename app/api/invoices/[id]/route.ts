import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const invoice = await prisma.invoice.findUnique({ where: { id }, include: { items: true } });
  if (!invoice) return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 });
  return NextResponse.json({
    ...invoice,
    subtotal: Number(invoice.subtotal),
    discount: Number(invoice.discount),
    total: Number(invoice.total),
    items: invoice.items.map((item) => ({ ...item, unitPrice: Number(item.unitPrice), lineTotal: Number(item.lineTotal) })),
  });
}
