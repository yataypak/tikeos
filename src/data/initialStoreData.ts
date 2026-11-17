import {
  type StockItem,
  type StockMovement,
  type RecipeIngredientLine,
  type ReservationItem,
  type WaiterServiceCallRecord,
} from '../core/restaurantEngine';

export type OrderChannel =
  | 'QR'
  | 'Garson'
  | 'Kasa'
  | 'Gel-Al'
  | 'Telefon'
  | 'Web sitesi'
  | 'Paket servis'
  | 'Rezervasyon bağlantılı sipariş';

export type OrderStatus =
  | 'Yeni'
  | 'Onay bekliyor'
  | 'Mutfağa gönderildi'
  | 'Hazırlanıyor'
  | 'Hazır'
  | 'Servis bekliyor'
  | 'Servis edildi'
  | 'Kuryeye teslim edildi'
  | 'Tamamlandı'
  | 'İptal edildi'
  | 'İade edildi';

export type TableStatus =
  | 'Boş'
  | 'Dolu'
  | 'Sipariş bekliyor'
  | 'Hazırlanıyor'
  | 'Hesap bekliyor'
  | 'Rezerve'
  | 'Temizlik bekliyor';

export type KitchenStationName =
  | 'Izgara'
  | 'Tavuk'
  | 'Soğuk mutfak'
  | 'İçecek'
  | 'Paketleme';

export type StaffRoleName =
  | 'Süper Yönetici'
  | 'İşletme Müdürü'
  | 'Şube Müdürü'
  | 'Kasiyer'
  | 'Garson'
  | 'Mutfak'
  | 'Kurye'
  | 'Depo Sorumlusu'
  | 'Muhasebe'
  | 'İçerik Editörü';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  isDemo: boolean;
  imageUrl?: string;
  imageUrls?: string[];
  isPrimaryShowcase?: boolean;
}

export interface ProductOptionGroup {
  id: string;
  name: string;
  type: 'single' | 'multiple';
  choices: { label: string; extraPrice: number }[];
}

export interface ProductItem {
  id: string;
  code: string;
  barcode: string;
  name: string;
  categoryId: string;
  categoryName: string;
  description: string;
  price: number;
  discountedPrice: number | null;
  portionInfo: string;
  grammage: number;
  ingredientsText: string;
  allergens: string[];
  calories: number;
  nutritionVerified: boolean;
  prepTimeMinutes: number;
  spiceLevel: 1 | 2 | 3;
  tags: string[];
  isFeatured: boolean;
  inStock: boolean;
  isActive: boolean;
  isDemo: boolean;
  station: KitchenStationName;
  channels: OrderChannel[];
  seoTitle: string;
  seoDescription: string;
  slug: string;
  recipeLines: RecipeIngredientLine[];
  wasteAllowancePercent: number;
  imageUrl?: string;
  imageUrls?: string[];
}

export interface MenuPackageItem {
  id: string;
  name: string;
  type: 'Tek kişilik menü' | 'İki kişilik menü' | 'Aile menüsü' | 'Karışık menü' | 'Özel menüler';
  contents: string[];
  price: number;
  isActive: boolean;
  isDemo: boolean;
  imageUrl?: string;
  imageUrls?: string[];
}

export interface DiningTableItem {
  id: string;
  number: string;
  area: 'Ana Salon' | 'Taş Bahçe' | 'Bakır Ocakbaşı' | 'VIP Aile Salonu' | (string & {});
  capacity: number;
  status: TableStatus;
  waiterName: string;
  qrCodeNumber: string;
  qrToken: string;
  qrRevoked: boolean;
  currentOrderId: string | null;
  openBalance: number;
  billRequested: boolean;
  waiterCalled: boolean;
  activeServiceRequests: string[];
  serviceRequestNote?: string;
  serviceRequestTime?: string;
  mergedWith: string | null;
}

export interface OrderLineItem {
  id: string;
  productId: string;
  productName: string;
  station: KitchenStationName;
  quantity: number;
  unitPrice: number;
  options: { name: string; value: string; extraPrice: number }[];
  customerNote: string;
  isComplimentary: boolean;
  isReady: boolean;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  idempotencyKey: string;
  channel: OrderChannel;
  status: OrderStatus;
  tableId: string | null;
  tableName: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  pickupTime?: string;
  courierName?: string;
  deliveryState?: 'Hazırlanıyor' | 'Kuryeye Atandı' | 'Yolda' | 'Teslim Edildi' | 'Başarısız Teslimat';
  staffName: string;
  items: OrderLineItem[];
  subtotal: number;
  discountAmount: number;
  deliveryFee?: number;
  tipAmount?: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'Ödenmedi' | 'Kısmi Ödendi' | 'Ödendi' | 'İade Edildi';
  paymentMethod?: string;
  receiptNumber?: string;
  eInvoiceNo?: string;
  autoReceiptIssued?: boolean;
  prepTimeMinutes: number;
  elapsedMinutes: number;
  notes: string;
  createdAt: string;
  branchId: string;
  history: { timestamp: string; status: string; actor: string; note: string }[];
}

export interface SavedAddressItem {
  id: string;
  label: 'Ev' | 'İş Yeri' | 'Diğer';
  title: string;
  fullAddress: string;
  district: string;
  note?: string;
}

export interface CustomerReviewItem {
  id: string;
  customerName: string;
  customerPhone: string;
  productId?: string;
  productName?: string;
  rating: number;
  comment: string;
  createdAt: string;
  status: 'Yayında' | 'İncelemede';
}

export interface CustomerComplaintItem {
  id: string;
  customerName: string;
  customerPhone: string;
  subject: string;
  message: string;
  orderNumber?: string;
  createdAt: string;
  status: 'Açık' | 'İnceleniyor' | 'Çözüldü';
}

export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  group: 'Standart' | 'VIP Misafir' | 'Kurumsal' | 'Sadık Müşteri';
  birthDate: string;
  points: number;
  walletBalance: number;
  totalOrders: number;
  totalSpent: number;
  preferences: string;
  referralCode: string;
  kvkkApproved: boolean;
  marketingSmsApproved: boolean; // varsayılan olarak false (Bölüm 15)
  isBlocked?: boolean;
  blockedReason?: string;
}

export interface CampaignRecord {
  id: string;
  name: string;
  type:
    | 'Yüzde indirim'
    | 'Sabit tutar indirimi'
    | 'Bir alana bir bedava'
    | 'Menü paketi'
    | 'Ürün kampanyası'
    | 'Kategori kampanyası'
    | 'Saat bazlı kampanya'
    | 'Gün bazlı kampanya'
    | 'Müşteri grubu kampanyası'
    | 'Kupon kodu'
    | 'İlk sipariş kampanyası'
    | 'Sadakat kampanyası';
  couponCode: string;
  discountValue: number;
  minOrderAmount: number;
  usageLimit: number;
  usedCount: number;
  canCombine: boolean;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRoleName;
  phone: string;
  email: string;
  branch: string;
  shift: string;
  twoFactorEnabled: boolean;
  activeSessionDevice: string;
  ordersHandledToday: number;
  salesToday: number;
  isActive: boolean;
}

export interface FinanceLedgerItem {
  id: string;
  date: string;
  type: 'Gelir' | 'Gider';
  category: string;
  description: string;
  amount: number;
  paymentMethod: string;
  recordedBy: string;
  branchId: string;
}

export interface CMSPageItem {
  id: string;
  title: string;
  subtitle?: string;
  slug: string;
  imageUrl?: string;
  imageUrls?: string[];
  content?: string;
  showInHeader?: boolean;
  showInFooter?: boolean;
  status: 'Yayında' | 'Taslak' | 'Zamanlanmış';
  seoTitle: string;
  metaDescription: string;
  canonical: string;
  robots: string;
  schemaType: string;
  requiresLegalReview: boolean;
  updatedAt: string;
}

export interface IntegrationPluginItem {
  id: string;
  code: string;
  name: string;
  category:
    | 'Ödeme'
    | 'Yemek Platformu'
    | 'WhatsApp Business'
    | 'SMS'
    | 'SMTP e-posta'
    | 'Harita'
    | 'Analitik'
    | 'Yazıcı'
    | 'Barkod'
    | 'Kurye'
    | 'Muhasebe'
    | 'E-belge'
    | 'Pazarlama'
    | 'Güvenlik'
    | 'Otomasyon'
    | 'Webhook'
    | 'Yapay zekâ'
    | 'PWA & Bildirim';
  version: string;
  scope: string;
  installed: boolean;
  enabled: boolean;
  mode: 'Test (Sandbox)' | 'Canlı (Live)';
  lastTested: string;
  contractVerified: boolean;
  description?: string;
  settings?: Record<string, string | number | boolean>;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: StaffRoleName;
  module: string;
  action: string;
  detail: string;
  severity: 'Normal' | 'Uyarı' | 'Kritik';
}

export interface BackupEntry {
  id: string;
  timestamp: string;
  type: 'Tam Yedek (DB + Dosya)' | 'Veritabanı (SQL)' | 'Medya ve Yapılandırma';
  trigger: 'Otomatik' | 'Manuel';
  sizeMb: number;
  checksum: string;
  verified: boolean;
}

export interface BranchItem {
  id: string;
  code: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  isMain: boolean;
  isActive: boolean;
  dailyRevenue: number;
  activeTables: number;
}

// -----------------------------------------------------------------------------
// BÖLÜM 4.1: KATEGORİLER (YALNIZCA 7 TEMEL KATEGORİ: CİĞER, KEBAP, TAVUK, DÖNER, LAHMACUN, YEŞİLLİKLER & SALATALAR, İÇECEKLER)
// -----------------------------------------------------------------------------
export const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: 'CAT-01', name: 'Ciğer', slug: 'ciger', description: 'Meşe közünde günlük taze kuzu ciğer şiş ve dürüm çeşitleri', sortOrder: 1, isActive: true, isDemo: true, imageUrl: '/assets/aistudio/crops/cat-ciger.png', imageUrls: ['/assets/aistudio/crops/cat-ciger.png', '/assets/aistudio/crops/branded-ocakbasi.jpg'], isPrimaryShowcase: true },
  { id: 'CAT-02', name: 'Kebap', slug: 'kebap', description: 'Zırh kıyma Adana, Urfa ve patlıcanlı kebap çeşitleri', sortOrder: 2, isActive: true, isDemo: true, imageUrl: '/assets/aistudio/crops/cat-kebap.png', imageUrls: ['/assets/aistudio/crops/cat-kebap.png', '/assets/aistudio/crops/branded-dining.jpg'], isPrimaryShowcase: true },
  { id: 'CAT-03', name: 'Tavuk', slug: 'tavuk', description: 'Kekikli yaprak tavuk şiş ve közde kanat ızgaralar', sortOrder: 3, isActive: true, isDemo: true, imageUrl: '/assets/aistudio/crops/cat-tavuk.png', imageUrls: ['/assets/aistudio/crops/cat-tavuk.png'], isPrimaryShowcase: true },
  { id: 'CAT-04', name: 'Döner', slug: 'doner', description: 'Odun ateşinde %100 yaprak et döner ve tereyağlı iskender', sortOrder: 4, isActive: true, isDemo: true, imageUrl: '/assets/aistudio/crops/cat-doner.png', imageUrls: ['/assets/aistudio/crops/cat-doner.png', '/assets/aistudio/crops/branded-doner-lahmacun.jpg'], isPrimaryShowcase: true },
  { id: 'CAT-05', name: 'Lahmacun', slug: 'lahmacun', description: 'Taş fırın geleneksel ve cevizli özel lahmacun', sortOrder: 5, isActive: true, isDemo: true, imageUrl: '/assets/aistudio/crops/cat-lahmacun.png', imageUrls: ['/assets/aistudio/crops/cat-lahmacun.png', '/assets/aistudio/crops/branded-doner-lahmacun.jpg'], isPrimaryShowcase: true },
  { id: 'CAT-09', name: 'Yeşillikler & Salatalar', slug: 'yesillikler-salatalar', description: 'Gavurdağı, bostana, sumaklı soğan ve taze yeşillikler', sortOrder: 6, isActive: true, isDemo: true, imageUrl: '/assets/aistudio/crops/cat-lahmacun.png', imageUrls: ['/assets/aistudio/crops/cat-lahmacun.png'], isPrimaryShowcase: true },
  { id: 'CAT-12', name: 'İçecekler', slug: 'icecekler', description: 'Bakır maşrapada yayık ayranı, şalgam ve soğuk meşrubatlar', sortOrder: 7, isActive: true, isDemo: true, imageUrl: '/assets/aistudio/crops/gallery-2.png', imageUrls: ['/assets/aistudio/crops/gallery-2.png'], isPrimaryShowcase: true },
];

// -----------------------------------------------------------------------------
// BÖLÜM 4.3: ÜRÜN SEÇENEKLERİ
// -----------------------------------------------------------------------------
export const GLOBAL_PRODUCT_OPTIONS: ProductOptionGroup[] = [
  {
    id: 'OPT-PORTION',
    name: 'Porsiyon seçimi',
    type: 'single',
    choices: [
      { label: '1 Porsiyon (Standart)', extraPrice: 0 },
      { label: '1.5 Porsiyon', extraPrice: 185 },
      { label: 'Duble Porsiyon', extraPrice: 340 },
    ],
  },
  {
    id: 'OPT-SPICE',
    name: 'Acı seviyesi',
    type: 'single',
    choices: [
      { label: 'Acısız', extraPrice: 0 },
      { label: 'Orta Acılı (İpek Pul Biberli)', extraPrice: 0 },
      { label: 'Bol Acılı (İsot & Zırh Biberli)', extraPrice: 0 },
    ],
  },
  {
    id: 'OPT-BREAD',
    name: 'Ekmek tercihi',
    type: 'single',
    choices: [
      { label: 'Tandır Lavaşı', extraPrice: 0 },
      { label: 'Tırnak Pide', extraPrice: 0 },
      { label: 'Çift Lavaş', extraPrice: 20 },
    ],
  },
  {
    id: 'OPT-EXTRAS',
    name: 'Ekstra tercihler',
    type: 'multiple',
    choices: [
      { label: 'Ekstra soğan', extraPrice: 0 },
      { label: 'Ekstra maydanoz', extraPrice: 0 },
      { label: 'Ekstra biber', extraPrice: 25 },
      { label: 'Ekstra ciğer (Şiş)', extraPrice: 145 },
    ],
  },
];

