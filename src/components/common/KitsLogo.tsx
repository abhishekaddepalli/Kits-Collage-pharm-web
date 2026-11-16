import React from 'react';

interface KitsLogoProps {
  logoUrl?: string;
  title?: string;
  subtitle?: string;
  variant?: 'light' | 'dark';
  compact?: boolean;
}

export const KitsLogo: React.FC<KitsLogoProps> = ({
  logoUrl,
  title = 'KITS',
  subtitle = 'COLLEGE OF PHARMACY FOR WOMEN',
  variant = 'dark',
  compact = false,
}) => {
  const isCustomImage = logoUrl && logoUrl !== 'svg-emblem' && (logoUrl.startsWith('http') || logoUrl.startsWith('/') || logoUrl.startsWith('data:'));

  return (
    <div className="flex items-center gap-3 shrink-0">
      {isCustomImage ? (
        <img
          src={logoUrl}
          alt={`${title} ${subtitle} logo`}
          referrerPolicy="no-referrer"
          className={compact ? 'h-9 w-9 object-contain' : 'h-12 w-12 object-contain'}
        />
      ) : (
        <svg
          viewBox="0 0 64 64"
          className={compact ? 'h-9 w-9 shrink-0' : 'h-12 w-12 shrink-0'}
          aria-hidden="true"
        >
          {/* Open book & supportive botanical emblem matching institutional identity */}
          <path
            d="M8 42 C18 39, 26 42, 32 48 C38 42, 46 39, 56 42 L56 50 C46 47, 38 50, 32 55 C26 50, 18 47, 8 50 Z"
            fill={variant === 'light' ? '#F2C34E' : '#171238'}
          />
          <path
            d="M12 35 C20 33, 27 36, 32 42 C37 36, 44 33, 52 35 L52 40 C44 38, 37 41, 32 46 C27 41, 20 38, 12 40 Z"
            fill={variant === 'light' ? '#FFFFFF' : '#52128B'}
          />
          {/* Botanical leaves */}
          <path
            d="M32 38 C24 31, 18 24, 18 16 C25 18, 30 24, 32 34 Z"
            fill="#2E8B57"
          />
          <path
            d="M32 38 C40 31, 46 24, 46 16 C39 18, 34 24, 32 34 Z"
            fill="#3CB371"
          />
          {/* Pharmacy vessel / flame center */}
          <path
            d="M32 8 C28 15, 27 21, 32 27 C37 21, 36 15, 32 8 Z"
            fill="#F2C34E"
          />
          <circle cx="32" cy="18" r="2.2" fill="#B21A83" />
        </svg>
      )}
      <div className="leading-tight">
        <div
          className={`font-display font-bold tracking-tight whitespace-nowrap ${
            compact ? 'text-lg' : 'text-xl sm:text-2xl'
          } ${variant === 'light' ? 'text-white' : 'text-[var(--kits-heading)]'}`}
        >
          {title}
        </div>
        {!compact && (
          <div
            className={`text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase whitespace-nowrap ${
              variant === 'light' ? 'text-purple-200' : 'text-[var(--kits-primary)]'
            }`}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
