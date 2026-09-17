import React, { useState } from 'react';

interface SkeletonProps {
  variant?: 'text' | 'title' | 'rectangular' | 'circular' | 'card';
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

/**
 * Base UX4G Accessible Shimmer Skeleton
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
  style = {},
  ariaLabel = 'Loading content...',
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'title':
        return 'skeleton-title';
      case 'rectangular':
        return 'skeleton-rect';
      case 'circular':
        return 'skeleton-circle';
      case 'card':
        return 'skeleton-card';
      case 'text':
      default:
        return 'skeleton-text';
    }
  };

  const customStyle: React.CSSProperties = {
    ...style,
    ...(width !== undefined ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height !== undefined ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
  };

  return (
    <span
      className={`skeleton ${getVariantClass()} ${className}`}
      style={customStyle}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
    />
  );
};

interface ImageWithSkeletonProps {
  src: string;
  alt: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: React.CSSProperties;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'auto' | 'sync';
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
  onLoad?: () => void;
}

/**
 * Progressive Image Loader with UX4G Shimmer Skeleton & Lazy Loading
 */
export const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  style = {},
  loading = 'lazy',
  decoding = 'async',
  containerClassName = '',
  containerStyle = {},
  onLoad,
}) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div
      className={`lazy-image-container ${containerClassName}`}
      style={{
        width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
        height: height ? (typeof height === 'number' ? `${height}px` : height) : '100%',
        ...containerStyle,
      }}
    >
      {!isLoaded && !hasError && (
        <div className="lazy-image-placeholder">
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            ariaLabel={`Loading image: ${alt}`}
          />
        </div>
      )}

      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding={decoding}
        width={width}
        height={height}
        className={`${className} ${isLoaded ? 'is-loaded' : 'is-loading'}`}
        style={{
          ...style,
          width: '100%',
          height: '100%',
          objectFit: (style.objectFit as any) || 'cover',
        }}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

/**
 * Full Portal View Loading Screen
 */
