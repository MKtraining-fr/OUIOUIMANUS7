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
} from '../types/all';
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
      'Increíble experiencia: la hamburguesa con queso azul y cebolla caramelizada es una obra maestra. El ambiente del lugar es súper acogedor y el servicio impecable. ¡Volveré pronto!',
    highlight: 'Post « Burger Night »',
    highlightCaption: '125 likes en 2 horas',
    location: 'Bogotá · Cena de viernes',
    badgeLabel: 'Instagram',
    postImageAlt: 'Hamburger juteux avec fromage bleu et oignons caramélisés.',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=320&q=80',
    highlightImageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=320&q=80',
    postImageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=640&q=80',
  },
  review4: {
    name: 'Valentina Gómez',
    handle: '@valen.gourmet',
    timeAgo: 'hace 2 semanas',
    message:
      'Este ceviche es una explosión de sabores: fresco, cítrico y con el toque justo de picante. La presentación es espectacular y el ambiente del restaurante es perfecto para una cena romántica.',
    highlight: 'Story « Seafood Lovers »',
    highlightCaption: 'Guardado por 45 personas',
    location: 'Cartagena · Cena a la playa',
    badgeLabel: 'Instagram',
    postImageAlt: 'Ceviche frais dans un bol avec garnitures colorées.',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80',
    highlightImageUrl: 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?auto=format&fit=crop&w=320&q=80',
    postImageUrl: 'https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?auto=format&fit=crop&w=640&q=80',
  },
  review5: {
    name: 'Carlos Ramírez',
    handle: '@carlos.eats',
    timeAgo: 'hace 3 semanas',
    message:
      'Los tacos de pescado son una delicia: tortilla crujiente, pescado fresco y esa salsa de aguacate que es para morirse. El ambiente casual y la música en vivo hacen que sea un lugar perfecto para salir con amigos.',
    highlight: 'Post « Taco Thursday »',
    highlightCaption: '78 comentarios',
    location: 'Cali · Almuerzo casual',
    badgeLabel: 'Instagram',
    postImageAlt: 'Tacos de poisson avec sauce à l'avocat et lime.',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80',
    highlightImageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=320&q=80',
    postImageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=640&q=80',
  },
  review6: {
    name: 'Isabella López',
    handle: '@isa.foodlover',
    timeAgo: 'hace 1 mes',
    message:
      'Este postre de chocolate es simplemente divino: intenso, cremoso y con ese toque de sal que lo eleva a otro nivel. El café que lo acompaña es perfecto. ¡Una experiencia para los sentidos!',
    highlight: 'Reel « Chocolate Dreams »',
    highlightCaption: '200+ reproducciones',
    location: 'Medellín · Merienda de tarde',
    badgeLabel: 'Instagram',
    postImageAlt: 'Dessert au chocolat avec sel de mer et café.',
    avatarUrl:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=320&q=80',
    highlightImageUrl: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=320&q=80',
    postImageUrl: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=640&q=80',
  },
  review7: {
    name: 'Miguel Ángel',
    handle: '@miguel.foodie',
    timeAgo: 'hace 2 meses',
    message:
      'La parrillada mixta es espectacular: carnes perfectamente cocinadas, chimichurri casero y esas papas criollas que son adictivas. Ambiente rústico y auténtico, perfecto para los amantes de la buena carne.',
    highlight: 'Post « Parrilla Master »',
    highlightCaption: '150 likes',
    location: 'Bogotá · Cena familiar',
    badgeLabel: 'Instagram',
    postImageAlt: 'Assiette de grillades mixtes avec chimichurri et pommes de terre.',
    avatarUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=320&q=80',
    highlightImageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=320&q=80',
    postImageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=640&q=80',
  },
  review8: {
    name: 'Sofia Rodríguez',
    handle: '@sofi.gourmet',
    timeAgo: 'hace 3 meses',
    message:
      'Este risotto de hongos es una delicia: cremoso, con el punto perfecto de cocción y ese sabor umami que te transporta. La copa de vino blanco que lo acompaña es la combinación perfecta.',
    highlight: 'Story « Italian Flavors »',
    highlightCaption: 'Guardado en Destacadas',
    location: 'Cartagena · Cena elegante',
    badgeLabel: 'Instagram',
    postImageAlt: 'Risotto aux champignons avec parmesan et vin blanc.',
    avatarUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=320&q=80',
    highlightImageUrl: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=320&q=80',
    postImageUrl: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=640&q=80',
  },
  review9: {
    name: 'Javier Morales',
    handle: '@javi.foodcritic',
    timeAgo: 'hace 4 meses',
    message:
      'Los tacos al pastor son auténticos: carne marinada a la perfección, piña fresca y esa salsa picante casera que es para morirse. El ambiente casual y los precios accesibles hacen que sea mi lugar favorito.',
    highlight: 'Post « Taco Tuesday »',
    highlightCaption: '95 comentarios',
    location: 'Medellín · Comida casual',
    badgeLabel: 'Instagram',
    postImageAlt: 'Tacos al pastor avec ananas et sauce piquante.',
    avatarUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=320&q=80',
    highlightImageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=320&q=80',
    postImageUrl: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=640&q=80',
  },
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  navigation: {
    brand: {
      value: 'Virtus',
      plainText: 'Virtus',
    },
    brandLogo: {
      id: 'brand-logo',
      type: 'image',
      url: '/logo-brand.svg',
      alt: 'Logo Virtus',
    },
    staffLogo: {
      id: 'staff-logo',
      type: 'image',
      url: '/logo-staff.svg',
      alt: 'Logo Virtus Staff',
    },
    links: {
      home: {
        value: 'Accueil',
        plainText: 'Accueil',
      },
      about: {
        value: 'À propos',
        plainText: 'À propos',
      },
      menu: {
        value: 'Menu',
        plainText: 'Menu',
      },
      contact: {
        value: 'Contact',
        plainText: 'Contact',
      },
      loginCta: {
        value: 'Connexion',
        plainText: 'Connexion',
      },
    },
    style: {
      background: {
        type: 'color',
        color: '#ffffff',
        image: null,
      },
    },
  },
  hero: {
    title: {
      value: 'Savourez l\'authenticité <br>à chaque bouchée',
      plainText: 'Savourez l\'authenticité à chaque bouchée',
    },
    subtitle: {
      value: 'Une expérience culinaire unique qui marie tradition et innovation',
      plainText: 'Une expérience culinaire unique qui marie tradition et innovation',
    },
    ctaLabel: {
      value: 'Découvrir notre menu',
      plainText: 'Découvrir notre menu',
    },
    historyTitle: {
      value: 'Votre historique de commandes',
      plainText: 'Votre historique de commandes',
    },
    reorderCtaLabel: {
      value: 'Commander à nouveau',
      plainText: 'Commander à nouveau',
    },
    backgroundImage: {
      id: 'hero-background',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1920&q=80',
      alt: 'Restaurant Virtus',
    },
  },
  about: {
    title: {
      value: 'Notre histoire',
      plainText: 'Notre histoire',
    },
    description: {
      value:
        '<p>Fondé en 2015 par le chef Juan Carlos Martínez, Virtus est né d\'une passion pour la cuisine authentique et les ingrédients de qualité.</p><p>Notre mission est simple : créer des plats qui racontent une histoire, qui évoquent des souvenirs et qui, surtout, régalent vos papilles.</p><p>Chaque jour, notre équipe s\'efforce de vous offrir une expérience culinaire exceptionnelle, dans un cadre chaleureux et accueillant.</p>',
      plainText:
        'Fondé en 2015 par le chef Juan Carlos Martínez, Virtus est né d\'une passion pour la cuisine authentique et les ingrédients de qualité.\n\nNotre mission est simple : créer des plats qui racontent une histoire, qui évoquent des souvenirs et qui, surtout, régalent vos papilles.\n\nChaque jour, notre équipe s\'efforce de vous offrir une expérience culinaire exceptionnelle, dans un cadre chaleureux et accueillant.',
    },
    image: {
      id: 'about-image',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1280&q=80',
      alt: 'Notre restaurant',
    },
    style: {
      background: {
        type: 'color',
        color: '#f8f9fa',
        image: null,
      },
    },
  },
  menu: {
    title: {
      value: 'Notre menu',
      plainText: 'Notre menu',
    },
    ctaLabel: {
      value: 'Commander maintenant',
      plainText: 'Commander maintenant',
    },
    loadingLabel: {
      value: 'Chargement du menu...',
      plainText: 'Chargement du menu...',
    },
    image: {
      id: 'menu-image',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1280&q=80',
      alt: 'Nos plats',
    },
    style: {
      background: {
        type: 'color',
        color: '#ffffff',
        image: null,
      },
    },
  },
  instagramReviews: {
    title: {
      value: 'Ce que disent nos clients',
      plainText: 'Ce que disent nos clients',
    },
    subtitle: {
      value: 'Rejoignez la conversation et partagez votre expérience avec <strong>#VirtusRestaurant</strong>',
      plainText: 'Rejoignez la conversation et partagez votre expérience avec #VirtusRestaurant',
    },
    image: {
      id: 'instagram-reviews-image',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1280&q=80',
      alt: 'Ambiance du restaurant',
    },
    style: {
      background: {
        type: 'color',
        color: '#f8f9fa',
        image: null,
      },
    },
    reviews: DEFAULT_INSTAGRAM_REVIEW_ITEMS,
  },
  findUs: {
    title: {
      value: 'Nous trouver',
      plainText: 'Nous trouver',
    },
    addressLabel: {
      value: 'Adresse',
      plainText: 'Adresse',
    },
    address: {
      value: 'Calle 85 #12-34, Bogotá, Colombie',
      plainText: 'Calle 85 #12-34, Bogotá, Colombie',
    },
    cityLabel: {
      value: 'Ville',
      plainText: 'Ville',
    },
    city: {
      value: 'Bogotá',
      plainText: 'Bogotá',
    },
    hoursLabel: {
      value: 'Horaires',
      plainText: 'Horaires',
    },
    hours: {
      value:
        'Lundi - Jeudi: 12h00 - 22h00<br>Vendredi - Samedi: 12h00 - 23h00<br>Dimanche: 12h00 - 21h00',
      plainText:
        'Lundi - Jeudi: 12h00 - 22h00\nVendredi - Samedi: 12h00 - 23h00\nDimanche: 12h00 - 21h00',
    },
    mapLabel: {
      value: 'Voir sur Google Maps',
      plainText: 'Voir sur Google Maps',
    },
    style: {
      background: {
        type: 'color',
        color: '#ffffff',
        image: null,
      },
    },
  },
  footer: {
    text: {
      value: '© 2023 Virtus Restaurant. Tous droits réservés.',
      plainText: '© 2023 Virtus Restaurant. Tous droits réservés.',
    },
    style: {
      background: {
        type: 'color',
        color: '#212529',
        image: null,
      },
    },
  },
};

