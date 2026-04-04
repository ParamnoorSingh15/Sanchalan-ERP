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
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">My Profile</h1>
                <p className="text-slate-400">Your personal information and employment details.</p>
            </div>
            <Card className="bg-slate-800 border-slate-700 shadow-xl">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {fields.map(f => (
                            <div key={f.label}>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{f.label}</p>
                                <p className="text-slate-200 font-medium">{f.value}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
