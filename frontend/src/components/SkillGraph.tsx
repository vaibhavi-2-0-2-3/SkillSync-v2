import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DeveloperAnalysis } from '../services/api';

interface SkillGraphProps {
  analysis: DeveloperAnalysis | null;
  isLoading: boolean;
}

type SkillPoint = {
  name: string;
  strength: number;
};

const SkillGraph: React.FC<SkillGraphProps> = ({ analysis, isLoading }) => {
  if (isLoading || !analysis) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 h-64 animate-pulse" />
    );
  }

  const baseSkills = analysis.detectedSkills.slice(0, 12);
  const strongSet = new Set(analysis.strongAreas.map((s) => s.toLowerCase()));
  const weakSet = new Set(analysis.weakAreas.map((s) => s.toLowerCase()));

  const data: SkillPoint[] = baseSkills.map((s) => {
    const key = s.toLowerCase();
    let strength = 3;
    if (strongSet.has(key)) strength = 5;
    if (weakSet.has(key)) strength = 1;
    return { name: s, strength };
  });

  if (!data.length) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
        No skills detected yet. Connect GitHub, sync LeetCode, and upload LinkedIn skills to see this chart.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-slate-100">Skill profile</h2>
        <p className="text-xs text-slate-400">Strong vs weak skills (relative)</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer>
          <RadarChart data={data}>
            <PolarGrid stroke="#1e293b" />
            <PolarAngleAxis
              dataKey="name"
              tick={{ fill: '#cbd5f5', fontSize: 10 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 5]}
              tick={{ fill: '#64748b', fontSize: 10 }}
            />
            <Radar
              name="Skill strength"
              dataKey="strength"
              stroke="#38bdf8"
              fill="#0ea5e9"
              fillOpacity={0.25}
              animationDuration={800}
            />
            <Tooltip
              cursor={{ stroke: '#1e293b', strokeWidth: 1 }}
              contentStyle={{
                backgroundColor: '#020617',
                borderColor: '#1e293b',
                borderRadius: '0.75rem',
                fontSize: '0.75rem'
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SkillGraph;