// -----------------------------------------------------------------------------
// BÖLÜM 12: STOK KALEMLERİ (10 KATEGORİ)
// -----------------------------------------------------------------------------
export const INITIAL_STOCKS: StockItem[] = [
  {
    id: 'ING-01',
    sku: 'STK-ET-001',
    name: 'Günlük Taze Kuzu Ciğeri',
    category: 'Et ve sakatat',
    unit: 'kg',
    currentStock: 14.5,
    minStockThreshold: 15.0,
    unitCost: 620,
    supplierId: 'SUP-01',
    supplierName: 'Trakya & Güneydoğu Besi Çiftliği',
    lotNumber: 'LOT-261116-A',
    expiryDate: '2026-11-18',
    warehouse: 'Ana Soğuk Hava Deposu (+2°C)',
  },
  {
    id: 'ING-02',
    sku: 'STK-ET-002',
    name: 'Kuzu Kuyruk Yağı',
    category: 'Et ve sakatat',
    unit: 'kg',
    currentStock: 6.2,
    minStockThreshold: 5.0,
    unitCost: 450,
    supplierId: 'SUP-01',
    supplierName: 'Trakya & Güneydoğu Besi Çiftliği',
    lotNumber: 'LOT-261116-B',
    expiryDate: '2026-11-20',
    warehouse: 'Ana Soğuk Hava Deposu (+2°C)',
  },
  {
    id: 'ING-03',
    sku: 'STK-ET-003',
    name: 'Zırhlık Kuzu Döş & Kaburga Eti',
    category: 'Et ve sakatat',
    unit: 'kg',
    currentStock: 22.0,
    minStockThreshold: 12.0,
    unitCost: 580,
    supplierId: 'SUP-01',
    supplierName: 'Trakya & Güneydoğu Besi Çiftliği',
    lotNumber: 'LOT-261115-C',
    expiryDate: '2026-11-19',
    warehouse: 'Ana Soğuk Hava Deposu (+2°C)',
  },
  {
    id: 'ING-04',
    sku: 'STK-SBZ-001',
    name: 'Mor Soğan & Maydanoz Demeti',
    category: 'Sebze',
    unit: 'kg',
    currentStock: 35.0,
    minStockThreshold: 15.0,
    unitCost: 42,
    supplierId: 'SUP-02',
    supplierName: 'Bereket Hal Tedarik A.Ş.',
    lotNumber: 'LOT-261116-SB',
    expiryDate: '2026-11-21',
    warehouse: 'Sebze Hazırlık Deposu',
  },
  {
    id: 'ING-05',
    sku: 'STK-BHR-001',
    name: 'Gaziantep İpek Pul Biber & Kimyon',
    category: 'Baharat',
    unit: 'kg',
    currentStock: 4.1,
    minStockThreshold: 5.0,
    unitCost: 380,
    supplierId: 'SUP-03',
    supplierName: 'Göbeklitepe Baharatçısı',
    lotNumber: 'LOT-2610-BH',
    expiryDate: '2027-06-01',
    warehouse: 'Kuru Gıda Deposu',
  },
  {
    id: 'ING-06',
    sku: 'STK-SUT-001',
    name: 'Tam Yağlı Koyun/İnek Yoğurdu (Yayık Ayranlık)',
    category: 'Süt ürünleri',
    unit: 'kg',
    currentStock: 18.0,
    minStockThreshold: 10.0,
    unitCost: 95,
    supplierId: 'SUP-04',
    supplierName: 'Toros Mandıra',
    lotNumber: 'LOT-261114-MD',
    expiryDate: '2026-11-23',
    warehouse: 'Ana Soğuk Hava Deposu (+2°C)',
  },
  {
    id: 'ING-07',
    sku: 'STK-KRU-001',
    name: 'Taş Değirmen Lavaşlık Un',
    category: 'Kuru gıda',
    unit: 'kg',
    currentStock: 85.0,
    minStockThreshold: 25.0,
    unitCost: 34,
    supplierId: 'SUP-03',
    supplierName: 'Göbeklitepe Baharatçısı',
    lotNumber: 'LOT-2609-UN',
    expiryDate: '2027-03-15',
    warehouse: 'Kuru Gıda Deposu',
  },
  {
    id: 'ING-08',
    sku: 'STK-AMB-001',
    name: 'Isı Yalıtımlı Bakır Baskılı Paket Servis Kutusu',
    category: 'Ambalaj',
    unit: 'adet',
    currentStock: 190,
    minStockThreshold: 250,
    unitCost: 8.5,
    supplierId: 'SUP-05',
    supplierName: 'EkoPak Ambalaj Sanayi',
    lotNumber: 'LOT-2608-PK',
    expiryDate: '2029-01-01',
    warehouse: 'Ambalaj Deposu',
  },
];

