/**
 * Model Context Protocol - Core Types
 */

export interface ClusterContext {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  version: string;
  nodeCount?: number;
}

export interface NamespaceContext {
  name: string;
  clusterId: string;
  labels?: Record<string, string>;
}

export interface WorkloadContext {
  id: string;
  name: string;
  kind: string;
  namespace: string;
  clusterId: string;
  status: string;
}

export interface BindingPolicyContext {
  id: string;
  name: string;
  workloads: string[];
  clusters: string[];
  status: 'active' | 'pending' | 'error';
}

export interface ModelContext {
  clusters: ClusterContext[];
  namespaces: NamespaceContext[];
  workloads: WorkloadContext[];
  bindingPolicies: BindingPolicyContext[];
  currentState: {
    selectedClusterId?: string;
    selectedNamespace?: string;
  };
  metadata: {
    timestamp: string;
    version: string;
    userId: string;
  };
}

export interface CommandRequest {
  command: string;
  context: ModelContext;
}

export interface CommandResponse {
  actions: CommandAction[];
  explanation: string;
  status: 'success' | 'error' | 'needs_clarification';
  clarificationQuestions?: string[];
}

export interface CommandAction {
  type: 'create' | 'update' | 'delete' | 'apply' | 'query';
  resource: {
    kind: string;
    name?: string;
    namespace?: string;
    clusterId?: string;
  };
  payload?: any;
}

export interface ModelProviderConfig {
  provider: 'openai' | 'anthropic' | 'aws' | 'custom';
  endpoint?: string;
  apiKey?: string;
  modelName: string;
  contextWindowSize: number;
  maxTokens: number;
  temperature: number;
}