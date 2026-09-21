'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

const MV_SCRIPT = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';

/**
 * ViewerAR — komponen 3D/AR yang tangguh untuk pembelajaran.
 * - Lazy-load <model-viewer> hanya saat dibutuhkan
 * - State loading / error / fallback poster yang jelas
 * - Tombol AR hanya tampil di perangkat yang mendukung WebXR/Scene Viewer/Quick Look
 * - Mendukung fallbackGlb bila URL utama gagal dimuat
 */
export default function ViewerAR({
  glbSrc,
  usdzSrc,
  posterSrc,
  alt = 'Model 3D pembelajaran',
  enableAR = true,
  autoRotate = true,
  fallbackGlb = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
  compact = false,
}) {
  const viewerRef = useRef(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [canUseAR, setCanUseAR] = useState(false);
  const [activeSrc, setActiveSrc] = useState(glbSrc);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    setActiveSrc(glbSrc);
    setUsedFallback(false);
    setStatus('loading');
  }, [glbSrc]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !scriptReady) return;

    const handleLoad = () => {
      setStatus('ready');
      try {
        setCanUseAR(Boolean(viewer.canActivateAR));
      } catch {
        setCanUseAR(false);
      }
    };
    const handleError = () => {
      if (!usedFallback && fallbackGlb && activeSrc !== fallbackGlb) {
        setUsedFallback(true);
        setActiveSrc(fallbackGlb);
        setStatus('loading');
      } else {
        setStatus('error');
      }
    };

    viewer.addEventListener('load', handleLoad);
    viewer.addEventListener('error', handleError);
    return () => {
      viewer.removeEventListener('load', handleLoad);
      viewer.removeEventListener('error', handleError);
    };
  }, [scriptReady, activeSrc, fallbackGlb, usedFallback]);

  return (
    <div className={`ar-viewer ${compact ? 'ar-viewer-compact' : ''}`}>
      <Script src={MV_SCRIPT} type="module" strategy="afterInteractive" onReady={() => setScriptReady(true)} />

      {status === 'loading' && (
        <div className="ar-overlay">
          <div className="ar-spinner" aria-hidden="true" />
          <p>Memuat model 3D…</p>
          <span className="ar-hint">Tips: gunakan koneksi stabil untuk pengalaman AR terbaik.</span>
        </div>
      )}

      {status === 'error' ? (
        <div className="ar-overlay ar-error">
          <div className="ar-error-icon">🧊</div>
          <p className="font-bold text-slate-700">Model 3D belum bisa dimuat</p>
          <span className="ar-hint">Periksa koneksi internetmu, lalu muat ulang halaman. Kamu tetap bisa membaca materi & mengerjakan misi.</span>
          <button className="btn btn-soft mt-3" onClick={() => { setStatus('loading'); setUsedFallback(false); setActiveSrc(glbSrc); }}>
            Coba lagi
          </button>
        </div>
      ) : (
        <model-viewer
          ref={viewerRef}
          src={activeSrc}
          ios-src={usdzSrc || undefined}
          poster={posterSrc || undefined}
          alt={alt}
          camera-controls
          shadow-intensity="1"
          exposure="1"
          interaction-prompt="auto"
          auto-rotate={autoRotate || undefined}
          style={{ width: '100%', height: '100%', background: 'transparent', opacity: status === 'ready' ? 1 : 0.25 }}
          {...(enableAR ? { ar: true, 'ar-modes': 'webxr scene-viewer quick-look' } : {})}
        >
          {enableAR && (
            <button slot="ar-button" className="btn btn-primary ar-button">
              📱 Lihat dalam AR
            </button>
          )}
        </model-viewer>
      )}

      {status === 'ready' && (
        <div className="ar-statusbar">
          <span className={`ar-dot ${canUseAR ? 'ar-dot-ok' : ''}`} />
          {canUseAR ? 'Perangkat mendukung AR — ketuk tombol AR' : 'Mode 3D aktif — putar & zoom untuk eksplorasi'}
          {usedFallback && ' · memakai model cadangan'}
        </div>
      )}
    </div>
  );
}
