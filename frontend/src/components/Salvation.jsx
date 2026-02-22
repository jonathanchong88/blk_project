import React from 'react';
import SalvationHero from './SalvationHero';
import SalvationTeaching from './SalvationTeaching';
import SalvationFAQ from './SalvationFAQ';
import SalvationCommitmentForm from './SalvationCommitmentForm';

function Salvation({ BASE_URL }) {
  return (
    <div className="salvation-page bg-white min-h-screen">
      <SalvationHero />
      <SalvationTeaching />
      <SalvationFAQ />
      <SalvationCommitmentForm BASE_URL={BASE_URL} />
    </div>
  );
}

export default Salvation;