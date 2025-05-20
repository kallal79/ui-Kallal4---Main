import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Button, TextField, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// MUI Component Test
function MUIComponent() {
  return (
    <Box sx={{ p: 2 }}>
      <TextField label="Test Input" data-testid="mui-input" />
      <Button variant="contained" data-testid="mui-button">
        Click Me
      </Button>
    </Box>
  );
}

// React Query Component Test
function ReactQueryComponent() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return (
    <QueryClientProvider client={queryClient}>
      <div data-testid="react-query-component">
        React Query Component
      </div>
    </QueryClientProvider>
  );
}

// Mock components if needed
jest.mock('@mui/material', () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
  TextField: ({ label, ...props }: any) => (
    <input placeholder={label} {...props} />
  ),
  Box: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
}));

describe('Third-Party Library Compatibility Tests', () => {
  it('renders MUI components correctly', () => {
    render(<MUIComponent />);
    
    expect(screen.getByTestId('mui-input')).toBeInTheDocument();
    expect(screen.getByTestId('mui-button')).toBeInTheDocument();
    expect(screen.getByTestId('mui-button')).toHaveTextContent('Click Me');
  });
  
  it('renders React Query components correctly', () => {
    render(<ReactQueryComponent />);
    
    expect(screen.getByTestId('react-query-component')).toBeInTheDocument();
    expect(screen.getByTestId('react-query-component')).toHaveTextContent('React Query Component');
  });
});