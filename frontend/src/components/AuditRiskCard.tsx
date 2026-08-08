import React, { useEffect, useState } from 'react';
import { getAuditRiskEvaluation, type AuditRiskData } from '../services/automationService';

export const AuditRiskCard: React.FC<{ userId?: number }> = ({ userId }) => {
  const [data, setData] = useState<AuditRiskData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchRisk = async () => {
    try {
      setLoading(true);
      const res = await getAuditRiskEvaluation(userId);
      setData(res);
    } catch (err) {
      console.error('Audit Risk fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisk();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-3"></div>
        <div className="h-8 bg-slate-100 dark:bg-slate-700/50 rounded w-1/2"></div>
      </div>
    );
  }

  if (!data) return null;

  const scoreBadgeColor =
    data.riskScore === 'HIGH'
      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300'
      : data.riskScore === 'MEDIUM'
      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300'
      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300';

  const progressBg =
    data.riskScore === 'HIGH' ? 'bg-rose-500' : data.riskScore === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl">🛡️</span>
            <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">Automated IRD Rule-Based Audit Risk Engine</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Inland Revenue Department (IRD) Rule-Based Anomaly & Threshold Evaluation</p>
        </div>
        <div className={`px-3 py-1 text-xs font-black uppercase rounded-full border shadow-sm ${scoreBadgeColor}`}>
          Audit Risk Score: {data.riskScore}
        </div>
      </div>

      {/* Progress Bar Meter */}
      <div className="mt-4">
        <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
          <span>Anomaly Risk Index</span>
          <span>{data.scoreValue} / 100</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className={`h-full ${progressBg} transition-all duration-500 rounded-full`} style={{ width: `${data.scoreValue}%` }}></div>
        </div>
      </div>

      {/* Compliance Status details */}
      <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-700">
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">IRD Compliance Status</div>
        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{data.irdComplianceStatus}</div>
      </div>

      {/* Detected Anomalies list */}
      <div className="mt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Detected Data Anomalies ({data.anomalyFlags.length})</h4>
        <ul className="space-y-2">
          {data.anomalyFlags.map((flag, idx) => (
            <li key={idx} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300 bg-amber-50/40 dark:bg-amber-950/20 p-2.5 rounded-lg border border-amber-100 dark:border-amber-900/40">
              <span className="text-amber-500 font-bold">⚠️</span>
              <span>{flag}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-xs">
        <span className="text-slate-400 text-[10px]">Evaluated Real-Time: {new Date(data.evaluatedAt).toLocaleTimeString()}</span>
        <button onClick={fetchRisk} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Re-Evaluate Risk 🔄</button>
      </div>
    </div>
  );
};
