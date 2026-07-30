import React, { useState, useEffect, useRef } from 'react';

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
      // First, try the unsplash placeholder if the primary failed (using 1200px high quality resolution)
      setCurrentSrc(fallbackSrc || 'https://images.unsplash.com/photo-1508215885820-4585e5610d32?w=1200&q=80');
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
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    setCurrentSrc(src);
    setFailed(false);
    setLoaded(false);
  }, [src]);

  useEffect(() => {
    // If the browser loaded the image from cache before React mounted or registered the onLoad handler
    if (imgRef.current && imgRef.current.complete) {
      setLoaded(true);
    }
  }, [currentSrc]);

  const handleError = () => {
    if (!failed) {
      setFailed(true);
      setCurrentSrc(fallbackSrc || 'https://images.unsplash.com/photo-1508215885820-4585e5610d32?w=1200&q=80');
    } else {
      setCurrentSrc('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1" viewBox="0 0 1 1"><rect width="1" height="1" fill="%23ececf0"/></svg>');
    }
  };

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      onError={handleError}
      onLoad={() => setLoaded(true)}
      alt={alt}
      loading="lazy"
      className={`${className} transition-all duration-500 ease-out ${
        loaded ? 'blur-0' : 'blur-md scale-95'
      }`}
      {...props}
    />
  );
};
