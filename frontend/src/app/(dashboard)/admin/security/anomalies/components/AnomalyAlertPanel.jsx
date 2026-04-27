'use client';

import { useQuery } from '@tanstack/react-query';
import { memo } from 'react';
import api from '@/lib/axios';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { staggerContainer, staggerChildren } from '@/lib/motionVariants';

function getAlertCardClass(severity) {
    const map = {
        CRITICAL: 'badge-danger',
        HIGH:     'badge-warning',
        MEDIUM:   'badge-info',
        LOW:      'badge-muted',
    };
    return map[severity] || 'badge-muted';
}

const AlertCard = memo(function AlertCard({ alert }) {
    return (
        <motion.div
            variants={staggerChildren}
            className={`p-4 rounded-xl border text-sm cursor-default transition-all duration-200 hover:brightness-110 ${getAlertCardClass(alert.severity)}`}
        >
            <div className="flex justify-between items-start mb-1.5">
                <span className="font-semibold text-[13px] leading-tight">
                    [{alert.action || 'UNKNOWN'}]
                </span>
                <span className="text-[11px] font-mono opacity-70 ml-2 shrink-0">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
            <p className="text-[12px] leading-relaxed opacity-85 mb-2.5 line-clamp-2">
                {alert.notification_message || alert.reason || 'An anomalous event was recorded.'}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-current/10 border border-current/20">
                    {alert.severity}
                </span>
                {alert.requires_escalation && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/25">
                        Escalation Required
                    </span>
                )}
            </div>
        </motion.div>
    );
});

export default function AnomalyAlertPanel() {
    const { data: alerts, isLoading, isError, error } = useQuery({
        queryKey: ['anomalies', 'recent'],
        queryFn: async () => {
            const { data } = await api.get('/anomalies/recent');
            return data;
        },
        refetchInterval: 30000,
    });

    if (isLoading) {
        return (
            <div className="rounded-xl shadow-sm overflow-hidden flex flex-col h-[500px] border transition-colors"
                 style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div className="h-5 w-40 rounded animate-pulse" style={{ backgroundColor: 'var(--bg-surface-3)' }} />
                </div>
                <div className="flex-1 p-4 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-20 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--bg-surface-3)' }} />
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="border p-6 badge-danger rounded-xl">
                <h3 className="font-semibold mb-1">Alert Feed Unavailable</h3>
                <p className="text-sm opacity-80">{error?.message}</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl shadow-sm overflow-hidden flex flex-col h-[500px] card-hover border transition-colors duration-300"
             style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface-2)' }}>
                <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Recent Security Alerts
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-3" data-lenis-prevent="true">
                {!alerts?.length ? (
                    <div className="h-full flex items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>
                        No recent anomalies detected.
                    </div>
                ) : (
                    <motion.div className="space-y-2" variants={staggerContainer} initial="hidden" animate="visible">
                        {alerts.map(alert => <AlertCard key={alert._id} alert={alert} />)}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
