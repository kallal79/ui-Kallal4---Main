/**
 * Model Context Protocol - Context Manager
 */

import { ModelContext, ClusterContext, NamespaceContext, WorkloadContext, BindingPolicyContext } from './mcp-types';

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

export interface ContextUpdateEvent {
  type: ContextUpdateType;
  payload: any;
  timestamp: string;
}

export type ContextUpdateListener = (event: ContextUpdateEvent) => void;

export class ContextManager {
  private context: ModelContext;
  private listeners: ContextUpdateListener[] = [];
  private userId: string;
  
  constructor(userId: string, initialContext?: ModelContext) {
    this.userId = userId;
    
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
  
  public getContext(): ModelContext {
    return this.context;
  }
  
  public addCluster(cluster: ClusterContext): void {
    const existingIndex = this.context.clusters.findIndex(c => c.id === cluster.id);
    
    if (existingIndex >= 0) {
      this.context.clusters[existingIndex] = cluster;
      this.notifyListeners({
        type: ContextUpdateType.CLUSTER_UPDATED,
        payload: cluster,
        timestamp: new Date().toISOString()
      });
    } else {
      this.context.clusters.push(cluster);
      this.notifyListeners({
        type: ContextUpdateType.CLUSTER_ADDED,
        payload: cluster,
        timestamp: new Date().toISOString()
      });
    }
    
    this.context.metadata.timestamp = new Date().toISOString();
  }
  
  public addNamespace(namespace: NamespaceContext): void {
    const existingIndex = this.context.namespaces.findIndex(
      ns => ns.name === namespace.name && ns.clusterId === namespace.clusterId
    );
    
    if (existingIndex >= 0) {
      this.context.namespaces[existingIndex] = namespace;
      this.notifyListeners({
        type: ContextUpdateType.NAMESPACE_UPDATED,
        payload: namespace,
        timestamp: new Date().toISOString()
      });
    } else {
      this.context.namespaces.push(namespace);
      this.notifyListeners({
        type: ContextUpdateType.NAMESPACE_ADDED,
        payload: namespace,
        timestamp: new Date().toISOString()
      });
    }
    
    this.context.metadata.timestamp = new Date().toISOString();
  }
  
  public addWorkload(workload: WorkloadContext): void {
    const existingIndex = this.context.workloads.findIndex(w => w.id === workload.id);
    
    if (existingIndex >= 0) {
      this.context.workloads[existingIndex] = workload;
      this.notifyListeners({
        type: ContextUpdateType.WORKLOAD_UPDATED,
        payload: workload,
        timestamp: new Date().toISOString()
      });
    } else {
      this.context.workloads.push(workload);
      this.notifyListeners({
        type: ContextUpdateType.WORKLOAD_ADDED,
        payload: workload,
        timestamp: new Date().toISOString()
      });
    }
    
    this.context.metadata.timestamp = new Date().toISOString();
  }
  
  public addBindingPolicy(policy: BindingPolicyContext): void {
    const existingIndex = this.context.bindingPolicies.findIndex(bp => bp.id === policy.id);
    
    if (existingIndex >= 0) {
      this.context.bindingPolicies[existingIndex] = policy;
      this.notifyListeners({
        type: ContextUpdateType.BINDING_POLICY_UPDATED,
        payload: policy,
        timestamp: new Date().toISOString()
      });
    } else {
      this.context.bindingPolicies.push(policy);
      this.notifyListeners({
        type: ContextUpdateType.BINDING_POLICY_ADDED,
        payload: policy,
        timestamp: new Date().toISOString()
      });
    }
    
    this.context.metadata.timestamp = new Date().toISOString();
  }
  
  public addListener(listener: ContextUpdateListener): () => void {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index >= 0) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
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