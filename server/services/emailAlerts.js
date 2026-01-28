import nodemailer from 'nodemailer';

class EmailAlertService {
  constructor() {
    this.transporter = null;
    if (process.env.ALERT_EMAIL && process.env.ALERT_EMAIL_PASSWORD) {
      this.setupTransporter();
    }
  }

  setupTransporter() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.ALERT_EMAIL,
        pass: process.env.ALERT_EMAIL_PASSWORD
      }
    });
  }

  async sendCostAlert(level, message, stats) {
    if (!this.transporter) return;

    try {
      const subject = `[${level}] Alshifa AI Cost Alert`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${level === 'CRITICAL' ? '#ef4444' : '#f59e0b'};">
            Cost Alert: ${level}
          </h2>
          <p><strong>${message}</strong></p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Today's Usage:</h3>
            <ul>
              <li>Total Requests: ${stats.requests}</li>
              <li>Input Tokens: ${stats.inputTokens.toLocaleString()}</li>
              <li>Output Tokens: ${stats.outputTokens.toLocaleString()}</li>
              <li><strong>Estimated Cost: $${stats.estimatedCost}</strong></li>
              <li>Avg per Request: $${stats.averageCostPerRequest}</li>
            </ul>
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            This is an automated alert from your Alshifa AI medical assistant cost monitoring system.
          </p>
        </div>
      `;

      await this.transporter.sendMail({
        from: process.env.ALERT_EMAIL,
        to: process.env.ALERT_EMAIL,
        subject,
        html
      });

      console.log('✅ Alert email sent');
    } catch (error) {
      console.error('❌ Failed to send alert email:', error);
    }
  }

  async sendDailySummary(stats, monthlyStats) {
    if (!this.transporter) return;

    try {
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #06b6d4;">Daily Usage Summary</h2>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Today (${stats.today}):</h3>
            <ul>
              <li>Requests: ${stats.requests}</li>
              <li>Input Tokens: ${stats.inputTokens.toLocaleString()}</li>
              <li>Output Tokens: ${stats.outputTokens.toLocaleString()}</li>
              <li><strong>Cost: $${stats.estimatedCost}</strong></li>
            </ul>
          </div>

          ${monthlyStats ? `
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>This Month (${monthlyStats.month}):</h3>
              <ul>
                <li>Total Requests: ${monthlyStats.requests.toLocaleString()}</li>
                <li>Input Tokens: ${monthlyStats.inputTokens.toLocaleString()}</li>
                <li>Output Tokens: ${monthlyStats.outputTokens.toLocaleString()}</li>
                <li><strong>Total Cost: $${monthlyStats.estimatedCost}</strong></li>
              </ul>
            </div>
          ` : ''}

          <p style="color: #6b7280; font-size: 14px;">
            Automated daily summary from Alshifa AI Medical Assistant
          </p>
        </div>
      `;

      await this.transporter.sendMail({
        from: process.env.ALERT_EMAIL,
        to: process.env.ALERT_EMAIL,
        subject: `Alshifa AI Daily Summary - ${stats.today}`,
        html
      });

      console.log('✅ Daily summary sent');
    } catch (error) {
      console.error('❌ Failed to send summary:', error);
    }
  }
}

export const emailAlerts = new EmailAlertService();
