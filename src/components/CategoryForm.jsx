import { useForm } from 'react-hook-form'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function CategoryForm({ initial, onSave, onCancel, saving }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      categoryName: initial?.categoryName || '',
      description: initial?.description || '',
      iconClass: initial?.iconClass || '',
      isActive: initial?.isActive ?? true,
    },
  })

  const onSubmit = (data) => onSave(data)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      {/* Panel */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl ring-1 ring-slate-900/5 p-0 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {initial ? 'Edit Category' : 'New Category'}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                {initial ? 'Update category details' : 'Create a new product category'}
              </p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Category Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                {...register('categoryName', {
                  required: 'Category name is required',
                  maxLength: { value: 100, message: 'Max 100 characters' },
                })}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                  errors.categoryName
                    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-400'
                    : 'border-slate-200 focus:ring-violet-500/20 focus:border-violet-400'
                }`}
                placeholder="e.g. Vehicles, Electronics"
              />
              {errors.categoryName && (
                <p className="mt-1.5 text-xs text-red-500">{errors.categoryName.message}</p>
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
              {errors.iconClass && (
                <p className="mt-1.5 text-xs text-red-500">{errors.iconClass.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                {...register('description', {
                  maxLength: { value: 500, message: 'Max 500 characters' },
                })}
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 focus:ring-offset-0 resize-none"
                placeholder="Brief description of this category"
              />
              {errors.description && (
                <p className="mt-1.5 text-xs text-red-500">{errors.description.message}</p>
              )}
            </div>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  {...register('isActive')}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-slate-200 peer-checked:bg-violet-600 rounded-full transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-4" />
              </div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                Active
              </span>
            </label>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  initial ? 'Update Category' : 'Create Category'
                )}
              </button>
              <button
                type="button"
                onClick={onCancel}
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
