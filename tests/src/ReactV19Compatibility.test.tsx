import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React, { useState, useEffect } from 'react';

// Simple component using React hooks
function TestComponent({ initialCount = 0 }) {
  const [count, setCount] = useState(initialCount);
  
  useEffect(() => {
    // This effect runs once on mount
    const timer = setTimeout(() => {
      setCount(prevCount => prevCount + 1);
    }, 100);
    
    // Cleanup function
    return () => {
      clearTimeout(timer);
    };
  }, []);
  
  return (
    <div>
      <h1>Test Component</h1>
      <p data-testid="count-value">Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

describe('React v19 Compatibility Tests', () => {
  it('renders a component with hooks correctly', () => {
    render(<TestComponent initialCount={5} />);
    
    expect(screen.getByText('Test Component')).toBeInTheDocument();
    expect(screen.getByTestId('count-value')).toHaveTextContent('Count: 5');
  });
  
  it('handles props correctly', () => {
    render(<TestComponent initialCount={10} />);
    
    expect(screen.getByTestId('count-value')).toHaveTextContent('Count: 10');
  });
  
  it('renders without props correctly', () => {
    render(<TestComponent />);
    
    expect(screen.getByTestId('count-value')).toHaveTextContent('Count: 0');
  });
});