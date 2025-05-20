/**
 * Model Context Protocol - Performance Optimizations
 * 
 * This file provides utilities for optimizing the performance of the Model Context Protocol,
 * particularly for minimizing latency in command processing.
 */

import { ModelContext, CommandRequest } from './mcp-types';
import { serializeContext } from './mcp-serialization';

/**
 * Options for context optimization
 */
export interface ContextOptimizationOptions {
  /**
   * Maximum number of clusters to include
   */
  maxClusters?: number;
  
  /**
   * Maximum number of namespaces to include
   */
  maxNamespaces?: number;
  
  /**
   * Maximum number of workloads to include
   */
  maxWorkloads?: number;
  
  /**
   * Maximum number of binding policies to include
   */
  maxBindingPolicies?: number;
  
  /**
   * Whether to include only active clusters
   */
  onlyActiveClusters?: boolean;
  
  /**
   * Whether to prioritize selected resources
   */
  prioritizeSelected?: boolean;
  
  /**
   * Whether to include detailed resource information
   */
  includeResourceDetails?: boolean;
}

/**
 * Default optimization options
 */
const DEFAULT_OPTIMIZATION_OPTIONS: ContextOptimizationOptions = {
  maxClusters: 10,
  maxNamespaces: 20,
  maxWorkloads: 50,
  maxBindingPolicies: 10,
  onlyActiveClusters: true,
  prioritizeSelected: true,
  includeResourceDetails: false
};

/**
 * Optimizes a context for command processing to minimize latency
 * @param context The context to optimize
 * @param options Optimization options
 * @returns Optimized context
 */
export function optimizeContext(
  context: ModelContext,
  options: ContextOptimizationOptions = DEFAULT_OPTIMIZATION_OPTIONS
): ModelContext {
  // Create a copy of the context to avoid modifying the original
  const optimizedContext: ModelContext = JSON.parse(JSON.stringify(context));
  
  // Filter clusters
  if (options.onlyActiveClusters) {
    optimizedContext.clusters = optimizedContext.clusters.filter(c => c.status === 'connected');
  }
  
  // Prioritize selected resources if needed
  if (options.prioritizeSelected && optimizedContext.currentState.selectedClusterId) {
    const selectedClusterId = optimizedContext.currentState.selectedClusterId;
    
    // Move selected cluster to the front
    const selectedClusterIndex = optimizedContext.clusters.findIndex(c => c.id === selectedClusterId);
    if (selectedClusterIndex > 0) {
      const selectedCluster = optimizedContext.clusters[selectedClusterIndex];
      optimizedContext.clusters.splice(selectedClusterIndex, 1);
      optimizedContext.clusters.unshift(selectedCluster);
    }
    
    // Filter namespaces to prioritize those in the selected cluster
    if (optimizedContext.currentState.selectedNamespace) {
      const selectedNamespace = optimizedContext.currentState.selectedNamespace;
      
      // Move selected namespace to the front
      const selectedNamespaceIndex = optimizedContext.namespaces.findIndex(
        ns => ns.name === selectedNamespace && ns.clusterId === selectedClusterId
      );
      
      if (selectedNamespaceIndex > 0) {
        const selectedNs = optimizedContext.namespaces[selectedNamespaceIndex];
        optimizedContext.namespaces.splice(selectedNamespaceIndex, 1);
        optimizedContext.namespaces.unshift(selectedNs);
      }
    }
  }
  
  // Apply limits
  if (options.maxClusters && optimizedContext.clusters.length > options.maxClusters) {
    optimizedContext.clusters = optimizedContext.clusters.slice(0, options.maxClusters);
  }
  
  if (options.maxNamespaces && optimizedContext.namespaces.length > options.maxNamespaces) {
    optimizedContext.namespaces = optimizedContext.namespaces.slice(0, options.maxNamespaces);
  }
  
  if (options.maxWorkloads && optimizedContext.workloads.length > options.maxWorkloads) {
    optimizedContext.workloads = optimizedContext.workloads.slice(0, options.maxWorkloads);
  }
  
  if (options.maxBindingPolicies && optimizedContext.bindingPolicies.length > options.maxBindingPolicies) {
    optimizedContext.bindingPolicies = optimizedContext.bindingPolicies.slice(0, options.maxBindingPolicies);
  }
  
  return optimizedContext;
}

/**
 * Measures the size of a context in bytes
 * @param context The context to measure
 * @returns Size in bytes
 */
export function measureContextSize(context: ModelContext): number {
  return new TextEncoder().encode(serializeContext(context)).length;
}

/**
 * Estimates the token count for a context (approximate)
 * @param context The context to estimate tokens for
 * @returns Estimated token count
 */
export function estimateTokenCount(context: ModelContext): number {
  // Rough estimate: 1 token ≈ 4 characters
  const serialized = serializeContext(context);
  return Math.ceil(serialized.length / 4);
}

/**
 * Optimizes a request for command processing
 * @param request The request to optimize
 * @param options Optimization options
 * @returns Optimized request
 */
export function optimizeRequest(
  request: CommandRequest,
  options: ContextOptimizationOptions = DEFAULT_OPTIMIZATION_OPTIONS
): CommandRequest {
  return {
    ...request,
    context: optimizeContext(request.context, options)
  };
}

/**
 * Performance metrics for command processing
 */
export interface CommandProcessingMetrics {
  /**
   * Time taken to serialize the context (ms)
   */
  serializationTime: number;
  
  /**
   * Time taken to send the request to the model (ms)
   */
  networkTime: number;
  
  /**
   * Time taken by the model to process the command (ms)
   */
  modelProcessingTime: number;
  
  /**
   * Time taken to deserialize the response (ms)
   */
  deserializationTime: number;
  
  /**
   * Total time taken for the command processing (ms)
   */
  totalTime: number;
  
  /**
   * Size of the serialized context (bytes)
   */
  contextSize: number;
  
  /**
   * Estimated token count
   */
  estimatedTokens: number;
}

/**
 * Measures performance metrics for command processing
 * @param fn The async function to measure
 * @param context The context being used
 * @returns Performance metrics
 */
export async function measureCommandProcessing<T>(
  fn: () => Promise<T>,
  context: ModelContext
): Promise<{ result: T; metrics: CommandProcessingMetrics }> {
  const metrics: CommandProcessingMetrics = {
    serializationTime: 0,
    networkTime: 0,
    modelProcessingTime: 0,
    deserializationTime: 0,
    totalTime: 0,
    contextSize: measureContextSize(context),
    estimatedTokens: estimateTokenCount(context)
  };
  
  const startTotal = performance.now();
  
  // Measure serialization time (simulate)
  const startSerialization = performance.now();
  serializeContext(context);
  metrics.serializationTime = performance.now() - startSerialization;
  
  // Execute the function and measure time
  const startNetwork = performance.now();
  const result = await fn();
  metrics.networkTime = performance.now() - startNetwork;
  
  // Model processing time is estimated as 80% of network time
  metrics.modelProcessingTime = metrics.networkTime * 0.8;
  
  // Deserialization time is estimated as 10% of network time
  metrics.deserializationTime = metrics.networkTime * 0.1;
  
  metrics.totalTime = performance.now() - startTotal;
  
  return { result, metrics };
}