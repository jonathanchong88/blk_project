import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

function SalvationCommitmentForm({ BASE_URL }) {
  const { t } = useTranslation();

  const decisions = [
    { value: 'I followed Jesus today', label: t('salvation.form.decision1.label'), desc: t('salvation.form.decision1.desc') },
    { value: 'I want to learn more', label: t('salvation.form.decision2.label'), desc: t('salvation.form.decision2.desc') },
    { value: 'I need prayer', label: t('salvation.form.decision3.label'), desc: t('salvation.form.decision3.desc') },
  ];

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    decision_type: '',
  });
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.decision_type) { alert(t('salvation.form.alert')); return; }
    setStatus('submitting');
    try {
      const res = await fetch(`${BASE_URL}/api/salvation/commit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="salvation-form-root" id="commitment" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', maxWidth: '520px', width: '100%' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3, stiffness: 200 }}
            style={{
              width: '88px', height: '88px', borderRadius: '50%',
              background: 'rgba(184,125,0,0.15)',
              border: '1px solid rgba(184,125,0,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 32px', fontSize: '2.5rem',
            }}
          >
            ✨
          </motion.div>
          <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', textTransform: 'uppercase', margin: '0 0 20px' }}>
            {t('salvation.form.success.title')}
          </h2>
          <div style={{ width: '40px', height: '2px', background: 'linear-gradient(90deg,#B87D00,#f5c842)', borderRadius: '99px', margin: '0 auto 24px' }} />
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', lineHeight: 1.8 }}>
            {t('salvation.form.success.desc')}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="salvation-form-root" id="commitment">
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: '56px' }}
        >
          <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#B87D00', marginBottom: '16px' }}>{t('salvation.form.eyebrow')}</p>
          <h2 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', textTransform: 'uppercase', margin: '0 0 16px' }}>
            {t('salvation.form.title')}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
            {t('salvation.form.subtitle')}
          </p>
        </motion.div>

        {/* Decision selector cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}
        >
          {decisions.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setFormData({ ...formData, decision_type: d.value })}
              className={`salvation-decision-card${formData.decision_type === d.value ? ' selected' : ''}`}
            >
              {/* Radio dot */}
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${formData.decision_type === d.value ? '#B87D00' : 'rgba(255,255,255,0.2)'}`,
                background: formData.decision_type === d.value ? '#B87D00' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.25s',
              }}>
                {formData.decision_type === d.value && (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />
                )}
              </div>
              <div>
                <div style={{ color: formData.decision_type === d.value ? '#f5c842' : '#fff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '2px', transition: 'color 0.25s' }}>
                  {d.label}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem' }}>{d.desc}</div>
              </div>
            </button>
          ))}
        </motion.div>

        {/* Form fields */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label>{t('salvation.form.first_name')}</label>
              <input
                type="text" placeholder="Jane" required
                value={formData.first_name}
                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>
            <div>
              <label>{t('salvation.form.last_name')}</label>
              <input
                type="text" placeholder="Doe" required
                value={formData.last_name}
                onChange={e => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label>{t('salvation.form.email')}</label>
            <input
              type="email" placeholder="jane@example.com" required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label>
              {t('salvation.form.phone')}{' '}
              <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400, textTransform: 'none', letterSpacing: 'normal', fontSize: '0.75rem' }}>{t('salvation.form.optional')}</span>
            </label>
            <input
              type="tel" placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="salvation-submit-btn"
          >
            {status === 'submitting' ? (
              <span>{t('salvation.form.submitting')}</span>
            ) : (
              <>
                <span>{t('salvation.form.submit')}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </>
            )}
          </button>

          <AnimatePresence>
            {status === 'error' && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                style={{ color: '#ff6b6b', textAlign: 'center', fontSize: '0.875rem', margin: 0 }}
              >
                {t('salvation.form.error')}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.form>
      </div>
    </div>
  );
}

export default SalvationCommitmentForm;