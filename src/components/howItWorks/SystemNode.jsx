import { Handle, Position } from '@xyflow/react';
import { AppIcon } from '../ui';

/**
 * SystemNode - Custom React Flow node for the system architecture diagram.
 *
 * Stacked vertical layout: icon → label → subtitle → description.
 * Taller and narrower than the previous horizontal layout so nodes
 * fill the portrait panel without crowding side-by-side.
 *
 * Receives data props: label, subtitle, icon, active, dimmed, onClick.
 * Active state = green ring + accent background (chapter is viewing this node).
 * Dimmed state = faded out (another chapter is active, this node isn't relevant).
 * Handles on all 4 sides for flexible edge routing.
 */
export default function SystemNode({ data }) {
  const { label, subtitle, description, icon, active, dimmed, onClick } = data;

  return (
    <div
      onClick={onClick}
      className={`
        flex flex-col items-center text-center w-[160px]
        px-4 py-4 rounded-lg border bg-white
        transition-all duration-200 cursor-pointer select-none
        ${active
          ? 'ring-2 ring-accent/40 bg-accent/5 border-accent shadow-md'
          : dimmed
            ? 'border-border/40 opacity-40'
            : 'border-border hover:border-accent hover:shadow-md hover:scale-105'
        }
      `}
    >
      <div className="w-10 h-10 rounded-md bg-accent/10 flex items-center justify-center mb-2">
        <AppIcon icon={icon} size={22} className="text-accent" />
      </div>
      <p className="font-heading text-sm font-semibold text-text leading-tight">{label}</p>
      {subtitle && (
        <p className="text-xs text-muted leading-tight mt-0.5">{subtitle}</p>
      )}
      {description && (
        <p className="text-[10px] text-muted/70 leading-snug mt-1.5 line-clamp-3">{description}</p>
      )}
      <Handle type="target" position={Position.Top} className="!bg-accent/30 !w-2 !h-2 !border-0" />
      <Handle type="source" position={Position.Bottom} className="!bg-accent/30 !w-2 !h-2 !border-0" />
      <Handle type="target" position={Position.Left} id="left" className="!bg-accent/30 !w-2 !h-2 !border-0" />
      <Handle type="source" position={Position.Right} id="right" className="!bg-accent/30 !w-2 !h-2 !border-0" />
    </div>
  );
}
