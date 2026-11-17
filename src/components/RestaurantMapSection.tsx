import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import {
  MapPin,
  Navigation,
  Compass,
  ExternalLink,
  Copy,
  Check,
  Globe,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import {
  buildMapNavigationUrls,
  buildMapEmbedUrl,
} from '../core/restaurantEngine';
import type { SiteCmsConfig } from '../data/siteCmsStore';

export interface KonumNavigasyonuProps {
  lat?: number;
  lng?: number;
  placeName?: string;
  addressLine?: string;
  enableGoogleNav?: boolean;
  enableAppleMaps?: boolean;
  enableWaze?: boolean;
  enableYandexMaps?: boolean;
  enableOpenStreetMap?: boolean;
  enableBingMaps?: boolean;
  compact?: boolean;
  title?: string;
  mapSettings?: SiteCmsConfig['mapSettings'];
}

/**
 * Müşteri tercihlerine göre Google Maps, Apple Maps, Waze, Yandex Maps, OpenStreetMap ve Bing Maps'i
 * tetikleyen küçük, şık ikon düğmeleri içeren bağımsız 'Konum Navigasyonu' bileşeni.
 */
export const KonumNavigasyonu: React.FC<KonumNavigasyonuProps> = (props) => {
  const ms = props.mapSettings;
  const lat = props.lat ?? ms?.lat ?? 37.0628;
  const lng = props.lng ?? ms?.lng ?? 37.3795;
  const placeName = props.placeName ?? ms?.placeName ?? 'ÖzTike Ciğer · Halil Usta';
  const addressLine = props.addressLine ?? ms?.addressLine ?? '';
  const enableGoogleNav = props.enableGoogleNav ?? ms?.enableGoogleNav ?? true;
  const enableAppleMaps = props.enableAppleMaps ?? ms?.enableAppleMaps ?? true;
  const enableWaze = props.enableWaze ?? ms?.enableWaze ?? true;
  const enableYandexMaps = props.enableYandexMaps ?? ms?.enableYandexMaps ?? true;
  const enableOpenStreetMap = props.enableOpenStreetMap ?? ms?.enableOpenStreetMap ?? true;
  const enableBingMaps = props.enableBingMaps ?? ms?.enableBingMaps ?? true;
  const compact = props.compact ?? false;

  const [copiedCoords, setCopiedCoords] = useState(false);
  const [activeNavToast, setActiveNavToast] = useState<string | null>(null);
  const navUrls = buildMapNavigationUrls(lat, lng, placeName);

  const handleCopyCoords = () => {
    const text = `${lat.toFixed(6)}, ${lng.toFixed(6)} — ${placeName} (${addressLine || ''})`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const navApps = [
    {
      id: 'google-maps',
      enabled: true,
      label: 'Google Maps',
      shortLabel: 'Google Maps',
      href: navUrls.googleMapsUrl,
      badgeBg: 'bg-[#4285F4]/20 text-[#8AB4F8] border-[#4285F4]/40',
      svgIcon: (
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
        </svg>
      ),
    },
    {
      id: 'google-dir',
      enabled: enableGoogleNav !== false,
      label: 'Google Yol Tarifi',
      shortLabel: 'Yol Tarifi',
      href: navUrls.googleDirectionsUrl,
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      svgIcon: <Navigation className="w-3.5 h-3.5 shrink-0" />,
    },
    {
      id: 'apple-maps',
      enabled: enableAppleMaps !== false,
      label: 'Apple Maps',
      shortLabel: 'Apple Maps',
      href: navUrls.appleMapsUrl,
      badgeBg: 'bg-white/15 text-white border-white/30',
      svgIcon: (
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.96 6.33c.67-.81 1.12-1.94 1-3.08-.96.04-2.13.64-2.82 1.45-.61.7-.15 1.85-1.02 2.97 1.08.08 2.17-.53 2.84-1.34z" />
        </svg>
      ),
    },
    {
      id: 'waze',
      enabled: enableWaze !== false,
      label: 'Waze Navigasyon',
      shortLabel: 'Waze',
      href: navUrls.wazeUrl,
      badgeBg: 'bg-[#33CCFF]/20 text-[#7CE0FF] border-[#33CCFF]/40',
      svgIcon: (
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.5 16.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-9 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM20 11c0-4.42-3.58-8-8-8s-8 3.58-8 8c0 1.85.63 3.55 1.69 4.9L4 17.5h16c1.1 0 2-.9 2-2 0-1.66-2-2.5-2-4.5z" />
        </svg>
      ),
    },
    {
      id: 'yandex',
      enabled: enableYandexMaps !== false,
      label: 'Yandex Maps',
      shortLabel: 'Yandex',
      href: navUrls.yandexMapsUrl,
      badgeBg: 'bg-[#FC3F1D]/20 text-[#FF8C75] border-[#FC3F1D]/40',
      svgIcon: <Compass className="w-3.5 h-3.5 shrink-0" />,
    },
    {
      id: 'osm',
      enabled: enableOpenStreetMap !== false,
      label: 'OpenStreetMap',
      shortLabel: 'OSM',
      href: navUrls.openStreetMapUrl,
      badgeBg: 'bg-teal-500/20 text-teal-200 border-teal-500/40',
      svgIcon: <Globe className="w-3.5 h-3.5 shrink-0" />,
    },
    {
      id: 'bing',
      enabled: enableBingMaps !== false,
      label: 'Bing Maps',
      shortLabel: 'Bing',
      href: navUrls.bingMapsUrl,
      badgeBg: 'bg-indigo-500/20 text-indigo-200 border-indigo-500/40',
      svgIcon: <MapPin className="w-3.5 h-3.5 shrink-0" />,
    },
    {
      id: 'geo-native',
      enabled: true,
      label: 'Cihaz Navigasyonu',
      shortLabel: 'Cihazda Aç',
      href: navUrls.geoUri,
      badgeBg: 'bg-[#D4A359]/20 text-[#F5D69B] border-[#D4A359]/45',
      svgIcon: <Smartphone className="w-3.5 h-3.5 shrink-0" />,
    },
  ].filter((app) => app.enabled);

  return (
    <div
      data-testid="konum-navigasyonu-bar"
      className="px-4 py-3 bg-[#0E0705] border-t border-[#D4A359]/20 space-y-2"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[10px] uppercase tracking-wider font-bold text-[#C4AC95] flex items-center gap-1.5">
          <Navigation className="w-3 h-3 text-[#D4A359]" />
          <span>Konum Navigasyonu · Tercih Ettiğiniz Uygulama İle Açın:</span>
        </span>
        <button
          type="button"
          onClick={handleCopyCoords}
          data-testid="copy-map-coords-btn"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-white/15 bg-white/5 hover:border-[#D4A359]/50 text-[11px] font-semibold text-[#EAD8C3] transition cursor-pointer"
        >
          {copiedCoords ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-300">Koordinat Kopyalandı</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-[#D4A359]" />
              <span className="font-mono">{lat.toFixed(4)}, {lng.toFixed(4)}</span>
            </>
          )}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {navApps.map((app) => (
          <a
            key={app.id}
            href={app.href}
            target={app.id === 'geo-native' ? undefined : '_blank'}
            rel={app.id === 'geo-native' ? undefined : 'noopener noreferrer'}
            data-testid={`nav-icon-${app.id}`}
            title={`${app.label} ile yol tarifi başlat`}
            onClick={() => setActiveNavToast(`${app.label} navigasyon bağlantısı tetiklendi.`)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border bg-[#190D09] hover:bg-[#24130D] hover:scale-[1.02] transition-all text-[11px] font-semibold text-[#FFF7EB] shadow-sm ${app.badgeBg}`}
          >
            <span className="w-5 h-5 rounded-lg bg-black/30 flex items-center justify-center shrink-0">
              {app.svgIcon}
            </span>
            <span>{compact ? app.shortLabel : app.label}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60 shrink-0" />
          </a>
        ))}
      </div>

      {activeNavToast && (
        <div className="text-[11px] text-emerald-300 font-medium pt-0.5">
          ✓ {activeNavToast}
        </div>
      )}
    </div>
  );
};

export interface RestaurantMapSectionProps {
  mapSettings: SiteCmsConfig['mapSettings'];
  contact: SiteCmsConfig['contact'];
  lang?: string;
  compact?: boolean;
  showProviderBadge?: boolean;
  themeTokens?: unknown;
}

export const RestaurantMapSection: React.FC<RestaurantMapSectionProps> = ({
  mapSettings,
  contact,
  lang = 'tr',
  compact = false,
  showProviderBadge = false,
}) => {
  const [infoOpen, setInfoOpen] = useState(true);

  if (!mapSettings?.enabled) {
    return null;
  }

  const lat = Number.isFinite(mapSettings.lat) ? mapSettings.lat : 37.0628;
  const lng = Number.isFinite(mapSettings.lng) ? mapSettings.lng : 37.3795;
  const zoom = Number.isFinite(mapSettings.zoom) ? mapSettings.zoom : 16;
  const placeName = mapSettings.placeName || 'ÖzTike Ciğer · Halil Usta';
  const addressLine = mapSettings.addressLine || contact.addressTr;

  const envApiKey =
    (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim() || '';
  const effectivePaidKey = (mapSettings.paidApiKey || '').trim() || envApiKey;

  const embedInfo = buildMapEmbedUrl({
    providerMode: mapSettings.providerMode || 'free',
    freeProvider: mapSettings.freeProvider || 'google-embed-free',
    paidProvider: mapSettings.paidProvider || 'google-js-api',
    lat,
    lng,
    zoom,
    lang,
    placeName,
    paidApiKey: effectivePaidKey,
    customEmbedUrl: mapSettings.customEmbedUrl,
  });

  const navUrls = buildMapNavigationUrls(lat, lng, placeName);
  const mapHeightClass = compact ? 'h-56 sm:h-64' : 'h-64 sm:h-72';

  return (
    <div
      data-testid="restaurant-map-section"
      className="rounded-2xl border border-[#D4A359]/30 bg-[#140907] text-[#FFF7EB] overflow-hidden shadow-xl"
    >
      {/* Üst Konum Başlık Çubuğu */}
      <div className="px-4 py-3 border-b border-[#D4A359]/20 flex flex-wrap items-center justify-between gap-2 bg-[#1B0C09]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#D4A359]/15 border border-[#D4A359]/35 flex items-center justify-center text-[#D4A359] shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold text-[#FFF7EB] truncate flex items-center gap-2">
              <span>{placeName}</span>
              {showProviderBadge && (
                <span className="px-2 py-0.5 rounded-md bg-[#D4A359]/20 text-[#F5D69B] font-mono text-[10px]">
                  {embedInfo.providerLabel}
                </span>
              )}
            </div>
            <div className="text-[11px] text-[#C4AC95] truncate">{addressLine}</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <a
            href={navUrls.googleDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="map-primary-directions-btn"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#D4A359] to-[#B0782C] text-[#1A0B08] font-bold text-xs shadow-sm hover:opacity-95 transition"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Yol Tarifi Al</span>
          </a>
        </div>
      </div>

      {/* Harita Görünümü (Ücretli Google JS SDK veya Ücretsiz/Embed Harita) */}
      <div className={`relative w-full ${mapHeightClass} bg-[#100705]`}>
        {embedInfo.mode === 'js-sdk' && effectivePaidKey ? (
          <APIProvider apiKey={effectivePaidKey}>
            <Map
              defaultCenter={{ lat, lng }}
              defaultZoom={zoom}
              mapId="OZTIKE_RESTAURANT_MAP"
              gestureHandling="cooperative"
              disableDefaultUI={false}
              className="w-full h-full"
            >
              <AdvancedMarker position={{ lat, lng }} onClick={() => setInfoOpen(true)}>
                <Pin background="#D4A359" glyphColor="#120806" borderColor="#FFF7EB" />
              </AdvancedMarker>
              {infoOpen && (
                <InfoWindow position={{ lat, lng }} onCloseClick={() => setInfoOpen(false)}>
                  <div className="p-1 text-xs text-neutral-900 max-w-[210px]">
                    <div className="font-bold">{placeName}</div>
                    <div className="text-[11px] text-neutral-600 mt-0.5">{addressLine}</div>
                    <div className="text-[11px] font-semibold text-amber-800 mt-1">
                      Tel: {contact.phoneDisplay}
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
        ) : (
          <iframe
            key={embedInfo.src}
            src={embedInfo.src}
            title={`${placeName} Konum Haritası`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full border-0"
          />
        )}

        {/* Sağ Üst Koordinat & Servis Rozeti */}
        <div className="pointer-events-none absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-[#D4A359]/35 text-[10px] font-mono text-[#F5D69B] flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#D4A359]" />
          <span>
            {lat.toFixed(4)}°K, {lng.toFixed(4)}°D
          </span>
        </div>
      </div>

      {/* Konum Navigasyonu Bileşeni (Google Maps, Apple Maps, Waze, Yandex Maps İkon Düğmeleri) */}
      <KonumNavigasyonu
        lat={lat}
        lng={lng}
        placeName={placeName}
        addressLine={addressLine}
        enableGoogleNav={mapSettings.enableGoogleNav}
        enableAppleMaps={mapSettings.enableAppleMaps}
        enableWaze={mapSettings.enableWaze}
        enableYandexMaps={mapSettings.enableYandexMaps}
        enableOpenStreetMap={mapSettings.enableOpenStreetMap}
        enableBingMaps={mapSettings.enableBingMaps}
        compact={compact}
      />
    </div>
  );
};
