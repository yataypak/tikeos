import type { SupportedLang } from '../i18n/translations';

export interface HeroSlideItem {
  id: string;
  titleTr: string;
  titleEn: string;
  titleAr: string;
  subtitleTr: string;
  subtitleEn: string;
  subtitleAr: string;
  badgeTr: string;
  badgeEn: string;
  badgeAr: string;
  imageUrl: string;
  isActive: boolean;
}

export interface NavMenuItem {
  id: string;
  labelTr: string;
  labelEn: string;
  labelAr: string;
  url: string;
  location: 'header' | 'footer' | 'both';
  imageUrl?: string;
  imageUrls?: string[];
  openInNewTab: boolean;
  isActive: boolean;
}

export interface LogoPresetItem {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
}

export interface ShowcaseCardItem {
  id: string;
  titleTr: string;
  titleEn: string;
  titleAr: string;
  subtitleTr: string;
  subtitleEn: string;
  subtitleAr: string;
  badgeText: string;
  iconName: 'flame' | 'utensils' | 'award' | 'clock' | 'sparkles';
  isActive: boolean;
}

export interface GalleryMediaItem {
  id: string;
  type: 'photo' | 'video';
  titleTr: string;
  titleEn: string;
  titleAr: string;
  category: string;
  thumbnailUrl: string;
  mediaUrl: string;
  duration?: string;
  isActive: boolean;
}

export interface SocialMediaLinkItem {
  id: string;
  platform: 'Instagram' | 'Facebook' | 'YouTube' | 'TikTok' | 'WhatsApp' | 'Google Maps';
  handleOrLabel: string;
  url: string;
  isActive: boolean;
}

export interface CustomBlockItem {
  id: string;
  titleTr: string;
  titleEn: string;
  titleAr: string;
  contentTr: string;
  contentEn: string;
  contentAr: string;
  badgeText: string;
  buttonLabel: string;
  buttonUrl: string;
  position: 'top' | 'middle' | 'bottom';
  isActive: boolean;
}

import type {
  ThemeVariantId,
  MapProviderMode,
  FreeMapProviderId,
  PaidMapProviderId,
} from '../core/restaurantEngine';

export interface CustomPluginWidgetItem {
  id: string;
  name: string;
  category: 'Bileşen' | 'Modül' | 'Eklenti';
  description: string;
  isActive: boolean;
  version: string;
  placement?: 'header' | 'hero' | 'menu' | 'footer' | 'global';
  settings?: Record<string, string | number | boolean>;
}