// -----------------------------------------------------------------------------
// BÖLÜM 4.2: GÖRSEL ÜRÜN KATALOĞU (CİĞER, KEBAP, TAVUK, DÖNER, LAHMACUN)
// -----------------------------------------------------------------------------
export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'PRD-01',
    code: 'OZT-CGR-01',
    barcode: '8690001000012',
    name: 'ÖzTike Kuzu Ciğer Şiş (Porsiyon)',
    categoryId: 'CAT-01',
    categoryName: 'Ciğer',
    description: 'Zırh kıyması kuyruk yağı ile dizilmiş günlük taze kuzu ciğeri, közlenmiş biber, sumaklı soğan ve sıcak tandır lavaşı ile.',
    price: 440,
    discountedPrice: null,
    portionInfo: '1 Porsiyon (8 Şiş)',
    grammage: 220,
    ingredientsText: 'Kuzu ciğeri, kuzu kuyruk yağı, kimyon, ipek pul biber, kaya tuzu, tandır lavaşı',
    allergens: ['Gluten (Lavaş)'],
    calories: 580,
    nutritionVerified: false,
    prepTimeMinutes: 12,
    spiceLevel: 2,
    tags: ['Halil Usta İmzası', 'Meşe Kömürü'],
    isFeatured: true,
    inStock: true,
    isActive: true,
    isDemo: true,
    station: 'Izgara',
    channels: ['QR', 'Garson', 'Kasa', 'Gel-Al', 'Telefon', 'Web sitesi', 'Paket servis', 'Rezervasyon bağlantılı sipariş'],
    seoTitle: 'ÖzTike Kuzu Ciğer Şiş | Halil Usta',
    seoDescription: 'Günlük taze kuzu ciğeri ve kuyruk yağı ile meşe kömüründe pişirilen ÖzTike Kuzu Ciğer Şiş.',
    slug: 'oztike-kuzu-ciger-sis',
    wasteAllowancePercent: 4,
    imageUrl: '/assets/aistudio/crops/cat-ciger.png',
    recipeLines: [
      { ingredientId: 'ING-01', ingredientName: 'Günlük Taze Kuzu Ciğeri', quantity: 0.22, unit: 'kg', unitCost: 620 },
      { ingredientId: 'ING-02', ingredientName: 'Kuzu Kuyruk Yağı', quantity: 0.04, unit: 'kg', unitCost: 450 },
      { ingredientId: 'ING-04', ingredientName: 'Mor Soğan & Maydanoz Demeti', quantity: 0.12, unit: 'kg', unitCost: 42 },
      { ingredientId: 'ING-05', ingredientName: 'Gaziantep İpek Pul Biber & Kimyon', quantity: 0.01, unit: 'kg', unitCost: 380 },
    ],
  },
  {
    id: 'PRD-08',
    code: 'OZT-CGR-02',
    barcode: '8690001000081',
    name: 'Çift Lavaş Urfa Kuzu Ciğer Dürüm',
    categoryId: 'CAT-01',
    categoryName: 'Ciğer',
    description: 'Sıcak tandır lavaşı arasında 5 şiş kuzu ciğeri, sumaklı mor soğan, taze nane, maydanoz ve kimyon.',
    price: 295,
    discountedPrice: 275,
    portionInfo: '1 Adet Doyurucu Dürüm',
    grammage: 160,
    ingredientsText: 'Kuzu ciğeri, tandır lavaşı, mor soğan, maydanoz, sumak, kimyon',
    allergens: ['Gluten'],
    calories: 490,
    nutritionVerified: false,
    prepTimeMinutes: 10,
    spiceLevel: 2,
    tags: ['En Çok Satan', 'Sıcak Lavaş'],
    isFeatured: true,
    inStock: true,
    isActive: true,
    isDemo: true,
    station: 'Izgara',
    channels: ['QR', 'Garson', 'Kasa', 'Gel-Al', 'Telefon', 'Web sitesi', 'Paket servis'],
    seoTitle: 'Urfa Kuzu Ciğer Dürüm | ÖzTike Ciğer',
    seoDescription: 'Sıcak tandır lavaşına sarılı taze kuzu ciğer dürüm.',
    slug: 'urfa-kuzu-ciger-durum',
    wasteAllowancePercent: 3,
    imageUrl: '/assets/aistudio/crops/hero-ciger.png',
    recipeLines: [
      { ingredientId: 'ING-01', ingredientName: 'Günlük Taze Kuzu Ciğeri', quantity: 0.14, unit: 'kg', unitCost: 620 },
      { ingredientId: 'ING-04', ingredientName: 'Mor Soğan & Maydanoz Demeti', quantity: 0.08, unit: 'kg', unitCost: 42 },
      { ingredientId: 'ING-07', ingredientName: 'Taş Değirmen Lavaşlık Un', quantity: 0.12, unit: 'kg', unitCost: 34 },
    ],
  },
  {
    id: 'PRD-02',
    code: 'OZT-KBP-01',
    barcode: '8690001000029',
    name: 'Zırh Kıyma Adana & Urfa Kebap',
    categoryId: 'CAT-02',
    categoryName: 'Kebap',
    description: 'Zırhta elde çekilmiş erkek kuzu eti, kök biber ve kuyruk yağı ile ağır meşe ateşinde pişirilen geleneksel kebap.',
    price: 420,
    discountedPrice: null,
    portionInfo: '1 Porsiyon (180g)',
    grammage: 180,
    ingredientsText: 'Zırhlık kuzu eti, kuyruk yağı, kapya biber, pul biber, tuz',
    allergens: ['Gluten (Lavaş)'],
    calories: 640,
    nutritionVerified: false,
    prepTimeMinutes: 15,
    spiceLevel: 3,
    tags: ['Zırh Kebabı', 'Şefin Önerisi'],
    isFeatured: true,
    inStock: true,
    isActive: true,
    isDemo: true,
    station: 'Izgara',
    channels: ['QR', 'Garson', 'Kasa', 'Gel-Al', 'Telefon', 'Web sitesi', 'Paket servis'],
    seoTitle: 'Zırh Kıyma Adana & Urfa Kebap | ÖzTike Ciğer',
    seoDescription: 'Elde zırhta çekilmiş kuzu etinden gerçek Adana ve Urfa kebap.',
    slug: 'zirh-kiyma-adana-kebap',
    wasteAllowancePercent: 5,
    imageUrl: '/assets/aistudio/crops/cat-kebap.png',
    recipeLines: [
      { ingredientId: 'ING-03', ingredientName: 'Zırhlık Kuzu Döş & Kaburga Eti', quantity: 0.19, unit: 'kg', unitCost: 580 },
      { ingredientId: 'ING-02', ingredientName: 'Kuzu Kuyruk Yağı', quantity: 0.04, unit: 'kg', unitCost: 450 },
      { ingredientId: 'ING-05', ingredientName: 'Gaziantep İpek Pul Biber & Kimyon', quantity: 0.01, unit: 'kg', unitCost: 380 },
    ],
  },
  {
    id: 'PRD-09',
    code: 'OZT-KBP-02',
    barcode: '8690001000098',
    name: 'Halil Usta Patlıcanlı Kebap & Kuzu Şiş',
    categoryId: 'CAT-02',
    categoryName: 'Kebap',
    description: 'Birecik patlıcanı ve zırh kıymasının meşe közünde buluşması; közlenmiş domates, biber ve tırnak pide eşliğinde.',
    price: 490,
    discountedPrice: null,
    portionInfo: '1.5 Porsiyon Özel Sunum',
    grammage: 260,
    ingredientsText: 'Zırh kuzu kıyma, Birecik patlıcanı, kuyruk yağı, köz biber',
    allergens: ['Gluten'],
    calories: 710,
    nutritionVerified: false,
    prepTimeMinutes: 18,
    spiceLevel: 2,
    tags: ['Urfa Klasikleri', 'Köz Ateşi'],
    isFeatured: true,
    inStock: true,
    isActive: true,
    isDemo: true,
    station: 'Izgara',
    channels: ['QR', 'Garson', 'Kasa', 'Gel-Al', 'Paket servis'],
    seoTitle: 'Halil Usta Patlıcanlı Kebap | ÖzTike Ciğer',
    seoDescription: 'Geleneksel Urfa patlıcanlı kebap ve kuzu şiş.',
    slug: 'halil-usta-patlicanli-kebap',
    wasteAllowancePercent: 4,
    imageUrl: '/assets/aistudio/crops/cat-kebap.png',
    recipeLines: [
      { ingredientId: 'ING-03', ingredientName: 'Zırhlık Kuzu Döş & Kaburga Eti', quantity: 0.22, unit: 'kg', unitCost: 580 },
    ],
  },
  {
    id: 'PRD-04',
    code: 'OZT-TVK-01',
    barcode: '8690001000043',
    name: 'Yaprak Tavuk Şiş & Közlenmiş Izgara',
    categoryId: 'CAT-03',
    categoryName: 'Tavuk',
    description: 'Özel kekikli ve zeytinyağlı terbiyesinde dinlendirilmiş sulu tavuk şiş, közlenmiş domates, biber ve sıcak lavaş ile.',
    price: 340,
    discountedPrice: null,
    portionInfo: '1 Porsiyon (220g)',
    grammage: 220,
    ingredientsText: 'Dinlendirilmiş tavuk kalça şiş, dağ kekiği, tatlı toz biber, zeytinyağı, köz sebzeler',
    allergens: ['Gluten'],
    calories: 480,
    nutritionVerified: false,
    prepTimeMinutes: 14,
    spiceLevel: 1,
    tags: ['Yumuşak & Sulu', 'Izgara'],
    isFeatured: true,
    inStock: true,
    isActive: true,
    isDemo: true,
    station: 'Tavuk',
    channels: ['QR', 'Garson', 'Kasa', 'Gel-Al', 'Paket servis', 'Rezervasyon bağlantılı sipariş'],
    seoTitle: 'Yaprak Tavuk Şiş & Izgara | ÖzTike Ciğer',
    seoDescription: 'Özel soslu meşe kömüründe pişirilen tavuk şiş ve ızgaralar.',
    slug: 'yaprak-tavuk-sis-izgara',
    wasteAllowancePercent: 4,
    imageUrl: '/assets/aistudio/crops/cat-tavuk.png',
    recipeLines: [
      { ingredientId: 'ING-04', ingredientName: 'Mor Soğan & Maydanoz Demeti', quantity: 0.12, unit: 'kg', unitCost: 42 },
    ],
  },
  {
    id: 'PRD-10',
    code: 'OZT-TVK-02',
    barcode: '8690001000104',
    name: 'Közde Yaprak Tavuk Kanat (Porsiyon)',
    categoryId: 'CAT-03',
    categoryName: 'Tavuk',
    description: 'İpek pul biber ve yoğurt sosuyla marine edilerek meşe kömüründe nar gibi kızarmış yaprak tavuk kanat.',
    price: 365,
    discountedPrice: null,
    portionInfo: '1 Porsiyon (8 Adet)',
    grammage: 250,
    ingredientsText: 'Tavuk kanat, yoğurt terbiyesi, ipek pul biber, kekik',
    allergens: ['Süt Ürünleri', 'Gluten'],
    calories: 540,
    nutritionVerified: false,
    prepTimeMinutes: 16,
    spiceLevel: 2,
    tags: ['Çıtır Izgara', 'Çok Sevilen'],
    isFeatured: false,
    inStock: true,
    isActive: true,
    isDemo: true,
    station: 'Tavuk',
    channels: ['QR', 'Garson', 'Kasa', 'Gel-Al', 'Paket servis'],
    seoTitle: 'Közde Yaprak Tavuk Kanat | ÖzTike Ciğer',
    seoDescription: 'Meşe ateşinde kızarmış yaprak tavuk kanat.',
    slug: 'kozde-yaprak-tavuk-kanat',
    wasteAllowancePercent: 4,
    imageUrl: '/assets/aistudio/crops/cat-tavuk.png',
    recipeLines: [
      { ingredientId: 'ING-06', ingredientName: 'Tam Yağlı Koyun/İnek Yoğurdu (Yayık Ayranlık)', quantity: 0.05, unit: 'kg', unitCost: 95 },
    ],
  },
  {
    id: 'PRD-03',
    code: 'OZT-DNR-01',
    barcode: '8690001000036',
    name: 'Odun Ateşinde Yaprak Et Döner (Porsiyon)',
    categoryId: 'CAT-04',
    categoryName: 'Döner',
    description: 'Zırh kıyması destekli %100 yaprak dana ve kuzu eti döneri; tırnak pide, tava yoğurdu ve köz biber eşliğinde.',
    price: 395,
    discountedPrice: 370,
    portionInfo: '1 Porsiyon (160g Et)',
    grammage: 160,
    ingredientsText: 'Yaprak dana tranç, kuzu kuyruk yağı, tırnak pide, köz domates ve biber',
    allergens: ['Gluten'],
    calories: 560,
    nutritionVerified: false,
    prepTimeMinutes: 8,
    spiceLevel: 1,
    tags: ['Yaprak Et Döner', 'Hızlı Servis'],
    isFeatured: true,
    inStock: true,
    isActive: true,
    isDemo: true,
    station: 'Izgara',
    channels: ['QR', 'Garson', 'Kasa', 'Gel-Al', 'Telefon', 'Web sitesi', 'Paket servis'],
    seoTitle: 'Yaprak Et Döner | ÖzTike Ciğer',
    seoDescription: 'Geleneksel terbiyeli yaprak et döner çeşitleri.',
    slug: 'odun-atesinde-yaprak-et-doner',
    wasteAllowancePercent: 3,
    imageUrl: '/assets/aistudio/crops/cat-doner.png',
    recipeLines: [
      { ingredientId: 'ING-03', ingredientName: 'Zırhlık Kuzu Döş & Kaburga Eti', quantity: 0.16, unit: 'kg', unitCost: 580 },
      { ingredientId: 'ING-07', ingredientName: 'Taş Değirmen Lavaşlık Un', quantity: 0.12, unit: 'kg', unitCost: 34 },
    ],
  },
  {
    id: 'PRD-11',
    code: 'OZT-DNR-02',
    barcode: '8690001000111',
    name: 'Tereyağlı İskender & Tırnak Pideli Et Döner',
    categoryId: 'CAT-04',
    categoryName: 'Döner',
    description: 'Küp doğranmış sıcak tırnak pide üzerinde yaprak et döner, halis Urfa sade yağı, domates sosu ve koyun yoğurdu.',
    price: 450,
    discountedPrice: null,
    portionInfo: '1 Porsiyon Sıcak Tereyağlı',
    grammage: 240,
    ingredientsText: 'Yaprak et döner, tırnak pide, Urfa sade yağı, domates sosu, koyun yoğurdu',
    allergens: ['Gluten', 'Süt Ürünleri'],
    calories: 720,
    nutritionVerified: false,
    prepTimeMinutes: 10,
    spiceLevel: 1,
    tags: ['Urfa Sade Yağlı', 'Özel Sunum'],
    isFeatured: true,
    inStock: true,
    isActive: true,
    isDemo: true,
    station: 'Izgara',
    channels: ['QR', 'Garson', 'Kasa', 'Rezervasyon bağlantılı sipariş'],
    seoTitle: 'Tereyağlı İskender Et Döner | ÖzTike Ciğer',
    seoDescription: 'Urfa sade yağlı yaprak et döner.',
    slug: 'tereyagli-iskender-et-doner',
    wasteAllowancePercent: 3,
    imageUrl: '/assets/aistudio/crops/cat-doner.png',
    recipeLines: [
      { ingredientId: 'ING-03', ingredientName: 'Zırhlık Kuzu Döş & Kaburga Eti', quantity: 0.18, unit: 'kg', unitCost: 580 },
      { ingredientId: 'ING-06', ingredientName: 'Tam Yağlı Koyun/İnek Yoğurdu (Yayık Ayranlık)', quantity: 0.1, unit: 'kg', unitCost: 95 },
    ],
  },
  {
    id: 'PRD-05',
    code: 'OZT-LHM-01',
    barcode: '8690001000050',
    name: 'Taş Fırın Geleneksel Urfa Lahmacun (2 Adet)',
    categoryId: 'CAT-05',
    categoryName: 'Lahmacun',
    description: 'Zırh kıyması, isot, taze maydanoz ve sarımsaklı harç ile taş fırında çıtır pişirilen geleneksel lahmacun; bol yeşillik ve limon ile.',
    price: 220,
    discountedPrice: null,
    portionInfo: '2 Adet Çıtır Lahmacun + Yeşillik',
    grammage: 260,
    ingredientsText: 'Zırh kuzu kıyma, taş değirmen unu, isot, domates, kapya biber, maydanoz',
    allergens: ['Gluten'],
    calories: 520,
    nutritionVerified: true,
    prepTimeMinutes: 8,
    spiceLevel: 2,
    tags: ['Taş Fırın', 'Çıtır Lezzet'],
    isFeatured: true,
    inStock: true,
    isActive: true,
    isDemo: true,
    station: 'Izgara',
    channels: ['QR', 'Garson', 'Kasa', 'Gel-Al', 'Paket servis'],
    seoTitle: 'Geleneksel Taş Fırın Lahmacun | ÖzTike Ciğer',
    seoDescription: 'Zırh kıymalı ve isotlu çıtır taş fırın lahmacun.',
    slug: 'tas-firin-geleneksel-lahmacun',
    wasteAllowancePercent: 3,
    imageUrl: '/assets/aistudio/crops/cat-lahmacun.png',
    recipeLines: [
      { ingredientId: 'ING-03', ingredientName: 'Zırhlık Kuzu Döş & Kaburga Eti', quantity: 0.12, unit: 'kg', unitCost: 580 },
      { ingredientId: 'ING-07', ingredientName: 'Taş Değirmen Lavaşlık Un', quantity: 0.16, unit: 'kg', unitCost: 34 },
    ],
  },
  {
    id: 'PRD-12',
    code: 'OZT-LHM-02',
    barcode: '8690001000128',
    name: 'Cevizli & Nar Ekşili Özel Urfa Lahmacun',
    categoryId: 'CAT-05',
    categoryName: 'Lahmacun',
    description: 'Kırık yerli ceviz içi, nar ekşisi ve zırh kuzu kıymasıyla hazırlanan özel taş fırın lahmacun.',
    price: 260,
    discountedPrice: null,
    portionInfo: '2 Adet Özel Lahmacun',
    grammage: 280,
    ingredientsText: 'Zırh kuzu kıyma, ceviz içi, nar ekşisi, isot, maydanoz',
    allergens: ['Gluten', 'Sert Kabuklu Yemişler (Ceviz)'],
    calories: 590,
    nutritionVerified: true,
    prepTimeMinutes: 10,
    spiceLevel: 2,
    tags: ['Cevizli Özel', 'Taş Fırın'],
    isFeatured: false,
    inStock: true,
    isActive: true,
    isDemo: true,
    station: 'Izgara',
    channels: ['QR', 'Garson', 'Kasa', 'Gel-Al', 'Paket servis'],
    seoTitle: 'Cevizli Özel Urfa Lahmacun | ÖzTike Ciğer',
    seoDescription: 'Cevizli ve nar ekşili taş fırın lahmacun.',
    slug: 'cevizli-ozel-urfa-lahmacun',
    wasteAllowancePercent: 3,
    imageUrl: '/assets/aistudio/crops/cat-lahmacun.png',
    recipeLines: [
      { ingredientId: 'ING-03', ingredientName: 'Zırhlık Kuzu Döş & Kaburga Eti', quantity: 0.12, unit: 'kg', unitCost: 580 },
      { ingredientId: 'ING-04', ingredientName: 'Mor Soğan & Maydanoz Demeti', quantity: 0.15, unit: 'kg', unitCost: 42 },
    ],
  },
  // SALATALAR (CAT-09)
  {
    id: 'PRD-13',
    code: 'OZT-SLD-01',
    barcode: '8690001000135',
    name: 'Nar Ekşili Cevizli Gavurdağı Salatası',
    categoryId: 'CAT-09',
    categoryName: 'Salatalar',
    description: 'İnce kıyım domates, salatalık, mor soğan, bol yerli ceviz içi ve hakiki nar ekşisi sosu ile.',
    price: 145,
    discountedPrice: null,
    portionInfo: 'Paylaşımlık Kase',
    grammage: 240,
    ingredientsText: 'Domates, ceviz içi, mor soğan, maydanoz, nar ekşisi, sızma zeytinyağı',
    allergens: ['Sert Kabuklu Yemişler (Ceviz)'],
    calories: 260,
    nutritionVerified: true,
    prepTimeMinutes: 5,
    spiceLevel: 1,
    tags: ['Taze Hazırlık', 'Cevizli'],
    isFeatured: true,
    inStock: true,
    isActive: true,
    isDemo: true,
    station: 'Soğuk mutfak',
    channels: ['QR', 'Garson', 'Kasa', 'Gel-Al', 'Paket servis'],
    seoTitle: 'Cevizli Gavurdağı Salatası | ÖzTike Ciğer',
    seoDescription: 'Hakiki nar ekşisi ve bol cevizli Gavurdağı salatası.',
    slug: 'cevizli-gavurdagi-salatasi',
    wasteAllowancePercent: 3,
    imageUrl: '/assets/aistudio/crops/cat-lahmacun.png',
    recipeLines: [
      { ingredientId: 'ING-04', ingredientName: 'Mor Soğan & Maydanoz Demeti', quantity: 0.25, unit: 'kg', unitCost: 42 },
    ],
  },
  {
    id: 'PRD-14',
    code: 'OZT-SLD-02',
    barcode: '8690001000142',
    name: 'Urfa Usulü Sumaklı Bostana & Çoban Salata',
    categoryId: 'CAT-09',
    categoryName: 'Salatalar',
    description: 'Zırhta ince kıyılmış domates, yeşil biber, semizotu, taze nane, sumak ve nar ekşisi.',
    price: 120,
    discountedPrice: null,
    portionInfo: 'Taze Hazırlık',
    grammage: 220,
    ingredientsText: 'Domates, yeşil biber, salatalık, maydanoz, taze nane, sumak, nar ekşisi',
    allergens: [],
    calories: 140,
    nutritionVerified: true,
    prepTimeMinutes: 5,
    spiceLevel: 1,
    tags: ['Yöresel', 'Ferahlatıcı'],
    isFeatured: true,
    inStock: true,
    isActive: true,
    isDemo: true,
    station: 'Soğuk mutfak',
    channels: ['QR', 'Garson', 'Kasa', 'Gel-Al', 'Paket servis'],
    seoTitle: 'Urfa Bostana ve Çoban Salata | ÖzTike Ciğer',
    seoDescription: 'İnce kıyım sumaklı Urfa bostana salatası.',
    slug: 'urfa-bostana-coban-salata',
    wasteAllowancePercent: 3,
    imageUrl: '/assets/aistudio/crops/cat-kebap.png',
    recipeLines: [
      { ingredientId: 'ING-04', ingredientName: 'Mor Soğan & Maydanoz Demeti', quantity: 0.22, unit: 'kg', unitCost: 42 },
    ],
  },
  {
    id: 'PRD-15',
    code: 'OZT-SLD-03',
    barcode: '8690001000159',
    name: 'Közlenmiş Biber, Domates & Sumaklı Soğan Tabağı',
    categoryId: 'CAT-09',
    categoryName: 'Salatalar',
    description: 'Meşe közünde pişmiş biber, domates, sarımsak ve bol sumaklı mor soğan piyazı.',
    price: 95,
    discountedPrice: null,
    portionInfo: 'Ocakbaşı Garnitür Tabağı',
    grammage: 200,
    ingredientsText: 'Köz yeşil biber, köz domates, mor soğan, sumak, maydanoz',
    allergens: [],
    calories: 110,
    nutritionVerified: true,
    prepTimeMinutes: 4,
    spiceLevel: 2,
    tags: ['Köz Lezzeti', 'Ciğer Yanına'],
    isFeatured: false,
    inStock: true,
    isActive: true,
    isDemo: true,
    station: 'Soğuk mutfak',
    channels: ['QR', 'Garson', 'Kasa', 'Gel-Al', 'Paket servis'],
    seoTitle: 'Közlenmiş Biber ve Sumaklı Soğan | ÖzTike Ciğer',
    seoDescription: 'Meşe közünde biber ve sumaklı soğan tabağı.',
    slug: 'kozlenmis-biber-sumakli-sogan',
    wasteAllowancePercent: 2,
    imageUrl: '/assets/aistudio/crops/cat-ciger.png',
    recipeLines: [
      { ingredientId: 'ING-04', ingredientName: 'Mor Soğan & Maydanoz Demeti', quantity: 0.2, unit: 'kg', unitCost: 42 },
    ],
  },
  // İÇECEKLER (CAT-12)
  {
    id: 'PRD-06',
    code: 'OZT-ICC-01',
    barcode: '8690001000067',
    name: 'Bakır Maşrapada Köpüklü Yayık Ayranı',
    categoryId: 'CAT-12',
    categoryName: 'İçecekler',
    description: 'Yayla yoğurdundan günlük dövülmüş bol köpüklü geleneksel bakır maşrapa yayık ayranı.',
    price: 75,
    discountedPrice: null,
    portionInfo: '330 ml Bakır Maşrapa',
    grammage: 330,
    ingredientsText: 'Tam yağlı yoğurt, kaynak suyu, kaya tuzu',
    allergens: ['Süt ve Süt Ürünleri'],
    calories: 115,
    nutritionVerified: true,
    prepTimeMinutes: 2,
    spiceLevel: 1,
    tags: ['Geleneksel', 'Bol Köpüklü'],
    isFeatured: true,
    inStock: true,
    isActive: true,
    isDemo: true,
    station: 'İçecek',
    channels: ['QR', 'Garson', 'Kasa', 'Gel-Al', 'Paket servis'],
    seoTitle: 'Bakır Maşrapada Yayık Ayranı | ÖzTike Ciğer',
    seoDescription: 'Bol köpüklü doğal yayık ayranı.',
    slug: 'bakir-masrapada-yayik-ayrani',
    wasteAllowancePercent: 2,
    imageUrl: '/assets/aistudio/crops/gallery-2.png',
    recipeLines: [
      { ingredientId: 'ING-06', ingredientName: 'Tam Yağlı Koyun/İnek Yoğurdu (Yayık Ayranlık)', quantity: 0.18, unit: 'kg', unitCost: 95 },
    ],
  },
  {
    id: 'PRD-16',
    code: 'OZT-ICC-02',
    barcode: '8690001000166',
    name: 'Geleneksel Fermente Şalgam Suyu (Acılı / Acısız)',
    categoryId: 'CAT-12',
    categoryName: 'İçecekler',
    description: 'Mor havuç ve bulgur mayasıyla dinlendirilmiş hakiki şalgam suyu (Acılı veya acısız).',
    price: 65,
    discountedPrice: null,
    portionInfo: '330 ml Cam Şişe',
    grammage: 330,
    ingredientsText: 'Mor havuç, şalgam turpu, bulgur mayası, kaya tuzu, acı biber',
    allergens: ['Gluten (Bulgur mayası)'],
    calories: 25,
    nutritionVerified: true,
    prepTimeMinutes: 1,
    spiceLevel: 2,
    tags: ['Soğuk Servis', 'Geleneksel'],
    isFeatured: true,
    inStock: true,
    isActive: true,
    isDemo: true,
    station: 'İçecek',
    channels: ['QR', 'Garson', 'Kasa', 'Gel-Al', 'Paket servis'],
    seoTitle: 'Geleneksel Şalgam Suyu | ÖzTike Ciğer',
    seoDescription: 'Hakiki fermente acılı ve acısız şalgam suyu.',
    slug: 'geleneksel-salgam-suyu',
    wasteAllowancePercent: 1,
    imageUrl: '/assets/aistudio/crops/gallery-1.png',
    recipeLines: [],
  },
  {
    id: 'PRD-17',
    code: 'OZT-ICC-03',
    barcode: '8690001000173',
    name: 'Kutu Meşrubat (Kola / Fanta / Sprite / Ice Tea)',
    categoryId: 'CAT-12',
    categoryName: 'İçecekler',
    description: 'Buzlu bardak ile soğuk kutu meşrubat çeşitleri (Coca-Cola, Zero, Fanta, Sprite, Soğuk Çay).',
    price: 65,
    discountedPrice: null,
    portionInfo: '330 ml Kutu',
    grammage: 330,
    ingredientsText: 'Soğuk meşrubat',
    allergens: [],
    calories: 135,
    nutritionVerified: true,
    prepTimeMinutes: 1,
    spiceLevel: 1,
    tags: ['Soğuk İçecek'],
    isFeatured: false,
    inStock: true,
    isActive: true,
    isDemo: true,
    station: 'İçecek',
    channels: ['QR', 'Garson', 'Kasa', 'Gel-Al', 'Paket servis'],
    seoTitle: 'Soğuk Meşrubatlar | ÖzTike Ciğer',
    seoDescription: 'Kola, Fanta, Sprite ve Ice Tea çeşitleri.',
    slug: 'kutu-mesrubat-cesitleri',
    wasteAllowancePercent: 1,
    imageUrl: '/assets/aistudio/crops/gallery-2.png',
    recipeLines: [],
  },
  {
    id: 'PRD-18',
    code: 'OZT-ICC-04',
    barcode: '8690001000180',
    name: 'Doğal Maden Suyu & Kaynak Suyu',
    categoryId: 'CAT-12',
    categoryName: 'İçecekler',
    description: 'Limon dilimli doğal maden suyu (200 ml) veya doğal kaynak suyu (500 ml).',
    price: 35,
    discountedPrice: null,
    portionInfo: 'Cam Şişe / Su',
    grammage: 330,
    ingredientsText: 'Doğal kaynak ve maden suyu',
    allergens: [],
    calories: 0,
    nutritionVerified: true,
    prepTimeMinutes: 1,
    spiceLevel: 1,
    tags: ['Doğal'],
    isFeatured: false,
    inStock: true,
    isActive: true,
    isDemo: true,
    station: 'İçecek',
    channels: ['QR', 'Garson', 'Kasa', 'Gel-Al', 'Paket servis'],
    seoTitle: 'Maden Suyu ve Su | ÖzTike Ciğer',
    seoDescription: 'Doğal maden suyu ve kaynak suyu.',
    slug: 'dogal-maden-suyu-ve-su',
    wasteAllowancePercent: 1,
    imageUrl: '/assets/aistudio/crops/gallery-3.png',
    recipeLines: [],
  },
];

