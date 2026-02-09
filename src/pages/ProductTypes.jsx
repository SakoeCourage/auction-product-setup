import { useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  PlusIcon,
  PencilSquareIcon,
  ChevronRightIcon,
  CubeIcon,
  FolderOpenIcon,
  ExclamationTriangleIcon,
  HomeIcon,
} from '@heroicons/react/24/outline'
import { useProductTypes, useCategories, useFieldDefinitions, useUploadProductTypeThumbnail } from '../api/hooks'
import ProductTypeForm from '../components/ProductTypeForm'

export default function ProductTypes() {
  const { categoryId } = useParams()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [editTypeId, setEditTypeId] = useState(null)
  const thumbnailInputRef = useRef(null)
  const [uploadTargetId, setUploadTargetId] = useState(null)

  const { data: types = [], isLoading: typesLoading, error: typesError } = useProductTypes(categoryId)
  const { data: categories = [] } = useCategories()
  const { data: editingFields, isLoading: fieldsLoading } = useFieldDefinitions(editTypeId)
  const uploadThumbnail = useUploadProductTypeThumbnail()

  const category = categories.find((c) => String(c.id) === String(categoryId))
  const loading = typesLoading

  const handleThumbnailClick = (typeId) => {
    setUploadTargetId(typeId)
    thumbnailInputRef.current?.click()
  }

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0]
    if (file && uploadTargetId) {
      uploadThumbnail.mutate(
        { categoryId, typeId: uploadTargetId, file },
        { onSettled: () => setUploadTargetId(null) }
      )
    } else {
      setUploadTargetId(null)
    }
    e.target.value = ''
  }

  const handleEdit = (type) => {
    setEditing(type)
    setEditTypeId(type.id)
    setShowForm(true)
  }

  const handleCreate = () => {
    setEditing(null)
    setEditTypeId(null)
    setShowForm(true)
  }

  const handleDone = () => {
    setShowForm(false)
    setEditing(null)
    setEditTypeId(null)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
        <p className="mt-4 text-sm text-slate-500">Loading product types...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm mb-6">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-slate-400 hover:text-violet-600 transition-colors"
        >
          <HomeIcon className="w-4 h-4" />
          Categories
        </Link>
        <ChevronRightIcon className="w-3.5 h-3.5 text-slate-300" />
        {showForm ? (
          <>
            <button
              type="button"
              onClick={handleDone}
              className="text-slate-400 hover:text-violet-600 transition-colors"
            >
              {category?.categoryName || 'Unknown'} Types
            </button>
            <ChevronRightIcon className="w-3.5 h-3.5 text-slate-300" />
            <span className="font-medium text-slate-700">
              {editing ? editing.typeName : 'New Type'}
            </span>
          </>
        ) : (
          <span className="font-medium text-slate-700">
            {category?.categoryName || 'Unknown'}
          </span>
        )}
      </nav>

      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {category?.categoryName || 'Product'} Types
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage product types for <strong>{category?.categoryName || 'this category'}</strong>
          </p>
        </div>
        {!showForm && (
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white pl-4 pr-5 py-2.5 rounded-xl text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
          >
            <PlusIcon className="w-4 h-4" />
            New Product Type
          </button>
        )}
      </div>

      {/* Error */}
      {typesError && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-400 shrink-0" />
          <span>{typesError.message}</span>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="mb-8">
          {editing && fieldsLoading ? (
            <div className="flex items-center justify-center py-12 bg-white rounded-2xl ring-1 ring-slate-900/5">
              <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
              <p className="ml-3 text-sm text-slate-500">Loading field definitions...</p>
            </div>
          ) : (
            <ProductTypeForm
              categoryId={categoryId}
              initial={editing}
              initialFields={editing ? editingFields : null}
              onDone={handleDone}
              onCancel={handleDone}
            />
          )}
        </div>
      )}

      {/* Product Type Cards */}
      {!showForm && (
        <>
          {types.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {types.map((type) => (
                <div
                  key={type.id}
                  className="group bg-white rounded-2xl shadow-sm ring-1 ring-slate-900/5 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden"
                >
                  {/* Card Top Accent */}
                  <div className={`h-1 ${type.isActive ? 'bg-gradient-to-r from-violet-500 to-indigo-500' : 'bg-slate-200'}`} />

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 min-w-0">
                        {uploadThumbnail.isPending && uploadTargetId === type.id ? (
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-indigo-50">
                            <svg className="animate-spin w-5 h-5 text-indigo-500" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          </div>
                        ) : type.thumbnailUrl ? (
                          <button
                            type="button"
                            onClick={() => handleThumbnailClick(type.id)}
                            className="relative w-10 h-10 rounded-xl shrink-0 overflow-hidden group/thumb cursor-pointer"
                            title="Change thumbnail"
                          >
                            <img src={type.thumbnailUrl} alt={type.typeName} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                              <PencilSquareIcon className="w-4 h-4 text-white" />
                            </div>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleThumbnailClick(type.id)}
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-indigo-50 hover:bg-indigo-100 border-2 border-dashed border-indigo-200 hover:border-indigo-400 transition-colors cursor-pointer"
                            title="Upload thumbnail"
                          >
                            <PencilSquareIcon className="w-4 h-4 text-indigo-400" />
                          </button>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate">
                            {type.typeName}
                          </h3>
                          <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">
                            {type.description || 'No description'}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg shrink-0 ${
                          type.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${type.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {type.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <span className="text-xs text-slate-400 font-medium">
                        Order #{type.displayOrder}
                      </span>
                      <button
                        onClick={() => handleEdit(type)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <PencilSquareIcon className="w-3.5 h-3.5" />
                        Edit / Fields
                      </button>
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
              <h3 className="text-base font-semibold text-slate-900 mb-1">No product types yet</h3>
              <p className="text-sm text-slate-500 mb-6">Create your first product type for this category</p>
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-500/20"
              >
                <PlusIcon className="w-4 h-4" />
                Create Product Type
              </button>
            </div>
          )}
        </>
      )}

      {/* Hidden file input for thumbnail upload */}
      <input
        ref={thumbnailInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleThumbnailChange}
      />
    </div>
  )
}
