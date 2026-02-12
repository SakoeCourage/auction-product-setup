import { useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { validateForm, evaluateCondition } from '../utils/fieldValidation'
import {
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Bars3Icon,
  XMarkIcon,
  EyeIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from '@heroicons/react/24/outline'

const DATA_TYPES = [
  'Text', 'Number', 'Decimal', 'Date', 'DateTime', 'Boolean',
  'Dropdown', 'MultiSelect', 'TextArea', 'Email', 'Phone',
  'Url', 'Currency', 'Percentage', 'File', 'Image',
]

const NEEDS_OPTIONS = ['Dropdown', 'MultiSelect']

const TYPE_COLORS = {
  Text: 'bg-blue-50 text-blue-700',
  Number: 'bg-amber-50 text-amber-700',
  Decimal: 'bg-amber-50 text-amber-700',
  Date: 'bg-teal-50 text-teal-700',
  DateTime: 'bg-teal-50 text-teal-700',
  Boolean: 'bg-pink-50 text-pink-700',
  Dropdown: 'bg-purple-50 text-purple-700',
  MultiSelect: 'bg-purple-50 text-purple-700',
  TextArea: 'bg-blue-50 text-blue-700',
  Email: 'bg-sky-50 text-sky-700',
  Phone: 'bg-sky-50 text-sky-700',
  Url: 'bg-sky-50 text-sky-700',
  Currency: 'bg-emerald-50 text-emerald-700',
  Percentage: 'bg-emerald-50 text-emerald-700',
  File: 'bg-orange-50 text-orange-700',
  Image: 'bg-orange-50 text-orange-700',
}

const emptyField = () => ({
  id: null,
  fieldName: '',
  fieldLabel: '',
  fieldDescription: '',
  placeholder: '',
  dataType: 'Text',
  isRequired: false,
  isUnique: false,
  displayOrder: 1,
  fieldGroup: '',
  fieldGroupOrder: null,
  defaultValue: '',
  validationRules: null,
  conditionalRules: null,
  fieldProperties: null,
  options: [],
})

// Shared input style
const inputClass =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
const labelClass = 'block text-xs font-medium text-slate-600 mb-1'
const selectClass =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 bg-white'

export default function FieldDefinitionBuilder({ fields, setFields }) {
  const [expandedIndex, setExpandedIndex] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  // 'closed' | 'side' | 'float'
  const [previewMode, setPreviewMode] = useState('closed')

  const handleAddField = (newField) => {
    const maxOrder = fields.reduce((max, f) => Math.max(max, f.displayOrder), 0)
    setFields([...fields, { ...newField, displayOrder: maxOrder + 1 }])
    setExpandedIndex(fields.length)
    setShowAddModal(false)
  }

  const removeField = (index) => {
    if (!confirm('Remove this field definition?')) return
    setFields(fields.filter((_, i) => i !== index))
    setExpandedIndex(null)
  }

  const updateField = (index, updates) => {
    setFields(fields.map((f, i) => (i === index ? { ...f, ...updates } : f)))
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header — WP-style toolbar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-2.5">
          <Bars3Icon className="w-4.5 h-4.5 text-violet-500" />
          <h3 className="text-sm font-semibold text-slate-800">
            Field Definitions
          </h3>
          <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {fields.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {fields.length > 0 && (
            <button
              type="button"
              onClick={() => setPreviewMode(previewMode === 'closed' ? 'side' : 'closed')}
              className={`inline-flex items-center gap-1.5 pl-3 pr-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                previewMode !== 'closed'
                  ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <EyeIcon className="w-3.5 h-3.5" />
              Preview
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 bg-violet-600 text-white pl-3 pr-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-violet-700 transition-colors shadow-sm"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            Add Field
          </button>
        </div>
      </div>

      {/* Fields — WP-style table list */}
      {fields.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mb-3">
            <Bars3Icon className="w-7 h-7 text-violet-300" />
          </div>
          <p className="text-sm font-medium text-slate-600 mb-1">No fields defined</p>
          <p className="text-xs text-slate-400 mb-4">Add fields to define the product type schema</p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 px-3.5 py-2 rounded-lg transition-colors"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            Add First Field
          </button>
        </div>
      ) : (
        <div>
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-[40px_1fr_1fr_100px_80px_60px_36px] gap-3 px-5 py-2 bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>#</span>
            <span>Label</span>
            <span>Name</span>
            <span>Type</span>
            <span>Flags</span>
            <span>Group</span>
            <span />
          </div>

          {/* Field Rows */}
          <div className="divide-y divide-slate-100">
            {fields.map((field, index) => (
              <FieldCard
                key={index}
                field={field}
                index={index}
                expanded={expandedIndex === index}
                onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
                onChange={(updates) => updateField(index, updates)}
                onRemove={() => removeField(index)}
                allFields={fields}
              />
            ))}
          </div>
        </div>
      )}

      {/* Form Preview — Side Panel or Floating Window (portaled out of parent form) */}
      {previewMode !== 'closed' && fields.length > 0 && createPortal(
        <PreviewPanel
          fields={fields}
          mode={previewMode}
          onModeChange={setPreviewMode}
          onClose={() => setPreviewMode('closed')}
        />,
        document.body
      )}

      {/* Add Field Modal (portaled out of parent form) */}
      {showAddModal && createPortal(
        <AddFieldModal
          onAdd={handleAddField}
          onClose={() => setShowAddModal(false)}
          allFields={fields}
        />,
        document.body
      )}
    </div>
  )
}

/* ── Add Field Modal ─────────────────────────────────────── */

function AddFieldModal({ onAdd, onClose, allFields }) {
  const [field, setField] = useState(emptyField())

  const update = (updates) => setField({ ...field, ...updates })

  const handleAdd = () => {
    if (!field.fieldName || !field.fieldLabel) return
    onAdd(field)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="flex min-h-full items-start justify-center p-4 pt-10">
        <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <div>
              <h3 className="text-base font-semibold text-slate-800">Add New Field</h3>
              <p className="text-xs text-slate-400 mt-0.5">Define a new field for this product type</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Basic Information */}
            <SectionLabel text="Basic Information" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className={labelClass}>Field Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={field.fieldName}
                  onChange={(e) => update({ fieldName: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. engine_type"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">Letters, numbers, underscores</p>
              </div>
              <div>
                <label className={labelClass}>Field Label <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={field.fieldLabel}
                  onChange={(e) => update({ fieldLabel: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. Engine Type"
                />
              </div>
              <div>
                <label className={labelClass}>Data Type <span className="text-red-400">*</span></label>
                <select
                  value={field.dataType}
                  onChange={(e) => update({ dataType: e.target.value, options: NEEDS_OPTIONS.includes(e.target.value) ? field.options : [] })}
                  className={selectClass}
                >
                  {DATA_TYPES.map((dt) => (
                    <option key={dt} value={dt}>{dt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Display Order <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  min={1}
                  value={field.displayOrder}
                  onChange={(e) => update({ displayOrder: parseInt(e.target.value) || 1 })}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Details */}
            <SectionLabel text="Details" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className={labelClass}>Placeholder</label>
                <input
                  type="text"
                  value={field.placeholder}
                  onChange={(e) => update({ placeholder: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Field Group</label>
                <input
                  type="text"
                  value={field.fieldGroup}
                  onChange={(e) => update({ fieldGroup: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. Specifications"
                />
              </div>
              <div>
                <label className={labelClass}>Group Order</label>
                <input
                  type="number"
                  min={1}
                  value={field.fieldGroupOrder || ''}
                  onChange={(e) => update({ fieldGroupOrder: e.target.value ? parseInt(e.target.value) : null })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Default Value</label>
                <input
                  type="text"
                  value={field.defaultValue}
                  onChange={(e) => update({ defaultValue: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Description</label>
                <input
                  type="text"
                  value={field.fieldDescription}
                  onChange={(e) => update({ fieldDescription: e.target.value })}
                  className={inputClass}
                  placeholder="Help text for this field"
                />
              </div>
              <div className="flex items-end gap-5 pb-1">
                <ToggleSwitch
                  label="Required"
                  checked={field.isRequired}
                  onChange={(v) => update({ isRequired: v })}
                />
                <ToggleSwitch
                  label="Unique"
                  checked={field.isUnique}
                  onChange={(v) => update({ isUnique: v })}
                />
              </div>
            </div>

            {/* Validation Rules */}
            <ValidationRulesEditor
              rules={field.validationRules}
              onChange={(rules) => update({ validationRules: rules })}
              dataType={field.dataType}
            />

            {/* Field Properties */}
            <FieldPropertiesEditor
              props={field.fieldProperties}
              onChange={(props) => update({ fieldProperties: props })}
              dataType={field.dataType}
            />

            {/* Conditional Rules */}
            <ConditionalRulesEditor
              rules={field.conditionalRules}
              onChange={(rules) => update({ conditionalRules: rules })}
              allFields={allFields}
              currentFieldName={field.fieldName}
            />

            {/* Options for Dropdown/MultiSelect */}
            {NEEDS_OPTIONS.includes(field.dataType) && (
              <OptionsEditor
                options={field.options}
                onChange={(options) => update({ options })}
              />
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-200 sticky bottom-0 bg-white pb-1">
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-violet-700 transition-colors shadow-sm"
              >
                <PlusIcon className="w-4 h-4" />
                Add Field
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FieldCard({ field, index, expanded, onToggle, onChange, onRemove, allFields }) {
  return (
    <div className={`transition-all duration-150 ${expanded ? 'bg-violet-50/30' : 'hover:bg-slate-50/80'}`}>
      {/* Row — WP-style table row */}
      <div
        onClick={onToggle}
        className="grid grid-cols-1 sm:grid-cols-[40px_1fr_1fr_100px_80px_60px_36px] gap-3 items-center px-5 py-3 cursor-pointer"
      >
        {/* Order */}
        <span className="hidden sm:flex text-[11px] font-mono text-slate-400 font-semibold">
          {field.displayOrder}
        </span>

        {/* Label */}
        <div className="min-w-0 flex items-center gap-2">
          <span className={`font-medium text-sm truncate ${expanded ? 'text-violet-700' : 'text-slate-800 hover:text-violet-600'}`}>
            {field.fieldLabel || 'Untitled Field'}
          </span>
          {/* Mobile badges */}
          <span className={`sm:hidden text-[10px] font-semibold px-1.5 py-0.5 rounded ${TYPE_COLORS[field.dataType] || 'bg-slate-100 text-slate-600'}`}>
            {field.dataType}
          </span>
        </div>

        {/* Name */}
        <span className="hidden sm:block text-xs text-slate-400 font-mono truncate">
          {field.fieldName || '-'}
        </span>

        {/* Type Badge */}
        <div className="hidden sm:block">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${TYPE_COLORS[field.dataType] || 'bg-slate-100 text-slate-600'}`}>
            {field.dataType}
          </span>
        </div>

        {/* Flags */}
        <div className="hidden sm:flex items-center gap-1">
          {field.isRequired && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-500 uppercase">
              Req
            </span>
          )}
          {field.isUnique && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 uppercase">
              Unq
            </span>
          )}
        </div>

        {/* Group */}
        <span className="hidden sm:block text-[11px] text-slate-400 truncate">
          {field.fieldGroup || '-'}
        </span>

        {/* Actions */}
        <div className="hidden sm:flex items-center justify-end">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Form */}
      {expanded && (
        <div className="px-5 pb-5 space-y-5 border-t border-slate-100 bg-white">
          {/* Mobile delete */}
          <div className="flex sm:hidden justify-end pt-3">
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 bg-red-50 px-2.5 py-1 rounded-lg"
            >
              <TrashIcon className="w-3.5 h-3.5" />
              Remove
            </button>
          </div>

          {/* Basic Info */}
          <div className="pt-3 sm:pt-4">
            <SectionLabel text="Basic Information" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              <div>
                <label className={labelClass}>Field Name *</label>
                <input
                  type="text"
                  value={field.fieldName}
                  onChange={(e) => onChange({ fieldName: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. engine_type"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">Letters, numbers, underscores</p>
              </div>
              <div>
                <label className={labelClass}>Field Label *</label>
                <input
                  type="text"
                  value={field.fieldLabel}
                  onChange={(e) => onChange({ fieldLabel: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. Engine Type"
                />
              </div>
              <div>
                <label className={labelClass}>Data Type *</label>
                <select
                  value={field.dataType}
                  onChange={(e) => onChange({ dataType: e.target.value, options: NEEDS_OPTIONS.includes(e.target.value) ? field.options : [] })}
                  className={selectClass}
                >
                  {DATA_TYPES.map((dt) => (
                    <option key={dt} value={dt}>{dt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Display Order *</label>
                <input
                  type="number"
                  min={1}
                  value={field.displayOrder}
                  onChange={(e) => onChange({ displayOrder: parseInt(e.target.value) || 1 })}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Extended Info */}
          <div>
            <SectionLabel text="Details" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              <div>
                <label className={labelClass}>Placeholder</label>
                <input
                  type="text"
                  value={field.placeholder}
                  onChange={(e) => onChange({ placeholder: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Field Group</label>
                <input
                  type="text"
                  value={field.fieldGroup}
                  onChange={(e) => onChange({ fieldGroup: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. Specifications"
                />
              </div>
              <div>
                <label className={labelClass}>Group Order</label>
                <input
                  type="number"
                  min={1}
                  value={field.fieldGroupOrder || ''}
                  onChange={(e) => onChange({ fieldGroupOrder: e.target.value ? parseInt(e.target.value) : null })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Default Value</label>
                <input
                  type="text"
                  value={field.defaultValue}
                  onChange={(e) => onChange({ defaultValue: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div>
                <label className={labelClass}>Description</label>
                <input
                  type="text"
                  value={field.fieldDescription}
                  onChange={(e) => onChange({ fieldDescription: e.target.value })}
                  className={inputClass}
                  placeholder="Help text for this field"
                />
              </div>
              <div className="flex items-end gap-5 pb-1">
                <ToggleSwitch
                  label="Required"
                  checked={field.isRequired}
                  onChange={(v) => onChange({ isRequired: v })}
                />
                <ToggleSwitch
                  label="Unique"
                  checked={field.isUnique}
                  onChange={(v) => onChange({ isUnique: v })}
                />
              </div>
            </div>
          </div>

          {/* Validation Rules */}
          <ValidationRulesEditor
            rules={field.validationRules}
            onChange={(rules) => onChange({ validationRules: rules })}
            dataType={field.dataType}
          />

          {/* Field Properties */}
          <FieldPropertiesEditor
            props={field.fieldProperties}
            onChange={(props) => onChange({ fieldProperties: props })}
            dataType={field.dataType}
          />

          {/* Conditional Rules */}
          <ConditionalRulesEditor
            rules={field.conditionalRules}
            onChange={(rules) => onChange({ conditionalRules: rules })}
            allFields={allFields}
            currentFieldName={field.fieldName}
          />

          {/* Options for Dropdown/MultiSelect */}
          {NEEDS_OPTIONS.includes(field.dataType) && (
            <OptionsEditor
              options={field.options}
              onChange={(options) => onChange({ options })}
            />
          )}
        </div>
      )}
    </div>
  )
}

/* ── Tiny reusable components ────────────────────────────── */

function SectionLabel({ text }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{text}</span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  )
}

function ToggleSwitch({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-8 h-5 bg-slate-200 peer-checked:bg-violet-600 rounded-full transition-colors" />
        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-3" />
      </div>
      <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900">{label}</span>
    </label>
  )
}

function CollapsibleSection({ title, color = 'slate', children }) {
  const [open, setOpen] = useState(false)

  const dotColors = {
    slate: 'bg-slate-400',
    blue: 'bg-blue-400',
    amber: 'bg-amber-400',
    emerald: 'bg-emerald-400',
  }

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dotColors[color]}`} />
          {title}
        </span>
        {open ? (
          <ChevronUpIcon className="w-3.5 h-3.5 text-slate-400" />
        ) : (
          <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400" />
        )}
      </button>
      {open && (
        <div className="p-4 bg-white border-t border-slate-100">
          {children}
        </div>
      )}
    </div>
  )
}

/* ── Sub editors ─────────────────────────────────────────── */

function ValidationRulesEditor({ rules, onChange, dataType }) {
  const r = rules || {}

  const set = (key, value) => {
    onChange({ ...r, [key]: value === '' ? null : value })
  }

  const isText = ['Text', 'TextArea', 'Email', 'Phone', 'Url'].includes(dataType)
  const isNumeric = ['Number', 'Decimal', 'Currency', 'Percentage'].includes(dataType)

  return (
    <CollapsibleSection title="Validation Rules" color="slate">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {isText && (
          <>
            <div>
              <label className={labelClass}>Min Length</label>
              <input type="number" min={0} value={r.minLength ?? ''} onChange={(e) => set('minLength', e.target.value ? parseInt(e.target.value) : null)}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Max Length</label>
              <input type="number" min={0} value={r.maxLength ?? ''} onChange={(e) => set('maxLength', e.target.value ? parseInt(e.target.value) : null)}
                className={inputClass} />
            </div>
          </>
        )}
        {isNumeric && (
          <>
            <div>
              <label className={labelClass}>Min Value</label>
              <input type="number" value={r.minValue ?? ''} onChange={(e) => set('minValue', e.target.value ? parseFloat(e.target.value) : null)}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Max Value</label>
              <input type="number" value={r.maxValue ?? ''} onChange={(e) => set('maxValue', e.target.value ? parseFloat(e.target.value) : null)}
                className={inputClass} />
            </div>
          </>
        )}
        <div>
          <label className={labelClass}>Regex Pattern</label>
          <input type="text" value={r.pattern ?? ''} onChange={(e) => set('pattern', e.target.value || null)}
            className={inputClass} placeholder="e.g. ^[A-Z]+$" />
        </div>
        <div>
          <label className={labelClass}>Custom Validation</label>
          <input type="text" value={r.customValidation ?? ''} onChange={(e) => set('customValidation', e.target.value || null)}
            className={inputClass} placeholder="Method name" />
        </div>
      </div>
    </CollapsibleSection>
  )
}

function FieldPropertiesEditor({ props, onChange, dataType }) {
  const p = props || {}

  const set = (key, value) => {
    onChange({ ...p, [key]: value === '' || value === false ? null : value })
  }

  const isNumeric = ['Number', 'Decimal', 'Currency', 'Percentage'].includes(dataType)
  const isText = ['Text', 'TextArea', 'Email', 'Phone', 'Url'].includes(dataType)
  const isFile = ['File', 'Image'].includes(dataType)
  const isDropdown = ['Dropdown', 'MultiSelect'].includes(dataType)

  return (
    <CollapsibleSection title="Field Properties" color="blue">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {isNumeric && (
          <>
            <div>
              <label className={labelClass}>Step</label>
              <input type="number" step="any" value={p.step ?? ''} onChange={(e) => set('step', e.target.value ? parseFloat(e.target.value) : null)}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Min</label>
              <input type="number" step="any" value={p.min ?? ''} onChange={(e) => set('min', e.target.value ? parseFloat(e.target.value) : null)}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Max</label>
              <input type="number" step="any" value={p.max ?? ''} onChange={(e) => set('max', e.target.value ? parseFloat(e.target.value) : null)}
                className={inputClass} />
            </div>
          </>
        )}
        {isText && (
          <>
            <div className="flex items-end gap-4 pb-1">
              <ToggleSwitch
                label="Password"
                checked={!!p.isPassword}
                onChange={(v) => set('isPassword', v || null)}
              />
              <ToggleSwitch
                label="Multiline"
                checked={!!p.isMultiline}
                onChange={(v) => set('isMultiline', v || null)}
              />
            </div>
            <div>
              <label className={labelClass}>Rows</label>
              <input type="number" min={1} value={p.rows ?? ''} onChange={(e) => set('rows', e.target.value ? parseInt(e.target.value) : null)}
                className={inputClass} />
            </div>
          </>
        )}
        {isFile && (
          <>
            <div>
              <label className={labelClass}>Accepted File Types</label>
              <input type="text" value={(p.acceptedFileTypes || []).join(', ')}
                onChange={(e) => set('acceptedFileTypes', e.target.value ? e.target.value.split(',').map((s) => s.trim()) : null)}
                className={inputClass} placeholder=".pdf, .jpg, .png" />
            </div>
            <div>
              <label className={labelClass}>Max File Size (bytes)</label>
              <input type="number" min={0} value={p.maxFileSize ?? ''} onChange={(e) => set('maxFileSize', e.target.value ? parseInt(e.target.value) : null)}
                className={inputClass} placeholder="e.g. 10485760" />
            </div>
          </>
        )}
        {isDropdown && (
          <div className="flex items-end gap-4 pb-1">
            <ToggleSwitch
              label="Searchable"
              checked={!!p.isSearchable}
              onChange={(v) => set('isSearchable', v || null)}
            />
            <ToggleSwitch
              label="Allow Custom"
              checked={!!p.allowCustomValue}
              onChange={(v) => set('allowCustomValue', v || null)}
            />
          </div>
        )}
        {/* General properties */}
        <div>
          <label className={labelClass}>CSS Class</label>
          <input type="text" value={p.cssClass ?? ''} onChange={(e) => set('cssClass', e.target.value || null)}
            className={inputClass} placeholder="e.g. text-uppercase" />
        </div>
        <div>
          <label className={labelClass}>Width</label>
          <select value={p.width ?? ''} onChange={(e) => set('width', e.target.value || null)}
            className={selectClass}>
            <option value="">Auto</option>
            <option value="25%">25%</option>
            <option value="33%">33%</option>
            <option value="50%">50%</option>
            <option value="66%">66%</option>
            <option value="75%">75%</option>
            <option value="100%">100%</option>
          </select>
        </div>
      </div>
    </CollapsibleSection>
  )
}

function ConditionalRulesEditor({ rules, onChange, allFields, currentFieldName }) {
  const r = rules || {}

  const set = (key, value) => {
    onChange({ ...r, [key]: value === '' ? null : value })
  }

  const otherFields = allFields.filter((f) => f.fieldName && f.fieldName !== currentFieldName)

  return (
    <CollapsibleSection title="Conditional Rules" color="amber">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Show If (Field Name)</label>
          <select value={r.showIf ?? ''} onChange={(e) => set('showIf', e.target.value || null)}
            className={selectClass}>
            <option value="">None</option>
            {otherFields.map((f) => (
              <option key={f.fieldName} value={f.fieldName}>{f.fieldLabel || f.fieldName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Operator</label>
          <select value={r.operator ?? 'equals'} onChange={(e) => set('operator', e.target.value)}
            className={selectClass}>
            <option value="equals">Equals</option>
            <option value="notEquals">Not Equals</option>
            <option value="contains">Contains</option>
            <option value="greaterThan">Greater Than</option>
            <option value="lessThan">Less Than</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Value</label>
          <input type="text" value={r.value ?? ''} onChange={(e) => set('value', e.target.value || null)}
            className={inputClass} placeholder="Required value" />
        </div>
      </div>
    </CollapsibleSection>
  )
}

function OptionsEditor({ options, onChange }) {
  const addOption = () => {
    const maxOrder = options.reduce((max, o) => Math.max(max, o.displayOrder), 0)
    onChange([...options, { id: null, optionValue: '', optionLabel: '', displayOrder: maxOrder + 1 }])
  }

  const removeOption = (index) => {
    onChange(options.filter((_, i) => i !== index))
  }

  const updateOption = (index, updates) => {
    onChange(options.map((o, i) => (i === index ? { ...o, ...updates } : o)))
  }

  return (
    <CollapsibleSection title={`Options (${options.length})`} color="emerald">
      {options.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-xs text-slate-400 mb-3">No options defined. Add at least one option.</p>
          <button
            type="button"
            onClick={addOption}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            Add Option
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-[1fr_1fr_80px_36px] gap-2 px-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Value</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Label</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Order</span>
            <span />
          </div>

          {options.map((opt, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_80px_36px] gap-2 items-center">
              <input
                type="text"
                value={opt.optionValue}
                onChange={(e) => updateOption(i, { optionValue: e.target.value })}
                className={inputClass}
                placeholder="sedan"
              />
              <input
                type="text"
                value={opt.optionLabel}
                onChange={(e) => updateOption(i, { optionLabel: e.target.value })}
                className={inputClass}
                placeholder="Sedan"
              />
              <input
                type="number"
                min={1}
                value={opt.displayOrder}
                onChange={(e) => updateOption(i, { displayOrder: parseInt(e.target.value) || 1 })}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => removeOption(i)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addOption}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors mt-1"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            Add Option
          </button>
        </div>
      )}
    </CollapsibleSection>
  )
}

/* ── Preview Panel (Side Drawer + Floating Window) ───────── */

const previewInputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'
const previewSelectClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400'

function PreviewPanel({ fields, mode, onModeChange, onClose }) {
  const dragRef = useRef(null)
  const [pos, setPos] = useState({ x: 80, y: 80 })
  const [size, setSize] = useState({ w: 420, h: 520 })
  const dragState = useRef(null)
  const resizeState = useRef(null)

  const onDragStart = useCallback((e) => {
    if (e.target.closest('button, input, select, textarea')) return
    e.preventDefault()
    dragState.current = { startX: e.clientX - pos.x, startY: e.clientY - pos.y }
    const onMove = (ev) => {
      if (!dragState.current) return
      setPos({ x: ev.clientX - dragState.current.startX, y: ev.clientY - dragState.current.startY })
    }
    const onUp = () => {
      dragState.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [pos])

  const onResizeStart = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    resizeState.current = { startX: e.clientX, startY: e.clientY, w: size.w, h: size.h }
    const onMove = (ev) => {
      if (!resizeState.current) return
      const dw = ev.clientX - resizeState.current.startX
      const dh = ev.clientY - resizeState.current.startY
      setSize({
        w: Math.max(320, resizeState.current.w + dw),
        h: Math.max(300, resizeState.current.h + dh),
      })
    }
    const onUp = () => {
      resizeState.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [size])

  const previewContent = <PreviewFormContent fields={fields} />

  // ─── Side Drawer ───
  if (mode === 'side') {
    return (
      <>
        {/* Backdrop */}
        <div className="fixed inset-0 z-40" onClick={onClose} />
        {/* Drawer */}
        <div className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-[slideIn_0.2s_ease-out]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-violet-50 shrink-0">
            <div className="flex items-center gap-2">
              <EyeIcon className="w-4 h-4 text-indigo-500" />
              <h4 className="text-sm font-semibold text-slate-700">Form Preview</h4>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onModeChange('float')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                title="Pop out to floating window"
              >
                <ArrowsPointingOutIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50">
            {previewContent}
          </div>
        </div>
      </>
    )
  }

  // ─── Floating Window ───
  return (
    <div
      ref={dragRef}
      className="fixed z-50 bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
      style={{ left: pos.x, top: pos.y, width: size.w, height: size.h }}
    >
      {/* Draggable Header */}
      <div
        onMouseDown={onDragStart}
        className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-violet-50 shrink-0 cursor-move select-none"
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="w-1 h-1 rounded-full bg-slate-300" />
          </div>
          <EyeIcon className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-xs font-semibold text-slate-700">Preview</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onModeChange('side')}
            className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            title="Dock to side panel"
          >
            <ArrowsPointingInIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <XMarkIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
        {previewContent}
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={onResizeStart}
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        style={{ background: 'linear-gradient(135deg, transparent 50%, #94a3b8 50%, transparent 51%, transparent 75%, #94a3b8 75%)' }}
      />
    </div>
  )
}

function PreviewFormContent({ fields }) {
  const [formValues, setFormValues] = useState({})
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (fieldName, value) => {
    setFormValues((prev) => {
      const next = { ...prev, [fieldName]: value }
      // Re-validate on change after first submit
      if (submitted) {
        const result = validateForm(fields, next)
        setErrors(result.errors)
      }
      return next
    })
  }

  const handleSubmit = () => {
    setSubmitted(true)
    const result = validateForm(fields, formValues)
    setErrors(result.errors)
  }

  const handleReset = () => {
    setFormValues({})
    setErrors({})
    setSubmitted(false)
  }

  const sorted = [...fields].sort((a, b) => a.displayOrder - b.displayOrder)

  const groups = []
  const ungrouped = []
  const groupMap = new Map()

  sorted.forEach((f) => {
    if (f.fieldGroup) {
      if (!groupMap.has(f.fieldGroup)) {
        const group = { name: f.fieldGroup, order: f.fieldGroupOrder || 999, fields: [] }
        groupMap.set(f.fieldGroup, group)
        groups.push(group)
      }
      groupMap.get(f.fieldGroup).fields.push(f)
    } else {
      ungrouped.push(f)
    }
  })

  groups.sort((a, b) => a.order - b.order)

  const renderField = (f, key) => {
    const visible = evaluateCondition(f.conditionalRules, formValues)

    return (
      <div
        key={key}
        className={`transition-all duration-200 ${visible ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden m-0 p-0'}`}
      >
        <PreviewField
          field={f}
          value={formValues[f.fieldName] ?? ''}
          onChange={(val) => handleChange(f.fieldName, val)}
          error={errors[f.fieldName]}
        />
      </div>
    )
  }

  const errorCount = Object.keys(errors).length

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 space-y-5">
        {ungrouped.length > 0 && (
          <div className="space-y-4">
            {ungrouped.map((f, i) => renderField(f, `ug-${i}`))}
          </div>
        )}

        {groups.map((group, gi) => (
          <fieldset key={gi} className="border border-slate-200 rounded-lg p-4 pt-2">
            <legend className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {group.name}
            </legend>
            <div className="space-y-4 mt-2">
              {group.fields.map((f, fi) => renderField(f, `g${gi}-${fi}`))}
            </div>
          </fieldset>
        ))}
      </div>

      {/* Validation summary */}
      {submitted && errorCount > 0 && (
        <div className="mx-5 mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
          <p className="text-xs font-semibold text-red-600">
            {errorCount} {errorCount === 1 ? 'error' : 'errors'} found
          </p>
        </div>
      )}
      {submitted && errorCount === 0 && (
        <div className="mx-5 mb-3 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
          <p className="text-xs font-semibold text-emerald-600">All fields are valid</p>
        </div>
      )}

      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
        <button
          type="button"
          onClick={handleReset}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 bg-slate-200 hover:bg-slate-300 transition-colors"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-violet-500 hover:bg-violet-600 transition-colors shadow-sm"
        >
          Validate
        </button>
      </div>
    </div>
  )
}

function PreviewField({ field, value, onChange, error }) {
  const { fieldLabel, fieldDescription, placeholder, dataType, isRequired, defaultValue, options } = field

  const label = (
    <label className="block text-sm font-medium text-slate-700 mb-1">
      {fieldLabel || 'Untitled'}
      {isRequired && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )

  const hint = fieldDescription ? (
    <p className="text-xs text-slate-400 mt-1">{fieldDescription}</p>
  ) : null

  const errorHint = error ? (
    <p className="text-xs text-red-500 mt-1">{error}</p>
  ) : null

  const errorBorder = error ? ' border-red-300 focus:ring-red-500/20 focus:border-red-400' : ''

  // Use controlled value, falling back to defaultValue on first render
  const val = value || defaultValue || ''

  switch (dataType) {
    case 'TextArea':
      return (
        <div>
          {label}
          <textarea
            rows={3}
            placeholder={placeholder || `Enter ${fieldLabel || 'text'}...`}
            value={val}
            onChange={(e) => onChange(e.target.value)}
            className={previewInputClass + ' resize-none' + errorBorder}
          />
          {errorHint || hint}
        </div>
      )

    case 'Boolean':
      return (
        <div>
          <div className="flex items-center gap-3">
            <label className="relative cursor-pointer">
              <input
                type="checkbox"
                checked={value === 'true' || value === true}
                onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-checked:bg-violet-600 rounded-full transition-colors" />
              <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-4" />
            </label>
            <span className="text-sm font-medium text-slate-700">
              {fieldLabel || 'Untitled'}
              {isRequired && <span className="text-red-500 ml-0.5">*</span>}
            </span>
          </div>
          {errorHint || hint}
        </div>
      )

    case 'Dropdown':
      return (
        <div>
          {label}
          <select
            className={previewSelectClass + errorBorder}
            value={val}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="" disabled>{placeholder || `Select ${fieldLabel || 'option'}...`}</option>
            {(options || []).sort((a, b) => a.displayOrder - b.displayOrder).map((opt, i) => (
              <option key={i} value={opt.optionValue}>{opt.optionLabel}</option>
            ))}
          </select>
          {errorHint || hint}
        </div>
      )

    case 'MultiSelect': {
      const selected = value ? (Array.isArray(value) ? value : value.split(',').filter(Boolean)) : []
      const toggleOption = (optValue) => {
        const next = selected.includes(optValue)
          ? selected.filter((v) => v !== optValue)
          : [...selected, optValue]
        onChange(next.join(','))
      }
      return (
        <div>
          {label}
          <div className={`rounded-lg border bg-white p-2.5 min-h-10 ${error ? 'border-red-300' : 'border-slate-300'}`}>
            {(options || []).length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {options.sort((a, b) => a.displayOrder - b.displayOrder).map((opt, i) => (
                  <label
                    key={i}
                    className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${
                      selected.includes(opt.optionValue)
                        ? 'bg-violet-100 text-violet-800 border-violet-300'
                        : 'bg-violet-50 text-violet-700 border-violet-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(opt.optionValue)}
                      onChange={() => toggleOption(opt.optionValue)}
                      className="w-3 h-3 rounded accent-violet-600"
                    />
                    {opt.optionLabel}
                  </label>
                ))}
              </div>
            ) : (
              <span className="text-sm text-slate-400">{placeholder || 'Select options...'}</span>
            )}
          </div>
          {errorHint || hint}
        </div>
      )
    }

    case 'Date':
      return (
        <div>
          {label}
          <input
            type="date"
            value={val}
            onChange={(e) => onChange(e.target.value)}
            className={previewInputClass + errorBorder}
          />
          {errorHint || hint}
        </div>
      )

    case 'DateTime':
      return (
        <div>
          {label}
          <input
            type="datetime-local"
            value={val}
            onChange={(e) => onChange(e.target.value)}
            className={previewInputClass + errorBorder}
          />
          {errorHint || hint}
        </div>
      )

    case 'Number':
    case 'Decimal':
    case 'Currency':
    case 'Percentage':
      return (
        <div>
          {label}
          <div className="relative">
            {dataType === 'Currency' && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">$</span>
            )}
            <input
              type="number"
              placeholder={placeholder || `Enter ${fieldLabel || 'value'}...`}
              value={val}
              onChange={(e) => onChange(e.target.value)}
              step={dataType === 'Decimal' || dataType === 'Percentage' ? '0.01' : '1'}
              className={`${previewInputClass}${errorBorder} ${dataType === 'Currency' ? 'pl-7' : ''} ${dataType === 'Percentage' ? 'pr-8' : ''}`}
            />
            {dataType === 'Percentage' && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">%</span>
            )}
          </div>
          {errorHint || hint}
        </div>
      )

    case 'Email':
      return (
        <div>
          {label}
          <input
            type="email"
            placeholder={placeholder || 'email@example.com'}
            value={val}
            onChange={(e) => onChange(e.target.value)}
            className={previewInputClass + errorBorder}
          />
          {errorHint || hint}
        </div>
      )

    case 'Phone':
      return (
        <div>
          {label}
          <input
            type="tel"
            placeholder={placeholder || '+1 (555) 000-0000'}
            value={val}
            onChange={(e) => onChange(e.target.value)}
            className={previewInputClass + errorBorder}
          />
          {errorHint || hint}
        </div>
      )

    case 'Url':
      return (
        <div>
          {label}
          <input
            type="url"
            placeholder={placeholder || 'https://example.com'}
            value={val}
            onChange={(e) => onChange(e.target.value)}
            className={previewInputClass + errorBorder}
          />
          {errorHint || hint}
        </div>
      )

    case 'File':
    case 'Image':
      return (
        <div>
          {label}
          <div className={`rounded-lg border-2 border-dashed bg-slate-50 p-4 text-center cursor-default ${error ? 'border-red-300' : 'border-slate-300'}`}>
            <div className="text-slate-400 text-xs font-medium">
              {dataType === 'Image' ? 'Click or drag image here' : 'Click or drag file here'}
            </div>
            <div className="text-[10px] text-slate-300 mt-1">
              {dataType === 'Image' ? 'JPG, PNG, GIF up to 10MB' : 'Any file type'}
            </div>
          </div>
          {errorHint || hint}
        </div>
      )

    default: // Text
      return (
        <div>
          {label}
          <input
            type="text"
            placeholder={placeholder || `Enter ${fieldLabel || 'text'}...`}
            value={val}
            onChange={(e) => onChange(e.target.value)}
            className={previewInputClass + errorBorder}
          />
          {errorHint || hint}
        </div>
      )
  }
}
