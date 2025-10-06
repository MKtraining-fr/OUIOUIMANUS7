// Types pour la personnalisation du site

/**
 * Type d'asset de personnalisation
 */
export type CustomizationAssetType = 'image' | 'video';

/**
 * Asset de personnalisation (image ou vidéo)
 */
export interface CustomizationAsset {
  id: string;
  type: CustomizationAssetType;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

/**
 * Texte riche pour les éléments éditables
 */
export interface ElementRichText {
  value: string;
  plainText: string;
}

/**
 * Style d'un élément
 */
export interface ElementStyle {
  value: string;
}

/**
 * Styles des éléments
 */
export interface ElementStyles {
  [key: string]: ElementStyle;
}

/**
 * Contenu du site
 */
export interface SiteContent {
  [key: string]: ElementRichText | CustomizationAsset | SiteContent;
}

/**
 * Assets du site
 */
export interface SiteAssets {
  [key: string]: CustomizationAsset;
}

/**
 * Style de fond d'une section
 */
export interface SectionBackgroundStyle {
  type: 'color' | 'image';
  color: string;
  image: string | null;
}

/**
 * Style d'une section
 */
export interface SectionStyle {
  background: SectionBackgroundStyle;
  fontFamily: string;
  fontSize: string;
  textColor: string;
}

/**
 * Valeur de texte riche
 */
export interface RichTextValue {
  html: string;
  plainText: string;
}

/**
 * IDs des avis Instagram
 */
export const INSTAGRAM_REVIEW_IDS = [
  'review1',
  'review2',
  'review3',
  'review4',
  'review5',
  'review6',
  'review7',
  'review8',
  'review9',
] as const;

export type InstagramReviewId = (typeof INSTAGRAM_REVIEW_IDS)[number];

/**
 * Champs de texte des avis Instagram
 */
export const INSTAGRAM_REVIEW_TEXT_FIELDS = [
  'name',
  'handle',
  'timeAgo',
  'message',
  'highlight',
  'highlightCaption',
  'location',
  'badgeLabel',
  'postImageAlt',
] as const;

/**
 * Champs d'image des avis Instagram
 */
export const INSTAGRAM_REVIEW_IMAGE_FIELDS = ['avatarUrl', 'highlightImageUrl', 'postImageUrl'] as const;

export type InstagramReviewTextField = (typeof INSTAGRAM_REVIEW_TEXT_FIELDS)[number];
export type InstagramReviewImageField = (typeof INSTAGRAM_REVIEW_IMAGE_FIELDS)[number];
export type InstagramReviewField = InstagramReviewTextField | InstagramReviewImageField;

export type InstagramReviewElementKey<
  Field extends InstagramReviewField = InstagramReviewField,
> = `instagramReviews.reviews.${InstagramReviewId}.${Field}`;

/**
 * Clés des zones éditables
 */
export const EDITABLE_ZONE_KEYS = ['navigation', 'hero', 'about', 'menu', 'instagramReviews', 'findUs', 'footer'] as const;

export type EditableZoneKey = (typeof EDITABLE_ZONE_KEYS)[number];

/**
 * Clés des éléments éditables de base
 */
const BASE_EDITABLE_ELEMENT_KEYS = [
  'navigation.brand',
  'navigation.brandLogo',
  'navigation.staffLogo',
  'navigation.links.home',
  'navigation.links.about',
  'navigation.links.menu',
  'navigation.links.contact',
  'navigation.links.loginCta',
  'navigation.style.background',
  'hero.title',
  'hero.subtitle',
  'hero.ctaLabel',
  'hero.historyTitle',
  'hero.reorderCtaLabel',
  'hero.backgroundImage',
  'about.title',
  'about.description',
  'about.image',
  'about.style.background',
  'menu.title',
  'menu.ctaLabel',
  'menu.loadingLabel',
  'menu.image',
  'menu.style.background',
  'instagramReviews.title',
  'instagramReviews.subtitle',
  'instagramReviews.image',
  'instagramReviews.style.background',
  'findUs.title',
  'findUs.addressLabel',
  'findUs.address',
  'findUs.cityLabel',
  'findUs.city',
  'findUs.hoursLabel',
  'findUs.hours',
  'findUs.mapLabel',
  'findUs.style.background',
  'footer.text',
  'footer.style.background',
] as const;

const INSTAGRAM_REVIEW_FIELDS = [
  ...INSTAGRAM_REVIEW_TEXT_FIELDS,
  ...INSTAGRAM_REVIEW_IMAGE_FIELDS,
] as readonly InstagramReviewField[];

const INSTAGRAM_REVIEW_ELEMENT_KEYS = INSTAGRAM_REVIEW_IDS.flatMap(id =>
  INSTAGRAM_REVIEW_FIELDS.map(
    field => `instagramReviews.reviews.${id}.${field}` as InstagramReviewElementKey,
  ),
) as readonly InstagramReviewElementKey[];

/**
 * Toutes les clés des éléments éditables
 */
export const EDITABLE_ELEMENT_KEYS = [
  ...BASE_EDITABLE_ELEMENT_KEYS,
  ...INSTAGRAM_REVIEW_ELEMENT_KEYS,
] as const;

export type EditableElementKey = (typeof EDITABLE_ELEMENT_KEYS)[number];

/**
 * Clés des éléments éditables avec style
 */
export const STYLE_EDITABLE_ELEMENT_KEYS = EDITABLE_ELEMENT_KEYS.filter(
  key =>
    !key.endsWith('.style.background') &&
    !key.endsWith('.image') &&
    !key.endsWith('.avatarUrl') &&
    !key.endsWith('.highlightImageUrl') &&
    !key.endsWith('.postImageUrl') &&
    key !== 'hero.backgroundImage' &&
    key !== 'navigation.brandLogo' &&
    key !== 'navigation.staffLogo',
) as EditableElementKey[];

/**
 * Avis Instagram
 */
export interface InstagramReview {
  name: string;
  handle: string;
  avatarUrl: string;
  timeAgo: string;
  message: string;
  highlight: string;
  highlightCaption: string;
  highlightImageUrl: string;
  location: string;
  badgeLabel: string;
  postImageUrl: string;
  postImageAlt: string;
}