export interface SiteCmsConfig {
  announcementBar: {
    enabled: boolean;
    sticky: boolean;
    dismissible: boolean;
    textTr: string;
    textEn: string;
    textAr: string;
    linkLabelTr: string;
    linkUrl: string;
    bgColor: string;
    textColor: string;
    badgeText: string;
  };
  header: {
    brandTitle: string;
    brandSubtitleTr: string;
    brandSubtitleEn: string;
    brandSubtitleAr: string;
    logoUrl: string;
    logoHeightPx: number;
    faviconUrl: string;
    logoPresets: LogoPresetItem[];
    showSearchBarAboveSlider: boolean;
    showLanguageSwitcher: boolean;
    showNotificationBell: boolean;
    stickyHeader: boolean;
    navMenus: NavMenuItem[];
  };
  slider: {
    autoPlay: boolean;
    intervalMs: number;
    overlayOpacity: number;
    slides: HeroSlideItem[];
  };
  design: {
    themeVariant: ThemeVariantId;
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    surfaceColor: string;
    cardStyle: 'glass-gold' | 'minimal-dark' | 'classic-border';
    cardRadius: 'rounded-xl' | 'rounded-2xl' | 'rounded-3xl';
    buttonStyle: 'gold-gradient' | 'copper-solid' | 'emerald-accent';
    buttonRadius: 'rounded-lg' | 'rounded-xl' | 'rounded-full';
    buttonFontWeight?: 'semibold' | 'bold' | 'extrabold';
    iconStyle?: 'outline' | 'solid' | 'rounded';
    iconSizePx?: number;
    gridColumnsDesktop?: 2 | 3 | 4;
    gridColumnsMobile?: 1 | 2;
    gridGap?: 'compact' | 'normal' | 'relaxed';
    navbarPosition?: 'top' | 'centered';
    footerColumns?: 2 | 3 | 4;
    footerBgColor?: string;
    showProductCalories: boolean;
    showProductPrepTime: boolean;
    qrButtonLabelTr: string;
    orderButtonLabelTr: string;
    showcaseCards: ShowcaseCardItem[];
  };
  blocks: CustomBlockItem[];
  gallery: GalleryMediaItem[];
  socialMedia: SocialMediaLinkItem[];
  contact: {
    phoneDisplay: string;
    phoneCallRaw: string;
    whatsappRaw: string;
    whatsappMessageTr: string;
    email: string;
    addressTr: string;
    addressEn: string;
    addressAr: string;
    workingHoursTr: string;
    workingHoursEn: string;
    workingHoursAr: string;
    mapCoordinatesLabel: string;
  };
  footer: {
    aboutTr: string;
    aboutEn: string;
    aboutAr: string;
    copyrightTr: string;
    copyrightEn: string;
    copyrightAr: string;
    showSocialIcons: boolean;
    showAdminLoginButton: boolean;
    adminDemoEmail: string;
    adminDemoPassword: string;
  };
  seo: {
    metaTitleTr: string;
    metaTitleEn: string;
    metaTitleAr: string;
    metaDescriptionTr: string;
    metaDescriptionEn: string;
    metaDescriptionAr: string;
    keywords: string;
    canonicalUrl: string;
    robots: string;
    ogImageUrl: string;
    ogImageAlt?: string;
    twitterCard?: 'summary_large_image' | 'summary';
    schemaType: 'Restaurant' | 'FoodEstablishment' | 'LocalBusiness';
    servesCuisine?: string;
    priceRange?: string;
    openingHoursSpec?: string;
    telephone?: string;
    postalCode?: string;
    acceptsReservations?: boolean;
    ratingValue?: number;
    reviewCount?: number;
    hreflangEnabled?: boolean;
    author: string;
    publisher: string;
    copyright: string;
    geoRegion: string;
    geoPlacename: string;
    geoPosition: string;
    twitterSite: string;
    googleVerification: string;
    bingVerification: string;
    yandexVerification: string;
    robotsTxt: string;
    sitemapXml: string;
    llmsTxt: string;
  };
  generalSettings: {
    companyLegalName: string;
    taxOfficeAndNo: string;
    defaultLanguage: SupportedLang;
    timezone: string;
    currencySymbol: string;
    taxRatePercent: number;
    courierDeliveryFee: number;
    serviceFeePercent: number;
    minDeliveryOrderAmount: number;
    deliveryRadiusKm: number;
    defaultPrepMinutes: number;
    autoAcceptQrOrders: boolean;
    maintenanceMode: boolean;
    maintenanceMessageTr: string;
    smtpHost: string;
    notificationEmail: string;
    sessionTimeoutMinutes: number;
    requireTwoFactorForAdmin: boolean;
  };
  receiptSettings: {
    companyName: string;
    legalName: string;
    address: string;
    phone: string;
    taxOfficeAndNo: string;
    stampTitle: string;
    stampSubtitle: string;
    headerNote: string;
    footerMessage: string;
    paperWidthMm: 58 | 80;
    showLogo: boolean;
    showStampBox: boolean;
    templatePreset?: 'classic-thermal' | 'modern-minimal' | 'gaziantep-heritage' | 'kurumsal-efatura';
    accentColor?: string;
    fontFamily?: 'mono' | 'sans' | 'serif';
    borderStyle?: 'dashed' | 'solid' | 'double';
    showQrCode?: boolean;
    qrCodeUrl?: string;
    showBarcode?: boolean;
    showTaxBreakdown?: boolean;
    showWaiterAndTable?: boolean;
    showWifiInfo?: boolean;
    wifiSsid?: string;
    wifiPassword?: string;
    socialHandle?: string;
  };
  pwaSettings: {
    enabled: boolean;
    appName: string;
    shortName: string;
    description: string;
    themeColor: string;
    backgroundColor: string;
    accentColor?: string;
    splashTextColor?: string;
    buttonColor?: string;
    appCategory?: string;
    displayMode: 'standalone' | 'fullscreen' | 'minimal-ui';
    orientation: 'portrait' | 'any';
    iconUrl: string;
    maskableIconUrl?: string;
    splashImageUrl?: string;
    splashVideoUrl?: string;
    splashTitleTr?: string;
    splashSubtitleTr?: string;
    pushTitleTr?: string;
    pushBodyTr?: string;
    pushBadgeUrl?: string;
    pushVibratePattern?: string;
    statusBarStyle?: 'black-translucent' | 'default' | 'black';
    startUrl: string;
    scope: string;
    cacheStrategy: 'NetworkFirst' | 'StaleWhileRevalidate' | 'CacheFirst';
    installButtonLabelTr: string;
    iosHintTr: string;
    offlineTitleTr?: string;
    offlineTextTr: string;
    enableOfflineCache: boolean;
    enablePushNotifications: boolean;
    showHeaderInstallBtn: boolean;
    showFooterCard: boolean;
    screenshots?: string[];
    shortcuts?: {
      name: string;
      shortName: string;
      url: string;
      description: string;
    }[];
  };
  promoPopup: {
    enabled: boolean;
    titleTr: string;
    titleEn: string;
    titleAr: string;
    bodyTr: string;
    bodyEn: string;
    bodyAr: string;
    badgeText: string;
    couponCode: string;
    ctaLabelTr: string;
    ctaUrl: string;
    imageUrl: string;
    videoUrl?: string;
    bgColor?: string;
    textColor?: string;
    accentColor?: string;
    triggerType?: 'immediate' | 'delay' | 'exit';
    delaySeconds: number;
    autoCloseSeconds?: number;
    dismissible?: boolean;
    showOncePerSession: boolean;
  };
  paymentMethods?: {
    id: string;
    name: string;
    code: string;
    type: 'cash' | 'pos' | 'online_card' | 'meal_card' | 'transfer' | 'wallet';
    commissionPercent: number;
    isActive: boolean;
    allowOnCustomerPortal: boolean;
    allowPayNow: boolean;
    description: string;
  }[];
  reservationSettings?: {
    slotDurationMinutes: number;
    minPartySize: number;
    maxPartySize: number;
    depositRequired: boolean;
    defaultDepositAmount: number;
    autoConfirm: boolean;
    workingStartHour: string;
    workingEndHour: string;
    advanceBookingDays: number;
    allowCustomerNotes: boolean;
  };
  mapSettings: {
    enabled: boolean;
    showFooterMap: boolean;
    providerMode: MapProviderMode;
    freeProvider: FreeMapProviderId;
    paidProvider: PaidMapProviderId;
    paidApiKey: string;
    customEmbedUrl: string;
    placeName: string;
    addressLine: string;
    lat: number;
    lng: number;
    zoom: number;
    enableGoogleMapsJs: boolean;
    enableGoogleNav: boolean;
    enableAppleMaps: boolean;
    enableYandexMaps: boolean;
    enableWaze: boolean;
    enableOpenStreetMap: boolean;
    enableBingMaps: boolean;
  };
  operationalSettings: {
    kitchenModuleEnabled: boolean;
    tableSelectionEnabled: boolean;
    orderTrackingEnabled: boolean;
    qrRequireScan: boolean;
    qrRateLimitPerMin: number;
    kdsAlertMinutes: number;
    kdsActiveStations: string[];
    kdsSoundAlert: boolean;
    kdsAutoBumpCompleted: boolean;
    posDefaultMethod: 'cash' | 'card' | 'meal_card';
    posAutoReceiptPrint: boolean;
  };
  paymentMethodsV2Migrated?: boolean;
  modules: {
    aiAssistantEnabled: boolean;
    gallerySectionEnabled: boolean;
    campaignsSectionEnabled: boolean;
    socialMediaBarEnabled: boolean;
    showcaseCardsEnabled: boolean;
    liveNotificationSound: boolean;
    widgets: CustomPluginWidgetItem[];
  };
}

