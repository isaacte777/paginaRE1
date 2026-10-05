const API_BASE_URL = '/api'

async function fetchAPI(endpoint, params = {}) {
  const queryString = new URLSearchParams(params).toString()
  const url = `${API_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`
  
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

export async function getProducts(params = {}) {
  return fetchAPI('/products.php', params)
}

export async function getProduct(id) {
  return fetchAPI('/products.php', { id })
}

export async function getCategories() {
  return fetchAPI('/categories.php')
}

export async function compareProduct(id) {
  return fetchAPI('/compare.php', { id })
}
