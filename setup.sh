#!/bin/bash

# 🚀 Pareto UI Starter - Quick Setup Script
# This script helps you get up and running quickly

echo "🚀 Welcome to Pareto UI Starter!"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -c2-)
REQUIRED_VERSION="18.0.0"

if ! printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -C -V; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to 18.0.0 or higher."
    exit 1
fi

echo "✅ Node.js version: $NODE_VERSION"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if environment file exists
if [ ! -f "src/environments/environment.local.ts" ]; then
    echo "⚙️  Setting up environment configuration..."
    
    if [ -f "src/environments/environment.example.ts" ]; then
        cp src/environments/environment.example.ts src/environments/environment.local.ts
        echo "✅ Environment file created from example"
    else
        echo "📝 Creating basic environment file..."
        cat > src/environments/environment.local.ts << EOF
export const environment = {
  production: false,
  cognito: {
    region: 'us-east-1',
    userPoolId: 'your-user-pool-id',
    userPoolClientId: 'your-client-id'
  },
  apiUrl: 'http://localhost:3000/api'
};
EOF
        echo "✅ Basic environment file created"
    fi
    
    echo "⚠️  Please edit src/environments/environment.local.ts with your AWS Cognito settings"
fi

# Check if screenshots directory exists
if [ ! -d "screenshots" ]; then
    echo "📸 Creating screenshots directory..."
    mkdir screenshots
    echo "📝 Add your app screenshots to the screenshots/ directory for better README presentation"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Edit src/environments/environment.local.ts with your AWS Cognito settings"
echo "2. Run 'npm start' to start the development server"
echo "3. Open http://localhost:4200 in your browser"
echo ""
echo "📚 Documentation: Check README.md for detailed setup instructions"
echo "🐛 Issues: https://github.com/your-username/pareto-ui-starter/issues"
echo "💬 Discussions: https://github.com/your-username/pareto-ui-starter/discussions"
echo ""
echo "Happy coding! 🚀"
