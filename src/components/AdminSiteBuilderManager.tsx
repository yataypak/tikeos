import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Image as ImageIcon,
  Film,
  Sliders,
  Layout,
  Palette,
  Share2,
  Globe,
  Sparkles,
  Phone,
  Layers,
  Megaphone,
  Menu as MenuIcon,
  FileText,
  Settings,
  ArrowUp,
  ArrowDown,
  Download,
  RotateCcw,
  Check,
  Shield,
  Mail,
  Truck,
  Building2,
  Eye,
} from 'lucide-react';
import {
  INITIAL_SITE_CMS_CONFIG,
  type SiteCmsConfig,
  type HeroSlideItem,
  type GalleryMediaItem,
  type SocialMediaLinkItem,
  type CustomBlockItem,
  type CustomPluginWidgetItem,
  type NavMenuItem,
  type LogoPresetItem,
  type ShowcaseCardItem,
} from '../data/siteCmsStore';
import type { CMSPageItem } from '../data/initialStoreData';
import { SUPPORTED_LANGUAGES, type SupportedLang } from '../i18n/translations';

export type SiteBuilderTabId =
  | 'announcement_header_logo'
  | 'menus_pages'
  | 'slider_cards_blocks_theme'
  | 'gallery_only'
  | 'social_footer'
  | 'seo_only'
  | 'modules_only'
  | 'general_only'
  | 'gallery_social_footer'
  | 'seo_modules_general';

interface AdminSiteBuilderManagerProps {
  siteCmsConfig: SiteCmsConfig;
  onUpdateSiteCmsConfig: React.Dispatch<React.SetStateAction<SiteCmsConfig>>;
  onNotify: (msg: string) => void;
  cmsPages?: CMSPageItem[];
  onAddCmsPage?: (page: Omit<CMSPageItem, 'id' | 'updatedAt'>) => void;
  onUpdateCmsPage?: (page: CMSPageItem) => void;
  onDeleteCmsPage?: (id: string) => void;
  defaultTab?: SiteBuilderTabId;
  singleSectionMode?: boolean;
}

