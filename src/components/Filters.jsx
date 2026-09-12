import { RefreshCcw, Search } from 'lucide-react'

const uniqueLabels = items => Array.from(new Map(items.map(item => [item.name.toLowerCase().trim(), item])).values())

export default function Filters({ filters, setFilter, reset, setPreset, categories, methods, departments }) {
  const uniqueCategories = uniqueLabels(categories)
  const uniqueMethods = uniqueLabels(methods)
  const uniqueDepartments = uniqueLabels(departments)
  return <div className="filter-bar card">
    <div className="preset-row"><button onClick={() => setPreset('today')}>Today</button><button onClick={() => setPreset('month')}>Current month</button><button onClick={() => setPreset('year')}>Current year</button><button onClick={() => setPreset('all')}>All records</button></div>
    <div className="search-wrap"><Search size={17} /><input value={filters.search} onChange={e => setFilter('search', e.target.value)} placeholder="Search records..." /></div>
    <select value={filters.type} onChange={e => setFilter('type', e.target.value)}><option value="">All types</option><option value="expense">Expenses</option><option value="income">Income</option></select>
    <select value={filters.categoryId} onChange={e => setFilter('categoryId', e.target.value)}><option value="">All categories</option>{uniqueCategories.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
    <select value={filters.departmentId} onChange={e => setFilter('departmentId', e.target.value)}><option value="">All departments</option>{uniqueDepartments.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
    <select value={filters.paymentMethodId} onChange={e => setFilter('paymentMethodId', e.target.value)}><option value="">All payment methods</option>{uniqueMethods.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
    <input type="date" value={filters.startDate} onChange={e => setFilter('startDate', e.target.value)} /><input type="date" value={filters.endDate} onChange={e => setFilter('endDate', e.target.value)} />
    <button className="button ghost" onClick={reset}><RefreshCcw size={15} /> Reset</button>
  </div>
}
