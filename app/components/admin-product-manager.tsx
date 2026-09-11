'use client';

import { useState } from 'react';
import { Plus, PackagePlus } from 'lucide-react';

interface AdminProductManagerProps {
  userRole: 'ADMIN' | 'EMPLOYEE';
  onProductUpdated: () => void;
}

export default function AdminProductManager({ userRole, onProductUpdated }: AdminProductManagerProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    sku: '',
    name: '',
    category: 'Smoking Products',
    unit: 'Pcs',
    sellingPrice: '',
    stockQty: '',
    barcode: '',
  });

  if (userRole !== 'ADMIN') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          sellingPrice: Number(form.sellingPrice),
          stockQty: Number(form.stockQty),
        }),
      });

      if (!res.ok) throw new Error('Failed to create product');

      setForm({ sku: '', name: '', category: 'Smoking Products', unit: 'Pcs', sellingPrice: '', stockQty: '', barcode: '' });
      setOpen(false);
      onProductUpdated();
    } catch {
      alert('Error creating product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PackagePlus className="text-brand-700" size={20} />
          <h2 className="text-base font-black text-slate-900">Admin Product Controls</h2>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-extrabold text-white hover:bg-slate-800"
        >
          <Plus size={14} /> {open ? 'Close' : 'Add New Product'}
        </button>
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input
            required
            placeholder="SKU (e.g. PROD-001)"
            value={form.sku}
            onChange={e => setForm({ ...form, sku: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-brand-200"
          />
          <input
            required
            placeholder="Product Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-brand-200"
          />
          <select
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-brand-200"
          >
            <option>Smoking Products</option>
            <option>Cold Drinks</option>
            <option>Snacks</option>
            <option>Hot Beverages</option>
            <option>Convenience Items</option>
          </select>
          <input
            required
            type="number"
            placeholder="Selling Price"
            value={form.sellingPrice}
            onChange={e => setForm({ ...form, sellingPrice: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-brand-200"
          />
          <input
            required
            type="number"
            placeholder="Stock Quantity"
            value={form.stockQty}
            onChange={e => setForm({ ...form, stockQty: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-brand-200"
          />
          <input
            placeholder="Barcode (Optional)"
            value={form.barcode}
            onChange={e => setForm({ ...form, barcode: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-brand-200"
          />
          <button
            type="submit"
            disabled={loading}
            className="col-span-full rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-brand-600 disabled:bg-slate-300"
          >
            {loading ? 'Adding Product…' : 'Save Product'}
          </button>
        </form>
      )}
    </div>
  );
}