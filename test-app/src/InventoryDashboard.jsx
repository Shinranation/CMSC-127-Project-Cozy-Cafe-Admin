import { useCallback, useEffect, useState } from 'react'
import { supabase, supabaseConfigured } from './lib/supabaseClient.js'

/** @typedef {{ item_id: number, menu_name: string, category: string, ingredient_id: number, current_quantity: number, unit_of_measure: string, low_stock: number }} MenuInventoryRow */

/** Avoid NaN when Postgres / Realtime sends null, blanks, or non-numeric strings. */
function safeNumeric(raw, fallback = 0) {
  if (raw === null || raw === undefined || raw === '') return fallback
  const n = typeof raw === 'number' ? raw : Number(raw)
  return Number.isFinite(n) ? n : fallback
}

function normalizeUnit(raw) {
  if (raw === null || raw === undefined) return '—'
  const s = String(raw).trim()
  return s === '' ? '—' : s
}

function parseRpcJsonArray(data) {
  if (data == null) return []
  if (Array.isArray(data)) return data
  if (typeof data === 'string') {
    try {
      const p = JSON.parse(data)
      return Array.isArray(p) ? p : []
    } catch {
      return []
    }
  }
  return []
}

function normalizeMenuInventoryRow(raw) {
  const itemId = Number(raw.item_id)
  const ingId = Number(raw.inventory_ingredient_id)
  return {
    item_id: Number.isFinite(itemId) ? itemId : safeNumeric(raw.item_id, 0),
    menu_name: String(raw.menu_name ?? raw.name ?? ''),
    category: String(raw.category ?? ''),
    ingredient_id: Number.isFinite(ingId) ? ingId : safeNumeric(raw.inventory_ingredient_id, 0),
    current_quantity: safeNumeric(raw.available_units, 0),
    unit_of_measure: normalizeUnit(raw.unit_of_measure),
    low_stock: safeNumeric(raw.low_stock, 0),
  }
}

/**
 * Realtime UPDATE payloads on `inventory` — merge into the menu row that shares this ingredient_id.
 */
function mergeInventoryPayloadIntoMenuRows(prev, invRow) {
  if (!invRow) return prev
  const invId = Number(invRow.ingredient_id)
  if (!Number.isFinite(invId)) return prev
  return sortByItemId(
    prev.map((r) => {
      if (r.ingredient_id !== invId) return r
      return normalizeMenuInventoryRow({
        item_id: r.item_id,
        menu_name: r.menu_name,
        category: r.category,
        inventory_ingredient_id: invId,
        available_units: invRow.current_quantity ?? r.current_quantity,
        unit_of_measure: invRow.unit_of_measure ?? r.unit_of_measure,
        low_stock: invRow.low_stock ?? r.low_stock,
      })
    }),
  )
}

function sortByItemId(rows) {
  return [...rows].sort((a, b) => a.item_id - b.item_id)
}

/** Skeleton slots on first load — matches eight demo menu lines. */
const INVENTORY_CARD_SLOTS = 8

const inventoryCardGridClass =
  'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-3 lg:gap-4'

/** Bar fill only when quantity &gt; 0; negatives match your DB (e.g. oversold / adjustment). */
function stockBarPercent(row) {
  const q = row.current_quantity
  const low = row.low_stock
  if (q <= 0) return 0
  const maxBar = Math.max(q, low * 2.5, 1)
  return Math.min(100, (q / maxBar) * 100)
}

function safeIntegerEnv(raw, fallback) {
  const n = Number(raw)
  return Number.isInteger(n) ? n : fallback
}

const TX_REFERENCE_ID = safeIntegerEnv(import.meta.env.VITE_TX_REFERENCE_ID, 1)
const TX_CASHIER_ID = safeIntegerEnv(import.meta.env.VITE_TX_CASHIER_ID, 1)

/**
 * Aligns with `inventory_transactions` ERD:
 * transaction_id (PK), ingredient_id (FK→inventory), quantity_change, transaction_type,
 * reference_id, reason, timestamp, cashier_id.
 */
