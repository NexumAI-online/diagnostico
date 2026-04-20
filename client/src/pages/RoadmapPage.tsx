import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { Toast } from '../components/Toast';
import { useAppStore } from '../store/useAppStore';
import { sendEmail } from '../lib/api';

function ScoreBar({ score, label }: { score: number; label: string }) {
  const [width, setWidth] = useState(0);
  const [displayScore, setDisplayScore] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const duration = 1000;
          const start = Date.now();
          const timer = setInterval(() => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayScore(Math.round(eased * score));
            setWidth(eased * score);
            if (progress >= 1) clearInterval(timer);
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [score]);

  return (
    <div ref={ref}>
      <div className="flex items-end gap-2 mb-1">
        <span className="text-4xl font-heading font-bold text-nexum-gradient">
          {displayScore}
        </span>
        <span className="text-gray-600 text-sm mb-1">/100</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-none"
          style={{
            width: `${width}%`,
            background: 'linear-gradient(90deg, #F239FF 0%, #8943E3 100%)',
          }}
        />
      </div>
    </div>
  );
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
    >
      {children}
    </div>
  );
}

export function RoadmapPage() {
  const navigate = useNavigate();
  const { session, roadmapData } = useAppStore();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [successBanner, setSuccessBanner] = useState(true);
  const roadmapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!roadmapData) {
      navigate('/cuestionario', { replace: true });
    }
  }, [roadmapData, navigate]);

  if (!roadmapData) return null;

  const { profile, scores, strengths, risks, starting_leverage, roadmap_30d, motivational_message } = roadmapData;

  const trendIcon = {
    up: { icon: '↑', color: '#00e676' },
    flat: { icon: '→', color: '#F239FF' },
    down: { icon: '↓', color: '#ff5252' },
  }[scores.overall.trend];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailValid = emailRegex.test(emailInput);

  const handleSendEmail = async () => {
    if (!emailValid || emailLoading) return;
    setEmailLoading(true);
    setEmailError(null);

    try {
      const result = await sendEmail(session.username!, emailInput);
      if (result.res === 'Información enviada correctamente') {
        setShowEmailModal(false);
        setEmailSuccess(true);
        setEmailInput('');
      } else if (result.res === 'Error al enviar la respuesta') {
        setEmailError('Hubo un problema enviando tu roadmap. Por favor contactá a Juan o Agustín para que te lo reenvíen por privado.');
      } else {
        setEmailError('Error de conexión. Intentá de nuevo.');
      }
    } catch {
      setEmailError('Error de conexión. Intentá de nuevo.');
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="py-8 space-y-8">
        {/* Logo header */}
        <div className="flex justify-center pb-2">
          <img
            src="/logo-nexum.svg"
            alt="Nexum"
            className="h-10"
            style={{ filter: 'drop-shadow(0 0 20px rgba(242,57,255,0.3))' }}
          />
        </div>

        {/* Success banner */}
        {successBanner && (
          <FadeIn>
            <div
              className="flex items-start gap-4 p-5 rounded-2xl border border-success/30"
              style={{ background: 'rgba(0,230,118,0.05)' }}
            >
              <span className="text-success text-2xl">✓</span>
              <div>
                <p className="text-white font-semibold">Tu roadmap se ha creado exitosamente.</p>
                <p className="text-gray-400 text-sm">Recordá que podés enviártelo por mail.</p>
              </div>
              <button onClick={() => setSuccessBanner(false)} className="ml-auto text-gray-600 hover:text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </FadeIn>
        )}

        {/* Email success */}
        {emailSuccess && (
          <Toast type="success" message="Tu roadmap ya está en camino. ✓" visible autoDismiss={8000} onClose={() => setEmailSuccess(false)} />
        )}

        {/* 1. Profile */}
        <FadeIn>
          <GlassCard>
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-4 leading-tight">
              {profile.title}
            </h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line mb-5">
              {profile.summary}
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-sm px-3 py-1 rounded-full text-accent"
                  style={{
                    background: 'rgba(242,57,255,0.12)',
                    border: '1px solid rgba(242,57,255,0.25)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </GlassCard>
        </FadeIn>

        {/* 2. Scores */}
        <FadeIn delay={100}>
          <div className="space-y-4">
            <h2 className="text-xl font-heading font-bold text-white">Puntaje por Áreas</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {scores.areas.map((area, i) => (
                <FadeIn key={area.key} delay={i * 100}>
                  <GlassCard className="p-5 md:p-6">
                    <p className="text-sm uppercase tracking-wider text-gray-500 mb-3">{area.label}</p>
                    <ScoreBar score={area.score} label={area.label} />
                    <p className="text-sm text-gray-400 italic mt-3 leading-relaxed">{area.why}</p>
                    <p className="text-sm text-accent mt-2 flex items-start gap-1">
                      <span className="mt-0.5">→</span>
                      <span>{area.lever}</span>
                    </p>
                  </GlassCard>
                </FadeIn>
              ))}
            </div>

            {/* Overall score */}
            <FadeIn delay={500}>
              <GlassCard accent className="text-center">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Score Total</p>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <ScoreBar score={scores.overall.score} label="Total" />
                  <span className="text-4xl font-heading font-bold" style={{ color: trendIcon.color }}>
                    {trendIcon.icon}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-3">{scores.overall.trend_reason}</p>
                <p className="text-accent text-sm">{scores.overall.lever}</p>
              </GlassCard>
            </FadeIn>
          </div>
        </FadeIn>

        {/* 3. Strengths & Risks */}
        <FadeIn delay={100}>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="space-y-3">
              <h2 className="text-xl font-heading font-bold text-white">Tus Fortalezas</h2>
              {strengths.map((s, i) => (
                <FadeIn key={i} delay={i * 100}>
                  <GlassCard className="p-5">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">⭐</span>
                      <p className="text-gray-300 text-sm leading-relaxed">{s}</p>
                    </div>
                  </GlassCard>
                </FadeIn>
              ))}
            </div>

            {/* Risks */}
            <div className="space-y-3">
              <h2 className="text-xl font-heading font-bold text-white">Fricciones Detectadas</h2>
              {risks.map((risk, i) => (
                <FadeIn key={i} delay={i * 100}>
                  <GlassCard className="p-5">
                    <p className="font-semibold text-white mb-2">{risk.text}</p>
                    <p className="text-gray-400 text-sm mb-3">{risk.why_it_matters}</p>
                    <div
                      className="p-3 rounded-xl"
                      style={{ background: 'rgba(242,57,255,0.06)', border: '1px solid rgba(242,57,255,0.18)' }}
                    >
                      <p className="text-accent text-sm font-medium mb-1">{risk.intervention.action}</p>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(242,57,255,0.12)', color: '#F239FF' }}
                        >
                          ⏱ {risk.intervention.time_minutes} min
                        </span>
                        <span className="text-xs text-gray-500">{risk.intervention.expected_result}</span>
                      </div>
                    </div>
                  </GlassCard>
                </FadeIn>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* 4. Starting leverage */}
        <FadeIn delay={100}>
          <GlassCard accent>
            <h2 className="text-xl font-heading font-bold text-white mb-5">Tu Palanca de Arranque</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Tu palanca #1</p>
                <p className="text-white font-semibold text-lg">{starting_leverage.main_lever}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">Tu cuello de botella</p>
                <p className="text-gray-300 flex items-start gap-2">
                  <span>⚠️</span>
                  <span>{starting_leverage.bottleneck}</span>
                </p>
              </div>
              <div
                className="p-4 rounded-xl text-center"
                style={{ background: 'rgba(242,57,255,0.08)', border: '1px solid rgba(242,57,255,0.28)' }}
              >
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Tu regla de foco</p>
                <p className="text-accent text-lg font-medium">{starting_leverage.focus_rule}</p>
              </div>
            </div>
          </GlassCard>
        </FadeIn>

        {/* 5. Roadmap 30d */}
        <FadeIn delay={100}>
          <div ref={roadmapRef} className="space-y-4">
            <h2 className="text-xl font-heading font-bold text-white">Roadmap 30 Días</h2>
            <div className="relative">
              {/* Vertical line */}
              <div
                className="absolute left-4 top-0 bottom-0 w-0.5"
                style={{ background: 'linear-gradient(180deg, rgba(242,57,255,0.5) 0%, rgba(137,67,227,0.3) 100%)' }}
              />
              <div className="space-y-6 pl-12">
                {roadmap_30d.phases.map((phase, i) => (
                  <FadeIn key={i} delay={i * 150}>
                    <div className="relative">
                      {/* Phase node */}
                      <div
                        className="absolute -left-[2.75rem] w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{
                          background: 'linear-gradient(135deg, #F239FF 0%, #8943E3 100%)',
                          boxShadow: '0 0 16px rgba(242,57,255,0.45)',
                        }}
                      >
                        {i + 1}
                      </div>
                      <GlassCard>
                        <div className="flex items-center gap-3 mb-4">
                          <h3 className="font-heading font-bold text-white text-lg">{phase.name}</h3>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full text-accent"
                            style={{
                              background: 'rgba(242,57,255,0.12)',
                              border: '1px solid rgba(242,57,255,0.25)',
                            }}
                          >
                            Días {phase.days}
                          </span>
                        </div>
                        <p className="text-white font-medium mb-4">{phase.objective}</p>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Entregables</p>
                            <ul className="space-y-1">
                              {phase.deliverables.map((d, j) => (
                                <li key={j} className="text-sm text-gray-300 flex items-start gap-2">
                                  <span className="text-success mt-0.5">✓</span>
                                  {d}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Acciones</p>
                            <ul className="space-y-1">
                              {phase.actions.map((a, j) => (
                                <li key={j} className="text-sm text-gray-300 flex items-start gap-2">
                                  <span className="text-accent mt-0.5">→</span>
                                  {a}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Métricas</p>
                            <div className="flex flex-wrap gap-2">
                              {phase.metrics.map((m, j) => (
                                <span
                                  key={j}
                                  className="text-xs px-2 py-1 rounded-full text-gray-300"
                                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                                >
                                  📊 {m}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">Evitar</p>
                            <ul className="space-y-1">
                              {phase.avoid.map((a, j) => (
                                <li key={j} className="text-xs text-error/80 flex items-start gap-1">
                                  <span>⚠️</span>
                                  {a}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </GlassCard>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* 6. Motivational message */}
        <FadeIn delay={100}>
          <GlassCard accent>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line mb-6">
              {motivational_message.text}
            </p>
            <div className="flex flex-col items-start gap-2">
              <PrimaryButton
                onClick={() => roadmapRef.current?.scrollIntoView({ behavior: 'smooth' })}
              >
                {motivational_message.cta_label}
              </PrimaryButton>
              <p className="text-xs text-gray-500">{motivational_message.cta_action_hint}</p>
            </div>
          </GlassCard>
        </FadeIn>

        {/* Send email button */}
        <FadeIn delay={100}>
          <div className="flex justify-center pb-8">
            <PrimaryButton variant="secondary" onClick={() => setShowEmailModal(true)}>
              📧 Enviar por mail
            </PrimaryButton>
          </div>
        </FadeIn>
      </div>

      {/* Email modal */}
      {showEmailModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowEmailModal(false); }}
        >
          <div className="w-full max-w-md animate-scale-in">
            <GlassCard>
              <h3 className="text-xl font-heading font-bold text-white mb-2">
                Enviá tu roadmap por mail
              </h3>
              <p className="text-gray-400 text-sm mb-5">
                Ingresá el mail al que querés recibir tu roadmap completo.
              </p>

              <div className="mb-4">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={emailInput}
                  onChange={(e) => { setEmailInput(e.target.value); setEmailError(null); }}
                  className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 text-sm transition-all duration-200 outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: emailInput && !emailValid
                      ? '1px solid rgba(255,82,82,0.6)'
                      : '1px solid rgba(255,255,255,0.1)',
                  }}
                  onFocus={(e) => {
                    if (!emailInput || emailValid) {
                      e.target.style.border = '1px solid #F239FF';
                      e.target.style.boxShadow = '0 0 12px rgba(242,57,255,0.35)';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.border = emailInput && !emailValid
                      ? '1px solid rgba(255,82,82,0.6)'
                      : '1px solid rgba(255,255,255,0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {emailInput && !emailValid && (
                  <p className="text-xs text-error mt-1">Ingresá un email válido</p>
                )}
              </div>

              {emailError && (
                <div className="mb-4">
                  <Toast type="error" message={emailError} visible autoDismiss={0} onClose={() => setEmailError(null)} />
                </div>
              )}

              <div className="flex gap-3">
                <PrimaryButton
                  onClick={handleSendEmail}
                  disabled={!emailValid}
                  loading={emailLoading}
                  loadingText="Enviando…"
                  fullWidth
                >
                  Enviar
                </PrimaryButton>
                <button
                  onClick={() => { setShowEmailModal(false); setEmailError(null); setEmailInput(''); }}
                  className="text-sm text-gray-400 hover:text-white transition-colors px-4"
                >
                  Cancelar
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