// -----------------------------------------------------------------------------
// BÖLÜM 4.4: MENÜ PAKETLERİ
// -----------------------------------------------------------------------------
export const INITIAL_MENU_PACKAGES: MenuPackageItem[] = [
  {
    id: 'PKG-01',
    name: 'Tek Kişilik ÖzTike Ciğer Keyfi',
    type: 'Tek kişilik menü',
    contents: ['1 Porsiyon Kuzu Ciğer Şiş', 'Fındık Lahmacun (1 Adet)', 'Yayık Ayranı', 'Közlenmiş Biber & Sumaklı Soğan'],
    price: 510,
    isActive: true,
    isDemo: true,
    imageUrl: '/assets/aistudio/crops/cat-ciger.png',
    imageUrls: ['/assets/aistudio/crops/cat-ciger.png', '/assets/aistudio/crops/branded-ocakbasi.jpg'],
  },
  {
    id: 'PKG-02',
    name: 'İki Kişilik Ocakbaşı Tadım Menüsü',
    type: 'İki kişilik menü',
    contents: ['1 Porsiyon Kuzu Ciğer Şiş', '1 Porsiyon Zırh Adana Kebap', 'Gavurdağı Salatası', '2 Adet Bakır Yayık Ayranı'],
    price: 1090,
    isActive: true,
    isDemo: true,
    imageUrl: '/assets/aistudio/crops/branded-dining.jpg',
    imageUrls: ['/assets/aistudio/crops/branded-dining.jpg', '/assets/aistudio/crops/cat-kebap.png'],
  },
  {
    id: 'PKG-03',
    name: 'ÖzTike Aile Sofrası (4 Kişilik)',
    type: 'Aile menüsü',
    contents: ['2 Porsiyon Kuzu Ciğer Şiş', '1 Porsiyon Zırh Kebap + Yaprak Et Döner', '2 Büyük Gavurdağı & Bostana Salata', '4 Adet Bakır Yayık Ayranı / Şalgam'],
    price: 2150,
    isActive: true,
    isDemo: true,
    imageUrl: '/assets/aistudio/crops/branded-doner-lahmacun.jpg',
    imageUrls: ['/assets/aistudio/crops/branded-doner-lahmacun.jpg', '/assets/aistudio/crops/cat-ciger.png'],
  },
];

// -----------------------------------------------------------------------------
// BÖLÜM 9: MASA VE GARSON YÖNETİMİ (7 DURUM)
// -----------------------------------------------------------------------------
export const INITIAL_TABLES: DiningTableItem[] = [
  { id: 'TBL-01', number: 'Masa 01 · Salon 1', area: 'Ana Salon', capacity: 4, status: 'Hazırlanıyor', waiterName: 'Murat Demir', qrCodeNumber: 'QR-MASA-01', qrToken: 'OZT-QR-8A1F9C20', qrRevoked: false, currentOrderId: 'ORD-1041', openBalance: 1085, billRequested: false, waiterCalled: false, activeServiceRequests: [], mergedWith: null },
  { id: 'TBL-02', number: 'Masa 02 · Salon 2', area: 'Ana Salon', capacity: 4, status: 'Hesap bekliyor', waiterName: 'Murat Demir', qrCodeNumber: 'QR-MASA-02', qrToken: 'OZT-QR-3B7E4D12', qrRevoked: false, currentOrderId: 'ORD-1039', openBalance: 1540, billRequested: true, waiterCalled: true, activeServiceRequests: ['Masaya Mobil POS Cihazı (Kartla Ödeme)', 'Semaver Çay / Mırra İkramı'], serviceRequestNote: '2 kartla ödenecek', serviceRequestTime: '13:24', mergedWith: null },
  { id: 'TBL-03', number: 'Masa 03 · Salon 3', area: 'Ana Salon', capacity: 2, status: 'Boş', waiterName: 'Murat Demir', qrCodeNumber: 'QR-MASA-03', qrToken: 'OZT-QR-6C9A2E55', qrRevoked: false, currentOrderId: null, openBalance: 0, billRequested: false, waiterCalled: false, activeServiceRequests: [], mergedWith: null },
  { id: 'TBL-04', number: 'Masa 04 · Bahçe 1', area: 'Taş Bahçe', capacity: 6, status: 'Sipariş bekliyor', waiterName: 'Elif Yılmaz', qrCodeNumber: 'QR-MASA-04', qrToken: 'OZT-QR-1D4B8F77', qrRevoked: false, currentOrderId: 'ORD-1042', openBalance: 665, billRequested: false, waiterCalled: true, activeServiceRequests: ['Peçete & Islak Mendil', 'Çatal / Kaşık / Bıçak Takımı', 'Tuz / Karabiber / Sumak / Pul Biber', 'Masa Temizliği & Boşların Alınması'], serviceRequestNote: 'Sumak ve sıcak lavaş ilavesi rica ediyoruz', serviceRequestTime: '13:28', mergedWith: null },
  { id: 'TBL-05', number: 'Masa 05 · Bahçe 2', area: 'Taş Bahçe', capacity: 4, status: 'Dolu', waiterName: 'Elif Yılmaz', qrCodeNumber: 'QR-MASA-05', qrToken: 'OZT-QR-9E2C5A34', qrRevoked: false, currentOrderId: 'ORD-1040', openBalance: 880, billRequested: false, waiterCalled: false, activeServiceRequests: [], mergedWith: null },
  { id: 'TBL-06', number: 'Masa 06 · Ocakbaşı 1', area: 'Bakır Ocakbaşı', capacity: 8, status: 'Rezerve', waiterName: 'Murat Demir', qrCodeNumber: 'QR-MASA-06', qrToken: 'OZT-QR-7F5D1B89', qrRevoked: false, currentOrderId: null, openBalance: 0, billRequested: false, waiterCalled: false, activeServiceRequests: [], mergedWith: null },
  { id: 'TBL-07', number: 'Masa 07 · Ocakbaşı 2', area: 'Bakır Ocakbaşı', capacity: 4, status: 'Temizlik bekliyor', waiterName: 'Elif Yılmaz', qrCodeNumber: 'QR-MASA-07', qrToken: 'OZT-QR-4A8C3E61', qrRevoked: false, currentOrderId: null, openBalance: 0, billRequested: false, waiterCalled: false, activeServiceRequests: [], mergedWith: null },
  { id: 'TBL-08', number: 'Masa 08 · VIP 1', area: 'VIP Aile Salonu', capacity: 10, status: 'Boş', waiterName: 'Elif Yılmaz', qrCodeNumber: 'QR-MASA-08', qrToken: 'OZT-QR-2B6F9D43', qrRevoked: false, currentOrderId: null, openBalance: 0, billRequested: false, waiterCalled: false, activeServiceRequests: [], mergedWith: null },
];

export const INITIAL_WAITER_CALLS: WaiterServiceCallRecord[] = [
  {
    id: 'CALL-101',
    tableId: 'TBL-04',
    tableNumber: 'Masa 04 · Bahçe 1',
    tableArea: 'Taş Bahçe',
    qrCodeNumber: 'QR-MASA-04',
    qrToken: 'OZT-QR-1D4B8F77',
    assignedWaiter: 'Elif Yılmaz',
    selectedNeeds: [
      'Peçete & Islak Mendil',
      'Çatal / Kaşık / Bıçak Takımı',
      'Tuz / Karabiber / Sumak / Pul Biber',
      'Masa Temizliği & Boşların Alınması',
    ],
    customNote: 'Sumak ve sıcak lavaş ilavesi rica ediyoruz',
    createdAt: '13:28',
    status: 'Bekliyor',
  },
  {
    id: 'CALL-102',
    tableId: 'TBL-02',
    tableNumber: 'Masa 02 · Salon 2',
    tableArea: 'Ana Salon',
    qrCodeNumber: 'QR-MASA-02',
    qrToken: 'OZT-QR-3B7E4D12',
    assignedWaiter: 'Murat Demir',
    selectedNeeds: [
      'Masaya Mobil POS Cihazı (Kartla Ödeme)',
      'Semaver Çay / Mırra İkramı',
    ],
    customNote: '2 kartla ödenecek',
    createdAt: '13:24',
    status: 'Bekliyor',
  },
];

