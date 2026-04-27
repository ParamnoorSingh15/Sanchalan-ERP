'use client';

import { useQuery } from '@tanstack/react-query';
import { memo, useMemo } from 'react';
import api from '@/lib/axios';
import { Card } from '@/components/ui/card';

const RiskBar = memo(function RiskBar({ score }) {
    const pct = Math.min(Math.round(score * 100), 100);
    const color = score >= 0.9 ? '#ef4444' : score >= 0.75 ? '#f97316' : score >= 0.5 ? '#f59e0b' : '#22c55e';
    return (
        <div className="flex items-center gap-2.5">
            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                />
            </div>
            <span className="font-mono text-xs whitespace-nowrap" style={{ color }}>
                {score.toFixed(2)}
            </span>
        </div>
    );
});

export default function HighRiskUsersTable() {
    const { data: users, isLoading, isError, error } = useQuery({
        queryKey: ['anomalies', 'highRiskUsers'],
        queryFn: async () => {
            const { data } = await api.get('/anomalies/high-risk-users');
            return data;
        },
        refetchInterval: 60000,
    });

    const sorted = useMemo(
        () => [...(users || [])].sort((a, b) => b.highest_anomaly_score - a.highest_anomaly_score),
        [users]
    );

    if (isLoading) {
        return (
            <Card className="bg-slate-800/80 border-slate-700/60 shadow-xl overflow-hidden flex flex-col h-[400px]">
                <div className="px-6 py-4 border-b border-slate-700/60">
                    <div className="h-5 w-44 bg-slate-700/60 rounded animate-pulse" />
                </div>
                <div className="flex-1 p-4 space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-12 bg-slate-700/40 rounded-lg animate-pulse" />
                    ))}
                </div>
            </Card>
        );
    }

    if (isError) {
        return (
            <Card className="bg-slate-800/80 border-slate-700/60 p-6 h-[400px] flex items-center justify-center">
                <p className="text-sm badge-danger px-3 py-1.5 rounded-lg">{error?.message}</p>
            </Card>
        );
    }

    return (
        <Card className="bg-slate-800/80 border-slate-700/60 shadow-xl overflow-hidden flex flex-col h-[400px] card-hover">
            <div className="px-6 py-4 border-b border-slate-700/60 bg-slate-800/60">
                <h3 className="text-base font-semibold text-slate-100">High Risk Identifiers</h3>
            </div>

            <div className="flex-1 overflow-auto" data-lenis-prevent="true">
                <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-800/95 sticky top-0 border-b border-slate-700 z-10">
                        <tr>
                            <th className="px-6 py-3 font-semibold tracking-wide">Account</th>
                            <th className="px-6 py-3 font-semibold tracking-wide">Peak Score</th>
                            <th className="px-6 py-3 font-semibold tracking-wide">Last Detected</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="px-6 py-10 text-center text-slate-500 text-sm">
                                    No high-risk anomalies on record.
                                </td>
                            </tr>
                        ) : (
                            sorted.map((u, i) => (
                                <tr key={u.user_id || i} className="border-b border-slate-700/50 hover:bg-slate-700/25 transition-colors duration-150 group">
                                    <td className="px-6 py-3.5">
                                        <div className="font-medium text-slate-200 text-sm leading-tight">
                                            {u.user_name || 'Unknown / System'}
                                        </div>
                                        <div className="text-[11px] mt-0.5" style={{ color: 'var(--color-muted-fg)' }}>
                                            {u.user_email || `ID: ${u.user_id}`}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5 w-44">
                                        <RiskBar score={u.highest_anomaly_score} />
                                    </td>
                                    <td className="px-6 py-3.5 text-[11px] whitespace-nowrap" style={{ color: 'var(--color-muted-fg)' }}>
                                        {new Date(u.latest_timestamp).toLocaleDateString()}{' '}
                                        {new Date(u.latest_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
