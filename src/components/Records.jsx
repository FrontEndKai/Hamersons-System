import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CalendarDays, Plus, Trash2 } from 'lucide-react'
import { groupByMonth, groupByYear } from '../utils/calculationUtils'
import { money } from '../utils/currencyUtils'
import { formatDate, getNow, getYearFromDate } from '../utils/dateUtils'
import { Table } from './Ledger'

export default function Records({ transactions, names, onNew, onEdit, onDelete, onDeleteAll }) {
  const years = Array.from(new Set([getNow().getFullYear(), ...transactions.map(transaction => getYearFromDate(transaction.date))])).sort((a, b) => b - a)
  const [selectedYear, setSelectedYear] = useState(String(years[0]))
  const [selectedDate, setSelectedDate] = useState('')
  const dates = useMemo(() => {
    const counts = transactions.filter(transaction => String(getYearFromDate(transaction.date)) === selectedYear).reduce((result, transaction) => {
      result[transaction.date] = (result[transaction.date] || 0) + 1
      return result
    }, {})
    return Object.entries(counts).sort(([left], [right]) => right.localeCompare(left))
  }, [transactions, selectedYear])
  const visible = selectedDate ? transactions.filter(transaction => transaction.date === selectedDate) : transactions.filter(transaction => String(getYearFromDate(transaction.date)) === selectedYear)
  const months = groupByMonth(visible).map(row => ({ name: row.label, income: row.income, expenses: row.expenses, net: row.net }))
  const yearlyTotals = groupByYear(visible)
  const incomeTotal = visible.filter(row => row.type === 'income').reduce((sum, row) => sum + row.amount, 0)
  const expenseTotal = visible.filter(row => row.type === 'expense').reduce((sum, row) => sum + row.amount, 0)

  return <>
    <div className="page-intro"><div><div className="eyebrow">Permanent ledger history</div><h2>Records</h2><p>All user-entered and imported transactions, organized automatically by month and year.</p></div><div className="button-row"><button className="button primary" onClick={() => onNew()}><Plus size={15} /> Add transaction</button>{onDeleteAll && transactions.length > 0 && <button className="button ghost danger-text" onClick={onDeleteAll}><Trash2 size={15} /> Delete all</button>}</div></div>
    <section className="records-date-picker card"><strong>Track records</strong><label><CalendarDays size={16} /> Year<select value={selectedYear} onChange={event => { setSelectedYear(event.target.value); setSelectedDate('') }}>{years.map(year => <option key={year} value={year}>{year}</option>)}</select></label><label>Date<select value={selectedDate} onChange={event => setSelectedDate(event.target.value)}><option value="">All dates in {selectedYear}</option>{dates.map(([date, count]) => <option key={date} value={date}>{formatDate(date)} ({count})</option>)}</select></label></section>
    <div className="stat-grid"><div className="stat card neutral"><div><span>Visible transactions</span><strong>{visible.length}</strong></div></div><div className="stat card income"><div><span>Visible income</span><strong>{money(incomeTotal)}</strong></div></div><div className="stat card expense"><div><span>Visible expenses</span><strong>{money(expenseTotal)}</strong></div></div><div className="stat card neutral"><div><span>Years with records</span><strong>{years.length}</strong></div></div></div>
    <div className="chart-grid"><section className="card chart-card wide"><h3>Monthly record history</h3><p>Income, expenses, and net result by month</p>{months.length ? <ResponsiveContainer width="100%" height={270}><LineChart data={months}><CartesianGrid strokeDasharray="3 3" stroke="#dfe7e5" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip formatter={value => money(value)} /><Legend /><Line dataKey="income" stroke="#4b5157" strokeWidth={3} dot={false} /><Line dataKey="expenses" stroke="#858b91" strokeWidth={3} dot={false} /><Line dataKey="net" stroke="#17191b" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer> : <div className="empty"><strong>No saved records yet</strong><span>Enter an expense or income transaction to begin history.</span></div>}</section><section className="card chart-card"><h3>Yearly totals</h3><p>Long-term financial record</p>{yearlyTotals.length ? <ResponsiveContainer width="100%" height={270}><BarChart data={yearlyTotals}><CartesianGrid strokeDasharray="3 3" stroke="#dfe7e5" /><XAxis dataKey="year" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip formatter={value => money(value)} /><Legend /><Bar dataKey="income" fill="#4b5157" /><Bar dataKey="expenses" fill="#a4a9ad" /></BarChart></ResponsiveContainer> : <div className="empty"><strong>No yearly records yet</strong></div>}</section></div>
    <section className="card table-card"><div className="card-head"><div><h3>{selectedDate ? formatDate(selectedDate) : `${selectedYear} records`}</h3><p>Sorted newest first through the shared ledger.</p></div></div><Table rows={[...visible].sort((a, b) => b.date.localeCompare(a.date))} names={names} onEdit={onEdit} onDelete={onDelete} /></section>
  </>
}
