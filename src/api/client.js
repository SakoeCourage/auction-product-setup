import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (res) => res.data,
  (error) => {
    const msg =
      error.response?.data?.message ||
      error.response?.data?.Message ||
      `Request failed: ${error.response?.status || 'Network error'}`
    return Promise.reject(new Error(msg))
  }
)

// Categories
export const getCategories = () => api.get('/products/categories')
export const createCategory = (data) => api.post('/products/categories', data)
export const updateCategory = (id, data) => api.put(`/products/categories/${id}`, data)

export const deleteCategory = (id, force = false) =>
  api.delete(`/products/categories/${id}?forceDelete=${force}`)
export const uploadCategoryThumbnail = (categoryId, file) => {
  const formData = new FormData()
  formData.append('thumbnail', file)
  return api.post(`/products/categories/${categoryId}/thumbnail`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// Product Types
export const getProductTypes = (categoryId) =>
  api.get(`/products/categories/${categoryId}/types`)
export const createProductType = (categoryId, data) =>
  api.post(`/products/categories/${categoryId}/types`, data)
export const updateProductType = (categoryId, typeId, data) =>
  api.put(`/products/categories/${categoryId}/types/${typeId}`, data)
export const uploadProductTypeThumbnail = (categoryId, typeId, file) => {
  const formData = new FormData()
  formData.append('thumbnail', file)
  return api.post(`/products/categories/${categoryId}/types/${typeId}/thumbnail`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// Field Definitions
export const getFieldDefinitions = (typeId) =>
  api.get(`/products/types/${typeId}/fields`)
