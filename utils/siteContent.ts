import {
  CustomizationAsset,
  CustomizationAssetType,
  EditableElementKey,
  ElementRichText,
  ElementStyle,
  ElementStyles,
  InstagramReview,
  InstagramReviewId,
  SectionStyle,
  SiteAssets,
  SiteContent,
  EDITABLE_ELEMENT_KEYS,
  INSTAGRAM_REVIEW_IDS,
} from '../types';
import { normalizeCloudinaryImageUrl } from '../services/cloudinary';
import { sanitizeRichTextValue } from './richText';

const DEFAULT_INSTAGRAM_REVIEW_ITEMS: Record<InstagramReviewId, InstagramReview> = {
  review1: {
    name: 'Laura Méndez',
    handle: '@laurita.eats',
    timeAgo: 'hace 2 días',
    message:
      'No puedo con la originalidad de estos tacos al pastor: cada mordisco tiene un giro gourmet brutal. La salsa cheddar queda cremosa sin empalagar y el toque crujiente lo es todo.',
    highlight: 'Story « Taco Tuesday »',
    highlightCaption: 'Guardado en Destacadas',
    location: 'Bogotá · Servicio nocturno',
    badgeLabel: 'Instagram',
    postImageAlt: "Assiette de tacos colorés garnis d'herbes fraîches.",
    avatarUrl:
      'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=320&q=80',
    highlightImageUrl: 'https://images.unsplash.com/photo-1521305916504-4a1121188589?auto=format&fit=crop&w=320&q=80',
    postImageUrl: 'https://images.unsplash.com/photo-1521305916504-4a1121188589?auto=format&fit=crop&w=640&q=80',
  },
  review2: {
    name: 'Camila Torres',
    handle: '@camigoesout',
    timeAgo: 'hace 5 días',
    message:
      'Estas arepas son lo más: combinan ingredientes súper frescos con un toque gourmet creativo. La mezcla dulce-salado y esa salsa cheddar para remojar me tuvieron feliz todo el brunch.',
    highlight: 'Reel « Brunch entre amigas »',
    highlightCaption: 'Comentarios llenos de antojos',
    location: 'Medellín · Brunch de domingo',
    badgeLabel: 'Instagram',
    postImageAlt: 'Gros plan sur des arepas dorées et une sauce maison.',
    avatarUrl:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=320&q=80',
    highlightImageUrl: 'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?auto=format&fit=crop&w=320&q=80',
    postImageUrl: 'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?auto=format&fit=crop&w=640&q=80',
  },
  review3: {
    name: 'Andrés Martínez',
    handle: '@andres.foodie',
    timeAgo: 'hace 1 semana',
    message:
      'Pedí delivery y llegó todo perfecto: los tacos calientes, las salsas separadas y hasta un detalle extra. La app es súper fácil y el tracking en tiempo real me encantó.',
    highlight: 'Post « Delivery que vale la pena »',
    highlightCaption: 'Recomendado por seguidores',
    location: 'Bogotá · Servicio a domicilio',
    badgeLabel: 'Instagram',
    postImageAlt: 'Boîte de livraison ouverte avec tacos bien présentés.',
    avatarUrl:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=320&q=80',
    highlightImageUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=320&q=80',
    postImageUrl: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=640&q=80',
  },
  review4: {
    name: 'Valentina Restrepo',
    handle: '@vale.foodlover',
    timeAgo: 'hace 2 semanas',
    message:
      'El ambiente del local es increíble: música latina suave, decoración con toques mexicanos modernos y ese aroma a tortillas recién hechas. Perfecto para una cena casual con amigos.',
    highlight: 'Story « Noche de tacos »',
    highlightCaption: 'Guardado en Favoritos',
    location: 'Medellín · Cena en restaurante',
    badgeLabel: 'Instagram',
    postImageAlt: 'Intérieur du restaurant avec décoration mexicaine moderne.',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80',
    highlightImageUrl: 'https://images.unsplash.com/photo-1555992336-fb0d29498b13?auto=format&fit=crop&w=320&q=80',
    postImageUrl: 'https://images.unsplash.com/photo-1555992336-fb0d29498b13?auto=format&fit=crop&w=640&q=80',
  },
  review5: {
    name: 'Carlos Ramírez',
    handle: '@carloseat',
    timeAgo: 'hace 3 semanas',
    message:
      'Probé el nuevo taco vegano y quedé impresionado: el jackfruit sabe casi igual que la carne deshebrada y la textura es perfecta. Además, las salsas caseras son otro nivel.',
    highlight: 'Reel « Opciones veganas que sorprenden »',
    highlightCaption: 'Comentarios positivos',
    location: 'Cali · Almuerzo',
    badgeLabel: 'Instagram',
    postImageAlt: 'Tacos végétaliens avec garnitures colorées.',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=320&q=80',
    highlightImageUrl: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=320&q=80',
    postImageUrl: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=640&q=80',
  },
  review6: {
    name: 'Juliana Gómez',
    handle: '@julie.foodstories',
    timeAgo: 'hace 1 mes',
    message:
      'Pedimos catering para un cumpleaños y fue éxito total: tacos mini, dips calientes y una mesa que se veía divina para fotos. Todo llegó puntual y con instrucciones claras.',
    highlight: 'Story « Fiesta privada »',
    highlightCaption: 'Reseñas con confeti',
    location: 'Cartagena · Evento privado',
    badgeLabel: 'Instagram',
    postImageAlt: 'Buffet coloré avec tacos, dips et accompagnements.',
    avatarUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=320&q=80',
    highlightImageUrl: 'https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?auto=format&fit=crop&w=320&q=80',
    postImageUrl: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=640&q=80',
  },
  review7: {
    name: 'Manuela Herrera',
    handle: '@manuelatryit',
    timeAgo: 'hace 6 semanas',
    message:
      'Amo que tengan opciones veggies sin perder el toque cheddar: las quesadillas con hongos y maíz dulce son mi nueva obsesión. Además, la atención es rapidísima.',
    highlight: 'Reel « Veggie Lovers »',
    highlightCaption: 'Comentarios verdes y felices',
    location: 'Bogotá · Servicio para llevar',
    badgeLabel: 'Instagram',
    postImageAlt: 'Quesadillas dorées servies avec salsa verde.',
    avatarUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=320&q=80',
    highlightImageUrl: 'https://images.unsplash.com/photo-1528712306091-ed0763094c98?auto=format&fit=crop&w=320&q=80',
    postImageUrl: 'https://images.unsplash.com/photo-1528712306091-ed0763094c98?auto=format&fit=crop&w=640&q=80',
  },
};

