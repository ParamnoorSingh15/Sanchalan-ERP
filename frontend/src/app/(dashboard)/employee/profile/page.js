"use client";

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EmployeeProfilePage() {
    const { user } = useAuth();

    if (!user) return null;

    const fields = [
        { label: 'Name', value: user.name },
        { label: 'Email', value: user.email },
        { label: 'Employee ID', value: user.employeeId || '—' },
        { label: 'Designation', value: user.designation || '—' },
        { label: 'Department', value: user.departmentId?.departmentName || '—' },
        { label: 'Role', value: user.roles?.join(', ') },
        { label: 'Status', value: user.status || 'Active' },
        { label: 'Joining Date', value: user.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : '—' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col mb-8">
                <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>My Profile</h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Your personal information and employment details.</p>
            </div>
            <div className="rounded-xl border shadow-xl" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {fields.map(f => (
                            <div key={f.label}>
                                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{f.label}</p>
                                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{f.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
