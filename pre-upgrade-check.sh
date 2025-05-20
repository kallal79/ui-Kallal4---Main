#!/bin/bash

echo "🔍 Running Pre-upgrade Compatibility Check for React v19..."

# Check current React version
REACT_VERSION=$(npm list react | grep react@ | cut -d@ -f2)
echo "Current React version: $REACT_VERSION"

# Check for deprecated lifecycle methods
echo "
📝 Checking for deprecated lifecycle methods..."
grep -r "componentWillMount\|componentWillReceiveProps\|componentWillUpdate" src/

# Check for legacy context API usage
echo "
🔍 Checking for legacy context API usage..."
grep -r "childContextTypes\|getChildContext" src/

# Check for old string refs
echo "
🔍 Checking for string refs..."
grep -r "ref=\"" src/

# Check for findDOMNode usage
echo "
🔍 Checking for findDOMNode usage..."
grep -r "findDOMNode" src/

# List all React-related dependencies
echo "
📦 Current React-related dependencies:"
npm list | grep -i react

echo "
⚠️ Known Breaking Changes to Check:
1. React Server Components (RSC) - Jaeger-UI is client-side, so we need to ensure compatibility
2. Check all uses of useEffect and ensure cleanup functions are properly implemented
3. Review any custom hooks that might be affected by new concurrent features
4. Verify all async state updates are handled correctly
5. Check for any direct DOM manipulation that might conflict with React 19
6. Review error boundary implementations
"

# Check for potential problematic patterns
echo "
🔍 Checking for potential problematic patterns..."

# Check for direct DOM manipulation
echo "Checking for direct DOM manipulation..."
grep -r "document.getElementById\|document.querySelector" src/

# Check for refs usage
echo "Checking for refs usage..."
grep -r "useRef\|createRef" src/

# Check for concurrent mode APIs
echo "Checking for concurrent mode APIs..."
grep -r "useTransition\|useDeferredValue" src/

# Check for third-party libraries that might have compatibility issues
echo "
📦 Checking for third-party libraries that might have compatibility issues..."
npm list @mui/material @mui/icons-material @emotion/react @emotion/styled @tanstack/react-query framer-motion

echo "
✅ Pre-upgrade check completed. Please review the output above and address any issues before proceeding with the upgrade."