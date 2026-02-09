import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowRightIcon,
  FolderOpenIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline'
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useUploadCategoryThumbnail,
} from '../api/hooks'
import CategoryForm from '../components/CategoryForm'

export default function Categories() {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const thumbnailInputRef = useRef(null)
  const [uploadTargetId, setUploadTargetId] = useState(null)
  const navigate = useNavigate()

  const { data: categories = [], isLoading, error } = useCategories()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()
  const uploadThumbnail = useUploadCategoryThumbnail()

  const handleThumbnailClick = (catId) => {
    setUploadTargetId(catId)
    thumbnailInputRef.current?.click()
  }

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0]
    if (file && uploadTargetId) {
      uploadThumbnail.mutate(
        { categoryId: uploadTargetId, file },
        { onSettled: () => setUploadTargetId(null) }
      )
    } else {
      setUploadTargetId(null)
    }
    e.target.value = ''
  }

  const saveMutation = editing ? updateMutation : createMutation

  const handleSave = (formData) => {
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, data: formData },
        { onSuccess: () => { setShowForm(false); setEditing(null) } }
      )
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => { setShowForm(false); setEditing(null) },
      })
    }
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteMutation.mutate(
      { id: deleteTarget.id, force: false },
      { onSuccess: () => setDeleteTarget(null) }
    )
  }

  const handleEdit = (cat) => {
    setEditing(cat)
    setShowForm(true)
  }

  // Loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
        <p className="mt-4 text-sm text-slate-500">Loading categories...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Product Categories</h2>
          <p className="text-sm text-slate-500 mt-1">
            {categories.length} {categories.length === 1 ? 'category' : 'categories'}
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white pl-4 pr-5 py-2.5 rounded-xl text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
        >
          <PlusIcon className="w-4 h-4" />
          New Category
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error.message}</span>
        </div>
      )}

      {/* Category Grid — WordPress-inspired media cards */}
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="group bg-white rounded-xl border border-slate-200 hover:border-violet-300 hover:shadow-md hover:shadow-violet-100/50 transition-all duration-200 overflow-hidden flex flex-col"
            >
              {/* Featured Image — big & prominent like WP media */}
              <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
                {uploadThumbnail.isPending && uploadTargetId === cat.id ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-violet-50/80">
                    <svg className="animate-spin w-8 h-8 text-violet-500" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  </div>
                ) : cat.thumbnailUrl ? (
                  <button
                    type="button"
                    onClick={() => handleThumbnailClick(cat.id)}
                    className="block w-full h-full cursor-pointer group/thumb"
                    title="Change thumbnail"
                  >
                    <img
                      src={cat.thumbnailUrl}
                      alt={cat.categoryName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/40 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover/thumb:opacity-100 transition-opacity bg-white rounded-lg px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
                        <PhotoIcon className="w-4 h-4 text-slate-600" />
                        <span className="text-xs font-medium text-slate-700">Change</span>
                      </div>
                    </div>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleThumbnailClick(cat.id)}
                    className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-50 via-white to-slate-100 hover:from-violet-50 hover:via-white hover:to-indigo-50 transition-colors cursor-pointer"
                    title="Upload thumbnail"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-violet-100 transition-colors">
                      <PhotoIcon className="w-6 h-6 text-slate-300 group-hover:text-violet-400 transition-colors" />
                    </div>
                    <span className="text-xs font-medium text-slate-400 group-hover:text-violet-500 transition-colors">
                      Set featured image
                    </span>
                  </button>
                )}

                {/* Status badge overlaid on image */}
                <div className="absolute top-2.5 left-2.5">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-sm ${
                      cat.isActive
                        ? 'bg-emerald-500/90 text-white'
                        : 'bg-slate-800/70 text-slate-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${cat.isActive ? 'bg-white' : 'bg-slate-400'}`} />
                    {cat.isActive ? 'Active' : 'Draft'}
                  </span>
                </div>

                {/* Order badge */}
                <div className="absolute top-2.5 right-2.5">
                  <span className="text-[10px] font-mono font-bold text-white/90 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded">
                    #{cat.displayOrder}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex-1 p-4 flex flex-col">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 truncate leading-tight">
                    {cat.categoryName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {cat.description || 'No description'}
                  </p>
                </div>

                {/* Action Row — clean WP-style row actions */}
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => navigate(`/categories/${cat.id}/types`)}
                    className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-semibold text-violet-600 hover:text-white hover:bg-violet-600 bg-violet-50 px-2.5 py-1.5 rounded-lg transition-all"
                  >
                    Types
                    <ArrowRightIcon className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleEdit(cat)}
                    className="inline-flex items-center justify-center w-8 h-8 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(cat)}
                    className="inline-flex items-center justify-center w-8 h-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
          <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mb-4">
            <FolderOpenIcon className="w-8 h-8 text-violet-300" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">No categories yet</h3>
          <p className="text-sm text-slate-500 mb-6">Get started by creating your first product category</p>
          <button
            onClick={() => { setEditing(null); setShowForm(true) }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-500/20"
          >
            <PlusIcon className="w-4 h-4" />
            Create Category
          </button>
        </div>
      )}

      {/* Category Form Modal */}
      {showForm && (
        <CategoryForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null) }}
          saving={saveMutation.isPending}
        />
      )}

      {/* Hidden file input for thumbnail upload */}
      <input
        ref={thumbnailInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleThumbnailChange}
      />

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl ring-1 ring-slate-900/5 p-6 text-center">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrashIcon className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Category</h3>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to delete <strong>"{deleteTarget.categoryName}"</strong>?
                This will soft-delete the category.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
