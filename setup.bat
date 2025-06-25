@echo off
echo 🚀 Welcome to Pareto UI Starter!
echo ==================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is installed

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Check if environment file exists
if not exist "src\environments\environment.local.ts" (
    echo ⚙️  Setting up environment configuration...
    
    if exist "src\environments\environment.example.ts" (
        copy "src\environments\environment.example.ts" "src\environments\environment.local.ts" >nul
        echo ✅ Environment file created from example
    ) else (
        echo 📝 Creating basic environment file...
        (
            echo export const environment = {
            echo   production: false,
            echo   cognito: {
            echo     region: 'us-east-1',
            echo     userPoolId: 'your-user-pool-id',
            echo     userPoolClientId: 'your-client-id'
            echo   },
            echo   apiUrl: 'http://localhost:3000/api'
            echo };
        ) > "src\environments\environment.local.ts"
        echo ✅ Basic environment file created
    )
    
    echo ⚠️  Please edit src\environments\environment.local.ts with your AWS Cognito settings
)

REM Check if screenshots directory exists
if not exist "screenshots" (
    echo 📸 Creating screenshots directory...
    mkdir screenshots
    echo 📝 Add your app screenshots to the screenshots\ directory for better README presentation
)

echo.
echo 🎉 Setup Complete!
echo ==================
echo.
echo Next steps:
echo 1. Edit src\environments\environment.local.ts with your AWS Cognito settings
echo 2. Run 'npm start' to start the development server
echo 3. Open http://localhost:4200 in your browser
echo.
echo 📚 Documentation: Check README.md for detailed setup instructions
echo 🐛 Issues: https://github.com/your-username/pareto-ui-starter/issues
echo 💬 Discussions: https://github.com/your-username/pareto-ui-starter/discussions
echo.
echo Happy coding! 🚀
pause