export const INITIAL_SITE_CMS_CONFIG: SiteCmsConfig = {
  announcementBar: {
    enabled: true,
    sticky: false,
    dismissible: true,
    textTr: 'Meşe közünde günlük taze kuzu ciğeri, sıcak tandır lavaşı ve 7 çeşit köz meze ikramımızdır!',
    textEn: 'Daily fresh lamb liver over oak charcoal — served with complimentary hot tandoor lavash & 7 roasted mezzes!',
    textAr: 'كبدة ضأن طازجة يومياً على فحم البلوط مع خبز التنور الساخن و ٧ مقبلات مشوية ضيافة مجانية!',
    linkLabelTr: 'Menüyü Gör',
    linkUrl: '#menu',
    bgColor: '#2A120C',
    textColor: '#F6D79E',
    badgeText: 'DUYURU',
  },
  header: {
    brandTitle: 'ÖzTike Ciğer',
    brandSubtitleTr: 'Halil Usta · 1996’dan Beri',
    brandSubtitleEn: 'Master Halil · Est. 1996',
    brandSubtitleAr: 'الشيف خليل أوسطا · منذ ١٩٩٦',
    logoUrl: '/assets/aistudio/oztike-logo-transparent.png',
    logoHeightPx: 44,
    faviconUrl: '/assets/aistudio/oztike-logo-transparent.png',
    logoPresets: [
      {
        id: 'LOGO-01',
        name: 'ÖzTike Ciğer · Halil Usta Orijinal Logo',
        url: '/assets/aistudio/oztike-logo-transparent.png',
        isActive: true,
      },
    ],
    showSearchBarAboveSlider: true,
    showLanguageSwitcher: true,
    showNotificationBell: true,
    stickyHeader: true,
    navMenus: [
      {
        id: 'NAV-01',
        labelTr: 'Menü',
        labelEn: 'Menu',
        labelAr: 'القائمة',
        url: '#menu',
        location: 'both',
        openInNewTab: false,
        isActive: true,
      },
      {
        id: 'NAV-02',
        labelTr: 'Foto & Video Galeri',
        labelEn: 'Photo & Video Gallery',
        labelAr: 'معرض الصور والفيديو',
        url: '#galeri',
        location: 'both',
        openInNewTab: false,
        isActive: true,
      },
      {
        id: 'NAV-03',
        labelTr: 'Kampanyalar',
        labelEn: 'Campaigns',
        labelAr: 'العروض',
        url: '#kampanyalar',
        location: 'both',
        openInNewTab: false,
        isActive: true,
      },
      {
        id: 'NAV-04',
        labelTr: 'İletişim',
        labelEn: 'Contact',
        labelAr: 'اتصل بنا',
        url: '#iletisim',
        location: 'both',
        openInNewTab: false,
        isActive: true,
      },
    ],
  },
  slider: {
    autoPlay: true,
    intervalMs: 6000,
    overlayOpacity: 85,
    slides: [
      {
        id: 'SLD-01',
        titleTr: 'Gerçek Ciğer Ustalık İster.',
        titleEn: 'True Charcoal Liver Takes Mastery.',
        titleAr: 'الكبدة المشوية الأصيلة تتطلب مهارة الأسطى.',
        subtitleTr: 'Halil Usta’nın 1996’dan gelen sırrıyla, zırhta çekilmiş kebaplar ve günlük erkek kuzu ciğeri.',
        subtitleEn: 'Crafted with Master Halil’s 1996 heritage recipe: daily fresh lamb liver & hand-minced kebabs.',
        subtitleAr: 'بوصفة الشيف خليل أوسطا التراثية منذ عام ١٩٩٦: كبدة ضأن طازجة يومياً وكباب مفروم بالساطور.',
        badgeTr: 'Geleneksel Gaziantep & Urfa Ocakbaşı',
        badgeEn: 'Authentic Anatolian Charcoal Grill',
        badgeAr: 'مشويات غازي عنتاب وأورفا على الفحم',
        imageUrl: '/assets/aistudio/crops/branded-ocakbasi.jpg',
        isActive: true,
      },
      {
        id: 'SLD-02',
        titleTr: 'Zırh Kebabı & Taş Fırın Lahmacun',
        titleEn: 'Hand-Minced Kebab & Stone-Oven Lahmacun',
        titleAr: 'كباب الساطور ولحم بعجين بالفرن الحجري',
        subtitleTr: 'Sıcak tandır lavaşı, cevizli gavurdağı salatası ve bakır maşrapada bol köpüklü yayık ayranı ile.',
        subtitleEn: 'Served with hot tandoor lavash, walnut Gavurdağı salad, and foamy copper-cup churned ayran.',
        subtitleAr: 'يقدم مع خبز التنور الساخن وسلطة غافورداغ بالجوز ولبن العيران الرغوي في الكوب النحاسي.',
        badgeTr: '%100 Doğal & Günlük Taze Et',
        badgeEn: '100% Natural Daily Fresh Meat',
        badgeAr: 'لحوم طبيعية وطازجة يومياً ١٠٠٪',
        imageUrl: '/assets/aistudio/crops/cat-kebap.png',
        isActive: true,
      },
      {
        id: 'SLD-03',
        titleTr: 'Odun Ateşinde Yaprak Döner & Izgara Tavuk',
        titleEn: 'Wood-Fired Leaf Doner & Charcoal Chicken',
        titleAr: 'شاورما دونر على الحطب ودجاج مشوي على الفحم',
        subtitleTr: 'Masadaki QR kodu okutarak saniyeler içinde siparişinizi mutfağa iletin.',
        subtitleEn: 'Scan the QR code on your table to send your customized order straight to our kitchen.',
        subtitleAr: 'امسح رمز QR على طاولتك لإرسال طلبك المخصص مباشرة إلى المطبخ في ثوانٍ.',
        badgeTr: 'Hızlı QR Masa Servisi',
        badgeEn: 'Express QR Table Service',
        badgeAr: 'خدمة طاولات سريعة عبر رمز QR',
        imageUrl: '/assets/aistudio/crops/cat-doner.png',
        isActive: true,
      },
    ],
  },
  design: {
    themeVariant: 'oztike-classic',
    primaryColor: '#D4A359',
    secondaryColor: '#B0782C',
    backgroundColor: '#120806',
    surfaceColor: '#1A0C09',
    cardStyle: 'glass-gold',
    cardRadius: 'rounded-2xl',
    buttonStyle: 'gold-gradient',
    buttonRadius: 'rounded-xl',
    buttonFontWeight: 'bold',
    iconStyle: 'rounded',
    iconSizePx: 16,
    gridColumnsDesktop: 3,
    gridColumnsMobile: 1,
    gridGap: 'normal',
    navbarPosition: 'top',
    footerColumns: 3,
    footerBgColor: '',
    showProductCalories: false,
    showProductPrepTime: false,
    qrButtonLabelTr: 'Masadaki QR Kodu Okut',
    orderButtonLabelTr: 'Siparişi Mutfağa Gönder',
    showcaseCards: [
      {
        id: 'CRD-01',
        titleTr: 'Günlük Taze Erkek Kuzu Ciğeri',
        titleEn: 'Daily Fresh Lamb Liver',
        titleAr: 'كبدة ضأن طازجة يومياً',
        subtitleTr: 'Her sabah özenle ayıklanan, sinirsiz ve meşe közünde pişirilen özel ciğer şiş.',
        subtitleEn: 'Hand-trimmed every morning and grilled over pure oak charcoal.',
        subtitleAr: 'تُنظف وتُجهز كل صباح وتشوى على جمر البلوط الخالص.',
        badgeText: '1996’DAN BERİ',
        iconName: 'flame',
        isActive: true,
      },
      {
        id: 'CRD-02',
        titleTr: '7 Çeşit Sıcak & Köz Meze İkramı',
        titleEn: '7 Complimentary Grill Appetizers',
        titleAr: '٧ مقبلات مشوية ضيافة مجانية',
        subtitleTr: 'Sıcak tandır lavaşı, köz biber, domates, sumaklı soğan ve ezme her masaya ikram.',
        subtitleEn: 'Hot tandoor lavash, roasted peppers, sumac onions, and spicy ezme on the house.',
        subtitleAr: 'خبز التنور الساخن والفلفل المشوي والبصل بالسماق مجاناً لكل طاولة.',
        badgeText: 'İKRAMIMIZ',
        iconName: 'utensils',
        isActive: true,
      },
      {
        id: 'CRD-03',
        titleTr: 'Zırh Çekimi Geleneksel Kebaplar',
        titleEn: 'Hand-Minced Traditional Kebabs',
        titleAr: 'كباب الساطور التقليدي الأصيل',
        subtitleTr: 'Makine değmeden, yalnızca zırhta çekilmiş et ve Urfa isotuyla yoğrulan kebaplar.',
        subtitleEn: 'Never machine-ground; minced exclusively by hand cleaver with Urfa isot.',
        subtitleAr: 'مفروم يدوياً بالساطور بدون آلات مع فلفل أورفا الأصيل.',
        badgeText: 'HALİL USTA',
        iconName: 'award',
        isActive: true,
      },
    ],
  },
  blocks: [
    {
      id: 'BLK-01',
      titleTr: 'Halil Usta’nın Ocakbaşı Sözü: 7 Çeşit Sıcak & Soğuk İkram',
      titleEn: 'Master Halil’s Promise: 7 Complimentary Grill Appetizers',
      titleAr: 'ضيافة الشيف خليل أوسطا: ٧ مقبلات مشوية وطازجة مجاناً لكل طاولة',
      contentTr:
        'Her masamıza siparişinizle birlikte közlenmiş biber, köz domates, sumaklı soğan, ezme, taze nane-roka tabağı ve sıcak tandır lavaşı ücretsiz ikram edilir.',
      contentEn:
        'Every table receives complimentary charred peppers, roasted tomatoes, sumac onions, spicy ezme, fresh herbs, and hot tandoor lavash with every main order.',
      contentAr:
        'تُقدم لكل طاولة ضيافة مجانية تشمل الفلفل والطماطم المشوية، البصل بالسماق، المحمرة الحارة، الخضروات الطازجة وخبز التنور الساخن.',
      badgeText: 'ÜCRETSİZ MASA İKRAMI',
      buttonLabel: 'Menüyü İncele',
      buttonUrl: '#menu',
      position: 'middle',
      isActive: true,
    },
  ],
  gallery: [
    {
      id: 'GAL-01',
      type: 'video',
      titleTr: 'Halil Usta Meşe Közünde Kuzu Ciğer Şiş (Sesli Tanıtım)',
      titleEn: 'Master Halil’s Charcoal Lamb Liver Skewers (Audio Promo)',
      titleAr: 'شواء كبدة الضأن على فحم البلوط مع الشيف خليل (فيديو بالصوت)',
      category: 'Ocakbaşı Video',
      thumbnailUrl: '/assets/aistudio/crops/branded-ocakbasi.jpg',
      mediaUrl: '/videos/ciger-ocakbasi-promo.mp4',
      duration: '00:25',
      isActive: true,
    },
    {
      id: 'GAL-02',
      type: 'photo',
      titleTr: 'ÖzTike Ciğer Şahinbey Aile Salonu & Logolu Ekip Servisi',
      titleEn: 'ÖzTike Ciğer Şahinbey Dining Hall & Branded Hospitality',
      titleAr: 'صالة عائلات أوز تيكه شاهين بيه وضيافة الفريق بالزي الرسمي',
      category: 'Restoran Atmosferi',
      thumbnailUrl: '/assets/aistudio/crops/branded-dining.jpg',
      mediaUrl: '/assets/aistudio/crops/branded-dining.jpg',
      isActive: true,
    },
    {
      id: 'GAL-03',
      type: 'video',
      titleTr: 'ÖzTike Ciğer Şahinbey Salon & Misafirperverlik (Sesli Video)',
      titleEn: 'ÖzTike Ciğer Dining Hall & Hospitality (Audio Promo)',
      titleAr: 'صالة مطعم أوز تيكه وكرم الضيافة (فيديو بالصوت)',
      category: 'Ustalık Video',
      thumbnailUrl: '/assets/aistudio/crops/branded-dining.jpg',
      mediaUrl: '/videos/halil-usta-tanitim.mp4',
      duration: '00:25',
      isActive: true,
    },
    {
      id: 'GAL-07',
      type: 'video',
      titleTr: 'Odun Ateşinde Yaprak Döner & Taş Fırın Lahmacun (Sesli Video)',
      titleEn: 'Wood-Fired Leaf Doner & Stone-Oven Lahmacun (Audio Promo)',
      titleAr: 'شاورما دونر على الحطب ولحم بعجين بالفرن الحجري (فيديو بالصوت)',
      category: 'Lezzet Video',
      thumbnailUrl: '/assets/aistudio/crops/branded-doner-lahmacun.jpg',
      mediaUrl: '/videos/doner-lahmacun-promo.mp4',
      duration: '00:22',
      isActive: true,
    },
    {
      id: 'GAL-04',
      type: 'photo',
      titleTr: 'Odun Ateşi Yaprak Et Döner & Taş Fırın Lahmacun Tezgâhı',
      titleEn: 'Wood-Fired Leaf Doner & Stone-Oven Lahmacun Counter',
      titleAr: 'ركن شاورما الدونر على الحطب والفرن الحجري',
      category: 'Mutfak & Fırın',
      thumbnailUrl: '/assets/aistudio/crops/branded-doner-lahmacun.jpg',
      mediaUrl: '/assets/aistudio/crops/branded-doner-lahmacun.jpg',
      isActive: true,
    },
    {
      id: 'GAL-05',
      type: 'photo',
      titleTr: 'Zırhta Adana & Urfa Kebap Sofrası Sunumu',
      titleEn: 'Hand-Minced Adana & Urfa Kebab Feast Presentation',
      titleAr: 'تقديم مائدة كباب أضنة وأورفا المشوي على الفحم',
      category: 'Lezzet Sunumları',
      thumbnailUrl: '/assets/aistudio/crops/cat-kebap.png',
      mediaUrl: '/assets/aistudio/crops/cat-kebap.png',
      isActive: true,
    },
    {
      id: 'GAL-06',
      type: 'photo',
      titleTr: 'Bakır Ocakbaşı Ateşi & Halil Usta Ustalık Anı',
      titleEn: 'Copper Charcoal Grill & Chef Halil Craft',
      titleAr: 'منقل الفحم النحاسي وإبداع الشيف خليل',
      category: 'Ocakbaşı Atmosferi',
      thumbnailUrl: '/assets/aistudio/crops/branded-ocakbasi.jpg',
      mediaUrl: '/assets/aistudio/crops/branded-ocakbasi.jpg',
      isActive: true,
    },
  ],
  socialMedia: [
    {
      id: 'SOC-01',
      platform: 'Instagram',
      handleOrLabel: '@oztikeciger.halilusta',
      url: 'https://instagram.com/oztikeciger',
      isActive: true,
    },
    {
      id: 'SOC-02',
      platform: 'Facebook',
      handleOrLabel: 'ÖzTike Ciğer Halil Usta',
      url: 'https://facebook.com/oztikeciger',
      isActive: true,
    },
    {
      id: 'SOC-03',
      platform: 'YouTube',
      handleOrLabel: 'ÖzTike Ciğer TV',
      url: 'https://youtube.com/@oztikeciger',
      isActive: true,
    },
    {
      id: 'SOC-04',
      platform: 'TikTok',
      handleOrLabel: '@halilustaciger',
      url: 'https://tiktok.com/@oztikeciger',
      isActive: true,
    },
    {
      id: 'SOC-05',
      platform: 'WhatsApp',
      handleOrLabel: '+90 555 123 45 67',
      url: 'https://wa.me/905551234567',
      isActive: true,
    },
    {
      id: 'SOC-06',
      platform: 'Google Maps',
      handleOrLabel: 'Şahinbey / Gaziantep Yol Tarifi',
      url: 'https://maps.google.com/?q=Sahinbey+Gaziantep',
      isActive: true,
    },
  ],
  contact: {
    phoneDisplay: '0 (555) 123 45 67',
    phoneCallRaw: '+905551234567',
    whatsappRaw: '905551234567',
    whatsappMessageTr: 'Merhaba ÖzTike Ciğer (Şahinbey / Gaziantep), masa rezervasyonu / sipariş hakkında bilgi almak istiyorum.',
    email: 'iletisim@oztikeciger.com.tr',
    addressTr: 'Karagöz Mah. Şahinbey Cad. No: 42 Şahinbey / Gaziantep',
    addressEn: 'Karagöz District, Şahinbey Ave. No: 42, Şahinbey / Gaziantep, Turkey',
    addressAr: 'حي قره غوز، شارع شاهين بيه رقم ٤٢، شاهين بيه / غازي عنتاب، تركيا',
    workingHoursTr: 'Her Gün: 11:00 – 24:00 (Kesintisiz Sıcak Ocakbaşı)',
    workingHoursEn: 'Daily: 11:00 AM – 12:00 AM (Non-Stop Charcoal Grill)',
    workingHoursAr: 'يومياً: ١١:٠٠ صباحاً – ١٢:٠٠ منتصف الليل',
    mapCoordinatesLabel: '37.0662° N, 37.3833° E · Şahinbey / Gaziantep',
  },
  footer: {
    aboutTr: '1996 yılından bu yana Şahinbey / Gaziantep’te köklü ocakbaşı geleneğimizi günlük taze erkek kuzu ciğeri, zırh kebapları ve sıcak misafirperverlikle buluşturuyoruz.',
    aboutEn: 'Bringing deep-rooted charcoal grill heritage to Şahinbey / Gaziantep with daily fresh lamb liver and warm hospitality since 1996.',
    aboutAr: 'نجمع منذ عام ١٩٩٦ في شاهين بيه / غازي عنتاب بين تراث المشويات الأصيل وكبدة الضأن الطازجة والضيافة الدافئة.',
    copyrightTr: '© 2026 ÖzTike Ciğer · Halil Usta · Şahinbey / Gaziantep. Tüm Hakları Saklıdır.',
    copyrightEn: '© 2026 ÖzTike Ciğer · Master Halil · Şahinbey / Gaziantep. All Rights Reserved.',
    copyrightAr: '© ٢٠٢٦ مطعم أوز تيكه للكبدة · الشيف خليل أوسطا · غازي عنتاب. جميع الحقوق محفوظة.',
    showSocialIcons: true,
    showAdminLoginButton: true,
    adminDemoEmail: 'admin@oztikeciger.com',
    adminDemoPassword: 'HalilUsta2026!',
  },
  seo: {
    metaTitleTr: 'ÖzTike Ciğer · Halil Usta | Şahinbey Gaziantep Ciğer & Kebap',
    metaTitleEn: 'ÖzTike Ciğer · Master Halil | Authentic Charcoal Lamb Liver & Kebab in Gaziantep',
    metaTitleAr: 'مطعم أوز تيكه للكبدة · الشيف خليل أوسطا | غازي عنتاب',
    metaDescriptionTr:
      '1996’dan beri Şahinbey / Gaziantep’te meşe közünde günlük taze kuzu ciğeri, zırh kebapları, taş fırın lahmacun ve online sipariş sistemi.',
    metaDescriptionEn:
      'Serving daily fresh lamb liver skewers over oak charcoal, hand-minced kebabs, and stone-oven lahmacun in Şahinbey / Gaziantep since 1996.',
    metaDescriptionAr:
      'منذ عام ١٩٩٦ في شاهين بيه / غازي عنتاب نقدم كبدة الضأن الطازجة على فحم البلوط والكباب ولحم بعجين بالفرن الحجري.',
    keywords:
      'öztike ciğer, halil usta, şahinbey ciğer, gaziantep ciğer kebap, zırh kebabı, taş fırın lahmacun, yaprak döner, gaziantep ocakbaşı, online sipariş',
    canonicalUrl: 'https://oztikeciger.com.tr',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1',
    ogImageUrl: '/assets/aistudio/crops/branded-ocakbasi.jpg',
    ogImageAlt: 'ÖzTike Ciğer Halil Usta Meşe Közünde Ocakbaşı Sunumu',
    twitterCard: 'summary_large_image',
    schemaType: 'Restaurant',
    servesCuisine: 'Turkish, Gaziantep Ocakbaşı, Ciğer & Kebap',
    priceRange: '₺₺',
    openingHoursSpec: 'Mo-Su 11:00-24:00',
    telephone: '+905551234567',
    postalCode: '27010',
    acceptsReservations: true,
    ratingValue: 4.9,
    reviewCount: 1248,
    hreflangEnabled: true,
    author: 'Halil Usta · ÖzTike Ciğer Gastronomi Ekibi',
    publisher: 'ÖzTike Ciğer Ocakbaşı Turizm Gıda Ltd. Şti.',
    copyright: '© 2026 ÖzTike Ciğer · Halil Usta · Şahinbey / Gaziantep. Tüm Hakları Saklıdır.',
    geoRegion: 'TR-27',
    geoPlacename: 'Şahinbey, Gaziantep',
    geoPosition: '37.0628;37.3795',
    twitterSite: '@oztikeciger',
    googleVerification: 'oztike-gsc-tr27-sahinbey-2026',
    bingVerification: 'oztike-bing-tr27-2026',
    yandexVerification: 'oztike-yandex-tr27-2026',
    robotsTxt: `User-agent: *\nAllow: /\nDisallow: /?portal=admin\nDisallow: /pos\nDisallow: /kds\n\nSitemap: https://oztikeciger.com.tr/sitemap.xml`,
    sitemapXml: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://oztikeciger.com.tr/</loc><priority>1.0</priority></url>\n  <url><loc>https://oztikeciger.com.tr/#menu</loc><priority>0.9</priority></url>\n  <url><loc>https://oztikeciger.com.tr/#galeri</loc><priority>0.8</priority></url>\n  <url><loc>https://oztikeciger.com.tr/#kampanyalar</loc><priority>0.8</priority></url>\n  <url><loc>https://oztikeciger.com.tr/#konum</loc><priority>0.8</priority></url>\n</urlset>`,
    llmsTxt: `# ÖzTike Ciğer · Halil Usta (Şahinbey / Gaziantep)\n> 1996'dan beri günlük taze erkek kuzu ciğeri, zırh kıyma kebap, tavuk şiş, yaprak döner ve taş fırın lahmacun.\n- Adres: Karagöz Mah. Şahinbey Cad. No: 42 Şahinbey / Gaziantep\n- Telefon: 0 (555) 123 45 67\n- Çalışma Saatleri: 11:00 - 24:00\n- Kategoriler: Ciğer, Kebap, Tavuk, Döner, Lahmacun, Yeşillikler & Salatalar, İçecekler`,
  },
  generalSettings: {
    companyLegalName: 'ÖzTike Ciğer Ocakbaşı Turizm Gıda Ltd. Şti.',
    taxOfficeAndNo: 'Şahinbey V.D. · 6840912345',
    defaultLanguage: 'tr',
    timezone: 'Europe/Istanbul (UTC+3)',
    currencySymbol: '₺',
    taxRatePercent: 10,
    courierDeliveryFee: 35,
    serviceFeePercent: 0,
    minDeliveryOrderAmount: 250,
    deliveryRadiusKm: 12,
    defaultPrepMinutes: 14,
    autoAcceptQrOrders: true,
    maintenanceMode: false,
    maintenanceMessageTr: 'Sistemimiz kısa süreli bakım çalışması nedeniyle güncellenmektedir. Lütfen masadaki garsonumuzdan destek alınız.',
    smtpHost: 'mail.oztikeciger.com.tr',
    notificationEmail: 'siparis@oztikeciger.com.tr',
    sessionTimeoutMinutes: 120,
    requireTwoFactorForAdmin: true,
  },
  receiptSettings: {
    companyName: 'ÖZTİKE CİĞER · HALİL USTA',
    legalName: 'ÖzTike Ciğer Ocakbaşı Turizm Gıda Ltd. Şti.',
    address: 'Karagöz Mah. Şahinbey Cad. No: 42 Şahinbey / Gaziantep',
    phone: '0 (555) 123 45 67',
    taxOfficeAndNo: 'Şahinbey V.D. · VKN: 6840912345',
    stampTitle: 'ÖZTİKE CİĞER · KAŞE / İMZA',
    stampSubtitle: 'Halil Usta · Şahinbey / Gaziantep · MERSİS: 0684091234500014',
    headerNote: '1996’dan Beri Meşe Közünde Taze Kuzu Ciğeri',
    footerMessage: 'Afiyet Olsun · Bizi Tercih Ettiğiniz İçin Teşekkür Ederiz!',
    paperWidthMm: 80,
    showLogo: true,
    showStampBox: true,
    templatePreset: 'gaziantep-heritage',
    accentColor: '#B86B35',
    fontFamily: 'mono',
    borderStyle: 'dashed',
    showQrCode: true,
    qrCodeUrl: 'https://oztikeciger.com.tr/#menu',
    showBarcode: true,
    showTaxBreakdown: true,
    showWaiterAndTable: true,
    showWifiInfo: true,
    wifiSsid: 'OzTike_Misafir_5G',
    wifiPassword: 'halilusta1996',
    socialHandle: '@oztikeciger · oztikeciger.com.tr',
  },
  pwaSettings: {
    enabled: true,
    appName: 'ÖzTike Ciğer · Halil Usta',
    shortName: 'ÖzTike Ciğer',
    description: 'Şahinbey Gaziantep meşe közünde kuzu ciğer şiş, kebap ve hızlı sipariş uygulaması.',
    themeColor: '#D4A359',
    backgroundColor: '#120806',
    accentColor: '#B86B35',
    splashTextColor: '#FFF7EB',
    buttonColor: '#D4A359',
    appCategory: 'food',
    displayMode: 'standalone',
    orientation: 'portrait',
    iconUrl: '/assets/aistudio/oztike-logo-transparent.png',
    maskableIconUrl: '/pwa-maskable-512x512.png',
    splashImageUrl: '/assets/aistudio/crops/hero-ciger.png',
    splashVideoUrl: '/videos/ciger-ocakbasi-promo.mp4',
    splashTitleTr: 'ÖzTike Ciğer · Halil Usta',
    splashSubtitleTr: '1996’dan Beri Meşe Közünde Gerçek Lezzet',
    pushTitleTr: 'Siparişiniz Meşe Közünden Çıktı!',
    pushBodyTr: 'Sıcak tandır lavaşı ve 7 çeşit köz meze eşliğinde servis için hazır.',
    pushBadgeUrl: '/pwa-192x192.png',
    pushVibratePattern: '200,100,200',
    statusBarStyle: 'black-translucent',
    startUrl: '/',
    scope: '/',
    cacheStrategy: 'NetworkFirst',
    installButtonLabelTr: 'Uygulamayı Cihaza Yükle (PWA)',
    iosHintTr: 'iOS Safari’de Paylaş -> Ana Ekrana Ekle adımı ile kurabilirsiniz.',
    offlineTitleTr: 'Çevrimdışı Mod Aktif',
    offlineTextTr: 'Bağlantı kesildi — Menü önbellekten görüntüleniyor.',
    enableOfflineCache: true,
    enablePushNotifications: true,
    showHeaderInstallBtn: true,
    showFooterCard: true,
    screenshots: [
      '/assets/aistudio/crops/branded-ocakbasi.jpg',
      '/assets/aistudio/crops/branded-dining.jpg',
    ],
    shortcuts: [
      {
        name: 'Menüye Git',
        shortName: 'Menü',
        url: '/#menu',
        description: 'Güncel ciğer ve kebap menüsünü görüntüle',
      },
      {
        name: 'Kampanyalar',
        shortName: 'Fırsatlar',
        url: '/#kampanyalar',
        description: 'Aktif kupon ve fırsatları incele',
      },
    ],
  },
  promoPopup: {
    enabled: false,
    titleTr: 'Öğle Saatlerinde Ciğer & Kebap Keyfi %15 İndirimli!',
    titleEn: '15% Off Charcoal Lamb Liver & Kebabs Today!',
    titleAr: 'خصم ١٥٪ على الكبدة المشوية والكباب اليوم!',
    bodyTr: 'Sepetinizde OGLECIGER15 kodunu kullanın, 7 çeşit köz meze ve sıcak tandır lavaşı ikramımızla hemen sipariş verin.',
    bodyEn: 'Apply coupon OGLECIGER15 in your cart and enjoy complimentary hot tandoor lavash & 7 grilled mezzes.',
    bodyAr: 'استخدم كود OGLECIGER15 في سلتك واستمتع بـ ٧ مقبلات وخبز التنور مجاناً.',
    badgeText: 'GÜNÜN FIRSATI',
    couponCode: 'OGLECIGER15',
    ctaLabelTr: 'Kuponu Uygula & Siparişe Geç',
    ctaUrl: '#menu',
    imageUrl: '/assets/aistudio/crops/branded-ocakbasi.jpg',
    videoUrl: '',
    bgColor: '#180B08',
    textColor: '#FFF6E9',
    accentColor: '#D4A359',
    triggerType: 'delay',
    delaySeconds: 3,
    autoCloseSeconds: 0,
    dismissible: true,
    showOncePerSession: true,
  },
  paymentMethodsV2Migrated: true,
  paymentMethods: [
    {
      id: 'PM-CASH',
      name: 'Kasada / Masada Nakit',
      code: 'cash',
      type: 'cash',
      commissionPercent: 0,
      isActive: true,
      allowOnCustomerPortal: true,
      allowPayNow: false,
      description: 'Kasada, masada veya kapıda nakit tahsilat',
    },
    {
      id: 'PM-POS-CARD',
      name: 'POS Cihazı ile Kart',
      code: 'pos_card',
      type: 'pos',
      commissionPercent: 1.85,
      isActive: true,
      allowOnCustomerPortal: true,
      allowPayNow: false,
      description: 'Kasa veya mobil POS cihazı ile temassız kredi / banka kartı ödemesi',
    },
    {
      id: 'PM-FAST-TRANSFER',
      name: 'Havale / EFT (IBAN)',
      code: 'transfer',
      type: 'transfer',
      commissionPercent: 0,
      isActive: true,
      allowOnCustomerPortal: true,
      allowPayNow: false,
      description: 'TR42 0006 2000 0000 0199 6019 96 · ÖzTike Ciğer Gıda Ltd. Şti. (Ziraat Bankası)',
    },
    {
      id: 'PM-ONLINE-CARD',
      name: 'Online Kart (iyzico / PayTR)',
      code: 'online_card',
      type: 'online_card',
      commissionPercent: 2.15,
      isActive: true,
      allowOnCustomerPortal: false,
      allowPayNow: true,
      description: '3D Secure güvenlikli anlık sanal POS ödemesi (Admin panelden açılabilir)',
    },
    {
      id: 'PM-MEAL-CARD',
      name: 'Yemek Kartı (Sodexo/Multinet)',
      code: 'meal_card',
      type: 'meal_card',
      commissionPercent: 4.5,
      isActive: true,
      allowOnCustomerPortal: false,
      allowPayNow: false,
      description: 'Multinet, Sodexo, Ticket ve Setcard ödemeleri',
    },
    {
      id: 'PM-WALLET',
      name: 'Dijital Cüzdan / Apple & Google Pay (Online)',
      code: 'wallet',
      type: 'wallet',
      commissionPercent: 1.9,
      isActive: true,
      allowOnCustomerPortal: false,
      allowPayNow: true,
      description: 'Tek dokunuşla dijital cüzdan ödemesi',
    },
  ],
  reservationSettings: {
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
  },
  mapSettings: {
    enabled: true,
    showFooterMap: true,
    providerMode: 'free',
    freeProvider: 'google-embed-free',
    paidProvider: 'google-js-api',
    paidApiKey: '',
    customEmbedUrl: '',
    placeName: 'ÖzTike Ciğer · Halil Usta (Şahinbey Merkez)',
    addressLine: 'Karagöz Mah. Şahinbey Cad. No: 42 Şahinbey / Gaziantep',
    lat: 37.0628,
    lng: 37.3795,
    zoom: 16,
    enableGoogleMapsJs: true,
    enableGoogleNav: true,
    enableAppleMaps: true,
    enableYandexMaps: true,
    enableWaze: true,
    enableOpenStreetMap: true,
    enableBingMaps: true,
  },
  operationalSettings: {
    kitchenModuleEnabled: false,
    tableSelectionEnabled: false,
    orderTrackingEnabled: false,
    qrRequireScan: false,
    qrRateLimitPerMin: 20,
    kdsAlertMinutes: 14,
    kdsActiveStations: ['Izgara', 'Tavuk', 'Soğuk mutfak', 'İçecek', 'Paketleme'],
    kdsSoundAlert: true,
    kdsAutoBumpCompleted: false,
    posDefaultMethod: 'card',
    posAutoReceiptPrint: true,
  },
  modules: {
    aiAssistantEnabled: true,
    gallerySectionEnabled: true,
    campaignsSectionEnabled: true,
    socialMediaBarEnabled: true,
    showcaseCardsEnabled: true,
    liveNotificationSound: true,
    widgets: [
      {
        id: 'WDG-01',
        name: 'Ücretsiz Yapay Zekâ Lezzet Asistanı (8 Dil)',
        category: 'Eklenti',
        description: 'Müşterilere 8 dilde menü, salata, içecek ve sipariş öneren akıllı AI asistanı',
        isActive: true,
        version: '3.2.0',
        placement: 'global',
        settings: {
          autoOpenWelcome: false,
          suggestBeverages: true,
          tone: 'Samimi Gaziantep Misafirperverliği',
          maxSuggestions: 4,
        },
      },
      {
        id: 'WDG-02',
        name: '8 Dilli Çoklu Dil Motoru (TR/EN/AR/FR/DE/KU/JA/ZH)',
        category: 'Modül',
        description: 'Header dil seçici ile tüm sistemi anında 8 farklı dile çevirir (AR & KU RTL uyumlu)',
        isActive: true,
        version: '2.5.0',
        placement: 'header',
        settings: {
          defaultLang: 'tr',
          enableRtlAuto: true,
          persistInStorage: true,
        },
      },
      {
        id: 'WDG-03',
        name: 'Fotoğraf & 4K Video Galeri Lightbox Modülü',
        category: 'Bileşen',
        description: 'Hem müşteri vitrininde hem adminde resimli ve videolu galeri yönetimi',
        isActive: true,
        version: '1.8.0',
        placement: 'menu',
        settings: {
          autoplayMutedVideo: true,
          columnsDesktop: 3,
          showDurationBadge: true,
        },
      },
      {
        id: 'WDG-04',
        name: 'Canlı Sesli Bildirim & Web Push Motoru',
        category: 'Modül',
        description: 'Sipariş, garson çağrısı ve masa durumları için sesli ve görsel bildirim merkezi',
        isActive: true,
        version: '2.2.0',
        placement: 'global',
        settings: {
          soundVolumePercent: 80,
          enableBrowserPush: true,
          toastDurationMs: 5000,
        },
      },
    ],
  },
};

