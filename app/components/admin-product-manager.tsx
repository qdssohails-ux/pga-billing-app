'use client';
import { useState } from 'react';

interface ProductManagerProps {
  userRole: 'ADMIN' | 'EMPLOYEE';
  onProductUpdated: () => void;
}

export default function AdminProductManager({ userRole, onProductUpdated }: ProductManagerProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [sku, setSku] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stockQty, setStockQty] = useState('');

  // Restrict UI elements if user is an Employee
  if (userRole !== 'ADMIN') {
    return null; // Employees cannot view Admin Controls
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category, sku, sellingPrice, costPrice, stockQty }),
    });

    if (res.ok) {
      setName('');
      setCategory('');
      setSku('');
      setSellingPrice('');
      setCostPrice('');
      setStockQty('');
      onProductUpdated();
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 mb-6">
      <h3 className="text-lg font-bold mb-3">Admin Controls: Add New Product</h3>
      <form onSubmit={handleAddProduct} className="grid grid-cols-2 gap-3">
        <input className="p-2 border rounded" placeholder="Product Name" value={name} onChange={e => setName(e.target.value)} required />
        <input className="p-2 border rounded" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} required />
        <input className="p-2 border rounded" placeholder="SKU" value={sku} onChange={e => setSku(e.target.value)} required />
        <input className="p-2 border rounded" type="number" step="0.01" placeholder="Selling Price" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} required />
        <input className="p-2 border rounded" type="number" step="0.01" placeholder="Cost Price" value={costPrice} onChange={e => setCostPrice(e.target.value)} required />
        <input className="p-2 border rounded" type="number" placeholder="Stock Qty" value={stockQty} onChange={e => setStockQty(e.target.value)} required />
        <button type="submit" className="col-span-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Add Product</button>
      </form>
    </div>
  );
}