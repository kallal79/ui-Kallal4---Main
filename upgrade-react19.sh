#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting React v19 upgrade process..."

# Create new branch
echo "📁 Creating new branch for React 19 upgrade..."
git checkout -b feature/react-v19-upgrade

# Backup package.json
echo "💾 Creating backup of package.json..."
cp package.json package.json.backup

# Update React and related dependencies
echo "⚛️ Upgrading React to v19..."
npm install --save react@latest react-dom@latest

# Update testing libraries
echo "🧪 Updating testing libraries..."
npm install --save-dev @testing-library/react@latest @testing-library/jest-dom@latest

# Update Vite and related plugins
echo "🛠️ Updating build tools..."
npm install --save-dev vite@latest @vitejs/plugin-react@latest

# Update other potential React-related dependencies
echo "📦 Updating other React-related packages..."
npm install --save-dev @types/react@latest @types/react-dom@latest

# Run type checking
echo "✅ Running type checking..."
npm run typecheck || echo "⚠️ Type checking failed - please fix type errors"

# Run tests
echo "🧪 Running tests..."
npm test || echo "⚠️ Tests failed - please fix failing tests"

# Build project
echo "🏗️ Building project..."
npm run build || echo "⚠️ Build failed - please fix build errors"

echo "
🎉 React v19 upgrade script completed!

Next steps:
1. Review the changes in package.json
2. Fix any type errors, failing tests, or build issues
3. Test the application thoroughly
4. Commit changes and create a pull request

Backup of your original package.json is saved as package.json.backup
"