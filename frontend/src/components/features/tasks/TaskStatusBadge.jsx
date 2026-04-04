import React from 'react';

export default function TaskStatusBadge({ status, priority }) {
    const getStatusColor = (s) => {
        switch (s) {
            case 'Completed': return 'bg-green-900/40 text-green-400 border-green-800';
            case 'In Progress': return 'bg-blue-900/40 text-blue-400 border-blue-800';
            case 'Blocked': return 'bg-red-900/40 text-red-400 border-red-800';
            case 'Assigned': return 'bg-yellow-900/40 text-yellow-500 border-yellow-800';
            case 'Pending': default: return 'bg-slate-800 text-slate-400 border-slate-700';
            case 'Cancelled': return 'bg-slate-900 text-slate-600 border-slate-800 line-through';
        }
    };

    const getPriorityColor = (p) => {
        switch (p) {
            case 'Critical': return 'bg-red-500 text-white';
            case 'High': return 'bg-orange-500 text-white';
            case 'Medium': return 'bg-blue-500 text-white';
            case 'Low': default: return 'bg-slate-500 text-white';
        }
    };

    return (
        <div className="flex gap-2 items-center">
            {priority && (
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${getPriorityColor(priority)}`}>
                    {priority}
                </span>
            )}
            {status && (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                    {status}
                </span>
            )}
        </div>
    );
}
