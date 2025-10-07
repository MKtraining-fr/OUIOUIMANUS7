import { Clock, Edit2, Mail, MapPin, Star } from 'lucide-react';
import {
  EditableElementKey,
  EditableZoneKey,
  Product,
  SiteContent,
} from '../types';
import useCustomFonts from '../hooks/useCustomFonts';
import {
  createBackgroundStyle,
  createBodyTextStyle,
  createElementBackgroundStyle,
  createElementBodyTextStyle,
  createElementTextStyle,
  createHeroBackgroundStyle,
  createTextStyle,
} from '../utils/siteStyleHelpers';
import { formatCurrencyCOP } from '../utils/formatIntegerAmount';
import { withAppendedQueryParam } from '../utils/url';

const DEFAULT_BRAND_LOGO = 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663122822197/MPAKZElDQoWYZSba.svg';

export const resolveZoneFromElement = (element: EditableElementKey): EditableZoneKey => {
  if (element.startsWith('navigation.')) {
    return 'navigation';
  }
  if (element.startsWith('hero.')) {
    return 'hero';
  }
  if (element.startsWith('about.')) {
    return 'about';
  }
  if (element.startsWith('menu.')) {
    return 'menu';
  }
  if (element.startsWith('instagramReviews.')) {
    return 'instagramReviews';
  }
  if (element.startsWith('findUs.')) {
    return 'findUs';
  }
  if (element.startsWith('footer.')) {
    return 'footer';
  }
  throw new Error(`Unknown element: ${element}`);
};

interface SitePreviewCanvasProps {
  content: SiteContent | null;
  products?: Product[];
  activeElement?: EditableElementKey | null;
  onElementClick?: (element: EditableElementKey) => void;
  className?: string;
}