const EXTRA_SLIDE_TRANSLATIONS: Record<string, Record<string, { title: string; subtitle: string; badge: string }>> = {
  'SLD-01': {
    fr: { title: 'Le Vrai Foie Grillé Exige du Savoir-Faire.', subtitle: 'La recette signature de Maître Halil depuis 1996 : foie d’agneau frais et kebabs hachés à la main.', badge: 'Grillade au Charbon de Chêne' },
    de: { title: 'Echte Lammleber Verlangt Wahre Meisterschaft.', subtitle: 'Meister Halils Originalrezept seit 1996: täglich frische Lammleber-Spieße und handgehackter Kebab.', badge: 'Traditioneller Holzkohlegrill' },
    ku: { title: 'Cîgera Rastîn Hostetiyê Dixwaze.', subtitle: 'Bi terîfa hoste Xelîl a ji sala 1996’an vir ve: şîşa cîgera berxê ya teze û kebaba zîrhê.', badge: 'Tam û Çêja Şahînbey / Dîlokê' },
    ja: { title: '本物の子羊レバー串には熟練の技が宿る。', subtitle: '1996年創業ハリル名人の伝統レシピ。毎日新鮮な子羊レバーと手切りケバブを楢炭火で。', badge: '伝統の炭火オジャクバシュ' },
    zh: { title: '地道炭烤羊肝，传承匠心技艺。', subtitle: '自1996年起哈利尔师傅秘制配方：每日新鲜羊肝串与手工剁肉烤串。', badge: '加济安泰普传统炭火烤肉' },
  },
  'SLD-02': {
    fr: { title: 'Kebab au Couteau & Lahmacun au Four en Pierre', subtitle: 'Servi avec pain tandoor chaud, salade Gavurdağı aux noix et Ayran mousseux en cuivre.', badge: 'Viande 100% Fraîche' },
    de: { title: 'Handgehackter Kebab & Steinofen-Lahmacun', subtitle: 'Mit heißem Tandoor-Brot, Walnuss-Gavurdağı-Salat und schaumigem Kupfer-Ayran.', badge: '100% Täglich Frischfleisch' },
    ku: { title: 'Kebaba Zîrhê & Lahmacuna Firna Kevirîn', subtitle: 'Bi nanê tendûrê yê germ, seleteya Gavurdagi ya bi gûz û dewê meşqê yê bi kef.', badge: '%100 Goştê Teze yê Rojane' },
    ja: { title: '手切りケバブ＆石窯ラフマジュン', subtitle: '焼きたてタンドールパン、クルミ入りガヴルダーサラダ、銅カップのアイランを添えて。', badge: '毎日仕入れる100%新鮮肉' },
    zh: { title: '手工剁肉烤串与石炉脆薄饼', subtitle: '搭配现烤薄饼、核桃石榴汁沙拉及铜杯现打泡沫酸奶。', badge: '100% 每日新鲜食材' },
  },
  'SLD-03': {
    fr: { title: 'Doner au Feu de Bois & Poulet Grillé au Charbon', subtitle: 'Scannez le QR code de votre table pour envoyer votre commande personnalisée en cuisine.', badge: 'Service QR Rapide' },
    de: { title: 'Holzfeuer-Blattdöner & Holzkohle-Hähnchen', subtitle: 'Scannen Sie den QR-Code am Tisch und bestellen Sie direkt in Sekundenschnelle.', badge: 'Schneller QR-Tischservice' },
    ku: { title: 'Donera Agirê Darîn & Mirîşka Birajî', subtitle: 'Koda QR a li ser maseya xwe bixwînin û di çend saniyan de fermanê bidin metbexê.', badge: 'Xizmeta Lezgîn a QR' },
    ja: { title: '薪焼きリーフドネル＆炭火チキン串', subtitle: 'テーブルのQRコードを読み取るだけで、お好みのカスタマイズ注文をキッチンへ直送信。', badge: 'スピーディQRテーブル注文' },
    zh: { title: '木火纯肉烤肉与炭烤鸡肉串', subtitle: '扫描餐桌二维码，几秒钟内将个性化点单直达厨房。', badge: '极速QR桌边点餐服务' },
  },
};

