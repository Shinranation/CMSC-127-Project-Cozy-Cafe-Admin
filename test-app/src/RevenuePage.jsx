import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase, supabaseConfigured } from './lib/supabaseClient.js'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function safeNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function formatCurrency(value) {
  return `₱${safeNumber(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function getMonthIndex(dateValue) {
  const date = new Date(dateValue)
  return Number.isNaN(date.getTime()) ? -1 : date.getMonth()
}

function getWeekIndex(dateValue) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 0
  return Math.min(4, Math.floor((date.getDate() - 1) / 7))
}

function currentYearRange(year) {
  return {
    start: `${year}-01-01T00:00:00.000Z`,
    end: `${year + 1}-01-01T00:00:00.000Z`,
  }
}

function emptyMonthRows() {
  return MONTHS.map((month) => ({
    month,
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0,
    weeklyRevenue: [0, 0, 0, 0, 0],
    weeklyExpenses: [0, 0, 0, 0, 0],
    orderCount: 0,
    expenseCount: 0,
  }))
}

export default function AdminDashboardCosts() {
  const configured = supabaseConfigured()
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = MONTHS[currentDate.getMonth()] ?? MONTHS[0]

  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [year, setYear] = useState(currentYear)
  const [monthlyData, setMonthlyData] = useState(emptyMonthRows)
  const [loading, setLoading] = useState(configured)
  const [fetchError, setFetchError] = useState(null)

  const fetchFinancialData = useCallback(async () => {
    if (!supabase) return

    setLoading(true)
    setFetchError(null)

    const { start, end } = currentYearRange(year)

    const [ordersResult, expensesResult] = await Promise.all([
      supabase
        .from('orders')
        .select('created_at,total_amount')
        .gte('created_at', start)
        .lt('created_at', end),
      supabase
        .from('expenses')
        .select('expense_date,amount')
        .gte('expense_date', start)
        .lt('expense_date', end),
    ])

    if (ordersResult.error || expensesResult.error) {
      setFetchError(
        ordersResult.error?.message ||
          expensesResult.error?.message ||
          'Could not load revenue data.',
      )
      setMonthlyData(emptyMonthRows())
      setLoading(false)
      return
    }

    const nextRows = emptyMonthRows()

    for (const order of ordersResult.data ?? []) {
      const monthIndex = getMonthIndex(order.created_at)
      if (monthIndex < 0) continue

      const amount = safeNumber(order.total_amount)
      const weekIndex = getWeekIndex(order.created_at)

      nextRows[monthIndex].totalRevenue += amount
      nextRows[monthIndex].weeklyRevenue[weekIndex] += amount
      nextRows[monthIndex].orderCount += 1
    }

    for (const expense of expensesResult.data ?? []) {
      const monthIndex = getMonthIndex(expense.expense_date)
      if (monthIndex < 0) continue

      const expenseAmount = safeNumber(expense.amount)
      if (expenseAmount <= 0) continue

      const weekIndex = getWeekIndex(expense.expense_date)

      nextRows[monthIndex].totalExpenses += expenseAmount
      nextRows[monthIndex].weeklyExpenses[weekIndex] += expenseAmount
      nextRows[monthIndex].expenseCount += 1
    }

    setMonthlyData(
      nextRows.map((row) => ({
        ...row,
        netIncome: row.totalRevenue - row.totalExpenses,
      })),
    )
    setLoading(false)
  }, [year])

  useEffect(() => {
    if (!configured || !supabase) return
    const timeoutId = window.setTimeout(() => {
      void fetchFinancialData()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [configured, fetchFinancialData])

  const computedData = useMemo(() => monthlyData, [monthlyData])

  const currentMonthData =
    computedData.find((item) => item.month === selectedMonth) || computedData[0]

  const maxRevenue = Math.max(1, ...computedData.map((item) => item.totalRevenue))
  const maxCost = Math.max(1, ...computedData.map((item) => item.totalExpenses))
  const maxNet = Math.max(1, ...computedData.map((item) => Math.abs(item.netIncome)))
  const maxWeeklyRevenue = Math.max(1, ...currentMonthData.weeklyRevenue)

  return (
    <main className="min-h-screen bg-[#FDFBF4] py-10 px-4 font-sans text-gray-700">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl font-bold text-gray-500/80 leading-tight">
            Admin Dashboard <br /> Costs
          </h1>
        </header>

        {!configured && (
          <p className="text-center text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
            Missing Supabase URL/key. Set your Vite Supabase env values, then restart the dev server.
          </p>
        )}

        {fetchError && configured && (
          <div className="text-center text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
            <p>{fetchError}</p>
            <button
              type="button"
              onClick={fetchFinancialData}
              className="mt-2 text-xs font-bold underline text-[#D98C5F]"
            >
              Retry
            </button>
          </div>
        )}

        <section className="bg-white border-2 border-[#D98C5F]/40 rounded-[2.5rem] p-8 mb-8 shadow-sm">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Supabase totals
              </p>
              <h2 className="text-2xl font-bold text-gray-700">{year} Monthly Overview</h2>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(safeNumber(e.target.value, currentYear))}
                className="w-28 rounded-xl border border-[#D98C5F]/30 px-3 py-2 text-sm font-semibold outline-none"
                aria-label="Revenue year"
              />
              <button
                type="button"
                onClick={fetchFinancialData}
                disabled={!configured || loading}
                className="rounded-xl bg-[#D98C5F] px-4 py-2 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {computedData.map((data) => {
              const revenueHeight = (data.totalRevenue / maxRevenue) * 130
              const costHeight = (data.totalExpenses / maxCost) * 130
              const netHeight = (Math.abs(data.netIncome) / maxNet) * 130
              const netColor = data.netIncome >= 0 ? 'bg-orange-400' : 'bg-red-700'

              return (
                <button
                  type="button"
                  key={data.month}
                  onClick={() => setSelectedMonth(data.month)}
                  className={`
                    cursor-pointer
                    rounded-3xl
                    p-4
                    transition-all
                    border-2
                    text-left
                    ${
                      selectedMonth === data.month
                        ? 'border-[#D98C5F] bg-[#FFF7F1]'
                        : 'border-[#D98C5F]/20 bg-white hover:bg-[#FFF7F1]/60'
                    }
                  `}
                >
                  <h3 className="text-center font-bold mb-6">{data.month}</h3>

                  <div className="flex items-end justify-center gap-2 h-40 mb-6 border-b border-gray-200 pb-2">
                    <div className="flex flex-col items-center">
                      <div
                        style={{ height: `${costHeight}px` }}
                        className="w-5 bg-red-500 rounded-t-md"
                      />
                      <span className="text-[10px] mt-1">Cost</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div
                        style={{ height: `${revenueHeight}px` }}
                        className="w-5 bg-green-600 rounded-t-md"
                      />
                      <span className="text-[10px] mt-1">Revenue</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div
                        style={{ height: `${netHeight}px` }}
                        className={`w-5 ${netColor} rounded-t-md`}
                      />
                      <span className="text-[10px] mt-1">Net</span>
                    </div>
                  </div>

                  <div className="border border-[#D98C5F]/30 rounded-2xl p-3 text-xs space-y-2">
                    <div className="flex justify-between gap-3">
                      <span>Total Cost</span>
                      <span>{formatCurrency(data.totalExpenses)}</span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span>Revenue</span>
                      <span>{formatCurrency(data.totalRevenue)}</span>
                    </div>

                    <div className="flex justify-between gap-3 font-semibold">
                      <span>Net Income</span>
                      <span>{formatCurrency(data.netIncome)}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <section className="bg-white border-2 border-[#D98C5F]/40 rounded-[2.5rem] p-10 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-4xl font-bold">{selectedMonth}</h2>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
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

          <div className="space-y-10">
            <div>
              <h3 className="text-2xl font-semibold mb-5">Weekly Revenue</h3>

              <div className="space-y-4">
                {currentMonthData.weeklyRevenue.map((revenue, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="w-28 font-medium">Week {index + 1}</span>
                    <div className="h-10 flex-1 overflow-hidden rounded-2xl border border-[#D98C5F]/30 bg-[#FDFBF4]">
                      <div
                        className="h-full rounded-2xl bg-green-600 transition-all"
                        style={{ width: `${Math.max(3, (revenue / maxWeeklyRevenue) * 100)}%` }}
                      />
                    </div>
                    <span className="w-32 text-right font-bold text-green-700">
                      {formatCurrency(revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[#D98C5F]/30 p-5">
                <p className="text-sm font-bold uppercase tracking-widest text-gray-400">
                  Orders
                </p>
                <p className="mt-2 text-4xl font-bold">{currentMonthData.orderCount}</p>
              </div>

              <div className="rounded-2xl border border-[#D98C5F]/30 p-5">
                <p className="text-sm font-bold uppercase tracking-widest text-gray-400">
                  Expense Rows
                </p>
                <p className="mt-2 text-4xl font-bold">
                  {currentMonthData.expenseCount}
                </p>
              </div>
            </div>

            <div className="mt-10 border-t border-[#D98C5F]/20 pt-8 space-y-5 text-2xl">
              <div className="flex justify-between gap-4">
                <span>Total Revenue</span>

                <span className="font-bold text-green-700">
                  {formatCurrency(currentMonthData.totalRevenue)}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span>Total Cost</span>

                <span className="font-bold text-red-500">
                  {formatCurrency(currentMonthData.totalExpenses)}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span>Net Income</span>

                <span
                  className={`font-bold ${
                    currentMonthData.netIncome >= 0 ? 'text-orange-500' : 'text-red-700'
                  }`}
                >
                  {formatCurrency(currentMonthData.netIncome)}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
