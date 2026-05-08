import { useState } from 'react'
import Customer from './customer.jsx'
import InventoryDashboard from './InventoryDashboard.jsx'
import RevenuePage from './RevenuePage.jsx'
import QueuePage from './QueuePage.jsx'

/** @typedef {'customer' | 'inventory' | 'revenue' | 'queue'} AppPage */

export default function App() {
  const [page, setPage] = useState(/** @type {AppPage} */ ('customer'))

  const navBtn =
    'text-sm font-semibold pb-0.5 border-b-2 border-transparent hover:opacity-80 transition-colors'

  return (
    <div className="min-h-screen bg-[#FDF8F1] font-sans text-gray-800 flex flex-col">
      
      {/* NAVBAR */}
      <nav className="flex flex-wrap justify-between items-center gap-4 px-6 sm:px-10 py-4 bg-white border-b border-gray-200">
        <h1 className="text-xl sm:text-2xl font-bold text-[#5BC0DE]">Cozy Coffee</h1>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          
          <button
            type="button"
            onClick={() => setPage('customer')}
            className={`${navBtn} ${
              page === 'customer'
                ? 'text-[#D98C5F] border-[#D98C5F]'
                : 'text-[#5BC0DE]'
            }`}
          >
            Customer Menu
          </button>

          <button
            type="button"
            onClick={() => setPage('inventory')}
            className={`${navBtn} ${
              page === 'inventory'
                ? 'text-[#D98C5F] border-[#D98C5F]'
                : 'text-[#5BC0DE]'
            }`}
          >
            Admin Inventory
          </button>

          <button
            type="button"
            onClick={() => setPage('revenue')}
            className={`${navBtn} ${
              page === 'revenue'
                ? 'text-[#D98C5F] border-[#D98C5F]'
                : 'text-[#5BC0DE]'
            }`}
          >
            Revenue
          </button>

          <button
            type="button"
            onClick={() => setPage('queue')}
            className={`${navBtn} ${
              page === 'queue'
                ? 'text-[#D98C5F] border-[#D98C5F]'
                : 'text-[#5BC0DE]'
            }`}
          >
            Queue
          </button>

          <span className="text-[#5BC0DE] text-sm font-semibold opacity-70 cursor-default">
            Menu
          </span>

          <span className="text-[#5BC0DE] text-sm font-semibold opacity-70 cursor-default">
            About Us
          </span>

          <div
            className="w-9 h-9 rounded-full border-2 border-[#5BC0DE] flex items-center justify-center text-[#5BC0DE] text-lg"
            aria-hidden
          >
            👤
          </div>
        </div>
      </nav>

      {/* PAGE CONTENT */}
      {page === 'customer' && <Customer />}
      {page === 'inventory' && <InventoryDashboard />}
      {page === 'revenue' && <RevenuePage />}
      {page === 'queue' && <QueuePage />}

      {/* FOOTER */}
      <footer className="w-full h-16 bg-[#D9C8B1] border-t border-[#BFA888] mt-auto" />
    </div>
  )
}