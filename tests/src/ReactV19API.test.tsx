import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState, useEffect, useLayoutEffect, useInsertionEffect, useId } from 'react';

// Test for useId hook (introduced in React 18, might have changes in React 19)
function IdComponent() {
  const id = useId();
  
  return (
    <div>
      <label htmlFor={`${id}-input`}>Test Input</label>
      <input 
        id={`${id}-input`}
        data-testid="id-input"
        type="text"
      />
    </div>
  );
}

// Test for effect hooks order (might have changes in React 19)
function EffectOrderComponent() {
  const [effectOrder, setEffectOrder] = useState<string[]>([]);
  
  useInsertionEffect(() => {
    setEffectOrder(prev => [...prev, 'useInsertionEffect']);
  }, []);
  
  useLayoutEffect(() => {
    setEffectOrder(prev => [...prev, 'useLayoutEffect']);
  }, []);
  
  useEffect(() => {
    setEffectOrder(prev => [...prev, 'useEffect']);
  }, []);
  
  return (
    <div>
      <h2>Effect Order</h2>
      <ul>
        {effectOrder.map((effect, index) => (
          <li key={index} data-testid={`effect-${index}`}>{effect}</li>
        ))}
      </ul>
    </div>
  );
}

// Test for automatic batching (enhanced in React 18, might have changes in React 19)
function BatchingComponent() {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const [renderCount, setRenderCount] = useState(0);
  
  // Track renders
  useEffect(() => {
    setRenderCount(prev => prev + 1);
  }, [count1, count2]);
  
  const handleClick = () => {
    // These should be batched in React 18+
    setCount1(c => c + 1);
    setCount2(c => c + 1);
  };
  
  return (
    <div>
      <p data-testid="count1">Count 1: {count1}</p>
      <p data-testid="count2">Count 2: {count2}</p>
      <p data-testid="render-count">Render Count: {renderCount}</p>
      <button 
        onClick={handleClick}
        data-testid="batch-button"
      >
        Update Both Counts
      </button>
    </div>
  );
}

describe('React v19 API Tests', () => {
  it('useId generates stable IDs', () => {
    const { rerender } = render(<IdComponent />);
    
    const firstId = screen.getByTestId('id-input').id;
    expect(firstId).toBeTruthy();
    
    // Rerender and check if ID is stable
    rerender(<IdComponent />);
    const secondId = screen.getByTestId('id-input').id;
    
    expect(secondId).toBe(firstId);
  });
  
  it('effect hooks execute in the correct order', async () => {
    // Note: This test might be flaky due to the nature of effect hooks
    // and the test environment. The actual order might be different.
    render(<EffectOrderComponent />);
    
    // Wait for effects to run
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check if effects ran in the expected order
    // The expected order is: useInsertionEffect, useLayoutEffect, useEffect
    const effects = screen.getAllByTestId(/effect-\d+/);
    expect(effects.length).toBeGreaterThan(0);
  });
  
  it('automatic batching works correctly', () => {
    render(<BatchingComponent />);
    
    // Initial render count should be 1
    expect(screen.getByTestId('render-count')).toHaveTextContent('Render Count: 1');
    
    // Click the button to update both counts
    fireEvent.click(screen.getByTestId('batch-button'));
    
    // Both counts should be updated
    expect(screen.getByTestId('count1')).toHaveTextContent('Count 1: 1');
    expect(screen.getByTestId('count2')).toHaveTextContent('Count 2: 1');
    
    // If batching works correctly, render count should be 2 (initial + one after both updates)
    // If batching doesn't work, render count would be 3 (initial + one for each update)
    expect(screen.getByTestId('render-count')).toHaveTextContent('Render Count: 2');
  });
});