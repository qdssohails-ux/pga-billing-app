'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Barcode,
  Boxes,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Banknote,
  Menu,
  Minus,
  PackageSearch,
  Plus,
  Printer,
  RefreshCw,
  Search,
  ShoppingBag,
  Trash2,
  X,
  WalletCards,
} from 'lucide-react';
import { money } from '@/app/lib/money';
import type { Product } from '@/app/hooks/use-products';
import { useProducts } from '@/app/hooks/use-products';

type CartLine = {
  product: Product;
  qty: number;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'CASH' | 'CARD' | 'UPI';
  createdAt: string;
  items: Array<{
    sku: string;
    name: string;
    unit: string;
    qty: number;
    unitPrice: number;
    lineTotal: number;
    batchNumber: string | null;
  }>;
};

const categories = [
  'All',
  'Smoking Products',
  'Cold Drinks',
  'Snacks',
  'Hot Beverages',
  'Convenience Items',
];

function StockBadge({ product }: { product: Product }) {
  if (product.stockQty === 0) {
    return <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700">OUT OF STOCK</span>;
  }
  if (product.stockQty <= product.reorderLevel) {
    return <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">LOW • {product.stockQty}</span>;
  }
  return <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">IN STOCK • {product.stockQty}</span>;
}

function ProductCard({ product, onAdd, onAdjust }: { product: Product; onAdd: () => void; onAdjust: () => void }) {
  const disabled = product.stockQty === 0;
  return (
    <div className="group flex min-h-[188px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-card">
      <div>
        <div className="mb-2 flex items-start justify-between gap-3">
          <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold tracking-[.1em] text-slate-500">{product.sku}</span>
          <StockBadge product={product} />
        </div>
        <h3 className="line-clamp-2 text-[15px] font-extrabold leading-5 text-slate-900">{product.name}</h3>
        <div className="mt-2 space-y-1 text-xs text-slate-500">
          <p>{product.category} • {product.unit}</p>
          {product.batchNumber && <p>Batch: <span className="font-semibold text-slate-700">{product.batchNumber}</span></p>}
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Selling price</p>
          <p className="text-lg font-black text-slate-900">{money(product.sellingPrice)}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={onAdjust} className="rounded-xl border border-slate-200 px-2.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50" title="Adjust stock">
            Stock
          </button>
          <button
            disabled={disabled}
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-700 px-3 py-2 text-xs font-extrabold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            <Plus size={15} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

function CartPanel({
  cart,
  subtotal,
  discount,
  setDiscount,
  payment,
  setPayment,
  onChangeQty,
  onRemove,
  onCheckout,
  checkingOut,
}: {
  cart: CartLine[];
  subtotal: number;
  discount: number;
  setDiscount: (value: number) => void;
  payment: 'CASH' | 'CARD' | 'UPI';
  setPayment: (value: 'CASH' | 'CARD' | 'UPI') => void;
  onChangeQty: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
  checkingOut: boolean;
}) {
  const total = Math.max(0, subtotal - discount);
  return (
    <aside className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-card">
      <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.15em] text-brand-600">Active Cart</p>
            <h2 className="mt-1 text-xl font-black text-slate-900">Current Invoice</h2>
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-extrabold text-brand-700">{cart.length} items</span>
        </div>
      </div>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-5">
        {cart.length === 0 ? (
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><ShoppingBag /></div>
            <p className="mt-4 font-extrabold text-slate-800">Cart is empty</p>
            <p className="mt-1 max-w-[230px] text-sm text-slate-500">Search the catalog and tap Add to start a new invoice.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {cart.map(({ product, qty }) => (
              <div key={product.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-900">{product.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{product.sku} • {money(product.sellingPrice)} / {product.unit}</p>
                  </div>
                  <button onClick={() => onRemove(product.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-rose-600" title="Remove">
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center rounded-xl border border-slate-200 bg-white">
                    <button onClick={() => onChangeQty(product.id, -1)} className="p-2 text-slate-600 hover:bg-slate-50"><Minus size={14} /></button>
                    <span className="w-9 text-center text-sm font-black">{qty}</span>
                    <button disabled={qty >= product.stockQty} onClick={() => onChangeQty(product.id, 1)} className="p-2 text-slate-600 hover:bg-slate-50 disabled:text-slate-300"><Plus size={14} /></button>
                  </div>
                  <p className="font-black text-slate-900">{money(product.sellingPrice * qty)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 p-4 sm:p-5">
        <div className="grid grid-cols-3 gap-2">
          {(['CASH', 'CARD', 'UPI'] as const).map((method) => (
            <button
              key={method}
              onClick={() => setPayment(method)}
              className={`rounded-xl border px-2 py-2.5 text-xs font-extrabold transition ${payment === method ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              {method === 'CASH' ? 'Cash' : method === 'CARD' ? 'Card' : 'UPI / Wallet'}
            </button>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-bold text-slate-500">Discount</span>
            <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3">
              <span className="text-xs font-bold text-slate-400">Rs.</span>
              <input
                type="number"
                min={0}
                max={subtotal}
                value={discount || ''}
                onChange={(e) => setDiscount(Math.max(0, Math.min(subtotal, Number(e.target.value || 0))))}
                className="w-full bg-transparent px-2 py-2.5 text-right text-sm font-black outline-none"
                placeholder="0"
              />
            </div>
          </label>
          <div>
            <span className="text-xs font-bold text-slate-500">Grand total</span>
            <div className="mt-1 rounded-xl bg-slate-900 px-3 py-2.5 text-right text-base font-black text-white">{money(total)}</div>
          </div>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between text-slate-500"><span>Subtotal</span><span className="font-semibold">{money(subtotal)}</span></div>
          <div className="flex justify-between text-slate-500"><span>Discount</span><span className="font-semibold">-{money(discount)}</span></div>
        </div>
        <button
          onClick={onCheckout}
          disabled={!cart.length || checkingOut}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand-900/10 hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          {checkingOut ? <RefreshCw size={17} className="animate-spin" /> : <CheckCircle2 size={17} />}
          {checkingOut ? 'Processing…' : 'Complete Checkout'}
        </button>
      </div>
    </aside>
  );
}

function ReceiptModal({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const [paper, setPaper] = useState<'58' | '80'>('80');
  const total = invoice.total;
  const print = () => {
    document.body.classList.remove('print-58', 'print-80');
    document.body.classList.add(`print-${paper}`);
    window.print();
    window.setTimeout(() => document.body.classList.remove('print-58', 'print-80'), 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6">
          <div><p className="text-xs font-extrabold uppercase tracking-[.15em] text-emerald-600">Checkout complete</p><h3 className="mt-1 text-lg font-black text-slate-900">Receipt #{invoice.invoiceNumber}</h3></div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X /></button>
        </div>
        <div className="scrollbar-thin flex-1 overflow-y-auto bg-slate-100 p-5">
          <div id="receipt-print" className={`mx-auto bg-white p-4 text-slate-900 shadow-sm receipt-${paper}`} style={{ width: paper === '58' ? '58mm' : '80mm' }}>
            <div className="text-center">
              <p className="text-base font-black tracking-wide">PGA BILLING</p>
              <p className="text-[10px] text-slate-500">Inventory & Stock Inquiry System</p>
              <div className="my-2 border-t border-dashed border-slate-400" />
              <p className="text-[10px]">Invoice: {invoice.invoiceNumber}</p>
              <p className="text-[10px]">{new Date(invoice.createdAt).toLocaleString()}</p>
            </div>
            <div className="my-2 border-t border-dashed border-slate-400" />
            <div className="space-y-2 text-[10px]">
              {invoice.items.map((item, index) => (
                <div key={`${item.sku}-${index}`}>
                  <div className="flex justify-between gap-2 font-semibold"><span className="max-w-[65%]">{item.name}</span><span>{money(item.lineTotal)}</span></div>
                  <div className="flex justify-between text-slate-500"><span>{item.qty} × {money(item.unitPrice)} / {item.unit}</span><span>{item.sku}</span></div>
                </div>
              ))}
            </div>
            <div className="my-2 border-t border-dashed border-slate-400" />
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between"><span>Subtotal</span><span>{money(invoice.subtotal)}</span></div>
              <div className="flex justify-between"><span>Discount</span><span>-{money(invoice.discount)}</span></div>
              <div className="flex justify-between text-sm font-black"><span>TOTAL</span><span>{money(total)}</span></div>
            </div>
            <div className="my-2 border-t border-dashed border-slate-400" />
            <div className="text-center text-[10px] text-slate-500">Payment: {invoice.paymentMethod === 'UPI' ? 'UPI / Mobile Wallet' : invoice.paymentMethod}</div>
            <p className="mt-3 text-center text-[10px] font-bold">Thank you for your business.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <button onClick={() => setPaper('58')} className={`rounded-lg border px-3 py-2 text-xs font-bold ${paper === '58' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600'}`}>2-inch / 58mm</button>
            <button onClick={() => setPaper('80')} className={`rounded-lg border px-3 py-2 text-xs font-bold ${paper === '80' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600'}`}>3-inch / 80mm</button>
          </div>
          <button onClick={print} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-slate-800"><Printer size={16} /> Print receipt</button>
        </div>
      </div>
    </div>
  );
}

function BarcodeModal({ onClose, onDetected }: { onClose: () => void; onDetected: (value: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [manual, setManual] = useState('');
  const [status, setStatus] = useState('Starting camera…');

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    const start = async () => {
      try {
        if (!('BarcodeDetector' in window)) {
          setStatus('Camera barcode detection is not supported here. Use the manual field below.');
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        const Detector = (window as unknown as { BarcodeDetector: new (options?: { formats?: string[] }) => { detect(video: HTMLVideoElement): Promise<Array<{ rawValue: string }>> } }).BarcodeDetector;
        const detector = new Detector({ formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e'] });
        const tick = async () => {
          if (cancelled || !videoRef.current) return;
          try {
            const found = await detector.detect(videoRef.current);
            if (found[0]?.rawValue) {
              onDetected(found[0].rawValue);
              onClose();
              return;
            }
          } catch {}
          timer = window.setTimeout(tick, 300);
        };
        setStatus('Point the camera at a product barcode.');
        timer = window.setTimeout(tick, 500);
      } catch {
        setStatus('Camera permission was unavailable. Enter the barcode manually.');
      }
    };
    start();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [onClose, onDetected]);

  const submit = () => {
    if (manual.trim()) { onDetected(manual.trim()); onClose(); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4"><div><p className="text-xs font-extrabold uppercase tracking-[.15em] text-brand-600">Scanner</p><h3 className="mt-1 text-lg font-black">Scan barcode</h3></div><button onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X /></button></div>
        <div className="p-4">
          <div className="overflow-hidden rounded-2xl bg-slate-950 aspect-video"><video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" /></div>
          <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-600">{status}</p>
          <div className="my-4 flex items-center gap-2"><div className="h-px flex-1 bg-slate-200" /><span className="text-xs font-bold text-slate-400">OR</span><div className="h-px flex-1 bg-slate-200" /></div>
          <div className="flex gap-2"><input value={manual} onChange={e => setManual(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} placeholder="Enter barcode / SKU" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-brand-200 focus:ring-2" /><button onClick={submit} className="rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-extrabold text-white">Find</button></div>
        </div>
      </div>
    </div>
  );
}

function StockModal({ product, onClose, onSaved }: { product: Product; onClose: () => void; onSaved: () => void }) {
  const [qty, setQty] = useState(product.stockQty);
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/products', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: product.id, stockQty: qty }) });
      if (!response.ok) throw new Error();
      onSaved(); onClose();
    } finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[.15em] text-brand-600">Inventory</p><h3 className="mt-1 text-lg font-black">Adjust stock</h3><p className="mt-1 text-xs text-slate-500">{product.name} • {product.sku}</p></div><button onClick={onClose} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X /></button></div>
        <label className="mt-5 block"><span className="text-xs font-bold text-slate-500">Current quantity ({product.unit})</span><input autoFocus type="number" min={0} value={qty} onChange={e => setQty(Math.max(0, Math.floor(Number(e.target.value || 0))))} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-lg font-black outline-none focus:border-brand-500" /></label>
        <div className="mt-5 flex gap-2"><button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600">Cancel</button><button onClick={save} disabled={saving} className="flex-1 rounded-xl bg-brand-700 px-4 py-3 text-sm font-extrabold text-white disabled:bg-slate-300">{saving ? 'Saving…' : 'Save stock'}</button></div>
      </div>
    </div>
  );
}

export default function POSApp() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [tab, setTab] = useState<'catalog' | 'cart'>('catalog');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [discount, setDiscount] = useState(0);
  const [payment, setPayment] = useState<'CASH' | 'CARD' | 'UPI'>('CASH');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [receipt, setReceipt] = useState<Invoice | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showInvoices, setShowInvoices] = useState(false);

  const { products, loading, refresh } = useProducts(search, category);

  const totals = useMemo(() => ({ subtotal: cart.reduce((sum, line) => sum + line.qty * line.product.sellingPrice, 0) }), [cart]);

  const refreshAll = async () => {
    await refresh();
    const response = await fetch('/api/invoices?limit=10', { cache: 'no-store' });
    if (response.ok) setInvoices(await response.json());
    setLastSynced(new Date());
  };

// ✅ Page referesh syncing:
useEffect(() => {
  refreshAll();
}, []);

  useEffect(() => {
    const loadInvoices = async () => {
      const response = await fetch('/api/invoices?limit=10', { cache: 'no-store' });
      if (response.ok) setInvoices(await response.json());
    };
    loadInvoices();
  }, []);

  useEffect(() => {
    const addByScan = products.find(p => p.barcode === search || p.sku.toLowerCase() === search.toLowerCase());
    if (search && addByScan && addByScan.barcode === search) {
      addToCart(addByScan);
      setSearch('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, search]);

  const addToCart = (product: Product) => {
    if (product.stockQty <= 0) return;
    setCart(current => {
      const existing = current.find(line => line.product.id === product.id);
      if (!existing) return [...current, { product, qty: 1 }];
      return current.map(line => line.product.id === product.id ? { ...line, qty: Math.min(line.qty + 1, product.stockQty) } : line);
    });
    setTab('cart');
  };

  const changeQty = (productId: string, delta: number) => {
    setCart(current => current.flatMap(line => {
      if (line.product.id !== productId) return [line];
      const qty = line.qty + delta;
      return qty <= 0 ? [] : [{ ...line, qty: Math.min(qty, line.product.stockQty) }];
    }));
  };

  const removeLine = (productId: string) => setCart(current => current.filter(line => line.product.id !== productId));

  const handleScan = (value: string) => {
    const found = products.find(p => p.barcode?.toLowerCase() === value.toLowerCase() || p.sku.toLowerCase() === value.toLowerCase());
    if (found) addToCart(found); else setSearch(value);
  };

  const checkout = async () => {
    if (!cart.length || checkingOut) return;
    setCheckingOut(true);
    try {
      const response = await fetch('/api/invoices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ discount, paymentMethod: payment, items: cart.map(line => ({ productId: line.product.id, qty: line.qty })) }) });
      const data = await response.json();
      if (!response.ok) { alert(data.error ?? 'Checkout failed.'); return; }
      setReceipt(data);
      setCart([]);
      setDiscount(0);
      await refreshAll();
    } finally { setCheckingOut(false); }
  };

  return (
    <main className="app-bg min-h-screen px-3 pb-6 pt-3 sm:px-5 sm:pt-5 lg:px-7">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4">
        <header className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-card backdrop-blur sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-700 text-white shadow-lg shadow-brand-900/10"><Boxes size={22} /></div>
              <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-brand-600">PGA</p><h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">Billing, Inventory & Stock Inquiry</h1><p className="hidden text-xs font-medium text-slate-500 sm:block">Fast stock lookup • Responsive POS • Thermal receipts</p></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden rounded-xl bg-emerald-50 px-3 py-2 text-right sm:block"><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Live stock</p><p className="text-xs font-extrabold text-emerald-800">Synced {lastSynced.toLocaleTimeString()}</p></div>
              <button onClick={() => { refreshAll(); }} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50" title="Refresh"><RefreshCw size={17} /></button>
              <button onClick={() => setShowInvoices(true)} className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 sm:flex"><Banknote size={16} /> Recent invoices</button>
              <button className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50 sm:hidden" title="Menu"><Menu size={18} /></button>
            </div>
          </div>
        </header>

        <div className="grid min-h-[calc(100vh-152px)] grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(390px,.8fr)]">
          <section className={`${tab === 'cart' ? 'hidden lg:flex' : 'flex'} min-h-0 flex-col gap-4`}>
            <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
              <div className="flex flex-col gap-3 lg:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search SKU, product name, category or barcode…" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-24 text-sm font-semibold outline-none ring-brand-200 focus:bg-white focus:ring-2" />
                  <button onClick={() => setScannerOpen(true)} className="absolute right-1.5 top-1.5 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-extrabold text-brand-700 shadow-sm ring-1 ring-slate-200 hover:bg-brand-50"><Barcode size={15} /> Scan</button>
                </div>
                <select value={category} onChange={e => setCategory(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-brand-200">
                  {categories.map(item => <option key={item}>{item}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {loading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-[188px] animate-pulse rounded-2xl bg-slate-200" />) : products.length ? products.map(product => <ProductCard key={product.id} product={product} onAdd={() => addToCart(product)} onAdjust={() => setStockProduct(product)} />) : (
                <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><PackageSearch className="mx-auto text-slate-300" size={42} /><h3 className="mt-3 font-black text-slate-800">No products found</h3><p className="mt-1 text-sm text-slate-500">Try a different SKU, barcode, product name or category.</p></div>
              )}
            </div>
          </section>

          <section className={`${tab === 'catalog' ? 'hidden lg:block' : 'block'} min-h-0`}>
            <CartPanel cart={cart} subtotal={totals.subtotal} discount={discount} setDiscount={setDiscount} payment={payment} setPayment={setPayment} onChangeQty={changeQty} onRemove={removeLine} onCheckout={checkout} checkingOut={checkingOut} />
          </section>
        </div>

        <div className="sticky bottom-3 z-20 mx-auto grid w-full max-w-sm grid-cols-2 rounded-2xl border border-slate-200 bg-white p-1 shadow-xl lg:hidden">
          <button onClick={() => setTab('catalog')} className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-extrabold ${tab === 'catalog' ? 'bg-brand-700 text-white' : 'text-slate-600'}`}><PackageSearch size={17} /> Catalog</button>
          <button onClick={() => setTab('cart')} className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-extrabold ${tab === 'cart' ? 'bg-brand-700 text-white' : 'text-slate-600'}`}><ShoppingBag size={17} /> Cart {cart.length > 0 && <span className="rounded-full bg-white/20 px-1.5 text-[10px]">{cart.length}</span>}</button>
        </div>
      </div>

      {scannerOpen && <BarcodeModal onClose={() => setScannerOpen(false)} onDetected={handleScan} />}
      {stockProduct && <StockModal product={stockProduct} onClose={() => setStockProduct(null)} onSaved={refreshAll} />}
      {receipt && <ReceiptModal invoice={receipt} onClose={() => setReceipt(null)} />}
      {showInvoices && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><p className="text-xs font-extrabold uppercase tracking-[.15em] text-brand-600">Sales history</p><h3 className="mt-1 text-lg font-black">Recent invoices</h3></div><button onClick={() => setShowInvoices(false)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><X /></button></div>
            <div className="scrollbar-thin overflow-y-auto p-4"><div className="overflow-x-auto"><table className="w-full min-w-[650px] border-collapse text-left text-sm"><thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400"><th className="p-3">Invoice</th><th className="p-3">Date</th><th className="p-3">Items</th><th className="p-3">Payment</th><th className="p-3 text-right">Total</th><th className="p-3" /></tr></thead><tbody>{invoices.map(inv => <tr key={inv.id} className="border-b border-slate-50"><td className="p-3 font-bold">{inv.invoiceNumber}</td><td className="p-3 text-slate-500">{new Date(inv.createdAt).toLocaleString()}</td><td className="p-3">{inv.items.reduce((n, i) => n + i.qty, 0)}</td><td className="p-3">{inv.paymentMethod === 'UPI' ? 'UPI / Wallet' : inv.paymentMethod}</td><td className="p-3 text-right font-black">{money(inv.total)}</td><td className="p-3 text-right"><button onClick={() => { setReceipt(inv); setShowInvoices(false); }} className="inline-flex items-center gap-1 text-xs font-extrabold text-brand-700">Receipt <ChevronRight size={13} /></button></td></tr>)}</tbody></table></div>{!invoices.length && <div className="py-12 text-center text-sm text-slate-500">No invoices yet.</div>}</div>
          </div>
        </div>
      )}
    </main>
  );
}
