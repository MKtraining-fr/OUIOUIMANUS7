import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
  useId,
} from 'react';
import { createPortal } from 'react-dom';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  Upload, 
  X, 
  Search, 
  Palette, 
  History, 
  Eye, 
  Settings,
  ChevronDown,
  ChevronUp,
  Filter,
  Save,
  Undo,
  Redo,
  Copy,
  Download,
  RefreshCw
} from 'lucide-react';
import SitePreviewCanvas, { resolveZoneFromElement } from '../components/SitePreviewCanvas';
import useSiteContent from '../hooks/useSiteContent';
import RichTextEditor from '../components/RichTextEditor';
import {
  CustomizationAsset,
  CustomizationAssetType,
  EditableElementKey,
  EditableZoneKey,
  ElementStyle,
  Product,
  RichTextValue,
  SectionStyle,
  SiteContent,
  STYLE_EDITABLE_ELEMENT_KEYS,
} from '../types';
import { api } from '../services/api';
import { normalizeCloudinaryImageUrl, uploadCustomizationAsset } from '../services/cloudinary';
import { sanitizeFontFamilyName } from '../utils/fonts';

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Merriweather', label: 'Merriweather' },
  { value: 'Oswald', label: 'Oswald' },
  { value: 'Raleway', label: 'Raleway' },
];

