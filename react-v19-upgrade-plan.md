# Jaeger-UI React v19 Upgrade Plan

## Overview

This document outlines the plan to upgrade Jaeger-UI from React v18 to React v19, as part of the LFX Mentorship Summer 2025 term (jaegertracing/jaeger#7115).

## Current State

Based on the package.json analysis:
- Current React version: ^18.3.1
- Current React DOM version: ^18.3.1
- Build system: Vite v6.3.4
- UI framework: Ant Design v5.23.3

## Upgrade Steps

### 1. Pre-Upgrade Analysis

- [x] Analyze current dependencies
- [ ] Identify potential compatibility issues
- [ ] Create a test plan to verify functionality after upgrade

### 2. Dependency Upgrades

#### Core React Dependencies
```bash
npm install --save react@^19.0.0 react-dom@^19.0.0
```

#### React-Related Dependencies to Update
```bash
npm install --save-dev @types/react@latest @types/react-dom@latest
npm install --save-dev @testing-library/react@latest @testing-library/jest-dom@latest
```

#### Other Dependencies That May Need Updates
- @emotion/react
- @emotion/styled
- @hello-pangea/dnd
- @monaco-editor/react
- @mui/icons-material
- @mui/lab
- @mui/material
- @mui/x-tree-view
- @react-three/drei
- @react-three/fiber
- @tanstack/react-query
- @tanstack/react-query-devtools
- @xyflow/react
- framer-motion
- react-flow-renderer
- react-hot-toast
- react-icons
- react-router-dom
- reactflow
- recharts
- zustand

### 3. Build System Updates

- [ ] Update Vite and related plugins if needed
```bash
npm install --save-dev vite@latest @vitejs/plugin-react@latest
```

### 4. Code Modifications

- [ ] Update any deprecated APIs or patterns
- [ ] Fix any TypeScript type errors
- [ ] Update test files to work with new React version

### 5. Testing

- [ ] Run unit tests
- [ ] Verify UI functionality manually
- [ ] Test with different browsers
- [ ] Test with different screen sizes

### 6. Documentation

- [ ] Update documentation to reflect React v19 usage
- [ ] Document any breaking changes or API changes

## Potential Issues and Solutions

### 1. React Server Components

React v19 introduces React Server Components. Jaeger-UI is a client-side application, so we need to ensure compatibility or explicitly opt out of RSC features.

### 2. Concurrent Mode

React v19 may have changes to Concurrent Mode. We need to test any components that use concurrent features like `useTransition` or `useDeferredValue`.

### 3. Testing Library Compatibility

The Testing Library ecosystem may need updates to work with React v19. We should update all testing-related dependencies.

### 4. Third-Party Component Libraries

Libraries like Ant Design, MUI, and others may not be fully compatible with React v19 yet. We may need to:
- Use specific versions
- Find alternatives
- Contribute fixes upstream

## Rollback Plan

In case of critical issues:

1. Revert to the previous React v18 dependencies
2. Document the issues encountered
3. Create a plan to address the issues in a future update

## Timeline

1. Initial dependency upgrade and testing: 1 week
2. Code modifications and fixes: 2 weeks
3. Comprehensive testing: 1 week
4. Documentation and final review: 1 week

## Resources

- [React v19 Release Notes](https://react.dev/blog/2024/04/25/react-19)
- [React v19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Testing Library Documentation](https://testing-library.com/docs/)