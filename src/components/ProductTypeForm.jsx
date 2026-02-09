import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useCreateProductType, useUpdateProductType } from '../api/hooks'
import FieldDefinitionBuilder from './FieldDefinitionBuilder'

export default function ProductTypeForm({ categoryId, initial, initialFields, onDone, onCancel }) {
  const [currentType, setCurrentType] = useState(initial || null)
  const isEditing = !!currentType

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      typeName: initial?.typeName || '',
      description: initial?.description || '',
      iconClass: initial?.iconClass || '',
      displayOrder: initial?.displayOrder || 1,
    },
  })

  const [fields, setFields] = useState(() => {
    if (initialFields && initialFields.length > 0) {
      return initialFields.map((f) => ({
        id: f.fieldDefinitionId || null,
        fieldName: f.fieldName,
        fieldLabel: f.fieldLabel,
        fieldDescription: f.fieldDescription || '',
        placeholder: f.placeholder || '',
        dataType: f.dataType,
        isRequired: f.isRequired,
        isUnique: f.isUnique,
        displayOrder: f.displayOrder,
        fieldGroup: f.fieldGroup || '',
        fieldGroupOrder: f.fieldGroupOrder || null,
        defaultValue: f.defaultValue || '',
        validationRules: f.validationRules ? normalizeKeys(f.validationRules) : null,
        conditionalRules: f.conditionalRules ? normalizeKeys(f.conditionalRules) : null,
        fieldProperties: f.fieldProperties ? normalizeKeys(f.fieldProperties) : null,
        options: (f.options || []).map((o) => ({
          id: o.id || null,
          optionValue: o.optionValue,
          optionLabel: o.optionLabel,
          displayOrder: o.displayOrder,
        })),
      }))
    }
    return []
  })

  const [submitError, setSubmitError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  const createMutation = useCreateProductType()
  const updateMutation = useUpdateProductType()
  const saving = createMutation.isPending || updateMutation.isPending

  const onSubmit = (formData) => {
    setSubmitError(null)
    setSuccessMsg(null)
    const payload = {
      ...formData,
      displayOrder: parseInt(formData.displayOrder) || 1,
      fieldDefinitions: fields.map((f) => ({
        ...(f.id ? { id: f.id } : {}),
        fieldName: f.fieldName,
        fieldLabel: f.fieldLabel,
        fieldDescription: f.fieldDescription || null,
        placeholder: f.placeholder || null,
        dataType: f.dataType,
        isRequired: f.isRequired,
        isUnique: f.isUnique,
        displayOrder: f.displayOrder,
        fieldGroup: f.fieldGroup || null,
        fieldGroupOrder: f.fieldGroupOrder || null,
        defaultValue: f.defaultValue || null,
        validationRules: cleanNulls(f.validationRules),
        conditionalRules: cleanNulls(f.conditionalRules),
        fieldProperties: cleanNulls(f.fieldProperties),
        options: f.options.map((o) => ({
          ...(o.id ? { id: o.id } : {}),
          optionValue: o.optionValue,
          optionLabel: o.optionLabel,
          displayOrder: o.displayOrder,
        })),
      })),
    }

    if (isEditing) {
      updateMutation.mutate(
        { categoryId, typeId: currentType.id, data: payload },
        {
          onSuccess: () => {
            setSuccessMsg('Product type updated successfully!')
            setTimeout(() => setSuccessMsg(null), 4000)
          },
          onError: (err) => setSubmitError(err.message),
        }
      )
    } else {
      createMutation.mutate(
        { categoryId, data: payload },
        {
          onSuccess: (data) => {
            // Merge form data with API response (which provides the id)
            const created = typeof data === 'object' && data !== null ? data : {}
            setCurrentType({
              ...payload,
              ...created,
              id: created.id || created.Id || created.productTypeId || created.ProductTypeId,
              typeName: payload.typeName,
            })
            setSuccessMsg('Product type created! You can now add field definitions.')
            setTimeout(() => setSuccessMsg(null), 4000)
          },
          onError: (err) => setSubmitError(err.message),
        }
      )
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Product Type Info Card */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-semibold text-slate-900">
            {isEditing ? `Edit: ${currentType.typeName}` : 'New Product Type'}
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {isEditing ? 'Update product type details and fields' : 'Define a new product type and its fields'}
          </p>
        </div>

        {/* Success */}
        {successMsg && (
          <div className="mx-6 mt-4 flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {successMsg}
          </div>
        )}

        {/* Error */}
        {submitError && (
          <div className="mx-6 mt-4 flex items-center gap-3 p-3 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm">
            {submitError}
          </div>
        )}

        {/* Fields */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Type Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                {...register('typeName', {
                  required: 'Type name is required',
                  maxLength: { value: 100, message: 'Max 100 characters' },
                })}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                  errors.typeName
                    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-400'
                    : 'border-slate-200 focus:ring-violet-500/20 focus:border-violet-400'
                }`}
                placeholder="e.g. Car, Truck"
              />
              {errors.typeName && (
                <p className="mt-1.5 text-xs text-red-500">{errors.typeName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Icon Class
              </label>
              <input
                type="text"
                {...register('iconClass', {
                  maxLength: { value: 50, message: 'Max 50 characters' },
                })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 focus:ring-offset-0"
                placeholder="e.g. fas fa-car"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Display Order <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                {...register('displayOrder', {
                  required: 'Display order is required',
                  min: { value: 1, message: 'Must be at least 1' },
                  valueAsNumber: true,
                })}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                  errors.displayOrder
                    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-400'
                    : 'border-slate-200 focus:ring-violet-500/20 focus:border-violet-400'
                }`}
              />
              {errors.displayOrder && (
                <p className="mt-1.5 text-xs text-red-500">{errors.displayOrder.message}</p>
              )}
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                {...register('description', {
                  maxLength: { value: 500, message: 'Max 500 characters' },
                })}
                rows={2}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 focus:ring-offset-0 resize-none"
                placeholder="Brief description of this product type"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Field Definitions — only available for existing product types */}
      {isEditing ? (
        <FieldDefinitionBuilder fields={fields} setFields={setFields} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
          <p className="text-sm text-slate-500">
            Save the product type first, then you can add field definitions.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/20"
        >
          {saving ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </>
          ) : (
            isEditing ? 'Update Product Type' : 'Create Product Type'
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          Back to List
        </button>
      </div>
    </form>
  )
}

function normalizeKeys(obj) {
  if (!obj || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(normalizeKeys)
  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    const camel = key.charAt(0).toLowerCase() + key.slice(1)
    result[camel] = normalizeKeys(value)
  }
  return result
}

function cleanNulls(obj) {
  if (!obj || typeof obj !== 'object') return null
  const cleaned = {}
  let hasValue = false
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined && value !== '' && value !== false) {
      cleaned[key] = value
      hasValue = true
    }
  }
  return hasValue ? cleaned : null
}
