import { useState } from 'react'
import { BarChart3, CircleDollarSign, Plus, Receipt, Wallet } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { calculateStats, calculateTotals, filterTransactions, groupByCategory, groupByDepartment, groupByPaymentMethod } from '../utils/calculationUtils'
import { getCurrentMonth, getCurrentYear, getMonthName } from '../utils/dateUtils'
import { money } from '../utils/currencyUtils'
import { Empty, Stat } from './Dashboard'
import { Table } from './Ledger'

export default function MonthlyRecords({ transactions, categories, methods, departments, names, onNew, onEdit, onDelete }) {
  const [month, setMonth] = useState(getCurrentMonth())
  const [year, setYear] = useState(getCurrentYear())
  const filtered = filterTransactions(transactions, { month, year })
  const expenses = filtered.filter(transaction => transaction.type === 'expense')
  const totals = calculateTotals(filtered)
  const stats = calculateStats(expenses)
  const categoryRows = groupByCategory(expenses, categories)
  const departmentRows = groupByDepartment(expenses, departments)
  const paymentRows = groupByPaymentMethod(expenses, methods)
  const years = Array.from(new Set([getCurrentYear(), ...transactions.map(transaction => Number(transaction.date.slice(0, 4)))] )).sort((a, b) => b - a)
  const chartData = categoryRows.map(row => ({ name: row.categoryName, amount: row.total }))
  const monthlyRows = [...filtered].sort((a, b) => b.date.localeCompare(a.date))
  const selectedDate = `${year}-${String(month).padStart(2, '0')}-01`
  return <>
    <div className="page-intro"><div><div className="eyebrow">Automatic monthly record</div><h2>{getMonthName(month)} {year}</h2><p>Calculated directly from saved user transactions.</p></div><div className="button-row"><div className="monthly-picker"><select value={month} onChange={event => setMonth(Number(event.target.value))}>{Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{getMonthName(index + 1)}</option>)}</select><select value={year} onChange={event => setYear(Number(event.target.value))}>{years.map(value => <option key={value} value={value}>{value}</option>)}</select></div><button className="button primary" onClick={() => onNew(selectedDate)}><Plus size={15} /> Add transaction</button></div></div>
    <div className="stat-grid"><Stat label="Monthly income" value={money(totals.totalIncome)} tone="income" icon={CircleDollarSign} /><Stat label="Monthly expenses" value={money(totals.totalExpenses)} tone="expense" icon={Wallet} /><Stat label="Net income" value={money(totals.netIncome)} tone={totals.netIncome >= 0 ? 'income' : 'expense'} icon={BarChart3} /><Stat label="Expense transactions" value={stats.count} tone="neutral" icon={Receipt} /></div>
    <div className="report-grid"><section className="card income-statement"><h3>Automatic income statement</h3><div className="report-row"><span>Total revenue</span><strong className="positive">{money(totals.totalIncome)}</strong></div><div className="report-row"><span>Total expenses</span><strong className="negative">{money(totals.totalExpenses)}</strong></div><div className="report-row"><span>Average expense</span><strong>{money(stats.average)}</strong></div><div className="report-row total"><span>Net income / (loss)</span><strong>{money(totals.netIncome)}</strong></div></section><section className="card chart-card"><h3>Expenses by category</h3>{chartData.length ? <ResponsiveContainer width="100%" height={260}><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#dfe7e5" /><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip formatter={value => money(value)} /><Bar dataKey="amount" fill="#666d73" /></BarChart></ResponsiveContainer> : <Empty />}</section></div>
    <div className="monthly-breakdown"><Breakdown title="By category" rows={categoryRows.map(row => ({ name: row.categoryName, amount: row.total, count: row.count }))} /><Breakdown title="By department" rows={departmentRows.map(row => ({ name: row.departmentName, amount: row.total, count: row.count }))} /><Breakdown title="By payment method" rows={paymentRows.map(row => ({ name: row.paymentMethodName, amount: row.total, count: row.count }))} /></div>
    <section className="card table-card monthly-table"><div className="card-head"><div><h3>{getMonthName(month)} records</h3><p>Edit or delete a record if it was entered incorrectly.</p></div></div><Table rows={monthlyRows} names={names} onEdit={onEdit} onDelete={onDelete} /></section>
  </>
}

function Breakdown({ title, rows }) { return <section className="card breakdown"><h3>{title}</h3>{rows.length ? <table><thead><tr><th>Name</th><th>Transactions</th><th className="align-right">Total</th></tr></thead><tbody>{rows.map(row => <tr key={row.name}><td>{row.name}</td><td>{row.count}</td><td className="align-right amount">{money(row.amount)}</td></tr>)}</tbody></table> : <p className="empty-copy">No records in this period.</p>}</section> }
