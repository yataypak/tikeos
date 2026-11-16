import React, { useState, useEffect, useMemo } from 'react';
import {
  Archive,
  Trash2,
  Calendar,
  Search,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  Receipt,
  Truck,
  BellRing,
  RotateCcw,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import {
  type ArchiveHistoryEntry,
  type ArchiveHistoryType,
  buildArchiveEntry,
  roundCurrency,
} from '../core/restaurantEngine';
import type { OrderRecord, DiningTableItem } from '../data/initialStoreData';
import type { WaiterServiceCallRecord } from '../core/restaurantEngine';

interface AdminArchiveManagerProps {
  orders: OrderRecord[];
  waiterCalls?: WaiterServiceCallRecord[];
  tables: DiningTableItem[];
  onDeleteOrder?: (id: string) => void;
  onDeleteWaiterCall?: (id: string) => void;
  onNotify: (msg: string) => void;
}

export const AdminArchiveManager: React.FC<AdminArchiveManagerProps> = ({
  orders,
  waiterCalls = [],
  tables,
  onDeleteOrder,
  onDeleteWaiterCall,
  onNotify,
}) => {
  const [archiveList, setArchiveList] = useState<ArchiveHistoryEntry[]>(() => {
    try {
      const raw = localStorage.getItem('oztike_archive_history_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [
      {
        id: 'ARC-INIT-01',
        archivedAt: '2026-11-15 23:59:00',
        dateKey: '2026-11-15',
        type: 'Gün Sonu Özeti',
        title: '15 Kasım 2026 Gün Sonu Kapanış Raporu',
        subtitle: '18 Adet Masa Siparişi, 6 Adet Kurye Teslimatı',
        amount: 8450,
        reason: 'Gün Sonu Kapanışı',
      },
      {
        id: 'ARC-INIT-02',
        archivedAt: '2026-11-16 13:45:00',
        dateKey: '2026-11-16',
        type: 'Teslim Edilen Sipariş',
        title: 'ORD-1092 · Masa 04 (Halil Usta Ocakbaşı)',
        subtitle: '2x ÖzTike Kuzu Ciğer Şiş, 2x Yayık Ayranı',
        amount: 1030,
        reason: 'Teslim Edildi & Arşivlendi',
      },
      {
        id: 'ARC-INIT-03',
        archivedAt: '2026-11-16 14:10:00',
        dateKey: '2026-11-16',
        type: 'Garson Çağrısı',
        title: 'Masa 02 (Bahçe) Servis Çağrısı',
        subtitle: 'Çay (2 Adet), Sıcak Lavaş Talebi',
        amount: 0,
        reason: 'Garson Servisi Tamamlandı & Arşivlendi',
      },
      {
        id: 'ARC-INIT-04',
        archivedAt: '2026-11-16 14:35:00',
        dateKey: '2026-11-16',
        type: 'Kurye Teslimatı',
        title: 'ORD-1093 · Şahinbey Karagöz Mah. Paket Servis',
        subtitle: '1x Çift Lavaş Ciğer Dürüm, 1x Şalgam',
        amount: 340,
        reason: 'Kurye Tarafından Teslim Edildi & Arşivlendi',
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('oztike_archive_history_v1', JSON.stringify(archiveList));
    } catch {
      // ignore
    }
  }, [archiveList]);

  const [typeFilter, setTypeFilter] = useState<'Tümü' | ArchiveHistoryType>('Tümü');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // İstatistikler
  const totalArchivedRevenue = useMemo(
    () => archiveList.reduce((acc, it) => acc + (it.amount || 0), 0),
    [archiveList]
  );

  // Gün Sonu Arşivini Al & Sıfırla
  const handleTriggerEndOfDayArchive = () => {
    const today = new Date().toISOString().slice(0, 10);
    const deliveredOrders = orders.filter(
      (o) => o.status === 'Tamamlandı' || o.status === 'Servis edildi' || o.deliveryState === 'Teslim Edildi'
    );
    const totalDaySum = deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const summaryEntry = buildArchiveEntry({
      type: 'Gün Sonu Özeti',
      title: `${today} Gün Sonu Kapanış & Arşiv Kaydı`,
      subtitle: `${deliveredOrders.length} Adet Sipariş/Teslimat, ${waiterCalls.length} Servis Çağrısı`,
      amount: totalDaySum,
      reason: 'Admin Tarafından Gün Sonu Otomatik Arşivleme Alındı',
      payload: {
        totalOrdersCount: deliveredOrders.length,
        waiterCallsCount: waiterCalls.length,
        revenue: totalDaySum,
      },
    });

    // Ayrıca teslim edilmiş siparişleri arşiv listesine tek tek de ekle
    const newItems: ArchiveHistoryEntry[] = [summaryEntry];
    for (const ord of deliveredOrders) {
      newItems.push(
        buildArchiveEntry({
          type: ord.channel === 'Paket servis' ? 'Kurye Teslimatı' : 'Sipariş',
          title: `${ord.orderNumber} · ${ord.tableName} (${ord.customerName})`,
          subtitle: ord.items.map((i) => `${i.quantity}x ${i.productName}`).join(', '),
          amount: ord.totalAmount,
          reason: 'Gün Sonu Toplu Arşivleme',
          payload: { orderId: ord.id },
        })
      );
    }

    setArchiveList((prev) => [...newItems, ...prev]);
    onNotify(`${today} gün sonu kapanışı başarıyla alındı ve ${newItems.length} kayıt arşive aktarıldı.`);
  };

  // Tekil Arşiv Kaydı Sil
  const handleDeleteArchiveItem = (id: string) => {
    setArchiveList((prev) => prev.filter((it) => it.id !== id));
    onNotify('Arşiv kaydı sistemden kalıcı olarak silindi.');
  };

  // Arşiv Raporu JSON İndir
  const handleExportArchiveJson = () => {
    const blob = new Blob([JSON.stringify(archiveList, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oztike-arsiv-raporu-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('Arşiv kütüğü JSON formatında cihazınıza indirildi.');
  };

  // Arşivi Temizle
  const handleClearAllArchive = () => {
    if (window.confirm('Tüm geçmiş arşiv kayıtlarını temizlemek istediğinize emin misiniz?')) {
      setArchiveList([]);
      onNotify('Arşiv kütüğü temizlendi.');
    }
  };

  // Filtrelenmiş liste
  const filteredList = useMemo(() => {
    return archiveList.filter((it) => {
      if (typeFilter !== 'Tümü' && it.type !== typeFilter) return false;
      if (dateFilter && it.dateKey !== dateFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = it.title.toLowerCase().includes(q);
        const matchSub = it.subtitle.toLowerCase().includes(q);
        const matchReason = it.reason.toLowerCase().includes(q);
        if (!matchTitle && !matchSub && !matchReason) return false;
      }
      return true;
    });
  }, [archiveList, typeFilter, dateFilter, searchQuery]);

  return (
    <div className="space-y-6 text-xs">
      {/* Üst Kart: Özet & Aksiyonlar */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-[#F5F2EB] flex items-center gap-2">
              <Archive className="w-5 h-5 text-[#B86B35] dark:text-[#D4AF6A]" />
              <span>29. Geçmiş &amp; Gün Sonu Arşivi (Sipariş, Hesap, Garson &amp; Kurye)</span>
            </h3>
            <p className="text-neutral-500 mt-0.5">
              Teslim edilen siparişler, masa hesapları, garson çağrıları ve kurye kayıtları burada saklanır. İstendiğinde kalıcı silinebilir veya gün sonunda otomatik tarihe göre arşivlenir.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleTriggerEndOfDayArchive}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#B86B35] text-white font-bold cursor-pointer hover:bg-[#9F5928] shadow"
            >
              <Calendar className="w-4 h-4" />
              <span>Gün Sonu Arşivini Al &amp; Sıfırla</span>
            </button>
            <button
              type="button"
              onClick={handleExportArchiveJson}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] text-neutral-700 dark:text-neutral-300 font-semibold cursor-pointer hover:bg-neutral-100"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Arşivi İndir (JSON)</span>
            </button>
            {archiveList.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllArchive}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-rose-500/40 text-rose-500 font-semibold cursor-pointer hover:bg-rose-500/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Arşivi Temizle</span>
              </button>
            )}
          </div>
        </div>

        {/* Metrik Rozetleri */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#141413] border border-neutral-200 dark:border-neutral-800">
            <span className="text-[10px] text-neutral-500 font-semibold">Toplam Arşiv Kaydı</span>
            <div className="text-lg font-bold text-neutral-900 dark:text-[#FFF7EB] mt-0.5">
              {archiveList.length} Adet
            </div>
          </div>
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#141413] border border-neutral-200 dark:border-neutral-800">
            <span className="text-[10px] text-neutral-500 font-semibold">Arşivlenen Toplam Ciro</span>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
              {totalArchivedRevenue.toLocaleString('tr-TR')} ₺
            </div>
          </div>
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#141413] border border-neutral-200 dark:border-neutral-800">
            <span className="text-[10px] text-neutral-500 font-semibold">Tarihsel Saklama</span>
            <div className="text-sm font-bold text-[#B86B35] dark:text-[#D4AF6A] mt-0.5">
              Sürekli &amp; Otomatik
            </div>
          </div>
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#141413] border border-neutral-200 dark:border-neutral-800">
            <span className="text-[10px] text-neutral-500 font-semibold">Aktif Masalar / Siparişler</span>
            <div className="text-sm font-bold text-neutral-900 dark:text-white mt-0.5">
              {tables.filter((t) => t.status !== 'Boş').length} Masa · {orders.length} Sipariş
            </div>
          </div>
        </div>
      </div>

      {/* Filtre ve Arama Çubuğu */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              'Tümü',
              'Sipariş',
              'Masa & Hesap',
              'Garson Çağrısı',
              'Kurye Teslimatı',
              'Gün Sonu Özeti',
            ] as const
          ).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors ${
                typeFilter === t
                  ? 'bg-[#B86B35] text-white shadow'
                  : 'bg-neutral-100 dark:bg-[#141413] text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Arşivde ara (Masa, fiş, kurye)..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413]"
            />
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] font-mono text-[11px]"
            title="Tarihe Göre Filtrele"
          />
          {dateFilter && (
            <button
              type="button"
              onClick={() => setDateFilter('')}
              className="text-[11px] text-[#B86B35] font-semibold cursor-pointer"
            >
              Tüm Tarihler
            </button>
          )}
        </div>
      </div>

      {/* Arşiv Kayıtları Listesi */}
      <div className="space-y-2.5">
        {filteredList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 p-8 text-center text-neutral-500">
            Aradığınız kriterlere uygun arşiv kaydı bulunamadı.
          </div>
        ) : (
          filteredList.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-[#B86B35]/40 transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    item.type === 'Gün Sonu Özeti'
                      ? 'bg-amber-500/15 text-amber-500'
                      : item.type === 'Kurye Teslimatı'
                      ? 'bg-sky-500/15 text-sky-400'
                      : item.type === 'Garson Çağrısı'
                      ? 'bg-purple-500/15 text-purple-400'
                      : 'bg-emerald-500/15 text-emerald-400'
                  }`}
                >
                  {item.type === 'Gün Sonu Özeti' ? (
                    <Calendar className="w-4 h-4" />
                  ) : item.type === 'Kurye Teslimatı' ? (
                    <Truck className="w-4 h-4" />
                  ) : item.type === 'Garson Çağrısı' ? (
                    <BellRing className="w-4 h-4" />
                  ) : (
                    <Receipt className="w-4 h-4" />
                  )}
                </span>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-neutral-900 dark:text-[#FFF7EB] text-xs">
                      {item.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono text-[10px] font-bold">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-neutral-500 text-[11px] mt-0.5">{item.subtitle}</p>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-neutral-400 mt-1 font-mono">
                    <span>🕒 {item.archivedAt}</span>
                    <span>· Neden: {item.reason}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800">
                {item.amount > 0 && (
                  <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    {item.amount.toFixed(2)} ₺
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteArchiveItem(item.id)}
                  aria-label="Arşivden Kalıcı Olarak Sil"
                  className="p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                  title="Arşivden Kalıcı Olarak Sil"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
