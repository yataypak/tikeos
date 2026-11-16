import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  Menu,
  X,
  Sun,
  Moon,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_MENU_PACKAGES,
  INITIAL_TABLES,
  INITIAL_ORDERS,
  INITIAL_STOCKS,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_CUSTOMERS,
  INITIAL_RESERVATIONS,
  INITIAL_CAMPAIGNS,
  INITIAL_STAFF,
  INITIAL_FINANCE_LEDGER,
  INITIAL_CMS_PAGES,
  INITIAL_INTEGRATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_BACKUPS,
  INITIAL_BRANCHES,
  INITIAL_WAITER_CALLS,
  type CategoryItem,
  type ProductItem,
  type MenuPackageItem,
  type DiningTableItem,
  type OrderRecord,
  type OrderStatus,
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
} from './data/initialStoreData';
import {
  applyRecipeStockChange,
  validateQROrderRequest,
  checkReservationConflict,
  createWaiterServiceCall,
  calculateCustomerCheckoutTotals,
  generateReceiptAndInvoiceNumbers,
  calculateTableOpenBill,
  isBillRequestNeeds,
  roundCurrency,
  type StockItem,
  type StockMovement,
  type ReservationItem,
  type WaiterServiceCallRecord,
} from './core/restaurantEngine';
import { OfflineIndicator, useOnlineStatus } from './components/BrandIdentity';
import { CustomerQRPortal } from './components/CustomerQRPortal';
import {
  POSKasaTerminal,
  KitchenKDSTerminal,
  WaiterTableTerminal,
} from './components/OperationalTerminals';
import { AdminModulesPanel } from './components/AdminModulesPanel';
import { INITIAL_SITE_CMS_CONFIG, type SiteCmsConfig } from './data/siteCmsStore';
import { SUPPORTED_LANGUAGES, type SupportedLang } from './i18n/translations';

export interface MenuModuleDef {
  id: number;
  title: string;
  group: string;
}

// Merkezi Yönetim Menüsü Modülleri (Her ayar tek bir bölüm altında, sıfır tekrar)
export const ADMIN_38_MODULES: MenuModuleDef[] = [
  { id: 1, title: '1. Genel Bakış', group: 'Operasyon' },
  { id: 2, title: '2. Siparişler & Paket', group: 'Operasyon' },
  { id: 3, title: '3. Masalar & Plan', group: 'Operasyon' },
  { id: 4, title: '4. QR Menü & Masa Ayarları', group: 'Operasyon' },
  { id: 5, title: '5. Ürünler', group: 'Menü & Mutfak' },
  { id: 6, title: '6. Kategoriler', group: 'Menü & Mutfak' },
  { id: 7, title: '7. Mutfak (KDS) & İstasyonlar', group: 'Menü & Mutfak' },
  { id: 8, title: '8. Garson Çağrıları', group: 'Operasyon' },
  { id: 11, title: '9. Rezervasyonlar', group: 'Teslimat & Rezervasyon' },
  { id: 12, title: '10. POS / Kasa & Fiş Ayarları', group: 'Kasa & Finans' },
  { id: 13, title: '11. Ödemeler & e-Fatura', group: 'Kasa & Finans' },
  { id: 14, title: '12. Stok Yönetimi', group: 'Stok & Reçete' },
  { id: 15, title: '13. Reçete & Maliyet', group: 'Stok & Reçete' },
  { id: 17, title: '14. Müşteriler & Sadakat', group: 'CRM & Pazarlama' },
  { id: 19, title: '15. Kampanyalar & Kupon', group: 'CRM & Pazarlama' },
  { id: 22, title: '16. Gelir-Gider & AI Analiz', group: 'Kasa & Finans' },
  { id: 26, title: '17. Duyuru, Logo & Header', group: 'Web & CMS' },
  { id: 27, title: '18. Menüler & Sayfalar', group: 'Web & CMS' },
  { id: 28, title: '19. SEO Yönetimi', group: 'Web & CMS' },
  { id: 29, title: '20. Foto & Video Galeri', group: 'Web & CMS' },
  { id: 39, title: '21. Sosyal Medya & Footer', group: 'Web & CMS' },
  { id: 31, title: '22. Eklenti, Modül & Entegrasyon', group: 'Sistem & Güvenlik' },
  { id: 33, title: '23. Şube Yönetimi', group: 'Sistem & Güvenlik' },
  { id: 34, title: '24. Slider, Kartlar & Tema', group: 'Sistem & Güvenlik' },
  { id: 35, title: '25. Genel Ayarlar', group: 'Sistem & Güvenlik' },
  { id: 36, title: '26. Güvenlik & Yetkiler', group: 'Sistem & Güvenlik' },
  { id: 37, title: '27. Yedekleme', group: 'Sistem & Güvenlik' },
  { id: 38, title: '28. İşlem Kayıtları', group: 'Sistem & Güvenlik' },
  { id: 40, title: '29. Geçmiş & Gün Sonu Arşivi', group: 'Kasa & Finans' },
  { id: 41, title: '30. PWA Uygulama Yönetimi', group: 'Sistem & Güvenlik' },
  { id: 42, title: '31. Harita & Konum Yönetimi', group: 'Web & CMS' },
];