const SitePreviewCanvas: React.FC<SitePreviewCanvasProps> = ({
  content,
  products,
  activeElement,
  onElementClick,
  className,
}) => {
  useCustomFonts();

  const handleElementClick = (element: EditableElementKey) => (e: React.MouseEvent) => {
    e.preventDefault();
    onElementClick?.(element);
  };

  const renderEditableElement = (element: EditableElementKey, children: React.ReactNode) => {
    const isActive = activeElement === element;
    return (
      <div
        className={`group relative ${isActive ? 'outline outline-2 outline-brand-primary' : ''}`}
        onClick={onElementClick ? handleElementClick(element) : undefined}
      >
        {onElementClick && (
          <div
            className={`absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 opacity-0 shadow-sm transition group-hover:opacity-100 ${
              isActive ? '!opacity-100' : ''
            }`}
          >
            <Edit2 className="h-3 w-3" />
          </div>
        )}
        {children}
      </div>
    );
  };

  if (!content) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center text-slate-500">Chargement du contenu...</div>
      </div>
    );
  }

  return (
    <div className={`site-preview ${className || ''}`}>
      {/* Navigation */}
      <header
        className="sticky top-0 z-10 border-b border-slate-200"
      style={createBackgroundStyle(content.navigation?.style?.background || { type: 'color', color: '#ffffff', image: null })}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8">
            {renderEditableElement(
              'navigation.brandLogo',
              <img
                src={content.navigation?.brandLogo?.url || 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663122822197/MPAKZElDQoWYZSba.svg'}
                alt={content.navigation?.brandLogo?.alt || 'Logo'}
                className="h-10 w-auto"
              />,
            )}
            {renderEditableElement(
              'navigation.brand',
              <div
                className="text-xl font-bold"
                style={createTextStyle(content.navigation?.style)}
              >
                {content.navigation?.brand?.value || 'Virtus'}
              </div>,
            )}
          </div>
          <nav className="hidden space-x-8 md:flex">
            {renderEditableElement(
              'navigation.links.home',
              <a
                href="#"
                className="text-sm font-medium"
                style={createTextStyle(content.navigation?.style)}
              >
                {content.navigation?.links?.home?.value || 'Accueil'}
              </a>,
            )}
            {renderEditableElement(
              'navigation.links.about',
              <a
                href="#about"
                className="text-sm font-medium"
                style={createTextStyle(content.navigation?.style)}
              >
                {content.navigation?.links?.about?.value || 'À propos'}
              </a>,
            )}
            {renderEditableElement(
              'navigation.links.menu',
              <a
                href="#menu"
                className="text-sm font-medium"
                style={createTextStyle(content.navigation?.style)}
              >
                {content.navigation?.links?.menu?.value || 'Menu'}
              </a>,
            )}
            {renderEditableElement(
              'navigation.links.contact',
              <a
                href="#contact"
                className="text-sm font-medium"
                style={createTextStyle(content.navigation?.style)}
              >
                {content.navigation?.links?.contact?.value || 'Contact'}
              </a>,
            )}
          </nav>
          <div>
            {renderEditableElement(
              'navigation.links.loginCta',
              <a
                href="/login"
                className="rounded-md bg-brand-primary px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              >
                {content.navigation?.links?.loginCta?.value || 'Connexion'}
              </a>,
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative overflow-hidden bg-cover bg-center py-32 text-white"
        style={createHeroBackgroundStyle(content.hero?.style, content.hero?.backgroundImage?.url)}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            {renderEditableElement(
              'hero.title',
              <h1
                className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
                dangerouslySetInnerHTML={{ __html: content.hero?.title?.value || 'Titre principal' }}
              />,
            )}
            {renderEditableElement(
              'hero.subtitle',
              <p className="mb-8 text-xl">
                {content.hero?.subtitle?.value || 'Sous-titre descriptif'}
              </p>,
            )}
            {renderEditableElement(
              'hero.ctaLabel',
              <a
                href="#menu"
                className="rounded-md bg-brand-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              >
                {content.hero?.ctaLabel?.value || 'Découvrir notre menu'}
              </a>,
            )}
          </div>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="py-24"
        style={createBackgroundStyle(content.about?.style?.background || { type: 'color', color: '#ffffff', image: null })}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              {renderEditableElement(
                'about.title',
                <h2
                  className="mb-6 text-3xl font-bold tracking-tight"
                  style={createTextStyle(content.about?.style)}
                >
                  {content.about?.title?.value || 'Notre histoire'}
                </h2>,
              )}
              {renderEditableElement(
                'about.description',
                <div
                  className="prose"
                  style={createBodyTextStyle(content.about?.style)}
                  dangerouslySetInnerHTML={{
                    __html: content.about?.description?.value || 'Description de notre histoire',
                  }}
                />,
              )}
            </div>
            <div className="flex items-center justify-center">
              {renderEditableElement(
                'about.image',
                <img
                  src={content.about?.image?.url || ''}
                  alt={content.about?.image?.alt || 'À propos de nous'}
                  className="rounded-lg object-cover shadow-lg"
                  style={{ maxHeight: '400px', width: '100%', objectFit: 'cover' }}
                />,
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Menu */}
      <section
        id="menu"
        className="py-24"
        style={createBackgroundStyle(content.menu?.style?.background || { type: 'color', color: '#ffffff', image: null })}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {renderEditableElement(
              'menu.title',
              <h2
                className="mb-12 text-3xl font-bold tracking-tight"
                style={createTextStyle(content.menu?.style)}
              >
                {content.menu?.title?.value || 'Notre menu'}
              </h2>,
            )}
          </div>

          {products && products.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {products.slice(0, 6).map(product => (
                <div
                  key={product.id}
                  className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <img
                    src={product.image_url || ''}
                    alt={product.nom_produit}
                    className="h-48 w-full object-cover"
                  />
                  <div className="p-4">
                    <h3 className="mb-2 text-lg font-medium">{product.nom_produit}</h3>
                    <p className="mb-4 text-sm text-slate-600 line-clamp-2">
                      {product.description || 'Aucune description disponible'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-brand-primary">
                        {formatCurrencyCOP(product.prix_vente)}
                      </span>
                      <button className="rounded-md bg-brand-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-primary/90">
                        Commander
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-slate-200 bg-white p-8">
              {renderEditableElement(
                'menu.loadingLabel',
                <p
                  className="text-center text-slate-500"
                  style={createBodyTextStyle(content.menu?.style)}
                >
                  {content.menu?.loadingLabel?.value || 'Chargement du menu...'}
                </p>,
              )}
            </div>
          )}

          <div className="mt-12 flex justify-center">
            {renderEditableElement(
              'menu.ctaLabel',
              <a
                href="/menu"
                className="rounded-md bg-brand-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              >
                {content.menu?.ctaLabel?.value || 'Voir tout le menu'}
              </a>,
            )}
          </div>
        </div>
      </section>

      {/* Instagram Reviews */}
      <section
        className="py-24"
        style={createBackgroundStyle(content.instagramReviews?.style?.background || { type: 'color', color: '#ffffff', image: null })}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {renderEditableElement(
              'instagramReviews.title',
              <h2
                className="mb-4 text-3xl font-bold tracking-tight"
                style={createTextStyle(content.instagramReviews?.style)}
              >
                {content.instagramReviews?.title?.value || 'Ce que disent nos clients'}
              </h2>,
            )}
            {renderEditableElement(
              'instagramReviews.subtitle',
              <p
                className="mb-12 text-lg"
                style={createBodyTextStyle(content.instagramReviews?.style)}
                dangerouslySetInnerHTML={{
                  __html:
                    content.instagramReviews?.subtitle?.value ||
                    'Rejoignez la conversation avec #VirtusRestaurant',
                }}
              />,
            )}
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Instagram Review 1 */}
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center">
                {renderEditableElement(
                  'instagramReviews.reviews.review1.avatarUrl',
                  <img
                    src={content.instagramReviews?.reviews?.review1?.avatarUrl || ''}
                    alt="Avatar"
                    className="mr-3 h-10 w-10 rounded-full object-cover"
                  />,
                )}
                <div>
                  {renderEditableElement(
                    'instagramReviews.reviews.review1.name',
                    <div className="font-medium">
                      {content.instagramReviews?.reviews?.review1?.name || 'Nom du client'}
                    </div>,
                  )}
                  {renderEditableElement(
                    'instagramReviews.reviews.review1.handle',
                    <div className="text-sm text-slate-500">
                      {content.instagramReviews?.reviews?.review1?.handle || '@handle'}
                    </div>,
                  )}
                </div>
                <div className="ml-auto rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5">
                  {renderEditableElement(
                    'instagramReviews.reviews.review1.badgeLabel',
                    <div className="rounded-full bg-white px-2 py-0.5 text-xs font-medium">
                      {content.instagramReviews?.reviews?.review1?.badgeLabel || 'Instagram'}
                    </div>,
                  )}
                </div>
              </div>
              {renderEditableElement(
                'instagramReviews.reviews.review1.message',
                <p className="mb-4 text-sm">
                  {content.instagramReviews?.reviews?.review1?.message ||
                    'Message de la critique client'}
                </p>,
              )}
              {renderEditableElement(
                'instagramReviews.reviews.review1.postImageUrl',
                <img
                  src={content.instagramReviews?.reviews?.review1?.postImageUrl || ''}
                  alt={
                    content.instagramReviews?.reviews?.review1?.postImageAlt ||
                    'Image de la publication'
                  }
                  className="mb-4 h-48 w-full rounded-lg object-cover"
                />,
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-slate-500">
                  <Clock className="mr-1 h-4 w-4" />
                  {renderEditableElement(
                    'instagramReviews.reviews.review1.timeAgo',
                    <span>
                      {content.instagramReviews?.reviews?.review1?.timeAgo || 'il y a 2 jours'}
                    </span>,
                  )}
                </div>
                <div className="flex items-center text-sm text-slate-500">
                  <MapPin className="mr-1 h-4 w-4" />
                  {renderEditableElement(
                    'instagramReviews.reviews.review1.location',
                    <span>
                      {content.instagramReviews?.reviews?.review1?.location || 'Emplacement'}
                    </span>,
                  )}
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-slate-50 p-3">
                <div className="flex items-center">
                  {renderEditableElement(
                    'instagramReviews.reviews.review1.highlightImageUrl',
                    <img
                      src={
                        content.instagramReviews?.reviews?.review1?.highlightImageUrl ||
                        ''
                      }
                      alt="Highlight"
                      className="mr-3 h-10 w-10 rounded-lg object-cover"
                    />,
                  )}
                  <div>
                    {renderEditableElement(
                      'instagramReviews.reviews.review1.highlight',
                      <div className="text-sm font-medium">
                        {content.instagramReviews?.reviews?.review1?.highlight || 'Highlight'}
                      </div>,
                    )}
                    {renderEditableElement(
                      'instagramReviews.reviews.review1.highlightCaption',
                      <div className="text-xs text-slate-500">
                        {content.instagramReviews?.reviews?.review1?.highlightCaption ||
                          'Caption du highlight'}
                      </div>,
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Instagram Review 2 */}
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center">
                {renderEditableElement(
                  'instagramReviews.reviews.review2.avatarUrl',
                  <img
                    src={
                      content.instagramReviews?.reviews?.review2?.avatarUrl ||
                      ''
                    }
                    alt="Avatar"
                    className="mr-3 h-10 w-10 rounded-full object-cover"
                  />,
                )}
                <div>
                  {renderEditableElement(
                    'instagramReviews.reviews.review2.name',
                    <div className="font-medium">
                      {content.instagramReviews?.reviews?.review2?.name || 'Nom du client'}
                    </div>,
                  )}
                  {renderEditableElement(
                    'instagramReviews.reviews.review2.handle',
                    <div className="text-sm text-slate-500">
                      {content.instagramReviews?.reviews?.review2?.handle || '@handle'}
                    </div>,
                  )}
                </div>
                <div className="ml-auto rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5">
                  {renderEditableElement(
                    'instagramReviews.reviews.review2.badgeLabel',
                    <div className="rounded-full bg-white px-2 py-0.5 text-xs font-medium">
                      {content.instagramReviews?.reviews?.review2?.badgeLabel || 'Instagram'}
                    </div>,
                  )}
                </div>
              </div>
              {renderEditableElement(
                'instagramReviews.reviews.review2.message',
                <p className="mb-4 text-sm">
                  {content.instagramReviews?.reviews?.review2?.message ||
                    'Message de la critique client'}
                </p>,
              )}
              {renderEditableElement(
                'instagramReviews.reviews.review2.postImageUrl',
                <img
                  src={
                    content.instagramReviews?.reviews?.review2?.postImageUrl ||
                    '''0x300'
                  }
                  alt={
                    content.instagramReviews?.reviews?.review2?.postImageAlt ||
                    'Image de la publication'
                  }
                  className="mb-4 h-48 w-full rounded-lg object-cover"
                />,
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-slate-500">
                  <Clock className="mr-1 h-4 w-4" />
                  {renderEditableElement(
                    'instagramReviews.reviews.review2.timeAgo',
                    <span>
                      {content.instagramReviews?.reviews?.review2?.timeAgo || 'il y a 5 jours'}
                    </span>,
                  )}
                </div>
                <div className="flex items-center text-sm text-slate-500">
                  <MapPin className="mr-1 h-4 w-4" />
                  {renderEditableElement(
                    'instagramReviews.reviews.review2.location',
                    <span>
                      {content.instagramReviews?.reviews?.review2?.location || 'Emplacement'}
                    </span>,
                  )}
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-slate-50 p-3">
                <div className="flex items-center">
                  {renderEditableElement(
                    'instagramReviews.reviews.review2.highlightImageUrl',
                    <img
                      src={
                        content.instagramReviews?.reviews?.review2?.highlightImageUrl ||
                        ''
                      }
                      alt="Highlight"
                      className="mr-3 h-10 w-10 rounded-lg object-cover"
                    />,
                  )}
                  <div>
                    {renderEditableElement(
                      'instagramReviews.reviews.review2.highlight',
                      <div className="text-sm font-medium">
                        {content.instagramReviews?.reviews?.review2?.highlight || 'Highlight'}
                      </div>,
                    )}
                    {renderEditableElement(
                      'instagramReviews.reviews.review2.highlightCaption',
                      <div className="text-xs text-slate-500">
                        {content.instagramReviews?.reviews?.review2?.highlightCaption ||
                          'Caption du highlight'}
                      </div>,
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Instagram Review 3 */}
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center">
                {renderEditableElement(
                  'instagramReviews.reviews.review3.avatarUrl',
                  <img
                    src={
                      content.instagramReviews?.reviews?.review3?.avatarUrl ||
                      ''
                    }
                    alt="Avatar"
                    className="mr-3 h-10 w-10 rounded-full object-cover"
                  />,
                )}
                <div>
                  {renderEditableElement(
                    'instagramReviews.reviews.review3.name',
                    <div className="font-medium">
                      {content.instagramReviews?.reviews?.review3?.name || 'Nom du client'}
                    </div>,
                  )}
                  {renderEditableElement(
                    'instagramReviews.reviews.review3.handle',
                    <div className="text-sm text-slate-500">
                      {content.instagramReviews?.reviews?.review3?.handle || '@handle'}
                    </div>,
                  )}
                </div>
                <div className="ml-auto rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5">
                  {renderEditableElement(
                    'instagramReviews.reviews.review3.badgeLabel',
                    <div className="rounded-full bg-white px-2 py-0.5 text-xs font-medium">
                      {content.instagramReviews?.reviews?.review3?.badgeLabel || 'Instagram'}
                    </div>,
                  )}
                </div>
              </div>
              {renderEditableElement(
                'instagramReviews.reviews.review3.message',
                <p className="mb-4 text-sm">
                  {content.instagramReviews?.reviews?.review3?.message ||
                    'Message de la critique client'}
                </p>,
              )}
              {renderEditableElement(
                'instagramReviews.reviews.review3.postImageUrl',
                <img
                  src={
                    content.instagramReviews?.reviews?.review3?.postImageUrl ||
                    '''0x300'
                  }
                  alt={
                    content.instagramReviews?.reviews?.review3?.postImageAlt ||
                    'Image de la publication'
                  }
                  className="mb-4 h-48 w-full rounded-lg object-cover"
                />,
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-slate-500">
                  <Clock className="mr-1 h-4 w-4" />
                  {renderEditableElement(
                    'instagramReviews.reviews.review3.timeAgo',
                    <span>
                      {content.instagramReviews?.reviews?.review3?.timeAgo || 'il y a 1 semaine'}
                    </span>,
                  )}
                </div>
                <div className="flex items-center text-sm text-slate-500">
                  <MapPin className="mr-1 h-4 w-4" />
                  {renderEditableElement(
                    'instagramReviews.reviews.review3.location',
                    <span>
                      {content.instagramReviews?.reviews?.review3?.location || 'Emplacement'}
                    </span>,
                  )}
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-slate-50 p-3">
                <div className="flex items-center">
                  {renderEditableElement(
                    'instagramReviews.reviews.review3.highlightImageUrl',
                    <img
                      src={
                        content.instagramReviews?.reviews?.review3?.highlightImageUrl ||
                        ''
                      }
                      alt="Highlight"
                      className="mr-3 h-10 w-10 rounded-lg object-cover"
                    />,
                  )}
                  <div>
                    {renderEditableElement(
                      'instagramReviews.reviews.review3.highlight',
                      <div className="text-sm font-medium">
                        {content.instagramReviews?.reviews?.review3?.highlight || 'Highlight'}
                      </div>,
                    )}
                    {renderEditableElement(
                      'instagramReviews.reviews.review3.highlightCaption',
                      <div className="text-xs text-slate-500">
                        {content.instagramReviews?.reviews?.review3?.highlightCaption ||
                          'Caption du highlight'}
                      </div>,
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Find Us */}
      <section
        id="contact"
        className="py-24"
        style={createBackgroundStyle(content.findUs?.style?.background || { type: 'color', color: '#ffffff', image: null })}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {renderEditableElement(
              'findUs.title',
              <h2
                className="mb-12 text-3xl font-bold tracking-tight"
                style={createTextStyle(content.findUs?.style)}
              >
                {content.findUs?.title?.value || 'Nous trouver'}
              </h2>,
            )}
          </div>

          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <div className="mb-8 space-y-6">
                <div>
                  {renderEditableElement(
                    'findUs.addressLabel',
                    <h3
                      className="mb-2 text-lg font-medium"
                      style={createTextStyle(content.findUs?.style)}
                    >
                      {content.findUs?.addressLabel?.value || 'Adresse'}
                    </h3>,
                  )}
                  {renderEditableElement(
                    'findUs.address',
                    <p
                      className="text-slate-600"
                      style={createBodyTextStyle(content.findUs?.style)}
                    >
                      {content.findUs?.address?.value || 'Adresse du restaurant'}
                    </p>,
                  )}
                </div>
                <div>
                  {renderEditableElement(
                    'findUs.cityLabel',
                    <h3
                      className="mb-2 text-lg font-medium"
                      style={createTextStyle(content.findUs?.style)}
                    >
                      {content.findUs?.cityLabel?.value || 'Ville'}
                    </h3>,
                  )}
                  {renderEditableElement(
                    'findUs.city',
                    <p
                      className="text-slate-600"
                      style={createBodyTextStyle(content.findUs?.style)}
                    >
                      {content.findUs?.city?.value || 'Ville du restaurant'}
                    </p>,
                  )}
                </div>
                <div>
                  {renderEditableElement(
                    'findUs.hoursLabel',
                    <h3
                      className="mb-2 text-lg font-medium"
                      style={createTextStyle(content.findUs?.style)}
                    >
                      {content.findUs?.hoursLabel?.value || 'Horaires'}
                    </h3>,
                  )}
                  {renderEditableElement(
                    'findUs.hours',
                    <p
                      className="text-slate-600"
                      style={createBodyTextStyle(content.findUs?.style)}
                      dangerouslySetInnerHTML={{
                        __html: content.findUs?.hours?.value || 'Horaires du restaurant',
                      }}
                    />,
                  )}
                </div>
              </div>
              {renderEditableElement(
                'findUs.mapLabel',
                <a
                  href={withAppendedQueryParam(
                    'https://www.google.com/maps/search/',
                    'q',
                    content.findUs?.address?.plainText || '',
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-md bg-brand-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {content.findUs?.mapLabel?.value || 'Voir sur Google Maps'}
                </a>,
              )}
            </div>
            <div className="h-80 overflow-hidden rounded-lg bg-slate-200">
              <iframe
                title="Google Maps"
                src={withAppendedQueryParam(
                  'https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8',
                  'q',
                  content.findUs?.address?.plainText || '',
                )}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-12 text-white"
        style={createTextStyle(content.footer?.style)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between space-y-6 md:flex-row md:space-y-0">
            <div className="flex items-center space-x-4">
              <img
                src={content.navigation?.brandLogo?.url || 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663122822197/MPAKZElDQoWYZSba.svg'}
                alt={content.navigation?.brandLogo?.alt || 'Logo'}
                className="h-8 w-auto"
              />
              <div className="text-lg font-bold">
                {content.navigation?.brand?.value || 'Virtus'}
              </div>
            </div>
            {renderEditableElement(
              'footer.text',
              <div className="text-sm">
                {content.footer?.text?.value || '© 2023 Virtus Restaurant. Tous droits réservés.'}
              </div>,
            )}
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-white/80">
                <span className="sr-only">Facebook</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-white hover:text-white/80">
                <span className="sr-only">Instagram</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-white hover:text-white/80">
                <span className="sr-only">Twitter</span>
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SitePreviewCanvas;
