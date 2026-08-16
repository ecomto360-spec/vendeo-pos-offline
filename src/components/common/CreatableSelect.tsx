import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Plus, Check, X } from 'lucide-react';

interface CreatableSelectProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  searchPlaceholder?: string;
  onAddNewOption?: (newOpt: string) => void;
  className?: string;
  required?: boolean;
}

export const CreatableSelect: React.FC<CreatableSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Choisir ou ajouter...',
  searchPlaceholder = 'Tapez pour rechercher ou ajouter une nouvelle valeur',
  onAddNewOption,
  className = '',
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Unique sorted list of options
  const allOptions: string[] = Array.from(new Set((options || []).filter((opt): opt is string => typeof opt === 'string' && opt.trim().length > 0)));
  const filteredOptions: string[] = allOptions.filter((opt: string) =>
    opt.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const exactMatch: boolean = allOptions.some(
    (opt: string) => opt.toLowerCase() === searchQuery.trim().toLowerCase()
  );

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleCreateNew = () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    if (onAddNewOption) {
      onAddNewOption(trimmed);
    }
    onChange(trimmed);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`relative space-y-1.5 ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Trigger Box */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-11 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
          isOpen
            ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
        }`}
      >
        <span className={value ? 'text-slate-900 dark:text-white' : 'text-slate-400 font-normal'}>
          {value || placeholder}
        </span>
        <div className="flex items-center gap-1.5">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-600"
              title="Effacer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-blue-500' : ''
            }`}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden p-2 space-y-2 animate-in fade-in zoom-in-95 duration-150">
          {/* Search Input */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full h-10 pl-9 pr-3 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Options Container */}
          <div className="max-h-52 overflow-y-auto space-y-1 custom-scrollbar pr-1">
            {/* If user typed a search query that doesn't exist, offer to add it */}
            {searchQuery.trim().length > 0 && !exactMatch && (
              <button
                type="button"
                onClick={handleCreateNew}
                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 transition-colors flex items-center gap-2 border border-blue-200/60 dark:border-blue-800/60"
              >
                <Plus className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <span className="truncate">
                  Ajouter <strong>"{searchQuery.trim()}"</strong>
                </span>
              </button>
            )}

            {/* List of matching options */}
            {filteredOptions.map((opt) => (
              <button
                type="button"
                key={opt}
                onClick={() => handleSelect(opt)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
                  value === opt
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                }`}
              >
                <span className="truncate">{opt}</span>
                {value === opt && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
              </button>
            ))}

            {/* Empty State */}
            {filteredOptions.length === 0 && !searchQuery.trim() && (
              <div className="py-6 px-4 text-center text-slate-400 dark:text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                  <Search className="w-5 h-5 opacity-50" />
                </div>
                <p className="font-semibold text-[11px] text-slate-400 dark:text-slate-500 max-w-[220px]">
                  Aucun élément — tapez pour ajouter une nouvelle valeur
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
