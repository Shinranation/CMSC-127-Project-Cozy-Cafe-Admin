import { useState } from 'react'

const MONTHS = ['January', 'February', 'March', 'April', 'May']

export default function AdminDashboardCosts() {
  const [selectedMonth, setSelectedMonth] = useState('April')

  // Static data for the bars
  const chartData = [
    { label: 'Expenses', color: 'bg-red-500', height: 'h-24' },
    { label: 'Revenue', color: 'bg-green-600', height: 'h-32' },
    { label: 'Profit', color: 'bg-orange-400', height: 'h-16' },
  ]

  return (
    <main className="min-h-screen bg-[#FDFBF4] py-10 px-4 font-sans text-gray-700">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <header className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl font-bold text-gray-500/80 leading-tight">
            Admin Dashboard <br /> Costs
          </h1>
        </header>

        {/* Top Section: Chart and Small Cards */}
        <section className="bg-white border-2 border-[#D98C5F]/40 rounded-[2.5rem] p-8 mb-8 shadow-sm">
          {/* Month Columns */}
          <div className="grid grid-cols-5 gap-4 mb-10 overflow-x-auto">
            {MONTHS.map((month) => (
              <div key={month} className="text-center min-w-[120px]">
                <h4 className="font-bold text-sm mb-4">{month}</h4>
                
                {/* Mock Bar Chart */}
                <div className="flex items-end justify-center gap-1 h-36 mb-4 border-b border-gray-200 pb-1">
                  {chartData.map((bar) => (
                    <div 
                      key={bar.label} 
                      className={`${bar.color} ${bar.height} w-3 rounded-t-sm`} 
                    />
                  ))}
                </div>
                
                {/* Mini Data Card */}
                <div className="border border-[#D98C5F]/30 rounded-2xl p-3 text-[9px] space-y-1 text-left leading-tight">
                    <p>Revenue: __________</p>
                    <p>Gross Income: __________</p>
                    <p className="pt-2">Total Expenses: __________</p>
                    <p>Net Income: __________</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Section: Specific Month Details */}
        <section className="bg-white border-2 border-[#D98C5F]/40 rounded-[2.5rem] p-10 shadow-sm">
          <h2 className="text-4xl font-bold mb-6">{selectedMonth}</h2>
          <div className="w-full h-[2px] bg-[#D98C5F]/30 mb-8" />
          
          <div className="space-y-10 text-3xl md:text-4xl font-medium text-gray-800">
            <div className="flex items-center gap-4">
              <span>Revenue:</span>
              <span className="text-gray-300">____________________</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span>Total Expenses:</span>
              <span className="text-gray-300">____________________</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span>Net Income:</span>
              <span className="text-gray-300">____________________</span>
            </div>
          </div>
        </section>

      </div>
    </main>
  )
}