#!/bin/bash

echo "🔧 Setting up cost monitoring..."

# Create directories
mkdir -p logs/archive

# Create .env if doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file..."
  cat > .env << EOF
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

GEMINI_API_KEY=your_key_here
AUDIT_TOKEN=$(openssl rand -hex 32)

DAILY_BUDGET=1.0
MONTHLY_BUDGET=30.0

# Email alerts (optional)
ALERT_EMAIL=your-email@example.com
ALERT_EMAIL_PASSWORD=your_app_password
EOF
  echo "✅ .env created. Please update with your actual keys."
else
  echo "✅ .env already exists"
fi

# Install email dependencies
echo "📦 Installing backend dependencies..."
npm install

echo "✅ Monitoring setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your Gemini API key"
echo "2. (Optional) Set up email alerts"
echo "3. Run: npm run dev"
