import React, { useState } from 'react';
import { GraduationCap } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackTitle,
  loading = 'lazy',
  ...rest
}) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt || fallbackTitle || 'KITS Pharmacy visual'}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#F5F0FC] to-[#E8DFF5] text-[#52128B] p-4 text-center ${className}`}
      >
        <GraduationCap className="w-8 h-8 mb-2 opacity-70" />
        <span className="text-xs font-medium opacity-80 line-clamp-2">
          {fallbackTitle || alt || 'KITS College of Pharmacy for Women'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || 'KITS College of Pharmacy for Women'}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
      {...rest}
    />
  );
};
