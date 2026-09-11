import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { makeInvoiceNumber } from '@/app/lib/invoice';
import { checkoutSchema } from '@/app/lib/validators';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const limit = Math.min(Number(request.nextUrl.searchParams.get('limit') ?? 20), 100);
  const invoices = await prisma.invoice.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });

  return NextResponse.json(invoices.map((invoice) => ({
    ...invoice,
    subtotal: Number(invoice.subtotal),
    discount: Number(invoice.discount),
    total: Number(invoice.total),
    items: invoice.items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.lineTotal),
    })),
  })));
}

export async function POST(request: NextRequest) {
  try {
    const body = checkoutSchema.parse(await request.json());

    const result = await prisma.$transaction(async (tx) => {
      const ids = body.items.map((item) => item.productId);
      const products = await tx.product.findMany({ where: { id: { in: ids }, active: true } });
      const byId = new Map(products.map((p) => [p.id, p]));

      let subtotal = 0;
      const items = body.items.map((line) => {
        const product = byId.get(line.productId);
        if (!product) throw new Error('One or more products are unavailable.');
        if (line.qty > product.stockQty) {
          throw new Error(`${product.name} has only ${product.stockQty} ${product.unit} available.`);
        }
        const unitPrice = Number(product.sellingPrice);
        const lineTotal = unitPrice * line.qty;
        subtotal += lineTotal;
        return { product, qty: line.qty, unitPrice, lineTotal };
      });

      const discount = Math.min(body.discount, subtotal);
      const total = Math.max(0, subtotal - discount);
      const invoiceNumber = makeInvoiceNumber();

      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          subtotal,
          discount,
          total,
          paymentMethod: body.paymentMethod,
          items: {
            create: items.map(({ product, qty, unitPrice, lineTotal }) => ({
              productId: product.id,
              sku: product.sku,
              name: product.name,
              unit: product.unit,
              qty,
              unitPrice,
              lineTotal,
              batchNumber: product.batchNumber,
            })),
          },
        },
        include: { items: true },
      });

      for (const { product, qty } of items) {
        await tx.product.update({
          where: { id: product.id },
          data: { stockQty: { decrement: qty } },
        });
      }

      return invoice;
    });

    return NextResponse.json({
      ...result,
      subtotal: Number(result.subtotal),
      discount: Number(result.discount),
      total: Number(result.total),
      items: result.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.lineTotal),
      })),
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Checkout failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
