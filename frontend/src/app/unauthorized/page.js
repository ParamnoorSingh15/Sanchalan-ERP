export default function UnauthorizedPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-slate-200 p-6 text-center">
            <h1 className="mb-4 text-4xl font-bold text-red-500">403</h1>
            <h2 className="mb-6 text-2xl font-semibold">Access Denied</h2>
            <p className="mb-8 text-slate-400 max-w-md">
                You do not have the necessary permissions to view this page. If you believe this is a mistake, contact your system administrator.
            </p>
            <a href="/dashboard" className="rounded-lg bg-blue-600 px-6 py-2 transition-colors hover:bg-blue-700">
                Return to Dashboard
            </a>
        </div>
    );
}
