import { useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'
import {
  PlusIcon,
  PencilSquareIcon,
  ChevronRightIcon,
  FolderOpenIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline'
import { useProductTypes, useCategories, useFieldDefinitions, useUploadProductTypeThumbnail } from '../api/hooks'
import ProductTypeForm from '../components/ProductTypeForm'
import Toggle from '../components/Toggle'
import { useQueryClient } from '@tanstack/react-query'

export default function ProductTypes() {
  const qc = useQueryClient()
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



  const handleToggle = (typeId) => {
    if (typeId == null) return
    api.put(`/products/toggle-visibility/${typeId}`).then(() => {
      qc.invalidateQueries({ queryKey: ['productTypes', categoryId] })
    }).catch((error) => {
      console.error(error)
    })
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
      {showForm ? (
        /* Banner Header for Edit / Create */
        <div className="relative rounded-xl overflow-hidden mb-8 h-44 sm:h-52 shadow-lg">
          {/* Background */}
          {editing?.thumbnailUrl ? (
            <img
              src={editing.thumbnailUrl}
              alt={editing.typeName}
              className="absolute inset-0 w-full h-full object-cover scale-[1.02]"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700" />
          )}
          {/* Dark overlay — heavier for legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          {/* Subtle top vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent h-20" />
          {/* Caption */}
          <div className="relative h-full flex items-end p-6 sm:p-8">
            <div>
              <h2
                className="text-2xl sm:text-3xl font-bold text-white"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.4)' }}
              >
                {editing ? editing.typeName : 'New Product Type'}
              </h2>
              <p
                className="text-sm sm:text-base text-white/90 mt-1.5 font-medium"
                style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
              >
                {editing
                  ? `Editing product type in ${category?.categoryName || 'this category'}`
                  : `Creating in ${category?.categoryName || 'this category'}`}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Regular Header for List */
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {category?.categoryName || 'Product'} Types
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {types.length} {types.length === 1 ? 'type' : 'types'}
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white pl-4 pr-5 py-2.5 rounded-xl text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
          >
            <PlusIcon className="w-4 h-4" />
            New Product Type
          </button>
        </div>
      )}

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
            <div className="flex items-center justify-center py-12 bg-white rounded-2xl border border-slate-200">
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

      {/* Product Type Grid — WordPress-inspired media cards */}
      {!showForm && (
        <>
          {types.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {types.map((type) => (
                <div
                  key={type.id}
                  className="group bg-white rounded-xl border border-slate-200 hover:border-violet-300 hover:shadow-md hover:shadow-violet-100/50 transition-all duration-200 overflow-hidden flex flex-col"
                >
                  {/* Featured Image */}
                  <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
                    {uploadThumbnail.isPending && uploadTargetId === type.id ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-violet-50/80">
                        <svg className="animate-spin w-8 h-8 text-violet-500" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      </div>
                    ) : type.thumbnailUrl ? (
                      <button
                        type="button"
                        onClick={() => handleThumbnailClick(type.id)}
                        className="block w-full h-full cursor-pointer group/thumb"
                        title="Change thumbnail"
                      >
                        <img
                          src={type.thumbnailUrl}
                          alt={type.typeName}
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
                        onClick={() => handleThumbnailClick(type.id)}
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

                    {/* Status badge */}
                    <div className="absolute top-2.5 left-2.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-sm ${type.isActive
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-slate-800/70 text-slate-200'
                          }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${type.isActive ? 'bg-white' : 'bg-slate-400'}`} />
                        {type.isActive ? 'Active' : 'Draft'}
                      </span>
                    </div>

                    {/* Order badge */}
                    <div className="absolute top-2.5 right-2.5">
                      <span className="text-[10px] font-mono font-bold text-white/90 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded">
                        #{type.displayOrder}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex-1 p-4 flex flex-col">
                    <div className="flex-1 flex items-start justify-between min-w-0">
                      <nav>
                        <h3 className="text-sm font-semibold text-slate-900 truncate leading-tight">
                          {type.typeName}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {type.description || 'No description'}
                        </p>
                      </nav>
                      {/* <button >
                        {type.isActive ? "true" : "false"}
                        {type.id}
                      </button> */}
                      <Toggle onCheck={() => handleToggle(type.id)} checked={type.isActive} />
                    </div>

                    {/* Action Row */}
                    <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => handleEdit(type)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-white hover:bg-violet-600 bg-violet-50 px-2.5 py-1.5 rounded-lg transition-all"
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
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
              <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mb-4">
                <FolderOpenIcon className="w-8 h-8 text-violet-300" />
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
