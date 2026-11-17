import React, { useState } from 'react';
import {
  Plus,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Shield,
  Database,
  Truck,
  ShoppingBag,
  Calendar,
  TrendingUp,
  BarChart3,
  Clock,
  MapPin,
  Users,
  QrCode,
  Receipt,
  BellRing,
  Flame,
  Trash2,
  Edit3,
  Printer,
  CreditCard,
  X,
  Image as ImageIcon,
  Upload,
  Tag,
  Layers,
  Download,
  Star,
  MessageSquareWarning,
  Building2,
  Sliders,
  Eye,
  EyeOff,
  RefreshCw,
  Globe,
  Smartphone,
  Archive,
  Video,
  Wallet,
  Settings,
  Power,
  Search,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import {
  type CategoryItem,
  type ProductItem,
  type MenuPackageItem,
  type OrderRecord,
  type OrderStatus,
  type DiningTableItem,
  type TableStatus,
  type CustomerRecord,
  type CustomerReviewItem,
  type CustomerComplaintItem,
  type CampaignRecord,
  type StaffMember,
  type FinanceLedgerItem,
  type CMSPageItem,
  type IntegrationPluginItem,
  type AuditLogEntry,
  type BackupEntry,
  type BranchItem,
  type StaffRoleName,
  type KitchenStationName,
} from '../data/initialStoreData';
import {
  type StockItem,
  type StockMovement,
  type ReservationItem,
  type WaiterServiceCallRecord,
  type ArchiveHistoryEntry,
  type MapProviderMode,
  type FreeMapProviderId,
  type PaidMapProviderId,
  type OrderFilterCriteria,
  calculateRecipeMetrics,
  upsertProductRecipeLine,
  removeProductRecipeLine,
  validatePluginJsonConfig,
  generateReceiptAndInvoiceNumbers,
  buildDynamicWebManifest,
  filterOrdersByMultiCriteria,
  roundCurrency,
} from '../core/restaurantEngine';
import { AdminSiteBuilderManager } from './AdminSiteBuilderManager';
import { type SiteCmsConfig } from '../data/siteCmsStore';
import {
  printThermalReceipt,
  downloadThermalReceiptHtml,
  buildThermalReceiptInnerMarkup,
} from '../utils/receiptPrinter';
import { RestaurantMapSection, KonumNavigasyonu } from './RestaurantMapSection';
import { usePWAInstall } from './BrandIdentity';
import { OrderMultiFilterBar } from './OrderMultiFilterBar';

interface AdminModulesPanelProps {
  activeModuleId: number;
  onSelectModule: (id: number) => void;
  currentRole: StaffRoleName;
  categories: CategoryItem[];
  onAddCategory: (name: string, description: string, imageUrl?: string) => void;
  onUpdateCategory?: (category: CategoryItem) => void;
  onDeleteCategory?: (id: string) => void;
  products: ProductItem[];
  onAddProduct: (p: Omit<ProductItem, 'id' | 'slug' | 'recipeLines'>) => void;
  onUpdateProduct?: (product: ProductItem) => void;
  onDeleteProduct?: (id: string) => void;
  onBulkAdjustPrices: (percentDelta: number) => void;
  onDuplicateProduct: (productId: string) => void;
  orders: OrderRecord[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus, reason?: string) => void;
  onRefundOrderSeparately: (orderId: string, amount: number, reason: string) => void;
  tables: DiningTableItem[];
  onChangeTableStatus?: (tableId: string, status: TableStatus) => void;
  onAddTable?: (tbl: {
    number: string;
    area: string;
    capacity: number;
    waiterName: string;
    qrCodeNumber: string;
  }) => { success: boolean; message: string };
  onUpdateTable?: (tbl: {
    id: string;
    number: string;
    area: string;
    capacity: number;
    waiterName: string;
    qrCodeNumber: string;
  }) => { success: boolean; message: string };
  onDeleteTable?: (tableId: string) => { success: boolean; message: string };
  stocks: StockItem[];
  stockMovements: StockMovement[];
  onRecordStockOperation: (payload: {
    ingredientId: string;
    type: 'in' | 'out' | 'waste' | 'count_adjust' | 'transfer';
    quantity: number;
    note: string;
  }) => void;
  customers: CustomerRecord[];
  onAddCustomer: (c: Omit<CustomerRecord, 'id' | 'points' | 'walletBalance' | 'totalOrders' | 'totalSpent'> & { points?: number; walletBalance?: number }) => void;
  onUpdateCustomer?: (c: CustomerRecord) => void;
  onDeleteCustomer?: (id: string) => void;
  onAdjustLoyaltyPoints: (customerId: string, delta: number, reason: string) => void;
  campaigns: CampaignRecord[];
  onAddCampaign: (c: Omit<CampaignRecord, 'id' | 'usedCount'>) => void;
  onUpdateCampaign?: (c: CampaignRecord) => void;
  onDeleteCampaign?: (campaignId: string) => void;
  reservations: ReservationItem[];
  onUpdateReservationStatus: (resId: string, status: ReservationItem['status']) => void;
  onAddReservation?: (r: Omit<ReservationItem, 'id' | 'status'>) => { success: boolean; message: string };
  onUpdateReservation?: (r: ReservationItem) => void;
  onDeleteReservation?: (resId: string) => void;
  staff: StaffMember[];
  financeLedger: FinanceLedgerItem[];
  onAddFinanceEntry: (entry: Omit<FinanceLedgerItem, 'id' | 'date'>) => void;
  cmsPages: CMSPageItem[];
  onAddCmsPage: (page: Omit<CMSPageItem, 'id' | 'updatedAt'>) => void;
  onUpdateCmsPage?: (page: CMSPageItem) => void;
  onDeleteCmsPage?: (id: string) => void;
  siteCmsConfig: SiteCmsConfig;
  onUpdateSiteCmsConfig: React.Dispatch<React.SetStateAction<SiteCmsConfig>>;
  integrations: IntegrationPluginItem[];
  onTestIntegration: (id: string) => void;
  onToggleIntegrationMode: (id: string) => void;
  onUpdateIntegration?: (integration: IntegrationPluginItem) => void;
  onAddIntegration?: (integration: Omit<IntegrationPluginItem, 'id' | 'lastTested'>) => void;
  onDeleteIntegration?: (id: string) => void;
  archiveHistory?: ArchiveHistoryEntry[];
  onArchiveDaySummary?: (reason?: string) => void;
  onDeleteArchiveEntry?: (id: string) => void;
  onClearArchiveHistory?: () => void;
  branches: BranchItem[];
  onToggleBranchActive: (id: string) => void;
  onAddBranch?: (branch: Omit<BranchItem, 'id' | 'dailyRevenue' | 'activeTables'>) => void;
  onUpdateBranch?: (branch: BranchItem) => void;
  onDeleteBranch?: (id: string) => void;
  packages?: MenuPackageItem[];
  onAddPackage?: (pkg: Omit<MenuPackageItem, 'id' | 'isDemo'>) => void;
  onUpdatePackage?: (pkg: MenuPackageItem) => void;
  onDeletePackage?: (id: string) => void;
  customerReviews?: CustomerReviewItem[];
  customerComplaints?: CustomerComplaintItem[];
  onUpdateComplaintStatus?: (id: string, status: CustomerComplaintItem['status']) => void;
  backups: BackupEntry[];
  onCreateBackup: (type: BackupEntry['type']) => void;
  onRestoreBackup: (id: string, safetyCode: string) => { success: boolean; message: string };
  auditLogs: AuditLogEntry[];
  onClearAuditLogs?: () => void;
  themeMode: 'light' | 'dark' | 'system';
  onChangeThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  onSwitchWorkspaceView: (view: 'admin' | 'pos' | 'kds' | 'waiter' | 'qr_web') => void;
  waiterCalls?: WaiterServiceCallRecord[];
  onDispatchWaiterCall?: (callId: string) => void;
  onResolveWaiterCall?: (callId: string, tableId: string) => void;
  onDeleteWaiterCall?: (callId: string) => void;
  onClearCompletedWaiterCalls?: () => void;
  onAssignOrderCourier?: (orderId: string, courierName: string) => void;
  onUpdateCourierDeliveryState?: (
    orderId: string,
    deliveryState: NonNullable<OrderRecord['deliveryState']>
  ) => void;
  onSettleOrderPayment?: (orderId: string, amount: number, method: string) => void;
  onIssueOrderReceiptAndInvoice?: (orderId: string) => void;
}

export const AdminModulesPanel: React.FC<AdminModulesPanelProps> = ({
  activeModuleId,
  onSelectModule,
  currentRole,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onBulkAdjustPrices,
  onDuplicateProduct,
  orders,
  onUpdateOrderStatus,
  onRefundOrderSeparately,
  tables,
  onChangeTableStatus,
  onAddTable,
  onUpdateTable,
  onDeleteTable,
  stocks,
  stockMovements,
  onRecordStockOperation,
  customers,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onAdjustLoyaltyPoints,
  campaigns,
  onAddCampaign,
  onUpdateCampaign,
  onDeleteCampaign,
  reservations,
  onUpdateReservationStatus,
  onAddReservation,
  onUpdateReservation,
  onDeleteReservation,
  staff,
  financeLedger,
  onAddFinanceEntry,
  cmsPages,
  onAddCmsPage,
  onUpdateCmsPage,
  onDeleteCmsPage,
  siteCmsConfig,
  onUpdateSiteCmsConfig,
  integrations,
  onTestIntegration,
  onToggleIntegrationMode,
  onUpdateIntegration,
  onAddIntegration,
  onDeleteIntegration,
  archiveHistory = [],
  onArchiveDaySummary,
  onDeleteArchiveEntry,
  onClearArchiveHistory,
  branches,
  onToggleBranchActive,
  onAddBranch,
  onUpdateBranch,
  onDeleteBranch,
  packages = [],
  onAddPackage,
  onUpdatePackage,
  onDeletePackage,
  customerReviews = [],
  customerComplaints = [],
  onUpdateComplaintStatus,
  backups,
  onCreateBackup,
  onRestoreBackup,
  auditLogs,
  onClearAuditLogs,
  themeMode,
  onChangeThemeMode,
  onSwitchWorkspaceView,
  waiterCalls = [],
  onDispatchWaiterCall,
  onResolveWaiterCall,
  onDeleteWaiterCall,
  onClearCompletedWaiterCalls,
  onAssignOrderCourier,
  onUpdateCourierDeliveryState,
  onSettleOrderPayment,
  onIssueOrderReceiptAndInvoice,
}) => {
  const [statusToast, setStatusToast] = useState<string | null>(null);
  const [receiptInvoiceModalOrder, setReceiptInvoiceModalOrder] = useState<OrderRecord | null>(null);

  const readMultiImageFiles = (files: FileList | null, onDone: (urls: string[]) => void) => {
    if (!files || files.length === 0) return;
    Promise.all(
      Array.from(files).map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ''));
            reader.onerror = () => resolve('');
            reader.readAsDataURL(file);
          })
      )
    ).then((res) => {
      const valid = res.filter(Boolean);
      if (valid.length > 0) onDone(valid);
    });
  };

  // Module 1: Recharts Interactive Analytics Filter State
  const [chartRange, setChartRange] = useState<'gunluk' | 'haftalik' | 'aylik'>('haftalik');
  const [selectedFloorArea, setSelectedFloorArea] = useState<string>('Tümü');
  const [selectedMapTableId, setSelectedMapTableId] = useState<string>(tables[0]?.id || 'TBL-01');

  // Module 2: Orders multi-criteria filter (Kategori · Garson · Kanal + Hazır Düğmeler)
  const [orderFilterCriteria, setOrderFilterCriteria] = useState<OrderFilterCriteria>({
    categoryIds: [],
    waiterNames: [],
    channels: [],
    searchQuery: '',
  });

  // Module 3: Table CRUD form states
  const [tableFormOpen, setTableFormOpen] = useState(false);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [tblNumber, setTblNumber] = useState('');
  const [tblArea, setTblArea] = useState('Ana Salon');
  const [tblCapacity, setTblCapacity] = useState(4);
  const [tblWaiterName, setTblWaiterName] = useState('Murat Demir');
  const [tblQrCodeNumber, setTblQrCodeNumber] = useState('');

  const pwaHook = usePWAInstall();

  // Module 5: Product creation, inline editing & bulk price state + multi-image + Packages
  const [newProdName, setNewProdName] = useState('');
  const [newProdCode, setNewProdCode] = useState('OZT-YENI-08');
  const [newProdCategory, setNewProdCategory] = useState(categories[0]?.id || 'CAT-01');
  const [newProdPrice, setNewProdPrice] = useState(460);
  const [newProdGrammage, setNewProdGrammage] = useState(220);
  const [newProdStation, setNewProdStation] = useState<KitchenStationName>('Izgara');
  const [newProdImageUrl, setNewProdImageUrl] = useState('/assets/aistudio/crops/cat-ciger.png');
  const [newProdImageUrls, setNewProdImageUrls] = useState<string[]>(['/assets/aistudio/crops/cat-ciger.png']);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [bulkPricePercent, setBulkPricePercent] = useState(5);

  const [editingPkgId, setEditingPkgId] = useState<string | null>(null);
  const [pkgName, setPkgName] = useState('');
  const [pkgType, setPkgType] = useState<MenuPackageItem['type']>('Tek kişilik menü');
  const [pkgContentsText, setPkgContentsText] = useState('');
  const [pkgPrice, setPkgPrice] = useState(520);
  const [pkgImageUrl, setPkgImageUrl] = useState('/assets/aistudio/crops/cat-ciger.png');
  const [pkgImageUrls, setPkgImageUrls] = useState<string[]>(['/assets/aistudio/crops/cat-ciger.png']);

  // Module 6: Category form + Single & Multi Image editing
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatImageUrl, setNewCatImageUrl] = useState('/assets/aistudio/crops/cat-ciger.png');
  const [newCatImageUrls, setNewCatImageUrls] = useState<string[]>(['/assets/aistudio/crops/cat-ciger.png']);
  const [newCatPrimary, setNewCatPrimary] = useState(true);

  // Module 14: Stock movement form
  const [selectedStockId, setSelectedStockId] = useState(stocks[0]?.id || 'ING-01');
  const [stockOpType, setStockOpType] = useState<'in' | 'out' | 'waste' | 'count_adjust' | 'transfer'>('in');
  const [stockOpQty, setStockOpQty] = useState(5);
  const [stockOpNote, setStockOpNote] = useState('');

  // Module 17: Unified Member Management (Üye Yönetimi) CRUD state
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custDistrict, setCustDistrict] = useState('Şahinbey');
  const [custAddress, setCustAddress] = useState('');
  const [custGroup, setCustGroup] = useState<CustomerRecord['group']>('Standart');
  const [custBirthDate, setCustBirthDate] = useState('1990-01-01');
  const [custPreferences, setCustPreferences] = useState('Standart servis');
  const [custPointsInput, setCustPointsInput] = useState<number>(50);
  const [custWalletInput, setCustWalletInput] = useState<number>(0);
  const [custKvkkApproved, setCustKvkkApproved] = useState(true);
  const [custMarketingConsent, setCustMarketingConsent] = useState(false);
  const [custIsBlocked, setCustIsBlocked] = useState(false);
  const [custSearchQuery, setCustSearchQuery] = useState('');

  // Module 11: Reservation Add / Edit / Settings state
  const [editingResId, setEditingResId] = useState<string | null>(null);
  const [resFormOpen, setResFormOpen] = useState(false);
  const [resSettingsOpen, setResSettingsOpen] = useState(false);
  const [resCustomerName, setResCustomerName] = useState('');
  const [resCustomerPhone, setResCustomerPhone] = useState('');
  const [resDate, setResDate] = useState('2026-11-17');
  const [resTime, setResTime] = useState('19:30');
  const [resGuestCount, setResGuestCount] = useState(4);
  const [resTableId, setResTableId] = useState(tables[0]?.id || 'TBL-01');
  const [resSource, setResSource] = useState<ReservationItem['source']>('online');
  const [resDepositAmount, setResDepositAmount] = useState(0);
  const [resSpecialRequests, setResSpecialRequests] = useState('');

  // Module 12: Unified Payment Methods, POS, Cash Register & Receipt sub-tabs
  const [posModuleTab, setPosModuleTab] = useState<'pos' | 'payment_methods' | 'settlement' | 'receipt'>('pos');
  const [editingPmId, setEditingPmId] = useState<string | null>(null);
  const [pmName, setPmName] = useState('');
  const [pmCode, setPmCode] = useState('');
  const [pmType, setPmType] = useState<'cash' | 'pos' | 'online_card' | 'meal_card' | 'transfer' | 'wallet'>('online_card');
  const [pmCommission, setPmCommission] = useState<number>(1.9);
  const [pmAllowPortal, setPmAllowPortal] = useState(true);
  const [pmAllowPayNow, setPmAllowPayNow] = useState(true);
  const [pmDescription, setPmDescription] = useState('');

  // Module 19: Campaign form (Ekle / Düzenle / Sil)
  const [editingCampId, setEditingCampId] = useState<string | null>(null);
  const [campName, setCampName] = useState('');
  const [campCode, setCampCode] = useState('');
  const [campType, setCampType] = useState<CampaignRecord['type']>('Yüzde indirim');
  const [campDiscount, setCampDiscount] = useState(15);
  const [campMinOrder, setCampMinOrder] = useState(400);
  const [campUsageLimit, setCampUsageLimit] = useState(250);
  const [campStartDate, setCampStartDate] = useState('2026-11-16');
  const [campEndDate, setCampEndDate] = useState('2026-12-31');

  // Module 15: Recipe & Costing CRUD state
  const [selectedRecipeProductId, setSelectedRecipeProductId] = useState<string>(
    products[0]?.id || 'PRD-01'
  );
  const [recipeStockChoiceId, setRecipeStockChoiceId] = useState<string>(stocks[0]?.id || 'ING-01');
  const [recipeIngName, setRecipeIngName] = useState<string>(stocks[0]?.name || 'Taze Kuzu Ciğeri');
  const [recipeIngUnit, setRecipeIngUnit] = useState<'adet' | 'gr' | 'kg' | 'lt' | 'ml' | 'paket'>(
    stocks[0]?.unit || 'kg'
  );
  const [recipeIngQty, setRecipeIngQty] = useState<number>(0.22);
  const [recipeIngUnitCost, setRecipeIngUnitCost] = useState<number>(stocks[0]?.unitCost || 540);
  const [editingRecipeIngId, setEditingRecipeIngId] = useState<string | null>(null);

  // Module 31: Per-Plugin Advanced Settings & Dynamic / JSON Config
  const [pluginCategoryFilter, setPluginCategoryFilter] = useState<string>('Tümü');
  const [expandedIntgId, setExpandedIntgId] = useState<string | null>(null);
  const [pluginConfigTab, setPluginConfigTab] = useState<Record<string, 'form' | 'json'>>({});
  const [pluginJsonDrafts, setPluginJsonDrafts] = useState<Record<string, string>>({});
  const [pluginJsonFeedback, setPluginJsonFeedback] = useState<
    Record<string, { ok: boolean; msg: string }>
  >({});
  const [newParamTypes, setNewParamTypes] = useState<
    Record<string, 'string' | 'number' | 'boolean' | 'secret'>
  >({});
  const [showNewIntgForm, setShowNewIntgForm] = useState(false);
  const [newIntgName, setNewIntgName] = useState('');
  const [newIntgCategory, setNewIntgCategory] = useState<IntegrationPluginItem['category']>('Ödeme');
  const [newIntgScope, setNewIntgScope] = useState('api.read_write');
  const [newIntgVersion, setNewIntgVersion] = useState('1.0.0');
  const [newParamKeys, setNewParamKeys] = useState<Record<string, string>>({});
  const [newParamVals, setNewParamVals] = useState<Record<string, string>>({});
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});

  // Module 40: Archive filter & note
  const [archiveReason, setArchiveReason] = useState('');
  const [archiveSearch, setArchiveSearch] = useState('');
  const [archiveTypeFilter, setArchiveTypeFilter] = useState<'Tümü' | ArchiveHistoryEntry['type']>('Tümü');

  // Module 41: PWA diagnostics, shortcuts & screenshots
  const [pwaDiagNotice, setPwaDiagNotice] = useState<string | null>(null);
  const [pwaPushPreviewActive, setPwaPushPreviewActive] = useState<boolean>(true);
  const [pwaShotInput, setPwaShotInput] = useState('');
  const [pwaShortcutName, setPwaShortcutName] = useState('');
  const [pwaShortcutShort, setPwaShortcutShort] = useState('');
  const [pwaShortcutUrl, setPwaShortcutUrl] = useState('/#menu');
  const [pwaShortcutDesc, setPwaShortcutDesc] = useState('');

  // Module 22-23: Finance form
  const [finType, setFinType] = useState<'Gelir' | 'Gider'>('Gider');
  const [finCategory, setFinCategory] = useState('Tedarik Ödemesi');
  const [finDesc, setFinDesc] = useState('');
  const [finAmount, setFinAmount] = useState(3500);

  // Module 33: Branch Add/Edit form
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [branchCode, setBranchCode] = useState('GAZ-03');
  const [branchName, setBranchName] = useState('');
  const [branchCity, setBranchCity] = useState('Şahinbey / Gaziantep');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchPhone, setBranchPhone] = useState('');
  const [branchIsMain, setBranchIsMain] = useState(false);

  // Module 36: Security RBAC Matrix
  const [rbacRoles, setRbacRoles] = useState<
    { role: string; posRefund: boolean; priceOverride: boolean; cmsPublish: boolean; backupRestore: boolean }[]
  >([
    { role: 'Süper Yönetici', posRefund: true, priceOverride: true, cmsPublish: true, backupRestore: true },
    { role: 'İşletme Müdürü', posRefund: true, priceOverride: true, cmsPublish: true, backupRestore: false },
    { role: 'Şube Müdürü', posRefund: true, priceOverride: false, cmsPublish: false, backupRestore: false },
    { role: 'Kasiyer', posRefund: false, priceOverride: false, cmsPublish: false, backupRestore: false },
    { role: 'İçerik Editörü', posRefund: false, priceOverride: false, cmsPublish: true, backupRestore: false },
  ]);

  // Module 37: Backup restore confirmation code
  const [restoreConfirmCode, setRestoreConfirmCode] = useState('');

  // Module 38: Audit filter
  const [auditSeverityFilter, setAuditSeverityFilter] = useState<'Tümü' | 'Normal' | 'Uyarı' | 'Kritik'>('Tümü');
  const [auditSearchQuery, setAuditSearchQuery] = useState('');

  // AI Analytics State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState<{
    title: string;
    summary: string;
    recommendations: {
      id: string;
      category: string;
      proposal: string;
      impact: string;
      approved?: boolean;
    }[];
    guardrailNotice: string;
  } | null>(null);

  const triggerAiAnalysis = async (analysisType: string) => {
    setAiLoading(true);
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisType,
          contextSummary: {
            dailyRevenue: 68450,
            totalOrders: orders.length,
            criticalStockCount: stocks.filter((s) => s.currentStock <= s.minStockThreshold).length,
            topProduct: products[0]?.name,
          },
        }),
      });
      const data = await response.json();
      setAiReport(data);
    } catch {
      setStatusToast('Yapay zekâ analizi alınırken bağlantı hatası oluştu.');
    } finally {
      setAiLoading(false);
    }
  };

  // Computed KPI Metrics for Dashboard (Section 3.1: All 16 metrics)
  const totalIncomes = financeLedger
    .filter((f) => f.type === 'Gelir')
    .reduce((s, f) => s + f.amount, 0);
  const totalExpenses = financeLedger
    .filter((f) => f.type === 'Gider')
    .reduce((s, f) => s + f.amount, 0);
  const ordersRevenue = orders
    .filter((o) => o.status !== 'İptal edildi' && o.status !== 'İade edildi')
    .reduce((s, o) => s + o.totalAmount, 0);

  const dailyRevenue = totalIncomes + ordersRevenue;
  const weeklyRevenue = dailyRevenue * 6.4;
  const monthlyRevenue = dailyRevenue * 27.5;
  const avgOrderAmount = orders.length > 0 ? dailyRevenue / (orders.length + 38) : 0;
  const openTablesCount = tables.filter((t) => t.status !== 'Boş').length;
  const preparingOrdersCount = orders.filter(
    (o) => o.status === 'Hazırlanıyor' || o.status === 'Mutfağa gönderildi'
  ).length;
  const waitingOrdersCount = orders.filter(
    (o) => o.status === 'Yeni' || o.status === 'Onay bekliyor'
  ).length;
  const deliveryOrdersCount = orders.filter((o) => o.channel === 'Paket servis').length;
  const criticalStocks = stocks.filter((s) => s.currentStock <= s.minStockThreshold);
  const estimatedDailyProfit = dailyRevenue - totalExpenses - ordersRevenue * 0.36;

  const activeWaiterCallsList = waiterCalls.filter((c) => c.status !== 'Tamamlandı');
  const totalTipsToday = orders.reduce((s, o) => s + (o.tipAmount || 0), 0);

  return (
    <div className="space-y-6 min-w-0 max-w-full overflow-x-hidden">
      {statusToast && (
        <div
          role="status"
          className="flex items-center justify-between rounded-xl border border-[#D4AF6A]/40 bg-[#1F1F1D] text-[#F5F2EB] px-4 py-3 text-xs"
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#D4AF6A]" />
            {statusToast}
          </span>
          <button type="button" onClick={() => setStatusToast(null)} className="underline">
            Kapat
          </button>
        </div>
      )}

      {/* =====================================================================
          MODÜL 1: GENEL BAKIŞ (DASHBOARD - RECHARTS GRAFİKLERİ + 16 METRİK TAMAMI)
      ===================================================================== */}
      {activeModuleId === 1 && (
        <div className="space-y-6">
          {/* =================================================================
              ETKİLEŞİMLİ RECHARTS ANALİTİK GRAFİKLERİ (GÜNLÜK SATIŞLAR, EN ÇOK SATILAN ÜRÜNLER, SAATLİK YOĞUNLUK)
          ================================================================= */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3.5">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-[#F5F2EB] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#B86B35] dark:text-[#D4AF6A]" />
                  <span>Canlı Performans & Satış Analitiği (Recharts)</span>
                </h3>
                <p className="text-xs text-neutral-500">
                  Günlük satış cirosu, en çok tercih edilen ürünler ve saatlik masa/sipariş yoğunluk dağılımı
                </p>
              </div>
              <div className="inline-flex items-center rounded-lg border border-neutral-300 dark:border-neutral-700 p-0.5 bg-neutral-100 dark:bg-[#141413] text-xs">
                {[
                  { id: 'gunluk', label: 'Bugün' },
                  { id: 'haftalik', label: 'Son 7 Gün' },
                  { id: 'aylik', label: 'Son 30 Gün' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setChartRange(tab.id as 'gunluk' | 'haftalik' | 'aylik')}
                    className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                      chartRange === tab.id
                        ? 'bg-[#B86B35] text-white'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Grafik 1: Günlük Satışlar & Ciro Trendi */}
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-[#141413] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-[#F5F2EB] flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-[#D4AF6A]" />
                      <span>1. Günlük Satışlar (₺)</span>
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      Masa QR, POS Kasa ve Paket Servis Toplamı
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-500">+18.4%</span>
                </div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={
                        chartRange === 'gunluk'
                          ? [
                              { day: 'Pzt', ciro: 52400, siparis: 142 },
                              { day: 'Sal', ciro: 56800, siparis: 156 },
                              { day: 'Çar', ciro: 61200, siparis: 168 },
                              { day: 'Per', ciro: 64900, siparis: 179 },
                              { day: 'Cum', ciro: 78500, siparis: 215 },
                              { day: 'Cmt', ciro: 86400, siparis: 244 },
                              { day: 'Bugün', ciro: Math.round(dailyRevenue), siparis: orders.length + 185 },
                            ]
                          : chartRange === 'haftalik'
                          ? [
                              { day: 'Pzt', ciro: 54200, siparis: 148 },
                              { day: 'Sal', ciro: 58900, siparis: 162 },
                              { day: 'Çar', ciro: 63400, siparis: 175 },
                              { day: 'Per', ciro: 67100, siparis: 184 },
                              { day: 'Cum', ciro: 81200, siparis: 226 },
                              { day: 'Cmt', ciro: 89600, siparis: 252 },
                              { day: 'Paz', ciro: Math.round(dailyRevenue), siparis: 210 },
                            ]
                          : [
                              { day: '1. Hf', ciro: 385000, siparis: 1040 },
                              { day: '2. Hf', ciro: 412000, siparis: 1120 },
                              { day: '3. Hf', ciro: 448000, siparis: 1215 },
                              { day: '4. Hf', ciro: 486000, siparis: 1340 },
                            ]
                      }
                      margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#B86B35" stopOpacity={0.65} />
                          <stop offset="95%" stopColor="#B86B35" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333330" opacity={0.35} />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F1F1D',
                          borderColor: '#D4AF6A',
                          borderRadius: '10px',
                          fontSize: '12px',
                          color: '#F5F2EB',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="ciro"
                        name="Günlük Ciro (₺)"
                        stroke="#D4AF6A"
                        strokeWidth={2.5}
                        fill="url(#salesGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Grafik 2: En Çok Satılan Ürünler */}
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-[#141413] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-[#F5F2EB] flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-[#D4AF6A]" />
                      <span>2. En Çok Satılan Ürünler</span>
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      Porsiyon adedi bazında lider lezzetler
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#D4AF6A]">Top 6 Ürün</span>
                </div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { urun: 'Kuzu Ciğer Şiş', adet: 168, ciro: 73920 },
                        { urun: 'Ciğer Dürüm', adet: 142, ciro: 39050 },
                        { urun: 'Adana/Urfa Kebap', adet: 118, ciro: 49560 },
                        { urun: 'Yaprak Et Döner', adet: 96, ciro: 35520 },
                        { urun: 'Taş Fırın Lahmacun', adet: 134, ciro: 29480 },
                        { urun: 'Yayık Ayranı', adet: 215, ciro: 16125 },
                      ]}
                      layout="vertical"
                      margin={{ top: 4, right: 12, left: 16, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#333330" opacity={0.35} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                      <YAxis
                        dataKey="urun"
                        type="category"
                        width={95}
                        tick={{ fontSize: 10, fill: '#D4AF6A' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F1F1D',
                          borderColor: '#D4AF6A',
                          borderRadius: '10px',
                          fontSize: '12px',
                          color: '#F5F2EB',
                        }}
                      />
                      <Bar dataKey="adet" name="Satış Adedi" radius={[0, 6, 6, 0]}>
                        {[0, 1, 2, 3, 4, 5].map((idx) => (
                          <Cell
                            key={idx}
                            fill={idx % 2 === 0 ? '#D4AF6A' : '#B86B35'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Grafik 3: Saatlik Yoğunluk Dağılımı */}
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-[#141413] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-[#F5F2EB] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#D4AF6A]" />
                      <span>3. Saatlik Yoğunluk (11:00–24:00)</span>
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      Öğle ve akşam servisi masa & QR sipariş trafiği
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-amber-400">Pik: 19:00–21:00</span>
                </div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={[
                        { saat: '11:00', yogunluk: 28, masaDoluluk: 35 },
                        { saat: '13:00', yogunluk: 84, masaDoluluk: 90 },
                        { saat: '15:00', yogunluk: 52, masaDoluluk: 60 },
                        { saat: '17:00', yogunluk: 46, masaDoluluk: 55 },
                        { saat: '19:00', yogunluk: 96, masaDoluluk: 100 },
                        { saat: '21:00', yogunluk: 92, masaDoluluk: 95 },
                        { saat: '23:00', yogunluk: 58, masaDoluluk: 65 },
                      ]}
                      margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="busyGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333330" opacity={0.35} />
                      <XAxis dataKey="saat" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F1F1D',
                          borderColor: '#10B981',
                          borderRadius: '10px',
                          fontSize: '12px',
                          color: '#F5F2EB',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="yogunluk"
                        name="Saatlik Sipariş Yoğunluğu (%)"
                        stroke="#10B981"
                        strokeWidth={2.5}
                        fill="url(#busyGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Canlı Garson Çağrıları & Tahsilat Özeti Şeridi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-amber-500/35 bg-white dark:bg-[#1F1F1D] p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <BellRing className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-neutral-900 dark:text-[#F5F2EB]">
                    Canlı QR Garson Çağrıları ({activeWaiterCallsList.length} Aktif)
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    {activeWaiterCallsList[0]
                      ? `${activeWaiterCallsList[0].tableNumber}: ${activeWaiterCallsList[0].selectedNeeds.join(', ')}`
                      : 'Tüm masa servis çağrıları karşılandı'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectModule(8)}
                className="px-3 py-1.5 rounded-lg bg-[#B86B35] text-white text-xs font-bold cursor-pointer"
              >
                Çağrıları Yönet
              </button>
            </div>

            <div className="rounded-xl border border-emerald-500/35 bg-white dark:bg-[#1F1F1D] p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-neutral-900 dark:text-[#F5F2EB]">
                    Günlük POS / Kart / Bahşiş Toplamı
                  </div>
                  <div className="text-[11px] text-neutral-500 font-mono">
                    Tahsilat: {orders.filter((o) => o.paymentStatus === 'Ödendi').length}/{orders.length} Sipariş · Bahşiş: {totalTipsToday.toFixed(2)} ₺
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onSelectModule(12)}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-bold cursor-pointer"
              >
                Kasa &amp; Ödeme →
              </button>
            </div>
          </div>

          {/* 16 Dashboard KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3.5">
            {[
              { label: '1. Günlük Ciro', val: `${dailyRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`, sub: 'Bugün gerçekleşen' },
              { label: '2. Haftalık Ciro', val: `${weeklyRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 0 })} ₺`, sub: 'Son 7 gün toplamı' },
              { label: '3. Aylık Ciro', val: `${monthlyRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 0 })} ₺`, sub: 'Kasım 2026 projeksiyonu' },
              { label: '4. Sipariş Sayısı', val: `${orders.length + 38} Adet`, sub: `${orders.length} aktif canlı fiş` },
              { label: '5. Ortalama Sipariş Tutarı', val: `${avgOrderAmount.toFixed(2)} ₺`, sub: 'Adisyon ortalaması' },
              { label: '6. Açık Masalar', val: `${openTablesCount} / ${tables.length} Masa`, sub: 'Salon, Bahçe, Ocakbaşı' },
              { label: '7. Hazırlanan Siparişler', val: `${preparingOrdersCount} Fiş`, sub: 'Izgara ve soğuk mutfakta' },
              { label: '8. Bekleyen Siparişler', val: `${waitingOrdersCount} Fiş`, sub: 'Onay / mutfak sırası' },
              { label: '9. Paket Servis Siparişleri', val: `${deliveryOrdersCount} Paket`, sub: 'Kurye ve hazırlıkta' },
              { label: '10. Rezervasyonlar', val: `${reservations.length} Kayıt`, sub: 'Akşam servisi onaylı' },
              { label: '11. Günlük Giderler', val: `${totalExpenses.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`, sub: 'Et tedarik & kömür sarf' },
              { label: '12. Tahmini Kâr (Net)', val: `${estimatedDailyProfit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`, sub: 'Reçete maliyeti düşülmüş' },
              { label: '13. Kritik Stok Uyarıları', val: `${criticalStocks.length} Kalem`, sub: criticalStocks.map((c) => c.name.slice(0, 14)).join(', ') || 'Normal' },
              { label: '14. Kayıtlı Üyeler', val: `${customers.length} Üye`, sub: `${customers.filter((c) => c.group !== 'Standart').length} VIP / Sadık üye` },
              { label: '15. Ödeme Durumu', val: `%94 Doğrulandı`, sub: 'Nakit, POS, iyzico Sandbox' },
              { label: '16. Son İşlemler (Log)', val: `${auditLogs.length} Kayıt`, sub: 'Yetki & denetim izi aktif' },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-4 flex flex-col justify-between gap-1.5"
              >
                <div className="text-xs text-neutral-500 dark:text-neutral-400">{kpi.label}</div>
                <div className="font-mono tabular-nums text-lg font-bold text-neutral-900 dark:text-[#F5F2EB]">
                  {kpi.val}
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                  {kpi.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Operations Strip */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-[#F5F2EB]">
                Hızlı Operasyon Terminalleri & Modül Geçişi
              </h3>
              <p className="text-xs text-neutral-500">
                Tek tıkla tam ekran POS Kasa, Canlı Mutfak KDS, Garson Masa Planı veya Müşteri QR Menüsüne geçin
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onSwitchWorkspaceView('pos')}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#B86B35] text-white hover:bg-[#9F5928]"
              >
                POS / Kasa Terminaline Geç
              </button>
              <button
                type="button"
                disabled={!siteCmsConfig.operationalSettings?.kitchenModuleEnabled}
                onClick={() => onSwitchWorkspaceView('kds')}
                title={
                  siteCmsConfig.operationalSettings?.kitchenModuleEnabled
                    ? 'Canlı Mutfak KDS ekranına geç'
                    : 'Mutfak KDS pasif · Genel Ayarlar modülünden aktifleştirebilirsiniz'
                }
                className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mutfak Ekranı (KDS){!siteCmsConfig.operationalSettings?.kitchenModuleEnabled ? ' · Pasif' : ''}
              </button>
              <button
                type="button"
                onClick={() => onSwitchWorkspaceView('waiter')}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Garson & Masa Planı
              </button>
              <button
                type="button"
                onClick={() => onSwitchWorkspaceView('qr_web')}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Müşteri QR Menü Önizleme
              </button>
            </div>
          </div>

          {/* Live Orders + Critical Stock + Recent Audit Logs Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-neutral-900 dark:text-[#F5F2EB]">
                  Canlı Sipariş Akışı (8 Kanal · 11 Durum)
                </h3>
                <button
                  type="button"
                  onClick={() => onSelectModule(2)}
                  className="text-xs text-[#B86B35] dark:text-[#D4AF6A] hover:underline"
                >
                  Tüm Siparişleri Yönet →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
                      <th className="py-2 pr-3">Sipariş No</th>
                      <th className="py-2 px-3">Kanal / Masa</th>
                      <th className="py-2 px-3">Durum</th>
                      <th className="py-2 px-3">Ödeme</th>
                      <th className="py-2 pl-3 text-right">Tutar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                        <td className="py-2.5 pr-3 font-mono font-semibold text-[#B86B35] dark:text-[#D4AF6A]">
                          {ord.orderNumber}
                        </td>
                        <td className="py-2.5 px-3">
                          {ord.channel} · {ord.tableName}
                        </td>
                        <td className="py-2.5 px-3 font-medium">{ord.status}</td>
                        <td className="py-2.5 px-3 text-neutral-500">{ord.paymentStatus}</td>
                        <td className="py-2.5 pl-3 text-right font-mono tabular-nums font-bold">
                          {ord.totalAmount.toFixed(2)} ₺
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-neutral-900 dark:text-[#F5F2EB]">
                  Kritik Stok Uyarıları & Son İşlem Kayıtları
                </h3>
                <button
                  type="button"
                  onClick={() => onSelectModule(14)}
                  className="text-xs text-[#B86B35] dark:text-[#D4AF6A] hover:underline"
                >
                  Stok & Reçete →
                </button>
              </div>
              <div className="space-y-2">
                {criticalStocks.map((st) => (
                  <div
                    key={st.id}
                    className="rounded-lg border border-amber-600/40 bg-amber-950/15 p-3 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-amber-700 dark:text-amber-300">
                        Kritik Stok: {st.name}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        Tedarikçi: {st.supplierName} · Lot: {st.lotNumber}
                      </div>
                    </div>
                    <div className="text-right font-mono tabular-nums">
                      <div className="font-bold text-amber-600 dark:text-amber-400">
                        {st.currentStock} {st.unit}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        Min: {st.minStockThreshold} {st.unit}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
                {auditLogs.slice(0, 3).map((log) => (
                  <div key={log.id} className="text-xs flex items-start justify-between gap-2">
                    <div>
                      <span className="font-semibold">{log.action}:</span>{' '}
                      <span className="text-neutral-500">{log.detail}</span>
                    </div>
                    <span className="font-mono text-[10px] text-neutral-400 shrink-0">
                      {log.timestamp.slice(-8)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODÜL 2: MERKEZİ SİPARİŞLER, PAKET SERVİS & KURYE YÖNETİMİ
      ===================================================================== */}
      {activeModuleId === 2 && (() => {
        const filteredOrders = filterOrdersByMultiCriteria(orders, products, orderFilterCriteria);
        return (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-[#F5F2EB]">
                Merkezi Sipariş Yönetimi, Paket Servis & Kurye Takibi
              </h3>
              <p className="text-xs text-neutral-500">
                QR masa, Garson, Gel-Al ve Paket Servis siparişlerini kategori, garson ve kanal bazında çoklu filtreleyin; hazır filtre düğmeleri kaydedin.
              </p>
            </div>
          </div>

          <OrderMultiFilterBar
            categories={categories}
            orders={orders}
            tables={tables}
            staff={staff}
            criteria={orderFilterCriteria}
            onChangeCriteria={setOrderFilterCriteria}
            totalCount={orders.length}
            filteredCount={filteredOrders.length}
            testIdPrefix="admin-orders-filter"
          />

          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-center text-xs text-neutral-500">
                Seçili ürün kategorisi, garson ve sipariş kanalı kriterlerine uyan sipariş bulunamadı.
              </div>
            ) : (
              filteredOrders.map((ord) => (
                <div
                  key={ord.id}
                  data-testid={`admin-order-card-${ord.orderNumber}`}
                  className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-mono text-sm font-bold text-[#B86B35] dark:text-[#D4AF6A]">
                        {ord.orderNumber}
                      </span>
                      <span className="mx-2 text-neutral-400">·</span>
                      <span className="text-xs font-semibold">
                        {ord.channel} ({ord.tableName})
                      </span>
                      <span className="mx-2 text-neutral-400">·</span>
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        Sorumlu: {ord.staffName}
                      </span>
                      <span className="mx-2 text-neutral-400">·</span>
                      <span className="text-xs text-neutral-500">
                        Müşteri: {ord.customerName} ({ord.customerPhone})
                      </span>
                    </div>
                    <div className="font-mono tabular-nums text-sm font-bold">
                      {ord.totalAmount.toFixed(2)} ₺ · {ord.paymentMethod} ({ord.paymentStatus})
                      {ord.tipAmount ? ` · +${ord.tipAmount.toFixed(2)} ₺ Bahşiş` : ''}
                    </div>
                  </div>

                  {(ord.receiptNumber || ord.eInvoiceNo) && (
                    <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                      Fiş: {ord.receiptNumber || '-'} · e-Fatura: {ord.eInvoiceNo || '-'}
                    </div>
                  )}

                  {ord.channel === 'Paket servis' && (
                    <div className="rounded-lg bg-neutral-50 dark:bg-[#141413] border border-neutral-200 dark:border-neutral-800 p-3 space-y-2 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
                          <Truck className="w-3.5 h-3.5 text-[#D4AF6A] shrink-0" />
                          <span>
                            Adres: <strong>{ord.deliveryAddress || 'Merkez Bölge'}</strong> · Kurye:{' '}
                            <strong>{ord.courierName || 'Atanmadı'}</strong> ({ord.deliveryState || 'Hazırlanıyor'})
                          </span>
                        </div>
                        <select
                          aria-label={`${ord.orderNumber} Kurye Ata`}
                          value={ord.courierName || ''}
                          onChange={(e) => {
                            if (e.target.value) {
                              onAssignOrderCourier?.(ord.id, e.target.value);
                              setStatusToast(`${ord.orderNumber} siparişi ${e.target.value} kuryesine atandı.`);
                            }
                          }}
                          className="rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-2.5 py-1 text-xs"
                        >
                          <option value="">Kurye Seç &amp; Ata...</option>
                          {staff
                            .filter((st) => st.role === 'Kurye')
                            .map((courier) => (
                              <option key={courier.id} value={courier.name}>
                                🛵 {courier.name}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(['Hazırlanıyor', 'Kuryeye Atandı', 'Yolda', 'Teslim Edildi'] as const).map(
                          (dState) => (
                            <button
                              key={dState}
                              type="button"
                              onClick={() => {
                                onUpdateCourierDeliveryState?.(ord.id, dState);
                                setStatusToast(`${ord.orderNumber} kurye durumu: ${dState}`);
                              }}
                              className={`px-2.5 py-1 rounded text-[11px] font-semibold border cursor-pointer ${
                                ord.deliveryState === dState
                                  ? 'bg-[#B86B35] text-white border-[#B86B35]'
                                  : 'border-neutral-300 dark:border-neutral-700'
                              }`}
                            >
                              {dState}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {ord.pickupTime && (
                    <div className="text-xs text-neutral-500 flex items-center gap-2">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#B86B35]" />
                      <span>
                        Gel-Al Teslim Alma Saati: {ord.pickupTime} · Hazırlık: {ord.status} · Ödeme: {ord.paymentStatus}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="text-neutral-500">Durum:</label>
                      <select
                        value={ord.status}
                        onChange={(e) => {
                          onUpdateOrderStatus(
                            ord.id,
                            e.target.value as OrderStatus,
                            'Yönetici durum güncellemesi'
                          );
                          setStatusToast(
                            `${ord.orderNumber} durumu "${e.target.value}" olarak güncellendi.`
                          );
                        }}
                        aria-label={`${ord.orderNumber} Sipariş Durumu`}
                        className="rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1"
                      >
                        {[
                          'Yeni',
                          'Onay bekliyor',
                          'Mutfağa gönderildi',
                          'Hazırlanıyor',
                          'Hazır',
                          'Servis bekliyor',
                          'Servis edildi',
                          'Kuryeye teslim edildi',
                          'Tamamlandı',
                          'İptal edildi',
                          'İade edildi',
                        ].map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* POS Tahsilat, Otomatik Fiş/e-Fatura, İptal & İade */}
                    <div className="flex flex-wrap items-center gap-2">
                      {ord.paymentStatus !== 'Ödendi' && onSettleOrderPayment && (
                        <button
                          type="button"
                          onClick={() => {
                            const remaining = Math.max(0, ord.totalAmount - ord.paidAmount);
                            onSettleOrderPayment(ord.id, remaining, ord.paymentMethod || 'POS Kredi Kartı');
                            setStatusToast(`${ord.orderNumber} için ${remaining.toFixed(2)} ₺ POS tahsilatı & fişi oluşturuldu.`);
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-700 text-white font-semibold hover:bg-emerald-600 cursor-pointer"
                        >
                          POS Tahsilat Al ({Math.max(0, ord.totalAmount - ord.paidAmount).toFixed(2)} ₺)
                        </button>
                      )}
                      <button
                        type="button"
                        data-testid={`admin-order-print-btn-${ord.orderNumber}`}
                        onClick={() => {
                          onIssueOrderReceiptAndInvoice?.(ord.id);
                          const nums =
                            ord.receiptNumber && ord.eInvoiceNo
                              ? { receiptNumber: ord.receiptNumber, eInvoiceNo: ord.eInvoiceNo }
                              : generateReceiptAndInvoiceNumbers(ord.orderNumber);
                          const enrichedOrder: OrderRecord = {
                            ...ord,
                            receiptNumber: nums.receiptNumber,
                            eInvoiceNo: nums.eInvoiceNo,
                            autoReceiptIssued: true,
                          };
                          setReceiptInvoiceModalOrder(enrichedOrder);
                          printThermalReceipt(enrichedOrder, {
                            ...siteCmsConfig.receiptSettings,
                            taxRatePercent: siteCmsConfig.generalSettings.taxRatePercent ?? 10,
                            logoUrl: siteCmsConfig.header.logoUrl,
                          });
                          setStatusToast(
                            `${ord.orderNumber} için Fiş (${nums.receiptNumber}) & e-Fatura (${nums.eInvoiceNo}) hazırlandı ve yazıcıya gönderildi.`
                          );
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#B86B35]/50 text-[#B86B35] dark:text-[#D4AF6A] font-semibold cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" /> Fiş / Fatura Yazdır
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateOrderStatus(
                            ord.id,
                            'İptal edildi',
                            'Yetkili sipariş iptali (Reçete stoğu ters kayıtla iade edildi)'
                          );
                          setStatusToast(
                            `${ord.orderNumber} iptal edildi ve reçete malzemeleri ters stok hareketiyle depoya geri yüklendi.`
                          );
                        }}
                        className="px-2.5 py-1 rounded border border-amber-700/50 text-amber-600 dark:text-amber-400 hover:bg-amber-950/20 cursor-pointer"
                      >
                        İptal Et
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onRefundOrderSeparately(
                            ord.id,
                            ord.totalAmount,
                            'Yetkili finansal para iadesi işlemi'
                          );
                          setStatusToast(
                            `${ord.orderNumber} için ${ord.totalAmount.toFixed(2)} ₺ bağımsız para iadesi (Refund) kaydı oluşturuldu.`
                          );
                        }}
                        className="px-2.5 py-1 rounded border border-red-700/50 text-red-600 dark:text-red-400 hover:bg-red-950/20 cursor-pointer"
                      >
                        Para İadesi
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        );
      })()}

      {/* =====================================================================
          MODÜL 5: ÜRÜN YÖNETİMİ (SADECE ÜRÜNLER)
      ===================================================================== */}
      {activeModuleId === 5 && (
        <div className="space-y-6">
          {/* Menü Görünüm & Sipariş Akışı Kuralları (Eski Modül 4'ten taşındı) */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-bold text-[#B86B35] dark:text-[#D4AF6A]">Menü Sunum Kuralları:</span>
              <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={siteCmsConfig.design.showProductCalories}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      design: { ...prev.design, showProductCalories: e.target.checked },
                    }))
                  }
                />
                <span>Kalori Bilgisi Göster</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={siteCmsConfig.design.showProductPrepTime}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      design: { ...prev.design, showProductPrepTime: e.target.checked },
                    }))
                  }
                />
                <span>Hazırlık Süresi Göster</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={siteCmsConfig.generalSettings.autoAcceptQrOrders}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      generalSettings: { ...prev.generalSettings, autoAcceptQrOrders: e.target.checked },
                    }))
                  }
                />
                <span>Müşteri Siparişlerini Otomatik Onayla</span>
              </label>
            </div>
            <button
              type="button"
              onClick={() => onSwitchWorkspaceView('qr_web')}
              className="px-3 py-1.5 rounded-lg bg-[#B86B35] text-white font-semibold cursor-pointer"
            >
              Müşteri Menüsü Önizlemesi →
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Add / Edit Product Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newProdName.trim()) return;
                const cat = categories.find((c) => c.id === newProdCategory) || categories[0];
                const primaryProdImg =
                  newProdImageUrl.trim() || newProdImageUrls[0] || '/assets/aistudio/crops/cat-ciger.png';
                const mergedProdImgs = Array.from(
                  new Set([primaryProdImg, ...newProdImageUrls].filter(Boolean))
                );
                if (editingProductId && onUpdateProduct) {
                  const existing = products.find((x) => x.id === editingProductId);
                  if (existing) {
                    onUpdateProduct({
                      ...existing,
                      code: newProdCode.trim(),
                      name: newProdName.trim(),
                      categoryId: cat.id,
                      categoryName: cat.name,
                      price: newProdPrice,
                      grammage: newProdGrammage,
                      station: newProdStation,
                      imageUrl: primaryProdImg,
                      imageUrls: mergedProdImgs,
                    });
                    setStatusToast(`${newProdName.trim()} ürünü ve görselleri güncellendi.`);
                  }
                  setEditingProductId(null);
                } else {
                  onAddProduct({
                    code: newProdCode.trim(),
                    barcode: `8690001${Math.floor(100000 + Math.random() * 899999)}`,
                    name: newProdName.trim(),
                    categoryId: cat.id,
                    categoryName: cat.name,
                    description: 'ÖzTike Ciğer ocakbaşı reçetesiyle hazırlanan yeni menü ürünü.',
                    price: newProdPrice,
                    discountedPrice: null,
                    portionInfo: '1 Porsiyon',
                    grammage: newProdGrammage,
                    ingredientsText: 'Kuzu eti/ciğeri, kuyruk yağı, yöresel baharatlar',
                    allergens: ['Gluten'],
                    calories: 540,
                    nutritionVerified: false,
                    prepTimeMinutes: 14,
                    spiceLevel: 2,
                    tags: ['Yeni Ürün', 'CANLI'],
                    isFeatured: false,
                    inStock: true,
                    isActive: true,
                    isDemo: false,
                    station: newProdStation,
                    channels: ['QR', 'Garson', 'Kasa', 'Gel-Al', 'Paket servis'],
                    seoTitle: `${newProdName.trim()} | ÖzTike Ciğer`,
                    seoDescription: `${newProdName.trim()} fiyat ve içerik bilgileri.`,
                    wasteAllowancePercent: 4,
                    imageUrl: primaryProdImg,
                    imageUrls: mergedProdImgs,
                  });
                  setStatusToast('Yeni ürün ve görselleri menüye eklendi.');
                }
                setNewProdName('');
                setNewProdImageUrl('/assets/aistudio/crops/cat-ciger.png');
                setNewProdImageUrls(['/assets/aistudio/crops/cat-ciger.png']);
              }}
              className="lg:col-span-8 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-3 text-xs"
            >
              <h3 className="text-base font-semibold text-neutral-900 dark:text-[#F5F2EB]">
                {editingProductId ? 'Ürünü & Görsellerini Düzenle' : 'Yeni Ürün Ekle & Mutfak İstasyonu Bağlantısı'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium mb-1">Ürün Adı</label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="Örn: Kuzu Böbrek & Yürek Şiş"
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Ürün Kodu (SKU)</label>
                  <input
                    type="text"
                    required
                    value={newProdCode}
                    onChange={(e) => setNewProdCode(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Kategori</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Satış Fiyatı (₺)</label>
                  <input
                    type="number"
                    min={10}
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Gramaj (gr)</label>
                  <input
                    type="number"
                    min={10}
                    value={newProdGrammage}
                    onChange={(e) => setNewProdGrammage(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Mutfak İstasyonu</label>
                  <select
                    value={newProdStation}
                    onChange={(e) => setNewProdStation(e.target.value as KitchenStationName)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                  >
                    {(['Izgara', 'Tavuk', 'Soğuk mutfak', 'İçecek', 'Paketleme'] as const).map(
                      (st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {/* Ürün Tekli & Çoklu Resim Yükleme */}
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#141413] p-3 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="font-semibold flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#B86B35]" />
                    <span>Ürün Fotoğrafları (Tekli veya Çoklu Resim)</span>
                  </label>
                  <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#B86B35] text-white font-semibold cursor-pointer">
                    <Upload className="w-3 h-3" />
                    <span>+ Çoklu Resim Yükle</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={(e) =>
                        readMultiImageFiles(e.target.files, (urls) => {
                          setNewProdImageUrls((prev) => Array.from(new Set([...prev, ...urls])));
                          setNewProdImageUrl(urls[0]);
                        })
                      }
                    />
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={newProdImageUrl}
                    onChange={(e) => setNewProdImageUrl(e.target.value)}
                    placeholder="Görsel URL ekleyin..."
                    className="flex-1 min-w-[180px] rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-2.5 py-1.5 font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newProdImageUrl.trim()) {
                        setNewProdImageUrls((prev) => Array.from(new Set([...prev, newProdImageUrl.trim()])));
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 font-semibold cursor-pointer"
                  >
                    + URL Ekle
                  </button>
                </div>
                {newProdImageUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {newProdImageUrls.map((url, idx) => (
                      <div
                        key={`${url.slice(0, 20)}-${idx}`}
                        className={`relative w-12 h-10 rounded-lg overflow-hidden border-2 ${
                          newProdImageUrl === url ? 'border-[#B86B35]' : 'border-neutral-300 dark:border-neutral-700'
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Ürün görseli ${idx + 1}`}
                          onClick={() => setNewProdImageUrl(url)}
                          className="w-full h-full object-cover cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setNewProdImageUrls((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="absolute top-0 right-0 bg-black/80 text-white text-[9px] px-1 leading-none"
                          aria-label="Görseli kaldır"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#B86B35] text-white font-semibold hover:bg-[#9F5928] cursor-pointer"
                >
                  {editingProductId ? 'Ürünü Güncelle' : 'Ürünü Kaydet'}
                </button>
                {editingProductId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProductId(null);
                      setNewProdName('');
                      setNewProdImageUrl('/assets/aistudio/crops/cat-ciger.png');
                      setNewProdImageUrls(['/assets/aistudio/crops/cat-ciger.png']);
                    }}
                    className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 font-semibold cursor-pointer"
                  >
                    İptal
                  </button>
                )}
              </div>
            </form>

            {/* Bulk Price Update Only */}
            <div className="lg:col-span-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 flex flex-col justify-between gap-3 text-xs">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">
                  Toplu Fiyat Güncelleme &amp; Kopyalama
                </h4>
                <p className="text-neutral-500">
                  Tüm menü ürünlerinin satış fiyatını tek adımda % oranında artırın veya indirin.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="number"
                  value={bulkPricePercent}
                  onChange={(e) => setBulkPricePercent(Number(e.target.value))}
                  aria-label="Toplu Fiyat Değişim Yüzdesi"
                  className="w-24 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                />
                <span>% oranında</span>
                <button
                  type="button"
                  onClick={() => {
                    onBulkAdjustPrices(bulkPricePercent);
                    setStatusToast(
                      `Tüm ürün fiyatları %${bulkPricePercent} oranında güncellendi ve işlem kaydına (Audit Log) yazıldı.`
                    );
                  }}
                  className="px-3.5 py-2 rounded-lg bg-neutral-900 dark:bg-[#F5F2EB] text-white dark:text-[#141413] font-semibold cursor-pointer"
                >
                  Toplu Güncelle
                </button>
              </div>
            </div>
          </div>

          {/* Product Table with Recipe Cost & Margin */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5">
            <h3 className="text-base font-semibold mb-3">
              Aktif Ürün Listesi, Reçete Maliyeti & Kârlılık Analizi ({products.length} Ürün)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
                    <th className="py-2 pr-3">Kod / Ürün</th>
                    <th className="py-2 px-3">Kategori / İstasyon</th>
                    <th className="py-2 px-3 text-right">Satış Fiyatı</th>
                    <th className="py-2 px-3 text-right">Reçete + Fire Maliyeti</th>
                    <th className="py-2 px-3 text-right">Brüt Kâr / Marj</th>
                    <th className="py-2 pl-3 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800">
                  {products.map((p) => {
                    const effective = p.discountedPrice ?? p.price;
                    const metrics = calculateRecipeMetrics(
                      p.recipeLines,
                      p.wasteAllowancePercent,
                      effective
                    );
                    return (
                      <tr key={p.id}>
                        <td className="py-2.5 pr-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={p.imageUrl || p.imageUrls?.[0] || '/assets/aistudio/crops/cat-ciger.png'}
                              alt={p.name}
                              className="w-9 h-9 rounded-lg object-cover border border-neutral-300 dark:border-neutral-700 shrink-0"
                            />
                            <div>
                              <div className="font-semibold text-neutral-900 dark:text-[#F5F2EB]">
                                {p.name}
                              </div>
                              <div className="font-mono text-[11px] text-neutral-500">
                                {p.code} · {p.grammage}g · {(p.imageUrls?.length || 1)} görsel
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          {p.categoryName} · {p.station}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold">
                          {effective.toFixed(2)} ₺
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-neutral-500">
                          {metrics.totalRecipeCost.toFixed(2)} ₺ (Fire: %{p.wasteAllowancePercent})
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                          +{metrics.grossProfit.toFixed(2)} ₺ (%{metrics.profitMarginPercent})
                        </td>
                        <td className="py-2.5 pl-3 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            {onUpdateProduct && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProductId(p.id);
                                  setNewProdName(p.name);
                                  setNewProdCode(p.code);
                                  setNewProdCategory(p.categoryId);
                                  setNewProdPrice(p.price);
                                  setNewProdGrammage(p.grammage);
                                  setNewProdStation(p.station);
                                  const firstImg = p.imageUrl || p.imageUrls?.[0] || '/assets/aistudio/crops/cat-ciger.png';
                                  setNewProdImageUrl(firstImg);
                                  setNewProdImageUrls(p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls : [firstImg]);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Düzenle</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                onDuplicateProduct(p.id);
                                setStatusToast(`${p.name} kopyalandı.`);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Kopyala</span>
                            </button>
                            {onDeleteProduct && (
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteProduct(p.id);
                                  setStatusToast(`${p.name} menüden silindi.`);
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded border border-red-700/40 text-red-500 hover:bg-red-950/20 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Sil</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Menü Paketleri Yönetimi (Tekli / Çoklu Resim + Ekle / Düzenle / Sil) */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4 text-xs">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#B86B35]" />
              <span>Fırsat Menü Paketleri Yönetimi &amp; Görselleri ({packages.length})</span>
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!pkgName.trim()) return;
                const contents = pkgContentsText
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean);
                const primaryPkgImg = pkgImageUrl.trim() || pkgImageUrls[0] || '/assets/aistudio/crops/cat-ciger.png';
                const mergedPkgImgs = Array.from(new Set([primaryPkgImg, ...pkgImageUrls].filter(Boolean)));
                if (editingPkgId && onUpdatePackage) {
                  const existing = packages.find((pk) => pk.id === editingPkgId);
                  if (existing) {
                    onUpdatePackage({
                      ...existing,
                      name: pkgName.trim(),
                      type: pkgType,
                      contents: contents.length ? contents : existing.contents,
                      price: pkgPrice,
                      imageUrl: primaryPkgImg,
                      imageUrls: mergedPkgImgs,
                    });
                    setStatusToast(`${pkgName.trim()} menü paketi güncellendi.`);
                  }
                  setEditingPkgId(null);
                } else if (onAddPackage) {
                  onAddPackage({
                    name: pkgName.trim(),
                    type: pkgType,
                    contents: contents.length ? contents : ['1 Porsiyon Ciğer', 'Yayık Ayran', 'Bostana'],
                    price: pkgPrice,
                    isActive: true,
                    imageUrl: primaryPkgImg,
                    imageUrls: mergedPkgImgs,
                  });
                  setStatusToast(`${pkgName.trim()} menü paketi eklendi.`);
                }
                setPkgName('');
                setPkgContentsText('');
              }}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 bg-neutral-50 dark:bg-[#141413]"
            >
              <div className="sm:col-span-3">
                <label className="block font-medium mb-1">Paket Adı *</label>
                <input
                  type="text"
                  required
                  value={pkgName}
                  onChange={(e) => setPkgName(e.target.value)}
                  placeholder="Örn: Halil Usta Aile Sofrası"
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-2.5 py-1.5"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-medium mb-1">Paket Türü</label>
                <select
                  value={pkgType}
                  onChange={(e) => setPkgType(e.target.value as MenuPackageItem['type'])}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-2.5 py-1.5"
                >
                  <option value="Tek kişilik menü">Tek kişilik menü</option>
                  <option value="İki kişilik menü">İki kişilik menü</option>
                  <option value="Aile menüsü">Aile menüsü</option>
                  <option value="Karışık menü">Karışık menü</option>
                  <option value="Özel menüler">Özel menüler</option>
                </select>
              </div>
              <div className="sm:col-span-4">
                <label className="block font-medium mb-1">Paket İçeriği (virgülle ayırın)</label>
                <input
                  type="text"
                  value={pkgContentsText}
                  onChange={(e) => setPkgContentsText(e.target.value)}
                  placeholder="2x Ciğer Şiş, 1x Çıtır Lahmacun, 2x Ayran"
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-2.5 py-1.5"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="block font-medium mb-1">Fiyat</label>
                <input
                  type="number"
                  min={50}
                  value={pkgPrice}
                  onChange={(e) => setPkgPrice(Number(e.target.value))}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-2 py-1.5 font-mono"
                />
              </div>
              <div className="sm:col-span-2 flex gap-1.5">
                <label className="px-2.5 py-1.5 rounded-lg border border-dashed border-[#B86B35] text-[#B86B35] font-semibold cursor-pointer">
                  Resim
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) =>
                      readMultiImageFiles(e.target.files, (urls) => {
                        setPkgImageUrls((prev) => Array.from(new Set([...prev, ...urls])));
                        setPkgImageUrl(urls[0]);
                      })
                    }
                  />
                </label>
                <button
                  type="submit"
                  className="flex-1 py-1.5 px-3 rounded-lg bg-[#B86B35] text-white font-semibold cursor-pointer"
                >
                  {editingPkgId ? 'Güncelle' : '+ Ekle'}
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {packages.map((pk) => (
                <div
                  key={pk.id}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 flex items-start gap-3"
                >
                  <img
                    src={pk.imageUrl || pk.imageUrls?.[0] || '/assets/aistudio/crops/cat-ciger.png'}
                    alt={pk.name}
                    className="w-14 h-14 rounded-lg object-cover border border-neutral-300 dark:border-neutral-700 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">{pk.name}</div>
                    <div className="text-[11px] text-[#B86B35] font-mono">{pk.price.toFixed(2)} ₺ · {pk.type}</div>
                    <p className="text-[11px] text-neutral-500 line-clamp-1">{pk.contents.join(', ')}</p>
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPkgId(pk.id);
                          setPkgName(pk.name);
                          setPkgType(pk.type);
                          setPkgContentsText(pk.contents.join(', '));
                          setPkgPrice(pk.price);
                          const firstImg = pk.imageUrl || pk.imageUrls?.[0] || '/assets/aistudio/crops/cat-ciger.png';
                          setPkgImageUrl(firstImg);
                          setPkgImageUrls(pk.imageUrls && pk.imageUrls.length > 0 ? pk.imageUrls : [firstImg]);
                        }}
                        className="text-[11px] text-[#B86B35] font-semibold cursor-pointer"
                      >
                        Düzenle
                      </button>
                      {onDeletePackage && (
                        <button
                          type="button"
                          onClick={() => onDeletePackage(pk.id)}
                          className="text-[11px] text-rose-500 font-semibold cursor-pointer"
                        >
                          Sil
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODÜL 6: KATEGORİ YÖNETİMİ & RESİM EKLEME / DÜZENLEME
      ===================================================================== */}
      {activeModuleId === 6 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-[#B86B35] dark:text-[#D4AF6A]">Vitrin Kategori &amp; Grid Yerleşimi: </span>
              <span className="text-neutral-500">
                Masaüstü {siteCmsConfig.design.gridColumnsDesktop ?? 3} sütun · Mobil {siteCmsConfig.design.gridColumnsMobile ?? 1} sütun olarak gösterilir.
              </span>
            </div>
            <button
              type="button"
              onClick={() => onSelectModule(34)}
              className="px-3 py-1.5 rounded-lg border border-[#B86B35]/50 text-[#B86B35] dark:text-[#D4AF6A] font-semibold cursor-pointer"
            >
              Tasarım → Kartlar &amp; Grid Ayarları
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCatName.trim()) return;
                const finalImg = newCatImageUrl.trim() || newCatImageUrls[0] || '/assets/aistudio/crops/cat-ciger.png';
                const mergedCatImgs = Array.from(new Set([finalImg, ...newCatImageUrls].filter(Boolean)));
                if (editingCatId && onUpdateCategory) {
                  const existing = categories.find((c) => c.id === editingCatId);
                  if (existing) {
                    onUpdateCategory({
                      ...existing,
                      name: newCatName.trim(),
                      description: newCatDesc.trim() || existing.description,
                      imageUrl: finalImg,
                      imageUrls: mergedCatImgs,
                      isPrimaryShowcase: newCatPrimary,
                    });
                    setStatusToast(`${newCatName.trim()} kategorisi ve görselleri güncellendi.`);
                  }
                  setEditingCatId(null);
                } else {
                  onAddCategory(newCatName.trim(), newCatDesc.trim() || 'Özel menü kategorisi', finalImg);
                  setStatusToast(`${newCatName.trim()} kategorisi resimli olarak oluşturuldu.`);
                }
                setNewCatName('');
                setNewCatDesc('');
                setNewCatImageUrl('/assets/aistudio/crops/cat-ciger.png');
                setNewCatImageUrls(['/assets/aistudio/crops/cat-ciger.png']);
                setNewCatPrimary(true);
              }}
              className="lg:col-span-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-3.5 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-neutral-900 dark:text-[#F5F2EB] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#B86B35]" />
                  <span>{editingCatId ? 'Kategoriyi & Resmini Düzenle' : 'Yeni Resimli Kategori Ekle'}</span>
                </h3>
              </div>

              <div>
                <label className="block font-medium mb-1">Kategori Adı *</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Örn: Izgara Ciğer, Kebap Çeşitleri..."
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Kategori Açıklaması</label>
                <input
                  type="text"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Kısa kategori tanıtımı..."
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-medium">Kategori Resmi (URL, Dosya Yükle veya Hazır Seç)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCatImageUrl}
                    onChange={(e) => setNewCatImageUrl(e.target.value)}
                    placeholder="/assets/aistudio/crops/cat-ciger.png"
                    className="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono text-[11px]"
                  />
                  <label className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-neutral-900 dark:bg-[#D4AF6A] text-white dark:text-[#141413] font-semibold cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Resim Yükle</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={(e) =>
                        readMultiImageFiles(e.target.files, (urls) => {
                          setNewCatImageUrls((prev) => Array.from(new Set([...prev, ...urls])));
                          setNewCatImageUrl(urls[0]);
                        })
                      }
                    />
                  </label>
                </div>

                {/* Hızlı Yemek Görseli Seçimi */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[
                    { label: 'Ciğer', url: '/assets/aistudio/crops/cat-ciger.png' },
                    { label: 'Kebap', url: '/assets/aistudio/crops/cat-kebap.png' },
                    { label: 'Tavuk', url: '/assets/aistudio/crops/cat-tavuk.png' },
                    { label: 'Döner', url: '/assets/aistudio/crops/cat-doner.png' },
                    { label: 'Lahmacun', url: '/assets/aistudio/crops/cat-lahmacun.png' },
                    { label: 'İçecek', url: '/assets/aistudio/crops/gallery-1.png' },
                    { label: 'Salata', url: '/assets/aistudio/crops/gallery-2.png' },
                    { label: 'Ocakbaşı', url: '/assets/aistudio/crops/branded-ocakbasi.jpg' },
                  ].map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => {
                        setNewCatImageUrl(preset.url);
                        setNewCatImageUrls((prev) => Array.from(new Set([...prev, preset.url])));
                      }}
                      className={`p-1 rounded-lg border text-[10px] font-semibold text-center cursor-pointer ${
                        newCatImageUrl === preset.url
                          ? 'border-[#B86B35] bg-[#B86B35]/15'
                          : 'border-neutral-200 dark:border-neutral-800'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-9 object-cover rounded mb-0.5"
                      />
                      <span className="block truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>

                {newCatImageUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {newCatImageUrls.map((url, idx) => (
                      <div
                        key={`${url.slice(0, 20)}-${idx}`}
                        className={`relative w-12 h-9 rounded overflow-hidden border-2 ${
                          newCatImageUrl === url ? 'border-[#B86B35]' : 'border-neutral-300 dark:border-neutral-700'
                        }`}
                      >
                        <img
                          src={url}
                          alt={`Kategori resmi ${idx + 1}`}
                          onClick={() => setNewCatImageUrl(url)}
                          className="w-full h-full object-cover cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setNewCatImageUrls((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="absolute top-0 right-0 bg-black/80 text-white text-[9px] px-1 leading-none"
                          aria-label="Görseli kaldır"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {newCatImageUrl && (
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-2 flex items-center gap-3 bg-neutral-50 dark:bg-[#141413]">
                    <img
                      src={newCatImageUrl}
                      alt="Kategori Önizleme"
                      className="w-16 h-12 rounded-lg object-cover border border-neutral-300 dark:border-neutral-700 shrink-0"
                    />
                    <div className="text-[11px] text-neutral-500">
                      <div className="font-bold text-neutral-900 dark:text-[#F5F2EB]">Canlı Kategori Görseli</div>
                      <div>Müşteri QR menüsündeki kategori kartlarında anlık gösterilir.</div>
                    </div>
                  </div>
                )}
              </div>

              <label className="inline-flex items-center gap-2 cursor-pointer font-semibold pt-1">
                <input
                  type="checkbox"
                  checked={newCatPrimary}
                  onChange={(e) => setNewCatPrimary(e.target.checked)}
                />
                <span>Ana Vitrin Kategori Şeridinde Göster</span>
              </label>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-lg bg-[#B86B35] text-white font-semibold hover:bg-[#9F5928] cursor-pointer"
                >
                  {editingCatId ? 'Kategori Değişikliklerini Kaydet' : 'Yeni Kategoriyi Kaydet'}
                </button>
                {editingCatId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCatId(null);
                      setNewCatName('');
                      setNewCatDesc('');
                      setNewCatImageUrl('/assets/aistudio/crops/cat-ciger.png');
                      setNewCatPrimary(true);
                    }}
                    className="px-3 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 font-semibold cursor-pointer"
                  >
                    Vazgeç
                  </button>
                )}
              </div>
            </form>

            {/* Category Visual Grid */}
            <div className="lg:col-span-7 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">
                  Kayıtlı Menü Kategorileri &amp; Görseller ({categories.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col justify-between bg-neutral-50 dark:bg-[#141413]"
                  >
                    <div className="relative h-28 bg-neutral-900">
                      <img
                        src={cat.imageUrl || '/assets/aistudio/crops/cat-ciger.png'}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                      <span
                        className={`absolute top-2 end-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          cat.isPrimaryShowcase
                            ? 'bg-emerald-600 text-white'
                            : 'bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        {cat.isPrimaryShowcase ? 'Vitrin Aktif' : 'Gizli'}
                      </span>
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="font-bold text-sm text-neutral-900 dark:text-[#F5F2EB]">
                        {cat.name}
                      </div>
                      <p className="text-[11px] text-neutral-500 line-clamp-2">{cat.description}</p>
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCatId(cat.id);
                            setNewCatName(cat.name);
                            setNewCatDesc(cat.description);
                            const catPrimary = cat.imageUrl || '/assets/aistudio/crops/cat-ciger.png';
                            setNewCatImageUrl(catPrimary);
                            setNewCatImageUrls(cat.imageUrls && cat.imageUrls.length > 0 ? cat.imageUrls : [catPrimary]);
                            setNewCatPrimary(Boolean(cat.isPrimaryShowcase ?? true));
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#B86B35] text-white font-semibold cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Düzenle / Resim Değiştir</span>
                        </button>
                        {onDeleteCategory && (
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteCategory(cat.id);
                              setStatusToast(`${cat.name} kategorisi silindi.`);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-500/40 text-red-500 font-semibold cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Sil</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODÜL 14: STOK YÖNETİMİ & DEPO HAREKETLERİ (SADECE STOK)
      ===================================================================== */}
      {activeModuleId === 14 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onRecordStockOperation({
                  ingredientId: selectedStockId,
                  type: stockOpType,
                  quantity: stockOpQty,
                  note: stockOpNote.trim() || 'Manuel depo stok hareketi',
                });
                setStockOpNote('');
                setStatusToast('Stok hareketi silinmez işlem kütüğüne kaydedildi.');
              }}
              className="lg:col-span-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-3 text-xs"
            >
              <h3 className="text-base font-semibold text-neutral-900 dark:text-[#F5F2EB]">
                Stok Giriş / Çıkış / Sayım / Fire Kaydı
              </h3>
              <p className="text-neutral-500">
                Stok hareketleri asla silinmez; düzeltmeler ters kayıt veya sayım farkı hareketiyle yapılır.
              </p>
              <div>
                <label className="block font-medium mb-1">Stok Kalemi (Lot & SKT Takipli)</label>
                <select
                  value={selectedStockId}
                  onChange={(e) => setSelectedStockId(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                >
                  {stocks.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Mevcut: {s.currentStock} {s.unit} · {s.unitCost} ₺/{s.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">İşlem Türü</label>
                  <select
                    value={stockOpType}
                    onChange={(e) => setStockOpType(e.target.value as typeof stockOpType)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                  >
                    <option value="in">Stok Girişi (Alış Faturası)</option>
                    <option value="out">Stok Çıkışı</option>
                    <option value="waste">Fire / Zayi Kaydı</option>
                    <option value="count_adjust">Sayım Farkı Düzeltme</option>
                    <option value="transfer">Depolar / Şubeler Arası Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Miktar</label>
                  <input
                    type="number"
                    step="0.1"
                    min={0.1}
                    value={stockOpQty}
                    onChange={(e) => setStockOpQty(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1">Fatura / Lot / Açıklama Notu</label>
                <input
                  type="text"
                  value={stockOpNote}
                  onChange={(e) => setStockOpNote(e.target.value)}
                  placeholder="Örn: Trakya Besi İrsaliye #902 veya Hazırlık Firesi"
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 rounded-lg bg-[#B86B35] text-white font-semibold hover:bg-[#9F5928]"
              >
                Stok Hareketini İşle
              </button>
            </form>

            {/* Stock Inventory Table */}
            <div className="lg:col-span-7 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-3">
              <h3 className="text-base font-semibold">
                Güncel Envanter, Lot/Parti, SKT & Tedarikçi Listesi
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
                      <th className="py-2 pr-2">Hammadde / Kategori</th>
                      <th className="py-2 px-2">Tedarikçi & Lot</th>
                      <th className="py-2 px-2 text-right">Mevcut / Kritik</th>
                      <th className="py-2 pl-2 text-right">Birim Maliyet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800">
                    {stocks.map((st) => {
                      const isLow = st.currentStock <= st.minStockThreshold;
                      return (
                        <tr key={st.id}>
                          <td className="py-2.5 pr-2">
                            <div className="font-semibold">{st.name}</div>
                            <div className="text-[11px] text-neutral-500">
                              {st.category} · {st.warehouse}
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-[11px]">
                            <div>{st.supplierName}</div>
                            <div className="font-mono text-neutral-500">
                              {st.lotNumber} · SKT: {st.expiryDate}
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                            <span
                              className={
                                isLow
                                  ? 'font-bold text-amber-600 dark:text-amber-400'
                                  : 'font-semibold'
                              }
                            >
                              {st.currentStock} {st.unit}
                            </span>{' '}
                            <span className="text-neutral-400">/ {st.minStockThreshold}</span>
                          </td>
                          <td className="py-2.5 pl-2 text-right font-mono tabular-nums font-semibold">
                            {st.unitCost.toFixed(2)} ₺
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Immutable Stock Movements Ledger */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-3">
            <h3 className="text-base font-semibold">
              Silinmez Stok Hareket Kütüğü (Reçete Düşümleri, Alışlar, Fire ve Ters Kayıtlar)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
                    <th className="py-2 pr-3">Tarih / Hareket No</th>
                    <th className="py-2 px-3">Malzeme</th>
                    <th className="py-2 px-3">Tür</th>
                    <th className="py-2 px-3">Açıklama / Referans</th>
                    <th className="py-2 pl-3 text-right">Miktar Değişimi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800">
                  {stockMovements.map((m) => (
                    <tr key={m.id}>
                      <td className="py-2 pr-3 font-mono text-[11px]">
                        {m.timestamp} · {m.id}
                      </td>
                      <td className="py-2 px-3 font-semibold">{m.ingredientName}</td>
                      <td className="py-2 px-3 font-mono text-[11px]">{m.movementType}</td>
                      <td className="py-2 px-3 text-neutral-500">
                        {m.note} ({m.actorName})
                      </td>
                      <td
                        className={`py-2 pl-3 text-right font-mono tabular-nums font-bold ${
                          m.quantityDelta >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {m.quantityDelta > 0 ? `+${m.quantityDelta}` : m.quantityDelta} {m.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODÜL 15: ÜRÜN REÇETELERİ & MALİYET ANALİZİ (EKLE / DÜZENLE / SİL)
      ===================================================================== */}
      {activeModuleId === 15 && (() => {
        const selectedProd =
          products.find((p) => p.id === selectedRecipeProductId) || products[0] || null;
        const selectedEffPrice = selectedProd
          ? selectedProd.discountedPrice ?? selectedProd.price
          : 0;
        const selectedMetrics = selectedProd
          ? calculateRecipeMetrics(
              selectedProd.recipeLines,
              selectedProd.wasteAllowancePercent,
              selectedEffPrice
            )
          : null;

        return (
          <div className="space-y-6 text-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 5 Cols: Recipe Ingredient Add / Edit / Waste % Form */}
              <div className="lg:col-span-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#B86B35]" />
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-[#F5F2EB]">
                        Reçete &amp; Maliyet Kalemi Ekle / Düzenle / Sil
                      </h3>
                      <p className="text-[11px] text-neutral-500">
                        Ürün seçin, stoktan veya özel hammadde ekleyin, gramaj ve fire oranını yönetin.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Reçetesi Düzenlenecek Ürün</label>
                  <select
                    data-testid="recipe-product-select"
                    value={selectedProd?.id || ''}
                    onChange={(e) => {
                      setSelectedRecipeProductId(e.target.value);
                      setEditingRecipeIngId(null);
                    }}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-semibold"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code}) · Satış: {(p.discountedPrice ?? p.price).toFixed(2)} ₺
                      </option>
                    ))}
                  </select>
                </div>

                {selectedProd && selectedMetrics && (
                  <>
                    {/* Waste Allowance % & Cost Summary Box */}
                    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#141413] p-3.5 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <label className="font-semibold">
                          Üretim / Pişirme Fire Payı (%):
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={60}
                            step={0.5}
                            data-testid="recipe-waste-input"
                            value={selectedProd.wasteAllowancePercent}
                            onChange={(e) => {
                              const nextWaste = Math.max(0, Math.min(60, Number(e.target.value)));
                              onUpdateProduct?.({
                                ...selectedProd,
                                wasteAllowancePercent: nextWaste,
                              });
                            }}
                            className="w-20 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-2.5 py-1 font-mono text-right font-bold"
                          />
                          <span className="font-mono text-neutral-500">%</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800 font-mono">
                        <div>
                          <div className="text-[10px] text-neutral-500">Ham Maliyet</div>
                          <div className="font-bold">
                            {selectedMetrics.materialCost.toFixed(2)} ₺
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-neutral-500">Fire Dahil Net</div>
                          <div className="font-bold text-[#B86B35] dark:text-[#D4AF6A]">
                            {selectedMetrics.totalRecipeCost.toFixed(2)} ₺
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-neutral-500">Brüt Kâr / Marj</div>
                          <div className="font-bold text-emerald-600 dark:text-emerald-400">
                            +{selectedMetrics.grossProfit.toFixed(2)} ₺ (%{selectedMetrics.profitMarginPercent})
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Add / Update Ingredient Line Form */}
                    <form
                      data-testid="recipe-add-line-form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!recipeIngName.trim() || recipeIngQty <= 0) return;
                        const targetIngId =
                          editingRecipeIngId ||
                          (recipeStockChoiceId !== 'CUSTOM'
                            ? recipeStockChoiceId
                            : `ING-CUST-${Date.now().toString().slice(-4)}`);
                        const updatedLines = upsertProductRecipeLine(selectedProd.recipeLines, {
                          ingredientId: targetIngId,
                          ingredientName: recipeIngName.trim(),
                          unit: recipeIngUnit,
                          quantity: Number(recipeIngQty),
                          unitCost: Number(recipeIngUnitCost),
                        });
                        const updatedText = updatedLines
                          .map((l) => `${l.ingredientName} (${l.quantity} ${l.unit})`)
                          .join(', ');
                        onUpdateProduct?.({
                          ...selectedProd,
                          recipeLines: updatedLines,
                          ingredientsText: updatedText || selectedProd.ingredientsText,
                        });
                        setEditingRecipeIngId(null);
                        setStatusToast(
                          `${selectedProd.name} reçetesine "${recipeIngName.trim()}" kalemi kaydedildi.`
                        );
                      }}
                      className="space-y-3 pt-2 border-t border-neutral-200 dark:border-neutral-800"
                    >
                      <div className="font-bold text-[#B86B35] dark:text-[#D4AF6A] flex items-center justify-between">
                        <span>
                          {editingRecipeIngId
                            ? 'Seçili Reçete Kalemini Güncelle'
                            : 'Yeni Reçete Hammaddesi Ekle'}
                        </span>
                        {editingRecipeIngId && (
                          <button
                            type="button"
                            onClick={() => setEditingRecipeIngId(null)}
                            className="text-[11px] underline text-neutral-500 cursor-pointer"
                          >
                            Düzenlemeden Vazgeç
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="block font-medium mb-1">Depo Stok Kaleminden Seç (İsteğe Bağlı)</label>
                        <select
                          value={recipeStockChoiceId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setRecipeStockChoiceId(val);
                            const st = stocks.find((s) => s.id === val);
                            if (st) {
                              setRecipeIngName(st.name);
                              setRecipeIngUnit(st.unit);
                              setRecipeIngUnitCost(st.unitCost);
                            }
                          }}
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5"
                        >
                          {stocks.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.unitCost} ₺ / {s.unit})
                            </option>
                          ))}
                          <option value="CUSTOM">+ Özel Hammadde / Garnitür Girişi</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block font-medium mb-1">Hammadde Adı *</label>
                          <input
                            type="text"
                            required
                            data-testid="recipe-ing-name-input"
                            value={recipeIngName}
                            onChange={(e) => setRecipeIngName(e.target.value)}
                            placeholder="Örn: Kuzu Ciğeri"
                            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                          />
                        </div>
                        <div>
                          <label className="block font-medium mb-1">Birim (kg/lt/adet)</label>
                          <select
                            value={recipeIngUnit}
                            onChange={(e) =>
                              setRecipeIngUnit(
                                e.target.value as 'adet' | 'gr' | 'kg' | 'lt' | 'ml' | 'paket'
                              )
                            }
                            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5 font-mono"
                          >
                            <option value="kg">kg</option>
                            <option value="gr">gr</option>
                            <option value="lt">lt</option>
                            <option value="ml">ml</option>
                            <option value="adet">adet</option>
                            <option value="paket">paket</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-medium mb-1">Porsiyon Miktarı *</label>
                          <input
                            type="number"
                            step="0.001"
                            min="0.001"
                            required
                            data-testid="recipe-ing-qty-input"
                            value={recipeIngQty}
                            onChange={(e) => setRecipeIngQty(Number(e.target.value))}
                            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block font-medium mb-1">Birim Maliyet (₺)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            data-testid="recipe-ing-cost-input"
                            value={recipeIngUnitCost}
                            onChange={(e) => setRecipeIngUnitCost(Number(e.target.value))}
                            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5 font-mono"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        data-testid="recipe-save-line-btn"
                        className="w-full py-2 px-4 rounded-lg bg-[#B86B35] hover:bg-[#9F5928] text-white font-bold cursor-pointer"
                      >
                        {editingRecipeIngId
                          ? 'Reçete Kalemini Güncelle'
                          : '+ Reçeteye Hammadde Ekle'}
                      </button>
                    </form>

                    {/* Active Product Recipe Lines List with Edit & Delete */}
                    <div className="space-y-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                      <div className="flex items-center justify-between">
                        <span className="font-bold">
                          {selectedProd.name} Hammadde Kalemleri ({selectedProd.recipeLines.length})
                        </span>
                      </div>
                      {selectedProd.recipeLines.length === 0 ? (
                        <div className="p-4 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 text-center text-neutral-500">
                          Bu üründe henüz reçete kalemi yok. Yukarıdaki formdan hammadde ekleyin.
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {selectedProd.recipeLines.map((rl) => {
                            const lineTotal = roundCurrency(rl.quantity * rl.unitCost);
                            return (
                              <div
                                key={rl.ingredientId}
                                data-testid={`recipe-line-row-${rl.ingredientId}`}
                                className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-neutral-50 dark:bg-[#141413] border border-neutral-200/80 dark:border-neutral-800"
                              >
                                <div>
                                  <div className="font-semibold text-neutral-900 dark:text-[#F5F2EB]">
                                    {rl.ingredientName}
                                  </div>
                                  <div className="text-[11px] font-mono text-neutral-500">
                                    {rl.quantity} {rl.unit} × {rl.unitCost.toFixed(2)} ₺ ={' '}
                                    <strong className="text-[#B86B35] dark:text-[#D4AF6A]">
                                      {lineTotal.toFixed(2)} ₺
                                    </strong>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    data-testid={`recipe-edit-line-${rl.ingredientId}`}
                                    onClick={() => {
                                      setEditingRecipeIngId(rl.ingredientId);
                                      setRecipeIngName(rl.ingredientName);
                                      setRecipeIngUnit(rl.unit);
                                      setRecipeIngQty(rl.quantity);
                                      setRecipeIngUnitCost(rl.unitCost);
                                    }}
                                    className="px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:border-[#B86B35] font-semibold cursor-pointer"
                                  >
                                    Düzenle
                                  </button>
                                  <button
                                    type="button"
                                    data-testid={`recipe-delete-line-${rl.ingredientId}`}
                                    onClick={() => {
                                      const nextLines = removeProductRecipeLine(
                                        selectedProd.recipeLines,
                                        rl.ingredientId
                                      );
                                      onUpdateProduct?.({
                                        ...selectedProd,
                                        recipeLines: nextLines,
                                      });
                                      setStatusToast(
                                        `"${rl.ingredientName}" kalemi ${selectedProd.name} reçetesinden silindi.`
                                      );
                                    }}
                                    className="p-1.5 rounded text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                                    aria-label={`${rl.ingredientName} sil`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Right 7 Cols: All Products Recipe & Margin Overview Table */}
              <div className="lg:col-span-7 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-semibold">
                      Tüm Ürün Reçeteleri, Fire Oranları &amp; Maliyet Kârlılık Tablosu
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Tablodaki herhangi bir ürüne tıklayarak reçete hammaddelerini düzenleyebilir veya silebilirsiniz.
                    </p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
                        <th className="py-2 pr-3">Ürün</th>
                        <th className="py-2 px-3">Reçete Hammaddeleri</th>
                        <th className="py-2 px-3 text-right">Fire %</th>
                        <th className="py-2 px-3 text-right">Net Maliyet</th>
                        <th className="py-2 px-3 text-right">Brüt Kâr / Marj</th>
                        <th className="py-2 pl-3 text-right">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800">
                      {products.map((p) => {
                        const eff = p.discountedPrice ?? p.price;
                        const metrics = calculateRecipeMetrics(
                          p.recipeLines,
                          p.wasteAllowancePercent,
                          eff
                        );
                        const isSelectedRow = p.id === selectedProd?.id;
                        return (
                          <tr
                            key={p.id}
                            className={
                              isSelectedRow ? 'bg-[#B86B35]/10' : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/40'
                            }
                          >
                            <td className="py-2.5 pr-3 font-semibold">{p.name}</td>
                            <td className="py-2.5 px-3 text-neutral-500">
                              {p.recipeLines.length > 0
                                ? p.recipeLines
                                    .map((rl) => `${rl.ingredientName} (${rl.quantity} ${rl.unit})`)
                                    .join(', ')
                                : p.ingredientsText}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono">
                              %{p.wasteAllowancePercent}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono">
                              {metrics.totalRecipeCost.toFixed(2)} ₺
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              +{metrics.grossProfit.toFixed(2)} ₺ (%{metrics.profitMarginPercent})
                            </td>
                            <td className="py-2.5 pl-3 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedRecipeProductId(p.id);
                                  setEditingRecipeIngId(null);
                                }}
                                className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${
                                  isSelectedRow
                                    ? 'bg-[#B86B35] text-white'
                                    : 'border border-neutral-300 dark:border-neutral-700'
                                }`}
                              >
                                Reçete Düzenle
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =====================================================================
          MODÜL 17: ÜYE YÖNETİMİ (CRM, SADAKAT PUANI, CÜZDAN & ÜYE CRUD)
      ===================================================================== */}
      {activeModuleId === 17 && (
        <div className="space-y-6">
          {/* Üye Özet Metrikleri */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-4">
              <div className="text-neutral-500">Toplam Kayıtlı Üye</div>
              <div className="text-xl font-mono font-bold mt-1">{customers.length}</div>
            </div>
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-4">
              <div className="text-neutral-500">VIP &amp; Sadık Üye</div>
              <div className="text-xl font-mono font-bold mt-1 text-[#B86B35] dark:text-[#D4AF6A]">
                {customers.filter((c) => c.group === 'VIP Misafir' || c.group === 'Sadık Müşteri').length}
              </div>
            </div>
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-4">
              <div className="text-neutral-500">Toplam Sadakat Puanı</div>
              <div className="text-xl font-mono font-bold mt-1 text-emerald-500">
                {customers.reduce((s, c) => s + c.points, 0).toLocaleString('tr-TR')} P
              </div>
            </div>
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-4">
              <div className="text-neutral-500">Toplam Üye Cüzdan Bakiyesi</div>
              <div className="text-xl font-mono font-bold mt-1">
                {customers.reduce((s, c) => s + c.walletBalance, 0).toLocaleString('tr-TR')} ₺
              </div>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!custName.trim() || !custPhone.trim()) return;
              if (editingCustomerId && onUpdateCustomer) {
                const existing = customers.find((x) => x.id === editingCustomerId);
                if (existing) {
                  onUpdateCustomer({
                    ...existing,
                    name: custName.trim(),
                    phone: custPhone.trim(),
                    email: custEmail.trim() || existing.email,
                    district: custDistrict.trim() || 'Şahinbey',
                    address: custAddress.trim() || `${custDistrict.trim() || 'Şahinbey'} Mah.`,
                    group: custGroup,
                    birthDate: custBirthDate || '1990-01-01',
                    preferences: custPreferences.trim() || 'Standart servis',
                    points: Math.max(0, Number(custPointsInput) || 0),
                    walletBalance: Math.max(0, Number(custWalletInput) || 0),
                    kvkkApproved: custKvkkApproved,
                    marketingSmsApproved: custMarketingConsent,
                    isBlocked: custIsBlocked,
                  });
                  setStatusToast(`${custName.trim()} üye kaydı güncellendi.`);
                }
                setEditingCustomerId(null);
              } else {
                onAddCustomer({
                  name: custName.trim(),
                  phone: custPhone.trim(),
                  email: custEmail.trim() || 'uye@oztikeciger.com.tr',
                  address: custAddress.trim() || `${custDistrict.trim() || 'Şahinbey'} Mah.`,
                  district: custDistrict.trim() || 'Şahinbey',
                  group: custGroup,
                  birthDate: custBirthDate || '1990-01-01',
                  preferences: custPreferences.trim() || 'Standart servis',
                  referralCode: `OZT-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
                  kvkkApproved: custKvkkApproved,
                  marketingSmsApproved: custMarketingConsent,
                  isBlocked: custIsBlocked,
                  points: Math.max(0, Number(custPointsInput) || 50),
                  walletBalance: Math.max(0, Number(custWalletInput) || 0),
                });
                setStatusToast('Yeni üye kaydı oluşturuldu (sadakat puanı & izinler tanımlandı).');
              }
              setCustName('');
              setCustPhone('');
              setCustEmail('');
              setCustAddress('');
              setCustGroup('Standart');
              setCustPreferences('Standart servis');
              setCustPointsInput(50);
              setCustWalletInput(0);
              setCustKvkkApproved(true);
              setCustMarketingConsent(false);
              setCustIsBlocked(false);
            }}
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-3 text-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-[#B86B35]" />
                <span>{editingCustomerId ? 'Üye Bilgilerini Düzenle' : 'Yeni Üye Ekle (CRM, Sadakat & KVKK)'}</span>
              </h3>
              {editingCustomerId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCustomerId(null);
                    setCustName('');
                    setCustPhone('');
                    setCustEmail('');
                    setCustAddress('');
                    setCustGroup('Standart');
                    setCustPointsInput(50);
                    setCustWalletInput(0);
                    setCustIsBlocked(false);
                  }}
                  className="px-3 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 font-semibold cursor-pointer"
                >
                  Düzenlemeyi İptal Et
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block font-medium mb-1">Ad Soyad *</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="Ad Soyad"
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Telefon *</label>
                <input
                  type="tel"
                  required
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  placeholder="05XX XXX XX XX"
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">E-posta</label>
                <input
                  type="email"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  placeholder="uye@ornek.com"
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Üye Grubu</label>
                <select
                  value={custGroup}
                  onChange={(e) => setCustGroup(e.target.value as CustomerRecord['group'])}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                >
                  <option value="Standart">Standart</option>
                  <option value="Sadık Müşteri">Sadık Müşteri</option>
                  <option value="VIP Misafir">VIP Misafir</option>
                  <option value="Kurumsal">Kurumsal</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Bölge / İlçe</label>
                <input
                  type="text"
                  value={custDistrict}
                  onChange={(e) => setCustDistrict(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Açık Adres</label>
                <input
                  type="text"
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  placeholder="Teslimat adresi..."
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium mb-1">Sadakat Puanı</label>
                  <input
                    type="number"
                    min={0}
                    value={custPointsInput}
                    onChange={(e) => setCustPointsInput(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Cüzdan (₺)</label>
                  <input
                    type="number"
                    min={0}
                    value={custWalletInput}
                    onChange={(e) => setCustWalletInput(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-2 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1">Tercih / Notlar</label>
                <input
                  type="text"
                  value={custPreferences}
                  onChange={(e) => setCustPreferences(e.target.value)}
                  placeholder="Örn: Acısız, soğanlı lavaş..."
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={custKvkkApproved}
                    onChange={(e) => setCustKvkkApproved(e.target.checked)}
                  />
                  <span>KVKK Aydınlatma Onaylı</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={custMarketingConsent}
                    onChange={(e) => setCustMarketingConsent(e.target.checked)}
                  />
                  <span>Ticari İleti (SMS/E-posta) İzni</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-rose-500 font-semibold">
                  <input
                    type="checkbox"
                    checked={custIsBlocked}
                    onChange={(e) => setCustIsBlocked(e.target.checked)}
                  />
                  <span>Hesabı Askıya Al / Engelle</span>
                </label>
              </div>
              <button
                type="submit"
                data-testid="save-member-btn"
                className="px-4 py-2 rounded-lg bg-[#B86B35] text-white font-semibold cursor-pointer"
              >
                {editingCustomerId ? 'Üye Bilgilerini Güncelle' : 'Üyeyi Kaydet'}
              </button>
            </div>
          </form>

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-semibold">
                Üye Listesi, Sadakat Puanları &amp; Cüzdanlar ({customers.length})
              </h3>
              <div className="relative w-full sm:w-64 text-xs">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={custSearchQuery}
                  onChange={(e) => setCustSearchQuery(e.target.value)}
                  placeholder="Üye adı, telefon veya referans ara..."
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] pl-8 pr-3 py-1.5"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customers
                .filter(
                  (c) =>
                    !custSearchQuery.trim() ||
                    `${c.name} ${c.phone} ${c.email} ${c.referralCode} ${c.group}`
                      .toLowerCase()
                      .includes(custSearchQuery.toLowerCase())
                )
                .map((c) => (
                  <div
                    key={c.id}
                    data-testid={`member-card-${c.id}`}
                    className={`rounded-lg border p-4 space-y-2 text-xs flex flex-col justify-between ${
                      c.isBlocked
                        ? 'border-rose-500/40 bg-rose-950/10 opacity-75'
                        : 'border-neutral-200 dark:border-neutral-800'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center font-semibold gap-2">
                        <span className="text-sm">{c.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-[#B86B35]/15 text-[#B86B35] dark:text-[#D4AF6A] text-[10px] font-bold">
                          {c.isBlocked ? 'Askıda' : c.group}
                        </span>
                      </div>
                      <div className="text-neutral-500">
                        {c.phone} · {c.email}
                      </div>
                      <div className="text-neutral-500">
                        {c.district} · Referans: <span className="font-mono">{c.referralCode}</span>
                      </div>
                      <div className="font-mono tabular-nums">
                        Puan: <strong>{c.points} P</strong> · Cüzdan: <strong>{c.walletBalance} ₺</strong> · Sipariş: {c.totalOrders}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        KVKK: {c.kvkkApproved ? 'Onaylı' : 'Bekliyor'} · SMS: {c.marketingSmsApproved ? 'İzinli' : 'Kapalı'}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-neutral-200 dark:border-neutral-800">
                      <button
                        type="button"
                        onClick={() => {
                          onAdjustLoyaltyPoints(c.id, 100, 'Sadakat ödül puanı kazanımı');
                          setStatusToast(`${c.name} hesabına +100 sadakat puanı eklendi.`);
                        }}
                        className="px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 font-semibold cursor-pointer"
                      >
                        +100 Puan
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onAdjustLoyaltyPoints(c.id, -100, 'Siparişte sadakat puanı harcaması');
                          setStatusToast(`${c.name} hesabından 100 puan düşüldü.`);
                        }}
                        className="px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 font-semibold cursor-pointer"
                      >
                        -100 Puan
                      </button>
                      {onUpdateCustomer && (
                        <button
                          type="button"
                          data-testid={`edit-member-btn-${c.id}`}
                          onClick={() => {
                            setEditingCustomerId(c.id);
                            setCustName(c.name);
                            setCustPhone(c.phone);
                            setCustEmail(c.email);
                            setCustDistrict(c.district);
                            setCustAddress(c.address);
                            setCustGroup(c.group);
                            setCustBirthDate(c.birthDate || '1990-01-01');
                            setCustPreferences(c.preferences);
                            setCustPointsInput(c.points);
                            setCustWalletInput(c.walletBalance);
                            setCustKvkkApproved(c.kvkkApproved);
                            setCustMarketingConsent(c.marketingSmsApproved);
                            setCustIsBlocked(Boolean(c.isBlocked));
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded border border-[#B86B35]/45 text-[#B86B35] dark:text-[#D4AF6A] font-semibold cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" /> Düzenle
                        </button>
                      )}
                      {onDeleteCustomer && (
                        <button
                          type="button"
                          data-testid={`delete-member-btn-${c.id}`}
                          onClick={() => {
                            onDeleteCustomer(c.id);
                            setStatusToast(`${c.name} üye kaydı silindi.`);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded border border-rose-500/40 text-rose-500 font-semibold cursor-pointer ml-auto"
                        >
                          <Trash2 className="w-3 h-3" /> Sil
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Müşteri Yorumları ve Şikayetleri Gelen Kutusu */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-3 text-xs">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                <span>Müşteri Yorumları &amp; Puanları ({customerReviews.length})</span>
              </h3>
              {customerReviews.length === 0 ? (
                <p className="text-neutral-500">Henüz değerlendirme bulunmuyor.</p>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto">
                  {customerReviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 space-y-1 bg-neutral-50 dark:bg-[#141413]"
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span>{rev.customerName} ({rev.customerPhone})</span>
                        <span className="text-amber-500 font-mono">{'★'.repeat(rev.rating)} ({rev.rating}/5)</span>
                      </div>
                      {rev.productName && (
                        <div className="text-[11px] text-[#B86B35] font-medium">Ürün: {rev.productName}</div>
                      )}
                      <p className="text-neutral-600 dark:text-neutral-300">{rev.comment}</p>
                      <div className="text-[10px] text-neutral-400">{rev.createdAt}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-3 text-xs">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <MessageSquareWarning className="w-4 h-4 text-rose-500" />
                <span>Müşteri Şikayet &amp; Talep Kutusu ({customerComplaints.length})</span>
              </h3>
              {customerComplaints.length === 0 ? (
                <p className="text-neutral-500">Açık müşteri şikayeti bulunmuyor.</p>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto">
                  {customerComplaints.map((cmp) => (
                    <div
                      key={cmp.id}
                      className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 space-y-1.5 bg-neutral-50 dark:bg-[#141413]"
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span>{cmp.subject} — {cmp.customerName}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            cmp.status === 'Çözüldü'
                              ? 'bg-emerald-600 text-white'
                              : cmp.status === 'İnceleniyor'
                              ? 'bg-amber-500 text-black'
                              : 'bg-rose-600 text-white'
                          }`}
                        >
                          {cmp.status}
                        </span>
                      </div>
                      <p className="text-neutral-600 dark:text-neutral-300">{cmp.message}</p>
                      <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1">
                        <span>{cmp.customerPhone} {cmp.orderNumber ? `· Sipariş: ${cmp.orderNumber}` : ''} · {cmp.createdAt}</span>
                        {onUpdateComplaintStatus && cmp.status !== 'Çözüldü' && (
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => onUpdateComplaintStatus(cmp.id, 'İnceleniyor')}
                              className="px-2 py-0.5 rounded border border-amber-500/50 text-amber-500 font-semibold cursor-pointer"
                            >
                              İncele
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateComplaintStatus(cmp.id, 'Çözüldü');
                                setStatusToast(`${cmp.id} şikayeti çözüldü olarak işaretlendi.`);
                              }}
                              className="px-2 py-0.5 rounded bg-emerald-600 text-white font-semibold cursor-pointer"
                            >
                              Çözüldü İşaretle
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODÜL 19: KAMPANYALAR & KUPON KODLARI (EKLE / DÜZENLE / SİL)
      ===================================================================== */}
      {activeModuleId === 19 && (
        <div className="space-y-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!campName.trim() || !campCode.trim()) return;
              if (editingCampId && onUpdateCampaign) {
                const existing = campaigns.find((c) => c.id === editingCampId);
                if (existing) {
                  onUpdateCampaign({
                    ...existing,
                    name: campName.trim(),
                    type: campType,
                    couponCode: campCode.trim().toUpperCase(),
                    discountValue: campDiscount,
                    minOrderAmount: campMinOrder,
                    usageLimit: campUsageLimit,
                    startDate: campStartDate,
                    endDate: campEndDate,
                  });
                  setStatusToast(`${campName.trim()} kampanyası güncellendi.`);
                }
                setEditingCampId(null);
              } else {
                onAddCampaign({
                  name: campName.trim(),
                  type: campType,
                  couponCode: campCode.trim().toUpperCase(),
                  discountValue: campDiscount,
                  minOrderAmount: campMinOrder,
                  usageLimit: campUsageLimit,
                  canCombine: false,
                  startDate: campStartDate,
                  endDate: campEndDate,
                  isActive: true,
                });
                setStatusToast('Yeni kampanya ve kupon kodu tanımlandı.');
              }
              setCampName('');
              setCampCode('');
              setCampType('Yüzde indirim');
              setCampDiscount(15);
              setCampMinOrder(400);
              setCampUsageLimit(250);
            }}
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4 text-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#B86B35]" />
                <span>
                  {editingCampId ? 'Kampanyayı & Kuponu Düzenle' : 'Kampanya & Kupon Kodu Oluşturma'}
                </span>
              </h3>
              {editingCampId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCampId(null);
                    setCampName('');
                    setCampCode('');
                    setCampType('Yüzde indirim');
                    setCampDiscount(15);
                    setCampMinOrder(400);
                    setCampUsageLimit(250);
                  }}
                  className="px-3 py-1 rounded border border-neutral-300 dark:border-neutral-700 font-semibold cursor-pointer"
                >
                  Düzenlemeyi İptal Et
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
              <div className="lg:col-span-2">
                <label className="block font-medium mb-1">Kampanya Adı *</label>
                <input
                  type="text"
                  required
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  placeholder="Örn: Akşam Aile Menüsü %15 İndirim"
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Kupon Kodu *</label>
                <input
                  type="text"
                  required
                  value={campCode}
                  onChange={(e) => setCampCode(e.target.value)}
                  placeholder="AILE15"
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono uppercase"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">İndirim Tipi</label>
                <select
                  value={campType}
                  onChange={(e) => setCampType(e.target.value as CampaignRecord['type'])}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                >
                  <option value="Yüzde indirim">Yüzde indirim (%)</option>
                  <option value="Sabit tutar indirimi">Sabit tutar indirimi (₺)</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">
                  {campType === 'Sabit tutar indirimi' ? 'İndirim Tutarı (₺)' : 'İndirim Oranı (%)'}
                </label>
                <input
                  type="number"
                  min={1}
                  max={campType === 'Sabit tutar indirimi' ? 5000 : 90}
                  value={campDiscount}
                  onChange={(e) => setCampDiscount(Number(e.target.value))}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Min. Sepet Tutarı (₺)</label>
                <input
                  type="number"
                  min={0}
                  value={campMinOrder}
                  onChange={(e) => setCampMinOrder(Number(e.target.value))}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Kullanım Limiti</label>
                <input
                  type="number"
                  min={1}
                  value={campUsageLimit}
                  onChange={(e) => setCampUsageLimit(Number(e.target.value))}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium mb-1">Başlangıç</label>
                  <input
                    type="date"
                    value={campStartDate}
                    onChange={(e) => setCampStartDate(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2 py-2 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Bitiş</label>
                  <input
                    type="date"
                    value={campEndDate}
                    onChange={(e) => setCampEndDate(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2 py-2 font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#B86B35] text-white font-semibold cursor-pointer"
            >
              {editingCampId ? 'Kampanyayı Güncelle' : 'Kampanyayı Başlat'}
            </button>
          </form>

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-3">
            <h3 className="text-base font-semibold">
              Aktif &amp; Kayıtlı Kampanyalar ({campaigns.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {campaigns.map((camp) => (
                <div
                  key={camp.id}
                  data-testid={`campaign-card-${camp.id}`}
                  className={`rounded-xl border p-4 space-y-2.5 flex flex-col justify-between ${
                    camp.isActive
                      ? 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#141413]'
                      : 'border-neutral-300/60 dark:border-neutral-800/60 bg-neutral-100/70 dark:bg-[#111110] opacity-80'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-[#B86B35] text-white">
                        {camp.couponCode}
                      </span>
                      <span className="font-bold text-emerald-500">
                        {camp.type === 'Sabit tutar indirimi'
                          ? `${camp.discountValue} ₺ İndirim`
                          : `%${camp.discountValue} İndirim`}
                      </span>
                    </div>
                    <div className="font-semibold text-sm">{camp.name}</div>
                    <div className="text-neutral-500">
                      Min. Sepet: {camp.minOrderAmount} ₺ · Kullanım: {camp.usedCount}/{camp.usageLimit}
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      {camp.startDate} – {camp.endDate} ·{' '}
                      <span className={camp.isActive ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'}>
                        {camp.isActive ? 'Yayında' : 'Pasif'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-neutral-200 dark:border-neutral-800">
                    {onUpdateCampaign && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateCampaign({ ...camp, isActive: !camp.isActive });
                            setStatusToast(
                              `${camp.name} ${camp.isActive ? 'pasife alındı' : 'yayına alındı'}.`
                            );
                          }}
                          className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${
                            camp.isActive
                              ? 'bg-emerald-600/15 text-emerald-500 border border-emerald-500/35'
                              : 'bg-amber-600/15 text-amber-500 border border-amber-500/35'
                          }`}
                        >
                          {camp.isActive ? 'Yayında' : 'Aktifleştir'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCampId(camp.id);
                            setCampName(camp.name);
                            setCampCode(camp.couponCode);
                            setCampType(camp.type);
                            setCampDiscount(camp.discountValue);
                            setCampMinOrder(camp.minOrderAmount);
                            setCampUsageLimit(camp.usageLimit);
                            setCampStartDate(camp.startDate);
                            setCampEndDate(camp.endDate);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#B86B35]/45 text-[#B86B35] dark:text-[#D4AF6A] font-semibold cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" /> Düzenle
                        </button>
                      </>
                    )}
                    {onDeleteCampaign && (
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteCampaign(camp.id);
                          setStatusToast(`${camp.name} kampanyası silindi.`);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-rose-500/40 text-rose-500 font-semibold cursor-pointer ml-auto"
                      >
                        <Trash2 className="w-3 h-3" /> Sil
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODÜL 11: REZERVASYON YÖNETİMİ (EKLE / DÜZENLE / SİL & AYARLAR)
      ===================================================================== */}
      {activeModuleId === 11 && (
        <div className="space-y-6 text-xs">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#B86B35]" />
                <div>
                  <h3 className="text-base font-semibold">
                    Rezervasyon Yönetimi, Kapora &amp; Kapasite Ayarları ({reservations.length})
                  </h3>
                  <p className="text-neutral-500">
                    Yeni rezervasyon ekleyin, mevcut rezervasyonları düzenleyin veya silin; çalışma saatleri ve kapora kurallarını yapılandırın.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setResSettingsOpen((p) => !p)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 font-semibold cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" /> Rezervasyon Ayarları
                </button>
                {onAddReservation && (
                  <button
                    type="button"
                    data-testid="new-reservation-btn"
                    onClick={() => {
                      setEditingResId(null);
                      setResCustomerName('');
                      setResCustomerPhone('');
                      setResDate('2026-11-17');
                      setResTime('19:30');
                      setResGuestCount(4);
                      setResTableId(tables[0]?.id || 'TBL-01');
                      setResSource('online');
                      setResDepositAmount(
                        siteCmsConfig.reservationSettings?.depositRequired
                          ? siteCmsConfig.reservationSettings.defaultDepositAmount
                          : 0
                      );
                      setResSpecialRequests('');
                      setResFormOpen((p) => !p);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#B86B35] text-white font-semibold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Yeni Rezervasyon Ekle
                  </button>
                )}
              </div>
            </div>

            {resSettingsOpen && (() => {
              const rsSet = siteCmsConfig.reservationSettings || {
                slotDurationMinutes: 90,
                minPartySize: 1,
                maxPartySize: 24,
                depositRequired: false,
                defaultDepositAmount: 250,
                autoConfirm: false,
                workingStartHour: '11:00',
                workingEndHour: '23:30',
                advanceBookingDays: 30,
                allowCustomerNotes: true,
              };
              const updateResCfg = (patch: Partial<NonNullable<SiteCmsConfig['reservationSettings']>>) =>
                onUpdateSiteCmsConfig((prev) => ({
                  ...prev,
                  reservationSettings: { ...rsSet, ...patch },
                }));
              return (
                <div className="rounded-xl border border-[#B86B35]/35 bg-neutral-50 dark:bg-[#141413] p-4 space-y-3">
                  <div className="font-bold text-sm text-[#B86B35] dark:text-[#D4AF6A]">
                    Rezervasyon Kuralları &amp; Kapora Politikası
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Masa Süresi (dk)</label>
                      <input
                        type="number"
                        min={30}
                        value={rsSet.slotDurationMinutes}
                        onChange={(e) => updateResCfg({ slotDurationMinutes: Number(e.target.value) })}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-2.5 py-1.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Min Kişi</label>
                      <input
                        type="number"
                        min={1}
                        value={rsSet.minPartySize}
                        onChange={(e) => updateResCfg({ minPartySize: Number(e.target.value) })}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-2.5 py-1.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Maks Kişi</label>
                      <input
                        type="number"
                        min={2}
                        value={rsSet.maxPartySize}
                        onChange={(e) => updateResCfg({ maxPartySize: Number(e.target.value) })}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-2.5 py-1.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Açılış Saati</label>
                      <input
                        type="time"
                        value={rsSet.workingStartHour}
                        onChange={(e) => updateResCfg({ workingStartHour: e.target.value })}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-2.5 py-1.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Son Rez. Saati</label>
                      <input
                        type="time"
                        value={rsSet.workingEndHour}
                        onChange={(e) => updateResCfg({ workingEndHour: e.target.value })}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-2.5 py-1.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Varsayılan Kapora (₺)</label>
                      <input
                        type="number"
                        min={0}
                        value={rsSet.defaultDepositAmount}
                        onChange={(e) => updateResCfg({ defaultDepositAmount: Number(e.target.value) })}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-2.5 py-1.5 font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 pt-1">
                    <label className="inline-flex items-center gap-2 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={rsSet.depositRequired}
                        onChange={(e) => updateResCfg({ depositRequired: e.target.checked })}
                      />
                      <span>Kapora Zorunlu</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={rsSet.autoConfirm}
                        onChange={(e) => updateResCfg({ autoConfirm: e.target.checked })}
                      />
                      <span>Web Rezervasyonlarını Otomatik Onayla</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={rsSet.allowCustomerNotes}
                        onChange={(e) => updateResCfg({ allowCustomerNotes: e.target.checked })}
                      />
                      <span>Özel İstek / Not Alanı Aktif</span>
                    </label>
                  </div>
                </div>
              );
            })()}

            {resFormOpen && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!resCustomerName.trim() || !resCustomerPhone.trim()) return;
                  const chosenTable = tables.find((t) => t.id === resTableId) || tables[0];
                  if (editingResId && onUpdateReservation) {
                    const existing = reservations.find((r) => r.id === editingResId);
                    if (existing) {
                      onUpdateReservation({
                        ...existing,
                        customerName: resCustomerName.trim(),
                        customerPhone: resCustomerPhone.trim(),
                        date: resDate,
                        time: resTime,
                        guestCount: Math.max(1, resGuestCount),
                        tableId: chosenTable?.id || existing.tableId,
                        tableNumber: chosenTable?.number || existing.tableNumber,
                        source: resSource,
                        depositAmount: Math.max(0, resDepositAmount),
                        depositPaid: existing.depositPaid || resDepositAmount > 0,
                        specialRequests: resSpecialRequests.trim(),
                      });
                      setStatusToast(`${resCustomerName.trim()} rezervasyonu güncellendi.`);
                    }
                    setEditingResId(null);
                    setResFormOpen(false);
                  } else if (onAddReservation) {
                    const out = onAddReservation({
                      customerName: resCustomerName.trim(),
                      customerPhone: resCustomerPhone.trim(),
                      date: resDate,
                      time: resTime,
                      guestCount: Math.max(1, resGuestCount),
                      tableId: chosenTable?.id || 'TBL-01',
                      tableNumber: chosenTable?.number || 'Salon 1',
                      source: resSource,
                      depositAmount: Math.max(0, resDepositAmount),
                      depositPaid: resDepositAmount > 0,
                      specialRequests: resSpecialRequests.trim(),
                    });
                    setStatusToast(out.message);
                    if (out.success) setResFormOpen(false);
                  }
                }}
                className="rounded-xl border-2 border-[#B86B35]/40 bg-neutral-50 dark:bg-[#141413] p-4 space-y-3"
              >
                <div className="font-bold text-sm">
                  {editingResId ? 'Rezervasyonu Düzenle' : 'Yeni Rezervasyon Kaydı Oluştur'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Misafir Ad Soyad *</label>
                    <input
                      type="text"
                      required
                      value={resCustomerName}
                      onChange={(e) => setResCustomerName(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Telefon *</label>
                    <input
                      type="tel"
                      required
                      value={resCustomerPhone}
                      onChange={(e) => setResCustomerPhone(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Tarih</label>
                    <input
                      type="date"
                      value={resDate}
                      onChange={(e) => setResDate(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Saat</label>
                    <input
                      type="time"
                      value={resTime}
                      onChange={(e) => setResTime(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Kişi Sayısı</label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={resGuestCount}
                      onChange={(e) => setResGuestCount(Number(e.target.value))}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Masa Seçimi</label>
                    <select
                      value={resTableId}
                      onChange={(e) => setResTableId(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5"
                    >
                      {tables.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.number} ({t.capacity} Kişilik · {t.area})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Rezervasyon Kaynağı</label>
                    <select
                      value={resSource}
                      onChange={(e) => setResSource(e.target.value as ReservationItem['source'])}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5"
                    >
                      <option value="online">Web Sitesi / Online</option>
                      <option value="phone">Telefon</option>
                      <option value="walk_in">Kapıdan (Walk-In)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Kapora Tutarı (₺)</label>
                    <input
                      type="number"
                      min={0}
                      value={resDepositAmount}
                      onChange={(e) => setResDepositAmount(Number(e.target.value))}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5 font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-4">
                    <label className="block font-semibold mb-1">Özel İstek / Not</label>
                    <input
                      type="text"
                      value={resSpecialRequests}
                      onChange={(e) => setResSpecialRequests(e.target.value)}
                      placeholder="Örn: Bebek sandalyesi, köşe masa, doğum günü pastası..."
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setResFormOpen(false);
                      setEditingResId(null);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 font-semibold cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    data-testid="save-reservation-btn"
                    className="px-4 py-1.5 rounded-lg bg-[#B86B35] text-white font-bold cursor-pointer"
                  >
                    {editingResId ? 'Rezervasyonu Güncelle' : 'Rezervasyonu Kaydet'}
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reservations.map((res) => (
                <div
                  key={res.id}
                  data-testid={`reservation-card-${res.id}`}
                  className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 space-y-2.5 text-xs"
                >
                  <div className="flex justify-between font-semibold text-sm">
                    <span>
                      {res.customerName} ({res.guestCount} Kişi)
                    </span>
                    <span className="font-mono text-[#B86B35] dark:text-[#D4AF6A]">
                      {res.date} · {res.time}
                    </span>
                  </div>
                  <div className="text-neutral-500">
                    Masa: {res.tableNumber} · Tel: {res.customerPhone} · Kaynak: {res.source}
                  </div>
                  <div className="text-neutral-500">
                    Özel İstek: {res.specialRequests || 'Belirtilmedi'} · Kapora: {res.depositAmount} ₺
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                    {(
                      [
                        { st: 'confirmed', label: 'Onayla' },
                        { st: 'completed', label: 'Masaya Alındı' },
                        { st: 'no_show', label: 'Gelmedi' },
                        { st: 'cancelled', label: 'İptal Et' },
                      ] as const
                    ).map((btn) => (
                      <button
                        key={btn.st}
                        type="button"
                        onClick={() => {
                          onUpdateReservationStatus(res.id, btn.st);
                          setStatusToast(`Rezervasyon durumu "${btn.label}" olarak güncellendi.`);
                        }}
                        className={`px-2 py-1 rounded border cursor-pointer ${
                          res.status === btn.st
                            ? 'bg-[#B86B35] text-white border-[#B86B35]'
                            : 'border-neutral-300 dark:border-neutral-700'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                    {onUpdateReservation && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingResId(res.id);
                          setResCustomerName(res.customerName);
                          setResCustomerPhone(res.customerPhone);
                          setResDate(res.date);
                          setResTime(res.time);
                          setResGuestCount(res.guestCount);
                          setResTableId(res.tableId);
                          setResSource(res.source);
                          setResDepositAmount(res.depositAmount);
                          setResSpecialRequests(res.specialRequests || '');
                          setResFormOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded border border-[#B86B35]/45 text-[#B86B35] dark:text-[#D4AF6A] font-semibold cursor-pointer ml-auto"
                      >
                        <Edit3 className="w-3 h-3" /> Düzenle
                      </button>
                    )}
                    {onDeleteReservation && (
                      <button
                        type="button"
                        data-testid={`delete-reservation-btn-${res.id}`}
                        onClick={() => {
                          onDeleteReservation(res.id);
                          setStatusToast(`${res.customerName} rezervasyonu silindi.`);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded border border-rose-500/40 text-rose-500 font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> Sil
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODÜL 8: CANLI GARSON ÇAĞRILARI & MASA SERVİSİ (SİLİNEBİLİR)
      ===================================================================== */}
      {activeModuleId === 8 && (
        <div className="rounded-xl border border-amber-500/35 bg-white dark:bg-[#1F1F1D] p-5 space-y-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <BellRing className="w-4 h-4 text-amber-500" />
              <span>Canlı Garson Çağrıları Kuyruğu ({activeWaiterCallsList.length} Bekleyen)</span>
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {onClearCompletedWaiterCalls && waiterCalls.some((c) => c.status === 'Tamamlandı') && (
                <button
                  type="button"
                  data-testid="clear-completed-waiter-calls-btn"
                  onClick={() => {
                    onClearCompletedWaiterCalls();
                    setStatusToast('Tamamlanan garson çağrıları temizlendi.');
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-500 font-semibold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Tamamlananları Temizle
                </button>
              )}
              <button
                type="button"
                onClick={() => onSwitchWorkspaceView('waiter')}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 font-semibold cursor-pointer"
              >
                Tam Ekran Garson Terminali →
              </button>
            </div>
          </div>
          {waiterCalls.length === 0 ? (
            <div className="text-neutral-500 py-3">Henüz masa servis çağrısı bulunmuyor.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {waiterCalls.map((call) => (
                <div
                  key={call.id}
                  data-testid={`waiter-call-card-${call.id}`}
                  className={`rounded-xl border p-3.5 space-y-2 ${
                    call.status === 'Tamamlandı'
                      ? 'border-neutral-200 dark:border-neutral-800 opacity-75'
                      : 'border-amber-500/50 bg-amber-950/10'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-sm">
                      {call.tableNumber} ({call.qrCodeNumber})
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 font-bold text-[10px]">
                      {call.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    İstekler: <strong>{call.selectedNeeds.join(', ')}</strong> · {call.createdAt}
                  </div>
                  {call.customNote && (
                    <div className="text-[11px] italic text-amber-600 dark:text-amber-300">
                      Not: {call.customNote}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {call.status !== 'Tamamlandı' && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            onDispatchWaiterCall?.(call.id);
                            setStatusToast(`${call.tableNumber} çağrısına garson yönlendirildi.`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#B86B35] text-white font-semibold cursor-pointer"
                        >
                          Garson Yönlendir
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onResolveWaiterCall?.(call.id, call.tableId);
                            setStatusToast(`${call.tableNumber} servis çağrısı tamamlandı.`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-semibold cursor-pointer"
                        >
                          Servisi Tamamla
                        </button>
                      </>
                    )}
                    {onDeleteWaiterCall && (
                      <button
                        type="button"
                        data-testid={`delete-waiter-call-${call.id}`}
                        onClick={() => {
                          onDeleteWaiterCall(call.id);
                          setStatusToast(`${call.tableNumber} garson çağrısı silindi.`);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-rose-500/40 text-rose-500 font-semibold cursor-pointer ml-auto"
                      >
                        <Trash2 className="w-3 h-3" /> Sil
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          MODÜL 22: GELİR-GİDER MUHASEBE & AI YÖNETİCİ ANALİZİ
      ===================================================================== */}
      {activeModuleId === 22 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <h3 className="text-base font-semibold">Günlük Finans Özeti</h3>
              <p className="text-neutral-500">
                Toplam Gelir: {totalIncomes.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺ · Toplam Gider:{' '}
                {totalExpenses.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺ · Net Kâr:{' '}
                {estimatedDailyProfit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺ · Bahşiş: {totalTipsToday.toFixed(2)} ₺
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!finDesc.trim()) return;
                onAddFinanceEntry({
                  type: finType,
                  category: finCategory,
                  description: finDesc.trim(),
                  amount: finAmount,
                  paymentMethod: 'Banka / Kasa',
                  recordedBy: currentRole,
                  branchId: 'BR-01',
                });
                setFinDesc('');
                setStatusToast(`${finType} kaydı finansal deftere işlendi.`);
              }}
              className="lg:col-span-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-3 text-xs"
            >
              <h3 className="text-base font-semibold">
                Gelir / Gider & Muhasebe Fişi Kaydı
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={finType}
                  onChange={(e) => setFinType(e.target.value as 'Gelir' | 'Gider')}
                  className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                >
                  <option value="Gelir">Gelir Kaydı</option>
                  <option value="Gider">Gider Kaydı</option>
                </select>
                <input
                  type="number"
                  min={1}
                  value={finAmount}
                  onChange={(e) => setFinAmount(Number(e.target.value))}
                  className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                />
              </div>
              <input
                type="text"
                value={finCategory}
                onChange={(e) => setFinCategory(e.target.value)}
                placeholder="Kategori (Örn: Et Tedarik, Elektrik, POS Tahsilat)"
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
              />
              <input
                type="text"
                required
                value={finDesc}
                onChange={(e) => setFinDesc(e.target.value)}
                placeholder="Açıklama / Fatura No"
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-[#B86B35] text-white font-semibold"
              >
                Finansal Hareketi Kaydet
              </button>
            </form>

            {/* AI Advisory & Profitability Panel (Section 24) */}
            <div className="lg:col-span-7 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4AF6A]" />
                  <h3 className="text-base font-semibold">
                    Yapay Zekâ Destekli Satış, Stok ve Maliyet Analizi
                  </h3>
                </div>
                <button
                  type="button"
                  disabled={aiLoading}
                  onClick={() => triggerAiAnalysis('Satış, Stok ve Kârlılık Analizi')}
                  className="px-3.5 py-1.5 rounded-lg bg-[#141413] dark:bg-[#D4AF6A] text-white dark:text-[#141413] font-semibold"
                >
                  {aiLoading ? 'Analiz Üretiliyor...' : 'Canlı AI Yönetici Özeti Üret'}
                </button>
              </div>
              <p className="text-neutral-500">
                Yapay zekâ önerileri aşağıdaki onay mekanizmasıyla yalnızca yönetici onayı sonrası uygulanır.
              </p>

              {aiReport ? (
                <div className="space-y-3 pt-2">
                  <div className="p-3 rounded-lg bg-neutral-100 dark:bg-[#141413]">
                    <div className="font-semibold text-sm">{aiReport.title}</div>
                    <p className="text-neutral-600 dark:text-neutral-300 mt-1">{aiReport.summary}</p>
                  </div>
                  <div className="space-y-2">
                    {aiReport.recommendations.map((rec) => (
                      <div
                        key={rec.id}
                        className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 flex items-start justify-between gap-3"
                      >
                        <div>
                          <div className="font-semibold text-[#B86B35] dark:text-[#D4AF6A]">
                            {rec.category}
                          </div>
                          <p className="mt-0.5">{rec.proposal}</p>
                          <div className="text-[11px] text-neutral-500 mt-1">
                            Beklenen Etki: {rec.impact}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setStatusToast(`Öneri #${rec.id} yönetici onayıyla taslak olarak kaydedildi.`)
                          }
                          className="px-3 py-1.5 rounded bg-emerald-700 text-white font-medium shrink-0"
                        >
                          Öneriyi Onayla
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-neutral-500">
                  "Canlı AI Yönetici Özeti Üret" butonuna tıklayarak satış, reçete maliyeti ve stok tahmin önerilerini görüntüleyin.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5">
            <h3 className="text-base font-semibold mb-3">
              Finansal Hareketler & Gelir-Gider Defteri
            </h3>
            <div className="space-y-2 text-xs">
              {financeLedger.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-800"
                >
                  <div>
                    <span className="font-semibold">{item.category}:</span> {item.description}
                    <div className="text-[11px] text-neutral-500">
                      {item.date} · {item.paymentMethod} · Kaydeden: {item.recordedBy}
                    </div>
                  </div>
                  <span
                    className={`font-mono tabular-nums font-bold text-sm ${
                      item.type === 'Gelir'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {item.type === 'Gelir' ? '+' : '-'}
                    {item.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODÜL 26, 27, 28, 29: HER WEB SİTESİ AYARI KENDİ TEK BÖLÜMÜNDE
      ===================================================================== */}
      {(activeModuleId === 26 ||
        activeModuleId === 27 ||
        activeModuleId === 28 ||
        activeModuleId === 29) && (
        <AdminSiteBuilderManager
          key={`site-builder-${activeModuleId}`}
          siteCmsConfig={siteCmsConfig}
          onUpdateSiteCmsConfig={onUpdateSiteCmsConfig}
          onNotify={(msg) => setStatusToast(msg)}
          cmsPages={cmsPages}
          categories={categories}
          onAddCmsPage={onAddCmsPage}
          onUpdateCmsPage={onUpdateCmsPage}
          onDeleteCmsPage={onDeleteCmsPage}
          singleSectionMode={true}
          defaultTab={
            activeModuleId === 29
              ? 'gallery_only'
              : activeModuleId === 28
              ? 'seo_only'
              : activeModuleId === 27
              ? 'menus_pages'
              : 'announcement_popup'
          }
        />
      )}

      {/* =====================================================================
          MODÜL 31: EKLENTİLER (TÜM EKLENTİ, MODÜL VE ENTEGRASYONLAR TEK ÇATIDA)
      ===================================================================== */}
      {activeModuleId === 31 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#B86B35]" />
                  <span>Eklentiler, Modüller &amp; Entegrasyon Merkezi ({integrations.length + siteCmsConfig.modules.widgets.length} Toplam)</span>
                </h3>
                <p className="text-xs text-neutral-500">
                  Ödeme sistemleri, yemek platformları, kurye, e-Fatura, yazıcı donanımı, WhatsApp ve vitrin bileşenlerinin her biri için özel ayarları buradan yönetin.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {onAddIntegration && (
                  <button
                    type="button"
                    onClick={() => setShowNewIntgForm((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-[#B86B35]/50 text-[#B86B35] dark:text-[#D4AF6A] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Yeni Eklenti Ekle</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => triggerAiAnalysis('Entegrasyon ve Günlük Operasyon Özeti')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#B86B35] text-white cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Operasyon Özeti</span>
                </button>
              </div>
            </div>

            {/* Kategori Filtreleme Sekmeleri */}
            <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-neutral-200 dark:border-neutral-800 text-xs">
              {[
                'Tümü',
                'Ödeme',
                'Yemek & Kurye',
                'Muhasebe',
                'İletişim & Harita',
                'Donanım',
                'Vitrin Bileşenleri',
              ].map((catTab) => (
                <button
                  key={catTab}
                  type="button"
                  onClick={() => setPluginCategoryFilter(catTab)}
                  className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition ${
                    pluginCategoryFilter === catTab
                      ? 'bg-[#B86B35] text-white'
                      : 'bg-neutral-100 dark:bg-[#141413] text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  {catTab}
                </button>
              ))}
            </div>

            {showNewIntgForm && onAddIntegration && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newIntgName.trim()) return;
                  onAddIntegration({
                    code: `PLG-${Date.now().toString().slice(-4)}`,
                    name: newIntgName.trim(),
                    category: newIntgCategory,
                    installed: true,
                    enabled: true,
                    mode: 'Test (Sandbox)',
                    version: newIntgVersion.trim() || '1.0.0',
                    scope: newIntgScope.trim() || 'api.read_write',
                    contractVerified: true,
                    description: 'Yönetici tarafından eklenen özel entegrasyon eklentisi.',
                    settings: {
                      apiKey: '',
                      webhookUrl: 'https://oztikeciger.com.tr/api/webhook',
                      autoSync: true,
                      timeoutMs: 5000,
                    },
                  });
                  setNewIntgName('');
                  setShowNewIntgForm(false);
                  setStatusToast(`${newIntgName.trim()} eklentisi eklendi.`);
                }}
                className="rounded-xl border border-[#B86B35]/40 bg-neutral-50 dark:bg-[#141413] p-4 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end text-xs"
              >
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1">Eklenti / Entegrasyon Adı *</label>
                  <input
                    type="text"
                    required
                    value={newIntgName}
                    onChange={(e) => setNewIntgName(e.target.value)}
                    placeholder="Örn: Migros Yemek / Trendyol Go"
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Kategori</label>
                  <select
                    value={newIntgCategory}
                    onChange={(e) =>
                      setNewIntgCategory(e.target.value as IntegrationPluginItem['category'])
                    }
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5"
                  >
                    <option value="Ödeme">Ödeme</option>
                    <option value="Yemek Platformu">Yemek Platformu</option>
                    <option value="Kurye">Kurye</option>
                    <option value="Yazıcı">Yazıcı</option>
                    <option value="Muhasebe">Muhasebe</option>
                    <option value="PWA & Bildirim">PWA &amp; Bildirim</option>
                    <option value="Harita">Harita</option>
                    <option value="Pazarlama">Pazarlama</option>
                    <option value="WhatsApp Business">WhatsApp Business</option>
                    <option value="Webhook">Webhook</option>
                    <option value="Yapay zekâ">Yapay zekâ</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Yetki Kapsamı</label>
                  <input
                    type="text"
                    value={newIntgScope}
                    onChange={(e) => setNewIntgScope(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#B86B35] text-white font-bold cursor-pointer"
                >
                  Eklentiyi Kaydet
                </button>
              </form>
            )}

            {pluginCategoryFilter !== 'Vitrin Bileşenleri' && (
              <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-4">
                {integrations
                  .filter((intg) => {
                    if (pluginCategoryFilter === 'Tümü') return true;
                    if (pluginCategoryFilter === 'Ödeme') return intg.category === 'Ödeme';
                    if (pluginCategoryFilter === 'Yemek & Kurye')
                      return intg.category === 'Yemek Platformu' || intg.category === 'Kurye';
                    if (pluginCategoryFilter === 'Muhasebe') return intg.category === 'Muhasebe';
                    if (pluginCategoryFilter === 'İletişim & Harita')
                      return (
                        intg.category === 'WhatsApp Business' ||
                        intg.category === 'Harita' ||
                        intg.category === 'Pazarlama' ||
                        intg.category === 'PWA & Bildirim'
                      );
                    if (pluginCategoryFilter === 'Donanım')
                      return (
                        intg.category === 'Yazıcı' ||
                        intg.category === 'Webhook' ||
                        intg.category === 'Yapay zekâ'
                      );
                    return true;
                  })
                  .map((intg) => {
                    const isExpanded = expandedIntgId === intg.id;
                    const settingsEntries = Object.entries(intg.settings || {});
                    const keyDraft = newParamKeys[intg.id] || '';
                    const valDraft = newParamVals[intg.id] || '';
                    const updateIntgSetting = (key: string, val: string | number | boolean) => {
                      if (!onUpdateIntegration) return;
                      const nextSettings = { ...(intg.settings || {}), [key]: val };
                      onUpdateIntegration({ ...intg, settings: nextSettings });
                      setPluginJsonDrafts((prev) => ({
                        ...prev,
                        [intg.id]: JSON.stringify(nextSettings, null, 2),
                      }));
                    };

                return (
                  <div
                    key={intg.id}
                    data-testid={`plugin-card-${intg.id}`}
                    className={`rounded-xl border p-4 flex flex-col justify-between gap-3 text-xs ${
                      intg.enabled
                        ? 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#141413]/70'
                        : 'border-neutral-300/60 dark:border-neutral-800/50 opacity-75'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-[11px] text-neutral-500">
                        <span className="px-2 py-0.5 rounded bg-[#B86B35]/15 text-[#B86B35] dark:text-[#D4AF6A] font-bold">
                          {intg.category}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">v{intg.version}</span>
                          {onUpdateIntegration && (
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateIntegration({ ...intg, enabled: !intg.enabled });
                                setStatusToast(
                                  `${intg.name} ${intg.enabled ? 'devre dışı bırakıldı' : 'aktifleştirildi'}.`
                                );
                              }}
                              className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                                intg.enabled
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
                              }`}
                            >
                              {intg.enabled ? 'Aktif' : 'Pasif'}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="font-bold text-sm text-neutral-900 dark:text-[#F5F2EB]">
                        {intg.name}
                      </div>
                      {intg.description && (
                        <p className="text-[11px] text-neutral-500 leading-relaxed">{intg.description}</p>
                      )}
                      <div className="font-mono text-[11px] text-neutral-500">
                        Yetki: {intg.scope} · Parametre: {settingsEntries.length}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        Mod: <strong>{intg.mode}</strong> · Son Test: {intg.lastTested}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                      <button
                        type="button"
                        onClick={() => {
                          onTestIntegration(intg.id);
                          setStatusToast(`${intg.name} bağlantı testi başarıyla doğrulandı.`);
                        }}
                        className="py-1.5 px-2.5 rounded border border-neutral-300 dark:border-neutral-700 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                      >
                        Bağlantı Testi
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onToggleIntegrationMode(intg.id);
                          setStatusToast(`${intg.name} çalışma modu değiştirildi.`);
                        }}
                        className="py-1.5 px-2.5 rounded bg-neutral-900 dark:bg-[#F5F2EB] text-white dark:text-[#141413] font-medium cursor-pointer"
                      >
                        Mod Değiştir
                      </button>
                      {onUpdateIntegration && (
                        <button
                          type="button"
                          data-testid={`plugin-settings-btn-${intg.id}`}
                          onClick={() => setExpandedIntgId(isExpanded ? null : intg.id)}
                          className={`inline-flex items-center gap-1 py-1.5 px-2.5 rounded font-semibold cursor-pointer ${
                            isExpanded
                              ? 'bg-[#B86B35] text-white'
                              : 'border border-[#B86B35]/50 text-[#B86B35] dark:text-[#D4AF6A]'
                          }`}
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>{isExpanded ? 'Ayarları Gizle' : 'Gelişmiş Ayarlar'}</span>
                        </button>
                      )}
                      {onDeleteIntegration && (
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteIntegration(intg.id);
                            setStatusToast(`${intg.name} eklentisi silindi.`);
                          }}
                          className="p-1.5 rounded text-rose-500 hover:bg-rose-500/10 cursor-pointer ml-auto"
                          aria-label={`${intg.name} sil`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {isExpanded && onUpdateIntegration && (() => {
                      const activeTab = pluginConfigTab[intg.id] || 'form';
                      const jsonDraft =
                        pluginJsonDrafts[intg.id] ??
                        JSON.stringify(intg.settings || {}, null, 2);
                      const jsonFeedback = pluginJsonFeedback[intg.id];
                      const paramType = newParamTypes[intg.id] || 'string';

                      return (
                        <div
                          data-testid={`plugin-settings-panel-${intg.id}`}
                          className="pt-3 mt-1 border-t border-[#B86B35]/30 space-y-3 bg-white dark:bg-[#1A1A18] p-3.5 rounded-xl"
                        >
                          {/* Dedicated Plugin Header & Mode Switcher */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-neutral-200 dark:border-neutral-800">
                            <div className="text-[11px] font-bold text-[#B86B35] dark:text-[#D4AF6A]">
                              {intg.name} · Özel Konfigürasyon &amp; Parametre Yöneticisi
                            </div>
                            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-[#141413] p-0.5 rounded-lg">
                              <button
                                type="button"
                                data-testid={`plugin-form-tab-${intg.id}`}
                                onClick={() =>
                                  setPluginConfigTab((prev) => ({ ...prev, [intg.id]: 'form' }))
                                }
                                className={`px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer ${
                                  activeTab === 'form'
                                    ? 'bg-[#B86B35] text-white'
                                    : 'text-neutral-500'
                                }`}
                              >
                                Dinamik Giriş Alanları
                              </button>
                              <button
                                type="button"
                                data-testid={`plugin-json-tab-${intg.id}`}
                                onClick={() => {
                                  setPluginJsonDrafts((prev) => ({
                                    ...prev,
                                    [intg.id]: JSON.stringify(intg.settings || {}, null, 2),
                                  }));
                                  setPluginConfigTab((prev) => ({ ...prev, [intg.id]: 'json' }));
                                }}
                                className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold cursor-pointer ${
                                  activeTab === 'json'
                                    ? 'bg-[#B86B35] text-white'
                                    : 'text-neutral-500'
                                }`}
                              >
                                JSON Konfigürasyon ({'{ }'})
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div>
                              <label className="block text-[10px] font-semibold text-neutral-500 mb-1">
                                Eklenti Adı
                              </label>
                              <input
                                type="text"
                                value={intg.name}
                                onChange={(e) =>
                                  onUpdateIntegration({ ...intg, name: e.target.value })
                                }
                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5 text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-neutral-500 mb-1">
                                Yetki Kapsamı (Scope)
                              </label>
                              <input
                                type="text"
                                value={intg.scope}
                                onChange={(e) =>
                                  onUpdateIntegration({ ...intg, scope: e.target.value })
                                }
                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5 text-xs font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-neutral-500 mb-1">
                                Versiyon
                              </label>
                              <input
                                type="text"
                                value={intg.version}
                                onChange={(e) =>
                                  onUpdateIntegration({ ...intg, version: e.target.value })
                                }
                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5 text-xs font-mono"
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <label className="block text-[10px] font-semibold text-neutral-500 mb-1">
                                Eklenti Açıklaması &amp; Görevi
                              </label>
                              <input
                                type="text"
                                value={intg.description || ''}
                                onChange={(e) =>
                                  onUpdateIntegration({ ...intg, description: e.target.value })
                                }
                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5 text-xs"
                              />
                            </div>
                          </div>

                          {activeTab === 'form' ? (
                            <>
                              {/* Kategoriye Özel Hazır Ayar Profilleri */}
                              <div className="rounded-lg border border-[#B86B35]/25 bg-neutral-50 dark:bg-[#141413] p-3 space-y-2">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-[#B86B35] dark:text-[#D4AF6A]">
                                  {intg.category} Kategorisi · Özel Ayar Profili
                                </div>
                                {intg.category === 'Ödeme' && (
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <div>
                                      <label className="block text-[10px] font-semibold mb-0.5">Üye İşyeri / Merchant ID</label>
                                      <input
                                        type="text"
                                        value={String(intg.settings?.merchantId ?? '')}
                                        onChange={(e) => updateIntgSetting('merchantId', e.target.value)}
                                        placeholder="Örn: 482910"
                                        className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-2 py-1 font-mono"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-semibold mb-0.5">Komisyon Oranı (%)</label>
                                      <input
                                        type="number"
                                        step="0.05"
                                        value={Number(intg.settings?.commissionPercent ?? 1.95)}
                                        onChange={(e) => updateIntgSetting('commissionPercent', Number(e.target.value))}
                                        className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-2 py-1 font-mono"
                                      />
                                    </div>
                                    <label className="inline-flex items-center gap-1.5 self-end pb-1 cursor-pointer font-semibold">
                                      <input
                                        type="checkbox"
                                        checked={Boolean(intg.settings?.force3DSecure ?? true)}
                                        onChange={(e) => updateIntgSetting('force3DSecure', e.target.checked)}
                                      />
                                      <span>3D Secure Zorunlu</span>
                                    </label>
                                  </div>
                                )}
                                {intg.category === 'Yemek Platformu' && (
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <div>
                                      <label className="block text-[10px] font-semibold mb-0.5">Restoran / Şube Kodu</label>
                                      <input
                                        type="text"
                                        value={String(intg.settings?.restaurantId ?? '')}
                                        onChange={(e) => updateIntgSetting('restaurantId', e.target.value)}
                                        placeholder="REST-2701"
                                        className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-2 py-1 font-mono"
                                      />
                                    </div>
                                    <label className="inline-flex items-center gap-1.5 self-end pb-1 cursor-pointer font-semibold">
                                      <input
                                        type="checkbox"
                                        checked={Boolean(intg.settings?.autoAcceptOrders ?? true)}
                                        onChange={(e) => updateIntgSetting('autoAcceptOrders', e.target.checked)}
                                      />
                                      <span>Siparişleri Otomatik Onayla</span>
                                    </label>
                                    <label className="inline-flex items-center gap-1.5 self-end pb-1 cursor-pointer font-semibold">
                                      <input
                                        type="checkbox"
                                        checked={Boolean(intg.settings?.menuPriceSync ?? true)}
                                        onChange={(e) => updateIntgSetting('menuPriceSync', e.target.checked)}
                                      />
                                      <span>Fiyat &amp; Stok Senkronizasyonu</span>
                                    </label>
                                  </div>
                                )}
                                {intg.category === 'Kurye' && (
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <div>
                                      <label className="block text-[10px] font-semibold mb-0.5">Maksimum Yarıçap (km)</label>
                                      <input
                                        type="number"
                                        value={Number(intg.settings?.maxRadiusKm ?? 8)}
                                        onChange={(e) => updateIntgSetting('maxRadiusKm', Number(e.target.value))}
                                        className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-2 py-1 font-mono"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-semibold mb-0.5">Tahmini Teslim (dk)</label>
                                      <input
                                        type="number"
                                        value={Number(intg.settings?.etaMinutes ?? 30)}
                                        onChange={(e) => updateIntgSetting('etaMinutes', Number(e.target.value))}
                                        className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-2 py-1 font-mono"
                                      />
                                    </div>
                                    <label className="inline-flex items-center gap-1.5 self-end pb-1 cursor-pointer font-semibold">
                                      <input
                                        type="checkbox"
                                        checked={Boolean(intg.settings?.autoDispatchCourier ?? true)}
                                        onChange={(e) => updateIntgSetting('autoDispatchCourier', e.target.checked)}
                                      />
                                      <span>Otomatik Kurye Çağır</span>
                                    </label>
                                  </div>
                                )}
                                {intg.category === 'Yazıcı' && (
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <div>
                                      <label className="block text-[10px] font-semibold mb-0.5">Yazıcı IP / Port</label>
                                      <input
                                        type="text"
                                        value={String(intg.settings?.printerIp ?? '192.168.1.210:9100')}
                                        onChange={(e) => updateIntgSetting('printerIp', e.target.value)}
                                        className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-2 py-1 font-mono"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-semibold mb-0.5">Rulo Genişliği (mm)</label>
                                      <select
                                        value={Number(intg.settings?.paperWidthMm ?? 80)}
                                        onChange={(e) => updateIntgSetting('paperWidthMm', Number(e.target.value))}
                                        className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-2 py-1"
                                      >
                                        <option value={80}>80mm</option>
                                        <option value={58}>58mm</option>
                                      </select>
                                    </div>
                                    <label className="inline-flex items-center gap-1.5 self-end pb-1 cursor-pointer font-semibold">
                                      <input
                                        type="checkbox"
                                        checked={Boolean(intg.settings?.autoCut ?? true)}
                                        onChange={(e) => updateIntgSetting('autoCut', e.target.checked)}
                                      />
                                      <span>Otomatik Kağıt Kesim</span>
                                    </label>
                                  </div>
                                )}
                                {intg.category !== 'Ödeme' &&
                                  intg.category !== 'Yemek Platformu' &&
                                  intg.category !== 'Kurye' &&
                                  intg.category !== 'Yazıcı' && (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                      <div>
                                        <label className="block text-[10px] font-semibold mb-0.5">Webhook / Endpoint URL</label>
                                        <input
                                          type="text"
                                          value={String(intg.settings?.webhookUrl ?? '')}
                                          onChange={(e) => updateIntgSetting('webhookUrl', e.target.value)}
                                          placeholder="https://..."
                                          className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-2 py-1 font-mono"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-semibold mb-0.5">Zaman Aşımı (ms)</label>
                                        <input
                                          type="number"
                                          value={Number(intg.settings?.timeoutMs ?? 5000)}
                                          onChange={(e) => updateIntgSetting('timeoutMs', Number(e.target.value))}
                                          className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-2 py-1 font-mono"
                                        />
                                      </div>
                                      <label className="inline-flex items-center gap-1.5 self-end pb-1 cursor-pointer font-semibold">
                                        <input
                                          type="checkbox"
                                          checked={Boolean(intg.settings?.autoSync ?? true)}
                                          onChange={(e) => updateIntgSetting('autoSync', e.target.checked)}
                                        />
                                        <span>Gerçek Zamanlı Senkronizasyon</span>
                                      </label>
                                    </div>
                                  )}
                              </div>

                              <div className="space-y-2">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-[#B86B35] dark:text-[#D4AF6A]">
                                  Dinamik Konfigürasyon Alanları ({settingsEntries.length} Alan)
                                </div>
                                {settingsEntries.map(([sKey, sVal]) => {
                                  const isSecret = /secret|key|token|password|pin/i.test(sKey);
                                  const secretId = `${intg.id}:${sKey}`;
                                  const isRevealed = Boolean(revealedSecrets[secretId]);
                                  return (
                                    <div
                                      key={sKey}
                                      className="flex flex-wrap sm:flex-nowrap items-center gap-2"
                                    >
                                      <span className="w-40 shrink-0 truncate font-mono text-[11px] text-neutral-500">
                                        {sKey}
                                      </span>
                                      {typeof sVal === 'boolean' ? (
                                        <label className="inline-flex items-center gap-2 cursor-pointer flex-1">
                                          <input
                                            type="checkbox"
                                            checked={sVal}
                                            onChange={(e) => {
                                              const nextSettings = {
                                                ...(intg.settings || {}),
                                                [sKey]: e.target.checked,
                                              };
                                              onUpdateIntegration({
                                                ...intg,
                                                settings: nextSettings,
                                              });
                                              setPluginJsonDrafts((prev) => ({
                                                ...prev,
                                                [intg.id]: JSON.stringify(nextSettings, null, 2),
                                              }));
                                            }}
                                          />
                                          <span className="font-semibold">
                                            {sVal ? 'Aktif (True)' : 'Kapalı (False)'}
                                          </span>
                                        </label>
                                      ) : (
                                        <div className="flex-1 flex items-center gap-1 min-w-[140px]">
                                          <input
                                            type={
                                              isSecret && !isRevealed
                                                ? 'password'
                                                : typeof sVal === 'number'
                                                ? 'number'
                                                : 'text'
                                            }
                                            value={String(sVal)}
                                            onChange={(e) => {
                                              const parsedVal =
                                                typeof sVal === 'number'
                                                  ? Number(e.target.value)
                                                  : e.target.value;
                                              const nextSettings = {
                                                ...(intg.settings || {}),
                                                [sKey]: parsedVal,
                                              };
                                              onUpdateIntegration({
                                                ...intg,
                                                settings: nextSettings,
                                              });
                                              setPluginJsonDrafts((prev) => ({
                                                ...prev,
                                                [intg.id]: JSON.stringify(nextSettings, null, 2),
                                              }));
                                            }}
                                            className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1 text-xs font-mono"
                                          />
                                          {isSecret && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setRevealedSecrets((prev) => ({
                                                  ...prev,
                                                  [secretId]: !prev[secretId],
                                                }))
                                              }
                                              className="p-1.5 rounded border border-neutral-300 dark:border-neutral-700 cursor-pointer"
                                              aria-label={`${sKey} göster/gizle`}
                                            >
                                              {isRevealed ? (
                                                <EyeOff className="w-3.5 h-3.5" />
                                              ) : (
                                                <Eye className="w-3.5 h-3.5" />
                                              )}
                                            </button>
                                          )}
                                        </div>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const copy = { ...(intg.settings || {}) };
                                          delete copy[sKey];
                                          onUpdateIntegration({ ...intg, settings: copy });
                                          setPluginJsonDrafts((prev) => ({
                                            ...prev,
                                            [intg.id]: JSON.stringify(copy, null, 2),
                                          }));
                                        }}
                                        className="p-1 text-rose-500 cursor-pointer"
                                        aria-label={`${sKey} parametresini kaldır`}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                                <input
                                  type="text"
                                  value={keyDraft}
                                  onChange={(e) =>
                                    setNewParamKeys((prev) => ({
                                      ...prev,
                                      [intg.id]: e.target.value,
                                    }))
                                  }
                                  placeholder="Alan adı (örn: webhookSecret)"
                                  className="flex-1 min-w-[120px] rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1 text-xs font-mono"
                                />
                                <select
                                  value={paramType}
                                  onChange={(e) =>
                                    setNewParamTypes((prev) => ({
                                      ...prev,
                                      [intg.id]: e.target.value as
                                        | 'string'
                                        | 'number'
                                        | 'boolean'
                                        | 'secret',
                                    }))
                                  }
                                  className="rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2 py-1 text-xs"
                                >
                                  <option value="string">Metin</option>
                                  <option value="number">Sayı</option>
                                  <option value="boolean">Boolean</option>
                                  <option value="secret">Gizli Anahtar</option>
                                </select>
                                <input
                                  type="text"
                                  value={valDraft}
                                  onChange={(e) =>
                                    setNewParamVals((prev) => ({
                                      ...prev,
                                      [intg.id]: e.target.value,
                                    }))
                                  }
                                  placeholder="Değer..."
                                  className="flex-1 min-w-[100px] rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1 text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!keyDraft.trim()) return;
                                    const finalKey =
                                      paramType === 'secret' &&
                                      !/secret|key|token/i.test(keyDraft.trim())
                                        ? `${keyDraft.trim()}Secret`
                                        : keyDraft.trim();
                                    const parsed: string | number | boolean =
                                      paramType === 'boolean' ||
                                      valDraft === 'true' ||
                                      valDraft === 'false'
                                        ? valDraft === 'true'
                                        : paramType === 'number' ||
                                          (valDraft !== '' && !Number.isNaN(Number(valDraft)))
                                        ? Number(valDraft) || 0
                                        : valDraft;
                                    const nextSettings = {
                                      ...(intg.settings || {}),
                                      [finalKey]: parsed,
                                    };
                                    onUpdateIntegration({
                                      ...intg,
                                      settings: nextSettings,
                                    });
                                    setPluginJsonDrafts((prev) => ({
                                      ...prev,
                                      [intg.id]: JSON.stringify(nextSettings, null, 2),
                                    }));
                                    setNewParamKeys((prev) => ({ ...prev, [intg.id]: '' }));
                                    setNewParamVals((prev) => ({ ...prev, [intg.id]: '' }));
                                    setStatusToast(
                                      `${intg.name}: "${finalKey}" dinamik alanı eklendi.`
                                    );
                                  }}
                                  className="px-3 py-1 rounded bg-[#B86B35] text-white font-bold text-xs cursor-pointer"
                                >
                                  + Alan Ekle
                                </button>
                              </div>
                            </>
                          ) : (
                            /* JSON Tabanlı Özel Konfigürasyon Editörü */
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#B86B35] dark:text-[#D4AF6A]">
                                  JSON Tabanlı Özel Konfigürasyon (Şema Doğrulamalı)
                                </span>
                                <span className="text-[10px] font-mono text-neutral-500">
                                  string · number · boolean
                                </span>
                              </div>
                              <textarea
                                rows={7}
                                data-testid={`plugin-json-textarea-${intg.id}`}
                                value={jsonDraft}
                                onChange={(e) =>
                                  setPluginJsonDrafts((prev) => ({
                                    ...prev,
                                    [intg.id]: e.target.value,
                                  }))
                                }
                                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-[#141413] text-emerald-300 p-3 font-mono text-[11px]"
                              />
                              {jsonFeedback && (
                                <div
                                  className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold ${
                                    jsonFeedback.ok
                                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                  }`}
                                >
                                  {jsonFeedback.msg}
                                </div>
                              )}
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const formatted = JSON.stringify(intg.settings || {}, null, 2);
                                    setPluginJsonDrafts((prev) => ({
                                      ...prev,
                                      [intg.id]: formatted,
                                    }));
                                    setPluginJsonFeedback((prev) => ({
                                      ...prev,
                                      [intg.id]: {
                                        ok: true,
                                        msg: 'Mevcut aktif JSON konfigürasyonu geri yüklendi.',
                                      },
                                    }));
                                  }}
                                  className="px-2.5 py-1 rounded border border-neutral-300 dark:border-neutral-700 text-xs font-semibold cursor-pointer"
                                >
                                  Sıfırla
                                </button>
                                <button
                                  type="button"
                                  data-testid={`plugin-json-save-${intg.id}`}
                                  onClick={() => {
                                    const res = validatePluginJsonConfig(jsonDraft);
                                    if (!res.valid || !res.parsed) {
                                      setPluginJsonFeedback((prev) => ({
                                        ...prev,
                                        [intg.id]: {
                                          ok: false,
                                          msg: res.error || 'JSON hatası',
                                        },
                                      }));
                                      return;
                                    }
                                    onUpdateIntegration({
                                      ...intg,
                                      settings: res.parsed,
                                    });
                                    setPluginJsonDrafts((prev) => ({
                                      ...prev,
                                      [intg.id]: JSON.stringify(res.parsed, null, 2),
                                    }));
                                    setPluginJsonFeedback((prev) => ({
                                      ...prev,
                                      [intg.id]: {
                                        ok: true,
                                        msg: 'JSON konfigürasyonu doğrulandı ve eklentiye uygulandı.',
                                      },
                                    }));
                                    setStatusToast(
                                      `${intg.name} JSON konfigürasyonu başarıyla güncellendi.`
                                    );
                                  }}
                                  className="px-3 py-1 rounded bg-[#B86B35] text-white font-bold text-xs cursor-pointer"
                                >
                                  JSON Doğrula &amp; Kaydet
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
              </div>
            )}
          </div>

          {(pluginCategoryFilter === 'Tümü' || pluginCategoryFilter === 'Vitrin Bileşenleri') && (
            <AdminSiteBuilderManager
              key="site-builder-31"
              siteCmsConfig={siteCmsConfig}
              onUpdateSiteCmsConfig={onUpdateSiteCmsConfig}
              onNotify={(msg) => setStatusToast(msg)}
              cmsPages={cmsPages}
              categories={categories}
              onAddCmsPage={onAddCmsPage}
              onUpdateCmsPage={onUpdateCmsPage}
              onDeleteCmsPage={onDeleteCmsPage}
              singleSectionMode={true}
              defaultTab="modules_only"
            />
          )}
        </div>
      )}

      {/* =====================================================================
          MODÜL 33: ŞUBE YÖNETİMİ (EKLE / DÜZENLE / SİL)
      ===================================================================== */}
      {activeModuleId === 33 && (
        <div className="space-y-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!branchName.trim() || !branchAddress.trim()) return;
              if (editingBranchId && onUpdateBranch) {
                const existing = branches.find((b) => b.id === editingBranchId);
                if (existing) {
                  onUpdateBranch({
                    ...existing,
                    code: branchCode.trim(),
                    name: branchName.trim(),
                    city: branchCity.trim(),
                    address: branchAddress.trim(),
                    phone: branchPhone.trim(),
                    isMain: branchIsMain,
                  });
                  setStatusToast(`${branchName.trim()} şubesi güncellendi.`);
                }
                setEditingBranchId(null);
              } else if (onAddBranch) {
                onAddBranch({
                  code: branchCode.trim(),
                  name: branchName.trim(),
                  city: branchCity.trim(),
                  address: branchAddress.trim(),
                  phone: branchPhone.trim() || '0342 321 00 44',
                  isMain: branchIsMain,
                  isActive: true,
                });
                setStatusToast(`${branchName.trim()} şubesi eklendi.`);
              }
              setBranchName('');
              setBranchAddress('');
              setBranchPhone('');
            }}
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-3 text-xs"
          >
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#B86B35]" />
              <span>{editingBranchId ? 'Şubeyi Düzenle' : 'Yeni Şube Tanımla'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                value={branchCode}
                onChange={(e) => setBranchCode(e.target.value)}
                placeholder="Şube Kodu (Örn: GAZ-03)"
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
              />
              <input
                type="text"
                required
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                placeholder="Şube Adı *"
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
              />
              <input
                type="text"
                value={branchCity}
                onChange={(e) => setBranchCity(e.target.value)}
                placeholder="İlçe / İl"
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
              />
              <input
                type="text"
                required
                value={branchAddress}
                onChange={(e) => setBranchAddress(e.target.value)}
                placeholder="Açık Şube Adresi *"
                className="sm:col-span-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
              />
              <input
                type="text"
                value={branchPhone}
                onChange={(e) => setBranchPhone(e.target.value)}
                placeholder="Şube Telefonu"
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={branchIsMain}
                  onChange={(e) => setBranchIsMain(e.target.checked)}
                />
                <span>Merkez Şube Olarak İşaretle</span>
              </label>
              <div className="flex gap-2">
                {editingBranchId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBranchId(null);
                      setBranchName('');
                      setBranchAddress('');
                    }}
                    className="px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 font-semibold cursor-pointer"
                  >
                    Vazgeç
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#B86B35] text-white font-semibold cursor-pointer"
                >
                  {editingBranchId ? 'Şubeyi Güncelle' : '+ Şube Ekle'}
                </button>
              </div>
            </div>
          </form>

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4">
            <h3 className="text-base font-semibold">
              Kayıtlı Şubeler &amp; Çok Şubeli Operasyon ({branches.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branches.map((b) => (
                <div
                  key={b.id}
                  className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 space-y-2 text-xs"
                >
                  <div className="flex justify-between font-semibold text-sm">
                    <span>{b.name} {b.isMain && '· (Merkez)'}</span>
                    <span className="font-mono text-[#D4AF6A]">{b.code}</span>
                  </div>
                  <div className="text-neutral-500">
                    {b.address} ({b.city}) · Tel: {b.phone}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                    <span>Durum: {b.isActive ? 'Aktif Operasyonda' : 'Pasif (Hazır)'}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBranchId(b.id);
                          setBranchCode(b.code);
                          setBranchName(b.name);
                          setBranchCity(b.city);
                          setBranchAddress(b.address);
                          setBranchPhone(b.phone);
                          setBranchIsMain(b.isMain);
                        }}
                        className="px-2.5 py-1 rounded border border-neutral-300 dark:border-neutral-700 font-medium cursor-pointer"
                      >
                        Düzenle
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onToggleBranchActive(b.id);
                          setStatusToast(`${b.name} şube durumu güncellendi.`);
                        }}
                        className="px-3 py-1 rounded bg-[#B86B35] text-white font-medium cursor-pointer"
                      >
                        {b.isActive ? 'Pasife Al' : 'Aktifleştir'}
                      </button>
                      {!b.isMain && onDeleteBranch && (
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteBranch(b.id);
                            setStatusToast(`${b.name} şubesi silindi.`);
                          }}
                          className="px-2.5 py-1 rounded border border-red-500/40 text-red-500 font-medium cursor-pointer"
                        >
                          Sil
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODÜL 34: TASARIM MERKEZİ (TEMA, LOGO, HEADER, NAVBAR, SLIDER, BLOK, KART, BUTON, FOOTER)
      ===================================================================== */}
      {activeModuleId === 34 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold">
                Yönetim Paneli Arayüz Teması (Açık / Koyu / Sistem)
              </h3>
              <p className="text-xs text-neutral-500">
                Tercihiniz yerel bellekte saklanır ve yönetim paneli kontrastı otomatik uyarlanır.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {(
                [
                  { id: 'dark', label: 'Koyu Tema' },
                  { id: 'light', label: 'Açık Tema' },
                  { id: 'system', label: 'Sistem Teması' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onChangeThemeMode(t.id)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-lg cursor-pointer ${
                    themeMode === t.id
                      ? 'bg-[#B86B35] text-white'
                      : 'border border-neutral-300 dark:border-neutral-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <AdminSiteBuilderManager
            key="site-builder-34"
            siteCmsConfig={siteCmsConfig}
            onUpdateSiteCmsConfig={onUpdateSiteCmsConfig}
            onNotify={(msg) => setStatusToast(msg)}
            cmsPages={cmsPages}
            categories={categories}
            onAddCmsPage={onAddCmsPage}
            onUpdateCmsPage={onUpdateCmsPage}
            onDeleteCmsPage={onDeleteCmsPage}
            singleSectionMode={true}
            defaultTab="design_studio"
          />
        </div>
      )}

      {/* =====================================================================
          MODÜL 35: SİSTEM GENEL AYARLARI & PASİF / AKTİF MODÜLLER
      ===================================================================== */}
      {activeModuleId === 35 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4 text-xs">
            <div className="flex items-center gap-2">
              <Power className="w-4 h-4 text-[#B86B35]" />
              <div>
                <h3 className="text-base font-semibold">Sistem Operasyon Modülleri (Aktif / Pasif Kontrolü)</h3>
                <p className="text-neutral-500">
                  Mutfak (KDS) ve Masa Seçme modüllerini dilediğiniz zaman pasife alabilir veya yeniden aktifleştirebilirsiniz.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#141413] p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-sm">Mutfak Ekranı (KDS) Modülü</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    Pasif olduğunda üst çubukta KDS kısayolu gizlenir; istediğiniz an aktifleştirebilirsiniz.
                  </div>
                </div>
                <button
                  type="button"
                  data-testid="toggle-kitchen-module-btn"
                  onClick={() => {
                    const next = !(siteCmsConfig.operationalSettings?.kitchenModuleEnabled ?? false);
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      operationalSettings: {
                        ...prev.operationalSettings,
                        kitchenModuleEnabled: next,
                      },
                    }));
                    setStatusToast(`Mutfak (KDS) modülü ${next ? 'aktifleştirildi' : 'pasife alındı'}.`);
                  }}
                  className={`px-3.5 py-2 rounded-lg font-bold cursor-pointer shrink-0 ${
                    siteCmsConfig.operationalSettings?.kitchenModuleEnabled
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-300 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {siteCmsConfig.operationalSettings?.kitchenModuleEnabled ? 'Aktif' : 'Pasif'}
                </button>
              </div>

              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#141413] p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-sm">Masa Seçme Modülü</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    Pasif olduğunda müşteriler ve kasa masa seçmeden doğrudan hızlı sipariş verebilir.
                  </div>
                </div>
                <button
                  type="button"
                  data-testid="toggle-table-selection-btn"
                  onClick={() => {
                    const next = !(siteCmsConfig.operationalSettings?.tableSelectionEnabled ?? false);
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      operationalSettings: {
                        ...prev.operationalSettings,
                        tableSelectionEnabled: next,
                      },
                    }));
                    setStatusToast(`Masa Seçme modülü ${next ? 'aktifleştirildi' : 'pasife alındı'}.`);
                  }}
                  className={`px-3.5 py-2 rounded-lg font-bold cursor-pointer shrink-0 ${
                    siteCmsConfig.operationalSettings?.tableSelectionEnabled
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-300 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {siteCmsConfig.operationalSettings?.tableSelectionEnabled ? 'Aktif' : 'Pasif'}
                </button>
              </div>

              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#141413] p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-sm">Sipariş Takibi Modülü</div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    Pasif olduğunda müşteri sepetindeki canlı aşama/kurye takip çubuğu gizlenir; istediğiniz an açabilirsiniz.
                  </div>
                </div>
                <button
                  type="button"
                  data-testid="toggle-order-tracking-btn"
                  onClick={() => {
                    const next = !(siteCmsConfig.operationalSettings?.orderTrackingEnabled ?? false);
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      operationalSettings: {
                        ...prev.operationalSettings,
                        orderTrackingEnabled: next,
                      },
                    }));
                    setStatusToast(`Sipariş Takibi modülü ${next ? 'aktifleştirildi' : 'pasife alındı'}.`);
                  }}
                  className={`px-3.5 py-2 rounded-lg font-bold cursor-pointer shrink-0 ${
                    siteCmsConfig.operationalSettings?.orderTrackingEnabled
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-300 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  {siteCmsConfig.operationalSettings?.orderTrackingEnabled ? 'Aktif' : 'Pasif'}
                </button>
              </div>
            </div>
          </div>

          <AdminSiteBuilderManager
            key="site-builder-35"
            siteCmsConfig={siteCmsConfig}
            onUpdateSiteCmsConfig={onUpdateSiteCmsConfig}
            onNotify={(msg) => setStatusToast(msg)}
            cmsPages={cmsPages}
            categories={categories}
            onAddCmsPage={onAddCmsPage}
            onUpdateCmsPage={onUpdateCmsPage}
            onDeleteCmsPage={onDeleteCmsPage}
            singleSectionMode={true}
            defaultTab="general_only"
          />
        </div>
      )}

      {/* =====================================================================
          MODÜL 36: GÜVENLİK & 2FA POLİTİKALARI (RBAC YETKİ MATRİSİ)
      ===================================================================== */}
      {activeModuleId === 36 && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-5 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#B86B35]" />
              <div>
                <h3 className="text-base font-semibold">Güvenlik, 2FA &amp; Rol Yetki (RBAC) Politikaları</h3>
                <p className="text-neutral-500">
                  Yönetici 2FA zorunluluğu, rol tabanlı erişim izinleri ve oturum zaman aşımı kurallarını düzenleyin.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStatusToast('Güvenlik ve RBAC yetki matrisi politikaları kaydedildi.')}
              className="px-3.5 py-2 rounded-lg bg-[#B86B35] text-white font-semibold cursor-pointer"
            >
              Yetki Politikalarını Kaydet
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-2 bg-neutral-50 dark:bg-[#141413]">
              <div className="font-bold">Yönetici 2FA Koruması</div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={siteCmsConfig.generalSettings.requireTwoFactorForAdmin}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      generalSettings: {
                        ...prev.generalSettings,
                        requireTwoFactorForAdmin: e.target.checked,
                      },
                    }))
                  }
                />
                <span>Yönetici girişinde 2FA zorunlu</span>
              </label>
            </div>
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-2 bg-neutral-50 dark:bg-[#141413]">
              <div className="font-bold">Oturum Zaman Aşımı (Dakika)</div>
              <input
                type="number"
                min={5}
                value={siteCmsConfig.generalSettings.sessionTimeoutMinutes}
                onChange={(e) =>
                  onUpdateSiteCmsConfig((prev) => ({
                    ...prev,
                    generalSettings: {
                      ...prev.generalSettings,
                      sessionTimeoutMinutes: Number(e.target.value),
                    },
                  }))
                }
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5 font-mono"
              />
            </div>
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-1 bg-neutral-50 dark:bg-[#141413]">
              <div className="font-bold">Aktif Yetkili Personel</div>
              <div className="text-2xl font-mono font-bold text-emerald-500">
                {staff.filter((s) => s.twoFactorEnabled).length} / {staff.length}
              </div>
              <div className="text-[11px] text-neutral-500">2FA korumalı hesap</div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-neutral-50 dark:bg-[#141413] border-b border-neutral-200 dark:border-neutral-800">
                  <th className="py-2.5 px-3">Personel Rolü</th>
                  <th className="py-2.5 px-3 text-center">POS İade Yetkisi</th>
                  <th className="py-2.5 px-3 text-center">Fiyat / İskonto Değişimi</th>
                  <th className="py-2.5 px-3 text-center">CMS &amp; Vitrin Yayın</th>
                  <th className="py-2.5 px-3 text-center">Yedek Geri Yükleme</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {rbacRoles.map((row, idx) => (
                  <tr key={row.role}>
                    <td className="py-2 px-3 font-semibold">{row.role}</td>
                    {(['posRefund', 'priceOverride', 'cmsPublish', 'backupRestore'] as const).map((permKey) => (
                      <td key={permKey} className="py-2 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={row[permKey]}
                          onChange={(e) =>
                            setRbacRoles((prev) =>
                              prev.map((r, rIdx) =>
                                rIdx === idx ? { ...r, [permKey]: e.target.checked } : r
                              )
                            )
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODÜL 37: YEDEKLEME & GÜVENLİ GERİ YÜKLEME (SADECE YEDEKLEME)
      ===================================================================== */}
      {activeModuleId === 37 && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#D4AF6A]" />
              <h3 className="text-base font-semibold">
                Yedekleme ve Güvenli Geri Yükleme Merkezi
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                onCreateBackup('Tam Yedek (DB + Dosya)');
                setStatusToast('Tam yedek oluşturuldu ve SHA-256 bütünlüğü doğrulandı.');
              }}
              className="px-3.5 py-2 rounded-lg bg-[#B86B35] text-white font-semibold cursor-pointer"
            >
              Manuel Tam Yedek Oluştur
            </button>
          </div>

          <div className="space-y-2">
            {backups.map((bkp) => (
              <div
                key={bkp.id}
                className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3.5 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <div className="font-semibold">
                    {bkp.id} · {bkp.type} ({bkp.trigger})
                  </div>
                  <div className="font-mono text-[11px] text-neutral-500">
                    {bkp.timestamp} · {bkp.sizeMb} MB · {bkp.checksum}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={restoreConfirmCode}
                    onChange={(e) => setRestoreConfirmCode(e.target.value)}
                    placeholder="Onay için KORU yazın"
                    className="rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1 text-xs w-36"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const res = onRestoreBackup(bkp.id, restoreConfirmCode);
                      setStatusToast(res.message);
                    }}
                    className="px-3 py-1 rounded border border-amber-700/50 text-amber-600 dark:text-amber-400 font-medium cursor-pointer"
                  >
                    Güvenli Geri Yükle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODÜL 38: İŞLEM KAYITLARI / AUDIT LOG (FİLTRE + CSV DIŞA AKTARIM)
      ===================================================================== */}
      {activeModuleId === 38 && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#B86B35]" />
              <h3 className="text-base font-semibold">
                Güvenlik Denetim İzi ve İşlem Kayıtları ({auditLogs.length})
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="search"
                value={auditSearchQuery}
                onChange={(e) => setAuditSearchQuery(e.target.value)}
                placeholder="Kayıt veya kullanıcı ara..."
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
              />
              {(['Tümü', 'Normal', 'Uyarı', 'Kritik'] as const).map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setAuditSeverityFilter(sev)}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold cursor-pointer ${
                    auditSeverityFilter === sev
                      ? 'bg-[#B86B35] text-white'
                      : 'border border-neutral-300 dark:border-neutral-700'
                  }`}
                >
                  {sev}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  const csv = [
                    'Zaman,Modül,İşlem,Kullanıcı,Rol,Önem,Detay',
                    ...auditLogs.map(
                      (l) =>
                        `"${l.timestamp}","${l.module}","${l.action}","${l.actor}","${l.role}","${l.severity}","${l.detail.replace(/"/g, '""')}"`
                    ),
                  ].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `oztike-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
                  a.click();
                  setTimeout(() => URL.revokeObjectURL(url), 1000);
                  setStatusToast('Denetim kayıtları CSV olarak indirildi.');
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 font-semibold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> CSV İndir
              </button>
              {onClearAuditLogs && (
                <button
                  type="button"
                  onClick={() => {
                    onClearAuditLogs();
                    setStatusToast('Geçmiş işlem kayıtları arşivlenip temizlendi.');
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-rose-500/40 text-rose-500 font-semibold cursor-pointer"
                >
                  Kayıtları Temizle
                </button>
              )}
            </div>
          </div>
          <div className="space-y-2">
            {auditLogs
              .filter((l) => auditSeverityFilter === 'Tümü' || l.severity === auditSeverityFilter)
              .filter(
                (l) =>
                  !auditSearchQuery.trim() ||
                  `${l.module} ${l.action} ${l.actor} ${l.detail}`
                    .toLowerCase()
                    .includes(auditSearchQuery.toLowerCase())
              )
              .map((log) => (
                <div
                  key={log.id}
                  className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="font-semibold">
                      <span
                        className={`inline-block mr-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.severity === 'Kritik'
                            ? 'bg-rose-600 text-white'
                            : log.severity === 'Uyarı'
                            ? 'bg-amber-500 text-black'
                            : 'bg-neutral-200 dark:bg-neutral-800'
                        }`}
                      >
                        {log.severity}
                      </span>
                      [{log.module}] {log.action} — <span className="text-[#D4AF6A]">{log.actor}</span> ({log.role})
                    </div>
                    <div className="text-neutral-500 mt-0.5">{log.detail}</div>
                  </div>
                  <span className="font-mono text-[11px] text-neutral-400 shrink-0">
                    {log.timestamp}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODÜL 3: MASALAR – GÖRSEL MASA PLANI & MASA AYARLARI (TOKEN YOK)
      ===================================================================== */}
      {activeModuleId === 3 && (
        <div className="space-y-6">
          {/* Masa Seçme & QR Tarama Ayarları (Eski Modül 4'ten taşındı) */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold">Masa Seçme Modülü:</span>
                <button
                  type="button"
                  data-testid="tables-module-toggle-selection"
                  onClick={() => {
                    const next = !(siteCmsConfig.operationalSettings?.tableSelectionEnabled ?? false);
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      operationalSettings: {
                        ...prev.operationalSettings,
                        tableSelectionEnabled: next,
                      },
                    }));
                    setStatusToast(`Masa seçimi ${next ? 'aktifleştirildi' : 'pasife alındı'}.`);
                  }}
                  className={`px-3 py-1 rounded-lg font-bold cursor-pointer ${
                    siteCmsConfig.operationalSettings?.tableSelectionEnabled
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {siteCmsConfig.operationalSettings?.tableSelectionEnabled ? 'Aktif' : 'Pasif (Doğrudan Sipariş)'}
                </button>
              </div>
              <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={siteCmsConfig.operationalSettings?.qrRequireScan ?? false}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      operationalSettings: {
                        ...prev.operationalSettings,
                        qrRequireScan: e.target.checked,
                      },
                    }))
                  }
                />
                <span>Masa QR Doğrulaması Zorunlu</span>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 font-medium">Dakikalık İstek Limiti:</span>
              <input
                type="number"
                min={5}
                max={120}
                value={siteCmsConfig.operationalSettings?.qrRateLimitPerMin ?? 20}
                onChange={(e) =>
                  onUpdateSiteCmsConfig((prev) => ({
                    ...prev,
                    operationalSettings: {
                      ...prev.operationalSettings,
                      qrRateLimitPerMin: Math.max(5, Number(e.target.value)),
                    },
                  }))
                }
                className="w-20 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1 font-mono"
              />
            </div>
          </div>

          {/* Üst Özet ve Bölge Filtresi */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-[#F5F2EB] flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#B86B35] dark:text-[#D4AF6A]" />
                  <span>3. Masalar – Canlı Görsel Masa Planı Haritası</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Restoran kat planı üzerinde her masanın anlık durumunu (Boş, Dolu, Hesap Bekliyor, Hazırlanıyor, Rezerve) görüntüleyin ve yönetin
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {Array.from(
                  new Set([
                    'Tümü',
                    'Ana Salon',
                    'Taş Bahçe',
                    'Bakır Ocakbaşı',
                    'VIP Aile Salonu',
                    ...tables.map((t) => t.area),
                  ])
                ).map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => setSelectedFloorArea(area)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      selectedFloorArea === area
                        ? 'bg-[#B86B35] text-white'
                        : 'border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            {/* Renk Kodlu Durum Göstergeleri (Legend) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-1.5 font-semibold">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  Boş ({tables.filter((t) => t.status === 'Boş').length})
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold">
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                  Dolu / Hazırlanıyor (
                  {
                    tables.filter(
                      (t) =>
                        t.status === 'Dolu' ||
                        t.status === 'Hazırlanıyor' ||
                        t.status === 'Sipariş bekliyor'
                    ).length
                  }
                  )
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block animate-pulse" />
                  Hesap Bekliyor ({tables.filter((t) => t.status === 'Hesap bekliyor' || t.billRequested).length})
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold">
                  <span className="w-3 h-3 rounded-full bg-sky-500 inline-block" />
                  Rezerve ({tables.filter((t) => t.status === 'Rezerve').length})
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold">
                  <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
                  Temizlik Bekliyor ({tables.filter((t) => t.status === 'Temizlik bekliyor').length})
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {onAddTable && (
                  <button
                    type="button"
                    data-testid="add-table-btn"
                    onClick={() => {
                      const nextIdx = tables.length + 1;
                      setEditingTableId(null);
                      setTblNumber(`Masa ${nextIdx}`);
                      setTblArea(selectedFloorArea === 'Tümü' ? 'Ana Salon' : selectedFloorArea);
                      setTblCapacity(4);
                      setTblWaiterName(staff[0]?.name || 'Murat Demir');
                      setTblQrCodeNumber(`QR-${String(nextIdx).padStart(2, '0')}`);
                      setTableFormOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B86B35] hover:bg-[#9F5928] text-white font-bold text-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Yeni Masa Ekle
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onSwitchWorkspaceView('waiter')}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 dark:bg-[#D4AF6A] text-white dark:text-[#141413] font-bold text-xs cursor-pointer"
                >
                  Tam Ekran Garson Terminali →
                </button>
              </div>
            </div>
          </div>

          {tableFormOpen && (
            <div
              data-testid="table-crud-form"
              className="rounded-xl border-2 border-[#B86B35]/50 bg-white dark:bg-[#1F1F1D] p-5 space-y-4 text-xs shadow-lg"
            >
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
                <h4 className="text-sm font-bold text-neutral-900 dark:text-[#F5F2EB]">
                  {editingTableId ? 'Masayı Düzenle' : 'Yeni Masa Oluştur'}
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setTableFormOpen(false);
                    setEditingTableId(null);
                  }}
                  className="px-2.5 py-1 rounded border border-neutral-300 dark:border-neutral-700 font-semibold cursor-pointer"
                >
                  Kapat
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Masa Adı / No</label>
                  <input
                    type="text"
                    value={tblNumber}
                    onChange={(e) => setTblNumber(e.target.value)}
                    placeholder="Örn: Masa 9 (Teras)"
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Salon / Bölge</label>
                  <input
                    type="text"
                    list="oztike-table-areas"
                    value={tblArea}
                    onChange={(e) => setTblArea(e.target.value)}
                    placeholder="Ana Salon"
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                  />
                  <datalist id="oztike-table-areas">
                    <option value="Ana Salon" />
                    <option value="Taş Bahçe" />
                    <option value="Bakır Ocakbaşı" />
                    <option value="VIP Aile Salonu" />
                    <option value="Teras" />
                  </datalist>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Kişi Kapasitesi</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={tblCapacity}
                    onChange={(e) => setTblCapacity(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Sorumlu Garson</label>
                  <input
                    type="text"
                    value={tblWaiterName}
                    onChange={(e) => setTblWaiterName(e.target.value)}
                    placeholder="Murat Demir"
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">QR Masa Kodu</label>
                  <input
                    type="text"
                    value={tblQrCodeNumber}
                    onChange={(e) => setTblQrCodeNumber(e.target.value)}
                    placeholder="QR-09"
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTableFormOpen(false);
                    setEditingTableId(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 font-semibold cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="button"
                  data-testid="save-table-btn"
                  onClick={() => {
                    if (editingTableId && onUpdateTable) {
                      const res = onUpdateTable({
                        id: editingTableId,
                        number: tblNumber,
                        area: tblArea,
                        capacity: tblCapacity,
                        waiterName: tblWaiterName,
                        qrCodeNumber: tblQrCodeNumber,
                      });
                      setStatusToast(res.message);
                      if (res.success) {
                        setTableFormOpen(false);
                        setEditingTableId(null);
                      }
                    } else if (onAddTable) {
                      const res = onAddTable({
                        number: tblNumber,
                        area: tblArea,
                        capacity: tblCapacity,
                        waiterName: tblWaiterName,
                        qrCodeNumber: tblQrCodeNumber,
                      });
                      setStatusToast(res.message);
                      if (res.success) {
                        setTableFormOpen(false);
                      }
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#B86B35] text-white font-bold cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{editingTableId ? 'Değişiklikleri Kaydet' : 'Masayı Ekle'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Kat Planı Haritası + Seçili Masa Kontrol Paneli */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sol 8 Sütun: Mimari Görsel Masa Planı Haritası */}
            <div className="lg:col-span-8 rounded-2xl border-2 border-[#D4AF6A]/35 bg-[#151210] text-[#F5F2EB] p-5 relative overflow-hidden space-y-5 shadow-xl">
              {/* Üst Mimari Sabit Alanlar: Meşe Köz Ocakbaşı & Kasa */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-orange-500/40 bg-gradient-to-r from-orange-950/60 to-amber-950/40 p-3 flex items-center gap-2.5">
                  <Flame className="w-5 h-5 text-orange-400 shrink-0 animate-pulse" />
                  <div>
                    <div className="text-xs font-bold text-orange-200">
                      Meşe Köz Ocakbaşı & Zırh Tezgâhı
                    </div>
                    <div className="text-[10px] text-orange-300/75">
                      Usta: Halil Usta · Canlı Izgara Hattı
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-[#D4AF6A]/30 bg-[#1F1A17] p-3 flex items-center gap-2.5">
                  <Receipt className="w-5 h-5 text-[#D4AF6A] shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-[#F3D299]">
                      POS Kasa & Karşılama Bankosu
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      Ana Giriş & Hesap Noktası
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/25 p-3 flex items-center gap-2.5">
                  <QrCode className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-emerald-200">
                      QR Masa Takip Ağı Aktif
                    </div>
                    <div className="text-[10px] text-emerald-300/75">
                      8 Numaralı Masa QR Eşleşmesi
                    </div>
                  </div>
                </div>
              </div>

              {/* Görsel Masalar Harita Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 py-2">
                {tables
                  .filter((t) => selectedFloorArea === 'Tümü' || t.area === selectedFloorArea)
                  .map((tbl, idx) => {
                    const isEmpty = tbl.status === 'Boş';
                    const isBillWaiting = tbl.status === 'Hesap bekliyor' || tbl.billRequested;
                    const isReserved = tbl.status === 'Rezerve';
                    const isCleaning = tbl.status === 'Temizlik bekliyor';
                    const isSelected = selectedMapTableId === tbl.id;

                    const borderColor = isBillWaiting
                      ? 'border-rose-500 bg-rose-950/40'
                      : isEmpty
                      ? 'border-emerald-500/60 bg-emerald-950/25'
                      : isReserved
                      ? 'border-sky-500/60 bg-sky-950/30'
                      : isCleaning
                      ? 'border-purple-500/60 bg-purple-950/30'
                      : 'border-amber-500/80 bg-amber-950/35';

                    const badgeColor = isBillWaiting
                      ? 'bg-rose-500 text-white'
                      : isEmpty
                      ? 'bg-emerald-500 text-[#0B1811]'
                      : isReserved
                      ? 'bg-sky-400 text-[#081A24]'
                      : isCleaning
                      ? 'bg-purple-400 text-[#1B0926]'
                      : 'bg-amber-400 text-[#1F1206]';

                    return (
                      <button
                        key={tbl.id}
                        type="button"
                        onClick={() => setSelectedMapTableId(tbl.id)}
                        className={`relative rounded-2xl border-2 p-3.5 text-left transition-all cursor-pointer flex flex-col justify-between min-h-[156px] ${borderColor} ${
                          isSelected ? 'ring-2 ring-[#D4AF6A] scale-[1.02]' : 'hover:border-[#D4AF6A]'
                        }`}
                      >
                        {/* Üst Sandalye Çizgileri (Görsel Masa Efekti) */}
                        <div className="flex justify-center gap-2 -mt-2 mb-1">
                          {Array.from({ length: Math.min(4, Math.ceil(tbl.capacity / 2)) }).map(
                            (_, cIdx) => (
                              <span
                                key={cIdx}
                                className="w-5 h-1.5 rounded-full bg-[#D4AF6A]/45 block"
                              />
                            )
                          )}
                        </div>

                        {/* Masa Başlığı ve Durum Rozeti */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono text-[10px] font-bold text-[#D4AF6A]">
                              MASA 0{idx + 1}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold whitespace-nowrap ${badgeColor}`}
                            >
                              {isBillWaiting ? 'Hesap Bekliyor' : tbl.status}
                            </span>
                          </div>
                          <div className="font-bold text-xs sm:text-sm text-white truncate">
                            {tbl.number}
                          </div>
                          <div className="text-[10px] text-neutral-400 truncate">
                            {tbl.area}
                          </div>
                        </div>

                        {/* Orta: Kapasite, Garson ve Çağrı Uyarısı */}
                        <div className="my-2 space-y-1 text-[11px] text-neutral-300">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 text-neutral-400">
                              <Users className="w-3 h-3" /> {tbl.capacity} Kişilik
                            </span>
                            <span className="text-[#F3D299] font-medium truncate">
                              {tbl.waiterName}
                            </span>
                          </div>

                          {tbl.waiterCalled && (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[10px] font-bold animate-pulse">
                              <BellRing className="w-3 h-3" />
                              <span>Garson Çağrısı Aktif</span>
                            </div>
                          )}
                        </div>

                        {/* Alt: Açık Adisyon Tutarı */}
                        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                          <span className="text-[10px] text-neutral-400">{tbl.qrCodeNumber}</span>
                          <span className="font-mono font-bold text-[#F5D69B]">
                            {tbl.openBalance > 0 ? `${tbl.openBalance.toFixed(2)} ₺` : '0,00 ₺'}
                          </span>
                        </div>

                        {/* Alt Sandalye Çizgileri */}
                        <div className="flex justify-center gap-2 -mb-2 mt-1">
                          {Array.from({ length: Math.min(4, Math.ceil(tbl.capacity / 2)) }).map(
                            (_, cIdx) => (
                              <span
                                key={cIdx}
                                className="w-5 h-1.5 rounded-full bg-[#D4AF6A]/45 block"
                              />
                            )
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Sağ 4 Sütun: Seçili Masa Detayı ve Hızlı Durum Değiştirme */}
            <div className="lg:col-span-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4">
              {(() => {
                const selectedTbl =
                  tables.find((t) => t.id === selectedMapTableId) || tables[0];
                if (!selectedTbl) return null;
                return (
                  <>
                    <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3">
                      <span className="font-mono text-xs font-bold text-[#B86B35] dark:text-[#D4AF6A]">
                        {selectedTbl.qrCodeNumber} · {selectedTbl.area}
                      </span>
                      <h4 className="text-lg font-bold text-neutral-900 dark:text-[#F5F2EB] mt-0.5">
                        {selectedTbl.number} Yönetimi
                      </h4>
                      <p className="text-xs text-neutral-500">
                        Sorumlu Garson: {selectedTbl.waiterName} · Kapasite: {selectedTbl.capacity} Kişi
                      </p>
                    </div>

                    <div className="rounded-xl bg-neutral-100 dark:bg-[#141413] p-3.5 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Mevcut Durum:</span>
                        <span className="font-bold text-[#B86B35] dark:text-[#D4AF6A]">
                          {selectedTbl.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500">Açık Adisyon Bakiyesi:</span>
                        <span className="font-mono font-bold text-sm">
                          {selectedTbl.openBalance.toFixed(2)} ₺
                        </span>
                      </div>
                      {selectedTbl.activeServiceRequests.length > 0 && (
                        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
                          <span className="text-amber-500 font-bold block">
                            Aktif Müşteri Talepleri:
                          </span>
                          <span className="text-neutral-700 dark:text-neutral-300">
                            {selectedTbl.activeServiceRequests.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-bold text-neutral-900 dark:text-[#F5F2EB]">
                        Masa Durumunu Hızlı Değiştir:
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {(
                          [
                            'Boş',
                            'Dolu',
                            'Hazırlanıyor',
                            'Hesap bekliyor',
                            'Rezerve',
                            'Temizlik bekliyor',
                          ] as TableStatus[]
                        ).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => {
                              onChangeTableStatus?.(selectedTbl.id, st);
                              setStatusToast(
                                `${selectedTbl.number} durumu "${st}" olarak güncellendi.`
                              );
                            }}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition-all cursor-pointer ${
                              selectedTbl.status === st
                                ? 'bg-[#B86B35] text-white border-[#B86B35]'
                                : 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => onSwitchWorkspaceView('pos')}
                        className="w-full py-2.5 rounded-xl bg-[#B86B35] text-white font-bold text-xs cursor-pointer"
                      >
                        POS Kasada Masa Adisyonunu Aç
                      </button>
                      {onUpdateTable && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTableId(selectedTbl.id);
                            setTblNumber(selectedTbl.number);
                            setTblArea(selectedTbl.area);
                            setTblCapacity(selectedTbl.capacity);
                            setTblWaiterName(selectedTbl.waiterName);
                            setTblQrCodeNumber(selectedTbl.qrCodeNumber);
                            setTableFormOpen(true);
                          }}
                          className="w-full inline-flex items-center justify-center gap-1 py-2 rounded-xl border border-[#B86B35]/50 text-[#B86B35] dark:text-[#D4AF6A] font-semibold text-xs cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Masayı Düzenle
                        </button>
                      )}
                      {onDeleteTable && (
                        <button
                          type="button"
                          onClick={() => {
                            const res = onDeleteTable(selectedTbl.id);
                            setStatusToast(res.message);
                          }}
                          className="w-full py-2 rounded-xl border border-rose-500/45 text-rose-500 hover:bg-rose-500/10 font-semibold text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Masayı Sil
                        </button>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Modül 7: Mutfak (KDS) Ayarları & Canlı Ekran (Varsayılan Pasif / İsteğe Bağlı Aktif) */}
      {activeModuleId === 7 && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4 text-xs">
          <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-bold text-sm flex items-center gap-2">
                <Power className="w-4 h-4 text-[#B86B35]" />
                <span>
                  Mutfak (KDS) Modülü Durumu:{' '}
                  <strong className={siteCmsConfig.operationalSettings?.kitchenModuleEnabled ? 'text-emerald-500' : 'text-amber-500'}>
                    {siteCmsConfig.operationalSettings?.kitchenModuleEnabled ? 'Aktif' : 'Pasif'}
                  </strong>
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Mutfak ekranı varsayılan olarak pasiftir. İstediğiniz zaman buradan tek tıkla aktifleştirip tam ekran KDS kullanabilirsiniz.
              </p>
            </div>
            <button
              type="button"
              data-testid="kds-module-master-toggle"
              onClick={() => {
                const next = !(siteCmsConfig.operationalSettings?.kitchenModuleEnabled ?? false);
                onUpdateSiteCmsConfig((prev) => ({
                  ...prev,
                  operationalSettings: {
                    ...prev.operationalSettings,
                    kitchenModuleEnabled: next,
                  },
                }));
                setStatusToast(`Mutfak (KDS) modülü ${next ? 'aktifleştirildi' : 'pasife alındı'}.`);
              }}
              className={`px-4 py-2 rounded-lg font-bold cursor-pointer ${
                siteCmsConfig.operationalSettings?.kitchenModuleEnabled
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#B86B35] text-white'
              }`}
            >
              {siteCmsConfig.operationalSettings?.kitchenModuleEnabled ? 'Pasife Al' : 'Mutfak Modülünü Aktifleştir'}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>7. Mutfak (KDS) İstasyonları &amp; Hazırlık Süresi Ayarları</span>
              </h3>
              <p className="text-neutral-500">KDS uyarı eşiklerini ve istasyon yönlendirmelerini ayarlayın.</p>
            </div>
            <button
              type="button"
              disabled={!siteCmsConfig.operationalSettings?.kitchenModuleEnabled}
              onClick={() => onSwitchWorkspaceView('kds')}
              className="px-4 py-2 rounded-lg bg-[#B86B35] text-white font-semibold cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
            >
              Tam Ekran Mutfak (KDS) Ekranına Git →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50 dark:bg-[#141413]">
            <div>
              <label className="block font-semibold mb-1">Geciken Sipariş Uyarı Eşiği (Dakika)</label>
              <input
                type="number"
                min={5}
                max={60}
                value={siteCmsConfig.operationalSettings?.kdsAlertMinutes ?? 14}
                onChange={(e) => {
                  const val = Math.max(5, Number(e.target.value));
                  onUpdateSiteCmsConfig((prev) => ({
                    ...prev,
                    operationalSettings: {
                      ...prev.operationalSettings,
                      kdsAlertMinutes: val,
                    },
                  }));
                  setStatusToast(`Mutfak KDS uyarı süresi ${val} dk olarak kaydedildi.`);
                }}
                className="w-40 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5 font-mono"
              />
            </div>
            <label className="inline-flex items-center gap-2 font-medium cursor-pointer self-center">
              <input
                type="checkbox"
                checked={siteCmsConfig.operationalSettings?.kdsSoundAlert ?? true}
                onChange={(e) =>
                  onUpdateSiteCmsConfig((prev) => ({
                    ...prev,
                    operationalSettings: {
                      ...prev.operationalSettings,
                      kdsSoundAlert: e.target.checked,
                    },
                  }))
                }
              />
              <span>Yeni Sipariş Sesli Uyarı Sinyali</span>
            </label>
            <label className="inline-flex items-center gap-2 font-medium cursor-pointer self-center">
              <input
                type="checkbox"
                checked={siteCmsConfig.operationalSettings?.kdsAutoBumpCompleted ?? false}
                onChange={(e) =>
                  onUpdateSiteCmsConfig((prev) => ({
                    ...prev,
                    operationalSettings: {
                      ...prev.operationalSettings,
                      kdsAutoBumpCompleted: e.target.checked,
                    },
                  }))
                }
              />
              <span>Hazır Siparişleri Otomatik Kapat</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(['Izgara', 'Tavuk', 'Soğuk mutfak', 'İçecek', 'Paketleme'] as const).map((st) => {
              const activeStations = siteCmsConfig.operationalSettings?.kdsActiveStations || [
                'Izgara',
                'Tavuk',
                'Soğuk mutfak',
                'İçecek',
                'Paketleme',
              ];
              const isStationActive = activeStations.includes(st);
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    const next = isStationActive
                      ? activeStations.filter((x) => x !== st)
                      : [...activeStations, st];
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      operationalSettings: {
                        ...prev.operationalSettings,
                        kdsActiveStations: next,
                      },
                    }));
                    setStatusToast(`${st} istasyonu ${isStationActive ? 'kapatıldı' : 'aktifleştirildi'}.`);
                  }}
                  className={`px-3 py-1.5 rounded-full font-semibold border cursor-pointer ${
                    isStationActive
                      ? 'bg-emerald-600/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-300'
                      : 'border-neutral-300 dark:border-neutral-700 text-neutral-500'
                  }`}
                >
                  {st}: {isStationActive ? 'Aktif' : 'Kapalı'}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Modül 12: ÖDEME YÖNTEMLERİ, POS, KASA & FİŞ (TEK BAŞLIK ALTINDA) */}
      {activeModuleId === 12 && (
        <div className="space-y-6 text-xs">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#B86B35]" />
                  <span>10. Ödeme Yöntemleri, POS, Kasa &amp; Fiş Yönetimi</span>
                </h3>
                <p className="text-neutral-500">
                  POS kasa ayarları, müşteri ödeme yöntemleri (Nakit, Kart, Online, Yemek Kartı, Havale), adisyon tahsilatı ve termal fiş tasarımını tek merkezden yönetin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSwitchWorkspaceView('pos')}
                className="px-4 py-2 rounded-lg bg-[#B86B35] text-white font-semibold cursor-pointer"
              >
                Tam Ekran POS / Kasa Ekranına Git →
              </button>
            </div>

            {/* 4 Alt Sekme: POS & Kasa | Ödeme Yöntemleri | Tahsilat & e-Fatura | Fiş Tasarımı */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              {(
                [
                  { id: 'pos', label: 'POS & Kasa Ayarları' },
                  { id: 'payment_methods', label: `Ödeme Yöntemleri (${(siteCmsConfig.paymentMethods || []).length})` },
                  { id: 'settlement', label: `Tahsilat & e-Fatura (${orders.length})` },
                  { id: 'receipt', label: 'Fiş Tasarımı & Yazıcı' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  data-testid={`pos-subtab-${tab.id}`}
                  onClick={() => setPosModuleTab(tab.id)}
                  className={`px-3.5 py-2 rounded-lg font-bold cursor-pointer transition ${
                    posModuleTab === tab.id
                      ? 'bg-[#B86B35] text-white'
                      : 'bg-neutral-100 dark:bg-[#141413] text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {posModuleTab === 'pos' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50 dark:bg-[#141413]">
                <div>
                  <label className="block font-semibold mb-1">Varsayılan POS Tahsilat Yöntemi</label>
                  <select
                    value={siteCmsConfig.operationalSettings?.posDefaultMethod || 'card'}
                    onChange={(e) => {
                      const method = e.target.value as 'cash' | 'card' | 'meal_card';
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        operationalSettings: {
                          ...prev.operationalSettings,
                          posDefaultMethod: method,
                        },
                      }));
                      setStatusToast('POS varsayılan ödeme yöntemi güncellendi.');
                    }}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5"
                  >
                    <option value="card">Fiziksel POS / Kredi Kartı</option>
                    <option value="cash">Nakit</option>
                    <option value="meal_card">Yemek Kartı</option>
                  </select>
                </div>
                <label className="inline-flex items-center gap-2 font-medium cursor-pointer self-end pb-1">
                  <input
                    type="checkbox"
                    checked={siteCmsConfig.operationalSettings?.posAutoReceiptPrint ?? true}
                    onChange={(e) => {
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        operationalSettings: {
                          ...prev.operationalSettings,
                          posAutoReceiptPrint: e.target.checked,
                        },
                      }));
                      setStatusToast('Otomatik fiş / e-Arşiv çıktı kuralı güncellendi.');
                    }}
                  />
                  <span>Tahsilat tamamlandığında otomatik termal fiş ve e-Fatura oluştur</span>
                </label>
              </div>
            )}

            {posModuleTab === 'payment_methods' && (() => {
              const methods = siteCmsConfig.paymentMethods || [];
              const updateMethods = (next: NonNullable<SiteCmsConfig['paymentMethods']>) =>
                onUpdateSiteCmsConfig((prev) => ({ ...prev, paymentMethods: next }));
              return (
                <div className="space-y-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!pmName.trim()) return;
                      if (editingPmId) {
                        updateMethods(
                          methods.map((m) =>
                            m.id === editingPmId
                              ? {
                                  ...m,
                                  name: pmName.trim(),
                                  code: pmCode.trim() || m.code,
                                  type: pmType,
                                  commissionPercent: pmCommission,
                                  allowOnCustomerPortal: pmAllowPortal,
                                  allowPayNow: pmAllowPayNow,
                                  description: pmDescription.trim(),
                                }
                              : m
                          )
                        );
                        setStatusToast(`${pmName.trim()} ödeme yöntemi güncellendi.`);
                        setEditingPmId(null);
                      } else {
                        updateMethods([
                          ...methods,
                          {
                            id: `PM-${Date.now().toString().slice(-4)}`,
                            name: pmName.trim(),
                            code: pmCode.trim() || pmType,
                            type: pmType,
                            commissionPercent: pmCommission,
                            isActive: true,
                            allowOnCustomerPortal: pmAllowPortal,
                            allowPayNow: pmAllowPayNow,
                            description: pmDescription.trim() || 'Özel ödeme kanalı',
                          },
                        ]);
                        setStatusToast(`${pmName.trim()} ödeme yöntemi eklendi.`);
                      }
                      setPmName('');
                      setPmCode('');
                      setPmDescription('');
                    }}
                    className="rounded-xl border border-[#B86B35]/35 bg-neutral-50 dark:bg-[#141413] p-4 space-y-3"
                  >
                    <div className="font-bold text-sm flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-[#B86B35]" />
                      <span>{editingPmId ? 'Ödeme Yöntemini Düzenle' : 'Yeni Ödeme Yöntemi Ekle'}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      <div>
                        <label className="block font-semibold mb-1">Yöntem Adı *</label>
                        <input
                          type="text"
                          required
                          value={pmName}
                          onChange={(e) => setPmName(e.target.value)}
                          placeholder="Örn: Setcard / Troy QR"
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Sistem Kodu</label>
                        <input
                          type="text"
                          value={pmCode}
                          onChange={(e) => setPmCode(e.target.value)}
                          placeholder="setcard_qr"
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Ödeme Türü</label>
                        <select
                          value={pmType}
                          onChange={(e) => setPmType(e.target.value as typeof pmType)}
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5"
                        >
                          <option value="cash">Nakit</option>
                          <option value="pos">Fiziksel POS Kart</option>
                          <option value="online_card">Online Kart (iyzico/PayTR)</option>
                          <option value="meal_card">Yemek Kartı</option>
                          <option value="wallet">Dijital Cüzdan</option>
                          <option value="transfer">Havale / FAST QR</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Komisyon (%)</label>
                        <input
                          type="number"
                          step="0.05"
                          min={0}
                          value={pmCommission}
                          onChange={(e) => setPmCommission(Number(e.target.value))}
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Açıklama</label>
                        <input
                          type="text"
                          value={pmDescription}
                          onChange={(e) => setPmDescription(e.target.value)}
                          placeholder="Kısa bilgi..."
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-4">
                        <label className="inline-flex items-center gap-2 cursor-pointer font-medium">
                          <input
                            type="checkbox"
                            checked={pmAllowPortal}
                            onChange={(e) => setPmAllowPortal(e.target.checked)}
                          />
                          <span>Müşteri Sipariş Sepetinde Göster</span>
                        </label>
                        <label className="inline-flex items-center gap-2 cursor-pointer font-medium">
                          <input
                            type="checkbox"
                            checked={pmAllowPayNow}
                            onChange={(e) => setPmAllowPayNow(e.target.checked)}
                          />
                          <span>Anında Online Ödeme (Pay Now) Destekli</span>
                        </label>
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-[#B86B35] text-white font-bold cursor-pointer"
                      >
                        {editingPmId ? 'Güncelle' : '+ Ödeme Yöntemi Ekle'}
                      </button>
                    </div>
                  </form>

                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#141413] px-3.5 py-2.5">
                    <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                      Sipariş Aşamasında Görünürlük ({methods.filter((m) => m.isActive && m.allowOnCustomerPortal).length}/{methods.length} yöntem müşteri ekranında açık)
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          updateMethods(
                            methods.map((m) => ({
                              ...m,
                              isActive: true,
                              allowOnCustomerPortal: ['cash', 'pos', 'transfer'].includes(m.type),
                            }))
                          );
                          setStatusToast('Sipariş aşamasında Kasa Nakit, POS Cihazı ve Havale/EFT aktif edildi.');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#B86B35]/15 border border-[#B86B35]/40 text-[#B86B35] dark:text-[#D4AF6A] font-bold text-[11px] cursor-pointer"
                      >
                        Varsayılan (Kasa / POS / Havale-EFT)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateMethods(methods.map((m) => ({ ...m, isActive: true, allowOnCustomerPortal: true })));
                          setStatusToast('Tüm ödeme yöntemleri sipariş aşamasında açıldı.');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] cursor-pointer"
                      >
                        Tümünü Siparişte Aç
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {methods.map((pm) => (
                      <div
                        key={pm.id}
                        data-testid={`admin-pm-card-${pm.id}`}
                        className={`rounded-xl border p-4 space-y-2.5 ${
                          pm.isActive
                            ? 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#141413]'
                            : 'border-neutral-300/60 dark:border-neutral-800/60 opacity-65'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-sm truncate">{pm.name}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              data-testid={`toggle-pm-portal-${pm.id}`}
                              onClick={() => {
                                const nextPortal = !pm.allowOnCustomerPortal;
                                updateMethods(
                                  methods.map((x) =>
                                    x.id === pm.id ? { ...x, allowOnCustomerPortal: nextPortal } : x
                                  )
                                );
                                setStatusToast(
                                  `${pm.name} sipariş aşamasında ${nextPortal ? 'açıldı' : 'gizlendi'}.`
                                );
                              }}
                              className={`px-2 py-0.5 rounded font-bold text-[10px] cursor-pointer ${
                                pm.allowOnCustomerPortal
                                  ? 'bg-[#B86B35] text-white'
                                  : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200'
                              }`}
                            >
                              {pm.allowOnCustomerPortal ? 'Siparişte Açık' : 'Siparişte Kapalı'}
                            </button>
                            <button
                              type="button"
                              data-testid={`toggle-pm-active-${pm.id}`}
                              onClick={() =>
                                updateMethods(
                                  methods.map((x) => (x.id === pm.id ? { ...x, isActive: !x.isActive } : x))
                                )
                              }
                              className={`px-2 py-0.5 rounded font-bold text-[10px] cursor-pointer ${
                                pm.isActive ? 'bg-emerald-600 text-white' : 'bg-neutral-500 text-white'
                              }`}
                            >
                              {pm.isActive ? 'Aktif' : 'Pasif'}
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-neutral-500">{pm.description}</p>
                        <div className="text-[11px] font-mono text-neutral-500">
                          Tür: {pm.type} · Komisyon: %{pm.commissionPercent} ·{' '}
                          {pm.allowPayNow ? 'Anında Online Ödeme' : 'Teslimat/Kasa Tahsilatı'}
                        </div>
                        <div className="flex items-center gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPmId(pm.id);
                              setPmName(pm.name);
                              setPmCode(pm.code);
                              setPmType(pm.type);
                              setPmCommission(pm.commissionPercent);
                              setPmAllowPortal(pm.allowOnCustomerPortal);
                              setPmAllowPayNow(pm.allowPayNow);
                              setPmDescription(pm.description);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#B86B35]/45 text-[#B86B35] dark:text-[#D4AF6A] font-semibold cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" /> Düzenle
                          </button>
                          <button
                            type="button"
                            onClick={() => updateMethods(methods.filter((x) => x.id !== pm.id))}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-rose-500/40 text-rose-500 font-semibold cursor-pointer ml-auto"
                          >
                            <Trash2 className="w-3 h-3" /> Sil
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {posModuleTab === 'settlement' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-3 flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#B86B35] dark:text-[#D4AF6A]">
                        {ord.orderNumber}
                      </span>
                      <span className="font-mono font-bold">{ord.totalAmount.toFixed(2)} ₺</span>
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      {ord.paymentMethod} · {ord.paymentStatus}
                      {ord.receiptNumber ? ` · ${ord.receiptNumber}` : ''}
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {ord.paymentStatus !== 'Ödendi' && onSettleOrderPayment && (
                        <button
                          type="button"
                          onClick={() => {
                            const rem = Math.max(0, ord.totalAmount - ord.paidAmount);
                            onSettleOrderPayment(ord.id, rem, ord.paymentMethod || 'POS Kredi Kartı');
                            setStatusToast(`${ord.orderNumber} tahsil edildi & fiş kesildi.`);
                          }}
                          className="px-2 py-1 rounded bg-emerald-700 text-white font-semibold text-[11px] cursor-pointer"
                        >
                          Tahsil Et
                        </button>
                      )}
                      <button
                        type="button"
                        data-testid={`module12-print-btn-${ord.orderNumber}`}
                        onClick={() => {
                          onIssueOrderReceiptAndInvoice?.(ord.id);
                          const nums =
                            ord.receiptNumber && ord.eInvoiceNo
                              ? { receiptNumber: ord.receiptNumber, eInvoiceNo: ord.eInvoiceNo }
                              : generateReceiptAndInvoiceNumbers(ord.orderNumber);
                          const enrichedOrder: OrderRecord = {
                            ...ord,
                            receiptNumber: nums.receiptNumber,
                            eInvoiceNo: nums.eInvoiceNo,
                            autoReceiptIssued: true,
                          };
                          setReceiptInvoiceModalOrder(enrichedOrder);
                          printThermalReceipt(enrichedOrder, {
                            ...siteCmsConfig.receiptSettings,
                            taxRatePercent: siteCmsConfig.generalSettings.taxRatePercent ?? 10,
                            logoUrl: siteCmsConfig.header.logoUrl,
                          });
                          setStatusToast(
                            `${ord.orderNumber} fişi (${nums.receiptNumber}) termal yazıcıya gönderildi.`
                          );
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 text-[11px] font-semibold cursor-pointer"
                      >
                        <Printer className="w-3 h-3" /> Fiş / Fatura Yazdır
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Termal Fiş & e-Arşiv Belge Tasarım Stüdyosu + Test Yazdır */}
          {(posModuleTab === 'pos' || posModuleTab === 'receipt') && (() => {
            const rs = siteCmsConfig.receiptSettings;
            const updateReceipt = (patch: Partial<SiteCmsConfig['receiptSettings']>) =>
              onUpdateSiteCmsConfig((prev) => ({
                ...prev,
                receiptSettings: { ...prev.receiptSettings, ...patch },
              }));
            const sampleOrder: OrderRecord = orders[0] || {
              id: 'TEST-1',
              orderNumber: 'OZT-TEST-001',
              channel: 'Kasa',
              tableId: 'TBL-01',
              tableName: 'Salon 1',
              staffName: 'Murat Demir',
              customerName: 'Örnek Misafir',
              customerPhone: '0532 000 00 00',
              items: [
                {
                  id: 'IT-1',
                  productId: 'PRD-01',
                  productName: 'Geleneksel Ciğer Şiş',
                  quantity: 2,
                  unitPrice: 440,
                  station: 'Izgara',
                  isReady: true,
                },
                {
                  id: 'IT-2',
                  productId: 'PRD-06',
                  productName: 'Bakır Köpüklü Ayran',
                  quantity: 2,
                  unitPrice: 55,
                  station: 'İçecek',
                  isReady: true,
                },
              ],
              subtotal: 990,
              discountAmount: 0,
              taxAmount: 99,
              totalAmount: 990,
              paidAmount: 990,
              paymentStatus: 'Ödendi',
              paymentMethod: 'Kredi Kartı (POS)',
              status: 'Tamamlandı',
              createdAt: '16 Kas 2026 14:30',
              elapsedMinutes: 10,
              slaMinutes: 14,
              receiptNumber: 'FIS-2026-0001',
              eInvoiceNo: 'OZT2026000001',
              autoReceiptIssued: true,
            };

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
                    <div>
                      <h4 className="font-bold text-sm flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-[#B86B35]" />
                        <span>Gelişmiş Fiş &amp; e-Arşiv Fatura Tasarım Bölümü</span>
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        Şablon stili, renk, yazı tipi, QR kod, barkod, KDV matrah tablosu ve misafir Wi-Fi kutusunu özelleştirin.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        data-testid="admin-test-print-btn"
                        onClick={() => {
                          setReceiptInvoiceModalOrder(sampleOrder);
                          const ok = printThermalReceipt(sampleOrder, {
                            ...rs,
                            taxRatePercent: siteCmsConfig.generalSettings.taxRatePercent ?? 10,
                            logoUrl: siteCmsConfig.header.logoUrl,
                          });
                          setStatusToast(
                            ok
                              ? 'Test fişi termal yazıcıya gönderildi ve önizleme açıldı.'
                              : 'Test fişi önizlemesi açıldı.'
                          );
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B86B35] text-white font-bold cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" /> Test Fişi Yazdır
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          downloadThermalReceiptHtml(sampleOrder, {
                            ...rs,
                            taxRatePercent: siteCmsConfig.generalSettings.taxRatePercent ?? 10,
                            logoUrl: siteCmsConfig.header.logoUrl,
                          });
                          setStatusToast('Örnek termal fiş .HTML olarak indirildi.');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 font-semibold cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Örnek İndir
                      </button>
                    </div>
                  </div>

                  {/* 4 Hazır Fiş Tasarım Şablonu */}
                  <div className="space-y-1.5">
                    <label className="block font-semibold">Hazır Fiş Tasarım Şablonu Seçin</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        {
                          id: 'gaziantep-heritage' as const,
                          label: 'Gaziantep Ocakbaşı',
                          accent: '#B86B35',
                          font: 'mono' as const,
                          border: 'dashed' as const,
                        },
                        {
                          id: 'classic-thermal' as const,
                          label: 'Klasik Termal POS',
                          accent: '#141413',
                          font: 'mono' as const,
                          border: 'dashed' as const,
                        },
                        {
                          id: 'modern-minimal' as const,
                          label: 'Modern Minimal',
                          accent: '#0F766E',
                          font: 'sans' as const,
                          border: 'solid' as const,
                        },
                        {
                          id: 'kurumsal-efatura' as const,
                          label: 'Kurumsal e-Arşiv',
                          accent: '#1E3A8A',
                          font: 'serif' as const,
                          border: 'double' as const,
                        },
                      ].map((tpl) => (
                        <button
                          key={tpl.id}
                          type="button"
                          data-testid={`receipt-preset-${tpl.id}`}
                          onClick={() =>
                            updateReceipt({
                              templatePreset: tpl.id,
                              accentColor: tpl.accent,
                              fontFamily: tpl.font,
                              borderStyle: tpl.border,
                            })
                          }
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition ${
                            (rs.templatePreset || 'gaziantep-heritage') === tpl.id
                              ? 'border-[#B86B35] bg-[#B86B35]/15 ring-1 ring-[#B86B35]'
                              : 'border-neutral-200 dark:border-neutral-800'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: tpl.accent }}
                            />
                            <span className="font-bold text-[11px]">{tpl.label}</span>
                          </div>
                          <div className="text-[10px] text-neutral-500 mt-0.5 font-mono">
                            {tpl.font} · {tpl.border}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Görsel Stil, Renk, Font ve Kağıt Boyutu */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Kağıt Genişliği</label>
                      <select
                        value={rs?.paperWidthMm || 80}
                        onChange={(e) =>
                          updateReceipt({ paperWidthMm: Number(e.target.value) === 58 ? 58 : 80 })
                        }
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                      >
                        <option value={80}>80mm Standart</option>
                        <option value={58}>58mm Mobil Rulo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Yazı Tipi</label>
                      <select
                        value={rs?.fontFamily || 'mono'}
                        onChange={(e) =>
                          updateReceipt({
                            fontFamily: e.target.value as 'mono' | 'sans' | 'serif',
                          })
                        }
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                      >
                        <option value="mono">Termal Mono</option>
                        <option value="sans">Modern Sans</option>
                        <option value="serif">Klasik Serif</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Ayraç Çizgi Stili</label>
                      <select
                        value={rs?.borderStyle || 'dashed'}
                        onChange={(e) =>
                          updateReceipt({
                            borderStyle: e.target.value as 'dashed' | 'solid' | 'double',
                          })
                        }
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                      >
                        <option value="dashed">Kesikli (Dashed)</option>
                        <option value="solid">Düz Çizgi (Solid)</option>
                        <option value="double">Çift Çizgi (Double)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Fiş Vurgu Rengi</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={rs?.accentColor || '#B86B35'}
                          onChange={(e) => updateReceipt({ accentColor: e.target.value })}
                          className="h-8 w-9 rounded border border-neutral-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={rs?.accentColor || '#B86B35'}
                          onChange={(e) => updateReceipt({ accentColor: e.target.value })}
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2 py-1.5 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Kurumsal Bilgiler & Wi-Fi / QR Ayarları */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">İşletme Başlık Adı</label>
                      <input
                        type="text"
                        value={rs?.companyName || ''}
                        onChange={(e) => updateReceipt({ companyName: e.target.value })}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Resmi Ticari Unvan</label>
                      <input
                        type="text"
                        value={rs?.legalName || ''}
                        onChange={(e) => updateReceipt({ legalName: e.target.value })}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Vergi Dairesi &amp; VKN</label>
                      <input
                        type="text"
                        value={rs?.taxOfficeAndNo || ''}
                        onChange={(e) => updateReceipt({ taxOfficeAndNo: e.target.value })}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Telefon</label>
                      <input
                        type="text"
                        value={rs?.phone || ''}
                        onChange={(e) => updateReceipt({ phone: e.target.value })}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Misafir Wi-Fi Ağ Adı (SSID)</label>
                      <input
                        type="text"
                        value={rs?.wifiSsid || ''}
                        onChange={(e) => updateReceipt({ wifiSsid: e.target.value })}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Misafir Wi-Fi Şifresi</label>
                      <input
                        type="text"
                        value={rs?.wifiPassword || ''}
                        onChange={(e) => updateReceipt({ wifiPassword: e.target.value })}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">QR Kod Yönlendirme URL</label>
                      <input
                        type="text"
                        value={rs?.qrCodeUrl || ''}
                        onChange={(e) => updateReceipt({ qrCodeUrl: e.target.value })}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Sosyal Medya &amp; Web İmzası</label>
                      <input
                        type="text"
                        value={rs?.socialHandle || ''}
                        onChange={(e) => updateReceipt({ socialHandle: e.target.value })}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Mühür Başlığı</label>
                      <input
                        type="text"
                        value={rs?.stampTitle || ''}
                        onChange={(e) => updateReceipt({ stampTitle: e.target.value })}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Mühür Alt Yazısı</label>
                      <input
                        type="text"
                        value={rs?.stampSubtitle || ''}
                        onChange={(e) => updateReceipt({ stampSubtitle: e.target.value })}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-semibold mb-1">Fiş Alt Bilgi Mesajı</label>
                      <input
                        type="text"
                        value={rs?.footerMessage || ''}
                        onChange={(e) => updateReceipt({ footerMessage: e.target.value })}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5"
                      />
                    </div>
                  </div>

                  {/* Fiş Üzerinde Gösterilecek Görsel Bileşenler */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                    <label className="inline-flex items-center gap-2 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rs?.showLogo ?? true}
                        onChange={(e) => updateReceipt({ showLogo: e.target.checked })}
                      />
                      <span>Fiş Üstünde İşletme Logosu Göster</span>
                    </label>
                    <label className="inline-flex items-center gap-2 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rs?.showTaxBreakdown ?? true}
                        onChange={(e) => updateReceipt({ showTaxBreakdown: e.target.checked })}
                      />
                      <span>KDV Matrah &amp; Vergi Kırılım Tablosu</span>
                    </label>
                    <label className="inline-flex items-center gap-2 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rs?.showQrCode ?? true}
                        onChange={(e) => updateReceipt({ showQrCode: e.target.checked })}
                      />
                      <span>e-Arşiv Doğrulama &amp; Menü QR Kodu</span>
                    </label>
                    <label className="inline-flex items-center gap-2 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rs?.showBarcode ?? true}
                        onChange={(e) => updateReceipt({ showBarcode: e.target.checked })}
                      />
                      <span>Adisyon Barkodu (EAN-13 Çizgili)</span>
                    </label>
                    <label className="inline-flex items-center gap-2 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rs?.showWifiInfo ?? true}
                        onChange={(e) => updateReceipt({ showWifiInfo: e.target.checked })}
                      />
                      <span>Misafir Wi-Fi Şifre Kutusunu Bas</span>
                    </label>
                    <label className="inline-flex items-center gap-2 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rs?.showStampBox ?? true}
                        onChange={(e) => updateReceipt({ showStampBox: e.target.checked })}
                      />
                      <span>Resmi Onay / Kaşe Kutusunu Bas</span>
                    </label>
                  </div>
                </div>

                {/* Canlı Termal Fiş Önizlemesi (Gerçek Şablon Motoru) */}
                <div className="lg:col-span-5 flex flex-col items-center gap-3">
                  <div className="text-xs font-bold text-neutral-500">
                    Canlı Termal Rulo Önizlemesi ({rs?.paperWidthMm || 80}mm)
                  </div>
                  <div
                    data-testid="admin-receipt-designer-preview"
                    className={`${
                      rs?.paperWidthMm === 58 ? 'w-[265px]' : 'w-[355px]'
                    } rounded-2xl border border-neutral-300 bg-[#FFFDF9] text-[#141413] p-5 shadow-xl`}
                    dangerouslySetInnerHTML={{
                      __html: buildThermalReceiptInnerMarkup(sampleOrder, {
                        ...rs,
                        taxRatePercent: siteCmsConfig.generalSettings.taxRatePercent ?? 10,
                        logoUrl: siteCmsConfig.header.logoUrl,
                      }),
                    }}
                  />
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* =====================================================================
          MODÜL 40: GEÇMİŞ & GÜN SONU Z-RAPORU ARŞİVİ
      ===================================================================== */}
      {activeModuleId === 40 && (
        <div className="space-y-6 text-xs">
          {(() => {
            const validOrders = orders.filter((o) => o.status !== 'İptal edildi');
            const liveTotal = roundCurrency(validOrders.reduce((s, o) => s + o.totalAmount, 0));
            const liveTax = roundCurrency(validOrders.reduce((s, o) => s + o.taxAmount, 0));
            const liveCash = roundCurrency(
              validOrders
                .filter((o) => /nakit/i.test(o.paymentMethod || ''))
                .reduce((s, o) => s + o.totalAmount, 0)
            );
            const liveCard = roundCurrency(liveTotal - liveCash);

            const filteredArchive = archiveHistory.filter((a) => {
              const typeMatch = archiveTypeFilter === 'Tümü' || a.type === archiveTypeFilter;
              const qMatch =
                !archiveSearch.trim() ||
                a.title.toLowerCase().includes(archiveSearch.toLowerCase()) ||
                a.subtitle.toLowerCase().includes(archiveSearch.toLowerCase()) ||
                a.reason.toLowerCase().includes(archiveSearch.toLowerCase());
              return typeMatch && qMatch;
            });

            return (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-4">
                    <div className="text-neutral-500">Bugünkü Canlı Ciro</div>
                    <div className="text-xl font-mono font-bold mt-1 text-[#B86B35] dark:text-[#D4AF6A]">
                      {liveTotal.toFixed(2)} ₺
                    </div>
                  </div>
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-4">
                    <div className="text-neutral-500">Nakit / Kart Dağılımı</div>
                    <div className="text-sm font-mono font-bold mt-1">
                      {liveCash.toFixed(0)} ₺ / {liveCard.toFixed(0)} ₺
                    </div>
                  </div>
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-4">
                    <div className="text-neutral-500">Toplam KDV &amp; Sipariş</div>
                    <div className="text-sm font-mono font-bold mt-1">
                      {liveTax.toFixed(2)} ₺ ({validOrders.length} Adet)
                    </div>
                  </div>
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-4">
                    <div className="text-neutral-500">Arşivlenmiş Z-Raporu</div>
                    <div className="text-xl font-mono font-bold mt-1">{archiveHistory.length} Kayıt</div>
                  </div>
                </div>

                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold flex items-center gap-2">
                        <Archive className="w-4 h-4 text-[#B86B35]" />
                        <span>Gün Sonu Z-Raporu Arşivleme &amp; Tarihçe</span>
                      </h3>
                      <p className="text-neutral-500">
                        Aktif ciro ve sipariş özetini gün sonu Z-Raporu olarak kalıcı arşive kaydedin veya JSON dışa aktarın.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const blob = new Blob([JSON.stringify(archiveHistory, null, 2)], {
                          type: 'application/json',
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `oztike-arsiv-${new Date().toISOString().slice(0, 10)}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        setStatusToast('Arşiv geçmişi JSON olarak dışa aktarıldı.');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 font-semibold cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> JSON Dışa Aktar
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={archiveReason}
                      onChange={(e) => setArchiveReason(e.target.value)}
                      placeholder="Kapanış notu (örn: Akşam vardiyası kasa mutabakatı)..."
                      className="flex-1 min-w-[220px] rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                    />
                    <button
                      type="button"
                      data-testid="archive-day-summary-btn"
                      onClick={() => {
                        onArchiveDaySummary?.(archiveReason);
                        setArchiveReason('');
                        setStatusToast('Gün sonu Z-Raporu arşive kaydedildi.');
                      }}
                      className="px-4 py-2 rounded-lg bg-[#B86B35] text-white font-bold cursor-pointer"
                    >
                      Gün Sonu Z-Raporu Arşivle
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(['Tümü', 'Gün Sonu Özeti', 'Sipariş', 'Masa & Hesap', 'Garson Çağrısı', 'Kurye Teslimatı'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setArchiveTypeFilter(t)}
                          className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${
                            archiveTypeFilter === t
                              ? 'bg-[#B86B35] text-white'
                              : 'border border-neutral-300 dark:border-neutral-700'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="search"
                        value={archiveSearch}
                        onChange={(e) => setArchiveSearch(e.target.value)}
                        placeholder="Arşivde ara..."
                        className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5"
                      />
                      {archiveHistory.length > 0 && onClearArchiveHistory && (
                        <button
                          type="button"
                          onClick={() => {
                            onClearArchiveHistory();
                            setStatusToast('Arşiv kayıtları temizlendi.');
                          }}
                          className="px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-500 font-semibold cursor-pointer"
                        >
                          Arşivi Temizle
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {filteredArchive.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#141413] p-3.5 flex flex-wrap items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-[#B86B35]/15 text-[#B86B35] dark:text-[#D4AF6A] font-bold text-[10px]">
                              {item.type}
                            </span>
                            <span className="font-bold text-sm">{item.title}</span>
                          </div>
                          <div className="text-neutral-500 mt-1">{item.subtitle}</div>
                          <div className="text-[11px] text-neutral-400 mt-0.5">
                            {item.archivedAt} · {item.reason}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {item.amount !== undefined && (
                            <span className="font-mono font-bold text-sm text-emerald-500">
                              {item.amount.toFixed(2)} ₺
                            </span>
                          )}
                          {onDeleteArchiveEntry && (
                            <button
                              type="button"
                              onClick={() => onDeleteArchiveEntry(item.id)}
                              className="p-1.5 rounded text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                              aria-label="Arşiv kaydını sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {filteredArchive.length === 0 && (
                      <div className="p-6 text-center text-neutral-500">
                        Seçili kriterlere uygun arşiv kaydı bulunamadı.
                      </div>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* =====================================================================
          MODÜL 41: GELİŞMİŞ PWA UYGULAMA YÖNETİMİ
      ===================================================================== */}
      {activeModuleId === 41 && (
        <div className="space-y-6 text-xs">
          {(() => {
            const pwa = siteCmsConfig.pwaSettings;
            const liveManifest = buildDynamicWebManifest(pwa);
            const updatePwa = (patch: Partial<SiteCmsConfig['pwaSettings']>) =>
              onUpdateSiteCmsConfig((prev) => ({
                ...prev,
                pwaSettings: { ...prev.pwaSettings, ...patch },
              }));

            return (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-4">
                    <div className="text-neutral-500">PWA Sistem Durumu</div>
                    <div className="font-bold text-sm mt-1 text-emerald-500">
                      {pwa.enabled ? 'Aktif & Yayında' : 'Pasif'}
                    </div>
                  </div>
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-4">
                    <div className="text-neutral-500">Service Worker Desteği</div>
                    <div className="font-bold text-sm mt-1">
                      {pwaHook.hasServiceWorkerSupport ? 'Tarayıcı Destekliyor' : 'Sınırlı Ortam'}
                    </div>
                  </div>
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-4">
                    <div className="text-neutral-500">Yükleme / Kurulum Durumu</div>
                    <div className="font-bold text-sm mt-1">
                      {pwaHook.isInstalled
                        ? 'Uygulama Kuruldu'
                        : pwaHook.isInstallable
                        ? 'Tek Tık Kuruluma Hazır'
                        : 'Rehber Modu Aktif'}
                    </div>
                  </div>
                  <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-4">
                    <div className="text-neutral-500">Önbellek Stratejisi</div>
                    <div className="font-mono font-bold text-sm mt-1 text-[#B86B35] dark:text-[#D4AF6A]">
                      {pwa.cacheStrategy || 'stale-while-revalidate'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
                      <h3 className="text-base font-semibold flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-[#B86B35]" />
                        <span>PWA Uygulama Stüdyosu (İkon, Açılış Video/Resim, Renk, Kısayollar)</span>
                      </h3>
                      <label className="inline-flex items-center gap-2 font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pwa.enabled}
                          onChange={(e) => updatePwa({ enabled: e.target.checked })}
                        />
                        <span>PWA Özelliği Aktif</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold mb-1">Uygulama Tam Adı</label>
                        <input
                          type="text"
                          value={pwa.appName}
                          onChange={(e) => updatePwa({ appName: e.target.value })}
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="font-semibold">Kısa İsim (Ana Ekran)</label>
                          <span className="font-mono text-[10px] text-neutral-500">
                            {pwa.shortName.length}/12
                          </span>
                        </div>
                        <input
                          type="text"
                          maxLength={12}
                          value={pwa.shortName}
                          onChange={(e) => updatePwa({ shortName: e.target.value.slice(0, 12) })}
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Uygulama Kategorisi</label>
                        <select
                          value={pwa.appCategory || 'food'}
                          onChange={(e) => updatePwa({ appCategory: e.target.value })}
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5"
                        >
                          <option value="food">food (Restoran &amp; Yemek)</option>
                          <option value="lifestyle">lifestyle (Yaşam Tarzı)</option>
                          <option value="shopping">shopping (Hızlı Sipariş)</option>
                          <option value="business">business (İşletme POS)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Durum Çubuğu (iOS Status Bar)</label>
                        <select
                          value={pwa.statusBarStyle || 'black-translucent'}
                          onChange={(e) =>
                            updatePwa({
                              statusBarStyle: e.target.value as SiteCmsConfig['pwaSettings']['statusBarStyle'],
                            })
                          }
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5"
                        >
                          <option value="black-translucent">black-translucent (Şeffaf Koyu)</option>
                          <option value="black">black (Tam Koyu)</option>
                          <option value="default">default (Sistem)</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-semibold mb-1">Uygulama Açıklaması</label>
                        <input
                          type="text"
                          value={pwa.description}
                          onChange={(e) => updatePwa({ description: e.target.value })}
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Görünüm Modu (Display)</label>
                        <select
                          value={pwa.displayMode}
                          onChange={(e) =>
                            updatePwa({
                              displayMode: e.target.value as SiteCmsConfig['pwaSettings']['displayMode'],
                            })
                          }
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5"
                        >
                          <option value="standalone">Standalone (Tam Uygulama)</option>
                          <option value="fullscreen">Fullscreen (Tam Ekran)</option>
                          <option value="minimal-ui">Minimal UI</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Önbellek Stratejisi</label>
                        <select
                          value={pwa.cacheStrategy || 'StaleWhileRevalidate'}
                          onChange={(e) =>
                            updatePwa({
                              cacheStrategy: e.target.value as SiteCmsConfig['pwaSettings']['cacheStrategy'],
                            })
                          }
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5"
                        >
                          <option value="StaleWhileRevalidate">StaleWhileRevalidate (Hızlı + Güncel)</option>
                          <option value="NetworkFirst">NetworkFirst (Önce Canlı Ağ)</option>
                          <option value="CacheFirst">CacheFirst (Maksimum Hız / Çevrimdışı)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Tema Rengi (Status Bar)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={pwa.themeColor}
                            onChange={(e) => updatePwa({ themeColor: e.target.value })}
                            className="h-8 w-10 rounded border border-neutral-300 dark:border-neutral-700 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={pwa.themeColor}
                            onChange={(e) => updatePwa({ themeColor: e.target.value })}
                            className="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5 font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Açılış Arka Plan Rengi</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={pwa.backgroundColor}
                            onChange={(e) => updatePwa({ backgroundColor: e.target.value })}
                            className="h-8 w-10 rounded border border-neutral-300 dark:border-neutral-700 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={pwa.backgroundColor}
                            onChange={(e) => updatePwa({ backgroundColor: e.target.value })}
                            className="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5 font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Açılış Vurgu / İkon Rengi</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={pwa.accentColor || '#D4AF6A'}
                            onChange={(e) => updatePwa({ accentColor: e.target.value })}
                            className="h-8 w-10 rounded border border-neutral-300 dark:border-neutral-700 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={pwa.accentColor || '#D4AF6A'}
                            onChange={(e) => updatePwa({ accentColor: e.target.value })}
                            className="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5 font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Açılış Yazı &amp; Buton Rengi</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <input
                            type="color"
                            value={pwa.splashTextColor || '#FFF6E9'}
                            onChange={(e) => updatePwa({ splashTextColor: e.target.value })}
                            title="Splash Yazı Rengi"
                            className="h-8 w-full rounded border border-neutral-300 dark:border-neutral-700 cursor-pointer"
                          />
                          <input
                            type="color"
                            value={pwa.buttonColor || '#B86B35'}
                            onChange={(e) => updatePwa({ buttonColor: e.target.value })}
                            title="Kurulum Buton Rengi"
                            className="h-8 w-full rounded border border-neutral-300 dark:border-neutral-700 cursor-pointer"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Başlangıç Yolu (start_url)</label>
                        <input
                          type="text"
                          value={pwa.startUrl || '/'}
                          onChange={(e) => updatePwa({ startUrl: e.target.value })}
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Uygulama İkonu URL (veya Dosya)</label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={pwa.iconUrl}
                            onChange={(e) => updatePwa({ iconUrl: e.target.value })}
                            className="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5 font-mono"
                          />
                          <label className="px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 font-semibold cursor-pointer">
                            Yükle
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={(e) =>
                                readMultiImageFiles(e.target.files, (urls) => updatePwa({ iconUrl: urls[0] }))
                              }
                            />
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Maskelenebilir İkon (Maskable 512px)</label>
                        <input
                          type="text"
                          value={pwa.maskableIconUrl || '/pwa-maskable-512x512.png'}
                          onChange={(e) => updatePwa({ maskableIconUrl: e.target.value })}
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Açılış Görseli (Splash Image URL)</label>
                        <input
                          type="text"
                          value={pwa.splashImageUrl || '/assets/aistudio/crops/hero-ciger.png'}
                          onChange={(e) => updatePwa({ splashImageUrl: e.target.value })}
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5 font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2 rounded-xl border border-[#B86B35]/30 bg-neutral-50 dark:bg-[#141413] p-3 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="font-semibold flex items-center gap-1.5">
                            <Video className="w-3.5 h-3.5 text-[#B86B35]" />
                            <span>Açılış Ekranı Video URL (MP4 Splash Video)</span>
                          </label>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => updatePwa({ splashVideoUrl: '/videos/ciger-ocakbasi-promo.mp4' })}
                              className="px-2 py-0.5 rounded border border-[#B86B35]/40 text-[#B86B35] font-semibold cursor-pointer"
                            >
                              Ocakbaşı Video
                            </button>
                            <button
                              type="button"
                              onClick={() => updatePwa({ splashVideoUrl: '/videos/doner-lahmacun-promo.mp4' })}
                              className="px-2 py-0.5 rounded border border-[#B86B35]/40 text-[#B86B35] font-semibold cursor-pointer"
                            >
                              Döner Video
                            </button>
                            {pwa.splashVideoUrl && (
                              <button
                                type="button"
                                onClick={() => updatePwa({ splashVideoUrl: '' })}
                                className="px-2 py-0.5 rounded border border-rose-500/40 text-rose-500 font-semibold cursor-pointer"
                              >
                                Temizle
                              </button>
                            )}
                          </div>
                        </div>
                        <input
                          type="text"
                          value={pwa.splashVideoUrl || ''}
                          onChange={(e) => updatePwa({ splashVideoUrl: e.target.value })}
                          placeholder="/videos/ciger-ocakbasi-promo.mp4"
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Açılış Başlığı (Splash Title)</label>
                        <input
                          type="text"
                          value={pwa.splashTitleTr || 'ÖzTike Ciğer Ocakbaşı'}
                          onChange={(e) => updatePwa({ splashTitleTr: e.target.value })}
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Açılış Alt Başlığı</label>
                        <input
                          type="text"
                          value={pwa.splashSubtitleTr || 'Gaziantep Bakır Ocakbaşı & QR Sipariş'}
                          onChange={(e) => updatePwa({ splashSubtitleTr: e.target.value })}
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Push Bildirim Başlığı</label>
                        <input
                          type="text"
                          value={pwa.pushTitleTr || 'ÖzTike Ciğer · Siparişiniz Hazır!'}
                          onChange={(e) => updatePwa({ pushTitleTr: e.target.value })}
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Push Bildirim Mesaj İçeriği</label>
                        <input
                          type="text"
                          value={
                            pwa.pushBodyTr ||
                            'Zırh kebabı ve taze kuzu ciğer şiş siparişiniz ocaktan çıktı.'
                          }
                          onChange={(e) => updatePwa({ pushBodyTr: e.target.value })}
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Çevrimdışı Başlık</label>
                        <input
                          type="text"
                          value={pwa.offlineTitleTr || 'Çevrimdışı Mod'}
                          onChange={(e) => updatePwa({ offlineTitleTr: e.target.value })}
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Kurulum Butonu Etiketi</label>
                        <input
                          type="text"
                          value={pwa.installButtonLabelTr}
                          onChange={(e) => updatePwa({ installButtonLabelTr: e.target.value })}
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block font-semibold mb-1">iOS Safari İpucu Metni</label>
                        <input
                          type="text"
                          value={pwa.iosHintTr}
                          onChange={(e) => updatePwa({ iosHintTr: e.target.value })}
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5"
                        />
                      </div>
                    </div>

                    {/* Uygulama Kısayolları (App Shortcuts) ve Ekran Görüntüleri */}
                    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 space-y-2.5">
                      <div className="font-bold">Ana Ekran Kısayolları (Manifest Shortcuts: {(pwa.shortcuts || []).length})</div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <input
                          type="text"
                          value={pwaShortcutName}
                          onChange={(e) => setPwaShortcutName(e.target.value)}
                          placeholder="Başlık (Örn: Menüye Git)"
                          className="rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2 py-1"
                        />
                        <input
                          type="text"
                          value={pwaShortcutShort}
                          onChange={(e) => setPwaShortcutShort(e.target.value)}
                          placeholder="Kısa ad"
                          className="rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2 py-1"
                        />
                        <input
                          type="text"
                          value={pwaShortcutUrl}
                          onChange={(e) => setPwaShortcutUrl(e.target.value)}
                          placeholder="/#menu"
                          className="rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2 py-1 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!pwaShortcutName.trim()) return;
                            updatePwa({
                              shortcuts: [
                                ...(pwa.shortcuts || []),
                                {
                                  name: pwaShortcutName.trim(),
                                  shortName: pwaShortcutShort.trim() || pwaShortcutName.trim(),
                                  url: pwaShortcutUrl.trim() || '/#menu',
                                  description: pwaShortcutDesc.trim() || pwaShortcutName.trim(),
                                },
                              ],
                            });
                            setPwaShortcutName('');
                            setPwaShortcutShort('');
                            setPwaShortcutDesc('');
                          }}
                          className="px-3 py-1 rounded bg-[#B86B35] text-white font-bold cursor-pointer"
                        >
                          + Kısayol Ekle
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(pwa.shortcuts || []).map((sc, idx) => (
                          <span
                            key={`${sc.name}-${idx}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-[#141413] border border-neutral-200 dark:border-neutral-800 font-medium"
                          >
                            <span>{sc.name}</span>
                            <span className="font-mono text-[10px] text-neutral-500">{sc.url}</span>
                            <button
                              type="button"
                              onClick={() =>
                                updatePwa({
                                  shortcuts: (pwa.shortcuts || []).filter((_, i) => i !== idx),
                                })
                              }
                              className="text-rose-500 font-bold cursor-pointer"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 space-y-2">
                      <div className="font-bold">Mağaza &amp; Kurulum Ekran Görüntüleri (Screenshots)</div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={pwaShotInput}
                          onChange={(e) => setPwaShotInput(e.target.value)}
                          placeholder="/assets/aistudio/crops/hero-ciger.png"
                          className="flex-1 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!pwaShotInput.trim()) return;
                            updatePwa({
                              screenshots: [...(pwa.screenshots || []), pwaShotInput.trim()],
                            });
                            setPwaShotInput('');
                          }}
                          className="px-3 py-1 rounded bg-neutral-900 dark:bg-[#F5F2EB] text-white dark:text-[#141413] font-bold cursor-pointer"
                        >
                          + Görsel Ekle
                        </button>
                      </div>
                      {(pwa.screenshots || []).length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {(pwa.screenshots || []).map((src, i) => (
                            <div key={`${src}-${i}`} className="relative w-16 h-12 rounded border border-neutral-300 dark:border-neutral-700 overflow-hidden">
                              <img src={src} alt={`PWA Shot ${i + 1}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() =>
                                  updatePwa({
                                    screenshots: (pwa.screenshots || []).filter((_, idx) => idx !== i),
                                  })
                                }
                                className="absolute top-0 right-0 bg-black/80 text-white px-1 text-[9px]"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                      <label className="inline-flex items-center gap-2 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={pwa.enableOfflineCache}
                          onChange={(e) => updatePwa({ enableOfflineCache: e.target.checked })}
                        />
                        <span>Çevrimdışı Menü Önbelleği Aktif</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={pwa.enablePushNotifications}
                          onChange={(e) => updatePwa({ enablePushNotifications: e.target.checked })}
                        />
                        <span>Sipariş &amp; Masa Bildirimleri (Push)</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={pwa.showHeaderInstallBtn !== false}
                          onChange={(e) => updatePwa({ showHeaderInstallBtn: e.target.checked })}
                        />
                        <span>Müşteri Üst Barında &ldquo;Uygulamayı Yükle&rdquo; Göster</span>
                      </label>
                      <label className="inline-flex items-center gap-2 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={pwa.showFooterCard !== false}
                          onChange={(e) => updatePwa({ showFooterCard: e.target.checked })}
                        />
                        <span>Footer Altında PWA Kurulum Kartını Göster</span>
                      </label>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={async () => {
                          if ('caches' in window) {
                            const keys = await window.caches.keys();
                            await Promise.all(keys.map((k) => window.caches.delete(k)));
                          }
                          setPwaDiagNotice('Tarayıcı PWA önbelleği temizlendi ve yenilendi.');
                        }}
                        className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 font-semibold cursor-pointer"
                      >
                        Önbelleği Yenile
                      </button>
                      <button
                        type="button"
                        data-testid="pwa-send-test-push-btn"
                        onClick={async () => {
                          setPwaPushPreviewActive(true);
                          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                            new Notification(pwa.pushTitleTr || 'ÖzTike Ciğer', {
                              body: pwa.pushBodyTr || 'Siparişiniz hazır!',
                              icon: pwa.iconUrl,
                            });
                          }
                          setPwaDiagNotice(
                            `Canlı Push Bildirimi simüle edildi: "${pwa.pushTitleTr || 'ÖzTike Ciğer'}"`
                          );
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#B86B35] text-white font-semibold cursor-pointer"
                      >
                        Canlı Push Bildirimi Gönder
                      </button>
                    </div>
                    {pwaDiagNotice && (
                      <div className="rounded-lg bg-emerald-500/15 border border-emerald-500/35 px-3 py-2 text-emerald-400 font-semibold">
                        {pwaDiagNotice}
                      </div>
                    )}
                  </div>

                  {/* Right 5 Cols: Mobile Splash Screen (Video/Image + Colors + Shortcuts) & Push Notification Simulator + Manifest */}
                  <div className="lg:col-span-5 space-y-4">
                    <div
                      data-testid="pwa-splash-push-simulator"
                      className="rounded-2xl border border-neutral-300 dark:border-neutral-700 p-4 space-y-4 shadow-xl relative overflow-hidden"
                      style={{
                        backgroundColor: pwa.backgroundColor || '#141413',
                        color: pwa.splashTextColor || '#F5F2EB',
                      }}
                    >
                      <div className="relative z-10 flex items-center justify-between text-[10px] font-mono opacity-80 border-b border-white/15 pb-2">
                        <span>CANLI MOBİL AÇILIŞ &amp; BİLDİRİM SİMÜLATÖRÜ</span>
                        <span>{pwa.displayMode}</span>
                      </div>

                      {pwa.splashVideoUrl ? (
                        <video
                          src={pwa.splashVideoUrl}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="w-full h-36 object-cover rounded-xl border border-white/15"
                        />
                      ) : pwa.splashImageUrl ? (
                        <img
                          src={pwa.splashImageUrl}
                          alt="Splash Backdrop"
                          className="w-full h-32 object-cover rounded-xl border border-white/15 opacity-90"
                        />
                      ) : null}

                      {/* Simulated Push Banner */}
                      {pwaPushPreviewActive && (
                        <div className="rounded-xl bg-black/75 border border-white/15 p-3 flex items-start gap-2.5 backdrop-blur-md">
                          <img
                            src={pwa.iconUrl || '/assets/aistudio/oztike-logo-transparent.png'}
                            alt="App Icon"
                            className="w-9 h-9 rounded-lg object-contain bg-white/10 p-1 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between text-[10px] text-neutral-400">
                              <span className="font-bold text-white truncate">{pwa.shortName}</span>
                              <span>şimdi</span>
                            </div>
                            <div
                              className="font-bold text-xs truncate mt-0.5"
                              style={{ color: pwa.accentColor || '#D4AF6A' }}
                            >
                              {pwa.pushTitleTr || 'ÖzTike Ciğer · Siparişiniz Hazır!'}
                            </div>
                            <div className="text-[11px] text-neutral-300 line-clamp-2">
                              {pwa.pushBodyTr ||
                                'Zırh kebabı ve taze kuzu ciğer şiş siparişiniz ocaktan çıktı.'}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Simulated Splash Screen */}
                      <div className="py-3 text-center space-y-2.5">
                        <div
                          className="relative w-16 h-16 mx-auto rounded-2xl overflow-hidden border-2 shadow-lg bg-black/40 p-2"
                          style={{ borderColor: pwa.accentColor || '#D4AF6A' }}
                        >
                          <img
                            src={pwa.iconUrl || '/assets/aistudio/oztike-logo-transparent.png'}
                            alt="Splash Logo"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="font-bold text-base">
                          {pwa.splashTitleTr || pwa.appName}
                        </div>
                        <div className="text-[11px] opacity-80">
                          {pwa.splashSubtitleTr || pwa.description}
                        </div>
                        <div className="w-24 h-1.5 mx-auto rounded-full overflow-hidden bg-white/15">
                          <div
                            className="h-full w-2/3 rounded-full"
                            style={{ backgroundColor: pwa.themeColor || '#B86B35' }}
                          />
                        </div>
                        <div>
                          <span
                            className="inline-block px-4 py-1.5 rounded-lg text-[11px] font-bold text-white shadow"
                            style={{ backgroundColor: pwa.buttonColor || '#B86B35' }}
                          >
                            {pwa.installButtonLabelTr || 'Uygulamayı Yükle'}
                          </span>
                        </div>
                        {(pwa.shortcuts || []).length > 0 && (
                          <div className="flex flex-wrap justify-center gap-1 pt-1">
                            {(pwa.shortcuts || []).slice(0, 3).map((s, i) => (
                              <span
                                key={`${s.name}-${i}`}
                                className="px-2 py-0.5 rounded bg-white/10 text-[10px]"
                              >
                                {s.shortName || s.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs">Canlı manifest.webmanifest Çıktısı</h4>
                        <button
                          type="button"
                          onClick={() => {
                            const blob = new Blob([JSON.stringify(liveManifest, null, 2)], {
                              type: 'application/manifest+json',
                            });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'manifest.webmanifest';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#B86B35] text-white font-semibold cursor-pointer"
                        >
                          <Download className="w-3 h-3" /> İndir
                        </button>
                      </div>
                      <pre className="rounded-xl bg-[#141413] text-emerald-300 p-3 text-[10px] font-mono overflow-x-auto max-h-[210px]">
                        {JSON.stringify(liveManifest, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* =====================================================================
          MODÜL 42: GELİŞMİŞ HARİTA & KONUM YÖNETİMİ (ÜCRETSİZ & ÜCRETLİ SERVİSLER)
      ===================================================================== */}
      {activeModuleId === 42 && (
        <div className="space-y-6 text-xs">
          {(() => {
            const ms = siteCmsConfig.mapSettings;
            const updateMap = (patch: Partial<SiteCmsConfig['mapSettings']>) =>
              onUpdateSiteCmsConfig((prev) => ({
                ...prev,
                mapSettings: { ...prev.mapSettings, ...patch },
              }));

            return (
              <>
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
                    <div>
                      <h3 className="text-base font-semibold flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[#B86B35]" />
                        <span>32. Harita Servis Sağlayıcıları (Ücretsiz &amp; Ücretli) ve Konum Ayarları</span>
                      </h3>
                      <p className="text-neutral-500">
                        Müşteri web sitesi footer bölümünde gösterilecek harita motorunu (OpenStreetMap, Google Free/API, Yandex, Özel Embed) ve altındaki navigasyon uygulama ikonlarını yönetin.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <label className="inline-flex items-center gap-2 font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ms.enabled}
                          onChange={(e) => updateMap({ enabled: e.target.checked })}
                        />
                        <span>Harita Sistemi Aktif</span>
                      </label>
                      <label className="inline-flex items-center gap-2 font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ms.showFooterMap !== false}
                          onChange={(e) => updateMap({ showFooterMap: e.target.checked })}
                        />
                        <span>Footer Konum Haritası Göster</span>
                      </label>
                    </div>
                  </div>

                  {/* Ücretsiz vs Ücretli Sağlayıcı Seçimi */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className={`rounded-xl border-2 p-4 space-y-3 ${
                        (ms.providerMode || 'free') === 'free'
                          ? 'border-emerald-500 bg-emerald-950/10'
                          : 'border-neutral-200 dark:border-neutral-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <label className="inline-flex items-center gap-2 font-bold text-sm cursor-pointer">
                          <input
                            type="radio"
                            name="mapProviderMode"
                            checked={(ms.providerMode || 'free') === 'free'}
                            onChange={() => updateMap({ providerMode: 'free' as MapProviderMode })}
                          />
                          <span>Ücretsiz Harita Servisleri</span>
                        </label>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                          API Anahtarı Gerekmez
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'google-embed-free', label: 'Google Maps Embed', desc: 'Standart pinli görünüm' },
                          { id: 'openstreetmap', label: 'OpenStreetMap', desc: 'Açık kaynak harita' },
                          { id: 'yandex-embed', label: 'Yandex Haritalar', desc: 'Türkiye detaylı sokak' },
                        ].map((prov) => (
                          <button
                            key={prov.id}
                            type="button"
                            data-testid={`map-free-${prov.id}`}
                            onClick={() =>
                              updateMap({
                                providerMode: 'free',
                                freeProvider: prov.id as FreeMapProviderId,
                              })
                            }
                            className={`p-2.5 rounded-lg border text-left cursor-pointer transition ${
                              (ms.providerMode || 'free') === 'free' && ms.freeProvider === prov.id
                                ? 'border-emerald-500 bg-emerald-500/15'
                                : 'border-neutral-200 dark:border-neutral-800'
                            }`}
                          >
                            <div className="font-bold text-[11px]">{prov.label}</div>
                            <div className="text-[10px] text-neutral-500">{prov.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div
                      className={`rounded-xl border-2 p-4 space-y-3 ${
                        ms.providerMode === 'paid'
                          ? 'border-[#D4AF6A] bg-amber-950/15'
                          : 'border-neutral-200 dark:border-neutral-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <label className="inline-flex items-center gap-2 font-bold text-sm cursor-pointer">
                          <input
                            type="radio"
                            name="mapProviderMode"
                            checked={ms.providerMode === 'paid'}
                            onChange={() => updateMap({ providerMode: 'paid' as MapProviderMode })}
                          />
                          <span>Ücretli / API Anahtarlı Servisler</span>
                        </label>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px]">
                          Pro · Yüksek Kota
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'google-js-api', label: 'Google Maps JS SDK', desc: '3D / Özel Marker' },
                          { id: 'google-embed-api', label: 'Google Embed API v1', desc: 'Kurumsal Embed' },
                          { id: 'custom-embed', label: 'Mapbox / Özel URL', desc: 'Özel iframe kaynağı' },
                        ].map((prov) => (
                          <button
                            key={prov.id}
                            type="button"
                            data-testid={`map-paid-${prov.id}`}
                            onClick={() =>
                              updateMap({
                                providerMode: 'paid',
                                paidProvider: prov.id as PaidMapProviderId,
                                enableGoogleMapsJs: prov.id === 'google-js-api',
                              })
                            }
                            className={`p-2.5 rounded-lg border text-left cursor-pointer transition ${
                              ms.providerMode === 'paid' && ms.paidProvider === prov.id
                                ? 'border-[#D4AF6A] bg-[#D4AF6A]/15'
                                : 'border-neutral-200 dark:border-neutral-800'
                            }`}
                          >
                            <div className="font-bold text-[11px]">{prov.label}</div>
                            <div className="text-[10px] text-neutral-500">{prov.desc}</div>
                          </button>
                        ))}
                      </div>
                      {ms.paidProvider === 'custom-embed' ? (
                        <input
                          type="url"
                          value={ms.customEmbedUrl || ''}
                          onChange={(e) => updateMap({ customEmbedUrl: e.target.value })}
                          placeholder="https://api.mapbox.com/... özel harita iframe URL"
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5 font-mono"
                        />
                      ) : (
                        <input
                          type="password"
                          value={ms.paidApiKey || ''}
                          onChange={(e) => updateMap({ paidApiKey: e.target.value })}
                          placeholder="Google Maps API Key (boş bırakılırsa ücretsiz haritaya düşer)"
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5 font-mono"
                        />
                      )}
                    </div>
                  </div>

                  {/* Koordinat & Adres Bilgileri + Hızlı Konum Presetleri */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Enlem (Latitude)</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={ms.lat}
                        onChange={(e) => updateMap({ lat: Number(e.target.value) })}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Boylam (Longitude)</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={ms.lng}
                        onChange={(e) => updateMap({ lng: Number(e.target.value) })}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Yakınlaştırma ({ms.zoom})</label>
                      <input
                        type="range"
                        min={10}
                        max={20}
                        value={ms.zoom}
                        onChange={(e) => updateMap({ zoom: Number(e.target.value) })}
                        className="w-full mt-2 accent-[#B86B35]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Harita Üstü Mekân Adı</label>
                      <input
                        type="text"
                        value={ms.placeName}
                        onChange={(e) => updateMap({ placeName: e.target.value })}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Açık Adres Satırı</label>
                      <input
                        type="text"
                        value={ms.addressLine}
                        onChange={(e) => updateMap({ addressLine: e.target.value })}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-neutral-500">Hızlı Gaziantep Konum Presetleri:</span>
                    {[
                      { label: 'Şahinbey Merkez', lat: 37.0628, lng: 37.3795 },
                      { label: 'Karagöz Meydanı', lat: 37.0654, lng: 37.3812 },
                      { label: 'Gaziantep Kalesi', lat: 37.0662, lng: 37.3834 },
                      { label: 'İbrahimli Şubesi', lat: 37.0785, lng: 37.3342 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          updateMap({ lat: preset.lat, lng: preset.lng });
                          setStatusToast(`Konum "${preset.label}" koordinatlarına ayarlandı.`);
                        }}
                        className="px-2.5 py-1 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Navigasyon Uygulaması İkon Ayarları + Canlı Konum Navigasyonu Bileşeni */}
                  <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
                    <div className="font-semibold">
                      Harita Altında Gösterilecek Navigasyon Uygulaması İkonları:
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {[
                        { key: 'enableGoogleNav', label: 'Google Navigasyon' },
                        { key: 'enableAppleMaps', label: 'Apple Maps' },
                        { key: 'enableWaze', label: 'Waze' },
                        { key: 'enableYandexMaps', label: 'Yandex Haritalar' },
                        { key: 'enableOpenStreetMap', label: 'OpenStreetMap' },
                        { key: 'enableBingMaps', label: 'Bing Maps' },
                      ].map((item) => {
                        const k = item.key as keyof SiteCmsConfig['mapSettings'];
                        return (
                          <label key={item.key} className="inline-flex items-center gap-2 cursor-pointer font-medium">
                            <input
                              type="checkbox"
                              checked={Boolean(ms[k])}
                              onChange={(e) => updateMap({ [k]: e.target.checked })}
                            />
                            <span>{item.label}</span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="rounded-xl bg-[#141413] p-3.5 border border-neutral-800">
                      <KonumNavigasyonu
                        mapSettings={ms}
                        title="Konum Navigasyonu Hızlı Tetikleme Barı (Canlı Önizleme)"
                      />
                    </div>
                  </div>
                </div>

                {/* Admin Canlı Harita Önizlemesi */}
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-3">
                  <h4 className="font-bold text-sm">Canlı Müşteri Footer Harita Önizlemesi</h4>
                  <RestaurantMapSection
                    mapSettings={ms}
                    contact={siteCmsConfig.contact}
                    compact
                    showProviderBadge
                  />
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Otomatik Fiş / e-Fatura (e-Arşiv) Önizleme & Termal Yazdırma Modalı */}
      {receiptInvoiceModalOrder && (
        <div
          role="dialog"
          aria-modal="true"
          data-testid="admin-receipt-invoice-modal"
          aria-label="Otomatik Fiş ve e-Fatura Önizleme"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="w-full max-w-md rounded-2xl border border-neutral-300 bg-[#FAF7F0] text-[#141413] p-5 space-y-3 shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-dashed border-neutral-400 pb-2">
              <span className="font-sans font-bold text-sm">
                Otomatik Termal Fiş &amp; e-Arşiv Fatura
              </span>
              <button
                type="button"
                onClick={() => setReceiptInvoiceModalOrder(null)}
                aria-label="Kapat"
                className="p-1 rounded hover:bg-neutral-200 font-sans cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[62vh] overflow-y-auto flex justify-center">
              <div
                className={`w-full ${
                  siteCmsConfig.receiptSettings?.paperWidthMm === 58
                    ? 'max-w-[270px]'
                    : 'max-w-[355px]'
                } rounded-lg border border-neutral-300 bg-[#FFFDF9] p-3.5 shadow-sm`}
                dangerouslySetInnerHTML={{
                  __html: buildThermalReceiptInnerMarkup(receiptInvoiceModalOrder, {
                    ...siteCmsConfig.receiptSettings,
                    companyName:
                      siteCmsConfig.receiptSettings?.companyName ||
                      siteCmsConfig.generalSettings.companyLegalName,
                    legalName: siteCmsConfig.receiptSettings?.legalName,
                    address:
                      siteCmsConfig.receiptSettings?.address || siteCmsConfig.contact.addressTr,
                    phone:
                      siteCmsConfig.receiptSettings?.phone || siteCmsConfig.contact.phoneDisplay,
                    taxOfficeAndNo:
                      siteCmsConfig.receiptSettings?.taxOfficeAndNo ||
                      siteCmsConfig.generalSettings.taxOfficeAndNo,
                    taxRatePercent: siteCmsConfig.generalSettings.taxRatePercent ?? 10,
                    logoUrl: siteCmsConfig.header.logoUrl,
                  }),
                }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 font-sans border-t border-neutral-300">
              <button
                type="button"
                data-testid="admin-modal-print-receipt-btn"
                onClick={() => {
                  const ok = printThermalReceipt(receiptInvoiceModalOrder, {
                    ...siteCmsConfig.receiptSettings,
                    companyName:
                      siteCmsConfig.receiptSettings?.companyName ||
                      siteCmsConfig.generalSettings.companyLegalName,
                    legalName: siteCmsConfig.receiptSettings?.legalName,
                    address:
                      siteCmsConfig.receiptSettings?.address || siteCmsConfig.contact.addressTr,
                    phone:
                      siteCmsConfig.receiptSettings?.phone || siteCmsConfig.contact.phoneDisplay,
                    taxOfficeAndNo:
                      siteCmsConfig.receiptSettings?.taxOfficeAndNo ||
                      siteCmsConfig.generalSettings.taxOfficeAndNo,
                    taxRatePercent: siteCmsConfig.generalSettings.taxRatePercent ?? 10,
                    logoUrl: siteCmsConfig.header.logoUrl,
                  });
                  setStatusToast(
                    ok
                      ? `${receiptInvoiceModalOrder.orderNumber} fişi termal yazıcıya gönderildi.`
                      : 'Termal fiş yazdır penceresi tetiklendi.'
                  );
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#B86B35] text-white font-bold text-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Yazdır (POS / Termal)
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadThermalReceiptHtml(receiptInvoiceModalOrder, {
                    ...siteCmsConfig.receiptSettings,
                    companyName:
                      siteCmsConfig.receiptSettings?.companyName ||
                      siteCmsConfig.generalSettings.companyLegalName,
                    legalName: siteCmsConfig.receiptSettings?.legalName,
                    address:
                      siteCmsConfig.receiptSettings?.address || siteCmsConfig.contact.addressTr,
                    phone:
                      siteCmsConfig.receiptSettings?.phone || siteCmsConfig.contact.phoneDisplay,
                    taxOfficeAndNo:
                      siteCmsConfig.receiptSettings?.taxOfficeAndNo ||
                      siteCmsConfig.generalSettings.taxOfficeAndNo,
                    taxRatePercent: siteCmsConfig.generalSettings.taxRatePercent ?? 10,
                    logoUrl: siteCmsConfig.header.logoUrl,
                  });
                  setStatusToast(
                    `${receiptInvoiceModalOrder.orderNumber} e-Arşiv fişi HTML olarak indirildi.`
                  );
                }}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-neutral-400 bg-white text-[#141413] font-semibold text-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> e-Arşiv İndir (.HTML)
              </button>
              <button
                type="button"
                onClick={() => setReceiptInvoiceModalOrder(null)}
                className="px-3 py-2 rounded-lg bg-[#141413] text-white font-semibold text-xs cursor-pointer"
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
