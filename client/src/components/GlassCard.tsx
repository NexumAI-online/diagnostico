import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
}

export function GlassCard({ children, className = '', accent = false }: GlassCardProps) {
  return (
    <div
      className={`rounded-2xl p-6 md:p-8 ${className}`}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: accent ? '1px solid rgba(242,57,255,0.45)' : '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: accent
          ? '0 0 30px rgba(242,57,255,0.15), 0 4px 24px rgba(0,0,0,0.45)'
          : '0 4px 24px rgba(0,0,0,0.45)',
      }}
    >
      {children}
    </div>
  );
}
