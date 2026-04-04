import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function DashboardLayout({ children }) {
    return (
        <ProtectedRoute>
            <div className="flex h-screen overflow-hidden bg-slate-900 text-slate-200">
                <Sidebar />
                <div className="flex flex-1 flex-col overflow-hidden min-w-0">
                    <Topbar />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-950 px-6 py-8">
                        {children}
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