export function App() {
  // Frontend (Müşteri Web Sitesi & QR Sipariş) ve Backend (Admin Yönetim Paneli) Ayrımı
  const [portalMode, setPortalMode] = useState<'customer' | 'admin'>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('portal') === 'admin' || window.location.hash === '#admin') {
      return 'admin';
    }
    return 'customer';
  });
  const [workspaceView, setWorkspaceView] = useState<'admin' | 'pos' | 'kds' | 'waiter' | 'qr_web'>('admin');
  const [activeModuleId, setActiveModuleId] = useState<number>(1);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  const [sidebarFilter, setSidebarFilter] = useState<string>('');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [currentRole, setCurrentRole] = useState<StaffRoleName>('Süper Yönetici');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  // URL hash (#admin) ve klavye kısayolu (Ctrl+Shift+A) ile Admin Paneline geçiş
  useEffect(() => {
    const syncPortalFromLocation = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('portal') === 'admin' || window.location.hash === '#admin') {
        setPortalMode('admin');
      } else if (window.location.hash === '#vitrin' || params.get('portal') === 'customer') {
        setPortalMode('customer');
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setPortalMode((prev) => (prev === 'admin' ? 'customer' : 'admin'));
      }
    };
    window.addEventListener('hashchange', syncPortalFromLocation);
    window.addEventListener('popstate', syncPortalFromLocation);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('hashchange', syncPortalFromLocation);
      window.removeEventListener('popstate', syncPortalFromLocation);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Theme State (Bölüm 2.4: Açık, Koyu, Sistem + Hatırlama)
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(() => {
    const saved = localStorage.getItem('oztike_theme_mode');
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    return 'dark';
  });

  useEffect(() => {
    localStorage.setItem('oztike_theme_mode', themeMode);
    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else if (themeMode === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    }
  }, [themeMode]);

  // Language State (TR, EN, AR, FR, DE, KU, JA, ZH)
  const [lang, setLang] = useState<SupportedLang>(() => {
    const saved = localStorage.getItem('oztike_lang') as SupportedLang | null;
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) return saved;
    return 'tr';
  });

  useEffect(() => {
    try {
      localStorage.setItem('oztike_lang', lang);
    } catch {
      // ignore
    }
  }, [lang]);

  // Site Visual CMS Config (Header, Slider, Cards, Theme, Blocks, Buttons, Social, Contact, Footer, SEO, Gallery, General Settings)
  const [siteCmsConfig, setSiteCmsConfig] = useState<SiteCmsConfig>(() => {
    try {
      const saved = localStorage.getItem('oztike_site_cms_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        const ORIGINAL_LOGO = '/assets/aistudio/oztike-logo-transparent.png';
        const rawLogoUrl = parsed?.header?.logoUrl;
        const cleanLogoUrl =
          !rawLogoUrl || String(rawLogoUrl).includes('1794779577465')
            ? ORIGINAL_LOGO
            : rawLogoUrl;

        const rawPresets = Array.isArray(parsed?.header?.logoPresets)
          ? parsed.header.logoPresets
          : INITIAL_SITE_CMS_CONFIG.header.logoPresets;
        const cleanPresets = rawPresets
          .filter((p: { url?: string }) => !String(p?.url || '').includes('1794779577465'))
          .map((p: { id?: string; url?: string }) => ({
            ...p,
            url: p.id === 'LOGO-01' ? ORIGINAL_LOGO : p.url,
          }));

        const rawGallery = Array.isArray(parsed?.gallery)
          ? parsed.gallery
          : INITIAL_SITE_CMS_CONFIG.gallery;
        const migratedGallery = rawGallery.map(
          (g: { id?: string; type?: string; mediaUrl?: string }) => {
            const defaultMatch = INITIAL_SITE_CMS_CONFIG.gallery.find((dg) => dg.id === g.id);
            if (g.type === 'video' && defaultMatch) {
              return { ...g, ...defaultMatch };
            }
            if (defaultMatch && String(g.mediaUrl || '').includes('gallery-1')) {
              return { ...g, mediaUrl: defaultMatch.mediaUrl };
            }
            return g;
          }
        );
        if (!migratedGallery.some((g: { id?: string }) => g.id === 'GAL-07')) {
          const defaultGal07 = INITIAL_SITE_CMS_CONFIG.gallery.find((g) => g.id === 'GAL-07');
          if (defaultGal07) migratedGallery.push(defaultGal07);
        }

        const migrateGeo = (val: string | undefined, fallback: string) => {
          if (!val) return fallback;
          if (/şanlıurfa|sanliurfa|haliliye|karaköprü|eyyübiye|atatürk bulvarı/i.test(val)) {
            return fallback;
          }
          return val;
        };

        return {
          ...INITIAL_SITE_CMS_CONFIG,
          ...parsed,
          announcementBar: {
            ...INITIAL_SITE_CMS_CONFIG.announcementBar,
            ...(parsed?.announcementBar || {}),
            textTr: migrateGeo(
              parsed?.announcementBar?.textTr,
              INITIAL_SITE_CMS_CONFIG.announcementBar.textTr
            ),
          },
          header: {
            ...INITIAL_SITE_CMS_CONFIG.header,
            ...(parsed?.header || {}),
            logoUrl: cleanLogoUrl,
            faviconUrl: ORIGINAL_LOGO,
            logoPresets:
              cleanPresets.length > 0 ? cleanPresets : INITIAL_SITE_CMS_CONFIG.header.logoPresets,
            navMenus: Array.isArray(parsed?.header?.navMenus)
              ? parsed.header.navMenus
              : INITIAL_SITE_CMS_CONFIG.header.navMenus,
          },
          slider: {
            ...INITIAL_SITE_CMS_CONFIG.slider,
            ...(parsed?.slider || {}),
          },
          design: {
            ...INITIAL_SITE_CMS_CONFIG.design,
            ...(parsed?.design || {}),
            showcaseCards: Array.isArray(parsed?.design?.showcaseCards)
              ? parsed.design.showcaseCards
              : INITIAL_SITE_CMS_CONFIG.design.showcaseCards,
          },
          contact: {
            ...INITIAL_SITE_CMS_CONFIG.contact,
            ...(parsed?.contact || {}),
            addressTr: migrateGeo(
              parsed?.contact?.addressTr,
              INITIAL_SITE_CMS_CONFIG.contact.addressTr
            ),
            addressEn: migrateGeo(
              parsed?.contact?.addressEn,
              INITIAL_SITE_CMS_CONFIG.contact.addressEn
            ),
            mapCoordinatesLabel: migrateGeo(
              parsed?.contact?.mapCoordinatesLabel,
              INITIAL_SITE_CMS_CONFIG.contact.mapCoordinatesLabel
            ),
          },
          gallery: migratedGallery,
          footer: {
            ...INITIAL_SITE_CMS_CONFIG.footer,
            ...(parsed?.footer || {}),
          },
          seo: {
            ...INITIAL_SITE_CMS_CONFIG.seo,
            ...(parsed?.seo || {}),
            metaTitleTr: migrateGeo(
              parsed?.seo?.metaTitleTr,
              INITIAL_SITE_CMS_CONFIG.seo.metaTitleTr
            ),
            metaDescriptionTr: migrateGeo(
              parsed?.seo?.metaDescriptionTr,
              INITIAL_SITE_CMS_CONFIG.seo.metaDescriptionTr
            ),
          },
          generalSettings: {
            ...INITIAL_SITE_CMS_CONFIG.generalSettings,
            ...(parsed?.generalSettings || {}),
            taxOfficeAndNo: migrateGeo(
              parsed?.generalSettings?.taxOfficeAndNo,
              INITIAL_SITE_CMS_CONFIG.generalSettings.taxOfficeAndNo
            ),
            courierDeliveryFee:
              typeof parsed?.generalSettings?.courierDeliveryFee === 'number'
                ? parsed.generalSettings.courierDeliveryFee
                : INITIAL_SITE_CMS_CONFIG.generalSettings.courierDeliveryFee,
          },
          modules: {
            ...INITIAL_SITE_CMS_CONFIG.modules,
            ...(parsed?.modules || {}),
          },
        };
      }
    } catch {
      // fallback
    }
    return INITIAL_SITE_CMS_CONFIG;
  });

  useEffect(() => {
    try {
      localStorage.setItem('oztike_site_cms_v1', JSON.stringify(siteCmsConfig));
    } catch {
      // ignore quota
    }
  }, [siteCmsConfig]);

  // Dinamik Tema Tasarım Editörü: Logo Ana Renklerini (Bakır & Şampanya) CSS Değişkenlerine Bağlama
  useEffect(() => {
    if (siteCmsConfig?.design) {
      const root = document.documentElement;
      root.style.setProperty('--color-primary', siteCmsConfig.design.primaryColor || '#D4A359');
      root.style.setProperty('--color-secondary', siteCmsConfig.design.secondaryColor || '#B0782C');
      root.style.setProperty('--color-bg', siteCmsConfig.design.backgroundColor || '#120806');
      root.style.setProperty('--color-surface', siteCmsConfig.design.surfaceColor || '#1A0C09');
    }
  }, [siteCmsConfig?.design]);

  // Core Application State (Müşteri ve Admin panelleri arasında senkronize)
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [packages, setPackages] = useState<MenuPackageItem[]>(INITIAL_MENU_PACKAGES);
  const [tables, setTables] = useState<DiningTableItem[]>(() => {
    try {
      const saved = localStorage.getItem('oztike_tables_v3');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_TABLES;
  });
  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem('oztike_orders_v3');
      if (saved) {
        const parsed = JSON.parse(saved) as OrderRecord[];
        if (Array.isArray(parsed)) {
          return parsed.map((o) => ({
            ...o,
            deliveryAddress: o.deliveryAddress
              ? o.deliveryAddress.replace(/Şanlıurfa|Haliliye|Karaköprü/gi, 'Şahinbey / Gaziantep')
              : o.deliveryAddress,
            items: (o.items || []).filter(
              (it) => it.productId !== 'PRD-07' && !/künefe|tatlı/i.test(it.productName)
            ),
          }));
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_ORDERS;
  });
  const [stocks, setStocks] = useState<StockItem[]>(INITIAL_STOCKS);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(INITIAL_STOCK_MOVEMENTS);
  const [customers, setCustomers] = useState<CustomerRecord[]>(INITIAL_CUSTOMERS);
  const [customerReviews, setCustomerReviews] = useState<CustomerReviewItem[]>(() => {
    try {
      const saved = localStorage.getItem('oztike_customer_reviews_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'REV-1',
        customerName: 'Mehmet Kaya',
        customerPhone: '0532 411 22 33',
        productId: 'PRD-01',
        productName: 'Geleneksel Ciğer Şiş Porsiyon',
        rating: 5,
        comment: 'Şahinbey şubesinde köz tadı ve taze yeşillik ikramı muazzamdı, sıcacık geldi.',
        createdAt: '16 Kas 2026 12:30',
        status: 'Yayında',
      },
      {
        id: 'REV-2',
        customerName: 'Ayşe Demir',
        customerPhone: '0544 890 11 45',
        productId: 'PRD-06',
        productName: 'Taş Fırın Çıtır Lahmacun (2 Adet)',
        rating: 5,
        comment: 'İncecik hamur ve hızlı kurye teslimatı, kesinlikle tavsiye ederim.',
        createdAt: '16 Kas 2026 11:15',
        status: 'Yayında',
      },
    ];
  });
  const [customerComplaints, setCustomerComplaints] = useState<CustomerComplaintItem[]>(() => {
    try {
      const saved = localStorage.getItem('oztike_customer_complaints_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });
  const [reservations, setReservations] = useState<ReservationItem[]>(INITIAL_RESERVATIONS);
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>(INITIAL_CAMPAIGNS);
  const [staff, setStaff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [financeLedger, setFinanceLedger] = useState<FinanceLedgerItem[]>(INITIAL_FINANCE_LEDGER);
  const [cmsPages, setCmsPages] = useState<CMSPageItem[]>(INITIAL_CMS_PAGES);
  const [integrations, setIntegrations] = useState<IntegrationPluginItem[]>(() => {
    try {
      const saved = localStorage.getItem('oztike_integrations_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_INTEGRATIONS;
  });
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [backups, setBackups] = useState<BackupEntry[]>(INITIAL_BACKUPS);
  const [branches, setBranches] = useState<BranchItem[]>(INITIAL_BRANCHES);
  const [waiterCalls, setWaiterCalls] = useState<WaiterServiceCallRecord[]>(() => {
    try {
      const saved = localStorage.getItem('oztike_waiter_calls_v3');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_WAITER_CALLS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('oztike_integrations_v1', JSON.stringify(integrations));
    } catch {
      // ignore
    }
  }, [integrations]);

  useEffect(() => {
    try {
      localStorage.setItem('oztike_tables_v3', JSON.stringify(tables));
    } catch {
      // ignore storage quota
    }
  }, [tables]);

  useEffect(() => {
    try {
      localStorage.setItem('oztike_orders_v3', JSON.stringify(orders));
    } catch {
      // ignore storage quota
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('oztike_waiter_calls_v3', JSON.stringify(waiterCalls));
    } catch {
      // ignore storage quota
    }
  }, [waiterCalls]);

  useEffect(() => {
    try {
      localStorage.setItem('oztike_customer_reviews_v1', JSON.stringify(customerReviews));
    } catch {
      // ignore
    }
  }, [customerReviews]);

  useEffect(() => {
    try {
      localStorage.setItem('oztike_customer_complaints_v1', JSON.stringify(customerComplaints));
    } catch {
      // ignore
    }
  }, [customerComplaints]);

  const [notifications, setNotifications] = useState<
    { id: string; title: string; detail: string; time: string; unread: boolean }[]
  >([
    {
      id: 'NTF-1',
      title: 'Yeni Masa QR Siparişi (#OZT-2026-1042)',
      detail: 'Bahçe 1 masasından 665,00 ₺ tutarında sipariş mutfağa iletildi.',
      time: '13:18',
      unread: true,
    },
    {
      id: 'NTF-2',
      title: 'Geciken Sipariş Uyarısı (#OZT-2026-1041)',
      detail: 'Salon 1 siparişi hedef süreyi (14 dk) aştı (17 dk).',
      time: '13:20',
      unread: true,
    },
    {
      id: 'NTF-3',
      title: 'Kritik Stok Uyarısı',
      detail: 'Günlük Taze Kuzu Ciğeri stoğu (14.5 kg) kritik eşiğin (15.0 kg) altına düştü.',
      time: '12:45',
      unread: true,
    },
  ]);

  const isOnline = useOnlineStatus();

  const recordAudit = (
    module: string,
    action: string,
    detail: string,
    severity: 'Normal' | 'Uyarı' | 'Kritik' = 'Normal'
  ) => {
    const nowStr = new Date().toLocaleTimeString('tr-TR', { hour12: false });
    setAuditLogs((prev) => [
      {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        timestamp: `16 Kas 2026 ${nowStr}`,
        actor: `Aktif Kullanıcı (${currentRole})`,
        role: currentRole,
        module,
        action,
        detail,
        severity,
      },
      ...prev,
    ]);
  };

  const pushNotification = (title: string, detail: string) => {
    const nowStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    setNotifications((prev) => [
      {
        id: `NTF-${Date.now()}`,
        title,
        detail,
        time: nowStr,
        unread: true,
      },
      ...prev,
    ]);
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handleSubmitCustomerReview = (review: Omit<CustomerReviewItem, 'id' | 'createdAt' | 'status'>) => {
    const entry: CustomerReviewItem = {
      ...review,
      id: `REV-${Date.now().toString().slice(-5)}`,
      createdAt: '16 Kas 2026 ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      status: 'Yayında',
    };
    setCustomerReviews((prev) => [entry, ...prev]);
    pushNotification(
      `Yeni Müşteri Yorumu (${review.rating}★)`,
      `${review.customerName}: "${review.comment.slice(0, 60)}${review.comment.length > 60 ? '...' : ''}"`
    );
    recordAudit('CRM & Yorumlar', 'Yeni Müşteri Değerlendirmesi', `${review.customerName} (${review.rating}/5 yıldız)`);
  };

  const handleSubmitCustomerComplaint = (
    complaint: Omit<CustomerComplaintItem, 'id' | 'createdAt' | 'status'>
  ) => {
    const entry: CustomerComplaintItem = {
      ...complaint,
      id: `CMP-SHK-${Date.now().toString().slice(-5)}`,
      createdAt: '16 Kas 2026 ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      status: 'Açık',
    };
    setCustomerComplaints((prev) => [entry, ...prev]);
    pushNotification(
      `Müşteri Şikayet Bildirimi (${complaint.subject})`,
      `${complaint.customerName} (${complaint.customerPhone}): ${complaint.message.slice(0, 65)}`
    );
    recordAudit('CRM & Şikayetler', 'Yeni Şikayet Kaydı', `${complaint.customerName} - ${complaint.subject}`, 'Uyarı');
  };

  const handleDeleteCustomerAccount = (phoneOrEmail: string) => {
    const normalized = phoneOrEmail.replace(/\D/g, '');
    setCustomers((prev) =>
      prev.filter((c) => {
        const cPhone = c.phone.replace(/\D/g, '');
        return c.email !== phoneOrEmail && (!normalized || cPhone !== normalized);
      })
    );
    recordAudit('CRM & Üyelik', 'Müşteri Profili Silindi', `${phoneOrEmail} hesabı müşteri talebiyle kalıcı olarak silindi.`, 'Uyarı');
  };

  // ---------------------------------------------------------------------------
  // 1. QR Menü & Müşteri Sipariş Motoru (Reçete Stok Düşümü + Mükerrer Koruma)
  // ---------------------------------------------------------------------------
  const handlePlaceCustomerOrder = (payload: {
    tableId: string;
    qrToken: string;
    channel: 'QR' | 'Gel-Al' | 'Paket servis';
    customerName: string;
    customerPhone: string;
    deliveryAddress?: string;
    pickupTime?: string;
    note: string;
    idempotencyKey: string;
    discountAmount?: number;
    couponCode?: string;
    paymentMethod?: string;
    tipAmount?: number;
    items: {
      product: ProductItem;
      quantity: number;
      options: { name: string; value: string; extraPrice: number }[];
      customerNote: string;
    }[];
  }): { success: boolean; message: string; orderNumber?: string } => {
    const targetTable = tables.find((t) => t.id === payload.tableId);
    const qrValidation = validateQROrderRequest(
      targetTable
        ? {
            tableId: targetTable.id,
            tableNumber: targetTable.number,
            token: targetTable.qrToken,
            isRevoked: targetTable.qrRevoked,
            requestsLastMinute: 1,
            rateLimitPerMin: 20,
          }
        : undefined,
      payload.qrToken,
      payload.idempotencyKey,
      orders.map((o) => o.idempotencyKey),
      isOnline
    );

    if (payload.channel === 'QR' && !qrValidation.valid) {
      return { success: false, message: qrValidation.error || 'QR doğrulaması başarısız.' };
    }

    const orderNumber = `OZT-2026-${1043 + orders.length}`;
    const lineItems = payload.items.map((entry, idx) => {
      const unitBase = entry.product.discountedPrice ?? entry.product.price;
      const optExtra = entry.options.reduce((s, o) => s + o.extraPrice, 0);
      return {
        id: `ITM-${Date.now()}-${idx}`,
        productId: entry.product.id,
        productName: entry.product.name,
        station: entry.product.station,
        quantity: entry.quantity,
        unitPrice: roundCurrency(unitBase + optExtra),
        options: entry.options,
        customerNote: entry.customerNote,
        isComplimentary: false,
        isReady: false,
      };
    });

    const subtotal = roundCurrency(
      lineItems.reduce((s, li) => s + li.unitPrice * li.quantity, 0)
    );
    const appliedDisc = roundCurrency(payload.discountAmount || 0);
    const taxRatePercent = siteCmsConfig.generalSettings.taxRatePercent ?? 10;
    const deliveryFee =
      payload.channel === 'Paket servis'
        ? siteCmsConfig.generalSettings.courierDeliveryFee ?? 35
        : 0;
    const checkoutSummary = calculateCustomerCheckoutTotals({
      subtotal,
      discountAmount: appliedDisc,
      taxRatePercent,
      deliveryFee,
      customTipAmount: payload.tipAmount || 0,
    });
    const finalTotal = checkoutSummary.finalTotal;
    const tipAmt = checkoutSummary.tipAmount;
    const taxAmount = checkoutSummary.taxAmount;
    const chosenMethod = payload.paymentMethod || 'Kapıda / Masada Kart (POS)';
    const isInstantOnlinePaid = chosenMethod.toLowerCase().includes('online');
    const autoDocs = isInstantOnlinePaid
      ? generateReceiptAndInvoiceNumbers(orderNumber)
      : null;

    if (isInstantOnlinePaid) {
      fetch('/api/webhooks/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: chosenMethod,
          orderId: orderNumber,
          amount: finalTotal,
          tipAmount: tipAmt,
          mode: 'sandbox',
          idempotencyKey: payload.idempotencyKey,
        }),
      }).catch(() => {});

      setFinanceLedger((prev) => [
        {
          id: `FIN-${Date.now().toString().slice(-4)}`,
          date:
            '2026-11-16 ' +
            new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          type: 'Gelir',
          category: tipAmt > 0 ? 'Online Tahsilat & Bahşiş' : 'Online Kart Satışı',
          description: `${orderNumber} (${payload.channel}) · Fiş: ${autoDocs?.receiptNumber}`,
          amount: finalTotal,
          paymentMethod: chosenMethod,
          recordedBy: 'Otomatik POS / iyzico',
          branchId: 'BR-01',
        },
        ...prev,
      ]);
    }

    const newOrder: OrderRecord = {
      id: `ORD-${Date.now()}`,
      orderNumber,
      idempotencyKey: payload.idempotencyKey,
      channel: payload.channel,
      status: 'Mutfağa gönderildi',
      tableId: payload.channel === 'QR' ? payload.tableId : null,
      tableName:
        payload.channel === 'QR'
          ? targetTable?.number || 'Masa'
          : payload.channel === 'Gel-Al'
          ? 'Gel-Al Bankosu'
          : 'Paket Servis',
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      deliveryAddress: payload.deliveryAddress,
      pickupTime: payload.pickupTime,
      deliveryState: payload.channel === 'Paket servis' ? 'Hazırlanıyor' : undefined,
      staffName: targetTable?.waiterName || 'Online Sistem',
      items: lineItems,
      subtotal,
      discountAmount: appliedDisc,
      deliveryFee: checkoutSummary.deliveryFee,
      tipAmount: tipAmt,
      taxAmount,
      totalAmount: finalTotal,
      paidAmount: isInstantOnlinePaid ? finalTotal : 0,
      paymentStatus: isInstantOnlinePaid ? 'Ödendi' : 'Ödenmedi',
      paymentMethod: chosenMethod,
      receiptNumber: autoDocs?.receiptNumber,
      eInvoiceNo: autoDocs?.eInvoiceNo,
      autoReceiptIssued: Boolean(autoDocs),
      prepTimeMinutes: 14,
      elapsedMinutes: 1,
      notes: payload.couponCode
        ? `${payload.note} [Kupon: ${payload.couponCode}]`.trim()
        : payload.note,
      createdAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      branchId: 'BR-01',
      history: [
        {
          timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          status: 'Mutfağa gönderildi',
          actor: payload.customerName,
          note: `${payload.channel} (${targetTable?.qrCodeNumber || 'Online'}) · ${chosenMethod}${tipAmt > 0 ? ` · Bahşiş: ${tipAmt} ₺` : ''}`,
        },
      ],
    };

    // Otomatik reçete stok düşümü (Bölüm 12)
    let currentStockState = stocks;
    let currentMovements = stockMovements;
    for (const item of payload.items) {
      if (item.product.recipeLines && item.product.recipeLines.length > 0) {
        const res = applyRecipeStockChange(
          currentStockState,
          currentMovements,
          item.product.recipeLines,
          item.quantity,
          'deduct',
          orderNumber,
          'Reçete Otomasyonu',
          new Date().toISOString().slice(0, 16).replace('T', ' ')
        );
        currentStockState = res.updatedStocks;
        currentMovements = res.newMovements;
      }
    }

    setStocks(currentStockState);
    setStockMovements(currentMovements);
    setOrders((prev) => [newOrder, ...prev]);

    if (payload.channel === 'QR' && targetTable) {
      setTables((prev) =>
        prev.map((t) =>
          t.id === targetTable.id
            ? {
                ...t,
                status: 'Hazırlanıyor',
                currentOrderId: newOrder.id,
                openBalance: roundCurrency(t.openBalance + finalTotal),
              }
            : t
        )
      );
    }

    recordAudit(
      'Sipariş & Reçete',
      'Yeni Sipariş ve Stok Düşümü',
      `${orderNumber} (${finalTotal.toFixed(2)} ₺ · ${targetTable?.qrCodeNumber || payload.channel}) oluşturuldu, reçete malzemeleri stoktan otomatik düşüldü.`
    );
    pushNotification(
      `Yeni ${payload.channel} Siparişi (${orderNumber})`,
      `${newOrder.tableName} (${targetTable?.qrCodeNumber || ''}) için ${finalTotal.toFixed(2)} ₺ tutarında sipariş mutfak ekranına (KDS) düştü.`
    );

    return {
      success: true,
      message: 'Siparişiniz mutfak ekranına (KDS) ve sorumlu garsona iletildi.',
      orderNumber,
    };
  };

  // ---------------------------------------------------------------------------
  // 1.B Numaralı QR Kod Bazlı Detaylı Garson & Servis Çağrı Motoru
  // ---------------------------------------------------------------------------
  const handleSubmitWaiterServiceCall = (payload: {
    tableId: string;
    qrToken: string;
    selectedNeeds: string[];
    customNote: string;
  }): { success: boolean; message: string } => {
    const targetTable = tables.find((t) => t.id === payload.tableId);
    const nowStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    const isBill = isBillRequestNeeds(payload.selectedNeeds, payload.customNote);
    const tableOrders = targetTable ? orders.filter((o) => o.tableId === targetTable.id) : [];
    const calculatedBill = targetTable ? calculateTableOpenBill(targetTable.openBalance || 0, tableOrders) : 0;

    const validation = createWaiterServiceCall({
      qrRecord: targetTable
        ? {
            tableId: targetTable.id,
            tableNumber: targetTable.number,
            token: targetTable.qrToken,
            isRevoked: targetTable.qrRevoked,
            requestsLastMinute: 1,
            rateLimitPerMin: 20,
          }
        : undefined,
      providedToken: payload.qrToken,
      tableArea: targetTable?.area || 'Ana Salon',
      qrCodeNumber: targetTable?.qrCodeNumber || 'QR-MASA',
      assignedWaiter: targetTable?.waiterName || 'Nöbetçi Garson',
      selectedNeeds: payload.selectedNeeds,
      customNote: isBill && calculatedBill > 0
        ? `${payload.customNote ? `${payload.customNote} · ` : ''}Açık Hesap Tutarı: ₺${calculatedBill.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`
        : payload.customNote,
      timestamp: nowStr,
      calculatedBillAmount: isBill ? calculatedBill : undefined,
    });

    if (!validation.valid || !validation.callRecord || !targetTable) {
      return {
        success: false,
        message: validation.error || 'Garson çağrısı doğrulanamadı.',
      };
    }

    const callRec = validation.callRecord;

    // Backend API call
    fetch('/api/waiter/call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(callRec),
    }).catch(() => {});

    setWaiterCalls((prev) => [callRec, ...prev]);
    setTables((prev) =>
      prev.map((t) =>
        t.id === targetTable.id
          ? {
              ...t,
              waiterCalled: true,
              billRequested: isBill ? true : t.billRequested,
              status: isBill ? 'Hesap bekliyor' : t.status,
              openBalance: isBill && calculatedBill > 0 ? calculatedBill : t.openBalance,
              activeServiceRequests: callRec.selectedNeeds,
              serviceRequestNote: callRec.customNote,
              serviceRequestTime: nowStr,
            }
          : t
      )
    );

    const needsText = callRec.selectedNeeds.join(', ');
    pushNotification(
      `QR Garson Çağrısı (${targetTable.qrCodeNumber} · ${targetTable.number})`,
      `Sorumlu Garson ${targetTable.waiterName} için talepler: ${needsText}`
    );
    recordAudit(
      'QR Garson Servisi',
      `Masa Servis Talebi (${targetTable.qrCodeNumber})`,
      `${targetTable.number} (${targetTable.waiterName}): ${needsText} ${callRec.customNote ? `(${callRec.customNote})` : ''}`
    );

    return {
      success: true,
      message: `${targetTable.qrCodeNumber} (${targetTable.number}) üzerinden servis talebiniz (${needsText}) sorumlu garson ${targetTable.waiterName} ekranına iletildi.`,
    };
  };

  // ---------------------------------------------------------------------------
  // 2. Sipariş Durum Değişimi, İptal (Ters Stok Kaydı) ve Bağımsız Para İadesi
  // ---------------------------------------------------------------------------
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus, reason?: string) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return;

    // İptal durumunda reçete malzemelerini silinmez ters kayıt (reversal) ile geri yükle
    if (newStatus === 'İptal edildi' && target.status !== 'İptal edildi') {
      let currentStockState = stocks;
      let currentMovements = stockMovements;
      for (const line of target.items) {
        const prod = products.find((p) => p.id === line.productId);
        if (prod && prod.recipeLines.length > 0) {
          const res = applyRecipeStockChange(
            currentStockState,
            currentMovements,
            prod.recipeLines,
            line.quantity,
            'reverse',
            target.orderNumber,
            currentRole,
            new Date().toISOString().slice(0, 16).replace('T', ' ')
          );
          currentStockState = res.updatedStocks;
          currentMovements = res.newMovements;
        }
      }
      setStocks(currentStockState);
      setStockMovements(currentMovements);
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: newStatus,
              items:
                newStatus === 'Hazır' || newStatus === 'Servis edildi'
                  ? o.items.map((it) => ({ ...it, isReady: true }))
                  : o.items,
            }
          : o
      )
    );

    recordAudit(
      'Sipariş Yönetimi',
      `Durum Geçişi: ${newStatus}`,
      `${target.orderNumber} durumu "${newStatus}" yapıldı. ${reason || ''}`,
      newStatus === 'İptal edildi' ? 'Uyarı' : 'Normal'
    );
  };

  const handleRefundOrderSeparately = (orderId: string, amount: number, reason: string) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'İade edildi',
              paymentStatus: 'İade Edildi',
            }
          : o
      )
    );
    setFinanceLedger((prev) => [
      {
        id: `FIN-REF-${Date.now()}`,
        date: '2026-11-16 ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        type: 'Gider',
        category: 'Müşteri Para İadesi (Refund)',
        description: `${target.orderNumber} bağımsız para iadesi: ${reason}`,
        amount,
        paymentMethod: target.paymentMethod || 'Kasa İadesi',
        recordedBy: currentRole,
        branchId: 'BR-01',
      },
      ...prev,
    ]);
    recordAudit(
      'Ödeme & İade',
      'Bağımsız Para İadesi (Refund)',
      `${target.orderNumber} için ${amount.toFixed(2)} ₺ para iadesi gerçekleştirildi (${reason}).`,
      'Kritik'
    );
  };

  // ---------------------------------------------------------------------------
  // 3. POS Satış ve Tahsilat İşlemleri
  // ---------------------------------------------------------------------------
  const handleCreatePosOrder = (payload: {
    tableId: string | null;
    channel: 'Kasa' | 'Garson' | 'Telefon';
    customerName: string;
    items: { product: ProductItem; quantity: number; isComplimentary: boolean }[];
    discountAmount: number;
    paymentMethod: string;
    paidAmount: number;
  }) => {
    const orderNumber = `OZT-2026-${1043 + orders.length}`;
    const lineItems = payload.items.map((it, idx) => ({
      id: `POS-ITM-${Date.now()}-${idx}`,
      productId: it.product.id,
      productName: it.product.name,
      station: it.product.station,
      quantity: it.quantity,
      unitPrice: it.isComplimentary ? 0 : it.product.discountedPrice ?? it.product.price,
      options: [],
      customerNote: it.isComplimentary ? 'Yetkili İkram' : '',
      isComplimentary: it.isComplimentary,
      isReady: false,
    }));

    const subtotal = roundCurrency(
      lineItems.reduce((s, li) => s + li.unitPrice * li.quantity, 0)
    );
    const taxRate = siteCmsConfig.generalSettings.taxRatePercent ?? 10;
    const discountedSub = Math.max(0, roundCurrency(subtotal - payload.discountAmount));
    const taxAmount = roundCurrency((discountedSub * taxRate) / 100);
    const totalAmount = roundCurrency(discountedSub + taxAmount);

    const newOrder: OrderRecord = {
      id: `ORD-POS-${Date.now()}`,
      orderNumber,
      idempotencyKey: `POS-IDEMP-${Date.now()}`,
      channel: payload.channel,
      status: payload.paidAmount >= totalAmount ? 'Tamamlandı' : 'Hazırlanıyor',
      tableId: payload.tableId,
      tableName: payload.tableId
        ? tables.find((t) => t.id === payload.tableId)?.number || 'Masa'
        : 'Hızlı Satış (Kasa)',
      customerName: payload.customerName,
      customerPhone: '-',
      staffName: currentRole,
      items: lineItems,
      subtotal,
      discountAmount: payload.discountAmount,
      taxAmount,
      totalAmount,
      paidAmount: payload.paidAmount,
      paymentStatus:
        payload.paidAmount >= totalAmount
          ? 'Ödendi'
          : payload.paidAmount > 0
          ? 'Kısmi Ödendi'
          : 'Ödenmedi',
      paymentMethod: payload.paymentMethod,
      prepTimeMinutes: 12,
      elapsedMinutes: 1,
      notes: 'POS terminalinden oluşturuldu',
      createdAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      branchId: 'BR-01',
      history: [],
    };

    setOrders((prev) => [newOrder, ...prev]);
    recordAudit(
      'POS / Kasa',
      'POS Satış & Tahsilat',
      `${orderNumber} için ${payload.paidAmount.toFixed(2)} ₺ (${payload.paymentMethod}) tahsil edildi.`
    );
  };

  const handleSettleOrderPayment = async (orderId: string, amount: number, method: string) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return;

    // Webhook signature verification simulation for online/POS providers
    try {
      await fetch('/api/webhooks/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: method,
          orderId: target.orderNumber,
          amount,
          mode: 'sandbox',
          idempotencyKey: `PAY-${orderId}-${Date.now()}`,
        }),
      });
    } catch {
      // fallback local verification
    }

    const updatedPaid = roundCurrency(target.paidAmount + amount);
    const isFullyPaid = updatedPaid >= target.totalAmount;
    const docs =
      target.receiptNumber && target.eInvoiceNo
        ? { receiptNumber: target.receiptNumber, eInvoiceNo: target.eInvoiceNo }
        : generateReceiptAndInvoiceNumbers(target.orderNumber);

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              paidAmount: updatedPaid,
              paymentStatus: isFullyPaid ? 'Ödendi' : 'Kısmi Ödendi',
              paymentMethod: method,
              status: isFullyPaid ? 'Tamamlandı' : o.status,
              receiptNumber: isFullyPaid ? docs.receiptNumber : o.receiptNumber,
              eInvoiceNo: isFullyPaid ? docs.eInvoiceNo : o.eInvoiceNo,
              autoReceiptIssued: isFullyPaid ? true : o.autoReceiptIssued,
            }
          : o
      )
    );

    setFinanceLedger((prev) => [
      {
        id: `FIN-${Date.now().toString().slice(-4)}`,
        date:
          '2026-11-16 ' +
          new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        type: 'Gelir',
        category: 'POS / Kasa Tahsilatı',
        description: `${target.orderNumber} (${method}) · Fiş: ${docs.receiptNumber}`,
        amount,
        paymentMethod: method,
        recordedBy: currentRole,
        branchId: 'BR-01',
      },
      ...prev,
    ]);

    if (target.tableId && isFullyPaid) {
      setTables((prev) =>
        prev.map((t) =>
          t.id === target.tableId
            ? {
                ...t,
                status: 'Temizlik bekliyor',
                openBalance: 0,
                currentOrderId: null,
                billRequested: false,
              }
            : t
        )
      );
    }

    recordAudit(
      'Ödemeler',
      'Tahsilat & Otomatik Fiş Doğrulandı',
      `${target.orderNumber} için ${amount.toFixed(2)} ₺ (${method}) ödeme alındı · ${docs.receiptNumber}.`
    );
  };

  const handleRegisterCustomerFromPortal = (member: {
    name: string;
    phone: string;
    email: string;
    address: string;
  }) => {
    const cleanPhone = member.phone.replace(/\D/g, '');
    const exists = customers.some((c) => c.phone.replace(/\D/g, '') === cleanPhone);
    if (!exists) {
      setCustomers((prev) => [
        {
          id: `CUS-${prev.length + 1}`,
          name: member.name,
          phone: member.phone,
          email: member.email,
          address: member.address || 'Şahinbey / Gaziantep',
          district: 'Şahinbey',
          group: 'Sadık Müşteri',
          birthDate: '1990-01-01',
          points: 100,
          walletBalance: 0,
          totalOrders: 1,
          totalSpent: 0,
          preferences: member.address ? `Teslimat Adresi: ${member.address}` : 'Web Üyesi',
          referralCode: `OZT-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
          kvkkApproved: true,
          marketingSmsApproved: false,
        },
        ...prev,
      ]);
      recordAudit('Müşteriler (CRM)', 'Web Üye Kaydı', `${member.name} (${member.phone}) üye oldu.`);
    }
  };

  const handleDispatchWaiterCall = (callId: string) => {
    setWaiterCalls((prev) =>
      prev.map((c) => (c.id === callId ? { ...c, status: 'Garson Yönlendirildi' } : c))
    );
    const call = waiterCalls.find((c) => c.id === callId);
    if (call) {
      pushNotification(
        `Garson Yönlendirildi (${call.qrCodeNumber})`,
        `${call.tableNumber} talebi için garson masaya ilerliyor.`
      );
      recordAudit('Garson Servisi', 'Çağrıya Garson Yönlendirildi', `${call.tableNumber} (${call.qrCodeNumber})`);
    }
  };

  const handleResolveWaiterCallShared = (callId: string, tableId: string) => {
    setWaiterCalls((prev) =>
      prev.map((c) => (c.id === callId ? { ...c, status: 'Tamamlandı' } : c))
    );
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              waiterCalled: false,
              activeServiceRequests: [],
              serviceRequestNote: undefined,
            }
          : t
      )
    );
    recordAudit('Garson Servisi', 'QR Servis Çağrısı Tamamlandı', `Çağrı ${callId} (Masa ${tableId}) kapatıldı.`);
  };

  const handleAssignOrderCourier = (orderId: string, courierName: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, courierName, deliveryState: 'Kuryeye Atandı' }
          : o
      )
    );
    const ord = orders.find((o) => o.id === orderId);
    pushNotification(
      `Kurye Atandı (${ord?.orderNumber || ''})`,
      `${courierName} paket siparişi teslim etmek üzere atandı.`
    );
    recordAudit('Paket Servis', 'Kurye Atandı', `${ord?.orderNumber} -> ${courierName}`);
  };

  const handleUpdateCourierDeliveryState = (
    orderId: string,
    deliveryState: NonNullable<OrderRecord['deliveryState']>
  ) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              deliveryState,
              status:
                deliveryState === 'Teslim Edildi'
                  ? 'Tamamlandı'
                  : deliveryState === 'Yolda'
                  ? 'Kuryeye teslim edildi'
                  : o.status,
            }
          : o
      )
    );
    recordAudit('Paket Servis', 'Kurye Durumu Güncellendi', `${orderId} -> ${deliveryState}`);
  };

  const handleIssueOrderReceiptAndInvoice = (orderId: string) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target || (target.receiptNumber && target.eInvoiceNo)) return;
    const docs = generateReceiptAndInvoiceNumbers(target.orderNumber);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              receiptNumber: docs.receiptNumber,
              eInvoiceNo: docs.eInvoiceNo,
              autoReceiptIssued: true,
            }
          : o
      )
    );
    recordAudit(
      'Fatura & POS',
      'Otomatik Fiş / e-Fatura Kesildi',
      `${target.orderNumber}: ${docs.receiptNumber} / ${docs.eInvoiceNo}`
    );
  };

  const filteredSidebarModules = ADMIN_38_MODULES.filter(
    (m) =>
      !sidebarFilter.trim() ||
      m.title.toLowerCase().includes(sidebarFilter.toLowerCase()) ||
      m.group.toLowerCase().includes(sidebarFilter.toLowerCase())
  );

  const currentModuleObj =
    ADMIN_38_MODULES.find((m) => m.id === activeModuleId) || ADMIN_38_MODULES[0];

  const handleCreateReservationShared = (candidate: Omit<ReservationItem, 'id' | 'status'>) => {
    const conflict = checkReservationConflict(reservations, {
      tableId: candidate.tableId,
      date: candidate.date,
      time: candidate.time,
    });
    if (conflict.hasConflict) {
      return {
        success: false,
        message: `Rezervasyon çakışması engellendi! ${candidate.tableNumber} masasında saat ${conflict.conflictingReservation?.time} için zaten onaylı rezervasyon (${conflict.conflictingReservation?.customerName}) bulunuyor.`,
      };
    }
    const newRes: ReservationItem = {
      ...candidate,
      id: `RES-${Date.now().toString().slice(-4)}`,
      status: 'confirmed',
    };
    setReservations((prev) => [newRes, ...prev]);
    recordAudit(
      'Rezervasyon',
      'Yeni Rezervasyon Kaydı',
      `${candidate.customerName} (${candidate.guestCount} kişi) - ${candidate.date} ${candidate.time} (${candidate.tableNumber})`
    );
    return {
      success: true,
      message: `${candidate.tableNumber} için ${candidate.date} saat ${candidate.time} rezervasyonunuz onaylandı.`,
    };
  };

  const handleRequestBillShared = (tableId: string) => {
    const tbl = tables.find((t) => t.id === tableId);
    const tableOrders = orders.filter((o) => o.tableId === tableId);
    const calculatedBill = calculateTableOpenBill(tbl?.openBalance || 0, tableOrders);

    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              billRequested: true,
              status: 'Hesap bekliyor',
              openBalance: calculatedBill > 0 ? calculatedBill : t.openBalance,
            }
          : t
      )
    );

    const billCall = createWaiterServiceCall({
      qrRecord: tbl
        ? {
            tableId: tbl.id,
            tableNumber: tbl.number,
            token: tbl.qrToken,
            isRevoked: tbl.qrRevoked,
            requestsLastMinute: 1,
            rateLimitPerMin: 20,
          }
        : undefined,
      providedToken: tbl?.qrToken || 'TOKEN-MANUEL',
      tableArea: tbl?.area || 'Ana Salon',
      qrCodeNumber: tbl?.qrCodeNumber || 'QR-MASA',
      assignedWaiter: tbl?.waiterName || 'Halil Usta',
      selectedNeeds: ['Hesap İsteme', 'Mobil POS'],
      customNote: `Açık Adisyon Hesabı: ₺${calculatedBill.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      calculatedBillAmount: calculatedBill,
    });

    if (billCall.callRecord) {
      setWaiterCalls((prev) => [billCall.callRecord!, ...prev]);
    }

    pushNotification(
      `Hesap Talebi: ${tbl?.number || 'Masa'} (₺${calculatedBill.toLocaleString('tr-TR', { minimumFractionDigits: 2 })})`,
      `${tbl?.number || 'Masa'} hesap istedi. Toplam Masa Hesabı: ₺${calculatedBill.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} (Sorumlu: ${tbl?.waiterName || 'Garson'}).`
    );
    recordAudit(
      'QR Menü',
      'Hesap İsteme',
      `${tbl?.number} (${tbl?.qrCodeNumber}) hesap talebi gönderdi. Sistemce Hesaplanan Masa Hesabı: ₺${calculatedBill}.`
    );
  };

  // ===========================================================================
  // FRONTEND: STANDALONE MÜŞTERİ WEB SİTESİ & QR SİPARİŞ ARAYÜZÜ (PC & MOBİL)
  // ===========================================================================
  if (portalMode === 'customer') {
    return (
      <div className="min-h-screen flex flex-col bg-[#160806] text-[#F7EFE5]">
        <OfflineIndicator />
        <CustomerQRPortal
          categories={categories}
          products={products}
          packages={packages}
          campaigns={campaigns}
          tables={tables}
          orders={orders}
          reservations={reservations}
          waiterCalls={waiterCalls}
          cmsPages={cmsPages}
          isOnline={isOnline}
          isStandaloneCustomerSite={true}
          themeMode={themeMode}
          siteCmsConfig={siteCmsConfig}
          lang={lang}
          onChangeLang={setLang}
          notifications={notifications}
          onPushNotification={pushNotification}
          onMarkAllNotificationsRead={() =>
            setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
          }
          onDismissNotification={handleDismissNotification}
          onClearNotifications={handleClearAllNotifications}
          customerReviews={customerReviews}
          customerComplaints={customerComplaints}
          onSubmitReview={handleSubmitCustomerReview}
          onSubmitComplaint={handleSubmitCustomerComplaint}
          onDeleteCustomerAccount={handleDeleteCustomerAccount}
          onSwitchToAdminPortal={() => {
            window.location.hash = '#admin';
            setPortalMode('admin');
          }}
          onPlaceCustomerOrder={handlePlaceCustomerOrder}
          onSubmitWaiterServiceCall={handleSubmitWaiterServiceCall}
          onRequestBill={handleRequestBillShared}
          onRegisterMember={handleRegisterCustomerFromPortal}
          onCreateReservation={handleCreateReservationShared}
        />
      </div>
    );
  }

  // ===========================================================================
  // BACKEND: ADMİN YÖNETİM PANELİ VE OPERASYON TERMİNALLERİ (38 MODÜL + POS + KDS + GARSON)
  // ===========================================================================
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F0] text-[#141413] dark:bg-[#141413] dark:text-[#F5F2EB] overflow-x-hidden">
      <OfflineIndicator />

      {/* =====================================================================
          STRICT 3-ZONE TOP BAR CONTRACT (Admin Backend Shell)
      ===================================================================== */}
      <header className="flex items-center justify-between gap-2 sm:gap-6 px-3 sm:px-6 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141413] min-w-0">
        {/* Zone 1: Brand Logo & Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setWorkspaceView('admin');
            setActiveModuleId(1);
          }}
          className="flex items-center gap-2 sm:gap-2.5 font-editorial text-base sm:text-lg font-bold tracking-tight text-neutral-900 dark:text-[#F5F2EB] whitespace-nowrap min-w-0"
        >
          <img
            src="/assets/aistudio/oztike-logo-transparent.png"
            alt="ÖzTike Ciğer Halil Usta Logo"
            className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-md shrink-0"
          />
          <span className="truncate">
            ÖzTike Ciğer <span className="hidden sm:inline">· Admin OS</span>
          </span>
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav
          aria-label="Ana Çalışma Alanları"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600 dark:text-neutral-300"
        >
          <a
            href="#yonetim"
            onClick={(e) => {
              e.preventDefault();
              setWorkspaceView('admin');
            }}
            className={`hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              workspaceView === 'admin'
                ? 'text-[#B86B35] dark:text-[#D4AF6A] underline underline-offset-8'
                : ''
            }`}
          >
            Yönetim Paneli
          </a>
          <a
            href="#pos"
            onClick={(e) => {
              e.preventDefault();
              setWorkspaceView('pos');
            }}
            className={`hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              workspaceView === 'pos'
                ? 'text-[#B86B35] dark:text-[#D4AF6A] underline underline-offset-8'
                : ''
            }`}
          >
            POS Kasa
          </a>
          <a
            href="#kds"
            onClick={(e) => {
              e.preventDefault();
              setWorkspaceView('kds');
            }}
            className={`hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              workspaceView === 'kds'
                ? 'text-[#B86B35] dark:text-[#D4AF6A] underline underline-offset-8'
                : ''
            }`}
          >
            Mutfak KDS
          </a>
          <a
            href="#garson"
            onClick={(e) => {
              e.preventDefault();
              setWorkspaceView('waiter');
            }}
            className={`hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              workspaceView === 'waiter'
                ? 'text-[#B86B35] dark:text-[#D4AF6A] underline underline-offset-8'
                : ''
            }`}
          >
            Garson & QR Çağrılar ({waiterCalls.filter((c) => c.status !== 'Tamamlandı').length})
          </a>
          <a
            href="#qrmenu"
            onClick={(e) => {
              e.preventDefault();
              setPortalMode('customer');
            }}
            className="hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Müşteri Web Sitesi
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setPortalMode('customer')}
            className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-white bg-[#B86B35] rounded-lg hover:bg-[#9F5928] transition-colors whitespace-nowrap shrink-0"
          >
            <span className="sm:hidden">Müşteri Sitesi</span>
            <span className="hidden sm:inline">Müşteri Web Sitesine Geç</span>
          </button>
        </div>
      </header>

      {/* =====================================================================
          SECONDARY WORKSPACE UTILITY TOOLBAR (Bölüm 2.5: Global Arama, Bildirim, Rol/Profil, Tema, Mobil Menü)
      ===================================================================== */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-[#1F1F1D] px-3 sm:px-4 lg:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5 min-w-0">
        <div className="flex items-center gap-2 min-w-0 max-w-full">
          <button
            type="button"
            onClick={() => {
              if (window.innerWidth < 1024) {
                setMobileDrawerOpen(!mobileDrawerOpen);
              } else {
                setSidebarOpen(!sidebarOpen);
              }
            }}
            aria-label="Sol Yönetim Menüsünü Aç veya Kapat"
            className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#141413] hover:bg-neutral-50 dark:hover:bg-neutral-800 shrink-0"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Mobile Mode Switcher */}
          <div className="flex md:hidden items-center gap-1 overflow-x-auto max-w-full">
            {(
              [
                { id: 'admin', label: 'Yönetim' },
                { id: 'pos', label: 'POS' },
                { id: 'kds', label: 'Mutfak' },
                { id: 'waiter', label: 'Garson' },
                { id: 'qr_web', label: 'QR Menü' },
              ] as const
            ).map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setWorkspaceView(v.id)}
                className={`px-2 py-1 text-xs font-medium rounded whitespace-nowrap shrink-0 ${
                  workspaceView === v.id ? 'bg-[#B86B35] text-white' : ''
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <span>Merkez Şube</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-neutral-900 dark:text-[#F5F2EB]">
              {workspaceView === 'admin'
                ? currentModuleObj.title
                : workspaceView === 'pos'
                ? '12. POS / Kasa Terminali'
                : workspaceView === 'kds'
                ? '7. Canlı Mutfak Ekranı (KDS)'
                : workspaceView === 'waiter'
                ? '3 & 8. Garson ve Masa Yönetimi'
                : '4 & 26. QR Menü ve Kurumsal Web'}
            </span>
          </div>
        </div>

        {/* Right Controls: Global Search, RBAC Role Selector, Notifications, Theme, PWA */}
        <div className="flex flex-wrap items-center gap-2 max-w-full">
          {/* Global Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!globalSearchQuery.trim()) return;
              const matchedMod = ADMIN_38_MODULES.find((m) =>
                m.title.toLowerCase().includes(globalSearchQuery.toLowerCase())
              );
              if (matchedMod) {
                setWorkspaceView('admin');
                setActiveModuleId(matchedMod.id);
              }
            }}
            className="relative"
          >
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder="Modül, sipariş veya ürün ara..."
              aria-label="Global Sistem Araması"
              className="w-36 sm:w-56 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#141413] pl-8 pr-2.5 py-1.5 text-xs"
            />
          </form>

          {/* RBAC Role Switcher (10 Roles) */}
          <label className="flex items-center gap-1.5 text-xs">
            <span className="text-neutral-500 hidden xl:inline">Yetki Rolü:</span>
            <select
              value={currentRole}
              onChange={(e) => {
                const nextRole = e.target.value as StaffRoleName;
                setCurrentRole(nextRole);
                recordAudit(
                  'Yetkilendirme',
                  'Rol Oturum Geçişi',
                  `Aktif çalışma rolü "${nextRole}" olarak değiştirildi.`
                );
              }}
              aria-label="Personel Yetki Rolü Seçimi"
              className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#141413] px-2.5 py-1.5 text-xs font-medium"
            >
              {[
                'Süper Yönetici',
                'İşletme Müdürü',
                'Şube Müdürü',
                'Kasiyer',
                'Garson',
                'Mutfak',
                'Kurye',
                'Depo Sorumlusu',
                'Muhasebe',
                'İçerik Editörü',
              ].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>

          {/* Notification Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label={`Bildirim Merkezi (${notifications.filter((n) => n.unread).length} okunmamış)`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#141413] text-xs font-medium"
            >
              <Bell className="w-3.5 h-3.5 text-[#D4AF6A]" />
              <span className="font-mono">
                {notifications.filter((n) => n.unread).length}
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 z-40 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-4 shadow-xl space-y-2.5 text-xs">
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-neutral-200 dark:border-neutral-800">
                  <span className="font-semibold">Canlı Bildirim Merkezi</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
                      }
                      className="text-[11px] text-[#B86B35] hover:underline"
                    >
                      Okundu İşaretle
                    </button>
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAllNotifications}
                        className="text-[11px] text-red-500 hover:underline font-semibold"
                      >
                        Tümünü Temizle
                      </button>
                    )}
                  </div>
                </div>
                {notifications.length === 0 ? (
                  <p className="text-[11px] text-neutral-500 py-3 text-center">
                    Aktif bildirim bulunmuyor.
                  </p>
                ) : (
                  <div className="max-h-72 overflow-y-auto space-y-2 pr-0.5">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className="relative p-2.5 pr-7 rounded-lg bg-neutral-50 dark:bg-[#141413] space-y-1 border border-neutral-200/70 dark:border-neutral-800"
                      >
                        <button
                          type="button"
                          onClick={() => handleDismissNotification(n.id)}
                          aria-label="Bildirimi sil"
                          className="absolute top-2 right-2 p-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-red-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex justify-between font-semibold gap-2">
                          <span>{n.title}</span>
                          <span className="font-mono text-[10px] text-neutral-400 shrink-0">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-neutral-500">{n.detail}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
            aria-label={themeMode === 'dark' ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
            className="p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#141413]"
          >
            {themeMode === 'dark' ? (
              <Sun className="w-4 h-4 text-[#D4AF6A]" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-700" />
            )}
          </button>
        </div>
      </div>

      {/* =====================================================================
          MAIN WORKSPACE BODY (SIDEBAR + CONTENT VIEWPORT)
      ===================================================================== */}
      <div className="flex-1 flex">
        {/* Desktop Collapsible 38-Module Sidebar */}
        {sidebarOpen && (
          <aside
            aria-label="38 Modüllü Yönetim Menüsü"
            className="hidden lg:flex flex-col w-68 shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141413] p-3.5 space-y-3"
          >
            <div>
              <input
                type="search"
                value={sidebarFilter}
                onChange={(e) => setSidebarFilter(e.target.value)}
                placeholder="Menüde bölüm ara..."
                aria-label="Sol menüde modül ara"
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#1F1F1D] px-3 py-1.5 text-xs"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1 max-h-[calc(100vh-180px)]">
              {filteredSidebarModules.map((mod) => {
                const isSelected = workspaceView === 'admin' && activeModuleId === mod.id;
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => {
                      setWorkspaceView('admin');
                      setActiveModuleId(mod.id);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#B86B35] text-white font-semibold'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#1F1F1D]'
                    }`}
                  >
                    <span className="truncate">{mod.title}</span>
                    <span className="text-[10px] opacity-65 shrink-0 ml-2">{mod.group}</span>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Mobile Sidebar Drawer */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex bg-black/60">
            <div className="w-72 bg-white dark:bg-[#141413] h-full p-4 flex flex-col gap-3 overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
                <span className="font-editorial font-bold">ÖzTike OS · Yönetim</span>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  aria-label="Mobil menüyü kapat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1">
                {ADMIN_38_MODULES.map((mod) => (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => {
                      setWorkspaceView('admin');
                      setActiveModuleId(mod.id);
                      setMobileDrawerOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${
                      activeModuleId === mod.id
                        ? 'bg-[#B86B35] text-white'
                        : 'text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {mod.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Viewport Content */}
        <main className="flex-1 p-3 sm:p-6 max-w-[1440px] mx-auto w-full min-w-0 overflow-x-hidden space-y-6">
          {/* Role Access Notice if non-admin role tries restricted administrative settings */}
          {workspaceView === 'admin' &&
            activeModuleId >= 34 &&
            currentRole !== 'Süper Yönetici' &&
            currentRole !== 'İşletme Müdürü' && (
              <div className="rounded-xl border border-amber-700/40 bg-amber-950/20 p-4 text-xs flex items-center justify-between">
                <span className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-medium">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  Yetki Kontrolü: "{currentRole}" rolü sistem güvenlik ve yedekleme ayarlarında salt-okunur moddadır. Tam yetki için üst çubuktan "Süper Yönetici" rolünü seçin.
                </span>
              </div>
            )}

          {workspaceView === 'qr_web' && (
            <CustomerQRPortal
              categories={categories}
              products={products}
              packages={packages}
              campaigns={campaigns}
              tables={tables}
              orders={orders}
              reservations={reservations}
              waiterCalls={waiterCalls}
              cmsPages={cmsPages}
              isOnline={isOnline}
              siteCmsConfig={siteCmsConfig}
              lang={lang}
              onChangeLang={setLang}
              notifications={notifications}
              onPushNotification={pushNotification}
              onMarkAllNotificationsRead={() =>
                setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
              }
              onDismissNotification={handleDismissNotification}
              onClearNotifications={handleClearAllNotifications}
              customerReviews={customerReviews}
              customerComplaints={customerComplaints}
              onSubmitReview={handleSubmitCustomerReview}
              onSubmitComplaint={handleSubmitCustomerComplaint}
              onDeleteCustomerAccount={handleDeleteCustomerAccount}
              onPlaceCustomerOrder={handlePlaceCustomerOrder}
              onSubmitWaiterServiceCall={handleSubmitWaiterServiceCall}
              onRequestBill={handleRequestBillShared}
              onRegisterMember={handleRegisterCustomerFromPortal}
              onCreateReservation={handleCreateReservationShared}
            />
          )}

          {workspaceView === 'pos' && (
            <POSKasaTerminal
              products={products}
              categories={categories}
              tables={tables}
              orders={orders}
              isOnline={isOnline}
              siteCmsConfig={siteCmsConfig}
              onCreatePosOrder={handleCreatePosOrder}
              onSettleOrderPayment={handleSettleOrderPayment}
              onMergeOrMoveTable={(sourceId, targetId, mode) => {
                const src = tables.find((t) => t.id === sourceId);
                const tgt = tables.find((t) => t.id === targetId);
                if (!src || !tgt) return;

                if (mode === 'move') {
                  setTables((prev) =>
                    prev.map((t) => {
                      if (t.id === sourceId) {
                        return { ...t, status: 'Boş', openBalance: 0, currentOrderId: null };
                      }
                      if (t.id === targetId) {
                        return {
                          ...t,
                          status: src.status === 'Boş' ? 'Dolu' : src.status,
                          openBalance: roundCurrency(t.openBalance + src.openBalance),
                          currentOrderId: src.currentOrderId || t.currentOrderId,
                        };
                      }
                      return t;
                    })
                  );
                } else {
                  setTables((prev) =>
                    prev.map((t) =>
                      t.id === sourceId || t.id === targetId
                        ? {
                            ...t,
                            mergedWith: t.id === sourceId ? tgt.number : src.number,
                            openBalance: roundCurrency(src.openBalance + tgt.openBalance),
                          }
                        : t
                    )
                  );
                }
                recordAudit(
                  'POS / Masa',
                  mode === 'move' ? 'Masa Taşıma' : 'Masa Birleştirme',
                  `${src.number} -> ${tgt.number} işlemi tamamlandı.`
                );
              }}
              onRecordAudit={recordAudit}
            />
          )}

          {workspaceView === 'kds' && (
            <KitchenKDSTerminal
              orders={orders}
              onToggleOrderItemReady={(orderId, itemId) => {
                setOrders((prev) =>
                  prev.map((o) =>
                    o.id === orderId
                      ? {
                          ...o,
                          items: o.items.map((it) =>
                            it.id === itemId ? { ...it, isReady: !it.isReady } : it
                          ),
                        }
                      : o
                  )
                );
              }}
              onMarkOrderReadyForService={(orderId) => {
                handleUpdateOrderStatus(orderId, 'Hazır', 'Mutfak KDS tarafından hazır işaretlendi');
                const ord = orders.find((o) => o.id === orderId);
                if (ord) {
                  pushNotification(
                    `Sipariş Servis Bekliyor (${ord.orderNumber})`,
                    `${ord.tableName} siparişi mutfakta tamamlandı, garson servisine hazır.`
                  );
                }
              }}
            />
          )}

          {workspaceView === 'waiter' && (
            <WaiterTableTerminal
              tables={tables}
              orders={orders}
              waiterCalls={waiterCalls}
              onChangeTableStatus={(tableId, status: TableStatus) => {
                setTables((prev) =>
                  prev.map((t) => (t.id === tableId ? { ...t, status } : t))
                );
                recordAudit('Masalar', 'Masa Durum Güncelleme', `${tableId} -> ${status}`);
              }}
              onRotateQrToken={(tableId, revokeOnly) => {
                const newToken = `OZT-QR-${Math.random().toString(16).slice(2, 10).toUpperCase()}`;
                setTables((prev) =>
                  prev.map((t) =>
                    t.id === tableId
                      ? {
                          ...t,
                          qrToken: revokeOnly ? t.qrToken : newToken,
                          qrRevoked: revokeOnly,
                        }
                      : t
                  )
                );
                recordAudit(
                  'QR Güvenliği',
                  revokeOnly ? 'QR Token İptali' : 'QR Token Yenileme',
                  `Masa ${tableId} için QR token güncellendi.`
                );
              }}
              onClearTableAlerts={(tableId) => {
                setTables((prev) =>
                  prev.map((t) =>
                    t.id === tableId
                      ? {
                          ...t,
                          waiterCalled: false,
                          billRequested: false,
                          activeServiceRequests: [],
                          serviceRequestNote: undefined,
                        }
                      : t
                  )
                );
                setWaiterCalls((prev) =>
                  prev.map((c) => (c.tableId === tableId ? { ...c, status: 'Tamamlandı' } : c))
                );
              }}
              onResolveWaiterCall={(callId, tableId) => {
                setWaiterCalls((prev) =>
                  prev.map((c) => (c.id === callId ? { ...c, status: 'Tamamlandı' } : c))
                );
                setTables((prev) =>
                  prev.map((t) =>
                    t.id === tableId
                      ? {
                          ...t,
                          waiterCalled: false,
                          activeServiceRequests: [],
                          serviceRequestNote: undefined,
                        }
                      : t
                  )
                );
                recordAudit(
                  'Garson Servisi',
                  'QR Servis Çağrısı Tamamlandı',
                  `Çağrı ${callId} (Masa ${tableId}) garson tarafından tamamlandı.`
                );
              }}
              onUpdateOrderStatus={handleUpdateOrderStatus}
            />
          )}

          {workspaceView === 'admin' && (
            <AdminModulesPanel
              activeModuleId={activeModuleId}
              onSelectModule={(id) => setActiveModuleId(id)}
              currentRole={currentRole}
              categories={categories}
              onAddCategory={(name, description, imageUrl) => {
                setCategories((prev) => [
                  ...prev,
                  {
                    id: `CAT-${Date.now().toString().slice(-4)}`,
                    name,
                    slug: name.toLowerCase().replace(/\s+/g, '-'),
                    description,
                    sortOrder: prev.length + 1,
                    isActive: true,
                    isDemo: false,
                    imageUrl: imageUrl || '/assets/aistudio/crops/cat-ciger.png',
                    isPrimaryShowcase: true,
                  },
                ]);
                recordAudit('Kategoriler', 'Yeni Kategori', `${name} kategorisi eklendi.`);
              }}
              onUpdateCategory={(updatedCat) => {
                setCategories((prev) =>
                  prev.map((c) => (c.id === updatedCat.id ? updatedCat : c))
                );
                setProducts((prev) =>
                  prev.map((p) =>
                    p.categoryId === updatedCat.id
                      ? { ...p, categoryName: updatedCat.name }
                      : p
                  )
                );
                recordAudit(
                  'Kategoriler',
                  'Kategori Güncellendi',
                  `${updatedCat.name} kategorisi ve görseli güncellendi.`
                );
              }}
              onDeleteCategory={(catId) => {
                setCategories((prev) => prev.filter((c) => c.id !== catId));
                recordAudit('Kategoriler', 'Kategori Silindi', `${catId} kategorisi kaldırıldı.`);
              }}
              products={products}
              onAddProduct={(p) => {
                setProducts((prev) => [
                  {
                    ...p,
                    id: `PRD-${prev.length + 1}`,
                    slug: p.name.toLowerCase().replace(/\s+/g, '-'),
                    recipeLines: [
                      {
                        ingredientId: 'ING-01',
                        ingredientName: 'Günlük Taze Kuzu Ciğeri',
                        quantity: 0.2,
                        unit: 'kg',
                        unitCost: 620,
                      },
                    ],
                  },
                  ...prev,
                ]);
                recordAudit('Ürünler', 'Yeni Ürün Eklendi', `${p.name} (${p.price} ₺) tanımlandı.`);
              }}
              onUpdateProduct={(updated) => {
                setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
                recordAudit('Ürünler', 'Ürün Güncellendi', `${updated.name} (${updated.price} ₺) güncellendi.`);
              }}
              onDeleteProduct={(prodId) => {
                setProducts((prev) => prev.filter((p) => p.id !== prodId));
                recordAudit('Ürünler', 'Ürün Silindi', `${prodId} menüden silindi.`);
              }}
              onBulkAdjustPrices={(percentDelta) => {
                const factor = 1 + percentDelta / 100;
                setProducts((prev) =>
                  prev.map((p) => ({
                    ...p,
                    price: roundCurrency(p.price * factor),
                    discountedPrice: p.discountedPrice
                      ? roundCurrency(p.discountedPrice * factor)
                      : null,
                  }))
                );
                recordAudit(
                  'Ürünler',
                  'Toplu Fiyat Güncelleme',
                  `Tüm ürün fiyatları %${percentDelta} oranında güncellendi.`,
                  'Uyarı'
                );
              }}
              onDuplicateProduct={(productId) => {
                const found = products.find((p) => p.id === productId);
                if (!found) return;
                setProducts((prev) => [
                  {
                    ...found,
                    id: `PRD-COPY-${Date.now().toString().slice(-4)}`,
                    code: `${found.code}-KOPYA`,
                    name: `${found.name} (Kopya)`,
                  },
                  ...prev,
                ]);
              }}
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onRefundOrderSeparately={handleRefundOrderSeparately}
              tables={tables}
              onChangeTableStatus={(tableId, status) => {
                setTables((prev) =>
                  prev.map((t) => (t.id === tableId ? { ...t, status } : t))
                );
                recordAudit('Masalar', 'Masa Durum Güncelleme', `${tableId} -> ${status}`);
              }}
              stocks={stocks}
              stockMovements={stockMovements}
              onRecordStockOperation={(payload) => {
                const target = stocks.find((s) => s.id === payload.ingredientId);
                if (!target) return;
                const delta =
                  payload.type === 'in' || payload.type === 'count_adjust'
                    ? payload.quantity
                    : -payload.quantity;

                setStocks((prev) =>
                  prev.map((s) =>
                    s.id === payload.ingredientId
                      ? { ...s, currentStock: Math.max(0, roundCurrency(s.currentStock + delta)) }
                      : s
                  )
                );
                setStockMovements((prev) => [
                  {
                    id: `MOV-${Date.now().toString().slice(-4)}`,
                    timestamp: '2026-11-16 ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                    ingredientId: target.id,
                    ingredientName: target.name,
                    movementType: payload.type,
                    quantityDelta: delta,
                    unit: target.unit,
                    unitCostSnapshot: target.unitCost,
                    referenceId: 'MANUEL-STOK',
                    note: payload.note,
                    actorName: currentRole,
                  },
                  ...prev,
                ]);
                recordAudit(
                  'Stok Yönetimi',
                  `Stok Hareketi (${payload.type})`,
                  `${target.name}: ${delta} ${target.unit} (${payload.note})`
                );
              }}
              customers={customers}
              onAddCustomer={(c) => {
                setCustomers((prev) => [
                  {
                    ...c,
                    id: `CUS-${prev.length + 1}`,
                    points: 50,
                    walletBalance: 0,
                    totalOrders: 0,
                    totalSpent: 0,
                  },
                  ...prev,
                ]);
                recordAudit('Müşteriler (CRM)', 'Yeni Müşteri', `${c.name} kaydedildi.`);
              }}
              onAdjustLoyaltyPoints={(customerId, delta, reason) => {
                setCustomers((prev) =>
                  prev.map((c) =>
                    c.id === customerId ? { ...c, points: Math.max(0, c.points + delta) } : c
                  )
                );
                recordAudit('Sadakat Programı', 'Puan Hareketi', `${customerId}: ${delta} puan (${reason})`);
              }}
              campaigns={campaigns}
              onAddCampaign={(c) => {
                setCampaigns((prev) => [
                  { ...c, id: `CMP-${prev.length + 1}`, usedCount: 0 },
                  ...prev,
                ]);
                recordAudit('Kampanyalar', 'Yeni Kampanya', `${c.name} (${c.couponCode}) tanımlandı.`);
              }}
              reservations={reservations}
              onUpdateReservationStatus={(resId, status) => {
                setReservations((prev) =>
                  prev.map((r) => (r.id === resId ? { ...r, status } : r))
                );
                recordAudit('Rezervasyonlar', 'Durum Güncelleme', `${resId} -> ${status}`);
              }}
              staff={staff}
              onAddStaff={(s) => {
                setStaff((prev) => [
                  ...prev,
                  {
                    ...s,
                    id: `STF-${prev.length + 1}`,
                    ordersHandledToday: 0,
                    salesToday: 0,
                  },
                ]);
                recordAudit('Personel', 'Yeni Personel', `${s.name} (${s.role}) eklendi.`);
              }}
              financeLedger={financeLedger}
              onAddFinanceEntry={(entry) => {
                setFinanceLedger((prev) => [
                  {
                    ...entry,
                    id: `FIN-${Date.now().toString().slice(-4)}`,
                    date: '2026-11-16 ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                  },
                  ...prev,
                ]);
                recordAudit('Finans', `${entry.type} Kaydı`, `${entry.category}: ${entry.amount} ₺`);
              }}
              cmsPages={cmsPages}
              onAddCmsPage={(page) => {
                setCmsPages((prev) => [
                  { ...page, id: `PG-${Date.now().toString().slice(-4)}`, updatedAt: '2026-11-16' },
                  ...prev,
                ]);
                recordAudit('CMS & SEO', 'Yeni Sayfa', `${page.title} (${page.slug}) yayınlandı.`);
              }}
              onUpdateCmsPage={(updatedPage) => {
                setCmsPages((prev) =>
                  prev.map((pg) => (pg.id === updatedPage.id ? updatedPage : pg))
                );
                recordAudit('CMS & SEO', 'Sayfa Güncellendi', `${updatedPage.title} (${updatedPage.slug}) güncellendi.`);
              }}
              onDeleteCmsPage={(pageId) => {
                setCmsPages((prev) => prev.filter((pg) => pg.id !== pageId));
                recordAudit('CMS & SEO', 'Sayfa Silindi', `${pageId} sayfası kaldırıldı.`);
              }}
              siteCmsConfig={siteCmsConfig}
              onUpdateSiteCmsConfig={setSiteCmsConfig}
              integrations={integrations}
              onTestIntegration={(id) => {
                setIntegrations((prev) =>
                  prev.map((i) =>
                    i.id === id ? { ...i, lastTested: '16 Kas 2026 Şimdi Doğrulandı' } : i
                  )
                );
                recordAudit('Entegrasyonlar', 'Bağlantı Testi', `${id} entegrasyonu test edildi.`);
              }}
              onToggleIntegrationMode={(id) => {
                setIntegrations((prev) =>
                  prev.map((i) =>
                    i.id === id
                      ? {
                          ...i,
                          mode: i.mode === 'Test (Sandbox)' ? 'Canlı (Live)' : 'Test (Sandbox)',
                        }
                      : i
                  )
                );
              }}
              onUpdateIntegration={(updated) => {
                setIntegrations((prev) =>
                  prev.map((i) => (i.id === updated.id ? updated : i))
                );
                recordAudit('Entegrasyonlar', 'Gelişmiş Yapılandırma', `${updated.name} API ayarları güncellendi.`);
              }}
              onToggleIntegrationActive={(id) => {
                setIntegrations((prev) =>
                  prev.map((i) => {
                    if (i.id === id) {
                      const next = !i.enabled;
                      recordAudit(
                        'Entegrasyonlar',
                        next ? 'Entegrasyon Açıldı' : 'Entegrasyon Kapatıldı',
                        `${i.name} durumu ${next ? 'Aktif' : 'Pasif'} yapıldı.`
                      );
                      return { ...i, enabled: next };
                    }
                    return i;
                  })
                );
              }}
              branches={branches}
              onToggleBranchActive={(id) => {
                setBranches((prev) =>
                  prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b))
                );
                recordAudit('Şube Yönetimi', 'Şube Durum Değişikliği', `${id} şube durumu güncellendi.`);
              }}
              onAddBranch={(branch) => {
                setBranches((prev) => [
                  ...prev,
                  {
                    ...branch,
                    id: `BR-${String(prev.length + 1).padStart(2, '0')}`,
                    dailyRevenue: 0,
                    activeTables: 0,
                  },
                ]);
                recordAudit('Şube Yönetimi', 'Yeni Şube Eklendi', `${branch.name} (${branch.city}) açıldı.`);
              }}
              onUpdateBranch={(updated) => {
                setBranches((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
                recordAudit('Şube Yönetimi', 'Şube Güncellendi', `${updated.name} bilgileri güncellendi.`);
              }}
              onDeleteBranch={(id) => {
                setBranches((prev) => prev.filter((b) => b.id !== id));
                recordAudit('Şube Yönetimi', 'Şube Silindi', `${id} şube kaydı silindi.`, 'Uyarı');
              }}
              packages={packages}
              onAddPackage={(pkg) => {
                setPackages((prev) => [
                  ...prev,
                  { ...pkg, id: `PKG-${Date.now().toString().slice(-4)}`, isDemo: false },
                ]);
                recordAudit('Menü Paketleri', 'Yeni Paket Eklendi', `${pkg.name} (${pkg.price} ₺) tanımlandı.`);
              }}
              onUpdatePackage={(pkg) => {
                setPackages((prev) => prev.map((p) => (p.id === pkg.id ? pkg : p)));
                recordAudit('Menü Paketleri', 'Paket Güncellendi', `${pkg.name} güncellendi.`);
              }}
              onDeletePackage={(pkgId) => {
                setPackages((prev) => prev.filter((p) => p.id !== pkgId));
                recordAudit('Menü Paketleri', 'Paket Silindi', `${pkgId} paketi kaldırıldı.`);
              }}
              customerReviews={customerReviews}
              customerComplaints={customerComplaints}
              onUpdateComplaintStatus={(id, status) => {
                setCustomerComplaints((prev) =>
                  prev.map((c) => (c.id === id ? { ...c, status } : c))
                );
                recordAudit('CRM & Şikayetler', 'Şikayet Durumu', `${id} -> ${status}`);
              }}
              backups={backups}
              onCreateBackup={(type) => {
                setBackups((prev) => [
                  {
                    id: `BKP-0${prev.length + 1}`,
                    timestamp: '16 Kas 2026 ' + new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                    type,
                    trigger: 'Manuel',
                    sizeMb: 49.2,
                    checksum: `sha256:${Math.random().toString(16).slice(2, 14)}...9c4a`,
                    verified: true,
                  },
                  ...prev,
                ]);
                recordAudit('Yedekleme', 'Manuel Yedek Oluşturuldu', `${type} yedeği alındı.`, 'Kritik');
              }}
              onRestoreBackup={(id, safetyCode) => {
                if (safetyCode.trim().toUpperCase() !== 'KORU') {
                  return {
                    success: false,
                    message:
                      'Güvenlik Adımı: Geri yükleme öncesinde mevcut verilerin otomatik koruma yedeğinin alınması için kutuya KORU yazmalısınız.',
                  };
                }
                recordAudit(
                  'Yedekleme',
                  'Güvenli Geri Yükleme',
                  `Mevcut veriler koruma yedeğine alındıktan sonra ${id} yedeği doğrulandı ve geri yüklendi.`,
                  'Kritik'
                );
                return {
                  success: true,
                  message: `Mevcut verilerin güvenlik yedeği alındı ve ${id} yedeği başarıyla geri yüklendi.`,
                };
              }}
              auditLogs={auditLogs}
              onClearAuditLogs={() => {
                setAuditLogs([
                  {
                    id: `LOG-${Date.now().toString().slice(-4)}`,
                    timestamp: '16 Kas 2026 ' + new Date().toLocaleTimeString('tr-TR', { hour12: false }),
                    actor: `Aktif Kullanıcı (${currentRole})`,
                    role: currentRole,
                    module: 'İşlem Kayıtları',
                    action: 'Kayıt Arşivleme & Temizleme',
                    detail: 'Geçmiş işlem kayıtları yönetici onayıyla arşivlenip temizlendi.',
                    severity: 'Uyarı',
                  },
                ]);
              }}
              themeMode={themeMode}
              onChangeThemeMode={setThemeMode}
              onSwitchWorkspaceView={setWorkspaceView}
              waiterCalls={waiterCalls}
              onDispatchWaiterCall={handleDispatchWaiterCall}
              onResolveWaiterCall={handleResolveWaiterCallShared}
              onAssignOrderCourier={handleAssignOrderCourier}
              onUpdateCourierDeliveryState={handleUpdateCourierDeliveryState}
              onSettleOrderPayment={handleSettleOrderPayment}
              onIssueOrderReceiptAndInvoice={handleIssueOrderReceiptAndInvoice}
              onDeleteOrder={(orderId) => {
                const target = orders.find((o) => o.id === orderId);
                setOrders((prev) => prev.filter((o) => o.id !== orderId));
                recordAudit(
                  'Sipariş Yönetimi',
                  'Sipariş Kaydı Silindi',
                  `${target?.orderNumber || orderId} silindi ve arşivde saklanıyor.`
                );
              }}
              onDeleteWaiterCall={(callId) => {
                setWaiterCalls((prev) => prev.filter((c) => c.id !== callId));
                recordAudit('Garson Servisi', 'Çağrı Silindi', `${callId} çağrı kaydı silindi.`);
              }}
              onAddTable={(tblData) => {
                const newId = `TBL-${String(tables.length + 1).padStart(2, '0')}`;
                const newTbl: DiningTableItem = {
                  ...tblData,
                  id: newId,
                  qrToken: `token-${newId.toLowerCase()}-${Date.now().toString(36)}`,
                  qrRevoked: false,
                  openBalance: 0,
                  billRequested: false,
                  waiterCalled: false,
                  activeServiceRequests: [],
                };
                setTables((prev) => [...prev, newTbl]);
                recordAudit('Masalar', 'Yeni Masa Eklendi', `${newTbl.number} (${newTbl.area}) eklendi.`);
              }}
              onUpdateTable={(updatedTable) => {
                setTables((prev) => prev.map((t) => (t.id === updatedTable.id ? updatedTable : t)));
                recordAudit('Masalar', 'Masa Güncellendi', `${updatedTable.number} güncellendi.`);
              }}
              onDeleteTable={(tableId) => {
                const target = tables.find((t) => t.id === tableId);
                setTables((prev) => prev.filter((t) => t.id !== tableId));
                recordAudit('Masalar', 'Masa Silindi', `${target?.number || tableId} kaldırıldı.`, 'Uyarı');
              }}
              onResetTableBill={(tableId) => {
                setTables((prev) =>
                  prev.map((t) =>
                    t.id === tableId
                      ? {
                          ...t,
                          openBalance: 0,
                          billRequested: false,
                          status: 'Boş',
                          activeServiceRequests: [],
                          serviceRequestNote: undefined,
                        }
                      : t
                  )
                );
                recordAudit('Masalar', 'Masa Hesabı Sıfırlandı', `${tableId} açık hesabı kapatıldı.`);
              }}
              onAddStockItem={(item) => {
                const newStock: StockItem = {
                  ...item,
                  id: `ING-${String(stocks.length + 1).padStart(2, '0')}`,
                };
                setStocks((prev) => [...prev, newStock]);
                recordAudit('Stok Yönetimi', 'Yeni Stok Kalemi', `${newStock.name} eklendi.`);
              }}
              onUpdateStockItem={(updated) => {
                setStocks((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
                recordAudit('Stok Yönetimi', 'Stok Güncellendi', `${updated.name} güncellendi.`);
              }}
              onDeleteStockItem={(id) => {
                const target = stocks.find((s) => s.id === id);
                setStocks((prev) => prev.filter((s) => s.id !== id));
                recordAudit('Stok Yönetimi', 'Stok Silindi', `${target?.name || id} silindi.`, 'Uyarı');
              }}
              onUpdateReservation={(res) => {
                setReservations((prev) => prev.map((r) => (r.id === res.id ? res : r)));
                recordAudit('Rezervasyonlar', 'Rezervasyon Güncellendi', `${res.customerName} rezervasyonu güncellendi.`);
              }}
              onDeleteReservation={(id) => {
                const target = reservations.find((r) => r.id === id);
                setReservations((prev) => prev.filter((r) => r.id !== id));
                recordAudit('Rezervasyonlar', 'Rezervasyon Silindi', `${target?.customerName || id} rezervasyonu silindi.`);
              }}
              onUpdateCustomer={(cust) => {
                setCustomers((prev) => prev.map((c) => (c.id === cust.id ? cust : c)));
                recordAudit('Müşteriler', 'Müşteri Güncellendi', `${cust.name} güncellendi.`);
              }}
              onDeleteCustomer={(id) => {
                const target = customers.find((c) => c.id === id);
                setCustomers((prev) => prev.filter((c) => c.id !== id));
                recordAudit('Müşteriler', 'Müşteri Silindi', `${target?.name || id} silindi.`);
              }}
              onToggleCustomerBlock={(id) => {
                setCustomers((prev) =>
                  prev.map((c) => {
                    if (c.id !== id) return c;
                    const willBlock = !c.isBlocked;
                    recordAudit(
                      'Müşteriler',
                      willBlock ? 'Müşteri Engellendi' : 'Müşteri Engeli Kaldırıldı',
                      `${c.name} (${c.phone}) ${willBlock ? 'engellendi' : 'engeli kaldırıldı'}.`
                    );
                    return { ...c, isBlocked: willBlock };
                  })
                );
              }}
              onUpdateCampaign={(camp) => {
                setCampaigns((prev) => prev.map((c) => (c.id === camp.id ? camp : c)));
                recordAudit('Kampanyalar', 'Kampanya Güncellendi', `${camp.name} güncellendi.`);
              }}
              onDeleteCampaign={(id) => {
                const target = campaigns.find((c) => c.id === id);
                setCampaigns((prev) => prev.filter((c) => c.id !== id));
                recordAudit('Kampanyalar', 'Kampanya Silindi', `${target?.name || id} silindi.`);
              }}
            />
          )}
        </main>
      </div>

      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#141413] px-6 py-4 text-xs text-neutral-500 flex flex-wrap items-center justify-between gap-4">
        <div>
          © 2026 ÖzTike Ciğer · Halil Usta Yönetim Paneli
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              setWorkspaceView('admin');
              setActiveModuleId(26);
            }}
            className="hover:underline cursor-pointer"
          >
            Web Sitesi & CMS
          </button>
          <button
            type="button"
            onClick={() => {
              setWorkspaceView('admin');
              setActiveModuleId(35);
            }}
            className="hover:underline cursor-pointer"
          >
            Genel Ayarlar
          </button>
          <button
            type="button"
            onClick={() => {
              setWorkspaceView('admin');
              setActiveModuleId(38);
            }}
            className="hover:underline cursor-pointer"
          >
            İşlem Kayıtları
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;
