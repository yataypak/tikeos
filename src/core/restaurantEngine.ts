export interface RecipeIngredientLine {
  ingredientId: string;
  ingredientName: string;
  quantity: number; // in ingredient's unit
  unit: 'kg' | 'gr' | 'lt' | 'ml' | 'adet' | 'paket';
  unitCost: number; // TRY per unit
}

export interface RecipeMetricsResult {
  materialCost: number;
  wasteCost: number;
  totalRecipeCost: number;
  sellingPrice: number;
  grossProfit: number;
  profitMarginPercent: number;
}

export interface StockItem {
  id: string;
  sku: string;
  name: string;
  category:
    | 'Et ve sakatat'
    | 'Sebze'
    | 'Meyve'
    | 'Süt ürünleri'
    | 'Kuru gıda'
    | 'Baharat'
    | 'İçecek'
    | 'Ambalaj'
    | 'Temizlik malzemeleri'
    | 'Diğer sarf malzemeleri';
  unit: 'kg' | 'gr' | 'lt' | 'ml' | 'adet' | 'paket';
  currentStock: number;
  minStockThreshold: number;
  unitCost: number;
  supplierId: string;
  supplierName: string;
  lotNumber: string;
  expiryDate: string;
  warehouse: string;
}

export interface StockMovement {
  id: string;
  timestamp: string;
  ingredientId: string;
  ingredientName: string;
  movementType:
    | 'in'
    | 'out'
    | 'recipe_deduction'
    | 'reversal'
    | 'transfer'
    | 'count_adjust'
    | 'waste';
  quantityDelta: number; // positive for additions/reversals, negative for deductions/waste
  unit: string;
  unitCostSnapshot: number;
  referenceId: string;
  note: string;
  actorName: string;
}

export interface QRTokenRecord {
  tableId: string;
  tableNumber: string;
  token: string;
  isRevoked: boolean;
  requestsLastMinute: number;
  rateLimitPerMin: number;
}

export interface ReservationItem {
  id: string;
  customerName: string;
  customerPhone: string;
  guestCount: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  tableId: string;
  tableNumber: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'no_show' | 'completed';
  depositAmount: number;
  depositPaid: boolean;
  specialRequests: string;
  source: 'online' | 'phone' | 'walk_in';
}

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function roundQuantity(value: number): number {
  return Math.round((value + Number.EPSILON) * 1000) / 1000;
}

/**
 * Bölüm 13: Maliyet ve Kârlılık Hesaplaması
 * Malzeme maliyeti + fire payı = Reçete maliyeti; Satış fiyatı - Reçete maliyeti = Brüt Kâr
 */
export function calculateRecipeMetrics(
  lines: RecipeIngredientLine[],
  wasteAllowancePercent: number,
  sellingPrice: number
): RecipeMetricsResult {
  const rawMaterialCost = lines.reduce(
    (sum, item) => sum + item.quantity * item.unitCost,
    0
  );
  const materialCost = roundCurrency(rawMaterialCost);
  const wasteCost = roundCurrency(materialCost * (wasteAllowancePercent / 100));
  const totalRecipeCost = roundCurrency(materialCost + wasteCost);
  const grossProfit = roundCurrency(sellingPrice - totalRecipeCost);
  const profitMarginPercent =
    sellingPrice > 0 ? roundCurrency((grossProfit / sellingPrice) * 100) : 0;

  return {
    materialCost,
    wasteCost,
    totalRecipeCost,
    sellingPrice: roundCurrency(sellingPrice),
    grossProfit,
    profitMarginPercent,
  };
}

/**
 * Bölüm 12: Reçete Bazlı Otomatik Stok Düşümü ve İptalde Ters Kayıt (Reversal)
 * Stok hareketleri asla silinmez; iptal/iade durumunda ters kayıt (reversal) oluşturulur.
 */
export function applyRecipeStockChange(
  stocks: StockItem[],
  existingMovements: StockMovement[],
  recipeLines: RecipeIngredientLine[],
  orderQuantity: number,
  mode: 'deduct' | 'reverse',
  referenceOrderId: string,
  actorName: string,
  timestampIso: string
): { updatedStocks: StockItem[]; newMovements: StockMovement[] } {
  const updatedStocks = stocks.map((s) => ({ ...s }));
  const appendedMovements: StockMovement[] = [];

  for (const line of recipeLines) {
    const target = updatedStocks.find((s) => s.id === line.ingredientId);
    if (!target) continue;

    const totalQty = roundQuantity(line.quantity * orderQuantity);
    const delta = mode === 'deduct' ? -totalQty : totalQty;
    target.currentStock = roundQuantity(Math.max(0, target.currentStock + delta));

    appendedMovements.push({
      id: `MOV-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: timestampIso,
      ingredientId: target.id,
      ingredientName: target.name,
      movementType: mode === 'deduct' ? 'recipe_deduction' : 'reversal',
      quantityDelta: delta,
      unit: target.unit,
      unitCostSnapshot: target.unitCost,
      referenceId: referenceOrderId,
      note:
        mode === 'deduct'
          ? `Sipariş #${referenceOrderId} reçete otomatik stok düşümü`
          : `Sipariş #${referenceOrderId} iptal/iade ters stok kaydı (Silinmez kayıt)`,
      actorName,
    });
  }

  return {
    updatedStocks,
    newMovements: [...appendedMovements, ...existingMovements],
  };
}

/**
 * Bölüm 5 & 27: QR Güvenliği ve Mükerrer Sipariş Önleme (Idempotency)
 */
export function validateQROrderRequest(
  qrRecord: QRTokenRecord | undefined,
  _providedToken: string,
  idempotencyKey: string,
  existingIdempotencyKeys: string[],
  isOnline: boolean
): { valid: boolean; error?: string } {
  if (!isOnline) {
    return {
      valid: false,
      error:
        'Çevrimdışı durumdasınız. Çevrimdışı modda sipariş veya ödeme onayı gerçekleştirilemez.',
    };
  }
  if (!qrRecord) {
    return {
      valid: false,
      error: 'Geçersiz masa seçimi. Lütfen listeden geçerli bir masa seçin veya hızlı sipariş verin.',
    };
  }
  if (qrRecord.requestsLastMinute >= qrRecord.rateLimitPerMin) {
    return {
      valid: false,
      error: 'İstek sınırına ulaşıldı (Rate Limit). Lütfen 1 dakika bekleyip tekrar deneyin.',
    };
  }
  if (existingIdempotencyKeys.includes(idempotencyKey)) {
    return {
      valid: false,
      error: 'Mükerrer sipariş engellendi: Bu sipariş zaten sisteme iletildi.',
    };
  }
  return { valid: true };
}

/**
 * Bölüm 7: POS Hesap Bölme (Kişi Bazlı ve Ürün Bazlı) ve Çoklu Ödeme Durumu
 */
export function calculateSplitBill(
  totalAmount: number,
  alreadyPaidAmount: number,
  guestCount: number
): {
  remainingAmount: number;
  perPersonShare: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
} {
  const safeTotal = roundCurrency(Math.max(0, totalAmount));
  const safePaid = roundCurrency(Math.max(0, alreadyPaidAmount));
  const remainingAmount = roundCurrency(Math.max(0, safeTotal - safePaid));
  const safeGuests = Math.max(1, Math.floor(guestCount));
  const perPersonShare = roundCurrency(remainingAmount / safeGuests);

  let paymentStatus: 'unpaid' | 'partial' | 'paid' = 'unpaid';
  if (safePaid >= safeTotal && safeTotal > 0) {
    paymentStatus = 'paid';
  } else if (safePaid > 0 && safePaid < safeTotal) {
    paymentStatus = 'partial';
  }

  return {
    remainingAmount,
    perPersonShare,
    paymentStatus,
  };
}

/**
 * Bölüm 11: Rezervasyon Çakışma Kontrolü (Aynı masa, aynı gün, ±90 dakika penceresi)
 */
export function checkReservationConflict(
  existingReservations: ReservationItem[],
  candidate: {
    tableId: string;
    date: string;
    time: string;
    excludeId?: string;
  }
): { hasConflict: boolean; conflictingReservation?: ReservationItem } {
  const toMinutes = (hhmm: string): number => {
    const [h, m] = hhmm.split(':').map((n) => parseInt(n, 10) || 0);
    return h * 60 + m;
  };

  const candidateMins = toMinutes(candidate.time);

  for (const res of existingReservations) {
    if (res.id === candidate.excludeId) continue;
    if (res.status === 'cancelled' || res.status === 'no_show') continue;
    if (res.tableId !== candidate.tableId || res.date !== candidate.date) continue;

    const existingMins = toMinutes(res.time);
    if (Math.abs(candidateMins - existingMins) < 90) {
      return { hasConflict: true, conflictingReservation: res };
    }
  }

  return { hasConflict: false };
}

/**
 * Bölüm 7: Kasa Gün Sonu ve Kasa Farkı Hesaplama
 */