// -----------------------------------------------------------------------------
// BÖLÜM 6 & 8: SİPARİŞLER VE KDS MUTFAK FİŞLERİ
// -----------------------------------------------------------------------------
export const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: 'ORD-1042',
    orderNumber: 'OZT-2026-1042',
    idempotencyKey: 'IDEMP-1042',
    channel: 'QR',
    status: 'Yeni',
    tableId: 'TBL-04',
    tableName: 'Bahçe 1',
    customerName: 'Masa Misafiri (QR)',
    customerPhone: '0532 410 88 12',
    staffName: 'Elif Yılmaz',
    items: [
      {
        id: 'ITM-1',
        productId: 'PRD-01',
        productName: 'ÖzTike Kuzu Ciğer Şiş (Porsiyon)',
        station: 'Izgara',
        quantity: 1,
        unitPrice: 440,
        options: [
          { name: 'Acı seviyesi', value: 'Orta Acılı (İpek Pul Biberli)', extraPrice: 0 },
          { name: 'Ekmek tercihi', value: 'Tandır Lavaşı', extraPrice: 0 },
          { name: 'Ekstra tercihler', value: 'Ekstra soğan', extraPrice: 0 },
        ],
        customerNote: 'Soğanı bol sumaklı olsun lütfen',
        isComplimentary: false,
        isReady: false,
      },
      {
        id: 'ITM-2',
        productId: 'PRD-06',
        productName: 'Bakır Maşrapada Köpüklü Yayık Ayranı',
        station: 'İçecek',
        quantity: 3,
        unitPrice: 75,
        options: [],
        customerNote: '',
        isComplimentary: false,
        isReady: false,
      },
    ],
    subtotal: 665,
    discountAmount: 0,
    taxAmount: 60.45,
    totalAmount: 665,
    paidAmount: 0,
    paymentStatus: 'Ödenmedi',
    prepTimeMinutes: 12,
    elapsedMinutes: 4,
    notes: 'QR Menü üzerinden doğrulanan masa siparişi',
    createdAt: '13:18',
    branchId: 'BR-01',
    history: [
      { timestamp: '13:18', status: 'Yeni', actor: 'QR Menü Token #OZT-QR-1D4B8F77', note: 'Masa siparişi oluşturuldu' },
    ],
  },
  {
    id: 'ORD-1041',
    orderNumber: 'OZT-2026-1041',
    idempotencyKey: 'IDEMP-1041',
    channel: 'Garson',
    status: 'Hazırlanıyor',
    tableId: 'TBL-01',
    tableName: 'Salon 1',
    customerName: 'Kemalettin Soylu',
    customerPhone: '0544 312 09 44',
    staffName: 'Murat Demir',
    items: [
      {
        id: 'ITM-3',
        productId: 'PRD-01',
        productName: 'ÖzTike Kuzu Ciğer Şiş (Porsiyon)',
        station: 'Izgara',
        quantity: 2,
        unitPrice: 440,
        options: [{ name: 'Acı seviyesi', value: 'Bol Acılı (İsot & Zırh Biberli)', extraPrice: 0 }],
        customerNote: 'Lavaşlar sıcak gelsin',
        isComplimentary: false,
        isReady: false,
      },
      {
        id: 'ITM-4',
        productId: 'PRD-05',
        productName: 'Nar Ekşili Cevizli Gavurdağı Salatası',
        station: 'Soğuk mutfak',
        quantity: 1,
        unitPrice: 145,
        options: [],
        customerNote: '',
        isComplimentary: false,
        isReady: true,
      },
    ],
    subtotal: 1025,
    discountAmount: 0,
    taxAmount: 93.18,
    totalAmount: 1025,
    paidAmount: 0,
    paymentStatus: 'Ödenmedi',
    prepTimeMinutes: 14,
    elapsedMinutes: 17, // Geciken sipariş uyarısını tetikler
    notes: 'Misafir hızlı servis rica etti',
    createdAt: '13:05',
    branchId: 'BR-01',
    history: [
      { timestamp: '13:05', status: 'Yeni', actor: 'Murat Demir', note: 'Garson el terminalinden girildi' },
      { timestamp: '13:06', status: 'Hazırlanıyor', actor: 'Ahmet Usta (Izgara)', note: 'Ocakbaşı hazırlığına alındı' },
    ],
  },
  {
    id: 'ORD-1040',
    orderNumber: 'OZT-2026-1040',
    idempotencyKey: 'IDEMP-1040',
    channel: 'Paket servis',
    status: 'Hazır',
    tableId: null,
    tableName: 'Paket Servis',
    customerName: 'Zeynep Aksoy',
    customerPhone: '0533 899 12 34',
    deliveryAddress: 'Karagöz Mah. Atatürk Bulvarı No: 118 D:4 (Şahinbey / Gaziantep)',
    courierName: 'Serkan Çelik (Kurye 1)',
    deliveryState: 'Kuryeye Atandı',
    staffName: 'Seda Kasa',
    items: [
      {
        id: 'ITM-5',
        productId: 'PRD-08',
        productName: 'Çift Lavaş Urfa Kuzu Ciğer Dürüm',
        station: 'Paketleme',
        quantity: 2,
        unitPrice: 275,
        options: [{ name: 'Ekstra tercihler', value: 'Ekstra biber', extraPrice: 25 }],
        customerNote: 'Kapıda POS cihazı rica ediyorum',
        isComplimentary: false,
        isReady: true,
      },
    ],
    subtotal: 600,
    discountAmount: 0,
    deliveryFee: 35,
    taxAmount: 60,
    totalAmount: 695,
    paidAmount: 0,
    paymentStatus: 'Ödenmedi',
    prepTimeMinutes: 15,
    elapsedMinutes: 11,
    notes: 'Isı yalıtımlı kutuda gönderilecek',
    createdAt: '13:11',
    branchId: 'BR-01',
    history: [
      { timestamp: '13:11', status: 'Yeni', actor: 'Web Sitesi Online', note: 'Online paket sipariş' },
      { timestamp: '13:20', status: 'Hazır', actor: 'Paketleme İstasyonu', note: 'Kurye teslimine hazır' },
    ],
  },
  {
    id: 'ORD-1039',
    orderNumber: 'OZT-2026-1039',
    idempotencyKey: 'IDEMP-1039',
    channel: 'Garson',
    status: 'Servis edildi',
    tableId: 'TBL-02',
    tableName: 'Salon 2',
    customerName: 'Hakan Karahan',
    customerPhone: '0532 701 44 10',
    staffName: 'Murat Demir',
    items: [
      {
        id: 'ITM-6',
        productId: 'PRD-09',
        productName: 'Halil Usta Patlıcanlı Kebap & Kuzu Şiş',
        station: 'Izgara',
        quantity: 2,
        unitPrice: 490,
        options: [],
        customerNote: '',
        isComplimentary: false,
        isReady: true,
      },
      {
        id: 'ITM-7',
        productId: 'PRD-13',
        productName: 'Nar Ekşili Cevizli Gavurdağı Salatası',
        station: 'Soğuk mutfak',
        quantity: 2,
        unitPrice: 145,
        options: [],
        customerNote: '',
        isComplimentary: false,
        isReady: true,
      },
    ],
    subtotal: 1270,
    discountAmount: 70,
    taxAmount: 120,
    totalAmount: 1320,
    paidAmount: 0,
    paymentStatus: 'Ödenmedi',
    prepTimeMinutes: 18,
    elapsedMinutes: 35,
    notes: 'Hesap istendi',
    createdAt: '12:45',
    branchId: 'BR-01',
    history: [
      { timestamp: '12:45', status: 'Yeni', actor: 'Murat Demir', note: 'Sipariş açıldı' },
      { timestamp: '13:04', status: 'Servis edildi', actor: 'Murat Demir', note: 'Masaya servis tamamlandı' },
    ],
  },
  {
    id: 'ORD-1038',
    orderNumber: 'OZT-2026-1038',
    idempotencyKey: 'IDEMP-1038',
    channel: 'Gel-Al',
    status: 'Hazır',
    tableId: null,
    tableName: 'Gel-Al Bankosu',
    customerName: 'Onur Yıldırım',
    customerPhone: '0505 612 90 11',
    pickupTime: '13:35',
    deliveryState: 'Hazırlanıyor',
    staffName: 'Seda Kasa',
    items: [
      {
        id: 'ITM-8',
        productId: 'PRD-02',
        productName: 'Zırh Kıyma Adana Kebap',
        station: 'Paketleme',
        quantity: 1,
        unitPrice: 420,
        options: [],
        customerNote: '13:35 gibi şubeden teslim alacağım',
        isComplimentary: false,
        isReady: true,
      },
    ],
    subtotal: 420,
    discountAmount: 0,
    taxAmount: 38.18,
    totalAmount: 420,
    paidAmount: 420,
    paymentStatus: 'Ödendi',
    paymentMethod: 'iyzico (Test Modu Doğrulandı)',
    prepTimeMinutes: 15,
    elapsedMinutes: 12,
    notes: 'Ödeme alındı, teslimat bekleniyor',
    createdAt: '13:08',
    branchId: 'BR-01',
    history: [
      { timestamp: '13:08', status: 'Yeni', actor: 'Web Gel-Al', note: 'Online ödeme onaylandı' },
      { timestamp: '13:20', status: 'Hazır', actor: 'Paketleme', note: 'Gel-Al rafında hazır' },
    ],
  },
];

export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'MOV-101',
    timestamp: '2026-11-16 09:00',
    ingredientId: 'ING-01',
    ingredientName: 'Günlük Taze Kuzu Ciğeri',
    movementType: 'in',
    quantityDelta: 20.0,
    unit: 'kg',
    unitCostSnapshot: 620,
    referenceId: 'FAT-2026-881',
    note: 'Sabah soğuk zincir mal kabulü (LOT-261116-A)',
    actorName: 'Kadir Depo',
  },
  {
    id: 'MOV-102',
    timestamp: '2026-11-16 12:45',
    ingredientId: 'ING-01',
    ingredientName: 'Günlük Taze Kuzu Ciğeri',
    movementType: 'recipe_deduction',
    quantityDelta: -0.44,
    unit: 'kg',
    unitCostSnapshot: 620,
    referenceId: 'OZT-2026-1041',
    note: 'Sipariş #OZT-2026-1041 reçete otomatik stok düşümü',
    actorName: 'Sistem Reçete Motoru',
  },
  {
    id: 'MOV-103',
    timestamp: '2026-11-16 11:30',
    ingredientId: 'ING-04',
    ingredientName: 'Mor Soğan & Maydanoz Demeti',
    movementType: 'waste',
    quantityDelta: -1.2,
    unit: 'kg',
    unitCostSnapshot: 42,
    referenceId: 'FIRE-11',
    note: 'Ayıklama fire kaydı (Silinmez stok hareketi)',
    actorName: 'Ahmet Usta',
  },
];

export const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: 'CUS-01',
    name: 'Kemalettin Soylu',
    phone: '0544 312 09 44',
    email: 'k.soylu@ornek.com.tr',
    address: 'Gaziosmanpaşa Mah. Uğur Mumcu Cad. No: 42',
    district: 'Çankaya',
    group: 'VIP Misafir',
    birthDate: '1982-04-18',
    points: 1450,
    walletBalance: 350,
    totalOrders: 28,
    totalSpent: 34200,
    preferences: 'Acılı ciğer şiş, bakır ocakbaşı kenarı, çift lavaş',
    referralCode: 'OZT-KEMAL82',
    kvkkApproved: true,
    marketingSmsApproved: false, // Bölüm 15: Varsayılan olarak verilmemelidir
  },
  {
    id: 'CUS-02',
    name: 'Zeynep Aksoy',
    phone: '0533 899 12 34',
    email: 'zeynep.aksoy@ornek.com.tr',
    address: 'Çankaya Mah. Atatürk Bulvarı No: 118 D:4',
    district: 'Çankaya',
    group: 'Sadık Müşteri',
    birthDate: '1991-11-16',
    points: 680,
    walletBalance: 120,
    totalOrders: 14,
    totalSpent: 11800,
    preferences: 'Soğansız dürüm, bol sumak',
    referralCode: 'OZT-ZEYNEP91',
    kvkkApproved: true,
    marketingSmsApproved: true,
  },
  {
    id: 'CUS-03',
    name: 'Hakan Karahan',
    phone: '0532 701 44 10',
    email: 'hkarahan@kurumsal.com.tr',
    address: 'Söğütözü Plaza Kat: 9',
    district: 'Söğütözü',
    group: 'Kurumsal',
    birthDate: '1978-09-03',
    points: 2210,
    walletBalance: 0,
    totalOrders: 19,
    totalSpent: 48900,
    preferences: 'Kurumsal e-Fatura, VIP Aile Salonu',
    referralCode: 'OZT-HAKAN78',
    kvkkApproved: true,
    marketingSmsApproved: false,
  },
];

export const INITIAL_RESERVATIONS: ReservationItem[] = [
  {
    id: 'RES-101',
    customerName: 'Prof. Dr. Selim Erdem',
    customerPhone: '0532 611 22 90',
    guestCount: 6,
    date: '2026-11-16',
    time: '19:30',
    tableId: 'TBL-06',
    tableNumber: 'Ocakbaşı 1',
    status: 'confirmed',
    depositAmount: 1000,
    depositPaid: true,
    specialRequests: 'Bakır ocakbaşı kenarı, 2 porsiyon zırh kebabı ön hazırlığı',
    source: 'online',
  },
  {
    id: 'RES-102',
    customerName: 'Ayşegül Çetin',
    customerPhone: '0542 881 19 05',
    guestCount: 4,
    date: '2026-11-16',
    time: '20:00',
    tableId: 'TBL-08',
    tableNumber: 'VIP 1',
    status: 'pending',
    depositAmount: 500,
    depositPaid: false,
    specialRequests: 'Doğum günü masası, bebek sandalyesi',
    source: 'phone',
  },
];

export const INITIAL_CAMPAIGNS: CampaignRecord[] = [
  {
    id: 'CMP-01',
    name: 'Öğle Saatleri Ciğer Dürüm İndirimi',
    type: 'Saat bazlı kampanya',
    couponCode: 'OGLECIGER15',
    discountValue: 15,
    minOrderAmount: 350,
    usageLimit: 200,
    usedCount: 47,
    canCombine: false,
    startDate: '2026-11-01',
    endDate: '2026-12-31',
    isActive: true,
  },
  {
    id: 'CMP-02',
    name: 'İlk Online QR & Web Sipariş Hoş Geldin İndirimi',
    type: 'İlk sipariş kampanyası',
    couponCode: 'MERHABAOZTIKE',
    discountValue: 100,
    minOrderAmount: 600,
    usageLimit: 500,
    usedCount: 128,
    canCombine: false,
    startDate: '2026-10-01',
    endDate: '2026-12-31',
    isActive: true,
  },
  {
    id: 'CMP-03',
    name: 'Sadakat Puanı Çift Kat Kazanç Günü',
    type: 'Sadakat kampanyası',
    couponCode: 'SADAKAT2X',
    discountValue: 10,
    minOrderAmount: 500,
    usageLimit: 300,
    usedCount: 64,
    canCombine: true,
    startDate: '2026-11-01',
    endDate: '2026-11-30',
    isActive: true,
  },
];

