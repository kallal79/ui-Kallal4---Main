/**
 * Tests for the Model Context Protocol integration with KubeStellar
 */

import { ContextManager } from '../../src/mcp-context';
import {
  syncClustersWithContextManager,
  syncNamespacesWithContextManager,
  syncWorkloadsWithContextManager,
  syncBindingPoliciesWithContextManager,
  syncAllWithContextManager
} from '../../src/mcp-integration';

// Mock cluster service
const mockClusterService = {
  getClusters: jest.fn().mockResolvedValue([
    {
      id: 'cluster-1',
      name: 'test-cluster',
      status: 'connected',
      version: '1.22.0',
      nodes: [{}, {}, {}] // 3 nodes
    }
  ])
};

// Mock namespace service
const mockNamespaceService = {
  getNamespaces: jest.fn().mockResolvedValue([
    {
      name: 'default',
      clusterId: 'cluster-1',
      labels: { env: 'test' }
    }
  ])
};

// Mock workload service
const mockWorkloadService = {
  getWorkloads: jest.fn().mockResolvedValue([
    {
      id: 'workload-1',
      name: 'test-deployment',
      kind: 'Deployment',
      namespace: 'default',
      clusterId: 'cluster-1',
      status: 'Running'
    }
  ])
};

// Mock policy service
const mockPolicyService = {
  getBindingPolicies: jest.fn().mockResolvedValue([
    {
      id: 'policy-1',
      name: 'test-policy',
      workloads: ['workload-1'],
      clusters: ['cluster-1'],
      status: 'active'
    }
  ])
};

describe('KubeStellar Integration', () => {
  let contextManager: ContextManager;
  
  beforeEach(() => {
    contextManager = new ContextManager('test-user');
    
    // Reset mock calls
    mockClusterService.getClusters.mockClear();
    mockNamespaceService.getNamespaces.mockClear();
    mockWorkloadService.getWorkloads.mockClear();
    mockPolicyService.getBindingPolicies.mockClear();
  });
  
  test('should sync clusters with context manager', async () => {
    await syncClustersWithContextManager(contextManager, mockClusterService);
    
    expect(mockClusterService.getClusters).toHaveBeenCalled();
    
    const context = contextManager.getContext();
    expect(context.clusters).toHaveLength(1);
    expect(context.clusters[0].id).toBe('cluster-1');
    expect(context.clusters[0].nodeCount).toBe(3);
  });
  
  test('should sync namespaces with context manager', async () => {
    await syncNamespacesWithContextManager(contextManager, mockNamespaceService);
    
    expect(mockNamespaceService.getNamespaces).toHaveBeenCalled();
    
    const context = contextManager.getContext();
    expect(context.namespaces).toHaveLength(1);
    expect(context.namespaces[0].name).toBe('default');
    expect(context.namespaces[0].labels).toEqual({ env: 'test' });
  });
  
  test('should sync workloads with context manager', async () => {
    await syncWorkloadsWithContextManager(contextManager, mockWorkloadService);
    
    expect(mockWorkloadService.getWorkloads).toHaveBeenCalled();
    
    const context = contextManager.getContext();
    expect(context.workloads).toHaveLength(1);
    expect(context.workloads[0].id).toBe('workload-1');
    expect(context.workloads[0].kind).toBe('Deployment');
  });
  
  test('should sync binding policies with context manager', async () => {
    await syncBindingPoliciesWithContextManager(contextManager, mockPolicyService);
    
    expect(mockPolicyService.getBindingPolicies).toHaveBeenCalled();
    
    const context = contextManager.getContext();
    expect(context.bindingPolicies).toHaveLength(1);
    expect(context.bindingPolicies[0].id).toBe('policy-1');
    expect(context.bindingPolicies[0].workloads).toContain('workload-1');
  });
  
  test('should sync all data with context manager', async () => {
    await syncAllWithContextManager(contextManager, {
      clusterService: mockClusterService,
      namespaceService: mockNamespaceService,
      workloadService: mockWorkloadService,
      policyService: mockPolicyService
    });
    
    expect(mockClusterService.getClusters).toHaveBeenCalled();
    expect(mockNamespaceService.getNamespaces).toHaveBeenCalled();
    expect(mockWorkloadService.getWorkloads).toHaveBeenCalled();
    expect(mockPolicyService.getBindingPolicies).toHaveBeenCalled();
    
    const context = contextManager.getContext();
    expect(context.clusters).toHaveLength(1);
    expect(context.namespaces).toHaveLength(1);
    expect(context.workloads).toHaveLength(1);
    expect(context.bindingPolicies).toHaveLength(1);
  });
  
  test('should handle errors during sync', async () => {
    // Mock a service that throws an error
    const errorService = {
      getClusters: jest.fn().mockRejectedValue(new Error('Service error'))
    };
    
    await expect(syncClustersWithContextManager(contextManager, errorService))
      .rejects.toThrow('Service error');
  });
});