import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  QrCode,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  BellRing,
  CheckCircle2,
  Sparkles,
  Clock,
  Utensils,
  Receipt,
  Search,
  X,
  Camera,
  Upload,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Flame,
  Salad,
  CupSoda,
  MessageSquarePlus,
  Check,
  Globe,
  Bell,
  Volume2,
  VolumeX,
  Download,
  Phone,
  MessageCircle,
  Bot,
  Send,
  Play,
  Image as ImageIcon,
  Film,
  MapPin,
  Instagram,
  Facebook,
  Youtube,
  Share2,
  Lock,
  ShieldCheck,
  Mail,
  Award,
  ExternalLink,
  CreditCard,
  Wallet,
  Truck,
  User,
  History,
  RotateCcw,
  Eye,
  Star,
  AlertCircle,
  MapPinned,
  Home,
  Briefcase,
  Copy,
  KeyRound,
  Coffee,
} from 'lucide-react';
import type {
  CategoryItem,
  ProductItem,
  MenuPackageItem,
  CampaignRecord,
  DiningTableItem,
  OrderRecord,
  CMSPageItem,
  SavedAddressItem,
  CustomerReviewItem,
  CustomerComplaintItem,
} from '../data/initialStoreData';
import {
  roundCurrency,
  calculateCampaignDiscount,
  calculateCustomerCheckoutTotals,
  canAccessQrProtectedFeature,
  getOrderProgressStep,
  formatWaiterDrinkQuantities,
  type ReservationItem,
  type WaiterServiceCallRecord,
} from '../core/restaurantEngine';
import { FooterPWACard } from './BrandIdentity';
import { RestaurantMapSection } from './RestaurantMapSection';
import {
  TRANSLATIONS,
  SUPPORTED_LANGUAGES,
  getTranslatedProduct,
  getTranslatedCategoryName,
  type SupportedLang,
} from '../i18n/translations';
import {
  INITIAL_SITE_CMS_CONFIG,
  getSlideByLang,
  getGalleryTitleByLang,
  getBlockByLang,
  getNavLabelByLang,
  getShowcaseCardByLang,
  type SiteCmsConfig,
  type GalleryMediaItem,
} from '../data/siteCmsStore';

export interface CustomerCartLine {
  lineId: string;
  product: ProductItem;
  quantity: number;
  selectedOptions: { name: string; value: string; extraPrice: number }[];
  customerNote: string;
}

export interface LiveNotificationItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  unread: boolean;
}

interface CustomerQRPortalProps {
  categories: CategoryItem[];
  products: ProductItem[];
  packages: MenuPackageItem[];
  campaigns: CampaignRecord[];
  tables: DiningTableItem[];
  orders: OrderRecord[];
  reservations: ReservationItem[];
  waiterCalls: WaiterServiceCallRecord[];
  cmsPages?: CMSPageItem[];
  isOnline: boolean;
  isStandaloneCustomerSite?: boolean;
  themeMode?: 'light' | 'dark' | 'system';
  onToggleTheme?: () => void;
  onSwitchToAdminPortal?: () => void;
  siteCmsConfig?: SiteCmsConfig;
  lang?: SupportedLang;
  onChangeLang?: (lang: SupportedLang) => void;
  notifications?: LiveNotificationItem[];
  onPushNotification?: (title: string, detail: string) => void;
  onMarkAllNotificationsRead?: () => void;
  onDismissNotification?: (id: string) => void;
  onClearNotifications?: () => void;
  customerReviews?: CustomerReviewItem[];
  customerComplaints?: CustomerComplaintItem[];
  onSubmitReview?: (rev: Omit<CustomerReviewItem, 'id' | 'createdAt' | 'status'>) => void;
  onSubmitComplaint?: (cmp: Omit<CustomerComplaintItem, 'id' | 'createdAt' | 'status'>) => void;
  onDeleteCustomerAccount?: (phoneOrEmail: string) => void;
  onPlaceCustomerOrder: (payload: {
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
  }) => { success: boolean; message: string; orderNumber?: string };
  onSubmitWaiterServiceCall: (payload: {
    tableId: string;
    qrToken: string;
    selectedNeeds: string[];
    customNote: string;
  }) => { success: boolean; message: string };
  onRequestBill: (tableId: string) => void;
  onRegisterMember?: (member: {
    name: string;
    phone: string;
    email: string;
    address: string;
  }) => void;
  onCreateReservation: (
    res: Omit<ReservationItem, 'id' | 'status'>
  ) => { success: boolean; message: string };
}

const CATEGORY_CARD_IMAGES: Record<string, string> = {
  ALL: '/assets/aistudio/crops/hero-ciger.png',
  'CAT-01': '/assets/aistudio/crops/cat-ciger.png',
  'CAT-02': '/assets/aistudio/crops/cat-kebap.png',
  'CAT-03': '/assets/aistudio/crops/cat-tavuk.png',
  'CAT-04': '/assets/aistudio/crops/cat-doner.png',
  'CAT-05': '/assets/aistudio/crops/cat-lahmacun.png',
  'CAT-09': '/assets/aistudio/crops/gallery-1.png',
  'CAT-12': '/assets/aistudio/crops/gallery-2.png',
};

const PRODUCT_FALLBACK_IMAGES: Record<string, string> = {
  'CAT-01': '/assets/aistudio/crops/cat-ciger.png',
  'CAT-02': '/assets/aistudio/crops/cat-kebap.png',
  'CAT-03': '/assets/aistudio/crops/cat-tavuk.png',
  'CAT-04': '/assets/aistudio/crops/cat-doner.png',
  'CAT-05': '/assets/aistudio/crops/cat-lahmacun.png',
  'CAT-09': '/assets/aistudio/crops/gallery-1.png',
  'CAT-12': '/assets/aistudio/crops/gallery-2.png',
};

const MEAL_SALAD_ADDONS = [
  { id: 'sal-none', price: 0 },
  { id: 'sal-gavurdagi', price: 145 },
  { id: 'sal-bostana', price: 120 },
  { id: 'sal-coban', price: 95 },
];

const MEAL_DRINK_ADDONS = [
  { id: 'drk-none', price: 0 },
  { id: 'drk-ayran', price: 75 },
  { id: 'drk-salgam', price: 65 },
  { id: 'drk-salgam-sade', price: 65 },
  { id: 'drk-kola', price: 65 },
  { id: 'drk-fanta', price: 65 },
  { id: 'drk-soda', price: 35 },
];

const MEAL_SPICE_KEYS = [
  'İpek Pul Biber',
  'Urfa İsotu (Acı)',
  'Bol Sumak',
  'Kimyon & Kekik',
  'Acısız / Sade',
];

const MEAL_PORTION_OPTIONS = [
  { id: 'prt-1', price: 0 },
  { id: 'prt-15', price: 160 },
  { id: 'prt-2', price: 290 },
];

const MEAL_BREAD_OPTIONS = [
  { id: 'brd-lavas', price: 0 },
  { id: 'brd-pide', price: 0 },
  { id: 'brd-cift', price: 15 },
];

const QUICK_SPECIAL_REQUEST_KEYS = [
  'Soğansız Olsun',
  'Bol Sumaklı Soğan',
  'Lavaşlar Sıcak Gelsin',
  'Az Yağlı Pişsin',
  'Kuyruk Yağsız',
  'Acısı Ayrı Gelsin',
];

const WAITER_NEED_KEYS = [
  'w-garson',
  'w-pecete',
  'w-catal',
  'w-tuz',
  'w-lavas',
  'w-su',
  'w-temizlik',
  'w-hesap',
];

// Web Audio API ile gerçek bildirim çan sesi üretici
function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.setValueAtTime(880, now + 0.14); // A5
    osc2.frequency.setValueAtTime(293.66, now);
    osc2.frequency.setValueAtTime(440, now + 0.14);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.65);
    osc2.stop(now + 0.65);
  } catch {
    // ignore audio autoplay block
  }
}

