'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    PanelLeftClose,
    PanelLeft,
    Briefcase,
    Building,
    Clock,
    CalendarOff,
    Star,
    UserPlus,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import clsx from 'clsx';

const NAV_ITEMS = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Employee'] },
    // Admin
    { label: 'User Management', href: '/admin/users', icon: Users, roles: ['Admin'] },
    { label: 'Managers', href: '/admin/managers', icon: Briefcase, roles: ['Admin'] },
    { label: 'Employees', href: '/admin/employees', icon: UserPlus, roles: ['Admin'] },
    { label: 'Departments', href: '/admin/departments', icon: Building, roles: ['Admin'] },
    { label: 'Task Management', href: '/admin/tasks', icon: FileText, roles: ['Admin'] },
    { label: 'Attendance', href: '/admin/attendance', icon: Clock, roles: ['Admin'] },
    { label: 'Leaves', href: '/admin/leaves', icon: CalendarOff, roles: ['Admin'] },
    { label: 'Performance', href: '/admin/performance', icon: Star, roles: ['Admin'] },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: FileText, roles: ['Admin'] },
    // Manager
    { label: 'My Team', href: '/manager/team', icon: Users, roles: ['Manager'] },
    { label: 'Team Tasks', href: '/manager/tasks', icon: FileText, roles: ['Manager'] },
    { label: 'Leave Approvals', href: '/manager/leave-approvals', icon: CalendarOff, roles: ['Manager'] },
    // Employee
    { label: 'My Tasks', href: '/employee/my-tasks', icon: FileText, roles: ['Employee'] },
    { label: 'My Attendance', href: '/employee/attendance', icon: Clock, roles: ['Employee'] },
    { label: 'My Leaves', href: '/employee/leaves', icon: CalendarOff, roles: ['Employee'] },
    { label: 'My Profile', href: '/employee/profile', icon: Users, roles: ['Employee'] },
    // Common
    { label: 'Settings', href: '/settings', icon: Settings, roles: ['Admin', 'Manager', 'Employee'] },
];

export default function Sidebar() {
    const [expanded, setExpanded] = useState(true);
    const pathname = usePathname();
    const { hasRole } = useAuth();

    const visibleNavItems = NAV_ITEMS.filter((item) => hasRole(item.roles));

    return (
        <motion.aside
            initial={false}
            animate={{ width: expanded ? 240 : 64 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="flex h-screen flex-col border-r border-slate-800 bg-slate-900 shadow-xl overflow-hidden"
            aria-label="Sidebar navigation"
        >
            {/* Logo / toggle */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            key="logo"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.15 }}
                            className="flex items-center space-x-2 truncate font-bold text-slate-100"
                        >
                            <Briefcase className="text-blue-500 shrink-0" size={22} />
                            <span className="truncate">Sanchalan ERP</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    onClick={() => setExpanded((prev) => !prev)}
                    className="ml-auto rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                    aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                    {expanded ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
                </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 space-y-1 p-2 pt-4 overflow-x-hidden overflow-y-auto">
                {visibleNavItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                'flex items-center rounded-lg px-2.5 py-2 transition-colors group',
                                isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            )}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <span className="shrink-0">
                                <Icon size={20} />
                            </span>
                            <AnimatePresence>
                                {expanded && (
                                    <motion.span
                                        key="label"
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: 'auto' }}
                                        exit={{ opacity: 0, width: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="ml-3 truncate font-medium text-sm whitespace-nowrap"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>
                    );
                })}
            </nav>
        </motion.aside>
    );
}
