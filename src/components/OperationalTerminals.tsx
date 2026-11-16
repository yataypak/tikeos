import React, { useState } from 'react';
import {
  Barcode,
  Printer,
  Split,
  CreditCard,
  Banknote,
  Gift,
  Percent,
  ArrowRightLeft,
  Flame,
  Clock,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  RefreshCw,
  BellRing,
  Users,
  Plus,
} from 'lucide-react';
import {
  type ProductItem,
  type CategoryItem,
  type DiningTableItem,
  type OrderRecord,
  type KitchenStationName,
  type TableStatus,
  type OrderStatus,
} from '../data/initialStoreData';
import {
  calculateSplitBill,
  calculateCashDiscrepancy,
  type WaiterServiceCallRecord,
} from '../core/restaurantEngine';
import { type SiteCmsConfig } from '../data/siteCmsStore';
import { printThermalReceipt, downloadThermalReceiptHtml } from '../utils/receiptPrinter';

interface POSKasaTerminalProps {
  products: ProductItem[];
  categories: CategoryItem[];
  tables: DiningTableItem[];
  orders: OrderRecord[];
  isOnline: boolean;
  siteCmsConfig?: SiteCmsConfig;
  onCreatePosOrder: (payload: {
    tableId: string | null;
    channel: 'Kasa' | 'Garson' | 'Telefon';
    customerName: string;
    items: { product: ProductItem; quantity: number; isComplimentary: boolean }[];
    discountAmount: number;
    paymentMethod: string;
    paidAmount: number;
  }) => void;
  onSettleOrderPayment: (
    orderId: string,
    amount: number,
    method: string
  ) => Promise<void> | void;
  onMergeOrMoveTable: (sourceTableId: string, targetTableId: string, mode: 'merge' | 'move') => void;
  onRecordAudit: (module: string, action: string, detail: string, severity?: 'Normal' | 'Uyarı' | 'Kritik') => void;
}