const trimOrEmpty = (value: string): string => value.trim();

const isNonEmptyString = (value: string | null | undefined): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const resolveFontFamily = (value: string | null | undefined, fallback: string): string =>
  isNonEmptyString(value) ? value.trim() : fallback;

const resolveFontSize = (value: string | null | undefined, fallback: string): string =>
  isNonEmptyString(value) ? value.trim() : fallback;

const resolveColor = (value: string | null | undefined, fallback: string): string =>
  isNonEmptyString(value) ? value.trim() : fallback;

const resolveString = (value: string | null | undefined, fallback: string): string => {
  if (typeof value !== 'string') {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

const sanitizeImage = (value: string | null | undefined): string => {
  if (typeof value !== 'string') {
    return '';
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? normalizeCloudinaryImageUrl(trimmed) : '';
};

const resolveImage = (value: string | undefined, fallback: string | null): string => {
  if (typeof value !== 'string') {
    return fallback ?? '';
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? normalizeCloudinaryImageUrl(trimmed) : fallback ?? '';
};

const sanitizeInstagramReviewRecords = (
  reviews: Partial<Record<InstagramReviewId, Partial<InstagramReview>>> | null | undefined,
): Record<InstagramReviewId, InstagramReview> => {
  const sanitized: Record<InstagramReviewId, InstagramReview> = {} as Record<
    InstagramReviewId,
    InstagramReview
  >;
  INSTAGRAM_REVIEW_IDS.forEach(id => {
    const source = reviews?.[id] ?? {};
    sanitized[id] = {
      name: trimOrEmpty(source?.name ?? ''),
      handle: trimOrEmpty(source?.handle ?? ''),
      timeAgo: trimOrEmpty(source?.timeAgo ?? ''),
      message: trimOrEmpty(source?.message ?? ''),
      highlight: trimOrEmpty(source?.highlight ?? ''),
      highlightCaption: trimOrEmpty(source?.highlightCaption ?? ''),
      location: trimOrEmpty(source?.location ?? ''),
      badgeLabel: trimOrEmpty(source?.badgeLabel ?? ''),
      postImageAlt: trimOrEmpty(source?.postImageAlt ?? ''),
      avatarUrl: sanitizeImage(source?.avatarUrl),
      highlightImageUrl: sanitizeImage(source?.highlightImageUrl),
      postImageUrl: sanitizeImage(source?.postImageUrl),
    };
  });
  return sanitized;
};

const sanitizeElementStyleValue = (value: string | null | undefined): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const sanitizeElementStyle = (style: ElementStyle | undefined | null): ElementStyle | null => {
  if (!style) {
    return null;
  }

  const textColor = sanitizeElementStyleValue(style.textColor ?? null);
  const fontFamily = sanitizeElementStyleValue(style.fontFamily ?? null);
  const fontSize = sanitizeElementStyleValue(style.fontSize ?? null);
  const backgroundColor = sanitizeElementStyleValue(style.backgroundColor ?? null);

  const sanitized: ElementStyle = {};

  if (textColor) {
    sanitized.textColor = textColor;
  }
  if (fontFamily) {
    sanitized.fontFamily = fontFamily;
  }
  if (fontSize) {
    sanitized.fontSize = fontSize;
  }
  if (backgroundColor) {
    sanitized.backgroundColor = backgroundColor;
  }

  return Object.keys(sanitized).length > 0 ? sanitized : null;
};

const resolveElementStyles = (
  styles: ElementStyles | null | undefined,
  fallback: ElementStyles,
): ElementStyles => {
  const source = styles ?? fallback;
  const resolved: ElementStyles = {};

  EDITABLE_ELEMENT_KEYS.forEach(key => {
    const sanitized = sanitizeElementStyle(source[key] ?? null);
    if (sanitized) {
      resolved[key as EditableElementKey] = sanitized;
    }
  });

  return resolved;
};

const sanitizeElementStyles = (styles: ElementStyles | undefined, fallback: ElementStyles): ElementStyles => {
  const source = styles ?? fallback;
  const sanitized: ElementStyles = {};

  EDITABLE_ELEMENT_KEYS.forEach(key => {
    const entry = sanitizeElementStyle(source[key] ?? null);
    if (entry) {
      sanitized[key as EditableElementKey] = entry;
    }
  });

  return sanitized;
};

const resolveElementRichText = (
  richText: ElementRichText | null | undefined,
  fallback: ElementRichText,
): ElementRichText => {
  const source: ElementRichText = richText ?? fallback;
  const resolved: ElementRichText = {};

  EDITABLE_ELEMENT_KEYS.forEach(key => {
    const entry = source[key as EditableElementKey];
    const sanitized = sanitizeRichTextValue(entry ?? null);
    if (sanitized) {
      resolved[key as EditableElementKey] = sanitized;
    }
  });

  return resolved;
};

const sanitizeElementRichText = (
  richText: ElementRichText | undefined,
  fallback: ElementRichText,
): ElementRichText => {
  const source: ElementRichText = richText ?? fallback;
  const sanitized: ElementRichText = {};

  EDITABLE_ELEMENT_KEYS.forEach(key => {
    const entry = source[key as EditableElementKey];
    const value = sanitizeRichTextValue(entry ?? null);
    if (value) {
      sanitized[key as EditableElementKey] = value;
    }
  });

  return sanitized;
};

const ASSET_TYPES: CustomizationAssetType[] = ['image', 'video', 'audio', 'font', 'raw'];

const generateAssetId = (): string => `asset-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const resolveAssetType = (type: unknown): CustomizationAssetType =>
  ASSET_TYPES.includes(type as CustomizationAssetType) ? (type as CustomizationAssetType) : 'raw';

const resolveAssetTimestamp = (value: unknown): string => {
  if (typeof value === 'string') {
    const timestamp = Date.parse(value);
    if (!Number.isNaN(timestamp)) {
      return new Date(timestamp).toISOString();
    }
  }
  return new Date().toISOString();
};

const sanitizeCustomizationAsset = (asset: CustomizationAsset | null | undefined): CustomizationAsset | null => {
  if (!asset) {
    return null;
  }

  const id = typeof asset.id === 'string' && asset.id.trim().length > 0 ? asset.id : generateAssetId();
  const url = typeof asset.url === 'string' && asset.url.trim().length > 0 ? asset.url : '';
  const alt = typeof asset.alt === 'string' ? asset.alt.trim() : '';
  const type = resolveAssetType(asset.type);
  const createdAt = resolveAssetTimestamp(asset.createdAt);

  if (!url) {
    return null;
  }

  return {
    id,
    url,
    alt,
    type,
    createdAt,
  };
};

const sanitizeSiteAssets = (assets: SiteAssets | undefined, fallback: SiteAssets): SiteAssets => {
  const source = assets ?? fallback;
  const library = Array.isArray(source.library)
    ? (source.library
        .map(entry => sanitizeCustomizationAsset(entry))
        .filter(Boolean) as CustomizationAsset[])
    : fallback.library;

  return {
    library,
  };
};

const DEFAULT_NAVIGATION_STYLE: SectionStyle = {
  background: {
    type: 'color',
    color: '#0f172a',
    image: null,
  },
  fontFamily: 'Inter',
  fontSize: '16px',
  textColor: '#f1f5f9',
};

const DEFAULT_HERO_STYLE: SectionStyle = {
  background: {
    type: 'image',
    color: '#0f172a',
    image: 'https://picsum.photos/seed/tacosbg/1920/1080',
  },
  fontFamily: 'Inter',
  fontSize: '18px',
  textColor: '#f8fafc',
};

const DEFAULT_ABOUT_STYLE: SectionStyle = {
  background: {
    type: 'color',
    color: '#ffffff',
    image: null,
  },
  fontFamily: 'Inter',
  fontSize: '16px',
  textColor: '#0f172a',
};

const DEFAULT_MENU_STYLE: SectionStyle = {
  background: {
    type: 'color',
    color: '#f8fafc',
    image: null,
  },
  fontFamily: 'Inter',
  fontSize: '16px',
  textColor: '#0f172a',
};

const DEFAULT_INSTAGRAM_REVIEWS_STYLE: SectionStyle = {
  background: {
    type: 'color',
    color: '#ffffff',
    image: null,
  },
  fontFamily: 'Inter',
  fontSize: '16px',
  textColor: '#0f172a',
};

const DEFAULT_FIND_US_STYLE: SectionStyle = {
  background: {
    type: 'color',
    color: '#f8fafc',
    image: null,
  },
  fontFamily: 'Inter',
  fontSize: '16px',
  textColor: '#0f172a',
};

const DEFAULT_FOOTER_STYLE: SectionStyle = {
  background: {
    type: 'color',
    color: '#0f172a',
    image: null,
  },
  fontFamily: 'Inter',
  fontSize: '14px',
  textColor: '#f1f5f9',
};

const DEFAULT_ELEMENT_STYLES: ElementStyles = {};

const DEFAULT_ELEMENT_RICH_TEXT: ElementRichText = {};

const DEFAULT_SITE_ASSETS: SiteAssets = {
  library: [],
};

const resolveSectionStyle = (style: Partial<SectionStyle> | undefined, fallback: SectionStyle): SectionStyle => {
  const backgroundType = style?.background?.type === 'image' ? 'image' : 'color';
  const backgroundColor = resolveColor(style?.background?.color, fallback.background.color);
  const backgroundImage =
    backgroundType === 'image'
      ? resolveImage(style?.background?.image ?? undefined, fallback.background.image)
      : null;

  return {
    background: {
      type: backgroundType,
      color: backgroundType === 'color' ? backgroundColor : resolveColor(style?.background?.color, fallback.background.color),
      image: backgroundType === 'image' ? backgroundImage : null,
    },
    fontFamily: resolveFontFamily(style?.fontFamily ?? null, fallback.fontFamily),
    fontSize: resolveFontSize(style?.fontSize ?? null, fallback.fontSize),
    textColor: resolveColor(style?.textColor ?? null, fallback.textColor),
  };
};

const sanitizeSectionStyle = (style: SectionStyle | undefined, fallback: SectionStyle): SectionStyle => {
  const backgroundType = style?.background?.type === 'image' ? 'image' : 'color';
  const sanitizedColor = resolveColor(style?.background?.color ?? null, fallback.background.color);
  const sanitizedImage = backgroundType === 'image' ? sanitizeImage(style?.background?.image ?? null) : null;

  return {
    background: {
      type: backgroundType,
      color: sanitizedColor,
      image: backgroundType === 'image' ? sanitizedImage : null,
    },
    fontFamily: resolveFontFamily(style?.fontFamily ?? null, fallback.fontFamily),
    fontSize: resolveFontSize(style?.fontSize ?? null, fallback.fontSize),
    textColor: resolveColor(style?.textColor ?? null, fallback.textColor),
  };
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  navigation: {
    brand: 'OUIOUITACOS',
    brandLogo: '/logo-brand.svg',
    staffLogo: '/logo-staff.svg',
    links: {
      home: 'Accueil',
      about: 'À propos',
      menu: 'Menu',
      contact: 'Contact',
      loginCta: 'Staff Login',
    },
    style: DEFAULT_NAVIGATION_STYLE,
  },
  hero: {
    title: 'Tacos Authentiques',
    subtitle: 'Saveurs mexicaines à Bogotá',
    ctaLabel: 'Commander maintenant',
    backgroundImage: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=1920&q=80',
    historyTitle: 'Commandes récentes',
    reorderCtaLabel: 'Commander à nouveau',
    style: DEFAULT_HERO_STYLE,
  },
  about: {
    title: 'Notre histoire',
    description:
      'OUIOUITACOS a été fondé en 2020 avec une mission simple : apporter les saveurs authentiques du Mexique à Bogotá. Nous utilisons des ingrédients frais et des recettes traditionnelles pour créer des tacos délicieux qui vous transporteront directement à Mexico.',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=640&q=80',
    style: DEFAULT_ABOUT_STYLE,
  },
  menu: {
    title: 'Notre menu',
    ctaLabel: 'Commander',
    loadingLabel: 'Chargement du menu...',
    image: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=640&q=80',
    style: DEFAULT_MENU_STYLE,
  },
  instagramReviews: {
    title: 'Ce que disent nos clients',
    subtitle: 'Suivez-nous sur Instagram @ouiouitacos',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=640&q=80',
    style: DEFAULT_INSTAGRAM_REVIEWS_STYLE,
    reviews: DEFAULT_INSTAGRAM_REVIEW_ITEMS,
  },
  findUs: {
    title: 'Nous trouver',
    addressLabel: 'Adresse',
    address: 'Cra 53 #75-98',
    cityLabel: 'Ville',
    city: 'Barranquilla, Atlántico',
    hoursLabel: 'Heures d\'ouverture',
    hours: 'Lun-Dim: 11h00 - 22h00',
    mapLabel: 'Voir sur Google Maps',
    mapUrl:
      'https://www.google.com/maps?q=OUIOUITACOS%2C%20Cra%2053%20%2375-98%2C%20Barranquilla%2C%20Atl%C3%A1ntico%2C%20Colombie',
    style: DEFAULT_FIND_US_STYLE,
  },
  footer: {
    text: 'Tous droits réservés.',
    style: DEFAULT_FOOTER_STYLE,
  },
  elementStyles: DEFAULT_ELEMENT_STYLES,
  elementRichText: DEFAULT_ELEMENT_RICH_TEXT,
  assets: DEFAULT_SITE_ASSETS,
};

export const resolveSiteContent = (content?: Partial<SiteContent> | null): SiteContent => {
  const base = DEFAULT_SITE_CONTENT;
  return {
    navigation: {
      brand: resolveString(content?.navigation?.brand, base.navigation.brand),
      brandLogo: resolveImage(content?.navigation?.brandLogo, base.navigation.brandLogo),
      staffLogo: resolveImage(content?.navigation?.staffLogo, base.navigation.staffLogo),
      links: {
        home: resolveString(content?.navigation?.links?.home, base.navigation.links.home),
        about: resolveString(content?.navigation?.links?.about, base.navigation.links.about),
        menu: resolveString(content?.navigation?.links?.menu, base.navigation.links.menu),
        contact: resolveString(content?.navigation?.links?.contact, base.navigation.links.contact),
        loginCta: resolveString(content?.navigation?.links?.loginCta, base.navigation.links.loginCta),
      },
      style: resolveSectionStyle(content?.navigation?.style, base.navigation.style),
    },
    hero: {
      title: resolveString(content?.hero?.title, base.hero.title),
      subtitle: resolveString(content?.hero?.subtitle, base.hero.subtitle),
      ctaLabel: resolveString(content?.hero?.ctaLabel, base.hero.ctaLabel),
      backgroundImage: resolveImage(content?.hero?.backgroundImage, base.hero.backgroundImage),
      historyTitle: resolveString(content?.hero?.historyTitle, base.hero.historyTitle),
      reorderCtaLabel: resolveString(content?.hero?.reorderCtaLabel, base.hero.reorderCtaLabel),
      style: resolveSectionStyle(content?.hero?.style, base.hero.style),
    },
    about: {
      title: resolveString(content?.about?.title, base.about.title),
      description: resolveString(content?.about?.description, base.about.description),
      image: resolveImage(content?.about?.image, base.about.image),
      style: resolveSectionStyle(content?.about?.style, base.about.style),
    },
    menu: {
      title: resolveString(content?.menu?.title, base.menu.title),
      ctaLabel: resolveString(content?.menu?.ctaLabel, base.menu.ctaLabel),
      loadingLabel: resolveString(content?.menu?.loadingLabel, base.menu.loadingLabel),
      image: resolveImage(content?.menu?.image, base.menu.image),
      style: resolveSectionStyle(content?.menu?.style, base.menu.style),
    },
    instagramReviews: {
      title: resolveString(content?.instagramReviews?.title, base.instagramReviews.title),
      subtitle: resolveString(content?.instagramReviews?.subtitle, base.instagramReviews.subtitle),
      image: resolveImage(content?.instagramReviews?.image, base.instagramReviews.image),
      style: resolveSectionStyle(content?.instagramReviews?.style, base.instagramReviews.style),
      reviews: content?.instagramReviews?.reviews ?? base.instagramReviews.reviews,
    },
    findUs: {
      title: resolveString(content?.findUs?.title, base.findUs.title),
      addressLabel: resolveString(content?.findUs?.addressLabel, base.findUs.addressLabel),
      address: resolveString(content?.findUs?.address, base.findUs.address),
      cityLabel: resolveString(content?.findUs?.cityLabel, base.findUs.cityLabel),
      city: resolveString(content?.findUs?.city, base.findUs.city),
      hoursLabel: resolveString(content?.findUs?.hoursLabel, base.findUs.hoursLabel),
      hours: resolveString(content?.findUs?.hours, base.findUs.hours),
      mapLabel: resolveString(content?.findUs?.mapLabel, base.findUs.mapLabel),
      mapUrl: resolveString(content?.findUs?.mapUrl, base.findUs.mapUrl),
      style: resolveSectionStyle(content?.findUs?.style, base.findUs.style),
    },
    footer: {
      text: resolveString(content?.footer?.text, base.footer.text),
      style: resolveSectionStyle(content?.footer?.style, base.footer.style),
    },
    elementStyles: resolveElementStyles(content?.elementStyles, base.elementStyles),
    elementRichText: resolveElementRichText(content?.elementRichText, base.elementRichText),
    assets: content?.assets ?? base.assets,
  };
};

export const sanitizeSiteContentInput = (content: Partial<SiteContent>): SiteContent => ({
  navigation: {
    brand: trimOrEmpty(content.navigation?.brand ?? ''),
    brandLogo: sanitizeImage(content.navigation?.brandLogo),
    staffLogo: sanitizeImage(content.navigation?.staffLogo),
    links: {
      home: trimOrEmpty(content.navigation?.links?.home ?? ''),
      about: trimOrEmpty(content.navigation?.links?.about ?? ''),
      menu: trimOrEmpty(content.navigation?.links?.menu ?? ''),
      contact: trimOrEmpty(content.navigation?.links?.contact ?? ''),
      loginCta: trimOrEmpty(content.navigation?.links?.loginCta ?? ''),
    },
    style: sanitizeSectionStyle(content.navigation?.style, DEFAULT_NAVIGATION_STYLE),
  },
  hero: {
    title: trimOrEmpty(content.hero?.title ?? ''),
    subtitle: trimOrEmpty(content.hero?.subtitle ?? ''),
    ctaLabel: trimOrEmpty(content.hero?.ctaLabel ?? ''),
    backgroundImage: sanitizeImage(content.hero?.backgroundImage),
    historyTitle: trimOrEmpty(content.hero?.historyTitle ?? ''),
    reorderCtaLabel: trimOrEmpty(content.hero?.reorderCtaLabel ?? ''),
    style: sanitizeSectionStyle(content.hero?.style, DEFAULT_HERO_STYLE),
  },
  about: {
    title: trimOrEmpty(content.about?.title ?? ''),
    description: trimOrEmpty(content.about?.description ?? ''),
    image: sanitizeImage(content.about?.image),
    style: sanitizeSectionStyle(content.about?.style, DEFAULT_ABOUT_STYLE),
  },
  menu: {
    title: trimOrEmpty(content.menu?.title ?? ''),
    ctaLabel: trimOrEmpty(content.menu?.ctaLabel ?? ''),
    loadingLabel: trimOrEmpty(content.menu?.loadingLabel ?? ''),
    image: sanitizeImage(content.menu?.image),
    style: sanitizeSectionStyle(content.menu?.style, DEFAULT_MENU_STYLE),
  },
  instagramReviews: {
    title: trimOrEmpty(content.instagramReviews?.title ?? ''),
    subtitle: trimOrEmpty(content.instagramReviews?.subtitle ?? ''),
    image: sanitizeImage(content.instagramReviews?.image),
    style: sanitizeSectionStyle(content.instagramReviews?.style, DEFAULT_INSTAGRAM_REVIEWS_STYLE),
    reviews: sanitizeInstagramReviewRecords(content.instagramReviews?.reviews ?? null),
  },
  findUs: {
    title: trimOrEmpty(content.findUs?.title ?? ''),
    addressLabel: trimOrEmpty(content.findUs?.addressLabel ?? ''),
    address: trimOrEmpty(content.findUs?.address ?? ''),
    cityLabel: trimOrEmpty(content.findUs?.cityLabel ?? ''),
    city: trimOrEmpty(content.findUs?.city ?? ''),
    hoursLabel: trimOrEmpty(content.findUs?.hoursLabel ?? ''),
    hours: trimOrEmpty(content.findUs?.hours ?? ''),
    mapLabel: trimOrEmpty(content.findUs?.mapLabel ?? ''),
    mapUrl: trimOrEmpty(content.findUs?.mapUrl ?? ''),
    style: sanitizeSectionStyle(content.findUs?.style, DEFAULT_FIND_US_STYLE),
  },
  footer: {
    text: trimOrEmpty(content.footer?.text ?? ''),
    style: sanitizeSectionStyle(content.footer?.style, DEFAULT_FOOTER_STYLE),
  },
  elementStyles: sanitizeElementStyles(content.elementStyles, DEFAULT_ELEMENT_STYLES),
  elementRichText: sanitizeElementRichText(content.elementRichText, DEFAULT_ELEMENT_RICH_TEXT),
  assets: sanitizeSiteAssets(content.assets, DEFAULT_SITE_ASSETS),
});
