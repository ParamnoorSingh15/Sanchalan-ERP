'use client';

import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import AnomalyAlertPanel from './components/AnomalyAlertPanel';
import RiskTimelineChart from './components/RiskTimelineChart';
import HighRiskUsersTable from './components/HighRiskUsersTable';

export default function SecurityAnomaliesPage() {
    return (
        <RoleProtectedRoute requiredRoles={['Admin']}>
            <div className="space-y-6">
                <div className="flex flex-col mb-8">
                    <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>Security Analytics Dashboard</h1>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        AI-driven anomaly detection and enterprise behavioral evaluation metrics.
                    </p>
                </div>

                {/* Dashboard Grid Container */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 gsap-stagger-container">
                    
                    {/* Top Left: Main Chart (2 cols wide on desktop) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="gsap-stagger-item gsap-fade-up">
                            <RiskTimelineChart />
                        </div>
                        <div className="gsap-stagger-item gsap-fade-up">
                            <HighRiskUsersTable />
                        </div>
                    </div>

                    {/* Right Rail: Alert Feed (1 col side panel) */}
                    <div className="lg:col-span-1 h-full gsap-slide-left">
                        <AnomalyAlertPanel />
                    </div>

                </div>
            </div>
        </RoleProtectedRoute>
    );
}