export const AdminSiteBuilderManager: React.FC<AdminSiteBuilderManagerProps> = ({
  siteCmsConfig,
  onUpdateSiteCmsConfig,
  onNotify,
  cmsPages = [],
  onAddCmsPage,
  onUpdateCmsPage,
  onDeleteCmsPage,
  defaultTab = 'announcement_header_logo',
  singleSectionMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<SiteBuilderTabId>(defaultTab);
  const [settingsSubTab, setSettingsSubTab] = useState<'business' | 'orders' | 'notifications' | 'security'>('business');

  // Logo Preset Form
  const [logoPresetName, setLogoPresetName] = useState('');
  const [logoPresetUrl, setLogoPresetUrl] = useState('');

  // Nav Menu Form
  const [navLabelTr, setNavLabelTr] = useState('');
  const [navLabelEn, setNavLabelEn] = useState('');
  const [navLabelAr, setNavLabelAr] = useState('');
  const [navUrl, setNavUrl] = useState('#menu');
  const [navImageUrl, setNavImageUrl] = useState('');
  const [navImageUrls, setNavImageUrls] = useState<string[]>([]);
  const [navLocation, setNavLocation] = useState<NavMenuItem['location']>('both');
  const [navNewTab, setNavNewTab] = useState(false);
  const [editingNavId, setEditingNavId] = useState<string | null>(null);

  // CMS Page Form (Add / Edit + Canlı İçerik Editörü)
  const [pgTitle, setPgTitle] = useState(() => cmsPages[0]?.title || '');
  const [pgSubtitle, setPgSubtitle] = useState(() => cmsPages[0]?.subtitle || '');
  const [pgSlug, setPgSlug] = useState(() => cmsPages[0]?.slug || '');
  const [pgImageUrl, setPgImageUrl] = useState(
    () => cmsPages[0]?.imageUrl || '/assets/aistudio/crops/hero-ciger.png'
  );
  const [pgImageUrls, setPgImageUrls] = useState<string[]>(
    () => cmsPages[0]?.imageUrls || (cmsPages[0]?.imageUrl ? [cmsPages[0].imageUrl] : ['/assets/aistudio/crops/hero-ciger.png'])
  );
  const [pgContent, setPgContent] = useState(() => cmsPages[0]?.content || '');
  const [pgSeoTitle, setPgSeoTitle] = useState(() => cmsPages[0]?.seoTitle || '');
  const [pgMetaDesc, setPgMetaDesc] = useState(() => cmsPages[0]?.metaDescription || '');
  const [pgStatus, setPgStatus] = useState<CMSPageItem['status']>(
    () => cmsPages[0]?.status || 'Yayında'
  );
  const [pgShowInHeader, setPgShowInHeader] = useState(() => Boolean(cmsPages[0]?.showInHeader));
  const [pgShowInFooter, setPgShowInFooter] = useState(
    () => cmsPages[0]?.showInFooter !== false
  );
  const [editingPageId, setEditingPageId] = useState<string | null>(
    () => cmsPages[0]?.id || null
  );

  const handleMultiImageUpload = (
    files: FileList | null,
    onDone: (dataUrls: string[]) => void
  ) => {
    if (!files || files.length === 0) return;
    const readers = Array.from(files).map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ''));
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((results) => {
      const valid = results.filter(Boolean);
      if (valid.length > 0) onDone(valid);
    });
  };

  const loadPageIntoLiveEditor = (pg: CMSPageItem) => {
    setEditingPageId(pg.id);
    setPgTitle(pg.title);
    setPgSubtitle(pg.subtitle || '');
    setPgSlug(pg.slug);
    const primary = pg.imageUrl || '/assets/aistudio/crops/hero-ciger.png';
    setPgImageUrl(primary);
    setPgImageUrls(pg.imageUrls && pg.imageUrls.length > 0 ? pg.imageUrls : [primary]);
    setPgContent(pg.content || '');
    setPgSeoTitle(pg.seoTitle);
    setPgMetaDesc(pg.metaDescription);
    setPgStatus(pg.status);
    setPgShowInHeader(Boolean(pg.showInHeader));
    setPgShowInFooter(pg.showInFooter !== false);
  };

  // Slider Form
  const [slideTitleTr, setSlideTitleTr] = useState('');
  const [slideTitleEn, setSlideTitleEn] = useState('');
  const [slideTitleAr, setSlideTitleAr] = useState('');
  const [slideSubTr, setSlideSubTr] = useState('');
  const [slideBadgeTr, setSlideBadgeTr] = useState('Özel Sunum');
  const [slideImageUrl, setSlideImageUrl] = useState('/assets/aistudio/crops/hero-ciger.png');
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);

  // Showcase Card Form
  const [cardTitleTr, setCardTitleTr] = useState('');
  const [cardTitleEn, setCardTitleEn] = useState('');
  const [cardSubTr, setCardSubTr] = useState('');
  const [cardBadge, setCardBadge] = useState('USTALIK');
  const [cardIcon, setCardIcon] = useState<ShowcaseCardItem['iconName']>('flame');
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  // Block Form
  const [blockTitleTr, setBlockTitleTr] = useState('');
  const [blockContentTr, setBlockContentTr] = useState('');
  const [blockBadge, setBlockBadge] = useState('ÖZEL BLOK');
  const [blockBtnLabel, setBlockBtnLabel] = useState('Menüyü İncele');
  const [blockBtnUrl, setBlockBtnUrl] = useState('#menu');
  const [blockPosition, setBlockPosition] = useState<CustomBlockItem['position']>('middle');
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  // Gallery Form
  const [galType, setGalType] = useState<'photo' | 'video'>('photo');
  const [galTitleTr, setGalTitleTr] = useState('');
  const [galTitleEn, setGalTitleEn] = useState('');
  const [galTitleAr, setGalTitleAr] = useState('');
  const [galCategory, setGalCategory] = useState('Ocakbaşı & Sunum');
  const [galThumbUrl, setGalThumbUrl] = useState('/assets/aistudio/crops/gallery-1.png');
  const [galMediaUrl, setGalMediaUrl] = useState('/assets/aistudio/crops/gallery-1.png');
  const [galDuration, setGalDuration] = useState('00:40');
  const [editingGalId, setEditingGalId] = useState<string | null>(null);

  // Social Media Form
  const [socPlatform, setSocPlatform] = useState<SocialMediaLinkItem['platform']>('Instagram');
  const [socHandle, setSocHandle] = useState('');
  const [socUrl, setSocUrl] = useState('');
  const [editingSocId, setEditingSocId] = useState<string | null>(null);

  // Widget / Module Form
  const [wdgName, setWdgName] = useState('');
  const [wdgCategory, setWdgCategory] = useState<CustomPluginWidgetItem['category']>('Bileşen');
  const [wdgDesc, setWdgDesc] = useState('');
  const [editingWdgId, setEditingWdgId] = useState<string | null>(null);

  // Logo Preset Ekle
  const handleAddLogoPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoPresetName.trim() || !logoPresetUrl.trim()) return;
    const newPreset: LogoPresetItem = {
      id: `LOGO-${Date.now().toString().slice(-4)}`,
      name: logoPresetName.trim(),
      url: logoPresetUrl.trim(),
      isActive: true,
    };
    onUpdateSiteCmsConfig((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        logoUrl: newPreset.url,
        logoPresets: [
          ...prev.header.logoPresets.map((p) => ({ ...p, isActive: false })),
          newPreset,
        ],
      },
    }));
    setLogoPresetName('');
    setLogoPresetUrl('');
    onNotify('Yeni logo eklendi ve aktif logo olarak seçildi.');
  };

  // Nav Menu Ekle / Güncelle
  const handleSaveNavMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!navLabelTr.trim() || !navUrl.trim()) return;
    const primaryNavImg = navImageUrl.trim() || navImageUrls[0] || undefined;
    const mergedNavImages =
      navImageUrls.length > 0
        ? navImageUrls
        : primaryNavImg
        ? [primaryNavImg]
        : undefined;
    if (editingNavId) {
      onUpdateSiteCmsConfig((prev) => ({
        ...prev,
        header: {
          ...prev.header,
          navMenus: prev.header.navMenus.map((m) =>
            m.id === editingNavId
              ? {
                  ...m,
                  labelTr: navLabelTr.trim(),
                  labelEn: navLabelEn.trim() || navLabelTr.trim(),
                  labelAr: navLabelAr.trim() || navLabelTr.trim(),
                  url: navUrl.trim(),
                  imageUrl: primaryNavImg,
                  imageUrls: mergedNavImages,
                  location: navLocation,
                  openInNewTab: navNewTab,
                }
              : m
          ),
        },
      }));
      setEditingNavId(null);
      onNotify('Menü öğesi güncellendi.');
    } else {
      const newNav: NavMenuItem = {
        id: `NAV-${Date.now().toString().slice(-4)}`,
        labelTr: navLabelTr.trim(),
        labelEn: navLabelEn.trim() || navLabelTr.trim(),
        labelAr: navLabelAr.trim() || navLabelTr.trim(),
        url: navUrl.trim(),
        imageUrl: primaryNavImg,
        imageUrls: mergedNavImages,
        location: navLocation,
        openInNewTab: navNewTab,
        isActive: true,
      };
      onUpdateSiteCmsConfig((prev) => ({
        ...prev,
        header: {
          ...prev.header,
          navMenus: [...prev.header.navMenus, newNav],
        },
      }));
      onNotify('Yeni menü bağlantısı eklendi.');
    }
    setNavLabelTr('');
    setNavLabelEn('');
    setNavLabelAr('');
    setNavUrl('#menu');
    setNavImageUrl('');
    setNavImageUrls([]);
    setNavNewTab(false);
  };

  const handleMoveNav = (idx: number, dir: -1 | 1) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= siteCmsConfig.header.navMenus.length) return;
    onUpdateSiteCmsConfig((prev) => {
      const next = [...prev.header.navMenus];
      const [moved] = next.splice(idx, 1);
      next.splice(targetIdx, 0, moved);
      return { ...prev, header: { ...prev.header, navMenus: next } };
    });
  };

  // CMS Sayfa Ekle / Güncelle
  const handleSaveCmsPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pgTitle.trim() || !pgSlug.trim()) return;
    const normalizedSlug = pgSlug.startsWith('/') ? pgSlug.trim() : `/${pgSlug.trim()}`;
    const primaryPgImg = pgImageUrl.trim() || pgImageUrls[0] || '/assets/aistudio/crops/hero-ciger.png';
    const mergedPgImgs = Array.from(new Set([primaryPgImg, ...pgImageUrls].filter(Boolean)));
    if (editingPageId && onUpdateCmsPage) {
      const existing = cmsPages.find((p) => p.id === editingPageId);
      if (existing) {
        onUpdateCmsPage({
          ...existing,
          title: pgTitle.trim(),
          subtitle: pgSubtitle.trim() || undefined,
          slug: normalizedSlug,
          imageUrl: primaryPgImg,
          imageUrls: mergedPgImgs,
          content: pgContent.trim(),
          status: pgStatus,
          seoTitle: pgSeoTitle.trim() || `${pgTitle.trim()} | ÖzTike Ciğer`,
          metaDescription: pgMetaDesc.trim() || existing.metaDescription,
          canonical: `https://oztikeciger.com.tr${normalizedSlug}`,
          showInHeader: pgShowInHeader,
          showInFooter: pgShowInFooter,
          updatedAt: new Date().toISOString().slice(0, 10),
        });
        onNotify(`${pgTitle.trim()} sayfası canlı içerik editöründen güncellendi.`);
      }
    } else if (onAddCmsPage) {
      onAddCmsPage({
        title: pgTitle.trim(),
        subtitle: pgSubtitle.trim() || undefined,
        slug: normalizedSlug,
        imageUrl: primaryPgImg,
        imageUrls: mergedPgImgs,
        content:
          pgContent.trim() ||
          `${pgTitle.trim()} sayfası ÖzTike Ciğer – Halil Usta yönetim panelinden oluşturulmuştur.`,
        status: pgStatus,
        seoTitle: pgSeoTitle.trim() || `${pgTitle.trim()} | ÖzTike Ciğer`,
        metaDescription:
          pgMetaDesc.trim() || `${pgTitle.trim()} hakkında detaylı bilgi ve kurumsal sayfa.`,
        canonical: `https://oztikeciger.com.tr${normalizedSlug}`,
        robots: 'index, follow',
        schemaType: 'WebPage',
        requiresLegalReview: false,
        showInHeader: pgShowInHeader,
        showInFooter: pgShowInFooter,
      });
      onNotify(`Yeni sayfa (${pgTitle.trim()}) oluşturuldu.`);
      setPgTitle('');
      setPgSubtitle('');
      setPgSlug('');
      setPgImageUrl('/assets/aistudio/crops/hero-ciger.png');
      setPgImageUrls(['/assets/aistudio/crops/hero-ciger.png']);
      setPgContent('');
      setPgSeoTitle('');
      setPgMetaDesc('');
      setPgStatus('Yayında');
    }
  };

  // Slider Ekle / Güncelle
  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideTitleTr.trim()) return;
    if (editingSlideId) {
      onUpdateSiteCmsConfig((prev) => ({
        ...prev,
        slider: {
          ...prev.slider,
          slides: prev.slider.slides.map((s) =>
            s.id === editingSlideId
              ? {
                  ...s,
                  titleTr: slideTitleTr.trim(),
                  titleEn: slideTitleEn.trim() || slideTitleTr.trim(),
                  titleAr: slideTitleAr.trim() || slideTitleTr.trim(),
                  subtitleTr: slideSubTr.trim() || s.subtitleTr,
                  badgeTr: slideBadgeTr.trim(),
                  imageUrl: slideImageUrl.trim(),
                }
              : s
          ),
        },
      }));
      setEditingSlideId(null);
      onNotify('Slider slaytı güncellendi.');
    } else {
      const newSlide: HeroSlideItem = {
        id: `SLD-${Date.now().toString().slice(-4)}`,
        titleTr: slideTitleTr.trim(),
        titleEn: slideTitleEn.trim() || slideTitleTr.trim(),
        titleAr: slideTitleAr.trim() || slideTitleTr.trim(),
        subtitleTr:
          slideSubTr.trim() ||
          'Halil Usta’nın meşe közünde günlük taze ciğer ve zırh kebapları.',
        subtitleEn:
          slideSubTr.trim() || 'Master Halil’s daily fresh charcoal liver and kebabs.',
        subtitleAr:
          slideSubTr.trim() || 'كبدة ضأن طازجة يومياً وكباب على الفحم من الشيف خليل.',
        badgeTr: slideBadgeTr.trim() || 'ÖzTike Ciğer',
        badgeEn: slideBadgeTr.trim() || 'ÖzTike Ciğer',
        badgeAr: slideBadgeTr.trim() || 'أوز تيكه',
        imageUrl: slideImageUrl.trim() || '/assets/aistudio/crops/hero-ciger.png',
        isActive: true,
      };
      onUpdateSiteCmsConfig((prev) => ({
        ...prev,
        slider: {
          ...prev.slider,
          slides: [newSlide, ...prev.slider.slides],
        },
      }));
      onNotify('Yeni slider slaytı eklendi.');
    }
    setSlideTitleTr('');
    setSlideTitleEn('');
    setSlideTitleAr('');
    setSlideSubTr('');
  };

  // Öne Çıkan Kart Ekle / Güncelle
  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardTitleTr.trim()) return;
    if (editingCardId) {
      onUpdateSiteCmsConfig((prev) => ({
        ...prev,
        design: {
          ...prev.design,
          showcaseCards: prev.design.showcaseCards.map((c) =>
            c.id === editingCardId
              ? {
                  ...c,
                  titleTr: cardTitleTr.trim(),
                  titleEn: cardTitleEn.trim() || cardTitleTr.trim(),
                  subtitleTr: cardSubTr.trim() || c.subtitleTr,
                  badgeText: cardBadge.trim(),
                  iconName: cardIcon,
                }
              : c
          ),
        },
      }));
      setEditingCardId(null);
      onNotify('Kart güncellendi.');
    } else {
      const newCard: ShowcaseCardItem = {
        id: `CRD-${Date.now().toString().slice(-4)}`,
        titleTr: cardTitleTr.trim(),
        titleEn: cardTitleEn.trim() || cardTitleTr.trim(),
        titleAr: cardTitleTr.trim(),
        subtitleTr: cardSubTr.trim() || 'Halil Usta kalitesiyle hazırlanan özel lezzet deneyimi.',
        subtitleEn: cardSubTr.trim() || 'Prepared with Master Halil quality.',
        subtitleAr: cardSubTr.trim() || 'تجربة طعم خاصة من الشيف خليل أوسطا.',
        badgeText: cardBadge.trim() || 'ÖNE ÇIKAN',
        iconName: cardIcon,
        isActive: true,
      };
      onUpdateSiteCmsConfig((prev) => ({
        ...prev,
        design: {
          ...prev.design,
          showcaseCards: [...prev.design.showcaseCards, newCard],
        },
      }));
      onNotify('Yeni vitrin kartı eklendi.');
    }
    setCardTitleTr('');
    setCardTitleEn('');
    setCardSubTr('');
  };

  // Blok Ekle / Güncelle
  const handleSaveBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockTitleTr.trim()) return;
    if (editingBlockId) {
      onUpdateSiteCmsConfig((prev) => ({
        ...prev,
        blocks: prev.blocks.map((b) =>
          b.id === editingBlockId
            ? {
                ...b,
                titleTr: blockTitleTr.trim(),
                titleEn: blockTitleTr.trim(),
                titleAr: blockTitleTr.trim(),
                contentTr: blockContentTr.trim(),
                contentEn: blockContentTr.trim(),
                contentAr: blockContentTr.trim(),
                badgeText: blockBadge.trim(),
                buttonLabel: blockBtnLabel.trim(),
                buttonUrl: blockBtnUrl.trim() || '#menu',
                position: blockPosition,
              }
            : b
        ),
      }));
      setEditingBlockId(null);
      onNotify('Özel blok güncellendi.');
    } else {
      const newBlk: CustomBlockItem = {
        id: `BLK-${Date.now().toString().slice(-4)}`,
        titleTr: blockTitleTr.trim(),
        titleEn: blockTitleTr.trim(),
        titleAr: blockTitleTr.trim(),
        contentTr: blockContentTr.trim() || 'Özel kampanya ve ikram bilgilendirme bloğu.',
        contentEn: blockContentTr.trim() || 'Special promotion and hospitality block.',
        contentAr: blockContentTr.trim() || 'قسم العروض والضيافة الخاصة.',
        badgeText: blockBadge.trim() || 'ÖZEL BLOK',
        buttonLabel: blockBtnLabel.trim() || 'Menüyü İncele',
        buttonUrl: blockBtnUrl.trim() || '#menu',
        position: blockPosition,
        isActive: true,
      };
      onUpdateSiteCmsConfig((prev) => ({
        ...prev,
        blocks: [...prev.blocks, newBlk],
      }));
      onNotify('Yeni özel blok siteye eklendi.');
    }
    setBlockTitleTr('');
    setBlockContentTr('');
  };

  // Galeri Ekle / Güncelle
  const handleSaveGalleryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!galTitleTr.trim()) return;
    if (editingGalId) {
      onUpdateSiteCmsConfig((prev) => ({
        ...prev,
        gallery: prev.gallery.map((g) =>
          g.id === editingGalId
            ? {
                ...g,
                type: galType,
                titleTr: galTitleTr.trim(),
                titleEn: galTitleEn.trim() || galTitleTr.trim(),
                titleAr: galTitleAr.trim() || galTitleTr.trim(),
                category: galCategory.trim(),
                thumbnailUrl: galThumbUrl.trim(),
                mediaUrl: galMediaUrl.trim(),
                duration: galType === 'video' ? galDuration : undefined,
              }
            : g
        ),
      }));
      setEditingGalId(null);
      onNotify('Galeri medya öğesi güncellendi.');
    } else {
      const newGal: GalleryMediaItem = {
        id: `GAL-${Date.now().toString().slice(-4)}`,
        type: galType,
        titleTr: galTitleTr.trim(),
        titleEn: galTitleEn.trim() || galTitleTr.trim(),
        titleAr: galTitleAr.trim() || galTitleTr.trim(),
        category: galCategory.trim() || 'Galeri',
        thumbnailUrl: galThumbUrl.trim() || '/assets/aistudio/crops/gallery-1.png',
        mediaUrl:
          galMediaUrl.trim() ||
          (galType === 'video'
            ? '/videos/ciger-ocakbasi-promo.mp4'
            : '/assets/aistudio/crops/gallery-1.png'),
        duration: galType === 'video' ? galDuration : undefined,
        isActive: true,
      };
      onUpdateSiteCmsConfig((prev) => ({
        ...prev,
        gallery: [newGal, ...prev.gallery],
      }));
      onNotify(galType === 'video' ? 'Yeni video galeriye eklendi.' : 'Yeni fotoğraf galeriye eklendi.');
    }
    setGalTitleTr('');
    setGalTitleEn('');
    setGalTitleAr('');
  };

  // Sosyal Medya Ekle / Güncelle / Sırala
  const handleSaveSocial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socHandle.trim() || !socUrl.trim()) return;
    if (editingSocId) {
      onUpdateSiteCmsConfig((prev) => ({
        ...prev,
        socialMedia: prev.socialMedia.map((s) =>
          s.id === editingSocId
            ? { ...s, platform: socPlatform, handleOrLabel: socHandle.trim(), url: socUrl.trim() }
            : s
        ),
      }));
      setEditingSocId(null);
      onNotify('Sosyal medya bağlantısı güncellendi.');
    } else {
      const newSoc: SocialMediaLinkItem = {
        id: `SOC-${Date.now().toString().slice(-4)}`,
        platform: socPlatform,
        handleOrLabel: socHandle.trim(),
        url: socUrl.trim(),
        isActive: true,
      };
      onUpdateSiteCmsConfig((prev) => ({
        ...prev,
        socialMedia: [...prev.socialMedia, newSoc],
      }));
      onNotify('Yeni sosyal medya hesabı eklendi.');
    }
    setSocHandle('');
    setSocUrl('');
  };

  const handleMoveSocial = (idx: number, dir: -1 | 1) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= siteCmsConfig.socialMedia.length) return;
    onUpdateSiteCmsConfig((prev) => {
      const next = [...prev.socialMedia];
      const [moved] = next.splice(idx, 1);
      next.splice(targetIdx, 0, moved);
      return { ...prev, socialMedia: next };
    });
  };

  // Modül / Eklenti Ekle / Güncelle
  const handleSaveWidget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wdgName.trim()) return;
    if (editingWdgId) {
      onUpdateSiteCmsConfig((prev) => ({
        ...prev,
        modules: {
          ...prev.modules,
          widgets: prev.modules.widgets.map((w) =>
            w.id === editingWdgId
              ? { ...w, name: wdgName.trim(), category: wdgCategory, description: wdgDesc.trim() }
              : w
          ),
        },
      }));
      setEditingWdgId(null);
      onNotify('Modül/Eklenti güncellendi.');
    } else {
      const newWdg: CustomPluginWidgetItem = {
        id: `WDG-${Date.now().toString().slice(-4)}`,
        name: wdgName.trim(),
        category: wdgCategory,
        description: wdgDesc.trim() || 'Özel sistem bileşeni ve modül eklentisi',
        isActive: true,
        version: '1.0.0',
      };
      onUpdateSiteCmsConfig((prev) => ({
        ...prev,
        modules: {
          ...prev.modules,
          widgets: [newWdg, ...prev.modules.widgets],
        },
      }));
      onNotify(`Yeni ${wdgCategory} (${newWdg.name}) eklendi.`);
    }
    setWdgName('');
    setWdgDesc('');
  };

  const handleExportSettingsJson = () => {
    const blob = new Blob([JSON.stringify(siteCmsConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oztike-cms-ayarlar-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('Tüm site ve sistem ayarları JSON dosyası olarak dışa aktarıldı.');
  };

  const handleResetToDefaults = () => {
    onUpdateSiteCmsConfig(INITIAL_SITE_CMS_CONFIG);
    onNotify('Tüm site ayarları varsayılan fabrika değerlerine sıfırlandı.');
  };

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1F1F1D] p-3 sm:p-5 space-y-5 text-xs min-w-0 max-w-full overflow-x-hidden">
      {/* Üst Başlık ve Modern CMS Sekmeleri (Tekli modda sadece aktif bölüm başlığı görünür) */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-4 min-w-0">
        <div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-[#F5F2EB] flex items-center gap-2">
            <Layout className="w-5 h-5 text-[#B86B35] dark:text-[#D4AF6A]" />
            <span>
              {singleSectionMode
                ? activeTab === 'announcement_header_logo'
                  ? 'Duyuru Bandı, Logo & Header Ayarları'
                  : activeTab === 'menus_pages'
                  ? 'Menüler, Kurumsal Sayfalar & Canlı İçerik Editörü'
                  : activeTab === 'slider_cards_blocks_theme'
                  ? 'Slider, Vitrin Kartları, Bloklar & Tema Ayarları'
                  : activeTab === 'gallery_only'
                  ? 'Fotoğraf & Video Galeri Yönetimi'
                  : activeTab === 'social_footer'
                  ? 'Sosyal Medya, İletişim & Footer Yönetimi'
                  : activeTab === 'seo_only'
                  ? 'SEO Meta Etiketleri & Schema.org Yönetimi'
                  : activeTab === 'modules_only'
                  ? 'Web Sitesi Modül, Bileşen & Eklenti Yönetimi'
                  : 'Gelişmiş Sistem Genel Ayarları'
                : 'Web Sitesi CMS, Duyuru Bandı, Tasarım & Sistem Ayarları'}
            </span>
          </h3>
          <p className="text-neutral-500 mt-0.5">
            {singleSectionMode
              ? 'Bu bölüme ait tüm ayarlar tek noktadan yönetilir; yapılan değişiklikler müşteri sitesine anında yansır.'
              : 'Logo, Header, Footer, Menüler, Sayfalar, Duyuru Bandı, Slider, Kartlar, Bloklar ve Sistem Ayarlarını tek merkezden yönetin.'}
          </p>
        </div>

        {!singleSectionMode && (
          <div className="flex flex-wrap gap-1.5">
            {(
              [
                { id: 'announcement_header_logo', label: '1. Duyuru Bandı, Logo & Header' },
                { id: 'menus_pages', label: '2. Menüler & Sayfalar' },
                { id: 'slider_cards_blocks_theme', label: '3. Slider, Kart, Blok, Buton & Tema' },
                { id: 'gallery_social_footer', label: '4. Galeri, Sosyal Medya & Footer' },
                { id: 'seo_modules_general', label: '5. Genel Ayarlar, SEO & Modüller' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#B86B35] text-white shadow'
                    : 'bg-neutral-100 dark:bg-[#141413] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* =====================================================================
          SEKME 1: DUYURU BANDI + LOGO + HEADER AYARLARI
      ===================================================================== */}
      {activeTab === 'announcement_header_logo' && (
        <div className="space-y-6">
          {/* Duyuru Bandı Yönetimi + Canlı Önizleme */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-bold text-sm text-[#B86B35] dark:text-[#D4AF6A] flex items-center gap-2">
                <Megaphone className="w-4 h-4" />
                <span>Duyuru Bandı Ayarları (Site En Üstü)</span>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex items-center gap-1.5 cursor-pointer font-semibold">
                  <input
                    type="checkbox"
                    checked={siteCmsConfig.announcementBar.enabled}
                    onChange={(e) =>
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        announcementBar: { ...prev.announcementBar, enabled: e.target.checked },
                      }))
                    }
                  />
                  <span>Duyuru Bandı Aktif</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={siteCmsConfig.announcementBar.sticky}
                    onChange={(e) =>
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        announcementBar: { ...prev.announcementBar, sticky: e.target.checked },
                      }))
                    }
                  />
                  <span>Sabit (Sticky)</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={siteCmsConfig.announcementBar.dismissible}
                    onChange={(e) =>
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        announcementBar: { ...prev.announcementBar, dismissible: e.target.checked },
                      }))
                    }
                  />
                  <span>Kullanıcı Kapatabilsin</span>
                </label>
              </div>
            </div>

            {/* Canlı Mini Önizleme */}
            <div
              className="rounded-lg px-4 py-2.5 flex items-center justify-between gap-3 border border-neutral-700/40"
              style={{
                backgroundColor: siteCmsConfig.announcementBar.bgColor,
                color: siteCmsConfig.announcementBar.textColor,
              }}
            >
              <div className="flex items-center gap-2 text-xs font-medium min-w-0">
                <span className="px-2 py-0.5 rounded bg-black/30 text-[10px] font-bold uppercase tracking-wider shrink-0">
                  {siteCmsConfig.announcementBar.badgeText || 'DUYURU'}
                </span>
                <span className="truncate">{siteCmsConfig.announcementBar.textTr}</span>
                {siteCmsConfig.announcementBar.linkLabelTr && (
                  <span className="underline font-bold shrink-0">
                    {siteCmsConfig.announcementBar.linkLabelTr} →
                  </span>
                )}
              </div>
              <span className="text-[10px] opacity-75 shrink-0">
                {siteCmsConfig.announcementBar.enabled ? 'Yayında' : 'Pasif'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1">Duyuru Metni (TR)</label>
                <input
                  type="text"
                  value={siteCmsConfig.announcementBar.textTr}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      announcementBar: { ...prev.announcementBar, textTr: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Announcement Text (EN)</label>
                <input
                  type="text"
                  value={siteCmsConfig.announcementBar.textEn}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      announcementBar: { ...prev.announcementBar, textEn: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">نص الإعلان (AR)</label>
                <input
                  type="text"
                  value={siteCmsConfig.announcementBar.textAr}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      announcementBar: { ...prev.announcementBar, textAr: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Rozet Etiketi</label>
                <input
                  type="text"
                  value={siteCmsConfig.announcementBar.badgeText}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      announcementBar: { ...prev.announcementBar, badgeText: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Buton Etiketi & Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={siteCmsConfig.announcementBar.linkLabelTr}
                    onChange={(e) =>
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        announcementBar: { ...prev.announcementBar, linkLabelTr: e.target.value },
                      }))
                    }
                    placeholder="Örn: Menüyü Gör"
                    className="w-1/2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-2"
                  />
                  <input
                    type="text"
                    value={siteCmsConfig.announcementBar.linkUrl}
                    onChange={(e) =>
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        announcementBar: { ...prev.announcementBar, linkUrl: e.target.value },
                      }))
                    }
                    placeholder="#menu"
                    className="w-1/2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-2 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Arka Plan & Yazı Rengi</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={siteCmsConfig.announcementBar.bgColor}
                    onChange={(e) =>
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        announcementBar: { ...prev.announcementBar, bgColor: e.target.value },
                      }))
                    }
                    className="h-9 w-12 rounded cursor-pointer border border-neutral-300 dark:border-neutral-700"
                    aria-label="Duyuru Bandı Arka Plan Rengi"
                  />
                  <input
                    type="color"
                    value={siteCmsConfig.announcementBar.textColor}
                    onChange={(e) =>
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        announcementBar: { ...prev.announcementBar, textColor: e.target.value },
                      }))
                    }
                    className="h-9 w-12 rounded cursor-pointer border border-neutral-300 dark:border-neutral-700"
                    aria-label="Duyuru Bandı Yazı Rengi"
                  />
                  <span className="font-mono text-[11px] text-neutral-500">
                    {siteCmsConfig.announcementBar.bgColor} / {siteCmsConfig.announcementBar.textColor}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Logo Yönetimi (Ekle / Seç / Sil) */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-4">
            <div className="font-bold text-sm text-[#B86B35] dark:text-[#D4AF6A] flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              <span>Logo Yönetimi (Logo Yükle / Değiştir / Boyutlandır)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <img
                  src={siteCmsConfig.header.logoUrl}
                  alt="Aktif Logo"
                  style={{ height: `${siteCmsConfig.header.logoHeightPx}px` }}
                  className="w-auto object-contain"
                />
                <div>
                  <div className="text-white font-bold text-xs">{siteCmsConfig.header.brandTitle}</div>
                  <div className="text-[10px] text-amber-300">Aktif Logo ({siteCmsConfig.header.logoHeightPx}px)</div>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Aktif Logo URL</label>
                <input
                  type="text"
                  value={siteCmsConfig.header.logoUrl}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      header: { ...prev.header, logoUrl: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Logo Yüksekliği ({siteCmsConfig.header.logoHeightPx} px) & Favicon
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={28}
                    max={72}
                    value={siteCmsConfig.header.logoHeightPx}
                    onChange={(e) =>
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        header: { ...prev.header, logoHeightPx: Number(e.target.value) },
                      }))
                    }
                    className="w-28"
                  />
                  <input
                    type="text"
                    value={siteCmsConfig.header.faviconUrl}
                    onChange={(e) =>
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        header: { ...prev.header, faviconUrl: e.target.value },
                      }))
                    }
                    placeholder="Favicon URL"
                    className="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2.5 py-1.5 font-mono"
                  />
                </div>
              </div>
            </div>

            <form onSubmit={handleAddLogoPreset} className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <input
                type="text"
                value={logoPresetName}
                onChange={(e) => setLogoPresetName(e.target.value)}
                placeholder="Logo Adı (Örn: Ramazan Özel Altın Logo)"
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
              />
              <input
                type="text"
                value={logoPresetUrl}
                onChange={(e) => setLogoPresetUrl(e.target.value)}
                placeholder="Logo Görsel URL (/assets/...)"
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#B86B35] text-white font-bold cursor-pointer"
              >
                + Yeni Logo Varyasyonu Ekle
              </button>
            </form>

            <div className="flex flex-wrap gap-2.5">
              {siteCmsConfig.header.logoPresets.map((preset) => (
                <div
                  key={preset.id}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border ${
                    siteCmsConfig.header.logoUrl === preset.url
                      ? 'border-[#B86B35] bg-[#B86B35]/10'
                      : 'border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  <img src={preset.url} alt={preset.name} className="w-8 h-8 object-contain rounded bg-neutral-900 p-0.5" />
                  <span className="font-semibold">{preset.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        header: {
                          ...prev.header,
                          logoUrl: preset.url,
                          logoPresets: prev.header.logoPresets.map((p) => ({
                            ...p,
                            isActive: p.id === preset.id,
                          })),
                        },
                      }));
                      onNotify(`"${preset.name}" aktif logo olarak seçildi.`);
                    }}
                    className="px-2 py-1 rounded bg-neutral-900 dark:bg-[#D4AF6A] text-white dark:text-[#141413] text-[10px] font-bold cursor-pointer"
                  >
                    {siteCmsConfig.header.logoUrl === preset.url ? 'Aktif' : 'Kullan'}
                  </button>
                  {siteCmsConfig.header.logoPresets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateSiteCmsConfig((prev) => ({
                          ...prev,
                          header: {
                            ...prev.header,
                            logoPresets: prev.header.logoPresets.filter((p) => p.id !== preset.id),
                          },
                        }));
                        onNotify('Logo kaydı silindi.');
                      }}
                      className="text-rose-500 cursor-pointer"
                      aria-label={`${preset.name} logosunu sil`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Header Ayarları */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-4">
            <div className="font-bold text-sm text-[#B86B35] dark:text-[#D4AF6A] flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              <span>Header (Üst Çubuk) Marka & Bileşen Ayarları</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold mb-1">Marka Başlığı</label>
                <input
                  type="text"
                  value={siteCmsConfig.header.brandTitle}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      header: { ...prev.header, brandTitle: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Alt Başlık (TR)</label>
                <input
                  type="text"
                  value={siteCmsConfig.header.brandSubtitleTr}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      header: { ...prev.header, brandSubtitleTr: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Subtitle (EN)</label>
                <input
                  type="text"
                  value={siteCmsConfig.header.brandSubtitleEn}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      header: { ...prev.header, brandSubtitleEn: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">العنوان الفرعي (AR)</label>
                <input
                  type="text"
                  value={siteCmsConfig.header.brandSubtitleAr}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      header: { ...prev.header, brandSubtitleAr: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-5 pt-2">
              <label className="inline-flex items-center gap-2 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={siteCmsConfig.header.stickyHeader}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      header: { ...prev.header, stickyHeader: e.target.checked },
                    }))
                  }
                />
                <span>Sabit Header (Sticky)</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={siteCmsConfig.header.showSearchBarAboveSlider}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      header: { ...prev.header, showSearchBarAboveSlider: e.target.checked },
                    }))
                  }
                />
                <span>Slider Üstünde Arama Çubuğunu Göster</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={siteCmsConfig.header.showLanguageSwitcher}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      header: { ...prev.header, showLanguageSwitcher: e.target.checked },
                    }))
                  }
                />
                <span>Çoklu Dil Seçici (TR / EN / AR)</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={siteCmsConfig.header.showNotificationBell}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      header: { ...prev.header, showNotificationBell: e.target.checked },
                    }))
                  }
                />
                <span>Canlı Bildirim Zilini Göster</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SEKME 2: MENÜLER & SAYFALAR (EKLE / DÜZENLE / SİL / SIRALA)
      ===================================================================== */}
      {activeTab === 'menus_pages' && (
        <div className="space-y-6">
          {/* Navigasyon Menüsü Oluşturucu */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-4">
            <div className="font-bold text-sm text-[#B86B35] dark:text-[#D4AF6A] flex items-center gap-2">
              <MenuIcon className="w-4 h-4" />
              <span>Menü Bağlantıları Yönetimi (Header & Footer Menüler · Ekle / Düzenle / Sil / Sırala)</span>
            </div>

            <form onSubmit={handleSaveNavMenu} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-2.5">
                <input
                  type="text"
                  required
                  value={navLabelTr}
                  onChange={(e) => setNavLabelTr(e.target.value)}
                  placeholder="Menü Adı (TR) *"
                  className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
                <input
                  type="text"
                  value={navLabelEn}
                  onChange={(e) => setNavLabelEn(e.target.value)}
                  placeholder="Label (EN)"
                  className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
                <input
                  type="text"
                  value={navLabelAr}
                  onChange={(e) => setNavLabelAr(e.target.value)}
                  placeholder="الاسم (AR)"
                  className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
                <input
                  type="text"
                  required
                  value={navUrl}
                  onChange={(e) => setNavUrl(e.target.value)}
                  placeholder="Hedef URL (#menu veya /hakkimizda)"
                  className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                />
                <select
                  value={navLocation}
                  onChange={(e) => setNavLocation(e.target.value as NavMenuItem['location'])}
                  className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                >
                  <option value="both">Header + Footer</option>
                  <option value="header">Sadece Header</option>
                  <option value="footer">Sadece Footer</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#B86B35] text-white font-bold cursor-pointer"
                >
                  {editingNavId ? 'Menüyü Güncelle' : '+ Menü Ekle'}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <input
                  type="text"
                  value={navImageUrl}
                  onChange={(e) => setNavImageUrl(e.target.value)}
                  placeholder="Menü İkon/Kapak Görseli URL (isteğe bağlı)"
                  className="flex-1 min-w-[200px] rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-1.5 font-mono text-[11px]"
                />
                <label className="px-3 py-1.5 rounded-lg border border-dashed border-[#B86B35]/60 text-[#B86B35] dark:text-[#D4AF6A] font-semibold cursor-pointer text-[11px] hover:bg-[#B86B35]/10">
                  + Tekli / Çoklu Resim Yükle
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) =>
                      handleMultiImageUpload(e.target.files, (urls) => {
                        setNavImageUrls((prev) => Array.from(new Set([...prev, ...urls])));
                        if (!navImageUrl) setNavImageUrl(urls[0]);
                      })
                    }
                  />
                </label>
                {navImageUrls.map((u, idx) => (
                  <div key={`${u.slice(0, 24)}-${idx}`} className="relative w-9 h-9 rounded border border-neutral-300 dark:border-neutral-700 overflow-hidden">
                    <img src={u} alt="Menü görseli" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setNavImageUrls((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute top-0 right-0 bg-black/75 text-white text-[9px] px-1 leading-none"
                      aria-label="Görseli kaldır"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </form>

            <div className="space-y-2">
              {siteCmsConfig.header.navMenus.map((nav, idx) => (
                <div
                  key={nav.id}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    {(nav.imageUrl || nav.imageUrls?.[0]) && (
                      <img
                        src={nav.imageUrl || nav.imageUrls?.[0]}
                        alt={nav.labelTr}
                        className="w-9 h-9 rounded-lg object-cover border border-neutral-300 dark:border-neutral-700 shrink-0"
                      />
                    )}
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 font-bold">
                      #{idx + 1} · {nav.location.toUpperCase()}
                    </span>
                    <div>
                      <span className="font-bold">{nav.labelTr}</span>
                      <span className="text-neutral-500 ml-2">({nav.labelEn} / {nav.labelAr})</span>
                      <div className="font-mono text-[11px] text-[#B86B35] dark:text-[#D4AF6A]">{nav.url}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleMoveNav(idx, -1)}
                      disabled={idx === 0}
                      className="p-1.5 rounded border border-neutral-300 dark:border-neutral-700 disabled:opacity-30 cursor-pointer"
                      aria-label={`${nav.labelTr} yukarı taşı`}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveNav(idx, 1)}
                      disabled={idx === siteCmsConfig.header.navMenus.length - 1}
                      className="p-1.5 rounded border border-neutral-300 dark:border-neutral-700 disabled:opacity-30 cursor-pointer"
                      aria-label={`${nav.labelTr} aşağı taşı`}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateSiteCmsConfig((prev) => ({
                          ...prev,
                          header: {
                            ...prev.header,
                            navMenus: prev.header.navMenus.map((m) =>
                              m.id === nav.id ? { ...m, isActive: !m.isActive } : m
                            ),
                          },
                        }));
                      }}
                      className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer ${
                        nav.isActive ? 'bg-emerald-600 text-white' : 'bg-neutral-300 dark:bg-neutral-700'
                      }`}
                    >
                      {nav.isActive ? 'Aktif' : 'Gizli'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNavId(nav.id);
                        setNavLabelTr(nav.labelTr);
                        setNavLabelEn(nav.labelEn);
                        setNavLabelAr(nav.labelAr);
                        setNavUrl(nav.url);
                        setNavImageUrl(nav.imageUrl || '');
                        setNavImageUrls(nav.imageUrls || (nav.imageUrl ? [nav.imageUrl] : []));
                        setNavLocation(nav.location);
                        setNavNewTab(nav.openInNewTab);
                      }}
                      className="text-[#B86B35] font-semibold cursor-pointer"
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateSiteCmsConfig((prev) => ({
                          ...prev,
                          header: {
                            ...prev.header,
                            navMenus: prev.header.navMenus.filter((m) => m.id !== nav.id),
                          },
                        }));
                        onNotify(`"${nav.labelTr}" menüden silindi.`);
                      }}
                      className="text-rose-500 font-semibold cursor-pointer"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Canlı İçerik Editörü & CMS Sayfa Yönetimi */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 sm:p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="font-bold text-sm text-[#B86B35] dark:text-[#D4AF6A] flex items-center gap-2">
                <FileText className="w-4 h-4 shrink-0" />
                <span>Canlı İçerik Editörü &amp; Kurumsal Sayfalar ({cmsPages.length} Sayfa)</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Canlı Düzenlenecek Sayfayı Seç"
                  value={editingPageId || ''}
                  onChange={(e) => {
                    const chosen = cmsPages.find((p) => p.id === e.target.value);
                    if (chosen) {
                      loadPageIntoLiveEditor(chosen);
                    }
                  }}
                  className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-2.5 py-1.5 text-xs font-semibold"
                >
                  <option value="">Yeni Sayfa Oluştur...</option>
                  {cmsPages.map((pg) => (
                    <option key={pg.id} value={pg.id}>
                      {pg.title} ({pg.slug})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setEditingPageId(null);
                    setPgTitle('');
                    setPgSubtitle('');
                    setPgSlug('');
                    setPgImageUrl('/assets/aistudio/crops/hero-ciger.png');
                    setPgImageUrls(['/assets/aistudio/crops/hero-ciger.png']);
                    setPgContent('');
                    setPgSeoTitle('');
                    setPgMetaDesc('');
                    setPgStatus('Yayında');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-[#B86B35]/50 text-[#B86B35] dark:text-[#D4AF6A] font-bold cursor-pointer"
                >
                  + Yeni Sayfa
                </button>
              </div>
            </div>

            {/* 2 Sütunlu Canlı Editör & Anlık Önizleme */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
              {/* Sol: Düzenleme Alanları */}
              <form
                onSubmit={handleSaveCmsPage}
                className="xl:col-span-6 space-y-3 rounded-xl bg-neutral-50 dark:bg-[#141413] p-3.5 sm:p-4 border border-neutral-200 dark:border-neutral-800"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Sayfa Başlığı *</label>
                    <input
                      type="text"
                      required
                      value={pgTitle}
                      onChange={(e) => setPgTitle(e.target.value)}
                      placeholder="Örn: Hakkımızda"
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Alt Başlık / Slogan</label>
                    <input
                      type="text"
                      value={pgSubtitle}
                      onChange={(e) => setPgSubtitle(e.target.value)}
                      placeholder="Örn: 1996’dan Beri Şahinbey / Gaziantep Lezzeti"
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">URL Slug *</label>
                    <input
                      type="text"
                      required
                      value={pgSlug}
                      onChange={(e) => setPgSlug(e.target.value)}
                      placeholder="/hakkimizda"
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Yayın Durumu</label>
                    <select
                      value={pgStatus}
                      onChange={(e) => setPgStatus(e.target.value as CMSPageItem['status'])}
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-2"
                    >
                      <option value="Yayında">Yayında</option>
                      <option value="Taslak">Taslak</option>
                      <option value="İnceleme Gerekli">İnceleme Gerekli</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="block font-semibold">Sayfa Kapak &amp; Galeri Görselleri (Tekli veya Çoklu Resim)</label>
                    <label className="px-2.5 py-1 rounded-lg border border-dashed border-[#B86B35] text-[#B86B35] dark:text-[#D4AF6A] font-semibold text-[11px] cursor-pointer hover:bg-[#B86B35]/10">
                      + Dosyadan Çoklu Yükle
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) =>
                          handleMultiImageUpload(e.target.files, (urls) => {
                            setPgImageUrls((prev) => Array.from(new Set([...prev, ...urls])));
                            setPgImageUrl(urls[0]);
                          })
                        }
                      />
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pgImageUrl}
                      onChange={(e) => setPgImageUrl(e.target.value)}
                      placeholder="/assets/aistudio/crops/hero-ciger.png"
                      className="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-2 font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (pgImageUrl.trim()) {
                          setPgImageUrls((prev) => Array.from(new Set([...prev, pgImageUrl.trim()])));
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 font-semibold text-[11px] cursor-pointer"
                    >
                      + Listeye Ekle
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      '/assets/aistudio/crops/hero-ciger.png',
                      '/assets/aistudio/crops/cat-ciger.png',
                      '/assets/aistudio/crops/cat-kebap.png',
                      '/assets/aistudio/crops/branded-ocakbasi.jpg',
                      '/assets/aistudio/crops/branded-dining.jpg',
                    ].map((presetUrl) => (
                      <button
                        key={presetUrl}
                        type="button"
                        onClick={() => {
                          setPgImageUrl(presetUrl);
                          setPgImageUrls((prev) => Array.from(new Set([...prev, presetUrl])));
                        }}
                        className={`w-11 h-8 rounded-md overflow-hidden border-2 cursor-pointer ${
                          pgImageUrl === presetUrl ? 'border-[#B86B35]' : 'border-transparent opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img src={presetUrl} alt="Görsel seç" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  {pgImageUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {pgImageUrls.map((url, idx) => (
                        <div
                          key={`${url.slice(0, 20)}-${idx}`}
                          className={`relative w-14 h-11 rounded-lg overflow-hidden border-2 ${
                            pgImageUrl === url ? 'border-[#B86B35]' : 'border-neutral-300 dark:border-neutral-700'
                          }`}
                        >
                          <img
                            src={url}
                            alt={`Sayfa görseli ${idx + 1}`}
                            onClick={() => setPgImageUrl(url)}
                            className="w-full h-full object-cover cursor-pointer"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setPgImageUrls((prev) => prev.filter((_, i) => i !== idx))
                            }
                            aria-label="Sayfa görselini kaldır"
                            className="absolute top-0 right-0 bg-black/80 text-white text-[10px] px-1 leading-none"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">SEO Başlığı</label>
                    <input
                      type="text"
                      value={pgSeoTitle}
                      onChange={(e) => setPgSeoTitle(e.target.value)}
                      placeholder="Sayfa SEO Title"
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Meta Açıklama</label>
                    <input
                      type="text"
                      value={pgMetaDesc}
                      onChange={(e) => setPgMetaDesc(e.target.value)}
                      placeholder="Kısa özet ve Google açıklaması"
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Sayfa İçerik Metni</label>
                  <textarea
                    rows={5}
                    value={pgContent}
                    onChange={(e) => setPgContent(e.target.value)}
                    placeholder="Sayfa içeriği ve ziyaretçilere gösterilecek metin..."
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#1F1F1D] px-3 py-2 leading-relaxed"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pgShowInHeader}
                        onChange={(e) => setPgShowInHeader(e.target.checked)}
                      />
                      <span>Header Menüsünde Göster</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pgShowInFooter}
                        onChange={(e) => setPgShowInFooter(e.target.checked)}
                      />
                      <span>Footer Linklerinde Göster</span>
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#B86B35] hover:bg-[#9F5928] text-white font-bold cursor-pointer"
                  >
                    {editingPageId ? 'Değişiklikleri Yayına Al / Güncelle' : '+ Yeni Sayfa Ekle'}
                  </button>
                </div>
              </form>

              {/* Sağ: Gerçek Zamanlı Canlı Önizleme Paneli */}
              <div className="xl:col-span-6 rounded-2xl border border-[#D4A359]/45 bg-[#180B08] text-[#FFF6E9] p-5 space-y-3.5 shadow-xl">
                <div className="flex items-center justify-between gap-2 border-b border-[#D4A359]/20 pb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Eye className="w-4 h-4 text-[#D4A359] shrink-0" />
                    <span className="font-bold text-xs text-[#F6D79E] truncate">
                      Canlı İçerik Önizlemesi (Müşteri Görünümü)
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      pgStatus === 'Yayında'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {pgStatus}
                  </span>
                </div>

                <div>
                  <span className="font-mono text-[11px] text-[#D4A359]">
                    {pgSlug || '/ornek-sayfa'}
                  </span>
                  <h4 className="font-editorial text-xl font-bold text-[#FFF7EB] mt-0.5">
                    {pgTitle || 'Sayfa Başlığı Önizlemesi'}
                  </h4>
                  {(pgSubtitle || !pgTitle) && (
                    <p className="text-xs text-[#C4AC95] mt-0.5">
                      {pgSubtitle || 'Alt başlık burada anlık olarak görüntülenir'}
                    </p>
                  )}
                </div>

                {pgImageUrl && (
                  <div className="rounded-xl overflow-hidden border border-[#D4A359]/30 h-44 bg-black/40">
                    <img
                      src={pgImageUrl}
                      alt={pgTitle || 'Canlı önizleme görseli'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {pgMetaDesc && (
                  <div className="text-xs font-semibold text-[#D4A359]">{pgMetaDesc}</div>
                )}

                <div className="text-xs sm:text-sm text-[#DECAB4] leading-relaxed whitespace-pre-line min-h-[72px]">
                  {pgContent ||
                    'Sol taraftaki içerik editöründen metin, başlık veya görsel değiştirdiğiniz anda bu önizleme ekranı gerçek zamanlı güncellenir.'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {cmsPages.map((pg) => (
                <div
                  key={pg.id}
                  className={`rounded-xl border p-3.5 flex flex-col justify-between gap-2 ${
                    editingPageId === pg.id
                      ? 'border-[#B86B35] bg-[#B86B35]/5'
                      : 'border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm">{pg.title}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          pg.status === 'Yayında'
                            ? 'bg-emerald-500/20 text-emerald-500'
                            : 'bg-amber-500/20 text-amber-500'
                        }`}
                      >
                        {pg.status}
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-[#B86B35] dark:text-[#D4AF6A] mt-0.5">
                      {pg.slug} · Güncelleme: {pg.updatedAt}
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1 line-clamp-2">
                      {pg.content || pg.metaDescription}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <span className="text-[10px] text-neutral-500">
                      {pg.showInHeader ? 'Header · ' : ''}
                      {pg.showInFooter !== false ? 'Footer' : ''}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => loadPageIntoLiveEditor(pg)}
                        className="inline-flex items-center gap-1 text-[#B86B35] font-semibold cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Canlı Düzenle
                      </button>
                      {onDeleteCmsPage && (
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteCmsPage(pg.id);
                            onNotify(`${pg.title} sayfası silindi.`);
                          }}
                          className="inline-flex items-center gap-1 text-rose-500 font-semibold cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Sil
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
          SEKME 3: SLIDER, KARTLAR, BLOKLAR, BUTONLAR & TEMA AYARLARI
      ===================================================================== */}
      {activeTab === 'slider_cards_blocks_theme' && (
        <div className="space-y-6">
          {/* Slider Yönetimi */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-bold text-sm text-[#B86B35] dark:text-[#D4AF6A]">
                Ana Sayfa Slider Yönetimi ({siteCmsConfig.slider.slides.length} Slayt)
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={siteCmsConfig.slider.autoPlay}
                    onChange={(e) =>
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        slider: { ...prev.slider, autoPlay: e.target.checked },
                      }))
                    }
                  />
                  <span>Otomatik Geçiş</span>
                </label>
                <label className="inline-flex items-center gap-1.5">
                  <span>Süre (sn):</span>
                  <input
                    type="number"
                    min={2}
                    max={20}
                    value={Math.round(siteCmsConfig.slider.intervalMs / 1000)}
                    onChange={(e) =>
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        slider: { ...prev.slider, intervalMs: Math.max(2000, Number(e.target.value) * 1000) },
                      }))
                    }
                    className="w-16 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2 py-1 font-mono"
                  />
                </label>
              </div>
            </div>

            <form onSubmit={handleSaveSlide} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                value={slideTitleTr}
                onChange={(e) => setSlideTitleTr(e.target.value)}
                placeholder="Slayt Başlığı (TR) *"
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
              />
              <input
                type="text"
                value={slideTitleEn}
                onChange={(e) => setSlideTitleEn(e.target.value)}
                placeholder="Slide Title (EN)"
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
              />
              <input
                type="text"
                value={slideTitleAr}
                onChange={(e) => setSlideTitleAr(e.target.value)}
                placeholder="عنوان الشريحة (AR)"
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
              />
              <input
                type="text"
                value={slideSubTr}
                onChange={(e) => setSlideSubTr(e.target.value)}
                placeholder="Alt Açıklama Metni"
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
              />
              <input
                type="text"
                value={slideImageUrl}
                onChange={(e) => setSlideImageUrl(e.target.value)}
                placeholder="Görsel URL (/assets/...)"
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#B86B35] text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{editingSlideId ? 'Slaytı Güncelle' : 'Yeni Slayt Ekle'}</span>
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {siteCmsConfig.slider.slides.map((sl) => (
                <div
                  key={sl.id}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center gap-3">
                    <img src={sl.imageUrl} alt={sl.titleTr} className="w-16 h-12 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold truncate">{sl.titleTr}</div>
                      <div className="text-[11px] text-neutral-500 truncate">{sl.titleEn}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateSiteCmsConfig((prev) => ({
                          ...prev,
                          slider: {
                            ...prev.slider,
                            slides: prev.slider.slides.map((x) =>
                              x.id === sl.id ? { ...x, isActive: !x.isActive } : x
                            ),
                          },
                        }));
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                        sl.isActive ? 'bg-emerald-600 text-white' : 'bg-neutral-300 dark:bg-neutral-700'
                      }`}
                    >
                      {sl.isActive ? 'Aktif' : 'Pasif'}
                    </button>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSlideId(sl.id);
                          setSlideTitleTr(sl.titleTr);
                          setSlideTitleEn(sl.titleEn);
                          setSlideTitleAr(sl.titleAr);
                          setSlideSubTr(sl.subtitleTr);
                          setSlideBadgeTr(sl.badgeTr);
                          setSlideImageUrl(sl.imageUrl);
                        }}
                        className="inline-flex items-center gap-1 text-[#B86B35] font-semibold cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Düzenle
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateSiteCmsConfig((prev) => ({
                            ...prev,
                            slider: {
                              ...prev.slider,
                              slides: prev.slider.slides.filter((x) => x.id !== sl.id),
                            },
                          }));
                          onNotify('Slayt silindi.');
                        }}
                        className="inline-flex items-center gap-1 text-rose-500 font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Sil
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Öne Çıkan Kartlar (Showcase Cards CRUD) */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-bold text-sm text-[#B86B35] dark:text-[#D4AF6A] flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Vitrin Kartları Yönetimi ({siteCmsConfig.design.showcaseCards.length} Kart)</span>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={siteCmsConfig.modules.showcaseCardsEnabled}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      modules: { ...prev.modules, showcaseCardsEnabled: e.target.checked },
                    }))
                  }
                />
                <span>Vitrin Kartlarını Sitede Göster</span>
              </label>
            </div>

            <form onSubmit={handleSaveCard} className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              <input
                type="text"
                required
                value={cardTitleTr}
                onChange={(e) => setCardTitleTr(e.target.value)}
                placeholder="Kart Başlığı *"
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
              />
              <input
                type="text"
                value={cardSubTr}
                onChange={(e) => setCardSubTr(e.target.value)}
                placeholder="Kart Açıklaması"
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
              />
              <input
                type="text"
                value={cardBadge}
                onChange={(e) => setCardBadge(e.target.value)}
                placeholder="Rozet (Örn: USTALIK)"
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
              />
              <select
                value={cardIcon}
                onChange={(e) => setCardIcon(e.target.value as ShowcaseCardItem['iconName'])}
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
              >
                <option value="flame">🔥 Ateş / Ocakbaşı</option>
                <option value="utensils">🍴 Servis / İkram</option>
                <option value="award">🏆 Ödül / Kalite</option>
                <option value="clock">⏱️ Hız / Süre</option>
                <option value="sparkles">✨ Özel</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#B86B35] text-white font-bold cursor-pointer"
              >
                {editingCardId ? 'Kartı Güncelle' : '+ Kart Ekle'}
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {siteCmsConfig.design.showcaseCards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 font-bold">
                      {card.badgeText}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateSiteCmsConfig((prev) => ({
                          ...prev,
                          design: {
                            ...prev.design,
                            showcaseCards: prev.design.showcaseCards.map((c) =>
                              c.id === card.id ? { ...c, isActive: !c.isActive } : c
                            ),
                          },
                        }));
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                        card.isActive ? 'bg-emerald-600 text-white' : 'bg-neutral-300 dark:bg-neutral-700'
                      }`}
                    >
                      {card.isActive ? 'Aktif' : 'Gizli'}
                    </button>
                  </div>
                  <div className="font-bold">{card.titleTr}</div>
                  <div className="text-[11px] text-neutral-500 line-clamp-2">{card.subtitleTr}</div>
                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCardId(card.id);
                        setCardTitleTr(card.titleTr);
                        setCardTitleEn(card.titleEn);
                        setCardSubTr(card.subtitleTr);
                        setCardBadge(card.badgeText);
                        setCardIcon(card.iconName);
                      }}
                      className="text-[#B86B35] font-semibold cursor-pointer"
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateSiteCmsConfig((prev) => ({
                          ...prev,
                          design: {
                            ...prev.design,
                            showcaseCards: prev.design.showcaseCards.filter((c) => c.id !== card.id),
                          },
                        }));
                        onNotify('Kart silindi.');
                      }}
                      className="text-rose-500 font-semibold cursor-pointer"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dinamik Tema Tasarım Editörü (Bakır & Şampanya Paleti) */}
          <div className="rounded-2xl border-2 border-[#D4A359]/40 bg-gradient-to-br from-[#1A0C09] to-[#120806] p-4 sm:p-5 space-y-4 text-xs text-[#FFF6E9] shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D4A359]/20 pb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#D4A359]" />
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-[#F5D69B]">
                    ÖzTike OS Dinamik Tema Tasarım Editörü
                  </h4>
                  <p className="text-[11px] text-[#C4AC95]">
                    İşletme logosu ana renkleri (ÖzTike Bakır ve Şampanya) ile tek tıkla renk paleti değiştirin.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-[#D4A359]/20 text-[#F5D69B] font-mono text-[10px] font-bold">
                Canlı Tema
              </span>
            </div>

            {/* Hazır Tema Paleti Presetleri */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  id: 'bakir',
                  name: 'ÖzTike Bakır (Orijinal)',
                  desc: 'Köz bakır tonları ve sıcak tonlar',
                  primary: '#D4A359',
                  secondary: '#B0782C',
                  bg: '#120806',
                  surface: '#1A0C09',
                },
                {
                  id: 'sampanya',
                  name: 'Şampanya Lüks Altın',
                  desc: 'Zarif şampanya ve lüks altın paleti',
                  primary: '#F3E5AB',
                  secondary: '#C5A059',
                  bg: '#0F0E0D',
                  surface: '#1C1A17',
                },
                {
                  id: 'terracotta',
                  name: 'Gaziantep Toprak & Fıstık',
                  desc: 'Terracotta toprak ve fıstık yeşili',
                  primary: '#E07A5F',
                  secondary: '#81B29A',
                  bg: '#1D1E2C',
                  surface: '#262738',
                },
                {
                  id: 'charcoal',
                  name: 'Ocakbaşı Karbon Siyah',
                  desc: 'Derin meşe közü siyahı ve kehribar',
                  primary: '#F59E0B',
                  secondary: '#D97706',
                  bg: '#09090B',
                  surface: '#18181B',
                },
              ].map((preset) => {
                const isActive =
                  siteCmsConfig.design.primaryColor === preset.primary &&
                  siteCmsConfig.design.backgroundColor === preset.bg;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        design: {
                          ...prev.design,
                          primaryColor: preset.primary,
                          secondaryColor: preset.secondary,
                          backgroundColor: preset.bg,
                          surfaceColor: preset.surface,
                        },
                      }));
                      onNotify(`"${preset.name}" tema paleti uygulandı.`);
                    }}
                    className={`rounded-xl p-3 border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isActive
                        ? 'border-[#D4A359] bg-[#2B140E] ring-2 ring-[#D4A359]/40 shadow-lg'
                        : 'border-[#D4A359]/25 bg-[#140604] hover:border-[#D4A359]/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-[#FFF7EB]">{preset.name}</span>
                        {isActive && (
                          <span className="px-1.5 py-0.5 rounded bg-[#D4A359] text-[#120806] text-[9px] font-bold">
                            Aktif
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#A88E76] mt-0.5">{preset.desc}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: preset.primary }} />
                      <span className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: preset.secondary }} />
                      <span className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: preset.bg }} />
                      <span className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: preset.surface }} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Özel Renk Seçiciler */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#D4A359]/20">
              <div>
                <label className="block text-[11px] font-semibold mb-1 text-[#C4AC95]">Ana Vurgu (Primary)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={siteCmsConfig.design.primaryColor}
                    onChange={(e) =>
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        design: { ...prev.design, primaryColor: e.target.value },
                      }))
                    }
                    className="h-8 w-10 rounded border border-[#D4A359]/30 bg-black cursor-pointer"
                    aria-label="Ana Vurgu Rengi"
                  />
                  <span className="font-mono text-[10px] text-[#D4A359]">{siteCmsConfig.design.primaryColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold mb-1 text-[#C4AC95]">İkincil (Secondary)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={siteCmsConfig.design.secondaryColor}
                    onChange={(e) =>
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        design: { ...prev.design, secondaryColor: e.target.value },
                      }))
                    }
                    className="h-8 w-10 rounded border border-[#D4A359]/30 bg-black cursor-pointer"
                    aria-label="İkincil Renk"
                  />
                  <span className="font-mono text-[10px] text-[#D4A359]">{siteCmsConfig.design.secondaryColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold mb-1 text-[#C4AC95]">Arka Plan (Background)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={siteCmsConfig.design.backgroundColor}
                    onChange={(e) =>
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        design: { ...prev.design, backgroundColor: e.target.value },
                      }))
                    }
                    className="h-8 w-10 rounded border border-[#D4A359]/30 bg-black cursor-pointer"
                    aria-label="Arka Plan Rengi"
                  />
                  <span className="font-mono text-[10px] text-[#D4A359]">{siteCmsConfig.design.backgroundColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold mb-1 text-[#C4AC95]">Yüzey/Kart (Surface)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={siteCmsConfig.design.surfaceColor}
                    onChange={(e) =>
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        design: { ...prev.design, surfaceColor: e.target.value },
                      }))
                    }
                    className="h-8 w-10 rounded border border-[#D4A359]/30 bg-black cursor-pointer"
                    aria-label="Yüzey Kart Rengi"
                  />
                  <span className="font-mono text-[10px] text-[#D4A359]">{siteCmsConfig.design.surfaceColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Butonlar & Tema Renkleri */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-4">
            <div className="font-bold text-sm text-[#B86B35] dark:text-[#D4AF6A] flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span>Tema Renkleri, Kart & Buton Stilleri</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block font-semibold mb-1">Ürün Kartı Köşe Stili</label>
                <select
                  value={siteCmsConfig.design.cardRadius}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      design: {
                        ...prev.design,
                        cardRadius: e.target.value as SiteCmsConfig['design']['cardRadius'],
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                >
                  <option value="rounded-xl">Klasik Köşe (rounded-xl)</option>
                  <option value="rounded-2xl">Modern Yumuşak Köşe (rounded-2xl)</option>
                  <option value="rounded-3xl">Tam Oval Kart (rounded-3xl)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Buton Renk & Vurgu Stili</label>
                <select
                  value={siteCmsConfig.design.buttonStyle}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      design: {
                        ...prev.design,
                        buttonStyle: e.target.value as SiteCmsConfig['design']['buttonStyle'],
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                >
                  <option value="gold-gradient">Altın & Bakır Gradyan</option>
                  <option value="copper-solid">Köz Bakır Düz Stil</option>
                  <option value="emerald-accent">Zümrüt Yeşili Vurgu</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Buton Köşe Yuvarlaklığı</label>
                <select
                  value={siteCmsConfig.design.buttonRadius}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      design: {
                        ...prev.design,
                        buttonRadius: e.target.value as SiteCmsConfig['design']['buttonRadius'],
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                >
                  <option value="rounded-lg">Hafif Köşeli (rounded-lg)</option>
                  <option value="rounded-xl">Modern Yuvarlak (rounded-xl)</option>
                  <option value="rounded-full">Tam Yuvarlak (rounded-full)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Ana & Arka Plan Tema Rengi</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={siteCmsConfig.design.primaryColor}
                    onChange={(e) =>
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        design: { ...prev.design, primaryColor: e.target.value },
                      }))
                    }
                    className="h-9 w-11 rounded border cursor-pointer"
                    aria-label="Ana Vurgu Rengi"
                  />
                  <input
                    type="color"
                    value={siteCmsConfig.design.backgroundColor}
                    onChange={(e) =>
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        design: { ...prev.design, backgroundColor: e.target.value },
                      }))
                    }
                    className="h-9 w-11 rounded border cursor-pointer"
                    aria-label="Arka Plan Rengi"
                  />
                  <span className="font-mono text-[11px] text-neutral-500">
                    {siteCmsConfig.design.primaryColor}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block font-semibold mb-1">Hero QR Buton Yazısı (TR)</label>
                <input
                  type="text"
                  value={siteCmsConfig.design.qrButtonLabelTr}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      design: { ...prev.design, qrButtonLabelTr: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Sipariş Gönder Buton Yazısı (TR)</label>
                <input
                  type="text"
                  value={siteCmsConfig.design.orderButtonLabelTr}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      design: { ...prev.design, orderButtonLabelTr: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Özel Blok ve Buton Yönetimi (CRUD) */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-4">
            <div className="font-bold text-sm text-[#B86B35] dark:text-[#D4AF6A] flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>Özel Tanıtım Blokları & Aksiyon Butonları ({siteCmsConfig.blocks.length} Blok)</span>
            </div>

            <form onSubmit={handleSaveBlock} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <input
                type="text"
                required
                value={blockTitleTr}
                onChange={(e) => setBlockTitleTr(e.target.value)}
                placeholder="Blok Başlığı *"
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
              />
              <input
                type="text"
                value={blockContentTr}
                onChange={(e) => setBlockContentTr(e.target.value)}
                placeholder="Blok Açıklaması"
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
              />
              <input
                type="text"
                value={blockBtnLabel}
                onChange={(e) => setBlockBtnLabel(e.target.value)}
                placeholder="Buton Metni"
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
              />
              <select
                value={blockPosition}
                onChange={(e) => setBlockPosition(e.target.value as CustomBlockItem['position'])}
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
              >
                <option value="top">Konum: Üst</option>
                <option value="middle">Konum: Orta</option>
                <option value="bottom">Konum: Alt</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#B86B35] text-white font-bold cursor-pointer"
              >
                {editingBlockId ? 'Bloğu Güncelle' : '+ Yeni Blok Ekle'}
              </button>
            </form>

            <div className="space-y-2">
              {siteCmsConfig.blocks.map((blk) => (
                <div
                  key={blk.id}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 font-bold">
                        {blk.badgeText}
                      </span>
                      <span className="text-[10px] text-neutral-500 uppercase">[{blk.position}]</span>
                    </div>
                    <div className="font-bold mt-1">{blk.titleTr}</div>
                    <div className="text-neutral-500 text-[11px]">{blk.contentTr}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBlockId(blk.id);
                        setBlockTitleTr(blk.titleTr);
                        setBlockContentTr(blk.contentTr);
                        setBlockBadge(blk.badgeText);
                        setBlockBtnLabel(blk.buttonLabel);
                        setBlockBtnUrl(blk.buttonUrl);
                        setBlockPosition(blk.position);
                      }}
                      className="text-[#B86B35] font-semibold cursor-pointer"
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateSiteCmsConfig((prev) => ({
                          ...prev,
                          blocks: prev.blocks.filter((b) => b.id !== blk.id),
                        }));
                        onNotify('Blok silindi.');
                      }}
                      className="text-rose-500 font-semibold cursor-pointer"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SEKME 4A: FOTO & VİDEO GALERİ YÖNETİMİ
      ===================================================================== */}
      {(activeTab === 'gallery_only' || activeTab === 'gallery_social_footer') && (
        <div className="space-y-6">
          {/* Fotoğraf & Video Galeri */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-4">
            <div className="font-bold text-sm text-[#B86B35] dark:text-[#D4AF6A] flex items-center gap-2">
              <Film className="w-4 h-4" />
              <span>Resimli & Videolu Galeri Yönetimi ({siteCmsConfig.gallery.length} Öğe)</span>
            </div>

            <form onSubmit={handleSaveGalleryItem} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={galType}
                  onChange={(e) => {
                    const nextType = e.target.value as 'photo' | 'video';
                    setGalType(nextType);
                    if (nextType === 'video' && !galMediaUrl.endsWith('.mp4')) {
                      setGalMediaUrl('/videos/ciger-ocakbasi-promo.mp4');
                    } else if (nextType === 'photo' && galMediaUrl.endsWith('.mp4')) {
                      setGalMediaUrl('/assets/aistudio/crops/gallery-1.png');
                    }
                  }}
                  className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-bold"
                >
                  <option value="photo">📷 Fotoğraf (Resim)</option>
                  <option value="video">🎬 Video (MP4 / HD Tanıtım)</option>
                </select>
                <input
                  type="text"
                  required
                  value={galTitleTr}
                  onChange={(e) => setGalTitleTr(e.target.value)}
                  placeholder="Medya Başlığı (TR) *"
                  className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
                <input
                  type="text"
                  value={galTitleEn}
                  onChange={(e) => setGalTitleEn(e.target.value)}
                  placeholder="Media Title (EN)"
                  className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
                <input
                  type="text"
                  value={galThumbUrl}
                  onChange={(e) => setGalThumbUrl(e.target.value)}
                  placeholder="Kapak Resmi URL"
                  className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                />
                <input
                  type="text"
                  value={galMediaUrl}
                  onChange={(e) => setGalMediaUrl(e.target.value)}
                  placeholder={galType === 'video' ? 'Video MP4 URL (/videos/...)' : 'Büyük Fotoğraf URL'}
                  className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#B86B35] text-white font-bold cursor-pointer"
                >
                  {editingGalId
                    ? 'Medya Öğesini Güncelle'
                    : galType === 'video'
                    ? '+ Yeni Video Ekle'
                    : '+ Yeni Fotoğraf Ekle'}
                </button>
              </div>

              {/* Hazır Yerel Video / Fotoğraf Seçici */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                <span className="font-semibold text-neutral-500">
                  {galType === 'video' ? 'Hazır Tanıtım Videoları:' : 'Hazır Fotoğraflar:'}
                </span>
                {galType === 'video' ? (
                  [
                    { label: 'Ocakbaşı Ciğer Tanıtım', url: '/videos/ciger-ocakbasi-promo.mp4' },
                    { label: 'Halil Usta & Salon', url: '/videos/halil-usta-tanitim.mp4' },
                    { label: 'Kebap, Döner & Lahmacun', url: '/videos/doner-lahmacun-promo.mp4' },
                  ].map((v) => (
                    <button
                      key={v.url}
                      type="button"
                      onClick={() => setGalMediaUrl(v.url)}
                      className={`px-2.5 py-1 rounded-lg border font-mono cursor-pointer ${
                        galMediaUrl === v.url
                          ? 'bg-[#B86B35] text-white border-[#B86B35]'
                          : 'border-neutral-300 dark:border-neutral-700'
                      }`}
                    >
                      🎬 {v.label}
                    </button>
                  ))
                ) : (
                  [
                    '/assets/aistudio/crops/gallery-1.png',
                    '/assets/aistudio/crops/gallery-2.png',
                    '/assets/aistudio/crops/gallery-3.png',
                    '/assets/aistudio/crops/hero-ciger.png',
                    '/assets/aistudio/crops/story-chef.png',
                  ].map((img) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => {
                        setGalThumbUrl(img);
                        setGalMediaUrl(img);
                      }}
                      className={`w-10 h-7 rounded overflow-hidden border-2 cursor-pointer ${
                        galMediaUrl === img ? 'border-[#B86B35]' : 'border-transparent opacity-75'
                      }`}
                    >
                      <img src={img} alt="Galeri görsel seç" className="w-full h-full object-cover" />
                    </button>
                  ))
                )}
              </div>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {siteCmsConfig.gallery.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative h-32 bg-black">
                    <img src={item.thumbnailUrl} alt={item.titleTr} className="w-full h-full object-cover opacity-85" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 text-white text-[10px] font-bold flex items-center gap-1">
                      {item.type === 'video' ? '🎬 VİDEO' : '📷 FOTO'}
                    </span>
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="font-bold line-clamp-1">{item.titleTr}</div>
                    <div className="font-mono text-[10px] text-neutral-500 truncate">{item.mediaUrl}</div>
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingGalId(item.id);
                          setGalType(item.type);
                          setGalTitleTr(item.titleTr);
                          setGalTitleEn(item.titleEn);
                          setGalTitleAr(item.titleAr);
                          setGalCategory(item.category);
                          setGalThumbUrl(item.thumbnailUrl);
                          setGalMediaUrl(item.mediaUrl);
                        }}
                        className="text-[#B86B35] font-semibold cursor-pointer"
                      >
                        Düzenle
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateSiteCmsConfig((prev) => ({
                            ...prev,
                            gallery: prev.gallery.filter((g) => g.id !== item.id),
                          }));
                          onNotify('Medya öğesi silindi.');
                        }}
                        className="text-rose-500 font-semibold cursor-pointer"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SEKME 4B: SIRALI SOSYAL MEDYA, İLETİŞİM & FOOTER YÖNETİMİ
      ===================================================================== */}
      {(activeTab === 'social_footer' || activeTab === 'gallery_social_footer') && (
        <div className="space-y-6">
          {/* Sıralı Sosyal Medya Yönetimi */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-4">
            <div className="font-bold text-sm text-[#B86B35] dark:text-[#D4AF6A] flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              <span>Footer Sosyal Medya Bağlantıları (Sırala / Ekle / Düzenle / Sil)</span>
            </div>

            <form onSubmit={handleSaveSocial} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <select
                value={socPlatform}
                onChange={(e) => setSocPlatform(e.target.value as SocialMediaLinkItem['platform'])}
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-bold"
              >
                {(['Instagram', 'Facebook', 'YouTube', 'TikTok', 'WhatsApp', 'Google Maps'] as const).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <input
                type="text"
                required
                value={socHandle}
                onChange={(e) => setSocHandle(e.target.value)}
                placeholder="Hesap Etiketi (@oztikeciger)"
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
              />
              <input
                type="text"
                required
                value={socUrl}
                onChange={(e) => setSocUrl(e.target.value)}
                placeholder="URL (https://...)"
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#B86B35] text-white font-bold cursor-pointer"
              >
                {editingSocId ? 'Hesabı Güncelle' : '+ Sosyal Medya Ekle'}
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {siteCmsConfig.socialMedia.map((soc, idx) => (
                <div
                  key={soc.id}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="font-bold">#{idx + 1} · {soc.platform}</div>
                    <div className="text-[11px] text-neutral-500 truncate">
                      {soc.handleOrLabel} · {soc.url}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMoveSocial(idx, -1)}
                      disabled={idx === 0}
                      className="p-1 rounded border border-neutral-300 dark:border-neutral-700 disabled:opacity-30 cursor-pointer"
                      aria-label={`${soc.platform} yukarı taşı`}
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveSocial(idx, 1)}
                      disabled={idx === siteCmsConfig.socialMedia.length - 1}
                      className="p-1 rounded border border-neutral-300 dark:border-neutral-700 disabled:opacity-30 cursor-pointer"
                      aria-label={`${soc.platform} aşağı taşı`}
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSocId(soc.id);
                        setSocPlatform(soc.platform);
                        setSocHandle(soc.handleOrLabel);
                        setSocUrl(soc.url);
                      }}
                      className="text-[#B86B35] font-semibold cursor-pointer"
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateSiteCmsConfig((prev) => ({
                          ...prev,
                          socialMedia: prev.socialMedia.filter((s) => s.id !== soc.id),
                        }));
                        onNotify('Sosyal medya silindi.');
                      }}
                      className="text-rose-500 font-semibold cursor-pointer"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* İletişim & Footer Yönetimi */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-4">
            <div className="font-bold text-sm text-[#B86B35] dark:text-[#D4AF6A] flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <span>Footer & Sıralı İletişim Bilgileri Yönetimi</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1">Gösterilen Telefon</label>
                <input
                  type="text"
                  value={siteCmsConfig.contact.phoneDisplay}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, phoneDisplay: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">WhatsApp Numarası</label>
                <input
                  type="text"
                  value={siteCmsConfig.contact.whatsappRaw}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, whatsappRaw: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Kurumsal E-posta</label>
                <input
                  type="email"
                  value={siteCmsConfig.contact.email}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, email: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Açık Adres (TR)</label>
                <input
                  type="text"
                  value={siteCmsConfig.contact.addressTr}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, addressTr: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Çalışma Saatleri (TR)</label>
                <input
                  type="text"
                  value={siteCmsConfig.contact.workingHoursTr}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      contact: { ...prev.contact, workingHoursTr: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Footer Telif Metni (TR)</label>
                <input
                  type="text"
                  value={siteCmsConfig.footer.copyrightTr}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      footer: { ...prev.footer, copyrightTr: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Footer Hakkında Kısa Metni (TR)</label>
              <textarea
                rows={2}
                value={siteCmsConfig.footer.aboutTr}
                onChange={(e) =>
                  onUpdateSiteCmsConfig((prev) => ({
                    ...prev,
                    footer: { ...prev.footer, aboutTr: e.target.value },
                  }))
                }
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
              />
            </div>

            <div className="flex flex-wrap gap-5">
              <label className="inline-flex items-center gap-2 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={siteCmsConfig.footer.showSocialIcons}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      footer: { ...prev.footer, showSocialIcons: e.target.checked },
                    }))
                  }
                />
                <span>Footer’da Sosyal Medya Bağlantılarını Göster</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={siteCmsConfig.footer.showAdminLoginButton}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      footer: { ...prev.footer, showAdminLoginButton: e.target.checked },
                    }))
                  }
                />
                <span>Site En Altında "Yönetici Girişi" Butonunu Göster</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SEKME 5A: GELİŞMİŞ PROFESYONEL SİSTEM GENEL AYARLARI
      ===================================================================== */}
      {(activeTab === 'general_only' || activeTab === 'seo_modules_general') && (
        <div className="space-y-6">
          {/* Profesyonel Sistem Genel Ayarları (Çoklu Alt Sekme) */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="font-bold text-sm text-[#B86B35] dark:text-[#D4AF6A] flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span>Gelişmiş Sistem Genel Ayarları</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { id: 'business', label: 'İşletme & Bakım Modu', icon: Building2 },
                    { id: 'orders', label: 'Sipariş, KDV & Teslimat', icon: Truck },
                    { id: 'notifications', label: 'Bildirim & SMTP', icon: Mail },
                    { id: 'security', label: 'Güvenlik & JSON Yedek', icon: Shield },
                  ] as const
                ).map((st) => {
                  const Icon = st.icon;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSettingsSubTab(st.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                        settingsSubTab === st.id
                          ? 'bg-[#B86B35] text-white'
                          : 'bg-neutral-100 dark:bg-[#141413] text-neutral-600 dark:text-neutral-300'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{st.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {settingsSubTab === 'business' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Resmi Şirket Ünvanı</label>
                  <input
                    type="text"
                    value={siteCmsConfig.generalSettings.companyLegalName}
                    onChange={(e) =>
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        generalSettings: { ...prev.generalSettings, companyLegalName: e.target.value },
                      }))
                    }
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Vergi Dairesi & Vergi No</label>
                  <input
                    type="text"
                    value={siteCmsConfig.generalSettings.taxOfficeAndNo}
                    onChange={(e) =>
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        generalSettings: { ...prev.generalSettings, taxOfficeAndNo: e.target.value },
                      }))
                    }
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Varsayılan Dil & Saat Dilimi</label>
                  <div className="flex gap-2">
                    <select
                      value={siteCmsConfig.generalSettings.defaultLanguage}
                      onChange={(e) =>
                        onUpdateSiteCmsConfig((prev) => ({
                          ...prev,
                          generalSettings: {
                            ...prev.generalSettings,
                            defaultLanguage: e.target.value as SupportedLang,
                          },
                        }))
                      }
                      className="w-1/3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-2 py-2"
                    >
                      {SUPPORTED_LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code}>
                          {l.flag} {l.short} ({l.label})
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={siteCmsConfig.generalSettings.timezone}
                      onChange={(e) =>
                        onUpdateSiteCmsConfig((prev) => ({
                          ...prev,
                          generalSettings: { ...prev.generalSettings, timezone: e.target.value },
                        }))
                      }
                      className="w-2/3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                    />
                  </div>
                </div>
                <div className="sm:col-span-3 flex flex-wrap items-center gap-4 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                  <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-amber-600 dark:text-amber-400">
                    <input
                      type="checkbox"
                      checked={siteCmsConfig.generalSettings.maintenanceMode}
                      onChange={(e) =>
                        onUpdateSiteCmsConfig((prev) => ({
                          ...prev,
                          generalSettings: { ...prev.generalSettings, maintenanceMode: e.target.checked },
                        }))
                      }
                    />
                    <span>Bakım Modunu Etkinleştir (Ziyaretçilere Bakım Mesajı Göster)</span>
                  </label>
                  <input
                    type="text"
                    value={siteCmsConfig.generalSettings.maintenanceMessageTr}
                    onChange={(e) =>
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        generalSettings: { ...prev.generalSettings, maintenanceMessageTr: e.target.value },
                      }))
                    }
                    placeholder="Bakım Modu Mesajı"
                    className="flex-1 min-w-0 w-full sm:min-w-[260px] rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                  />
                </div>
              </div>
            )}

            {settingsSubTab === 'orders' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div>
                  <label className="block font-semibold mb-1">KDV Oranı (%)</label>
                  <input
                    type="number"
                    value={siteCmsConfig.generalSettings.taxRatePercent}
                    onChange={(e) =>
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        generalSettings: { ...prev.generalSettings, taxRatePercent: Number(e.target.value) },
                      }))
                    }
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Servis Ücreti (%)</label>
                  <input
                    type="number"
                    value={siteCmsConfig.generalSettings.serviceFeePercent}
                    onChange={(e) =>
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        generalSettings: { ...prev.generalSettings, serviceFeePercent: Number(e.target.value) },
                      }))
                    }
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Min. Paket Sipariş (₺)</label>
                  <input
                    type="number"
                    value={siteCmsConfig.generalSettings.minDeliveryOrderAmount}
                    onChange={(e) =>
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        generalSettings: {
                          ...prev.generalSettings,
                          minDeliveryOrderAmount: Number(e.target.value),
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Teslimat Yarıçapı (km)</label>
                  <input
                    type="number"
                    value={siteCmsConfig.generalSettings.deliveryRadiusKm}
                    onChange={(e) =>
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        generalSettings: { ...prev.generalSettings, deliveryRadiusKm: Number(e.target.value) },
                      }))
                    }
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Ort. Hazırlama (dk)</label>
                  <input
                    type="number"
                    value={siteCmsConfig.generalSettings.defaultPrepMinutes}
                    onChange={(e) =>
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        generalSettings: { ...prev.generalSettings, defaultPrepMinutes: Number(e.target.value) },
                      }))
                    }
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Kurye Teslimat Ücreti (₺)</label>
                  <input
                    type="number"
                    min={0}
                    value={siteCmsConfig.generalSettings.courierDeliveryFee ?? 35}
                    onChange={(e) =>
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        generalSettings: { ...prev.generalSettings, courierDeliveryFee: Number(e.target.value) },
                      }))
                    }
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                  />
                </div>
                <div className="sm:col-span-3 pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={siteCmsConfig.generalSettings.autoAcceptQrOrders}
                      onChange={(e) =>
                        onUpdateSiteCmsConfig((prev) => ({
                          ...prev,
                          generalSettings: {
                            ...prev.generalSettings,
                            autoAcceptQrOrders: e.target.checked,
                          },
                        }))
                      }
                    />
                    <span>Masadaki QR Kod Siparişlerini Doğrudan Mutfak KDS Ekranına Aktar</span>
                  </label>
                </div>
              </div>
            )}

            {settingsSubTab === 'notifications' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">SMTP E-posta Sunucusu</label>
                  <input
                    type="text"
                    value={siteCmsConfig.generalSettings.smtpHost}
                    onChange={(e) =>
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        generalSettings: { ...prev.generalSettings, smtpHost: e.target.value },
                      }))
                    }
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Sipariş Bildirim E-postası</label>
                  <input
                    type="email"
                    value={siteCmsConfig.generalSettings.notificationEmail}
                    onChange={(e) =>
                      onUpdateSiteCmsConfig((prev) => ({
                        ...prev,
                        generalSettings: { ...prev.generalSettings, notificationEmail: e.target.value },
                      }))
                    }
                    className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                  />
                </div>
                <div className="sm:col-span-2 pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={siteCmsConfig.modules.liveNotificationSound}
                      onChange={(e) =>
                        onUpdateSiteCmsConfig((prev) => ({
                          ...prev,
                          modules: { ...prev.modules, liveNotificationSound: e.target.checked },
                        }))
                      }
                    />
                    <span>Canlı Sipariş ve Garson Çağrısı Sesli Bildirimlerini Etkinleştir</span>
                  </label>
                </div>
              </div>
            )}

            {settingsSubTab === 'security' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block font-semibold mb-1">Oturum Zaman Aşımı (Dakika)</label>
                    <input
                      type="number"
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
                      className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                    />
                  </div>
                  <div className="pb-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer font-semibold">
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
                      <span>Yönetici Girişinde 2FA Zorunlu</span>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end">
                    <button
                      type="button"
                      onClick={handleExportSettingsJson}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-900 dark:bg-[#D4AF6A] text-white dark:text-[#141413] font-bold cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Ayarları Dışa Aktar (JSON)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetToDefaults}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-500/40 text-rose-500 font-bold cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Varsayılana Sıfırla</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => onNotify('Sistem genel ayarları kaydedildi ve anında uygulandı.')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#B86B35] text-white font-bold cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Ayarları Kaydet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SEKME 5B: SEO AYARLARI
      ===================================================================== */}
      {(activeTab === 'seo_only' || activeTab === 'seo_modules_general') && (
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-4">
            <div className="font-bold text-sm text-[#B86B35] dark:text-[#D4AF6A] flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>Çok Dilli SEO Meta Başlık, Açıklama & Schema.org Ayarları</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1">SEO Başlığı (TR)</label>
                <input
                  type="text"
                  value={siteCmsConfig.seo.metaTitleTr}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, metaTitleTr: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">SEO Title (EN)</label>
                <input
                  type="text"
                  value={siteCmsConfig.seo.metaTitleEn}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, metaTitleEn: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">عنوان SEO (AR)</label>
                <input
                  type="text"
                  value={siteCmsConfig.seo.metaTitleAr}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, metaTitleAr: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Anahtar Kelimeler</label>
                <input
                  type="text"
                  value={siteCmsConfig.seo.keywords}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, keywords: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Canonical URL</label>
                <input
                  type="text"
                  value={siteCmsConfig.seo.canonicalUrl}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, canonicalUrl: e.target.value },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Schema.org Tipi</label>
                <select
                  value={siteCmsConfig.seo.schemaType}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      seo: {
                        ...prev.seo,
                        schemaType: e.target.value as SiteCmsConfig['seo']['schemaType'],
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
                >
                  <option value="Restaurant">Restaurant</option>
                  <option value="FoodEstablishment">FoodEstablishment</option>
                  <option value="LocalBusiness">LocalBusiness</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SEKME 5C: MODÜL, BİLEŞEN VE EKLENTİ MERKEZİ
      ===================================================================== */}
      {(activeTab === 'modules_only' || activeTab === 'seo_modules_general') && (
        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-4">
            <div className="font-bold text-sm text-[#B86B35] dark:text-[#D4AF6A] flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Modül, Bileşen ve Eklenti Ayarları (Ekle / Düzenle / Sil)</span>
            </div>

            <div className="flex flex-wrap gap-5 pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <label className="inline-flex items-center gap-2 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={siteCmsConfig.modules.aiAssistantEnabled}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      modules: { ...prev.modules, aiAssistantEnabled: e.target.checked },
                    }))
                  }
                />
                <span>Ücretsiz Yapay Zekâ Asistanı Aktif</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={siteCmsConfig.modules.gallerySectionEnabled}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      modules: { ...prev.modules, gallerySectionEnabled: e.target.checked },
                    }))
                  }
                />
                <span>Foto & Video Galeri Bölümü Aktif</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={siteCmsConfig.modules.campaignsSectionEnabled}
                  onChange={(e) =>
                    onUpdateSiteCmsConfig((prev) => ({
                      ...prev,
                      modules: { ...prev.modules, campaignsSectionEnabled: e.target.checked },
                    }))
                  }
                />
                <span>Kampanyalar Bölümü Aktif</span>
              </label>
            </div>

            <form onSubmit={handleSaveWidget} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                required
                value={wdgName}
                onChange={(e) => setWdgName(e.target.value)}
                placeholder="Modül / Bileşen / Eklenti Adı *"
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
              />
              <select
                value={wdgCategory}
                onChange={(e) => setWdgCategory(e.target.value as CustomPluginWidgetItem['category'])}
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
              >
                <option value="Bileşen">Bileşen</option>
                <option value="Modül">Modül</option>
                <option value="Eklenti">Eklenti</option>
              </select>
              <input
                type="text"
                value={wdgDesc}
                onChange={(e) => setWdgDesc(e.target.value)}
                placeholder="Görev ve Açıklama"
                className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-[#141413] px-3 py-2"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#B86B35] text-white font-bold cursor-pointer"
              >
                {editingWdgId ? 'Bileşeni Güncelle' : '+ Modül / Eklenti Ekle'}
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {siteCmsConfig.modules.widgets.map((w) => (
                <div
                  key={w.id}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-3 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#B86B35]/15 text-[#B86B35] dark:text-[#D4AF6A] font-bold text-[10px]">
                        {w.category}
                      </span>
                      <span className="font-bold">{w.name}</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">{w.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateSiteCmsConfig((prev) => ({
                          ...prev,
                          modules: {
                            ...prev.modules,
                            widgets: prev.modules.widgets.map((x) =>
                              x.id === w.id ? { ...x, isActive: !x.isActive } : x
                            ),
                          },
                        }));
                        onNotify(`${w.name} durumu değiştirildi.`);
                      }}
                      className={`px-2.5 py-1 rounded font-bold cursor-pointer ${
                        w.isActive ? 'bg-emerald-600 text-white' : 'bg-neutral-300 dark:bg-neutral-700'
                      }`}
                    >
                      {w.isActive ? 'Aktif' : 'Pasif'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingWdgId(w.id);
                        setWdgName(w.name);
                        setWdgCategory(w.category);
                        setWdgDesc(w.description);
                      }}
                      className="text-[#B86B35] font-semibold cursor-pointer"
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateSiteCmsConfig((prev) => ({
                          ...prev,
                          modules: {
                            ...prev.modules,
                            widgets: prev.modules.widgets.filter((x) => x.id !== w.id),
                          },
                        }));
                        onNotify(`${w.name} silindi.`);
                      }}
                      className="text-rose-500 p-1 cursor-pointer"
                      aria-label={`${w.name} sil`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
