/**
 * Tests for the Model Context Protocol React components
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { CommandInput } from '../../src/components/CommandInput';
import { MCPCommandBar } from '../../src/components/MCPCommandBar';
import { MCPContextProvider, defaultOpenAIConfig } from '../../src/components/MCPContextProvider';

// Mock the hooks
jest.mock('../../src/mcp-hooks', () => ({
  useCommandProcessor: () => ({
    processCommand: jest.fn().mockResolvedValue({
      actions: [
        {
          type: 'query',
          resource: {
            kind: 'Cluster',
            name: 'test-cluster'
          }
        }
      ],
      explanation: 'Test explanation',
      status: 'success'
    }),
    executeActions: jest.fn().mockResolvedValue([{ success: true }]),
    isProcessing: false,
    lastResponse: null
  }),
  useModelContext: () => ({
    clusters: [{ id: 'cluster-1', name: 'test-cluster', status: 'connected', version: '1.22.0' }],
    namespaces: [{ name: 'default', clusterId: 'cluster-1' }],
    workloads: [{ id: 'workload-1', name: 'test-deployment', kind: 'Deployment', namespace: 'default', clusterId: 'cluster-1', status: 'Running' }],
    bindingPolicies: [{ id: 'policy-1', name: 'test-policy', workloads: ['workload-1'], clusters: ['cluster-1'], status: 'active' }],
    currentState: {},
    metadata: { timestamp: new Date().toISOString(), version: '1.0.0', userId: 'test-user' }
  }),
  MCPServiceProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ContextManagerProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

describe('CommandInput Component', () => {
  test('renders command input', () => {
    render(<CommandInput />);
    
    const inputElement = screen.getByPlaceholderText(/Enter a command/i);
    expect(inputElement).toBeInTheDocument();
    
    const buttonElement = screen.getByText(/Send/i);
    expect(buttonElement).toBeInTheDocument();
  });
  
  test('handles command submission', async () => {
    render(<CommandInput />);
    
    const inputElement = screen.getByPlaceholderText(/Enter a command/i);
    const buttonElement = screen.getByText(/Send/i);
    
    fireEvent.change(inputElement, { target: { value: 'list clusters' } });
    fireEvent.click(buttonElement);
    
    await waitFor(() => {
      expect(screen.getByText(/Test explanation/i)).toBeInTheDocument();
    });
  });
});

describe('MCPCommandBar Component', () => {
  test('renders command bar', () => {
    render(<MCPCommandBar />);
    
    const inputElement = screen.getByPlaceholderText(/Ask KubeStellar/i);
    expect(inputElement).toBeInTheDocument();
  });
  
  test('toggles expanded state', async () => {
    render(<MCPCommandBar />);
    
    // Initially collapsed
    const expandButton = screen.getByRole('button');
    expect(expandButton).toBeInTheDocument();
    
    // Click to expand
    fireEvent.click(expandButton);
    
    // Should show context info
    await waitFor(() => {
      expect(screen.getByText(/KubeStellar Context/i)).toBeInTheDocument();
      expect(screen.getByText(/Clusters/i)).toBeInTheDocument();
      expect(screen.getByText(/1/i)).toBeInTheDocument(); // 1 cluster
    });
  });
});

describe('MCPContextProvider Component', () => {
  test('renders children', () => {
    render(
      <MCPContextProvider userId="test-user" modelConfig={defaultOpenAIConfig}>
        <div data-testid="test-child">Test Child</div>
      </MCPContextProvider>
    );
    
    const childElement = screen.getByTestId('test-child');
    expect(childElement).toBeInTheDocument();
    expect(childElement).toHaveTextContent('Test Child');
  });
});