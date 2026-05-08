import { useState } from 'react'

export default function AdminDashboardQueue() {
  // Mock data for the orders
  const QUEUE_ORDERS = [
    { id: 'Order #001', customer: 'Juan Dela Cruz', itemsCount: 6 },
    { id: 'Order #002', customer: 'Maria Clara', itemsCount: 5 },
    { id: 'Order #003', customer: 'Crisostomo Ibarra', itemsCount: 4 },
  ]

  return (
    <main className="min-h-screen bg-[#FDFBF4] py-10 px-4 font-sans text-gray-700">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <header className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-bold text-gray-500/80 leading-tight">
            Admin Dashboard <br /> Queue
          </h1>
        </header>

        {/* Queue Rows */}
        <div className="space-y-12">
          {QUEUE_ORDERS.map((order) => (
            <section key={order.id} className="relative">
              
              {/* Top Bar: Order Number and Name */}
              <div className="flex items-center gap-8 mb-4 px-2">
                <div className="bg-[#D9C5B2] px-6 py-2 rounded-full border border-gray-400/30 shadow-sm">
                  <span className="font-bold text-gray-700 text-sm whitespace-nowrap">
                    {order.id}
                  </span>
                </div>
                <h2 className="text-4xl font-bold text-gray-700">
                  {order.customer}
                </h2>
              </div>

              {/* Items Container (Horizontal Scrollable) */}
              <div className="bg-white border-2 border-[#D98C5F]/40 rounded-[2.5rem] p-6 shadow-sm overflow-x-auto">
                <div className="flex gap-6 min-w-max">
                  {[...Array(order.itemsCount)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-36 bg-white border border-[#D98C5F]/30 rounded-[1.5rem] p-3 flex flex-col items-center gap-2"
                    >
                      {/* Image Placeholder Box */}
                      <div className="w-full aspect-square bg-white border border-gray-300 rounded-lg relative overflow-hidden">
                         {/* Wireframe X design */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                          <div className="absolute w-full h-[1px] bg-black rotate-45"></div>
                          <div className="absolute w-full h-[1px] bg-black -rotate-45"></div>
                        </div>
                      </div>

                      {/* Text placeholders */}
                      <div className="text-center space-y-1">
                        <p className="text-[10px] font-bold text-gray-500">XXx Orders</p>
                        <div className="border border-gray-400 rounded-full px-4 py-0.5">
                          <p className="text-[9px] font-bold text-gray-600 uppercase">Name</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>

      </div>
    </main>
  )
}