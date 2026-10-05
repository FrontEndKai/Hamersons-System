import { useMemo, useState } from 'react'
import { ChevronRight, LockKeyhole, Plus, Receipt, UnlockKeyhole } from 'lucide-react'
import { money } from '../utils/currencyUtils'
import { formatDate } from '../utils/dateUtils'

const colors = ['#f08a3c', '#4a90e2', '#8f5de7', '#e94b7b', '#56b870', '#e1b238', '#45a6a6', '#d36b4c']

export default function ExpenseDashboard({ transactions, categories, onNew, onEdit, onDelete }) {
  const [selectedId, setSelectedId] = useState(null)
  const [sort, setSort] = useState('date')
  const expenses = transactions.filter(item => item.type === 'expense')
  const total = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const cards = useMemo(() => categories.filter(item => item.type === 'expense' && item.isActive).map((category, index) => {
    const rows = expenses.filter(item => String(item.categoryId) === String(category.id))
    const amount = rows.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    return { ...category, rows, amount, share: total ? Math.round(amount / total * 100) : 0, color: category.color || colors[index % colors.length] }
  }), [categories, expenses, total])
  const selected = cards.find(item => String(item.id) === String(selectedId))
  const rows = selected ? [...selected.rows].sort((a, b) => sort === 'amount' ? b.amount - a.amount : b.date.localeCompare(a.date)) : []

  return <>
    <div className="page-intro expense-dashboard-intro"><div><div className="eyebrow">Expense tracker • active month</div><h2>Where the money goes</h2><p>Each category keeps its own transactions, sub-categories, totals, and share of expenses.</p></div><button className="button primary" onClick={onNew}><Plus size={16} /> New expense</button></div>
    <div className="expense-summary"><div><span>Recorded expenses</span><strong>{money(total)}</strong></div><div><span>Categories used</span><strong>{cards.filter(card => card.rows.length).length}</strong></div><div><span>Transactions</span><strong>{expenses.length}</strong></div></div>
    <section className="category-card-grid">{cards.map(card => <button className="category-card" key={card.id} onClick={() => setSelectedId(card.id)}><span className="category-icon" style={{ backgroundColor: `${card.color}20`, color: card.color }}><Receipt size={21} /></span><span className="category-card-name">{card.name}</span><strong>{money(card.amount)}</strong><span className="category-share">{card.share}% of total expenses</span><span className="category-subcategories">Sub-categories: {card.subcategories?.length ? card.subcategories.join(', ') : 'General expenses'}</span><span className="category-card-footer">{card.rows.length} transaction{card.rows.length === 1 ? '' : 's'} <ChevronRight size={15} /></span></button>)}<button className="category-card category-add" onClick={() => window.dispatchEvent(new CustomEvent('hotel:open-masters'))}><Plus size={32} /><span>Add new category</span></button></section>
    {selected && <section className="card category-detail"><div className="card-head"><div><div className="eyebrow">Category detail</div><h3>{selected.name}</h3><p>{selected.rows.length} transaction{selected.rows.length === 1 ? '' : 's'} • {selected.share}% of active expenses</p></div><div className="category-detail-actions"><button className="button secondary" onClick={() => setSelectedId(null)}>Close</button><button className="button primary" onClick={onNew}><Plus size={15} /> Add expense</button></div></div><div className="category-sort"><span>Showing {selected.subcategories?.length ? selected.subcategories.join(', ') : 'all sub-categories'}</span><label>Sort by <select value={sort} onChange={event => setSort(event.target.value)}><option value="date">Date (newest)</option><option value="amount">Amount (highest)</option></select></label></div>{rows.length ? <div className="category-transaction-list">{rows.map(row => <div className="category-transaction" key={row.id}><div><strong>{row.description}</strong><span>{formatDate(row.date)}{row.subcategory ? ` • ${row.subcategory}` : ''}{row.supplier ? ` • ${row.supplier}` : ''}{row.reference ? ` • Ref ${row.reference}` : ''}</span></div><strong>{money(row.amount)}</strong><div className="category-row-actions"><button className="button ghost" onClick={event => { event.stopPropagation(); onEdit(row.type, row) }}>Edit</button><button className="button ghost danger-text" onClick={event => { event.stopPropagation(); onDelete(row.id) }}>Delete</button></div></div>)}</div> : <div className="empty"><Receipt size={26} /><strong>No transactions in this category for the active month</strong></div>}</section>}
  </>
}

export function DeleteLockNotice({ unlocked, setUnlocked }) {
  return <button className={`delete-lock ${unlocked ? 'unlocked' : ''}`} onClick={() => setUnlocked(value => !value)}>{unlocked ? <UnlockKeyhole size={16} /> : <LockKeyhole size={16} />} {unlocked ? 'Deletion unlocked' : 'Unlock to delete'}</button>
}
