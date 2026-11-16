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
  providedToken: string,
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
  if (!qrRecord || qrRecord.token !== providedToken) {
    return {
      valid: false,
      error: 'Geçersiz masa QR anahtarı. Lütfen masadaki güncel QR kodu okutun.',
    };
  }
  if (qrRecord.isRevoked) {
    return {
      valid: false,
      error: 'Bu QR kod iptal edilmiş veya yenilenmiştir. Lütfen personelden destek isteyin.',
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
  providedToken: string;
  tableArea: string;
  qrCodeNumber: string;
  assignedWaiter: string;
  selectedNeeds: string[];
  customNote: string;
  timestamp: string;
  calculatedBillAmount?: number;
}): { valid: boolean; error?: string; callRecord?: WaiterServiceCallRecord } {
  if (!params.qrRecord || params.qrRecord.token !== params.providedToken) {
    return {
      valid: false,
      error: 'Geçersiz masa QR kodu. Lütfen masanızın üzerindeki numaralı QR kodu okutun.',
    };
  }
  if (params.qrRecord.isRevoked) {
    return {
      valid: false,
      error: 'Bu masanın QR kodu güvenlik nedeniyle yenilenmiştir. Lütfen güncel QR kodu okutun.',
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
      qrToken: params.providedToken,
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
  feature: 'QR' | 'Gel-Al' | 'Paket servis' | 'waiter_call'
): { allowed: boolean; reason?: string } {
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

