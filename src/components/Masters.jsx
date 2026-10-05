import { useState } from 'react'
import { Plus } from 'lucide-react'
import * as service from '../services/dataService'

export default function Masters({ categories, methods, departments, refresh }) {
  const [kind, setKind] = useState('category')
  const [name, setName] = useState('')
  const [subcategories, setSubcategories] = useState('')
  const list = kind === 'category' ? categories : kind === 'method' ? methods : departments
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
  return <><div className="page-intro"><div><div className="eyebrow">Stable IDs preserve historical records</div><h2>Categories & setup</h2><p>Create expense categories and their sub-categories once. Old transactions keep their original category ID.</p></div></div><div className="master-tabs">{[['category', 'Categories'], ['method', 'Payment methods'], ['department', 'Departments']].map(item => <button className={kind === item[0] ? 'selected' : ''} onClick={() => setKind(item[0])} key={item[0]}>{item[1]}</button>)}</div><section className="card"><form className="inline-form master-form" onSubmit={add}><input value={name} onChange={event => setName(event.target.value)} placeholder={`Add ${kind}`} />{kind === 'category' && <input value={subcategories} onChange={event => setSubcategories(event.target.value)} placeholder="Sub-categories, separated by commas" />}<button className="button primary"><Plus size={15} /> Add</button></form>{list.map(item => <div className="master-row" key={item.id}><div><strong>{item.name}</strong>{kind === 'category' && <small>{item.subcategories?.length ? item.subcategories.join(', ') : 'General expenses'}</small>}</div><span className={item.isActive ? 'active-text' : 'muted'}>{item.isActive ? 'Active' : 'Disabled'}</span><button className="button ghost" onClick={async () => { const value = window.prompt('Rename option', item.name); if (value?.trim()) { if (kind === 'category') await service.updateCategory(item.id, { name: value.trim() }); if (kind === 'method') await service.updatePaymentMethod(item.id, { name: value.trim() }); if (kind === 'department') await service.updateDepartment(item.id, { name: value.trim() }); await refresh() } }}>{item.isActive ? 'Rename' : 'View'}</button><button className="button ghost" onClick={async () => { if (kind === 'category') await service.updateCategory(item.id, { isActive: !item.isActive }); if (kind === 'method') await service.updatePaymentMethod(item.id, { isActive: !item.isActive }); if (kind === 'department') await service.updateDepartment(item.id, { isActive: !item.isActive }); await refresh() }}>{item.isActive ? 'Disable' : 'Enable'}</button></div>)}</section></>
}
