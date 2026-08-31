import React from 'react';
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard';

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="page-container" style={{ maxWidth: '960px' }}>
      <AnalyticsDashboard />
    </div>
  );
};
