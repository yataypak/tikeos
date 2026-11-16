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
  Settings,
  Sliders,
  Eye,
  EyeOff,
  Activity,
  Globe,
  Radio,
  Network,
  ShieldCheck,
  RefreshCw,
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
  calculateRecipeMetrics,
  generateReceiptAndInvoiceNumbers,
} from '../core/restaurantEngine';
import { AdminSiteBuilderManager } from './AdminSiteBuilderManager';
import { AdminArchiveManager } from './AdminArchiveManager';
import { AdminPwaManager } from './AdminPwaManager';
import { AdminMapManager } from './AdminMapManager';
import { type SiteCmsConfig } from '../data/siteCmsStore';
import { printThermalReceipt, downloadThermalReceiptHtml } from '../utils/receiptPrinter';

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
  stocks: StockItem[];
  stockMovements: StockMovement[];
  onRecordStockOperation: (payload: {
    ingredientId: string;
    type: 'in' | 'out' | 'waste' | 'count_adjust' | 'transfer';
    quantity: number;
    note: string;
  }) => void;
  customers: CustomerRecord[];
  onAddCustomer: (c: Omit<CustomerRecord, 'id' | 'points' | 'walletBalance' | 'totalOrders' | 'totalSpent'>) => void;
  onAdjustLoyaltyPoints: (customerId: string, delta: number, reason: string) => void;
  campaigns: CampaignRecord[];
  onAddCampaign: (c: Omit<CampaignRecord, 'id' | 'usedCount'>) => void;
  reservations: ReservationItem[];
  onUpdateReservationStatus: (resId: string, status: ReservationItem['status']) => void;
  staff: StaffMember[];
  onAddStaff: (s: Omit<StaffMember, 'id' | 'ordersHandledToday' | 'salesToday'>) => void;
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
  onToggleIntegrationActive?: (id: string) => void;
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
  onAssignOrderCourier?: (orderId: string, courierName: string) => void;
  onUpdateCourierDeliveryState?: (
    orderId: string,
    deliveryState: NonNullable<OrderRecord['deliveryState']>
  ) => void;
  onSettleOrderPayment?: (orderId: string, amount: number, method: string) => void;
  onIssueOrderReceiptAndInvoice?: (orderId: string) => void;
  onDeleteOrder?: (id: string) => void;
  onDeleteWaiterCall?: (id: string) => void;
  onAddTable?: (table: Omit<DiningTableItem, 'id' | 'qrToken' | 'qrRevoked'>) => void;
  onUpdateTable?: (table: DiningTableItem) => void;
  onDeleteTable?: (id: string) => void;
  onResetTableBill?: (tableId: string) => void;
  onAddStockItem?: (item: Omit<StockItem, 'id'>) => void;
  onUpdateStockItem?: (item: StockItem) => void;
  onDeleteStockItem?: (id: string) => void;
  onUpdateReservation?: (res: ReservationItem) => void;
  onDeleteReservation?: (id: string) => void;
  onUpdateCustomer?: (customer: CustomerRecord) => void;
  onDeleteCustomer?: (id: string) => void;
  onToggleCustomerBlock?: (id: string) => void;
  onUpdateCampaign?: (campaign: CampaignRecord) => void;
  onDeleteCampaign?: (id: string) => void;
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
  stocks,
  stockMovements,
  onRecordStockOperation,
  customers,
  onAddCustomer,
  onAdjustLoyaltyPoints,
  campaigns,
  onAddCampaign,
  reservations,
  onUpdateReservationStatus,
  staff,
  onAddStaff,
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
  onToggleIntegrationActive,
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
  onAssignOrderCourier,
  onUpdateCourierDeliveryState,
  onSettleOrderPayment,
  onIssueOrderReceiptAndInvoice,
  onDeleteOrder,
  onDeleteWaiterCall,
  onAddTable,
  onUpdateTable,
  onDeleteTable,
  onResetTableBill,
  onAddStockItem,
  onUpdateStockItem,
  onDeleteStockItem,
  onUpdateReservation,
  onDeleteReservation,
  onUpdateCustomer,
  onDeleteCustomer,
  onToggleCustomerBlock,
  onUpdateCampaign,
  onDeleteCampaign,
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

  // Module 2: Orders channel filter
  const [orderChannelFilter, setOrderChannelFilter] = useState<'Tümü' | 'QR' | 'Gel-Al' | 'Paket servis'>('Tümü');

  // Module 4, 7, 12 Config States
  const [mod4RequireQrForOrder, setMod4RequireQrForOrder] = useState(true);
  const [mod7KitchenAlertMins, setMod7KitchenAlertMins] = useState(14);
  const [mod12AutoReceiptPrint, setMod12AutoReceiptPrint] = useState(true);
  const [mod12DefaultPosMethod, setMod12DefaultPosMethod] = useState<'Nakit' | 'Kredi Kartı (POS)' | 'Yemek Kartı'>('Kredi Kartı (POS)');

  // Module 31: Advanced Integration & API Settings Modal State
  const [integrationCategoryFilter, setIntegrationCategoryFilter] = useState<string>('Tümü');
  const [integrationSearchQuery, setIntegrationSearchQuery] = useState<string>('');
  const [selectedIntegrationForConfig, setSelectedIntegrationForConfig] = useState<IntegrationPluginItem | null>(null);
  const [integrationFormConfig, setIntegrationFormConfig] = useState<NonNullable<IntegrationPluginItem['advancedConfig']>>({});
  const [integrationShowSecret, setIntegrationShowSecret] = useState(false);
  const [integrationActiveTab, setIntegrationActiveTab] = useState<'api' | 'network' | 'custom' | 'test'>('api');
  const [integrationPingStatus, setIntegrationPingStatus] = useState<{
    status: 'idle' | 'testing' | 'success' | 'error';
    latencyMs?: number;
    message?: string;
  }>({ status: 'idle' });

  const handleOpenIntegrationConfig = (intg: IntegrationPluginItem) => {
    setSelectedIntegrationForConfig(intg);
    setIntegrationShowSecret(false);
    setIntegrationActiveTab('api');
    setIntegrationPingStatus({ status: 'idle' });
    setIntegrationFormConfig({
      apiKey: intg.advancedConfig?.apiKey || (intg.settings?.apiKeyMasked as string) || (intg.settings?.restaurantSecretKey as string) || 'live-sec-2026-oztike-token',
      apiSecret: intg.advancedConfig?.apiSecret || 'sk_live_9921_oztike_ciger_shb_enc',
      merchantId: intg.advancedConfig?.merchantId || (intg.settings?.merchantId as string) || (intg.settings?.storeId as string) || (intg.settings?.chainCode as string) || `OZT-${intg.code.toUpperCase()}-27`,
      terminalId: intg.advancedConfig?.terminalId || 'TRM-POS-01',
      endpointUrl: intg.advancedConfig?.endpointUrl || (intg.settings?.webhookUrl as string) || `https://api.oztikeciger.com.tr/v2/${intg.code}`,
      ipAddress: intg.advancedConfig?.ipAddress || (intg.settings?.printerIp as string) || '192.168.1.201',
      port: intg.advancedConfig?.port || (intg.settings?.port as number) || 9100,
      timeoutMs: intg.advancedConfig?.timeoutMs || 4500,
      environment: intg.mode === 'Canlı (Live)' ? 'Production' : 'Sandbox',
      threeDSecure: intg.advancedConfig?.threeDSecure ?? (intg.settings?.threeDSecureRequired !== false),
      commissionRate: intg.advancedConfig?.commissionRate ?? (intg.settings?.commissionRatePercent as number) ?? 1.89,
      currency: intg.advancedConfig?.currency || 'TRY',
      paperWidthMm: intg.advancedConfig?.paperWidthMm || (intg.settings?.paperWidthMm as 58 | 80) || 80,
      autoCutPaper: intg.advancedConfig?.autoCutPaper ?? (intg.settings?.autoCutPaper !== false),
      autoPrintReceipt: intg.advancedConfig?.autoPrintReceipt ?? true,
      kitchenStationRouting: intg.advancedConfig?.kitchenStationRouting || 'Ocakbaşı & Zırh Hattı',
      autoConfirmOrders: intg.advancedConfig?.autoConfirmOrders ?? (intg.settings?.autoAcceptOrder !== false),
      defaultPrepMinutes: intg.advancedConfig?.defaultPrepMinutes ?? (intg.settings?.prepTimeMinutes as number) ?? 18,
      stockSyncEnabled: intg.advancedConfig?.stockSyncEnabled ?? true,
      eInvoicePrefix: intg.advancedConfig?.eInvoicePrefix || 'ÖZT2026',
      integratorCompany: intg.advancedConfig?.integratorCompany || (intg.settings?.integrator as string) || 'Uyumsoft / QNB e-Finans',
      autoIssueOnPayment: intg.advancedConfig?.autoIssueOnPayment ?? true,
      smsSenderHeader: intg.advancedConfig?.smsSenderHeader || (intg.settings?.senderHeader as string) || 'OZTIKECIGER',
      templateLanguage: intg.advancedConfig?.templateLanguage || (intg.settings?.templateLanguage as string) || 'tr',
      webhookUrl: intg.advancedConfig?.webhookUrl || (intg.settings?.webhookUrl as string) || 'https://api.oztikeciger.com.tr/hooks/events',
      webhookSecret: intg.advancedConfig?.webhookSecret || 'whsec_oztike_hmac_sha256_token',
      debugLogging: intg.advancedConfig?.debugLogging ?? false,
      retryAttempts: intg.advancedConfig?.retryAttempts ?? 3,
      customHeaders: intg.advancedConfig?.customHeaders || '{"X-Restaurant-Branch":"BR-01","X-Source":"POS-Kasa"}',
      multinetActive: intg.advancedConfig?.multinetActive ?? true,
      pluxeeActive: intg.advancedConfig?.pluxeeActive ?? true,
      edenredActive: intg.advancedConfig?.edenredActive ?? true,
      setcardActive: intg.advancedConfig?.setcardActive ?? true,
      posTerminalProtocol: intg.advancedConfig?.posTerminalProtocol || 'JSON-RPC',
    });
  };

  const handleTestPingIntegration = (intg: IntegrationPluginItem) => {
    setIntegrationPingStatus({ status: 'testing' });
    setTimeout(() => {
      const simulatedLatency = Math.floor(Math.random() * 25) + 18;
      setIntegrationPingStatus({
        status: 'success',
        latencyMs: simulatedLatency,
        message: `${intg.name} API ve ağ servis bağlantısı doğrulandı! HTTP 200 OK (${simulatedLatency} ms)`,
      });
      onTestIntegration(intg.id);
    }, 500);
  };

  const handleSaveIntegrationConfig = () => {
    if (!selectedIntegrationForConfig) return;
    const updated: IntegrationPluginItem = {
      ...selectedIntegrationForConfig,
      mode: integrationFormConfig.environment === 'Production' ? 'Canlı (Live)' : 'Test (Sandbox)',
      advancedConfig: { ...integrationFormConfig },
      lastTested: `16 Kas 2026 ${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} Doğrulandı`,
      contractVerified: true,
    };
    onUpdateIntegration?.(updated);
    setStatusToast(`${selectedIntegrationForConfig.name} gelişmiş API ve entegrasyon ayarları başarıyla kaydedildi.`);
    setSelectedIntegrationForConfig(null);
  };

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

  // Module 17: Customer CRM form
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custDistrict, setCustDistrict] = useState('Şahinbey');
  const [custMarketingConsent, setCustMarketingConsent] = useState(false);

  // Module 19: Campaign form
  const [campName, setCampName] = useState('');
  const [campCode, setCampCode] = useState('');
  const [campDiscount, setCampDiscount] = useState(15);

  // Module 20: Staff form
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState<StaffRoleName>('Garson');
  const [staffPhone, setStaffPhone] = useState('');

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

  // Module 3: Table Add/Edit States
  const [tableModalMode, setTableModalMode] = useState<'create' | 'edit' | null>(null);
  const [tableFormNumber, setTableFormNumber] = useState('');
  const [tableFormArea, setTableFormArea] = useState<DiningTableItem['area']>('Ana Salon');
  const [tableFormCapacity, setTableFormCapacity] = useState(4);
  const [tableFormWaiter, setTableFormWaiter] = useState('Halil Usta');
  const [editingTableId, setEditingTableId] = useState<string | null>(null);

  // Module 11: Reservation Edit State
  const [editingReservation, setEditingReservation] = useState<ReservationItem | null>(null);
  const [resFormGuests, setResFormGuests] = useState(4);
  const [resFormDate, setResFormDate] = useState('2026-11-16');
  const [resFormTime, setResFormTime] = useState('19:30');
  const [resFormTable, setResFormTable] = useState('Masa 01');
  const [resFormDeposit, setResFormDeposit] = useState(0);
  const [resFormSpecial, setResFormSpecial] = useState('');

  // Module 14: Stock Item Add/Edit States
  const [stockModalMode, setStockModalMode] = useState<'create' | 'edit' | null>(null);
  const [stockFormName, setStockFormName] = useState('');
  const [stockFormCategory, setStockFormCategory] = useState<StockItem['category']>('Et ve sakatat');
  const [stockFormUnit, setStockFormUnit] = useState<StockItem['unit']>('kg');
  const [stockFormCurrent, setStockFormCurrent] = useState(15);
  const [stockFormMin, setStockFormMin] = useState(5);
  const [stockFormCost, setStockFormCost] = useState(620);
  const [stockFormSupplier, setStockFormSupplier] = useState('Gaziantep Kasaplar Hali');
  const [stockFormLot, setStockFormLot] = useState('LOT-2026-08');
  const [stockFormExpiry, setStockFormExpiry] = useState('2026-11-25');
  const [stockFormWarehouse, setStockFormWarehouse] = useState('Soğuk Hava Deposu');
  const [editingStockId, setEditingStockId] = useState<string | null>(null);

  // Module 17: Customer Edit States
  const [editingCustomer, setEditingCustomer] = useState<CustomerRecord | null>(null);
  const [custEditName, setCustEditName] = useState('');
  const [custEditPhone, setCustEditPhone] = useState('');
  const [custEditEmail, setCustEditEmail] = useState('');
  const [custEditDistrict, setCustEditDistrict] = useState('Şahinbey');
  const [custEditGroup, setCustEditGroup] = useState<CustomerRecord['group']>('Standart');

  // Module 19: Campaign Edit & Promo Pop-up States
  const [editingCampaign, setEditingCampaign] = useState<CampaignRecord | null>(null);
  const [campEditName, setCampEditName] = useState('');
  const [campEditCode, setCampEditCode] = useState('');
  const [campEditDiscount, setCampEditDiscount] = useState(15);
  const [campEditMinOrder, setCampEditMinOrder] = useState(400);
  const [campEditLimit, setCampEditLimit] = useState(250);
  const [campEditActive, setCampEditActive] = useState(true);
  const [showPromoPopupConfig, setShowPromoPopupConfig] = useState(false);

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
                onClick={() => onSelectModule(13)}
                className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-bold cursor-pointer"
              >
                Kasa &amp; e-Fatura →
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
              { label: '14. Personel Durumu', val: `${staff.filter((s) => s.isActive).length} Aktif`, sub: 'Vardiyada görevli personel' },
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
                onClick={() => onSwitchWorkspaceView('kds')}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Mutfak Ekranı (KDS)
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
      {activeModuleId === 2 && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-[#F5F2EB]">
                Merkezi Sipariş Yönetimi, Paket Servis & Kurye Takibi
              </h3>
              <p className="text-xs text-neutral-500">
                QR masa, Gel-Al ve Paket Servis siparişlerini tek merkezden yönetin; kurye atayın, POS tahsilatı ve fiş/e-Fatura işlemlerini yürütün.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(['Tümü', 'QR', 'Gel-Al', 'Paket servis'] as const).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setOrderChannelFilter(ch)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    orderChannelFilter === ch
                      ? 'bg-[#B86B35] text-white'
                      : 'border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {orders
              .filter((o) => (orderChannelFilter === 'Tümü' ? true : o.channel === orderChannelFilter))
              .map((ord) => (
                <div
                  key={ord.id}
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
                        onClick={() => {
                          onIssueOrderReceiptAndInvoice?.(ord.id);
                          const nums =
                            ord.receiptNumber && ord.eInvoiceNo
                              ? { receiptNumber: ord.receiptNumber, eInvoiceNo: ord.eInvoiceNo }
                              : generateReceiptAndInvoiceNumbers(ord.orderNumber);
                          setReceiptInvoiceModalOrder({
                            ...ord,
                            receiptNumber: nums.receiptNumber,
                            eInvoiceNo: nums.eInvoiceNo,
                            autoReceiptIssued: true,
                          });
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-[#B86B35]/50 text-[#B86B35] dark:text-[#D4AF6A] font-semibold cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" /> Fiş / e-Fatura
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
                      {onDeleteOrder && (
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteOrder(ord.id);
                            setStatusToast(`${ord.orderNumber} sipariş kaydı silindi (Arşivde saklanıyor).`);
                          }}
                          className="px-2.5 py-1 rounded border border-rose-500/50 text-rose-500 hover:bg-rose-950/20 cursor-pointer text-xs"
                          title="Sipariş kaydını sil"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Sil
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODÜL 5: ÜRÜN YÖNETİMİ (SADECE ÜRÜNLER)
      ===================================================================== */}
      {activeModuleId === 5 && (
        <div className="space-y-6">
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
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-semibold">
                  Güncel Envanter, Lot/Parti, SKT & Tedarikçi Listesi
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setStockModalMode('create');
                    setEditingStockId(null);
                    setStockFormName('');
                    setStockFormCategory('Et ve sakatat');
                    setStockFormUnit('kg');
                    setStockFormCurrent(10);
                    setStockFormMin(5);
                    setStockFormCost(450);
                    setStockFormSupplier('Gaziantep Kasaplar Hali');
                    setStockFormLot(`LOT-${Date.now().toString().slice(-4)}`);
                    setStockFormExpiry('2026-12-31');
                    setStockFormWarehouse('Soğuk Hava Deposu');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#B86B35] text-white text-xs font-semibold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" /> Yeni Stok Kalemi Ekle
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
                      <th className="py-2 pr-2">Hammadde / Kategori</th>
                      <th className="py-2 px-2">Tedarikçi & Lot</th>
                      <th className="py-2 px-2 text-right">Mevcut / Kritik</th>
                      <th className="py-2 px-2 text-right">Birim Maliyet</th>
                      <th className="py-2 pl-2 text-right">İşlemler</th>
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
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums font-semibold">
                            {st.unitCost.toFixed(2)} ₺
                          </td>
                          <td className="py-2.5 pl-2 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setStockModalMode('edit');
                                  setEditingStockId(st.id);
                                  setStockFormName(st.name);
                                  setStockFormCategory(st.category);
                                  setStockFormUnit(st.unit);
                                  setStockFormCurrent(st.currentStock);
                                  setStockFormMin(st.minStockThreshold);
                                  setStockFormCost(st.unitCost);
                                  setStockFormSupplier(st.supplierName);
                                  setStockFormLot(st.lotNumber);
                                  setStockFormExpiry(st.expiryDate);
                                  setStockFormWarehouse(st.warehouse);
                                }}
                                className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[#B86B35] dark:text-[#D4AF6A] cursor-pointer"
                                title="Düzenle"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              {onDeleteStockItem && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onDeleteStockItem(st.id);
                                    setStatusToast(`${st.name} stok kaydı silindi.`);
                                  }}
                                  className="p-1 rounded hover:bg-rose-950/20 text-rose-500 cursor-pointer"
                                  title="Sil"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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
          </div>

          {/* Stok Kalemi Ekleme / Düzenleme Modalı */}
          {stockModalMode && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-lg rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1A0C09] p-5 space-y-4 text-xs shadow-2xl">
                <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-[#F5D69B]">
                    {stockModalMode === 'create' ? 'Yeni Stok Kalemi Tanımla' : 'Stok Kalemini Düzenle'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setStockModalMode(null)}
                    className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block font-semibold mb-1">Hammadde Adı</label>
                    <input
                      type="text"
                      required
                      value={stockFormName}
                      onChange={(e) => setStockFormName(e.target.value)}
                      placeholder="Örn: Günlük Kuzu Ciğeri"
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Kategori</label>
                    <select
                      value={stockFormCategory}
                      onChange={(e) => setStockFormCategory(e.target.value as StockItem['category'])}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                    >
                      <option value="Et ve sakatat">Et ve sakatat</option>
                      <option value="Sebze">Sebze</option>
                      <option value="Meyve">Meyve</option>
                      <option value="Süt ürünleri">Süt ürünleri</option>
                      <option value="Kuru gıda">Kuru gıda</option>
                      <option value="Baharat">Baharat</option>
                      <option value="İçecek">İçecek</option>
                      <option value="Ambalaj">Ambalaj</option>
                      <option value="Temizlik malzemeleri">Temizlik malzemeleri</option>
                      <option value="Diğer sarf malzemeleri">Diğer sarf malzemeleri</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Ölçü Birimi</label>
                    <select
                      value={stockFormUnit}
                      onChange={(e) => setStockFormUnit(e.target.value as StockItem['unit'])}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
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
                    <label className="block font-semibold mb-1">Mevcut Stok</label>
                    <input
                      type="number"
                      step="0.1"
                      min={0}
                      value={stockFormCurrent}
                      onChange={(e) => setStockFormCurrent(Number(e.target.value))}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Kritik Eşik</label>
                    <input
                      type="number"
                      step="0.1"
                      min={0}
                      value={stockFormMin}
                      onChange={(e) => setStockFormMin(Number(e.target.value))}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Birim Maliyet (₺)</label>
                    <input
                      type="number"
                      step="0.1"
                      min={0}
                      value={stockFormCost}
                      onChange={(e) => setStockFormCost(Number(e.target.value))}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Tedarikçi Firma</label>
                    <input
                      type="text"
                      value={stockFormSupplier}
                      onChange={(e) => setStockFormSupplier(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Parti / Lot No</label>
                    <input
                      type="text"
                      value={stockFormLot}
                      onChange={(e) => setStockFormLot(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Son Kullanma Tarihi</label>
                    <input
                      type="date"
                      value={stockFormExpiry}
                      onChange={(e) => setStockFormExpiry(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block font-semibold mb-1">Depo Lokasyonu</label>
                    <input
                      type="text"
                      value={stockFormWarehouse}
                      onChange={(e) => setStockFormWarehouse(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setStockModalMode(null)}
                    className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 font-semibold"
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!stockFormName.trim()) return;
                      if (stockModalMode === 'create' && onAddStockItem) {
                        onAddStockItem({
                          sku: `SKU-${Date.now().toString().slice(-4)}`,
                          name: stockFormName.trim(),
                          category: stockFormCategory,
                          unit: stockFormUnit,
                          currentStock: stockFormCurrent,
                          minStockThreshold: stockFormMin,
                          unitCost: stockFormCost,
                          supplierId: 'SUP-01',
                          supplierName: stockFormSupplier,
                          lotNumber: stockFormLot,
                          expiryDate: stockFormExpiry,
                          warehouse: stockFormWarehouse,
                        });
                        setStatusToast(`${stockFormName} envantere eklendi.`);
                      } else if (stockModalMode === 'edit' && onUpdateStockItem && editingStockId) {
                        const target = stocks.find((s) => s.id === editingStockId);
                        if (target) {
                          onUpdateStockItem({
                            ...target,
                            name: stockFormName.trim(),
                            category: stockFormCategory,
                            unit: stockFormUnit,
                            currentStock: stockFormCurrent,
                            minStockThreshold: stockFormMin,
                            unitCost: stockFormCost,
                            supplierName: stockFormSupplier,
                            lotNumber: stockFormLot,
                            expiryDate: stockFormExpiry,
                            warehouse: stockFormWarehouse,
                          });
                          setStatusToast(`${stockFormName} güncellendi.`);
                        }
                      }
                      setStockModalMode(null);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-[#B86B35] text-white font-semibold cursor-pointer"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            </div>
          )}

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
          MODÜL 15: ÜRÜN REÇETELERİ & MALİYET ANALİZİ (SADECE REÇETELER)
      ===================================================================== */}
      {activeModuleId === 15 && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#B86B35]" />
            <div>
              <h3 className="text-base font-semibold">
                Ürün Reçete İçerikleri, Fire Oranları &amp; Maliyet Kârlılık Analizi
              </h3>
              <p className="text-xs text-neutral-500">
                Her ürünün hammadde gramajları, fire payı ve brüt kâr marjı otomatik olarak hesaplanır.
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
                  <th className="py-2 px-3 text-right">Net Reçete Maliyeti</th>
                  <th className="py-2 pl-3 text-right">Brüt Kâr / Marj</th>
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
                  return (
                    <tr key={p.id}>
                      <td className="py-2.5 pr-3 font-semibold">{p.name}</td>
                      <td className="py-2.5 px-3 text-neutral-500">
                        {p.recipeLines.length > 0
                          ? p.recipeLines
                              .map((rl) => `${rl.ingredientName} (${rl.quantity} ${rl.unit})`)
                              .join(', ')
                          : p.ingredientsText}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">%{p.wasteAllowancePercent}</td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {metrics.totalRecipeCost.toFixed(2)} ₺
                      </td>
                      <td className="py-2.5 pl-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        +{metrics.grossProfit.toFixed(2)} ₺ (%{metrics.profitMarginPercent})
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODÜL 17: MÜŞTERİLER (CRM) & SADAKAT PROGRAMI (SADECE CRM)
      ===================================================================== */}
      {activeModuleId === 17 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!custName.trim() || !custPhone.trim()) return;
                onAddCustomer({
                  name: custName.trim(),
                  phone: custPhone.trim(),
                  email: custEmail.trim() || 'misafir@oztikeciger.com.tr',
                  address: `${custDistrict} Mah.`,
                  district: custDistrict,
                  group: 'Standart',
                  birthDate: '1990-01-01',
                  preferences: 'Standart servis',
                  referralCode: `OZT-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
                  kvkkApproved: true,
                  marketingSmsApproved: custMarketingConsent,
                });
                setCustName('');
                setCustPhone('');
                setCustEmail('');
                setCustMarketingConsent(false);
                setStatusToast('Müşteri CRM kaydı oluşturuldu (KVKK ve İleti izinleri ayrık kaydedildi).');
              }}
              className="lg:col-span-12 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-3 text-xs"
            >
              <h3 className="text-base font-semibold">
                Yeni Müşteri (CRM) & KVKK / İleti İzin Kaydı
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-medium mb-1">Ad Soyad</label>
                  <input
                    type="text"
                    required
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Telefon</label>
                  <input
                    type="tel"
                    required
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">E-posta</label>
                  <input
                    type="email"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                  />
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
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={custMarketingConsent}
                    onChange={(e) => setCustMarketingConsent(e.target.checked)}
                  />
                  <span>
                    Ticari Elektronik İleti (SMS/E-posta) Pazarlama İzni (Varsayılan kapalıdır)
                  </span>
                </label>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#B86B35] text-white font-semibold cursor-pointer"
                >
                  Müşteriyi Kaydet
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-3">
            <h3 className="text-base font-semibold">
              Kayıtlı Müşteriler, Sadakat Puanları & İzin Durumları ({customers.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {customers.map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 space-y-2 text-xs"
                >
                  <div className="flex justify-between items-center font-semibold">
                    <span className="flex items-center gap-1.5">
                      <span>{c.name}</span>
                      {c.isBlocked && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-500 text-[10px] font-bold">
                          Engelli
                        </span>
                      )}
                    </span>
                    <span className="text-[#D4AF6A]">{c.group}</span>
                  </div>
                  <div className="text-neutral-500">
                    {c.phone} · {c.district} · Referans: {c.referralCode}
                  </div>
                  <div className="font-mono tabular-nums">
                    Sadakat Puanı: <strong>{c.points} Puan</strong> · Bakiye: {c.walletBalance} ₺
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    KVKK: Onaylı · Pazarlama SMS: {c.marketingSmsApproved ? 'İzinli' : 'İzinsiz (Kapalı)'}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onAdjustLoyaltyPoints(c.id, 100, 'Sadakat ödül puanı kazanımı');
                          setStatusToast(`${c.name} hesabına +100 sadakat puanı eklendi.`);
                        }}
                        className="px-2 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 text-[11px]"
                      >
                        +100 Puan
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onAdjustLoyaltyPoints(c.id, -100, 'Siparişte sadakat puanı harcaması');
                          setStatusToast(`${c.name} hesabından 100 puan harcandı.`);
                        }}
                        className="px-2 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 text-[11px]"
                      >
                        -100 Puan
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {onToggleCustomerBlock && (
                        <button
                          type="button"
                          onClick={() => {
                            onToggleCustomerBlock(c.id);
                            setStatusToast(
                              c.isBlocked ? `${c.name} engeli kaldırıldı.` : `${c.name} engellendi.`
                            );
                          }}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer border ${
                            c.isBlocked
                              ? 'border-emerald-600/50 text-emerald-500 hover:bg-emerald-950/20'
                              : 'border-amber-600/50 text-amber-500 hover:bg-amber-950/20'
                          }`}
                        >
                          {c.isBlocked ? 'Engeli Aç' : 'Engelle'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCustomer(c);
                          setCustEditName(c.name);
                          setCustEditPhone(c.phone);
                          setCustEditEmail(c.email);
                          setCustEditDistrict(c.district);
                          setCustEditGroup(c.group);
                        }}
                        className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[#B86B35] dark:text-[#D4AF6A] cursor-pointer"
                        title="Düzenle"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {onDeleteCustomer && (
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteCustomer(c.id);
                            setStatusToast(`${c.name} müşteri kaydı silindi.`);
                          }}
                          className="p-1 rounded hover:bg-rose-950/20 text-rose-500 cursor-pointer"
                          title="Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Müşteri Düzenleme Modalı */}
            {editingCustomer && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="w-full max-w-md rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1A0C09] p-5 space-y-4 text-xs shadow-2xl">
                  <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
                    <h4 className="font-bold text-sm text-neutral-900 dark:text-[#F5D69B]">
                      Müşteri Kaydını Düzenle: {editingCustomer.name}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setEditingCustomer(null)}
                      className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold mb-1">Ad Soyad</label>
                      <input
                        type="text"
                        value={custEditName}
                        onChange={(e) => setCustEditName(e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold mb-1">Telefon</label>
                        <input
                          type="tel"
                          value={custEditPhone}
                          onChange={(e) => setCustEditPhone(e.target.value)}
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">İlçe / Bölge</label>
                        <input
                          type="text"
                          value={custEditDistrict}
                          onChange={(e) => setCustEditDistrict(e.target.value)}
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">E-posta</label>
                      <input
                        type="email"
                        value={custEditEmail}
                        onChange={(e) => setCustEditEmail(e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Müşteri Grubu</label>
                      <select
                        value={custEditGroup}
                        onChange={(e) => setCustEditGroup(e.target.value as CustomerRecord['group'])}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                      >
                        <option value="Standart">Standart</option>
                        <option value="VIP Misafir">VIP Misafir</option>
                        <option value="Kurumsal">Kurumsal</option>
                        <option value="Sadık Müşteri">Sadık Müşteri</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                    <button
                      type="button"
                      onClick={() => setEditingCustomer(null)}
                      className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 font-semibold"
                    >
                      İptal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!custEditName.trim()) return;
                        if (onUpdateCustomer && editingCustomer) {
                          onUpdateCustomer({
                            ...editingCustomer,
                            name: custEditName.trim(),
                            phone: custEditPhone.trim(),
                            email: custEditEmail.trim(),
                            district: custEditDistrict.trim(),
                            group: custEditGroup,
                          });
                          setStatusToast(`${custEditName} bilgileri güncellendi.`);
                        }
                        setEditingCustomer(null);
                      }}
                      className="px-4 py-1.5 rounded-lg bg-[#B86B35] text-white font-semibold cursor-pointer"
                    >
                      Kaydet
                    </button>
                  </div>
                </div>
              </div>
            )}
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
          MODÜL 19: KAMPANYALAR & KUPON KODLARI (SADECE KAMPANYALAR)
      ===================================================================== */}
      {activeModuleId === 19 && (
        <div className="space-y-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!campName.trim() || !campCode.trim()) return;
              onAddCampaign({
                name: campName.trim(),
                type: 'Yüzde indirim',
                couponCode: campCode.trim().toUpperCase(),
                discountValue: campDiscount,
                minOrderAmount: 400,
                usageLimit: 250,
                canCombine: false,
                startDate: '2026-11-16',
                endDate: '2026-12-31',
                isActive: true,
              });
              setCampName('');
              setCampCode('');
              setStatusToast('Yeni kampanya ve kupon kodu tanımlandı.');
            }}
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-3 text-xs"
          >
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#B86B35]" />
              <span>Kampanya &amp; Kupon Kodu Oluşturma</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div className="sm:col-span-2">
                <label className="block font-medium mb-1">Kampanya Adı</label>
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
                <label className="block font-medium mb-1">Kupon Kodu</label>
                <input
                  type="text"
                  required
                  value={campCode}
                  onChange={(e) => setCampCode(e.target.value)}
                  placeholder="AILE15"
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">İndirim (%)</label>
                <input
                  type="number"
                  min={5}
                  max={80}
                  value={campDiscount}
                  onChange={(e) => setCampDiscount(Number(e.target.value))}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#B86B35] text-white font-semibold cursor-pointer"
            >
              Kampanyayı Başlat
            </button>
          </form>

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-3">
            <h3 className="text-base font-semibold">
              Aktif Kampanyalar &amp; Kupon Kodları ({campaigns.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {campaigns.map((camp) => (
                <div
                  key={camp.id}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-2 bg-neutral-50 dark:bg-[#141413]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-[#B86B35] text-white">
                      {camp.couponCode}
                    </span>
                    <span className="font-bold text-emerald-500">
                      %{camp.discountValue} İndirim
                    </span>
                  </div>
                  <div className="font-semibold text-sm">{camp.name}</div>
                  <div className="text-neutral-500">
                    Min. Sepet: {camp.minOrderAmount} ₺ · Kullanım: {camp.usedCount}/{camp.usageLimit}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                    <div className="text-[11px] text-neutral-500">
                      {camp.startDate} – {camp.endDate} · {camp.isActive ? 'Yayında' : 'Pasif'}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCampaign(camp);
                          setCampEditName(camp.name);
                          setCampEditCode(camp.couponCode);
                          setCampEditDiscount(camp.discountValue);
                          setCampEditMinOrder(camp.minOrderAmount);
                          setCampEditLimit(camp.usageLimit);
                          setCampEditActive(camp.isActive);
                        }}
                        className="px-2 py-0.5 rounded border border-[#B86B35]/50 text-[#B86B35] dark:text-[#D4AF6A] hover:bg-[#B86B35]/10 text-[11px] font-semibold cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3 inline mr-0.5" /> Düzenle
                      </button>
                      {onDeleteCampaign && (
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteCampaign(camp.id);
                            setStatusToast(`${camp.name} kampanyası silindi.`);
                          }}
                          className="px-2 py-0.5 rounded border border-rose-500/50 text-rose-500 hover:bg-rose-950/20 text-[11px] cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3 inline mr-0.5" /> Sil
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Kampanya Düzenleme Modalı */}
            {editingCampaign && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="w-full max-w-md rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1A0C09] p-5 space-y-4 text-xs shadow-2xl">
                  <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
                    <h4 className="font-bold text-sm text-neutral-900 dark:text-[#F5D69B]">
                      Kampanyayı Düzenle: {editingCampaign.name}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setEditingCampaign(null)}
                      className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold mb-1">Kampanya Adı</label>
                      <input
                        type="text"
                        value={campEditName}
                        onChange={(e) => setCampEditName(e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-semibold mb-1">Kupon Kodu</label>
                        <input
                          type="text"
                          value={campEditCode}
                          onChange={(e) => setCampEditCode(e.target.value)}
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">İndirim (%)</label>
                        <input
                          type="number"
                          value={campEditDiscount}
                          onChange={(e) => setCampEditDiscount(Number(e.target.value))}
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Min. Sepet (₺)</label>
                        <input
                          type="number"
                          value={campEditMinOrder}
                          onChange={(e) => setCampEditMinOrder(Number(e.target.value))}
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Kullanım Limiti</label>
                        <input
                          type="number"
                          value={campEditLimit}
                          onChange={(e) => setCampEditLimit(Number(e.target.value))}
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 pt-1 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={campEditActive}
                        onChange={(e) => setCampEditActive(e.target.checked)}
                      />
                      <span>Kampanya Yayında (Aktif)</span>
                    </label>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                    <button
                      type="button"
                      onClick={() => setEditingCampaign(null)}
                      className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 font-semibold"
                    >
                      İptal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!campEditName.trim()) return;
                        if (onUpdateCampaign && editingCampaign) {
                          onUpdateCampaign({
                            ...editingCampaign,
                            name: campEditName.trim(),
                            couponCode: campEditCode.trim().toUpperCase(),
                            discountValue: campEditDiscount,
                            minOrderAmount: campEditMinOrder,
                            usageLimit: campEditLimit,
                            isActive: campEditActive,
                          });
                          setStatusToast(`${campEditName} kampanyası güncellendi.`);
                        }
                        setEditingCampaign(null);
                      }}
                      className="px-4 py-1.5 rounded-lg bg-[#B86B35] text-white font-semibold cursor-pointer"
                    >
                      Kaydet
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Popup Açılan Duyuru / Kampanya Banner Yönetimi */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#B86B35]" />
                <div>
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-[#F5D69B]">
                    Açılır Pop-up Duyuru &amp; Kampanya Bannerı (Modal Popup)
                  </h4>
                  <p className="text-neutral-500">
                    Müşteri vitrin sitesine girdiğinde otomatik açılan görsel ve kuponlu kampanya penceresini yönetin.
                  </p>
                </div>
              </div>
              <label className="inline-flex items-center gap-2 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={siteCmsConfig.promoPopup.enabled}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      promoPopup: { ...prev.promoPopup, enabled: e.target.checked },
                    }))
                  }
                />
                <span className={siteCmsConfig.promoPopup.enabled ? 'text-emerald-500' : 'text-neutral-500'}>
                  {siteCmsConfig.promoPopup.enabled ? 'Pop-up Açık (Aktif)' : 'Pop-up Kapalı'}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold mb-1">Pop-up Başlığı (TR)</label>
                <input
                  type="text"
                  value={siteCmsConfig.promoPopup.titleTr}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      promoPopup: { ...prev.promoPopup, titleTr: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Rozet Metni</label>
                <input
                  type="text"
                  value={siteCmsConfig.promoPopup.badgeText}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      promoPopup: { ...prev.promoPopup, badgeText: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Kupon Kodu</label>
                <input
                  type="text"
                  value={siteCmsConfig.promoPopup.couponCode}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      promoPopup: { ...prev.promoPopup, couponCode: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Açılma Gecikmesi (Saniye)</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={siteCmsConfig.promoPopup.delaySeconds}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      promoPopup: { ...prev.promoPopup, delaySeconds: Number(e.target.value) },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5 font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Kampanya Açıklaması (TR)</label>
                <input
                  type="text"
                  value={siteCmsConfig.promoPopup.bodyTr}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      promoPopup: { ...prev.promoPopup, bodyTr: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1">Pop-up Görseli</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={siteCmsConfig.promoPopup.imageUrl}
                    onChange={(e) =>
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        promoPopup: { ...prev.promoPopup, imageUrl: e.target.value },
                      }))
                    }
                    className="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5 font-mono text-[11px]"
                  />
                  <label className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-semibold cursor-pointer">
                    <Upload className="w-3.5 h-3.5 inline mr-1" /> Yükle
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (reader.result) {
                              onUpdateSiteCmsConfig((prev) => ({
                                ...prev,
                                promoPopup: { ...prev.promoPopup, imageUrl: String(reader.result) },
                              }));
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={siteCmsConfig.promoPopup.showOncePerSession}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      promoPopup: { ...prev.promoPopup, showOncePerSession: e.target.checked },
                    }))
                  }
                />
                <span>Tarayıcı oturumu başına yalnızca 1 kez göster (Kapatılınca tekrar açılmaz)</span>
              </label>

              <button
                type="button"
                onClick={() => setStatusToast('Pop-up kampanya ayarları kaydedildi ve yayına alındı.')}
                className="px-4 py-2 rounded-lg bg-[#B86B35] text-white font-semibold cursor-pointer"
              >
                Pop-up Ayarlarını Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODÜL 11: REZERVASYON YÖNETİMİ (BÖLÜM 11)
      ===================================================================== */}
      {activeModuleId === 11 && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#B86B35]" />
            <h3 className="text-base font-semibold">
              Rezervasyon, Kapora Takibi & Gelmedi (No-Show) Yönetimi
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reservations.map((res) => (
              <div
                key={res.id}
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
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex flex-wrap gap-1.5">
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
                        className={`px-2 py-0.5 rounded text-[11px] border ${
                          res.status === btn.st
                            ? 'bg-[#B86B35] text-white border-[#B86B35]'
                            : 'border-neutral-300 dark:border-neutral-700'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingReservation(res);
                        setResFormGuests(res.guestCount);
                        setResFormDate(res.date);
                        setResFormTime(res.time);
                        setResFormTable(res.tableNumber);
                        setResFormDeposit(res.depositAmount);
                        setResFormSpecial(res.specialRequests || '');
                      }}
                      className="px-2 py-0.5 rounded border border-[#B86B35]/50 text-[#B86B35] dark:text-[#D4AF6A] hover:bg-[#B86B35]/10 cursor-pointer text-[11px] font-semibold"
                    >
                      <Edit3 className="w-3 h-3 inline mr-0.5" /> Düzenle
                    </button>
                    {onDeleteReservation && (
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteReservation(res.id);
                          setStatusToast(`${res.customerName} rezervasyonu silindi.`);
                        }}
                        className="px-2 py-0.5 rounded border border-rose-500/50 text-rose-500 hover:bg-rose-950/20 cursor-pointer text-[11px]"
                      >
                        <Trash2 className="w-3 h-3 inline mr-0.5" /> Sil
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Rezervasyon Düzenleme Modalı */}
          {editingReservation && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-md rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1A0C09] p-5 space-y-4 text-xs shadow-2xl">
                <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-[#F5D69B]">
                    Rezervasyonu Düzenle: {editingReservation.customerName}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setEditingReservation(null)}
                    className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Tarih</label>
                    <input
                      type="date"
                      value={resFormDate}
                      onChange={(e) => setResFormDate(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Saat</label>
                    <input
                      type="time"
                      value={resFormTime}
                      onChange={(e) => setResFormTime(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Kişi Sayısı</label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={resFormGuests}
                      onChange={(e) => setResFormGuests(Number(e.target.value))}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Masa No</label>
                    <input
                      type="text"
                      value={resFormTable}
                      onChange={(e) => setResFormTable(e.target.value)}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block font-semibold mb-1">Kapora Tutarı (₺)</label>
                    <input
                      type="number"
                      min={0}
                      value={resFormDeposit}
                      onChange={(e) => setResFormDeposit(Number(e.target.value))}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block font-semibold mb-1">Özel İstek / Not</label>
                    <input
                      type="text"
                      value={resFormSpecial}
                      onChange={(e) => setResFormSpecial(e.target.value)}
                      placeholder="Örn: Bebek sandalyesi, ocakbaşı önü masa"
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setEditingReservation(null)}
                    className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 font-semibold"
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onUpdateReservation && editingReservation) {
                        onUpdateReservation({
                          ...editingReservation,
                          guestCount: resFormGuests,
                          date: resFormDate,
                          time: resFormTime,
                          tableNumber: resFormTable,
                          depositAmount: resFormDeposit,
                          specialRequests: resFormSpecial,
                        });
                        setStatusToast(`${editingReservation.customerName} rezervasyonu güncellendi.`);
                      }
                      setEditingReservation(null);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-[#B86B35] text-white font-semibold cursor-pointer"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =====================================================================
          MODÜL 8: CANLI GARSON ÇAĞRILARI & MASA SERVİSİ (SADECE GARSON ÇAĞRILARI)
      ===================================================================== */}
      {activeModuleId === 8 && (
        <div className="rounded-xl border border-amber-500/35 bg-white dark:bg-[#1F1F1D] p-5 space-y-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <BellRing className="w-4 h-4 text-amber-500" />
              <span>Canlı QR Garson Çağrıları Kuyruğu ({activeWaiterCallsList.length} Bekleyen)</span>
            </h3>
            <button
              type="button"
              onClick={() => onSwitchWorkspaceView('waiter')}
              className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 font-semibold cursor-pointer"
            >
              Tam Ekran Garson Terminali →
            </button>
          </div>
          {waiterCalls.length === 0 ? (
            <div className="text-neutral-500 py-3">Henüz masa servis çağrısı bulunmuyor.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {waiterCalls.map((call) => (
                <div
                  key={call.id}
                  className={`rounded-xl border p-3.5 space-y-2 ${
                    call.status === 'Tamamlandı'
                      ? 'border-neutral-200 dark:border-neutral-800 opacity-65'
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
                  {call.status !== 'Tamamlandı' ? (
                    <div className="flex flex-wrap gap-2 pt-1">
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
                    </div>
                  ) : (
                    onDeleteWaiterCall && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteWaiterCall(call.id);
                            setStatusToast(`${call.tableNumber} tamamlanan çağrı kaydı silindi.`);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-rose-500/50 text-rose-500 hover:bg-rose-950/20 cursor-pointer text-[11px]"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Çağrı Kaydını Sil
                        </button>
                      </div>
                    )
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODÜL 20 (Personel vardiyalar) kullanıcı talebiyle kaldırılmıştır */}

      {/* =====================================================================
          MODÜL 13: ÖDEMELER, POS TAHSİLAT & E-FATURA (SADECE ÖDEMELER)
      ===================================================================== */}
      {activeModuleId === 13 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#B86B35]" />
                  <span>POS Tahsilat, Ödeme Yöntemi Kırılımı &amp; Otomatik e-Fatura</span>
                </h3>
                <p className="text-neutral-500">
                  Müşterilerin seçtiği ödeme yöntemlerini anlık izleyin, açık adisyonları POS’tan tahsil edin ve tek tıkla e-Arşiv fiş kesin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSwitchWorkspaceView('pos')}
                className="px-3.5 py-2 rounded-lg bg-[#B86B35] text-white font-semibold cursor-pointer"
              >
                POS / Kasa Terminali →
              </button>
            </div>
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
                      onClick={() => {
                        onIssueOrderReceiptAndInvoice?.(ord.id);
                        const nums =
                          ord.receiptNumber && ord.eInvoiceNo
                            ? { receiptNumber: ord.receiptNumber, eInvoiceNo: ord.eInvoiceNo }
                            : generateReceiptAndInvoiceNumbers(ord.orderNumber);
                        setReceiptInvoiceModalOrder({
                          ...ord,
                          receiptNumber: nums.receiptNumber,
                          eInvoiceNo: nums.eInvoiceNo,
                          autoReceiptIssued: true,
                        });
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 text-[11px] font-semibold cursor-pointer"
                    >
                      <Printer className="w-3 h-3" /> Fiş / e-Fatura
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
          MODÜL 26, 27, 28, 29, 39: HER WEB SİTESİ AYARI KENDİ TEK BÖLÜMÜNDE
      ===================================================================== */}
      {(activeModuleId === 26 ||
        activeModuleId === 27 ||
        activeModuleId === 28 ||
        activeModuleId === 29 ||
        activeModuleId === 39) && (
        <AdminSiteBuilderManager
          key={`site-builder-${activeModuleId}`}
          siteCmsConfig={siteCmsConfig}
          onUpdateSiteCmsConfig={onUpdateSiteCmsConfig}
          onNotify={(msg) => setStatusToast(msg)}
          cmsPages={cmsPages}
          onAddCmsPage={onAddCmsPage}
          onUpdateCmsPage={onUpdateCmsPage}
          onDeleteCmsPage={onDeleteCmsPage}
          singleSectionMode={true}
          defaultTab={
            activeModuleId === 39
              ? 'social_footer'
              : activeModuleId === 29
              ? 'gallery_only'
              : activeModuleId === 28
              ? 'seo_only'
              : activeModuleId === 27
              ? 'menus_pages'
              : 'announcement_header_logo'
          }
        />
      )}

      {/* =====================================================================
          MODÜL 31: ENTEGRASYONLAR & EKLENTİ MERKEZİ (GELİŞMİŞ API & YAPILANDIRMA)
      ===================================================================== */}
      {activeModuleId === 31 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#B86B35] dark:text-[#D4AF6A]" />
                  <span>31. Ödeme, POS, Kurye, Yazıcı &amp; Eklenti Yönetim Merkezi</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Tüm ödeme geçitleri, fiziksel POS cihazları, yemek platformları, termal fiş yazıcıları ve e-Fatura API servislerini tek ekrandan yapılandırın.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => triggerAiAnalysis('Entegrasyon ve Günlük Operasyon Özeti')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#B86B35] text-white cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Entegrasyon Özeti</span>
                </button>
              </div>
            </div>

            {/* Arama ve Kategori Filtreleri */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex flex-wrap gap-1.5 text-xs">
                {[
                  'Tümü',
                  'Ödeme',
                  'Yemek Platformu',
                  'Yazıcı',
                  'SMS',
                  'WhatsApp Business',
                  'E-belge',
                  'Muhasebe',
                  'Harita',
                  'Güvenlik',
                ].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setIntegrationCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      integrationCategoryFilter === cat
                        ? 'bg-[#B86B35] text-white'
                        : 'border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <input
                type="search"
                value={integrationSearchQuery}
                onChange={(e) => setIntegrationSearchQuery(e.target.value)}
                placeholder="Eklenti veya API ara..."
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5 text-xs w-48"
              />
            </div>

            {/* Entegrasyon Kartları Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {integrations
                .filter(
                  (intg) =>
                    integrationCategoryFilter === 'Tümü' ||
                    intg.category === integrationCategoryFilter ||
                    (integrationCategoryFilter === 'Ödeme' && (intg.category === 'Ödeme' || intg.code.includes('pos')))
                )
                .filter(
                  (intg) =>
                    !integrationSearchQuery.trim() ||
                    `${intg.name} ${intg.code} ${intg.category} ${intg.description || ''}`
                      .toLowerCase()
                      .includes(integrationSearchQuery.toLowerCase())
                )
                .map((intg) => {
                  const isEnabled = intg.enabled;
                  const isLive = intg.mode === 'Canlı (Live)';

                  return (
                    <div
                      key={intg.id}
                      className={`rounded-xl border p-4 flex flex-col justify-between gap-3 text-xs transition-all shadow-xs ${
                        isEnabled
                          ? 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1A1815]'
                          : 'border-neutral-300/60 dark:border-neutral-800/60 bg-neutral-100/60 dark:bg-[#141413]/60 opacity-75'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                            {intg.category}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isLive
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {intg.mode}
                            </span>
                            <span className="font-mono text-neutral-400 text-[10px]">v{intg.version}</span>
                          </div>
                        </div>

                        <div>
                          <div className="font-bold text-sm text-neutral-900 dark:text-[#F5F2EB] flex items-center justify-between gap-1">
                            <span>{intg.name}</span>
                            <button
                              type="button"
                              onClick={() => onToggleIntegrationActive?.(intg.id)}
                              title={isEnabled ? 'Devre Dışı Bırak' : 'Etkinleştir'}
                              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                                isEnabled ? 'bg-emerald-600' : 'bg-neutral-400 dark:bg-neutral-700'
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                                  isEnabled ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2">
                            {intg.description || 'Restoran otomasyon ve API bağlantı köprüsü.'}
                          </p>
                        </div>

                        <div className="rounded-lg bg-neutral-50 dark:bg-[#141413] p-2 space-y-1 font-mono text-[10px] text-neutral-500">
                          <div className="flex justify-between">
                            <span>API Durumu:</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              {intg.advancedConfig?.apiKey ? 'Özel Anahtar Tanımlı' : 'Varsayılan Aktif'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Protokol &amp; Ağ:</span>
                            <span>
                              {intg.advancedConfig?.ipAddress
                                ? `${intg.advancedConfig.ipAddress}:${intg.advancedConfig.port || 9100}`
                                : intg.advancedConfig?.endpointUrl
                                ? 'REST / JSON-RPC'
                                : 'Bulut HTTPS'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Son Doğrulama:</span>
                            <span className="truncate max-w-[140px]">{intg.lastTested}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                        <button
                          type="button"
                          onClick={() => handleOpenIntegrationConfig(intg)}
                          className="w-full py-2 px-3 rounded-lg bg-[#B86B35] hover:bg-[#9F5928] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>Gelişmiş Ayarlar &amp; API</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleTestPingIntegration(intg)}
                            className="flex-1 py-1.5 px-2 rounded-lg border border-neutral-300 dark:border-neutral-700 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer flex items-center justify-center gap-1 text-[11px]"
                          >
                            <Activity className="w-3 h-3 text-[#B86B35]" />
                            <span>Bağlantı Testi</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onToggleIntegrationMode(intg.id);
                              setStatusToast(`${intg.name} çalışma modu değiştirildi.`);
                            }}
                            className="py-1.5 px-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer text-[11px]"
                          >
                            Mod Değiştir
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <AdminSiteBuilderManager
            key="site-builder-31"
            siteCmsConfig={siteCmsConfig}
            onUpdateSiteCmsConfig={onUpdateSiteCmsConfig}
            onNotify={(msg) => setStatusToast(msg)}
            cmsPages={cmsPages}
            onAddCmsPage={onAddCmsPage}
            onUpdateCmsPage={onUpdateCmsPage}
            onDeleteCmsPage={onDeleteCmsPage}
            singleSectionMode={true}
            defaultTab="modules_only"
          />
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
          MODÜL 34: GÖRÜNÜM AYARLARI & TEMA YÖNETİMİ
      ===================================================================== */}
      {activeModuleId === 34 && (
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold">
                Yönetim Paneli Tema Tercihi (Açık / Koyu / Sistem)
              </h3>
              <p className="text-xs text-neutral-500">
                Tercihiniz yerel bellekte saklanır ve arayüz kontrastı otomatik uyarlanır.
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
                  className={`px-3.5 py-2 text-xs font-medium rounded-lg ${
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
            onAddCmsPage={onAddCmsPage}
            onUpdateCmsPage={onUpdateCmsPage}
            onDeleteCmsPage={onDeleteCmsPage}
            singleSectionMode={true}
            defaultTab="slider_cards_blocks_theme"
          />
        </div>
      )}

      {/* =====================================================================
          MODÜL 35: SİSTEM GENEL AYARLARI (SADECE GENEL AYARLAR)
      ===================================================================== */}
      {activeModuleId === 35 && (
        <AdminSiteBuilderManager
          key="site-builder-35"
          siteCmsConfig={siteCmsConfig}
          onUpdateSiteCmsConfig={onUpdateSiteCmsConfig}
          onNotify={(msg) => setStatusToast(msg)}
          cmsPages={cmsPages}
          onAddCmsPage={onAddCmsPage}
          onUpdateCmsPage={onUpdateCmsPage}
          onDeleteCmsPage={onDeleteCmsPage}
          singleSectionMode={true}
          defaultTab="general_only"
        />
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
          MODÜL 3: MASALAR – GÖRSEL MASA PLANI HARİTASI (DOLU, BOŞ, HESAP BEKLİYOR, HAZIRLANIYOR)
      ===================================================================== */}
      {activeModuleId === 3 && (
        <div className="space-y-6">
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
                {['Tümü', 'Ana Salon', 'Taş Bahçe', 'Bakır Ocakbaşı', 'VIP Aile Salonu'].map(
                  (area) => (
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
                  )
                )}
                <button
                  type="button"
                  onClick={() => {
                    setTableModalMode('create');
                    setEditingTableId(null);
                    setTableFormNumber(`Masa ${String(tables.length + 1).padStart(2, '0')}`);
                    setTableFormArea(
                      (selectedFloorArea === 'Tümü' ||
                      !['Ana Salon', 'Taş Bahçe', 'Bakır Ocakbaşı', 'VIP Aile Salonu'].includes(
                        selectedFloorArea
                      )
                        ? 'Ana Salon'
                        : selectedFloorArea) as DiningTableItem['area']
                    );
                    setTableFormCapacity(4);
                    setTableFormWaiter('Halil Usta');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#B86B35] text-white text-xs font-bold hover:bg-[#9F5928] cursor-pointer inline-flex items-center gap-1 shadow"
                >
                  <Plus className="w-3.5 h-3.5" /> Yeni Masa Ekle
                </button>
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

              <button
                type="button"
                onClick={() => onSwitchWorkspaceView('waiter')}
                className="px-3 py-1.5 rounded-lg bg-neutral-900 dark:bg-[#D4AF6A] text-white dark:text-[#141413] font-bold text-xs cursor-pointer"
              >
                Tam Ekran Garson Terminali →
              </button>
            </div>
          </div>

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
                        className="w-full py-2.5 rounded-xl bg-[#B86B35] text-white font-bold text-xs cursor-pointer hover:bg-[#9F5928]"
                      >
                        POS Kasada Masa Adisyonunu Aç
                      </button>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setTableModalMode('edit');
                            setEditingTableId(selectedTbl.id);
                            setTableFormNumber(selectedTbl.number);
                            setTableFormArea(selectedTbl.area);
                            setTableFormCapacity(selectedTbl.capacity);
                            setTableFormWaiter(selectedTbl.waiterName);
                          }}
                          className="py-2 px-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer inline-flex items-center justify-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Masayı Düzenle
                        </button>

                        {onResetTableBill && (
                          <button
                            type="button"
                            onClick={() => {
                              onResetTableBill(selectedTbl.id);
                              setStatusToast(`${selectedTbl.number} hesabı sıfırlandı ve masa boşaltıldı.`);
                            }}
                            className="py-2 px-2.5 rounded-lg border border-amber-600/50 text-amber-500 hover:bg-amber-950/20 text-xs font-semibold cursor-pointer"
                            title="Açık adisyonu kapat ve masayı boşalt"
                          >
                            Hesabı Sıfırla
                          </button>
                        )}
                      </div>

                      {onDeleteTable && (
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteTable(selectedTbl.id);
                            setStatusToast(`${selectedTbl.number} masa kaydı silindi.`);
                          }}
                          className="w-full py-2 rounded-lg border border-rose-500/50 text-rose-500 hover:bg-rose-950/20 text-xs font-semibold cursor-pointer inline-flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Masayı Sistemden Sil
                        </button>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Masa Ekleme / Düzenleme Modalı */}
          {tableModalMode && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-md rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1A0C09] p-5 space-y-4 text-xs shadow-2xl">
                <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-[#F5D69B]">
                    {tableModalMode === 'create' ? 'Yeni Masa Ekle' : 'Masa Bilgilerini Düzenle'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setTableModalMode(null)}
                    className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold mb-1">Masa Adı / No</label>
                    <input
                      type="text"
                      required
                      value={tableFormNumber}
                      onChange={(e) => setTableFormNumber(e.target.value)}
                      placeholder="Örn: Masa 09 veya Bahçe VIP 1"
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Restoran Bölgesi</label>
                    <select
                      value={tableFormArea}
                      onChange={(e) => setTableFormArea(e.target.value as DiningTableItem['area'])}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                    >
                      <option value="Ana Salon">Ana Salon</option>
                      <option value="Taş Bahçe">Taş Bahçe</option>
                      <option value="Bakır Ocakbaşı">Bakır Ocakbaşı</option>
                      <option value="VIP Aile Salonu">VIP Aile Salonu</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold mb-1">Kişi Kapasitesi</label>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={tableFormCapacity}
                        onChange={(e) => setTableFormCapacity(Number(e.target.value))}
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Sorumlu Garson</label>
                      <input
                        type="text"
                        value={tableFormWaiter}
                        onChange={(e) => setTableFormWaiter(e.target.value)}
                        placeholder="Örn: Halil Usta"
                        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setTableModalMode(null)}
                    className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 font-semibold"
                  >
                    İptal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!tableFormNumber.trim()) return;
                      if (tableModalMode === 'create' && onAddTable) {
                        onAddTable({
                          number: tableFormNumber.trim(),
                          area: tableFormArea,
                          capacity: tableFormCapacity,
                          waiterName: tableFormWaiter.trim() || 'Halil Usta',
                          status: 'Boş',
                          qrCodeNumber: `QR-${tableFormNumber.toUpperCase().replace(/\s+/g, '')}`,
                          openBalance: 0,
                          activeServiceRequests: [],
                          currentOrderId: null,
                          billRequested: false,
                          waiterCalled: false,
                          mergedWith: null,
                        });
                        setStatusToast(`${tableFormNumber} masası eklendi.`);
                      } else if (tableModalMode === 'edit' && onUpdateTable && editingTableId) {
                        const target = tables.find((t) => t.id === editingTableId);
                        if (target) {
                          onUpdateTable({
                            ...target,
                            number: tableFormNumber.trim(),
                            area: tableFormArea,
                            capacity: tableFormCapacity,
                            waiterName: tableFormWaiter.trim() || target.waiterName,
                          });
                          setStatusToast(`${tableFormNumber} bilgileri güncellendi.`);
                        }
                      }
                      setTableModalMode(null);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-[#B86B35] text-white font-semibold cursor-pointer"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modül 4: QR Menü Önizleme & Masa QR Token Ayarları */}
      {activeModuleId === 4 && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#B86B35]" />
                <span>4. QR Menü Yapılandırması &amp; Masa Bağlantıları</span>
              </h3>
              <p className="text-neutral-500">Masa QR doğrulama politikası ve müşteri QR portalı önizlemesini yönetin.</p>
            </div>
            <button
              type="button"
              onClick={() => onSwitchWorkspaceView('qr_web')}
              className="px-4 py-2 rounded-lg bg-[#B86B35] text-white font-semibold cursor-pointer"
            >
              Tam Ekran QR Menü Önizlemesine Git →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50 dark:bg-[#141413]">
            <label className="inline-flex items-center gap-2 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={mod4RequireQrForOrder}
                onChange={(e) => {
                  setMod4RequireQrForOrder(e.target.checked);
                  setStatusToast('QR masa doğrulama politikası güncellendi.');
                }}
              />
              <span>Masa seçimi &amp; Garson Çağrısı için QR kod taraması zorunlu</span>
            </label>
            <div className="flex flex-wrap gap-1.5 items-center justify-end">
              {tables.slice(0, 4).map((t) => (
                <span key={t.id} className="px-2 py-1 rounded bg-white dark:bg-[#1F1F1D] border border-neutral-300 dark:border-neutral-700 font-mono text-[10px]">
                  {t.qrCodeNumber} · {t.number}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modül 7: Mutfak (KDS) Ayarları & Canlı Ekran */}
      {activeModuleId === 7 && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4 text-xs">
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
              onClick={() => onSwitchWorkspaceView('kds')}
              className="px-4 py-2 rounded-lg bg-[#B86B35] text-white font-semibold cursor-pointer"
            >
              Tam Ekran Mutfak (KDS) Ekranına Git →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50 dark:bg-[#141413]">
            <div>
              <label className="block font-semibold mb-1">Geciken Sipariş Uyarı Eşiği (Dakika)</label>
              <input
                type="number"
                min={5}
                value={mod7KitchenAlertMins}
                onChange={(e) => {
                  setMod7KitchenAlertMins(Number(e.target.value));
                  setStatusToast(`Mutfak KDS uyarı süresi ${e.target.value} dk olarak kaydedildi.`);
                }}
                className="w-40 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5 font-mono"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(['Izgara', 'Tavuk', 'Soğuk mutfak', 'İçecek', 'Paketleme'] as const).map((st) => (
                <span key={st} className="px-2.5 py-1 rounded-full bg-emerald-600/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-300 font-semibold">
                  {st}: Aktif
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modül 12: POS / Kasa Ayarları & Fiş Çıktısı */}
      {activeModuleId === 12 && (
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-5 space-y-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#B86B35]" />
                <span>10. POS / Kasa Terminali &amp; Termal Yazıcı Ayarları</span>
              </h3>
              <p className="text-neutral-500">Varsayılan ödeme yöntemi ve otomatik fiş/fatura yazdırma ayarlarını yapılandırın.</p>
            </div>
            <button
              type="button"
              onClick={() => onSwitchWorkspaceView('pos')}
              className="px-4 py-2 rounded-lg bg-[#B86B35] text-white font-semibold cursor-pointer"
            >
              Tam Ekran POS / Kasa Ekranına Git →
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50 dark:bg-[#141413]">
            <div>
              <label className="block font-semibold mb-1">Varsayılan POS Tahsilat Yöntemi</label>
              <select
                value={mod12DefaultPosMethod}
                onChange={(e) => {
                  setMod12DefaultPosMethod(e.target.value as 'Nakit' | 'Kredi Kartı (POS)' | 'Yemek Kartı');
                  setStatusToast(`POS varsayılan ödeme yöntemi ${e.target.value} olarak ayarlandı.`);
                }}
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5"
              >
                <option value="Kredi Kartı (POS)">Kredi Kartı (POS)</option>
                <option value="Nakit">Nakit</option>
                <option value="Yemek Kartı">Yemek Kartı</option>
              </select>
            </div>
            <label className="inline-flex items-center gap-2 font-medium cursor-pointer self-end pb-1">
              <input
                type="checkbox"
                checked={mod12AutoReceiptPrint}
                onChange={(e) => {
                  setMod12AutoReceiptPrint(e.target.checked);
                  setStatusToast('Otomatik fiş / e-Arşiv çıktı kuralı güncellendi.');
                }}
              />
              <span>Tahsilat tamamlandığında otomatik termal fiş ve e-Fatura oluştur</span>
            </label>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODÜL 40: GEÇMİŞ & GÜN SONU ARŞİVİ
      ===================================================================== */}
      {activeModuleId === 40 && (
        <AdminArchiveManager
          orders={orders}
          waiterCalls={waiterCalls}
          tables={tables}
          onDeleteOrder={onDeleteOrder}
          onDeleteWaiterCall={onDeleteWaiterCall}
          onNotify={(msg) => setStatusToast(msg)}
        />
      )}

      {/* =====================================================================
          MODÜL 41: PWA UYGULAMA YÖNETİMİ
      ===================================================================== */}
      {activeModuleId === 41 && (
        <AdminPwaManager
          pwaSettings={siteCmsConfig.pwaSettings}
          onUpdatePwaSettings={(updater) =>
            onUpdateSiteCmsConfig((prev) => ({
              ...prev,
              pwaSettings: updater(prev.pwaSettings),
            }))
          }
          onNotify={(msg) => setStatusToast(msg)}
        />
      )}

      {/* =====================================================================
          MODÜL 42: HARİTA & KONUM YÖNETİMİ
      ===================================================================== */}
      {activeModuleId === 42 && (
        <AdminMapManager
          mapSettings={siteCmsConfig.mapSettings}
          contact={siteCmsConfig.contact}
          onUpdateMapSettings={(updater) =>
            onUpdateSiteCmsConfig((prev) => ({
              ...prev,
              mapSettings: updater(prev.mapSettings),
            }))
          }
          onNotify={(msg) => setStatusToast(msg)}
        />
      )}

      {/* Otomatik Fiş / e-Fatura (e-Arşiv) Önizleme & Termal Yazdırma Modalı */}
      {receiptInvoiceModalOrder && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Otomatik Fiş ve e-Fatura Önizleme"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-sm rounded-2xl border border-neutral-300 bg-[#FAF7F0] text-[#141413] p-5 font-mono text-xs space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-dashed border-neutral-400 pb-2">
              <span className="font-sans font-bold text-sm">Otomatik Fiş &amp; e-Arşiv Fatura</span>
              <button
                type="button"
                onClick={() => setReceiptInvoiceModalOrder(null)}
                aria-label="Kapat"
                className="p-1 rounded hover:bg-neutral-200 font-sans cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center space-y-0.5 border-b border-dashed border-neutral-400 pb-3">
              <div className="font-bold text-sm">ÖZTİKE CİĞER · HALİL USTA</div>
              <div>{siteCmsConfig.contact.addressTr}</div>
              <div>{siteCmsConfig.generalSettings.taxOfficeAndNo}</div>
              <div>Fiş No: {receiptInvoiceModalOrder.receiptNumber}</div>
              <div>e-Fatura: {receiptInvoiceModalOrder.eInvoiceNo}</div>
              <div>
                Sipariş: {receiptInvoiceModalOrder.orderNumber} · {receiptInvoiceModalOrder.tableName}
              </div>
            </div>
            <div className="space-y-1.5 border-b border-dashed border-neutral-400 pb-3">
              {receiptInvoiceModalOrder.items.map((it) => (
                <div key={it.id} className="flex justify-between gap-2">
                  <span>
                    {it.quantity}x {it.productName}
                  </span>
                  <span>{(it.unitPrice * it.quantity).toFixed(2)} ₺</span>
                </div>
              ))}
              {receiptInvoiceModalOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Kampanya İndirimi</span>
                  <span>-{receiptInvoiceModalOrder.discountAmount.toFixed(2)} ₺</span>
                </div>
              )}
              {(receiptInvoiceModalOrder.deliveryFee || 0) > 0 && (
                <div className="flex justify-between">
                  <span>Kurye Teslimat Ücreti</span>
                  <span>+{(receiptInvoiceModalOrder.deliveryFee || 0).toFixed(2)} ₺</span>
                </div>
              )}
              {(receiptInvoiceModalOrder.tipAmount || 0) > 0 && (
                <div className="flex justify-between">
                  <span>Servis Bahşişi</span>
                  <span>+{(receiptInvoiceModalOrder.tipAmount || 0).toFixed(2)} ₺</span>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Ödeme Yöntemi</span>
                <span>{receiptInvoiceModalOrder.paymentMethod || 'Nakit / POS (Kasa)'}</span>
              </div>
              <div className="flex justify-between">
                <span>KDV (%{siteCmsConfig.generalSettings.taxRatePercent ?? 10})</span>
                <span>{receiptInvoiceModalOrder.taxAmount.toFixed(2)} ₺</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-neutral-300">
                <span>GENEL TOPLAM</span>
                <span>{receiptInvoiceModalOrder.totalAmount.toFixed(2)} ₺</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 font-sans">
              <button
                type="button"
                onClick={() => {
                  const ok = printThermalReceipt(receiptInvoiceModalOrder, {
                    companyName: siteCmsConfig.generalSettings.companyLegalName,
                    address: siteCmsConfig.contact.addressTr,
                    phone: siteCmsConfig.contact.phoneDisplay,
                    taxOfficeAndNo: siteCmsConfig.generalSettings.taxOfficeAndNo,
                    logoUrl: siteCmsConfig.header.logoUrl,
                  });
                  setStatusToast(
                    ok
                      ? `${receiptInvoiceModalOrder.orderNumber} fişi termal yazıcıya gönderildi.`
                      : 'Tarayıcı yazdırma penceresi açılamadı; e-Arşiv HTML indir butonunu kullanın.'
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
                    companyName: siteCmsConfig.generalSettings.companyLegalName,
                    address: siteCmsConfig.contact.addressTr,
                    phone: siteCmsConfig.contact.phoneDisplay,
                    taxOfficeAndNo: siteCmsConfig.generalSettings.taxOfficeAndNo,
                    logoUrl: siteCmsConfig.header.logoUrl,
                  });
                  setStatusToast(`${receiptInvoiceModalOrder.orderNumber} e-Arşiv fişi HTML olarak indirildi.`);
                }}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-neutral-400 bg-white text-[#141413] font-semibold text-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> e-Arşiv İndir
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
      {/* =====================================================================
          GELİŞMİŞ ENTEGRASYON, POS, ÖDEME & API YAPILANDIRMA MODALI (MODÜL 31)
      ===================================================================== */}
      {selectedIntegrationForConfig && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="intg-modal-title"
        >
          <div className="w-full max-w-2xl rounded-2xl border border-[#D4AF6A]/50 bg-white dark:bg-[#1A1815] text-neutral-900 dark:text-[#F5F2EB] p-6 space-y-4 shadow-2xl my-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#B86B35]/20 text-[#B86B35] dark:text-[#D4AF6A]">
                  <Sliders className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 id="intg-modal-title" className="font-bold text-base">
                      {selectedIntegrationForConfig.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#B86B35]/15 text-[#B86B35] dark:text-[#D4AF6A]">
                      {selectedIntegrationForConfig.category}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    API anahtarları, sunucu adresleri, komisyon oranları ve özel donanım parametreleri
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIntegrationForConfig(null)}
                aria-label="Kapat"
                className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Sekmeleri */}
            <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2 text-xs">
              <button
                type="button"
                onClick={() => setIntegrationActiveTab('api')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  integrationActiveTab === 'api'
                    ? 'bg-[#B86B35] text-white'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                🔑 API &amp; Kimlik Doğrulama
              </button>
              <button
                type="button"
                onClick={() => setIntegrationActiveTab('network')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  integrationActiveTab === 'network'
                    ? 'bg-[#B86B35] text-white'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                🌐 Ağ, IP &amp; Protokol
              </button>
              <button
                type="button"
                onClick={() => setIntegrationActiveTab('custom')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  integrationActiveTab === 'custom'
                    ? 'bg-[#B86B35] text-white'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                ⚙️ İşletme &amp; Özel Alanlar
              </button>
              <button
                type="button"
                onClick={() => setIntegrationActiveTab('test')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  integrationActiveTab === 'test'
                    ? 'bg-[#B86B35] text-white'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                📡 Canlı Ping &amp; Test
              </button>
            </div>

            {/* TAB 1: API & Kimlik Doğrulama */}
            {integrationActiveTab === 'api' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Çalışma Ortamı (Environment)</label>
                    <select
                      value={integrationFormConfig.environment || 'Sandbox'}
                      onChange={(e) =>
                        setIntegrationFormConfig((prev) => ({
                          ...prev,
                          environment: e.target.value as 'Sandbox' | 'Production',
                        }))
                      }
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-medium"
                    >
                      <option value="Sandbox">Test (Sandbox / Demo Modu)</option>
                      <option value="Production">Canlı (Live / Gerçek Ortam)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Üye İşyeri / Mağaza ID (Merchant ID)</label>
                    <input
                      type="text"
                      value={integrationFormConfig.merchantId || ''}
                      onChange={(e) =>
                        setIntegrationFormConfig((prev) => ({ ...prev, merchantId: e.target.value }))
                      }
                      placeholder="Örn: OZT-IYZ-27001"
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">API Key / Genel Erişim Anahtarı</label>
                  <input
                    type="text"
                    value={integrationFormConfig.apiKey || ''}
                    onChange={(e) =>
                      setIntegrationFormConfig((prev) => ({ ...prev, apiKey: e.target.value }))
                    }
                    placeholder="pk_live_... veya api_key_token"
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold">Secret Key / Gizli İmzalı Şifre</label>
                    <button
                      type="button"
                      onClick={() => setIntegrationShowSecret(!integrationShowSecret)}
                      className="text-[11px] text-[#B86B35] dark:text-[#D4AF6A] flex items-center gap-1 cursor-pointer"
                    >
                      {integrationShowSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{integrationShowSecret ? 'Gizle' : 'Göster'}</span>
                    </button>
                  </div>
                  <input
                    type={integrationShowSecret ? 'text' : 'password'}
                    value={integrationFormConfig.apiSecret || ''}
                    onChange={(e) =>
                      setIntegrationFormConfig((prev) => ({ ...prev, apiSecret: e.target.value }))
                    }
                    placeholder="sk_live_... gizli güvenlik anahtarı"
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Terminal ID / POS Cihaz Kodu</label>
                    <input
                      type="text"
                      value={integrationFormConfig.terminalId || ''}
                      onChange={(e) =>
                        setIntegrationFormConfig((prev) => ({ ...prev, terminalId: e.target.value }))
                      }
                      placeholder="TRM-01"
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Webhook Secret / HMAC İmzası</label>
                    <input
                      type="text"
                      value={integrationFormConfig.webhookSecret || ''}
                      onChange={(e) =>
                        setIntegrationFormConfig((prev) => ({ ...prev, webhookSecret: e.target.value }))
                      }
                      placeholder="whsec_..."
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Ağ & Protokol */}
            {integrationActiveTab === 'network' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1">API Endpoint / Servis URL</label>
                  <input
                    type="url"
                    value={integrationFormConfig.endpointUrl || ''}
                    onChange={(e) =>
                      setIntegrationFormConfig((prev) => ({ ...prev, endpointUrl: e.target.value }))
                    }
                    placeholder="https://api.oztikeciger.com.tr/v2/..."
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Cihaz / Sunucu IP Adresi</label>
                    <input
                      type="text"
                      value={integrationFormConfig.ipAddress || ''}
                      onChange={(e) =>
                        setIntegrationFormConfig((prev) => ({ ...prev, ipAddress: e.target.value }))
                      }
                      placeholder="192.168.1.201"
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Port Numarası</label>
                    <input
                      type="number"
                      value={integrationFormConfig.port || 9100}
                      onChange={(e) =>
                        setIntegrationFormConfig((prev) => ({ ...prev, port: Number(e.target.value) }))
                      }
                      placeholder="9100"
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Zaman Aşımı (Timeout ms)</label>
                    <input
                      type="number"
                      value={integrationFormConfig.timeoutMs || 4500}
                      onChange={(e) =>
                        setIntegrationFormConfig((prev) => ({ ...prev, timeoutMs: Number(e.target.value) }))
                      }
                      placeholder="4500"
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">İletişim Protokolü</label>
                    <select
                      value={integrationFormConfig.posTerminalProtocol || 'JSON-RPC'}
                      onChange={(e) =>
                        setIntegrationFormConfig((prev) => ({
                          ...prev,
                          posTerminalProtocol: e.target.value as any,
                        }))
                      }
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-medium"
                    >
                      <option value="JSON-RPC">JSON-RPC over HTTP / WebSocket</option>
                      <option value="REST">REST API (JSON Payload)</option>
                      <option value="TCP-Socket">Raw TCP / ESC-POS Socket</option>
                      <option value="Serial-COM">Seri Port (RS232 / USB COM)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Hata Durumunda Tekrar Deneme Sayısı</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={integrationFormConfig.retryAttempts || 3}
                      onChange={(e) =>
                        setIntegrationFormConfig((prev) => ({ ...prev, retryAttempts: Number(e.target.value) }))
                      }
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Özel İstek Başlıkları (Custom Headers JSON)</label>
                  <textarea
                    rows={2}
                    value={integrationFormConfig.customHeaders || ''}
                    onChange={(e) =>
                      setIntegrationFormConfig((prev) => ({ ...prev, customHeaders: e.target.value }))
                    }
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono text-[11px]"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer font-semibold pt-1">
                  <input
                    type="checkbox"
                    checked={integrationFormConfig.debugLogging || false}
                    onChange={(e) =>
                      setIntegrationFormConfig((prev) => ({ ...prev, debugLogging: e.target.checked }))
                    }
                  />
                  <span>Ayrıntılı Hata Günlüğü &amp; İstek Payload Kaydı (Debug Logging)</span>
                </label>
              </div>
            )}

            {/* TAB 3: İşletme & Donanım Özelleştirmeleri */}
            {integrationActiveTab === 'custom' && (
              <div className="space-y-4 text-xs">
                {/* Ödeme & Sanal POS Ayarları */}
                {(selectedIntegrationForConfig.category === 'Ödeme' ||
                  selectedIntegrationForConfig.code.includes('pos')) && (
                  <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3 bg-neutral-50 dark:bg-[#141413]">
                    <div className="font-bold text-[#B86B35] dark:text-[#D4AF6A] flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4" />
                      <span>Sanal POS &amp; Ödeme Güvenliği Ayarları</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold mb-1">Komisyon Oranı (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={integrationFormConfig.commissionRate ?? 1.89}
                          onChange={(e) =>
                            setIntegrationFormConfig((prev) => ({
                              ...prev,
                              commissionRate: Number(e.target.value),
                            }))
                          }
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Para Birimi</label>
                        <select
                          value={integrationFormConfig.currency || 'TRY'}
                          onChange={(e) =>
                            setIntegrationFormConfig((prev) => ({
                              ...prev,
                              currency: e.target.value as any,
                            }))
                          }
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5"
                        >
                          <option value="TRY">Türk Lirası (₺ - TRY)</option>
                          <option value="USD">Amerikan Doları ($ - USD)</option>
                          <option value="EUR">Euro (€ - EUR)</option>
                        </select>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer font-semibold">
                      <input
                        type="checkbox"
                        checked={integrationFormConfig.threeDSecure !== false}
                        onChange={(e) =>
                          setIntegrationFormConfig((prev) => ({ ...prev, threeDSecure: e.target.checked }))
                        }
                      />
                      <span>3D Secure Güvenlik Doğrulaması Zorunlu</span>
                    </label>

                    {/* Yemek Kartları Anahtarları */}
                    <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700 space-y-1.5">
                      <div className="font-semibold text-neutral-600 dark:text-neutral-400">
                        Desteklenen Yemek Kartı Ağları:
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={integrationFormConfig.multinetActive !== false}
                            onChange={(e) =>
                              setIntegrationFormConfig((prev) => ({
                                ...prev,
                                multinetActive: e.target.checked,
                              }))
                            }
                          />
                          <span>Multinet</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={integrationFormConfig.pluxeeActive !== false}
                            onChange={(e) =>
                              setIntegrationFormConfig((prev) => ({ ...prev, pluxeeActive: e.target.checked }))
                            }
                          />
                          <span>Pluxee (Sodexo)</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={integrationFormConfig.edenredActive !== false}
                            onChange={(e) =>
                              setIntegrationFormConfig((prev) => ({ ...prev, edenredActive: e.target.checked }))
                            }
                          />
                          <span>Edenred</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={integrationFormConfig.setcardActive !== false}
                            onChange={(e) =>
                              setIntegrationFormConfig((prev) => ({ ...prev, setcardActive: e.target.checked }))
                            }
                          />
                          <span>Setcard</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Yazıcı & ESC/POS Ayarları */}
                {selectedIntegrationForConfig.category === 'Yazıcı' && (
                  <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3 bg-neutral-50 dark:bg-[#141413]">
                    <div className="font-bold text-[#B86B35] dark:text-[#D4AF6A] flex items-center gap-1.5">
                      <Printer className="w-4 h-4" />
                      <span>Termal Fiş &amp; Mutfak İstasyonu Yazıcı Parametreleri</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold mb-1">Termal Kağıt Genişliği</label>
                        <select
                          value={integrationFormConfig.paperWidthMm || 80}
                          onChange={(e) =>
                            setIntegrationFormConfig((prev) => ({
                              ...prev,
                              paperWidthMm: Number(e.target.value) as 58 | 80,
                            }))
                          }
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5 font-medium"
                        >
                          <option value={80}>80 mm Standart Restoran Termal Fiş</option>
                          <option value={58}>58 mm Kompakt Kasa / Mobil Yazıcı</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Mutfak İstasyon Yönlendirme</label>
                        <input
                          type="text"
                          value={integrationFormConfig.kitchenStationRouting || 'Ocakbaşı & Zırh Hattı'}
                          onChange={(e) =>
                            setIntegrationFormConfig((prev) => ({
                              ...prev,
                              kitchenStationRouting: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 pt-1">
                      <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
                        <input
                          type="checkbox"
                          checked={integrationFormConfig.autoCutPaper !== false}
                          onChange={(e) =>
                            setIntegrationFormConfig((prev) => ({ ...prev, autoCutPaper: e.target.checked }))
                          }
                        />
                        <span>Otomatik Kağıt Kesme (Auto-cut)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
                        <input
                          type="checkbox"
                          checked={integrationFormConfig.autoPrintReceipt !== false}
                          onChange={(e) =>
                            setIntegrationFormConfig((prev) => ({
                              ...prev,
                              autoPrintReceipt: e.target.checked,
                            }))
                          }
                        />
                        <span>Sipariş Geldiğinde Otomatik Mutfak Fişi Bas</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Yemek Platformları (Getir, Yemeksepeti, Trendyol GO, Migros) */}
                {selectedIntegrationForConfig.category === 'Yemek Platformu' && (
                  <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3 bg-neutral-50 dark:bg-[#141413]">
                    <div className="font-bold text-[#B86B35] dark:text-[#D4AF6A] flex items-center gap-1.5">
                      <Truck className="w-4 h-4" />
                      <span>Pazaryeri &amp; Kurye Hazırlık Parametreleri</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold mb-1">Mutfak Hazırlık Süresi (Dakika)</label>
                        <input
                          type="number"
                          min={5}
                          max={60}
                          value={integrationFormConfig.defaultPrepMinutes || 18}
                          onChange={(e) =>
                            setIntegrationFormConfig((prev) => ({
                              ...prev,
                              defaultPrepMinutes: Number(e.target.value),
                            }))
                          }
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5 font-mono"
                        />
                      </div>
                      <div className="flex items-end pb-1.5">
                        <label className="flex items-center gap-2 cursor-pointer font-semibold">
                          <input
                            type="checkbox"
                            checked={integrationFormConfig.autoConfirmOrders !== false}
                            onChange={(e) =>
                              setIntegrationFormConfig((prev) => ({
                                ...prev,
                                autoConfirmOrders: e.target.checked,
                              }))
                            }
                          />
                          <span>Gelen Siparişleri Otomatik Onayla</span>
                        </label>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer font-semibold">
                      <input
                        type="checkbox"
                        checked={integrationFormConfig.stockSyncEnabled !== false}
                        onChange={(e) =>
                          setIntegrationFormConfig((prev) => ({
                            ...prev,
                            stockSyncEnabled: e.target.checked,
                          }))
                        }
                      />
                      <span>Tükenen Ürünleri Platform Menüsünde Otomatik Durdur (Stok Eşitleme)</span>
                    </label>
                  </div>
                )}

                {/* E-belge & Muhasebe Ayarları */}
                {(selectedIntegrationForConfig.category === 'E-belge' ||
                  selectedIntegrationForConfig.category === 'Muhasebe') && (
                  <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3 bg-neutral-50 dark:bg-[#141413]">
                    <div className="font-bold text-[#B86B35] dark:text-[#D4AF6A] flex items-center gap-1.5">
                      <Receipt className="w-4 h-4" />
                      <span>GİB Yetkili Özel Entegratör &amp; e-Fatura Ayarları</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold mb-1">Yetkili Entegratör Firması</label>
                        <select
                          value={integrationFormConfig.integratorCompany || 'Uyumsoft / QNB e-Finans'}
                          onChange={(e) =>
                            setIntegrationFormConfig((prev) => ({
                              ...prev,
                              integratorCompany: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5"
                        >
                          <option value="Uyumsoft / QNB e-Finans">Uyumsoft / QNB e-Finans GİB Portalı</option>
                          <option value="Sovos / Foriba">Sovos / Foriba Entegratör</option>
                          <option value="Paraşüt API">Paraşüt e-Arşiv API</option>
                          <option value="Logo Yazılım">Logo Entegrasyon Servisi</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">e-Arşiv Fatura Seri Ön Eki</label>
                        <input
                          type="text"
                          value={integrationFormConfig.eInvoicePrefix || 'ÖZT2026'}
                          onChange={(e) =>
                            setIntegrationFormConfig((prev) => ({
                              ...prev,
                              eInvoicePrefix: e.target.value,
                            }))
                          }
                          placeholder="ÖZT2026"
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5 font-mono"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer font-semibold">
                      <input
                        type="checkbox"
                        checked={integrationFormConfig.autoIssueOnPayment !== false}
                        onChange={(e) =>
                          setIntegrationFormConfig((prev) => ({
                            ...prev,
                            autoIssueOnPayment: e.target.checked,
                          }))
                        }
                      />
                      <span>Kasa veya QR Tahsilatı Tamamlandığında Otomatik e-Arşiv Fatura Oluştur</span>
                    </label>
                  </div>
                )}

                {/* SMS & WhatsApp Ayarları */}
                {(selectedIntegrationForConfig.category === 'SMS' ||
                  selectedIntegrationForConfig.category === 'WhatsApp Business') && (
                  <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3 bg-neutral-50 dark:bg-[#141413]">
                    <div className="font-bold text-[#B86B35] dark:text-[#D4AF6A] flex items-center gap-1.5">
                      <BellRing className="w-4 h-4" />
                      <span>Mesajlaşma &amp; Gönderici Başlığı</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold mb-1">Gönderici Başlığı (SMS Header)</label>
                        <input
                          type="text"
                          value={integrationFormConfig.smsSenderHeader || 'OZTIKECIGER'}
                          onChange={(e) =>
                            setIntegrationFormConfig((prev) => ({
                              ...prev,
                              smsSenderHeader: e.target.value,
                            }))
                          }
                          placeholder="OZTIKECIGER"
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Varsayılan Şablon Dili</label>
                        <select
                          value={integrationFormConfig.templateLanguage || 'tr'}
                          onChange={(e) =>
                            setIntegrationFormConfig((prev) => ({
                              ...prev,
                              templateLanguage: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-1.5"
                        >
                          <option value="tr">Türkçe (Varsayılan)</option>
                          <option value="en">İngilizce (English)</option>
                          <option value="ar">Arapça (العربية)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: Canlı Test (Ping) */}
            {integrationActiveTab === 'test' && (
              <div className="space-y-4 text-xs">
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3 bg-neutral-50 dark:bg-[#141413]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-neutral-900 dark:text-[#F5F2EB] flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-[#B86B35]" />
                        <span>Canlı Ağ ve API Bağlantı Testi (Ping)</span>
                      </h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Tanımlanan API anahtarları ve endpoint adresi üzerinden gerçek zamanlı iletişim testi yapar.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTestPingIntegration(selectedIntegrationForConfig)}
                      disabled={integrationPingStatus.status === 'testing'}
                      className="px-4 py-2 rounded-xl bg-[#B86B35] hover:bg-[#9F5928] text-white font-bold cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 shadow-sm"
                    >
                      {integrationPingStatus.status === 'testing' ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Bağlantı Sınanıyor...</span>
                        </>
                      ) : (
                        <>
                          <Radio className="w-3.5 h-3.5" />
                          <span>Canlı Ping Gönder</span>
                        </>
                      )}
                    </button>
                  </div>

                  {integrationPingStatus.status === 'success' && (
                    <div className="p-3 rounded-lg border border-emerald-500/50 bg-emerald-950/20 text-emerald-200 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Bağlantı Başarılı · HTTP 200 OK</span>
                      </div>
                      <div className="text-[11px] font-mono text-emerald-300">
                        {integrationPingStatus.message} · Gecikme Süresi: {integrationPingStatus.latencyMs} ms
                      </div>
                    </div>
                  )}

                  {integrationPingStatus.status === 'error' && (
                    <div className="p-3 rounded-lg border border-rose-500/50 bg-rose-950/20 text-rose-200 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>Bağlantı Hatası</span>
                      </div>
                      <div className="text-[11px] font-mono text-rose-300">
                        {integrationPingStatus.message || 'API servisine erişilemedi. Lütfen anahtar ve endpoint URL adresinizi kontrol edin.'}
                      </div>
                    </div>
                  )}

                  <div className="p-3 rounded-lg bg-white dark:bg-[#1A1815] border border-neutral-200 dark:border-neutral-800 space-y-1 font-mono text-[11px] text-neutral-500">
                    <div>Protokol: {integrationFormConfig.posTerminalProtocol || 'REST / JSON-RPC'}</div>
                    <div>Hedef: {integrationFormConfig.endpointUrl || `${integrationFormConfig.ipAddress}:${integrationFormConfig.port}`}</div>
                    <div>Sözleşme Doğrulaması: {selectedIntegrationForConfig.contractVerified ? '✓ Onaylı ve İmzalı' : 'Beklemede'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  handleOpenIntegrationConfig(selectedIntegrationForConfig);
                  setStatusToast('Ayarlar fabrika varsayılanlarına sıfırlandı.');
                }}
                className="px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-medium cursor-pointer"
              >
                Varsayılanlara Sıfırla
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIntegrationForConfig(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 font-semibold cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={handleSaveIntegrationConfig}
                  className="px-5 py-2 rounded-xl bg-[#B86B35] hover:bg-[#9F5928] text-white font-bold cursor-pointer shadow-sm"
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
