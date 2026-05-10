import { useMemo, useState } from 'react'

export default function NewOrder({ onBack }) {
  const categories = useMemo(
    () => [
      'All',
      'Rice Bowl Chicken Wings',
      'French Fries',
      'Waffles',
      'Soft Drinks',
      'Korean Rice Bowls',
      'Sandwiches',
      'Silog Bowls',
      'Others',
    ],
    []
  )

  // Mock menu items (replace with DB later)
  // ✅ Added at least one item per category
  const items = useMemo(
    () => [
      // Rice Bowl Chicken Wings
      {
        id: 'rbw-1',
        name: 'Chicken Teriraki Bowl',
        price: 99,
        category: 'Rice Bowl Chicken Wings',
      },

      // French Fries
      { id: 'ff-1', name: 'Classic French Fries', price: 85, category: 'French Fries' },

      // Waffles
      { id: 'wf-1', name: 'Waffle Maple Cinnamon', price: 89, category: 'Waffles' },

      // Soft Drinks
      { id: 'sd-1', name: 'Coke', price: 25, category: 'Soft Drinks' },

      // Korean Rice Bowls
      { id: 'krb-1', name: 'Bibimbap (Beef)', price: 139, category: 'Korean Rice Bowls' },

      // Sandwiches
      { id: 'sw-1', name: 'Tuna Cheese Toast', price: 99, category: 'Sandwiches' },

      // Silog Bowls
      { id: 'slg-1', name: 'Beef Tapa', price: 99, category: 'Silog Bowls' },

      // Others
      { id: 'ot-1', name: 'Carbonara', price: 159, category: 'Others' },
    ],
    []
  )

  const [activeCategory, setActiveCategory] = useState('All')

  // quantities: { [itemId]: number }
  const [qty, setQty] = useState({})

  const visibleItems = useMemo(() => {
    if (activeCategory === 'All') return items
    return items.filter((i) => i.category === activeCategory)
  }, [activeCategory, items])

  const orderList = useMemo(() => {
    const byId = new Map(items.map((i) => [i.id, i]))
    return Object.entries(qty)
      .map(([id, n]) => {
        const item = byId.get(id)
        if (!item) return null
        return {
          id,
          name: item.name,
          price: item.price,
          qty: n,
          lineTotal: item.price * n,
        }
      })
      .filter(Boolean)
  }, [qty, items])

  const totalItems = useMemo(() => {
    return Object.values(qty).reduce((sum, n) => sum + n, 0)
  }, [qty])

  const totalPrice = useMemo(() => {
    return orderList.reduce((sum, row) => sum + row.lineTotal, 0)
  }, [orderList])

  function inc(id) {
    setQty((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }))
  }

  function dec(id) {
    setQty((prev) => {
      const next = Math.max(0, (prev[id] ?? 0) - 1)
      const copy = { ...prev }
      if (next === 0) delete copy[id]
      else copy[id] = next
      return copy
    })
  }

  function handleConfirmOrder() {
    onBack?.()
  }

  return (
    <main className="min-h-screen bg-[#FDFBF4] px-4 py-10 font-sans text-gray-700">
      <div className="mx-auto max-w-[90rem]">
        {/* Title */}
        <header className="mb-10 text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-gray-500/80 leading-tight">
            New Order
          </h1>
        </header>

        {/* Content: sidebar + grid + order list */}
        <div className="grid gap-8 xl:grid-cols-[260px_1fr_360px]">
          {/* Sidebar categories */}
          <aside className="-ml-6 space-y-3">
            {categories.map((cat) => {
              const active = cat === activeCategory
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={[
                    'min-w-55 rounded-xl px-4 py-2 text-left text-sm font-bold border shadow-sm transition',
                    active
                      ? 'bg-[#3B2F2A] text-white border-transparent'
                      : 'bg-[#D9C5B2]/40 text-gray-700 border-gray-400/30 hover:bg-[#D9C5B2]/55',
                  ].join(' ')}
                >
                  {cat}
                </button>
              )
            })}
          </aside>

          {/* Items grid */}
          <section>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {visibleItems.map((item) => {
                const count = qty[item.id] ?? 0

                return (
                  <article
                    key={item.id}
                    className="bg-white border border-gray-400/40 shadow-sm rounded-2xl p-4"
                  >
                    <p className="text-center text-xs font-extrabold tracking-wide text-gray-700 uppercase">
                      {item.name}
                    </p>

                    {/* Image placeholder */}
                    <div className="mt-3 aspect-square w-full rounded-xl border border-gray-300 bg-white relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        <div className="absolute w-full h-[1px] bg-black rotate-45"></div>
                        <div className="absolute w-full h-[1px] bg-black -rotate-45"></div>
                      </div>
                    </div>

                    <p className="mt-3 text-center text-sm font-extrabold text-gray-700">
                      ₱{item.price.toFixed(2)}
                    </p>

                    {/* + / - controls */}
                    <div className="mt-3 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => inc(item.id)}
                        className="grid h-8 w-10 place-items-center rounded-lg border border-[#D98C5F]/40 bg-[#D98C5F]/10 text-[#D98C5F] font-extrabold hover:bg-[#D98C5F]/15"
                        aria-label={`Add ${item.name}`}
                      >
                        +
                      </button>

                      <span className="min-w-8 text-center font-bold text-gray-700">
                        {count}
                      </span>

                      <button
                        type="button"
                        onClick={() => dec(item.id)}
                        className="grid h-8 w-10 place-items-center rounded-lg border border-gray-400/40 bg-black/5 text-gray-700 font-extrabold hover:bg-black/10"
                        aria-label={`Remove ${item.name}`}
                        disabled={count === 0}
                      >
                        −
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          {/* Order list (right side) */}
          <aside className="xl:sticky xl:top-6 h-fit">
            <div className="bg-white border border-gray-400/40 shadow-sm rounded-2xl p-5">
              <h2 className="text-lg font-extrabold text-gray-700">Order List</h2>

              <div className="mt-4 max-h-[420px] overflow-auto pr-1">
                {orderList.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No items added yet. Use the + button to add items.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {orderList.map((row) => (
                      <li
                        key={row.id}
                        className="flex items-start justify-between gap-3 rounded-xl border border-gray-400/30 p-3"
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-gray-700 truncate">{row.name}</p>
                          <p className="text-xs text-gray-500">
                            ₱{row.price.toFixed(2)} × {row.qty}
                          </p>
                        </div>

                        <p className="shrink-0 font-extrabold text-gray-800">
                          ₱{row.lineTotal.toFixed(2)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-6 border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600">
                  {totalItems} {totalItems === 1 ? 'order' : 'orders'} added
                </p>

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-lg font-extrabold text-gray-800">TOTAL:</p>
                  <p className="text-lg font-extrabold text-gray-800">
                    ₱{totalPrice.toFixed(2)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmOrder}
                  disabled={totalItems === 0}
                  className={[
                    'mt-4 w-full rounded-full px-8 py-4 font-extrabold shadow-md transition',
                    totalItems === 0
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-[#D98C5F] text-white hover:opacity-90',
                  ].join(' ')}
                >
                  Confirm Order
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}