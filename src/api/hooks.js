import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryThumbnail,
  getProductTypes,
  createProductType,
  updateProductType,
  uploadProductTypeThumbnail,
  getFieldDefinitions,
} from './client'

// ── Categories ──────────────────────────────────────────────

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => createCategory(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, force }) => deleteCategory(id, force),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useUploadCategoryThumbnail() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, file }) => uploadCategoryThumbnail(categoryId, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  })
}

// ── Product Types ───────────────────────────────────────────

export function useProductTypes(categoryId) {
  return useQuery({
    queryKey: ['productTypes', categoryId],
    queryFn: () => getProductTypes(categoryId),
    enabled: !!categoryId,
  })
}

export function useCreateProductType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, data }) => createProductType(categoryId, data),
    onSuccess: (_data, variables) =>
      qc.invalidateQueries({ queryKey: ['productTypes', variables.categoryId] }),
  })
}

export function useUpdateProductType() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, typeId, data }) =>
      updateProductType(categoryId, typeId, data),
    onSuccess: (_data, variables) =>
      qc.invalidateQueries({ queryKey: ['productTypes', variables.categoryId] }),
  })
}

export function useUploadProductTypeThumbnail() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, typeId, file }) =>
      uploadProductTypeThumbnail(categoryId, typeId, file),
    onSuccess: (_data, variables) =>
      qc.invalidateQueries({ queryKey: ['productTypes', variables.categoryId] }),
  })
}

// ── Field Definitions ───────────────────────────────────────

export function useFieldDefinitions(typeId) {
  return useQuery({
    queryKey: ['fieldDefinitions', typeId],
    queryFn: () => getFieldDefinitions(typeId),
    enabled: !!typeId,
  })
}
