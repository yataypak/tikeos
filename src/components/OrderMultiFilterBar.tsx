import React, { useEffect, useMemo, useState } from 'react';
import {
  BookmarkPlus,
  Filter,
  RotateCcw,
  Search,
  Trash2,
  UserCheck,
  UtensilsCrossed,
  Layers,
  Check,
  X,
} from 'lucide-react';
import type {
  CategoryItem,
  DiningTableItem,
  OrderRecord,
  StaffMember,
} from '../data/initialStoreData';
import {
  DEFAULT_ORDER_FILTER_PRESETS,
  type OrderFilterCriteria,
  type SavedOrderFilterPreset,
} from '../core/restaurantEngine';

const DEFAULT_STORAGE_KEY = 'oztike_saved_order_filters_v1';
const PRESET_SYNC_EVENT = 'oztike-order-filter-presets-changed';

function sameMembers(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  return b.every((x) => setA.has(x));
}

function isSameCriteria(a: OrderFilterCriteria, b: OrderFilterCriteria): boolean {
  return (
    sameMembers(a.categoryIds, b.categoryIds) &&
    sameMembers(a.waiterNames, b.waiterNames) &&
    sameMembers(a.channels, b.channels) &&
    (a.searchQuery || '').trim() === (b.searchQuery || '').trim()
  );
}

function loadSavedPresets(storageKey: string): SavedOrderFilterPreset[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore invalid localStorage
  }
  return DEFAULT_ORDER_FILTER_PRESETS;
}

export interface OrderMultiFilterBarProps {
  categories: CategoryItem[];
  orders: OrderRecord[];
  tables?: DiningTableItem[];
  staff?: StaffMember[];
  criteria: OrderFilterCriteria;
  onChangeCriteria: (next: OrderFilterCriteria) => void;
  totalCount: number;
  filteredCount: number;
  storageKey?: string;
  compact?: boolean;
  title?: string;
  testIdPrefix?: string;
}

