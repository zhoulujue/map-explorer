import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface ImageCarouselProps {
  images: string[];
  alt?: string;
  height?: string;
}

export default function ImageCarousel({ images, alt = 'Image', height = '300px' }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isDark } = useTheme();

  if (!images || images.length === 0) {
    return (
      <div 
        className={`w-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'} flex items-center justify-center text-text-secondary`}
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">📷</div>
          <p>暂无图片</p>
        </div>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>
      {/* Images */}
      <div 
        className="flex transition-transform duration-300 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={`slide-${index}`} className="w-full flex-shrink-0 h-full">
            <img
              src={image}
              alt={`${alt} ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
              }}
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all md:p-3"
            aria-label="上一张"
          >
            ←
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all md:p-3"
            aria-label="下一张"
          >
            →
          </button>
        </>
      )}

      {/* Page Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={`dot-${index}`}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-white w-6' 
                  : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