async function insertInventoryTransactionRow(supabase, { ingredient_id, actualDelta, transaction_type, reason }) {
  const txRow = {
    ingredient_id,
    quantity_change: actualDelta,
    transaction_type,
    reason,
    reference_id: TX_REFERENCE_ID,
    cashier_id: TX_CASHIER_ID,
  }

  const { error } = await supabase.from('inventory_transactions').insert(txRow)
  return error
}

function parsePositiveAmount(raw) {
  if (raw === undefined || raw === '') return 1
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return NaN
  return n
}

export default function InventoryDashboard() {
  /** @type {[MenuInventoryRow[], React.Dispatch<React.SetStateAction<MenuInventoryRow[]>>]} */
  const [rows, setRows] = useState([])
  const configured = supabaseConfigured()
  const [loading, setLoading] = useState(configured)
  const [fetchError, setFetchError] = useState(/** @type {string | null} */ (null))
  const [realtimeStatus, setRealtimeStatus] = useState(/** @type {'idle' | 'subscribed' | 'error'} */ ('idle'))
  /** Quantity to add/remove per row (string for controlled inputs) */
  const [qtyInputs, setQtyInputs] = useState(/** @type {Record<number, string>} */ ({}))
  const [busyIngredientId, setBusyIngredientId] = useState(/** @type {number | null} */ (null))
  const [actionError, setActionError] = useState(/** @type {string | null} */ (null))

  const missingEnvMessage =
    'Missing Supabase URL/key. Set SUPABASE_URL and SUPABASE_KEY (anon) or VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the repo-root .env — see test-app/.env.example.'

  const refreshFromServer = useCallback(async () => {
    if (!supabase) return
    setFetchError(null)
    const { data, error } = await supabase.rpc('get_menu_for_pos')
    if (error) {
      setFetchError(error.message)
      setRows([])
      return
    }
    setRows(sortByItemId(parseRpcJsonArray(data).map(normalizeMenuInventoryRow)))
  }, [])

  /** Stock In / Out: update `inventory`, then insert `inventory_transactions` (see ERD: quantity_change). */
  const applyStockMovement = useCallback(
    async (row, mode) => {
      if (!supabase) return
      const amount = parsePositiveAmount(qtyInputs[row.ingredient_id])
      if (Number.isNaN(amount)) {
        setActionError('Enter a positive number for quantity.')
        return
      }

      const signedDelta = mode === 'in' ? amount : -amount
      setActionError(null)
      setBusyIngredientId(row.ingredient_id)

      const { data: fresh, error: readErr } = await supabase
        .from('inventory')
        .select('current_quantity')
        .eq('ingredient_id', row.ingredient_id)
        .single()

      if (readErr || fresh == null) {
        setActionError(readErr?.message ?? 'Could not read current quantity.')
        setBusyIngredientId(null)
        return
      }

      const current = Number(fresh.current_quantity)
      const newQty = current + signedDelta
      const actualDelta = newQty - current

      const { error: upErr } = await supabase
        .from('inventory')
        .update({ current_quantity: newQty })
        .eq('ingredient_id', row.ingredient_id)

      if (upErr) {
        setActionError(upErr.message)
        setBusyIngredientId(null)
        return
      }

      // Reflect quantity change immediately in UI (realtime events can lag/miss).
      setRows((prev) =>
        sortByItemId(
          prev.map((r) =>
            r.ingredient_id === row.ingredient_id
              ? { ...r, current_quantity: newQty }
              : r,
          ),
        ),
      )

      const txErr = await insertInventoryTransactionRow(supabase, {
        ingredient_id: row.ingredient_id,
        actualDelta,
        transaction_type: mode === 'in' ? 'stock_in' : 'stock_out',
        reason: 'Admin inventory adjustment',
      })

      if (txErr) {
        setActionError(
          `Quantity saved, but audit log insert failed: ${txErr.message}. Check RLS INSERT and ensure VITE_TX_REFERENCE_ID / VITE_TX_CASHIER_ID point to valid IDs for your schema.`,
        )
        await refreshFromServer()
      } else {
        setActionError(null)
        // Keep local state in sync even when realtime isn't delivering updates.
        void refreshFromServer()
      }

      setBusyIngredientId(null)
    },
    [qtyInputs, refreshFromServer],
  )

  useEffect(() => {
    if (!configured || !supabase) return

    let cancelled = false

    void (async () => {
      setLoading(true)
      setFetchError(null)
      try {
        const { data, error } = await supabase.rpc('get_menu_for_pos')
        if (cancelled) return
        if (error) {
          setFetchError(error.message)
          setRows([])
        } else {
          setRows(sortByItemId(parseRpcJsonArray(data).map(normalizeMenuInventoryRow)))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    const channel = supabase
      .channel('inventory-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory' },
        (payload) => {
          const t = payload.eventType
          if (t === 'INSERT' || t === 'DELETE') {
            void refreshFromServer()
            return
          }
          if (t === 'UPDATE' && payload.new) {
            setRows((prev) => mergeInventoryPayloadIntoMenuRows(prev, payload.new))
          }
        },
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') setRealtimeStatus('subscribed')
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setRealtimeStatus('error')
          if (err) console.error('Realtime:', err)
        }
      })

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
      setRealtimeStatus('idle')
    }
  }, [configured, refreshFromServer])

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 sm:py-10">
      <p className="text-center text-[10px] uppercase tracking-widest text-gray-500 mb-2">
        Live data — loads menu stock via <code className="text-[9px] bg-gray-100 px-1 rounded">get_menu_for_pos</code> (admin), updates{' '}
        <code className="text-[9px] bg-gray-100 px-1 rounded">inventory</code>, logs{' '}
        <code className="text-[9px] bg-gray-100 px-1 rounded">inventory_transactions</code> (Realtime on inventory)
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-700">
          Admin Dashboard Inventory
        </h2>
        {configured && (
          <span
            className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${
              realtimeStatus === 'subscribed'
                ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                : realtimeStatus === 'error'
                  ? 'border-red-300 bg-red-50 text-red-800'
                  : 'border-gray-300 bg-gray-50 text-gray-600'
            }`}
            title="postgres_changes on public.inventory"
          >
            {realtimeStatus === 'subscribed'
              ? 'Realtime on'
              : realtimeStatus === 'error'
                ? 'Realtime error'
                : 'Connecting…'}
          </span>
        )}
      </div>

      {!configured && (
        <p className="text-center text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
          {missingEnvMessage} Use the <strong>anon</strong> public key only (never <code className="text-xs bg-white px-1 rounded">service_role</code> in the
          browser). Restart <code className="text-xs bg-white px-1 rounded">npm run dev</code> after changing{' '}
          <code className="text-xs bg-white px-1 rounded">.env</code> at the repo root.
        </p>
      )}

      {actionError && configured && (
        <div
          className="text-center text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6"
          role="alert"
        >
          {actionError}
        </div>
      )}

      {fetchError && configured && (
        <div className="text-center text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 space-y-2">
          <p>{fetchError}</p>
          <p className="text-xs text-gray-600">
            Ensure your user is <code className="bg-white px-1 rounded">admin</code> in <code className="bg-white px-1 rounded">user_roles</code> so <code className="bg-white px-1 rounded">get_menu_for_pos</code> runs, plus{' '}
            <code className="bg-white px-1 rounded">UPDATE</code> on <code className="bg-white px-1 rounded">inventory</code> and <code className="bg-white px-1 rounded">INSERT</code> on{' '}
            <code className="bg-white px-1 rounded">inventory_transactions</code> for Stock In/Out.
          </p>
          <button
            type="button"
            onClick={() => {
              setLoading(true)
              refreshFromServer().finally(() => setLoading(false))
            }}
            className="text-xs font-bold underline text-[#D98C5F]"
          >
            Retry fetch
          </button>
        </div>
      )}

      {realtimeStatus === 'error' && configured && !fetchError && (
        <p className="text-center text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-6">
          Realtime failed to subscribe. In Supabase: Database → Publications → enable{' '}
          <code className="bg-white px-1 rounded">supabase_realtime</code> for table{' '}
          <code className="bg-white px-1 rounded">inventory</code>, or enable Replication on that table.
        </p>
      )}

      {loading && !(configured && rows.length === 0 && !fetchError) && (
        <p className="text-center text-gray-500 text-sm mb-6" aria-live="polite">
          Loading menu availability…
        </p>
      )}

      {loading && configured && rows.length === 0 && !fetchError && (
        <section className="mb-12" aria-busy="true" aria-label="Loading menu availability cards">
          <h3 className="text-sm font-bold text-gray-600 mb-2 inline-flex flex-wrap items-center gap-2 rounded-full bg-white border border-gray-200 px-3 py-1">
            Menu availability
            <span className="font-normal text-gray-400 normal-case">{INVENTORY_CARD_SLOTS} slots</span>
          </h3>
          <p className="text-xs text-gray-500 mb-4">Fetching menu-linked stock rows…</p>
          <div className={inventoryCardGridClass}>
            {Array.from({ length: INVENTORY_CARD_SLOTS }, (_, i) => (
              <div
                key={`skeleton-${i}`}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm animate-pulse flex flex-col gap-4"
              >
                <div className="aspect-[5/4] rounded-xl bg-stone-200" />
                <div className="h-5 bg-stone-200 rounded w-4/5 mx-auto" />
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-[4.25rem] rounded-lg bg-stone-100 border border-stone-200" />
                  <div className="h-[4.25rem] rounded-lg bg-stone-100 border border-stone-200" />
                  <div className="h-[4.25rem] rounded-lg bg-stone-100 border border-stone-200" />
                </div>
                <div className="h-2 rounded-full bg-stone-200" />
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="h-9 rounded-lg bg-stone-200" />
                  <div className="flex gap-2">
                    <div className="h-9 flex-1 rounded-full bg-stone-200" />
                    <div className="h-9 flex-1 rounded-full bg-stone-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && configured && rows.length === 0 && !fetchError && (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white/80 px-6 py-10 text-center text-gray-600 mb-8">
          <p className="font-semibold text-gray-800 mb-2">No menu inventory rows returned</p>
          <p className="text-sm max-w-md mx-auto">
            Link <code className="text-xs bg-gray-100 px-1 rounded">menu.inventory_ingredient_id</code> to <code className="text-xs bg-gray-100 px-1 rounded">inventory</code>, and confirm your account has the admin role for <code className="text-xs bg-gray-100 px-1 rounded">get_menu_for_pos</code>.
          </p>
        </div>
      )}

      {rows.length > 0 && (
        <section className="mb-12" aria-label="Menu availability cards">
          <h3 className="text-sm font-bold text-gray-600 mb-4 inline-flex flex-wrap items-center gap-2 rounded-full bg-white border border-gray-200 px-3 py-1">
            Menu availability
            <span className="font-normal text-gray-400 normal-case">
              {rows.length} menu item{rows.length !== 1 ? 's' : ''}
            </span>
          </h3>
          <div className={inventoryCardGridClass}>
            {rows.map((row) => {
              const pct = stockBarPercent(row)
              const low = row.current_quantity <= row.low_stock
              const negative = row.current_quantity < 0
              const unitDisplay = row.unit_of_measure

              return (
                <article
                  key={row.item_id}
                  className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col gap-4 min-h-[280px]"
                >
                  <div
                    className="relative aspect-[5/4] min-h-[11rem] rounded-xl bg-gradient-to-b from-[#EDE8E0] to-[#DDD5CA] ring-2 ring-dashed ring-[#C4B8A8] shadow-inner overflow-hidden"
                    aria-label={`Image placeholder for ${row.menu_name}`}
                  >
                    <span className="absolute top-2 left-2 font-mono text-[10px] font-semibold text-stone-600 bg-white/90 px-1.5 py-0.5 rounded border border-stone-200 max-w-[90%] truncate">
                      {row.category}
                    </span>
                    {(low || negative) && (
                      <span
                        className={`absolute top-2 right-2 w-4 h-4 rounded-full ring-2 ring-white ${negative ? 'bg-purple-600' : 'bg-red-500'}`}
                        title={negative ? 'Negative on-hand quantity' : 'current_quantity ≤ low_stock'}
                        aria-label={negative ? 'Negative quantity' : 'Low stock'}
                      />
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pt-8 px-4 text-center">
                      <svg
                        className="w-14 h-14 text-stone-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 64 64"
                        aria-hidden
                      >
                        <rect x="6" y="12" width="52" height="40" rx="4" strokeWidth="2" />
                        <path d="M6 42 L20 26 L34 38 L42 28 L58 42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="22" cy="22" r="4" strokeWidth="2" />
                      </svg>
                      <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">
                        Menu item photo
                      </span>
                      <span className="text-[10px] text-stone-500 leading-tight">
                        Slot for image URL / upload
                        <br />
                        ({row.menu_name})
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="font-bold text-gray-900 leading-tight text-base">{row.menu_name}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Stock row adjusts servings for this menu item.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg border border-gray-200 bg-[#FAF8F5] px-2 py-2 text-center shadow-sm">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500 leading-tight">
                        available
                      </p>
                      <p
                        className={`mt-1 text-xl font-bold tabular-nums ${negative ? 'text-red-700' : 'text-gray-900'}`}
                      >
                        {row.current_quantity}
                      </p>
                      <p className="text-[9px] text-gray-500 mt-0.5">{unitDisplay}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-[#FAF8F5] px-2 py-2 text-center shadow-sm">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500 leading-tight">
                        unit_of_measure
                      </p>
                      <p className="mt-1 text-xl font-bold text-gray-900 tracking-tight">{unitDisplay}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-[#FAF8F5] px-2 py-2 text-center shadow-sm">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500 leading-tight">
                        low_stock
                      </p>
                      <p className="mt-1 text-xl font-bold tabular-nums text-gray-900">{row.low_stock}</p>
                      <p className="text-[9px] text-gray-500 mt-0.5">threshold</p>
                    </div>
                  </div>

                  {negative && (
                    <p className="text-xs font-medium text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                      Quantity is below zero — use Stock In to correct.
                    </p>
                  )}

                  <div>
                    <div className="h-2 rounded-full bg-amber-900/25 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${low ? 'bg-amber-800' : 'bg-emerald-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Level bar when current_quantity &gt; 0
                    </p>
                  </div>

                  <div className="mt-auto flex flex-col gap-2 border-t border-gray-100 pt-3">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                      Amount
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="1"
                        value={qtyInputs[row.ingredient_id] ?? ''}
                        onChange={(e) =>
                          setQtyInputs((prev) => ({ ...prev, [row.ingredient_id]: e.target.value }))
                        }
                        className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm font-normal"
                        disabled={busyIngredientId === row.ingredient_id}
                      />
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={busyIngredientId === row.ingredient_id || !configured}
                        onClick={() => applyStockMovement(row, 'in')}
                        className="flex-1 rounded-full bg-emerald-600 text-white py-2 text-xs font-bold hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {busyIngredientId === row.ingredient_id ? '…' : 'Stock In'}
                      </button>
                      <button
                        type="button"
                        disabled={busyIngredientId === row.ingredient_id || !configured}
                        onClick={() => applyStockMovement(row, 'out')}
                        className="flex-1 rounded-full bg-amber-800 text-white py-2 text-xs font-bold hover:bg-amber-900 disabled:opacity-50"
                      >
                        {busyIngredientId === row.ingredient_id ? '…' : 'Stock Out'}
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}
    </main>
  )
}
