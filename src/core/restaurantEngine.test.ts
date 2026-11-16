import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRecipeMetrics,
  applyRecipeStockChange,
  validateQROrderRequest,
  calculateSplitBill,
  checkReservationConflict,
  calculateCashDiscrepancy,
  createWaiterServiceCall,
  calculateCampaignDiscount,
  calculateCustomerCheckoutTotals,
  canAccessQrProtectedFeature,
  getOrderProgressStep,
  generateReceiptAndInvoiceNumbers,
  formatWaiterDrinkQuantities,
  calculateTableOpenBill,
  isBillRequestNeeds,
  buildArchiveEntry,
  shouldTriggerAutoEndOfDayArchive,
  buildMapNavigationUrls,
  type StockItem,
  type RecipeIngredientLine,
} from './restaurantEngine';

test('calculateRecipeMetrics computes material cost, waste allowance, gross profit, and margin accurately', () => {
  const lines: RecipeIngredientLine[] = [
    {
      ingredientId: 'ING-1',
      ingredientName: 'Taze Kuzu Ciğeri',
      quantity: 0.22, // 220 gr
      unit: 'kg',
      unitCost: 620, // 620 TL / kg -> 136.40 TL
    },
    {
      ingredientId: 'ING-2',
      ingredientName: 'Kuyruk Yağı',
      quantity: 0.04, // 40 gr
      unit: 'kg',
      unitCost: 450, // 450 TL / kg -> 18.00 TL
    },
  ];

  // Material = 136.40 + 18.00 = 154.40 TL
  // Waste 5% = 7.72 TL -> Total Recipe Cost = 162.12 TL
  // Selling Price = 440 TL -> Gross Profit = 277.88 TL
  const metrics = calculateRecipeMetrics(lines, 5, 440);
  assert.equal(metrics.materialCost, 154.4);
  assert.equal(metrics.wasteCost, 7.72);
  assert.equal(metrics.totalRecipeCost, 162.12);
  assert.equal(metrics.grossProfit, 277.88);
  assert.equal(metrics.profitMarginPercent, 63.15);
});

test('applyRecipeStockChange deducts stock and appends immutable reversal on cancellation without deleting movements', () => {
  const initialStocks: StockItem[] = [
    {
      id: 'ING-1',
      sku: 'STK-CGR-01',
      name: 'Taze Kuzu Ciğeri',
      category: 'Et ve sakatat',
      unit: 'kg',
      currentStock: 20,
      minStockThreshold: 8,
      unitCost: 620,
      supplierId: 'SUP-1',
      supplierName: 'Trakya Besi Çiftliği',
      lotNumber: 'LOT-2026-11A',
      expiryDate: '2026-11-20',
      warehouse: 'Ana Soğuk Hava Deposu',
    },
  ];
  const recipe: RecipeIngredientLine[] = [
    {
      ingredientId: 'ING-1',
      ingredientName: 'Taze Kuzu Ciğeri',
      quantity: 0.25,
      unit: 'kg',
      unitCost: 620,
    },
  ];

  // Deduct 2 portions (0.5 kg)
  const deducted = applyRecipeStockChange(
    initialStocks,
    [],
    recipe,
    2,
    'deduct',
    'ORD-1001',
    'Ahmet Usta',
    '2026-11-16T12:00:00Z'
  );
  assert.equal(deducted.updatedStocks[0].currentStock, 19.5);
  assert.equal(deducted.newMovements.length, 1);
  assert.equal(deducted.newMovements[0].movementType, 'recipe_deduction');
  assert.equal(deducted.newMovements[0].quantityDelta, -0.5);

  // Reverse on cancellation: must keep original movement and append a reversal movement
  const reversed = applyRecipeStockChange(
    deducted.updatedStocks,
    deducted.newMovements,
    recipe,
    2,
    'reverse',
    'ORD-1001',
    'Mehmet Müdür',
    '2026-11-16T12:05:00Z'
  );
  assert.equal(reversed.updatedStocks[0].currentStock, 20);
  assert.equal(reversed.newMovements.length, 2);
  assert.equal(reversed.newMovements[0].movementType, 'reversal');
  assert.equal(reversed.newMovements[0].quantityDelta, 0.5);
  assert.equal(reversed.newMovements[1].movementType, 'recipe_deduction');
});

