import React from 'react';
import { useTranslation } from 'react-i18next';

function Hero() {
  const { t } = useTranslation();
  return (
    <div className="hero">
      <h1>{t('home.hero_title')}</h1>
      <p>{t('home.hero_subtitle')}</p>
    </div>
  );
}

export default Hero;