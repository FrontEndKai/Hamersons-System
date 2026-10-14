import * as XLSX from 'xlsx'
import { toStorageDate } from './dateUtils'

const cleanKey = value => String(value || '').toLowerCase().replace(/[^a-z]/g, '')
const text = value => String(value ?? '').trim()
const aliases = {
  date: ['date', 'transactiondate', 'expensedate', 'dated', 'period', 'dateincurred'],
  description: ['description', 'itemdescription', 'particulars', 'details', 'item', 'expense', 'expenseitem', 'transaction', 'payee', 'vendor'],
  amount: ['amount', 'amountphp', 'total', 'totalamount', 'totalexpense', 'cost', 'value', 'expenseamount', 'debit', 'netamount'],
  category: ['category', 'expensecategory', 'account', 'accountname', 'classification', 'group', 'expensegroup'],
  type: ['type', 'transactiontype'],
  payment: ['paymentmethod', 'payment', 'method'],
  department: ['department', 'departmentname', 'unit'],
  reference: ['reference', 'receipt', 'receiptnumber', 'invoice', 'invoiceno'],
  supplier: ['supplier', 'vendor', 'payee'],
  notes: ['notes', 'remarks', 'remark', 'comment']
}

const findColumn = (headers, field) => {
  const options = aliases[field]
  return headers.findIndex(header => {
    const key = cleanKey(header)
    return options.some(option => key === option || key.includes(option))
  })
}

const parseAmount = value => {
  if (typeof value === 'number') return value
  const raw = text(value).replace(/[₱$€£,\s]/g, '')
  if (!raw) return 0
  const negative = raw.startsWith('(') && raw.endsWith(')')
  const amount = Number(raw.replace(/[()]/g, ''))
  return Number.isFinite(amount) ? (negative ? -amount : amount) : 0
}

const looksLikeDate = value => value instanceof Date || (typeof value === 'number' && value > 20000) || /^\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}$/.test(text(value))
const looksLikeAmount = value => typeof value === 'number' || /^[\s₱$€£(),.-]*\d[\d,]*(?:\.\d+)?\s*$/.test(text(value))
const isSummaryRow = value => /^(grand\s+)?total$|^subtotal$|^total\s+expenses?$|^total\s+income$/i.test(text(value).replace(/[:\-]/g, '').trim())

const parseDate = (value, fallbackYear, fallbackMonth) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return toStorageDate(value)
  if (typeof value === 'number' && value > 20000) {
    const date = new Date(Date.UTC(1899, 11, 30) + value * 86400000)
    return toStorageDate(date)
  }
  const raw = text(value)
  if (raw) {
    const dmy = raw.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/)
    if (dmy) {
      const year = dmy[3].length === 2 ? `20${dmy[3]}` : dmy[3]
      return `${year}-${String(dmy[2]).padStart(2, '0')}-${String(dmy[1]).padStart(2, '0')}`
    }
    const parsed = new Date(raw)
    if (!Number.isNaN(parsed.getTime())) return toStorageDate(parsed)
  }
  if (fallbackYear && fallbackMonth) return `${fallbackYear}-${String(fallbackMonth).padStart(2, '0')}-01`
  return ''
}

const monthNumber = value => {
  const names = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
  const key = text(value).toLowerCase()
  const index = names.findIndex(name => key.includes(name) || key.slice(0, 3) === name.slice(0, 3))
  return index + 1
}

const sheetRows = (sheet, sheetName, fileName) => {
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: true })
  const fileYear = text(fileName).match(/20\d{2}/)?.[0]
  const fallbackYear = fileYear || new Date().getFullYear()
  const fallbackMonth = monthNumber(sheetName) || monthNumber(fileName) || new Date().getMonth() + 1
  const headerIndex = rows.findIndex(row => {
    const matches = Object.keys(aliases).filter(field => findColumn(row, field) >= 0).length
    return matches >= 2 && (findColumn(row, 'amount') >= 0 || findColumn(row, 'description') >= 0)
  })
  const start = headerIndex >= 0 ? headerIndex : 0
  const headers = rows[start].map((value, index) => cleanKey(value) ? value : `column${index}`)
  let indexes = Object.fromEntries(Object.keys(aliases).map(field => [field, findColumn(headers, field)]))
  if (headerIndex < 0) {
    const sample = rows.find(row => row.some(looksLikeDate) && row.some(looksLikeAmount)) || []
    const dateIndex = sample.findIndex(looksLikeDate)
    const amountIndex = sample.findIndex(looksLikeAmount)
    const descriptionIndex = sample.findIndex((value, index) => index !== dateIndex && index !== amountIndex && text(value))
    indexes = { ...indexes, date: dateIndex, amount: amountIndex, description: descriptionIndex }
  }
  if (indexes.description < 0) indexes.description = 1
  if (indexes.amount < 0) indexes.amount = 2
  let sectionCategory = ''
  const result = []

  rows.slice(start + 1).forEach(row => {
    const value = field => indexes[field] >= 0 ? row[indexes[field]] : ''
    const description = text(value('description'))
    const category = text(value('category'))
    const amount = parseAmount(value('amount'))
    const date = parseDate(value('date'), fallbackYear, fallbackMonth)
    const populated = row.filter(cell => text(cell)).length
    if (isSummaryRow(description) || isSummaryRow(category)) return
    if (!description && !category) return
    if (!amount && populated <= 2 && (category || text(row[0]))) {
      sectionCategory = category || text(row[0])
      return
    }
    if (!amount || !description) return
    const rowCategory = category || sectionCategory
    const type = text(value('type')).toLowerCase().includes('income') || /revenue|income|sales/i.test(`${rowCategory} ${description}`) ? 'income' : 'expense'
    result.push({
      date,
      type,
      description,
      amount: Math.abs(amount),
      category: rowCategory,
      payment: text(value('payment')),
      department: text(value('department')),
      reference: text(value('reference')),
      supplier: text(value('supplier')),
      notes: text(value('notes')) || `Imported from ${sheetName}`
    })
  })
  return result
}

export function parseSpreadsheet(workbook, fileName = '') {
  return workbook.SheetNames.flatMap(sheetName => sheetRows(workbook.Sheets[sheetName], sheetName, fileName))
}
