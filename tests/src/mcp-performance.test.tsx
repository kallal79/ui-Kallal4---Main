/**
 * Tests for the Model Context Protocol performance optimizations
 */

import { 
  optimizeContext, 
  optimizeRequest, 
  measureContextSize, 
  estimateTokenCount,
  measureCommandProcessing
} from '../../src/mcp-performance';
import { ModelContext, CommandRequest } from '../../src/mcp-types';

// Create a large test context
const createLargeContext = (): ModelContext => {
  return {
    clusters: Array(20).fill(0).map((_, i) => ({
      id: `cluster-${i}`,
      name: `test-cluster-${i}`,
      status: i % 3 === 0 ? 'connected' : (i % 3 === 1 ? 'disconnected' : 'error'),
      version: '1.22.0',
      nodeCount: i + 1
    })),
    namespaces: Array(50).fill(0).map((_, i) => ({
      name: `namespace-${i}`,
      clusterId: `cluster-${i % 20}`,
      labels: { env: i % 3 === 0 ? 'prod' : (i % 3 === 1 ? 'staging' : 'dev') }
    })),
    workloads: Array(100).fill(0).map((_, i) => ({
      id: `workload-${i}`,
      name: `test-workload-${i}`,
      kind: i % 3 === 0 ? 'Deployment' : (i % 3 === 1 ? 'StatefulSet' : 'DaemonSet'),
      namespace: `namespace-${i % 50}`,
      clusterId: `cluster-${i % 20}`,
      status: i % 2 === 0 ? 'Running' : 'Pending'
    })),
    bindingPolicies: Array(30).fill(0).map((_, i) => ({
      id: `policy-${i}`,
      name: `test-policy-${i}`,
      workloads: [`workload-${i}`, `workload-${i + 1}`],
      clusters: [`cluster-${i % 20}`],
      status: i % 3 === 0 ? 'active' : (i % 3 === 1 ? 'pending' : 'error')
    })),
    currentState: {
      selectedClusterId: 'cluster-5',
      selectedNamespace: 'namespace-10'
    },
    metadata: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      userId: 'test-user'
    }
  };
};

describe('Performance Optimizations', () => {
  let largeContext: ModelContext;
  
  beforeEach(() => {
    largeContext = createLargeContext();
  });
  
  test('should optimize context by limiting clusters', () => {
    const optimized = optimizeContext(largeContext, { maxClusters: 5 });
    
    expect(optimized.clusters.length).toBe(5);
    expect(optimized.namespaces.length).toBe(largeContext.namespaces.length);
    expect(optimized.workloads.length).toBe(largeContext.workloads.length);
  });
  
  test('should filter only active clusters', () => {
    const optimized = optimizeContext(largeContext, { onlyActiveClusters: true });
    
    // Only clusters with status 'connected' should remain
    expect(optimized.clusters.every(c => c.status === 'connected')).toBe(true);
    
    // Count how many connected clusters we should have
    const connectedCount = largeContext.clusters.filter(c => c.status === 'connected').length;
    expect(optimized.clusters.length).toBe(connectedCount);
  });
  
  test('should prioritize selected cluster', () => {
    const optimized = optimizeContext(largeContext, { prioritizeSelected: true });
    
    // Selected cluster should be first
    expect(optimized.clusters[0].id).toBe('cluster-5');
  });
  
  test('should optimize request', () => {
    const request: CommandRequest = {
      command: 'list clusters',
      context: largeContext
    };
    
    const optimized = optimizeRequest(request, { maxClusters: 5, maxNamespaces: 10 });
    
    expect(optimized.command).toBe('list clusters');
    expect(optimized.context.clusters.length).toBe(5);
    expect(optimized.context.namespaces.length).toBe(10);
  });
  
  test('should measure context size', () => {
    const size = measureContextSize(largeContext);
    
    // Size should be greater than zero
    expect(size).toBeGreaterThan(0);
    
    // A smaller context should have a smaller size
    const smallerContext = { ...largeContext, clusters: largeContext.clusters.slice(0, 5) };
    const smallerSize = measureContextSize(smallerContext);
    
    expect(smallerSize).toBeLessThan(size);
  });
  
  test('should estimate token count', () => {
    const tokens = estimateTokenCount(largeContext);
    
    // Token count should be greater than zero
    expect(tokens).toBeGreaterThan(0);
    
    // A smaller context should have fewer tokens
    const smallerContext = { ...largeContext, clusters: largeContext.clusters.slice(0, 5) };
    const smallerTokens = estimateTokenCount(smallerContext);
    
    expect(smallerTokens).toBeLessThan(tokens);
  });
  
  test('should measure command processing performance', async () => {
    const mockFn = jest.fn().mockResolvedValue({ status: 'success' });
    
    const { result, metrics } = await measureCommandProcessing(mockFn, largeContext);
    
    expect(result).toEqual({ status: 'success' });
    expect(mockFn).toHaveBeenCalled();
    
    // Metrics should be populated
    expect(metrics.serializationTime).toBeGreaterThan(0);
    expect(metrics.totalTime).toBeGreaterThan(0);
    expect(metrics.contextSize).toBeGreaterThan(0);
    expect(metrics.estimatedTokens).toBeGreaterThan(0);
  });
});