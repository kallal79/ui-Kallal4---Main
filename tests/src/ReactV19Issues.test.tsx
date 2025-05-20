import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState, useRef, useEffect, Component } from 'react';

// Test for potential issues with refs
function RefComponent() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [clicked, setClicked] = useState(false);
  
  useEffect(() => {
    // Direct DOM manipulation - might cause issues in React 19
    if (buttonRef.current) {
      buttonRef.current.setAttribute('data-custom', 'test-value');
    }
  }, []);
  
  return (
    <div>
      <button 
        ref={buttonRef}
        onClick={() => setClicked(true)}
        data-testid="ref-button"
      >
        Click Me
      </button>
      {clicked && <p data-testid="clicked-message">Button was clicked!</p>}
    </div>
  );
}

// Test for class components (which might have issues in React 19)
class ClassComponent extends Component<{}, { count: number }> {
  constructor(props: {}) {
    super(props);
    this.state = { count: 0 };
    this.handleClick = this.handleClick.bind(this);
  }
  
  handleClick() {
    this.setState(prevState => ({ count: prevState.count + 1 }));
  }
  
  render() {
    return (
      <div>
        <h2>Class Component</h2>
        <p data-testid="class-count">Count: {this.state.count}</p>
        <button 
          onClick={this.handleClick}
          data-testid="class-button"
        >
          Increment
        </button>
      </div>
    );
  }
}

// Test for error boundaries (which might behave differently in React 19)
class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <div data-testid="error-message">Something went wrong.</div>;
    }
    
    return this.props.children;
  }
}

// Component that throws an error
function BuggyComponent() {
  useEffect(() => {
    throw new Error('Test error');
  }, []);
  
  return <div>This will never render</div>;
}

describe('React v19 Potential Issues Tests', () => {
  it('handles refs correctly', () => {
    render(<RefComponent />);
    
    const button = screen.getByTestId('ref-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('data-custom', 'test-value');
    
    fireEvent.click(button);
    expect(screen.getByTestId('clicked-message')).toBeInTheDocument();
  });
  
  it('class components still work correctly', () => {
    render(<ClassComponent />);
    
    expect(screen.getByTestId('class-count')).toHaveTextContent('Count: 0');
    
    fireEvent.click(screen.getByTestId('class-button'));
    expect(screen.getByTestId('class-count')).toHaveTextContent('Count: 1');
  });
  
  it('error boundaries catch errors correctly', () => {
    // Suppress console.error for this test
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    render(
      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId('error-message')).toBeInTheDocument();
    expect(screen.getByTestId('error-message')).toHaveTextContent('Something went wrong.');
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});