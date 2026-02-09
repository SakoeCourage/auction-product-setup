import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowRightIcon,
  FolderOpenIcon,
  Squares2X2Icon,
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
            Manage your auction product categories
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

      {/* Category List */}
      {categories.length > 0 ? (
        <div className="space-y-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="group bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden"
            >
              <div className="flex items-stretch">
                {/* Thumbnail Area */}
                <div className="w-40 sm:w-52 shrink-0 relative bg-slate-100">
                  {uploadThumbnail.isPending && uploadTargetId === cat.id ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-violet-50">
                      <svg className="animate-spin w-7 h-7 text-violet-500" viewBox="0 0 24 24">
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
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-white/90 rounded-xl px-3 py-2 flex items-center gap-2">
                          <PhotoIcon className="w-4 h-4 text-slate-700" />
                          <span className="text-xs font-medium text-slate-700">Change</span>
                        </div>
                      </div>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleThumbnailClick(cat.id)}
                      className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-50 to-slate-100 hover:from-violet-50 hover:to-indigo-50 border-r border-dashed border-slate-200 transition-colors cursor-pointer min-h-[120px]"
                      title="Upload thumbnail"
                    >
                      <PhotoIcon className="w-8 h-8 text-slate-300" />
                      <span className="text-[11px] font-medium text-slate-400">Add Image</span>
                    </button>
                  )}
                  {/* Active indicator stripe */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${cat.isActive ? 'bg-gradient-to-b from-violet-500 to-indigo-500' : 'bg-slate-300'}`} />
                </div>

                {/* Content */}
                <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-slate-900 truncate">
                          {cat.categoryName}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full shrink-0 ${
                            cat.isActive
                              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10'
                              : 'bg-slate-100 text-slate-500 ring-1 ring-slate-900/5'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${cat.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                        {cat.description || 'No description provided'}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 font-mono bg-slate-50 px-2.5 py-1 rounded-lg shrink-0 ring-1 ring-slate-900/5">
                      #{cat.displayOrder}
                    </span>
                  </div>

                  {/* Bottom actions */}
                  <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 rounded-lg transition-colors ring-1 ring-slate-900/5"
                    >
                      <PencilSquareIcon className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(cat)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-lg transition-colors ring-1 ring-red-600/10"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                      Delete
                    </button>
                    <button
                      onClick={() => navigate(`/categories/${cat.id}/types`)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 px-4 py-2 rounded-lg transition-all shadow-sm shadow-violet-500/10"
                    >
                      Product Types
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl ring-1 ring-slate-900/5">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
            <FolderOpenIcon className="w-8 h-8 text-slate-400" />
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
