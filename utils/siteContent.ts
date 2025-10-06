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