export const INITIAL_STAFF: StaffMember[] = [
  { id: 'STF-01', name: 'Cihan ÖzTike', role: 'Süper Yönetici', phone: '0532 100 10 01', email: 'cihan@oztikeciger.com.tr', branch: 'Merkez Şube', shift: '09:00 - 22:00', twoFactorEnabled: true, activeSessionDevice: 'MacBook Pro · Chrome (192.168.1.10)', ordersHandledToday: 18, salesToday: 24500, isActive: true },
  { id: 'STF-02', name: 'Mehmet Kaya', role: 'İşletme Müdürü', phone: '0532 100 10 02', email: 'mehmet@oztikeciger.com.tr', branch: 'Merkez Şube', shift: '10:00 - 22:00', twoFactorEnabled: true, activeSessionDevice: 'iPad Pro · Safari (192.168.1.14)', ordersHandledToday: 12, salesToday: 16400, isActive: true },
  { id: 'STF-03', name: 'Seda Arslan', role: 'Kasiyer', phone: '0532 100 10 03', email: 'kasa@oztikeciger.com.tr', branch: 'Merkez Şube', shift: '10:00 - 20:00', twoFactorEnabled: true, activeSessionDevice: 'POS Terminal #1 (192.168.1.20)', ordersHandledToday: 42, salesToday: 48900, isActive: true },
  { id: 'STF-04', name: 'Murat Demir', role: 'Garson', phone: '0532 100 10 04', email: 'murat@oztikeciger.com.tr', branch: 'Merkez Şube', shift: '11:00 - 23:00', twoFactorEnabled: false, activeSessionDevice: 'Android El Terminali (192.168.1.31)', ordersHandledToday: 27, salesToday: 31200, isActive: true },
  { id: 'STF-05', name: 'Elif Yılmaz', role: 'Garson', phone: '0532 100 10 05', email: 'elif@oztikeciger.com.tr', branch: 'Merkez Şube', shift: '11:00 - 23:00', twoFactorEnabled: false, activeSessionDevice: 'iPhone 15 · PWA (192.168.1.32)', ordersHandledToday: 24, salesToday: 27850, isActive: true },
  { id: 'STF-06', name: 'Ahmet Usta', role: 'Mutfak', phone: '0532 100 10 06', email: 'mutfak@oztikeciger.com.tr', branch: 'Merkez Şube', shift: '09:30 - 22:30', twoFactorEnabled: false, activeSessionDevice: 'Mutfak KDS Ekran #1 (192.168.1.40)', ordersHandledToday: 64, salesToday: 0, isActive: true },
  { id: 'STF-07', name: 'Serkan Çelik', role: 'Kurye', phone: '0532 100 10 07', email: 'kurye@oztikeciger.com.tr', branch: 'Merkez Şube', shift: '11:30 - 22:30', twoFactorEnabled: false, activeSessionDevice: 'Kurye Mobil PWA', ordersHandledToday: 19, salesToday: 12450, isActive: true },
  { id: 'STF-08', name: 'Kadir Doğan', role: 'Depo Sorumlusu', phone: '0532 100 10 08', email: 'depo@oztikeciger.com.tr', branch: 'Merkez Şube', shift: '08:00 - 18:00', twoFactorEnabled: true, activeSessionDevice: 'Depo Tablet #1', ordersHandledToday: 0, salesToday: 0, isActive: true },
  { id: 'STF-09', name: 'Berna Tekin', role: 'Muhasebe', phone: '0532 100 10 09', email: 'muhasebe@oztikeciger.com.tr', branch: 'Merkez Şube', shift: '09:00 - 18:00', twoFactorEnabled: true, activeSessionDevice: 'Ofis Masaüstü PC', ordersHandledToday: 0, salesToday: 0, isActive: true },
  { id: 'STF-10', name: 'Deniz Akın', role: 'İçerik Editörü', phone: '0532 100 10 10', email: 'icerik@oztikeciger.com.tr', branch: 'Merkez Şube', shift: '09:00 - 18:00', twoFactorEnabled: true, activeSessionDevice: 'MacBook Air', ordersHandledToday: 0, salesToday: 0, isActive: true },
];

export const INITIAL_FINANCE_LEDGER: FinanceLedgerItem[] = [
  { id: 'FIN-01', date: '2026-11-16 13:10', type: 'Gelir', category: 'Restoran Masa & POS Satışı', description: 'Öğle vardiyası tahsilatları (Nakit + Fiziksel POS)', amount: 42650, paymentMethod: 'Çoklu (Nakit / POS)', recordedBy: 'Seda Arslan', branchId: 'BR-01' },
  { id: 'FIN-02', date: '2026-11-16 12:50', type: 'Gelir', category: 'Online & Paket Servis', description: 'iyzico ve kapıda ödeme paket tahsilatları', amount: 18400, paymentMethod: 'iyzico / Kapıda POS', recordedBy: 'Seda Arslan', branchId: 'BR-01' },
  { id: 'FIN-03', date: '2026-11-16 09:15', type: 'Gider', category: 'Et & Sakatat Tedarik', description: 'Trakya Besi Çiftliği – Günlük Kuzu Ciğeri Faturası #FAT-881', amount: 12400, paymentMethod: 'Banka Havalesi', recordedBy: 'Berna Tekin', branchId: 'BR-01' },
  { id: 'FIN-04', date: '2026-11-16 10:00', type: 'Gider', category: 'Meşe Kömürü & Sarf', description: 'Kokusuz meşe odun kömürü (25 Çuval)', amount: 4800, paymentMethod: 'Nakit Kasa Çıkışı', recordedBy: 'Kadir Doğan', branchId: 'BR-01' },
];

// BÖLÜM 17: 16 HAZIR WEB SİTESİ VE SEO SAYFA TASLAKLARI
export const INITIAL_CMS_PAGES: CMSPageItem[] = [
  { id: 'PG-01', title: 'Ana Sayfa', subtitle: 'Geleneksel Meşe Közü Lezzetleri', slug: '/', imageUrl: '/assets/aistudio/crops/hero-ciger.png', content: 'ÖzTike Ciğer · Halil Usta olarak 1996 yılından bu yana günlük taze kuzu ciğeri, zırh kebapları ve sıcak tandır lavaşını sıcak Urfa misafirperverliğiyle buluşturuyoruz.', status: 'Yayında', seoTitle: 'ÖzTike Ciğer | Geleneksel Kuzu Ciğer Şiş & Ocakbaşı', metaDescription: 'Meşe kömüründe günlük taze kuzu ciğer şiş ve zırh kebapları.', canonical: 'https://oztikeciger.com.tr/', robots: 'index, follow', schemaType: 'Restaurant', requiresLegalReview: false, updatedAt: '2026-11-16' },
  { id: 'PG-02', title: 'Hakkımızda', subtitle: '1996’dan Beri Süregelen Ocakbaşı Mirası', slug: '/hakkimizda', imageUrl: '/assets/aistudio/crops/chef-usta.png', content: 'Halil Usta’nın Şahinbey / Gaziantep ocakbaşı geleneğini taşıyan mutfağımızda, her sabah seçilen günlük taze erkek kuzu ciğeri yaprak gibi doğranır, meşe odunu közünde tam kıvamında pişirilir.', status: 'Yayında', seoTitle: 'Hakkımızda – ÖzTike Ciğer Ustalık Mirası', metaDescription: 'ÖzTike Ciğer ocakbaşı kültürünün hikayesi ve ustalık ilkeleri.', canonical: 'https://oztikeciger.com.tr/hakkimizda', robots: 'index, follow', schemaType: 'AboutPage', requiresLegalReview: false, updatedAt: '2026-11-16' },
  { id: 'PG-03', title: 'Menü', subtitle: 'Ciğer, Kebap, Döner, Lahmacun & İkram Mezeler', slug: '/menu', imageUrl: '/assets/aistudio/crops/cat-ciger.png', content: 'Ciğer şiş, zırh kıyma Adana ve Urfa kebapları, taş fırın lahmacun, yaprak et döner, taze mevsim salataları ve bakır kupada yayık ayran çeşitlerimizle hizmetinizdeyiz.', status: 'Yayında', seoTitle: 'Menü & Fiyatlarımız – ÖzTike Ciğer', metaDescription: 'Ciğer kebapları, zırh kebap, tavuk şiş, döner, lahmacun, salata ve içeceklerimiz.', canonical: 'https://oztikeciger.com.tr/menu', robots: 'index, follow', schemaType: 'Menu', requiresLegalReview: false, updatedAt: '2026-11-16' },
  { id: 'PG-04', title: 'Kategoriler', subtitle: 'Her Damağa Uygun Ocakbaşı Çeşitleri', slug: '/kategoriler', imageUrl: '/assets/aistudio/crops/cat-kebap.png', content: 'Ciğer, Kebap, Tavuk, Döner, Lahmacun, Yeşillikler & Salatalar ve İçecekler kategorilerimizde dilediğiniz baharat ve salata eşlikçisini seçebilirsiniz.', status: 'Yayında', seoTitle: 'Lezzet Kategorilerimiz – ÖzTike Ciğer', metaDescription: '7 ana kategoride geleneksel ocakbaşı lezzetleri.', canonical: 'https://oztikeciger.com.tr/kategoriler', robots: 'index, follow', schemaType: 'CollectionPage', requiresLegalReview: false, updatedAt: '2026-11-16' },
  { id: 'PG-05', title: 'Kampanyalar', subtitle: 'Öğle Saatleri & Aile Menüsü Avantajları', slug: '/kampanyalar', imageUrl: '/assets/aistudio/crops/gallery-1.png', content: 'Sepet aşamasında kupon kodunuzu seçerek anında indirimlerden yararlanabilirsiniz.', status: 'Yayında', seoTitle: 'Güncel Kampanyalar & Menü Paketleri – ÖzTike Ciğer', metaDescription: 'Saat bazlı indirimler, aile menüleri ve sadakat avantajları.', canonical: 'https://oztikeciger.com.tr/kampanyalar', robots: 'index, follow', schemaType: 'OfferCatalog', requiresLegalReview: false, updatedAt: '2026-11-16' },
  { id: 'PG-06', title: 'Galeri', subtitle: 'Bakır Ocakbaşı & Taş Bahçemizden Kareler', slug: '/galeri', imageUrl: '/assets/aistudio/crops/gallery-2.png', content: 'Ocakbaşı ustalarımızın sunumlarından ve restoran atmosferimizden seçkin fotoğraf ve videolar.', status: 'Yayında', seoTitle: 'Mekan & Ocakbaşı Galerisi – ÖzTike Ciğer', metaDescription: 'Bakır ocakbaşımız, taş bahçemiz ve sunumlarımızdan kareler.', canonical: 'https://oztikeciger.com.tr/galeri', robots: 'index, follow', schemaType: 'ImageGallery', requiresLegalReview: false, updatedAt: '2026-11-16' },
  { id: 'PG-07', title: 'Blog', subtitle: 'Gerçek Kuzu Ciğeri Nasıl Pişirilir?', slug: '/blog', imageUrl: '/assets/aistudio/crops/gallery-3.png', content: 'Meşe kömürü seçimi, kuyruk yağı dengesi ve Urfa isotunun lezzet sırrı hakkındaki yazılarımız.', status: 'Yayında', seoTitle: 'Ocakbaşı Kültür Blogu – ÖzTike Ciğer', metaDescription: 'Ciğer kebabı pişirme sırları, zırh kıyması ve yöresel baharatlar.', canonical: 'https://oztikeciger.com.tr/blog', robots: 'index, follow', schemaType: 'Blog', requiresLegalReview: false, updatedAt: '2026-11-16' },
  { id: 'PG-08', title: 'İletişim', subtitle: 'Merkez Şube · 11:00 – 24:00', slug: '/iletisim', imageUrl: '/assets/aistudio/crops/gallery-1.png', content: 'Karagöz Mah. Şahinbey Cad. No: 42 Şahinbey / Gaziantep adresimizde her gün 11:00 – 24:00 saatleri arasında hizmet veriyoruz.', status: 'Yayında', seoTitle: 'İletişim & Yol Tarifi – ÖzTike Ciğer', metaDescription: 'Şahinbey Gaziantep merkez şube adresimiz, telefonumuz ve çalışma saatlerimiz.', canonical: 'https://oztikeciger.com.tr/iletisim', robots: 'index, follow', schemaType: 'ContactPage', requiresLegalReview: false, updatedAt: '2026-11-16' },
  { id: 'PG-09', title: 'Rezervasyon', subtitle: 'Bakır Ocakbaşı & VIP Aile Salonu', slug: '/rezervasyon', imageUrl: '/assets/aistudio/crops/gallery-2.png', content: 'Kalabalık aile yemekleri ve özel akşam davetleriniz için önceden masa ayırtabilirsiniz.', status: 'Yayında', seoTitle: 'Online Masa Rezervasyonu – ÖzTike Ciğer', metaDescription: 'Bakır ocakbaşı, taş bahçe ve VIP salonumuz için anında rezervasyon.', canonical: 'https://oztikeciger.com.tr/rezervasyon', robots: 'index, follow', schemaType: 'FoodEstablishmentReservation', requiresLegalReview: false, updatedAt: '2026-11-16' },
  { id: 'PG-10', title: 'Sipariş Takibi', subtitle: 'Canlı Mutfak & Kurye Durumu', slug: '/siparis-takibi', imageUrl: '/assets/aistudio/crops/cat-ciger.png', content: 'Masadan verdiğiniz QR siparişlerin ve kurye paket siparişlerinizin anlık hazırlanma durumunu takip edin.', status: 'Yayında', seoTitle: 'Canlı Sipariş Takibi – ÖzTike Ciğer', metaDescription: 'Masa, Gel-Al veya paket servis siparişinizin durumunu canlı izleyin.', canonical: 'https://oztikeciger.com.tr/siparis-takibi', robots: 'noindex, follow', schemaType: 'WebPage', requiresLegalReview: false, updatedAt: '2026-11-16' },
  { id: 'PG-11', title: 'Sıkça Sorulan Sorular', subtitle: 'Teslimat, Alerjen & Helal Kesim', slug: '/sss', status: 'Yayında', seoTitle: 'Sıkça Sorulan Sorular (SSS) – ÖzTike Ciğer', metaDescription: 'Teslimat bölgeleri, alerjen bilgileri ve rezervasyon koşulları.', canonical: 'https://oztikeciger.com.tr/sss', robots: 'index, follow', schemaType: 'FAQPage', requiresLegalReview: false, updatedAt: '2026-11-16' },
  { id: 'PG-12', title: 'Gizlilik Politikası', slug: '/gizlilik-politikasi', status: 'Taslak', seoTitle: 'Gizlilik Politikası – ÖzTike Ciğer', metaDescription: 'Kişisel verilerin korunması ve gizlilik ilkelerimiz.', canonical: 'https://oztikeciger.com.tr/gizlilik-politikasi', robots: 'noindex, follow', schemaType: 'WebPage', requiresLegalReview: true, updatedAt: '2026-11-16' },
  { id: 'PG-13', title: 'KVKK Aydınlatma Metni', slug: '/kvkk', status: 'Taslak', seoTitle: '6698 Sayılı KVKK Aydınlatma Metni – ÖzTike Ciğer', metaDescription: 'KVKK kapsamında veri sorumlusu aydınlatma metni (Hukuk incelemesi gerektirir).', canonical: 'https://oztikeciger.com.tr/kvkk', robots: 'noindex, follow', schemaType: 'WebPage', requiresLegalReview: true, updatedAt: '2026-11-16' },
  { id: 'PG-14', title: 'Çerez Politikası', slug: '/cerez-politikasi', status: 'Taslak', seoTitle: 'Çerez (Cookie) Politikası – ÖzTike Ciğer', metaDescription: 'Oturum ve güvenlik çerezlerinin kullanım esasları.', canonical: 'https://oztikeciger.com.tr/cerez-politikasi', robots: 'noindex, follow', schemaType: 'WebPage', requiresLegalReview: true, updatedAt: '2026-11-16' },
  { id: 'PG-15', title: 'Mesafeli Satış Sözleşmesi', slug: '/mesafeli-satis', status: 'Taslak', seoTitle: 'Mesafeli Satış Sözleşmesi – ÖzTike Ciğer', metaDescription: 'Online sipariş mesafeli satış sözleşmesi taslağı.', canonical: 'https://oztikeciger.com.tr/mesafeli-satis', robots: 'noindex, follow', schemaType: 'WebPage', requiresLegalReview: true, updatedAt: '2026-11-16' },
  { id: 'PG-16', title: 'Kullanım Koşulları', slug: '/kullanim-kosullari', status: 'Taslak', seoTitle: 'Web Sitesi ve QR Menü Kullanım Koşulları', metaDescription: 'Hizmet kullanım şartları ve sorumluluk sınırları.', canonical: 'https://oztikeciger.com.tr/kullanim-kosullari', robots: 'noindex, follow', schemaType: 'WebPage', requiresLegalReview: true, updatedAt: '2026-11-16' },
];