export const CustomerQRPortal: React.FC<CustomerQRPortalProps> = ({
  categories,
  products,
  campaigns,
  tables,
  orders,
  waiterCalls,
  cmsPages = [],
  isOnline,
  onSwitchToAdminPortal,
  siteCmsConfig = INITIAL_SITE_CMS_CONFIG,
  lang: propLang,
  onChangeLang,
  notifications: propNotifications,
  onPushNotification,
  onMarkAllNotificationsRead,
  onDismissNotification,
  onClearNotifications,
  customerReviews = [],
  customerComplaints = [],
  onSubmitReview,
  onSubmitComplaint,
  onDeleteCustomerAccount,
  onPlaceCustomerOrder,
  onSubmitWaiterServiceCall,
  onRequestBill,
  onRegisterMember,
}) => {
  // 0. Çoklu Dil Sistemi (8 Dil: TR | EN | AR | FR | DE | KU | JA | ZH)
  const [internalLang, setInternalLang] = useState<SupportedLang>(() => {
    const saved = localStorage.getItem('oztike_lang') as SupportedLang | null;
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) return saved;
    return 'tr';
  });

  const currentLang = propLang ?? internalLang;
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.tr;

  const handleSelectLanguage = (nextLang: SupportedLang) => {
    setInternalLang(nextLang);
    localStorage.setItem('oztike_lang', nextLang);
    onChangeLang?.(nextLang);
    setLangDropdownOpen(false);
  };

  useEffect(() => {
    document.documentElement.dir = t.dir;
    document.documentElement.lang = currentLang;
  }, [currentLang, t.dir]);

  const [langDropdownOpen, setLangDropdownOpen] = useState<boolean>(false);

  // 0.B Çalışan Bildirim Sistemi (Sesli + Web Notification API + Canlı Liste)
  const [localNotifications, setLocalNotifications] = useState<LiveNotificationItem[]>([
    {
      id: 'CUST-NTF-1',
      title: 'ÖzTike Ciğer’e Hoş Geldiniz',
      detail: 'Sıcak tandır lavaşı ve 7 çeşit köz meze ikramımız masanıza hazırlanıyor.',
      time: 'Şimdi',
      unread: true,
    },
  ]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(
    siteCmsConfig.modules.liveNotificationSound
  );

  const activeNotifications = propNotifications ?? localNotifications;
  const unreadNotifCount = activeNotifications.filter((n) => n.unread).length;

  const triggerCustomerNotification = (title: string, detail: string) => {
    const nowStr = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    if (soundEnabled) {
      playNotificationChime();
    }
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: detail,
          icon: '/pwa-192x192.png',
        });
      } catch {
        // ignore
      }
    }
    if (onPushNotification) {
      onPushNotification(title, detail);
    } else {
      setLocalNotifications((prev) => [
        {
          id: `NTF-${Date.now()}`,
          title,
          detail,
          time: nowStr,
          unread: true,
        },
        ...prev,
      ]);
    }
  };

  const handleMarkNotificationsRead = () => {
    if (onMarkAllNotificationsRead) {
      onMarkAllNotificationsRead();
    } else {
      setLocalNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    }
  };

  const handleDismissNotif = (id: string) => {
    if (onDismissNotification) {
      onDismissNotification(id);
    } else {
      setLocalNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const handleClearAllNotifs = () => {
    if (onClearNotifications) {
      onClearNotifications();
    } else {
      setLocalNotifications([]);
    }
  };

  const [announcementDismissed, setAnnouncementDismissed] = useState<boolean>(false);
  const [activeCmsPage, setActiveCmsPage] = useState<CMSPageItem | null>(null);

  // 1. Masa QR Kod Okuma ve URL Parametresi (?masa=1 .. ?masa=8) Eşleştirme
  const parseQrTableIdFromUrl = (): string | null => {
    const params = new URLSearchParams(window.location.search);
    const masaParam = params.get('masa') || params.get('table') || params.get('qr');
    if (masaParam) {
      const normalized = masaParam.trim().toUpperCase();
      const matched = tables.find(
        (tbl) =>
          tbl.id.toUpperCase() === normalized ||
          tbl.qrCodeNumber.toUpperCase() === normalized ||
          tbl.qrCodeNumber.endsWith(`0${normalized}`) ||
          tbl.id === `TBL-0${normalized}` ||
          tbl.number.toUpperCase() === normalized
      );
      if (matched) return matched.id;
    }
    return null;
  };

  const [qrVerifiedTableId, setQrVerifiedTableId] = useState<string | null>(parseQrTableIdFromUrl);
  const [selectedTableId, setSelectedTableId] = useState<string>(
    () => parseQrTableIdFromUrl() || tables[0]?.id || 'TBL-01'
  );
  const [tableOccupancyModalOpen, setTableOccupancyModalOpen] = useState<boolean>(false);

  const [qrModalOpen, setQrModalOpen] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [hasHardwareStream, setHasHardwareStream] = useState<boolean>(false);
  const [cameraScanningAnim, setCameraScanningAnim] = useState<boolean>(false);
  const [cameraStatusText, setCameraStatusText] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Slider State
  const activeSlides = useMemo(
    () => siteCmsConfig.slider.slides.filter((s) => s.isActive),
    [siteCmsConfig.slider.slides]
  );
  const [currentSlideIdx, setCurrentSlideIdx] = useState<number>(0);

  useEffect(() => {
    if (!siteCmsConfig.slider.autoPlay || activeSlides.length <= 1) return;
    const timer = window.setInterval(() => {
      setCurrentSlideIdx((prev) => (prev + 1) % activeSlides.length);
    }, siteCmsConfig.slider.intervalMs || 6000);
    return () => window.clearInterval(timer);
  }, [siteCmsConfig.slider.autoPlay, siteCmsConfig.slider.intervalMs, activeSlides.length]);

  // Kategori kaydırma referansı ve aşağı kaydırmada yapışkan kategori sıkıştırma
  const categoryScrollRef = useRef<HTMLDivElement | null>(null);
  const [isCategoryStickyCompact, setIsCategoryStickyCompact] = useState<boolean>(false);

  useEffect(() => {
    const onScroll = () => {
      setIsCategoryStickyCompact(window.scrollY > 340);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 2. Menü ve Arama State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [channel, setChannel] = useState<'QR' | 'Gel-Al' | 'Paket servis'>('QR');

  // 3. Yemek Özelleştirme Bottom Sheet & Ürün Paylaşım State
  const [customizingProduct, setCustomizingProduct] = useState<ProductItem | null>(null);
  const [activeCustomImage, setActiveCustomImage] = useState<string>('');
  const [sharingProduct, setSharingProduct] = useState<ProductItem | null>(null);
  const [customQuantity, setCustomQuantity] = useState<number>(1);
  const [selectedPortionId, setSelectedPortionId] = useState<string>('prt-1');
  const [selectedBreadId, setSelectedBreadId] = useState<string>('brd-lavas');
  const [selectedSpices, setSelectedSpices] = useState<string[]>(['İpek Pul Biber', 'Bol Sumak']);
  const [selectedSaladId, setSelectedSaladId] = useState<string>('sal-none');
  const [selectedDrinkId, setSelectedDrinkId] = useState<string>('drk-none');
  const [selectedQuickRequests, setSelectedQuickRequests] = useState<string[]>([]);
  const [customMealNote, setCustomMealNote] = useState<string>('');

  // 4. Sepet, Ödeme, Bahşiş, Kayıtlı Adresler & Gelişmiş Hesap State
  const [cart, setCart] = useState<CustomerCartLine[]>([]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState<boolean>(false);
  const [customerMember, setCustomerMember] = useState<{
    name: string;
    phone: string;
    email: string;
    address: string;
  } | null>(() => {
    try {
      const raw = localStorage.getItem('oztike_customer_member_v1');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [savedAddresses, setSavedAddresses] = useState<SavedAddressItem[]>(() => {
    try {
      const raw = localStorage.getItem('oztike_customer_addresses_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [
      {
        id: 'ADDR-01',
        label: 'Ev',
        title: 'Ev Adresim',
        fullAddress: 'Karagöz Mah. Şahinbey Cad. No: 42, Kat: 3, Şahinbey / Gaziantep',
        district: 'Şahinbey / Gaziantep',
      },
    ];
  });
  useEffect(() => {
    try {
      localStorage.setItem('oztike_customer_addresses_v1', JSON.stringify(savedAddresses));
    } catch {
      // ignore
    }
  }, [savedAddresses]);

  const [memberModalOpen, setMemberModalOpen] = useState<boolean>(false);
  const [accountTab, setAccountTab] = useState<'profile' | 'addresses' | 'orders' | 'reviews' | 'complaint'>('profile');
  const [memberNameInput, setMemberNameInput] = useState<string>(() => customerMember?.name || '');
  const [memberPhoneInput, setMemberPhoneInput] = useState<string>(() => customerMember?.phone || '');
  const [memberEmailInput, setMemberEmailInput] = useState<string>(() => customerMember?.email || '');
  const [memberAddressInput, setMemberAddressInput] = useState<string>(() => customerMember?.address || '');
  const [memberPasswordInput, setMemberPasswordInput] = useState<string>('');
  const [memberNewPasswordInput, setMemberNewPasswordInput] = useState<string>('');
  const [deleteAccountStep, setDeleteAccountStep] = useState<boolean>(false);

  const [newAddrLabel, setNewAddrLabel] = useState<'Ev' | 'İş Yeri' | 'Diğer'>('Ev');
  const [newAddrTitle, setNewAddrTitle] = useState<string>('');
  const [newAddrFull, setNewAddrFull] = useState<string>('');
  const [newAddrDistrict, setNewAddrDistrict] = useState<string>('Şahinbey / Gaziantep');

  const [reviewProductId, setReviewProductId] = useState<string>(() => products[0]?.id || 'PRD-01');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');

  const [complaintSubject, setComplaintSubject] = useState<string>('Sipariş & Teslimat');
  const [complaintOrderNo, setComplaintOrderNo] = useState<string>('');
  const [complaintMessage, setComplaintMessage] = useState<string>('');

  const [customerName, setCustomerName] = useState<string>(() => customerMember?.name || '');
  const [customerPhone, setCustomerPhone] = useState<string>(() => customerMember?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState<string>(() => customerMember?.address || '');
  const [orderNote, setOrderNote] = useState<string>('');
  const [selectedCouponCode, setSelectedCouponCode] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Kapıda / Masada Kart (POS)');
  const [tipPercent, setTipPercent] = useState<0 | 5 | 10 | 15>(0);
  const [customTipInput, setCustomTipInput] = useState<string>('');
  const [lastPlacedOrderNumber, setLastPlacedOrderNumber] = useState<string | null>(null);

  // 5. Garson Çağrı Modalı (Sadece Alt Navbardaki Tek Garson Butonuna Basınca Açılır + Çay/Soda Adet)
  const [waiterModalOpen, setWaiterModalOpen] = useState<boolean>(false);
  const [selectedWaiterNeeds, setSelectedWaiterNeeds] = useState<string[]>(['w-garson']);
  const [waiterDrinkQuantities, setWaiterDrinkQuantities] = useState<Record<string, number>>({});
  const [waiterCustomNote, setWaiterCustomNote] = useState<string>('');

  // 6. Ücretsiz Yapay Zekâ Lezzet Asistanı Modalı
  const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);
  const [aiInput, setAiInput] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiMessages, setAiMessages] = useState<
    {
      id: string;
      role: 'assistant' | 'user';
      text: string;
      recommendedProductIds?: string[];
    }[]
  >([]);

  // 7. Fotoğraf & Video Galeri Filtre ve Lightbox State
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'photo' | 'video'>('all');
  const [activeLightboxMedia, setActiveLightboxMedia] = useState<GalleryMediaItem | null>(null);

  // 8. Footer Yönetici Giriş Modalı
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState<boolean>(false);
  const [adminEmailInput, setAdminEmailInput] = useState<string>(
    siteCmsConfig.footer.adminDemoEmail
  );
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>(
    siteCmsConfig.footer.adminDemoPassword
  );

  // Bildirim Toast
  const [toastBanner, setToastBanner] = useState<{
    type: 'success' | 'error';
    title: string;
    text: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error', title: string, text: string) => {
    setToastBanner({ type, title, text });
    window.setTimeout(() => {
      setToastBanner((prev) => (prev?.text === text ? null : prev));
    }, 5000);
  };

  const activeTable = useMemo(
    () => tables.find((t) => t.id === selectedTableId) || tables[0],
    [tables, selectedTableId]
  );

  const activeTableNumberBadge = useMemo(() => {
    if (!activeTable) return `${t.qrModal.tablePrefix} 01`;
    const numMatch = activeTable.qrCodeNumber.match(/\d+/);
    const numStr = numMatch ? numMatch[0] : '01';
    return `${t.qrModal.tablePrefix} ${numStr}`;
  }, [activeTable, t.qrModal.tablePrefix]);

  // Kamera durdurma yardımcı fonksiyonu
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setHasHardwareStream(false);
    setCameraActive(false);
  };

  // Gerçek Kamera Başlatma
  const startLiveCameraScan = async () => {
    setCameraActive(true);
    setCameraStatusText(t.qrModal.cameraReadyHint);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
        streamRef.current = stream;
        setHasHardwareStream(true);
        setCameraActive(true);
        setCameraStatusText(t.qrModal.cameraReadyHint);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } else {
        setHasHardwareStream(false);
        setCameraActive(true);
      }
    } catch {
      setHasHardwareStream(false);
      setCameraActive(true);
    }
  };

  useEffect(() => {
    if (qrModalOpen) {
      startLiveCameraScan();
    } else {
      stopCameraStream();
      setCameraStatusText('');
    }
    return () => {
      stopCameraStream();
    };
  }, [qrModalOpen]);

  useEffect(() => {
    if (qrModalOpen && cameraActive && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [qrModalOpen, cameraActive, hasHardwareStream]);

  // Masa QR Kodu Seçildiğinde / Okutulduğunda
  const handleSelectTableByQR = (table: DiningTableItem, sourceLabel = 'QR') => {
    setCameraScanningAnim(true);
    setCameraStatusText(`${table.qrCodeNumber} (${table.number})...`);

    fetch('/api/qr/verify-table', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tableId: table.id,
        tableNumber: table.number,
        qrCodeNumber: table.qrCodeNumber,
        qrToken: table.qrToken,
      }),
    }).catch(() => {});

    window.setTimeout(() => {
      setQrVerifiedTableId(table.id);
      setSelectedTableId(table.id);
      setChannel('QR');
      setCameraScanningAnim(false);
      stopCameraStream();
      setQrModalOpen(false);
      setTableOccupancyModalOpen(false);

      const numMatch = table.qrCodeNumber.match(/\d+/);
      const masaNo = numMatch ? parseInt(numMatch[0], 10) : 1;
      try {
        const nextUrl = `${window.location.pathname}?masa=${masaNo}`;
        window.history.replaceState({}, '', nextUrl);
      } catch {
        // ignore
      }

      const titleMsg = `${table.qrCodeNumber} ${t.qrModal.qrSuccessToastTitle}`;
      const descMsg = `${sourceLabel}: ${table.number} (${table.area}) ${t.qrModal.qrSuccessToastDesc} ${table.waiterName}`;
      showToast('success', titleMsg, descMsg);
      triggerCustomerNotification(titleMsg, descMsg);
    }, 300);
  };

  const handleQRFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const digitMatch = file.name.match(/[1-8]/);
    const targetIdx = digitMatch ? parseInt(digitMatch[0], 10) - 1 : 0;
    const matchedTable = tables[targetIdx] || activeTable || tables[0];
    if (matchedTable) {
      handleSelectTableByQR(matchedTable, 'Camera');
    }
  };

  const visibleCategories = useMemo(
    () =>
      categories
        .filter((c) => c.isActive && c.isPrimaryShowcase)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [categories]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategoryId !== 'ALL' && p.categoryId !== selectedCategoryId) return false;
      if (searchQuery.trim()) {
        const translated = getTranslatedProduct(p, currentLang);
        const q = searchQuery.toLowerCase();
        if (
          !p.name.toLowerCase().includes(q) &&
          !p.description.toLowerCase().includes(q) &&
          !translated.name.toLowerCase().includes(q) &&
          !translated.description.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [products, selectedCategoryId, searchQuery, currentLang]);

  const getProductCartQuantity = (productId: string): number => {
    return cart
      .filter((item) => item.product.id === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleQuickQuantityDelta = (product: ProductItem, delta: number) => {
    if (!product.inStock || !product.isActive) return;
    const existingLines = cart.filter((c) => c.product.id === product.id);
    const translated = getTranslatedProduct(product, currentLang);

    if (delta > 0) {
      if (existingLines.length > 0) {
        const targetLineId = existingLines[existingLines.length - 1].lineId;
        setCart((prev) =>
          prev.map((c) =>
            c.lineId === targetLineId ? { ...c, quantity: c.quantity + 1 } : c
          )
        );
      } else {
        setCart((prev) => [
          ...prev,
          {
            lineId: `${product.id}-quick-${Date.now()}`,
            product,
            quantity: 1,
            selectedOptions: [],
            customerNote: '',
          },
        ]);
      }
      showToast(
        'success',
        t.menu.addedToCartTitle,
        `${translated.name} ${t.menu.addedToCartText}`
      );
    } else if (delta < 0 && existingLines.length > 0) {
      const targetLine = existingLines[existingLines.length - 1];
      if (targetLine.quantity <= 1) {
        setCart((prev) => prev.filter((c) => c.lineId !== targetLine.lineId));
      } else {
        setCart((prev) =>
          prev.map((c) =>
            c.lineId === targetLine.lineId ? { ...c, quantity: c.quantity - 1 } : c
          )
        );
      }
    }
  };

  const openProductCustomizer = (product: ProductItem) => {
    if (!product.inStock || !product.isActive) return;
    setCustomizingProduct(product);
    const defaultImg =
      product.imageUrl ||
      product.imageUrls?.[0] ||
      PRODUCT_FALLBACK_IMAGES[product.categoryId] ||
      '/assets/aistudio/crops/cat-ciger.png';
    setActiveCustomImage(defaultImg);
    setCustomQuantity(1);
    setSelectedPortionId('prt-1');
    setSelectedBreadId('brd-lavas');
    setSelectedSpices(['İpek Pul Biber', 'Bol Sumak']);
    setSelectedSaladId('sal-none');
    setSelectedDrinkId('drk-none');
    setSelectedQuickRequests([]);
    setCustomMealNote('');
  };

  const customizerUnitTotal = useMemo(() => {
    if (!customizingProduct) return 0;
    const base = customizingProduct.discountedPrice ?? customizingProduct.price;
    const isFoodMeal = !['CAT-09', 'CAT-12'].includes(customizingProduct.categoryId);

    const portionExtra = isFoodMeal
      ? MEAL_PORTION_OPTIONS.find((p) => p.id === selectedPortionId)?.price || 0
      : 0;
    const breadExtra = isFoodMeal
      ? MEAL_BREAD_OPTIONS.find((b) => b.id === selectedBreadId)?.price || 0
      : 0;
    const saladExtra = isFoodMeal
      ? MEAL_SALAD_ADDONS.find((s) => s.id === selectedSaladId)?.price || 0
      : 0;
    const drinkExtra = isFoodMeal
      ? MEAL_DRINK_ADDONS.find((d) => d.id === selectedDrinkId)?.price || 0
      : 0;

    return roundCurrency(base + portionExtra + breadExtra + saladExtra + drinkExtra);
  }, [
    customizingProduct,
    selectedPortionId,
    selectedBreadId,
    selectedSaladId,
    selectedDrinkId,
  ]);

  const handleAddCustomizedToCart = () => {
    if (!customizingProduct) return;
    const isFoodMeal = !['CAT-09', 'CAT-12'].includes(customizingProduct.categoryId);
    const builtOptions: { name: string; value: string; extraPrice: number }[] = [];

    if (isFoodMeal) {
      const portionObj = MEAL_PORTION_OPTIONS.find((p) => p.id === selectedPortionId);
      if (portionObj) {
        builtOptions.push({
          name: 'Porsiyon',
          value: t.customizer.portions[portionObj.id] || portionObj.id,
          extraPrice: portionObj.price,
        });
      }

      const breadObj = MEAL_BREAD_OPTIONS.find((b) => b.id === selectedBreadId);
      if (breadObj) {
        builtOptions.push({
          name: 'Lavaş / Ekmek',
          value: t.customizer.breads[breadObj.id] || breadObj.id,
          extraPrice: breadObj.price,
        });
      }

      if (selectedSpices.length > 0) {
        builtOptions.push({
          name: 'Baharat',
          value: selectedSpices.map((sp) => t.customizer.spices[sp] || sp).join(', '),
          extraPrice: 0,
        });
      }

      const saladObj = MEAL_SALAD_ADDONS.find((s) => s.id === selectedSaladId);
      if (saladObj && saladObj.id !== 'sal-none') {
        builtOptions.push({
          name: 'Salata',
          value: t.customizer.salads[saladObj.id] || saladObj.id,
          extraPrice: saladObj.price,
        });
      }

      const drinkObj = MEAL_DRINK_ADDONS.find((d) => d.id === selectedDrinkId);
      if (drinkObj && drinkObj.id !== 'drk-none') {
        builtOptions.push({
          name: 'İçecek',
          value: t.customizer.drinks[drinkObj.id] || drinkObj.id,
          extraPrice: drinkObj.price,
        });
      }
    }

    const combinedNoteParts = [
      ...selectedQuickRequests.map((r) => t.customizer.quickRequests[r] || r),
      customMealNote.trim(),
    ].filter(Boolean);
    const finalNote = combinedNoteParts.join(' · ');

    const translatedProd = getTranslatedProduct(customizingProduct, currentLang);

    setCart((prev) => [
      ...prev,
      {
        lineId: `${customizingProduct.id}-${Date.now()}`,
        product: customizingProduct,
        quantity: customQuantity,
        selectedOptions: builtOptions,
        customerNote: finalNote,
      },
    ]);

    showToast(
      'success',
      t.menu.addedToCartTitle,
      `${customQuantity}x ${translatedProd.name} ${t.menu.addedToCartText}`
    );
    setCustomizingProduct(null);
  };

  const updateCartLineQty = (lineId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.lineId === lineId ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  };

  const totalCartItemsCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const cartSubtotal = useMemo(() => {
    return roundCurrency(
      cart.reduce((sum, line) => {
        const base = line.product.discountedPrice ?? line.product.price;
        const extra = line.selectedOptions.reduce((s, o) => s + o.extraPrice, 0);
        return sum + (base + extra) * line.quantity;
      }, 0)
    );
  }, [cart]);

  const appliedCampaign = useMemo(() => {
    if (!selectedCouponCode) return null;
    const found = campaigns.find(
      (c) => c.couponCode.toUpperCase() === selectedCouponCode.trim().toUpperCase()
    );
    if (!found) return null;
    return {
      campaign: found,
      result: calculateCampaignDiscount({
        subtotal: cartSubtotal,
        discountType: found.type,
        discountValue: found.discountValue,
        minOrderAmount: found.minOrderAmount,
        isActive: found.isActive,
      }),
    };
  }, [campaigns, selectedCouponCode, cartSubtotal]);

  const finalDiscountAmount = appliedCampaign?.result.applicable
    ? appliedCampaign.result.discountAmount
    : 0;
  const activeTaxRatePercent = siteCmsConfig.generalSettings.taxRatePercent ?? 10;
  const activeCourierFee =
    channel === 'Paket servis'
      ? siteCmsConfig.generalSettings.courierDeliveryFee ?? 35
      : 0;

  const checkoutTotals = useMemo(
    () =>
      calculateCustomerCheckoutTotals({
        subtotal: cartSubtotal,
        discountAmount: finalDiscountAmount,
        taxRatePercent: activeTaxRatePercent,
        deliveryFee: activeCourierFee,
        tipPercent,
        customTipAmount: Number(customTipInput) || 0,
      }),
    [
      cartSubtotal,
      finalDiscountAmount,
      activeTaxRatePercent,
      activeCourierFee,
      tipPercent,
      customTipInput,
    ]
  );
  const cartFinalTotal = checkoutTotals.finalTotal;

  const activeTableOrders = useMemo(
    () =>
      orders.filter((o) => {
        if (o.status === 'İptal edildi' || o.status === 'İade edildi') return false;
        if (qrVerifiedTableId && o.tableId === qrVerifiedTableId) return true;
        if (lastPlacedOrderNumber && o.orderNumber === lastPlacedOrderNumber) return true;
        if (customerMember?.phone && o.customerPhone === customerMember.phone) return true;
        return false;
      }),
    [orders, qrVerifiedTableId, lastPlacedOrderNumber, customerMember]
  );

  const memberPastOrders = useMemo(() => {
    if (!customerMember) return [];
    const phoneDigits = customerMember.phone.replace(/\D/g, '');
    const matched = orders.filter((o) => {
      const ordPhone = o.customerPhone.replace(/\D/g, '');
      return (
        (phoneDigits && ordPhone && ordPhone.includes(phoneDigits.slice(-7))) ||
        o.customerName.toLowerCase().includes(customerMember.name.toLowerCase())
      );
    });
    return matched.length > 0 ? matched : orders.slice(0, 3);
  }, [orders, customerMember]);

  const activeTableWaiterCalls = useMemo(
    () =>
      qrVerifiedTableId
        ? waiterCalls.filter(
            (w) => w.tableId === qrVerifiedTableId && w.status !== 'Tamamlandı'
          )
        : [],
    [waiterCalls, qrVerifiedTableId]
  );

  const handleReorderPastOrder = (ord: OrderRecord) => {
    const newLines: CustomerCartLine[] = [];
    ord.items.forEach((it, idx) => {
      const prod = products.find((p) => p.id === it.productId || p.name === it.productName);
      if (prod) {
        newLines.push({
          lineId: `REORD-${prod.id}-${Date.now()}-${idx}`,
          product: prod,
          quantity: it.quantity,
          selectedOptions: it.options || [],
          customerNote: it.customerNote || '',
        });
      }
    });
    if (newLines.length === 0) {
      showToast('error', 'Uyarı', 'Sipariş ürünleri şu an menüde bulunamadı.');
      return;
    }
    setCart((prev) => [...prev, ...newLines]);
    setMemberModalOpen(false);
    setCartDrawerOpen(true);
    showToast('success', `#${ord.orderNumber}`, t.extras.reorderSuccess);
  };

  const handleSaveCustomerMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberNameInput.trim() || !memberPhoneInput.trim()) return;
    const nextMember = {
      name: memberNameInput.trim(),
      phone: memberPhoneInput.trim(),
      email: memberEmailInput.trim() || 'uye@oztikeciger.com.tr',
      address: memberAddressInput.trim(),
    };
    setCustomerMember(nextMember);
    setCustomerName(nextMember.name);
    setCustomerPhone(nextMember.phone);
    if (nextMember.address) setDeliveryAddress(nextMember.address);
    try {
      localStorage.setItem('oztike_customer_member_v1', JSON.stringify(nextMember));
    } catch {
      // ignore
    }
    onRegisterMember?.(nextMember);
    showToast('success', nextMember.name, t.extras.memberWelcome);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const qrAccess = canAccessQrProtectedFeature(qrVerifiedTableId, channel);
    if (!qrAccess.allowed) {
      showToast('error', t.extras.qrRequiredTitle, t.extras.qrRequiredOrderDesc);
      setCartDrawerOpen(false);
      setQrModalOpen(true);
      return;
    }

    if (channel === 'Paket servis') {
      const minOrder = siteCmsConfig.generalSettings.minDeliveryOrderAmount || 0;
      if (cartSubtotal < minOrder) {
        showToast(
          'error',
          t.extras.courierBadge,
          `${t.extras.minOrderPrefix}: ${minOrder} ₺`
        );
        return;
      }
      if (!deliveryAddress.trim() || !customerPhone.trim()) {
        showToast('error', t.extras.courierBadge, t.extras.deliveryFieldsRequired);
        return;
      }
    }

    const res = onPlaceCustomerOrder({
      tableId: qrVerifiedTableId || selectedTableId,
      qrToken: qrVerifiedTableId ? activeTable?.qrToken || '' : '',
      channel,
      customerName:
        customerName.trim() ||
        (channel === 'QR' ? activeTableNumberBadge : t.cartModal.channelDelivery),
      customerPhone: customerPhone.trim() || '-',
      deliveryAddress: channel === 'Paket servis' ? deliveryAddress.trim() : undefined,
      note: orderNote,
      idempotencyKey: `QR-ORD-${qrVerifiedTableId || channel}-${Date.now()}`,
      discountAmount: finalDiscountAmount,
      couponCode: appliedCampaign?.result.applicable
        ? appliedCampaign.campaign.couponCode
        : undefined,
      paymentMethod,
      tipAmount: checkoutTotals.tipAmount,
      items: cart.map((c) => ({
        product: c.product,
        quantity: c.quantity,
        options: c.selectedOptions,
        customerNote: c.customerNote,
      })),
    });

    if (res.success) {
      if (res.orderNumber) setLastPlacedOrderNumber(res.orderNumber);
      setCart([]);
      setOrderNote('');
      setTipPercent(0);
      setCustomTipInput('');
      const titleMsg = `${t.cartModal.orderSuccessTitle} (#${res.orderNumber})`;
      const descMsg =
        channel === 'QR'
          ? `${activeTableNumberBadge} ${t.cartModal.orderSuccessDesc} · ${paymentMethod}`
          : `${channel} · ${paymentMethod} · ${cartFinalTotal.toFixed(2)} ₺`;
      showToast('success', titleMsg, descMsg);
      triggerCustomerNotification(titleMsg, descMsg);
    } else {
      showToast('error', 'Hata', res.message);
    }
  };

  // Garson Çağır Gönder (Sadece QR Kod Okutan Masalar İçin Geçerli + Çay/Soda Adet Desteği)
  const totalWaiterDrinksCount = useMemo(
    () => Object.values(waiterDrinkQuantities).reduce((sum, q) => sum + (q > 0 ? q : 0), 0),
    [waiterDrinkQuantities]
  );

  const handleWaiterCallSubmit = () => {
    const qrAccess = canAccessQrProtectedFeature(qrVerifiedTableId, 'waiter_call');
    if (!qrAccess.allowed || !activeTable) {
      setWaiterModalOpen(false);
      showToast('error', t.extras.qrRequiredTitle, t.extras.qrRequiredWaiterDesc);
      setQrModalOpen(true);
      return;
    }

    const translatedNeeds = selectedWaiterNeeds.map(
      (k) => t.waiterModal.needs[k]?.label || k
    );
    const localizedDrinkMap: Record<string, number> = {};
    Object.entries(waiterDrinkQuantities).forEach(([drinkKey, qty]) => {
      if (qty > 0) {
        const lbl = t.waiterModal.drinkItems[drinkKey] || drinkKey;
        localizedDrinkMap[lbl] = qty;
      }
    });
    const drinkNeeds = formatWaiterDrinkQuantities(localizedDrinkMap);
    const combinedNeeds = [...translatedNeeds, ...drinkNeeds];
    const finalNeeds =
      combinedNeeds.length > 0 ? combinedNeeds : [t.waiterModal.needs['w-garson'].label];

    const res = onSubmitWaiterServiceCall({
      tableId: activeTable.id,
      qrToken: activeTable.qrToken,
      selectedNeeds: finalNeeds,
      customNote: waiterCustomNote,
    });

    if (res.success) {
      setWaiterCustomNote('');
      setWaiterDrinkQuantities({});
      setWaiterModalOpen(false);
      const titleMsg = `${t.waiterModal.dispatchedTitle} (${activeTableNumberBadge})`;
      const descMsg = `${finalNeeds.join(', ')} — ${activeTable.waiterName}: ${t.waiterModal.dispatchedDesc}`;
      showToast('success', titleMsg, descMsg);
      triggerCustomerNotification(titleMsg, descMsg);
    } else {
      showToast('error', 'Hata', res.message);
    }
  };

  // Ücretsiz Yapay Zekâ Asistanı Soru Gönderme
  const handleAskAiAssistant = async (promptText?: string) => {
    const query = (promptText ?? aiInput).trim();
    if (!query) return;
    const userMsgId = `USR-${Date.now()}`;
    setAiMessages((prev) => [...prev, { id: userMsgId, role: 'user', text: query }]);
    if (!promptText) setAiInput('');
    setAiLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          lang: currentLang,
          tableBadge: activeTableNumberBadge,
        }),
      });
      const data = await response.json();
      setAiMessages((prev) => [
        ...prev,
        {
          id: `AI-${Date.now()}`,
          role: 'assistant',
          text: data.reply || t.aiAssistant.welcomeMessage,
          recommendedProductIds: Array.isArray(data.recommendedProductIds)
            ? data.recommendedProductIds
            : ['PRD-01', 'PRD-09', 'PRD-11'],
        },
      ]);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        {
          id: `AI-${Date.now()}`,
          role: 'assistant',
          text: t.aiAssistant.welcomeMessage,
          recommendedProductIds: ['PRD-01', 'PRD-02', 'PRD-09', 'PRD-11'],
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const scrollCategories = (dir: 'left' | 'right') => {
    if (!categoryScrollRef.current) return;
    const amount = dir === 'left' ? -260 : 260;
    categoryScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  // Galeri filtreleme
  const activeGalleryItems = useMemo(() => {
    return siteCmsConfig.gallery.filter((item) => {
      if (!item.isActive) return false;
      if (galleryFilter === 'photo') return item.type === 'photo';
      if (galleryFilter === 'video') return item.type === 'video';
      return true;
    });
  }, [siteCmsConfig.gallery, galleryFilter]);

  const currentSlide = activeSlides[currentSlideIdx] || activeSlides[0];
  const slideLocalized = currentSlide
    ? getSlideByLang(currentSlide, currentLang)
    : {
        title: 'Gerçek Ciğer Ustalık İster.',
        subtitle: 'Halil Usta · 1996’dan Beri',
        badge: 'ÖzTike Ciğer',
      };

  const cmsLang =
    currentLang === 'ar'
      ? 'ar'
      : currentLang === 'en' || currentLang === 'fr' || currentLang === 'de' || currentLang === 'ja' || currentLang === 'zh'
      ? 'en'
      : 'tr';

  const brandSubtitleByLang =
    cmsLang === 'en'
      ? siteCmsConfig.header.brandSubtitleEn
      : cmsLang === 'ar'
      ? siteCmsConfig.header.brandSubtitleAr
      : siteCmsConfig.header.brandSubtitleTr;

  const announcementByLang =
    cmsLang === 'en'
      ? siteCmsConfig.announcementBar.textEn || siteCmsConfig.announcementBar.textTr
      : cmsLang === 'ar'
      ? siteCmsConfig.announcementBar.textAr || siteCmsConfig.announcementBar.textTr
      : siteCmsConfig.announcementBar.textTr;

  const addressByLang =
    cmsLang === 'en'
      ? siteCmsConfig.contact.addressEn
      : cmsLang === 'ar'
      ? siteCmsConfig.contact.addressAr
      : siteCmsConfig.contact.addressTr;

  const workingHoursByLang =
    cmsLang === 'en'
      ? siteCmsConfig.contact.workingHoursEn
      : cmsLang === 'ar'
      ? siteCmsConfig.contact.workingHoursAr
      : siteCmsConfig.contact.workingHoursTr;

  const footerAboutByLang =
    cmsLang === 'en'
      ? siteCmsConfig.footer.aboutEn
      : cmsLang === 'ar'
      ? siteCmsConfig.footer.aboutAr
      : siteCmsConfig.footer.aboutTr;

  const copyrightByLang =
    cmsLang === 'en'
      ? siteCmsConfig.footer.copyrightEn
      : cmsLang === 'ar'
      ? siteCmsConfig.footer.copyrightAr
      : siteCmsConfig.footer.copyrightTr;

  const primaryButtonClass =
    siteCmsConfig.design.buttonStyle === 'emerald-accent'
      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
      : siteCmsConfig.design.buttonStyle === 'copper-solid'
      ? 'bg-[#B86B35] hover:bg-[#9F5928] text-white'
      : 'bg-gradient-to-r from-[#D4A359] to-[#B0782C] text-[#1A0B08] hover:brightness-110';

  const headerNavItems = siteCmsConfig.header.navMenus.filter(
    (m) => m.isActive && (m.location === 'header' || m.location === 'both')
  );
  const footerNavItems = siteCmsConfig.header.navMenus.filter(
    (m) => m.isActive && (m.location === 'footer' || m.location === 'both')
  );

  const handleNavAction = (url: string) => {
    if (url.startsWith('/')) {
      const matchedPage = cmsPages.find((p) => p.slug === url);
      if (matchedPage) {
        setActiveCmsPage(matchedPage);
        return;
      }
    }
  };

  // Açılır Pop-up Duyuru & Kampanya State
  const [showPromoPopup, setShowPromoPopup] = useState(false);
  const [copiedPromoCode, setCopiedPromoCode] = useState(false);

  useEffect(() => {
    if (siteCmsConfig.promoPopup?.enabled) {
      try {
        const hasSeen = sessionStorage.getItem('oztike_promo_seen');
        if (siteCmsConfig.promoPopup.showOncePerSession && hasSeen) {
          return;
        }
      } catch {
        // ignore
      }
      const delay = Math.max(1, siteCmsConfig.promoPopup.delaySeconds || 2) * 1000;
      const timer = setTimeout(() => {
        setShowPromoPopup(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [siteCmsConfig.promoPopup]);

  const handleDismissPromoPopup = () => {
    setShowPromoPopup(false);
    try {
      sessionStorage.setItem('oztike_promo_seen', 'true');
    } catch {
      // ignore
    }
  };

  const handleCategorySelect = (catId: string) => {
    setSelectedCategoryId(catId);
    const menuSec = document.getElementById('menu');
    if (menuSec) {
      const rect = menuSec.getBoundingClientRect();
      // Yalnızca menü yukarıda kalmışsa (aşağı kaydırmışsak), menüyü ekranın tepesine (sticky bar: 64px) hizala
      // Anasayfanın en tepesine fırlatmaz, doğrudan kategori ürünlerinin başında kalır!
      if (rect.top < 60) {
        const targetScrollY = window.scrollY + rect.top - 64;
        window.scrollTo({
          top: Math.max(0, targetScrollY),
          behavior: 'smooth',
        });
      }
    }
  };

  return (
    <div
      id="ust"
      dir={t.dir}
      style={{
        backgroundColor: siteCmsConfig.design.backgroundColor || '#120806',
        color: '#F9F2E7',
      }}
      className="min-h-screen pb-28 selection:bg-[#D4A359] selection:text-[#1A0B08]"
    >
      {/* Üst Duyuru Bandı (Admin Panelden Tam Yönetilebilir) */}
      {siteCmsConfig.announcementBar.enabled && !announcementDismissed && (
        <div
          style={{
            backgroundColor: siteCmsConfig.announcementBar.bgColor || '#2A120C',
            color: siteCmsConfig.announcementBar.textColor || '#F6D79E',
          }}
          className={`${
            siteCmsConfig.announcementBar.sticky ? 'sticky top-0 z-50' : 'relative z-40'
          } border-b border-[#D4A359]/30 px-3 sm:px-6 py-2 text-[11px] sm:text-xs font-medium`}
        >
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-2.5 pe-6">
            {siteCmsConfig.announcementBar.badgeText && (
              <span className="px-2 py-0.5 rounded-md bg-[#D4A359] text-[#1A0B08] font-extrabold text-[10px] tracking-wide shrink-0">
                {siteCmsConfig.announcementBar.badgeText}
              </span>
            )}
            <span className="text-center leading-snug">{announcementByLang}</span>
            {siteCmsConfig.announcementBar.linkUrl && siteCmsConfig.announcementBar.linkLabelTr && (
              <a
                href={siteCmsConfig.announcementBar.linkUrl}
                className="underline font-bold shrink-0 hover:opacity-80"
              >
                {siteCmsConfig.announcementBar.linkLabelTr}
              </a>
            )}
          </div>
          {siteCmsConfig.announcementBar.dismissible && (
            <button
              type="button"
              onClick={() => setAnnouncementDismissed(true)}
              aria-label="Duyuruyu Kapat"
              className="absolute end-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-black/20 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* =====================================================================
          1. HEADER (DİNAMİK LOGO, MENÜLER, ÇOKLU DİL TR/EN/AR VE CANLI BİLDİRİMLER)
      ===================================================================== */}
      <header
        className={`${
          siteCmsConfig.header.stickyHeader ? 'sticky top-0' : ''
        } z-40 bg-[#120806]/95 backdrop-blur-md border-b border-[#D4A359]/25`}
      >
        <div className="max-w-6xl mx-auto px-3.5 sm:px-6 h-16 flex items-center justify-between gap-2">
          {/* Sol: Şeffaf Arka Planlı ÖzTike Ciğer Logosu */}
          <a href="#ust" className="flex items-center gap-2.5 min-w-0 group">
            <img
              src={siteCmsConfig.header.logoUrl || '/assets/aistudio/oztike-logo-transparent.png'}
              alt={`${siteCmsConfig.header.brandTitle} Logo`}
              style={{
                height: `${siteCmsConfig.header.logoHeightPx || 44}px`,
                width: `${siteCmsConfig.header.logoHeightPx || 44}px`,
              }}
              className="object-contain drop-shadow-[0_2px_10px_rgba(212,163,89,0.45)] shrink-0 group-hover:scale-105 transition-transform"
            />
            <div className="truncate">
              <span className="font-editorial text-lg sm:text-xl font-bold tracking-tight text-[#F6D79E] block leading-none">
                {siteCmsConfig.header.brandTitle}
              </span>
              <span className="text-[10px] tracking-widest uppercase text-[#C9A87C] block mt-0.5">
                {brandSubtitleByLang}
              </span>
            </div>
          </a>

          {/* Orta: Admin Panelden Yönetilebilir Menü Öğeleri */}
          <nav
            aria-label="Site Bölümleri"
            className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#DECAB4]"
          >
            {headerNavItems.map((nav) => (
              <a
                key={nav.id}
                href={nav.url}
                target={nav.openInNewTab ? '_blank' : undefined}
                rel={nav.openInNewTab ? 'noopener noreferrer' : undefined}
                onClick={(e) => {
                  if (nav.url.startsWith('/')) {
                    e.preventDefault();
                    handleNavAction(nav.url);
                  }
                }}
                className="hover:text-[#F6D79E] transition-colors whitespace-nowrap"
              >
                {getNavLabelByLang(nav, currentLang)}
              </a>
            ))}
          </nav>

          {/* Sağ: Çoklu Dil Değiştirme İkonu (TR | EN | AR) + Çalışan Bildirim Merkezi + PWA Uygulama İndir */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Çoklu Dil Değiştirme İkonu & Seçici (TR / EN / AR) */}
            {siteCmsConfig.header.showLanguageSwitcher && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setLangDropdownOpen(!langDropdownOpen);
                    setNotifDropdownOpen(false);
                  }}
                  aria-label="Dil Seçimi (Türkçe / English / العربية)"
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-[#24110D] hover:bg-[#311711] border border-[#D4A359]/45 text-xs font-bold text-[#F5D69B] transition-colors cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-[#D4A359] shrink-0" />
                  <span>{t.langShort}</span>
                  <span className="hidden md:inline text-[11px] font-normal text-[#DECAB4]">
                    · {t.langName}
                  </span>
                </button>

                {langDropdownOpen && (
                  <div className="absolute end-0 mt-2 w-52 rounded-2xl border border-[#D4A359]/45 bg-[#1A0B08] p-1.5 shadow-2xl z-50 space-y-1 max-h-80 overflow-y-auto">
                    {SUPPORTED_LANGUAGES.map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => handleSelectLanguage(item.code)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          currentLang === item.code
                            ? 'bg-[#D4A359] text-[#1A0B08]'
                            : 'text-[#F6D79E] hover:bg-[#2A130E]'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{item.flag}</span>
                          <span>{item.label}</span>
                        </span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/25">
                          {item.short}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Çalışan Canlı Bildirim Sistemi İkonu */}
            {siteCmsConfig.header.showNotificationBell && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    setLangDropdownOpen(false);
                  }}
                  aria-label={`${t.header.notificationsTitle} (${unreadNotifCount})`}
                  className="relative inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-[#24110D] hover:bg-[#311711] border border-[#D4A359]/35 text-xs font-bold text-[#F5D69B] transition-colors cursor-pointer"
                >
                  <Bell className="w-4 h-4 text-[#D4A359]" />
                  {unreadNotifCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-[#081A10] font-mono text-[10px] font-extrabold">
                      {unreadNotifCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute end-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#D4A359]/45 bg-[#1B0C09] p-4 shadow-2xl z-50 space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-[#D4A359]/20 pb-2.5 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Bell className="w-4 h-4 text-[#D4A359] shrink-0" />
                        <span className="font-bold text-[#FFF7EB] truncate">
                          {t.header.notificationsTitle}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSoundEnabled(!soundEnabled)}
                          aria-label="Bildirim Sesini Aç/Kapat"
                          className="p-1.5 rounded-lg bg-[#2B140E] text-[#F5D69B] cursor-pointer"
                        >
                          {soundEnabled ? (
                            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleMarkNotificationsRead}
                          className="text-[11px] text-[#D4A359] underline cursor-pointer"
                        >
                          {t.header.markAllRead}
                        </button>
                        {activeNotifications.length > 0 && (
                          <button
                            type="button"
                            onClick={handleClearAllNotifs}
                            className="text-[11px] text-rose-400 hover:underline font-bold cursor-pointer"
                          >
                            {t.header.clearAllNotifications}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                      {activeNotifications.length === 0 ? (
                        <div className="py-6 text-center text-[#A88E76]">
                          {t.header.noNotifications}
                        </div>
                      ) : (
                        activeNotifications.slice(0, 8).map((n) => (
                          <div
                            key={n.id}
                            className={`relative p-2.5 pe-7 rounded-xl border ${
                              n.unread
                                ? 'border-[#D4A359]/45 bg-[#28120D]'
                                : 'border-[#D4A359]/15 bg-[#140806]'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => handleDismissNotif(n.id)}
                              aria-label="Bildirimi Sil"
                              className="absolute top-2 end-2 p-0.5 rounded-md text-[#A88E76] hover:text-rose-400 hover:bg-black/30 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <div className="flex items-center justify-between gap-2 font-bold text-[#F6D79E]">
                              <span className="truncate">{n.title}</span>
                              <span className="font-mono text-[10px] text-[#C4AC95] shrink-0">
                                {n.time}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#DECAB4] mt-1">{n.detail}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if ('Notification' in window && Notification.permission === 'default') {
                          Notification.requestPermission().catch(() => {});
                        }
                        triggerCustomerNotification(
                          `Canlı Bildirim Testi (${activeTableNumberBadge})`,
                          `Sesli ve anlık bildirim sistemi aktif! Sorumlu Garson: ${activeTable?.waiterName}`
                        );
                      }}
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-[#D4A359] to-[#B0782C] text-[#1A0B08] font-bold text-xs cursor-pointer"
                    >
                      🔔 {t.header.sendTestNotification}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Bildirim Toast */}
      {toastBanner && (
        <div className="fixed top-20 end-4 start-4 sm:start-auto sm:w-96 z-[200] rounded-2xl border border-[#D4A359]/50 bg-[#1B0C09]/95 backdrop-blur-md p-4 shadow-2xl flex items-start gap-3">
          <CheckCircle2
            className={`w-5 h-5 shrink-0 mt-0.5 ${
              toastBanner.type === 'success' ? 'text-emerald-400' : 'text-rose-400'
            }`}
          />
          <div className="flex-1 min-w-0 text-xs">
            <div className="font-bold text-[#F5D69B]">{toastBanner.title}</div>
            <div className="text-[#DECAB4] mt-0.5">{toastBanner.text}</div>
          </div>
          <button
            type="button"
            onClick={() => setToastBanner(null)}
            aria-label="Bildirimi Kapat"
            className="text-[#A88E76] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =====================================================================
          2A. ŞIK ARAMA BARI (SLIDER'IN HEMEN ÜSTÜNDE)
      ===================================================================== */}
      {siteCmsConfig.header.showSearchBarAboveSlider && (
        <section
          aria-label="Menü Arama Çubuğu"
          className="max-w-6xl mx-auto px-3.5 sm:px-6 pt-4 pb-1.5"
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1 group">
              <Search className="w-4 h-4 text-[#D4A359] absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.menu.searchPlaceholder}
                aria-label={t.menu.searchPlaceholder}
                className="w-full rounded-2xl border border-[#D4A359]/35 bg-[#1B0D09]/95 ps-11 pe-10 py-3 text-xs sm:text-sm text-[#FFF6E9] placeholder-[#A88E76] shadow-[0_6px_24px_rgba(0,0,0,0.45)] focus:outline-none focus:border-[#D4A359] focus:ring-2 focus:ring-[#D4A359]/25 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Aramayı Temizle"
                  className="absolute end-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[#C4AC95] hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {(activeTableOrders.length > 0 || activeTableWaiterCalls.length > 0) && (
              <button
                type="button"
                onClick={() => setCartDrawerOpen(true)}
                className="inline-flex items-center justify-between sm:justify-start gap-2 px-4 py-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-xs font-semibold text-emerald-300 shadow-lg cursor-pointer shrink-0"
              >
                <Clock className="w-4 h-4 shrink-0" />
                <span>
                  {activeTableOrders.length > 0
                    ? `${t.menu.activeOrderBadge}: ${activeTableOrders[0].status}`
                    : t.menu.waiterCalledBadge}
                </span>
              </button>
            )}
          </div>
        </section>
      )}

      {/* =====================================================================
          2B. HERO SLIDER & SİTEDEKİ TEK "QR KOD OKU" BUTONU
          (QR Kod Oku Butonu Sadece Burada Yer Alır)
      ===================================================================== */}
      <section className="max-w-6xl mx-auto px-3.5 sm:px-6 py-2">
        <div className="relative rounded-3xl overflow-hidden border border-[#D4A359]/35 bg-[#1B0C09] min-h-[210px] sm:min-h-[250px] flex items-center">
          <img
            src={currentSlide?.imageUrl || '/assets/aistudio/crops/hero-ciger.png'}
            alt={slideLocalized.title}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-55 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#120806] via-[#120806]/85 to-[#120806]/30" />

          <div className="relative z-10 w-full p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4 sm:gap-5">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D4A359]/20 border border-[#D4A359]/40 text-[11px] font-semibold text-[#F6D79E]">
                  <Flame className="w-3.5 h-3.5 text-[#D4A359]" />
                  {slideLocalized.badge}
                </span>
                <h1 className="font-editorial text-2xl sm:text-4xl font-bold text-[#FFF7EB] mt-2 leading-tight">
                  {slideLocalized.title}
                </h1>
                <p className="text-xs sm:text-sm text-[#DECAB4] mt-1 max-w-lg">
                  {slideLocalized.subtitle}
                </p>
              </div>
            </div>

            {/* SİTEDEKİ TEK "QR KOD OKU" BUTONU + MASA DURUMLARI & ÜYELİK */}
            <div className="flex flex-col sm:items-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setQrModalOpen(true)}
                className={`inline-flex items-center justify-center gap-2.5 px-5 py-3.5 ${siteCmsConfig.design.buttonRadius} ${primaryButtonClass} font-extrabold text-xs sm:text-sm shadow-xl transition-all cursor-pointer`}
              >
                <QrCode className="w-4 h-4 shrink-0" />
                <span>
                  {currentLang === 'tr' && siteCmsConfig.design.qrButtonLabelTr
                    ? siteCmsConfig.design.qrButtonLabelTr
                    : t.hero.qrScanSingleBtn}
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-black/20 font-mono text-[11px]">
                  {qrVerifiedTableId ? activeTableNumberBadge : t.extras.qrUnverifiedBadge}
                </span>
              </button>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTableOccupancyModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#22100C]/90 hover:bg-[#311711] border border-[#D4A359]/35 text-[11px] font-semibold text-[#F6D79E] cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-[#D4A359]" />
                  <span>{t.extras.tableStatusBtn}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMemberModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#22100C]/90 hover:bg-[#311711] border border-[#D4A359]/35 text-[11px] font-semibold text-[#F6D79E] cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-[#D4A359]" />
                  <span>
                    {customerMember ? `${customerMember.name.split(' ')[0]} · ${t.extras.memberOrdersTab}` : t.extras.memberBtn}
                  </span>
                </button>
              </div>

              {activeSlides.length > 1 && (
                <div className="flex items-center gap-1.5 self-end">
                  {activeSlides.map((sl, idx) => (
                    <button
                      key={sl.id}
                      type="button"
                      onClick={() => setCurrentSlideIdx(idx)}
                      aria-label={`Slayt ${idx + 1}`}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        currentSlideIdx === idx
                          ? 'w-6 bg-[#D4A359]'
                          : 'w-2 bg-[#D4A359]/35'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. SAĞA SOLA KAYDIRMALI KÜÇÜK RESİMLİ KATEGORİ KARTLARI (STICKY)
      ===================================================================== */}
      <section
        id="menu"
        aria-label={t.categories.sectionTitle}
        data-compact={isCategoryStickyCompact ? 'true' : 'false'}
        className={`sticky top-16 z-30 bg-[#120806]/95 backdrop-blur-md border-b border-[#D4A359]/15 transition-all duration-200 ${
          isCategoryStickyCompact ? 'py-1.5' : 'py-3'
        }`}
      >
        <div className="max-w-6xl mx-auto px-3.5 sm:px-6">
          <div
            className={`flex items-center justify-between gap-2 ${
              isCategoryStickyCompact ? 'mb-1' : 'mb-2'
            }`}
          >
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#F5D69B]">
                {t.categories.sectionTitle}
              </h2>
              {!isCategoryStickyCompact && (
                <span className="text-[11px] text-[#A88E76]">{t.categories.swipeHint}</span>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollCategories('left')}
                aria-label="Sola Kaydır"
                className="p-1.5 rounded-lg bg-[#1F0E0B] border border-[#D4A359]/30 text-[#F5D69B] hover:bg-[#2C140F] cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollCategories('right')}
                aria-label="Sağa Kaydır"
                className="p-1.5 rounded-lg bg-[#1F0E0B] border border-[#D4A359]/30 text-[#F5D69B] hover:bg-[#2C140F] cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            ref={categoryScrollRef}
            className="flex items-center gap-2.5 overflow-x-auto snap-x snap-mandatory pb-0.5 no-scrollbar"
          >
            <button
              type="button"
              onClick={() => handleCategorySelect('ALL')}
              className={`group shrink-0 snap-start ${
                isCategoryStickyCompact ? 'w-20 sm:w-24' : 'w-24 sm:w-28'
              } rounded-xl overflow-hidden border transition-all text-left cursor-pointer ${
                selectedCategoryId === 'ALL'
                  ? 'border-[#D4A359] bg-[#2B140E] ring-2 ring-[#D4A359]/40'
                  : 'border-[#D4A359]/20 bg-[#1A0C09] hover:border-[#D4A359]/50'
              }`}
            >
              <div
                className={`${
                  isCategoryStickyCompact ? 'h-7 sm:h-8' : 'h-14 sm:h-16'
                } w-full overflow-hidden relative transition-all duration-200`}
              >
                <img
                  src={CATEGORY_CARD_IMAGES.ALL}
                  alt={t.categories.all}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#120806] via-transparent to-transparent" />
              </div>
              <div className={`${isCategoryStickyCompact ? 'py-1 px-1.5' : 'p-2'} text-center`}>
                <div
                  className={`${
                    isCategoryStickyCompact ? 'text-[11px]' : 'text-xs'
                  } font-bold text-[#FFF6E9] truncate`}
                >
                  {t.categories.all}
                </div>
              </div>
            </button>

            {visibleCategories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              const imgUrl =
                cat.imageUrl || CATEGORY_CARD_IMAGES[cat.id] || '/assets/aistudio/crops/cat-ciger.png';
              const catName = getTranslatedCategoryName(cat, currentLang);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`group shrink-0 snap-start ${
                    isCategoryStickyCompact ? 'w-20 sm:w-24' : 'w-24 sm:w-28'
                  } rounded-xl overflow-hidden border transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'border-[#D4A359] bg-[#2B140E] ring-2 ring-[#D4A359]/40'
                      : 'border-[#D4A359]/20 bg-[#1A0C09] hover:border-[#D4A359]/50'
                  }`}
                >
                  <div
                    className={`${
                      isCategoryStickyCompact ? 'h-7 sm:h-8' : 'h-14 sm:h-16'
                    } w-full overflow-hidden relative transition-all duration-200`}
                  >
                    <img
                      src={imgUrl}
                      alt={catName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#120806] via-transparent to-transparent" />
                  </div>
                  <div className={`${isCategoryStickyCompact ? 'py-1 px-1.5' : 'p-2'} text-center`}>
                    <div
                      className={`${
                        isCategoryStickyCompact ? 'text-[11px]' : 'text-xs'
                      } font-bold text-[#FFF6E9] truncate`}
                    >
                      {catName}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. ANA İÇERİK: ÜRÜN KARTLARI (+ / - ADET ÇOĞALTMA & ÖZELLEŞTİRME)
      ===================================================================== */}
      <main className="max-w-6xl mx-auto px-3.5 sm:px-6 pt-5 space-y-8 min-h-[85vh]">

        {/* Ürün Listesi Grid */}
        <div id="product-grid-section" className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredProducts.map((product) => {
            const effectivePrice = product.discountedPrice ?? product.price;
            const imgSrc =
              product.imageUrl ||
              product.imageUrls?.[0] ||
              PRODUCT_FALLBACK_IMAGES[product.categoryId] ||
              '/assets/aistudio/crops/cat-ciger.png';
            const qtyInCart = getProductCartQuantity(product.id);
            const isFoodMeal = !['CAT-09', 'CAT-12'].includes(product.categoryId);
            const translated = getTranslatedProduct(product, currentLang);

            return (
              <article
                key={product.id}
                className={`${siteCmsConfig.design.cardRadius} overflow-hidden border border-[#D4A359]/20 bg-[#1A0C09] hover:border-[#D4A359]/45 transition-all p-3 sm:p-3.5 flex flex-col gap-3`}
              >
                <div className="flex gap-3 items-start">
                  <button
                    type="button"
                    onClick={() => openProductCustomizer(product)}
                    className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-[#120705] border border-[#D4A359]/20 cursor-pointer group"
                  >
                    <img
                      src={imgSrc}
                      alt={translated.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.discountedPrice && (
                      <span className="absolute top-1.5 start-1.5 px-1.5 py-0.5 rounded bg-emerald-700 text-white text-[10px] font-bold">
                        {t.menu.discountBadge}
                      </span>
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => openProductCustomizer(product)}
                      className="text-start font-bold text-sm sm:text-base text-[#FFF7EB] hover:text-[#F5D69B] transition-colors line-clamp-1 cursor-pointer block w-full"
                    >
                      {translated.name}
                    </button>
                    <p className="text-xs text-[#C4AC95] line-clamp-2 mt-1 leading-relaxed">
                      {translated.description}
                    </p>
                    {(siteCmsConfig.design.showProductPrepTime || siteCmsConfig.design.showProductCalories) && (
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] text-[#A88E76] font-mono">
                        {siteCmsConfig.design.showProductPrepTime && <span>⏱ {product.prepTimeMinutes || 12} dk</span>}
                        {siteCmsConfig.design.showProductCalories && <span>• {product.calories || 420} kcal</span>}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-[#D4A359]/10">
                  <div className="whitespace-nowrap shrink-0">
                    {product.discountedPrice && (
                      <span className="text-[11px] line-through text-[#8F7660] me-1 font-mono">
                        {product.price} ₺
                      </span>
                    )}
                    <span className="font-mono text-sm sm:text-base font-bold text-[#F5D69B]">
                      {effectivePrice} ₺
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap justify-end max-w-full">
                    <button
                      type="button"
                      onClick={() => setSharingProduct(product)}
                      aria-label={`${translated.name} ${t.menu.shareBtn}`}
                      title={t.menu.shareBtn}
                      className="p-1.5 rounded-xl bg-[#27120D] hover:bg-[#351912] border border-[#D4A359]/30 text-[#D4A359] cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    {isFoodMeal && (
                      <button
                        type="button"
                        onClick={() => openProductCustomizer(product)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#27120D] hover:bg-[#351912] border border-[#D4A359]/35 text-[11px] font-semibold text-[#F5D69B] whitespace-nowrap cursor-pointer"
                      >
                        <SlidersHorizontal className="w-3 h-3 text-[#D4A359] shrink-0" />
                        <span>{t.menu.optionsBtn}</span>
                      </button>
                    )}

                    <div className="inline-flex items-center rounded-xl bg-[#26120D] border border-[#D4A359]/50 p-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleQuickQuantityDelta(product, -1)}
                        disabled={qtyInCart === 0}
                        aria-label={`${translated.name} -`}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-[#F5D69B] hover:bg-[#3D1D14] disabled:opacity-35 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-5 sm:w-6 text-center font-mono text-xs font-bold text-white">
                        {qtyInCart}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          isFoodMeal && qtyInCart === 0
                            ? openProductCustomizer(product)
                            : handleQuickQuantityDelta(product, 1)
                        }
                        aria-label={`${translated.name} +`}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center bg-[#D4A359] text-[#1A0B08] font-bold hover:bg-[#E3B66B] cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* CMS Özel Bloklar (Admin Panelden Eklenebilir / Düzenlenebilir / Silinebilir) */}
        {siteCmsConfig.blocks
          .filter((b) => b.isActive)
          .map((block) => {
            const loc = getBlockByLang(block, currentLang);
            return (
              <section
                key={block.id}
                className="rounded-2xl border border-[#D4A359]/30 bg-gradient-to-r from-[#1E0E0A] via-[#27120D] to-[#1A0B08] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#D4A359]/20 border border-[#D4A359]/40 text-[10px] font-bold text-[#F6D79E]">
                    {block.badgeText}
                  </span>
                  <h3 className="font-editorial text-lg sm:text-xl font-bold text-[#FFF7EB]">
                    {loc.title}
                  </h3>
                  <p className="text-xs text-[#DECAB4] max-w-2xl leading-relaxed">
                    {loc.content}
                  </p>
                </div>
                {block.buttonLabel && (
                  <a
                    href={block.buttonUrl || '#menu'}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A359] to-[#B0782C] text-[#1A0B08] font-bold text-xs shrink-0"
                  >
                    {block.buttonLabel}
                  </a>
                )}
              </section>
            );
          })}

        {/* Kampanyalar Bölümü */}
        {siteCmsConfig.modules.campaignsSectionEnabled && (
          <section
            id="kampanyalar"
            className="rounded-2xl border border-[#D4A359]/20 bg-[#180B08] p-4 flex flex-wrap items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-[#D4A359] shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-[#F5D69B]">{t.menu.campaignsTitle}</span>{' '}
                <span className="text-[#DECAB4]">{t.menu.campaignsSub}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {campaigns
                .filter((c) => c.isActive)
                .map((camp) => (
                  <button
                    key={camp.id}
                    type="button"
                    onClick={() => {
                      setSelectedCouponCode(camp.couponCode);
                      showToast(
                        'success',
                        `${t.menu.couponAppliedTitle}: ${camp.couponCode}`,
                        camp.name
                      );
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                      selectedCouponCode === camp.couponCode
                        ? 'bg-[#D4A359] text-[#1A0B08] border-[#D4A359]'
                        : 'bg-[#24110D] text-[#F5D69B] border-[#D4A359]/35 hover:border-[#D4A359]'
                    }`}
                  >
                    {camp.couponCode}
                  </button>
                ))}
            </div>
          </section>
        )}

        {/* ===================================================================
            GELİŞMİŞ FOTOĞRAF & VİDEO GALERİ SİSTEMİ (HEM RESİMLİ HEM VİDEOLU DESTEK)
        =================================================================== */}
        {siteCmsConfig.modules.gallerySectionEnabled && (
          <section id="galeri" className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#FFF7EB]">
                  {t.gallery.sectionTitle}
                </h2>
                <p className="text-xs text-[#C4AC95]">{t.gallery.sectionSubtitle}</p>
              </div>

              <div className="inline-flex items-center rounded-xl bg-[#1B0C09] border border-[#D4A359]/30 p-1 text-xs self-start">
                {(
                  [
                    { id: 'all', label: t.gallery.filterAll },
                    { id: 'photo', label: t.gallery.filterPhotos },
                    { id: 'video', label: t.gallery.filterVideos },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setGalleryFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      galleryFilter === tab.id
                        ? 'bg-[#D4A359] text-[#1A0B08]'
                        : 'text-[#DECAB4] hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeGalleryItems.map((item) => {
                const titleLoc = getGalleryTitleByLang(item, currentLang);
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveLightboxMedia(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setActiveLightboxMedia(item);
                    }}
                    className="group relative rounded-2xl overflow-hidden border border-[#D4A359]/25 bg-[#1A0C09] h-52 cursor-pointer"
                  >
                    <img
                      src={item.thumbnailUrl}
                      alt={titleLoc}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                    {/* Üst Tür Rozeti */}
                    <div className="absolute top-3 start-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 border border-[#D4A359]/40 text-[10px] font-bold text-[#F6D79E]">
                      {item.type === 'video' ? (
                        <>
                          <Film className="w-3 h-3 text-emerald-400" />
                          <span>4K VIDEO {item.duration ? `· ${item.duration}` : ''}</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-3 h-3 text-[#D4A359]" />
                          <span>{item.category}</span>
                        </>
                      )}
                    </div>

                    {/* Video ise Orta Oynat Butonu */}
                    {item.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="w-12 h-12 rounded-full bg-[#D4A359]/90 text-[#1A0B08] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-current ms-0.5" />
                        </span>
                      </div>
                    )}

                    {/* Alt Başlık */}
                    <div className="absolute bottom-3 inset-x-3 flex items-end justify-between gap-2">
                      <div className="text-xs font-bold text-[#FFF7EB] line-clamp-2">
                        {titleLoc}
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-[#D4A359]/20 border border-[#D4A359]/45 text-[10px] font-bold text-[#F6D79E] shrink-0">
                        {item.type === 'video' ? t.gallery.watchVideoBtn : t.gallery.viewPhotoBtn}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* CMS Özel Bilgi/Tanıtım Kartları (Admin Panelden Yönetilebilir) */}
        {siteCmsConfig.modules.showcaseCardsEnabled &&
          siteCmsConfig.design.showcaseCards.filter((c) => c.isActive).length > 0 && (
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {siteCmsConfig.design.showcaseCards
                .filter((c) => c.isActive)
                .map((card) => {
                  const locCard = getShowcaseCardByLang(card, currentLang);
                  return (
                    <div
                      key={card.id}
                      className={`${siteCmsConfig.design.cardRadius} border border-[#D4A359]/25 bg-[#180B08] p-4 space-y-2`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md bg-[#D4A359]/15 border border-[#D4A359]/35 text-[10px] font-bold text-[#F6D79E]">
                          {card.badgeText}
                        </span>
                        <Award className="w-4 h-4 text-[#D4A359]" />
                      </div>
                      <h3 className="font-editorial text-base font-bold text-[#FFF7EB]">
                        {locCard.title}
                      </h3>
                      <p className="text-xs text-[#C4AC95] leading-relaxed">{locCard.subtitle}</p>
                    </div>
                  );
                })}
            </section>
          )}
      </main>

      {/* ===================================================================
          ŞIK & UYUMLU FOOTER (SIRALI SOSYAL MEDYA İKONLARI, İLETİŞİM BİLGİLERİ, SAYFALAR VE ADMİN GİRİŞİ)
      =================================================================== */}
      <footer
        id="iletisim"
        className="mt-10 border-t border-[#D4A359]/30 bg-gradient-to-b from-[#170906] to-[#0E0503] px-4 sm:px-6 pt-10 pb-8 text-xs text-[#DECAB4]"
      >
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Sütun 1: Marka Kimliği & Kısa Açıklama */}
            <div className="md:col-span-4 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={siteCmsConfig.header.logoUrl || '/assets/aistudio/oztike-logo-transparent.png'}
                  alt={siteCmsConfig.header.brandTitle}
                  className="w-12 h-12 object-contain drop-shadow-[0_2px_10px_rgba(212,163,89,0.45)] shrink-0"
                />
                <div>
                  <div className="font-editorial text-lg font-bold text-[#F6D79E]">
                    {siteCmsConfig.header.brandTitle}
                  </div>
                  <div className="text-[11px] text-[#C4AC95]">{brandSubtitleByLang}</div>
                </div>
              </div>
              <p className="text-xs text-[#A88E76] leading-relaxed">{footerAboutByLang}</p>

              {/* Yayındaki Sayfa & Menü Linkleri */}
              {footerNavItems.length > 0 && (
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-2">
                  {footerNavItems.map((nav) => (
                    <a
                      key={nav.id}
                      href={nav.url}
                      onClick={(e) => {
                        if (nav.url.startsWith('/')) {
                          e.preventDefault();
                          handleNavAction(nav.url);
                        }
                      }}
                      className="text-[11px] font-semibold text-[#D4A359] hover:text-[#FFF7EB] transition-colors"
                    >
                      {getNavLabelByLang(nav, currentLang)}
                    </a>
                  ))}
                  {cmsPages
                    .filter((pg) => pg.status === 'Yayında' && pg.showInFooter)
                    .map((pg) => (
                      <button
                        key={pg.id}
                        type="button"
                        onClick={() => setActiveCmsPage(pg)}
                        className="text-[11px] font-semibold text-[#D4A359] hover:text-[#FFF7EB] transition-colors cursor-pointer"
                      >
                        {pg.title}
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Sütun 2: Sıralı İletişim Bilgileri (Site İle Uyumlu Altın/Bakır İkonlar) */}
            <div className="md:col-span-4 space-y-3">
              <h3 className="font-editorial text-sm font-bold text-[#F6D79E] uppercase tracking-wider">
                {t.footer.contactTitle}
              </h3>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-[#24110D] border border-[#D4A359]/30 flex items-center justify-center shrink-0 text-[#D4A359]">
                    <MapPin className="w-3.5 h-3.5" />
                  </span>
                  <span className="pt-1 text-[#DECAB4] leading-snug">{addressByLang}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-[#24110D] border border-[#D4A359]/30 flex items-center justify-center shrink-0 text-[#D4A359]">
                    <Phone className="w-3.5 h-3.5" />
                  </span>
                  <a
                    href={`tel:${siteCmsConfig.contact.phoneCallRaw}`}
                    className="font-mono font-bold text-[#F6D79E] hover:underline"
                  >
                    {siteCmsConfig.contact.phoneDisplay}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-[#24110D] border border-[#D4A359]/30 flex items-center justify-center shrink-0 text-[#D4A359]">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <a
                    href={`mailto:${siteCmsConfig.contact.email}`}
                    className="text-[#DECAB4] hover:text-[#F6D79E] transition-colors"
                  >
                    {siteCmsConfig.contact.email}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-[#24110D] border border-[#D4A359]/30 flex items-center justify-center shrink-0 text-[#D4A359]">
                    <Clock className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-[#DECAB4]">{workingHoursByLang}</span>
                </li>
              </ul>
            </div>

            {/* Sütun 3: Sıralı Sosyal Medya Hesapları (Site Rengi ve İkonlarıyla Tam Uyumlu) */}
            {siteCmsConfig.modules.socialMediaBarEnabled && (
              <div className="md:col-span-4 space-y-3">
                <h3 className="font-editorial text-sm font-bold text-[#F6D79E] uppercase tracking-wider">
                  {t.footer.socialTitle}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {siteCmsConfig.socialMedia
                    .filter((s) => s.isActive)
                    .map((soc) => {
                      const renderMatchingGoldIcon = () => {
                        if (soc.platform === 'Instagram')
                          return <Instagram className="w-4 h-4 text-[#D4A359] shrink-0" />;
                        if (soc.platform === 'Facebook')
                          return <Facebook className="w-4 h-4 text-[#D4A359] shrink-0" />;
                        if (soc.platform === 'YouTube')
                          return <Youtube className="w-4 h-4 text-[#D4A359] shrink-0" />;
                        if (soc.platform === 'WhatsApp')
                          return <MessageCircle className="w-4 h-4 text-[#D4A359] shrink-0" />;
                        if (soc.platform === 'Google Maps')
                          return <MapPin className="w-4 h-4 text-[#D4A359] shrink-0" />;
                        return <Share2 className="w-4 h-4 text-[#D4A359] shrink-0" />;
                      };
                      return (
                        <a
                          key={soc.id}
                          href={soc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group p-2.5 rounded-xl border border-[#D4A359]/25 bg-[#1B0D09] hover:border-[#D4A359] hover:bg-[#26120D] transition-all flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-8 h-8 rounded-lg bg-[#27130E] border border-[#D4A359]/30 flex items-center justify-center shrink-0 group-hover:bg-[#D4A359]/15 transition-colors">
                              {renderMatchingGoldIcon()}
                            </span>
                            <div className="min-w-0">
                              <div className="font-bold text-[#FFF7EB] text-xs truncate">
                                {soc.platform}
                              </div>
                              <div className="text-[10px] text-[#B89D82] truncate">
                                {soc.handleOrLabel}
                              </div>
                            </div>
                          </div>
                          <ExternalLink className="w-3 h-3 text-[#D4A359]/60 group-hover:text-[#D4A359] shrink-0" />
                        </a>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          {/* Gelişmiş Harita & Çoklu Navigasyon Servisleri (Google Maps, Google Navigasyon, Apple Maps, Yandex, Waze) */}
          <div className="py-2">
            <RestaurantMapSection
              mapSettings={siteCmsConfig.mapSettings}
              contact={siteCmsConfig.contact}
              lang={currentLang}
            />
          </div>

          {/* En Alt Çalışan PWA Uygulama İndirme Butonu & Kurulum Kartı (iOS / Android / PC) */}
          <FooterPWACard
            title={t.extras.pwaBottomTitle}
            description={t.extras.pwaBottomDesc}
            buttonLabel={t.extras.pwaBottomBtn}
            installedLabel={t.extras.pwaInstalledText}
          />

          {/* Alt Çizgi: Telif Hakkı ve Yönetici Paneli Giriş Butonu */}
          <div className="pt-5 border-t border-[#D4A359]/20 flex flex-wrap items-center justify-between gap-3 text-xs text-[#A88E76]">
            <div>{copyrightByLang}</div>
            {siteCmsConfig.footer.showAdminLoginButton && (
              <button
                type="button"
                onClick={() => setAdminLoginModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#24110D] hover:bg-[#331812] border border-[#D4A359]/40 text-[#F6D79E] font-bold text-xs cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-[#D4A359]" />
                <span>{t.footer.adminLoginBtn}</span>
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* =====================================================================
          5. YEMEK SEÇİLİRKEN İÇECEK, SALATA, BAHARAT, ÖZEL İSTEK & ADET (+ / -) MODALI
      ===================================================================== */}
      {customizingProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={getTranslatedProduct(customizingProduct, currentLang).name}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div className="w-full max-w-lg max-h-[90vh] rounded-t-3xl sm:rounded-3xl border border-[#D4A359]/40 bg-[#180B08] text-[#FFF6E9] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#D4A359]/20 flex items-center justify-between gap-3 bg-[#210F0B]">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={
                    activeCustomImage ||
                    customizingProduct.imageUrl ||
                    customizingProduct.imageUrls?.[0] ||
                    PRODUCT_FALLBACK_IMAGES[customizingProduct.categoryId] ||
                    '/assets/aistudio/crops/cat-ciger.png'
                  }
                  alt={getTranslatedProduct(customizingProduct, currentLang).name}
                  className="w-12 h-12 rounded-xl object-cover border border-[#D4A359]/30 shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-base text-[#FFF7EB] truncate">
                    {getTranslatedProduct(customizingProduct, currentLang).name}
                  </h3>
                  <p className="text-xs text-[#D4A359] font-mono font-bold">
                    {t.customizer.unitPriceLabel}:{' '}
                    {customizingProduct.discountedPrice ?? customizingProduct.price} ₺
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setSharingProduct(customizingProduct)}
                  aria-label={t.menu.shareBtn}
                  className="p-2 rounded-xl bg-[#2B140E] text-[#D4A359] hover:text-white cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCustomizingProduct(null)}
                  aria-label="Kapat"
                  className="p-2 rounded-xl bg-[#2B140E] text-[#DECAB4] hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto space-y-5 text-xs">
              {(() => {
                const galleryImages = Array.from(
                  new Set(
                    [
                      customizingProduct.imageUrl,
                      ...(customizingProduct.imageUrls || []),
                    ].filter((u): u is string => Boolean(u))
                  )
                );
                if (galleryImages.length <= 1) return null;
                return (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {galleryImages.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveCustomImage(imgUrl)}
                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer ${
                          activeCustomImage === imgUrl
                            ? 'border-[#D4A359] ring-2 ring-[#D4A359]/40'
                            : 'border-[#D4A359]/20 opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`${customizingProduct.name} ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                );
              })()}

              {!['CAT-09', 'CAT-12'].includes(customizingProduct.categoryId) && (
                <>
                  {/* 1. Porsiyon & Lavaş */}
                  <div className="space-y-2">
                    <div className="font-bold text-xs text-[#F5D69B] flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-[#D4A359]" />
                      <span>{t.customizer.step1PortionBread}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {MEAL_PORTION_OPTIONS.map((prt) => (
                        <button
                          key={prt.id}
                          type="button"
                          onClick={() => setSelectedPortionId(prt.id)}
                          className={`p-2.5 rounded-xl border text-start transition-all cursor-pointer ${
                            selectedPortionId === prt.id
                              ? 'border-[#D4A359] bg-[#2D150E] text-white font-bold'
                              : 'border-[#D4A359]/20 bg-[#140806] text-[#DECAB4]'
                          }`}
                        >
                          <div>{t.customizer.portions[prt.id]}</div>
                          {prt.price > 0 && (
                            <div className="text-[11px] text-[#D4A359] font-mono mt-0.5">
                              +{prt.price} ₺
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {MEAL_BREAD_OPTIONS.map((brd) => (
                        <button
                          key={brd.id}
                          type="button"
                          onClick={() => setSelectedBreadId(brd.id)}
                          className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                            selectedBreadId === brd.id
                              ? 'border-[#D4A359] bg-[#2D150E] text-white font-bold'
                              : 'border-[#D4A359]/20 bg-[#140806] text-[#DECAB4]'
                          }`}
                        >
                          <div className="truncate">{t.customizer.breads[brd.id]}</div>
                          {brd.price > 0 && (
                            <div className="text-[10px] text-[#D4A359] font-mono">
                              +{brd.price} ₺
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Baharat */}
                  <div className="space-y-2">
                    <div className="font-bold text-xs text-[#F5D69B] flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-[#D4A359]" />
                      <span>{t.customizer.step2Spices}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {MEAL_SPICE_KEYS.map((spice) => {
                        const active = selectedSpices.includes(spice);
                        return (
                          <button
                            key={spice}
                            type="button"
                            onClick={() => {
                              setSelectedSpices((prev) =>
                                prev.includes(spice)
                                  ? prev.filter((s) => s !== spice)
                                  : [...prev, spice]
                              );
                            }}
                            className={`px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
                              active
                                ? 'border-[#D4A359] bg-[#D4A359] text-[#1A0B08] font-bold'
                                : 'border-[#D4A359]/25 bg-[#140806] text-[#DECAB4]'
                            }`}
                          >
                            {t.customizer.spices[spice] || spice}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Salata */}
                  <div className="space-y-2">
                    <div className="font-bold text-xs text-[#F5D69B] flex items-center gap-1.5">
                      <Salad className="w-3.5 h-3.5 text-[#D4A359]" />
                      <span>{t.customizer.step3Salad}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {MEAL_SALAD_ADDONS.map((sal) => {
                        const active = selectedSaladId === sal.id;
                        return (
                          <button
                            key={sal.id}
                            type="button"
                            onClick={() => setSelectedSaladId(sal.id)}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-start transition-all cursor-pointer ${
                              active
                                ? 'border-[#D4A359] bg-[#2D150E] text-white font-bold'
                                : 'border-[#D4A359]/20 bg-[#140806] text-[#DECAB4]'
                            }`}
                          >
                            <span className="truncate">{t.customizer.salads[sal.id]}</span>
                            <span className="font-mono text-[#D4A359] shrink-0">
                              {sal.price > 0 ? `+${sal.price} ₺` : t.customizer.freeLabel}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. İçecek */}
                  <div className="space-y-2">
                    <div className="font-bold text-xs text-[#F5D69B] flex items-center gap-1.5">
                      <CupSoda className="w-3.5 h-3.5 text-[#D4A359]" />
                      <span>{t.customizer.step4Drink}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {MEAL_DRINK_ADDONS.map((drk) => {
                        const active = selectedDrinkId === drk.id;
                        return (
                          <button
                            key={drk.id}
                            type="button"
                            onClick={() => setSelectedDrinkId(drk.id)}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-start transition-all cursor-pointer ${
                              active
                                ? 'border-[#D4A359] bg-[#2D150E] text-white font-bold'
                                : 'border-[#D4A359]/20 bg-[#140806] text-[#DECAB4]'
                            }`}
                          >
                            <span className="truncate">{t.customizer.drinks[drk.id]}</span>
                            <span className="font-mono text-[#D4A359] shrink-0">
                              {drk.price > 0 ? `+${drk.price} ₺` : t.customizer.noneLabel}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* 5. Özel İstekler */}
              <div className="space-y-2">
                <div className="font-bold text-xs text-[#F5D69B] flex items-center gap-1.5">
                  <MessageSquarePlus className="w-3.5 h-3.5 text-[#D4A359]" />
                  <span>{t.customizer.step5SpecialRequests}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_SPECIAL_REQUEST_KEYS.map((req) => {
                    const active = selectedQuickRequests.includes(req);
                    return (
                      <button
                        key={req}
                        type="button"
                        onClick={() => {
                          setSelectedQuickRequests((prev) =>
                            prev.includes(req) ? prev.filter((r) => r !== req) : [...prev, req]
                          );
                        }}
                        className={`px-2.5 py-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
                          active
                            ? 'border-[#D4A359] bg-[#D4A359]/25 text-[#FFF6E9] font-bold'
                            : 'border-[#D4A359]/20 bg-[#140806] text-[#C4AC95]'
                        }`}
                      >
                        {t.customizer.quickRequests[req] || req}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={customMealNote}
                  onChange={(e) => setCustomMealNote(e.target.value)}
                  placeholder={t.customizer.customNotePlaceholder}
                  className="w-full rounded-xl border border-[#D4A359]/25 bg-[#140806] px-3 py-2 text-xs text-white placeholder-[#8F7660]"
                />
              </div>
            </div>

            <div className="p-4 border-t border-[#D4A359]/25 bg-[#210F0B] flex items-center justify-between gap-3">
              <div className="inline-flex items-center rounded-xl bg-[#140806] border border-[#D4A359]/50 p-1">
                <button
                  type="button"
                  onClick={() => setCustomQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Azalt"
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-[#F5D69B] hover:bg-[#2B140E] cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-9 text-center font-mono text-sm font-bold text-white">
                  {customQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => setCustomQuantity((q) => q + 1)}
                  aria-label="Artır"
                  className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#D4A359] text-[#1A0B08] font-bold hover:bg-[#E3B66B] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddCustomizedToCart}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4A359] to-[#B0782C] text-[#1A0B08] font-bold text-xs sm:text-sm shadow-lg flex items-center justify-between cursor-pointer"
              >
                <span>{t.customizer.addToCartBtn}</span>
                <span className="font-mono font-extrabold">
                  {roundCurrency(customizerUnitTotal * customQuantity).toFixed(2)} ₺
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          6. QR KOD OKUMA & MASA EŞLEŞTİRME MODALI (OTOMATİK AÇILAN CANLI KAMERA)
      ===================================================================== */}
      {qrModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.qrModal.title}
          className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md rounded-3xl border border-[#D4A359]/45 bg-[#180B08] text-[#FFF6E9] p-5 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#D4A359]/20 pb-3">
              <div className="flex items-center gap-2.5">
                <img
                  src="/assets/aistudio/oztike-logo-transparent.png"
                  alt="ÖzTike Logo"
                  className="w-9 h-9 object-contain shrink-0"
                />
                <div>
                  <h3 className="font-bold text-base text-[#FFF7EB] flex items-center gap-2">
                    <span>{t.qrModal.title}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      {t.qrModal.cameraOpenBadge}
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#C4AC95]">{t.qrModal.subtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                aria-label="Kapat"
                className="p-1.5 rounded-xl bg-[#27120D] text-[#DECAB4] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden border-2 border-[#D4A359]/75 bg-[#090403] h-56 flex flex-col items-center justify-between p-3.5 text-center shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                  hasHardwareStream ? 'opacity-90' : 'opacity-25'
                }`}
              />
              {!hasHardwareStream && (
                <img
                  src="/assets/aistudio/crops/gallery-1.png"
                  alt="Kamera Vizörü"
                  className="absolute inset-0 w-full h-full object-cover opacity-30 blur-[1px] scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/75 pointer-events-none" />

              <div className="relative z-10 w-full flex items-center justify-between text-[11px] font-mono">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/65 border border-[#D4A359]/40 text-[#F6D79E]">
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {hasHardwareStream ? t.qrModal.hdLensActive : t.qrModal.opticalViewfinder}
                  </span>
                </span>
                <span className="px-2 py-1 rounded-lg bg-black/65 border border-white/15 text-emerald-300 font-bold">
                  {activeTableNumberBadge}
                </span>
              </div>

              <div
                onClick={() => activeTable && handleSelectTableByQR(activeTable, 'QR Kamera')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && activeTable) {
                    handleSelectTableByQR(activeTable, 'QR Kamera');
                  }
                }}
                className="relative z-10 w-36 h-28 rounded-2xl border-2 border-[#D4A359] bg-black/45 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer group hover:border-emerald-400 transition-colors"
              >
                <span className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-emerald-400 rounded-tl-md" />
                <span className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-emerald-400 rounded-tr-md" />
                <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-emerald-400 rounded-bl-md" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-emerald-400 rounded-br-md" />

                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-bounce" />

                <QrCode
                  className={`w-12 h-12 my-1 transition-transform ${
                    cameraScanningAnim
                      ? 'text-emerald-400 scale-110'
                      : 'text-[#F6D79E] group-hover:scale-105'
                  }`}
                />
                <span className="text-[10px] font-mono font-bold text-emerald-300">
                  {cameraScanningAnim ? t.qrModal.qrScannedSuccess : t.qrModal.tapToScan}
                </span>
              </div>

              <div className="relative z-10 text-[11px] font-mono text-[#F5D69B] bg-black/60 px-3 py-1 rounded-full border border-[#D4A359]/30">
                {cameraStatusText || t.qrModal.cameraReadyHint}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeTable && (
                <button
                  type="button"
                  onClick={() => handleSelectTableByQR(activeTable, 'QR Kamera')}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <Check className="w-4 h-4 shrink-0" />
                  <span>
                    {activeTableNumberBadge} {t.qrModal.scanActiveTableBtn}
                  </span>
                </button>
              )}

              <label className="py-2.5 px-3 rounded-xl bg-[#26120D] hover:bg-[#341811] border border-[#D4A359]/45 text-xs font-bold text-[#F5D69B] cursor-pointer flex items-center justify-center gap-2">
                <Upload className="w-4 h-4 text-[#D4A359] shrink-0" />
                <span>{t.qrModal.takePhotoBtn}</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleQRFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-[#F5D69B]">
                {t.qrModal.selectTablePrompt}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {tables.map((tbl, idx) => {
                  const isCurrent = tbl.id === selectedTableId;
                  const labelNum = `${t.qrModal.tablePrefix} 0${idx + 1}`;
                  return (
                    <button
                      key={tbl.id}
                      type="button"
                      onClick={() => handleSelectTableByQR(tbl, 'QR Etiket')}
                      className={`p-2.5 rounded-xl border text-start transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-[#D4A359] bg-[#D4A359] text-[#1A0B08] font-bold'
                          : 'border-[#D4A359]/25 bg-[#22100C] text-[#FFF6E9] hover:border-[#D4A359]'
                      }`}
                    >
                      <div className="font-mono text-xs font-extrabold">{labelNum}</div>
                      <div
                        className={`text-[10px] truncate ${
                          isCurrent ? 'text-[#1A0B08]/80' : 'text-[#C4AC95]'
                        }`}
                      >
                        {tbl.number}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          7. GARSON ÇAĞIRMA KARTI / MODALI (ÇAY / SODA ADET SEÇİMİ + İHTİYAÇLAR)
      ===================================================================== */}
      {waiterModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.waiterModal.title}
          className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-[#D4A359]/45 bg-[#180B08] text-[#FFF6E9] p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D4A359]/20 pb-3">
              <div className="flex items-center gap-2.5">
                <img
                  src="/assets/aistudio/oztike-logo-transparent.png"
                  alt="ÖzTike Logo"
                  className="w-9 h-9 object-contain shrink-0"
                />
                <div>
                  <span className="text-[11px] font-mono font-bold text-[#D4A359]">
                    {activeTableNumberBadge} · {t.waiterModal.assignedWaiter}:{' '}
                    {activeTable?.waiterName}
                  </span>
                  <h3 className="font-bold text-base text-[#FFF7EB]">{t.waiterModal.title}</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWaiterModalOpen(false)}
                aria-label="Kapat"
                className="p-1.5 rounded-xl bg-[#27120D] text-[#DECAB4] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#C4AC95]">{t.waiterModal.subtitle}</p>

            {/* Adetli İçecek & İkram İsteği (Çay, Soda, Kahve, Su, Ayran) */}
            <div className="rounded-2xl border border-[#D4A359]/35 bg-[#120705] p-3 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#F5D69B]">
                <Coffee className="w-4 h-4 text-[#D4A359]" />
                <span>{t.waiterModal.drinkSectionTitle}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(t.waiterModal.drinkItems).map(([drinkKey, drinkLabel]) => {
                  const qty = waiterDrinkQuantities[drinkKey] || 0;
                  return (
                    <div
                      key={drinkKey}
                      className={`px-2.5 py-2 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                        qty > 0
                          ? 'border-[#D4A359] bg-[#2B140E] text-white font-bold'
                          : 'border-[#D4A359]/20 bg-[#1A0B08] text-[#DECAB4]'
                      }`}
                    >
                      <span className="truncate">{drinkLabel}</span>
                      <div className="inline-flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setWaiterDrinkQuantities((prev) => ({
                              ...prev,
                              [drinkKey]: Math.max(0, (prev[drinkKey] || 0) - 1),
                            }))
                          }
                          disabled={qty === 0}
                          aria-label={`${drinkLabel} azalt`}
                          className="w-6 h-6 rounded-lg bg-[#120705] border border-[#D4A359]/30 flex items-center justify-center text-[#F5D69B] disabled:opacity-35 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center font-mono font-bold text-white">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setWaiterDrinkQuantities((prev) => ({
                              ...prev,
                              [drinkKey]: (prev[drinkKey] || 0) + 1,
                            }))
                          }
                          aria-label={`${drinkLabel} artır`}
                          className="w-6 h-6 rounded-lg bg-[#D4A359] text-[#1A0B08] flex items-center justify-center font-bold cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {WAITER_NEED_KEYS.map((key) => {
                const item = t.waiterModal.needs[key];
                const isSelected = selectedWaiterNeeds.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSelectedWaiterNeeds((prev) =>
                        prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
                      );
                    }}
                    className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#D4A359] bg-[#2D150E] text-white font-bold'
                        : 'border-[#D4A359]/20 bg-[#140806] text-[#DECAB4]'
                    }`}
                  >
                    <div className="text-xs font-bold">{item?.label}</div>
                    <div className="text-[10px] text-[#A88E76] mt-0.5">{item?.sub}</div>
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              value={waiterCustomNote}
              onChange={(e) => setWaiterCustomNote(e.target.value)}
              placeholder={t.waiterModal.notePlaceholder}
              className="w-full rounded-xl border border-[#D4A359]/25 bg-[#140806] px-3.5 py-2.5 text-xs text-white placeholder-[#8F7660]"
            />

            <button
              type="button"
              onClick={handleWaiterCallSubmit}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4A359] to-[#B0782C] text-[#1A0B08] font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <BellRing className="w-4 h-4" />
              <span>
                {activeTableNumberBadge} {t.waiterModal.submitBtn} (
                {selectedWaiterNeeds.length + totalWaiterDrinksCount}{' '}
                {t.waiterModal.selectedCountSuffix})
              </span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          8. ÜCRETSİZ YAPAY ZEKÂ LEZZET ASİSTANI MODALI (TR / EN / AR)
      ===================================================================== */}
      {aiModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.aiAssistant.modalTitle}
          className="fixed inset-0 z-[115] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <div className="w-full max-w-lg max-h-[90vh] rounded-t-3xl sm:rounded-3xl border border-[#D4A359]/45 bg-[#180B08] text-[#FFF6E9] flex flex-col overflow-hidden shadow-2xl">
            {/* Üst Başlık */}
            <div className="p-4 border-b border-[#D4A359]/20 bg-[#210F0B] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4A359] to-[#9E6720] text-[#1A0B08] flex items-center justify-center shadow">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-[#FFF7EB]">
                      {t.aiAssistant.modalTitle}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-300">
                      {t.aiAssistant.freeBadge}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#C4AC95]">{t.aiAssistant.modalSubtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                aria-label="Asistanı Kapat"
                className="p-2 rounded-xl bg-[#2B140E] text-[#DECAB4] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Orta: Sohbet Geçmişi & Hızlı Sorular */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Karşılama Mesajı */}
              <div className="p-3.5 rounded-2xl bg-[#24110D] border border-[#D4A359]/30 text-[#FFF6E9] leading-relaxed">
                <div className="font-bold text-[#F6D79E] mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4A359]" />
                  <span>ÖzTike AI Concierge ({activeTableNumberBadge})</span>
                </div>
                <p>{t.aiAssistant.welcomeMessage}</p>
              </div>

              {/* Hızlı Hazır Sorular */}
              <div className="flex flex-wrap gap-1.5">
                {t.aiAssistant.quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAskAiAssistant(qp)}
                    className="px-3 py-1.5 rounded-xl bg-[#120705] hover:bg-[#2A130E] border border-[#D4A359]/30 text-[11px] text-[#F5D69B] text-start transition-colors cursor-pointer"
                  >
                    💬 {qp}
                  </button>
                ))}
              </div>

              {/* Mesajlar */}
              {aiMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3.5 rounded-2xl space-y-2.5 ${
                    msg.role === 'user'
                      ? 'bg-[#D4A359] text-[#1A0B08] font-semibold ms-8'
                      : 'bg-[#210F0B] border border-[#D4A359]/35 text-[#FFF6E9] me-4'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>

                  {/* Önerilen Ürünler Kartları (Tıklanabilir + Adet + Hepsini Ekle + Sepete Git) */}
                  {msg.recommendedProductIds && msg.recommendedProductIds.length > 0 && (
                    <div className="pt-2 border-t border-[#D4A359]/20 space-y-2.5">
                      <div className="text-[11px] font-bold text-[#F6D79E]">
                        {t.aiAssistant.recommendedDishesTitle}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.recommendedProductIds.map((pid) => {
                          const prod = products.find((p) => p.id === pid);
                          if (!prod) return null;
                          const trProd = getTranslatedProduct(prod, currentLang);
                          const priceVal = prod.discountedPrice ?? prod.price;
                          const inCartQty = getProductCartQuantity(prod.id);
                          return (
                            <div
                              key={pid}
                              className="p-2.5 rounded-xl bg-[#120705] border border-[#D4A359]/30 hover:border-[#D4A359] flex items-center justify-between gap-2 transition-colors"
                            >
                              <button
                                type="button"
                                onClick={() => handleQuickQuantityDelta(prod, 1)}
                                className="min-w-0 text-start flex-1 cursor-pointer group"
                              >
                                <div className="font-bold text-[#FFF7EB] group-hover:text-[#F5D69B] truncate text-[11px]">
                                  {trProd.name}
                                </div>
                                <div className="font-mono text-[#D4A359] text-[11px]">
                                  {priceVal} ₺
                                </div>
                              </button>
                              {inCartQty > 0 ? (
                                <div className="inline-flex items-center gap-1 rounded-lg bg-[#26120D] border border-[#D4A359]/45 p-0.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleQuickQuantityDelta(prod, -1)}
                                    aria-label={`${trProd.name} -`}
                                    className="w-6 h-6 rounded flex items-center justify-center text-[#F5D69B] cursor-pointer"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="w-4 text-center font-mono text-[11px] font-bold text-white">
                                    {inCartQty}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickQuantityDelta(prod, 1)}
                                    aria-label={`${trProd.name} +`}
                                    className="w-6 h-6 rounded flex items-center justify-center bg-[#D4A359] text-[#1A0B08] font-bold cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleQuickQuantityDelta(prod, 1)}
                                  className="px-2.5 py-1.5 rounded-lg bg-[#D4A359] hover:bg-[#E3B66B] text-[#1A0B08] font-bold text-[10px] shrink-0 cursor-pointer"
                                >
                                  {t.aiAssistant.addRecommendedBtn}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            const validProds = (msg.recommendedProductIds || [])
                              .map((pid) => products.find((p) => p.id === pid))
                              .filter((p): p is ProductItem => Boolean(p && p.inStock && p.isActive));
                            validProds.forEach((vp) => handleQuickQuantityDelta(vp, 1));
                            if (validProds.length > 0) {
                              showToast(
                                'success',
                                t.menu.addedToCartTitle,
                                `${validProds.length} ürün sepetinize eklendi!`
                              );
                            }
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] text-center cursor-pointer"
                        >
                          {t.aiAssistant.addAllBundleBtn}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAiModalOpen(false);
                            setCartDrawerOpen(true);
                          }}
                          className="py-2 px-3 rounded-xl bg-[#27120D] hover:bg-[#361912] border border-[#D4A359]/45 text-[#F6D79E] font-bold text-[11px] cursor-pointer"
                        >
                          {t.aiAssistant.goToCartBtn} ({totalCartItemsCount})
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {aiLoading && (
                <div className="p-3 rounded-2xl bg-[#210F0B] border border-[#D4A359]/25 text-[#F6D79E] animate-pulse">
                  ✨ ÖzTike Yapay Zekâ Asistanı menüyü inceliyor...
                </div>
              )}
            </div>

            {/* Alt: Soru Yazma Alanı */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskAiAssistant();
              }}
              className="p-3.5 border-t border-[#D4A359]/25 bg-[#210F0B] flex items-center gap-2"
            >
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder={t.aiAssistant.inputPlaceholder}
                className="flex-1 rounded-xl border border-[#D4A359]/35 bg-[#120705] px-3.5 py-2.5 text-xs text-white placeholder-[#8F7660]"
              />
              <button
                type="submit"
                disabled={aiLoading}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A359] to-[#B0782C] text-[#1A0B08] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t.aiAssistant.sendBtn}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          9. CMS SAYFA OKUYUCU MODALI (YAYINDAKİ SAYFALAR)
      ===================================================================== */}
      {activeCmsPage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeCmsPage.title}
          className="fixed inset-0 z-[118] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-2xl rounded-3xl border border-[#D4A359]/45 bg-[#180B08] text-[#FFF6E9] p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#D4A359]/20 pb-3">
              <div>
                <span className="font-mono text-[11px] text-[#D4A359]">{activeCmsPage.slug}</span>
                <h3 className="font-editorial text-xl font-bold text-[#FFF7EB]">
                  {activeCmsPage.title}
                </h3>
                {activeCmsPage.subtitle && (
                  <p className="text-xs text-[#C4AC95] mt-0.5">{activeCmsPage.subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActiveCmsPage(null)}
                aria-label="Kapat"
                className="p-2 rounded-xl bg-[#27120D] text-[#DECAB4] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {activeCmsPage.imageUrl && (
              <div className="rounded-2xl overflow-hidden border border-[#D4A359]/30 h-48 sm:h-56">
                <img
                  src={activeCmsPage.imageUrl}
                  alt={activeCmsPage.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <p className="text-xs text-[#D4A359] font-semibold">{activeCmsPage.metaDescription}</p>
            <div className="text-sm text-[#DECAB4] leading-relaxed whitespace-pre-line">
              {activeCmsPage.content ||
                `${activeCmsPage.title} — ${activeCmsPage.metaDescription}\n\nÖzTike Ciğer · Halil Usta olarak 1996'dan beri Gaziantep'in en seçkin ciğer ve zırh kebap lezzetlerini özenle sunuyoruz.`}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          10. FOTOĞRAF & SESLİ VİDEO LIGHTBOX MODALI
      ===================================================================== */}
      {activeLightboxMedia && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={getGalleryTitleByLang(activeLightboxMedia, currentLang)}
          className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="w-full max-w-3xl rounded-3xl border border-[#D4A359]/45 bg-[#160A07] overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#D4A359]/20 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {activeLightboxMedia.type === 'video' ? (
                  <Film className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <ImageIcon className="w-4 h-4 text-[#D4A359] shrink-0" />
                )}
                <span className="font-bold text-sm text-[#FFF7EB] truncate">
                  {getGalleryTitleByLang(activeLightboxMedia, currentLang)}
                </span>
                {activeLightboxMedia.type === 'video' && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 shrink-0 flex items-center gap-1">
                    <Volume2 className="w-3 h-3" />
                    Sesli
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActiveLightboxMedia(null)}
                aria-label="Kapat"
                className="p-1.5 rounded-xl bg-[#27120D] text-white cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-black flex items-center justify-center max-h-[75vh] overflow-hidden">
              {activeLightboxMedia.type === 'video' ? (
                <video
                  key={activeLightboxMedia.mediaUrl}
                  src={activeLightboxMedia.mediaUrl}
                  poster={activeLightboxMedia.thumbnailUrl}
                  controls
                  autoPlay
                  playsInline
                  preload="auto"
                  className="w-full max-h-[70vh] object-contain"
                />
              ) : (
                <img
                  src={activeLightboxMedia.mediaUrl}
                  alt={getGalleryTitleByLang(activeLightboxMedia, currentLang)}
                  className="w-full max-h-[70vh] object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          11. YÖNETİCİ PANELİ (ADMİN GİRİŞ) MODALI
      ===================================================================== */}
      {adminLoginModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.footer.adminModalTitle}
          className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md rounded-3xl border border-[#D4A359]/45 bg-[#180B08] text-[#FFF6E9] p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D4A359]/20 pb-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-6 h-6 text-[#D4A359]" />
                <div>
                  <h3 className="font-bold text-base text-[#FFF7EB]">
                    {t.footer.adminModalTitle}
                  </h3>
                  <p className="text-[11px] text-[#C4AC95]">{t.footer.adminModalSubtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAdminLoginModalOpen(false)}
                aria-label="Kapat"
                className="p-1.5 rounded-xl bg-[#27120D] text-[#DECAB4] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setAdminLoginModalOpen(false);
                if (onSwitchToAdminPortal) {
                  onSwitchToAdminPortal();
                } else {
                  window.location.hash = '#admin';
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-[#F5D69B] mb-1">
                  {t.footer.adminEmailLabel}
                </label>
                <input
                  type="text"
                  value={adminEmailInput}
                  onChange={(e) => setAdminEmailInput(e.target.value)}
                  className="w-full rounded-xl border border-[#D4A359]/35 bg-[#120705] px-3.5 py-2.5 font-mono text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-[#F5D69B] mb-1">
                  {t.footer.adminPasswordLabel}
                </label>
                <input
                  type="password"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  className="w-full rounded-xl border border-[#D4A359]/35 bg-[#120705] px-3.5 py-2.5 font-mono text-white"
                />
              </div>

              <div className="rounded-xl bg-[#120705] border border-[#D4A359]/25 p-3 font-mono text-[11px] text-[#DECAB4] space-y-1">
                <div className="text-[#F6D79E] font-bold">Yönetici Giriş Bilgileri:</div>
                <div>URL: /?portal=admin veya #admin</div>
                <div>Kullanıcı: {siteCmsConfig.footer.adminDemoEmail}</div>
                <div>Şifre: {siteCmsConfig.footer.adminDemoPassword}</div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4A359] to-[#B0782C] text-[#1A0B08] font-extrabold text-xs sm:text-sm shadow-lg cursor-pointer"
              >
                {t.footer.adminLoginSubmit}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          12. SEPETİM, ÖDEME YÖNTEMLERİ, BAHŞİŞ, KURYE & SİPARİŞ TAKİP DRAWER
      ===================================================================== */}
      {cartDrawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.cartModal.title}
          className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex justify-end"
        >
          <div className="w-full max-w-md bg-[#180B08] border-s border-[#D4A359]/35 h-full flex flex-col justify-between text-[#FFF6E9] shadow-2xl">
            <div className="p-4 border-b border-[#D4A359]/20 flex items-center justify-between bg-[#210F0B]">
              <div>
                <span className="text-[11px] font-mono text-[#D4A359] font-bold">
                  {channel === 'QR'
                    ? qrVerifiedTableId
                      ? `${activeTableNumberBadge} · ${activeTable?.number}`
                      : t.extras.qrUnverifiedBadge
                    : channel === 'Paket servis'
                    ? `🛵 ${t.extras.courierBadge}`
                    : t.cartModal.channelPickup}
                </span>
                <h3 className="font-bold text-base text-[#FFF7EB]">{t.cartModal.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setCartDrawerOpen(false)}
                aria-label="Sepeti Kapat"
                className="p-2 rounded-xl bg-[#2B140E] text-[#DECAB4] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#120705] border border-[#D4A359]/20">
                {(
                  [
                    { id: 'QR', label: t.cartModal.channelTable },
                    { id: 'Gel-Al', label: t.cartModal.channelPickup },
                    { id: 'Paket servis', label: t.cartModal.channelDelivery },
                  ] as const
                ).map((ch) => (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setChannel(ch.id)}
                    className={`py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                      channel === ch.id
                        ? 'bg-[#D4A359] text-[#1A0B08]'
                        : 'text-[#C4AC95] hover:text-white'
                    }`}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>

              {channel === 'QR' && !qrVerifiedTableId && (
                <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-amber-200 leading-snug">
                    {t.extras.qrRequiredOrderDesc}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCartDrawerOpen(false);
                      setQrModalOpen(true);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-[#D4A359] text-[#1A0B08] font-bold text-[11px] shrink-0 cursor-pointer"
                  >
                    QR Okut
                  </button>
                </div>
              )}

              {channel === 'Paket servis' && (
                <div className="rounded-xl border border-[#D4A359]/30 bg-[#22100C] p-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[#F5D69B]">
                    <Truck className="w-4 h-4 text-[#D4A359] shrink-0" />
                    <div>
                      <div className="font-bold text-xs">{t.extras.courierBadge}</div>
                      <div className="text-[10px] text-[#C4AC95]">
                        {t.extras.minOrderPrefix}: {siteCmsConfig.generalSettings.minDeliveryOrderAmount || 150} ₺
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                    25-35 dk
                  </span>
                </div>
              )}

              {cart.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#D4A359]/25 p-8 text-center text-[#A88E76]">
                  {t.cartModal.emptyCartText}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {cart.map((line) => {
                    const unitBase = line.product.discountedPrice ?? line.product.price;
                    const optExtra = line.selectedOptions.reduce((s, o) => s + o.extraPrice, 0);
                    const lineTotal = roundCurrency((unitBase + optExtra) * line.quantity);
                    const trProd = getTranslatedProduct(line.product, currentLang);
                    const thumbImg =
                      line.product.imageUrl ||
                      line.product.imageUrls?.[0] ||
                      PRODUCT_FALLBACK_IMAGES[line.product.categoryId] ||
                      '/assets/aistudio/crops/cat-ciger.png';
                    return (
                      <div
                        key={line.lineId}
                        className="rounded-xl border border-[#D4A359]/25 bg-[#120705] p-3 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2.5">
                          <img
                            src={thumbImg}
                            alt={trProd.name}
                            className="w-12 h-12 rounded-lg object-cover border border-[#D4A359]/20 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-[#FFF7EB] text-xs">{trProd.name}</div>
                            {line.selectedOptions.length > 0 && (
                              <div className="text-[11px] text-[#D4A359] mt-0.5 space-y-0.5">
                                {line.selectedOptions.map((o, idx) => (
                                  <div key={idx}>
                                    • {o.name}: {o.value}{' '}
                                    {o.extraPrice > 0 ? `(+${o.extraPrice} ₺)` : ''}
                                  </div>
                                ))}
                              </div>
                            )}
                            {line.customerNote && (
                              <div className="text-[11px] text-amber-300/90 italic mt-0.5">
                                Not: {line.customerNote}
                              </div>
                            )}
                          </div>
                          <span className="font-mono font-bold text-xs text-[#F5D69B] shrink-0">
                            {lineTotal.toFixed(2)} ₺
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-[#D4A359]/10">
                          <div className="inline-flex items-center gap-1 rounded-lg bg-[#22100C] border border-[#D4A359]/35 p-0.5">
                            <button
                              type="button"
                              onClick={() => updateCartLineQty(line.lineId, -1)}
                              aria-label="Azalt"
                              className="w-6 h-6 rounded flex items-center justify-center text-[#F5D69B]"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-mono font-bold">
                              {line.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartLineQty(line.lineId, 1)}
                              aria-label="Artır"
                              className="w-6 h-6 rounded flex items-center justify-center bg-[#D4A359] text-[#1A0B08]"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setCart((prev) => prev.filter((c) => c.lineId !== line.lineId))
                            }
                            aria-label="Ürünü Sil"
                            className="text-rose-400 hover:text-rose-300 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {cart.length > 0 && (
                <form id="qr-order-form" onSubmit={handleCheckoutSubmit} className="space-y-3 pt-1">
                  {/* Ödeme Yöntemi Seçimi (Sipariş Özeti Formunun En Üstünde Belirgin Gösterim) */}
                  <div
                    data-testid="checkout-payment-methods"
                    className="rounded-xl border-2 border-[#D4A359]/45 bg-[#120705] p-3 space-y-2.5 shadow-lg"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-bold text-[#F6D79E] flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-[#D4A359]" />
                        <span>{t.extras.paymentMethodLabel}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                        Seçili: {paymentMethod}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {[
                        { id: 'Kapıda / Masada Kart (POS)', label: t.extras.payCardPos },
                        { id: 'Nakit', label: t.extras.payCash },
                        { id: 'Online Kart (iyzico / PayTR)', label: t.extras.payOnline },
                        { id: 'Yemek Kartı (Sodexo/Multinet)', label: t.extras.payMealCard },
                        { id: 'Havale / EFT', label: t.extras.payTransfer },
                      ].map((pm) => {
                        const isSelected = paymentMethod === pm.id;
                        return (
                          <button
                            key={pm.id}
                            type="button"
                            onClick={() => setPaymentMethod(pm.id)}
                            className={`p-2.5 rounded-xl border text-start text-[11px] leading-tight font-semibold flex items-center justify-between gap-1.5 cursor-pointer transition-all ${
                              isSelected
                                ? 'border-[#D4A359] bg-[#31160F] text-[#F6D79E] ring-1 ring-[#D4A359]/60'
                                : 'border-[#D4A359]/20 bg-[#1B0D09] text-[#DECAB4] hover:border-[#D4A359]/45'
                            }`}
                          >
                            <span className="flex items-center gap-1.5 min-w-0">
                              <Wallet className="w-3.5 h-3.5 text-[#D4A359] shrink-0" />
                              <span className="truncate">{pm.label}</span>
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {paymentMethod === 'Online Kart (iyzico / PayTR)' && (
                      <div className="rounded-lg border border-emerald-500/35 bg-emerald-950/25 p-2.5 space-y-2 text-[11px]">
                        <div className="flex items-center justify-between font-bold text-emerald-300">
                          <span>256-Bit 3D Secure Online Tahsilat</span>
                          <span className="font-mono text-[10px]">iyzico / PayTR</span>
                        </div>
                        <p className="text-[#DECAB4] leading-snug">
                          Siparişi onayladığınızda seçilen tutar ({cartFinalTotal.toFixed(2)} ₺) güvenli 3D Secure katmanı üzerinden otomatik tahsil edilip fişiniz düzenlenir.
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'Havale / EFT' && (
                      <div className="rounded-lg border border-[#D4A359]/35 bg-[#1B0D09] p-2.5 space-y-1 text-[11px]">
                        <div className="font-bold text-[#F5D69B]">ÖzTike Ciğer · Halil Usta IBAN</div>
                        <div className="font-mono text-white select-all">
                          TR42 0006 2000 0000 0199 6019 96
                        </div>
                        <div className="text-[#C4AC95]">
                          Açıklama kısmına adınızı veya masa numaranızı yazmanız yeterlidir.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Kupon Kodu Alanı */}
                  <div className="rounded-xl border border-[#D4A359]/20 bg-[#120705] p-2.5 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={selectedCouponCode}
                        onChange={(e) => setSelectedCouponCode(e.target.value)}
                        placeholder={t.extras.couponCodePlaceholder}
                        className="flex-1 rounded-lg border border-[#D4A359]/25 bg-[#1B0D09] px-2.5 py-1.5 font-mono text-xs text-white"
                      />
                      {selectedCouponCode && (
                        <button
                          type="button"
                          onClick={() => setSelectedCouponCode('')}
                          className="px-2 py-1.5 rounded-lg bg-[#2B140E] text-[#C4AC95] text-[10px] font-bold"
                        >
                          Temizle
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {campaigns
                        .filter((c) => c.isActive)
                        .map((camp) => (
                          <button
                            key={camp.id}
                            type="button"
                            onClick={() => setSelectedCouponCode(camp.couponCode)}
                            className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border cursor-pointer ${
                              selectedCouponCode.toUpperCase() === camp.couponCode.toUpperCase()
                                ? 'bg-[#D4A359] text-[#1A0B08] border-[#D4A359]'
                                : 'bg-[#210F0B] text-[#F5D69B] border-[#D4A359]/30'
                            }`}
                          >
                            {camp.couponCode}
                          </button>
                        ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={`${t.cartModal.customerNamePlaceholder}`}
                    className="w-full rounded-xl border border-[#D4A359]/25 bg-[#120705] px-3 py-2 text-xs text-white"
                  />
                  {channel !== 'QR' && (
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder={t.cartModal.customerPhonePlaceholder}
                      className="w-full rounded-xl border border-[#D4A359]/25 bg-[#120705] px-3 py-2 text-xs text-white"
                    />
                  )}
                  {channel === 'Paket servis' && (
                    <div className="space-y-2">
                      {savedAddresses.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-[11px] font-bold text-[#F5D69B]">
                            {t.extras.savedAddressPickerTitle}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {savedAddresses.map((addr) => (
                              <button
                                key={addr.id}
                                type="button"
                                onClick={() => setDeliveryAddress(`${addr.fullAddress}`)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold cursor-pointer ${
                                  deliveryAddress === addr.fullAddress
                                    ? 'border-[#D4A359] bg-[#D4A359] text-[#1A0B08]'
                                    : 'border-[#D4A359]/30 bg-[#1B0D09] text-[#F6D79E] hover:border-[#D4A359]'
                                }`}
                              >
                                <MapPinned className="w-3 h-3" />
                                <span>
                                  {addr.label}: {addr.title}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <textarea
                        rows={2}
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder={t.cartModal.deliveryAddressPlaceholder}
                        className="w-full rounded-xl border border-[#D4A359]/25 bg-[#120705] px-3 py-2 text-xs text-white"
                      />
                    </div>
                  )}
                  <input
                    type="text"
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder={t.cartModal.orderNotePlaceholder}
                    className="w-full rounded-xl border border-[#D4A359]/25 bg-[#120705] px-3 py-2 text-xs text-white"
                  />

                  {/* Bahşiş (Tipping) Seçimi */}
                  <div className="rounded-xl border border-[#D4A359]/25 bg-[#120705] p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#F5D69B] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#D4A359]" />
                        {t.extras.tipLabel}
                      </span>
                      <span className="font-mono text-[#D4A359] font-bold">
                        {checkoutTotals.tipAmount.toFixed(2)} ₺
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {([0, 5, 10, 15] as const).map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => {
                            setTipPercent(pct);
                            setCustomTipInput('');
                          }}
                          className={`py-1.5 rounded-lg font-mono font-bold text-[11px] border cursor-pointer ${
                            tipPercent === pct && !customTipInput
                              ? 'bg-[#D4A359] text-[#1A0B08] border-[#D4A359]'
                              : 'bg-[#1D0D09] text-[#DECAB4] border-[#D4A359]/25'
                          }`}
                        >
                          {pct === 0 ? t.extras.tipNone : `%${pct}`}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      min={0}
                      value={customTipInput}
                      onChange={(e) => setCustomTipInput(e.target.value)}
                      placeholder={t.extras.tipCustomPlaceholder}
                      aria-label={t.extras.tipCustomPlaceholder}
                      className="w-full rounded-lg border border-[#D4A359]/35 bg-[#1D0D09] px-3 py-1.5 text-start font-mono text-[11px] text-white placeholder-[#9D856E]"
                    />
                  </div>
                </form>
              )}

              {/* Çok Aşamalı Canlı Sipariş & Kurye Takibi */}
              {activeTableOrders.length > 0 && (
                <div className="rounded-2xl border border-emerald-500/35 bg-emerald-950/25 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-emerald-300">
                      {t.cartModal.liveOrderStatusTitle}
                    </span>
                    {qrVerifiedTableId && (
                      <button
                        type="button"
                        onClick={() => {
                          onRequestBill(qrVerifiedTableId);
                          showToast(
                            'success',
                            t.cartModal.requestBillBtn,
                            `${activeTableNumberBadge}`
                          );
                          triggerCustomerNotification(
                            t.cartModal.requestBillBtn,
                            `${activeTableNumberBadge} hesap talebi iletildi.`
                          );
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#D4A359]/20 border border-[#D4A359]/40 text-[#F5D69B] text-[11px] font-semibold cursor-pointer"
                      >
                        <Receipt className="w-3 h-3" />
                        {t.cartModal.requestBillBtn}
                      </button>
                    )}
                  </div>
                  {activeTableOrders.slice(0, 4).map((ord) => {
                    const progress = getOrderProgressStep(
                      ord.status,
                      ord.channel,
                      ord.deliveryState
                    );
                    const stepLabels = [
                      t.extras.stepReceived,
                      t.extras.stepPreparing,
                      ord.channel === 'Paket servis'
                        ? t.extras.stepCourier
                        : t.extras.stepReady,
                      t.extras.stepCompleted,
                    ];
                    return (
                      <div
                        key={ord.id}
                        className="rounded-xl bg-[#120705]/95 p-3 border border-[#D4A359]/25 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="font-mono font-bold text-[#F5D69B]">
                              #{ord.orderNumber} · {ord.channel}
                            </div>
                            <div className="text-[11px] text-[#C4AC95]">
                              {ord.items.length} · {ord.totalAmount.toFixed(2)} ₺
                              {ord.paymentMethod ? ` (${ord.paymentMethod})` : ''}
                            </div>
                            {ord.courierName && (
                              <div className="text-[10px] text-emerald-300 font-semibold mt-0.5">
                                🛵 {ord.courierName} · {ord.deliveryState}
                              </div>
                            )}
                          </div>
                          <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                            {ord.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1 pt-1">
                          {stepLabels.map((lbl, idx) => (
                            <div key={lbl} className="space-y-1">
                              <div
                                className={`h-1.5 rounded-full ${
                                  idx <= progress.stepIndex ? 'bg-emerald-400' : 'bg-[#2C150F]'
                                }`}
                              />
                              <div
                                className={`text-[9px] truncate text-center ${
                                  idx <= progress.stepIndex
                                    ? 'text-emerald-300 font-bold'
                                    : 'text-[#8F7660]'
                                }`}
                              >
                                {lbl}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#D4A359]/25 bg-[#210F0B] space-y-2">
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between text-[#C4AC95]">
                  <span>{t.extras.subtotalLabel}</span>
                  <span className="font-mono">{checkoutTotals.subtotal.toFixed(2)} ₺</span>
                </div>
                {checkoutTotals.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>{t.extras.discountLabel}</span>
                    <span className="font-mono">-{checkoutTotals.discountAmount.toFixed(2)} ₺</span>
                  </div>
                )}
                {checkoutTotals.subtotal > 0 && (
                  <div className="flex justify-between text-[#DECAB4]">
                    <span>
                      KDV (%{activeTaxRatePercent})
                    </span>
                    <span className="font-mono">+{checkoutTotals.taxAmount.toFixed(2)} ₺</span>
                  </div>
                )}
                {checkoutTotals.deliveryFee > 0 && (
                  <div className="flex justify-between text-amber-300 font-semibold">
                    <span>{t.extras.deliveryFeeLabel}</span>
                    <span className="font-mono">+{checkoutTotals.deliveryFee.toFixed(2)} ₺</span>
                  </div>
                )}
                {checkoutTotals.tipAmount > 0 && (
                  <div className="flex justify-between text-[#F6D79E]">
                    <span>{t.extras.tipLabel}</span>
                    <span className="font-mono">+{checkoutTotals.tipAmount.toFixed(2)} ₺</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-[#D4A359]/20">
                  <span className="font-bold text-[#FFF7EB]">{t.cartModal.totalLabel}</span>
                  <span className="font-mono text-lg font-extrabold text-[#F5D69B]">
                    {cartFinalTotal.toFixed(2)} ₺
                  </span>
                </div>
                {cart.length > 0 && (
                  <div className="flex items-center justify-between text-[11px] pt-1 text-[#DECAB4]">
                    <span>Ödeme Yöntemi:</span>
                    <span className="font-bold text-[#D4A359]">{paymentMethod}</span>
                  </div>
                )}
              </div>
              <button
                type="submit"
                form="qr-order-form"
                disabled={cart.length === 0 || !isOnline}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4A359] to-[#B0782C] text-[#1A0B08] font-bold text-xs sm:text-sm shadow-lg disabled:opacity-40 cursor-pointer"
              >
                {t.cartModal.submitOrderBtn} ({channel === 'QR' ? (qrVerifiedTableId ? activeTableNumberBadge : 'QR Gerekli') : channel})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          12B. SALT-OKUNUR MASA DOLU / BOŞ DURUM HARİTASI MODALI
          (QR Okutmayanlar sadece Dolu/Boş görür; masa seçmek için QR okutulur)
      ===================================================================== */}
      {tableOccupancyModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.extras.tableStatusTitle}
          className="fixed inset-0 z-[116] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-lg rounded-3xl border border-[#D4A359]/45 bg-[#180B08] text-[#FFF6E9] p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#D4A359]/20 pb-3">
              <div>
                <h3 className="font-bold text-base text-[#FFF7EB]">{t.extras.tableStatusTitle}</h3>
                <p className="text-[11px] text-[#C4AC95] mt-0.5">{t.extras.tableStatusReadonlyHint}</p>
              </div>
              <button
                type="button"
                onClick={() => setTableOccupancyModalOpen(false)}
                aria-label="Kapat"
                className="p-1.5 rounded-xl bg-[#27120D] text-[#DECAB4] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                {t.extras.tableFree}: {tables.filter((tbl) => tbl.status === 'Boş').length}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                {t.extras.tableOccupied}: {tables.filter((tbl) => tbl.status !== 'Boş').length}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {tables.map((tbl, idx) => {
                const isFree = tbl.status === 'Boş';
                const isVerifiedThis = qrVerifiedTableId === tbl.id;
                return (
                  <div
                    key={tbl.id}
                    className={`rounded-2xl border p-3 text-xs space-y-1 ${
                      isVerifiedThis
                        ? 'border-[#D4A359] bg-[#2D150E]'
                        : isFree
                        ? 'border-emerald-500/35 bg-emerald-950/20'
                        : 'border-rose-500/35 bg-rose-950/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#F5D69B]">
                        {t.qrModal.tablePrefix} 0{idx + 1}
                      </span>
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isFree ? 'bg-emerald-400' : 'bg-rose-400'
                        }`}
                      />
                    </div>
                    <div className="font-bold text-[#FFF7EB] truncate">{tbl.number}</div>
                    <div className="text-[10px] text-[#C4AC95]">{tbl.area} · {tbl.capacity} Kişi</div>
                    <div
                      className={`text-[10px] font-bold ${
                        isFree ? 'text-emerald-300' : 'text-rose-300'
                      }`}
                    >
                      {isFree ? t.extras.tableFree : tbl.status}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setTableOccupancyModalOpen(false);
                setQrModalOpen(true);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4A359] to-[#B0782C] text-[#1A0B08] font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>{t.hero.qrScanSingleBtn}</span>
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          12C. GELİŞMİŞ 5 SEKMELİ MÜŞTERİ HESAP MERKEZİ
          (Profil & Şifre, Ev/İş Adresleri, Geçmiş Siparişler, Yorum, Şikayet & Profil Silme)
      ===================================================================== */}
      {memberModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.extras.memberModalTitle}
          className="fixed inset-0 z-[116] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-xl rounded-3xl border border-[#D4A359]/45 bg-[#180B08] text-[#FFF6E9] p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#D4A359]/20 pb-3">
              <div className="flex items-center gap-2.5">
                <User className="w-5 h-5 text-[#D4A359]" />
                <div>
                  <h3 className="font-bold text-base text-[#FFF7EB]">{t.extras.memberModalTitle}</h3>
                  <p className="text-[11px] text-[#C4AC95]">{t.extras.memberModalSubtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMemberModalOpen(false)}
                aria-label="Kapat"
                className="p-1.5 rounded-xl bg-[#27120D] text-[#DECAB4] hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!customerMember ? (
              <form onSubmit={handleSaveCustomerMember} className="space-y-3 text-xs">
                <input
                  type="text"
                  required
                  value={memberNameInput}
                  onChange={(e) => setMemberNameInput(e.target.value)}
                  placeholder={t.extras.memberNamePlaceholder}
                  className="w-full rounded-xl border border-[#D4A359]/30 bg-[#120705] px-3.5 py-2.5 text-white"
                />
                <input
                  type="tel"
                  required
                  value={memberPhoneInput}
                  onChange={(e) => setMemberPhoneInput(e.target.value)}
                  placeholder={t.extras.memberPhonePlaceholder}
                  className="w-full rounded-xl border border-[#D4A359]/30 bg-[#120705] px-3.5 py-2.5 text-white"
                />
                <input
                  type="email"
                  value={memberEmailInput}
                  onChange={(e) => setMemberEmailInput(e.target.value)}
                  placeholder={t.extras.memberEmailPlaceholder}
                  className="w-full rounded-xl border border-[#D4A359]/30 bg-[#120705] px-3.5 py-2.5 text-white"
                />
                <input
                  type="password"
                  value={memberPasswordInput}
                  onChange={(e) => setMemberPasswordInput(e.target.value)}
                  placeholder={t.extras.passwordPlaceholder}
                  className="w-full rounded-xl border border-[#D4A359]/30 bg-[#120705] px-3.5 py-2.5 text-white"
                />
                <textarea
                  rows={2}
                  value={memberAddressInput}
                  onChange={(e) => setMemberAddressInput(e.target.value)}
                  placeholder={t.extras.memberAddressPlaceholder}
                  className="w-full rounded-xl border border-[#D4A359]/30 bg-[#120705] px-3.5 py-2.5 text-white"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A359] to-[#B0782C] text-[#1A0B08] font-extrabold cursor-pointer"
                  >
                    {t.extras.memberSaveBtn}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const demoMember = {
                        name: 'Ahmet Kaya',
                        phone: '0532 555 44 33',
                        email: 'ahmet.kaya@example.com',
                        address: 'Karagöz Mah. Şahinbey Cad. No: 42, Daire: 7, Şahinbey / Gaziantep',
                      };
                      setCustomerMember(demoMember);
                      setMemberNameInput(demoMember.name);
                      setMemberPhoneInput(demoMember.phone);
                      setMemberEmailInput(demoMember.email);
                      setMemberAddressInput(demoMember.address);
                      setCustomerName(demoMember.name);
                      setCustomerPhone(demoMember.phone);
                      setDeliveryAddress(demoMember.address);
                      try {
                        localStorage.setItem('oztike_customer_member_v1', JSON.stringify(demoMember));
                      } catch {
                        // ignore
                      }
                      onRegisterMember?.(demoMember);
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-[#27120D] border border-[#D4A359]/40 text-[#F6D79E] font-bold cursor-pointer"
                  >
                    {t.extras.memberDemoBtn}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Üst Üye Özeti */}
                <div className="rounded-2xl border border-[#D4A359]/35 bg-[#22100C] p-3.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-[#F6D79E] truncate">{customerMember.name}</div>
                    <div className="text-[11px] text-[#C4AC95] font-mono">{customerMember.phone} · {customerMember.email}</div>
                    {customerMember.address && (
                      <div className="text-[11px] text-[#A88E76] mt-0.5 truncate">{customerMember.address}</div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerMember(null);
                      try {
                        localStorage.removeItem('oztike_customer_member_v1');
                      } catch {
                        // ignore
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-[#140806] border border-rose-500/35 text-rose-300 text-[11px] font-bold cursor-pointer shrink-0"
                  >
                    {t.extras.memberLogoutBtn}
                  </button>
                </div>

                {/* 5 Sekmeli Hesap Navigasyonu */}
                <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#120705] border border-[#D4A359]/25">
                  {(
                    [
                      { id: 'profile', label: t.extras.accountTabs.profile, icon: KeyRound },
                      { id: 'addresses', label: t.extras.accountTabs.addresses, icon: MapPinned },
                      { id: 'orders', label: t.extras.accountTabs.orders, icon: History },
                      { id: 'reviews', label: t.extras.accountTabs.reviews, icon: Star },
                      { id: 'complaint', label: t.extras.accountTabs.complaint, icon: AlertCircle },
                    ] as const
                  ).map((tab) => {
                    const IconComp = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setAccountTab(tab.id)}
                        className={`flex-1 min-w-[90px] py-2 px-2.5 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                          accountTab === tab.id
                            ? 'bg-[#D4A359] text-[#1A0B08]'
                            : 'text-[#DECAB4] hover:bg-[#22100C]'
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Sekme 1: Profil & Şifre Düzenleme + Profil Silme */}
                {accountTab === 'profile' && (
                  <div className="space-y-4">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const updated = {
                          name: memberNameInput.trim() || customerMember.name,
                          phone: memberPhoneInput.trim() || customerMember.phone,
                          email: memberEmailInput.trim() || customerMember.email,
                          address: memberAddressInput.trim(),
                        };
                        setCustomerMember(updated);
                        setCustomerName(updated.name);
                        setCustomerPhone(updated.phone);
                        if (updated.address) setDeliveryAddress(updated.address);
                        try {
                          localStorage.setItem('oztike_customer_member_v1', JSON.stringify(updated));
                        } catch {
                          // ignore
                        }
                        setMemberPasswordInput('');
                        setMemberNewPasswordInput('');
                        onRegisterMember?.(updated);
                        showToast('success', updated.name, t.extras.saveProfileSuccess);
                      }}
                      className="space-y-2.5"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          value={memberNameInput}
                          onChange={(e) => setMemberNameInput(e.target.value)}
                          placeholder={t.extras.memberNamePlaceholder}
                          className="rounded-xl border border-[#D4A359]/30 bg-[#120705] px-3 py-2 text-white"
                        />
                        <input
                          type="tel"
                          required
                          value={memberPhoneInput}
                          onChange={(e) => setMemberPhoneInput(e.target.value)}
                          placeholder={t.extras.memberPhonePlaceholder}
                          className="rounded-xl border border-[#D4A359]/30 bg-[#120705] px-3 py-2 text-white"
                        />
                      </div>
                      <input
                        type="email"
                        value={memberEmailInput}
                        onChange={(e) => setMemberEmailInput(e.target.value)}
                        placeholder={t.extras.memberEmailPlaceholder}
                        className="w-full rounded-xl border border-[#D4A359]/30 bg-[#120705] px-3 py-2 text-white"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="password"
                          value={memberPasswordInput}
                          onChange={(e) => setMemberPasswordInput(e.target.value)}
                          placeholder={t.extras.passwordPlaceholder}
                          className="rounded-xl border border-[#D4A359]/30 bg-[#120705] px-3 py-2 text-white"
                        />
                        <input
                          type="password"
                          value={memberNewPasswordInput}
                          onChange={(e) => setMemberNewPasswordInput(e.target.value)}
                          placeholder={t.extras.newPasswordPlaceholder}
                          className="rounded-xl border border-[#D4A359]/30 bg-[#120705] px-3 py-2 text-white"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={memberAddressInput}
                        onChange={(e) => setMemberAddressInput(e.target.value)}
                        placeholder={t.extras.memberAddressPlaceholder}
                        className="w-full rounded-xl border border-[#D4A359]/30 bg-[#120705] px-3 py-2 text-white"
                      />
                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4A359] to-[#B0782C] text-[#1A0B08] font-extrabold cursor-pointer"
                      >
                        {t.extras.memberSaveBtn}
                      </button>
                    </form>

                    {/* Profili İstediği Zaman Silme */}
                    <div className="rounded-2xl border border-rose-500/35 bg-rose-950/20 p-3.5 space-y-2">
                      <p className="text-[11px] text-rose-200 leading-snug">
                        {t.extras.deleteAccountWarn}
                      </p>
                      {!deleteAccountStep ? (
                        <button
                          type="button"
                          onClick={() => setDeleteAccountStep(true)}
                          className="px-3 py-1.5 rounded-lg bg-rose-900/50 hover:bg-rose-800/70 border border-rose-500/40 text-rose-200 font-bold text-[11px] cursor-pointer"
                        >
                          {t.extras.deleteAccountBtn}
                        </button>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const identifier = customerMember.phone || customerMember.email;
                              onDeleteCustomerAccount?.(identifier);
                              setCustomerMember(null);
                              setSavedAddresses([]);
                              setMemberNameInput('');
                              setMemberPhoneInput('');
                              setMemberEmailInput('');
                              setMemberAddressInput('');
                              setDeleteAccountStep(false);
                              setMemberModalOpen(false);
                              try {
                                localStorage.removeItem('oztike_customer_member_v1');
                                localStorage.removeItem('oztike_customer_addresses_v1');
                              } catch {
                                // ignore
                              }
                              showToast('success', 'Profil Silindi', 'Üyelik profiliniz kalıcı olarak kaldırıldı.');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] cursor-pointer"
                          >
                            {t.extras.deleteAccountConfirmBtn}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteAccountStep(false)}
                            className="px-3 py-1.5 rounded-lg bg-[#27120D] text-[#DECAB4] text-[11px] font-bold cursor-pointer"
                          >
                            Vazgeç
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sekme 2: Kayıtlı Ev & İş Yeri Adres Defteri */}
                {accountTab === 'addresses' && (
                  <div className="space-y-3">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newAddrTitle.trim() || !newAddrFull.trim()) return;
                        const entry: SavedAddressItem = {
                          id: `ADDR-${Date.now().toString().slice(-4)}`,
                          label: newAddrLabel,
                          title: newAddrTitle.trim(),
                          fullAddress: newAddrFull.trim(),
                          district: newAddrDistrict.trim() || 'Şahinbey / Gaziantep',
                        };
                        setSavedAddresses((prev) => [entry, ...prev]);
                        setNewAddrTitle('');
                        setNewAddrFull('');
                        showToast('success', entry.label, `${entry.title} adres defterinize kaydedildi.`);
                      }}
                      className="rounded-2xl border border-[#D4A359]/30 bg-[#120705] p-3 space-y-2"
                    >
                      <div className="grid grid-cols-3 gap-1.5">
                        {(
                          [
                            { val: 'Ev', label: t.extras.addressLabelHome, icon: Home },
                            { val: 'İş Yeri', label: t.extras.addressLabelWork, icon: Briefcase },
                            { val: 'Diğer', label: t.extras.addressLabelOther, icon: MapPinned },
                          ] as const
                        ).map((opt) => {
                          const IconComp = opt.icon;
                          return (
                            <button
                              key={opt.val}
                              type="button"
                              onClick={() => setNewAddrLabel(opt.val)}
                              className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer ${
                                newAddrLabel === opt.val
                                  ? 'border-[#D4A359] bg-[#D4A359] text-[#1A0B08]'
                                  : 'border-[#D4A359]/25 bg-[#1B0D09] text-[#DECAB4]'
                              }`}
                            >
                              <IconComp className="w-3 h-3" />
                              <span>{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          value={newAddrTitle}
                          onChange={(e) => setNewAddrTitle(e.target.value)}
                          placeholder="Adres Başlığı (Örn: İş Yeri)"
                          className="rounded-xl border border-[#D4A359]/25 bg-[#1B0D09] px-3 py-2 text-white"
                        />
                        <input
                          type="text"
                          value={newAddrDistrict}
                          onChange={(e) => setNewAddrDistrict(e.target.value)}
                          placeholder="Şahinbey / Gaziantep"
                          className="rounded-xl border border-[#D4A359]/25 bg-[#1B0D09] px-3 py-2 text-white"
                        />
                      </div>
                      <textarea
                        rows={2}
                        required
                        value={newAddrFull}
                        onChange={(e) => setNewAddrFull(e.target.value)}
                        placeholder={t.extras.memberAddressPlaceholder}
                        className="w-full rounded-xl border border-[#D4A359]/25 bg-[#1B0D09] px-3 py-2 text-white"
                      />
                      <button
                        type="submit"
                        className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                      >
                        + {t.extras.addAddressBtn}
                      </button>
                    </form>

                    <div className="space-y-2">
                      {savedAddresses.map((addr) => (
                        <div
                          key={addr.id}
                          className="rounded-xl border border-[#D4A359]/25 bg-[#120705] p-3 flex items-start justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 font-bold text-[#F5D69B]">
                              <span className="px-2 py-0.5 rounded bg-[#D4A359]/20 text-[10px]">
                                {addr.label}
                              </span>
                              <span className="truncate">{addr.title}</span>
                            </div>
                            <p className="text-[11px] text-[#DECAB4] mt-1">{addr.fullAddress}</p>
                            <p className="text-[10px] text-[#A88E76]">{addr.district}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setDeliveryAddress(addr.fullAddress);
                                setChannel('Paket servis');
                                setMemberModalOpen(false);
                                setCartDrawerOpen(true);
                              }}
                              className="px-2 py-1 rounded-lg bg-[#D4A359]/20 text-[#F6D79E] text-[10px] font-bold cursor-pointer"
                            >
                              Seç
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setSavedAddresses((prev) => prev.filter((a) => a.id !== addr.id))
                              }
                              aria-label="Adresi sil"
                              className="p-1 rounded-lg text-rose-400 hover:bg-rose-950/40 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sekme 3: Geçmiş Siparişler & Tekrar Sipariş Ver */}
                {accountTab === 'orders' && (
                  <div className="space-y-2.5">
                    <div className="font-bold text-[#F5D69B] flex items-center gap-1.5">
                      <History className="w-4 h-4 text-[#D4A359]" />
                      <span>{t.extras.memberOrdersTab} ({memberPastOrders.length})</span>
                    </div>
                    {memberPastOrders.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-[#D4A359]/25 p-5 text-center text-[#A88E76]">
                        {t.extras.noPastOrders}
                      </div>
                    ) : (
                      memberPastOrders.map((ord) => (
                        <div
                          key={ord.id}
                          className="rounded-2xl border border-[#D4A359]/25 bg-[#120705] p-3.5 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <div className="font-mono font-bold text-[#F5D69B]">
                                #{ord.orderNumber} · {ord.channel}
                              </div>
                              <div className="text-[10px] text-[#A88E76]">{ord.createdAt}</div>
                            </div>
                            <span className="font-mono font-bold text-emerald-300">
                              {ord.totalAmount.toFixed(2)} ₺
                            </span>
                          </div>
                          <div className="text-[11px] text-[#DECAB4]">
                            {ord.items.map((it) => `${it.quantity}x ${it.productName}`).join(', ')}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleReorderPastOrder(ord)}
                            className="w-full py-2 rounded-xl bg-[#D4A359]/15 hover:bg-[#D4A359]/25 border border-[#D4A359]/45 text-[#F6D79E] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{t.extras.reorderBtn}</span>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Sekme 4: Ürün & Hizmet Yorumu Bırak */}
                {accountTab === 'reviews' && (
                  <div className="space-y-3">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!reviewComment.trim()) return;
                        const targetProd = products.find((p) => p.id === reviewProductId);
                        onSubmitReview?.({
                          customerName: customerMember.name,
                          customerPhone: customerMember.phone,
                          productId: reviewProductId,
                          productName: targetProd?.name || 'Genel Değerlendirme',
                          rating: reviewRating,
                          comment: reviewComment.trim(),
                        });
                        setReviewComment('');
                        showToast('success', 'Teşekkürler!', 'Yorumunuz yönetici onayına ve CRM ekranına iletildi.');
                      }}
                      className="rounded-2xl border border-[#D4A359]/30 bg-[#120705] p-3.5 space-y-2.5"
                    >
                      <select
                        value={reviewProductId}
                        onChange={(e) => setReviewProductId(e.target.value)}
                        className="w-full rounded-xl border border-[#D4A359]/25 bg-[#1B0D09] px-3 py-2 text-white"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {getTranslatedProduct(p, currentLang).name}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            aria-label={`${star} Yıldız`}
                            className="p-1 cursor-pointer"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= reviewRating
                                  ? 'fill-[#D4A359] text-[#D4A359]'
                                  : 'text-[#5A4433]'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="font-mono text-[#F5D69B] font-bold ms-1">
                          {reviewRating}/5
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        required
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Lezzet ve servis hakkındaki düşüncelerinizi paylaşın..."
                        className="w-full rounded-xl border border-[#D4A359]/25 bg-[#1B0D09] px-3 py-2 text-white"
                      />
                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4A359] to-[#B0782C] text-[#1A0B08] font-extrabold cursor-pointer"
                      >
                        {t.extras.reviewSubmitBtn}
                      </button>
                    </form>

                    {customerReviews.length > 0 && (
                      <div className="space-y-2">
                        {customerReviews.slice(0, 4).map((rev) => (
                          <div
                            key={rev.id}
                            className="rounded-xl border border-[#D4A359]/20 bg-[#120705] p-3 space-y-1"
                          >
                            <div className="flex items-center justify-between font-bold text-[#F5D69B]">
                              <span>{rev.customerName} · {rev.productName}</span>
                              <span className="font-mono text-amber-400">{rev.rating}★</span>
                            </div>
                            <p className="text-[11px] text-[#DECAB4]">{rev.comment}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Sekme 5: Şikayet & Öneri İlet */}
                {accountTab === 'complaint' && (
                  <div className="space-y-3">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!complaintMessage.trim()) return;
                        onSubmitComplaint?.({
                          customerName: customerMember.name,
                          customerPhone: customerMember.phone,
                          subject: complaintSubject,
                          orderNumber: complaintOrderNo.trim() || undefined,
                          message: complaintMessage.trim(),
                        });
                        setComplaintOrderNo('');
                        setComplaintMessage('');
                        showToast('success', 'Şikayet İletildi', 'Bildiriminiz yönetici masasına canlı düşürüldü.');
                      }}
                      className="rounded-2xl border border-[#D4A359]/30 bg-[#120705] p-3.5 space-y-2.5"
                    >
                      <select
                        value={complaintSubject}
                        onChange={(e) => setComplaintSubject(e.target.value)}
                        className="w-full rounded-xl border border-[#D4A359]/25 bg-[#1B0D09] px-3 py-2 text-white"
                      >
                        <option value="Sipariş & Teslimat">Sipariş & Teslimat</option>
                        <option value="Lezzet & Pişirme">Lezzet & Pişirme</option>
                        <option value="Salon & Servis">Salon & Servis</option>
                        <option value="Ödeme & Fatura">Ödeme & Fatura</option>
                        <option value="Diğer Öneri">Diğer Öneri</option>
                      </select>
                      <input
                        type="text"
                        value={complaintOrderNo}
                        onChange={(e) => setComplaintOrderNo(e.target.value)}
                        placeholder="Sipariş No (İsteğe bağlı, Örn: OZT-2026-1042)"
                        className="w-full rounded-xl border border-[#D4A359]/25 bg-[#1B0D09] px-3 py-2 text-white"
                      />
                      <textarea
                        rows={3}
                        required
                        value={complaintMessage}
                        onChange={(e) => setComplaintMessage(e.target.value)}
                        placeholder="Yaşadığınız durumu veya önerinizi detaylandırın..."
                        className="w-full rounded-xl border border-[#D4A359]/25 bg-[#1B0D09] px-3 py-2 text-white"
                      />
                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold cursor-pointer"
                      >
                        {t.extras.complaintSubmitBtn}
                      </button>
                    </form>

                    {customerComplaints.length > 0 && (
                      <div className="space-y-2">
                        {customerComplaints.slice(0, 4).map((cmp) => (
                          <div
                            key={cmp.id}
                            className="rounded-xl border border-rose-500/25 bg-[#120705] p-3 space-y-1"
                          >
                            <div className="flex items-center justify-between font-bold text-[#F5D69B]">
                              <span>{cmp.subject}</span>
                              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                                {cmp.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#DECAB4]">{cmp.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          12D. ÜRÜN SOSYAL MEDYA & SOHBET PAYLAŞIM MODALI
      ===================================================================== */}
      {sharingProduct && (() => {
        const trProd = getTranslatedProduct(sharingProduct, currentLang);
        const effPrice = sharingProduct.discountedPrice ?? sharingProduct.price;
        const shareUrl = `${window.location.origin}${window.location.pathname}#menu`;
        const shareText = `${trProd.name} (${effPrice} ₺) — ÖzTike Ciğer · Halil Usta (Şahinbey / Gaziantep)`;
        return (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t.menu.shareTitle}
            className="fixed inset-0 z-[125] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="w-full max-w-sm rounded-3xl border border-[#D4A359]/45 bg-[#180B08] text-[#FFF6E9] p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#D4A359]/20 pb-3">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-[#D4A359]" />
                  <div>
                    <h3 className="font-bold text-sm text-[#FFF7EB]">{t.menu.shareTitle}</h3>
                    <p className="text-[11px] text-[#C4AC95] truncate max-w-[220px]">{trProd.name}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSharingProduct(null)}
                  aria-label="Kapat"
                  className="p-1.5 rounded-xl bg-[#27120D] text-[#DECAB4] hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-emerald-500/35 bg-emerald-950/30 text-emerald-300 flex items-center justify-center gap-1.5 hover:bg-emerald-950/50"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-sky-500/35 bg-sky-950/30 text-sky-300 flex items-center justify-center gap-1.5 hover:bg-sky-950/50"
                >
                  <Send className="w-4 h-4" />
                  <span>Telegram</span>
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-[#D4A359]/30 bg-[#120705] text-[#F5D69B] flex items-center justify-center gap-1.5 hover:bg-[#22100C]"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>X / Twitter</span>
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-blue-500/30 bg-blue-950/30 text-blue-300 flex items-center justify-center gap-1.5 hover:bg-blue-950/50"
                >
                  <Facebook className="w-4 h-4" />
                  <span>Facebook</span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (navigator.clipboard?.writeText) {
                    navigator.clipboard.writeText(`${shareText} ${shareUrl}`).catch(() => {});
                  }
                  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
                    navigator.share({ title: trProd.name, text: shareText, url: shareUrl }).catch(() => {});
                  }
                  showToast('success', t.menu.shareTitle, t.menu.shareCopied);
                  setSharingProduct(null);
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D4A359] to-[#B0782C] text-[#1A0B08] font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>Bağlantıyı Kopyala & Paylaş</span>
              </button>
            </div>
          </div>
        );
      })()}

      {/* =====================================================================
          13. ALT NAVBAR (TELEFON · WHATSAPP · SİPARİŞ · GARSON · ASİSTAN)
          (İkonlarda Hafif Periyodik Dikkat Çekici Animasyonlar)
      ===================================================================== */}
      <nav
        aria-label="Alt Hızlı Erişim Menüsü"
        className="fixed bottom-0 inset-x-0 z-40 bg-[#140806]/95 backdrop-blur-md border-t border-[#D4A359]/35 px-2 sm:px-4 py-2 shadow-[0_-8px_30px_rgba(0,0,0,0.8)]"
      >
        <div className="max-w-3xl mx-auto grid grid-cols-5 gap-1.5 sm:gap-2.5">
          {/* 1. TELEFON */}
          <a
            href={`tel:${siteCmsConfig.contact.phoneCallRaw}`}
            onClick={() =>
              showToast(
                'success',
                t.bottomNav.phone,
                `${siteCmsConfig.contact.phoneDisplay} aranıyor...`
              )
            }
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[#22100C] hover:bg-[#2F1610] border border-[#D4A359]/25 text-[#F6D79E] transition-colors cursor-pointer"
          >
            <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4A359] nav-icon-pulse-1" />
            <span className="text-[10px] sm:text-xs font-bold mt-1 truncate">
              {t.bottomNav.phone}
            </span>
          </a>

          {/* 2. WHATSAPP */}
          <a
            href={`https://wa.me/${siteCmsConfig.contact.whatsappRaw}?text=${encodeURIComponent(
              siteCmsConfig.contact.whatsappMessageTr
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[#22100C] hover:bg-[#2F1610] border border-emerald-500/30 text-emerald-300 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 nav-icon-pulse-2" />
            <span className="text-[10px] sm:text-xs font-bold mt-1 truncate">
              {t.bottomNav.whatsapp}
            </span>
          </a>

          {/* 3. SİPARİŞ (SEPET) */}
          <button
            type="button"
            onClick={() => setCartDrawerOpen(true)}
            className="relative flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-gradient-to-r from-[#D4A359] to-[#B0782C] text-[#1A0B08] shadow-lg hover:brightness-110 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-1">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 nav-icon-pulse-3" />
              <span className="font-mono text-xs font-extrabold">{totalCartItemsCount}</span>
            </div>
            <span className="text-[10px] sm:text-xs font-extrabold mt-0.5 truncate">
              {t.bottomNav.orderCart}
            </span>
          </button>

          {/* 4. GARSON (SADECE QR KOD OKUTAN MASALAR ÇAĞIRABİLİR) */}
          <button
            type="button"
            onClick={() => {
              const check = canAccessQrProtectedFeature(qrVerifiedTableId, 'waiter_call');
              if (!check.allowed) {
                showToast('error', t.extras.qrRequiredTitle, t.extras.qrRequiredWaiterDesc);
                setQrModalOpen(true);
                return;
              }
              setWaiterModalOpen(true);
            }}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[#22100C] hover:bg-[#2F1610] border border-[#D4A359]/40 text-[#FFF6E9] transition-colors cursor-pointer"
          >
            <BellRing className="w-4 h-4 sm:w-5 sm:h-5 text-[#E5A94E] nav-icon-pulse-4" />
            <span className="text-[10px] sm:text-xs font-bold mt-1 truncate">
              {t.bottomNav.waiter}
            </span>
          </button>

          {/* 5. ASİSTAN (ÜCRETSİZ YAPAY ZEKÂ LEZZET ASİSTANI) */}
          <button
            type="button"
            onClick={() => setAiModalOpen(true)}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-xl bg-[#22100C] hover:bg-[#2F1610] border border-[#D4A359]/40 text-[#F6D79E] transition-colors cursor-pointer"
          >
            <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4A359] nav-icon-pulse-5" />
            <span className="text-[10px] sm:text-xs font-bold mt-1 truncate">
              {t.bottomNav.assistant}
            </span>
          </button>
        </div>
      </nav>

      {/* =====================================================================
          AÇILIR POP-UP DUYURU & KAMPANYA MODALI (PROMO POPUP)
      ===================================================================== */}
      {showPromoPopup && siteCmsConfig.promoPopup?.enabled && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="relative w-full max-w-md rounded-3xl border-2 border-[#D4A359] bg-gradient-to-b from-[#22100C] to-[#120806] text-[#FFF6E9] p-6 shadow-2xl overflow-hidden space-y-4">
            {/* Kapat Butonu */}
            <button
              type="button"
              onClick={handleDismissPromoPopup}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 border border-[#D4A359]/30 text-neutral-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Kapat"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Rozet */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A359]/20 border border-[#D4A359]/40 text-[#F5D69B] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{siteCmsConfig.promoPopup.badgeText || 'Özel Fırsat'}</span>
            </div>

            {/* Görsel */}
            {siteCmsConfig.promoPopup.imageUrl && (
              <div className="w-full h-44 rounded-2xl overflow-hidden border border-[#D4A359]/30 bg-black/40">
                <img
                  src={siteCmsConfig.promoPopup.imageUrl}
                  alt={siteCmsConfig.promoPopup.titleTr}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Başlık ve Metin */}
            <div className="space-y-1.5 text-center">
              <h3 className="text-xl font-black text-[#F5D69B]">
                {siteCmsConfig.promoPopup.titleTr || 'ÖzTike Lezzet Kampanyası'}
              </h3>
              <p className="text-xs text-[#C4AC95] leading-relaxed">
                {siteCmsConfig.promoPopup.bodyTr || 'Gaziantep Şahinbey zırh kıyması ve meşe közünde taze kuzu ciğeri siparişinizde geçerli indirim fırsatını kaçırmayın!'}
              </p>
            </div>

            {/* Kupon Kodu Alanı */}
            {siteCmsConfig.promoPopup.couponCode && (
              <div className="rounded-2xl border border-dashed border-[#D4A359]/60 bg-[#160805] p-3 flex items-center justify-between gap-2">
                <div className="text-left">
                  <div className="text-[10px] text-neutral-400 font-semibold uppercase">İndirim Kuponu</div>
                  <div className="font-mono font-bold text-sm text-[#F5D69B]">
                    {siteCmsConfig.promoPopup.couponCode}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.clipboard) {
                      void navigator.clipboard.writeText(siteCmsConfig.promoPopup.couponCode);
                    }
                    setCopiedPromoCode(true);
                    setSelectedCouponCode(siteCmsConfig.promoPopup.couponCode);
                    showToast('success', 'Kupon Uygulandı', `${siteCmsConfig.promoPopup.couponCode} kupon kodu sepetinize tanımlandı.`);
                    setTimeout(() => setCopiedPromoCode(false), 2500);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#D4A359] text-[#140806] font-bold text-xs hover:bg-[#C5A059] cursor-pointer transition-colors"
                >
                  {copiedPromoCode ? '✓ Tanımlandı' : 'Kopyala & Kullan'}
                </button>
              </div>
            )}

            {/* Aksiyon Butonları */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={handleDismissPromoPopup}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#D4A359] to-[#B0782C] text-[#140806] font-extrabold text-sm hover:brightness-110 cursor-pointer shadow-lg"
              >
                Menüyü İncele &amp; Sipariş Ver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
