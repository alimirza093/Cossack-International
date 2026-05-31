import React from 'react';

interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
  light?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, action, light }) => (
  <div className="flex justify-between items-end gap-4 mb-10 md:mb-12">
    <div className="flex items-center gap-3">
      <div className="section-accent" />
      <h2 className={light ? 'text-white section-title' : 'section-title'}>{title}</h2>
    </div>
    {action}
  </div>
);

export default React.memo(SectionHeader);
