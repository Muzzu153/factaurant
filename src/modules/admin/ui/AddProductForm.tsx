import { useState, useRef } from 'react';
import { getPresignedUploadUrl, createProduct } from '../admin.server';

interface AddProductFormProps {
  onSuccess?: () => void;
}

export function AddProductForm({ onSuccess }: AddProductFormProps) {
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dollars, setDollars] = useState(''); // e.g. "14.99"
  
  // File & Upload State
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. HANDLE LOCAL FILE SELECTION
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) return;

    // Validate size on client first (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit.');
      return;
    }

    setFile(selectedFile);
    // Instant zero-latency local preview
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  // 2. SUBMIT PIPELINE (Presigned Upload + DB Write)
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
      setError('Please enter a valid price greater than $0.');
      return;
    }

    // 💰 CONVERT DOLLARS TO INTEGER CENTS ($14.99 -> 1499)
    const priceInCents = Math.round(parsedDollars * 100);

    try {
      setIsSubmitting(true);

      // --- PHASE A: REQUEST PRESIGNED UPLOAD TICKET ---
      setStatusMessage('Requesting upload permission...');
      const { uploadUrl, publicUrl } = await getPresignedUploadUrl({
        data: {
          fileName: file.name,
          fileType: file.type as any,
          fileSize: file.size,
        },
      });

      // --- PHASE B: DIRECT HTTP PUT TO CLOUDFLARE R2 ---
      setStatusMessage('Uploading image directly to Cloudflare R2...');
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          // ⚡ Critical: Content-Type must strictly match what was signed in the PutObjectCommand
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload to storage failed (${uploadResponse.statusText}). Check bucket CORS settings.`);
      }

      // --- PHASE C: PERSIST PRODUCT RECORD IN POSTGRESQL ---
      setStatusMessage('Saving item to database...');
      await createProduct({
        data: {
          name,
          description: description.trim() || undefined,
          price: priceInCents,
          imageUrl: publicUrl, // Storing the permanent Cloudflare URL
        },
      });

      // --- PHASE D: RESET FORM ---
      setName('');
      setDescription('');
      setDollars('');
      setFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      setStatusMessage('✅ Product created successfully!');
      if (onSuccess) onSuccess();

    } catch (err: any) {
      console.error('Failed to create product:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm font-sans mb-8">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Add New Menu Item</h3>

      {/* Error Message Box */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}

      {/* Progress Status Message */}
      {statusMessage && !error && (
        <div className="mb-4 p-3 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-md font-medium">
          {statusMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Media Upload Area */}
        <div className="border-2 border-dashed border-slate-200 p-6 rounded-md text-center bg-slate-50 hover:bg-slate-100/50 transition">
          {previewUrl ? (
            <div className="flex flex-col items-center gap-3">
              <img 
                src={previewUrl} 
                alt="Local preview" 
                className="h-32 w-32 object-cover rounded-md border border-slate-300 shadow-sm" 
              />
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreviewUrl(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-xs text-red-600 font-medium hover:underline"
              >
                Remove image & choose another
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <p className="text-xs text-slate-500 mb-3">Upload JPG, PNG, or WebP up to 5MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleFileChange}
                className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Name & Price Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
            <input
              type="text"
              placeholder="e.g. Truffle Mushroom Pizza"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Price ($ USD)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="21.50"
              value={dollars}
              onChange={(e) => setDollars(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
              required
            />
          </div>
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            placeholder="Wild forest mushrooms, black truffle oil, fresh mozzarella..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
            rows={2}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !file}
          className="w-full py-2.5 bg-slate-900 text-white font-semibold rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isSubmitting ? 'Processing...' : 'Add Item to Menu'}
        </button>
      </form>
    </div>
  );
}