test('validateQROrderRequest blocks offline orders, revoked tokens, and duplicate idempotency keys', () => {
  const activeQr = {
    tableId: 'TBL-1',
    tableNumber: 'Salon 1',
    token: 'OZT-QR-9f8a7b6c',
    isRevoked: false,
    requestsLastMinute: 2,
    rateLimitPerMin: 20,
  };

  assert.equal(
    validateQROrderRequest(activeQr, 'OZT-QR-9f8a7b6c', 'IDEMP-1', [], false).valid,
    false
  );
  assert.equal(
    validateQROrderRequest(activeQr, 'WRONG-TOKEN', 'IDEMP-1', [], true).valid,
    false
  );
  assert.equal(
    validateQROrderRequest(activeQr, 'OZT-QR-9f8a7b6c', 'IDEMP-1', ['IDEMP-1'], true).valid,
    false
  );
  assert.equal(
    validateQROrderRequest(activeQr, 'OZT-QR-9f8a7b6c', 'IDEMP-2', ['IDEMP-1'], true).valid,
    true
  );
});

test('calculateSplitBill and checkReservationConflict and calculateCashDiscrepancy enforce financial & booking accuracy', () => {
  const split = calculateSplitBill(1200, 300, 3);
  assert.equal(split.remainingAmount, 900);
  assert.equal(split.perPersonShare, 300);
  assert.equal(split.paymentStatus, 'partial');

  const conflictCheck = checkReservationConflict(
    [
      {
        id: 'RES-1',
        customerName: 'Selin Kaya',
        customerPhone: '0532 555 11 22',
        guestCount: 4,
        date: '2026-11-16',
        time: '19:30',
        tableId: 'TBL-4',
        tableNumber: 'Salon 4',
        status: 'confirmed',
        depositAmount: 500,
        depositPaid: true,
        specialRequests: 'Cam kenarı',
        source: 'online',
      },
    ],
    { tableId: 'TBL-4', date: '2026-11-16', time: '20:15' }
  );
  assert.equal(conflictCheck.hasConflict, true);

  const cashClose = calculateCashDiscrepancy({
    openingBalance: 2500,
    cashSales: 14200,
    cashIn: 500,
    cashOut: 1200,
    cashRefunds: 400,
    actualCountedCash: 15550,
  });
  // Expected: 2500 + 14200 + 500 - 1200 - 400 = 15600
  assert.equal(cashClose.expectedClosingBalance, 15600);
  assert.equal(cashClose.discrepancyAmount, -50);
  assert.equal(cashClose.status, 'shortage');
});

test('createWaiterServiceCall validates numbered table QR and binds service items to assigned waiter', () => {
  const tableQr = {
    tableId: 'TBL-04',
    tableNumber: 'Masa 04 · Bahçe 1',
    token: 'OZT-QR-1D4B8F77',
    isRevoked: false,
    requestsLastMinute: 1,
    rateLimitPerMin: 20,
  };

  // Fails if no service needs or note selected
  const emptyCall = createWaiterServiceCall({
    qrRecord: tableQr,
    providedToken: 'OZT-QR-1D4B8F77',
    tableArea: 'Taş Bahçe',
    qrCodeNumber: 'QR-MASA-04',
    assignedWaiter: 'Elif Yılmaz',
    selectedNeeds: [],
    customNote: '',
    timestamp: '14:20',
  });
  assert.equal(emptyCall.valid, false);

  // Succeeds when service items like Peçete, Çatal/Kaşık, Tuz, Masa Temizliği are selected
  const validCall = createWaiterServiceCall({
    qrRecord: tableQr,
    providedToken: 'OZT-QR-1D4B8F77',
    tableArea: 'Taş Bahçe',
    qrCodeNumber: 'QR-MASA-04',
    assignedWaiter: 'Elif Yılmaz',
    selectedNeeds: [
      'Peçete & Islak Mendil',
      'Çatal / Kaşık / Bıçak Takımı',
      'Tuz / Karabiber / Sumak / Pul Biber',
      'Masa Temizliği & Boşların Alınması',
    ],
    customNote: 'Lavaş sıcak olursa seviniriz',
    timestamp: '14:22',
  });
  assert.equal(validCall.valid, true);
  assert.equal(validCall.callRecord?.tableNumber, 'Masa 04 · Bahçe 1');
  assert.equal(validCall.callRecord?.qrCodeNumber, 'QR-MASA-04');
  assert.equal(validCall.callRecord?.assignedWaiter, 'Elif Yılmaz');
  assert.equal(validCall.callRecord?.selectedNeeds.length, 4);
});

