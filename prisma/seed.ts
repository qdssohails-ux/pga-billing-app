import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
  { sku: 'PGA-001', barcode: '890100000001', name: 'Paracetamol 500mg', category: 'Medicine', batchNumber: 'PCM-26A01', unit: 'strips', costPrice: 35, sellingPrice: 50, stockQty: 42, reorderLevel: 10 },
  { sku: 'PGA-002', barcode: '890100000002', name: 'Vitamin C 500mg', category: 'Supplements', batchNumber: 'VTC-26B12', unit: 'boxes', costPrice: 170, sellingPrice: 220, stockQty: 7, reorderLevel: 10 },
  { sku: 'PGA-003', barcode: '890100000003', name: 'Hand Sanitizer 250ml', category: 'Personal Care', batchNumber: 'HS-26C08', unit: 'pcs', costPrice: 110, sellingPrice: 150, stockQty: 25, reorderLevel: 8 },
  { sku: 'PGA-004', barcode: '890100000004', name: 'Surgical Gloves', category: 'Medical Supplies', batchNumber: 'SG-25D44', unit: 'boxes', costPrice: 420, sellingPrice: 520, stockQty: 4, reorderLevel: 6 },
  { sku: 'PGA-005', barcode: '890100000005', name: 'Digital Thermometer', category: 'Medical Devices', batchNumber: 'DT-26E19', unit: 'pcs', costPrice: 650, sellingPrice: 850, stockQty: 13, reorderLevel: 4 },
  { sku: 'PGA-006', barcode: '890100000006', name: 'Alcohol Swabs', category: 'Medical Supplies', batchNumber: 'AS-26F07', unit: 'boxes', costPrice: 90, sellingPrice: 125, stockQty: 0, reorderLevel: 5 },
  { sku: 'PGA-007', barcode: '890100000007', name: 'Cotton Roll 100g', category: 'Medical Supplies', batchNumber: 'CR-26G10', unit: 'pcs', costPrice: 45, sellingPrice: 65, stockQty: 31, reorderLevel: 8 },
  { sku: 'PGA-008', barcode: '890100000008', name: 'Electrolyte Sachets', category: 'Wellness', batchNumber: 'ES-26H21', unit: 'boxes', costPrice: 250, sellingPrice: 320, stockQty: 9, reorderLevel: 10 }
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: product,
      create: product
    });
  }
  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
