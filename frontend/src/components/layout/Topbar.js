'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';
import {
    Bell, Search, Moon, Sun, LogOut, X, Settings,
    LayoutDashboard, Users, FileText, Building, Clock,
    CalendarOff, ShieldAlert, ChevronRight, Check,
    Sliders, Monitor, Brush, Globe, Lock,
} from 'lucide-react';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/* ── Search index  ─────────────────────────────────────── */
const SEARCH_INDEX = [
    { label: 'Dashboard',          href: '/dashboard',                icon: LayoutDashboard, category: 'Pages' },
    { label: 'Security Anomalies', href: '/admin/security/anomalies', icon: ShieldAlert,     category: 'Admin' },
    { label: 'User Management',    href: '/admin/users',              icon: Users,           category: 'Admin' },
    { label: 'Departments',        href: '/admin/departments',        icon: Building,        category: 'Admin' },
    { label: 'Task Management',    href: '/admin/tasks',              icon: FileText,        category: 'Admin' },
    { label: 'Attendance',         href: '/admin/attendance',         icon: Clock,           category: 'Admin' },
    { label: 'Leaves',             href: '/admin/leaves',             icon: CalendarOff,     category: 'Admin' },
    { label: 'Audit Logs',         href: '/admin/audit-logs',         icon: FileText,        category: 'Admin' },
    { label: 'Team Tasks',         href: '/manager/tasks',            icon: FileText,        category: 'Manager' },
    { label: 'Leave Approvals',    href: '/manager/leave-approvals',  icon: CalendarOff,     category: 'Manager' },
];

const TYPE_CLS = {
    danger:  'bg-red-500',
    warning: 'bg-amber-500',
    info:    'bg-blue-500',
    success: 'bg-emerald-500',
    muted:   'bg-slate-400',
};

const panelVariants = {
    hidden:  { opacity: 0, y: -8, scale: 0.97 },
    visible: { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } },
    exit:    { opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.15 } },
};

/* ────────────────────────────────────────────────────────
   SEARCH COMMAND PALETTE
   ──────────────────────────────────────────────────────── */
function SearchPalette({ open, onClose }) {
    const [query,   setQuery]   = useState('');
    const [active,  setActive]  = useState(0);
    const router  = useRouter();
    const inputRef = useRef(null);

    useEffect(() => {
        if (open) { setQuery(''); setActive(0); setTimeout(() => inputRef.current?.focus(), 80); }
    }, [open]);

    const results = query.trim()
        ? SEARCH_INDEX.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
        : SEARCH_INDEX.slice(0, 6);

    const go = useCallback((href) => { router.push(href); onClose(); }, [router, onClose]);

    const handleKey = useCallback((e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setActive(p => Math.min(p + 1, results.length - 1)); }
        if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(p => Math.max(p - 1, 0)); }
        if (e.key === 'Enter' && results[active]) go(results[active].href);
        if (e.key === 'Escape') onClose();
    }, [active, results, go, onClose]);

    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-28 px-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
             onClick={onClose}>
            <motion.div
                variants={panelVariants} initial="hidden" animate="visible" exit="exit"
                onClick={e => e.stopPropagation()}
                className="w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden"
                style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            >
                <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
                    <Search size={17} style={{ color: 'var(--text-muted)' }} className="shrink-0" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={e => { setQuery(e.target.value); setActive(0); }}
                        onKeyDown={handleKey}
                        placeholder="Search pages, features…"
                        className="flex-1 bg-transparent text-sm outline-none"
                        style={{ color: 'var(--text-primary)' }}
                    />
                    <kbd className="text-[11px] px-1.5 py-0.5 rounded border font-mono" style={{ backgroundColor: 'var(--bg-surface-3)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>ESC</kbd>
                </div>

                <div className="max-h-72 overflow-y-auto py-1.5" data-lenis-prevent="true">
                    {results.length === 0 ? (
                        <p className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No results for "{query}"</p>
                    ) : results.map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <button key={item.href} onClick={() => go(item.href)}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100"
                                    style={{ backgroundColor: i === active ? 'var(--bg-hover)' : 'transparent' }}
                                    onMouseEnter={() => setActive(i)}>
                                <span className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
                                      style={{ backgroundColor: 'var(--bg-surface-3)' }}>
                                    <Icon size={14} style={{ color: 'var(--text-muted)' }} />
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{item.category}</p>
                                </div>
                                <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center gap-4 px-4 py-2 text-[11px]"
                     style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-surface-2)' }}>
                    <span><kbd className="font-mono">↑↓</kbd> navigate</span>
                    <span><kbd className="font-mono">↵</kbd> open</span>
                    <span><kbd className="font-mono">esc</kbd> close</span>
                </div>
            </motion.div>
        </div>
    );
}

