import { useState } from 'react'
import PromotionsPage from './PromotionsPage.jsx'
import InventoryDashboard from './InventoryDashboard.jsx'

/** @typedef {'promotions' | 'inventory'} AppPage */

export default function App() {
  const [page, setPage] = useState(/** @type {AppPage} */ ('inventory'))

  const navBtn =
    'text-sm font-semibold pb-0.5 border-b-2 border-transparent hover:opacity-80 transition-colors'

  return (
    <div className="min-h-screen bg-[#FDF8F1] font-sans text-gray-800 flex flex-col">
      <nav className="flex flex-wrap justify-between items-center gap-4 px-6 sm:px-10 py-4 bg-white border-b border-gray-200">
        <h1 className="text-xl sm:text-2xl font-bold text-[#5BC0DE]">Cozy Coffee</h1>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <button
            type="button"
            onClick={() => setPage('promotions')}
            className={`${navBtn} ${page === 'promotions' ? 'text-[#D98C5F] border-[#D98C5F]' : 'text-[#5BC0DE]'}`}
          >
            Promotions
          </button>
          <button
            type="button"
            onClick={() => setPage('inventory')}
            className={`${navBtn} ${page === 'inventory' ? 'text-[#D98C5F] border-[#D98C5F]' : 'text-[#5BC0DE]'}`}
          >
            Admin Inventory
          </button>
          <span className="text-[#5BC0DE] text-sm font-semibold opacity-70 cursor-default">Menu</span>
          <span className="text-[#5BC0DE] text-sm font-semibold opacity-70 cursor-default">About Us</span>
          <div
            className="w-9 h-9 rounded-full border-2 border-[#5BC0DE] flex items-center justify-center text-[#5BC0DE] text-lg"
            aria-hidden
          >
            👤
          </div>
        </div>
      </nav>

      {page === 'promotions' ? <PromotionsPage /> : <InventoryDashboard />}

      <footer className="w-full h-16 bg-[#D9C8B1] border-t border-[#BFA888] mt-auto" />
    </div>
  )
}
