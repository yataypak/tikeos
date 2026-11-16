import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Upload,
  CheckCircle2,
  Sparkles,
  WifiOff,
  Bell,
  Palette,
  Eye,
  Settings,
} from 'lucide-react';
import type { SiteCmsConfig } from '../data/siteCmsStore';

interface AdminPwaManagerProps {
  pwaSettings: SiteCmsConfig['pwaSettings'];
  onUpdatePwaSettings: (
    updater: (prev: SiteCmsConfig['pwaSettings']) => SiteCmsConfig['pwaSettings']
  ) => void;
  onNotify: (msg: string) => void;
}

export const AdminPwaManager: React.FC<AdminPwaManagerProps> = ({
  pwaSettings,
  onUpdatePwaSettings,
  onNotify,
}) => {
  const [iconFilePreview, setIconFilePreview] = useState<string>(pwaSettings.iconUrl);

  const handleIconUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      if (dataUrl) {
        setIconFilePreview(dataUrl);
        onUpdatePwaSettings((prev) => ({ ...prev, iconUrl: dataUrl }));
        onNotify('PWA uygulama ikonu güncellendi.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadManifest = () => {
    const manifestObj = {
      name: pwaSettings.appName,
      short_name: pwaSettings.shortName,
      description: pwaSettings.description,
      start_url: '/',
      display: pwaSettings.displayMode,
      orientation: pwaSettings.orientation,
      background_color: pwaSettings.backgroundColor,
      theme_color: pwaSettings.themeColor,
      icons: [
        {
          src: pwaSettings.iconUrl,
          sizes: '192x192 512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    };
    const blob = new Blob([JSON.stringify(manifestObj, null, 2)], {
      type: 'application/manifest+json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manifest.json';
    a.click();
    URL.revokeObjectURL(url);
    onNotify('manifest.json dosyası başarıyla dışa aktarıldı.');
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Üst Kart */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-[#F5F2EB] flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#B86B35] dark:text-[#D4AF6A]" />
              <span>30. PWA Mobil &amp; Masaüstü Uygulama Yönetimi (iOS · Android · PC)</span>
            </h3>
            <p className="text-neutral-500 mt-0.5">
              İşletmenizin mobil ve masaüstü Progressive Web App (PWA) kurulum, simge, renk ve çevrimdışı ayarlarını yapılandırın.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 font-bold cursor-pointer px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-[#141413]">
              <input
                type="checkbox"
                checked={pwaSettings.enabled}
                onChange={(e) => {
                  onUpdatePwaSettings((prev) => ({ ...prev, enabled: e.target.checked }));
                  onNotify(
                    e.target.checked
                      ? 'PWA kurulum desteği aktif edildi.'
                      : 'PWA kurulum desteği devre dışı bırakıldı.'
                  );
                }}
              />
              <span>PWA Kurulumu Aktif</span>
            </label>
            <button
              type="button"
              onClick={handleDownloadManifest}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#B86B35] text-white font-bold cursor-pointer hover:bg-[#9F5928] shadow"
            >
              <Download className="w-4 h-4" />
              <span>manifest.json İndir</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Sol 8 Sütun: Ayarlar Formu */}
        <div className="xl:col-span-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4 shadow-sm">
          <div className="font-bold text-sm text-[#B86B35] dark:text-[#D4AF6A] flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
            <Settings className="w-4 h-4" />
            <span>PWA Kimlik, Simge &amp; Davranış Ayarları</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Uygulama Adı (Tam Başlık)</label>
              <input
                type="text"
                value={pwaSettings.appName}
                onChange={(e) =>
                  onUpdatePwaSettings((prev) => ({ ...prev, appName: e.target.value }))
                }
                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Kısa Ad (Ana Ekran İkon Altı)</label>
              <input
                type="text"
                value={pwaSettings.shortName}
                onChange={(e) =>
                  onUpdatePwaSettings((prev) => ({ ...prev, shortName: e.target.value }))
                }
                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Uygulama Açıklaması</label>
            <textarea
              rows={2}
              value={pwaSettings.description}
              onChange={(e) =>
                onUpdatePwaSettings((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
            />
          </div>

          {/* İkon Yükleme / Değiştirme */}
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#141413] space-y-3">
            <label className="block font-semibold">Uygulama İkonu (192x192 &amp; 512x512)</label>
            <div className="flex flex-wrap items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#B86B35] bg-black p-1 shrink-0">
                <img
                  src={iconFilePreview || pwaSettings.iconUrl}
                  alt="PWA İkonu"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-[200px] space-y-1.5">
                <input
                  type="text"
                  value={pwaSettings.iconUrl}
                  onChange={(e) => {
                    setIconFilePreview(e.target.value);
                    onUpdatePwaSettings((prev) => ({ ...prev, iconUrl: e.target.value }));
                  }}
                  placeholder="İkon URL (/assets/...)"
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5 font-mono text-[11px]"
                />
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-[#B86B35] text-[#B86B35] dark:text-[#D4AF6A] font-semibold text-[11px] cursor-pointer hover:bg-[#B86B35]/10">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Cihazdan Yeni İkon Yükle (PNG / SVG)</span>
                  <input
                    type="file"
                    accept="image/png,image/svg+xml,image/jpeg"
                    className="hidden"
                    onChange={(e) => handleIconUpload(e.target.files)}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Renkler & Ekran Modu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold mb-1">Tema Rengi (Status Bar)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={pwaSettings.themeColor}
                  onChange={(e) =>
                    onUpdatePwaSettings((prev) => ({ ...prev, themeColor: e.target.value }))
                  }
                  className="h-8 w-10 rounded border cursor-pointer"
                />
                <span className="font-mono text-[11px]">{pwaSettings.themeColor}</span>
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-1">Açılış Arka Plan Rengi</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={pwaSettings.backgroundColor}
                  onChange={(e) =>
                    onUpdatePwaSettings((prev) => ({ ...prev, backgroundColor: e.target.value }))
                  }
                  className="h-8 w-10 rounded border cursor-pointer"
                />
                <span className="font-mono text-[11px]">{pwaSettings.backgroundColor}</span>
              </div>
            </div>
            <div>
              <label className="block font-semibold mb-1">Görünüm Modu</label>
              <select
                value={pwaSettings.displayMode}
                onChange={(e) =>
                  onUpdatePwaSettings((prev) => ({
                    ...prev,
                    displayMode: e.target.value as SiteCmsConfig['pwaSettings']['displayMode'],
                  }))
                }
                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5"
              >
                <option value="standalone">Standalone (Uygulama Penceresi)</option>
                <option value="fullscreen">Fullscreen (Tam Ekran)</option>
                <option value="minimal-ui">Minimal UI</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Ekran Yönü</label>
              <select
                value={pwaSettings.orientation}
                onChange={(e) =>
                  onUpdatePwaSettings((prev) => ({
                    ...prev,
                    orientation: e.target.value as SiteCmsConfig['pwaSettings']['orientation'],
                  }))
                }
                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5"
              >
                <option value="portrait">Dikey (Portrait)</option>
                <option value="any">Otomatik / Her İkisi (Any)</option>
              </select>
            </div>
          </div>

          {/* Çevrimdışı ve Push Özellikleri */}
          <div className="flex flex-wrap gap-5 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <label className="inline-flex items-center gap-2 cursor-pointer font-semibold">
              <input
                type="checkbox"
                checked={pwaSettings.enableOfflineCache}
                onChange={(e) =>
                  onUpdatePwaSettings((prev) => ({ ...prev, enableOfflineCache: e.target.checked }))
                }
              />
              <span>Çevrimdışı Menü Önbelleği (Offline Cache) Aktif</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer font-semibold">
              <input
                type="checkbox"
                checked={pwaSettings.enablePushNotifications}
                onChange={(e) =>
                  onUpdatePwaSettings((prev) => ({
                    ...prev,
                    enablePushNotifications: e.target.checked,
                  }))
                }
              />
              <span>Web Push Bildirim Desteği Aktif</span>
            </label>
          </div>
        </div>

        {/* Sağ 4 Sütun: Canlı Mobil Ekran Simülatörü */}
        <div className="xl:col-span-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-[#120806] text-[#FFF7EB] p-5 space-y-4 shadow-xl flex flex-col items-center">
          <div className="text-xs font-bold text-[#D4A359] uppercase tracking-wider flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            <span>Mobil Cihaz Kurulum Simülatörü</span>
          </div>

          {/* Telefon Çerçevesi */}
          <div className="w-56 rounded-3xl border-4 border-neutral-700 bg-[#180B08] p-3 space-y-3 shadow-2xl">
            {/* Üst Bar */}
            <div
              className="h-3 rounded-full flex items-center justify-between px-2 text-[8px] text-white/70"
              style={{ backgroundColor: pwaSettings.themeColor }}
            >
              <span>12:00</span>
              <span>100% 🔋</span>
            </div>

            {/* İkon & Başlık */}
            <div className="text-center py-4 space-y-2">
              <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto border-2 border-[#D4A359] bg-black p-1 shadow-lg">
                <img
                  src={iconFilePreview || pwaSettings.iconUrl}
                  alt="Önizleme İkonu"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="font-bold text-xs text-[#FFF7EB]">{pwaSettings.appName}</div>
              <div className="text-[10px] text-[#A88E76] px-2">{pwaSettings.description}</div>
            </div>

            {/* İndirme Butonu */}
            <button
              type="button"
              className="w-full py-2 rounded-xl bg-[#D4A359] text-[#120806] font-bold text-[10px] shadow"
            >
              {pwaSettings.installButtonLabelTr || 'Uygulamayı Cihaza Yükle'}
            </button>
            <div className="text-[8px] text-center text-[#B89D82]">
              iOS Safari · Android Chrome · PC
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
