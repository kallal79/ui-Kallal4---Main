/**
 * Model Context Protocol - Integration with KubeStellar
 * 
 * This file provides integration points between the Model Context Protocol
 * and existing KubeStellar components.
 */

import { 
  ModelContext, 
  ClusterContext, 
  NamespaceContext, 
  WorkloadContext, 
  BindingPolicyContext 
} from './mcp-types';
import { ContextManager } from './mcp-context';

/**
 * Integrates with the KubeStellar cluster service
 */
export async function syncClustersWithContextManager(
  contextManager: ContextManager,
  clusterService: any // Replace with actual cluster service type
): Promise<void> {
  try {
    // Get clusters from the service
    const clusters = await clusterService.getClusters();
    
    // Convert to ClusterContext format
    const clusterContexts: ClusterContext[] = clusters.map((cluster: any) => ({
      id: cluster.id,
      name: cluster.name,
      status: cluster.status,
      version: cluster.version,
      nodeCount: cluster.nodes?.length || 0
    }));
    
    // Update each cluster in the context manager
    clusterContexts.forEach(cluster => {
      contextManager.addCluster(cluster);
    });
    
    console.log(`Synced ${clusterContexts.length} clusters with context manager`);
  } catch (error) {
    console.error('Error syncing clusters with context manager:', error);
    throw error;
  }
}

/**
 * Integrates with the KubeStellar namespace service
 */
export async function syncNamespacesWithContextManager(
  contextManager: ContextManager,
  namespaceService: any // Replace with actual namespace service type
): Promise<void> {
  try {
    // Get namespaces from the service
    const namespaces = await namespaceService.getNamespaces();
    
    // Convert to NamespaceContext format
    const namespaceContexts: NamespaceContext[] = namespaces.map((namespace: any) => ({
      name: namespace.name,
      clusterId: namespace.clusterId,
      labels: namespace.labels
    }));
    
    // Update each namespace in the context manager
    namespaceContexts.forEach(namespace => {
      contextManager.addNamespace(namespace);
    });
    
    console.log(`Synced ${namespaceContexts.length} namespaces with context manager`);
  } catch (error) {
    console.error('Error syncing namespaces with context manager:', error);
    throw error;
  }
}

/**
 * Integrates with the KubeStellar workload service
 */
export async function syncWorkloadsWithContextManager(
  contextManager: ContextManager,
  workloadService: any // Replace with actual workload service type
): Promise<void> {
  try {
    // Get workloads from the service
    const workloads = await workloadService.getWorkloads();
    
    // Convert to WorkloadContext format
    const workloadContexts: WorkloadContext[] = workloads.map((workload: any) => ({
      id: workload.id,
      name: workload.name,
      kind: workload.kind,
      namespace: workload.namespace,
      clusterId: workload.clusterId,
      status: workload.status
    }));
    
    // Update each workload in the context manager
    workloadContexts.forEach(workload => {
      contextManager.addWorkload(workload);
    });
    
    console.log(`Synced ${workloadContexts.length} workloads with context manager`);
  } catch (error) {
    console.error('Error syncing workloads with context manager:', error);
    throw error;
  }
}

/**
 * Integrates with the KubeStellar binding policy service
 */
export async function syncBindingPoliciesWithContextManager(
  contextManager: ContextManager,
  policyService: any // Replace with actual policy service type
): Promise<void> {
  try {
    // Get binding policies from the service
    const policies = await policyService.getBindingPolicies();
    
    // Convert to BindingPolicyContext format
    const policyContexts: BindingPolicyContext[] = policies.map((policy: any) => ({
      id: policy.id,
      name: policy.name,
      workloads: policy.workloads || [],
      clusters: policy.clusters || [],
      status: policy.status
    }));
    
    // Update each policy in the context manager
    policyContexts.forEach(policy => {
      contextManager.addBindingPolicy(policy);
    });
    
    console.log(`Synced ${policyContexts.length} binding policies with context manager`);
  } catch (error) {
    console.error('Error syncing binding policies with context manager:', error);
    throw error;
  }
}

/**
 * Syncs all KubeStellar data with the context manager
 */
export async function syncAllWithContextManager(
  contextManager: ContextManager,
  services: {
    clusterService: any;
    namespaceService: any;
    workloadService: any;
    policyService: any;
  }
): Promise<void> {
  try {
    await Promise.all([
      syncClustersWithContextManager(contextManager, services.clusterService),
      syncNamespacesWithContextManager(contextManager, services.namespaceService),
      syncWorkloadsWithContextManager(contextManager, services.workloadService),
      syncBindingPoliciesWithContextManager(contextManager, services.policyService)
    ]);
    
    console.log('Successfully synced all data with context manager');
  } catch (error) {
    console.error('Error syncing all data with context manager:', error);
    throw error;
  }
}