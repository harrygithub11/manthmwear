'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Upload, Image as ImageIcon } from 'lucide-react'
import { toast } from '@/components/toast'

// Helper function to get color code from color name
const getColorCodeFromName = (colorName: string): string => {
  const colorMap: Record<string, string> = {
    'black': '#000000',
    'royal blue': '#1E3A8A',
    'dark green': '#064E3B',
    'maroon': '#7F1D1D',
    'grey': '#6B7280',
    'gray': '#6B7280',
    'coffee': '#6F4E37',
    'white': '#FFFFFF',
    'blue': '#1E40AF',
    'green': '#16A34A',
    'red': '#DC2626',
    'orange': '#EA580C',
    'yellow': '#CA8A04',
    'purple': '#9333EA',
    'pink': '#EC4899',
  }
  return colorMap[colorName.toLowerCase()] || '#CCCCCC'
}

interface Variant {
  id?: string
  sku: string
  size: string
  sizeRank?: number
  color: string
  colorCode?: string
  colorRank?: number
  pack: number
  price: number
  stock: number
  baseStock?: number
  useSharedStock?: boolean
  isActive: boolean
}

interface Feature {
  id?: string
  name: string
  description: string
}

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  product?: any
}

export default function ProductModal({ isOpen, onClose, onSuccess, product }: ProductModalProps) {
  const [loading, setLoading] = useState(false)
  const [forceDelete, setForceDelete] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    tagline: '',
    description: '',
    category: '',
    isActive: true,
  })
  const [images, setImages] = useState<string[]>([])
  const [imageInput, setImageInput] = useState('')
  const [features, setFeatures] = useState<Feature[]>([])
  const [variants, setVariants] = useState<Variant[]>([])

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        tagline: product.tagline || '',
        description: product.description || '',
        category: product.category || '',
        isActive: product.isActive ?? true,
      })
      setImages(product.images || [])
      setFeatures(product.features || [])
      setVariants(product.variants || [])
    } else {
      resetForm()
    }
  }, [product])

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      tagline: '',
      description: '',
      category: '',
      isActive: true,
    })
    setImages([])
    setImageInput('')
    setFeatures([])
    setVariants([])
    setForceDelete(false)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name)
    })
  }

  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          
          // Resize if too large (max 800x800)
          const maxSize = 800
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize
              width = maxSize
            } else {
              width = (width / height) * maxSize
              height = maxSize
            }
          }
          
          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)
          
          // Compress to JPEG with 0.8 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8)
          resolve(compressedDataUrl)
        }
        img.onerror = reject
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newImages: string[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`)
        continue
      }

      try {
        // Compress and resize image
        const compressedImage = await compressImage(file)
        
        // Check compressed size
        const sizeInKB = Math.round((compressedImage.length * 3) / 4 / 1024)
        
        if (sizeInKB > 500) {
          console.warn(`Compressed image still large: ${sizeInKB}KB`)
        }
        
        newImages.push(compressedImage)
      } catch (error) {
        console.error('Failed to process image:', error)
        toast.error(`Failed to process ${file.name}`)
      }
    }

    if (newImages.length > 0) {
      setImages([...images, ...newImages])
      toast.success(`${newImages.length} image(s) uploaded and compressed`)
    }

    // Reset file input
    e.target.value = ''
  }

  const addImage = () => {
    if (imageInput.trim()) {
      setImages([...images, imageInput.trim()])
      setImageInput('')
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const addFeature = () => {
    setFeatures([...features, { name: '', description: '' }])
  }

  const updateFeature = (index: number, field: string, value: string) => {
    const updated = [...features]
    updated[index] = { ...updated[index], [field]: value }
    setFeatures(updated)
  }

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  const addVariant = () => {
    setVariants([...variants, {
      sku: `${formData.slug || 'PROD'}-${Date.now()}`,
      size: 'M',
      color: 'Black',
      pack: 1,
      price: 0,
      stock: 0,
      isActive: true
    }])
  }

  const updateVariant = (index: number, field: string, value: any) => {
    const updated = [...variants]
    const variant = updated[index]
    
    // If updating stock on a shared stock variant, update baseStock for all matching variants
    if (field === 'stock' && variant.useSharedStock) {
      const newBaseStock = Number(value) * variant.pack
      // Update baseStock for all variants with same color/size
      updated.forEach((v, i) => {
        if (v.color === variant.color && v.size === variant.size && v.useSharedStock) {
          updated[i] = { 
            ...v, 
            baseStock: newBaseStock,
            stock: Math.floor(newBaseStock / v.pack)
          }
        }
      })
    } else {
      updated[index] = { ...updated[index], [field]: value }
    }
    
    setVariants(updated)
  }

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.slug) {
      toast.error('Product name is required')
      return
    }

    if (variants.length === 0) {
      toast.error('Add at least one variant')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('admin_token')
      const url = product ? `/api/admin/products/${product.id}` : '/api/admin/products'
      const method = product ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          images,
          features: features.filter(f => f.name && f.description),
          variants: variants.map(v => ({
            ...v,
            price: Number(v.price),
            stock: Number(v.stock),
            pack: Number(v.pack),
            sizeRank: v.sizeRank,
            colorCode: v.colorCode,
            colorRank: v.colorRank,
            baseStock: v.baseStock,
            useSharedStock: v.useSharedStock
          })),
          forceDelete: forceDelete
        })
      })

      if (response.ok) {
        toast.success(product ? 'Product updated!' : 'Product created!')
        onSuccess()
        onClose()
        resetForm()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to save product')
      }
    } catch (error) {
      toast.error('Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-gray-border p-6 flex items-center justify-between">
          <h2 className="text-2xl font-black">{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-black">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-bold mb-2">Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Slug (Auto-generated)</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none font-mono text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                placeholder="Short description"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                required
              >
                <option value="">Select category</option>
                <option value="trunk-core">Trunk Core</option>
                <option value="performance">Performance Trunks</option>
                <option value="premium">Premium Collection</option>
                <option value="basics">Basics</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="font-bold">Active (visible on website)</span>
              </label>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-black">Product Images</h3>
            
            {/* File Upload */}
            <div>
              <label className="block text-sm font-bold mb-2">Upload from Computer</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="w-full px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
              />
              <p className="text-xs text-gray-secondary mt-1">
                Select one or more images (JPG, PNG, WebP)
              </p>
            </div>

            {/* URL Input */}
            <div>
              <label className="block text-sm font-bold mb-2">Or Add Image URL</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 px-4 py-3 border-2 border-gray-border focus:border-text-black outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="px-4 py-3 bg-text-black text-white font-bold hover:bg-gray-800"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {images.map((img, index) => (
                <div key={index} className="relative border-2 border-gray-border p-2 group">
                  <img src={img} alt="" className="w-full h-32 object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-1 left-1 px-2 py-1 bg-black text-white text-xs font-bold">
                      Main
                    </div>
                  )}
                </div>
              ))}
              {images.length === 0 && (
                <div className="col-span-4 border-2 border-dashed border-gray-border p-8 text-center text-gray-secondary">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <div className="text-sm">No images added yet</div>
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black">Features</h3>
              <button
                type="button"
                onClick={addFeature}
                className="flex items-center gap-2 px-3 py-2 border-2 border-gray-border hover:border-text-black font-bold text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Feature
              </button>
            </div>

            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={feature.name}
                    onChange={(e) => updateFeature(index, 'name', e.target.value)}
                    placeholder="Feature name"
                    className="w-1/3 px-3 py-2 border-2 border-gray-border focus:border-text-black outline-none"
                  />
                  <input
                    type="text"
                    value={feature.description}
                    onChange={(e) => updateFeature(index, 'description', e.target.value)}
                    placeholder="Feature description"
                    className="flex-1 px-3 py-2 border-2 border-gray-border focus:border-text-black outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="px-3 py-2 border-2 border-red-200 text-red-600 hover:border-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Variants */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black">Variants & Inventory *</h3>
              <button
                type="button"
                onClick={addVariant}
                className="flex items-center gap-2 px-3 py-2 bg-text-black text-white font-bold text-sm hover:bg-gray-800"
              >
                <Plus className="w-4 h-4" />
                Add Variant
              </button>
            </div>

            <div className="space-y-3">
              {variants.map((variant, index) => (
                <div key={index} className="border-2 border-gray-border p-4 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1">Size</label>
                      <select
                        value={variant.size}
                        onChange={(e) => updateVariant(index, 'size', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-border outline-none"
                      >
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">
                        Color
                        {variant.pack > 1 && (
                          <span className="ml-1 text-blue-600 font-normal">(Customer Choice)</span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={variant.color}
                        onChange={(e) => updateVariant(index, 'color', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-border outline-none"
                        placeholder={variant.pack > 1 ? "Custom Pack" : "e.g., Black"}
                        title={variant.pack > 1 ? "For Pack of 2/3, use 'Custom Pack' - customers choose colors at checkout" : "Enter specific color name"}
                      />
                      {variant.pack > 1 && variant.color !== 'Custom Pack' && (
                        <p className="text-xs text-orange-600 mt-1">
                          💡 Tip: Use "Custom Pack" for Pack of {variant.pack}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Color Code</label>
                      <div className="flex gap-1">
                        <input
                          type="color"
                          value={variant.colorCode || getColorCodeFromName(variant.color)}
                          onChange={(e) => updateVariant(index, 'colorCode', e.target.value)}
                          className="w-10 h-9 border-2 border-gray-border cursor-pointer"
                          title="Pick color"
                        />
                        <input
                          type="text"
                          value={variant.colorCode || ''}
                          onChange={(e) => updateVariant(index, 'colorCode', e.target.value)}
                          className="flex-1 px-2 py-2 border-2 border-gray-border outline-none font-mono text-xs"
                          placeholder={getColorCodeFromName(variant.color)}
                          pattern="^#[0-9A-Fa-f]{6}$"
                          title="Hex color code"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1">Pack</label>
                      <input
                        type="number"
                        value={variant.pack}
                        onChange={(e) => updateVariant(index, 'pack', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-border outline-none"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Price (₹)</label>
                      <input
                        type="number"
                        value={variant.price}
                        onChange={(e) => updateVariant(index, 'price', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-border outline-none"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
                    <div>
                      <label className="block text-xs font-bold mb-1">
                        Stock
                        {variant.useSharedStock && (
                          <span className="ml-1 text-blue-600" title={`Base Stock: ${variant.baseStock || 0} (shared across packs)`}>
                            🔗
                          </span>
                        )}
                      </label>
                      <input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-border outline-none"
                        min="0"
                      />
                      {variant.useSharedStock && variant.baseStock !== undefined && (
                        <div className="text-xs text-gray-500 mt-1">
                          Base: {variant.baseStock} ÷ {variant.pack} = {Math.floor(variant.baseStock / variant.pack)} packs
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">SKU</label>
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-border outline-none font-mono text-xs"
                      />
                    </div>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={variant.isActive}
                          onChange={(e) => updateVariant(index, 'isActive', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-xs font-bold">Active</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="ml-auto px-3 py-2 border-2 border-red-200 text-red-600 hover:border-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {variants.length === 0 && (
                <div className="border-2 border-dashed border-gray-border p-8 text-center text-gray-secondary">
                  <div className="text-sm">No variants added yet. Add at least one variant.</div>
                </div>
              )}
            </div>
          </div>

          {/* Deletion Options */}
          {product && (
            <div className="space-y-4 pt-4 border-t-2 border-gray-border">
              <h3 className="text-lg font-black text-red-600">Deletion Settings</h3>
              <div className="bg-red-50 border-2 border-red-200 p-4 space-y-3">
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={forceDelete}
                      onChange={(e) => setForceDelete(e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="font-bold text-red-700">Force Delete Mode</span>
                  </label>
                  <p className="text-sm text-red-600 mt-1">
                    When enabled, removed variants and products will be permanently deleted from the database instead of just being deactivated.
                  </p>
                </div>
                <div className="text-xs text-red-500 bg-red-100 p-2 border border-red-300">
                  <strong>⚠️ Warning:</strong> Force delete will permanently remove data even if it's referenced in existing orders. 
                  Use with extreme caution. Normal deletion (unchecked) will safely deactivate items that have orders.
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t-2 border-gray-border">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-border hover:border-text-black font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-text-black text-white font-bold hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
