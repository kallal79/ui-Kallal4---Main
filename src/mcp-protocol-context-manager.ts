/**
 * Model Context Protocol - Context Manager
 * 
 * This file implements the context management system for the KubeStellar MCP,
 * which maintains state information for accurate command interpretation.
 */

import { ModelContext, ClusterContext, NamespaceContext, WorkloadContext, BindingPolicyContext } from './mcp-protocol-types';

/**
 * Context update event types
 */
export enum ContextUpdateType {
  CLUSTER_ADDED = 'cluster_added',
  CLUSTER_UPDATED = 'cluster_updated',
  CLUSTER_REMOVED = 'cluster_removed',
  NAMESPACE_ADDED = 'namespace_added',
  NAMESPACE_UPDATED = 'namespace_updated',
  NAMESPACE_REMOVED = 'namespace_removed',
  WORKLOAD_ADDED = 'workload_added',
  WORKLOAD_UPDATED = 'workload_updated',
  WORKLOAD_REMOVED = 'workload_removed',
  BINDING_POLICY_ADDED = 'binding_policy_added',
  BINDING_POLICY_UPDATED = 'binding_policy_updated',
  BINDING_POLICY_REMOVED = 'binding_policy_removed',
  SELECTION_CHANGED = 'selection_changed'
}

/**
 * Context update event interface
 */
export interface ContextUpdateEvent {
  type: ContextUpdateType;
  payload: any;
  timestamp: string;
}

/**
 * Context update listener function type
 */
export type ContextUpdateListener = (event: ContextUpdateEvent) => void;

/**
 * Context manager for maintaining KubeStellar state
 */
export class ContextManager {
  private context: ModelContext;
  private listeners: ContextUpdateListener[] = [];
  private userId: string;
  
