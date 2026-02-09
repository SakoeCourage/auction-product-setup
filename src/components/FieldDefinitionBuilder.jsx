import { useState } from 'react'
import {
  PlusIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Bars3Icon,
  XMarkIcon,
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
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
            <Bars3Icon className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Field Definitions
            </h3>
            <p className="text-xs text-slate-500">
              {fields.length} {fields.length === 1 ? 'field' : 'fields'} defined
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 bg-emerald-600 text-white pl-3 pr-4 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <PlusIcon className="w-3.5 h-3.5" />
          Add Field
        </button>
      </div>

      {/* Fields List */}
      <div className="p-4">
        {fields.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
              <Bars3Icon className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">No fields defined</p>
            <p className="text-xs text-slate-400 mb-4">Add fields to define the product type schema</p>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              Add Field
            </button>
          </div>
        ) : (
          <div className="space-y-3">
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
        )}
      </div>

      {/* Add Field Modal */}
      {showAddModal && (
        <AddFieldModal
          onAdd={handleAddField}
          onClose={() => setShowAddModal(false)}
          allFields={fields}
        />
      )}
    </div>
  )
}

/* ── Add Field Modal ─────────────────────────────────────── */

function AddFieldModal({ onAdd, onClose, allFields }) {
  const [field, setField] = useState(emptyField())

  const update = (updates) => setField({ ...field, ...updates })

  const handleSubmit = (e) => {
    e.preventDefault()
    onAdd(field)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="flex min-h-full items-start justify-center p-4 pt-10">
        <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl ring-1 ring-slate-900/5 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Add New Field</h3>
              <p className="text-sm text-slate-500 mt-0.5">Define a new field for this product type</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Basic Information */}
            <SectionLabel text="Basic Information" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className={labelClass}>Field Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  required
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
                  required
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
                  required
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
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100 sticky bottom-0 bg-white pb-1">
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg shadow-emerald-500/20"
              >
                <PlusIcon className="w-4 h-4" />
                Add Field
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function FieldCard({ field, index, expanded, onToggle, onChange, onRemove, allFields }) {
  return (
    <div className={`rounded-xl border transition-all duration-200 ${expanded ? 'border-violet-200 ring-1 ring-violet-100 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
      {/* Header */}
      <div
        onClick={onToggle}
        className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${expanded ? 'bg-violet-50/50' : 'hover:bg-slate-50'}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xs font-mono bg-slate-100 text-slate-500 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-semibold">
            {field.displayOrder}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900 text-sm truncate">
                {field.fieldLabel || 'Untitled Field'}
              </span>
              {field.fieldName && (
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  {field.fieldName}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${TYPE_COLORS[field.dataType] || 'bg-slate-100 text-slate-600'}`}>
                {field.dataType}
              </span>
              {field.isRequired && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-red-50 text-red-600">
                  Required
                </span>
              )}
              {field.fieldGroup && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-violet-50 text-violet-600 hidden sm:inline">
                  {field.fieldGroup}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
          {expanded ? (
            <ChevronUpIcon className="w-4 h-4 text-violet-500" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {/* Expanded Form */}
      {expanded && (
        <div className="px-4 pb-4 space-y-5 border-t border-slate-100">
          {/* Basic Info */}
          <div className="pt-4">
            <SectionLabel text="Basic Information" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              <div>
                <label className={labelClass}>Field Name *</label>
                <input
                  type="text"
                  required
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
                  required
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
                  required
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

  const borderColors = {
    slate: 'border-slate-200',
    blue: 'border-blue-200',
    amber: 'border-amber-200',
    emerald: 'border-emerald-200',
  }
  const textColors = {
    slate: 'text-slate-600',
    blue: 'text-blue-600',
    amber: 'text-amber-600',
    emerald: 'text-emerald-600',
  }
  const bgColors = {
    slate: 'bg-slate-50',
    blue: 'bg-blue-50',
    amber: 'bg-amber-50',
    emerald: 'bg-emerald-50',
  }

  return (
    <div className={`rounded-xl border ${borderColors[color]} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold ${textColors[color]} ${bgColors[color]} hover:opacity-80 transition-opacity`}
      >
        <span>{title}</span>
        {open ? (
          <ChevronUpIcon className="w-3.5 h-3.5" />
        ) : (
          <ChevronDownIcon className="w-3.5 h-3.5" />
        )}
      </button>
      {open && (
        <div className="p-4 bg-white">
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
                required
                value={opt.optionValue}
                onChange={(e) => updateOption(i, { optionValue: e.target.value })}
                className={inputClass}
                placeholder="sedan"
              />
              <input
                type="text"
                required
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
