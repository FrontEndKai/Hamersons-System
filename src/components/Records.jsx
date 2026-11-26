import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { CalendarDays, Maximize2, Plus, Trash2, X } from 'lucide-react'
import { groupByMonth, groupByYear } from '../utils/calculationUtils'
import { money } from '../utils/currencyUtils'
import { formatDate, getNow, getYearFromDate } from '../utils/dateUtils'
import { Table } from './Ledger'

const monthColors = ['#177e89', '#e07a5f', '#6b8e4e', '#8e6caa', '#d2a23a', '#3976a8', '#c45d85', '#4b9278', '#b65e3c', '#6576b8', '#8a8f3a', '#3c929b']
const categoryColors = ['#177e89', '#e07a5f', '#6b8e4e', '#8e6caa', '#d2a23a', '#3976a8', '#c45d85', '#4b9278', '#b65e3c', '#6576b8', '#8a8f3a', '#3c929b']

export default function Records({ transactions, names, onNew, onEdit, onDelete, onDeleteAll }) {
  const years = Array.from(new Set([getNow().getFullYear(), ...transactions.map(transaction => getYearFromDate(transaction.date))])).sort((a, b) => b - a)
  const [selectedYear, setSelectedYear] = useState(String(years[0]))
  const [selectedDate, setSelectedDate] = useState('')
  const [focusedChart, setFocusedChart] = useState(null)
  const dates = useMemo(() => {
    const counts = transactions.filter(transaction => String(getYearFromDate(transaction.date)) === selectedYear).reduce((result, transaction) => {
      result[transaction.date] = (result[transaction.date] || 0) + 1
      return result
    }, {})
    return Object.entries(counts).sort(([left], [right]) => right.localeCompare(left))
  }, [transactions, selectedYear])
  const visible = selectedDate ? transactions.filter(transaction => transaction.date === selectedDate) : transactions.filter(transaction => String(getYearFromDate(transaction.date)) === selectedYear)
  const months = groupByMonth(visible)
  const yearlyTotals = groupByYear(visible)
  const incomeTotal = visible.filter(row => row.type === 'income').reduce((sum, row) => sum + row.amount, 0)
  const expenseTotal = visible.filter(row => row.type === 'expense').reduce((sum, row) => sum + row.amount, 0)
  const expenseCategories = Object.values(visible.filter(row => row.type === 'expense').reduce((groups, transaction) => {
    const categoryId = transaction.categoryId || 'uncategorized'
    const categoryName = names.cat[categoryId] || 'Uncategorized'
    if (!groups[categoryId]) groups[categoryId] = { name: categoryName, value: 0 }
    groups[categoryId].value += transaction.amount || 0
    return groups
  }, {})).sort((a, b) => b.value - a.value)
  const categoryExpenseTotal = expenseCategories.reduce((total, category) => total + category.value, 0)
  const chartTitles = { monthly: 'Monthly record history', yearly: 'Yearly totals', categories: 'Expenses by category' }
  const closeOnEscape = event => { if (event.key === 'Escape') setFocusedChart(null) }
  useEffect(() => {
    if (!focusedChart) return
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [focusedChart])

  const monthlyChart = height => months.length ? <ResponsiveContainer width="100%" height={height}><BarChart data={months} margin={{ top: 8, right: 12, left: 8, bottom: 8 }}><CartesianGrid strokeDasharray="3 3" stroke="#dfe7e5" /><XAxis dataKey="label" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip labelFormatter={label => label} formatter={value => money(value)} /><Legend /><Bar dataKey="income" name="Income" fill="#177e89" radius={[4, 4, 0, 0]}>{months.map(row => <Cell key={`income-${row.key}`} fill={monthColors[(row.month - 1) % monthColors.length]} />)}</Bar><Bar dataKey="expenses" name="Expenses" fill="#d36b4f" radius={[4, 4, 0, 0]}>{months.map(row => <Cell key={`expenses-${row.key}`} fill={monthColors[(row.month + 5) % monthColors.length]} />)}</Bar></BarChart></ResponsiveContainer> : <div className="empty"><strong>No saved records yet</strong><span>Enter an expense or income transaction to begin history.</span></div>
  const yearlyChart = height => yearlyTotals.length ? <ResponsiveContainer width="100%" height={height}><BarChart data={yearlyTotals}><CartesianGrid strokeDasharray="3 3" stroke="#dfe7e5" /><XAxis dataKey="year" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip formatter={value => money(value)} /><Legend /><Bar dataKey="income" fill="#177e89" /><Bar dataKey="expenses" fill="#d36b4f" /></BarChart></ResponsiveContainer> : <div className="empty"><strong>No yearly records yet</strong></div>
  const expensePie = height => categoryExpenseTotal > 0 ? <ResponsiveContainer width="100%" height={height}><PieChart><Pie data={expenseCategories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="82%" paddingAngle={2}>{expenseCategories.map((entry, index) => <Cell key={entry.name} fill={categoryColors[index % categoryColors.length]} />)}</Pie><Tooltip formatter={value => money(value)} /></PieChart></ResponsiveContainer> : <div className="empty"><strong>No expense categories in these records</strong></div>
  const openChart = chart => setFocusedChart(chart)
  const chartCardProps = chart => ({ role: 'group', tabIndex: 0, 'aria-label': `${chartTitles[chart]} chart`, onClick: () => openChart(chart), onKeyDown: event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openChart(chart) } } })

  return <>
    <div className="page-intro"><div><div className="eyebrow">Permanent ledger history</div><h2>Records</h2><p>All user-entered and imported transactions, organized automatically by month and year.</p></div><div className="button-row"><button className="button primary" onClick={() => onNew()}><Plus size={15} /> Add transaction</button>{onDeleteAll && transactions.length > 0 && <button className="button ghost danger-text" onClick={onDeleteAll}><Trash2 size={15} /> Delete all</button>}</div></div>
    <section className="records-date-picker card"><strong>Track records</strong><label><CalendarDays size={16} /> Year<select value={selectedYear} onChange={event => { setSelectedYear(event.target.value); setSelectedDate('') }}>{years.map(year => <option key={year} value={year}>{year}</option>)}</select></label><label>Date<select value={selectedDate} onChange={event => setSelectedDate(event.target.value)}><option value="">All dates in {selectedYear}</option>{dates.map(([date, count]) => <option key={date} value={date}>{formatDate(date)} ({count})</option>)}</select></label></section>
    <div className="stat-grid"><div className="stat card neutral"><div><span>Visible transactions</span><strong>{visible.length}</strong></div></div><div className="stat card income"><div><span>Visible income</span><strong>{money(incomeTotal)}</strong></div></div><div className="stat card expense"><div><span>Visible expenses</span><strong>{money(expenseTotal)}</strong></div></div><div className="stat card neutral"><div><span>Years with records</span><strong>{years.length}</strong></div></div></div>
    <div className="chart-grid">
      <section className="card chart-card wide records-chart-card" {...chartCardProps('monthly')}>
        <button className="icon-button records-chart-expand" aria-label="Expand monthly record history" onClick={event => { event.stopPropagation(); openChart('monthly') }}><Maximize2 size={16} /></button>
        <h3>Monthly record history</h3><p>Income and expenses by month</p>{monthlyChart(300)}
      </section>
      <section className="card chart-card records-chart-card" {...chartCardProps('yearly')}>
        <button className="icon-button records-chart-expand" aria-label="Expand yearly totals" onClick={event => { event.stopPropagation(); openChart('yearly') }}><Maximize2 size={16} /></button>
        <h3>Yearly totals</h3><p>Long-term financial record</p>{yearlyChart(300)}
      </section>
      <section className="card chart-card records-chart-card records-category-card" {...chartCardProps('categories')}>
        <button className="icon-button records-chart-expand" aria-label="Expand expenses by category" onClick={event => { event.stopPropagation(); openChart('categories') }}><Maximize2 size={16} /></button>
        <h3>Expenses by category</h3><p>Share of expenses for the selected records</p>
        <div className="records-pie-layout">
          <div className="records-pie-chart">{expensePie(300)}</div>
          {categoryExpenseTotal > 0 && <div className="records-category-breakdown">{expenseCategories.map((category, index) => {
            const share = (category.value / categoryExpenseTotal) * 100
            const color = categoryColors[index % categoryColors.length]
            return <div className="records-category-row" key={category.name}>
              <div className="records-category-row-head"><span><i style={{ backgroundColor: color }} />{category.name}</span><strong>{money(category.value)}</strong></div>
              <div className="records-category-meter"><i style={{ width: `${share}%`, backgroundColor: color }} /></div>
              <small>{share.toFixed(1)}% of expenses</small>
            </div>
          })}</div>}
        </div>
      </section>
    </div>
    <section className="card table-card"><div className="card-head"><div><h3>{selectedDate ? formatDate(selectedDate) : `${selectedYear} records`}</h3><p>Sorted newest first through the shared ledger.</p></div></div><Table rows={[...visible].sort((a, b) => b.date.localeCompare(a.date))} names={names} onEdit={onEdit} onDelete={onDelete} /></section>
    {focusedChart && <div className="records-chart-backdrop" onClick={() => setFocusedChart(null)}><section className="records-chart-dialog" role="dialog" aria-modal="true" aria-labelledby="records-chart-dialog-title" onClick={event => event.stopPropagation()}><header><h2 id="records-chart-dialog-title">{chartTitles[focusedChart]}</h2><button className="icon-button" aria-label="Close expanded chart" onClick={() => setFocusedChart(null)}><X size={18} /></button></header>{focusedChart === 'monthly' && monthlyChart(480)}{focusedChart === 'yearly' && yearlyChart(480)}{focusedChart === 'categories' && <div className="records-pie-layout records-pie-expanded"><div className="records-pie-chart">{expensePie(460)}</div>{categoryExpenseTotal > 0 && <div className="records-category-breakdown">{expenseCategories.map((category, index) => { const share = (category.value / categoryExpenseTotal) * 100; const color = categoryColors[index % categoryColors.length]; return <div className="records-category-row" key={category.name}><div className="records-category-row-head"><span><i style={{ backgroundColor: color }} />{category.name}</span><strong>{money(category.value)}</strong></div><div className="records-category-meter"><i style={{ width: `${share}%`, backgroundColor: color }} /></div><small>{share.toFixed(1)}% of expenses</small></div> })}</div>}</div>}</section></div>}
  </>
}
