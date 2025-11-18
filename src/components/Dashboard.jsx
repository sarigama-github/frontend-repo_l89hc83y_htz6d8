import { useEffect, useMemo, useState } from 'react'

export default function Dashboard({ auth, onLogout }) {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'
  const [revenue, setRevenue] = useState(null)
  const [orders, setOrders] = useState([])
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPayout, setShowPayout] = useState(false)
  const [payoutForm, setPayoutForm] = useState({ amount: '', bank_name: '', account_holder: '', account_number: '', ifsc: '' })
  const schoolId = auth?.schoolId

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [revRes, ordersRes, payoutsRes] = await Promise.all([
        fetch(`${baseUrl}/api/revenue?school_id=${schoolId}`),
        fetch(`${baseUrl}/api/orders?school_id=${schoolId}`),
        fetch(`${baseUrl}/api/payouts?school_id=${schoolId}`)
      ])
      const [rev, ords, pays] = await Promise.all([revRes.json(), ordersRes.json(), payoutsRes.json()])
      setRevenue(rev)
      setOrders(ords)
      setPayouts(pays)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const totalPaid = useMemo(() => payouts.filter(p => ['approved', 'paid'].includes(p.status)).reduce((s, p) => s + (p.amount || 0), 0), [payouts])

  const createPayout = async (e) => {
    e.preventDefault()
    try {
      const payload = { ...payoutForm, amount: parseFloat(payoutForm.amount || 0), school_id: schoolId, status: 'pending' }
      const res = await fetch(`${baseUrl}/api/payouts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Failed to create payout')
      setShowPayout(false)
      setPayoutForm({ amount: '', bank_name: '', account_holder: '', account_number: '', ifsc: '' })
      await fetchAll()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">School Portal</h1>
        <div className="flex items-center gap-4">
          <span className="text-blue-200/80 text-sm">{auth?.name} • {auth?.email}</span>
          <button onClick={onLogout} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-md text-sm">Log out</button>
        </div>
      </header>

      <main className="p-6 space-y-8">
        {/* Metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
            <div className="text-blue-300 text-sm mb-1">Total revenue</div>
            <div className="text-3xl font-bold">₹{revenue ? revenue.total_revenue.toFixed(2) : '0.00'}</div>
          </div>
          <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
            <div className="text-blue-300 text-sm mb-1">Paid out</div>
            <div className="text-3xl font-bold">₹{totalPaid.toFixed(2)}</div>
          </div>
          <div className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
            <div className="text-blue-300 text-sm mb-1">Pending payout</div>
            <div className="text-3xl font-bold">₹{revenue ? revenue.pending_payout.toFixed(2) : '0.00'}</div>
          </div>
        </section>

        {/* Orders */}
        <section className="bg-slate-800/40 border border-white/10 rounded-xl">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-semibold">Orders</h2>
            <span className="text-sm text-blue-200/80">{revenue ? revenue.total_orders : 0} orders</span>
          </div>
          <div className="divide-y divide-white/5">
            {orders.length === 0 && (
              <div className="p-4 text-blue-200/70">No orders yet.</div>
            )}
            {orders.map((o, idx) => (
              <div key={idx} className="p-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-blue-200/80">Order</div>
                  <div className="font-semibold">{o.order_number}</div>
                </div>
                <div>
                  <div className="text-blue-200/80">Amount</div>
                  <div className="font-semibold">₹{o.amount?.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-blue-200/80">Status</div>
                  <div className="font-semibold capitalize">{o.status}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Payouts */}
        <section className="bg-slate-800/40 border border-white/10 rounded-xl">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-semibold">Payouts</h2>
            <button onClick={() => setShowPayout(true)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-md text-sm">Request payout</button>
          </div>
          <div className="divide-y divide-white/5">
            {payouts.length === 0 && (
              <div className="p-4 text-blue-200/70">No payout requests yet.</div>
            )}
            {payouts.map((p, idx) => (
              <div key={idx} className="p-4 grid grid-cols-5 gap-4 text-sm">
                <div>
                  <div className="text-blue-200/80">Amount</div>
                  <div className="font-semibold">₹{p.amount?.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-blue-200/80">Bank</div>
                  <div className="font-semibold">{p.bank_name}</div>
                </div>
                <div>
                  <div className="text-blue-200/80">Account</div>
                  <div className="font-semibold">{p.account_holder} • {p.account_number}</div>
                </div>
                <div>
                  <div className="text-blue-200/80">IFSC</div>
                  <div className="font-semibold">{p.ifsc}</div>
                </div>
                <div>
                  <div className="text-blue-200/80">Status</div>
                  <div className="font-semibold capitalize">{p.status}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Payout Modal */}
      {showPayout && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Request payout</h3>
              <button onClick={() => setShowPayout(false)} className="text-blue-200/80 hover:text-white">Close</button>
            </div>

            <form onSubmit={createPayout} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm text-blue-200 mb-1">Amount (₹)</label>
                <input required type="number" step="0.01" value={payoutForm.amount} onChange={e => setPayoutForm({ ...payoutForm, amount: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md" />
              </div>
              <div>
                <label className="block text-sm text-blue-200 mb-1">Bank name</label>
                <input required value={payoutForm.bank_name} onChange={e => setPayoutForm({ ...payoutForm, bank_name: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md" />
              </div>
              <div>
                <label className="block text-sm text-blue-200 mb-1">Account holder</label>
                <input required value={payoutForm.account_holder} onChange={e => setPayoutForm({ ...payoutForm, account_holder: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md" />
              </div>
              <div>
                <label className="block text-sm text-blue-200 mb-1">Account number</label>
                <input required value={payoutForm.account_number} onChange={e => setPayoutForm({ ...payoutForm, account_number: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md" />
              </div>
              <div>
                <label className="block text-sm text-blue-200 mb-1">IFSC</label>
                <input required value={payoutForm.ifsc} onChange={e => setPayoutForm({ ...payoutForm, ifsc: e.target.value })} className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md" />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowPayout(false)} className="px-3 py-2 bg-slate-700 rounded-md">Cancel</button>
                <button className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-md">Submit request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
