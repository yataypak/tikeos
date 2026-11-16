import React, { useMemo, useState } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import {
  Compass,
  Copy,
  Check,
  ExternalLink,
  Globe,
  MapPin,
  Navigation,
  Route,
  Smartphone,
} from 'lucide-react';
import { buildMapNavigationUrls } from '../core/restaurantEngine';
import type { SiteCmsConfig } from '../data/siteCmsStore';
import type { SupportedLang } from '../i18n/translations';

interface RestaurantMapSectionProps {
  mapSettings: SiteCmsConfig['mapSettings'];
  contact: SiteCmsConfig['contact'];
  lang?: SupportedLang;
  quotaExceeded?: boolean;
  compact?: boolean;
}

export const RestaurantMapSection: React.FC<RestaurantMapSectionProps> = ({
  mapSettings,
  contact,
  lang = 'tr',
  quotaExceeded = false,
  compact = false,
}) => {
  const [infoOpen, setInfoOpen] = useState(true);
  const [copiedCoords, setCopiedCoords] = useState(false);

  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) || '';
  const lat = Number.isFinite(mapSettings.lat) ? mapSettings.lat : 37.0628;
  const lng = Number.isFinite(mapSettings.lng) ? mapSettings.lng : 37.3795;
  const zoom = Number.isFinite(mapSettings.zoom) ? mapSettings.zoom : 16;

  const navUrls = useMemo(
    () => buildMapNavigationUrls(lat, lng, mapSettings.placeName || 'ÖzTike Ciğer · Halil Usta'),
    [lat, lng, mapSettings.placeName]
  );

  const mapLanguage =
    lang === 'ar'
      ? 'ar'
      : lang === 'en'
        ? 'en'
        : lang === 'fr'
          ? 'fr'
          : lang === 'de'
            ? 'de'
            : lang === 'ja'
              ? 'ja'
              : lang === 'zh'
                ? 'zh-CN'
                : 'tr';

  if (!mapSettings.enabled) return null;

  const useInteractiveJsSdk = Boolean(apiKey && mapSettings.enableGoogleMapsJs && !quotaExceeded);
  const embedSrc = `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&hl=${mapLanguage}&output=embed`;

  const handleCopyCoords = () => {
    const text = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(text);
    }
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const navButtons = [
    {
      id: 'google-maps',
      show: true,
      label: 'Google Maps',
      href: navUrls.googleMapsUrl,
      icon: MapPin,
      tone: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25',
    },
    {
      id: 'google-nav',
      show: mapSettings.enableGoogleNav,
      label: 'Google Navigasyon',
      href: navUrls.googleDirectionsUrl,
      icon: Navigation,
      tone: 'border-[#D4A359]/50 bg-[#D4A359]/20 text-[#F6D79E] hover:bg-[#D4A359]/30',
    },
    {
      id: 'apple-maps',
      show: mapSettings.enableAppleMaps,
      label: 'Apple Maps',
      href: navUrls.appleMapsUrl,
      icon: Smartphone,
      tone: 'border-sky-500/40 bg-sky-500/15 text-sky-200 hover:bg-sky-500/25',
    },
    {
      id: 'yandex',
      show: mapSettings.enableYandexMaps,
      label: 'Yandex Haritalar',
      href: navUrls.yandexMapsUrl,
      icon: Compass,
      tone: 'border-rose-500/40 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25',
    },
    {
      id: 'waze',
      show: mapSettings.enableWaze,
      label: 'Waze',
      href: navUrls.wazeUrl,
      icon: Route,
      tone: 'border-cyan-500/40 bg-cyan-500/15 text-cyan-200 hover:bg-cyan-500/25',
    },
    {
      id: 'osm',
      show: mapSettings.enableOpenStreetMap,
      label: 'OpenStreetMap',
      href: navUrls.openStreetMapUrl,
      icon: Globe,
      tone: 'border-amber-500/35 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20',
    },
    {
      id: 'bing',
      show: mapSettings.enableBingMaps,
      label: 'Bing Maps',
      href: navUrls.bingMapsUrl,
      icon: ExternalLink,
      tone: 'border-indigo-500/35 bg-indigo-500/10 text-indigo-200 hover:bg-indigo-500/20',
    },
  ].filter((item) => item.show);

  return (
    <div
      id="konum"
      className={`rounded-3xl border border-[#D4A359]/25 bg-[#1A0C09]/90 overflow-hidden shadow-xl ${compact ? '' : 'mt-6'}`}
    >
      <div className="px-5 py-4 border-b border-[#D4A359]/15 flex flex-wrap items-center justify-between gap-3 bg-[#120806]/70">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-[#D4A359]/15 border border-[#D4A359]/35 flex items-center justify-center text-[#D4A359]">
            <MapPin className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm md:text-base font-bold text-[#F5EFE6]">
              {mapSettings.placeName || 'ÖzTike Ciğer · Halil Usta'}
            </h3>
            <p className="text-xs text-[#C7B39B]">
              {mapSettings.addressLine || contact.addressTr}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCopyCoords}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D4A359]/30 bg-[#1F0F0B] text-[11px] font-semibold text-[#F6D79E] hover:bg-[#D4A359]/15 transition cursor-pointer"
        >
          {copiedCoords ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedCoords ? 'Kopyalandı' : `${lat.toFixed(4)}, ${lng.toFixed(4)}`}</span>
        </button>
      </div>

      {/* Interactive Map Container with explicit height per CF2 */}
      <div className="relative w-full h-[340px] sm:h-[380px] bg-[#120806]">
        {useInteractiveJsSdk ? (
          <APIProvider apiKey={apiKey} libraries={['marker']} language={mapLanguage} region="TR">
            <GoogleMap
              defaultCenter={{ lat, lng }}
              center={{ lat, lng }}
              defaultZoom={zoom}
              zoom={zoom}
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              gestureHandling="greedy"
              style={{ width: '100%', height: '100%' }}
            >
              <AdvancedMarker
                position={{ lat, lng }}
                title={mapSettings.placeName}
                onClick={() => setInfoOpen((prev) => !prev)}
              />
              {infoOpen && (
                <InfoWindow position={{ lat, lng }} onCloseClick={() => setInfoOpen(false)}>
                  <div className="text-stone-900 p-1 max-w-[230px]">
                    <p className="font-bold text-xs">{mapSettings.placeName}</p>
                    <p className="text-[11px] text-stone-600 mt-0.5">{mapSettings.addressLine || contact.addressTr}</p>
                    <a
                      href={navUrls.googleDirectionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-1.5 text-[11px] font-bold text-amber-700 underline"
                    >
                      Yol Tarifi Başlat →
                    </a>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </APIProvider>
        ) : (
          <div className="relative w-full h-full">
            <iframe
              title={mapSettings.placeName || 'ÖzTike Ciğer Harita'}
              src={embedSrc}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="pointer-events-none absolute left-3 bottom-3 rounded-xl bg-[#120806]/90 border border-[#D4A359]/40 px-3 py-2 backdrop-blur-md">
              <p className="text-[11px] font-bold text-[#F6D79E]">{mapSettings.placeName}</p>
              <p className="text-[10px] text-[#C7B39B]">{mapSettings.addressLine}</p>
            </div>
          </div>
        )}
      </div>

      {/* Multi-Provider Map & Navigation Launchers */}
      <div className="p-4 bg-[#120806]/85 border-t border-[#D4A359]/15">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#C7B39B] mb-2.5">
          Konumu Göster &amp; Navigasyon Uygulamasında Aç
        </p>
        <div className="flex flex-wrap gap-2">
          {navButtons.map((btn) => {
            const Icon = btn.icon;
            return (
              <a
                key={btn.id}
                href={btn.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition ${btn.tone}`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{btn.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};
