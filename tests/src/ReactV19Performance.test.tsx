import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState, useCallback, useMemo, memo } from 'react';

// Child component that should only re-render when props change
const ChildComponent = memo(({ count, onClick }: { count: number; onClick: () => void }) => {
  // This would log on every render
  console.log('Child component rendered');
  
  return (
    <div>
      <p data-testid="child-count">Child Count: {count}</p>
      <button 
        onClick={onClick}
        data-testid="child-button"
      >
        Increment from Child
      </button>
    </div>
  );
});

// Parent component with memoization
function ParentComponent() {
  const [parentCount, setParentCount] = useState(0);
  const [childCount, setChildCount] = useState(0);
  
  // This callback should be stable across renders
  const handleChildClick = useCallback(() => {
    setChildCount(c => c + 1);
  }, []);
  
  // This value should be computed only when childCount changes
  const expensiveComputation = useMemo(() => {
    console.log('Computing expensive value');
    let result = 0;
    for (let i = 0; i < 1000; i++) {
      result += childCount;
    }
    return result;
  }, [childCount]);
  
  return (
    <div>
      <h2>Parent Component</h2>
      <p data-testid="parent-count">Parent Count: {parentCount}</p>
      <p data-testid="expensive-result">Expensive Result: {expensiveComputation}</p>
      <button 
        onClick={() => setParentCount(c => c + 1)}
        data-testid="parent-button"
      >
        Increment Parent
      </button>
      
      <ChildComponent 
        count={childCount} 
        onClick={handleChildClick} 
      />
    </div>
  );
}

// Component with a large list for virtualization testing
function LargeListComponent() {
  const [items] = useState(() => 
    Array.from({ length: 1000 }, (_, i) => `Item ${i + 1}`)
  );
  
  return (
    <div style={{ height: '200px', overflow: 'auto' }}>
      <div data-testid="large-list">
        {items.map((item, index) => (
          <div key={index} data-testid={`list-item-${index}`}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

describe('React v19 Performance Tests', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  it('memo prevents unnecessary re-renders', () => {
    render(<ParentComponent />);
    
    // Initial render
    expect(screen.getByTestId('parent-count')).toHaveTextContent('Parent Count: 0');
    expect(screen.getByTestId('child-count')).toHaveTextContent('Child Count: 0');
    
    // Update parent count
    fireEvent.click(screen.getByTestId('parent-button'));
    
    // Parent count should update
    expect(screen.getByTestId('parent-count')).toHaveTextContent('Parent Count: 1');
    
    // Child count should remain the same
    expect(screen.getByTestId('child-count')).toHaveTextContent('Child Count: 0');
    
    // Check console.log calls to verify child didn't re-render
    expect(console.log).toHaveBeenCalledTimes(1); // Only the initial render
  });
  
  it('useCallback creates stable callbacks', () => {
    const { rerender } = render(<ParentComponent />);
    
    // Get the initial onClick handler
    const initialChildButton = screen.getByTestId('child-button');
    const initialOnClick = initialChildButton.onclick;
    
    // Force a re-render by updating the component
    rerender(<ParentComponent />);
    
    // Get the new onClick handler
    const newChildButton = screen.getByTestId('child-button');
    const newOnClick = newChildButton.onclick;
    
    // The onClick handler should be the same function instance
    expect(newOnClick).toBe(initialOnClick);
  });
  
  it('useMemo prevents unnecessary calculations', () => {
    render(<ParentComponent />);
    
    // Initial render should compute the expensive value once
    expect(console.log).toHaveBeenCalledWith('Computing expensive value');
    expect(console.log).toHaveBeenCalledTimes(2); // Child render + expensive computation
    
    // Reset mock
    (console.log as jest.Mock).mockClear();
    
    // Update parent count (should not trigger expensive computation)
    fireEvent.click(screen.getByTestId('parent-button'));
    
    // The expensive computation should not have run again
    expect(console.log).not.toHaveBeenCalledWith('Computing expensive value');
  });
  
  it('renders large lists efficiently', () => {
    render(<LargeListComponent />);
    
    // The list should render
    const list = screen.getByTestId('large-list');
    expect(list).toBeInTheDocument();
    
    // Check that some items are rendered
    expect(screen.getByTestId('list-item-0')).toBeInTheDocument();
    expect(screen.getByTestId('list-item-10')).toBeInTheDocument();
  });
});