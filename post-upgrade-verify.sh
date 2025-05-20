#!/bin/bash

echo "🔍 Running Post-upgrade Verification for React v19..."

# Verify React version
echo "Checking React version..."
npm list react react-dom

# Run type checking
echo "
🔍 Running TypeScript type check..."
npm run typecheck

# Run tests
echo "
🧪 Running test suite..."
npm test

# Build project
echo "
🏗️ Building project..."
npm run build

# Check for any remaining deprecated patterns
echo "
🔍 Checking for any remaining deprecated patterns..."
grep -r "componentWillMount\|componentWillReceiveProps\|componentWillUpdate" src/

echo "
✅ Verification Steps:
1. Check the console for any new warnings
2. Verify all routes and navigation
3. Test all major features
4. Check performance metrics
5. Verify all forms and user interactions
6. Test error boundaries
"

# Run development server
echo "
🚀 Starting development server for manual testing..."
npm run dev