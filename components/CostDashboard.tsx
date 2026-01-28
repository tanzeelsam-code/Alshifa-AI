import React, { useEffect, useState } from 'react';

interface DailyStats {
    today: string;
    requests: number;
    inputTokens: number;
    outputTokens: number;
    estimatedCost: string;
    averageCostPerRequest: string;
}

interface MonthlyStats {
    month: string;
    requests: number;
    inputTokens: number;
    outputTokens: number;
    estimatedCost: string;
    averageCostPerRequest: string;
}

interface CostDashboardProps {
    onBack?: () => void;
}

export const CostDashboard: React.FC<CostDashboardProps> = ({ onBack }) => {
    const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
    const [monthlyStats, setMonthlyStats] = useState<MonthlyStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const [dailyRes, monthlyRes] = await Promise.all([
                fetch(`${apiUrl}/api/stats/daily`),
                fetch(`${apiUrl}/api/stats/monthly`)
            ]);

            if (dailyRes.ok) {
                const daily = await dailyRes.json();
                setDailyStats(daily);
            }

            if (monthlyRes.ok) {
                const monthly = await monthlyRes.json();
                setMonthlyStats(monthly);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center animate-pulse">
                <div className="h-4 w-48 bg-slate-200 rounded mx-auto mb-4"></div>
                <p className="text-slate-500">Loading API stats...</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="text-cyan-600">📊</span> API Cost Tracking
                </h2>
                {onBack && (
                    <button
                        onClick={onBack}
                        className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium transition-colors"
                    >
                        ← Back
                    </button>
                )}
            </div>

            {/* Daily Stats */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-700 mb-8 transform transition hover:scale-[1.01]">
                <h3 className="text-lg font-bold mb-6 flex items-center justify-between">
                    <span className="flex items-center gap-2">📅 Today's Usage</span>
                    {dailyStats && (
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                            {dailyStats.today}
                        </span>
                    )}
                </h3>

                {dailyStats ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                            <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Requests</div>
                            <div className="text-3xl font-black text-slate-800 dark:text-white">{dailyStats.requests}</div>
                        </div>

                        <div className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-2xl border border-purple-100 dark:border-purple-800/30">
                            <div className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-1">Input Tokens</div>
                            <div className="text-3xl font-black text-slate-800 dark:text-white">
                                {dailyStats.inputTokens.toLocaleString()}
                            </div>
                        </div>

                        <div className="bg-pink-50 dark:bg-pink-900/20 p-5 rounded-2xl border border-pink-100 dark:border-pink-800/30">
                            <div className="text-xs font-bold text-pink-600 uppercase tracking-widest mb-1">Output Tokens</div>
                            <div className="text-3xl font-black text-slate-800 dark:text-white">
                                {dailyStats.outputTokens.toLocaleString()}
                            </div>
                        </div>

                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 md:col-span-2">
                            <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Total Estimated Cost</div>
                            <div className="text-4xl font-black text-emerald-600">
                                ${dailyStats.estimatedCost}
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-700/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-600/30">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Avg/Request</div>
                            <div className="text-2xl font-black text-slate-700 dark:text-slate-200">
                                ${dailyStats.averageCostPerRequest}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-8 rounded-2xl text-center text-slate-500">
                        No daily data tracked yet.
                    </div>
                )}
            </div>

            {/* Monthly Stats */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-700 transform transition hover:scale-[1.01]">
                <h3 className="text-lg font-bold mb-6 flex items-center justify-between">
                    <span className="flex items-center gap-2">📊 This Month</span>
                    {monthlyStats && (
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                            {monthlyStats.month}
                        </span>
                    )}
                </h3>

                {monthlyStats ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-cyan-50 dark:bg-cyan-900/20 p-5 rounded-2xl border border-cyan-100 dark:border-cyan-800/30">
                            <div className="text-xs font-bold text-cyan-600 uppercase tracking-widest mb-1">Total Requests</div>
                            <div className="text-3xl font-black text-slate-800 dark:text-white">
                                {monthlyStats.requests.toLocaleString()}
                            </div>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-2xl border border-amber-100 dark:border-amber-800/30">
                            <div className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Monthly Cost</div>
                            <div className="text-4xl font-black text-amber-600">
                                ${monthlyStats.estimatedCost}
                            </div>
                        </div>

                        <div className="md:col-span-2 bg-slate-50 dark:bg-slate-700/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-600/30">
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Cost Breakdown (USD)</div>
                            <div className="flex flex-col sm:flex-row gap-6">
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Input Tokens (Prompt)</span>
                                        <span className="text-sm font-bold text-slate-800 dark:text-white">${((monthlyStats.inputTokens / 1_000_000) * 0.075).toFixed(4)}</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                        <div className="h-full bg-cyan-500" style={{ width: '30%' }}></div>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Output Tokens (Response)</span>
                                        <span className="text-sm font-bold text-slate-800 dark:text-white">${((monthlyStats.outputTokens / 1_000_000) * 0.30).toFixed(4)}</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-500" style={{ width: '70%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-8 rounded-2xl text-center text-slate-500">
                        No monthly data available.
                    </div>
                )}
            </div>

            {/* Budget Warning */}
            {monthlyStats && parseFloat(monthlyStats.estimatedCost) > 25 && (
                <div className="mt-8 bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-200 dark:border-rose-800 p-5 rounded-2xl animate-pulse">
                    <div className="flex items-center gap-3 text-rose-800 dark:text-rose-200 font-bold">
                        <span className="text-2xl">⚠️</span>
                        <span>Monthly limit approaching! Consider optimizing API usage.</span>
                    </div>
                </div>
            )}
        </div>
    );
};
