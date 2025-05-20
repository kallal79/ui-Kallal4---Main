# Model Context Protocol for KubeStellar MCP Server

## Overview

The Model Context Protocol (MCP) establishes a standardized communication framework between KubeStellar's internal components and AI models used for command interpretation. By defining clear context boundaries, semantic structures, and state management patterns, the protocol enables the MCP server to maintain consistent understanding of the multi-cluster environment while processing natural language management commands across KubeStellar deployments.

## Core Components

### 1. Type Definitions (`mcp-types.ts`)

Defines the core data structures for the protocol:
- `ClusterContext`: Represents a KubeStellar cluster
- `NamespaceContext`: Represents a namespace
- `WorkloadContext`: Represents a workload
- `BindingPolicyContext`: Represents a binding policy
- `ModelContext`: The complete context passed to AI models
- `CommandRequest`: Command request sent to AI models
- `CommandResponse`: Response received from AI models
- `CommandAction`: Actions to be performed based on model interpretation

### 2. Context Management (`mcp-context.ts`)

Provides a system for maintaining and updating KubeStellar state:
- `ContextManager`: Manages the current state of KubeStellar
- Event-based system for context updates
- Methods for adding/updating/removing clusters, namespaces, workloads, and binding policies

### 3. Service Implementation (`mcp-service.ts`)

Core service for handling communication with AI models:
- `ModelContextProtocolService`: Main service class
- Methods for building context, processing commands, and executing actions

### 4. Provider Adapters (`mcp-providers.ts`)

Adapters for different AI model providers:
- `ModelProviderAdapter`: Interface for all provider adapters
- Implementations for OpenAI, AWS Bedrock, and Anthropic
- Factory function for creating provider instances

### 5. Serialization Utilities (`mcp-serialization.ts`)

Utilities for efficiently serializing and deserializing state information:
- Methods for serializing/deserializing context, requests, and responses
- Options for controlling serialization behavior

### 6. React Integration (`mcp-hooks.ts`)

React hooks for integrating the protocol with the UI:
- Context providers for the MCP service and context manager
- Hooks for accessing context data and processing commands

### 7. Integration Utilities (`mcp-integration.ts`)

Utilities for integrating with existing KubeStellar services:
- Methods for syncing clusters, namespaces, workloads, and binding policies
- Automatic synchronization setup

### 8. Performance Optimizations (`mcp-performance.ts`)

Utilities for optimizing performance and minimizing latency:
- Context optimization for reducing size and token count
- Performance measurement tools
- Request optimization

### 9. UI Components

- `CommandInput`: Component for entering natural language commands
- `MCPCommandBar`: Command bar with context information
- `MCPContextProvider`: Provider component for setting up the MCP context

## Usage

### Basic Setup

```tsx
import { MCPContextProvider, defaultOpenAIConfig } from './components/MCPContextProvider';
import { MCPCommandBar } from './components/MCPCommandBar';

function App() {
  return (
    <MCPContextProvider userId="user-123" modelConfig={defaultOpenAIConfig}>
      <div className="app">
        {/* Your app content */}
        <MCPCommandBar position="bottom" />
      </div>
    </MCPContextProvider>
  );
}
```

### Processing Commands

```tsx
import { useCommandProcessor } from './mcp-hooks';

function CommandProcessor() {
  const { processCommand, isProcessing } = useCommandProcessor();
  
  const handleCommand = async () => {
    const response = await processCommand("Show all clusters");
    console.log(response);
  };
  
  return (
    <button onClick={handleCommand} disabled={isProcessing}>
      Process Command
    </button>
  );
}
```

### Accessing Context Data

```tsx
import { useModelContext } from './mcp-hooks';

function ClusterList() {
  const context = useModelContext();
  
  return (
    <div>
      <h2>Clusters ({context.clusters.length})</h2>
      <ul>
        {context.clusters.map(cluster => (
          <li key={cluster.id}>{cluster.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Integrating with KubeStellar Services

```tsx
import { ContextManager } from './mcp-context';
import { syncAllWithContextManager } from './mcp-integration';

// Create a context manager
const contextManager = new ContextManager('user-123');

// Sync with KubeStellar services
syncAllWithContextManager(contextManager, {
  clusterService: kubestellarClusterService,
  namespaceService: kubestellarNamespaceService,
  workloadService: kubestellarWorkloadService,
  policyService: kubestellarPolicyService
});
```

### Optimizing Performance

```tsx
import { optimizeContext, measureCommandProcessing } from './mcp-performance';
import { ModelContextProtocolService } from './mcp-service';

// Optimize context for command processing
const optimizedContext = optimizeContext(fullContext, {
  maxClusters: 5,
  onlyActiveClusters: true,
  prioritizeSelected: true
});

// Measure performance
const service = new ModelContextProtocolService(config);
const { result, metrics } = await measureCommandProcessing(
  () => service.processCommand('list clusters', 'user-123'),
  optimizedContext
);

console.log(`Command processed in ${metrics.totalTime}ms`);
console.log(`Context size: ${metrics.contextSize} bytes`);
console.log(`Estimated tokens: ${metrics.estimatedTokens}`);
```

## Testing

The implementation includes comprehensive test suites:

1. Core protocol tests (`mcp-protocol.test.tsx`)
2. Integration tests (`mcp-integration.test.tsx`)
3. Component tests (`mcp-components.test.tsx`)
4. Performance tests (`mcp-performance.test.tsx`)

Run tests with:

```
npm test
```

## Extension Points

The protocol is designed to be extensible in several ways:

1. **New Provider Adapters**: Implement the `ModelProviderAdapter` interface for new AI providers
2. **Custom Serialization Formats**: Add support for new serialization formats in the serialization utilities
3. **Enhanced Context Types**: Extend the core type definitions to include additional context information
4. **Custom UI Components**: Build specialized UI components using the provided hooks