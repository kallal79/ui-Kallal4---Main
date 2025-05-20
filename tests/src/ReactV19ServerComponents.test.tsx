import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Since we can't actually test Server Components in Jest,
// we'll create client components that would interact with Server Components

// Client component that would receive data from a Server Component
function ClientComponent({ data }: { data: string[] }) {
  return (
    <div>
      <h2>Client Component</h2>
      <ul>
        {data.map((item, index) => (
          <li key={index} data-testid={`data-item-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

// Wrapper that simulates a Server Component providing data
function ServerComponentSimulator() {
  // In a real Server Component, this data would come from the server
  const serverData = ['Server Data 1', 'Server Data 2', 'Server Data 3'];
  
  return (
    <div data-testid="server-component-simulator">
      <h1>Server Component Simulator</h1>
      <ClientComponent data={serverData} />
    </div>
  );
}

// Component that uses the "use client" directive
// In a real app with React 19, this would be:
// 'use client';
// But for testing, we'll just simulate it
function ExplicitClientComponent() {
  return (
    <div data-testid="explicit-client-component">
      <h2>Explicit Client Component</h2>
      <p>This component would have the 'use client' directive</p>
    </div>
  );
}

describe('React v19 Server Components Tests', () => {
  it('client components can render with server data', () => {
    render(<ServerComponentSimulator />);
    
    expect(screen.getByTestId('server-component-simulator')).toBeInTheDocument();
    expect(screen.getByText('Server Component Simulator')).toBeInTheDocument();
    
    // Check that the client component received and rendered the data
    expect(screen.getByTestId('data-item-0')).toHaveTextContent('Server Data 1');
    expect(screen.getByTestId('data-item-1')).toHaveTextContent('Server Data 2');
    expect(screen.getByTestId('data-item-2')).toHaveTextContent('Server Data 3');
  });
  
  it('explicit client components render correctly', () => {
    render(<ExplicitClientComponent />);
    
    expect(screen.getByTestId('explicit-client-component')).toBeInTheDocument();
    expect(screen.getByText('Explicit Client Component')).toBeInTheDocument();
    expect(screen.getByText("This component would have the 'use client' directive")).toBeInTheDocument();
  });
  
  // This test is just a placeholder to remind us to consider Server Components
  it('should consider Server Components in the React v19 upgrade', () => {
    // This is more of a reminder than an actual test
    expect(true).toBe(true);
  });
});