import React from 'react';
import { AiAccountabilityPanel } from '../components/ai/AiAccountabilityPanel';

export const AiAgentPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', padding: '24px 20px' }}>
      <AiAccountabilityPanel />
    </div>
  );
};
