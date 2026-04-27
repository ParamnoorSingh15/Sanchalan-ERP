'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Card } from '@/components/ui/card';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

export default function RiskTimelineChart() {
    const { data: timelineData, isLoading, isError, error } = useQuery({
        queryKey: ['anomalies', 'timeline'],
        queryFn: async () => {
            const { data } = await api.get('/anomalies/timeline');
            /* Format timestamps appropriately for Recharts UX */
            return data.map(item => ({
                ...item,
                timeLabel: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
        },
        refetchInterval: 60000 // Update chart every minute
    });

    if (isLoading) {
        return (
            <Card className="bg-slate-800 border-slate-700 shadow-xl p-6 h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-slate-600 border-t-blue-500 animate-spin"></div>
                    <span className="text-sm text-slate-400">Loading risk timeline...</span>
                </div>
            </Card>
        );
    }

    if (isError) {
        return (
            <Card className="bg-red-900/20 border-red-800 p-6 h-[400px] flex items-center justify-center">
                <p className="text-sm text-red-300 text-center">Chart Error: {error.message}</p>
            </Card>
        );
    }

    return (
        <Card className="bg-slate-800 border-slate-700 shadow-xl overflow-hidden p-6 h-[400px] flex flex-col">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-100">Global Risk Timeline</h3>
                <p className="text-xs text-slate-400">Historical velocity of system anomaly scores over time.</p>
            </div>
            
            <div className="flex-1 w-full min-h-0">
                {timelineData?.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                        Insufficient data points for timeline generation.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={timelineData}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis 
                                dataKey="timeLabel" 
                                stroke="#94a3b8" 
                                fontSize={11} 
                                tickLine={false}
                                axisLine={false}
                                minTickGap={30}
                            />
                            <YAxis 
                                stroke="#94a3b8" 
                                fontSize={11} 
                                tickLine={false}
                                axisLine={false}
                                domain={[0, 1]}
                                tickFormatter={(val) => val.toFixed(1)}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '13px', color: '#f8fafc' }}
                                itemStyle={{ color: '#ef4444' }}
                                formatter={(value) => [typeof value === 'number' ? value.toFixed(2) : value, 'Anomaly Score']}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="anomaly_score" 
                                name="Anomaly Score" 
                                stroke="#ef4444" 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorScore)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </Card>
    );
}