test('calculateCampaignDiscount applies percentage and fixed discounts when minimum order is met', () => {
  const pct = calculateCampaignDiscount({
    subtotal: 1000,
    discountType: 'Yüzde indirim',
    discountValue: 15,
    minOrderAmount: 600,
    isActive: true,
  });
  assert.equal(pct.applicable, true);
  assert.equal(pct.discountAmount, 150);
  assert.equal(pct.finalTotal, 850);

  const belowMin = calculateCampaignDiscount({
    subtotal: 400,
    discountType: 'Sabit tutar indirimi',
    discountValue: 100,
    minOrderAmount: 500,
    isActive: true,
  });
  assert.equal(belowMin.applicable, false);
  assert.equal(belowMin.discountAmount, 0);
});

test('calculateCustomerCheckoutTotals adds KDV tax, courier delivery fee, percentage/custom tip, and clamps discounts accurately', () => {
  const pctTip = calculateCustomerCheckoutTotals({
    subtotal: 1000,
    discountAmount: 100,
    taxRatePercent: 10,
    deliveryFee: 35,
    tipPercent: 10,
  });
  assert.equal(pctTip.discountedSubtotal, 900);
  assert.equal(pctTip.taxAmount, 90);
  assert.equal(pctTip.deliveryFee, 35);
  assert.equal(pctTip.tipAmount, 90);
  assert.equal(pctTip.finalTotal, 1115);

  const customTip = calculateCustomerCheckoutTotals({
    subtotal: 500,
    discountAmount: 600,
    taxRatePercent: 10,
    customTipAmount: 45,
  });
  assert.equal(customTip.discountedSubtotal, 0);
  assert.equal(customTip.taxAmount, 0);
  assert.equal(customTip.deliveryFee, 0);
  assert.equal(customTip.tipAmount, 45);
  assert.equal(customTip.finalTotal, 45);

  const formattedDrinks = formatWaiterDrinkQuantities({
    'Sıcak Çay': 3,
    'Soda / Maden Suyu': 2,
    'Türk Kahvesi': 0,
  });
  assert.deepEqual(formattedDrinks, ['Sıcak Çay x3', 'Soda / Maden Suyu x2']);
});

test('canAccessQrProtectedFeature enforces QR verification for table orders and waiter calls while allowing delivery/pickup', () => {
  assert.equal(canAccessQrProtectedFeature(null, 'QR').allowed, false);
  assert.equal(canAccessQrProtectedFeature(null, 'waiter_call').allowed, false);
  assert.equal(canAccessQrProtectedFeature(null, 'Paket servis').allowed, true);
  assert.equal(canAccessQrProtectedFeature(null, 'Gel-Al').allowed, true);
  assert.equal(canAccessQrProtectedFeature('TBL-02', 'QR').allowed, true);
  assert.equal(canAccessQrProtectedFeature('TBL-02', 'waiter_call').allowed, true);
});

test('getOrderProgressStep and generateReceiptAndInvoiceNumbers return valid tracking stages and document numbers', () => {
  const courierTrack = getOrderProgressStep('Hazırlanıyor', 'Paket servis', 'Yolda');
  assert.equal(courierTrack.stepIndex, 3);
  assert.equal(courierTrack.totalSteps, 5);

  const tableTrack = getOrderProgressStep('Hazır', 'QR');
  assert.equal(tableTrack.stepIndex, 3);

  const docs = generateReceiptAndInvoiceNumbers('OZT-2026-1045');
  assert.match(docs.receiptNumber, /^FIS-\d{4}-261045$|^FIS-\d{4}-001045$/);
  assert.match(docs.eInvoiceNo, /^OZT\d{4}000/);
});

