export interface LoginResponse {
  respuesta: string;
}

export interface EmailResponse {
  res: string;
}

export interface ScoreArea {
  key: string;
  label: string;
  score: number;
  why: string;
  lever: string;
}

export interface OverallScore {
  score: number;
  trend: 'up' | 'flat' | 'down';
  trend_reason: string;
  lever: string;
}

export interface Risk {
  text: string;
  why_it_matters: string;
  intervention: {
    action: string;
    time_minutes: number;
    expected_result: string;
  };
}

export interface RoadmapPhase {
  name: string;
  days: string;
  objective: string;
  deliverables: string[];
  actions: string[];
  metrics: string[];
  avoid: string[];
}

export interface RoadmapData {
  version: string;
  profile: {
    title: string;
    summary: string;
    tags: string[];
  };
  scores: {
    areas: ScoreArea[];
    overall: OverallScore;
  };
  strengths: string[];
  risks: Risk[];
  starting_leverage: {
    main_lever: string;
    bottleneck: string;
    focus_rule: string;
  };
  roadmap_30d: {
    phases: RoadmapPhase[];
  };
  motivational_message: {
    text: string;
    cta_label: string;
    cta_action_hint: string;
  };
  markdown_report: string;
}
