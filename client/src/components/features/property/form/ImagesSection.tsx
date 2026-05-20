import React from 'react';
import { getImageUrl, PLACEHOLDER_NULL_IMAGE } from '../../../../utils/imageUrl';

interface ImagesSectionProps {
  uploadedImageUrls: string[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (url: string) => void;
}

export const ImagesSection: React.FC<ImagesSectionProps> = ({
  uploadedImageUrls,
  onUpload,
  onRemove,
}) => (
  <div className="form-section">
    <h2>Property Images</h2>

    <div className="image-upload">
      <label htmlFor="images" className="upload-label">
        <div className="upload-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <span>Click to upload images</span>
      </label>
      <input
        type="file"
        id="images"
        name="images"
        multiple
        accept="image/*"
        onChange={onUpload}
        className="file-input"
      />
    </div>

    {uploadedImageUrls.length > 0 && (
      <div className="image-preview-grid">
        {uploadedImageUrls.map((url, index) => {
          const imageUrl = getImageUrl(url);
          return (
            <div key={index} className="image-preview-item">
              <img
                src={imageUrl}
                alt={`Property image ${index + 1}`}
                className="preview-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = PLACEHOLDER_NULL_IMAGE;
                }}
              />
              <button
                type="button"
                className="remove-image-btn"
                onClick={() => onRemove(url)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    )}

    <div className="image-note">
      <p>First image will be used as the main property image. You can upload up to 10 images.</p>
    </div>
  </div>
);
