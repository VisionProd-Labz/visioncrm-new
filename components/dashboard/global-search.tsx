'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Users, Car, FileText, X, Package } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useModules } from '@/contexts/modules-context';

interface SearchResult {
  id: string;
  type: 'contact' | 'catalog' | 'vehicle' | 'quote' | 'invoice';
  title: string;
  subtitle?: string;
  href: string;
  module?: 'vehicles' | 'quotes' | 'invoices';
}

export function GlobalSearch() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isModuleEnabled } = useModules();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);

  // Données de démonstration - à remplacer par de vraies données de l'API
  const mockData: SearchResult[] = [
    { id: '1', type: 'contact', title: 'Jean Dupont', subtitle: 'jean.dupont@email.com', href: '/contacts/1' },
    { id: '2', type: 'contact', title: 'Marie Martin', subtitle: 'marie.martin@email.com', href: '/contacts/2' },
    { id: '3', type: 'contact', title: 'Sophie Dubois', subtitle: 'sophie.dubois@email.com', href: '/contacts/3' },
    { id: '4', type: 'catalog', title: 'Filtre à huile', subtitle: 'FO-001 • 12.50 €', href: '/catalog' },
    { id: '5', type: 'catalog', title: 'Plaquettes de frein', subtitle: 'PF-002 • 45.00 €', href: '/catalog' },
    { id: '6', type: 'vehicle', title: 'Peugeot 308', subtitle: 'AB-123-CD • Jean Dupont', href: '/vehicles/1', module: 'vehicles' },
    { id: '7', type: 'vehicle', title: 'Renault Clio', subtitle: 'EF-456-GH • Marie Martin', href: '/vehicles/2', module: 'vehicles' },
    { id: '8', type: 'quote', title: 'Devis #1245', subtitle: '1 250 € • Jean Dupont', href: '/quotes/1245', module: 'quotes' },
    { id: '9', type: 'quote', title: 'Devis #1246', subtitle: '850 € • Marie Martin', href: '/quotes/1246', module: 'quotes' },
    { id: '10', type: 'invoice', title: 'Facture #INV-2024-001', subtitle: '1 250 € • Jean Dupont', href: '/invoices/1', module: 'invoices' },
  ];

  useEffect(() => {
    if (search.trim()) {
      // Filtrer d'abord par modules activés
      const availableData = mockData.filter((item) => {
        if (item.module) {
          return isModuleEnabled(item.module);
        }
        return true;
      });

      // Recherche dans les données filtrées
      const filtered = availableData.filter((item) => {
        const searchLower = search.toLowerCase();
        return (
          item.title.toLowerCase().includes(searchLower) ||
          item.subtitle?.toLowerCase().includes(searchLower)
        );
      });
      setResults(filtered);
      setIsOpen(filtered.length > 0);
      setSelectedIndex(0);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [search, isModuleEnabled]);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex].href);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearch('');
    }
  };

  const handleSelect = (href: string) => {
    router.push(href);
    setIsOpen(false);
    setSearch('');
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'contact':
        return <Users className="h-4 w-4" />;
      case 'catalog':
        return <Package className="h-4 w-4" />;
      case 'vehicle':
        return <Car className="h-4 w-4" />;
      case 'quote':
      case 'invoice':
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'contact':
        return t('nav.contacts');
      case 'catalog':
        return t('nav.catalog');
      case 'vehicle':
        return t('nav.vehicles');
      case 'quote':
        return t('nav.quotes');
      case 'invoice':
        return t('nav.invoices');
    }
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => search && results.length > 0 && setIsOpen(true)}
          placeholder={t('search.placeholder')}
          className="w-full h-9 pl-10 pr-10 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {search && (
          <button
            onClick={() => {
              setSearch('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Résultats de recherche */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          <div className="p-2">
            {results.map((result, index) => (
              <button
                key={result.id}
                onClick={() => handleSelect(result.href)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  index === selectedIndex
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <div className="mt-0.5">{getIcon(result.type)}</div>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-medium text-foreground">{result.title}</div>
                  {result.subtitle && (
                    <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground shrink-0 mt-0.5">
                  {getTypeLabel(result.type)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
