import React from 'react';
import SalvationHero from './SalvationHero';
import SalvationTeaching from './SalvationTeaching';
import SalvationFAQ from './SalvationFAQ';
import SalvationCommitmentForm from './SalvationCommitmentForm';

function Salvation({ BASE_URL }) {
  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <SalvationHero />
      <SalvationTeaching />
      <SalvationFAQ />
      <SalvationCommitmentForm BASE_URL={BASE_URL} />
    </div>
  );
}

export default Salvation;