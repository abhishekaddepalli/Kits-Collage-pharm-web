import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCms } from '../../app/providers/CmsContext';

interface SeoHeadProps {
  noIndex?: boolean;
  pageTitle?: string;
  pageDescription?: string;
}

export const SeoHead: React.FC<SeoHeadProps> = ({ noIndex = false, pageTitle, pageDescription }) => {
  const { state } = useCms();
  const location = useLocation();
  const { seo, settings } = state;

  useEffect(() => {
    const title = pageTitle || seo.siteTitle || 'KITS College of Pharmacy for Women';
    const description = pageDescription || seo.siteDescription;

    document.title = title;

    const upsertMeta = (attr: 'name' | 'property', key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta(
      'name',
      'robots',
      noIndex || !seo.robotsIndex ? 'noindex, nofollow, noarchive' : 'index, follow'
    );

    const existingJsonLd = document.getElementById('kits-schema-jsonld');
    if (noIndex || !seo.enableStructuredData) {
      if (existingJsonLd) existingJsonLd.remove();
      return;
    }

    const baseUrl = (settings.general.websiteUrl || window.location.origin).replace(/\/$/, '');
    const schema = {
      '@context': 'https://schema.org',
      '@type': seo.institutionType || 'CollegeOrUniversity',
      name: settings.general.collegeName || 'KITS College of Pharmacy for Women',
      url: baseUrl,
      telephone: settings.contact.primaryPhone,
      email: settings.contact.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Tirupati (V), Divili, Peddapuram Mandal',
        addressLocality: 'Kakinada',
        addressRegion: 'Andhra Pradesh',
        postalCode: '533433',
        addressCountry: 'IN',
      },
      sameAs: Object.values(settings.social).filter(Boolean),
    };

    let script = existingJsonLd as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'kits-schema-jsonld';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);
  }, [
    location.pathname,
    noIndex,
    pageDescription,
    pageTitle,
    seo.enableStructuredData,
    seo.institutionType,
    seo.robotsIndex,
    seo.siteDescription,
    seo.siteTitle,
    settings.contact.email,
    settings.contact.primaryPhone,
    settings.general.collegeName,
    settings.general.websiteUrl,
    settings.social,
  ]);

  return null;
};
