import { useState } from 'react'
import { AlertTriangle, LockKeyhole, Trash2, UnlockKeyhole, X } from 'lucide-react'

export default function ConfirmDialog({ title = 'Delete transaction', message = 'This record will be removed from the active ledger.', onConfirm, onCancel }) {
  const [unlocked, setUnlocked] = useState(false)
  return <div className="modal-backdrop confirm-backdrop"><section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title"><div className="confirm-icon"><AlertTriangle size={21} /></div><div className="confirm-copy"><h2 id="confirm-title">{title}</h2><p>{message}</p><button className={`delete-lock ${unlocked ? 'unlocked' : ''}`} onClick={() => setUnlocked(value => !value)}>{unlocked ? <UnlockKeyhole size={16} /> : <LockKeyhole size={16} />} {unlocked ? 'Deletion unlocked' : 'Unlock before deleting'}</button></div><button className="icon-button confirm-close" onClick={onCancel} aria-label="Close"><X size={18} /></button><div className="confirm-actions"><button className="button secondary" onClick={onCancel}>Cancel</button><button className="button danger-button" disabled={!unlocked} onClick={onConfirm}><Trash2 size={15} /> Delete</button></div></section></div>
}