export function getSlideByLang(slide: HeroSlideItem, lang: SupportedLang) {
  if (lang === 'en') {
    return {
      title: slide.titleEn || slide.titleTr,
      subtitle: slide.subtitleEn || slide.subtitleTr,
      badge: slide.badgeEn || slide.badgeTr,
    };
  }
  if (lang === 'ar') {
    return {
      title: slide.titleAr || slide.titleTr,
      subtitle: slide.subtitleAr || slide.subtitleTr,
      badge: slide.badgeAr || slide.badgeTr,
    };
  }
  const extra = EXTRA_SLIDE_TRANSLATIONS[slide.id]?.[lang];
  if (extra) return extra;
  return {
    title: lang === 'tr' ? slide.titleTr : (slide.titleEn || slide.titleTr),
    subtitle: lang === 'tr' ? slide.subtitleTr : (slide.subtitleEn || slide.subtitleTr),
    badge: lang === 'tr' ? slide.badgeTr : (slide.badgeEn || slide.badgeTr),
  };
}

export function getGalleryTitleByLang(item: GalleryMediaItem, lang: SupportedLang): string {
  if (lang === 'tr') return item.titleTr;
  if (lang === 'ar') return item.titleAr || item.titleTr;
  return item.titleEn || item.titleTr;
}

