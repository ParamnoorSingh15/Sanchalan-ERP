'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const AVAILABLE_ROLES    = ['Admin', 'Manager', 'Employee'];
const AVAILABLE_STATUSES = ['Active', 'On Leave', 'Suspended', 'Terminated'];

const overlayVariants = {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit:    { opacity: 0, transition: { duration: 0.15 } },
};
const panelVariants = {
    hidden:  { opacity: 0, scale: 0.96, y: 10 },
    visible: { opacity: 1, scale: 1,    y: 0,   transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
    exit:    { opacity: 0, scale: 0.96, y: 10,  transition: { duration: 0.15 } },
};

const inputStyle = {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
};
const labelStyle = { color: 'var(--text-muted)' };

export default memo(function EditUserModal({ user, isOpen, onClose, onSave }) {
    const [roles,    setRoles]    = useState([]);
    const [isActive, setIsActive] = useState(true);
    const [status,   setStatus]   = useState('Active');
    const [isSaving, setIsSaving] = useState(false);
    const [error,    setError]    = useState(null);

    useEffect(() => {
        if (user) {
            setRoles(user.roles || []);
            setIsActive(user.isActive !== undefined ? user.isActive : true);
            setStatus(user.status || 'Active');
            setError(null);
        }
    }, [user, isOpen]);

    const handleRoleToggle  = useCallback(role => {
        setRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
    }, []);

    const handleStatusChange = useCallback(e => {
        const s = e.target.value;
        setStatus(s);
        setIsActive(s !== 'Terminated' && s !== 'Suspended');
    }, []);

    const handleSave = useCallback(async () => {
        if (roles.length === 0) { setError('User must have at least one role'); return; }
        setIsSaving(true);
        setError(null);
        const result = await onSave(user._id, { roles, isActive, status });
        if (result.success) onClose();
        else setError(result.error);
        setIsSaving(false);
    }, [roles, isActive, status, onSave, onClose, user]);

    return (
        <AnimatePresence>
            {isOpen && user && (
                <motion.div
                    key="overlay"
                    variants={overlayVariants}
                    initial="hidden" animate="visible" exit="exit"
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                    onClick={e => e.target === e.currentTarget && onClose()}
                >
                    <motion.div
                        key="panel"
                        variants={panelVariants}
                        initial="hidden" animate="visible" exit="exit"
                        className="rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        style={{
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border)',
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4"
                             style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-surface-2)' }}>
                            <div>
                                <h2 className="text-lg font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                                    Edit User
                                </h2>
                                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                            </div>
                            <button onClick={onClose}
                                    className="rounded-lg p-1.5 transition-all duration-150"
                                    style={{ color: 'var(--text-muted)' }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = 'var(--text-muted)'; }}
                                    aria-label="Close">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-5">
                            <AnimatePresence>
                                {error && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                                className="flex items-center gap-2 p-3 text-sm rounded-lg badge-danger">
                                        <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Locked fields */}
                            <div className="grid grid-cols-2 gap-4">
                                {[['Name', user.name], ['Email', user.email]].map(([label, val]) => (
                                    <div key={label} className="space-y-1.5">
                                        <label className="block text-xs font-medium tracking-wide" style={labelStyle}>{label}</label>
                                        <input value={val} disabled
                                               className="w-full h-10 rounded-lg px-3 text-sm cursor-not-allowed opacity-60"
                                               style={inputStyle} />
                                    </div>
                                ))}
                            </div>

                            {/* Roles */}
                            <div className="space-y-2.5">
                                <label className="block text-xs font-medium tracking-wide" style={labelStyle}>Roles</label>
                                <div className="flex flex-wrap gap-2">
                                    {AVAILABLE_ROLES.map(role => {
                                        const sel = roles.includes(role);
                                        return (
                                            <button key={role} type="button" onClick={() => handleRoleToggle(role)}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium cursor-pointer transition-all duration-200 ${sel ? 'badge-info shadow-sm' : ''}`}
                                                    style={!sel ? { backgroundColor: 'var(--bg-surface-2)', border: '1px solid var(--border)', color: 'var(--text-secondary)' } : {}}>
                                                {sel && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                                                {role}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="space-y-2.5">
                                <label className="block text-xs font-medium tracking-wide" style={labelStyle}>Employment Status</label>
                                <select value={status} onChange={handleStatusChange}
                                        className="w-full h-10 rounded-lg px-3 text-sm outline-none transition-all duration-200"
                                        style={{ ...inputStyle, appearance: 'auto' }}>
                                    {AVAILABLE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            {/* Login toggle */}
                            <div className="space-y-2.5">
                                <label className="block text-xs font-medium tracking-wide" style={labelStyle}>Login Access</label>
                                <label className="flex items-center justify-between cursor-pointer p-3.5 rounded-xl transition-all duration-200"
                                       style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface-2)' }}
                                       onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                                       onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--bg-surface-2)'; }}>
                                    <div>
                                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                            {isActive ? 'Login Permitted' : 'Login Blocked'}
                                        </span>
                                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                            {isActive ? 'User can access the ERP system' : 'Account is currently locked'}
                                        </p>
                                    </div>
                                    <div className="relative ml-4 shrink-0">
                                        <input type="checkbox" className="sr-only" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                                        <div className={`block w-11 h-6 rounded-full transition-colors duration-300 ${isActive ? 'bg-emerald-500' : ''}`}
                                             style={!isActive ? { backgroundColor: 'var(--border)' } : {}} />
                                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-sm ${isActive ? 'translate-x-5' : ''}`} />
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 px-6 py-4"
                             style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-surface-2)' }}>
                            <button onClick={onClose} disabled={isSaving}
                                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                                    style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', backgroundColor: 'transparent' }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={isSaving}
                                    className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/20 transition-all duration-200 disabled:opacity-50">
                                {isSaving ? (
                                    <><span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />Saving…</>
                                ) : 'Save Changes'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
});