export const OrderMultiFilterBar: React.FC<OrderMultiFilterBarProps> = ({
  categories,
  orders,
  tables = [],
  staff = [],
  criteria,
  onChangeCriteria,
  totalCount,
  filteredCount,
  storageKey = DEFAULT_STORAGE_KEY,
  compact = false,
  title = 'Çoklu Sipariş Filtresi (Kategori · Garson · Kanal)',
  testIdPrefix = 'order-filter',
}) => {
  const [presets, setPresets] = useState<SavedOrderFilterPreset[]>(() =>
    loadSavedPresets(storageKey)
  );
  const [saveOpen, setSaveOpen] = useState(false);
  const [presetLabel, setPresetLabel] = useState('');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  useEffect(() => {
    const syncPresets = () => {
      setPresets(loadSavedPresets(storageKey));
    };
    window.addEventListener(PRESET_SYNC_EVENT, syncPresets);
    return () => window.removeEventListener(PRESET_SYNC_EVENT, syncPresets);
  }, [storageKey]);

  const persistPresets = (next: SavedOrderFilterPreset[]) => {
    setPresets(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      window.dispatchEvent(new Event(PRESET_SYNC_EVENT));
    } catch {
      // ignore storage quota errors
    }
  };

  const waiterOptions = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => {
      if (o.staffName?.trim()) set.add(o.staffName.trim());
    });
    tables.forEach((t) => {
      if (t.waiterName?.trim()) set.add(t.waiterName.trim());
    });
    staff.forEach((s) => {
      if (
        s.name?.trim() &&
        (s.role === 'Garson' || s.role === 'Kasiyer' || s.role === 'Süper Yönetici')
      ) {
        set.add(s.name.trim());
      }
    });
    return Array.from(set);
  }, [orders, tables, staff]);

  const channelOptions = useMemo(() => {
    const defaults = ['QR', 'Garson', 'Kasa', 'Gel-Al', 'Paket servis', 'Telefon'];
    const set = new Set<string>(defaults);
    orders.forEach((o) => {
      if (o.channel?.trim()) set.add(o.channel.trim());
    });
    return Array.from(set);
  }, [orders]);

  const activeFilterCount =
    criteria.categoryIds.length +
    criteria.waiterNames.length +
    criteria.channels.length +
    (criteria.searchQuery?.trim() ? 1 : 0);

  const toggleItem = (
    field: 'categoryIds' | 'waiterNames' | 'channels',
    value: string
  ) => {
    const current = criteria[field];
    const nextArr = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChangeCriteria({
      ...criteria,
      [field]: nextArr,
    });
  };

  const handleSaveCurrentPreset = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanLabel = presetLabel.trim();
    if (!cleanLabel) return;
    const newPreset: SavedOrderFilterPreset = {
      id: `PRESET-CUSTOM-${Date.now().toString().slice(-5)}`,
      label: cleanLabel,
      criteria: {
        categoryIds: [...criteria.categoryIds],
        waiterNames: [...criteria.waiterNames],
        channels: [...criteria.channels],
        searchQuery: criteria.searchQuery?.trim() || '',
      },
      isBuiltIn: false,
    };
    const next = [...presets, newPreset];
    persistPresets(next);
    setPresetLabel('');
    setSaveOpen(false);
    setSaveNotice(`"${cleanLabel}" hazır filtre düğmesi olarak kaydedildi.`);
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleDeletePreset = (id: string) => {
    const next = presets.filter((p) => p.id !== id);
    persistPresets(next.length > 0 ? next : DEFAULT_ORDER_FILTER_PRESETS);
  };

  const clearAll = () => {
    onChangeCriteria({
      categoryIds: [],
      waiterNames: [],
      channels: [],
      searchQuery: '',
    });
  };

  return (
    <div
      data-testid={`${testIdPrefix}-bar`}
      className={`rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/90 dark:bg-[#141413] ${
        compact ? 'p-3.5 space-y-3' : 'p-4 space-y-3.5'
      } text-xs`}
    >
      {/* Üst Başlık & Arama + Sonuç Sayacı + Kaydet */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#B86B35] dark:text-[#D4AF6A] shrink-0" />
          <span className="font-bold text-neutral-900 dark:text-[#F5F2EB]">{title}</span>
          <span className="px-2 py-0.5 rounded-md bg-[#B86B35]/15 text-[#B86B35] dark:text-[#D4AF6A] font-mono font-bold text-[11px]">
            {filteredCount} / {totalCount} Sipariş
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={criteria.searchQuery || ''}
              onChange={(e) =>
                onChangeCriteria({ ...criteria, searchQuery: e.target.value })
              }
              placeholder="Sipariş no, müşteri, ürün ara..."
              aria-label="Siparişlerde metin ara"
              className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] pl-8 pr-3 py-1.5 text-xs w-48 sm:w-56"
            />
          </div>

          <button
            type="button"
            data-testid={`${testIdPrefix}-open-save-btn`}
            onClick={() => setSaveOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#B86B35]/50 bg-[#B86B35]/10 text-[#B86B35] dark:text-[#D4AF6A] font-semibold hover:bg-[#B86B35]/20 cursor-pointer"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>Hazır Filtre Kaydet</span>
          </button>

          {activeFilterCount > 0 && (
            <button
              type="button"
              data-testid={`${testIdPrefix}-reset-btn`}
              onClick={clearAll}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Temizle ({activeFilterCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Kaydedilebilir Hazır Filtre Düğmeleri (Presets) */}
      <div className="space-y-1.5 pt-2 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Hazır Filtre Düğmeleri (Tek Tıkla Uygula)
          </span>
          {saveNotice && (
            <span className="text-[11px] font-semibold text-emerald-500">{saveNotice}</span>
          )}
        </div>

        <div
          data-testid={`${testIdPrefix}-presets`}
          className="flex flex-wrap items-center gap-1.5"
        >
          {presets.map((preset) => {
            const active = isSameCriteria(criteria, preset.criteria);
            return (
              <div
                key={preset.id}
                className={`inline-flex items-center rounded-lg border transition-all ${
                  active
                    ? 'border-[#B86B35] bg-[#B86B35] text-white shadow-sm'
                    : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] text-neutral-800 dark:text-neutral-200 hover:border-[#B86B35]'
                }`}
              >
                <button
                  type="button"
                  data-testid={`${testIdPrefix}-preset-btn`}
                  onClick={() =>
                    onChangeCriteria({
                      categoryIds: [...preset.criteria.categoryIds],
                      waiterNames: [...preset.criteria.waiterNames],
                      channels: [...preset.criteria.channels],
                      searchQuery: preset.criteria.searchQuery || '',
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold cursor-pointer"
                >
                  {active && <Check className="w-3 h-3 shrink-0" />}
                  <span>{preset.label}</span>
                </button>
                {!preset.isBuiltIn && (
                  <button
                    type="button"
                    aria-label={`${preset.label} hazır filtresini sil`}
                    onClick={() => handleDeletePreset(preset.id)}
                    className={`pr-2 pl-0.5 py-1 text-[11px] opacity-75 hover:opacity-100 cursor-pointer ${
                      active ? 'text-white' : 'text-rose-500'
                    }`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {saveOpen && (
          <form
            onSubmit={handleSaveCurrentPreset}
            data-testid={`${testIdPrefix}-save-form`}
            className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-[#B86B35]/40 bg-white dark:bg-[#1F1F1D] p-2.5"
          >
            <input
              type="text"
              value={presetLabel}
              onChange={(e) => setPresetLabel(e.target.value)}
              placeholder="Hazır filtre düğme adı (Örn: Elif · QR & Kebap)"
              aria-label="Hazır filtre düğme adı"
              className="flex-1 min-w-[200px] rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5 text-xs"
              required
            />
            <button
              type="submit"
              data-testid={`${testIdPrefix}-confirm-save-btn`}
              className="px-3 py-1.5 rounded-md bg-[#B86B35] text-white font-bold text-xs cursor-pointer"
            >
              Düğme Olarak Kaydet
            </button>
            <button
              type="button"
              onClick={() => setSaveOpen(false)}
              className="p-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-500 cursor-pointer"
              aria-label="Kapat"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>

      {/* 3 Boyutlu Çoklu Seçim Satırları (Ürün Kategorisi, Garson Adı, Sipariş Kanalı) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
        {/* 1. Ürün Kategorisi (Çoklu) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
            <span className="inline-flex items-center gap-1">
              <UtensilsCrossed className="w-3.5 h-3.5 text-[#B86B35]" />
              Ürün Kategorisi {criteria.categoryIds.length > 0 && `(${criteria.categoryIds.length})`}
            </span>
            {criteria.categoryIds.length > 0 && (
              <button
                type="button"
                onClick={() => onChangeCriteria({ ...criteria, categoryIds: [] })}
                className="text-[10px] text-[#B86B35] underline cursor-pointer"
              >
                Tümü
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => {
              const selected = criteria.categoryIds.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  data-testid={`${testIdPrefix}-cat-${cat.id}`}
                  onClick={() => toggleItem('categoryIds', cat.id)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                    selected
                      ? 'border-[#B86B35] bg-[#B86B35] text-white font-bold'
                      : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] hover:border-[#B86B35]'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Garson Adı (Çoklu) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
            <span className="inline-flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
              Garson / Kasiyer Adı {criteria.waiterNames.length > 0 && `(${criteria.waiterNames.length})`}
            </span>
            {criteria.waiterNames.length > 0 && (
              <button
                type="button"
                onClick={() => onChangeCriteria({ ...criteria, waiterNames: [] })}
                className="text-[10px] text-[#B86B35] underline cursor-pointer"
              >
                Tümü
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {waiterOptions.map((waiter) => {
              const selected = criteria.waiterNames.includes(waiter);
              return (
                <button
                  key={waiter}
                  type="button"
                  data-testid={`${testIdPrefix}-waiter-${waiter}`}
                  onClick={() => toggleItem('waiterNames', waiter)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                    selected
                      ? 'border-emerald-600 bg-emerald-600 text-white font-bold'
                      : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] hover:border-emerald-500'
                  }`}
                >
                  {waiter}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Sipariş Kanalı (Çoklu) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
            <span className="inline-flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-sky-500" />
              Sipariş Kanalı {criteria.channels.length > 0 && `(${criteria.channels.length})`}
            </span>
            {criteria.channels.length > 0 && (
              <button
                type="button"
                onClick={() => onChangeCriteria({ ...criteria, channels: [] })}
                className="text-[10px] text-[#B86B35] underline cursor-pointer"
              >
                Tümü
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {channelOptions.map((ch) => {
              const selected = criteria.channels.includes(ch);
              return (
                <button
                  key={ch}
                  type="button"
                  data-testid={`${testIdPrefix}-channel-${ch}`}
                  onClick={() => toggleItem('channels', ch)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                    selected
                      ? 'border-sky-600 bg-sky-600 text-white font-bold'
                      : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] hover:border-sky-500'
                  }`}
                >
                  {ch}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
