import { Save, X } from 'lucide-react'
import { useState } from 'react'

export default function CategoryEditModal({ category, save, close }) {
  const [name, setName] = useState(category.name)
  const [subcategories, setSubcategories] = useState((category.subcategories || []).join(', '))
  const submit = event => {
    event.preventDefault()
    if (!name.trim()) return
    save({ name: name.trim(), subcategories: subcategories.split(',').map(value => value.trim()).filter(Boolean) })
  }
  return <div className="modal-backdrop"><section className="modal category-edit-modal" role="dialog" aria-modal="true" aria-labelledby="category-edit-title"><div className="modal-head"><div><div className="eyebrow">Category setup</div><h2 id="category-edit-title">Edit category</h2></div><button className="icon-button" onClick={close} aria-label="Close"><X size={18} /></button></div><form onSubmit={submit}><div className="form-grid"><label className="span-2">Category name<input value={name} onChange={event => setName(event.target.value)} autoFocus required /></label><label className="span-2">Sub-categories <span style={{ fontWeight: 400, color: '#8a9a98', marginLeft: 4 }}>Separate names with commas</span><input value={subcategories} onChange={event => setSubcategories(event.target.value)} placeholder="Example: Breakfast, Lunch, Dinner" /></label></div><div className="modal-actions"><button type="button" className="button secondary" onClick={close}>Cancel</button><button className="button primary"><Save size={15} /> Save changes</button></div></form></section></div>
}
