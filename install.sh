#!/bin/bash

echo "🚀 Setting up TodoRN React Native App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo "📦 Installing Expo CLI..."
    npm install -g @expo/cli
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Setting up development environment..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# TodoRN Environment Variables
EXPO_PUBLIC_APP_NAME=TodoRN
EXPO_PUBLIC_APP_VERSION=1.0.0
EOF
fi

echo "✅ Setup complete!"
echo ""
echo "🎉 TodoRN is ready to use!"
echo ""
echo "To start the development server:"
echo "  npm start"
echo ""
echo "To run on iOS:"
echo "  npm run ios"
echo ""
echo "To run on Android:"
echo "  npm run android"
echo ""
echo "To run on web:"
echo "  npm run web"
echo ""
echo "📱 Features included:"
echo "  ✅ OTP Authentication"
echo "  ✅ Task CRUD Operations"
echo "  ✅ Priority Levels"
echo "  ✅ Due Dates"
echo "  ✅ Categories"
echo "  ✅ Search & Filter"
echo "  ✅ Dark/Light Theme"
echo "  ✅ Swipe Actions"
echo "  ✅ Pull-to-Refresh"
echo "  ✅ Local Storage"
echo "  ✅ Offline Support"
echo "  ✅ Material Design 3"
echo ""
echo "🔧 Mock OTP: 123456"
echo "📱 Test Phone: Any valid phone number" 