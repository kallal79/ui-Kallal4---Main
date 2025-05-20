# Jaeger-UI React v19 Upgrade

This document provides instructions for upgrading Jaeger-UI from React v18 to React v19.

## Overview

As part of the LFX Mentorship Summer 2025 term (jaegertracing/jaeger#7115), we are upgrading Jaeger-UI to React v19 to stay up to date with dependencies.

## Prerequisites

- Node.js (version 20 or higher recommended)
- npm or yarn
- Git

## Upgrade Process

We've created several scripts to help with the upgrade process:

### 1. Pre-Upgrade Check

Run the pre-upgrade check to identify potential compatibility issues:

```bash
npm run upgrade:check
```

This script will:
- Check for deprecated lifecycle methods
- Identify legacy context API usage
- Find string refs
- Check for direct DOM manipulation
- List React-related dependencies

### 2. Review Upgrade Plan and Analysis

Review the upgrade plan and compatibility analysis:

```bash
npm run upgrade:plan
npm run upgrade:analyze
```

These commands will open the upgrade plan and compatibility analysis documents.

### 3. Perform the Upgrade

Run the upgrade script to update React and related dependencies:

```bash
npm run upgrade:react19
```

This script will:
- Create a new git branch for the upgrade
- Backup your package.json
- Upgrade React and ReactDOM to v19
- Update related dependencies
- Run initial checks

### 4. Verify the Upgrade

After the upgrade, run the verification script:

```bash
npm run upgrade:verify
```

This script will:
- Verify the React version
- Run type checks
- Run tests
- Build the project
- Start the dev server for manual testing

## Manual Testing

After running the automated scripts, you should manually test the application to ensure everything works correctly:

1. Check all major features
2. Verify navigation and routing
3. Test forms and user interactions
4. Check for console errors
5. Verify performance

## Troubleshooting

### Common Issues

1. **Type Errors**
   - Update type definitions
   - Check for breaking changes in React types

2. **Build Errors**
   - Update build configuration
   - Check for compatibility with Vite

3. **Test Failures**
   - Update test utilities
   - Fix broken tests

4. **Runtime Errors**
   - Check for deprecated APIs
   - Update component lifecycle methods

### Rollback Procedure

If you encounter critical issues:

1. Restore the package.json backup:
   ```bash
   cp package.json.backup package.json
   ```

2. Reinstall dependencies:
   ```bash
   npm install
   ```

3. Discard the upgrade branch:
   ```bash
   git checkout main
   git branch -D feature/react-v19-upgrade
   ```

## Resources

- [React v19 Release Notes](https://react.dev/blog/2024/04/25/react-19)
- [React v19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Testing Library Documentation](https://testing-library.com/docs/)

## Contributing

If you encounter issues during the upgrade process, please document them and contribute fixes back to the project.