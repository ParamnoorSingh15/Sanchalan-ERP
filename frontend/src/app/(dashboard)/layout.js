import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PageTransition from '@/components/layout/PageTransition';

export default function DashboardLayout({ children }) {
    return (
        <ProtectedRoute>
            <div className="flex h-screen overflow-hidden transition-colors duration-300" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>
                <Sidebar />
                <div className="flex flex-1 flex-col overflow-hidden min-w-0">
                    <Topbar />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto px-6 py-8 transition-colors duration-300" style={{ backgroundColor: 'var(--bg-page)' }}>
                        <PageTransition>
                            {children}
                        </PageTransition>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
