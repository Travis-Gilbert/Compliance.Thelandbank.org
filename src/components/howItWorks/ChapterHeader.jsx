import { AppIcon } from '../ui';

export default function ChapterHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mt-0.5">
        <AppIcon icon={icon} size={18} className="text-accent" />
      </div>
      <div>
        <h2 className="font-heading text-lg font-semibold text-text">{title}</h2>
        <p className="text-sm text-muted mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}
