import { useEffect, useMemo, useState } from 'react'
import { Banknote, BriefcaseBusiness, Building2, ChevronRight, CircleDollarSign, FileText, LockKeyhole, Megaphone, MoreHorizontal, Package, Pencil, Plus, Receipt, ReceiptText, SprayCan, Trash2, Truck, UnlockKeyhole, Utensils, Wifi, Wrench, Zap } from 'lucide-react'
import { money } from '../utils/currencyUtils'
import { formatDate } from '../utils/dateUtils'

const colors = ['#3f7f68', '#d18b42', '#3b82b8', '#8a63c7', '#c65d55', '#4d8c91', '#bd6b9f', '#687a72']
const iconMap = { users: Banknote, zap: Zap, utensils: Utensils, 'spray-can': SprayCan, wrench: Wrench, package: Package, truck: Truck, megaphone: Megaphone, building: Building2, wifi: Wifi, briefcase: BriefcaseBusiness, receipt: ReceiptText, 'more-horizontal': MoreHorizontal, 'circle-dollar-sign': CircleDollarSign, file: FileText }
const getCategoryIcon = category => iconMap[category.icon] || iconMap[category.name.toLowerCase().includes('food') ? 'utensils' : category.name.toLowerCase().includes('utility') || category.name.toLowerCase().includes('electric') ? 'zap' : category.name.toLowerCase().includes('network') || category.name.toLowerCase().includes('internet') ? 'wifi' : 'receipt']

export default function ExpenseDashboard({ transactions, categories, onNew, onEdit, onDelete, onCategoryEdit, onCategoryDelete }) {
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
  useEffect(() => { if (selectedId) document.getElementById('category-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, [selectedId])

  return <>
    <div className="page-intro expense-dashboard-intro"><div><div className="eyebrow">Expense tracker • active month</div><h2>Where the money goes</h2><p>Each category keeps its own transactions, sub-categories, totals, and share of expenses.</p></div><button className="button primary" onClick={onNew}><Plus size={16} /> New expense</button></div>
    <div className="expense-summary"><div><span>Recorded expenses</span><strong>{money(total)}</strong></div><div><span>Categories used</span><strong>{cards.filter(card => card.rows.length).length}</strong></div><div><span>Transactions</span><strong>{expenses.length}</strong></div></div>
    <section className="category-card-grid">{cards.map(card => { const Icon = getCategoryIcon(card); return <button className="category-card" key={card.id} onClick={() => setSelectedId(card.id)}><span className="category-icon" style={{ backgroundColor: `${card.color}20`, color: card.color }}><Icon size={21} /></span><span className="category-card-name">{card.name}</span><strong>{money(card.amount)}</strong><span className="category-share">{card.share}% of total expenses</span><span className="category-subcategories">Sub-categories: {card.subcategories?.length ? card.subcategories.join(', ') : 'General expenses'}</span><span className="category-card-footer">{card.rows.length} transaction{card.rows.length === 1 ? '' : 's'} <ChevronRight size={15} /></span></button>})}<button className="category-card category-add" onClick={() => window.dispatchEvent(new CustomEvent('hotel:open-masters'))}><Plus size={32} /><span>Add new category</span></button></section>
    {selected && <section id="category-detail" className="card category-detail"><div className="card-head"><div><div className="eyebrow">Category detail</div><h3>{selected.name}</h3><p>{selected.rows.length} transaction{selected.rows.length === 1 ? '' : 's'} • {selected.share}% of active expenses</p></div><div className="category-detail-actions"><button className="button ghost" onClick={() => onCategoryEdit(selected)}><Pencil size={14} /> Edit category</button><button className="icon-button danger" onClick={() => onCategoryDelete(selected.id)} aria-label="Archive category"><Trash2 size={16} /></button><button className="button secondary" onClick={() => setSelectedId(null)}>Close</button><button className="button primary" onClick={onNew}><Plus size={15} /> Add expense</button></div></div><div className="category-sort"><span>Showing {selected.subcategories?.length ? selected.subcategories.join(', ') : 'all sub-categories'}</span><label>Sort by <select value={sort} onChange={event => setSort(event.target.value)}><option value="date">Date (newest)</option><option value="amount">Amount (highest)</option></select></label></div>{rows.length ? <div className="category-transaction-list">{rows.map(row => <div className="category-transaction" key={row.id}><div><strong>{row.description}</strong><span>{formatDate(row.date)}{row.supplier ? ` • ${row.supplier}` : ''}{row.reference ? ` • Ref ${row.reference}` : ''}</span></div><strong>{money(row.amount)}</strong><div className="category-row-actions"><button className="button ghost" onClick={() => onEdit(row.type, row)}>Edit</button><button className="button ghost danger-text" onClick={() => onDelete(row.id)}>Delete</button></div></div>)}</div> : <div className="empty"><Receipt size={26} /><strong>No transactions in this category for the active month</strong></div>}</section>}
  </>
}

export function DeleteLockNotice({ unlocked, setUnlocked }) {
  return <button className={`delete-lock ${unlocked ? 'unlocked' : ''}`} onClick={() => setUnlocked(value => !value)}>{unlocked ? <UnlockKeyhole size={16} /> : <LockKeyhole size={16} />} {unlocked ? 'Deletion unlocked' : 'Unlock to delete'}</button>
}
