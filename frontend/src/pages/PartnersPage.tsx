import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { PartnerDashboard } from '../components/partnership/PartnerDashboard';
import { InvitePartnerModal } from '../components/partnership/InvitePartnerModal';
import { CommitmentDiscussionModal } from '../components/partnership/CommitmentDiscussionModal';
import { Commitment } from '../api/commitmentApi';

export const PartnersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [discussionCommitment, setDiscussionCommitment] = useState<Commitment | null>(null);

  const invalidatePartners = () => {
    queryClient.invalidateQueries({ queryKey: ['partners'] });
    queryClient.invalidateQueries({ queryKey: ['unreadSummary'] });
  };

  return (
    <div className="page-container" style={{ maxWidth: '1080px' }}>
      <PartnerDashboard
        onOpenInviteModal={() => setIsInviteOpen(true)}
        onOpenDiscussion={(c) => setDiscussionCommitment(c)}
      />

      <InvitePartnerModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={invalidatePartners}
      />

      <CommitmentDiscussionModal
        commitment={discussionCommitment}
        isOpen={!!discussionCommitment}
        onClose={() => {
          setDiscussionCommitment(null);
          queryClient.invalidateQueries({ queryKey: ['partnerOverview'] });
          queryClient.invalidateQueries({ queryKey: ['unreadSummary'] });
        }}
      />
    </div>
  );
};
