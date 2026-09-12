import { useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { buildCalendarGrid, getMonthName, getNow, getYearFromDate, isToday, toStorageDate } from '../utils/dateUtils'
import { Table } from './Ledger'

const monthNames = Array.from({ length: 12 }, (_, index) => getMonthName(index + 1))

export default function CalendarView({ transactions, names }) {
  const current = getNow()
  const [year, setYear] = useState(current.getFullYear())
  const [month, setMonth] = useState(current.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState(toStorageDate(current))
  const grid = useMemo(() => buildCalendarGrid(year, month), [year, month])
  const counts = useMemo(() => transactions.reduce((result, transaction) => { result[transaction.date] = (result[transaction.date] || 0) + 1; return result }, {}), [transactions])
  const selectedRecords = transactions.filter(transaction => transaction.date === selectedDate).sort((a, b) => b.date.localeCompare(a.date))
  const years = Array.from(new Set([current.getFullYear(), ...transactions.map(transaction => getYearFromDate(transaction.date))])).sort((a, b) => b - a)
  const moveMonth = amount => { const next = new Date(year, month - 1 + amount, 1); setYear(next.getFullYear()); setMonth(next.getMonth() + 1) }
  return <><div className="page-intro"><div><div className="eyebrow">Date-based transaction history</div><h2>Calendar</h2><p>Choose a month, year, or exact date to view its saved records.</p></div></div><section className="calendar-layout"><div className="card calendar-card"><div className="calendar-toolbar"><button className="icon-button" onClick={() => moveMonth(-1)} title="Previous month"><ChevronLeft size={18} /></button><div className="calendar-selectors"><select value={month} onChange={event => setMonth(Number(event.target.value))}>{monthNames.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}</select><select value={year} onChange={event => setYear(Number(event.target.value))}>{years.map(value => <option key={value} value={value}>{value}</option>)}</select></div><button className="icon-button" onClick={() => moveMonth(1)} title="Next month"><ChevronRight size={18} /></button></div><div className="calendar-weekdays">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <span key={day}>{day}</span>)}</div><div className="calendar-grid">{grid.flatMap((week, weekIndex) => week.map((date, dayIndex) => { if (!date) return <span className="calendar-day blank" key={`${weekIndex}-${dayIndex}`} />; const dateKey = toStorageDate(date); const active = selectedDate === dateKey; return <button className={`calendar-day ${active ? 'selected' : ''} ${isToday(date) ? 'today' : ''}`} key={dateKey} onClick={() => setSelectedDate(dateKey)}><span>{date.getDate()}</span>{counts[dateKey] && <small>{counts[dateKey]}</small>}</button> }))}</div><button className="button secondary calendar-today" onClick={() => { setYear(current.getFullYear()); setMonth(current.getMonth() + 1); setSelectedDate(toStorageDate(current)) }}><CalendarDays size={15} /> Go to today</button></div><section className="card calendar-records"><div className="card-head"><div><h3>{selectedDate}</h3><p>{selectedRecords.length} saved transaction{selectedRecords.length === 1 ? '' : 's'} on this date</p></div></div><Table rows={selectedRecords} names={names} /></section></section></>
}
