import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    componentName?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * PRODUCTION-GRADE ERROR BOUNDARY
 * 
 * Features:
 * 1. Automatic logging to backend audit log
 * 2. Intelligent fallback UI
 * 3. Recovery mechanism (Reload)
 */
export class ErrorBoundary extends Component<Props, State> {
    public state: State;
    public props: Props;

    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`🔴 [ErrorBoundary] Caught in ${this.props.componentName || 'Unknown'}:`, error, errorInfo);

        // Log error to audit service
        this.logErrorToAudit(error, errorInfo);
    }

    private async logErrorToAudit(error: Error, errorInfo: ErrorInfo) {
        try {
            const { AuditService, AuditAction } = await import('../services/AuditService');
            const userId = localStorage.getItem('alshifa_current_user') || 'anonymous';
            const userName = 'System';
            const userRole = 'System';

            AuditService.log(
                userId,
                userName,
                userRole,
                AuditAction.ERROR_OCCURRED,
                this.props.componentName || 'ErrorBoundary',
                undefined,
                JSON.stringify({
                    message: error.message,
                    stack: error.stack?.substring(0, 200),
                    componentStack: errorInfo.componentStack?.substring(0, 200),
                    timestamp: new Date().toISOString()
                })
            );
        } catch (logError) {
            console.error('Failed to log error to audit service:', logError);
        }
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 m-4">
                    <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">Technical Insight Needed</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
                        The application encountered an unexpected error. Our engineers have been notified.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={this.handleReload}
                            className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-cyan-500/25 active:scale-95"
                        >
                            Reload Application
                        </button>
                    </div>

                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-8 p-4 bg-slate-200 dark:bg-slate-800 rounded-xl text-left overflow-auto max-w-full">
                            <p className="text-[10px] font-mono text-slate-600 dark:text-slate-400">
                                {this.state.error?.toString()}
                            </p>
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
