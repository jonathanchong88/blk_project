import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

function SalvationHero() {
  const { t } = useTranslation();

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      {/* Background layers */}
      <motion.div
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=2074&auto=format&fit=crop")',
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}
      />
      {/* Deep gradient overlay */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to bottom, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.75) 60%, rgba(10,10,10,1) 100%)' }} />

      {/* Radial warm glow */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(184,125,0,0.18) 0%, transparent 70%)' }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', maxWidth: '900px' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Eyebrow */}
          <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#B87D00', marginBottom: '24px' }}>
            {t('salvation.hero.eyebrow')}
          </p>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(4rem, 12vw, 9rem)',
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            textTransform: 'uppercase',
            color: '#ffffff',
            marginBottom: '32px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}>
            {t('salvation.hero.title')}
          </h1>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: '60px', height: '3px', background: 'linear-gradient(90deg, #B87D00, #f5c842)', borderRadius: '99px', margin: '0 auto 32px' }}
          />

          {/* Subtitle */}
          <p style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', color: 'rgba(255,255,255,0.65)', fontWeight: 400, maxWidth: '560px', margin: '0 auto 48px', lineHeight: 1.7 }}>
            {t('salvation.hero.subtitle')}
          </p>

          {/* CTA */}
          <motion.a
            href="#commitment"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'inline-block',
              padding: '16px 40px',
              background: 'linear-gradient(135deg, #B87D00, #f5c842)',
              color: '#0a0a0a',
              fontWeight: 800,
              fontSize: '0.85rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              borderRadius: '999px',
              textDecoration: 'none',
              boxShadow: '0 0 40px rgba(184,125,0,0.35)',
            }}
          >
            {t('salvation.hero.cta')}
          </motion.a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
      >
        <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>{t('salvation.hero.scroll')}</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, #B87D00, transparent)' }}
        />
      </motion.div>
    </div>
  );
}

export default SalvationHero;