// BÖLÜM 19: 28 EKLENTİ VE ENTEGRASYON MERKEZİ
export const INITIAL_INTEGRATIONS: IntegrationPluginItem[] = [
  {
    id: 'INT-01',
    code: 'iyzico-pos',
    name: 'iyzico Korumalı Sanal POS & PayTR Adaptörü',
    category: 'Ödeme',
    version: '2.4.1',
    scope: 'payments:write, webhooks:verify, refunds:execute',
    installed: true,
    enabled: true,
    mode: 'Test (Sandbox)',
    lastTested: '16 Kas 2026 13:00',
    contractVerified: false,
    description: '3D Secure online kart tahsilatı, taksit seçenekleri ve anlık iade yönetimi.',
    settings: { merchantId: 'OZT-IYZ-27001', apiKeyMasked: 'sandbox-iyz-****88a', threeDSecureRequired: true, commissionRatePercent: 1.89 },
  },
  {
    id: 'INT-02',
    code: 'whatsapp-cloud',
    name: 'WhatsApp Business Cloud Bildirim Modülü',
    category: 'WhatsApp Business',
    version: '1.8.0',
    scope: 'reservations:notify, orders:tracking',
    installed: true,
    enabled: true,
    mode: 'Test (Sandbox)',
    lastTested: '16 Kas 2026 12:30',
    contractVerified: false,
    description: 'Sipariş onayı, masa rezervasyon hatırlatması ve kurye takip linki gönderimi.',
    settings: { phoneNumberId: '905551234567', templateLanguage: 'tr', sendOrderConfirm: true, sendCourierLink: true },
  },
  {
    id: 'INT-03',
    code: 'netgsm-sms',
    name: 'NetGSM / İletiMerkezi OTP & Bildirim SMS',
    category: 'SMS',
    version: '1.5.2',
    scope: 'auth:2fa, customer:sms_consent_only',
    installed: true,
    enabled: true,
    mode: 'Test (Sandbox)',
    lastTested: '16 Kas 2026 11:45',
    contractVerified: false,
    description: 'Müşteri doğrulama kodları ve sipariş hazır SMS uyarıları.',
    settings: { senderHeader: 'OZTIKECIGER', dailyQuota: 5000, requireKvkkConsent: true },
  },
  {
    id: 'INT-04',
    code: 'smtp-mailer',
    name: 'Kurumsal TLS SMTP E-Posta Motoru',
    category: 'SMTP e-posta',
    version: '1.2.0',
    scope: 'mail:transactional, reports:daily',
    installed: true,
    enabled: true,
    mode: 'Canlı (Live)',
    lastTested: '16 Kas 2026 09:00',
    contractVerified: true,
    description: 'e-Arşiv fatura PDF gönderimi ve gün sonu yönetici Z-raporu e-postası.',
    settings: { smtpHost: 'mail.oztikeciger.com.tr', port: 465, useTls: true, fromEmail: 'bildirim@oztikeciger.com.tr' },
  },
  {
    id: 'INT-05',
    code: 'geo-maps',
    name: 'Google Maps & Çoklu Navigasyon Harita Servisi',
    category: 'Harita',
    version: '2.0.0',
    scope: 'delivery:zones, address:geocode, navigation:multi',
    installed: true,
    enabled: true,
    mode: 'Canlı (Live)',
    lastTested: '16 Kas 2026 10:15',
    contractVerified: true,
    description: 'Google Maps ana harita, Apple Maps, Yandex, Waze ve OpenStreetMap navigasyon köprüsü.',
    settings: { centerLat: '37.0628', centerLng: '37.3795', deliveryRadiusKm: 12, showMultiAppButtons: true },
  },
  {
    id: 'INT-06',
    code: 'ga4-gtm',
    name: 'Google Analytics 4 & Search Console Köprüsü',
    category: 'Analitik',
    version: '1.1.4',
    scope: 'seo:metrics, web:events',
    installed: true,
    enabled: true,
    mode: 'Canlı (Live)',
    lastTested: '16 Kas 2026 08:30',
    contractVerified: true,
    description: 'Sayfa görüntüleme, sepete ekleme ve sipariş dönüşüm hunisi ölçümü.',
    settings: { measurementId: 'G-OZTIKE2026TR', anonymizeIp: true, trackMenuClicks: true },
  },
  {
    id: 'INT-07',
    code: 'escpos-thermal',
    name: 'ESC/POS Ethernet Mutfak & Adisyon Yazıcı Yönlendirici',
    category: 'Yazıcı',
    version: '3.0.1',
    scope: 'kitchen:print, pos:receipt',
    installed: true,
    enabled: true,
    mode: 'Canlı (Live)',
    lastTested: '16 Kas 2026 13:15',
    contractVerified: true,
    description: '80mm ve 58mm termal fiş yazıcılar ile mutfak istasyonu otomatik adisyon yazdırma.',
    settings: { printerIp: '192.168.1.201', port: 9100, paperWidthMm: 80, autoCutPaper: true },
  },
  {
    id: 'INT-08',
    code: 'ean13-scanner',
    name: 'HID / Kamera Barkod & Terazi Okuyucu',
    category: 'Barkod',
    version: '1.4.0',
    scope: 'pos:barcode, inventory:lot_scan',
    installed: true,
    enabled: true,
    mode: 'Canlı (Live)',
    lastTested: '16 Kas 2026 12:00',
    contractVerified: true,
    description: 'Depo stok kabulü ve POS hızlı ürün okutma için EAN-13 / QR tarayıcı desteği.',
    settings: { prefixLength: 3, autoSubmitOnEnter: true, enableCameraScan: true },
  },
  {
    id: 'INT-09',
    code: 'courier-dispatch',
    name: 'Kurye Saha & Rota Atama Adaptörü',
    category: 'Kurye',
    version: '1.2.2',
    scope: 'delivery:assign, courier:status',
    installed: true,
    enabled: true,
    mode: 'Canlı (Live)',
    lastTested: '16 Kas 2026 13:10',
    contractVerified: true,
    description: 'Paket siparişlerin aktif kuryelere atanması ve 5 adımlı teslimat takibi.',
    settings: { autoAssignNearest: false, courierFeeTry: 35, maxSimultaneousOrders: 4 },
  },
  {
    id: 'INT-10',
    code: 'erp-accounting',
    name: 'Genel Muhasebe & Maliyet Fiş Aktarımı',
    category: 'Muhasebe',
    version: '1.6.0',
    scope: 'finance:export, purchases:sync',
    installed: true,
    enabled: true,
    mode: 'Test (Sandbox)',
    lastTested: '15 Kas 2026 18:00',
    contractVerified: false,
    description: 'Logo / Mikro / Paraşüt uyumlu KDV ve günlük ciro mahsup fişi dışa aktarımı.',
    settings: { defaultVatPercent: 10, exportFormat: 'CSV-UTF8', autoDailyExport: true },
  },
  {
    id: 'INT-11',
    code: 'gib-ebelge',
    name: 'GİB Yetkili Özel Entegratör e-Fatura / e-Arşiv',
    category: 'E-belge',
    version: '2.1.0',
    scope: 'invoice:gib_signed',
    installed: true,
    enabled: false,
    mode: 'Test (Sandbox)',
    lastTested: 'Henüz test edilmedi',
    contractVerified: false,
    description: 'Fiş ve kurumsal yemek faturalarını doğrudan GİB e-Arşiv portalına iletir.',
    settings: { integrator: 'Uyumsoft / QNB', aliasUrn: 'urn:mail:defaultpk@oztikeciger.com.tr', autoIssueOnPaid: false },
  },
  {
    id: 'INT-12',
    code: 'crm-loyalty-mkt',
    name: 'İzinli Pazarlama & Sadakat Kampanya Motoru',
    category: 'Pazarlama',
    version: '1.1.0',
    scope: 'campaigns:dispatch, consents:verify',
    installed: true,
    enabled: true,
    mode: 'Canlı (Live)',
    lastTested: '16 Kas 2026 10:00',
    contractVerified: true,
    description: 'Puan biriktirme, doğum günü ikramı ve açılır popup kampanya yönetimi.',
    settings: { pointsPer100Try: 10, enablePopupCampaigns: true, strictKvkkFilter: true },
  },
  {
    id: 'INT-13',
    code: 'waf-shield',
    name: 'PDO / CSRF / Rate-Limit Güvenlik Duvarı',
    category: 'Güvenlik',
    version: '1.9.0',
    scope: 'security:audit, sessions:guard',
    installed: true,
    enabled: true,
    mode: 'Canlı (Live)',
    lastTested: '16 Kas 2026 13:20',
    contractVerified: true,
    description: 'Masa QR token doğrulama, kaba kuvvet koruması ve denetim izi kaydı.',
    settings: { rateLimitPerMinute: 20, blockSuspiciousIp: true, sessionTimeoutMin: 120 },
  },
  {
    id: 'INT-14',
    code: 'cron-automation',
    name: 'Gün Sonu & Kritik Stok Otomasyon Görevleri',
    category: 'Otomasyon',
    version: '1.0.5',
    scope: 'tasks:cron, alerts:dispatch',
    installed: true,
    enabled: true,
    mode: 'Canlı (Live)',
    lastTested: '16 Kas 2026 04:00',
    contractVerified: true,
    description: 'Gece 23:59 sonrası tamamlanan sipariş ve çağrıları tarih bazlı arşive taşır.',
    settings: { archiveHour: '00:05', autoArchiveCompletedOrders: true, lowStockAlertThresholdKg: 5 },
  },
  {
    id: 'INT-15',
    code: 'hmac-webhooks',
    name: 'HMAC-SHA256 İmzalı Webhook Dağıtıcı',
    category: 'Webhook',
    version: '1.3.1',
    scope: 'webhooks:hmac, idempotency:guard',
    installed: true,
    enabled: true,
    mode: 'Canlı (Live)',
    lastTested: '16 Kas 2026 13:05',
    contractVerified: true,
    description: 'Harici ERP veya kurye servislerine sipariş olaylarını imzalı POST olarak iletir.',
    settings: { webhookUrl: 'https://api.oztikeciger.com.tr/hooks/orders', retryCount: 3, signWithHmac: true },
  },
  {
    id: 'INT-16',
    code: 'gemini-advisor',
    name: 'ÖzTike Yapay Zekâ Lezzet & Karar Destek Asistanı',
    category: 'Yapay zekâ',
    version: '2.0.0',
    scope: 'assistant:8_lang, menu:recommend',
    installed: true,
    enabled: true,
    mode: 'Canlı (Live)',
    lastTested: '16 Kas 2026 13:25',
    contractVerified: true,
    description: '8 dilde müşteriye ciğer/kebap/içecek öneren ve doğrudan sepete ekleyen AI asistan.',
    settings: { defaultTone: 'Samimi Gaziantep Misafirperverliği', supportedLanguagesCount: 8, allowDirectAddToCart: true },
  },
  {
    id: 'INT-17',
    code: 'getir-yemek',
    name: 'Getir Yemek Sipariş & Menü Senkronizasyonu',
    category: 'Yemek Platformu',
    version: '2.3.0',
    scope: 'marketplace:orders, menu:sync',
    installed: true,
    enabled: true,
    mode: 'Test (Sandbox)',
    lastTested: '16 Kas 2026 11:10',
    contractVerified: false,
    description: 'Getir Yemek siparişlerini otomatik Mutfak KDS ve Kasa ekranına düşürür.',
    settings: { restaurantSecretKey: 'gtr-shb-****19', autoAcceptOrder: true, commissionRatePercent: 18 },
  },
  {
    id: 'INT-18',
    code: 'yemeksepeti-valet',
    name: 'Yemeksepeti Vale & Restoran Kurye Entegrasyonu',
    category: 'Yemek Platformu',
    version: '3.1.2',
    scope: 'marketplace:orders, status:push',
    installed: true,
    enabled: true,
    mode: 'Test (Sandbox)',
    lastTested: '16 Kas 2026 11:15',
    contractVerified: false,
    description: 'Yemeksepeti gelen siparişleri, ürün stok durumu ve kurye teslim onayları.',
    settings: { chainCode: 'OZT-GAZ-01', prepTimeMinutes: 18, autoPrintKitchenSlip: true },
  },
  {
    id: 'INT-19',
    code: 'trendyol-go',
    name: 'Trendyol GO Yemek Hızlı Entegratör',
    category: 'Yemek Platformu',
    version: '1.9.4',
    scope: 'marketplace:orders, pricing:sync',
    installed: true,
    enabled: false,
    mode: 'Test (Sandbox)',
    lastTested: '15 Kas 2026 20:00',
    contractVerified: false,
    description: 'Trendyol GO yemek panelindeki sipariş ve menü fiyatlarını anlık eşitler.',
    settings: { supplierId: 'TY-27042', branchCode: 'SAHINBEY-01', syncMenuPrices: true },
  },
  {
    id: 'INT-20',
    code: 'migros-yemek',
    name: 'Migros Yemek Sipariş Köprüsü',
    category: 'Yemek Platformu',
    version: '1.4.0',
    scope: 'marketplace:orders, courier:notify',
    installed: true,
    enabled: false,
    mode: 'Test (Sandbox)',
    lastTested: 'Henüz test edilmedi',
    contractVerified: false,
    description: 'Migros Yemek üzerinden gelen paket siparişlerin tek ekranda yönetimi.',
    settings: { storeId: 'MGR-27100', autoConfirm: true },
  },
  {
    id: 'INT-21',
    code: 'meal-cards-hub',
    name: 'Multinet / Sodexo (Pluxee) / Edenred / Setcard Yemek Kartı Hub',
    category: 'Ödeme',
    version: '2.2.0',
    scope: 'payments:meal_cards, pos:close_bill',
    installed: true,
    enabled: true,
    mode: 'Canlı (Live)',
    lastTested: '16 Kas 2026 12:40',
    contractVerified: true,
    description: 'QR okutarak veya fiziksel POS üzerinden yemek kartı tahsilat desteği.',
    settings: { multinetEnabled: true, pluxeeEnabled: true, edenredEnabled: true, setcardEnabled: true },
  },
  {
    id: 'INT-22',
    code: 'parampos-virtual',
    name: 'ParamPOS & BKM TechPOS Ertesi Gün Ödeme',
    category: 'Ödeme',
    version: '1.7.0',
    scope: 'payments:write, bkm:qr_pay',
    installed: true,
    enabled: false,
    mode: 'Test (Sandbox)',
    lastTested: 'Henüz test edilmedi',
    contractVerified: false,
    description: 'Yedek sanal POS altyapısı ve masaüstü karekod ile BKM Ekspress tahsilat.',
    settings: { clientCode: 'PRM-27009', bkmQrEnabled: true },
  },
  {
    id: 'INT-23',
    code: 'meta-capi-pixel',
    name: 'Meta Pixel & Instagram Dönüşüm API (CAPI)',
    category: 'Pazarlama',
    version: '1.5.0',
    scope: 'ads:retargeting, catalog:menu',
    installed: true,
    enabled: true,
    mode: 'Canlı (Live)',
    lastTested: '16 Kas 2026 09:45',
    contractVerified: true,
    description: 'Instagram reklamlarından gelen sipariş ve masa rezervasyon dönüşümlerini ölçer.',
    settings: { pixelId: '88270421996', sendPurchaseEvents: true },
  },
  {
    id: 'INT-24',
    code: 'network-escpos-star',
    name: 'Star Micronics / Epson TM-T88 Ağ Yazıcı Sürücüsü',
    category: 'Yazıcı',
    version: '2.1.0',
    scope: 'printer:network_lan, drawer:kick',
    installed: true,
    enabled: true,
    mode: 'Canlı (Live)',
    lastTested: '16 Kas 2026 13:18',
    contractVerified: true,
    description: 'Kasa çekmecesi açma komutu ve logolu 80mm / 58mm termal fiş çıktısı.',
    settings: { openCashDrawerOnCashPay: true, logoDithering: 'FloydSteinberg', copiesPerOrder: 1 },
  },
  {
    id: 'INT-25',
    code: 'apple-google-pay',
    name: 'Apple Pay & Google Pay Tek Tık Ekspres Ödeme',
    category: 'Ödeme',
    version: '1.3.0',
    scope: 'wallet:express_checkout',
    installed: true,
    enabled: true,
    mode: 'Test (Sandbox)',
    lastTested: '16 Kas 2026 12:15',
    contractVerified: true,
    description: 'Mobil tarayıcı ve PWA uygulamasında tek dokunuşla temassız cüzdan ödemesi.',
    settings: { merchantDomain: 'oztikeciger.com.tr', enableApplePay: true, enableGooglePay: true },
  },
  {
    id: 'INT-26',
    code: 'pwa-webpush',
    name: 'PWA Web Push & Çevrimdışı Önbellek Motoru',
    category: 'PWA & Bildirim',
    version: '2.0.1',
    scope: 'pwa:install, push:dispatch, cache:menu',
    installed: true,
    enabled: true,
    mode: 'Canlı (Live)',
    lastTested: '16 Kas 2026 13:20',
    contractVerified: true,
    description: 'iOS, Android ve Masaüstü PWA kurulum yöneticisi ve anlık sipariş push bildirimleri.',
    settings: { offlineMenuCache: true, pushOnOrderReady: true, iosInstallBanner: true },
  },
  {
    id: 'INT-27',
    code: 'z-report-autosync',
    name: 'Otomatik Gün Sonu Z-Raporu & Arşiv Senkronizasyonu',
    category: 'Muhasebe',
    version: '1.4.2',
    scope: 'finance:z_report, archive:auto_rollover',
    installed: true,
    enabled: true,
    mode: 'Canlı (Live)',
    lastTested: '16 Kas 2026 00:05',
    contractVerified: true,
    description: 'Her gün sonunda masa hesapları, bahşişler ve KDV dökümünü arşivler.',
    settings: { autoCloseZeroTables: true, sendSummaryEmail: true },
  },
  {
    id: 'INT-28',
    code: 'multi-language-seo',
    name: '8 Dil Dinamik Meta, Geo-Tag & Schema.org Üreticisi',
    category: 'Analitik',
    version: '1.8.0',
    scope: 'seo:head_sync, schema:jsonld',
    installed: true,
    enabled: true,
    mode: 'Canlı (Live)',
    lastTested: '16 Kas 2026 10:30',
    contractVerified: true,
    description: 'Arama motorları için TR/EN/AR meta, Gaziantep coğrafi etiketleri ve JSON-LD yayınlar.',
    settings: { autoInjectJsonLd: true, includeRobotsTxt: true, includeSitemapXml: true },
  },
  {
    id: 'INT-29',
    code: 'gib-eadisyon-okc',
    name: 'GİB e-Adisyon & Yeni Nesil ÖKC (Beko / Ingenico / Profilo)',
    category: 'Muhasebe',
    version: '3.0.4',
    scope: 'gib:eadisyon, okc:gmp3_pair, tax:instant',
    installed: true,
    enabled: true,
    mode: 'Canlı (Live)',
    lastTested: '16 Kas 2026 13:30',
    contractVerified: true,
    description: 'Gelir İdaresi Başkanlığı e-Adisyon tebliğine tam uyumlu anlık masa fişi ve GMP-3 ÖKC eşleşmesi.',
    settings: {
      terminalSerialNo: 'JH90028411',
      gmp3Port: 8443,
      autoSendEadisyonOnTableOpen: true,
      okcBrand: 'Ingenico IDE280',
      ersaliyeFallback: true,
    },
  },
  {
    id: 'INT-30',
    code: 'trendyol-kurye-radar',
    name: 'Trendyol GO & Paket Mutfak Canlı Kurye GPS Radar',
    category: 'Kurye',
    version: '2.4.1',
    scope: 'courier:gps_stream, eta:predict, sms:tracking_link',
    installed: true,
    enabled: true,
    mode: 'Canlı (Live)',
    lastTested: '16 Kas 2026 13:12',
    contractVerified: true,
    description: 'Kuryelerin canlı GPS koordinatlarını müşteri takip ekranına ve ısı haritasına aktarır.',
    settings: {
      gpsPollIntervalSec: 10,
      sendLiveTrackingSms: true,
      maxRadiusKm: 12,
      heatmapColorScheme: 'copper-amber',
    },
  },
  {
    id: 'INT-31',
    code: 'tiklagelsin-fuudy-bridge',
    name: 'Tıkla Gelsin & Fuudy Gurme Sipariş Köprüsü',
    category: 'Yemek Platformu',
    version: '1.6.2',
    scope: 'marketplace:orders, stock:auto_close',
    installed: true,
    enabled: true,
    mode: 'Canlı (Live)',
    lastTested: '16 Kas 2026 12:50',
    contractVerified: true,
    description: 'Tıkla Gelsin ve Fuudy üzerinden gelen ciğer/kebap siparişlerini tek KDS kuyruğunda birleştirir.',
    settings: {
      fuudyMerchantId: 'FDY-GAZ-42',
      tiklaGelsinStoreCode: 'TG-2701',
      autoSyncOutOfStockItems: true,
      packagingFeeTry: 15,
    },
  },
  {
    id: 'INT-32',
    code: 'cpanel-mysql-cron-backup',
    name: 'cPanel PHP/MySQL Otomatik Veritabanı & Medya Yedekleyici',
    category: 'Webhook',
    version: '2.1.0',
    scope: 'cpanel:mysqldump, storage:s3_ftp, cron:hourly',
    installed: true,
    enabled: true,
    mode: 'Canlı (Live)',
    lastTested: '16 Kas 2026 13:00',
    contractVerified: true,
    description: 'cPanel paylaşımlı ve kurumsal hostinglerde MySQL veritabanını ve ürün görsellerini saatlik yedekler.',
    settings: {
      cronSchedule: '0 * * * *',
      compressGzip: true,
      keepLastBackupsCount: 30,
      remoteBackupPath: '/home/oztike/backups/mysql',
    },
  },
  {
    id: 'INT-33',
    code: 'cloudflare-turnstile-waf',
    name: 'Cloudflare Turnstile & QR Menü Sahte Sipariş Kalkanı',
    category: 'Webhook',
    version: '1.9.0',
    scope: 'security:bot_shield, qr:rate_limit, waf:geo',
    installed: true,
    enabled: true,
    mode: 'Canlı (Live)',
    lastTested: '16 Kas 2026 13:22',
    contractVerified: true,
    description: 'Masa QR siparişlerinde bot saldırılarını, sahte garson çağrılarını ve DDoS isteklerini engeller.',
    settings: {
      siteKey: '0x4AAAAAAAb99OzTikeWaf',
      blockNonTurkeyIpOnQr: false,
      maxRequestsPerMinute: 25,
      challengeMode: 'managed-invisible',
    },
  },
  {
    id: 'INT-34',
    code: 'ai-voice-ivr-order',
    name: 'Sesli Telefon Siparişi & Çağrı Merkezi AI Asistanı (IVR)',
    category: 'Yapay zekâ',
    version: '1.5.0',
    scope: 'voice:stt_tts, order:phone_create, crm:caller_id',
    installed: true,
    enabled: true,
    mode: 'Test (Sandbox)',
    lastTested: '16 Kas 2026 11:45',
    contractVerified: true,
    description: 'Telefonla arayan müşteriyi Caller-ID ile tanır, geçmiş siparişini okur ve sesli siparişi kasaya düşürür.',
    settings: {
      sipTrunkHost: 'sip.netgsm.com.tr',
      voicePersona: 'Halil Usta Misafirperver Ses Tonu',
      autoCreateDraftOrder: true,
      confidenceThresholdPercent: 85,
    },
  },
];


