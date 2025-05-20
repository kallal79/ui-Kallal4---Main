/**
 * Model Context Protocol - Integration Utilities
 * 
 * This file provides utilities for integrating the Model Context Protocol
 * with existing KubeStellar components and services.
 */

import { 
  ModelContext, 
  ClusterContext, 
  NamespaceContext, 
  WorkloadContext, 
  BindingPolicyContext 
} from './mcp-protocol-types';
import { ContextManager } from './mcp-protocol-context-manager';

/**
 * Integrates with the KubeStellar cluster service to sync cluster data
 * @param contextManager The context manager to update
 * @param clusterService The KubeStellar cluster service
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
      nodeCount: cluster.nodes?.length || 0,
      resources: {
        pods: cluster.resources?.pods || 0,
        deployments: cluster.resources?.deployments || 0,
        services: cluster.resources?.services || 0,
        namespaces: cluster.resources?.namespaces || 0
      }
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
 * Integrates with the KubeStellar namespace service to sync namespace data
 * @param contextManager The context manager to update
 * @param namespaceService The KubeStellar namespace service
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
      labels: namespace.labels,
      annotations: namespace.annotations
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
 * Integrates with the KubeStellar workload service to sync workload data
 * @param contextManager The context manager to update
 * @param workloadService The KubeStellar workload service
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
      status: workload.status,
      createdAt: workload.createdAt,
      labels: workload.labels,
      annotations: workload.annotations
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
 * Integrates with the KubeStellar binding policy service to sync policy data
 * @param contextManager The context manager to update
 * @param policyService The KubeStellar binding policy service
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
 * @param contextManager The context manager to update
 * @param services Object containing all required KubeStellar services
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

/**
 * Sets up automatic synchronization of KubeStellar data with the context manager
 * @param contextManager The context manager to update
 * @param services Object containing all required KubeStellar services
 * @param intervalMs Interval in milliseconds between sync operations
 * @returns A function to stop the automatic synchronization
 */
export function setupAutomaticSync(
  contextManager: ContextManager,
  services: {
    clusterService: any;
    namespaceService: any;
    workloadService: any;
    policyService: any;
  },
  intervalMs: number = 30000
): () => void {
  // Perform initial sync
  syncAllWithContextManager(contextManager, services).catch(error => {
    console.error('Error during initial sync:', error);
  });
  
  // Set up interval for regular syncs
  const intervalId = setInterval(() => {
    syncAllWithContextManager(contextManager, services).catch(error => {
      console.error('Error during automatic sync:', error);
    });
  }, intervalMs);
  
  // Return function to stop automatic sync
  return () => {
    clearInterval(intervalId);
  };
}