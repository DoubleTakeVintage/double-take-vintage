import React, { useState } from "react";

// Double Take Vintage - React + Tailwind frontend
// Includes: Admin UI, Product grid, Cart/Checkout, Stripe client integration, Policy page
// Repo structure & deploy notes at bottom

export default function DoubleTakeVintageApp() {
  const [products, setProducts] = useState([
    { id: "p1", title: "90s Floral Midi Dress", price: 48, image: null, desc: null },
    { id: "p2", title: "Leather Bomber Jacket", price: 95, image: null, desc: null },
    { id: "p3", title: "Vintage Band Tee", price: 28, image: null, desc: null },
    { id: "p4", title: "High-waist Mom Jeans", price: 40, image: null, desc: null },
  ]);
  const [cart, setCart] = useState([]);
  const [query, setQuery] = useState("");
  const [adminMode, setAdminMode] = useState(false);

  function addToCart(product) {
    setCart((c) => {
      const found = c.find((x) => x.id === product.id);
      if (found) return c.map((x) => (x.id === product.id ? { ...x, qty: x.qty + 1 } : x));
      return [...c, { ...product, qty: 1 }];
    });
  }
  function removeFromCart(productId) {
    setCart((c) => c.filter((x) => x.id !== productId));
  }
  function updateQty(productId, qty) {
    setCart((c) => c.map((x) => (x.id === productId ? { ...x, qty } : x)));
  }

  const subtotal = cart.reduce((s, it) => s + it.price * it.qty, 0);

  async function checkout() {
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart.map(({ id, qty }) => ({ id, qty })) }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert("Checkout endpoint did not return a url. Check server logs.");
    } catch (e) {
      console.error(e);
      alert("Failed to start checkout.");
    }
  }

  const filtered = products.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()));

  // Admin mode add product
  function addProduct(newProd) {
    setProducts((p) => [...p, { ...newProd, id: `p${p.length + 1}` }]);
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="bg-white shadow-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-extrabold">Double Take Vintage</div>
          <nav className="flex gap-4">
            <button onClick={() => setAdminMode(false)}>Shop</button>
            <button onClick={() => setAdminMode(true)}>Admin</button>
            <button onClick={() => window.location.hash = "#policy"}>Policy</button>
            <button className="relative">🛒 <span>{cart.reduce((s, x) => s + x.qty, 0)}</span></button>
          </nav>
        </div>
      </header>

      {!adminMode && (
        <main className="max-w-6xl mx-auto px-6 py-12">
          <section id="products">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Shop</h2>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="px-3 py-2 border rounded-md" />
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="w-full h-56 bg-neutral-100 flex items-center justify-center">
                    {p.image ? <img src={p.image} alt={p.title} className="object-cover w-full h-full" /> : (
                      <div className="text-neutral-400 text-center">No image</div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="font-medium">{p.title}</div>
                    <div className="text-sm text-neutral-500">{p.desc ?? "Description will go here."}</div>
                    <div className="mt-4 flex justify-between">
                      <div className="font-semibold">${p.price.toFixed(2)}</div>
                      <button onClick={() => addToCart(p)} className="px-3 py-1 bg-black text-white rounded-md">Add</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside className="fixed right-6 bottom-6 w-80 bg-white rounded-2xl shadow-lg p-4">
            <div className="flex justify-between">
              <div className="font-semibold">Cart</div>
              <div>{cart.length} items</div>
            </div>
            <div className="mt-3 max-h-48 overflow-auto">
              {cart.length === 0 && <div>Your cart is empty</div>}
              {cart.map((it) => (
                <div key={it.id} className="py-2 flex justify-between border-b">
                  <div>{it.title}</div>
                  <div className="flex items-center gap-2">
                    <input type="number" min={1} value={it.qty} onChange={(e) => updateQty(it.id, parseInt(e.target.value) || 1)} className="w-12 px-2 py-1 border rounded" />
                    <button onClick={() => removeFromCart(it.id)} className="text-red-500">X</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-between">
              <div>Subtotal</div>
              <div>${subtotal.toFixed(2)}</div>
            </div>
            <button onClick={checkout} disabled={cart.length === 0} className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg">Checkout</button>
          </aside>

          <section id="policy" className="mt-24 bg-white rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-semibold">Policies</h3>
            <p className="mt-2">Privacy Policy: We respect your data, no third-party selling.</p>
            <p className="mt-2">Shipping & Returns: 14-day returns accepted.</p>
          </section>
        </main>
      )}

      {adminMode && <AdminUI addProduct={addProduct} />}
    </div>
  );
}

function AdminUI({ addProduct }) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(0);
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState(null);

  function handleAdd() {
    addProduct({ title, price: parseFloat(price), desc, image });
    setTitle(""); setPrice(0); setDesc(""); setImage(null);
  }

  return (
    <div className="max-w-xl mx-auto py-12">
      <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full border px-3 py-2 mb-2" />
      <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" type="number" className="w-full border px-3 py-2 mb-2" />
      <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" className="w-full border px-3 py-2 mb-2" />
      <input type="file" onChange={(e) => setImage(URL.createObjectURL(e.target.files[0]))} />
      <button onClick={handleAdd} className="mt-4 px-4 py-2 bg-black text-white rounded">Add Product</button>
    </div>
  );
}

/* === Repo Structure for Deployment (Vercel) ===

/ (root)
 ├─ package.json (with next, react, stripe)
 ├─ pages/
 │   ├─ index.js (wraps DoubleTakeVintageApp)
 │   └─ api/
 │       ├─ create-checkout-session.js
 │       └─ webhook.js
 ├─ components/DoubleTakeVintageApp.js

// create-checkout-session.js
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: req.body.items.map(it => ({
      price_data: { currency: 'usd', product_data: { name: it.id }, unit_amount: 1000 },
      quantity: it.qty
    })),
    success_url: `${req.headers.origin}/?success=true`,
    cancel_url: `${req.headers.origin}/?canceled=true`,
  });
  res.json({ url: session.url });
}

// webhook.js (Stripe webhook)
import Stripe from 'stripe';
export const config = { api: { bodyParser: false } };
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export default async function handler(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    console.log('Payment success', event.data.object);
  }
  res.json({ received: true });
}

// Deployment steps:
1. Push repo to GitHub.
2. Connect GitHub repo to Vercel (free plan).
3. Add env vars in Vercel dashboard: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET.
4. Deploy → get free subdomain (e.g., doubletakevintage.vercel.app).
*/
