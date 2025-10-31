// Placeholder analysis API. Uses mocked data for now.
// When backend is ready, switch to BaseApi pattern similar to other API modules.

export type AnalysisSection = {
  id: string;
  title: string;
  total: number;
  done: number;
  status: 'NeedsWork' | 'Good' | 'Strong';
};

export type ResumeAnalysis = {
  score: number;
  label: string;
  subtitle: string;
  sections: AnalysisSection[];
};

export async function getResumeAnalysis(_resumeId: string): Promise<ResumeAnalysis> {
  // Simulate latency
  await new Promise((r) => setTimeout(r, 150));
  return {
    score: 54,
    label: 'Weak',
    subtitle: "Let's work on it!",
    sections: [
      { id: 'content', title: 'Content & Messaging', total: 27, done: 16, status: 'NeedsWork' },
      { id: 'ats', title: 'ATS & Keywords', total: 11, done: 7, status: 'Good' },
      { id: 'tone', title: 'Tone & Grammar', total: 3, done: 0, status: 'Strong' },
    ],
  };
}