export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  { id: 'LOG-901', timestamp: '16 Kas 2026 13:18:12', actor: 'QR Token #OZT-QR-1D4B8F77', role: 'Garson', module: 'QR Menü', action: 'Yeni Masa Siparişi', detail: 'Bahçe 1 masası için #OZT-2026-1042 numaralı sipariş oluşturuldu (665,00 ₺)', severity: 'Normal' },
  { id: 'LOG-902', timestamp: '16 Kas 2026 13:06:04', actor: 'Ahmet Usta', role: 'Mutfak', module: 'Mutfak (KDS)', action: 'İstasyon Hazırlık Başlangıcı', detail: '#OZT-2026-1041 numaralı sipariş Izgara istasyonunda hazırlanmaya başlandı', severity: 'Normal' },
  { id: 'LOG-903', timestamp: '16 Kas 2026 12:45:30', actor: 'Sistem Reçete Motoru', role: 'Depo Sorumlusu', module: 'Stok & Reçete', action: 'Otomatik Reçete Stok Düşümü', detail: 'Günlük Taze Kuzu Ciğeri stoğundan 0.440 kg düşüldü -> Kalan: 14.500 kg (Kritik eşik uyarısı)', severity: 'Uyarı' },
  { id: 'LOG-904', timestamp: '16 Kas 2026 11:30:00', actor: 'Ahmet Usta', role: 'Mutfak', module: 'Stok Yönetimi', action: 'Fire / Zayi Kaydı', detail: 'Mor Soğan & Maydanoz kaleminde 1.200 kg hazırlık firesi işlendi (Silinmez hareket #MOV-103)', severity: 'Uyarı' },
  { id: 'LOG-905', timestamp: '16 Kas 2026 09:00:15', actor: 'Cihan ÖzTike', role: 'Süper Yönetici', module: 'Güvenlik', action: '2FA Yönetici Oturumu', detail: 'Süper Yönetici iki aşamalı doğrulama ile oturum açtı (CSRF token yenilendi)', severity: 'Kritik' },
];

export const INITIAL_BACKUPS: BackupEntry[] = [
  { id: 'BKP-01', timestamp: '16 Kas 2026 04:00', type: 'Tam Yedek (DB + Dosya)', trigger: 'Otomatik', sizeMb: 48.6, checksum: 'sha256:9f84c2e10a77b54c8d1e...3b2a', verified: true },
  { id: 'BKP-02', timestamp: '15 Kas 2026 23:55', type: 'Veritabanı (SQL)', trigger: 'Manuel', sizeMb: 12.4, checksum: 'sha256:4a12d8f03e99c12b7a4f...8e91', verified: true },
];

export const INITIAL_BRANCHES: BranchItem[] = [
  {
    id: 'BR-01',
    code: 'OZT-GAZ-01',
    name: 'ÖzTike Ciğer – Şahinbey Merkez Şube (Aktif)',
    city: 'Şahinbey / Gaziantep',
    address: 'Karagöz Mah. Şahinbey Cad. No: 42 Şahinbey / Gaziantep',
    phone: '0 (555) 123 45 67',
    isMain: true,
    isActive: true,
    dailyRevenue: 68450,
    activeTables: 5,
  },
  {
    id: 'BR-02',
    code: 'OZT-GAZ-02',
    name: 'ÖzTike Ciğer – İbrahimli Şubesi (Hazır / Pasif)',
    city: 'Şehitkamil / Gaziantep',
    address: 'Batıkent Mah. Adnan İnanıcı Cad. No: 18 Gaziantep',
    phone: '0342 320 00 27',
    isMain: false,
    isActive: false,
    dailyRevenue: 0,
    activeTables: 0,
  },
];
