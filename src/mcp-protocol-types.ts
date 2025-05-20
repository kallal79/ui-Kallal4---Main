/**
 * Model Context Protocol - Core Types
 * 
 * This file defines the core types for the KubeStellar Model Context Protocol (MCP)
 * which establishes a standardized communication framework between KubeStellar's
 * internal components and AI models used for command interpretation.
 */

/**
 * Represents a KubeStellar cluster in the MCP context
 */
export interface ClusterContext {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  version: string;
  nodeCount?: number;
  resources?: ResourceSummary;
}

/**
 * Summary of resources in a cluster
 */
export interface ResourceSummary {
  pods: number;
  deployments: number;
  services: number;
  namespaces: number;
  // Add other resource types as needed
}

/**
 * Represents a namespace in the MCP context
 */
export interface NamespaceContext {
  name: string;
  clusterId: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
}

/**
 * Represents a workload in the MCP context
 */
export interface WorkloadContext {
  id: string;
  name: string;
  kind: string;
  namespace: string;
  clusterId: string;
  status: string;
  createdAt: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
}

/**
 * Represents a binding policy in the MCP context
 */
export interface BindingPolicyContext {
  id: string;
  name: string;
  workloads: string[];
  clusters: string[];
  status: 'active' | 'pending' | 'error';
}

/**
 * The complete model context that will be passed to AI models
 */
export interface ModelContext {
  clusters: ClusterContext[];
  namespaces: NamespaceContext[];
  workloads: WorkloadContext[];
  bindingPolicies: BindingPolicyContext[];
  currentState: {
    selectedClusterId?: string;
    selectedNamespace?: string;
    selectedWorkloadId?: string;
    selectedBindingPolicyId?: string;
  };
  metadata: {
    timestamp: string;
    version: string;
    userId: string;
  };
}

/**
 * Command request sent to the AI model
 */
export interface CommandRequest {
  command: string;
  context: ModelContext;
}

/**
 * Command response received from the AI model
 */
export interface CommandResponse {
  actions: CommandAction[];
  explanation: string;
  status: 'success' | 'error' | 'needs_clarification';
  clarificationQuestions?: string[];
}

/**
 * Represents an action to be performed based on model interpretation
 */
export interface CommandAction {
  type: 'create' | 'update' | 'delete' | 'apply' | 'query';
  resource: {
    kind: string;
    name?: string;
    namespace?: string;
    clusterId?: string;
  };
  payload?: any;
  metadata?: Record<string, any>;
}

/**
 * Provider-specific configuration for AI model integration
 */
export interface ModelProviderConfig {
  provider: 'openai' | 'anthropic' | 'aws' | 'custom';
  endpoint?: string;
  apiKey?: string;
  modelName: string;
  contextWindowSize: number;
  maxTokens: number;
  temperature: number;
  options?: Record<string, any>;
}