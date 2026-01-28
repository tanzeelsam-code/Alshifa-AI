import fs from 'fs';
import path from 'path';

class CostMonitor {
    constructor() {
        this.logFile = path.join(process.cwd(), 'logs', 'api-usage.json');
        this.dailyLog = this.loadDailyLog();
        this.startDailyReset();
    }

    loadDailyLog() {
        try {
            if (fs.existsSync(this.logFile)) {
                return JSON.parse(fs.readFileSync(this.logFile, 'utf8'));
            }
        } catch (error) {
            console.error('Failed to load usage log:', error);
        }

        return {
            date: new Date().toISOString().split('T')[0],
            totalRequests: 0,
            totalInputTokens: 0,
            totalOutputTokens: 0,
            estimatedCost: 0,
            requests: []
        };
    }

    saveDailyLog() {
        try {
            const dir = path.dirname(this.logFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.logFile, JSON.stringify(this.dailyLog, null, 2));
        } catch (error) {
            console.error('Failed to save usage log:', error);
        }
    }

    // Estimate token count (rough approximation)
    estimateTokens(text) {
        // 1 token ≈ 4 characters for English
        // 1 token ≈ 2 characters for Arabic/Urdu
        return Math.ceil(text.length / 4);
    }

    logRequest(promptTokens, responseTokens, endpoint = 'generate') {
        const today = new Date().toISOString().split('T')[0];

        // Reset if new day
        if (this.dailyLog.date !== today) {
            this.archiveDailyLog();
            this.dailyLog = {
                date: today,
                totalRequests: 0,
                totalInputTokens: 0,
                totalOutputTokens: 0,
                estimatedCost: 0,
                requests: []
            };
        }

        // Gemini 1.5 Flash pricing
        const INPUT_PRICE_PER_1M = 0.075;
        const OUTPUT_PRICE_PER_1M = 0.30;

        const inputCost = (promptTokens / 1_000_000) * INPUT_PRICE_PER_1M;
        const outputCost = (responseTokens / 1_000_000) * OUTPUT_PRICE_PER_1M;
        const totalCost = inputCost + outputCost;

        this.dailyLog.totalRequests++;
        this.dailyLog.totalInputTokens += promptTokens;
        this.dailyLog.totalOutputTokens += responseTokens;
        this.dailyLog.estimatedCost += totalCost;

        this.dailyLog.requests.push({
            timestamp: new Date().toISOString(),
            endpoint,
            inputTokens: promptTokens,
            outputTokens: responseTokens,
            cost: totalCost
        });

        // Keep only last 100 requests to avoid huge log files
        if (this.dailyLog.requests.length > 100) {
            this.dailyLog.requests = this.dailyLog.requests.slice(-100);
        }

        this.saveDailyLog();
        this.checkThresholds();

        return {
            dailyTotal: this.dailyLog.estimatedCost,
            requestCost: totalCost,
            tokensUsed: promptTokens + responseTokens
        };
    }

    archiveDailyLog() {
        try {
            const archiveDir = path.join(process.cwd(), 'logs', 'archive');
            if (!fs.existsSync(archiveDir)) {
                fs.mkdirSync(archiveDir, { recursive: true });
            }

            const archiveFile = path.join(
                archiveDir,
                `usage-${this.dailyLog.date}.json`
            );
            fs.writeFileSync(archiveFile, JSON.stringify(this.dailyLog, null, 2));
        } catch (error) {
            console.error('Failed to archive log:', error);
        }
    }

    checkThresholds() {
        const DAILY_BUDGET = parseFloat(process.env.DAILY_BUDGET || '1.0');
        const currentCost = this.dailyLog.estimatedCost;
        const percentage = (currentCost / DAILY_BUDGET) * 100;

        if (percentage >= 100) {
            this.sendAlert('CRITICAL', `Daily budget exceeded! Current: $${currentCost.toFixed(4)}`);
        } else if (percentage >= 90) {
            this.sendAlert('WARNING', `90% of daily budget used: $${currentCost.toFixed(4)}`);
        } else if (percentage >= 50 && !this.dailyLog.alert50Sent) {
            this.sendAlert('INFO', `50% of daily budget used: $${currentCost.toFixed(4)}`);
            this.dailyLog.alert50Sent = true;
            this.saveDailyLog();
        }
    }

    async sendAlert(level, message) {
        console.error(`[${level}] COST ALERT: ${message}`);

        // Log to file
        const alertFile = path.join(process.cwd(), 'logs', 'alerts.log');
        const alertMessage = `${new Date().toISOString()} [${level}] ${message}\n`;

        if (!fs.existsSync(path.dirname(alertFile))) {
            fs.mkdirSync(path.dirname(alertFile), { recursive: true });
        }
        fs.appendFileSync(alertFile, alertMessage);

        // Send email alert if configured
        if (process.env.ALERT_EMAIL) {
            try {
                const { emailAlerts } = await import('../services/emailAlerts.js');
                emailAlerts.sendCostAlert(level, message, this.getStats());
            } catch (error) {
                console.error('Failed to send email alert:', error);
            }
        }
    }

    startDailyReset() {
        // Check every hour if we need to reset
        setInterval(() => {
            const today = new Date().toISOString().split('T')[0];
            if (this.dailyLog.date !== today) {
                this.archiveDailyLog();
                this.dailyLog = this.loadDailyLog();
            }
        }, 60 * 60 * 1000); // Every hour
    }

    getStats() {
        return {
            today: this.dailyLog.date,
            requests: this.dailyLog.totalRequests,
            inputTokens: this.dailyLog.totalInputTokens,
            outputTokens: this.dailyLog.totalOutputTokens,
            estimatedCost: this.dailyLog.estimatedCost.toFixed(4),
            averageCostPerRequest: (this.dailyLog.estimatedCost / this.dailyLog.totalRequests || 0).toFixed(6)
        };
    }

    getMonthlyStats() {
        try {
            const archiveDir = path.join(process.cwd(), 'logs', 'archive');
            if (!fs.existsSync(archiveDir)) return null;

            const files = fs.readdirSync(archiveDir);
            const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

            let monthlyRequests = 0;
            let monthlyInputTokens = 0;
            let monthlyOutputTokens = 0;
            let monthlyCost = 0;

            files.forEach(file => {
                if (file.startsWith(`usage-${currentMonth}`)) {
                    const data = JSON.parse(
                        fs.readFileSync(path.join(archiveDir, file), 'utf8')
                    );
                    monthlyRequests += data.totalRequests;
                    monthlyInputTokens += data.totalInputTokens;
                    monthlyOutputTokens += data.totalOutputTokens;
                    monthlyCost += data.estimatedCost;
                }
            });

            // Add today's stats
            monthlyRequests += this.dailyLog.totalRequests;
            monthlyInputTokens += this.dailyLog.totalInputTokens;
            monthlyOutputTokens += this.dailyLog.totalOutputTokens;
            monthlyCost += this.dailyLog.estimatedCost;

            return {
                month: currentMonth,
                requests: monthlyRequests,
                inputTokens: monthlyInputTokens,
                outputTokens: monthlyOutputTokens,
                estimatedCost: monthlyCost.toFixed(2),
                averageCostPerRequest: (monthlyCost / monthlyRequests || 0).toFixed(6)
            };
        } catch (error) {
            console.error('Failed to get monthly stats:', error);
            return null;
        }
    }
}

export const costMonitor = new CostMonitor();
