import React from 'react';
import {
  MapPin,
  Navigation,
  Globe,
  Compass,
  CheckCircle2,
  ExternalLink,
  Smartphone,
  Sliders,
} from 'lucide-react';
import { RestaurantMapSection } from './RestaurantMapSection';
import type { SiteCmsConfig } from '../data/siteCmsStore';

interface AdminMapManagerProps {
  mapSettings: SiteCmsConfig['mapSettings'];
  contact: SiteCmsConfig['contact'];
  onUpdateMapSettings: (
    updater: (prev: SiteCmsConfig['mapSettings']) => SiteCmsConfig['mapSettings']
  ) => void;
  onNotify: (msg: string) => void;
}

export const AdminMapManager: React.FC<AdminMapManagerProps> = ({
  mapSettings,
  contact,
  onUpdateMapSettings,
  onNotify,
}) => {
  return (
    <div className="space-y-6 text-xs">
      {/* Üst Kart */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-[#F5F2EB] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#B86B35] dark:text-[#D4AF6A]" />
              <span>31. Harita &amp; Konum Yönetimi (Google Maps, Apple, Yandex, Waze)</span>
            </h3>
            <p className="text-neutral-500 mt-0.5">
              Restoranın coğrafi konumunu ve sitede gösterilen Google Maps ana haritası ile tüm harita uygulamaları açma butonlarını yönetin.
            </p>
          </div>

          <label className="inline-flex items-center gap-2 font-bold cursor-pointer px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-[#141413]">
            <input
              type="checkbox"
              checked={mapSettings.enabled}
              onChange={(e) => {
                onUpdateMapSettings((prev) => ({ ...prev, enabled: e.target.checked }));
                onNotify(
                  e.target.checked
                    ? 'Harita bölümü müşteri sitesinde aktif edildi.'
                    : 'Harita bölümü gizlendi.'
                );
              }}
            />
            <span>Harita Bölümü Sitede Gösterilsin</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sol 5 Sütun: Konum & Harita Ayarları Formu */}
        <div className="lg:col-span-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4 shadow-sm">
          <div className="font-bold text-sm text-[#B86B35] dark:text-[#D4AF6A] flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <Sliders className="w-4 h-4" />
            <span>Koordinat &amp; Servis Ayarları</span>
          </div>

          <div>
            <label className="block font-semibold mb-1">Mekan / Şube Adı</label>
            <input
              type="text"
              value={mapSettings.placeName}
              onChange={(e) =>
                onUpdateMapSettings((prev) => ({ ...prev, placeName: e.target.value }))
              }
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Açık Adres Metni</label>
            <textarea
              rows={2}
              value={mapSettings.addressLine}
              onChange={(e) =>
                onUpdateMapSettings((prev) => ({ ...prev, addressLine: e.target.value }))
              }
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Enlem (Latitude)</label>
              <input
                type="number"
                step="0.0001"
                value={mapSettings.lat}
                onChange={(e) =>
                  onUpdateMapSettings((prev) => ({ ...prev, lat: Number(e.target.value) }))
                }
                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Boylam (Longitude)</label>
              <input
                type="number"
                step="0.0001"
                value={mapSettings.lng}
                onChange={(e) =>
                  onUpdateMapSettings((prev) => ({ ...prev, lng: Number(e.target.value) }))
                }
                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">
              Harita Yakınlaştırma (Zoom: {mapSettings.zoom})
            </label>
            <input
              type="range"
              min={10}
              max={20}
              value={mapSettings.zoom}
              onChange={(e) =>
                onUpdateMapSettings((prev) => ({ ...prev, zoom: Number(e.target.value) }))
              }
              className="w-full"
            />
          </div>

          {/* Aktif Harita Uygulamaları Seçimi */}
          <div className="space-y-2.5 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <label className="block font-semibold text-neutral-900 dark:text-white">
              Sitede Gösterilecek Harita &amp; Navigasyon Butonları
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={mapSettings.enableGoogleMapsJs}
                onChange={(e) =>
                  onUpdateMapSettings((prev) => ({
                    ...prev,
                    enableGoogleMapsJs: e.target.checked,
                  }))
                }
              />
              <span>Google Maps İnteraktif Harita (Ana Harita)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={mapSettings.enableGoogleNav}
                onChange={(e) =>
                  onUpdateMapSettings((prev) => ({
                    ...prev,
                    enableGoogleNav: e.target.checked,
                  }))
                }
              />
              <span>Google Navigasyon (Yol Tarifi Başlat)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={mapSettings.enableAppleMaps}
                onChange={(e) =>
                  onUpdateMapSettings((prev) => ({
                    ...prev,
                    enableAppleMaps: e.target.checked,
                  }))
                }
              />
              <span>Apple Maps (iPhone &amp; iPad Haritalar)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={mapSettings.enableYandexMaps}
                onChange={(e) =>
                  onUpdateMapSettings((prev) => ({
                    ...prev,
                    enableYandexMaps: e.target.checked,
                  }))
                }
              />
              <span>Yandex Haritalar &amp; Navigasyon</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={mapSettings.enableWaze}
                onChange={(e) =>
                  onUpdateMapSettings((prev) => ({ ...prev, enableWaze: e.target.checked }))
                }
              />
              <span>Waze (Canlı Trafik &amp; Kaza Bildirimli Navigasyon)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={mapSettings.enableOpenStreetMap}
                onChange={(e) =>
                  onUpdateMapSettings((prev) => ({
                    ...prev,
                    enableOpenStreetMap: e.target.checked,
                  }))
                }
              />
              <span>OpenStreetMap (OSM)</span>
            </label>
          </div>
        </div>

        {/* Sağ 7 Sütun: Canlı Önizleme */}
        <div className="lg:col-span-7 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-[#120806] p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#D4A359]/20 pb-2.5">
            <span className="font-bold text-xs text-[#F6D79E] flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-[#D4A359]" />
              <span>Sitedeki Canlı Harita &amp; Navigasyon Önizlemesi</span>
            </span>
            <span className="font-mono text-[10px] text-[#A88E76]">
              {mapSettings.lat.toFixed(4)}, {mapSettings.lng.toFixed(4)}
            </span>
          </div>

          <RestaurantMapSection
            mapSettings={mapSettings}
            contact={contact}
            lang="tr"
          />
        </div>
      </div>
    </div>
  );
};
