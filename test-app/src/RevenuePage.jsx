import { useMemo, useState } from 'react'

const MONTHS = ['January', 'February', 'March', 'April', 'May']

export default function AdminDashboardCosts() {
  const [selectedMonth, setSelectedMonth] = useState('April')

  // MANUAL INPUT DATA
  const [monthlyData, setMonthlyData] = useState({
    January: {
      initialCost: 5000,
      weeklyProfits: [2000, 2500, 1800, 2200],
    },
    February: {
      initialCost: 7000,
      weeklyProfits: [3000, 3200, 2800, 3500],
    },
    March: {
      initialCost: 6000,
      weeklyProfits: [2500, 2400, 2600, 3000],
    },
    April: {
      initialCost: 8000,
      weeklyProfits: [4000, 4200, 3800, 4500],
    },
    May: {
      initialCost: 6500,
      weeklyProfits: [2800, 2900, 3000, 3100],
    },
  })

  // HANDLE INITIAL COST CHANGE
  const handleInitialCostChange = (month, value) => {
    setMonthlyData((prev) => ({
      ...prev,
      [month]: {
        ...prev[month],
        initialCost: Number(value),
      },
    }))
  }

  // HANDLE WEEKLY PROFIT CHANGE
  const handleWeeklyProfitChange = (
    month,
    weekIndex,
    value
  ) => {
    const updatedProfits = [
      ...monthlyData[month].weeklyProfits,
    ]

    updatedProfits[weekIndex] = Number(value)

    setMonthlyData((prev) => ({
      ...prev,
      [month]: {
        ...prev[month],
        weeklyProfits: updatedProfits,
      },
    }))
  }

  // COMPUTED VALUES
  const computedData = useMemo(() => {
    return MONTHS.map((month) => {
      const initialCost =
        monthlyData[month].initialCost

      const totalRevenue =
        monthlyData[month].weeklyProfits.reduce(
          (sum, value) => sum + value,
          0
        )

      const netIncome =
        totalRevenue - initialCost

      return {
        month,
        initialCost,
        totalRevenue,
        netIncome,
      }
    })
  }, [monthlyData])

  const currentMonthData =
    computedData.find(
      (item) => item.month === selectedMonth
    ) || computedData[0]

  // BAR LOGIC
  const maxRevenue = Math.max(
    ...computedData.map((item) => item.totalRevenue)
  )

  const maxCost = Math.max(
    ...computedData.map((item) => item.initialCost)
  )

  const maxNet = Math.max(
    ...computedData.map((item) => item.netIncome)
  )

  return (
    <main className="min-h-screen bg-[#FDFBF4] py-10 px-4 font-sans text-gray-700">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <header className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl font-bold text-gray-500/80 leading-tight">
            Admin Dashboard <br /> Costs
          </h1>
        </header>

        {/* TOP SECTION */}
        <section className="bg-white border-2 border-[#D98C5F]/40 rounded-[2.5rem] p-8 mb-8 shadow-sm">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">

            {computedData.map((data) => {
              const revenueHeight =
                (data.totalRevenue / maxRevenue) * 130

              const costHeight =
                (data.initialCost / maxCost) * 130

              const netHeight =
                (data.netIncome / maxNet) * 130

              return (
                <div
                  key={data.month}
                  onClick={() =>
                    setSelectedMonth(data.month)
                  }
                  className={`
                    cursor-pointer
                    rounded-3xl
                    p-4
                    transition-all
                    border-2
                    ${
                      selectedMonth === data.month
                        ? 'border-[#D98C5F] bg-[#FFF7F1]'
                        : 'border-[#D98C5F]/20'
                    }
                  `}
                >
                  <h3 className="text-center font-bold mb-6">
                    {data.month}
                  </h3>

                  {/* BAR CHART */}
                  <div className="flex items-end justify-center gap-2 h-40 mb-6 border-b border-gray-200 pb-2">

                    {/* COST */}
                    <div className="flex flex-col items-center">
                      <div
                        style={{
                          height: `${costHeight}px`,
                        }}
                        className="w-5 bg-red-500 rounded-t-md"
                      />
                      <span className="text-[10px] mt-1">
                        Cost
                      </span>
                    </div>

                    {/* REVENUE */}
                    <div className="flex flex-col items-center">
                      <div
                        style={{
                          height: `${revenueHeight}px`,
                        }}
                        className="w-5 bg-green-600 rounded-t-md"
                      />
                      <span className="text-[10px] mt-1">
                        Revenue
                      </span>
                    </div>

                    {/* NET */}
                    <div className="flex flex-col items-center">
                      <div
                        style={{
                          height: `${netHeight}px`,
                        }}
                        className="w-5 bg-orange-400 rounded-t-md"
                      />
                      <span className="text-[10px] mt-1">
                        Net
                      </span>
                    </div>
                  </div>

                  {/* MINI DETAILS */}
                  <div className="border border-[#D98C5F]/30 rounded-2xl p-3 text-xs space-y-2">

                    <div className="flex justify-between">
                      <span>Initial Cost</span>
                      <span>
                        ₱
                        {data.initialCost.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Revenue</span>
                      <span>
                        ₱
                        {data.totalRevenue.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between font-semibold">
                      <span>Net Income</span>
                      <span>
                        ₱
                        {data.netIncome.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* DETAILS SECTION */}
        <section className="bg-white border-2 border-[#D98C5F]/40 rounded-[2.5rem] p-10 shadow-sm">

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-4xl font-bold">
              {selectedMonth}
            </h2>

            <select
              value={selectedMonth}
              onChange={(e) =>
                setSelectedMonth(e.target.value)
              }
              className="border border-[#D98C5F]/30 rounded-xl px-4 py-2 outline-none"
            >
              {MONTHS.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full h-[2px] bg-[#D98C5F]/30 mb-8" />

          {/* INPUT SECTION */}
          <div className="space-y-10">

            {/* INITIAL COST INPUT */}
            <div>
              <label className="block text-2xl font-semibold mb-3">
                Initial Monthly Cost
              </label>

              <input
                type="number"
                value={
                  monthlyData[selectedMonth]
                    .initialCost
                }
                onChange={(e) =>
                  handleInitialCostChange(
                    selectedMonth,
                    e.target.value
                  )
                }
                className="w-full border border-[#D98C5F]/30 rounded-2xl px-5 py-4 text-xl outline-none"
                placeholder="Enter initial monthly cost"
              />
            </div>

            {/* WEEKLY PROFITS */}
            <div>
              <h3 className="text-2xl font-semibold mb-5">
                Weekly Profits
              </h3>

              <div className="space-y-4">
                {monthlyData[
                  selectedMonth
                ].weeklyProfits.map(
                  (profit, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4"
                    >
                      <span className="w-28 font-medium">
                        Week {index + 1}
                      </span>

                      <input
                        type="number"
                        value={profit}
                        onChange={(e) =>
                          handleWeeklyProfitChange(
                            selectedMonth,
                            index,
                            e.target.value
                          )
                        }
                        className="flex-1 border border-[#D98C5F]/30 rounded-2xl px-5 py-3 outline-none"
                        placeholder={`Profit for Week ${
                          index + 1
                        }`}
                      />
                    </div>
                  )
                )}
              </div>
            </div>

            {/* FINAL SUMMARY */}
            <div className="mt-10 border-t border-[#D98C5F]/20 pt-8 space-y-5 text-2xl">

              <div className="flex justify-between">
                <span>Total Revenue</span>

                <span className="font-bold text-green-700">
                  ₱
                  {currentMonthData.totalRevenue.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Total Cost</span>

                <span className="font-bold text-red-500">
                  ₱
                  {currentMonthData.initialCost.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Net Income</span>

                <span className="font-bold text-orange-500">
                  ₱
                  {currentMonthData.netIncome.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}