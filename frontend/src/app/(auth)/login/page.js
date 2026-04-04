'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await login(email, password);
            router.push('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-900">
            {/* Left Branding Panel */}
            <div className="hidden w-1/2 flex-col justify-center bg-gradient-to-br from-blue-700 to-indigo-900 p-12 text-white lg:flex">
                <h1 className="mb-6 text-5xl font-bold">Sanchalan ERP</h1>
                <p className="max-w-md text-xl leading-relaxed text-blue-100">
                    Enterprise Resource Planning System. Manage operations seamlessly.
                </p>
            </div>

            {/* Right Login Panel */}
            <div className="flex w-full items-center justify-center lg:w-1/2">
                <div className="w-full max-w-md p-8">
                    <h2 className="mb-2 text-3xl font-semibold text-slate-100">Welcome Back</h2>
                    <p className="mb-8 text-slate-400">Please enter your details to sign in.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300" htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                required
                                className="w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-3 text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label className="block text-sm font-medium text-slate-300" htmlFor="password">Password</label>
                                <Link href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
                                    Forgot password?
                                </Link>
                            </div>
                            <input
                                id="password"
                                type="password"
                                required
                                className="w-full rounded-md border border-slate-700 bg-slate-800 px-4 py-3 text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {error && <div className="rounded-md bg-red-900/50 p-3 text-sm text-red-400">{error}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-md bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
