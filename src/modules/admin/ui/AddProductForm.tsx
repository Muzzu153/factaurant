import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories } from '@/modules/menu/menu.server';
import { getPresignedUploadUrl, createProduct, createCategory } from '../admin.server';
import { DietaryBadge } from '@/modules/menu/ui/DietaryBadge';
import { DIETARY_TYPES } from '../admin.schema';

interface AddProductFormProps {
  onSuccess?: () => void;
}

export function AddProductForm({ onSuccess }: AddProductFormProps) {
  const queryClient = useQueryClient();

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dollars, setDollars] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [dietaryType, setDietaryType] = useState<'veg' | 'non_veg' | 'contains_egg' | 'vegan'>('veg');

  // Quick Category Creator State
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // File Upload State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch Categories for dropdown
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  });

  // 2. Quick Create Category Mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (catName: string) => {
      const slug = catName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      return await createCategory({
        data: { name: catName, slug, displayOrder: (categories?.length || 0) + 1 },
      });
    },
    onSuccess: (newCat) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setCategoryId(newCat.id);
      setNewCatName('');
      setShowNewCatInput(false);
    },
    onError: (err: any) => {
      alert(`Failed to create category: ${err.message}`);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit.');
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);

    if (!file) {
      setError('Please select a product image.');
      return;
    }

    const parsedDollars = parseFloat(dollars);
    if (isNaN(parsedDollars) || parsedDollars <= 0) {
      setError('Please enter a valid price greater than 0.');
      return;
    }

    // Convert to integer cents / paise
    const priceInCents = Math.round(parsedDollars * 100);

    try {
      setIsSubmitting(true);

      // A. Get presigned upload URL from server
      setStatusMessage('Requesting storage permission...');
      const { uploadUrl, publicUrl } = await getPresignedUploadUrl({
        data: {
          fileName: file.name,
          fileType: file.type as any,
          fileSize: file.size,
        },
      });

      // B. Upload file directly to Cloudflare R2
      setStatusMessage('Uploading image to cloud...');
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadRes.ok) {
        throw new Error('Image upload failed. Please check storage configuration.');
      }

      // C. Save Product to Database with Category & Dietary tags
      setStatusMessage('Saving item to database...');
      await createProduct({
        data: {
          name,
          description: description.trim() || undefined,
          price: priceInCents,
          imageUrl: publicUrl,
          categoryId: categoryId || undefined,
          dietaryType,
        },
      });

      // Reset
      setName('');
      setDescription('');
      setDollars('');
      setFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      queryClient.invalidateQueries({ queryKey: ['menu'] });
      setStatusMessage('✅ Dish added to menu successfully!');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while creating the product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs font-sans mb-8">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Add Menu Item</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
          {error}
        </div>
      )}

      {statusMessage && !error && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-md font-medium">
          {statusMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Image Upload Box */}
        <div className="border-2 border-dashed border-slate-200 p-4 rounded-md text-center bg-slate-50">
          {previewUrl ? (
            <div className="flex flex-col items-center gap-2">
              <img src={previewUrl} alt="Preview" className="h-28 w-28 object-cover rounded-md border" />
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreviewUrl(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-xs text-red-600 hover:underline"
              >
                Remove image
              </button>
            </div>
          ) : (
            <div>
              <p className="text-xs text-slate-500 mb-2">Upload image up to 5MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleFileChange}
                className="text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* 2. Name & Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Item Name</label>
            <input
              type="text"
              placeholder="e.g. Paneer Tikka Pizza"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-slate-900"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹ or $)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="299.00"
              value={dollars}
              onChange={(e) => setDollars(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-slate-900"
              required
            />
          </div>
        </div>

        {/* 3. Category Dropdown & Quick Create */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-700">Category</label>
            <button
              type="button"
              onClick={() => setShowNewCatInput((prev) => !prev)}
              className="text-[11px] text-primary hover:underline font-medium"
            >
              {showNewCatInput ? 'Cancel' : '+ Add New Category'}
            </button>
          </div>

          {showNewCatInput ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Category name (e.g. Desserts)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 p-2 border border-slate-300 rounded-md text-xs"
              />
              <button
                type="button"
                onClick={() => newCatName.trim() && addCategoryMutation.mutate(newCatName.trim())}
                disabled={addCategoryMutation.isPending || !newCatName.trim()}
                className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-md disabled:opacity-50"
              >
                Save
              </button>
            </div>
          ) : (
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md text-xs bg-white"
            >
              <option value="">Uncategorized (General Menu)</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* 4. 🟢 FSSAI Dietary Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">Dietary Classification</label>
          <div className="grid grid-cols-2 gap-2">
            {DIETARY_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setDietaryType(type)}
                className={`flex items-center gap-2 p-2 rounded-md border text-xs font-medium transition cursor-pointer ${
                  dietaryType === type
                    ? 'border-slate-900 bg-slate-900/5 text-slate-900 font-semibold'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <DietaryBadge dietaryType={type} />
                <span className="capitalize">{type.replace('_', ' ')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 5. Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
          <textarea
            placeholder="Ingredients, preparation details, allergens..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md text-xs"
            rows={2}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !file}
          className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-md text-xs hover:bg-slate-800 disabled:opacity-50 cursor-pointer transition"
        >
          {isSubmitting ? 'Publishing Dish...' : 'Publish to Menu'}
        </button>
      </form>
    </div>
  );
}