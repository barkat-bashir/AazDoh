import React, { useState } from 'react';
import { PartnerDashboard } from '../components/partnership/PartnerDashboard';
import { InvitePartnerModal } from '../components/partnership/InvitePartnerModal';
import { CommitmentDiscussionModal } from '../components/partnership/CommitmentDiscussionModal';
import { Commitment } from '../api/commitmentApi';

export const PartnersPage: React.FC = () => {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [discussionCommitment, setDiscussionCommitment] = useState<Commitment | null>(null);

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '24px 20px' }}>
      <PartnerDashboard
        onOpenInviteModal={() => setIsInviteOpen(true)}
        onOpenDiscussion={(c) => setDiscussionCommitment(c)}
      />

      <InvitePartnerModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={() => {
          // Re-render handled within dashboard
        }}
      />

      <CommitmentDiscussionModal
        commitment={discussionCommitment}
        isOpen={!!discussionCommitment}
        onClose={() => setDiscussionCommitment(null)}
      />
    </div>
  );
};
