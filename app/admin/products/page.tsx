'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Package, Eye, EyeOff, Filter, Download, FileText, Copy } from 'lucide-react'
import { toast } from '@/components/toast'
import AdminLayout from '@/components/admin/AdminLayout'
import ProductModal from './ProductModal'

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchProducts()
  }, [router])

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      } else {
        toast.error('Failed to fetch products')
      }
    } catch (error) {
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = () => {
    setSelectedProduct(null)
    setModalOpen(true)
  }

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product)
    setModalOpen(true)
  }

  const handleDuplicateProduct = async (product: any) => {
    try {
      const token = localStorage.getItem('admin_token')
      
      // Create a copy of the product with modified name and slug
      const duplicatedProduct = {
        ...product,
        name: `${product.name} (Copy)`,
        slug: `${product.slug}-copy-${Date.now()}`,
        variants: product.variants.map((v: any) => ({
          ...v,
          id: undefined, // Remove ID so new ones are generated
          sku: `${v.sku}-COPY-${Date.now().toString().slice(-4)}` // Unique SKU
        })),
        features: product.features.map((f: any) => ({
          ...f,
          id: undefined // Remove ID so new ones are generated
        }))
      }

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(duplicatedProduct)
      })

      if (response.ok) {
        toast.success('Product duplicated successfully')
        fetchProducts()
      } else {
        toast.error('Failed to duplicate product')
      }
    } catch (error) {
      toast.error('Failed to duplicate product')
    }
  }

  const handleDeleteProduct = async (product: any, forceDelete: boolean = false) => {
    const confirmMessage = forceDelete
      ? `⚠️ FORCE DELETE: This will permanently delete "${product.name}" and ALL its data, even if referenced in orders. This action CANNOT be undone. Are you absolutely sure?`
      : `Are you sure you want to delete "${product.name}"? (It will be deactivated if it has orders)`
    
    if (!confirm(confirmMessage)) return

    try {
      const token = localStorage.getItem('admin_token')
      const url = forceDelete 
        ? `/api/admin/products/${product.id}?force=true`
        : `/api/admin/products/${product.id}`
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message || 'Product deleted')
        fetchProducts()
      } else {
        toast.error('Failed to delete product')
      }
    } catch (error) {
      toast.error('Failed to delete product')
    }
  }

  const toggleProductStatus = async (product: any) => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...product,
          isActive: !product.isActive
        })
      })

      if (response.ok) {
        toast.success(product.isActive ? 'Product deactivated' : 'Product activated')
        fetchProducts()
      }
    } catch (error) {
      toast.error('Failed to update product status')
    }
  }

  const exportToCSV = () => {
    if (filteredProducts.length === 0) {
      toast.error('No products to export')
      return
    }

    // Build CSV content
    const headers = ['ID', 'Name', 'Category', 'Status', 'Total Variants', 'Total Stock', 'Min Price', 'Max Price', 'Created At']
    const rows = filteredProducts.map(p => [
      p.id,
      p.name,
      p.category,
      p.isActive ? 'Active' : 'Inactive',
      p.variants.length,
      p.variants.reduce((sum: number, v: any) => sum + v.stock, 0),
      Math.min(...p.variants.map((v: any) => v.price)),
      Math.max(...p.variants.map((v: any) => v.price)),
      new Date(p.createdAt).toLocaleString()
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `products_${categoryFilter}_${statusFilter}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success(`Exported ${filteredProducts.length} products`)
  }

  const filteredProducts = products.filter(p => {
    const categoryMatch = categoryFilter === 'all' || p.category === categoryFilter
    const statusMatch = statusFilter === 'all' || 
      (statusFilter === 'active' && p.isActive) ||
      (statusFilter === 'inactive' && !p.isActive)
    return categoryMatch && statusMatch
  })

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))]
  const totalStock = filteredProducts.reduce((sum, p) => 
    sum + p.variants.reduce((s: number, v: any) => s + v.stock, 0), 0
  )

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg font-bold">Loading products...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black mb-2">Products Management</h1>
            <p className="text-gray-secondary">
              {filteredProducts.length} products · {totalStock} items in stock
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={exportToCSV}
              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-border hover:border-text-black font-bold transition-colors"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
            <button 
              onClick={handleAddProduct}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-text-black text-white font-bold hover:bg-gray-800"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-border p-4 mb-6 flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-secondary" />
            <span className="text-sm font-bold">Filters:</span>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border-2 border-gray-border outline-none text-sm font-bold"
          >
            <option value="all">All Categories</option>
            {categories.filter(c => c !== 'all').map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border-2 border-gray-border outline-none text-sm font-bold"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white border border-gray-border overflow-hidden hover:shadow-lg transition-shadow">
                {/* Product Image */}
                {product.images.length > 0 && (
                  <div className="h-48 bg-gray-100 overflow-hidden">
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 mr-2">
                      <h3 className="font-black text-lg mb-1 line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-gray-secondary line-clamp-1">{product.tagline}</p>
                      <div className="mt-2">
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 font-bold">
                          {product.category}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleProductStatus(product)}
                      className={`px-2 py-1 text-xs font-bold rounded ${
                        product.isActive 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {product.isActive ? (
                        <><Eye className="w-3 h-3 inline mr-1" />Active</>
                      ) : (
                        <><EyeOff className="w-3 h-3 inline mr-1" />Hidden</>
                      )}
                    </button>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                    <div className="text-center p-2 bg-gray-50">
                      <div className="font-black text-lg">{product.variants.length}</div>
                      <div className="text-xs text-gray-secondary">Variants</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50">
                      <div className="font-black text-lg">
                        {product.variants.reduce((sum: number, v: any) => sum + v.stock, 0)}
                      </div>
                      <div className="text-xs text-gray-secondary">Stock</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50">
                      <div className="font-black text-lg">
                        ₹{Math.min(...product.variants.map((v: any) => v.price))}
                      </div>
                      <div className="text-xs text-gray-secondary">From</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditProduct(product)}
                      className="flex-1 px-3 py-2 border-2 border-gray-border hover:border-text-black text-sm font-bold transition-colors"
                    >
                      <Edit className="w-4 h-4 inline mr-1" />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDuplicateProduct(product)}
                      className="px-3 py-2 border-2 border-blue-200 text-blue-600 hover:border-blue-600 text-sm font-bold transition-colors"
                      title="Duplicate product"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <div className="relative group">
                      <button 
                        onClick={(e) => handleDeleteProduct(product, e.shiftKey)}
                        className="px-3 py-2 border-2 border-red-200 text-red-600 hover:border-red-600 text-sm font-bold transition-colors"
                        title="Delete (Shift+Click for force delete)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 bg-white border-2 border-red-200 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <button 
                          onClick={() => handleDeleteProduct(product, false)}
                          className="block w-full px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 whitespace-nowrap"
                        >
                          Safe Delete
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product, true)}
                          className="block w-full px-3 py-2 text-xs font-bold text-red-800 hover:bg-red-100 whitespace-nowrap border-t border-red-200"
                        >
                          ⚠️ Force Delete
                        </button>
                        <div className="px-3 py-1 text-xs text-gray-500 border-t border-gray-200">
                          Tip: Shift+Click for force
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-border p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <div className="font-bold mb-2">
              {products.length === 0 ? 'No products yet' : 'No products match your filters'}
            </div>
            <div className="text-sm text-gray-secondary mb-4">
              {products.length === 0 
                ? 'Start by adding your first product' 
                : 'Try adjusting your filters'
              }
            </div>
            {products.length === 0 && (
              <button 
                onClick={handleAddProduct}
                className="px-6 py-3 bg-text-black text-white font-bold rounded hover:bg-gray-800"
              >
                Add Your First Product
              </button>
            )}
          </div>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedProduct(null)
        }}
        onSuccess={fetchProducts}
        product={selectedProduct}
      />
    </AdminLayout>
  )
}
