import { useState } from 'react'
import { Archive, Eye, EyeOff, Plus, Trash2 } from 'lucide-react'
import * as service from '../services/dataService'

export default function Masters({ categories, methods, departments, refresh, onCategoryDelete }) {
  const [kind, setKind] = useState('category')
  const [name, setName] = useState('')
  const [subcategories, setSubcategories] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const source = kind === 'category' ? categories.filter(item => item.type === 'expense') : kind === 'method' ? methods : departments
  const list = showInactive ? source : source.filter(item => item.isActive)
  const inactiveCount = source.filter(item => !item.isActive).length
  const add = async event => {
    event.preventDefault()
    if (!name.trim()) return
    if (kind === 'category') await service.addCategory({ name: name.trim(), type: 'expense', subcategories: subcategories.split(',').map(value => value.trim()).filter(Boolean) })
    else if (kind === 'method') await service.addPaymentMethod({ name: name.trim() })
    else await service.addDepartment({ name: name.trim() })
    setName('')
    setSubcategories('')
    refresh()
  }
  const rename = async item => { const value = window.prompt('Rename option', item.name); if (!value?.trim()) return; if (kind === 'category') await service.updateCategory(item.id, { name: value.trim() }); if (kind === 'method') await service.updatePaymentMethod(item.id, { name: value.trim() }); if (kind === 'department') await service.updateDepartment(item.id, { name: value.trim() }); await refresh() }
  const toggle = async item => { if (kind === 'category') await service.updateCategory(item.id, { isActive: !item.isActive }); if (kind === 'method') await service.updatePaymentMethod(item.id, { isActive: !item.isActive }); if (kind === 'department') await service.updateDepartment(item.id, { isActive: !item.isActive }); await refresh() }
  return <><div className="page-intro"><div><div className="eyebrow">Expense setup</div><h2>Categories & setup</h2><p>Active categories appear on the dashboard. Archived categories keep their old history.</p></div>{inactiveCount > 0 && <button className="button secondary" onClick={() => setShowInactive(value => !value)}>{showInactive ? <EyeOff size={15} /> : <Eye size={15} />}{showInactive ? 'Hide archived' : `Show archived (${inactiveCount})`}</button>}</div><div className="master-tabs">{[['category', 'Categories'], ['method', 'Payment methods'], ['department', 'Departments']].map(item => <button className={kind === item[0] ? 'selected' : ''} onClick={() => setKind(item[0])} key={item[0]}>{item[1]}</button>)}</div><section className="card"><form className="inline-form master-form" onSubmit={add}><input value={name} onChange={event => setName(event.target.value)} placeholder={`Add ${kind}`} />{kind === 'category' && <input value={subcategories} onChange={event => setSubcategories(event.target.value)} placeholder="Sub-categories, separated by commas" />}<button className="button primary"><Plus size={15} /> Add</button></form>{list.length ? list.map(item => <div className="master-row" key={item.id}><div><strong>{item.name}</strong>{kind === 'category' && <small>{item.subcategories?.length ? item.subcategories.join(', ') : 'General expenses'}</small>}</div><span className={item.isActive ? 'active-text' : 'muted'}>{item.isActive ? 'Active' : 'Archived'}</span><button className="button ghost" onClick={() => rename(item)}>{item.isActive ? 'Rename' : 'View'}</button>{item.isActive && kind === 'category' && onCategoryDelete ? <button className="button ghost danger-text" onClick={() => onCategoryDelete(item.id)}><Trash2 size={14} /> Delete</button> : <button className="button ghost" onClick={() => toggle(item)}>{item.isActive ? <><Archive size={14} /> Archive</> : 'Restore'}</button>}</div>) : <div className="empty"><strong>{showInactive ? 'No archived items' : `No active ${kind}s`}</strong></div>}</section></>
}