const COLOR_OPTIONS = [
  { value: '#ffffff', label: 'Blanc' },
  { value: '#f8fafc', label: 'Slate 50' },
  { value: '#f1f5f9', label: 'Slate 100' },
  { value: '#e2e8f0', label: 'Slate 200' },
  { value: '#cbd5e1', label: 'Slate 300' },
  { value: '#94a3b8', label: 'Slate 400' },
  { value: '#64748b', label: 'Slate 500' },
  { value: '#475569', label: 'Slate 600' },
  { value: '#334155', label: 'Slate 700' },
  { value: '#1e293b', label: 'Slate 800' },
  { value: '#0f172a', label: 'Slate 900' },
  { value: '#020617', label: 'Slate 950' },
  { value: '#000000', label: 'Noir' },
  { value: '#ef4444', label: 'Rouge' },
  { value: '#f97316', label: 'Orange' },
  { value: '#f59e0b', label: 'Ambre' },
  { value: '#eab308', label: 'Jaune' },
  { value: '#84cc16', label: 'Citron vert' },
  { value: '#22c55e', label: 'Vert' },
  { value: '#10b981', label: 'Émeraude' },
  { value: '#14b8a6', label: 'Sarcelle' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#0ea5e9', label: 'Bleu ciel' },
  { value: '#3b82f6', label: 'Bleu' },
  { value: '#6366f1', label: 'Indigo' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#a855f7', label: 'Pourpre' },
  { value: '#d946ef', label: 'Fuchsia' },
  { value: '#ec4899', label: 'Rose' },
  { value: '#f43f5e', label: 'Rose rouge' },
];

interface StyleEditorProps {
  style: ElementStyle | SectionStyle | null | undefined;
  onChange: (style: ElementStyle | SectionStyle) => void;
  className?: string;
}

const StyleEditor: React.FC<StyleEditorProps> = ({ style, onChange, className }) => {
  const handleColorChange = (key: keyof ElementStyle | keyof SectionStyle) => (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const value = e.target.value;
    onChange({
      ...style,
      [key]: value,
    });
  };

  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onChange({
      ...style,
      fontFamily: value,
    });
  };

  return (
    <div className={`space-y-4 ${className || ''}`}>
      <div>
        <label htmlFor="background-color" className="mb-1 block text-sm font-medium text-slate-700">
          Couleur de fond
        </label>
        <select
          id="background-color"
          className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
          value={(style?.background as string) || ''}
          onChange={handleColorChange('background')}
        >
          <option value="">Sélectionner une couleur</option>
          {COLOR_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="text-color" className="mb-1 block text-sm font-medium text-slate-700">
          Couleur du texte
        </label>
        <select
          id="text-color"
          className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
          value={(style?.color as string) || ''}
          onChange={handleColorChange('color')}
        >
          <option value="">Sélectionner une couleur</option>
          {COLOR_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="font-family" className="mb-1 block text-sm font-medium text-slate-700">
          Police de caractères
        </label>
        <select
          id="font-family"
          className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
          value={(style?.fontFamily as string) || ''}
          onChange={handleFontChange}
        >
          <option value="">Sélectionner une police</option>
          {FONT_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

interface ImageUploaderProps {
  onUpload: (asset: CustomizationAsset) => void;
  assetType: CustomizationAssetType;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload, assetType, className }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const asset = await uploadCustomizationAsset(file, assetType);
      onUpload(asset);
    } catch (err) {
      console.error('Failed to upload image', err);
      setError('Impossible de télécharger l\'image. Veuillez réessayer.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`space-y-2 ${className || ''}`}>
      <div className="flex items-center space-x-2">
        <label
          htmlFor="image-upload"
          className="inline-flex cursor-pointer items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
        >
          {isUploading ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-1.5 h-4 w-4" />
          )}
          Télécharger une image
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
          ref={fileInputRef}
        />
      </div>
      {error && (
        <div className="flex items-center text-sm text-red-600">
          <AlertTriangle className="mr-1 h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
};

interface ElementEditorProps {
  element: EditableElementKey;
  content: SiteContent;
  onUpdate: (element: EditableElementKey, value: any) => void;
  onClose: () => void;
}

const ElementEditor: React.FC<ElementEditorProps> = ({ element, content, onUpdate, onClose }) => {
  const [value, setValue] = useState<any>(null);
  const [isStyleEditorOpen, setIsStyleEditorOpen] = useState(false);
  const zone = resolveZoneFromElement(element);
  const isStyleEditable = STYLE_EDITABLE_ELEMENT_KEYS.includes(element);

  const elementPath = element.split('.');
  const elementType = elementPath[elementPath.length - 1];

  const resolveElementValue = useCallback(() => {
    let current: any = content;
    for (const key of elementPath) {
      if (current && typeof current === 'object') {
        current = current[key];
      } else {
        return null;
      }
    }
    return current;
  }, [content, elementPath]);

  const resolveZoneStyle = useCallback(() => {
    if (!zone || !content) return null;
    return content[zone]?.style;
  }, [zone, content]);

  useEffect(() => {
    setValue(resolveElementValue());
  }, [resolveElementValue]);

  const handleTextChange = (newValue: RichTextValue | null) => {
    setValue(prev => ({
      ...prev,
      value: newValue,
    }));
  };

  const handleImageUpload = (asset: CustomizationAsset) => {
    setValue(asset);
    onUpdate(element, asset);
  };

  const handleStyleChange = (newStyle: ElementStyle | SectionStyle) => {
    onUpdate(`${zone}.style`, newStyle);
  };

  const handleSave = () => {
    onUpdate(element, value);
    onClose();
  };

  const renderEditor = () => {
    if (!value) return null;

    if (elementType === 'style') {
      return (
        <StyleEditor
          style={value as ElementStyle | SectionStyle}
          onChange={handleStyleChange}
          className="mb-4"
        />
      );
    }

    if ('url' in value) {
      // It's an image
      return (
        <div className="mb-4 space-y-4">
          <div className="overflow-hidden rounded-md border border-slate-200">
            <img
              src={normalizeCloudinaryImageUrl(value.url)}
              alt={value.alt || 'Image'}
              className="h-auto w-full object-cover"
            />
          </div>
          <div>
            <label htmlFor="image-alt" className="mb-1 block text-sm font-medium text-slate-700">
              Texte alternatif
            </label>
            <input
              id="image-alt"
              type="text"
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              value={value.alt || ''}
              onChange={e => setValue({ ...value, alt: e.target.value })}
              placeholder="Description de l'image"
            />
          </div>
          <ImageUploader
            onUpload={handleImageUpload}
            assetType={elementType === 'backgroundImage' ? 'background' : 'content'}
          />
        </div>
      );
    }

    if ('value' in value || 'plainText' in value) {
      // It's text or rich text
      return (
        <div className="mb-4">
          <RichTextEditor
            id={`editor-${element}`}
            value={value.value}
            fallback=""
            onChange={handleTextChange}
            placeholder={`Entrez le contenu pour ${element}`}
          />
        </div>
      );
    }

    return (
      <div className="mb-4 rounded-md bg-amber-50 p-4 text-sm text-amber-800">
        <div className="flex">
          <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Type d'élément non pris en charge</p>
            <p className="mt-1">
              L'éditeur ne prend pas en charge ce type d'élément pour le moment.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-medium">Modifier {element}</h3>
          <button
            type="button"
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-4">
          {isStyleEditable && (
            <div className="mb-4">
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                onClick={() => setIsStyleEditorOpen(!isStyleEditorOpen)}
              >
                <Palette className="mr-1.5 h-4 w-4" />
                {isStyleEditorOpen ? 'Masquer les styles' : 'Modifier les styles de la section'}
                {isStyleEditorOpen ? (
                  <ChevronUp className="ml-1.5 h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-1.5 h-4 w-4" />
                )}
              </button>
              {isStyleEditorOpen && (
                <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-4">
                  <StyleEditor
                    style={resolveZoneStyle()}
                    onChange={handleStyleChange}
                    className="mb-4"
                  />
                </div>
              )}
            </div>
          )}
          {renderEditor()}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              type="button"
              className="rounded-md bg-brand-primary px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              onClick={handleSave}
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed right-4 top-4 z-50 flex w-80 items-center rounded-md p-4 shadow-md ${
        type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle2 className="mr-2 h-5 w-5 flex-shrink-0" />
      ) : (
        <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0" />
      )}
      <div className="flex-1">{message}</div>
      <button
        type="button"
        className="ml-2 rounded-full p-1 hover:bg-black/5"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

interface HistoryEntry {
  timestamp: number;
  content: SiteContent;
}

const SiteCustomization: React.FC = () => {
  const { content, loading, error, updateContent } = useSiteContent();
  const [activeElement, setActiveElement] = useState<EditableElementKey | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredElements, setFilteredElements] = useState<EditableElementKey[]>([]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    navigation: true,
    hero: true,
    about: true,
    menu: true,
    instagramReviews: true,
    findUs: true,
    footer: true,
  });

  const allEditableElements = useMemo<EditableElementKey[]>(() => {
    if (!content) return [];
    
    const elements: EditableElementKey[] = [];
    
    // Navigation
    elements.push('navigation.brand');
    elements.push('navigation.brandLogo');
    elements.push('navigation.links.home');
    elements.push('navigation.links.about');
    elements.push('navigation.links.menu');
    elements.push('navigation.links.contact');
    elements.push('navigation.links.loginCta');
    elements.push('navigation.style');
    
    // Hero
    elements.push('hero.title');
    elements.push('hero.subtitle');
    elements.push('hero.ctaLabel');
    elements.push('hero.backgroundImage');
    elements.push('hero.style');
    
    // About
    elements.push('about.title');
    elements.push('about.description');
    elements.push('about.image');
    elements.push('about.style');
    
    // Menu
    elements.push('menu.title');
    elements.push('menu.loadingLabel');
    elements.push('menu.ctaLabel');
    elements.push('menu.style');
    
    // Instagram Reviews
    elements.push('instagramReviews.title');
    elements.push('instagramReviews.subtitle');
    elements.push('instagramReviews.reviews.review1.avatarUrl');
    elements.push('instagramReviews.reviews.review1.name');
    elements.push('instagramReviews.reviews.review1.handle');
    elements.push('instagramReviews.reviews.review1.badgeLabel');
    elements.push('instagramReviews.reviews.review1.message');
    elements.push('instagramReviews.reviews.review1.postImageUrl');
    elements.push('instagramReviews.reviews.review1.timeAgo');
    elements.push('instagramReviews.reviews.review1.location');
    elements.push('instagramReviews.reviews.review1.highlightImageUrl');
    elements.push('instagramReviews.reviews.review1.highlight');
    elements.push('instagramReviews.reviews.review1.highlightCaption');
    elements.push('instagramReviews.reviews.review2.avatarUrl');
    elements.push('instagramReviews.reviews.review2.name');
    elements.push('instagramReviews.reviews.review2.handle');
    elements.push('instagramReviews.reviews.review2.badgeLabel');
    elements.push('instagramReviews.reviews.review2.message');
    elements.push('instagramReviews.reviews.review2.postImageUrl');
    elements.push('instagramReviews.reviews.review2.timeAgo');
    elements.push('instagramReviews.reviews.review2.location');
    elements.push('instagramReviews.reviews.review2.highlightImageUrl');
    elements.push('instagramReviews.reviews.review2.highlight');
    elements.push('instagramReviews.reviews.review2.highlightCaption');
    elements.push('instagramReviews.reviews.review3.avatarUrl');
    elements.push('instagramReviews.reviews.review3.name');
    elements.push('instagramReviews.reviews.review3.handle');
    elements.push('instagramReviews.reviews.review3.badgeLabel');
    elements.push('instagramReviews.reviews.review3.message');
    elements.push('instagramReviews.reviews.review3.postImageUrl');
    elements.push('instagramReviews.reviews.review3.timeAgo');
    elements.push('instagramReviews.reviews.review3.location');
    elements.push('instagramReviews.reviews.review3.highlightImageUrl');
    elements.push('instagramReviews.reviews.review3.highlight');
    elements.push('instagramReviews.reviews.review3.highlightCaption');
    elements.push('instagramReviews.style');
    
    // Find Us
    elements.push('findUs.title');
    elements.push('findUs.addressLabel');
    elements.push('findUs.address');
    elements.push('findUs.cityLabel');
    elements.push('findUs.city');
    elements.push('findUs.hoursLabel');
    elements.push('findUs.hours');
    elements.push('findUs.mapLabel');
    elements.push('findUs.style');
    
    // Footer
    elements.push('footer.text');
    elements.push('footer.style');
    
    return elements;
  }, [content]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = allEditableElements.filter(element => 
        element.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredElements(filtered);
    } else {
      setFilteredElements(allEditableElements);
    }
  }, [searchTerm, allEditableElements]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await api.getProducts();
        setProducts(fetchedProducts);
      } catch (err) {
        console.error('Failed to fetch products', err);
      }
    };

    void fetchProducts();
  }, []);

  useEffect(() => {
    if (content && historyIndex === -1) {
      setHistory([{ timestamp: Date.now(), content }]);
      setHistoryIndex(0);
    }
  }, [content, historyIndex]);

  const handleElementClick = useCallback((element: EditableElementKey) => {
    setActiveElement(element);
  }, []);

  const handleElementUpdate = useCallback(
    (element: EditableElementKey, value: any) => {
      if (!content) return;

      const newContent = { ...content };
      const elementPath = element.split('.');
      let current: any = newContent;

      // Navigate to the parent object
      for (let i = 0; i < elementPath.length - 1; i++) {
        const key = elementPath[i];
        if (!current[key]) {
          current[key] = {};
        }
        current = current[key];
      }

      // Set the value on the last key
      current[elementPath[elementPath.length - 1]] = value;

      // Add to history
      const newHistoryEntry = { timestamp: Date.now(), content: newContent };
      const newHistory = [...history.slice(0, historyIndex + 1), newHistoryEntry];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      // Update the content state
      updateContent(newContent)
        .then(() => {
          setNotification({
            message: 'Modifications enregistrées avec succès',
            type: 'success',
          });
        })
        .catch(err => {
          console.error('Failed to update content', err);
          setNotification({
            message: 'Impossible d\'enregistrer les modifications',
            type: 'error',
          });
        });
    },
    [content, history, historyIndex, updateContent],
  );

  const handleSave = useCallback(async () => {
    if (!content) return;

    setIsSaving(true);
    try {
      await updateContent(content);
      setNotification({
        message: 'Site enregistré avec succès',
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to save site', err);
      setNotification({
        message: 'Impossible d\'enregistrer le site',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  }, [content, updateContent]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const previousContent = history[historyIndex - 1].content;
      updateContent(previousContent).catch(err => {
        console.error('Failed to undo', err);
      });
    }
  }, [historyIndex, history, updateContent]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const nextContent = history[historyIndex + 1].content;
      updateContent(nextContent).catch(err => {
        console.error('Failed to redo', err);
      });
    }
  }, [historyIndex, history, updateContent]);

  const handleHistorySelect = useCallback(
    (index: number) => {
      setHistoryIndex(index);
      const selectedContent = history[index].content;
      updateContent(selectedContent).catch(err => {
        console.error('Failed to select history entry', err);
      });
      setIsHistoryOpen(false);
    },
    [history, updateContent],
  );

  const handleToggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const groupedElements = useMemo(() => {
    const grouped: Record<string, EditableElementKey[]> = {};
    
    filteredElements.forEach(element => {
      const section = element.split('.')[0];
      if (!grouped[section]) {
        grouped[section] = [];
      }
      grouped[section].push(element);
    });
    
    return grouped;
  }, [filteredElements]);

  const renderElementsList = () => {
    return Object.entries(groupedElements).map(([section, elements]) => (
      <div key={section} className="mb-2">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-md bg-slate-100 px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-200"
          onClick={() => handleToggleSection(section)}
        >
          <span className="capitalize">{section}</span>
          {expandedSections[section] ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {expandedSections[section] && (
          <div className="mt-1 space-y-1 pl-2">
            {elements.map(element => (
              <button
                key={element}
                type="button"
                className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                  activeElement === element
                    ? 'bg-brand-primary text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
                onClick={() => handleElementClick(element)}
              >
                {element}
              </button>
            ))}
          </div>
        )}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-primary" />
          <p className="mt-2 text-slate-600">Chargement du contenu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md rounded-lg bg-red-50 p-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-medium text-red-800">Erreur de chargement</h2>
          <p className="mt-2 text-red-700">{error}</p>
          <button
            type="button"
            className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 shadow-sm">
        <div className="flex items-center">
          <h1 className="text-lg font-medium">Personnalisation du site</h1>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button
              type="button"
              className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                previewMode === 'desktop'
                  ? 'bg-brand-primary text-white'
                  : 'bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50'
              }`}
              onClick={() => setPreviewMode('desktop')}
            >
              Bureau
            </button>
            <button
              type="button"
              className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                previewMode === 'mobile'
                  ? 'bg-brand-primary text-white'
                  : 'bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50'
              }`}
              onClick={() => setPreviewMode('mobile')}
            >
              Mobile
            </button>
          </div>
          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            >
              <History className="mr-1.5 h-4 w-4" />
              Historique
            </button>
            {isHistoryOpen && (
              <div className="absolute right-0 z-10 mt-1 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  {history.map((entry, index) => (
                    <button
                      key={entry.timestamp}
                      type="button"
                      className={`block w-full px-4 py-2 text-left text-sm ${
                        index === historyIndex
                          ? 'bg-brand-primary text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                      onClick={() => handleHistorySelect(index)}
                    >
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
          >
            <Undo className="mr-1.5 h-4 w-4" />
            Annuler
          </button>
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
          >
            <Redo className="mr-1.5 h-4 w-4" />
            Rétablir
          </button>
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-brand-primary px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-1.5 h-4 w-4" />
            )}
            Enregistrer
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 overflow-y-auto border-r border-slate-200 bg-white">
          <div className="p-4">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  className="block w-full rounded-md border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm placeholder:text-slate-400 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  placeholder="Rechercher un élément..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">{renderElementsList()}</div>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-4">
          <div
            className={`mx-auto ${
              previewMode === 'mobile' ? 'max-w-sm' : ''
            } overflow-hidden rounded-lg bg-white shadow-md`}
          >
            <SitePreviewCanvas
              content={content}
              products={products}
              activeElement={activeElement}
              onElementClick={handleElementClick}
              className={previewMode === 'mobile' ? 'mobile-preview' : ''}
            />
          </div>
        </div>
      </div>

      {/* Element editor modal */}
      {activeElement && content && (
        <ElementEditor
          element={activeElement}
          content={content}
          onUpdate={handleElementUpdate}
          onClose={() => setActiveElement(null)}
        />
      )}

      {/* Notification */}
      {notification &&
        createPortal(
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />,
          document.body,
        )}
    </div>
  );
};

export default SiteCustomization;