test('calculateTableOpenBill sums unpaid non-cancelled orders and reconciles with tableOpenBalance', () => {
  const bill = calculateTableOpenBill(400, [
    { status: 'Servis edildi', totalAmount: 650, paidAmount: 200 }, // 450 unpaid
    { status: 'Hazırlanıyor', totalAmount: 300, paidAmount: 0 }, // 300 unpaid -> 750 total
    { status: 'İptal edildi', totalAmount: 500, paidAmount: 0 }, // excluded
  ]);
  assert.equal(bill, 750);

  const fallbackBill = calculateTableOpenBill(520.5, [
    { status: 'Tamamlandı', totalAmount: 300, paidAmount: 300 },
  ]);
  assert.equal(fallbackBill, 520.5);
});

test('isBillRequestNeeds detects Turkish and multilingual bill request keywords and createWaiterServiceCall stores calculatedBillAmount', () => {
  assert.equal(isBillRequestNeeds(['Peçete & Islak Mendil'], ''), false);
  assert.equal(isBillRequestNeeds(['Hesap Pusulası (Nakit Ödeme)'], ''), true);
  assert.equal(isBillRequestNeeds(['Masaya Mobil POS Cihazı (Kartla Ödeme)'], ''), true);
  assert.equal(isBillRequestNeeds(['Alman Usulü (Kişi Başı Ayrı) Hesap'], ''), true);
  assert.equal(isBillRequestNeeds([], 'Lütfen hesabı getirir misiniz?'), true);
  assert.equal(isBillRequestNeeds(['w-hesap'], ''), true);

  const call = createWaiterServiceCall({
    qrRecord: {
      tableId: 'TBL-02',
      tableNumber: 'Salon 2',
      token: 'OZT-QR-2',
      isRevoked: false,
      requestsLastMinute: 0,
      rateLimitPerMin: 20,
    },
    providedToken: 'OZT-QR-2',
    tableArea: 'Ana Salon',
    qrCodeNumber: 'QR-MASA-02',
    assignedWaiter: 'Murat Demir',
    selectedNeeds: ['Hesap Pusulası (Nakit Ödeme)'],
    customNote: '',
    timestamp: '14:40',
    calculatedBillAmount: 1320.75,
  });
  assert.equal(call.valid, true);
  assert.equal(call.callRecord?.calculatedBillAmount, 1320.75);
});

test('buildArchiveEntry, shouldTriggerAutoEndOfDayArchive, and buildMapNavigationUrls return valid structures', () => {
  const entry = buildArchiveEntry({
    type: 'Masa & Hesap',
    title: 'Salon 2 Hesap Kapatma',
    subtitle: 'Murat Demir · Nakit',
    amount: 1320,
    reason: 'Yönetici tarafından arşivlendi',
    dateKey: '2026-11-16',
    archivedAt: '2026-11-16 23:59:00',
  });
  assert.equal(entry.type, 'Masa & Hesap');
  assert.equal(entry.amount, 1320);
  assert.equal(entry.dateKey, '2026-11-16');

  assert.equal(shouldTriggerAutoEndOfDayArchive('2026-11-15', '2026-11-16'), true);
  assert.equal(shouldTriggerAutoEndOfDayArchive('2026-11-16', '2026-11-16'), false);
  assert.equal(shouldTriggerAutoEndOfDayArchive('', '2026-11-16'), false);

  const urls = buildMapNavigationUrls(37.0628, 37.3795, 'ÖzTike Ciğer');
  assert.match(urls.googleMapsUrl, /37\.0628,37\.3795/);
  assert.match(urls.googleDirectionsUrl, /destination=37\.0628,37\.3795/);
  assert.match(urls.appleMapsUrl, /ll=37\.0628,37\.3795/);
  assert.match(urls.yandexMapsUrl, /pt=37\.3795,37\.0628/);
  assert.match(urls.wazeUrl, /ll=37\.0628,37\.3795/);
  assert.match(urls.openStreetMapUrl, /mlat=37\.0628/);
  assert.match(urls.bingMapsUrl, /37\.0628~37\.3795/);
});



