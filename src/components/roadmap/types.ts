export interface RoadmapTask {
  task: string;
  duration: string;
  priority: "critical" | "high" | "medium";
}

export interface RoadmapPhase {
  phase: number;
  name: string;
  weeks: string;
  goal: string;
  tasks: RoadmapTask[];
  deliverables: string[];
  milestone: string;
}

export interface KeyMetric {
  metric: string;
  target: string;
  timeframe: string;
}

export interface RoadmapRisk {
  risk: string;
  mitigation: string;
}

export interface MVPRoadmap {
  title: string;
  tagline: string;
  techStack: string[];
  phases: RoadmapPhase[];
  keyMetrics: KeyMetric[];
  estimatedCost: {
    low: string;
    medium: string;
    high: string;
  };
  risks: RoadmapRisk[];
  launchChecklist: string[];
}