export function getBlockByLang(block: CustomBlockItem, lang: SupportedLang) {
  if (lang === 'tr') {
    return { title: block.titleTr, content: block.contentTr };
  }
  if (lang === 'ar') {
    return { title: block.titleAr || block.titleTr, content: block.contentAr || block.contentTr };
  }
  return {
    title: block.titleEn || block.titleTr,
    content: block.contentEn || block.contentTr,
  };
}

const EXTRA_NAV_LABELS: Record<string, Record<string, string>> = {
  fr: { Menu: 'Menu', 'Photo & Video Gallery': 'Galerie Photo & Vidéo', Campaigns: 'Offres', Contact: 'Contact' },
  de: { Menu: 'Speisekarte', 'Photo & Video Gallery': 'Foto- & Videogalerie', Campaigns: 'Angebote', Contact: 'Kontakt' },
  ku: { Menu: 'Menû', 'Photo & Video Gallery': 'Galerî (Wêne & Vîdeo)', Campaigns: 'Kampanya', Contact: 'Têkilî' },
  ja: { Menu: 'メニュー', 'Photo & Video Gallery': '写真・動画ギャラリー', Campaigns: 'キャンペーン', Contact: 'アクセス・連絡先' },
  zh: { Menu: '菜单', 'Photo & Video Gallery': '图文视频画廊', Campaigns: '优惠活动', Contact: '联系我们' },
};

export function getNavLabelByLang(item: NavMenuItem, lang: SupportedLang): string {
  if (lang === 'tr') return item.labelTr;
  if (lang === 'ar') return item.labelAr || item.labelTr;
  if (lang === 'en') return item.labelEn || item.labelTr;
  return EXTRA_NAV_LABELS[lang]?.[item.labelEn] || item.labelEn || item.labelTr;
}

export function getShowcaseCardByLang(card: ShowcaseCardItem, lang: SupportedLang) {
  if (lang === 'tr') {
    return { title: card.titleTr, subtitle: card.subtitleTr };
  }
  if (lang === 'ar') {
    return { title: card.titleAr || card.titleTr, subtitle: card.subtitleAr || card.subtitleTr };
  }
  return {
    title: card.titleEn || card.titleTr,
    subtitle: card.subtitleEn || card.subtitleTr,
  };
}
