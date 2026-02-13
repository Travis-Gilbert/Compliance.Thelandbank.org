import { Handle, Position } from '@xyflow/react';
import { AppIcon } from '../ui';

/**
 * SystemNode - Custom React Flow node for the system architecture diagram.
 *
 * Two sizes:
 * - Anchor nodes (portals): 260px wide, larger icon/text, accent-tinted border
 * - Service nodes: 220px wide, standard sizing
 *
 * Anchor nodes are Buyer Portal and Admin Portal — the visual bookends
 * of the diagram that frame the entire system.
 *
 * Dimmed state uses content-level desaturation (not container opacity)
 * so the white background stays solid and edges don't bleed through.
 *
 * States: active (green ring), dimmed (muted content), default (hover effects)
 * Handles on all 4 sides for flexible edge routing.
 */
export default function SystemNode({ data }) {
  const { label, subtitle, description, icon, active, dimmed, anchor, onClick } = data;

  return (
    <div
      onClick={onClick}
      className={`
        flex items-start gap-3
        ${anchor ? 'w-[260px] px-4 py-4' : 'w-[220px] px-3.5 py-3'}
        rounded-lg border bg-white
        transition-all duration-300 cursor-pointer select-none
        ${active
          ? 'ring-2 ring-accent/40 bg-accent/5 border-accent shadow-lg scale-[1.02]'
          : dimmed
            ? 'border-border/30'
            : anchor
              ? 'border-accent/20 shadow-sm hover:border-accent hover:shadow-md hover:scale-[1.02]'
              : 'border-border hover:border-accent hover:shadow-md hover:scale-[1.02]'
        }
      `}
    >
      {/* Icon */}
      <div className={`
        flex-shrink-0 rounded-md flex items-center justify-center mt-0.5
        transition-colors duration-300
        ${anchor ? 'w-11 h-11' : 'w-9 h-9'}
        ${active ? 'bg-accent/20' : dimmed ? 'bg-gray-100' : anchor ? 'bg-accent/15' : 'bg-accent/10'}
      `}>
        <AppIcon
          icon={icon}
          size={anchor ? 22 : 18}
          className={`transition-colors duration-300 ${dimmed ? 'text-gray-300' : 'text-accent'}`}
        />
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <p className={`
          font-heading font-bold leading-tight transition-colors duration-300
          ${anchor ? 'text-lg' : 'text-sm'}
          ${dimmed ? 'text-gray-300' : 'text-text'}
        `}>
          {label}
        </p>
        {subtitle && (
          <p className={`
            font-medium leading-tight mt-0.5 transition-colors duration-300
            ${anchor ? 'text-sm' : 'text-xs'}
            ${dimmed ? 'text-gray-200' : 'text-muted'}
          `}>
            {subtitle}
          </p>
        )}
        {description && (
          <p className={`
            leading-snug line-clamp-2 transition-colors duration-300
            ${anchor ? 'text-xs mt-2' : 'text-[11px] mt-1'}
            ${dimmed ? 'text-gray-200' : 'text-text/75'}
          `}>
            {description}
          </p>
        )}
      </div>

      {/* Handles */}
      <Handle type="target" position={Position.Top} className="!bg-accent/30 !w-2 !h-2 !border-0" />
      <Handle type="source" position={Position.Bottom} className="!bg-accent/30 !w-2 !h-2 !border-0" />
      <Handle type="target" position={Position.Left} id="left" className="!bg-accent/30 !w-2 !h-2 !border-0" />
      <Handle type="source" position={Position.Right} id="right" className="!bg-accent/30 !w-2 !h-2 !border-0" />
    </div>
  );
}
