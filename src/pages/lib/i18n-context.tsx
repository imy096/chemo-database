'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './auth-context';
import { supabase } from './supabase';

type Language = 'en' | 'fr';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const { user } = useAuth();

  useEffect(() => {
    const loadUserLanguage = async () => {
      if (user) {
        const { data } = await supabase
          .from('user_profiles')
          .select('preferred_language')
          .eq('id', user.id)
          .maybeSingle();

        if (data?.preferred_language) {
          setLanguageState(data.preferred_language as Language);
        }
      } else {
        const savedLang = localStorage.getItem('language') as Language;
        if (savedLang) {
          setLanguageState(savedLang);
        }
      }
    };

    loadUserLanguage();
  }, [user]);

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const module = await import(`../locales/${language}/translations.json`);
        setTranslations(module.default);
      } catch (error) {
        console.error('Failed to load translations:', error);
      }
    };

    loadTranslations();
  }, [language]);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);

    if (user) {
      await supabase
        .from('user_profiles')
        .update({ preferred_language: lang })
        .eq('id', user.id);
    }
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
