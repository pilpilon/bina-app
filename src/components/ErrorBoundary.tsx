import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-charcoal flex items-center justify-center p-6 text-center" dir="rtl">
                    <div className="max-w-md w-full">
                        <div className="mb-8 inline-flex items-center justify-center w-24 h-24 bg-neon-pink/10 rounded-3xl border border-neon-pink/20 animate-pulse">
                            <AlertTriangle className="w-12 h-12 text-neon-pink" />
                        </div>

                        <h1 className="text-4xl font-black text-white mb-4 tracking-tighter bg-gradient-to-r from-neon-pink to-neon-purple bg-clip-text text-transparent">
                            משהו השתבש...
                        </h1>

                        <p className="text-text-secondary mb-8 font-medium leading-relaxed">
                            נתקלנו בשגיאה לא צפויה במערכת. אל דאגה, המידע שלך שמור בענן.
                            נסה לרענן את האפליקציה כדי להמשיך ללמוד.
                        </p>

                        <button
                            onClick={this.handleReload}
                            className="w-full py-4 bg-gradient-to-r from-neon-pink to-neon-purple text-white font-black rounded-2xl shadow-glow-purple flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            <RefreshCw className="w-5 h-5" />
                            רענן אפליקציה
                        </button>

                        <div className="mt-8 pt-8 border-t border-white/5">
                            <p className="text-[10px] text-text-muted/30 uppercase tracking-widest font-mono">
                                Error Code: {this.state.error?.name || 'Unknown_Exception'}
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
