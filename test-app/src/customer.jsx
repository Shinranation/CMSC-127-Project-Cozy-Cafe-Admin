import { useEffect, useMemo, useState } from 'react'
import { supabase, supabaseConfigured } from './lib/supabaseClient.js'

const CATEGORIES = [
  'All',
  'Rice Bowl Chicken Wings',
  'French Fries',
  'Others',
  'Waffles',
  'Soft Drinks',
  'Korean Rice Bowls',
  'Sandwiches',
  'Silog Bowls',
]

function normalizeMenuItem(raw) {
  return {
    id: raw.item_id,
    name: String(raw.name ?? ''),
    description: String(raw.description ?? ''),
    category: String(raw.category ?? ''),
    price: Number(raw.price ?? 0),
    availabilityStatus: String(raw.availability_status ?? ''),
    imageUrl: '',
  }
}

export default function Customer() {
  const configured = supabaseConfigured()
  const [activeCategory, setActiveCategory] = useState('All')
  const [itemsFromDb, setItemsFromDb] = useState([])
  const [loading, setLoading] = useState(configured)
  const [fetchError, setFetchError] = useState(null)

  useEffect(() => {
    if (!configured || !supabase) return

    let cancelled = false

    void (async () => {
      setLoading(true)
      setFetchError(null)

      const { data, error } = await supabase
        .from('menu')
        .select('item_id,name,description,price,category,availability_status')
        .order('item_id')

      if (cancelled) return

      if (error) {
        setFetchError(error.message)
        setItemsFromDb([])
      } else {
        setItemsFromDb(
          (data ?? [])
            .map(normalizeMenuItem)
            .filter((item) => item.availabilityStatus.toLowerCase() === 'available'),
        )
      }

      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [configured])

  const visibleItems = useMemo(() => {
    if (activeCategory === 'All') return itemsFromDb
    return itemsFromDb.filter((item) => item.category === activeCategory)
  }, [activeCategory, itemsFromDb])

  return (
    <div className="min-h-screen bg-[#F7F0E6] text-[#3B2F2A]">
      <main className="mx-auto max-w-6xl px-10 pb-16">
        <h2 className="py-28 text-center text-7xl font-extrabold tracking-tight text-gray-500/80">
          Promotions
        </h2>

        <section className="mx-auto max-w-4xl">
          <h3 className="mb-10 text-center text-5xl font-extrabold">Menu</h3>

          {!configured && (
            <p className="mb-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
              Missing Supabase configuration.
            </p>
          )}

          {fetchError && configured && (
            <p className="mb-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
              {fetchError}
            </p>
          )}

          <div className="mx-auto mb-12 flex max-w-4xl flex-wrap justify-center gap-x-8 gap-y-5">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={[
                    'rounded-full border px-7 py-3 text-sm font-semibold transition-colors',
                    isActive
                      ? 'border-transparent bg-[#3B2F2A] text-white'
                      : 'border-black/50 bg-white text-[#3B2F2A] hover:bg-black/5',
                  ].join(' ')}
                >
                  {cat}
                </button>
              )
            })}
          </div>

          {loading && (
            <p className="mb-8 text-center text-sm text-black/50" aria-live="polite">
              Loading menu...
            </p>
          )}

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((item) => (
              <article
                key={item.id}
                className="rounded-[28px] border-2 border-[#D98C5F] bg-white p-5"
              >
                <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border-2 border-black/40 bg-white">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-white">
                      <img
                        src="https://via.placeholder.com/150"
                        alt="No image available"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <p className="text-xl font-extrabold leading-tight text-[#3B2F2A]">
                    {item.name}
                  </p>
                  <p className="mt-1 text-sm text-black/55">{item.description}</p>
                  <p className="mt-2 text-lg font-extrabold text-[#D98C5F]">
                    ₱{item.price.toFixed(2)}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {!loading && visibleItems.length === 0 && (
            <p className="mt-10 text-center text-sm text-black/50">
              No available menu items found in this category yet.
            </p>
          )}
        </section>
      </main>

      <footer className="mt-16">
        <div className="h-[2px] w-full bg-[#1E96AE]" />
      </footer>
    </div>
  )
}
