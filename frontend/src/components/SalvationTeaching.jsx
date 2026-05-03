import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const MotionStep = ({ step, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.8, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
    style={{
      background: '#111111',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '24px',
      padding: '40px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* glow accent */}
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #B87D00, #f5c842, transparent)' }} />
    <span style={{ fontSize: '3rem', fontWeight: 900, color: 'rgba(184,125,0,0.15)', lineHeight: 1, letterSpacing: '-0.04em' }}>{step.number}</span>
    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', textTransform: 'uppercase', margin: 0 }}>{step.title}</h3>
    <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem', lineHeight: 1.75, margin: 0 }}>{step.body}</p>
    <div style={{ borderLeft: '2px solid #B87D00', paddingLeft: '16px', marginTop: '8px' }}>
      <p style={{ color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', fontSize: '0.9rem', margin: '0 0 4px' }}>{step.verse}</p>
      <span style={{ fontSize: '0.75rem', color: '#B87D00', fontWeight: 700, letterSpacing: '0.1em' }}>{step.ref}</span>
    </div>
  </motion.div>
);

function SalvationTeaching() {
  const { t } = useTranslation();

  const steps = [
    {
      number: '01',
      title: t('salvation.teaching.step1.title'),
      body: t('salvation.teaching.step1.body'),
      verse: t('salvation.teaching.step1.verse'),
      ref: 'Romans 3:23',
    },
    {
      number: '02',
      title: t('salvation.teaching.step2.title'),
      body: t('salvation.teaching.step2.body'),
      verse: t('salvation.teaching.step2.verse'),
      ref: 'John 3:16',
    },
    {
      number: '03',
      title: t('salvation.teaching.step3.title'),
      body: t('salvation.teaching.step3.body'),
      verse: t('salvation.teaching.step3.verse'),
      ref: 'Romans 10:9',
    },
  ];

  return (
    <div style={{ background: '#0a0a0a', padding: '120px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', marginBottom: '80px' }}
        >
          <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#B87D00', marginBottom: '16px' }}>{t('salvation.teaching.eyebrow')}</p>
          <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', textTransform: 'uppercase', margin: '0 0 24px' }}>
            {t('salvation.teaching.title')}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto 40px', lineHeight: 1.8 }}>
            {t('salvation.teaching.subtitle')}
          </p>
        </motion.div>

        {/* Steps grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '80px' }}>
          {steps.map((step, i) => <MotionStep key={i} step={step} index={i} />)}
        </div>

        {/* Prayer card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: 'linear-gradient(135deg, #1a1200 0%, #111111 60%)',
            border: '1px solid rgba(184,125,0,0.3)',
            borderRadius: '28px',
            padding: 'clamp(40px, 6vw, 72px)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at 50% 0%, rgba(184,125,0,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#B87D00', marginBottom: '20px' }}>{t('salvation.teaching.prayer.eyebrow')}</p>
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'rgba(255,255,255,0.8)',
            lineHeight: 1.9,
            fontStyle: 'italic',
            maxWidth: '680px',
            margin: '0 auto 24px',
          }}>
            {t('salvation.teaching.prayer.body_pt1')}<span style={{ color: '#f5c842', fontStyle: 'normal', fontWeight: 700 }}>{t('salvation.teaching.prayer.amen')}</span>{t('salvation.teaching.prayer.body_pt2')}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default SalvationTeaching;