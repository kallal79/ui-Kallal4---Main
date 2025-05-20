#!/bin/bash

echo "🧪 Running React v19 Compatibility Tests..."

# Run the tests
npx jest --testPathPattern=tests/src/ReactV19.*\.test\.tsx

# Check if tests passed
if [ $? -eq 0 ]; then
  echo "✅ All tests passed!"
else
  echo "❌ Some tests failed. Please check the output above for details."
fi

# Generate a test report
echo "📊 Generating test report..."
npx jest --testPathPattern=tests/src/ReactV19.*\.test\.tsx --json --outputFile=react-v19-test-report.json

echo "📝 Test report saved to react-v19-test-report.json"

echo "
Next steps:
1. Review the test report
2. Fix any failing tests
3. Run the tests again to verify the fixes
"