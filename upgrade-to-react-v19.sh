#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting Jaeger-UI React v19 Upgrade Process..."

# Create a new branch for the upgrade
echo "📁 Creating new branch for React v19 upgrade..."
git checkout -b feature/react-v19-upgrade

# Backup package.json
echo "💾 Creating backup of package.json..."
cp package.json package.json.backup

# Update React and React DOM to v19
echo "⚛️ Upgrading React and ReactDOM to v19..."
npm install --save react@^19.0.0 react-dom@^19.0.0

# Update React types
echo "📝 Updating React TypeScript types..."
npm install --save-dev @types/react@latest @types/react-dom@latest

# Update testing libraries
echo "🧪 Updating testing libraries..."
npm install --save-dev @testing-library/react@latest @testing-library/jest-dom@latest @testing-library/user-event@latest

# Update build tools
echo "🛠️ Updating build tools..."
npm install --save-dev vite@latest @vitejs/plugin-react@latest

# Update other React-related dependencies
echo "📦 Updating other React-related packages..."
npm install --save-dev @wojtekmaj/enzyme-adapter-react-17@latest enzyme@latest enzyme-to-json@latest

# Check for outdated dependencies
echo "🔍 Checking for other outdated dependencies..."
npm outdated

echo "
🔍 Running type checking..."
npm run typecheck || echo "⚠️ Type checking failed - please fix type errors"

echo "
🧪 Running tests..."
npm test || echo "⚠️ Tests failed - please fix failing tests"

echo "
🏗️ Building project..."
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