  /**
   * Creates a new context manager
   * @param userId The ID of the current user
   * @param initialContext Optional initial context
   */
  constructor(userId: string, initialContext?: ModelContext) {
    this.userId = userId;
    
    // Initialize with empty context or provided context
    this.context = initialContext || {
      clusters: [],
      namespaces: [],
      workloads: [],
      bindingPolicies: [],
      currentState: {},
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        userId
      }
    };
  }
  
  /**
   * Gets the current context
   * @returns The current context
   */
  public getContext(): ModelContext {
    return this.context;
  }
  
  /**
   * Updates the context with new data
   * @param partialContext Partial context to merge with existing context
   */
  public updateContext(partialContext: Partial<ModelContext>): void {
    this.context = {
      ...this.context,
      ...partialContext,
      metadata: {
        ...this.context.metadata,
        timestamp: new Date().toISOString()
      }
    };
    
    // Notify listeners of the update
    this.notifyListeners({
      type: ContextUpdateType.SELECTION_CHANGED,
      payload: this.context.currentState,
      timestamp: this.context.metadata.timestamp
    });
  }
  
  /**
   * Adds a cluster to the context
   * @param cluster The cluster to add
   */
  public addCluster(cluster: ClusterContext): void {
    // Check if cluster already exists
    const existingIndex = this.context.clusters.findIndex(c => c.id === cluster.id);
    
    if (existingIndex >= 0) {
      // Update existing cluster
      this.context.clusters[existingIndex] = cluster;
      this.notifyListeners({
        type: ContextUpdateType.CLUSTER_UPDATED,
        payload: cluster,
        timestamp: new Date().toISOString()
      });
    } else {
      // Add new cluster
      this.context.clusters.push(cluster);
      this.notifyListeners({
        type: ContextUpdateType.CLUSTER_ADDED,
        payload: cluster,
        timestamp: new Date().toISOString()
      });
    }
    
    // Update metadata timestamp
    this.context.metadata.timestamp = new Date().toISOString();
  }
  
  /**
   * Removes a cluster from the context
   * @param clusterId The ID of the cluster to remove
   */
  public removeCluster(clusterId: string): void {
    const clusterIndex = this.context.clusters.findIndex(c => c.id === clusterId);
    
    if (clusterIndex >= 0) {
      const removedCluster = this.context.clusters[clusterIndex];
      this.context.clusters.splice(clusterIndex, 1);
      
      // Also remove related namespaces and workloads
      this.context.namespaces = this.context.namespaces.filter(ns => ns.clusterId !== clusterId);
      this.context.workloads = this.context.workloads.filter(w => w.clusterId !== clusterId);
      
      // Update binding policies that reference this cluster
      this.context.bindingPolicies.forEach(bp => {
        bp.clusters = bp.clusters.filter(id => id !== clusterId);
      });
      
      this.notifyListeners({
        type: ContextUpdateType.CLUSTER_REMOVED,
        payload: removedCluster,
        timestamp: new Date().toISOString()
      });
      
      // Update metadata timestamp
      this.context.metadata.timestamp = new Date().toISOString();
    }
  }
  
  /**
   * Adds a namespace to the context
   * @param namespace The namespace to add
   */
  public addNamespace(namespace: NamespaceContext): void {
    // Check if namespace already exists
    const existingIndex = this.context.namespaces.findIndex(
      ns => ns.name === namespace.name && ns.clusterId === namespace.clusterId
    );
    
    if (existingIndex >= 0) {
      // Update existing namespace
      this.context.namespaces[existingIndex] = namespace;
      this.notifyListeners({
        type: ContextUpdateType.NAMESPACE_UPDATED,
        payload: namespace,
        timestamp: new Date().toISOString()
      });
    } else {
      // Add new namespace
      this.context.namespaces.push(namespace);
      this.notifyListeners({
        type: ContextUpdateType.NAMESPACE_ADDED,
        payload: namespace,
        timestamp: new Date().toISOString()
      });
    }
    
    // Update metadata timestamp
    this.context.metadata.timestamp = new Date().toISOString();
  }
  
  /**
   * Removes a namespace from the context
   * @param name The name of the namespace
   * @param clusterId The ID of the cluster the namespace belongs to
   */
  public removeNamespace(name: string, clusterId: string): void {
    const namespaceIndex = this.context.namespaces.findIndex(
      ns => ns.name === name && ns.clusterId === clusterId
    );
    
    if (namespaceIndex >= 0) {
      const removedNamespace = this.context.namespaces[namespaceIndex];
      this.context.namespaces.splice(namespaceIndex, 1);
      
      // Also remove workloads in this namespace
      this.context.workloads = this.context.workloads.filter(
        w => !(w.namespace === name && w.clusterId === clusterId)
      );
      
      this.notifyListeners({
        type: ContextUpdateType.NAMESPACE_REMOVED,
        payload: removedNamespace,
        timestamp: new Date().toISOString()
      });
      
      // Update metadata timestamp
      this.context.metadata.timestamp = new Date().toISOString();
    }
  }
  
  /**
   * Adds a workload to the context
   * @param workload The workload to add
   */
  public addWorkload(workload: WorkloadContext): void {
    // Check if workload already exists
    const existingIndex = this.context.workloads.findIndex(w => w.id === workload.id);
    
    if (existingIndex >= 0) {
      // Update existing workload
      this.context.workloads[existingIndex] = workload;
      this.notifyListeners({
        type: ContextUpdateType.WORKLOAD_UPDATED,
        payload: workload,
        timestamp: new Date().toISOString()
      });
    } else {
      // Add new workload
      this.context.workloads.push(workload);
      this.notifyListeners({
        type: ContextUpdateType.WORKLOAD_ADDED,
        payload: workload,
        timestamp: new Date().toISOString()
      });
    }
    
    // Update metadata timestamp
    this.context.metadata.timestamp = new Date().toISOString();
  }
  
  /**
   * Removes a workload from the context
   * @param workloadId The ID of the workload to remove
   */
  public removeWorkload(workloadId: string): void {
    const workloadIndex = this.context.workloads.findIndex(w => w.id === workloadId);
    
    if (workloadIndex >= 0) {
      const removedWorkload = this.context.workloads[workloadIndex];
      this.context.workloads.splice(workloadIndex, 1);
      
      // Update binding policies that reference this workload
      this.context.bindingPolicies.forEach(bp => {
        bp.workloads = bp.workloads.filter(id => id !== workloadId);
      });
      
      this.notifyListeners({
        type: ContextUpdateType.WORKLOAD_REMOVED,
        payload: removedWorkload,
        timestamp: new Date().toISOString()
      });
      
      // Update metadata timestamp
      this.context.metadata.timestamp = new Date().toISOString();
    }
  }
  
  /**
   * Adds a binding policy to the context
   * @param policy The binding policy to add
   */
  public addBindingPolicy(policy: BindingPolicyContext): void {
    // Check if policy already exists
    const existingIndex = this.context.bindingPolicies.findIndex(bp => bp.id === policy.id);
    
    if (existingIndex >= 0) {
      // Update existing policy
      this.context.bindingPolicies[existingIndex] = policy;
      this.notifyListeners({
        type: ContextUpdateType.BINDING_POLICY_UPDATED,
        payload: policy,
        timestamp: new Date().toISOString()
      });
    } else {
      // Add new policy
      this.context.bindingPolicies.push(policy);
      this.notifyListeners({
        type: ContextUpdateType.BINDING_POLICY_ADDED,
        payload: policy,
        timestamp: new Date().toISOString()
      });
    }
    
    // Update metadata timestamp
    this.context.metadata.timestamp = new Date().toISOString();
  }
  
  /**
   * Removes a binding policy from the context
   * @param policyId The ID of the binding policy to remove
   */
  public removeBindingPolicy(policyId: string): void {
    const policyIndex = this.context.bindingPolicies.findIndex(bp => bp.id === policyId);
    
    if (policyIndex >= 0) {
      const removedPolicy = this.context.bindingPolicies[policyIndex];
      this.context.bindingPolicies.splice(policyIndex, 1);
      
      this.notifyListeners({
        type: ContextUpdateType.BINDING_POLICY_REMOVED,
        payload: removedPolicy,
        timestamp: new Date().toISOString()
      });
      
      // Update metadata timestamp
      this.context.metadata.timestamp = new Date().toISOString();
    }
  }
  
  /**
   * Updates the current selection state
   * @param state The new selection state
   */
  public updateSelectionState(state: Partial<ModelContext['currentState']>): void {
    this.context.currentState = {
      ...this.context.currentState,
      ...state
    };
    
    this.notifyListeners({
      type: ContextUpdateType.SELECTION_CHANGED,
      payload: this.context.currentState,
      timestamp: new Date().toISOString()
    });
    
    // Update metadata timestamp
    this.context.metadata.timestamp = new Date().toISOString();
  }
  
  /**
   * Adds a listener for context updates
   * @param listener The listener function to add
   * @returns A function to remove the listener
   */
  public addListener(listener: ContextUpdateListener): () => void {
    this.listeners.push(listener);
    
    // Return a function to remove this listener
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index >= 0) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  /**
   * Notifies all listeners of a context update
   * @param event The update event
   */
  private notifyListeners(event: ContextUpdateEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in context update listener:', error);
      }
    });
  }
}