export const PortalSkeleton: React.FC<{ title?: string }> = ({
  title = 'Loading Cooperative Workspace...',
}) => {
  return (
    <div className="container-fluid py-4" role="status" aria-busy="true" aria-label={title}>
      {/* Top Banner Skeleton */}
      <div className="card border mb-4 p-3 shadow-sm bg-white">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <Skeleton variant="circular" width={36} height={36} />
            <div>
              <Skeleton variant="title" width={220} height={20} style={{ marginBottom: 6 }} />
              <Skeleton variant="text" width={140} height={12} style={{ marginBottom: 0 }} />
            </div>
          </div>
          <div className="d-flex gap-2">
            <Skeleton variant="rectangular" width={90} height={32} />
            <Skeleton variant="rectangular" width={110} height={32} />
          </div>
        </div>
      </div>

      {/* Metric Cards Row Skeleton */}
      <div className="row g-3 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="col-12 col-sm-6 col-lg-3">
            <div className="card p-3 border shadow-sm bg-white h-100">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Skeleton variant="text" width="50%" height={12} />
                <Skeleton variant="circular" width={20} height={20} />
              </div>
              <Skeleton variant="title" width="70%" height={28} style={{ marginBottom: 8 }} />
              <Skeleton variant="text" width="40%" height={10} style={{ marginBottom: 0 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content & Table Skeleton */}
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card p-4 border shadow-sm bg-white">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <Skeleton variant="title" width={180} height={22} />
              <Skeleton variant="rectangular" width={100} height={30} />
            </div>
            <div className="d-flex flex-column gap-3">
              {[1, 2, 3, 4, 5].map((row) => (
                <div key={row} className="p-3 border rounded d-flex justify-content-between align-items-center">
                  <div style={{ width: '60%' }}>
                    <Skeleton variant="text" width="75%" height={14} style={{ marginBottom: 6 }} />
                    <Skeleton variant="text" width="45%" height={10} style={{ marginBottom: 0 }} />
                  </div>
                  <Skeleton variant="rectangular" width={80} height={28} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card p-4 border shadow-sm bg-white">
            <Skeleton variant="title" width={160} height={20} style={{ marginBottom: 16 }} />
            <Skeleton variant="text" width="100%" height={12} />
            <Skeleton variant="text" width="90%" height={12} />
            <Skeleton variant="text" width="95%" height={12} />
            <div className="my-4 border-top pt-3">
              <Skeleton variant="rectangular" width="100%" height={40} />
            </div>
            <Skeleton variant="text" width="80%" height={10} style={{ margin: '0 auto' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Service Catalog Specific Skeleton Screen
 */
export const ServiceCatalogSkeleton: React.FC = () => {
  return (
    <div className="container-fluid py-4" role="status" aria-busy="true" aria-label="Loading Service Catalog...">
      {/* Category Tabs Skeleton */}
      <div className="d-flex gap-2 mb-4 overflow-auto pb-2">
        {[1, 2, 3, 4].map((t) => (
          <Skeleton key={t} variant="rectangular" width={160} height={42} style={{ borderRadius: '8px' }} />
        ))}
      </div>

      {/* Catalog Grid Skeleton */}
      <div className="row g-4">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className="col-12 col-md-6 col-lg-4">
            <div className="card p-4 border shadow-sm bg-white h-100 d-flex flex-column">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <Skeleton variant="circular" width={44} height={44} />
                <Skeleton variant="rectangular" width={70} height={22} />
              </div>
              <Skeleton variant="title" width="80%" height={20} style={{ marginBottom: 8 }} />
              <Skeleton variant="text" width="100%" height={12} />
              <Skeleton variant="text" width="90%" height={12} style={{ marginBottom: 16 }} />

              <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                <div>
                  <Skeleton variant="text" width={50} height={10} style={{ marginBottom: 4 }} />
                  <Skeleton variant="title" width={80} height={20} style={{ marginBottom: 0 }} />
                </div>
                <Skeleton variant="rectangular" width={100} height={34} style={{ borderRadius: '6px' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Central Regulator Dashboard Skeleton Screen
 */
export const RegulatorSkeleton: React.FC = () => {
  return (
    <div className="container-fluid py-4" role="status" aria-busy="true" aria-label="Loading Ministry Regulatory Console...">
      {/* Authority Banner Skeleton */}
      <div className="card shadow-sm border mb-4 bg-white p-3 p-md-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <Skeleton variant="circular" width={48} height={48} />
            <div>
              <Skeleton variant="title" width={320} height={22} style={{ marginBottom: 6 }} />
              <Skeleton variant="text" width={240} height={12} style={{ marginBottom: 0 }} />
            </div>
          </div>
          <div className="d-flex gap-2">
            <Skeleton variant="rectangular" width={100} height={32} />
            <Skeleton variant="rectangular" width={120} height={32} />
          </div>
        </div>
      </div>

      {/* 6 High-Level KPI Tiles Skeleton */}
      <div className="row g-3 mb-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="col-6 col-md-4 col-xl-2">
            <div className="p-3 bg-white border rounded shadow-sm h-100">
              <Skeleton variant="text" width="60%" height={10} style={{ marginBottom: 8 }} />
              <Skeleton variant="title" width="80%" height={24} style={{ marginBottom: 8 }} />
              <Skeleton variant="text" width="50%" height={10} style={{ marginBottom: 0 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Filter Toolbar Skeleton */}
      <div className="card shadow-sm border mb-4 bg-white p-3">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-4">
            <Skeleton variant="rectangular" width="100%" height={32} />
          </div>
          <div className="col-6 col-md-2">
            <Skeleton variant="rectangular" width="100%" height={32} />
          </div>
          <div className="col-6 col-md-2">
            <Skeleton variant="rectangular" width="100%" height={32} />
          </div>
          <div className="col-12 col-md-4">
            <Skeleton variant="rectangular" width="100%" height={32} />
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="card shadow-sm border bg-white mb-4">
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <Skeleton variant="text" width={220} height={14} />
          <Skeleton variant="rectangular" width={80} height={20} />
        </div>
        <div className="p-3">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="py-3 border-bottom d-flex justify-content-between align-items-center">
              <div style={{ width: '30%' }}>
                <Skeleton variant="text" width="80%" height={14} style={{ marginBottom: 4 }} />
                <Skeleton variant="text" width="50%" height={10} />
              </div>
              <Skeleton variant="text" width="15%" height={12} />
              <Skeleton variant="text" width="15%" height={12} />
              <Skeleton variant="text" width="15%" height={12} />
              <Skeleton variant="rectangular" width={80} height={24} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Tripartite Ledger Skeleton Screen
 */
export const LedgerSkeleton: React.FC = () => {
  return (
    <div className="py-3" role="status" aria-busy="true" aria-label="Loading Tripartite Ledger...">
      <div className="row g-3 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="col-12 col-md-3">
            <div className="p-3 bg-white border rounded shadow-sm">
              <Skeleton variant="text" width="60%" height={11} style={{ marginBottom: 8 }} />
              <Skeleton variant="title" width="85%" height={26} style={{ marginBottom: 6 }} />
              <Skeleton variant="text" width="40%" height={10} />
            </div>
          </div>
        ))}
      </div>

      <div className="card shadow-sm border bg-white">
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <Skeleton variant="text" width={200} height={14} />
          <Skeleton variant="rectangular" width={110} height={28} />
        </div>
        <div className="p-3">
          {[1, 2, 3, 4, 5, 6].map((row) => (
            <div key={row} className="py-2 border-bottom d-flex justify-content-between align-items-center">
              <Skeleton variant="text" width="18%" height={12} />
              <Skeleton variant="text" width="18%" height={12} />
              <Skeleton variant="text" width="15%" height={12} />
              <Skeleton variant="text" width="15%" height={12} />
              <Skeleton variant="rectangular" width={75} height={22} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Card Grid Skeleton (for Verification Queue & Governance Polls)
 */
export const CardGridSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="py-3" role="status" aria-busy="true" aria-label="Loading Records...">
      <div className="row g-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="col-12 col-md-6 col-lg-4">
            <div className="card p-4 border shadow-sm bg-white h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Skeleton variant="text" width="50%" height={14} />
                <Skeleton variant="rectangular" width={60} height={20} />
              </div>
              <Skeleton variant="title" width="90%" height={18} style={{ marginBottom: 8 }} />
              <Skeleton variant="text" width="100%" height={12} />
              <Skeleton variant="text" width="70%" height={12} style={{ marginBottom: 16 }} />
              <div className="mt-auto pt-3 border-top d-flex gap-2">
                <Skeleton variant="rectangular" width="50%" height={32} />
                <Skeleton variant="rectangular" width="50%" height={32} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

