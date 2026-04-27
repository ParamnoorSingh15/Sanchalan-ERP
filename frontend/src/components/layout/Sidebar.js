'use client';

import { memo, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Users, FileText, Settings,
    PanelLeftClose, PanelLeft, Briefcase, Building,
    Clock, CalendarOff, Star, UserPlus, ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import clsx from 'clsx';

const NAV_ITEMS = [
    { label: 'Dashboard',          href: '/dashboard',                icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Employee'] },
    { label: 'Security Anomalies', href: '/admin/security/anomalies', icon: ShieldAlert,     roles: ['Admin'] },
    { label: 'User Management',    href: '/admin/users',              icon: Users,           roles: ['Admin'] },
    { label: 'Managers',           href: '/admin/managers',           icon: Briefcase,       roles: ['Admin'] },
    { label: 'Employees',          href: '/admin/employees',          icon: UserPlus,        roles: ['Admin'] },
    { label: 'Departments',        href: '/admin/departments',        icon: Building,        roles: ['Admin'] },
    { label: 'Task Management',    href: '/admin/tasks',              icon: FileText,        roles: ['Admin'] },
    { label: 'Attendance',         href: '/admin/attendance',         icon: Clock,           roles: ['Admin'] },
    { label: 'Leaves',             href: '/admin/leaves',             icon: CalendarOff,     roles: ['Admin'] },
    { label: 'Performance',        href: '/admin/performance',        icon: Star,            roles: ['Admin'] },
    { label: 'Audit Logs',         href: '/admin/audit-logs',         icon: FileText,        roles: ['Admin'] },
    { label: 'My Team',            href: '/manager/team',             icon: Users,           roles: ['Manager'] },
    { label: 'Team Tasks',         href: '/manager/tasks',            icon: FileText,        roles: ['Manager'] },
    { label: 'Leave Approvals',    href: '/manager/leave-approvals',  icon: CalendarOff,     roles: ['Manager'] },
    { label: 'My Tasks',           href: '/employee/my-tasks',        icon: FileText,        roles: ['Employee'] },
    { label: 'My Attendance',      href: '/employee/attendance',      icon: Clock,           roles: ['Employee'] },
    { label: 'My Leaves',          href: '/employee/leaves',          icon: CalendarOff,     roles: ['Employee'] },
    { label: 'My Profile',         href: '/employee/profile',         icon: Users,           roles: ['Employee'] },
    { label: 'Settings',           href: '/settings',                 icon: Settings,        roles: ['Admin', 'Manager', 'Employee'] },
];

const NavItem = memo(function NavItem({ item, isActive, expanded }) {
    const Icon = item.icon;
    return (
        <Link
            href={item.href}
            style={isActive ? {
                backgroundColor: 'var(--sidebar-item-active-bg)',
                color: 'var(--sidebar-item-active-text)',
            } : {
                color: 'var(--sidebar-text)',
            }}
            className={clsx(
                'group relative flex items-center rounded-lg px-2.5 py-2.5 transition-all duration-200 ease-out',
                !isActive && 'hover:opacity-100'
            )}
            onMouseEnter={isActive ? undefined : (e) => {
                e.currentTarget.style.backgroundColor = 'var(--sidebar-item-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={isActive ? undefined : (e) => {
                e.currentTarget.style.backgroundColor = '';
                e.currentTarget.style.color = 'var(--sidebar-text)';
            }}
            aria-current={isActive ? 'page' : undefined}
        >
            {/* Active glow bar */}
            {isActive && (
                <motion.span
                    layoutId="active-pill"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                    style={{ backgroundColor: 'var(--sidebar-item-active-border)' }}
                />
            )}

            <span className="shrink-0 transition-transform duration-200 group-hover:scale-110"
                  style={{ color: isActive ? 'inherit' : 'var(--sidebar-icon)' }}>
                <Icon size={19} />
            </span>

            <AnimatePresence>
                {expanded && (
                    <motion.span
                        key="label"
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                        className="ml-3 truncate font-medium text-sm whitespace-nowrap leading-none"
                    >
                        {item.label}
                    </motion.span>
                )}
            </AnimatePresence>
        </Link>
    );
});

export default function Sidebar() {
    const [expanded, setExpanded] = useState(true);
    const pathname  = usePathname();
    const { hasRole } = useAuth();

    const toggleExpanded = useCallback(() => setExpanded(p => !p), []);

    const visibleNavItems = useMemo(
        () => NAV_ITEMS.filter(item => hasRole(item.roles)),
        [hasRole]
    );

    return (
        <motion.aside
            initial={false}
            animate={{ width: expanded ? 240 : 68 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{
                backgroundColor: 'var(--sidebar-bg)',
                borderRightColor: 'var(--sidebar-border)',
            }}
            className="flex h-screen flex-col border-r shadow-sm overflow-hidden shrink-0 transition-colors duration-300"
            aria-label="Sidebar navigation"
        >
            {/* Header / Logo */}
            <div className="flex h-16 items-center justify-between px-3.5"
                 style={{ borderBottomColor: 'var(--sidebar-border)', borderBottomWidth: 1 }}>
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            key="logo"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.18 }}
                            className="flex items-center gap-2.5 truncate"
                        >
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0"
                                 style={{ backgroundColor: 'var(--sidebar-logo-bg)' }}>
                                <Briefcase size={14} className="text-white" />
                            </div>
                            <span className="truncate font-bold text-sm tracking-tight"
                                  style={{ color: 'var(--text-primary)' }}>
                                Sanchalan ERP
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    onClick={toggleExpanded}
                    className="ml-auto rounded-lg p-1.5 transition-colors duration-200"
                    style={{ color: 'var(--sidebar-icon)' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--sidebar-item-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--sidebar-icon)'; }}
                    aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                    {expanded ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
                </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 space-y-0.5 p-2 pt-3 overflow-x-hidden overflow-y-auto" data-lenis-prevent="true">
                {visibleNavItems.map(item => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return <NavItem key={item.href} item={item} isActive={isActive} expanded={expanded} />;
                })}
            </nav>
        </motion.aside>
    );
}
