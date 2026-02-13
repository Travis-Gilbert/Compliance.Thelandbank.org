import { useState } from 'react';
import { AppIcon } from '../ui';
import ICONS from '../../icons/iconMap';
import ChapterHeader from './ChapterHeader';

/**
 * FlipCards — Chapter 1: "What This System Does"
 *
 * Three flip cards showing the portal's core capabilities.
 * Front: icon + headline + summary. Back: how it works.
 * Click to flip. CSS animation via .flip-card-* classes in index.css.
 */

const CARDS = [
  {
    id: 'sync',
    icon: ICONS.sync,
    frontTitle: 'Syncs Records',
    frontDetail: 'FileMaker records and this portal talk to each other automatically. No copy-pasting.',
    backTitle: 'How it works',
    backDetail: 'Portal connects to FileMaker\'s Data API every 15 minutes. Field names are translated automatically. New properties appear here within one sync cycle.',
  },
  {
    id: 'deadlines',
    icon: ICONS.clock,
    frontTitle: 'Tracks Deadlines',
    frontDetail: 'Compliance milestones are computed from the close date. The system knows what\'s due before you do.',
    backTitle: 'How it works',
    backDetail: 'Each program (Featured Homes, R4R, Demolition, VIP) has a built-in schedule. An hourly check flags anything overdue and escalates the enforcement level.',
  },
  {
    id: 'notices',
    icon: ICONS.batchEmail,
    frontTitle: 'Sends Notices',
    frontDetail: 'One click sends a compliance email from compliance@thelandbank.org. No switching to Outlook.',
    backTitle: 'How it works',
    backDetail: 'Email templates are pre-written for each enforcement step. The Action Queue groups properties by what\'s due, so you can send 20 notices in one batch.',
  },
];

function FlipCardItem({ card }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="flip-card cursor-pointer"
      onClick={() => setFlipped((f) => !f)}
    >
      <div className={`flip-card-inner ${flipped ? 'flipped' : ''}`}>
        {/* Front */}
        <div className="flip-card-front rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
            <AppIcon icon={card.icon} size={20} className="text-accent" />
          </div>
          <h3 className="font-heading text-sm font-bold text-text mb-1.5">{card.frontTitle}</h3>
          <p className="text-xs text-muted leading-relaxed">{card.frontDetail}</p>
          <p className="text-[10px] text-accent mt-3 font-medium">Click to see how &rarr;</p>
        </div>
        {/* Back */}
        <div className="flip-card-back rounded-lg border border-accent/30 bg-accent/5 p-5">
          <p className="text-[10px] font-semibold text-accent uppercase tracking-wider mb-2">{card.backTitle}</p>
          <p className="text-xs text-text leading-relaxed">{card.backDetail}</p>
          <p className="text-[10px] text-muted mt-3 font-medium">Click to flip back</p>
        </div>
      </div>
    </div>
  );
}

export default function FlipCards() {
  return (
    <div>
      <ChapterHeader
        icon={ICONS.home}
        title="What This System Does"
        subtitle="Three things the portal handles so staff don't have to"
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {CARDS.map((card) => (
          <FlipCardItem key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
