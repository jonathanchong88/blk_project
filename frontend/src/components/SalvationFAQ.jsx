import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

function FAQItem({ question, answer, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '28px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          gap: '24px',
        }}
      >
        <span style={{ color: open ? '#f5c842' : '#fff', fontWeight: 600, fontSize: '1rem', lineHeight: 1.5, transition: 'color 0.3s' }}>
          {question}
        </span>
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: open ? 'rgba(184,125,0,0.2)' : 'rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)',
            transition: 'background 0.3s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <line x1="7" y1="1" x2="7" y2="13" stroke={open ? '#f5c842' : 'rgba(255,255,255,0.6)'} strokeWidth="1.5" strokeLinecap="round" />
            <line x1="1" y1="7" x2="13" y2="7" stroke={open ? '#f5c842' : 'rgba(255,255,255,0.6)'} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', lineHeight: 1.8, paddingBottom: '28px', margin: 0 }}>
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SalvationFAQ() {
  const { t } = useTranslation();

  const faqs = [
    {
      question: t('salvation.faq.q1'),
      answer: t('salvation.faq.a1'),
    },
    {
      question: t('salvation.faq.q2'),
      answer: t('salvation.faq.a2'),
    },
    {
      question: t('salvation.faq.q3'),
      answer: t('salvation.faq.a3'),
    },
    {
      question: t('salvation.faq.q4'),
      answer: t('salvation.faq.a4'),
    },
    {
      question: t('salvation.faq.q5'),
      answer: t('salvation.faq.a5'),
    },
  ];

  return (
    <div style={{ background: '#0f0f0f', padding: '120px 24px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: '64px' }}
        >
          <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#B87D00', marginBottom: '16px' }}>{t('salvation.faq.eyebrow')}</p>
          <h2 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', textTransform: 'uppercase', margin: 0 }}>
            {t('salvation.faq.title')}
          </h2>
        </motion.div>

        <div>
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.question} answer={faq.answer} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default SalvationFAQ;