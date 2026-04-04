'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const { data } = await api.post('/auth/forgot-password', { email });
            setStatus('success');
            setMessage(data.message || 'If that email is registered, a password reset link has been sent.');
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.error || 'Something went wrong. Please try again.');
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-900 items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-800 rounded-xl shadow-xl border border-slate-700 p-8">
                <div className="mb-6">
                    <Link href="/login" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to log in
                    </Link>
                </div>

                <h1 className="text-3xl font-semibold mb-2 text-white">Forgot Password</h1>
                <p className="text-slate-400 mb-8">
                    Enter your email address to receive a password reset link.
                </p>

                {status === 'success' ? (
                    <div className="rounded-md bg-green-900/40 p-4 border border-green-800">
                        <p className="text-sm text-green-400">{message}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="email">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-md border border-slate-700 bg-slate-900 px-4 py-3 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                placeholder="name@company.com"
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
                            {status === 'loading' ? 'Sending link...' : 'Send reset link'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
