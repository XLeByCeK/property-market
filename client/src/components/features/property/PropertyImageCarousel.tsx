import React, { useState } from 'react';
import Image from 'next/image';

interface PropertyImageCarouselProps {
  images: Array<{
    id: number;
    image_url: string;
    is_main: boolean;
    order: number;
  }>;
}

export const PropertyImageCarousel: React.FC<PropertyImageCarouselProps> = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Get array of images sorted by order
  const sortedImages = [...images].sort((a, b) => a.order - b.order);
  
  // If there are no images, use a placeholder
  if (sortedImages.length === 0) {
    sortedImages.push({
      id: 0,
      image_url: '/images/null-image.jpg',
      is_main: true,
      order: 0
    });
  }
  
  const nextSlide = () => {
    setActiveIndex((current) => (current === sortedImages.length - 1 ? 0 : current + 1));
  };
  
  const prevSlide = () => {
    setActiveIndex((current) => (current === 0 ? sortedImages.length - 1 : current - 1));
  };
  
  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };
  
  return (
    <div className="property-carousel">
      <div className="carousel-main">
        <button className="carousel-control prev" onClick={prevSlide}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="carousel-image-container">
          <Image
            src={sortedImages[activeIndex].image_url}
            alt="Property image"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
            className="carousel-image"
          />
        </div>
        <button className="carousel-control next" onClick={nextSlide}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {sortedImages.length > 1 && (
        <div className="carousel-thumbnails">
          {sortedImages.map((image, index) => (
            <div 
              key={image.id}
              className={`carousel-thumbnail ${index === activeIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            >
              <Image
                src={image.image_url}
                alt={`Property image thumbnail ${index + 1}`}
                width={100}
                height={60}
                className="thumbnail-image"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 