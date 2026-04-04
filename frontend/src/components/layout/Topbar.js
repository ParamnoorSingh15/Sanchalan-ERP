'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';
import { Bell, Search, Moon, Sun, User as UserIcon, LogOut, Settings } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Topbar() {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();

    return (
        <header className="flex h-16 items-center justify-between border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-xl px-6 sticky top-0 z-40 shadow-sm transition-colors duration-300">
            {/* Search */}
            <div className="flex max-w-md flex-1 items-center rounded-md bg-slate-800/80 px-3 py-1.5 focus-within:ring-1 focus-within:ring-blue-500 transition-all border border-slate-700/50">
                <Search className="mr-2 h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
                <input
                    type="search"
                    placeholder="Search…"
                    aria-label="Global search"
                    className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-400"
                />
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3 ml-4">
                <button
                    aria-label="Notifications"
                    className="text-slate-400 hover:text-slate-200 transition-colors rounded-md p-1.5 hover:bg-slate-800/60"
                >
                    <Bell className="h-5 w-5" />
                </button>
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    aria-label="Toggle theme"
                    className="text-slate-400 hover:text-slate-200 transition-colors rounded-md p-1.5 hover:bg-slate-800/60"
                >
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>

                <div className="h-6 w-px bg-slate-700" aria-hidden="true" />

                {/* User dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center space-x-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md p-1">
                        <div
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white select-none"
                            aria-hidden="true"
                        >
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="hidden flex-col items-start md:flex">
                            <span className="text-sm font-medium text-slate-200 leading-none mb-0.5">
                                {user?.name || 'User'}
                            </span>
                            <span className="text-[10px] uppercase text-slate-400 font-semibold leading-none tracking-wide">
                                {user?.roles?.[0] || 'Employee'}
                            </span>
                        </div>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700 text-slate-200">
                        <DropdownMenuLabel className="text-slate-400 text-xs font-normal">
                            Signed in as <span className="font-medium text-slate-200">{user?.email}</span>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-700" />
                        <DropdownMenuItem className="cursor-pointer hover:bg-slate-700 focus:bg-slate-700 focus:text-slate-100">
                            <UserIcon className="mr-2 h-4 w-4" />
                            <span>My Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer hover:bg-slate-700 focus:bg-slate-700 focus:text-slate-100">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-700" />
                        <DropdownMenuItem
                            onClick={logout}
                            className="cursor-pointer text-red-400 hover:bg-slate-700 hover:text-red-300 focus:bg-slate-700 focus:text-red-300"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