export const POSKasaTerminal: React.FC<POSKasaTerminalProps> = ({
  products,
  categories,
  tables,
  orders,
  isOnline,
  siteCmsConfig,
  onCreatePosOrder,
  onSettleOrderPayment,
  onMergeOrMoveTable,
  onRecordAudit,
}) => {
  const [receiptActionNotice, setReceiptActionNotice] = useState<string | null>(null);
  const _posUnusedCheck = null;
  void _posUnusedCheck;
  const [selectedTableId, setSelectedTableId] = useState<string>('TBL-02');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [posCategoryId, setPosCategoryId] = useState<string>('ALL');
  const [posSearch, setPosSearch] = useState('');
  const [posCart, setPosCart] = useState<
    { product: ProductItem; quantity: number; isComplimentary: boolean }[]
  >([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [splitGuestCount, setSplitGuestCount] = useState<number>(2);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('Nakit');
  const [customPayAmount, setCustomPayAmount] = useState<string>('');
  const [targetTransferTableId, setTargetTransferTableId] = useState<string>('TBL-03');
  const [countedPhysicalCash, setCountedPhysicalCash] = useState<number>(15600);
  const [posMessage, setPosMessage] = useState<string | null>(null);
  const [receiptPreviewOrder, setReceiptPreviewOrder] = useState<OrderRecord | null>(null);

  const activeTable = tables.find((t) => t.id === selectedTableId) || null;
  const activeTableOrder =
    orders.find(
      (o) =>
        o.tableId === selectedTableId &&
        o.status !== 'Tamamlandı' &&
        o.status !== 'İptal edildi' &&
        o.status !== 'İade edildi'
    ) || null;

  const filteredProducts = products.filter((p) => {
    const matchCat = posCategoryId === 'ALL' || p.categoryId === posCategoryId;
    const matchQuery =
      !posSearch.trim() ||
      p.name.toLowerCase().includes(posSearch.toLowerCase()) ||
      p.code.toLowerCase().includes(posSearch.toLowerCase()) ||
      p.barcode.includes(posSearch.trim());
    return matchCat && matchQuery;
  });

  const rawCartSubtotal = posCart.reduce(
    (s, item) =>
      s + (item.isComplimentary ? 0 : (item.product.discountedPrice ?? item.product.price) * item.quantity),
    0
  );
  const calculatedDiscount = Math.round((rawCartSubtotal * (discountPercent / 100)) * 100) / 100;
  const netCartTotal = Math.max(0, rawCartSubtotal - calculatedDiscount);

  const billTotalToSettle = activeTableOrder ? activeTableOrder.totalAmount : netCartTotal;
  const alreadyPaidOnBill = activeTableOrder ? activeTableOrder.paidAmount : 0;
  const splitInfo = calculateSplitBill(billTotalToSettle, alreadyPaidOnBill, splitGuestCount);

  const cashReconciliation = calculateCashDiscrepancy({
    openingBalance: 2500,
    cashSales: 14200,
    cashIn: 500,
    cashOut: 1200,
    cashRefunds: 400,
    actualCountedCash: countedPhysicalCash,
  });

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = products.find(
      (p) => p.barcode === barcodeInput.trim() || p.code.toLowerCase() === barcodeInput.trim().toLowerCase()
    );
    if (!found) {
      setPosMessage(`Barkod veya ürün kodu bulunamadı: ${barcodeInput}`);
      return;
    }
    setPosCart((prev) => {
      const existing = prev.find((i) => i.product.id === found.id && !i.isComplimentary);
      if (existing) {
        return prev.map((i) =>
          i.product.id === found.id && !i.isComplimentary ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product: found, quantity: 1, isComplimentary: false }];
    });
    setBarcodeInput('');
    setPosMessage(`${found.name} barkod ile adisyona eklendi.`);
  };

  const handleAddProductToPos = (product: ProductItem) => {
    setPosCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id && !i.isComplimentary);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id && !i.isComplimentary ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1, isComplimentary: false }];
    });
  };

  return (
    <div className="space-y-6">
      {posMessage && (
        <div
          role="status"
          className="flex items-center justify-between rounded-xl border border-[#D4AF6A]/40 bg-[#1F1F1D] text-[#F5F2EB] px-4 py-3 text-xs"
        >
          <span>{posMessage}</span>
          <button type="button" onClick={() => setPosMessage(null)} className="underline">
            Kapat
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Barcode, Table Selection & Fast Touch Product Grid */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold">Masa / Satış Tipi:</label>
                <select
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  aria-label="POS Masa Seçimi"
                  className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5 text-xs font-medium"
                >
                  <option value="FAST_SALE">Hızlı Satış (Tezgah / Paket)</option>
                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.number} ({t.status}) · Açık Hesap: {t.openBalance.toFixed(2)} ₺
                    </option>
                  ))}
                </select>
              </div>

              {/* Barcode Scanner Input */}
              <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-2">
                <div className="relative">
                  <Barcode className="w-4 h-4 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Barkod (8690001000012)"
                    aria-label="Barkod veya Ürün Kodu Okut"
                    className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] pl-8 pr-3 py-1.5 text-xs font-mono w-48"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 dark:bg-[#F5F2EB] text-white dark:text-[#141413]"
                >
                  Barkod Ekle
                </button>
              </form>
            </div>

            {/* Table Merge & Move Actions (Bölüm 7) */}
            {activeTable && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800 text-xs">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-[#D4AF6A]" />
                  <span>Masa Taşı / Birleştir ({activeTable.number} →):</span>
                  <select
                    value={targetTransferTableId}
                    onChange={(e) => setTargetTransferTableId(e.target.value)}
                    aria-label="Hedef Masa Seçimi"
                    className="rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2 py-1 text-xs"
                  >
                    {tables
                      .filter((t) => t.id !== activeTable.id)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.number} ({t.status})
                        </option>
                      ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onMergeOrMoveTable(activeTable.id, targetTransferTableId, 'move');
                      setPosMessage(`${activeTable.number} hesabı hedef masaya taşındı.`);
                    }}
                    className="px-2.5 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    Masayı Taşı
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onMergeOrMoveTable(activeTable.id, targetTransferTableId, 'merge');
                      setPosMessage(`${activeTable.number} ile hedef masa birleştirildi.`);
                    }}
                    className="px-2.5 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    Masaları Birleştir
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Category Filter + Search */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setPosCategoryId('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 ${
                posCategoryId === 'ALL'
                  ? 'bg-[#B86B35] text-white'
                  : 'bg-white dark:bg-[#1F1F1D] border border-neutral-200 dark:border-neutral-800'
              }`}
            >
              Tümü
            </button>
            {categories.slice(0, 8).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setPosCategoryId(c.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 ${
                  posCategoryId === c.id
                    ? 'bg-[#B86B35] text-white'
                    : 'bg-white dark:bg-[#1F1F1D] border border-neutral-200 dark:border-neutral-800'
                }`}
              >
                {c.name}
              </button>
            ))}
            <input
              type="search"
              value={posSearch}
              onChange={(e) => setPosSearch(e.target.value)}
              placeholder="Hızlı ürün filtrele..."
              className="ml-auto rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5 text-xs"
            />
          </div>

          {/* Touch POS Product Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredProducts.map((p) => {
              const price = p.discountedPrice ?? p.price;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleAddProductToPos(p)}
                  className="text-left rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] hover:border-[#B86B35] p-3.5 transition-colors flex flex-col justify-between gap-2 min-h-28"
                >
                  <div>
                    <div className="text-[11px] font-mono text-neutral-500">
                      {p.code} · {p.station}
                    </div>
                    <div className="text-xs font-semibold text-neutral-900 dark:text-[#F5F2EB] mt-0.5">
                      {p.name}
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <span className="font-mono tabular-nums text-sm font-bold text-[#B86B35] dark:text-[#D4AF6A]">
                      {price.toFixed(2)} ₺
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500">
                      <Plus className="w-3 h-3" /> Ekle
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 5 Cols: Active Ticket / Split Bill / Multi-Payment / Cash Register */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-[#F5F2EB]">
                  POS Adisyon & Kasa Tahsilat Ekranı
                </h3>
                <p className="text-xs text-neutral-500">
                  {activeTableOrder
                    ? `Aktif Sipariş: ${activeTableOrder.orderNumber} (${activeTableOrder.tableName})`
                    : 'Yeni Hızlı Adisyon Oluşturuluyor'}
                </p>
              </div>
              {activeTableOrder && (
                <button
                  type="button"
                  onClick={() => setReceiptPreviewOrder(activeTableOrder)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-300 dark:border-neutral-700"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Adisyon Yazdır</span>
                </button>
              )}
            </div>

            {/* Existing table order items OR new POS cart */}
            {activeTableOrder ? (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {activeTableOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-neutral-50 dark:bg-[#141413]"
                  >
                    <div>
                      <span className="font-semibold">
                        {item.quantity}x {item.productName}
                      </span>
                      <div className="text-[11px] text-neutral-500">
                        Durum: {item.isReady ? 'Hazır / Servis' : 'Ocakta'}
                      </div>
                    </div>
                    <span className="font-mono tabular-nums font-semibold">
                      {(item.unitPrice * item.quantity).toFixed(2)} ₺
                    </span>
                  </div>
                ))}
              </div>
            ) : posCart.length === 0 ? (
              <div className="py-6 text-center text-xs text-neutral-500">
                Soldaki ürün kutularına tıklayarak veya barkod okutarak yeni POS satışı başlatın.
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {posCart.map((c, idx) => (
                  <div
                    key={`${c.product.id}-${idx}`}
                    className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-neutral-50 dark:bg-[#141413]"
                  >
                    <div>
                      <span className="font-semibold">
                        {c.quantity}x {c.product.name}
                      </span>
                      {c.isComplimentary && (
                        <span className="ml-2 text-[11px] text-amber-500 font-mono">
                          [YETKİLİ İKRAM]
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPosCart((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, isComplimentary: !item.isComplimentary } : item
                            )
                          );
                          onRecordAudit(
                            'POS / Kasa',
                            'İkram İşaretleme',
                            `${c.product.name} kalemi için ikram yetkisi kullanıldı.`,
                            'Uyarı'
                          );
                        }}
                        className="px-2 py-0.5 text-[11px] rounded border border-neutral-300 dark:border-neutral-700"
                      >
                        <Gift className="w-3 h-3 inline mr-1" />
                        İkram
                      </button>
                      <span className="font-mono tabular-nums font-semibold">
                        {c.isComplimentary
                          ? '0.00 ₺'
                          : ((c.product.discountedPrice ?? c.product.price) * c.quantity).toFixed(2) + ' ₺'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Authorized Discount & Split Bill Controls */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-200 dark:border-neutral-800 text-xs">
              <div>
                <label className="block font-medium mb-1 flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-[#D4AF6A]" />
                  <span>Yetkili İndirim (%)</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Math.max(0, Math.min(50, Number(e.target.value))))}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="block font-medium mb-1 flex items-center gap-1">
                  <Split className="w-3.5 h-3.5 text-[#B86B35]" />
                  <span>Kişi Bazlı Hesap Bölme</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={splitGuestCount}
                  onChange={(e) => setSplitGuestCount(Math.max(1, Number(e.target.value)))}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5 font-mono"
                />
              </div>
            </div>

            <div className="rounded-lg bg-neutral-100 dark:bg-[#141413] p-3.5 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Toplam Adisyon Tutarı:</span>
                <span className="font-mono tabular-nums font-semibold">
                  {billTotalToSettle.toFixed(2)} ₺
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Ödenen / Kalan Tutar:</span>
                <span className="font-mono tabular-nums font-semibold text-[#B86B35] dark:text-[#D4AF6A]">
                  {alreadyPaidOnBill.toFixed(2)} ₺ / {splitInfo.remainingAmount.toFixed(2)} ₺
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-neutral-200 dark:border-neutral-800">
                <span className="text-neutral-500">
                  Kişi Başı Düşen Pay ({splitGuestCount} Kişi):
                </span>
                <span className="font-mono tabular-nums font-bold">
                  {splitInfo.perPersonShare.toFixed(2)} ₺
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold">Ödeme Yöntemi Seçin (Çoklu Ödeme Destekli):</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  'Nakit',
                  'Fiziksel POS',
                  'iyzico (Test Modu)',
                  'PayTR (Test Modu)',
                  'Banka Havalesi',
                  'Yemek Kartı',
                ].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedPaymentMethod(m)}
                    className={`py-2 px-2 rounded-lg border font-medium transition-colors whitespace-nowrap truncate ${
                      selectedPaymentMethod === m
                        ? 'border-[#B86B35] bg-[#B86B35] text-white'
                        : 'border-neutral-200 dark:border-neutral-800'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                value={customPayAmount}
                onChange={(e) => setCustomPayAmount(e.target.value)}
                placeholder={`Tahsilat tutarı (${splitInfo.remainingAmount.toFixed(2)} ₺)`}
                className="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 text-xs font-mono"
              />
              <button
                type="button"
                disabled={!isOnline}
                onClick={async () => {
                  const amountToPay = customPayAmount
                    ? Number(customPayAmount)
                    : splitInfo.remainingAmount;

                  if (activeTableOrder) {
                    await onSettleOrderPayment(
                      activeTableOrder.id,
                      amountToPay,
                      selectedPaymentMethod
                    );
                    setCustomPayAmount('');
                    setPosMessage(
                      `${activeTableOrder.orderNumber} için ${amountToPay.toFixed(2)} ₺ (${selectedPaymentMethod}) tahsilat doğrulandı.`
                    );
                  } else if (posCart.length > 0) {
                    onCreatePosOrder({
                      tableId: selectedTableId === 'FAST_SALE' ? null : selectedTableId,
                      channel: 'Kasa',
                      customerName: 'POS Hızlı Satış Misafiri',
                      items: posCart,
                      discountAmount: calculatedDiscount,
                      paymentMethod: selectedPaymentMethod,
                      paidAmount: amountToPay,
                    });
                    setPosCart([]);
                    setCustomPayAmount('');
                    setPosMessage(
                      `Yeni POS siparişi oluşturuldu ve ${amountToPay.toFixed(2)} ₺ (${selectedPaymentMethod}) tahsil edildi.`
                    );
                  } else {
                    setPosMessage('Tahsilat için aktif masa siparişi seçin veya sepete ürün ekleyin.');
                  }
                }}
                className="px-4 py-2 rounded-lg bg-[#B86B35] hover:bg-[#9F5928] disabled:opacity-50 text-white text-xs font-semibold whitespace-nowrap shrink-0"
              >
                {activeTableOrder ? 'Tahsilatı Onayla' : 'Satışı Tamamla'}
              </button>
            </div>
          </div>

          {/* Cash Register End-of-Day & Discrepancy Box */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-neutral-900 dark:text-[#F5F2EB] flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-[#D4AF6A]" />
                <span>Gün Sonu Kasa Mutabakatı & Kasa Farkı Kontrolü</span>
              </h4>
              <span className="font-mono text-[11px] text-neutral-500">Vardiya #1</span>
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono tabular-nums">
              <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-[#141413]">
                <div className="text-[11px] text-neutral-500">Beklenen Kasa</div>
                <div className="font-bold mt-0.5">
                  {cashReconciliation.expectedClosingBalance.toFixed(2)} ₺
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-[#141413]">
                <label className="text-[11px] text-neutral-500 block">Sayılan Nakit</label>
                <input
                  type="number"
                  value={countedPhysicalCash}
                  onChange={(e) => setCountedPhysicalCash(Number(e.target.value))}
                  aria-label="Sayılan Fiziksel Nakit Tutarı"
                  className="w-full bg-transparent font-bold mt-0.5 border-b border-neutral-400 focus:outline-none"
                />
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-[#141413]">
                <div className="text-[11px] text-neutral-500">Kasa Farkı</div>
                <div
                  className={`font-bold mt-0.5 ${
                    cashReconciliation.discrepancyAmount === 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {cashReconciliation.discrepancyAmount.toFixed(2)} ₺
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Preview Modal */}
      {receiptPreviewOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-xl border border-neutral-300 bg-[#F8F6F0] text-[#141413] p-6 font-mono text-xs space-y-3">
            <div className="text-center border-b border-dashed border-neutral-400 pb-3 space-y-0.5">
              <div className="font-bold text-sm">ÖZTİKE CİĞER OCAKBAŞI</div>
              <div>{siteCmsConfig?.contact.addressTr || 'Karagöz Mah. Şahinbey Cad. No: 42 · Şahinbey / Gaziantep'}</div>
              <div>Otomatik Bilgi Fişi &amp; e-Arşiv Belgesi</div>
              <div className="mt-1">
                Sipariş: {receiptPreviewOrder.orderNumber} · {receiptPreviewOrder.tableName}
              </div>
              {receiptPreviewOrder.receiptNumber && (
                <div>Fiş No: {receiptPreviewOrder.receiptNumber}</div>
              )}
              {receiptPreviewOrder.eInvoiceNo && (
                <div>e-Fatura: {receiptPreviewOrder.eInvoiceNo}</div>
              )}
            </div>
            <div className="space-y-1.5 border-b border-dashed border-neutral-400 pb-3">
              {receiptPreviewOrder.items.map((it) => (
                <div key={it.id} className="flex justify-between">
                  <span>
                    {it.quantity}x {it.productName.slice(0, 22)}
                  </span>
                  <span>{(it.unitPrice * it.quantity).toFixed(2)} ₺</span>
                </div>
              ))}
              {receiptPreviewOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Kampanya İndirimi</span>
                  <span>-{receiptPreviewOrder.discountAmount.toFixed(2)} ₺</span>
                </div>
              )}
              {(receiptPreviewOrder.deliveryFee || 0) > 0 && (
                <div className="flex justify-between">
                  <span>Kurye Teslimat Ücreti</span>
                  <span>+{(receiptPreviewOrder.deliveryFee || 0).toFixed(2)} ₺</span>
                </div>
              )}
              {(receiptPreviewOrder.tipAmount || 0) > 0 && (
                <div className="flex justify-between">
                  <span>Bahşiş</span>
                  <span>+{(receiptPreviewOrder.tipAmount || 0).toFixed(2)} ₺</span>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Ödeme Yöntemi</span>
                <span>{receiptPreviewOrder.paymentMethod || 'Nakit / POS (Kasa)'}</span>
              </div>
              <div className="flex justify-between">
                <span>KDV (%{siteCmsConfig?.generalSettings.taxRatePercent ?? 10})</span>
                <span>{receiptPreviewOrder.taxAmount.toFixed(2)} ₺</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-neutral-300">
                <span>GENEL TOPLAM</span>
                <span>{receiptPreviewOrder.totalAmount.toFixed(2)} ₺</span>
              </div>
              <div className="text-[10px] text-neutral-600 pt-2">
                Not: Yasal mali fiş ve e-Arşiv/e-Fatura işlemleri yetkili ÖKC ve GİB özel entegratör bağlantısıyla düzenlenir.
              </div>
            </div>
            {receiptActionNotice && (
              <div className="rounded-lg bg-emerald-100 border border-emerald-400 px-3 py-1.5 text-[11px] font-sans font-semibold text-emerald-900">
                {receiptActionNotice}
              </div>
            )}
            <div className="flex flex-wrap justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => {
                  const ok = printThermalReceipt(receiptPreviewOrder, {
                    companyName: siteCmsConfig?.generalSettings.companyLegalName,
                    address: siteCmsConfig?.contact.addressTr,
                    phone: siteCmsConfig?.contact.phoneDisplay,
                    taxOfficeAndNo: siteCmsConfig?.generalSettings.taxOfficeAndNo,
                    logoUrl: siteCmsConfig?.header.logoUrl,
                  });
                  setReceiptActionNotice(
                    ok
                      ? 'Termal yazıcı çıktısı hazırlandı ve yazdır penceresine gönderildi.'
                      : 'Yazdır penceresi açılamadı; e-Arşiv HTML indir butonunu kullanabilirsiniz.'
                  );
                }}
                className="px-3.5 py-1.5 rounded bg-[#B86B35] text-white font-sans font-medium cursor-pointer"
              >
                Yazdır (POS / Termal)
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadThermalReceiptHtml(receiptPreviewOrder, {
                    companyName: siteCmsConfig?.generalSettings.companyLegalName,
                    address: siteCmsConfig?.contact.addressTr,
                    phone: siteCmsConfig?.contact.phoneDisplay,
                    taxOfficeAndNo: siteCmsConfig?.generalSettings.taxOfficeAndNo,
                    logoUrl: siteCmsConfig?.header.logoUrl,
                  });
                  setReceiptActionNotice('Fiş / e-Arşiv belgesi HTML olarak indirildi.');
                }}
                className="px-3.5 py-1.5 rounded border border-neutral-400 bg-white text-[#141413] font-sans font-medium cursor-pointer"
              >
                Fiş İndir (.HTML)
              </button>
              <button
                type="button"
                onClick={() => {
                  setReceiptActionNotice(null);
                  setReceiptPreviewOrder(null);
                }}
                className="px-3.5 py-1.5 rounded bg-[#141413] text-white font-sans font-medium cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// BÖLÜM 8: MUTFAK EKRANI – KDS
// =============================================================================
interface KitchenKDSTerminalProps {
  orders: OrderRecord[];
  onToggleOrderItemReady: (orderId: string, itemId: string) => void;
  onMarkOrderReadyForService: (orderId: string) => void;
}

export const KitchenKDSTerminal: React.FC<KitchenKDSTerminalProps> = ({
  orders,
  onToggleOrderItemReady,
  onMarkOrderReadyForService,
}) => {
  const [selectedStation, setSelectedStation] = useState<'ALL' | KitchenStationName>('ALL');

  const stations: ('ALL' | KitchenStationName)[] = [
    'ALL',
    'Izgara',
    'Tavuk',
    'Soğuk mutfak',
    'İçecek',
    'Paketleme',
  ];

  const activeKitchenOrders = orders.filter(
    (o) =>
      o.status === 'Yeni' ||
      o.status === 'Onay bekliyor' ||
      o.status === 'Mutfağa gönderildi' ||
      o.status === 'Hazırlanıyor' ||
      o.status === 'Hazır'
  );

  const stationFilteredOrders = activeKitchenOrders.filter((ord) => {
    if (selectedStation === 'ALL') return true;
    return ord.items.some((it) => it.station === selectedStation);
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-4">
        <div className="flex items-center gap-2.5">
          <Flame className="w-5 h-5 text-[#B86B35]" />
          <div>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-[#F5F2EB]">
              Canlı Mutfak Ekranı (KDS – Kitchen Display System)
            </h2>
            <p className="text-xs text-neutral-500">
              İstasyon bazlı gerçek zamanlı fiş takibi, gecikme alarmı ve garson bildirim tetikleyicisi
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {stations.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStation(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedStation === st
                  ? 'bg-[#B86B35] text-white'
                  : 'bg-neutral-100 dark:bg-[#141413] text-neutral-600 dark:text-neutral-300'
              }`}
            >
              {st === 'ALL' ? 'Tüm İstasyonlar (6)' : st}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stationFilteredOrders.map((ord) => {
          const isDelayed = ord.elapsedMinutes > ord.prepTimeMinutes && ord.status !== 'Hazır';
          const relevantItems =
            selectedStation === 'ALL'
              ? ord.items
              : ord.items.filter((i) => i.station === selectedStation);

          return (
            <div
              key={ord.id}
              className={`rounded-xl border p-4 flex flex-col justify-between gap-4 bg-white dark:bg-[#1F1F1D] ${
                isDelayed
                  ? 'border-red-600 dark:border-red-500'
                  : ord.status === 'Hazır'
                  ? 'border-emerald-600 dark:border-emerald-500'
                  : 'border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-neutral-200 dark:border-neutral-800">
                  <div>
                    <div className="font-mono text-xs font-bold text-[#B86B35] dark:text-[#D4AF6A]">
                      {ord.orderNumber} · {ord.tableName}
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      Kanal: {ord.channel} · Personel: {ord.staffName}
                    </div>
                  </div>
                  <div className="text-right font-mono tabular-nums shrink-0">
                    <div
                      className={`text-xs font-bold flex items-center justify-end gap-1 whitespace-nowrap ${
                        isDelayed
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {ord.elapsedMinutes} dk / {ord.prepTimeMinutes} dk
                      </span>
                    </div>
                    {isDelayed && (
                      <div className="text-[11px] text-red-600 dark:text-red-400 font-semibold whitespace-nowrap">
                        GECİKEN SİPARİŞ
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {relevantItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onToggleOrderItemReady(ord.id, item.id)}
                      className={`w-full text-left rounded-lg border p-2.5 transition-colors flex items-start justify-between gap-2 ${
                        item.isReady
                          ? 'border-emerald-700/40 bg-emerald-950/15 text-emerald-700 dark:text-emerald-300'
                          : 'border-neutral-200 dark:border-neutral-800 hover:border-[#B86B35]'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold">
                          {item.quantity}x {item.productName}
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          İstasyon: {item.station}
                          {item.options.length > 0 &&
                            ` · ${item.options.map((o) => o.value).join(', ')}`}
                        </div>
                        {item.customerNote && (
                          <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                            Not: {item.customerNote}
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-mono shrink-0">
                        {item.isReady ? '✓ HAZIR' : 'OCAKTA'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <span className="text-xs font-medium text-neutral-500 whitespace-nowrap truncate">
                  Durum: {ord.status}
                </span>
                <button
                  type="button"
                  onClick={() => onMarkOrderReadyForService(ord.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white transition-colors whitespace-nowrap shrink-0"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Hazır İşaretle & Bildir</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// =============================================================================
// BÖLÜM 9: GARSON VE MASA YÖNETİMİ (NUMARALI QR KOD & DETAYLI SERVİS ÇAĞRILARI)
// =============================================================================
interface WaiterTableTerminalProps {
  tables: DiningTableItem[];
  orders: OrderRecord[];
  waiterCalls?: WaiterServiceCallRecord[];
  onChangeTableStatus: (tableId: string, status: TableStatus) => void;
  onRotateQrToken: (tableId: string, revokeOnly: boolean) => void;
  onClearTableAlerts: (tableId: string) => void;
  onResolveWaiterCall?: (callId: string, tableId: string) => void;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
}

export const WaiterTableTerminal: React.FC<WaiterTableTerminalProps> = ({
  tables,
  orders,
  waiterCalls = [],
  onChangeTableStatus,
  onRotateQrToken,
  onClearTableAlerts,
  onResolveWaiterCall,
  onUpdateOrderStatus,
}) => {
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const areas = ['ALL', 'Ana Salon', 'Taş Bahçe', 'Bakır Ocakbaşı', 'VIP Aile Salonu'];

  const allTableStatuses: TableStatus[] = [
    'Boş',
    'Dolu',
    'Sipariş bekliyor',
    'Hazırlanıyor',
    'Hesap bekliyor',
    'Rezerve',
    'Temizlik bekliyor',
  ];

  const visibleTables = tables.filter((t) => selectedArea === 'ALL' || t.area === selectedArea);
  const pendingCalls = waiterCalls.filter((c) => c.status !== 'Tamamlandı');

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-4">
        <div className="flex items-center gap-2.5">
          <Users className="w-5 h-5 text-[#D4AF6A]" />
          <div>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-[#F5F2EB]">
              Kat Planı, Numaralı QR Masa Durumları & Garson Servis Terminali
            </h2>
            <p className="text-xs text-neutral-500">
              Okutulan masa QR koduna göre garson çağrıları (peçete, çatal-kaşık, tuz, temizlik vb.), hesap talepleri ve servis takibi
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {areas.map((ar) => (
            <button
              key={ar}
              type="button"
              onClick={() => setSelectedArea(ar)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                selectedArea === ar
                  ? 'bg-[#B86B35] text-white'
                  : 'bg-neutral-100 dark:bg-[#141413] text-neutral-600 dark:text-neutral-300'
              }`}
            >
              {ar === 'ALL' ? 'Tüm Bölgeler (8 Masa)' : ar}
            </button>
          ))}
        </div>
      </div>

      {/* Live QR Scanned Waiter Service Requests Queue */}
      <div className="rounded-xl border border-[#D4AF6A]/50 bg-white dark:bg-[#1F1F1D] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-[#B86B35] dark:text-[#D4AF6A]" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-[#F5F2EB]">
              QR Koddan Gelen Canlı Masa & Garson Servis Talepleri ({pendingCalls.length} Aktif)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-neutral-500">
            Masaüstü QR Kod → Sorumlu Garson Eşleşmesi Aktif
          </span>
        </div>

        {pendingCalls.length === 0 ? (
          <div className="text-xs text-neutral-500 py-3">
            Şu anda bekleyen garson veya masa servis çağrısı bulunmuyor.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingCalls.map((call) => (
              <div
                key={call.id}
                className="rounded-xl border border-amber-600/40 bg-amber-950/10 p-3.5 flex flex-col justify-between gap-3 text-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono font-bold text-[#B86B35] dark:text-[#D4AF6A]">
                        {call.qrCodeNumber} · {call.tableNumber}
                      </span>
                      <div className="text-[11px] text-neutral-500">
                        Bölge: {call.tableArea} · Sorumlu Garson:{' '}
                        <span className="font-semibold text-neutral-900 dark:text-[#F5F2EB]">
                          {call.assignedWaiter}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-[11px] text-amber-600 dark:text-amber-400 shrink-0">
                      Saat: {call.createdAt}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                      Müşterinin Seçtiği Servis & Temizlik İhtiyaçları:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {call.selectedNeeds.map((need, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-white dark:bg-[#141413] border border-neutral-300 dark:border-neutral-700 font-medium text-[11px]"
                        >
                          {need}
                        </span>
                      ))}
                    </div>
                  </div>

                  {call.customNote && (
                    <div className="text-[11px] italic text-amber-700 dark:text-amber-300">
                      Müşteri Notu: “{call.customNote}”
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800">
                  <span className="font-mono text-[10px] text-neutral-500">
                    Token: {call.qrToken}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (onResolveWaiterCall) {
                        onResolveWaiterCall(call.id, call.tableId);
                      } else {
                        onClearTableAlerts(call.tableId);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors"
                  >
                    ✓ Servisi Tamamla & Bildirimi Kapat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 8-Table Floor Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleTables.map((table) => {
          const tableOrder = orders.find((o) => o.id === table.currentOrderId);
          return (
            <div
              key={table.id}
              className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-4 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs text-neutral-500">
                      {table.area} · {table.capacity} Kişilik
                    </div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-[#F5F2EB]">
                      {table.number}
                    </h3>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <div className="text-xs font-semibold text-[#B86B35] dark:text-[#D4AF6A]">
                      {table.status}
                    </div>
                    <div className="text-sm font-bold mt-0.5">
                      {table.openBalance.toFixed(2)} ₺
                    </div>
                  </div>
                </div>

                {(table.waiterCalled || table.billRequested) && (
                  <div className="rounded-lg border border-amber-600/40 bg-amber-950/20 p-2.5 text-xs text-amber-700 dark:text-amber-300 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <BellRing className="w-3.5 h-3.5 shrink-0" />
                        {table.billRequested ? 'Müşteri Hesap İstiyor!' : 'QR Garson Çağrısı Aktif!'}
                      </span>
                      <button
                        type="button"
                        onClick={() => onClearTableAlerts(table.id)}
                        className="underline text-[11px] shrink-0"
                      >
                        Yanıtlandı
                      </button>
                    </div>
                    {table.activeServiceRequests && table.activeServiceRequests.length > 0 && (
                      <div className="text-[11px] text-neutral-800 dark:text-neutral-200 space-y-0.5 pt-1 border-t border-amber-600/20">
                        <div className="font-semibold text-amber-700 dark:text-amber-300">
                          İstenenler ({table.qrCodeNumber}):
                        </div>
                        <ul className="list-disc list-inside">
                          {table.activeServiceRequests.map((req, idx) => (
                            <li key={idx}>{req}</li>
                          ))}
                        </ul>
                        {table.serviceRequestNote && (
                          <div className="italic mt-0.5">Not: {table.serviceRequestNote}</div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="text-xs text-neutral-500 space-y-1">
                  <div>
                    Sorumlu Garson:{' '}
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">
                      {table.waiterName}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] flex items-center gap-1">
                    <QrCode className="w-3 h-3 text-[#D4AF6A] shrink-0" />
                    <span>
                      {table.qrCodeNumber} · {table.qrRevoked ? 'İPTAL EDİLDİ' : table.qrToken}
                    </span>
                  </div>
                  {table.mergedWith && (
                    <div className="text-[#B86B35]">
                      Birleştirilen Masa: {table.mergedWith}
                    </div>
                  )}
                </div>

                {tableOrder && (
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs">
                    <span>Sipariş: {tableOrder.orderNumber}</span>
                    {tableOrder.status === 'Hazır' && (
                      <button
                        type="button"
                        onClick={() => onUpdateOrderStatus(tableOrder.id, 'Servis edildi')}
                        className="px-2.5 py-1 rounded bg-emerald-700 text-white font-medium"
                      >
                        Masaya Servis Et
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <label className="block text-[11px] text-neutral-500">
                  Masa Durumunu Güncelle:
                </label>
                <select
                  value={table.status}
                  onChange={(e) => onChangeTableStatus(table.id, e.target.value as TableStatus)}
                  aria-label={`${table.number} durumunu değiştir`}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5 text-xs"
                >
                  {allTableStatuses.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => onRotateQrToken(table.id, false)}
                    className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2 text-[11px] font-medium rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>QR Yenile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRotateQrToken(table.id, true)}
                    className="py-1.5 px-2 text-[11px] font-medium rounded border border-red-700/40 text-red-600 dark:text-red-400 hover:bg-red-950/20"
                  >
                    QR İptal
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