export function calculateCashDiscrepancy(params: {
  openingBalance: number;
  cashSales: number;
  cashIn: number;
  cashOut: number;
  cashRefunds: number;
  actualCountedCash: number;
}): {
  expectedClosingBalance: number;
  actualClosingBalance: number;
  discrepancyAmount: number;
  status: 'balanced' | 'surplus' | 'shortage';
} {
  const expected = roundCurrency(
    params.openingBalance +
      params.cashSales +
      params.cashIn -
      params.cashOut -
      params.cashRefunds
  );
  const actual = roundCurrency(params.actualCountedCash);
  const discrepancy = roundCurrency(actual - expected);

  let status: 'balanced' | 'surplus' | 'shortage' = 'balanced';
  if (discrepancy > 0) status = 'surplus';
  if (discrepancy < 0) status = 'shortage';

  return {
    expectedClosingBalance: expected,
    actualClosingBalance: actual,
    discrepancyAmount: discrepancy,
    status,
  };
}

export interface WaiterServiceOption {
  id: string;
  label: string;
  category: 'Servis & Sofra' | 'İkram & Takviye' | 'Temizlik & Konfor' | 'Hesap & Ödeme';
}

export const WAITER_SERVICE_OPTIONS: WaiterServiceOption[] = [
  // Servis & Sofra Gereçleri
  { id: 'SRV-PECETE', label: 'Peçete & Islak Mendil', category: 'Servis & Sofra' },
  { id: 'SRV-CATAL', label: 'Çatal / Kaşık / Bıçak Takımı', category: 'Servis & Sofra' },
  { id: 'SRV-TUZ', label: 'Tuz / Karabiber / Sumak / Pul Biber', category: 'Servis & Sofra' },
  { id: 'SRV-TABAK', label: 'Ekstra Boş Servis Tabağı', category: 'Servis & Sofra' },
  { id: 'SRV-BARDAK', label: 'Temiz Bardak & Buz Talebi', category: 'Servis & Sofra' },
  { id: 'SRV-KURDAN', label: 'Kürdan & Kolonya Servisi', category: 'Servis & Sofra' },
  // İkram & Masa Tazelenmesi
  { id: 'IKR-LAVAS', label: 'Sıcak Tandır Lavaşı / Tırnak Pide', category: 'İkram & Takviye' },
  { id: 'IKR-SOGAN', label: 'Sumaklı Soğan & Ezme Tazelenmesi', category: 'İkram & Takviye' },
  { id: 'IKR-KOZ', label: 'Közlenmiş Biber & Domates İlavesi', category: 'İkram & Takviye' },
  { id: 'IKR-YESILLIK', label: 'Taze Nane / Maydanoz / Roka Tabağı', category: 'İkram & Takviye' },
  { id: 'IKR-CAY', label: 'Semaver Çay / Mırra İkramı', category: 'İkram & Takviye' },
  { id: 'IKR-SU', label: 'Masaya Su / Ayran İlavesi', category: 'İkram & Takviye' },
  // Temizlik & Konfor
  { id: 'TMZ-MASA', label: 'Masa Temizliği & Boşların Alınması', category: 'Temizlik & Konfor' },
  { id: 'TMZ-KULTABLASI', label: 'Kül Tablası Değişimi', category: 'Temizlik & Konfor' },
  { id: 'TMZ-BEBEK', label: 'Bebek / Çocuk Mama Sandalyesi', category: 'Temizlik & Konfor' },
  { id: 'TMZ-ISITICI', label: 'Isıtıcı / Havalandırma Konfor Ayarı', category: 'Temizlik & Konfor' },
  // Hesap & Ödeme
  { id: 'HSP-NAKİT', label: 'Hesap Pusulası (Nakit Ödeme)', category: 'Hesap & Ödeme' },
  { id: 'HSP-POS', label: 'Masaya Mobil POS Cihazı (Kartla Ödeme)', category: 'Hesap & Ödeme' },
  { id: 'HSP-ALMAN', label: 'Alman Usulü (Kişi Başı Ayrı) Hesap', category: 'Hesap & Ödeme' },
  { id: 'HSP-GARSON', label: 'Sorumlu Garson Masaya Gelsin (Sipariş / Danışma)', category: 'Servis & Sofra' },
];

export interface WaiterServiceCallRecord {
  id: string;
  tableId: string;
  tableNumber: string;
  tableArea: string;
  qrCodeNumber: string;
  qrToken: string;
  assignedWaiter: string;
  selectedNeeds: string[];
  customNote: string;
  createdAt: string;
  status: 'Bekliyor' | 'Garson Yönlendirildi' | 'Tamamlandı';
  calculatedBillAmount?: number;
}

