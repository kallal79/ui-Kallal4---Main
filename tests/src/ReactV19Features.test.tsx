import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React, { useState, useTransition, useDeferredValue } from 'react';

// Component using useTransition
function TransitionComponent() {
  const [isPending, startTransition] = useTransition();
  const [input, setInput] = useState('');
  const [list, setList] = useState<string[]>([]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    
    startTransition(() => {
      // Simulate expensive operation
      const newList = [];
      for (let i = 0; i < 1000; i++) {
        newList.push(`${value} item ${i}`);
      }
      setList(newList);
    });
  };
  
  return (
    <div>
      <input 
        type="text" 
        value={input} 
        onChange={handleChange} 
        data-testid="input-field"
      />
      {isPending ? (
        <p data-testid="loading-indicator">Loading...</p>
      ) : (
        <ul>
          {list.slice(0, 5).map((item, index) => (
            <li key={index} data-testid={`list-item-${index}`}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Component using useDeferredValue
function DeferredComponent() {
  const [text, setText] = useState('');
  const deferredText = useDeferredValue(text);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };
  
  return (
    <div>
      <input 
        type="text" 
        value={text} 
        onChange={handleChange} 
        data-testid="deferred-input"
      />
      <p data-testid="immediate-value">Immediate: {text}</p>
      <p data-testid="deferred-value">Deferred: {deferredText}</p>
    </div>
  );
}

describe('React v19 Features Tests', () => {
  it('useTransition works correctly', async () => {
    render(<TransitionComponent />);
    
    const input = screen.getByTestId('input-field');
    fireEvent.change(input, { target: { value: 'test' } });
    
    // The input should update immediately
    expect(input).toHaveValue('test');
    
    // Wait for the transition to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Check that the list was updated
    expect(screen.getByTestId('list-item-0')).toHaveTextContent('test item 0');
  });
  
  it('useDeferredValue works correctly', async () => {
    render(<DeferredComponent />);
    
    const input = screen.getByTestId('deferred-input');
    fireEvent.change(input, { target: { value: 'deferred test' } });
    
    // The immediate value should update right away
    expect(screen.getByTestId('immediate-value')).toHaveTextContent('Immediate: deferred test');
    
    // The deferred value should eventually match
    await waitFor(() => {
      expect(screen.getByTestId('deferred-value')).toHaveTextContent('Deferred: deferred test');
    });
  });
});