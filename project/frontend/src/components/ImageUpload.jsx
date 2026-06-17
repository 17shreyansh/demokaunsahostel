import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import { message } from 'antd';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
// Extract backend URL by removing '/api' suffix
const BACKEND_URL = API_BASE_URL.replace(/\/api$/, '');

export default function ImageUpload({ 
  value, 
  onChange, 
  onRemove,
  maxSize = 10, // MB
  aspectRatio = null,
  showPreview = true 
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(
    value?.url ? `${BACKEND_URL}${value.url}` : 
    value?.medium ? `${BACKEND_URL}${value.medium}` : null
  );
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      message.error('Please select an image file');
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      message.error(`Image size must be less than ${maxSize}MB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(`${API_BASE_URL}/blog/admin/image/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message);
      }

      message.success('Image uploaded successfully');
      onChange?.(data.data);
    } catch (error) {
      console.error('Upload error:', error);
      message.error(error.message || 'Failed to upload image');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onRemove?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      {!preview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative border-2 border-dashed border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer"
          style={{ paddingBottom: aspectRatio ? `${(1 / aspectRatio) * 100}%` : '60%' }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            {uploading ? (
              <>
                <Loader className="w-10 h-10 text-blue-600 animate-spin mb-3" />
                <p className="text-sm font-bold text-gray-600">Uploading and optimizing...</p>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 text-gray-400 mb-3" />
                <p className="text-sm font-bold text-gray-700 mb-1">Click to upload image</p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP up to {maxSize}MB</p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
        </div>
      ) : (
        <div className="relative group">
          <div 
            className="relative border border-gray-300 overflow-hidden bg-gray-100"
            style={{ paddingBottom: aspectRatio ? `${(1 / aspectRatio) * 100}%` : '60%' }}
          >
            <img
              src={preview}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-white text-gray-900 font-bold hover:bg-gray-100 transition-colors"
              >
                Change
              </button>
              <button
                onClick={handleRemove}
                disabled={uploading}
                className="px-4 py-2 bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
        </div>
      )}

      {/* Image Info */}
      {value && showPreview && (
        <div className="bg-gray-50 border border-gray-200 p-3 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-gray-600">
            <ImageIcon size={14} />
            <span className="font-bold">Available Sizes:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-gray-700">
            <div>
              <span className="font-bold">Thumbnail:</span> 300x200
            </div>
            <div>
              <span className="font-bold">Medium:</span> 800x600
            </div>
            <div>
              <span className="font-bold">Large:</span> 1200x900
            </div>
            <div>
              <span className="font-bold">WebP:</span> Optimized
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
