import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProgressSteps } from '../components/ProgressSteps';
import { useAppStore } from '../store/useAppStore';
import { generateRoadmap, saveToSheets } from '../lib/api';

const SECTIONS = [
  { label: 'A' },
  { label: 'B' },
  { label: 'C' },
  { label: 'D' },
  { label: 'E' },
  { label: 'F' },
];

function SingleSelect({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
            value === opt
              ? 'bg-accent/20 border-accent text-accent'
              : 'border-gray-700 text-gray-400 hover:border-gray-500'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function MultiSelect({
  options,
  value,
  onChange,
  noneOption,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  noneOption?: string;
}) {
  const toggle = (opt: string) => {
    if (noneOption && opt === noneOption) {
      onChange([noneOption]);
      return;
    }
    if (noneOption && value.includes(noneOption)) {
      onChange([opt]);
      return;
    }
    const next = value.includes(opt)
      ? value.filter((v) => v !== opt)
      : [...value, opt];
    onChange(next);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border flex items-center gap-2 ${
            value.includes(opt)
              ? 'bg-accent/20 border-accent text-accent'
              : 'border-gray-700 text-gray-400 hover:border-gray-500'
          }`}
        >
          {value.includes(opt) && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {opt}
        </button>
      ))}
    </div>
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const count = value.length;
  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={250}
        rows={3}
        className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 text-sm transition-all duration-200 outline-none resize-none"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
        onFocus={(e) => {
          e.target.style.border = '1px solid #F239FF';
          e.target.style.boxShadow = '0 0 12px rgba(242,57,255,0.35)';
        }}
        onBlur={(e) => {
          e.target.style.border = '1px solid rgba(255,255,255,0.1)';
          e.target.style.boxShadow = 'none';
        }}
      />
      <p
        className={`text-xs text-right mt-1 ${
          count >= 250 ? 'text-error' : count >= 200 ? 'text-yellow-400' : 'text-gray-600'
        }`}
      >
        {count}/250{count >= 250 && ' — Máximo 250 caracteres.'}
      </p>
    </div>
  );
}

interface Question {
  key: string;
  label: string;
  type: 'single' | 'multi' | 'text';
  options?: string[];
  noneOption?: string;
  placeholder?: string;
  hint?: string;
}

const SECTIONS_DATA: { title: string; questions: Question[] }[] = [
  {
    title: 'Sección A — Personal',
    questions: [
      {
        key: 'respuesta_a_pregunta_1',
        label: '¿Cuál es tu rango de edad?',
        type: 'single',
        options: ['15-18', '19-24', '25-34', '35-44', '45+'],
      },
      {
        key: 'respuesta_a_pregunta_2',
        label: '¿En qué país vivís?',
        type: 'text',
        placeholder: 'Tu respuesta…',
      },
      {
        key: 'respuesta_a_pregunta_3',
        label: '¿Cuál es tu situación laboral actual?',
        type: 'text',
        placeholder: 'Tu respuesta…',
      },
    ],
  },
  {
    title: 'Sección B — Objetivo',
    questions: [
      {
        key: 'respuesta_a_pregunta_4',
        label: 'Brevemente: ¿Qué quieres lograr en los próximos meses?',
        type: 'text',
        placeholder: 'Tu respuesta…',
      },
      {
        key: 'respuesta_a_pregunta_5',
        label: 'Si tuvieras que resumirlo en una sola meta, ¿cuál sería?',
        type: 'text',
        placeholder: 'Tu respuesta…',
      },
      {
        key: 'respuesta_a_pregunta_6',
        label: 'Siendo 100% honesto, ¿qué te entusiasma más de este modelo?',
        type: 'single',
        options: [
          'Libertad (Tiempo)',
          'Dinero (Ingresos)',
          'Tecnología (Desarrollar Cosas)',
          'Impacto (Ayudar a Empresas)',
          'Crecer Profesionalmente (Desarrollo Personal)',
        ],
      },
    ],
  },
  {
    title: 'Sección C — Experiencia y Habilidades',
    questions: [
      {
        key: 'respuesta_a_pregunta_7',
        label: 'Resume tu nivel en automatizaciones (Claude Code, n8n, Make, Zapier)',
        type: 'text',
        placeholder: 'Tu respuesta…',
      },
      {
        key: 'respuesta_a_pregunta_8',
        label: '¿Cuál es tu nivel en IA? (prompts, agentes, tools)',
        type: 'text',
        placeholder: 'Tu respuesta…',
      },
      {
        key: 'respuesta_a_pregunta_9',
        label: '¿Cuál es tu nivel en Ventas?',
        type: 'single',
        options: ['Cero', 'Básico', 'Intermedio', 'Avanzado'],
      },
      {
        key: 'respuesta_a_pregunta_10',
        label: '¿Ya trabajaste con clientes?',
        type: 'text',
        placeholder: 'Tu respuesta…',
        hint: 'Si NO, escribí literal: No',
      },
      {
        key: 'respuesta_a_pregunta_11',
        label: '¿Qué herramientas ya usaste?',
        type: 'multi',
        options: ['Claude', 'Claude Code', 'n8n', 'Make', 'Zapier', 'Airtable', 'Kommo', 'Notion', 'Postgres', 'ChatGPT', 'ManyChat', 'Ninguna'],
        noneOption: 'Ninguna',
      },
    ],
  },
  {
    title: 'Sección D — Oferta / Nicho',
    questions: [
      {
        key: 'respuesta_a_pregunta_12',
        label: '¿Qué tipo de cliente te gustaría ayudar primero?',
        type: 'single',
        options: [
          'Clínicas / salud',
          'E-commerce',
          'Restaurantes',
          'Real estate',
          'B2B servicios',
          'Educación',
          'Logística',
          'No sé todavía',
        ],
      },
      {
        key: 'respuesta_a_pregunta_13',
        label: '¿Qué problemas te gustaría resolver?',
        type: 'multi',
        options: [
          'Automatizar las redes sociales de clientes',
          'Creacion de CRM y estrategias de seguimiento',
          'Soluciones relacionadas a Reservas/turnos',
          'Soluciones relacionadas con soporte al cliente',
          'Automatizar los flujos internos de los negocios (facturas, reportes)',
          'Automatizaciones relacionadas al Contenido/marketing',
          'No sé todavía',
        ],
      },
    ],
  },
  {
    title: 'Sección E — Limitaciones',
    questions: [
      {
        key: 'respuesta_a_pregunta_14',
        label: "¿Qué es lo que más te frena o te da 'miedo' hoy?",
        type: 'text',
        placeholder: 'Tu respuesta…',
      },
      {
        key: 'respuesta_a_pregunta_15',
        label: '¿Qué es lo que te hizo decidir empezar ahora?',
        type: 'multi',
        options: [
          'Necesito ingresos',
          'Me cansé de mi trabajo actual',
          'Vi oportunidad y quiero aprovechar',
          'Quiero independizarme',
          'Quiero mejorar profesionalmente',
          'Otro',
        ],
      },
      {
        key: 'respuesta_a_pregunta_16',
        label: '¿Te sientes cómodo para grabar contenido?',
        type: 'single',
        options: ['Si, muy', 'No mucho', 'No lo sé todavía, estoy decidiéndolo'],
      },
    ],
  },
  {
    title: 'Sección F — Compromiso',
    questions: [
      {
        key: 'respuesta_a_pregunta_17',
        label: 'Elegí tu compromiso mínimo diario:',
        type: 'single',
        options: [
          '20min/día',
          '45min/día',
          '90min/día',
          '3h/día',
          '6h/día',
          'Estoy comprometido al 100% con esto',
        ],
      },
    ],
  },
];

function isSectionComplete(
  sectionIdx: number,
  answers: Record<string, string | string[]>
): boolean {
  const section = SECTIONS_DATA[sectionIdx];
  return section.questions.every((q) => {
    const val = answers[q.key];
    if (!val) return false;
    if (Array.isArray(val)) return val.length > 0;
    return (val as string).trim().length > 0 && (val as string).length <= 250;
  });
}

function isAllComplete(answers: Record<string, string | string[]>): boolean {
  return SECTIONS_DATA.every((_, idx) => isSectionComplete(idx, answers));
}

export function QuestionnairePage() {
  const navigate = useNavigate();
  const { session, questionnaireAnswers, setAnswer, setRoadmapData } = useAppStore();
  const [currentSection, setCurrentSection] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const scrollTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNext = () => {
    if (currentSection < SECTIONS_DATA.length - 1) {
      setCurrentSection((s) => s + 1);
      scrollTop();
    }
  };

  const handlePrev = () => {
    if (currentSection > 0) {
      setCurrentSection((s) => s - 1);
      scrollTop();
    }
  };

  const handleFinish = async () => {
    if (!isAllComplete(questionnaireAnswers) || generating) return;

    setGenerating(true);
    setGenError(null);

    try {
      const data = await generateRoadmap(session.username!, questionnaireAnswers);
      setRoadmapData(data);

      // Save to webhook in background (non-blocking)
      saveToSheets(
        session.username!,
        questionnaireAnswers,
        data.markdown_report,
        JSON.stringify(data)
      ).catch((err) => console.error('Save to webhook failed:', err));

      navigate('/roadmap');
    } catch (err) {
      console.error('Generation error:', err);
      setGenError('Hubo un problema generando tu roadmap. Por favor intentá de nuevo.');
      setGenerating(false);
    }
  };

  const section = SECTIONS_DATA[currentSection];
  const sectionComplete = isSectionComplete(currentSection, questionnaireAnswers);
  const allComplete = isAllComplete(questionnaireAnswers);
  const isLastSection = currentSection === SECTIONS_DATA.length - 1;

  // Generation overlay
  if (generating) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div
          className="rounded-2xl p-10 md:p-16 text-center max-w-md mx-4"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(24px)',
          }}
        >
          {/* Pulsing glow circle */}
          <div className="flex justify-center mb-8">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center animate-pulse-glow"
              style={{ background: 'rgba(242,57,255,0.12)', border: '2px solid rgba(242,57,255,0.45)' }}
            >
              <div
                className="w-8 h-8 rounded-full animate-ping opacity-75"
                style={{ background: 'linear-gradient(135deg, #F239FF 0%, #8943E3 100%)' }}
              />
            </div>
          </div>
          <h2 className="text-2xl font-heading font-bold text-white mb-3">
            Estamos creando tu roadmap…
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Acá no tomamos atajos: estamos analizando <br />
            tus respuestas y armando un diagnóstico real <br />
            como mentor. <br />
            <br />
            <span className="text-white/80">Puede demorar varios minutos</span> — <br />
            no cierres esta pestaña.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div ref={topRef} className="py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <img
            src="/logo-nexum.svg"
            alt="Nexum"
            className="h-10 mx-auto"
            style={{ filter: 'drop-shadow(0 0 20px rgba(242,57,255,0.3))' }}
          />
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-white tracking-tight">
            Cuestionario de Iniciación
          </h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Esto nos permite crear tu roadmap personalizado.<br />
            Tiempo estimado: 10–15 minutos. Todas las respuestas son obligatorias.
          </p>
        </div>

        {/* Progress */}
        <ProgressSteps steps={SECTIONS} currentStep={currentSection} />

        {/* Error after generation fail */}
        {genError && (
          <div
            className="flex items-start gap-3 p-4 rounded-xl border border-error/30 animate-slide-down"
            style={{ background: 'rgba(255,82,82,0.05)' }}
          >
            <p className="text-sm text-error flex-1">{genError}</p>
            <button
              onClick={handleFinish}
              className="text-xs text-accent underline hover:no-underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Section card */}
        <GlassCard>
          <h2 className="text-lg font-heading font-semibold text-white mb-6">{section.title}</h2>

          <div className="space-y-8">
            {section.questions.map((q) => {
              const val = questionnaireAnswers[q.key];
              return (
                <div key={q.key} className="space-y-3">
                  <label className="block text-base font-medium text-white">
                    {q.label}
                  </label>
                  {q.hint && (
                    <p className="text-xs text-gray-500">{q.hint}</p>
                  )}
                  {q.type === 'single' && (
                    <SingleSelect
                      options={q.options!}
                      value={(val as string) || ''}
                      onChange={(v) => setAnswer(q.key, v)}
                    />
                  )}
                  {q.type === 'multi' && (
                    <MultiSelect
                      options={q.options!}
                      value={(val as string[]) || []}
                      onChange={(v) => setAnswer(q.key, v)}
                      noneOption={q.noneOption}
                    />
                  )}
                  {q.type === 'text' && (
                    <TextArea
                      value={(val as string) || ''}
                      onChange={(v) => setAnswer(q.key, v)}
                      placeholder={q.placeholder}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <div>
            {currentSection > 0 && (
              <PrimaryButton variant="secondary" onClick={handlePrev}>
                ← Sección anterior
              </PrimaryButton>
            )}
          </div>
          <div>
            {!isLastSection ? (
              <PrimaryButton
                onClick={handleNext}
                disabled={!sectionComplete}
              >
                Siguiente sección →
              </PrimaryButton>
            ) : (
              <PrimaryButton
                onClick={handleFinish}
                disabled={!allComplete}
                loading={generating}
                loadingText="Generando…"
              >
                Finalizar cuestionario
              </PrimaryButton>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
