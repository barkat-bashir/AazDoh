import React from 'react';
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard';

export const AnalyticsPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 20px' }}>
      <AnalyticsDashboard />
    </div>
  );
};
