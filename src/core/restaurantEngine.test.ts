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
  buildMapEmbedUrl,
  resolveThemePaletteAndLayout,
  buildDynamicWebManifest,
  validateTableCandidate,
  THEME_PRESETS,
  filterOrdersByMultiCriteria,
  resolveCustomerOrderPaymentIntent,
  canRequestBillForContext,
  upsertProductRecipeLine,
  removeProductRecipeLine,
  validatePluginJsonConfig,
  buildSimulatedPosOrderForPreview,
  calculateSeoHealthScore,
  buildRestaurantJsonLd,
  buildFullSitemapXml,
  buildRobotsTxt,
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

test('validateQROrderRequest blocks offline orders, unknown tables, rate limits, and duplicate idempotency keys without token enforcement', () => {
  const activeQr = {
    tableId: 'TBL-1',
    tableNumber: 'Salon 1',
    token: '',
    isRevoked: false,
    requestsLastMinute: 2,
    rateLimitPerMin: 20,
  };

  assert.equal(
    validateQROrderRequest(activeQr, '', 'IDEMP-1', [], false).valid,
    false
  );
  assert.equal(
    validateQROrderRequest(undefined, '', 'IDEMP-1', [], true).valid,
    false
  );
  assert.equal(
    validateQROrderRequest(activeQr, '', 'IDEMP-1', ['IDEMP-1'], true).valid,
    false
  );
  assert.equal(
    validateQROrderRequest(activeQr, '', 'IDEMP-2', ['IDEMP-1'], true).valid,
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

test('canAccessQrProtectedFeature respects tableSelectionEnabled toggle and allows all orders when table selection is passive', () => {
  assert.equal(canAccessQrProtectedFeature(null, 'QR', true).allowed, false);
  assert.equal(canAccessQrProtectedFeature(null, 'waiter_call', true).allowed, false);
  assert.equal(canAccessQrProtectedFeature(null, 'QR', false).allowed, true);
  assert.equal(canAccessQrProtectedFeature(null, 'waiter_call', false).allowed, true);
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

test('buildMapEmbedUrl handles free providers, paid providers with keys, and safe fallback when paid key is missing', () => {
  const osm = buildMapEmbedUrl({
    providerMode: 'free',
    freeProvider: 'openstreetmap',
    paidProvider: 'google-js-api',
    lat: 37.0628,
    lng: 37.3795,
    zoom: 16,
  });
  assert.equal(osm.mode, 'iframe');
  assert.match(osm.src, /openstreetmap\.org\/export\/embed\.html/);

  const yandex = buildMapEmbedUrl({
    providerMode: 'free',
    freeProvider: 'yandex-embed',
    paidProvider: 'google-js-api',
    lat: 37.0628,
    lng: 37.3795,
    zoom: 16,
  });
  assert.equal(yandex.mode, 'iframe');
  assert.match(yandex.src, /yandex\.com\.tr\/map-widget/);

  const paidJsNoKey = buildMapEmbedUrl({
    providerMode: 'paid',
    freeProvider: 'google-embed-free',
    paidProvider: 'google-js-api',
    lat: 37.0628,
    lng: 37.3795,
    zoom: 16,
    paidApiKey: '',
  });
  assert.equal(paidJsNoKey.mode, 'iframe');
  assert.match(paidJsNoKey.src, /maps\.google\.com\/maps/);

  const paidJsWithKey = buildMapEmbedUrl({
    providerMode: 'paid',
    freeProvider: 'google-embed-free',
    paidProvider: 'google-js-api',
    lat: 37.0628,
    lng: 37.3795,
    zoom: 16,
    paidApiKey: 'AIzaTestKey123',
  });
  assert.equal(paidJsWithKey.mode, 'js-sdk');

  const paidEmbedWithKey = buildMapEmbedUrl({
    providerMode: 'paid',
    freeProvider: 'google-embed-free',
    paidProvider: 'google-embed-api',
    lat: 37.0628,
    lng: 37.3795,
    zoom: 15,
    paidApiKey: 'AIzaTestKey123',
  });
  assert.equal(paidEmbedWithKey.mode, 'iframe');
  assert.match(paidEmbedWithKey.src, /google\.com\/maps\/embed\/v1\/place/);
});

test('resolveThemePaletteAndLayout returns distinct architectural layouts for all 9 theme presets (including 5 new light & dark themes)', () => {
  const classic = resolveThemePaletteAndLayout({ themeVariant: 'oztike-classic' });
  const editorial = resolveThemePaletteAndLayout({ themeVariant: 'mermer-editorial' });
  const bento = resolveThemePaletteAndLayout({ themeVariant: 'obsidian-bento' });
  const botanic = resolveThemePaletteAndLayout({ themeVariant: 'antep-botanik' });
  const kapadokya = resolveThemePaletteAndLayout({ themeVariant: 'kapadokya-terracotta' });
  const bosphorus = resolveThemePaletteAndLayout({ themeVariant: 'bosphorus-midnight' });
  const ankara = resolveThemePaletteAndLayout({ themeVariant: 'ankara-kurumsal-light' });
  const mezopotamya = resolveThemePaletteAndLayout({ themeVariant: 'mezopotamya-bakir-dark' });
  const ege = resolveThemePaletteAndLayout({ themeVariant: 'ege-zeytin-light' });

  assert.equal(Object.keys(THEME_PRESETS).length, 9);
  assert.equal(classic.heroLayout, 'classic-banner');
  assert.equal(editorial.isLight, true);
  assert.equal(editorial.heroLayout, 'split-editorial');
  assert.equal(bento.heroLayout, 'bento-split');
  assert.match(bento.menuGridClass, /lg:grid-cols-3/);
  assert.equal(botanic.heroLayout, 'arched-botanic');
  assert.equal(botanic.buttonRadius, 'rounded-full');
  assert.equal(kapadokya.isLight, true);
  assert.equal(bosphorus.isLight, false);
  assert.equal(ankara.isLight, true);
  assert.equal(mezopotamya.isLight, false);
  assert.equal(ege.isLight, true);
});

test('buildDynamicWebManifest enforces 12-char short_name clamp and builds valid manifest metadata', () => {
  const manifest = buildDynamicWebManifest({
    appName: 'ÖzTike Ciğer Gaziantep',
    shortName: 'ÇokUzunBirUygulamaAdı',
    description: 'Restoran sistemi',
    themeColor: '#9A5B25',
    backgroundColor: '#F6F1E7',
    displayMode: 'standalone',
    orientation: 'portrait',
    iconUrl: '/custom-icon.png',
    startUrl: '/?pwa=1',
    scope: '/',
  });
  assert.equal(manifest.short_name.length <= 12, true);
  assert.equal(manifest.theme_color, '#9A5B25');
  assert.equal(manifest.start_url, '/?pwa=1');
  assert.equal(manifest.icons[0].src, '/custom-icon.png');
});

test('validateTableCandidate checks required fields, capacity range, and duplicate table/QR numbers', () => {
  const existing = [
    { id: 'TBL-1', number: 'Salon 1', qrCodeNumber: 'QR-MASA-01' },
    { id: 'TBL-2', number: 'Salon 2', qrCodeNumber: 'QR-MASA-02' },
  ];
  assert.equal(
    validateTableCandidate(
      { number: '', area: 'Ana Salon', capacity: 4, waiterName: 'Murat', qrCodeNumber: 'QR-MASA-03' },
      existing
    ).valid,
    false
  );
  assert.equal(
    validateTableCandidate(
      { number: 'Salon 3', area: 'Ana Salon', capacity: 0, waiterName: 'Murat', qrCodeNumber: 'QR-MASA-03' },
      existing
    ).valid,
    false
  );
  assert.equal(
    validateTableCandidate(
      { number: 'Salon 3', area: 'Ana Salon', capacity: 4, waiterName: 'Murat', qrCodeNumber: 'qr-masa-01' },
      existing
    ).valid,
    false
  );
  // Editing TBL-1 with its own name/QR should succeed
  assert.equal(
    validateTableCandidate(
      { number: 'Salon 1', area: 'Ana Salon', capacity: 6, waiterName: 'Murat', qrCodeNumber: 'QR-MASA-01' },
      existing,
      'TBL-1'
    ).valid,
    true
  );
});

test('filterOrdersByMultiCriteria supports multi-category, multi-waiter, multi-channel, and search filtering', () => {
  const prods = [
    { id: 'PRD-1', categoryId: 'CAT-01' },
    { id: 'PRD-2', categoryId: 'CAT-02' },
    { id: 'PRD-3', categoryId: 'CAT-05' },
  ];
  const sampleOrders = [
    {
      id: 'O1',
      orderNumber: 'OZT-1001',
      channel: 'QR',
      tableName: 'Masa 1',
      customerName: 'Ali',
      staffName: 'Murat Demir',
      items: [{ productId: 'PRD-1', productName: 'Kuzu Ciğer Şiş' }],
    },
    {
      id: 'O2',
      orderNumber: 'OZT-1002',
      channel: 'Garson',
      tableName: 'Masa 2',
      customerName: 'Ayşe',
      staffName: 'Elif Yılmaz',
      items: [{ productId: 'PRD-2', productName: 'Urfa Kebap' }],
    },
    {
      id: 'O3',
      orderNumber: 'OZT-1003',
      channel: 'Paket servis',
      tableName: 'Paket Servis',
      customerName: 'Can',
      staffName: 'Murat Demir',
      items: [{ productId: 'PRD-3', productName: 'Lahmacun' }],
    },
  ];

  // Multi-channel + multi-category combined
  const catAndChan = filterOrdersByMultiCriteria(sampleOrders, prods, {
    categoryIds: ['CAT-01', 'CAT-02'],
    waiterNames: [],
    channels: ['QR', 'Garson'],
  });
  assert.deepEqual(
    catAndChan.map((o) => o.id),
    ['O1', 'O2']
  );

  // Waiter + category intersection
  const waiterAndCat = filterOrdersByMultiCriteria(sampleOrders, prods, {
    categoryIds: ['CAT-05'],
    waiterNames: ['Murat Demir'],
    channels: [],
  });
  assert.deepEqual(
    waiterAndCat.map((o) => o.id),
    ['O3']
  );

  // Search query
  const searched = filterOrdersByMultiCriteria(sampleOrders, prods, {
    categoryIds: [],
    waiterNames: [],
    channels: [],
    searchQuery: 'urfa',
  });
  assert.deepEqual(
    searched.map((o) => o.id),
    ['O2']
  );
});

test('resolveCustomerOrderPaymentIntent keeps Kasada/POS/Havale-EFT unpaid and canRequestBillForContext blocks bill requests without an open bill', () => {
  const immediate = resolveCustomerOrderPaymentIntent({
    payNow: true,
    paymentMethod: 'Online Kart (iyzico / PayTR)',
    paymentType: 'online_card',
    finalTotal: 640.5,
    orderNumber: 'OZT-2026-1099',
  });
  assert.equal(immediate.isPaidNow, true);
  assert.equal(immediate.paymentStatus, 'Ödendi');
  assert.equal(immediate.paidAmount, 640.5);
  assert.equal(immediate.tableBalanceDelta, 0);
  assert.ok(immediate.receiptNumber);
  assert.ok(immediate.eInvoiceNo);

  const deferredPos = resolveCustomerOrderPaymentIntent({
    payNow: false,
    paymentMethod: 'POS Cihazı ile Kart',
    paymentType: 'pos',
    finalTotal: 640.5,
    orderNumber: 'OZT-2026-1100',
  });
  assert.equal(deferredPos.isPaidNow, false);
  assert.equal(deferredPos.paymentStatus, 'Ödenmedi');
  assert.equal(deferredPos.paidAmount, 0);
  assert.equal(deferredPos.tableBalanceDelta, 640.5);
  assert.equal(deferredPos.receiptNumber, undefined);

  // Even if payNow flag were true, Kasada Nakit & Havale/EFT must NOT auto-mark paid
  const havaleOrder = resolveCustomerOrderPaymentIntent({
    payNow: true,
    paymentMethod: 'Havale / EFT (IBAN)',
    paymentType: 'transfer',
    finalTotal: 450,
    orderNumber: 'OZT-2026-1101',
  });
  assert.equal(havaleOrder.isPaidNow, false);
  assert.equal(havaleOrder.paymentStatus, 'Ödenmedi');
  assert.equal(havaleOrder.paidAmount, 0);

  const kasadaNakit = resolveCustomerOrderPaymentIntent({
    payNow: false,
    paymentMethod: 'Kasada / Masada Nakit',
    paymentType: 'cash',
    finalTotal: 320,
    orderNumber: 'OZT-2026-1102',
  });
  assert.equal(kasadaNakit.isPaidNow, false);
  assert.equal(kasadaNakit.paymentStatus, 'Ödenmedi');

  const noBill = canRequestBillForContext({
    tableOpenBalance: 0,
    unpaidOrdersCount: 0,
    unpaidOrdersTotal: 0,
  });
  assert.equal(noBill.allowed, false);
  assert.equal(noBill.totalOpenAmount, 0);
  assert.ok(noBill.reason);

  const hasBill = canRequestBillForContext({
    tableOpenBalance: 0,
    unpaidOrdersCount: 1,
    unpaidOrdersTotal: 440,
  });
  assert.equal(hasBill.allowed, true);
  assert.equal(hasBill.totalOpenAmount, 440);
});

test('upsertProductRecipeLine, removeProductRecipeLine, validatePluginJsonConfig, and buildSimulatedPosOrderForPreview work accurately', () => {
  const initialLines: RecipeIngredientLine[] = [
    {
      ingredientId: 'ING-01',
      ingredientName: 'Kuzu Ciğeri',
      quantity: 0.2,
      unit: 'kg',
      unitCost: 620,
    },
  ];
  const afterAdd = upsertProductRecipeLine(initialLines, {
    ingredientId: 'ING-02',
    ingredientName: 'Kuyruk Yağı',
    quantity: 0.05,
    unit: 'kg',
    unitCost: 450,
  });
  assert.equal(afterAdd.length, 2);

  const afterUpdate = upsertProductRecipeLine(afterAdd, {
    ingredientId: 'ING-01',
    ingredientName: 'Kuzu Ciğeri',
    quantity: 0.25,
    unit: 'kg',
    unitCost: 640,
  });
  assert.equal(afterUpdate.length, 2);
  assert.equal(afterUpdate[0].quantity, 0.25);

  const afterRemove = removeProductRecipeLine(afterUpdate, 'ING-02');
  assert.equal(afterRemove.length, 1);
  assert.equal(afterRemove[0].ingredientId, 'ING-01');

  const validJson = validatePluginJsonConfig(
    JSON.stringify({ apiKey: 'test-123', autoSync: true, timeoutMs: 4500 })
  );
  assert.equal(validJson.valid, true);
  assert.equal(validJson.settings?.autoSync, true);
  assert.equal(validJson.settings?.timeoutMs, 4500);

  const invalidJson = validatePluginJsonConfig('{ broken json ');
  assert.equal(invalidJson.valid, false);

  const simulated = buildSimulatedPosOrderForPreview({
    tableId: 'TBL-01',
    tableName: 'Salon 1',
    staffName: 'Murat Demir',
    paymentMethodLabel: 'Kredi Kartı (POS)',
    discountPercent: 10,
    taxRatePercent: 10,
    cartItems: [
      {
        productId: 'PRD-01',
        productName: 'Geleneksel Ciğer Şiş Porsiyon',
        quantity: 2,
        unitPrice: 440,
        station: 'Izgara',
      },
    ],
  });
  assert.equal(simulated.subtotal, 880);
  assert.equal(simulated.discountAmount, 88);
  assert.equal(simulated.taxAmount, 79.2);
  assert.equal(simulated.totalAmount, 871.2);
  assert.ok(simulated.receiptNumber);
});

test('SEO helpers compute health score, generate Schema.org JSON-LD, sitemap.xml, and robots.txt', () => {
  const seoResult = calculateSeoHealthScore({
    metaTitleTr: 'ÖzTike Ciğer · Halil Usta | Şahinbey Gaziantep Ciğer & Kebap',
    metaDescriptionTr:
      '1996 yılından bu yana Şahinbey Gaziantep merkezde meşe közünde günlük taze erkek kuzu ciğeri ve zırh kebapları.',
    keywords: 'ciğer, kebap, gaziantep, şahinbey, ocakbaşı',
    canonicalUrl: 'https://oztikeciger.com.tr',
    ogImageUrl: '/assets/aistudio/crops/branded-ocakbasi.jpg',
    robots: 'index, follow',
    schemaType: 'Restaurant',
    servesCuisine: 'Turkish',
    geoRegion: 'TR-27',
    sitemapXml: '<urlset></urlset>',
    robotsTxt: 'User-agent: *',
  });
  assert.equal(seoResult.score, 100);
  assert.equal(seoResult.grade, 'Mükemmel');

  const jsonLd = buildRestaurantJsonLd({
    brandTitle: 'ÖzTike Ciğer',
    seo: {
      metaDescriptionTr: 'Gaziantep ciğer & kebap',
      canonicalUrl: 'https://oztikeciger.com.tr',
      ogImageUrl: '/og.jpg',
      schemaType: 'Restaurant',
      servesCuisine: 'Turkish',
      ratingValue: 4.9,
      reviewCount: 500,
    },
    address: 'Karagöz Mah. Şahinbey',
    phone: '+905551234567',
  });
  const parsedLd = JSON.parse(jsonLd);
  assert.equal(parsedLd['@type'], 'Restaurant');
  assert.equal(parsedLd.aggregateRating.ratingValue, '4.9');

  const sitemap = buildFullSitemapXml({
    canonicalUrl: 'https://oztikeciger.com.tr/',
    categorySlugs: ['ciger', 'kebap'],
    pageSlugs: ['/hakkimizda'],
  });
  assert.match(sitemap, /https:\/\/oztikeciger\.com\.tr\/hakkimizda/);
  assert.match(sitemap, /#kategori-ciger/);

  const robots = buildRobotsTxt('https://oztikeciger.com.tr/', true);
  assert.match(robots, /Disallow: \/install\.php/);
});

test('resolveThemePaletteAndLayout and buildDynamicWebManifest apply custom grid columns, footer columns, and shortcuts', () => {
  const customDesign = resolveThemePaletteAndLayout({
    themeVariant: 'oztike-classic',
    gridColumnsDesktop: 4,
    gridColumnsMobile: 2,
    footerColumns: 4,
    iconStyle: 'solid',
    iconSizePx: 18,
  });
  assert.match(customDesign.menuGridClass, /grid-cols-2/);
  assert.match(customDesign.menuGridClass, /lg:grid-cols-4/);
  assert.equal(customDesign.footerColumns, 4);
  assert.equal(customDesign.iconStyle, 'solid');

  const fullManifest = buildDynamicWebManifest({
    appName: 'ÖzTike Ciğer',
    shortName: 'ÖzTike',
    description: 'Dijital sipariş',
    themeColor: '#D4A359',
    backgroundColor: '#120806',
    displayMode: 'standalone',
    orientation: 'portrait',
    shortcuts: [{ name: 'Menü', shortName: 'Menü', url: '/#menu', description: 'Menüyü aç' }],
    screenshots: ['/screen1.jpg'],
  });
  assert.equal(fullManifest.shortcuts?.length, 1);
  assert.equal(fullManifest.screenshots?.length, 1);
});