export function createWaiterServiceCall(params: {
  qrRecord: QRTokenRecord | undefined;
  providedToken?: string;
  tableArea: string;
  qrCodeNumber: string;
  assignedWaiter: string;
  selectedNeeds: string[];
  customNote: string;
  timestamp: string;
  calculatedBillAmount?: number;
}): { valid: boolean; error?: string; callRecord?: WaiterServiceCallRecord } {
  if (!params.qrRecord) {
    return {
      valid: false,
      error: 'Geçersiz masa kaydı. Lütfen geçerli bir masa seçin.',
    };
  }
  const cleanNeeds = params.selectedNeeds.map((s) => s.trim()).filter(Boolean);
  const cleanNote = params.customNote.trim();
  if (cleanNeeds.length === 0 && !cleanNote) {
    return {
      valid: false,
      error: 'Lütfen garson çağırmak için en az bir servis ihtiyacı (peçete, çatal, temizlik vb.) seçin veya not yazın.',
    };
  }

  return {
    valid: true,
    callRecord: {
      id: `CALL-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      tableId: params.qrRecord.tableId,
      tableNumber: params.qrRecord.tableNumber,
      tableArea: params.tableArea,
      qrCodeNumber: params.qrCodeNumber,
      qrToken: params.providedToken || '',
      assignedWaiter: params.assignedWaiter,
      selectedNeeds: cleanNeeds.length > 0 ? cleanNeeds : ['Genel Garson Çağrısı'],
      customNote: cleanNote,
      createdAt: params.timestamp,
      status: 'Bekliyor',
      ...(typeof params.calculatedBillAmount === 'number'
        ? { calculatedBillAmount: roundCurrency(Math.max(0, params.calculatedBillAmount)) }
        : {}),
    },
  };
}

export function calculateCampaignDiscount(params: {
  subtotal: number;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  isActive: boolean;
}): { applicable: boolean; discountAmount: number; finalTotal: number; reason?: string } {
  if (!params.isActive) {
    return {
      applicable: false,
      discountAmount: 0,
      finalTotal: roundCurrency(params.subtotal),
      reason: 'Bu kampanya şu anda aktif değil.',
    };
  }
  if (params.subtotal < params.minOrderAmount) {
    return {
      applicable: false,
      discountAmount: 0,
      finalTotal: roundCurrency(params.subtotal),
      reason: `Bu kampanya minimum ${params.minOrderAmount.toFixed(2)} ₺ sepet tutarında geçerlidir.`,
    };
  }

  let discount = 0;
  if (params.discountType === 'Yüzde indirim' || params.discountType.includes('Yüzde')) {
    discount = roundCurrency(params.subtotal * (params.discountValue / 100));
  } else {
    discount = roundCurrency(params.discountValue);
  }
  discount = Math.min(params.subtotal, Math.max(0, discount));
  return {
    applicable: true,
    discountAmount: discount,
    finalTotal: roundCurrency(params.subtotal - discount),
  };
}

/**
 * Müşteri Sepeti, Bahşiş (Tip), Kurye Teslimat Ücreti ve Eklemeli KDV Hesaplama Motoru
 */
export function calculateCustomerCheckoutTotals(params: {
  subtotal: number;
  discountAmount: number;
  taxRatePercent?: number;
  deliveryFee?: number;
  tipPercent?: number;
  customTipAmount?: number;
}): {
  subtotal: number;
  discountAmount: number;
  discountedSubtotal: number;
  taxAmount: number;
  deliveryFee: number;
  tipAmount: number;
  finalTotal: number;
} {
  const safeSubtotal = roundCurrency(Math.max(0, params.subtotal));
  const safeDiscount = roundCurrency(Math.min(safeSubtotal, Math.max(0, params.discountAmount)));
  const discountedSubtotal = roundCurrency(Math.max(0, safeSubtotal - safeDiscount));
  const taxRate = typeof params.taxRatePercent === 'number' ? Math.max(0, params.taxRatePercent) : 10;
  const deliveryFee = roundCurrency(Math.max(0, params.deliveryFee || 0));

  let rawTip = 0;
  if (typeof params.customTipAmount === 'number' && params.customTipAmount > 0) {
    rawTip = params.customTipAmount;
  } else if (typeof params.tipPercent === 'number' && params.tipPercent > 0) {
    rawTip = discountedSubtotal * (params.tipPercent / 100);
  }
  const tipAmount = roundCurrency(Math.max(0, rawTip));
  const taxAmount = roundCurrency(discountedSubtotal * (taxRate / 100));
  const finalTotal = roundCurrency(discountedSubtotal + taxAmount + deliveryFee + tipAmount);

  return {
    subtotal: safeSubtotal,
    discountAmount: safeDiscount,
    discountedSubtotal,
    taxAmount,
    deliveryFee,
    tipAmount,
    finalTotal,
  };
}

/**
 * Garson Çağrısı İçecek / İkram Adet Formatlayıcı (Çay, Soda, Türk Kahvesi, Su vb.)
 */
export function formatWaiterDrinkQuantities(quantities: Record<string, number>): string[] {
  return Object.entries(quantities)
    .filter(([, qty]) => Number.isFinite(qty) && qty > 0)
    .map(([label, qty]) => `${label} x${Math.floor(qty)}`);
}

/**
 * QR Kod Doğrulama Kilidi:
 * Masadan sipariş veya garson çağırma yalnızca masa üzerindeki QR kod okutulduğunda aktif olur.
 * Gel-Al ve Kurye Paket Servis kanalları QR okutmadan da kullanılabilir.
 */
export function canAccessQrProtectedFeature(
  qrVerifiedTableId: string | null | undefined,
  feature: 'QR' | 'Gel-Al' | 'Paket servis' | 'waiter_call',
  tableSelectionEnabled = true
): { allowed: boolean; reason?: string } {
  if (!tableSelectionEnabled) {
    return { allowed: true };
  }
  if (feature === 'Gel-Al' || feature === 'Paket servis') {
    return { allowed: true };
  }
  if (!qrVerifiedTableId || !qrVerifiedTableId.trim()) {
    return {
      allowed: false,
      reason:
        feature === 'waiter_call'
          ? 'Garson çağırabilmek için lütfen masanızın üzerindeki QR kodu okutun.'
          : 'Masadan sipariş verebilmek için lütfen masanızın üzerindeki QR kodu okutun.',
    };
  }
  return { allowed: true };
}

/**
 * Sipariş ve Kurye Çok Adımlı İlerleme Takibi
 */
export function getOrderProgressStep(
  status: string,
  channel: string,
  deliveryState?: string
): { stepIndex: number; totalSteps: number; stepLabels: string[] } {
  if (channel === 'Paket servis') {
    const steps = ['Sipariş Alındı', 'Hazırlanıyor', 'Kuryeye Atandı', 'Yolda', 'Teslim Edildi'];
    if (deliveryState === 'Teslim Edildi' || status === 'Tamamlandı') {
      return { stepIndex: 4, totalSteps: steps.length, stepLabels: steps };
    }
    if (deliveryState === 'Yolda' || status === 'Kuryeye teslim edildi') {
      return { stepIndex: 3, totalSteps: steps.length, stepLabels: steps };
    }
    if (deliveryState === 'Kuryeye Atandı') {
      return { stepIndex: 2, totalSteps: steps.length, stepLabels: steps };
    }
    if (status === 'Hazırlanıyor' || status === 'Hazır' || status === 'Mutfağa gönderildi') {
      return { stepIndex: 1, totalSteps: steps.length, stepLabels: steps };
    }
    return { stepIndex: 0, totalSteps: steps.length, stepLabels: steps };
  }

  const steps = ['Sipariş Alındı', 'Mutfak KDS', 'Hazırlanıyor', 'Hazır', 'Servis Edildi'];
  if (status === 'Servis edildi' || status === 'Tamamlandı') {
    return { stepIndex: 4, totalSteps: steps.length, stepLabels: steps };
  }
  if (status === 'Hazır' || status === 'Servis bekliyor') {
    return { stepIndex: 3, totalSteps: steps.length, stepLabels: steps };
  }
  if (status === 'Hazırlanıyor') {
    return { stepIndex: 2, totalSteps: steps.length, stepLabels: steps };
  }
  if (status === 'Mutfağa gönderildi') {
    return { stepIndex: 1, totalSteps: steps.length, stepLabels: steps };
  }
  return { stepIndex: 0, totalSteps: steps.length, stepLabels: steps };
}

/**
 * Otomatik Fiş ve GİB e-Arşiv Fatura Numarası Üreticisi
 */
export function generateReceiptAndInvoiceNumbers(orderNumber: string): {
  receiptNumber: string;
  eInvoiceNo: string;
} {
  const cleanDigits = orderNumber.replace(/\D/g, '').slice(-6).padStart(6, '0');
  const year = new Date().getFullYear();
  return {
    receiptNumber: `FIS-${year}-${cleanDigits}`,
    eInvoiceNo: `OZT${year}000${cleanDigits}`,
  };
}

/**
 * Masa Hesap Tutarı Hesaplama:
 * Masaya bağlı aktif (iptal/iade edilmemiş) siparişlerin ödenmemiş bakiye toplamı ile mevcut açık bakiye
 * mutabakatını döndürür.
 */
export function calculateTableOpenBill(
  tableOpenBalance: number,
  tableOrders: Array<{ status: string; totalAmount: number; paidAmount: number }>
): number {
  const activeUnpaidSum = tableOrders
    .filter((o) => o.status !== 'İptal edildi' && o.status !== 'İade edildi')
    .reduce((sum, o) => sum + Math.max(0, Number(o.totalAmount || 0) - Number(o.paidAmount || 0)), 0);

  return roundCurrency(Math.max(activeUnpaidSum, Math.max(0, Number(tableOpenBalance || 0))));
}

/**
 * Garson çağrısı içinde hesap talebi olup olmadığını tespit eder.
 */
export function isBillRequestNeeds(selectedNeeds: string[], customNote = ''): boolean {
  const haystack = `${selectedNeeds.join(' ')} ${customNote}`.toLocaleLowerCase('tr-TR');
  const billKeywords = [
    'hesap',
    'pusula',
    'mobil pos',
    'alman usulü',
    'hsp-nakit',
    'hsp-nakıt',
    'hsp-pos',
    'hsp-alman',
    'w-hesap',
    'request bill',
    'the check',
    'الحساب',
    'فاتورة',
    'addition',
    'rechnung',
    'お会計',
    '结账',
    'hesab',
  ];
  return billKeywords.some((kw) => haystack.includes(kw));
}

export type ArchiveHistoryType =
  | 'Sipariş'
  | 'Masa & Hesap'
  | 'Garson Çağrısı'
  | 'Kurye Teslimatı'
  | 'Gün Sonu Özeti';

export interface ArchiveHistoryEntry {
  id: string;
  archivedAt: string;
  dateKey: string; // YYYY-MM-DD
  type: ArchiveHistoryType;
  title: string;
  subtitle: string;
  amount: number;
  reason: string;
  payload?: Record<string, unknown>;
}

export function buildArchiveEntry(params: {
  type: ArchiveHistoryType;
  title: string;
  subtitle: string;
  amount?: number;
  reason: string;
  archivedAt?: string;
  dateKey?: string;
  payload?: Record<string, unknown>;
}): ArchiveHistoryEntry {
  const now = new Date();
  const dateKey =
    params.dateKey ||
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const archivedAt =
    params.archivedAt ||
    `${dateKey} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  return {
    id: `ARC-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    archivedAt,
    dateKey,
    type: params.type,
    title: params.title,
    subtitle: params.subtitle,
    amount: roundCurrency(Math.max(0, Number(params.amount || 0))),
    reason: params.reason,
    payload: params.payload,
  };
}

export function shouldTriggerAutoEndOfDayArchive(
  lastArchiveDate: string | null | undefined,
  currentDateKey: string
): boolean {
  if (!lastArchiveDate || !lastArchiveDate.trim()) return false;
  return lastArchiveDate.trim() < currentDateKey.trim();
}

export interface MapNavigationUrls {
  googleMapsUrl: string;
  googleDirectionsUrl: string;
  appleMapsUrl: string;
  yandexMapsUrl: string;
  wazeUrl: string;
  openStreetMapUrl: string;
  bingMapsUrl: string;
  geoUri: string;
}

export function buildMapNavigationUrls(
  lat: number,
  lng: number,
  label = 'ÖzTike Ciğer · Halil Usta'
): MapNavigationUrls {
  const safeLat = Number.isFinite(lat) ? Number(lat.toFixed(6)) : 37.0628;
  const safeLng = Number.isFinite(lng) ? Number(lng.toFixed(6)) : 37.3795;
  const encodedLabel = encodeURIComponent(label);
  const coords = `${safeLat},${safeLng}`;

  return {
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${coords}`,
    googleDirectionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${coords}&travelmode=driving`,
    appleMapsUrl: `https://maps.apple.com/?q=${encodedLabel}&ll=${coords}&daddr=${coords}`,
    yandexMapsUrl: `https://yandex.com.tr/maps/?pt=${safeLng},${safeLat}&z=17&l=map`,
    wazeUrl: `https://waze.com/ul?ll=${coords}&navigate=yes`,
    openStreetMapUrl: `https://www.openstreetmap.org/?mlat=${safeLat}&mlon=${safeLng}#map=17/${safeLat}/${safeLng}`,
    bingMapsUrl: `https://www.bing.com/maps?cp=${safeLat}~${safeLng}&lvl=17&sp=point.${safeLat}_${safeLng}_${encodedLabel}`,
    geoUri: `geo:${coords}?q=${coords}(${encodedLabel})`,
  };
}

export type MapProviderMode = 'free' | 'paid';
export type FreeMapProviderId = 'openstreetmap' | 'google-embed-free' | 'yandex-embed';
export type PaidMapProviderId = 'google-js-api' | 'google-embed-api' | 'custom-embed';

export function buildMapEmbedUrl(params: {
  providerMode: MapProviderMode;
  freeProvider: FreeMapProviderId;
  paidProvider: PaidMapProviderId;
  lat: number;
  lng: number;
  zoom: number;
  lang?: string;
  placeName?: string;
  paidApiKey?: string;
  customEmbedUrl?: string;
}): { mode: 'js-sdk' | 'iframe'; src: string; providerLabel: string } {
  const safeLat = Number.isFinite(params.lat) ? Number(params.lat.toFixed(6)) : 37.0628;
  const safeLng = Number.isFinite(params.lng) ? Number(params.lng.toFixed(6)) : 37.3795;
  const safeZoom = Math.min(20, Math.max(3, Math.round(params.zoom || 16)));
  const mapLang = params.lang || 'tr';
  const queryLabel = encodeURIComponent(params.placeName || `${safeLat},${safeLng}`);

  if (params.providerMode === 'paid') {
    if (params.paidProvider === 'custom-embed' && params.customEmbedUrl?.trim()) {
      return {
        mode: 'iframe',
        src: params.customEmbedUrl.trim(),
        providerLabel: 'Özel Ücretli Harita Embed (Mapbox / Kurumsal)',
      };
    }
    if (params.paidProvider === 'google-embed-api' && params.paidApiKey?.trim()) {
      return {
        mode: 'iframe',
        src: `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(
          params.paidApiKey.trim()
        )}&q=${safeLat},${safeLng}&zoom=${safeZoom}&language=${mapLang}`,
        providerLabel: 'Google Maps Embed API (Ücretli / Key)',
      };
    }
    if (params.paidProvider === 'google-js-api' && params.paidApiKey?.trim()) {
      return {
        mode: 'js-sdk',
        src: '',
        providerLabel: 'Google Maps JS SDK (Ücretli / İnteraktif)',
      };
    }
  }

  // Free providers (or graceful fallback when paid API key is not configured)
  if (params.freeProvider === 'openstreetmap') {
    const span = Math.max(0.002, 0.08 / Math.pow(2, safeZoom - 12));
    const minLng = (safeLng - span).toFixed(6);
    const minLat = (safeLat - span * 0.65).toFixed(6);
    const maxLng = (safeLng + span).toFixed(6);
    const maxLat = (safeLat + span * 0.65).toFixed(6);
    return {
      mode: 'iframe',
      src: `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&layer=mapnik&marker=${safeLat}%2C${safeLng}`,
      providerLabel: 'OpenStreetMap (Ücretsiz & Açık Kaynak)',
    };
  }

  if (params.freeProvider === 'yandex-embed') {
    return {
      mode: 'iframe',
      src: `https://yandex.com.tr/map-widget/v1/?ll=${safeLng}%2C${safeLat}&z=${safeZoom}&pt=${safeLng},${safeLat},pm2rdm`,
      providerLabel: 'Yandex Haritalar Widget (Ücretsiz)',
    };
  }

  return {
    mode: 'iframe',
    src: `https://maps.google.com/maps?q=${safeLat},${safeLng}(${queryLabel})&z=${safeZoom}&hl=${mapLang}&output=embed`,
    providerLabel: 'Google Haritalar Embed (Ücretsiz)',
  };
}

export type ThemeVariantId =
  | 'oztike-classic'
  | 'mermer-editorial'
  | 'obsidian-bento'
  | 'antep-botanik'
  | 'kapadokya-terracotta'
  | 'bosphorus-midnight'
  | 'ankara-kurumsal-light'
  | 'mezopotamya-bakir-dark'
  | 'ege-zeytin-light';

export interface ThemePresetMeta {
  id: ThemeVariantId;
  name: string;
  tagline: string;
  description: string;
  isLight: boolean;
  heroLayout: 'classic-banner' | 'split-editorial' | 'bento-split' | 'arched-botanic';
  menuGridLayout: 'classic-2col' | 'editorial-list' | 'bento-3col' | 'botanic-cards';
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  surfaceAltColor: string;
  textPrimary: string;
  textSecondary: string;
  borderColor: string;
  ctaTextColor: string;
  cardRadius: 'rounded-xl' | 'rounded-2xl' | 'rounded-3xl';
  buttonStyle: 'gold-gradient' | 'copper-solid' | 'emerald-accent';
  buttonRadius: 'rounded-lg' | 'rounded-xl' | 'rounded-full';
}

export const THEME_PRESETS: Record<ThemeVariantId, ThemePresetMeta> = {
  'oztike-classic': {
    id: 'oztike-classic',
    name: 'ÖzTike Bakır Ocakbaşı (Klasik)',
    tagline: 'Koyu Maun · Altın Vurgu · Geniş Banner',
    description: 'Klasik ocakbaşı ruhunu yansıtan koyu maun zemin, bakır-altın geçişler ve 2 sütunlu zengin menü kartları.',
    isLight: false,
    heroLayout: 'classic-banner',
    menuGridLayout: 'classic-2col',
    primaryColor: '#D4A359',
    secondaryColor: '#B0782C',
    backgroundColor: '#120806',
    surfaceColor: '#1A0C09',
    surfaceAltColor: '#24110D',
    textPrimary: '#FFF7EB',
    textSecondary: '#DECAB4',
    borderColor: 'rgba(212, 163, 89, 0.28)',
    ctaTextColor: '#1A0B08',
    cardRadius: 'rounded-2xl',
    buttonStyle: 'gold-gradient',
    buttonRadius: 'rounded-xl',
  },
  'mermer-editorial': {
    id: 'mermer-editorial',
    name: 'Mermer & Traverten Editoryal',
    tagline: 'Gündüz Mermeri · Bölünmüş Hero · Katalog Satırları',
    description: 'Sıcak Gaziantep taş & mermer dokusu, bölünmüş 7/5 editoryal kapak ve dergi estetiğinde rafine menü satırları.',
    isLight: true,
    heroLayout: 'split-editorial',
    menuGridLayout: 'editorial-list',
    primaryColor: '#9A5B25',
    secondaryColor: '#6E3B14',
    backgroundColor: '#F6F1E7',
    surfaceColor: '#FFFFFF',
    surfaceAltColor: '#EFE7D8',
    textPrimary: '#1D1714',
    textSecondary: '#5A4A3F',
    borderColor: 'rgba(154, 91, 37, 0.24)',
    ctaTextColor: '#FFFFFF',
    cardRadius: 'rounded-xl',
    buttonStyle: 'copper-solid',
    buttonRadius: 'rounded-lg',
  },
  'obsidian-bento': {
    id: 'obsidian-bento',
    name: 'Obsidyen Bento Grid',
    tagline: 'Modüler Bento Hero · 3 Sütun Izgara · Koyu Karbon',
    description: 'Modern restoran OS mimarisi: hızlı aksiyonlu bento hero blokları, 3 sütunlu kompakt kartlar ve keskin kehribar vurgular.',
    isLight: false,
    heroLayout: 'bento-split',
    menuGridLayout: 'bento-3col',
    primaryColor: '#F59E0B',
    secondaryColor: '#DC2626',
    backgroundColor: '#0A0F18',
    surfaceColor: '#131C2B',
    surfaceAltColor: '#1B273B',
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    borderColor: 'rgba(245, 158, 11, 0.26)',
    ctaTextColor: '#0A0F18',
    cardRadius: 'rounded-xl',
    buttonStyle: 'gold-gradient',
    buttonRadius: 'rounded-lg',
  },
  'antep-botanik': {
    id: 'antep-botanik',
    name: 'Antep Fıstık & Botanik Avlu',
    tagline: 'Kemerli Avlu Hero · Zümrüt & Terracotta · Oval Kartlar',
    description: 'Gaziantep bahçe avlularından ilham alan koyu fıstık zümrüdü zemin, kemerli vitrin ve yumuşak oval misafirperverlik kartları.',
    isLight: false,
    heroLayout: 'arched-botanic',
    menuGridLayout: 'botanic-cards',
    primaryColor: '#D97745',
    secondaryColor: '#52B788',
    backgroundColor: '#0A1914',
    surfaceColor: '#112820',
    surfaceAltColor: '#18372C',
    textPrimary: '#F3EFE0',
    textSecondary: '#C8D8CE',
    borderColor: 'rgba(82, 183, 136, 0.30)',
    ctaTextColor: '#FFFFFF',
    cardRadius: 'rounded-3xl',
    buttonStyle: 'emerald-accent',
    buttonRadius: 'rounded-full',
  },
  'kapadokya-terracotta': {
    id: 'kapadokya-terracotta',
    name: 'Kapadokya Terracotta & Kil (Açık)',
    tagline: 'Sıcak Kil Zemin · Kemerli Kapak · Taş Fırın Estetiği',
    description: 'Anadolu taş fırın ve çömlek kültürünü yansıtan aydınlık kil-krem zemin, kiremit vurgular ve kemerli vitrin düzeni.',
    isLight: true,
    heroLayout: 'arched-botanic',
    menuGridLayout: 'classic-2col',
    primaryColor: '#C2410C',
    secondaryColor: '#9A3412',
    backgroundColor: '#FDF8F3',
    surfaceColor: '#FFFFFF',
    surfaceAltColor: '#F5E8DC',
    textPrimary: '#27140B',
    textSecondary: '#6B4433',
    borderColor: 'rgba(194, 65, 12, 0.24)',
    ctaTextColor: '#FFFFFF',
    cardRadius: 'rounded-3xl',
    buttonStyle: 'copper-solid',
    buttonRadius: 'rounded-full',
  },
  'bosphorus-midnight': {
    id: 'bosphorus-midnight',
    name: 'Boğaziçi Gece Mavisi & Kehribar (Koyu)',
    tagline: 'Derin Lacivert · Bölünmüş Hero · 3 Sütun Fine-Dining',
    description: 'Boğaz akşamlarından ilham alan gece laciverti zemin, şampanya altın tipografi ve 3 sütunlu lüks menü ızgarası.',
    isLight: false,
    heroLayout: 'split-editorial',
    menuGridLayout: 'bento-3col',
    primaryColor: '#EAB308',
    secondaryColor: '#38BDF8',
    backgroundColor: '#07111E',
    surfaceColor: '#0E1E33',
    surfaceAltColor: '#162C47',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    borderColor: 'rgba(234, 179, 8, 0.28)',
    ctaTextColor: '#07111E',
    cardRadius: 'rounded-2xl',
    buttonStyle: 'gold-gradient',
    buttonRadius: 'rounded-xl',
  },
  'ankara-kurumsal-light': {
    id: 'ankara-kurumsal-light',
    name: 'Modern Kurumsal & Bento (Açık)',
    tagline: 'Kristal Beyaz · Bento Izgara · Hızlı Kasa & Sipariş',
    description: 'Yüksek okunabilirlik sunan aydınlık kurumsal gri-beyaz yüzey, bento kategori blokları ve net fiyat odaklı menü.',
    isLight: true,
    heroLayout: 'bento-split',
    menuGridLayout: 'bento-3col',
    primaryColor: '#0F766E',
    secondaryColor: '#B45309',
    backgroundColor: '#F8FAFC',
    surfaceColor: '#FFFFFF',
    surfaceAltColor: '#E2E8F0',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    borderColor: 'rgba(15, 118, 110, 0.22)',
    ctaTextColor: '#FFFFFF',
    cardRadius: 'rounded-xl',
    buttonStyle: 'emerald-accent',
    buttonRadius: 'rounded-lg',
  },
  'mezopotamya-bakir-dark': {
    id: 'mezopotamya-bakir-dark',
    name: 'Mezopotamya Köz & Bakır (Koyu)',
    tagline: 'Köz Kırmızısı · Klasik Ocakbaşı · Bakır Dövmeli Kartlar',
    description: 'Meşe közü kızıllığı ile dövme bakır dokusunu birleştiren, ocakbaşı ve kebap saraylarına özel koyu tema.',
    isLight: false,
    heroLayout: 'classic-banner',
    menuGridLayout: 'editorial-list',
    primaryColor: '#EA580C',
    secondaryColor: '#D97706',
    backgroundColor: '#160705',
    surfaceColor: '#230D0A',
    surfaceAltColor: '#31130E',
    textPrimary: '#FFF5F0',
    textSecondary: '#FDBA74',
    borderColor: 'rgba(234, 88, 12, 0.30)',
    ctaTextColor: '#FFFFFF',
    cardRadius: 'rounded-2xl',
    buttonStyle: 'copper-solid',
    buttonRadius: 'rounded-xl',
  },
  'ege-zeytin-light': {
    id: 'ege-zeytin-light',
    name: 'Ege Zeytinlik & Keten (Açık)',
    tagline: 'Doğal Keten · Zeytin Yeşili · Organik Avlu Kartları',
    description: 'Aydınlık keten dokusu üzerinde zeytin yaprağı yeşili ve sıcak toprak tonlarıyla ferah gündüz bahçe teması.',
    isLight: true,
    heroLayout: 'split-editorial',
    menuGridLayout: 'botanic-cards',
    primaryColor: '#3F6212',
    secondaryColor: '#B45309',
    backgroundColor: '#F7F8F2',
    surfaceColor: '#FFFFFF',
    surfaceAltColor: '#EBF0E1',
    textPrimary: '#1A2E05',
    textSecondary: '#4D5E38',
    borderColor: 'rgba(63, 98, 18, 0.22)',
    ctaTextColor: '#FFFFFF',
    cardRadius: 'rounded-3xl',
    buttonStyle: 'emerald-accent',
    buttonRadius: 'rounded-full',
  },
};

export interface ResolvedThemeTokens extends ThemePresetMeta {
  menuGridClass: string;
  iconStyle: 'outline' | 'solid' | 'rounded';
  iconSizePx: number;
  footerColumns: 2 | 3 | 4;
  footerBgColor: string;
  buttonFontWeightClass: string;
}

export function resolveThemePaletteAndLayout(design?: {
  themeVariant?: ThemeVariantId;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  surfaceColor?: string;
  cardRadius?: 'rounded-xl' | 'rounded-2xl' | 'rounded-3xl';
  buttonStyle?: 'gold-gradient' | 'copper-solid' | 'emerald-accent';
  buttonRadius?: 'rounded-lg' | 'rounded-xl' | 'rounded-full';
  buttonFontWeight?: 'semibold' | 'bold' | 'extrabold';
  iconStyle?: 'outline' | 'solid' | 'rounded';
  iconSizePx?: number;
  gridColumnsDesktop?: 2 | 3 | 4;
  gridColumnsMobile?: 1 | 2;
  gridGap?: 'compact' | 'normal' | 'relaxed';
  footerColumns?: 2 | 3 | 4;
  footerBgColor?: string;
}): ResolvedThemeTokens {
  const variant: ThemeVariantId =
    design?.themeVariant && THEME_PRESETS[design.themeVariant]
      ? design.themeVariant
      : 'oztike-classic';
  const base = THEME_PRESETS[variant];

  const desktopCols = design?.gridColumnsDesktop;
  const mobileCols = design?.gridColumnsMobile;
  const gapClass =
    design?.gridGap === 'compact'
      ? 'gap-2.5'
      : design?.gridGap === 'relaxed'
      ? 'gap-5'
      : 'gap-3.5';

  let menuGridClass = '';
  if (desktopCols || mobileCols) {
    const mCls = mobileCols === 2 ? 'grid-cols-2' : 'grid-cols-1';
    const dCls =
      desktopCols === 4
        ? 'sm:grid-cols-2 lg:grid-cols-4'
        : desktopCols === 2
        ? 'md:grid-cols-2'
        : 'sm:grid-cols-2 lg:grid-cols-3';
    menuGridClass = `grid ${mCls} ${dCls} ${gapClass}`;
  } else {
    menuGridClass =
      base.menuGridLayout === 'bento-3col'
        ? `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${gapClass}`
        : base.menuGridLayout === 'editorial-list'
        ? 'grid grid-cols-1 lg:grid-cols-2 gap-4'
        : base.menuGridLayout === 'botanic-cards'
        ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
        : `grid grid-cols-1 md:grid-cols-2 ${gapClass}`;
  }

  const buttonFontWeightClass =
    design?.buttonFontWeight === 'semibold'
      ? 'font-semibold'
      : design?.buttonFontWeight === 'extrabold'
      ? 'font-extrabold'
      : 'font-bold';

  return {
    ...base,
    primaryColor: design?.primaryColor || base.primaryColor,
    secondaryColor: design?.secondaryColor || base.secondaryColor,
    backgroundColor: design?.backgroundColor || base.backgroundColor,
    surfaceColor: design?.surfaceColor || base.surfaceColor,
    cardRadius: design?.cardRadius || base.cardRadius,
    buttonStyle: design?.buttonStyle || base.buttonStyle,
    buttonRadius: design?.buttonRadius || base.buttonRadius,
    menuGridClass,
    iconStyle: design?.iconStyle || 'rounded',
    iconSizePx: design?.iconSizePx || 16,
    footerColumns: design?.footerColumns || 3,
    footerBgColor: design?.footerBgColor?.trim() || base.surfaceAltColor,
    buttonFontWeightClass,
  };
}

export function buildDynamicWebManifest(pwaSettings: {
  appName: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  displayMode: 'standalone' | 'fullscreen' | 'minimal-ui';
  orientation: 'portrait' | 'any';
  iconUrl?: string;
  maskableIconUrl?: string;
  startUrl?: string;
  scope?: string;
  appCategory?: string;
  screenshots?: string[];
  shortcuts?: Array<{
    name: string;
    shortName: string;
    url: string;
    description: string;
  }>;
}) {
  const cleanShortName = (pwaSettings.shortName || 'ÖzTike OS').trim().slice(0, 12);
  const customIcon = pwaSettings.iconUrl?.trim();
  const icons: Array<{ src: string; sizes: string; type: string; purpose: string }> = [
    { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    {
      src: pwaSettings.maskableIconUrl?.trim() || '/pwa-maskable-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ];
  if (customIcon && customIcon !== '/assets/aistudio/oztike-logo-transparent.png') {
    icons.unshift({ src: customIcon, sizes: '512x512', type: 'image/png', purpose: 'any' });
  }

  return {
    id: pwaSettings.startUrl || '/',
    name: pwaSettings.appName || 'ÖzTike Ciğer – Halil Usta',
    short_name: cleanShortName,
    description:
      pwaSettings.description ||
      'ÖzTike Ciğer tam kapsamlı restoran otomasyon, POS ve dijital menü uygulaması.',
    theme_color: pwaSettings.themeColor || '#D4A359',
    background_color: pwaSettings.backgroundColor || '#120806',
    display: pwaSettings.displayMode || 'standalone',
    orientation: pwaSettings.orientation || 'portrait',
    start_url: pwaSettings.startUrl || '/',
    scope: pwaSettings.scope || '/',
    lang: 'tr',
    categories: [pwaSettings.appCategory || 'food', 'shopping'],
    icons,
    ...(pwaSettings.screenshots && pwaSettings.screenshots.length > 0
      ? {
          screenshots: pwaSettings.screenshots.map((src) => ({
            src,
            sizes: '1280x720',
            type: 'image/jpeg',
            form_factor: 'wide',
          })),
        }
      : {}),
    ...(pwaSettings.shortcuts && pwaSettings.shortcuts.length > 0
      ? {
          shortcuts: pwaSettings.shortcuts.map((s) => ({
            name: s.name,
            short_name: s.shortName.slice(0, 12),
            url: s.url,
            description: s.description,
          })),
        }
      : {}),
  };
}

export function validateTableCandidate(
  candidate: {
    number: string;
    area: string;
    capacity: number;
    waiterName: string;
    qrCodeNumber: string;
  },
  existingTables: Array<{ id: string; number: string; qrCodeNumber: string }>,
  editingId?: string | null
): { valid: boolean; error?: string } {
  if (!candidate.number.trim()) {
    return { valid: false, error: 'Masa adı veya numarası boş bırakılamaz.' };
  }
  if (!candidate.qrCodeNumber.trim()) {
    return { valid: false, error: 'QR Masa Kodu boş bırakılamaz (Örn: QR-MASA-09).' };
  }
  if (!Number.isFinite(candidate.capacity) || candidate.capacity < 1 || candidate.capacity > 30) {
    return { valid: false, error: 'Masa kapasitesi 1 ile 30 kişi arasında olmalıdır.' };
  }
  const normalizedQr = candidate.qrCodeNumber.trim().toUpperCase();
  const normalizedNumber = candidate.number.trim().toLocaleLowerCase('tr-TR');
  for (const tbl of existingTables) {
    if (editingId && tbl.id === editingId) continue;
    if (tbl.qrCodeNumber.trim().toUpperCase() === normalizedQr) {
      return { valid: false, error: `Bu QR kodu (${normalizedQr}) başka bir masaya atanmış.` };
    }
    if (tbl.number.trim().toLocaleLowerCase('tr-TR') === normalizedNumber) {
      return { valid: false, error: `"${candidate.number.trim()}" isimli masa zaten kayıtlı.` };
    }
  }
  return { valid: true };
}

export interface OrderFilterCriteria {
  categoryIds: string[];
  waiterNames: string[];
  channels: string[];
  searchQuery?: string;
}

export interface SavedOrderFilterPreset {
  id: string;
  label: string;
  criteria: OrderFilterCriteria;
  isBuiltIn?: boolean;
}

export const DEFAULT_ORDER_FILTER_PRESETS: SavedOrderFilterPreset[] = [
  {
    id: 'PRESET-ALL',
    label: 'Tümü',
    criteria: { categoryIds: [], waiterNames: [], channels: [] },
    isBuiltIn: true,
  },
  {
    id: 'PRESET-QR',
    label: 'QR Masa Siparişleri',
    criteria: { categoryIds: [], waiterNames: [], channels: ['QR'] },
    isBuiltIn: true,
  },
  {
    id: 'PRESET-PAKET',
    label: 'Paket & Gel-Al',
    criteria: { categoryIds: [], waiterNames: [], channels: ['Paket servis', 'Gel-Al'] },
    isBuiltIn: true,
  },
  {
    id: 'PRESET-MURAT',
    label: 'Murat Demir · Salon',
    criteria: { categoryIds: [], waiterNames: ['Murat Demir'], channels: ['QR', 'Garson'] },
    isBuiltIn: true,
  },
  {
    id: 'PRESET-CIGER-KEBAP',
    label: 'Ciğer & Kebap Kalemleri',
    criteria: { categoryIds: ['CAT-01', 'CAT-02'], waiterNames: [], channels: [] },
    isBuiltIn: true,
  },
];

export interface FilterableOrderLike {
  id: string;
  orderNumber: string;
  channel: string;
  tableName: string;
  customerName: string;
  staffName: string;
  items: Array<{ productId: string; productName: string }>;
}

export interface FilterableProductLike {
  id: string;
  categoryId: string;
}

export function filterOrdersByMultiCriteria<T extends FilterableOrderLike>(
  orders: T[],
  products: FilterableProductLike[],
  criteria: OrderFilterCriteria
): T[] {
  const categoryByProductId = new Map<string, string>();
  for (const p of products) {
    categoryByProductId.set(p.id, p.categoryId);
  }

  const hasCatFilter = criteria.categoryIds.length > 0;
  const hasWaiterFilter = criteria.waiterNames.length > 0;
  const hasChannelFilter = criteria.channels.length > 0;
  const query = (criteria.searchQuery || '').trim().toLocaleLowerCase('tr-TR');

  return orders.filter((order) => {
    if (hasChannelFilter && !criteria.channels.includes(order.channel)) {
      return false;
    }
    if (hasWaiterFilter && !criteria.waiterNames.includes(order.staffName)) {
      return false;
    }
    if (hasCatFilter) {
      const hasMatchingCategoryItem = order.items.some((item) => {
        const catId = categoryByProductId.get(item.productId);
        return Boolean(catId && criteria.categoryIds.includes(catId));
      });
      if (!hasMatchingCategoryItem) return false;
    }
    if (query) {
      const haystacks = [
        order.orderNumber,
        order.customerName,
        order.tableName,
        order.staffName,
        order.channel,
        ...order.items.map((it) => it.productName),
      ];
      const matchesQuery = haystacks.some((h) => h.toLocaleLowerCase('tr-TR').includes(query));
      if (!matchesQuery) return false;
    }
    return true;
  });
}

export function resolveCustomerOrderPaymentIntent(params: {
  payNow?: boolean;
  paymentMethod?: string;
  paymentType?: 'cash' | 'pos' | 'online_card' | 'meal_card' | 'transfer' | 'wallet';
  finalTotal: number;
  orderNumber: string;
}): {
  isPaidNow: boolean;
  paymentStatus: 'Ödendi' | 'Ödenmedi';
  paidAmount: number;
  tableBalanceDelta: number;
  paymentMethodLabel: string;
  receiptNumber?: string;
  eInvoiceNo?: string;
} {
  const method = (params.paymentMethod || 'POS Cihazı ile Kart').trim();
  const isNonInstantByType =
    params.paymentType !== undefined
      ? params.paymentType !== 'online_card' && params.paymentType !== 'wallet'
      : /havale|eft|nakit|pos cihaz|kasada|kapıda|masada|yemek kart/i.test(method);
  const isInstantEligible =
    params.paymentType !== undefined
      ? params.paymentType === 'online_card' || params.paymentType === 'wallet'
      : /online kart|3d secure|iyzico|paytr|dijital cüzdan|apple|google pay/i.test(method);
  const isPaidNow = Boolean(params.payNow) && isInstantEligible && !isNonInstantByType;

  if (isPaidNow) {
    const docs = generateReceiptAndInvoiceNumbers(params.orderNumber);
    return {
      isPaidNow: true,
      paymentStatus: 'Ödendi',
      paidAmount: roundCurrency(params.finalTotal),
      tableBalanceDelta: 0,
      paymentMethodLabel: method,
      receiptNumber: docs.receiptNumber,
      eInvoiceNo: docs.eInvoiceNo,
    };
  }

  return {
    isPaidNow: false,
    paymentStatus: 'Ödenmedi',
    paidAmount: 0,
    tableBalanceDelta: roundCurrency(params.finalTotal),
    paymentMethodLabel: method,
  };
}

export function canRequestBillForContext(params: {
  tableOpenBalance?: number;
  unpaidOrdersCount: number;
  unpaidOrdersTotal?: number;
}): {
  allowed: boolean;
  totalOpenAmount: number;
  reason?: string;
} {
  const totalOpenAmount = roundCurrency(
    Math.max(0, Number(params.tableOpenBalance) || 0, Number(params.unpaidOrdersTotal) || 0)
  );
  const allowed = (params.unpaidOrdersCount || 0) > 0 || totalOpenAmount > 0;
  if (!allowed) {
    return {
      allowed: false,
      totalOpenAmount: 0,
      reason: 'Açık veya ödenmemiş hesabınız bulunmuyor. Hesap istemek için önce sipariş veriniz.',
    };
  }
  return {
    allowed: true,
    totalOpenAmount,
  };
}

/**
 * Reçete Malzeme Satırı Ekleme / Güncelleme (Upsert) ve Silme Yardımcıları
 */
export function upsertProductRecipeLine(
  existingLines: RecipeIngredientLine[],
  candidate: RecipeIngredientLine
): RecipeIngredientLine[] {
  const cleanQty = roundQuantity(Math.max(0.001, Number(candidate.quantity) || 0.001));
  const cleanCost = roundCurrency(Math.max(0, Number(candidate.unitCost) || 0));
  const normalized: RecipeIngredientLine = {
    ingredientId: candidate.ingredientId.trim() || `ING-${Date.now()}`,
    ingredientName: candidate.ingredientName.trim() || 'Hammadde',
    quantity: cleanQty,
    unit: candidate.unit || 'kg',
    unitCost: cleanCost,
  };

  const idx = existingLines.findIndex((l) => l.ingredientId === normalized.ingredientId);
  if (idx >= 0) {
    return existingLines.map((l, i) => (i === idx ? normalized : l));
  }
  return [...existingLines, normalized];
}

export function removeProductRecipeLine(
  existingLines: RecipeIngredientLine[],
  ingredientId: string
): RecipeIngredientLine[] {
  return existingLines.filter((l) => l.ingredientId !== ingredientId);
}

/**
 * Eklenti JSON Konfigürasyon Doğrulayıcı
 */
export function validatePluginJsonConfig(rawJson: string): {
  valid: boolean;
  settings?: Record<string, string | number | boolean>;
  parsed?: Record<string, string | number | boolean>;
  error?: string;
} {
  try {
    const parsed = JSON.parse(rawJson);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {
        valid: false,
        error: 'JSON konfigürasyonu geçerli bir nesne ({ "anahtar": "değer" }) olmalıdır.',
      };
    }
    const sanitized: Record<string, string | number | boolean> = {};
    for (const [key, val] of Object.entries(parsed)) {
      const cleanKey = key.trim();
      if (!cleanKey) continue;
      if (typeof val === 'boolean' || typeof val === 'number' || typeof val === 'string') {
        sanitized[cleanKey] = val;
      } else if (val === null || val === undefined) {
        sanitized[cleanKey] = '';
      } else {
        sanitized[cleanKey] = JSON.stringify(val);
      }
    }
    return { valid: true, settings: sanitized, parsed: sanitized };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? `JSON Sözdizimi Hatası: ${err.message}` : 'Geçersiz JSON formatı.',
    };
  }
}

/**
 * POS Kasa Real-Time 'Fiş Önizleme' Simülasyon Oluşturucusu (Tahsilat Öncesi Canlı Termal Fiş)
 */
export interface SimulatedPosCartItemInput {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  station?: 'Izgara' | 'Tavuk' | 'Soğuk mutfak' | 'İçecek' | 'Paketleme';
}

export function buildSimulatedPosOrderForPreview(params: {
  tableId: string;
  tableName: string;
  staffName: string;
  paymentMethodLabel: string;
  discountPercent: number;
  taxRatePercent?: number;
  cartItems: SimulatedPosCartItemInput[];
  activeOrder?: {
    id: string;
    orderNumber: string;
    idempotencyKey?: string;
    channel:
      | 'QR'
      | 'Garson'
      | 'Kasa'
      | 'Gel-Al'
      | 'Telefon'
      | 'Web sitesi'
      | 'Paket servis'
      | 'Rezervasyon bağlantılı sipariş';
    customerName: string;
    customerPhone: string;
    items: Array<{
      id: string;
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      station: 'Izgara' | 'Tavuk' | 'Soğuk mutfak' | 'İçecek' | 'Paketleme';
      options: { name: string; value: string; extraPrice: number }[];
      customerNote: string;
      isComplimentary: boolean;
      isReady: boolean;
      selectedOptions?: string[];
    }>;
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
    paidAmount: number;
    paymentStatus: 'Ödenmedi' | 'Kısmi Ödendi' | 'Ödendi' | 'İade Edildi';
    paymentMethod?: string;
    createdAt: string;
    receiptNumber?: string;
    eInvoiceNo?: string;
  } | null;
}) {
  const taxRate = typeof params.taxRatePercent === 'number' ? Math.max(0, params.taxRatePercent) : 10;

  if (params.cartItems.length > 0) {
    const subtotal = roundCurrency(
      params.cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    );
    const discountAmount = roundCurrency(subtotal * (Math.max(0, Math.min(50, params.discountPercent)) / 100));
    const discountedSubtotal = roundCurrency(Math.max(0, subtotal - discountAmount));
    const taxAmount = roundCurrency(discountedSubtotal * (taxRate / 100));
    const totalAmount = roundCurrency(discountedSubtotal + taxAmount);
    const orderNumber = params.activeOrder?.orderNumber || 'OZT-ONIZLEME';
    const docs = generateReceiptAndInvoiceNumbers(orderNumber);

    return {
      id: params.activeOrder?.id || 'PREVIEW-POS-DRAFT',
      orderNumber,
      idempotencyKey: params.activeOrder?.idempotencyKey || 'POS-PREVIEW-DRAFT',
      channel: 'Kasa' as const,
      tableId: params.tableId,
      tableName: params.tableName,
      customerName: params.activeOrder?.customerName || `${params.tableName} Misafiri`,
      customerPhone: params.activeOrder?.customerPhone || '-',
      items: params.cartItems.map((it, idx) => ({
        id: `PRV-IT-${idx + 1}`,
        productId: it.productId,
        productName: it.productName,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        station: it.station || ('Izgara' as const),
        options: [],
        customerNote: '',
        isComplimentary: it.unitPrice === 0,
        isReady: false,
      })),
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      paidAmount: 0,
      paymentStatus: 'Ödenmedi' as const,
      paymentMethod: params.paymentMethodLabel,
      status: 'Yeni' as const,
      createdAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      elapsedMinutes: 0,
      prepTimeMinutes: 14,
      slaMinutes: 14,
      staffName: params.staffName,
      notes: 'Tahsilat Öncesi Canlı POS Fiş Önizlemesi',
      branchId: 'BR-01',
      history: [],
      receiptNumber: docs.receiptNumber,
      eInvoiceNo: docs.eInvoiceNo,
      autoReceiptIssued: false,
    };
  }

  if (params.activeOrder) {
    const baseSub = params.activeOrder.subtotal;
    const extraDisc =
      params.discountPercent > 0
        ? roundCurrency(baseSub * (Math.min(50, params.discountPercent) / 100))
        : params.activeOrder.discountAmount;
    const afterDisc = roundCurrency(Math.max(0, baseSub - extraDisc));
    const taxAmt = roundCurrency(afterDisc * (taxRate / 100));
    const totalAmt = roundCurrency(afterDisc + taxAmt);
    const docs =
      params.activeOrder.receiptNumber && params.activeOrder.eInvoiceNo
        ? {
            receiptNumber: params.activeOrder.receiptNumber,
            eInvoiceNo: params.activeOrder.eInvoiceNo,
          }
        : generateReceiptAndInvoiceNumbers(params.activeOrder.orderNumber);

    return {
      id: params.activeOrder.id,
      orderNumber: params.activeOrder.orderNumber,
      idempotencyKey: params.activeOrder.idempotencyKey || `POS-PREVIEW-${params.activeOrder.id}`,
      channel: params.activeOrder.channel || ('Kasa' as const),
      tableId: params.tableId,
      tableName: params.tableName,
      customerName: params.activeOrder.customerName,
      customerPhone: params.activeOrder.customerPhone,
      items: params.activeOrder.items,
      subtotal: baseSub,
      discountAmount: extraDisc,
      taxAmount: taxAmt,
      totalAmount: totalAmt,
      paidAmount: params.activeOrder.paidAmount,
      paymentStatus: params.activeOrder.paymentStatus,
      paymentMethod: params.paymentMethodLabel || params.activeOrder.paymentMethod,
      status: 'Hazırlanıyor' as const,
      createdAt: params.activeOrder.createdAt,
      elapsedMinutes: 5,
      prepTimeMinutes: 14,
      slaMinutes: 14,
      staffName: params.staffName,
      notes: 'Açık Masa Adisyonu · Tahsilat Öncesi Fiş Önizlemesi',
      branchId: 'BR-01',
      history: [],
      receiptNumber: docs.receiptNumber,
      eInvoiceNo: docs.eInvoiceNo,
      autoReceiptIssued: true,
    };
  }

  return {
    id: 'PREVIEW-SAMPLE',
    orderNumber: 'OZT-2026-ONIZLEME',
    idempotencyKey: 'POS-SAMPLE-PREVIEW',
    channel: 'Kasa' as const,
    tableId: params.tableId,
    tableName: params.tableName,
    customerName: `${params.tableName} (Örnek Önizleme)`,
    customerPhone: '-',
    items: [
      {
        id: 'SMP-1',
        productId: 'PRD-01',
        productName: 'Geleneksel Ciğer Şiş Porsiyon',
        quantity: 1,
        unitPrice: 440,
        station: 'Izgara' as const,
        options: [],
        customerNote: '',
        isComplimentary: false,
        isReady: true,
      },
      {
        id: 'SMP-2',
        productId: 'PRD-08',
        productName: 'Yayık Bakır Ayran',
        quantity: 1,
        unitPrice: 55,
        station: 'İçecek' as const,
        options: [],
        customerNote: '',
        isComplimentary: false,
        isReady: true,
      },
    ],
    subtotal: 495,
    discountAmount: 0,
    taxAmount: 49.5,
    totalAmount: 544.5,
    paidAmount: 0,
    paymentStatus: 'Ödenmedi' as const,
    paymentMethod: params.paymentMethodLabel,
    status: 'Yeni' as const,
    createdAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    elapsedMinutes: 0,
    prepTimeMinutes: 14,
    slaMinutes: 14,
    staffName: params.staffName,
    notes: 'Termal Fiş Şablonu Canlı Önizleme',
    branchId: 'BR-01',
    history: [],
    receiptNumber: 'FIS-2026-000001',
    eInvoiceNo: 'OZT2026000000001',
    autoReceiptIssued: false,
  };
}

export interface SeoHealthCheckItem {
  id: string;
  label: string;
  passed: boolean;
  points: number;
  hint: string;
}

export function calculateSeoHealthScore(seo: {
  metaTitleTr: string;
  metaDescriptionTr: string;
  keywords: string;
  canonicalUrl: string;
  ogImageUrl: string;
  robots: string;
  schemaType: string;
  servesCuisine?: string;
  geoRegion?: string;
  sitemapXml?: string;
  robotsTxt?: string;
}): { score: number; grade: 'Mükemmel' | 'İyi' | 'Geliştirilmeli'; checks: SeoHealthCheckItem[] } {
  const titleLen = (seo.metaTitleTr || '').trim().length;
  const descLen = (seo.metaDescriptionTr || '').trim().length;
  const kwCount = (seo.keywords || '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean).length;

  const checks: SeoHealthCheckItem[] = [
    {
      id: 'title',
      label: `TR Başlık Uzunluğu (${titleLen}/60 karakter)`,
      passed: titleLen >= 25 && titleLen <= 68,
      points: 20,
      hint: 'İdeal Google başlık uzunluğu 30-65 karakter arasıdır.',
    },
    {
      id: 'desc',
      label: `Meta Açıklama (${descLen}/160 karakter)`,
      passed: descLen >= 80 && descLen <= 170,
      points: 20,
      hint: 'Meta description 90-160 karakter olduğunda tıklama oranı artar.',
    },
    {
      id: 'keywords',
      label: `Anahtar Kelimeler (${kwCount} etiket)`,
      passed: kwCount >= 4,
      points: 10,
      hint: 'En az 4-8 yerel ve ürün odaklı anahtar kelime tanımlayın.',
    },
    {
      id: 'canonical',
      label: 'HTTPS Canonical URL Tanımı',
      passed: /^https?:\/\/.+/.test((seo.canonicalUrl || '').trim()),
      points: 15,
      hint: 'Kopya içerik riskini önlemek için https:// tam domain girin.',
    },
    {
      id: 'og',
      label: 'Sosyal Medya (OpenGraph) Görseli',
      passed: Boolean((seo.ogImageUrl || '').trim()),
      points: 10,
      hint: 'WhatsApp, Facebook ve X paylaşımları için 1200x630 görsel ekleyin.',
    },
    {
      id: 'schema',
      label: 'Schema.org Yapısal Veri (JSON-LD)',
      passed: Boolean(seo.schemaType && (seo.servesCuisine || seo.geoRegion)),
      points: 15,
      hint: 'Mutfak türü ve Geo koordinat bilgisi zengin arama sonuçlarını açar.',
    },
    {
      id: 'crawl',
      label: 'Sitemap.xml & Robots.txt Dosyaları',
      passed: Boolean((seo.sitemapXml || '').includes('<urlset') && (seo.robotsTxt || '').includes('User-agent')),
      points: 10,
      hint: 'Arama motoru tarama kuralları ve site haritası eksiksiz olmalıdır.',
    },
  ];

  const score = checks.reduce((sum, ch) => sum + (ch.passed ? ch.points : 0), 0);
  const grade = score >= 85 ? 'Mükemmel' : score >= 65 ? 'İyi' : 'Geliştirilmeli';
  return { score, grade, checks };
}

export function buildRestaurantJsonLd(params: {
  brandTitle: string;
  seo: {
    metaDescriptionTr: string;
    canonicalUrl: string;
    ogImageUrl: string;
    schemaType: string;
    servesCuisine?: string;
    priceRange?: string;
    openingHoursSpec?: string;
    telephone?: string;
    postalCode?: string;
    acceptsReservations?: boolean;
    ratingValue?: number;
    reviewCount?: number;
    geoPosition?: string;
  };
  address: string;
  phone: string;
}): string {
  const baseUrl = (params.seo.canonicalUrl || 'https://oztikeciger.com.tr').replace(/\/+$/, '');
  const imgUrl = params.seo.ogImageUrl?.startsWith('http')
    ? params.seo.ogImageUrl
    : `${baseUrl}${params.seo.ogImageUrl || '/assets/aistudio/crops/branded-ocakbasi.jpg'}`;
  const [latStr, lngStr] = (params.seo.geoPosition || '37.0628;37.3795').split(';');

  const schemaObj: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': params.seo.schemaType || 'Restaurant',
    name: params.brandTitle,
    description: params.seo.metaDescriptionTr,
    url: baseUrl,
    image: imgUrl,
    telephone: params.seo.telephone || params.phone,
    servesCuisine: params.seo.servesCuisine || 'Turkish, Gaziantep Ocakbaşı',
    priceRange: params.seo.priceRange || '₺₺',
    openingHours: params.seo.openingHoursSpec || 'Mo-Su 11:00-24:00',
    acceptsReservations: params.seo.acceptsReservations !== false,
    address: {
      '@type': 'PostalAddress',
      streetAddress: params.address,
      addressLocality: 'Şahinbey',
      addressRegion: 'Gaziantep',
      postalCode: params.seo.postalCode || '27010',
      addressCountry: 'TR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: Number(latStr) || 37.0628,
      longitude: Number(lngStr) || 37.3795,
    },
  };

  if (params.seo.ratingValue && params.seo.reviewCount) {
    schemaObj.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(params.seo.ratingValue),
      reviewCount: String(params.seo.reviewCount),
      bestRating: '5',
    };
  }

  return JSON.stringify(schemaObj, null, 2);
}

export function buildFullSitemapXml(params: {
  canonicalUrl: string;
  categorySlugs: string[];
  pageSlugs: string[];
  lastModDate?: string;
}): string {
  const base = (params.canonicalUrl || 'https://oztikeciger.com.tr').replace(/\/+$/, '');
  const lastMod = params.lastModDate || new Date().toISOString().slice(0, 10);
  const urls: Array<{ loc: string; priority: string; changefreq: string }> = [
    { loc: `${base}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${base}/#menu`, priority: '0.9', changefreq: 'daily' },
    { loc: `${base}/#galeri`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${base}/#kampanyalar`, priority: '0.8', changefreq: 'weekly' },
    { loc: `${base}/#konum`, priority: '0.8', changefreq: 'monthly' },
  ];

  params.categorySlugs.forEach((slug) => {
    if (slug.trim()) {
      urls.push({
        loc: `${base}/#kategori-${slug.replace(/^\/+/, '')}`,
        priority: '0.7',
        changefreq: 'weekly',
      });
    }
  });
  params.pageSlugs.forEach((slug) => {
    if (slug.trim()) {
      const normalized = slug.startsWith('/') ? slug : `/${slug}`;
      urls.push({
        loc: `${base}${normalized}`,
        priority: '0.6',
        changefreq: 'monthly',
      });
    }
  });

  const rows = urls
    .map(
      (u) =>
        `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>`;
}

export function buildRobotsTxt(canonicalUrl: string, allowIndexing = true): string {
  const base = (canonicalUrl || 'https://oztikeciger.com.tr').replace(/\/+$/, '');
  if (!allowIndexing) {
    return `User-agent: *\nDisallow: /\n\nSitemap: ${base}/sitemap.xml`;
  }
  return `User-agent: *\nAllow: /\nDisallow: /?portal=admin\nDisallow: /install.php\nDisallow: /pos\nDisallow: /kds\n\nSitemap: ${base}/sitemap.xml`;
}




