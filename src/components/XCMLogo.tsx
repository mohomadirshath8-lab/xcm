import React from 'react';

interface XCMLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStoreText?: boolean;
  className?: string;
  subtitle?: string;
}

export const XCMLogo: React.FC<XCMLogoProps> = ({
  size = 'md',
  showStoreText = true,
  className = '',
  subtitle,
}) => {
  const heightClasses = {
    sm: 'h-6',
    md: 'h-8 sm:h-9',
    lg: 'h-11 sm:h-12',
    xl: 'h-16 sm:h-20',
  };

  const textClasses = {
    sm: 'text-sm font-bold',
    md: 'text-base sm:text-lg font-bold',
    lg: 'text-xl sm:text-2xl font-extrabold',
    xl: 'text-3xl sm:text-4xl font-extrabold',
  };

  return (
    <div className={`flex items-center gap-2.5 shrink-0 ${className}`}>
      <img
        src="/assets/aistudio/Fiery_Crystalline_XCM_Logo_c4bba4c4.png"
        alt="XCM"
        className={`${heightClasses[size]} w-auto object-contain filter drop-shadow-[0_0_12px_rgba(245,158,11,0.35)]`}
      />
      {showStoreText && (
        <div className="flex flex-col justify-center">
          <span
            className={`font-display ${textClasses[size]} tracking-wider uppercase bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent`}
          >
            STORE
          </span>
          {subtitle && (
            <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-mono -mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