export const resolveSiteContent = (content?: Partial<SiteContent>): SiteContent => {
  if (!content) {
    return DEFAULT_SITE_CONTENT;
  }

  const result = { ...DEFAULT_SITE_CONTENT };

  // Merge content recursively
  const mergeContent = (target: any, source: any) => {
    if (!source) {
      return target;
    }

    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) {
          target[key] = {};
        }
        mergeContent(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    });

    return target;
  };

  return mergeContent(result, content);
};

export const resolveElementValue = (
  content: SiteContent | null,
  key: EditableElementKey,
  defaultValue: string = '',
): string => {
  if (!content) {
    return defaultValue;
  }

  const parts = key.split('.');
  let current: any = content;

  for (const part of parts) {
    if (!current || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[part];
  }

  if (!current) {
    return defaultValue;
  }

  if (typeof current === 'object' && 'value' in current) {
    return current.value;
  }

  if (typeof current === 'object' && 'url' in current) {
    return current.url;
  }

  return defaultValue;
};

export const resolveElementPlainText = (
  content: SiteContent | null,
  key: EditableElementKey,
  defaultValue: string = '',
): string => {
  if (!content) {
    return defaultValue;
  }

  const parts = key.split('.');
  let current: any = content;

  for (const part of parts) {
    if (!current || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[part];
  }

  if (!current) {
    return defaultValue;
  }

  if (typeof current === 'object' && 'plainText' in current) {
    return current.plainText;
  }

  if (typeof current === 'object' && 'alt' in current) {
    return current.alt || defaultValue;
  }

  return defaultValue;
};

export const resolveElementAsset = (
  content: SiteContent | null,
  key: EditableElementKey,
): CustomizationAsset | null => {
  if (!content) {
    return null;
  }

  const parts = key.split('.');
  let current: any = content;

  for (const part of parts) {
    if (!current || typeof current !== 'object') {
      return null;
    }
    current = current[part];
  }

  if (!current || typeof current !== 'object' || !('type' in current) || !('url' in current)) {
    return null;
  }

  return {
    id: current.id || '',
    type: current.type as CustomizationAssetType,
    url: normalizeCloudinaryImageUrl(current.url),
    alt: current.alt || '',
    width: current.width || undefined,
    height: current.height || undefined,
  };
};

export const resolveElementRichText = (
  content: SiteContent | null,
  key: EditableElementKey,
): ElementRichText | null => {
  if (!content) {
    return null;
  }

  const parts = key.split('.');
  let current: any = content;

  for (const part of parts) {
    if (!current || typeof current !== 'object') {
      return null;
    }
    current = current[part];
  }

  if (!current || typeof current !== 'object' || !('value' in current) || !('plainText' in current)) {
    return null;
  }

  return {
    value: current.value,
    plainText: current.plainText,
  };
};

export const updateElementValue = (
  content: SiteContent,
  key: EditableElementKey,
  value: string | CustomizationAsset | ElementRichText,
): SiteContent => {
  const parts = key.split('.');
  const result = { ...content };
  let current: any = result;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part]) {
      current[part] = {};
    }
    current = current[part];
  }

  const lastPart = parts[parts.length - 1];
  if (typeof value === 'string') {
    if (!current[lastPart] || typeof current[lastPart] !== 'object') {
      current[lastPart] = {
        value,
        plainText: value,
      };
    } else if ('value' in current[lastPart]) {
      current[lastPart] = {
        ...current[lastPart],
        value,
        plainText: sanitizeRichTextValue(value).plainText,
      };
    } else {
      current[lastPart] = {
        ...current[lastPart],
        url: value,
      };
    }
  } else {
    current[lastPart] = value;
  }

  return result;
};
