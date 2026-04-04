'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Link from 'next/link';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [message, setMessage] = useState('');

    if (!token) {
        return (
            <div className="text-center">
                <p className="text-red-400 mb-6 font-medium">Invalid or missing reset token.</p>
                <Link href="/forgot-password" className="text-blue-500 hover:text-blue-400 font-medium">
                    Request a new link
                </Link>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match.');
            return;
        }

        if (newPassword.length < 6) {
            setStatus('error');
            setMessage('Password must be at least 6 characters long.');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            await api.post('/auth/reset-password', { token, newPassword });
            setStatus('success');
            setMessage('Your password has been successfully reset.');
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.error || 'Failed to reset password. The token may be expired.');
        }
    };

    if (status === 'success') {
        return (
            <div className="text-center space-y-6">
                <div className="rounded-md bg-green-900/40 p-4 border border-green-800">
                    <p className="text-sm text-green-400 font-medium">{message}</p>
                </div>
                <p className="text-slate-400 text-sm">Redirecting you to login...</p>
                <Link href="/login" className="inline-block px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md transition-colors font-medium">
                    Go to Login now
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="newPassword">
                    New Password
                </label>
                <input
                    id="newPassword"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-4 py-3 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="Enter new password"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="confirmPassword">
                    Confirm Password
                </label>
                <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-4 py-3 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="Confirm new password"
                />
            </div>

            {status === 'error' && (
                <div className="rounded-md bg-red-900/40 p-3 text-sm text-red-400 border border-red-800">
                    {message}
                </div>
            )}

            <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full rounded-md bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
                {status === 'loading' ? 'Resetting...' : 'Reset Password'}
            </button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="flex min-h-screen bg-slate-900 items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-800 rounded-xl shadow-xl border border-slate-700 p-8">
                <h1 className="text-3xl font-semibold mb-2 text-white text-center">Reset Password</h1>
                <p className="text-slate-400 mb-8 text-center text-sm">
                    Enter your new password below.
                </p>
                <Suspense fallback={<div className="text-center text-slate-400">Loading token...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
