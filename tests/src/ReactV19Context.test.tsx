import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import React, { createContext, useContext, useState, useReducer } from 'react';

// Simple context with useState
const ThemeContext = createContext<{
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}>({
  theme: 'light',
  toggleTheme: () => {},
});

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function ThemedButton() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  return (
    <button
      onClick={toggleTheme}
      data-testid="theme-button"
      style={{
        backgroundColor: theme === 'light' ? 'white' : 'black',
        color: theme === 'light' ? 'black' : 'white',
      }}
    >
      Current theme: {theme}
    </button>
  );
}

// Complex context with useReducer
type CounterState = { count: number };
type CounterAction = 
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset' };

const CounterContext = createContext<{
  state: CounterState;
  dispatch: React.Dispatch<CounterAction>;
}>({
  state: { count: 0 },
  dispatch: () => {},
});

function counterReducer(state: CounterState, action: CounterAction): CounterState {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'reset':
      return { count: 0 };
    default:
      return state;
  }
}

function CounterProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(counterReducer, { count: 0 });
  
  return (
    <CounterContext.Provider value={{ state, dispatch }}>
      {children}
    </CounterContext.Provider>
  );
}

function Counter() {
  const { state, dispatch } = useContext(CounterContext);
  
  return (
    <div>
      <h2>Counter: {state.count}</h2>
      <button
        onClick={() => dispatch({ type: 'increment' })}
        data-testid="increment-button"
      >
        Increment
      </button>
      <button
        onClick={() => dispatch({ type: 'decrement' })}
        data-testid="decrement-button"
      >
        Decrement
      </button>
      <button
        onClick={() => dispatch({ type: 'reset' })}
        data-testid="reset-button"
      >
        Reset
      </button>
    </div>
  );
}

// Nested contexts
function NestedContexts() {
  return (
    <ThemeProvider>
      <CounterProvider>
        <div data-testid="nested-context-component">
          <h1>Nested Contexts Example</h1>
          <ThemedButton />
          <Counter />
        </div>
      </CounterProvider>
    </ThemeProvider>
  );
}

describe('React v19 Context API Tests', () => {
  it('simple context with useState works correctly', () => {
    render(
      <ThemeProvider>
        <ThemedButton />
      </ThemeProvider>
    );
    
    // Initial theme should be light
    expect(screen.getByTestId('theme-button')).toHaveTextContent('Current theme: light');
    
    // Toggle the theme
    fireEvent.click(screen.getByTestId('theme-button'));
    
    // Theme should now be dark
    expect(screen.getByTestId('theme-button')).toHaveTextContent('Current theme: dark');
    
    // Toggle again
    fireEvent.click(screen.getByTestId('theme-button'));
    
    // Theme should be back to light
    expect(screen.getByTestId('theme-button')).toHaveTextContent('Current theme: light');
  });
  
  it('complex context with useReducer works correctly', () => {
    render(
      <CounterProvider>
        <Counter />
      </CounterProvider>
    );
    
    // Initial count should be 0
    expect(screen.getByText('Counter: 0')).toBeInTheDocument();
    
    // Increment
    fireEvent.click(screen.getByTestId('increment-button'));
    expect(screen.getByText('Counter: 1')).toBeInTheDocument();
    
    // Increment again
    fireEvent.click(screen.getByTestId('increment-button'));
    expect(screen.getByText('Counter: 2')).toBeInTheDocument();
    
    // Decrement
    fireEvent.click(screen.getByTestId('decrement-button'));
    expect(screen.getByText('Counter: 1')).toBeInTheDocument();
    
    // Reset
    fireEvent.click(screen.getByTestId('reset-button'));
    expect(screen.getByText('Counter: 0')).toBeInTheDocument();
  });
  
  it('nested contexts work correctly', () => {
    render(<NestedContexts />);
    
    // Check that both contexts are working
    expect(screen.getByTestId('nested-context-component')).toBeInTheDocument();
    expect(screen.getByText('Nested Contexts Example')).toBeInTheDocument();
    
    // Check theme context
    expect(screen.getByTestId('theme-button')).toHaveTextContent('Current theme: light');
    
    // Check counter context
    expect(screen.getByText('Counter: 0')).toBeInTheDocument();
    
    // Interact with both contexts
    fireEvent.click(screen.getByTestId('theme-button'));
    fireEvent.click(screen.getByTestId('increment-button'));
    
    // Check that both contexts updated correctly
    expect(screen.getByTestId('theme-button')).toHaveTextContent('Current theme: dark');
    expect(screen.getByText('Counter: 1')).toBeInTheDocument();
  });
});