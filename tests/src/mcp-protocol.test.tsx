/**
 * Tests for the Model Context Protocol implementation
 */

import { 
  ModelContext,
  ClusterContext,
  NamespaceContext,
  WorkloadContext,
  BindingPolicyContext,
  CommandRequest,
  CommandResponse
} from '../../src/mcp-types';

import { ModelContextProtocolService } from '../../src/mcp-service';
import { ContextManager, ContextUpdateType } from '../../src/mcp-context';
import { OpenAIProviderAdapter, AWSProviderAdapter, createProviderAdapter } from '../../src/mcp-providers';
import { serializeContext, deserializeContext, serializeRequest, deserializeRequest } from '../../src/mcp-serialization';

// Mock data for testing
const mockCluster: ClusterContext = {
  id: 'cluster-1',
  name: 'test-cluster',
  status: 'connected',
  version: '1.22.0',
  nodeCount: 3
};

const mockNamespace: NamespaceContext = {
  name: 'default',
  clusterId: 'cluster-1',
  labels: { env: 'test' }
};

const mockWorkload: WorkloadContext = {
  id: 'workload-1',
  name: 'test-deployment',
  kind: 'Deployment',
  namespace: 'default',
  clusterId: 'cluster-1',
  status: 'Running'
};

const mockBindingPolicy: BindingPolicyContext = {
  id: 'policy-1',
  name: 'test-policy',
  workloads: ['workload-1'],
  clusters: ['cluster-1'],
  status: 'active'
};

describe('Context Manager', () => {
  let contextManager: ContextManager;
  
  beforeEach(() => {
    contextManager = new ContextManager('test-user');
  });
  
  test('should initialize with empty context', () => {
    const context = contextManager.getContext();
    expect(context.clusters).toHaveLength(0);
    expect(context.namespaces).toHaveLength(0);
    expect(context.workloads).toHaveLength(0);
    expect(context.bindingPolicies).toHaveLength(0);
    expect(context.metadata.userId).toBe('test-user');
  });
  
  test('should add cluster to context', () => {
    contextManager.addCluster(mockCluster);
    const context = contextManager.getContext();
    expect(context.clusters).toHaveLength(1);
    expect(context.clusters[0].id).toBe('cluster-1');
  });
  
  test('should add namespace to context', () => {
    contextManager.addNamespace(mockNamespace);
    const context = contextManager.getContext();
    expect(context.namespaces).toHaveLength(1);
    expect(context.namespaces[0].name).toBe('default');
  });
  
  test('should add workload to context', () => {
    contextManager.addWorkload(mockWorkload);
    const context = contextManager.getContext();
    expect(context.workloads).toHaveLength(1);
    expect(context.workloads[0].id).toBe('workload-1');
  });
  
  test('should add binding policy to context', () => {
    contextManager.addBindingPolicy(mockBindingPolicy);
    const context = contextManager.getContext();
    expect(context.bindingPolicies).toHaveLength(1);
    expect(context.bindingPolicies[0].id).toBe('policy-1');
  });
  
  test('should notify listeners of context updates', () => {
    const listener = jest.fn();
    contextManager.addListener(listener);
    
    contextManager.addCluster(mockCluster);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
      type: ContextUpdateType.CLUSTER_ADDED,
      payload: mockCluster
    }));
  });
});

describe('Serialization Utilities', () => {
  let context: ModelContext;
  
  beforeEach(() => {
    context = {
      clusters: [mockCluster],
      namespaces: [mockNamespace],
      workloads: [mockWorkload],
      bindingPolicies: [mockBindingPolicy],
      currentState: {},
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        userId: 'test-user'
      }
    };
  });
  
  test('should serialize and deserialize context', () => {
    const serialized = serializeContext(context);
    const deserialized = deserializeContext(serialized);
    
    expect(deserialized.clusters).toHaveLength(1);
    expect(deserialized.clusters[0].id).toBe('cluster-1');
    expect(deserialized.namespaces[0].name).toBe('default');
  });
  
  test('should serialize and deserialize request', () => {
    const request: CommandRequest = {
      command: 'list clusters',
      context
    };
    
    const serialized = serializeRequest(request);
    const deserialized = deserializeRequest(serialized);
    
    expect(deserialized.command).toBe('list clusters');
    expect(deserialized.context.clusters).toHaveLength(1);
  });
  
  test('should limit context size based on options', () => {
    // Create a context with multiple clusters
    const largeContext: ModelContext = {
      ...context,
      clusters: Array(20).fill(0).map((_, i) => ({
        ...mockCluster,
        id: `cluster-${i}`,
        name: `test-cluster-${i}`
      }))
    };
    
    const serialized = serializeContext(largeContext, { maxClusters: 5 });
    const deserialized = deserializeContext(serialized);
    
    expect(deserialized.clusters).toHaveLength(5);
  });
});

describe('Provider Adapters', () => {
  test('should create OpenAI provider adapter', () => {
    const config = {
      provider: 'openai' as const,
      modelName: 'gpt-4',
      contextWindowSize: 8192,
      maxTokens: 1024,
      temperature: 0.7
    };
    
    const adapter = createProviderAdapter(config);
    expect(adapter).toBeInstanceOf(OpenAIProviderAdapter);
    expect(adapter.getConfig()).toBe(config);
  });
  
  test('should create AWS provider adapter', () => {
    const config = {
      provider: 'aws' as const,
      modelName: 'anthropic.claude-v2',
      contextWindowSize: 100000,
      maxTokens: 2048,
      temperature: 0.5
    };
    
    const adapter = createProviderAdapter(config);
    expect(adapter).toBeInstanceOf(AWSProviderAdapter);
    expect(adapter.getConfig()).toBe(config);
  });
  
  test('should throw error for unknown provider', () => {
    const config = {
      provider: 'unknown' as any,
      modelName: 'unknown-model',
      contextWindowSize: 1000,
      maxTokens: 100,
      temperature: 0.5
    };
    
    expect(() => createProviderAdapter(config)).toThrow('Unknown provider');
  });
});

describe('Model Context Protocol Service', () => {
  let service: ModelContextProtocolService;
  
  beforeEach(() => {
    const config = {
      provider: 'openai' as const,
      modelName: 'gpt-4',
      contextWindowSize: 8192,
      maxTokens: 1024,
      temperature: 0.7
    };
    
    service = new ModelContextProtocolService(config);
  });
  
  test('should build context for user', async () => {
    const context = await service.buildContext('test-user');
    
    expect(context.metadata.userId).toBe('test-user');
    expect(context.clusters).toHaveLength(0);
    expect(context.namespaces).toHaveLength(0);
    expect(context.workloads).toHaveLength(0);
    expect(context.bindingPolicies).toHaveLength(0);
  });
  
  test('should process command and return response', async () => {
    const response = await service.processCommand('list clusters', 'test-user');
    
    expect(response).toHaveProperty('actions');
    expect(response).toHaveProperty('explanation');
    expect(response).toHaveProperty('status');
    expect(response.status).toBe('success');
  });
  
  test('should execute actions', async () => {
    const actions = [
      {
        type: 'query' as const,
        resource: {
          kind: 'Cluster',
          name: 'test-cluster'
        }
      }
    ];
    
    const results = await service.executeActions(actions);
    
    expect(results).toHaveLength(1);
    expect(results[0].success).toBe(true);
    expect(results[0].action).toBe(actions[0]);
  });
});