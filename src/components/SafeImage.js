import React, { useState, useEffect } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';

export const SafeImage = ({ src, fallbackSrc, alt, className, ...props }) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setFailed(false);
  }, [src]);

  const handleError = () => {
    if (!failed) {
      setFailed(true);
      // First, try the unsplash placeholder if the primary failed
      setCurrentSrc(fallbackSrc || 'https://images.unsplash.com/photo-1508215885820-4585e5610d32?w=500&q=80');
    } else {
      // If that also fails, use event logo or a silent blank transparent SVG data URL
      setCurrentSrc('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1" viewBox="0 0 1 1"><rect width="1" height="1" fill="%23ececf0"/></svg>');
    }
  };

  return (
    <img
      src={currentSrc}
      onError={handleError}
      alt={alt}
      className={className}
      {...props}
    />
  );
};

export const SafeLazyImage = ({ src, fallbackSrc, alt, className, ...props }) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setFailed(false);
  }, [src]);

  const handleError = () => {
    if (!failed) {
      setFailed(true);
      setCurrentSrc(fallbackSrc || 'https://images.unsplash.com/photo-1508215885820-4585e5610d32?w=500&q=80');
    } else {
      setCurrentSrc('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1" viewBox="0 0 1 1"><rect width="1" height="1" fill="%23ececf0"/></svg>');
    }
  };

  return (
    <LazyLoadImage
      src={currentSrc}
      onError={handleError}
      alt={alt}
      className={className}
      {...props}
    />
  );
};