/* ────────────────────────────────────────────────────────
   NOTIFICATIONS PANEL
   ──────────────────────────────────────────────────────── */
const NotificationsPanel = memo(function NotificationsPanel({ notes, onMarkAll, onDismiss }) {
    const unread = notes.filter(n => !n.read).length;

    return (
        <motion.div
            variants={panelVariants} initial="hidden" animate="visible" exit="exit"
            className="absolute right-0 top-12 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
            <div className="flex items-center justify-between px-4 py-3"
                 style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface-2)' }}>
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
                    {unread > 0 && (
                        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-[10px] font-bold text-white">{unread}</span>
                    )}
                </div>
                {unread > 0 && (
                    <button onClick={onMarkAll} className="text-[11px] font-medium transition-colors"
                            style={{ color: 'var(--color-info-fg)' }}>
                        Mark all read
                    </button>
                )}
            </div>

            <div className="overflow-y-auto max-h-80" data-lenis-prevent="true">
                {notes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2" style={{ color: 'var(--text-muted)' }}>
                        <Bell size={28} className="opacity-30" />
                        <p className="text-sm">All caught up!</p>
                    </div>
                ) : notes.map(n => (
                    <div key={n.id}
                         className="flex items-start gap-3 px-4 py-3 transition-colors duration-150 group relative"
                         style={{ backgroundColor: !n.read ? 'var(--bg-surface-2)' : 'transparent', borderBottom: '1px solid var(--border)' }}>
                        <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${TYPE_CLS[n.type] || 'bg-slate-400'}`} />
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold leading-tight truncate" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                            <p className="text-[11px] mt-0.5 leading-snug line-clamp-2" style={{ color: 'var(--text-muted)' }}>{n.body}</p>
                            <p className="text-[10px] mt-1 font-medium" style={{ color: 'var(--text-muted)' }}>{n.time}</p>
                        </div>
                        <button onClick={() => onDismiss(n.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity rounded p-1 mt-0.5 shrink-0"
                                style={{ color: 'var(--text-muted)' }}>
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </motion.div>
    );
});

/* ────────────────────────────────────────────────────────
   SETTINGS PANEL
   ──────────────────────────────────────────────────────── */
const SettingsPanel = memo(function SettingsPanel({ onClose, theme, setTheme }) {
    const sections = [
        {
            icon: Brush, label: 'Appearance',
            content: (
                <div className="space-y-3 mt-3">
                    <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Color Theme</p>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: 'light',  label: 'Light',  icon: Sun },
                            { id: 'dark',   label: 'Dark',   icon: Moon },
                            { id: 'system', label: 'System', icon: Monitor },
                        ].map(({ id, label, icon: Icon }) => (
                            <button key={id} onClick={() => setTheme(id)}
                                    className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all duration-200"
                                    style={{
                                        backgroundColor: theme === id ? 'var(--color-info-muted)' : 'var(--bg-surface-2)',
                                        borderColor:     theme === id ? 'var(--color-info-border)' : 'var(--border)',
                                        color:           theme === id ? 'var(--color-info-fg)' : 'var(--text-secondary)',
                                    }}>
                                <Icon size={15} />
                                {label}
                                {theme === id && <Check size={10} />}
                            </button>
                        ))}
                    </div>
                </div>
            )
        },
        {
            icon: Globe, label: 'Locale',
            content: (
                <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Language</span>
                        <span className="text-xs font-medium badge-muted px-2 py-0.5 rounded-full">English (EN)</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Timezone</span>
                        <span className="text-xs font-medium badge-muted px-2 py-0.5 rounded-full">IST (UTC+5:30)</span>
                    </div>
                </div>
            )
        },
        {
            icon: Lock, label: 'Security',
            content: (
                <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>2-Factor Auth</span>
                        <span className="badge-muted text-xs px-2 py-0.5 rounded-full font-medium">Disabled</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Session Timeout</span>
                        <span className="badge-info text-xs px-2 py-0.5 rounded-full font-medium">8 hrs</span>
                    </div>
                </div>
            )
        },
    ];

    const [active, setActive] = useState(0);

    return (
        <motion.div
            variants={panelVariants} initial="hidden" animate="visible" exit="exit"
            className="absolute right-0 top-12 rounded-2xl shadow-2xl z-50 overflow-hidden"
            style={{ width: 340, backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
            <div className="flex items-center justify-between px-4 py-3"
                 style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface-2)' }}>
                <div className="flex items-center gap-2">
                    <Sliders size={15} style={{ color: 'var(--text-muted)' }} />
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Settings</h3>
                </div>
                <button onClick={onClose} className="rounded-lg p-1 transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; }}>
                    <X size={14} />
                </button>
            </div>

            <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
                {sections.map(({ icon: Icon, label }, i) => (
                    <button key={label} onClick={() => setActive(i)}
                            className="flex-1 flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-all duration-150"
                            style={{
                                color: active === i ? 'var(--color-info-fg)' : 'var(--text-muted)',
                                borderBottom: active === i ? '2px solid var(--color-info)' : '2px solid transparent',
                            }}>
                        <Icon size={14} />
                        {label}
                    </button>
                ))}
            </div>

            <div className="p-4">
                <AnimatePresence mode="wait">
                    <motion.div key={active} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
                        {sections[active].content}
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
});

/* ────────────────────────────────────────────────────────
   MAIN TOPBAR
   ──────────────────────────────────────────────────────── */
export default function Topbar() {
    const { user, logout, hasRole } = useAuth();
    const { theme, setTheme } = useTheme();

    const [searchOpen, setSearchOpen] = useState(false);
    const [notifOpen,  setNotifOpen]  = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [notes, setNotes] = useState([]);

    // Fetch user notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const { data } = await api.get('/notifications');
                const mapped = data.map(n => ({
                    id: n._id,
                    title: n.title,
                    body: n.body,
                    time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    read: n.read,
                    type: n.type || 'info'
                }));
                setNotes(mapped);
            } catch (err) {
                console.error('Failed to fetch notifications:', err);
                setNotes([]);
            }
        };

        if (user) {
            fetchNotifications();
        }
    }, [user]);

    const unreadCount = notes.filter(n => !n.read).length;

    const handleMarkAll = useCallback(async () => {
        try {
            await api.put('/notifications/read-all');
            setNotes(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error('Failed to mark all as read', err);
        }
    }, []);

    const handleDismiss = useCallback(async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotes(prev => prev.filter(n => n.id !== id));
        } catch (err) {
            console.error('Failed to dismiss notification', err);
        }
    }, []);

    const notifRef    = useRef(null);
    const settingsRef = useRef(null);

    useEffect(() => {
        const handleOut = (e) => {
            if (notifRef.current    && !notifRef.current.contains(e.target))    setNotifOpen(false);
            if (settingsRef.current && !settingsRef.current.contains(e.target)) setSettingsOpen(false);
        };
        document.addEventListener('mousedown', handleOut);
        return () => document.removeEventListener('mousedown', handleOut);
    }, []);

    useEffect(() => {
        const fn = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(v => !v); } };
        document.addEventListener('keydown', fn);
        return () => document.removeEventListener('keydown', fn);
    }, []);

    const iconBtn = (label, onClick, children, badge = null) => (
        <button aria-label={label} onClick={onClick}
                className="relative rounded-lg p-2 transition-colors duration-200"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--text-muted)'; }}>
            {children}
            {badge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                    {badge > 9 ? '9+' : badge}
                </span>
            )}
        </button>
    );

    return (
        <>
            <AnimatePresence>{searchOpen && <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />}</AnimatePresence>

            <header
                className="flex h-16 items-center justify-between px-6 sticky top-0 z-40 backdrop-blur-xl shadow-sm transition-colors duration-300"
                style={{ backgroundColor: 'var(--topbar-bg)', borderBottom: '1px solid var(--topbar-border)' }}
            >
                <button
                    onClick={() => setSearchOpen(true)}
                    className="flex max-w-xs flex-1 items-center rounded-lg px-3 py-2 text-sm transition-all cursor-text"
                    style={{
                        backgroundColor: 'var(--topbar-input-bg)',
                        border: '1px solid var(--topbar-input-border)',
                        color: 'var(--text-placeholder)',
                    }}
                >
                    <Search className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Search pages, users…</span>
                    <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded font-mono hidden md:block"
                         style={{ backgroundColor: 'var(--bg-surface-3)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                        ⌘K
                    </kbd>
                </button>

                <div className="flex items-center gap-1 ml-4">
                    {iconBtn('Toggle theme', () => setTheme(theme === 'dark' ? 'light' : 'dark'), theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}

                    <div className="relative" ref={notifRef}>
                        {iconBtn('Notifications', () => { setNotifOpen(v => !v); setSettingsOpen(false); }, <Bell className="h-5 w-5" />, unreadCount)}
                        <AnimatePresence>{notifOpen && <NotificationsPanel notes={notes} onMarkAll={handleMarkAll} onDismiss={handleDismiss} onClose={() => setNotifOpen(false)} />}</AnimatePresence>
                    </div>

                    <div className="relative" ref={settingsRef}>
                        {iconBtn('Settings', () => { setSettingsOpen(v => !v); setNotifOpen(false); }, <Settings className="h-5 w-5" />)}
                        <AnimatePresence>{settingsOpen && <SettingsPanel onClose={() => setSettingsOpen(false)} theme={theme} setTheme={setTheme} />}</AnimatePresence>
                    </div>

                    <div className="h-6 w-px mx-1" style={{ backgroundColor: 'var(--border)' }} aria-hidden="true" />

                    <DropdownMenu>
                        <DropdownMenuTrigger
                            className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg px-1.5 py-1 transition-colors duration-200"
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; }}
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white select-none shrink-0">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="hidden flex-col items-start md:flex">
                                <span className="text-sm font-semibold leading-none mb-0.5" style={{ color: 'var(--text-primary)' }}>
                                    {user?.name || 'User'}
                                </span>
                                <span className="text-[10px] uppercase font-semibold leading-none tracking-wide" style={{ color: 'var(--text-muted)' }}>
                                    {user?.roles?.[0] || 'Employee'}
                                </span>
                            </div>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-52" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                            <DropdownMenuLabel style={{ color: 'var(--text-muted)' }} className="text-xs font-normal">Signed in as <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.email}</span></DropdownMenuLabel>
                            <DropdownMenuSeparator style={{ backgroundColor: 'var(--border)' }} />
                            <DropdownMenuItem onClick={logout} className="cursor-pointer gap-2 transition-colors duration-150" style={{ color: 'var(--color-danger-fg)' }}>
                                <LogOut className="h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
        </>
    );
}
