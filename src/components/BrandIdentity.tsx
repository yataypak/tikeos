import React, { useEffect, useState } from 'react';
import { Download, Smartphone, WifiOff, Share2, X, Monitor, Apple, CheckCircle2 } from 'lucide-react';
import type { ResolvedThemeTokens } from '../core/restaurantEngine';
import type { SiteCmsConfig } from '../data/siteCmsStore';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// Module-level PWA prompt store so switching views (Customer <-> Admin <-> POS)
// never drops an early `beforeinstallprompt` event fired on initial page load.
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
let globalAppInstalled = false;
const pwaListeners = new Set<() => void>();
let globalListenersAttached = false;

function notifyPwaSubscribers() {
  pwaListeners.forEach((cb) => cb());
}

function ensureGlobalPwaListeners() {
  if (globalListenersAttached || typeof window === 'undefined') return;
  globalListenersAttached = true;

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  if (isStandalone) {
    globalAppInstalled = true;
  }

  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    notifyPwaSubscribers();
  });

  window.addEventListener('appinstalled', () => {
    globalAppInstalled = true;
    globalDeferredPrompt = null;
    notifyPwaSubscribers();
  });
}

if (typeof window !== 'undefined') {
  ensureGlobalPwaListeners();
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export function usePWAInstall() {
  const [, setTick] = useState(0);
  const [isIOS, setIsIOS] = useState(false);
  const [hasServiceWorkerSupport, setHasServiceWorkerSupport] = useState(false);

  useEffect(() => {
    ensureGlobalPwaListeners();
    const bump = () => setTick((t) => t + 1);
    pwaListeners.add(bump);

    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setHasServiceWorkerSupport('serviceWorker' in window.navigator);

    return () => {
      pwaListeners.delete(bump);
    };
  }, []);

  const install = async () => {
    if (!globalDeferredPrompt) return false;
    await globalDeferredPrompt.prompt();
    const { outcome } = await globalDeferredPrompt.userChoice;
    if (outcome === 'accepted') {
      globalAppInstalled = true;
      globalDeferredPrompt = null;
      notifyPwaSubscribers();
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!globalDeferredPrompt,
    isInstalled: globalAppInstalled,
    isIOS,
    hasServiceWorkerSupport,
    install,
  };
}

export const PWAInstallButton: React.FC<{
  label?: string;
  themeTokens?: ResolvedThemeTokens;
  compact?: boolean;
}> = ({ label = 'Uygulamayı Yükle (PWA)', themeTokens, compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  if (isInstalled) return null;

  const btnStyle: React.CSSProperties | undefined = themeTokens
    ? {
        borderColor: themeTokens.borderColor,
        backgroundColor: themeTokens.surfaceAltColor,
        color: themeTokens.textPrimary,
      }
    : undefined;

  return (
    <>
      <button
        type="button"
        onClick={async () => {
          if (isInstallable) {
            await install();
          } else {
            setShowModal(true);
          }
        }}
        style={btnStyle}
        className={`inline-flex items-center gap-1.5 ${
          compact ? 'px-2.5 py-1.5 text-[11px]' : 'px-3 py-1.5 text-xs'
        } font-medium rounded-lg border border-[#D4AF6A]/40 bg-[#1F1F1D] text-[#F5F2EB] hover:brightness-110 transition-all whitespace-nowrap shrink-0 cursor-pointer`}
        aria-label="PWA Uygulamasını Cihaza Yükle"
      >
        <Smartphone
          className="w-3.5 h-3.5 shrink-0"
          style={themeTokens ? { color: themeTokens.primaryColor } : { color: '#D4AF6A' }}
        />
        <span>{label}</span>
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-title"
        >
          <div className="w-full max-w-md rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-6 text-neutral-900 dark:text-[#F5F2EB]">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h3 id="pwa-install-title" className="text-base font-semibold">
                ÖzTike Ciğer OS – Cihaza Kurulum (PWA)
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                aria-label="Kurulum penceresini kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
              {isIOS ? (
                <p>
                  iPhone / iPad Safari tarayıcısında alt araç çubuğundaki{' '}
                  <strong className="text-neutral-900 dark:text-white">Paylaş</strong>{' '}
                  (<Share2 className="inline w-3.5 h-3.5" />) simgesine dokunun ve{' '}
                  <strong className="text-neutral-900 dark:text-white">Ana Ekrana Ekle</strong>{' '}
                  seçeneğini seçin.
                </p>
              ) : (
                <p>
                  Masaüstü Chrome/Edge veya Android cihazınızda adres çubuğunun sağındaki{' '}
                  <strong className="text-neutral-900 dark:text-white">ÖzTike OS Yükle</strong>{' '}
                  simgesine tıklayarak tam ekran POS, KDS veya Garson terminali olarak çalıştırabilirsiniz.
                </p>
              )}
              <div className="p-3 rounded-lg bg-neutral-100 dark:bg-[#141413] text-xs text-neutral-600 dark:text-neutral-400">
                Çevrimdışı durumda önbellekteki menü ve ekranlar görüntülenebilir; ancak çevrimdışı modda ödeme başarılı gösterilmez ve mükerrer sipariş engellenir.
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-[#B86B35] text-white hover:bg-[#9F5928] transition-colors cursor-pointer"
              >
                Anladım
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const FooterPWACard: React.FC<{
  title: string;
  description: string;
  buttonLabel: string;
  installedLabel: string;
  pwaSettings?: SiteCmsConfig['pwaSettings'];
  themeTokens?: ResolvedThemeTokens;
}> = ({ title, description, buttonLabel, installedLabel, pwaSettings, themeTokens }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const [guideOpen, setGuideOpen] = useState(false);
  const [downloadConfirm, setDownloadConfirm] = useState<string | null>(null);
  const [platformTab, setPlatformTab] = useState<'ios' | 'android' | 'pc'>(
    isIOS ? 'ios' : 'android'
  );

  if (pwaSettings && !pwaSettings.enabled) return null;

  const isEmbeddedIframe =
    typeof window !== 'undefined' && window.self !== window.top;
  const appIconSrc = pwaSettings?.iconUrl || '/assets/aistudio/oztike-logo-transparent.png';
  const resolvedTitle = pwaSettings?.appName || title;
  const resolvedBtnLabel = pwaSettings?.installButtonLabelTr || buttonLabel;
  const resolvedDescription = !isOnline
    ? pwaSettings?.offlineTextTr || description
    : pwaSettings?.description || description;

  const cardStyle: React.CSSProperties = themeTokens
    ? {
        backgroundColor: themeTokens.surfaceColor,
        borderColor: themeTokens.borderColor,
        color: themeTokens.textPrimary,
      }
    : {};

  const handleTriggerInstall = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) return;
    }
    setGuideOpen(true);
  };

  const handleDownloadShortcut = () => {
    const targetUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/?source=pwa`
        : 'https://oztikeciger.com.tr';
    const htmlContent = `<!doctype html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${resolvedTitle}</title>
  <meta http-equiv="refresh" content="0;url=${targetUrl}" />
  <style>body{background:#120806;color:#F6D79E;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;margin:0}a{color:#D4A359;font-weight:bold}</style>
</head>
<body>
  <div>
    <h2>${resolvedTitle}</h2>
    <p>Uygulama başlatılıyor... Açılmazsa <a href="${targetUrl}">buraya dokunun</a>.</p>
  </div>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Oztike-Ciger-Uygulama.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadConfirm('Hızlı başlatıcı uygulama kısayolu (Oztike-Ciger-Uygulama.html) indirildi.');
  };

  return (
    <div
      style={cardStyle}
      className={`${
        themeTokens ? themeTokens.cardRadius : 'rounded-2xl'
      } border border-[#D4A359]/35 bg-[#1E0E0A] p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <img
          src={appIconSrc}
          alt={resolvedTitle}
          style={
            themeTokens
              ? {
                  borderColor: themeTokens.borderColor,
                  backgroundColor: themeTokens.backgroundColor,
                }
              : undefined
          }
          className="w-12 h-12 rounded-xl border border-[#D4A359]/45 object-contain p-1 shrink-0 bg-[#120806]"
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4
              className="font-editorial text-sm sm:text-base font-bold"
              style={{ color: themeTokens ? themeTokens.textPrimary : '#F6D79E' }}
            >
              {resolvedTitle}
            </h4>
            <span
              style={
                themeTokens?.isLight
                  ? {
                      backgroundColor: 'rgba(16, 185, 129, 0.14)',
                      borderColor: 'rgba(5, 150, 105, 0.35)',
                      color: '#065F46',
                    }
                  : undefined
              }
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-[10px] font-bold text-emerald-300"
            >
              iOS · Android · PC
            </span>
          </div>
          <p
            className="text-xs mt-1 leading-relaxed"
            style={{ color: themeTokens ? themeTokens.textSecondary : '#DECAB4' }}
          >
            {resolvedDescription}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto">
        {isInstalled ? (
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{installedLabel}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleTriggerInstall}
            data-testid="pwa-footer-install-btn"
            style={
              themeTokens
                ? {
                    backgroundImage: `linear-gradient(to right, ${themeTokens.primaryColor}, ${themeTokens.secondaryColor})`,
                    color: themeTokens.ctaTextColor,
                  }
                : undefined
            }
            className={`w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 ${
              themeTokens ? themeTokens.buttonRadius : 'rounded-xl'
            } bg-gradient-to-r from-[#D4A359] to-[#B0782C] text-[#1A0B08] font-extrabold text-xs shadow-lg hover:brightness-110 transition-all cursor-pointer`}
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>{resolvedBtnLabel}</span>
          </button>
        )}
      </div>

      {guideOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="PWA Kurulum Rehberi"
          className="fixed inset-0 z-[130] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-lg rounded-3xl border border-[#D4A359]/45 bg-[#180B08] text-[#FFF6E9] p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#D4A359]/20 pb-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={appIconSrc}
                  alt={resolvedTitle}
                  className="w-9 h-9 rounded-lg border border-[#D4A359]/40 object-contain p-0.5 bg-[#120806]"
                />
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#FFF7EB]">{resolvedTitle}</h3>
                  <p className="text-[11px] text-[#C4AC95]">iOS Safari · Android Chrome · PC Masaüstü</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGuideOpen(false)}
                aria-label="Kapat"
                className="p-1.5 rounded-xl bg-[#27120D] text-[#DECAB4] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#120705] border border-[#D4A359]/20 text-xs">
              <button
                type="button"
                onClick={() => setPlatformTab('ios')}
                className={`py-2 px-2 rounded-lg font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                  platformTab === 'ios' ? 'bg-[#D4A359] text-[#1A0B08]' : 'text-[#C4AC95]'
                }`}
              >
                <Apple className="w-3.5 h-3.5" />
                <span>iPhone / iPad</span>
              </button>
              <button
                type="button"
                onClick={() => setPlatformTab('android')}
                className={`py-2 px-2 rounded-lg font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                  platformTab === 'android' ? 'bg-[#D4A359] text-[#1A0B08]' : 'text-[#C4AC95]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android</span>
              </button>
              <button
                type="button"
                onClick={() => setPlatformTab('pc')}
                className={`py-2 px-2 rounded-lg font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                  platformTab === 'pc' ? 'bg-[#D4A359] text-[#1A0B08]' : 'text-[#C4AC95]'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>PC / Mac</span>
              </button>
            </div>

            <div className="rounded-2xl border border-[#D4A359]/25 bg-[#120705] p-4 space-y-2.5 text-xs text-[#DECAB4]">
              {platformTab === 'ios' && (
                <>
                  <div className="font-bold text-[#F6D79E]">iOS (iPhone & iPad · Safari) Kurulum Adımları:</div>
                  {pwaSettings?.iosHintTr && (
                    <p className="text-[11px] text-[#F6D79E]/90 bg-[#1F0F0B] border border-[#D4A359]/25 rounded-lg px-2.5 py-1.5">
                      {pwaSettings.iosHintTr}
                    </p>
                  )}
                  <ol className="list-decimal list-inside space-y-1.5">
                    <li>Bu sayfayı Safari tarayıcısında tam sayfa olarak açın.</li>
                    <li>
                      Alt araç çubuğundaki <strong className="text-white">Paylaş</strong> (<Share2 className="inline w-3.5 h-3.5 text-[#D4A359]" />) simgesine dokunun.
                    </li>
                    <li>
                      Aşağı kaydırıp <strong className="text-white">“Ana Ekrana Ekle” (Add to Home Screen)</strong> seçeneğine dokunun.
                    </li>
                    <li>Sağ üstten <strong className="text-white">Ekle</strong> butonuna basın; uygulama ana ekranınıza kurulur.</li>
                  </ol>
                </>
              )}

              {platformTab === 'android' && (
                <>
                  <div className="font-bold text-[#F6D79E]">Android (Chrome / Samsung Internet) Kurulum Adımları:</div>
                  <ol className="list-decimal list-inside space-y-1.5">
                    <li>Aşağıdaki &ldquo;Önizleme Dışında Tam Sayfada Aç&rdquo; ile siteyi doğrudan tarayıcı sekmesinde açın.</li>
                    <li>Tarayıcı sağ üst köşesindeki <strong className="text-white">⋮ (Üç Nokta)</strong> menüsüne dokunun.</li>
                    <li><strong className="text-white">“Uygulamayı Yükle”</strong> veya <strong className="text-white">“Ana Ekrana Ekle”</strong> seçeneğini seçin.</li>
                    <li>Açılan onay penceresinde <strong className="text-white">Yükle</strong> butonuna basın.</li>
                  </ol>
                </>
              )}

              {platformTab === 'pc' && (
                <>
                  <div className="font-bold text-[#F6D79E]">Bilgisayar (Windows / macOS · Chrome & Edge) Kurulumu:</div>
                  <ol className="list-decimal list-inside space-y-1.5">
                    <li>Tarayıcı adres çubuğunun sağındaki <strong className="text-white">Bilgisayar / İndir (Yükle)</strong> ikonuna tıklayın.</li>
                    <li>Alternatif olarak tarayıcı menüsünden <strong className="text-white">{resolvedTitle} Yükle</strong> seçeneğine basın.</li>
                    <li>Veya aşağıdaki Hızlı Başlatıcı Kısayol dosyasını indirip masaüstünüzden tek tıkla açın.</li>
                  </ol>
                </>
              )}
            </div>

            {downloadConfirm && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3 text-xs text-emerald-300 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{downloadConfirm}</span>
              </div>
            )}

            <div className="space-y-2">
              {isInstallable && (
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await install();
                    if (ok) setGuideOpen(false);
                  }}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
                >
                  Tarayıcı Kurulum Penceresini Şimdi Aç (Tek Tıkla Kur)
                </button>
              )}

              {isEmbeddedIframe && (
                <a
                  href={typeof window !== 'undefined' ? window.location.href : '/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D4A359] to-[#B0782C] text-[#1A0B08] font-extrabold text-xs flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-4 h-4 shrink-0" />
                  <span>Önizleme Dışında Tam Sayfada Aç (Kurulum İçin)</span>
                </a>
              )}

              <button
                type="button"
                onClick={handleDownloadShortcut}
                className="w-full py-2.5 px-4 rounded-xl border border-[#D4A359]/45 bg-[#24110D] hover:bg-[#331812] text-[#F6D79E] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 shrink-0 text-[#D4A359]" />
                <span>Uygulama Hızlı Başlatıcı Dosyasını İndir (.html)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const OfflineIndicator: React.FC<{ simulatedOffline?: boolean }> = ({ simulatedOffline }) => {
  const browserOnline = useOnlineStatus();
  const isOnline = simulatedOffline ? false : browserOnline;

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-lg border border-amber-700 bg-amber-950/95 px-4 py-2.5 text-xs font-medium text-amber-100 shadow-lg"
    >
      <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
      <span>
        Çevrimdışı Mod: Güvenli önbellek aktif. Bağlantı sağlanana kadar ödeme onayı ve yeni sipariş gönderimi duraklatıldı.
      </span>
    </div>
  );
};

export type LogoVariantType =
  | 'main'
  | 'horizontal'
  | 'vertical'
  | 'symbol'
  | 'favicon'
  | 'light_bg'
  | 'dark_bg'
  | 'pwa_icon'
  | 'admin_compact';

export const OztikeLogoMark: React.FC<{
  variant?: LogoVariantType;
  className?: string;
}> = ({ variant = 'horizontal', className = '' }) => {
  const isLightSurface = variant === 'light_bg';
  const primaryText = isLightSurface ? '#141413' : '#F5F2EB';
  const secondaryText = isLightSurface ? '#7C431B' : '#D4AF6A';

  if (variant === 'symbol' || variant === 'favicon' || variant === 'pwa_icon') {
    return (
      <img
        src="/assets/aistudio/oztike-logo-transparent.png"
        alt="ÖzTike Ciğer Halil Usta Logo"
        className={className || 'w-12 h-12 object-contain drop-shadow-md'}
      />
    );
  }

  if (variant === 'vertical' || variant === 'main') {
    return (
      <div
        className={`inline-flex flex-col items-center text-center p-2 rounded-xl ${className}`}
      >
        <img
          src="/assets/aistudio/oztike-logo-transparent.png"
          alt="ÖzTike Ciğer Halil Usta Logo"
          className="w-20 h-20 object-contain drop-shadow-lg mb-1.5"
        />
        <span className="font-editorial text-sm font-bold tracking-wider" style={{ color: primaryText }}>
          ÖZTİKE CİĞER · HALİL USTA
        </span>
        <span className="text-[10px] tracking-widest mt-0.5" style={{ color: secondaryText }}>
          USTA İŞİ LEZZET · 1996&apos;DAN BERİ
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src="/assets/aistudio/oztike-logo-transparent.png"
        alt="ÖzTike Ciğer Halil Usta Logo"
        className="w-10 h-10 object-contain shrink-0 drop-shadow-md"
      />
      <div className="leading-tight">
        <span className="font-editorial text-base font-bold tracking-tight whitespace-nowrap shrink-0 block">
          ÖzTike Ciğer
        </span>
        <span className="text-[10px] tracking-wider uppercase text-[#D4AF6A] block">
          Halil Usta · 1996&apos;dan Beri
        </span>
      </div>
    </div>
  );
};

export const BrandIdentityShowcase: React.FC<{
  onDownloadAsset: (name: string) => void;
}> = ({ onDownloadAsset }) => {
  const variants: { id: LogoVariantType; title: string; subtitle: string; bgClass: string }[] = [
    { id: 'main', title: '1. Ana Kurumsal Logo', subtitle: 'Resmi Tabela & Menü Kapağı', bgClass: 'bg-[#141413] text-[#F5F2EB]' },
    { id: 'horizontal', title: '2. Yatay Logo', subtitle: 'Üst Bar & Fatura Başlığı', bgClass: 'bg-[#1F1F1D] text-[#F5F2EB]' },
    { id: 'vertical', title: '3. Dikey Logo', subtitle: 'Masaüstü QR & Sunum Kartı', bgClass: 'bg-[#141413] text-[#F5F2EB]' },
    { id: 'symbol', title: '4. Sembol Logo', subtitle: 'Mühür & Ambalaj Baskısı', bgClass: 'bg-[#1F1F1D] text-[#F5F2EB]' },
    { id: 'favicon', title: '5. Favicon (SVG / ICO)', subtitle: 'Tarayıcı Sekme İkonu (16px–64px)', bgClass: 'bg-[#141413] text-[#F5F2EB]' },
    { id: 'light_bg', title: '6. Açık Zemin Logo', subtitle: 'Krem (#F8F6F0) & Beyaz Yüzeyler', bgClass: 'bg-[#F8F6F0] text-[#141413]' },
    { id: 'dark_bg', title: '7. Koyu Zemin Logo', subtitle: 'Kömür Siyahı (#141413) Yüzeyler', bgClass: 'bg-[#141413] text-[#F5F2EB]' },
    { id: 'pwa_icon', title: '8. PWA Uygulama İkonu', subtitle: '192x192 & 512x512 Maskable PNG', bgClass: 'bg-[#1F1F1D] text-[#F5F2EB]' },
    { id: 'admin_compact', title: '9. Yönetim Paneli Varyasyonu', subtitle: 'Sidebar & POS Terminal Başlığı', bgClass: 'bg-[#141413] text-[#F5F2EB]' },
  ];

  const palette = [
    { name: 'Kömür Siyahı', hex: '#141413', sampleClass: 'bg-[#141413] text-[#F5F2EB]' },
    { name: 'Antrasit', hex: '#1F1F1D', sampleClass: 'bg-[#1F1F1D] text-[#F5F2EB]' },
    { name: 'Krem', hex: '#F8F6F0', sampleClass: 'bg-[#F8F6F0] text-[#141413]' },
    { name: 'Bakır', hex: '#B86B35', sampleClass: 'bg-[#B86B35] text-white' },
    { name: 'Şampanya Altını', hex: '#D4AF6A', sampleClass: 'bg-[#D4AF6A] text-[#141413]' },
    { name: 'Açık Gri', hex: '#E6E3DC', sampleClass: 'bg-[#E6E3DC] text-[#141413]' },
    { name: 'Beyaz', hex: '#FFFFFF', sampleClass: 'bg-white text-[#141413]' },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5">
        <h3 className="text-base font-semibold text-neutral-900 dark:text-[#F5F2EB]">
          Bölüm 2.1 – ÖzTike Ciğer 9 Kurumsal Logo Varyasyonu
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
          Farklı ekran boyutlarında ve açık/koyu yüzeylerde okunabilir vektörel kurumsal kimlik çıktıları.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {variants.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 flex flex-col justify-between gap-3"
            >
              <div
                className={`h-28 rounded-lg flex items-center justify-center border border-neutral-200/40 dark:border-neutral-700/50 ${item.bgClass}`}
              >
                <OztikeLogoMark variant={item.id} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold text-neutral-900 dark:text-[#F5F2EB]">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    {item.subtitle}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onDownloadAsset(item.title)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>SVG İndir</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5">
        <h3 className="text-base font-semibold text-neutral-900 dark:text-[#F5F2EB]">
          Bölüm 2.2 – Kurumsal Renk Paleti (Neon İçermeyen Editoryal Palet)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-4">
          {palette.map((c) => (
            <div
              key={c.hex}
              className="rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden"
            >
              <div className={`h-16 flex items-end p-2.5 text-xs font-mono ${c.sampleClass}`}>
                {c.hex}
              </div>
              <div className="p-2.5 text-xs font-medium text-neutral-800 dark:text-neutral-200">
                {c.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
