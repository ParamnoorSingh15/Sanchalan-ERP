'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, AlertTriangle, Activity, Clock, CalendarOff, Star, Building, UserCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';

function StatCard({ title, value, subtitle, icon: Icon, iconColor = 'text-blue-400' }) {
    return (
        <Card className="bg-slate-800 border-slate-700 text-slate-100 shadow-xl transition-all hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={`h-4 w-4 ${iconColor}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
            </CardContent>
        </Card>
    );
}

export default function DashboardPage() {
    const { user, hasRole } = useAuth();
    const isAdmin = hasRole(['Admin']);
    const isManager = hasRole(['Manager']);
    const isEmployee = hasRole(['Employee']) && !isAdmin && !isManager;

    const [stats, setStats] = useState(null);
    const [managerData, setManagerData] = useState(null);
    const [employeeData, setEmployeeData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                if (isAdmin) {
                    const { data } = await api.get('/admin/stats');
                    setStats(data);
                } else if (isManager) {
                    const [teamRes, leavesRes] = await Promise.all([
                        api.get('/attendance/team-history').catch(() => ({ data: { data: [] } })),
                        api.get('/leave/team-requests').catch(() => ({ data: { data: [] } }))
                    ]);
                    setManagerData({
                        teamAttendanceToday: teamRes.data.data?.filter(a => {
                            const d = new Date(a.date);
                            const today = new Date();
                            return d.toDateString() === today.toDateString();
                        }).length || 0,
                        pendingLeaves: leavesRes.data.data?.filter(l => l.status === 'Pending').length || 0,
                        totalTeamMembers: teamRes.data.data ? [...new Set(teamRes.data.data.map(a => a.employeeId?._id || a.employeeId))].length : 0
                    });
                } else if (isEmployee) {
                    const [attRes, leaveRes, perfRes] = await Promise.all([
                        api.get('/attendance/my-history').catch(() => ({ data: { data: [] } })),
                        api.get('/leave/my-requests').catch(() => ({ data: { data: [] } })),
                        api.get('/performance/my-reviews').catch(() => ({ data: { data: [] } }))
                    ]);
                    const thisMonth = attRes.data.data?.filter(a => {
                        const d = new Date(a.date);
                        const now = new Date();
                        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                    }) || [];
                    const totalHours = thisMonth.reduce((s, a) => s + (a.workingHours || 0), 0);
                    const pendingLeaves = leaveRes.data.data?.filter(l => l.status === 'Pending').length || 0;
                    const approvedLeaves = leaveRes.data.data?.filter(l => l.status === 'Approved').length || 0;
                    const reviews = perfRes.data.data || [];
                    const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—';

                    setEmployeeData({
                        daysPresent: thisMonth.length,
                        totalHours: totalHours.toFixed(1),
                        pendingLeaves,
                        approvedLeaves,
                        avgRating,
                        reviewCount: reviews.length
                    });
                }
            } catch (err) {
                console.error('Dashboard load error:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [isAdmin, isManager, isEmployee]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
                <span className="ml-3 text-slate-400">Loading dashboard...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white">
                    Welcome back, {user?.name || 'User'}
                </h1>
                <p className="text-slate-400 mt-2">
                    {isAdmin && "Here's an overview of the system status."}
                    {isManager && "Here's a summary of your department's activity."}
                    {isEmployee && "Here is your personal workspace."}
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {isAdmin && stats && (
                    <>
                        <StatCard title="Total Users" value={stats.totalUsers} subtitle={`${stats.totalEmployees} employees, ${stats.totalManagers} managers`} icon={Users} iconColor="text-blue-400" />
                        <StatCard title="Checked In Today" value={stats.todayAttendance} subtitle="Employees present today" icon={UserCheck} iconColor="text-green-400" />
                        <StatCard title="Security Alerts" value={stats.securityAlerts} subtitle="Failed login attempts" icon={AlertTriangle} iconColor="text-red-500" />
                        <StatCard title="Pending Leaves" value={stats.pendingLeaves} subtitle="Awaiting approval" icon={CalendarOff} iconColor="text-yellow-400" />
                        <StatCard title="Departments" value={stats.totalDepartments} subtitle="Active departments" icon={Building} iconColor="text-purple-400" />
                        <StatCard title="Avg Performance" value={stats.avgPerformance > 0 ? `${stats.avgPerformance}/5` : '—'} subtitle="Organization-wide rating" icon={Star} iconColor="text-amber-400" />
                    </>
                )}

                {isManager && managerData && (
                    <>
                        <StatCard title="Team Attendance Today" value={managerData.teamAttendanceToday} subtitle="Checked in today" icon={UserCheck} iconColor="text-green-400" />
                        <StatCard title="Pending Leave Requests" value={managerData.pendingLeaves} subtitle="Awaiting your approval" icon={CalendarOff} iconColor="text-yellow-400" />
                        <StatCard title="Team Members" value={managerData.totalTeamMembers} subtitle="In your department" icon={Users} iconColor="text-blue-400" />
                    </>
                )}

                {isEmployee && employeeData && (
                    <>
                        <StatCard title="Days Present (This Month)" value={employeeData.daysPresent} subtitle={`${employeeData.totalHours} hours worked`} icon={Clock} iconColor="text-green-400" />
                        <StatCard title="Pending Leaves" value={employeeData.pendingLeaves} subtitle={`${employeeData.approvedLeaves} approved`} icon={CalendarOff} iconColor="text-yellow-400" />
                        <StatCard title="Performance Rating" value={employeeData.avgRating} subtitle={`Based on ${employeeData.reviewCount} reviews`} icon={Star} iconColor="text-amber-400" />
                    </>
                )}
            </div>
        </div>
    );
}
