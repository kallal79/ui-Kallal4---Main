/**
 * Model Context Protocol - Serialization Utilities
 * 
 * This file provides utilities for efficiently serializing and deserializing
 * KubeStellar state information for transmission to and from AI models.
 */

import { ModelContext, CommandRequest, CommandResponse } from './mcp-protocol-types';

/**
 * Serialization options for controlling the size and content of serialized context
 */
export interface SerializationOptions {
  /**
   * Maximum number of clusters to include in the context
   */
  maxClusters?: number;
  
  /**
   * Maximum number of namespaces per cluster to include
   */
  maxNamespacesPerCluster?: number;
  
  /**
   * Maximum number of workloads per namespace to include
   */
  maxWorkloadsPerNamespace?: number;
  
  /**
   * Whether to include detailed resource information
   */
  includeResourceDetails?: boolean;
  
  /**
   * Whether to include all labels and annotations
   */
  includeLabelsAndAnnotations?: boolean;
  
  /**
   * Format for serialization (json is default)
   */
  format?: 'json' | 'msgpack' | 'protobuf';
}

/**
 * Default serialization options
 */
const DEFAULT_OPTIONS: SerializationOptions = {
  maxClusters: 10,
  maxNamespacesPerCluster: 20,
  maxWorkloadsPerNamespace: 50,
  includeResourceDetails: true,
  includeLabelsAndAnnotations: true,
  format: 'json'
};

/**
 * Serializes a ModelContext object for transmission to AI models
 * @param context The context to serialize
 * @param options Serialization options
 * @returns Serialized context as a string
 */
export function serializeContext(
  context: ModelContext, 
  options: SerializationOptions = DEFAULT_OPTIONS
): string {
  // Create a copy of the context to avoid modifying the original
  const contextCopy = JSON.parse(JSON.stringify(context));
  
  // Apply limits based on options
  if (options.maxClusters && contextCopy.clusters.length > options.maxClusters) {
    contextCopy.clusters = contextCopy.clusters.slice(0, options.maxClusters);
  }
  
  // Filter out unnecessary details if not requested
  if (!options.includeResourceDetails) {
    contextCopy.clusters.forEach(cluster => {
      delete cluster.resources;
    });
  }
  
  // Remove labels and annotations if not requested
  if (!options.includeLabelsAndAnnotations) {
    contextCopy.namespaces.forEach(ns => {
      delete ns.labels;
      delete ns.annotations;
    });
    
    contextCopy.workloads.forEach(workload => {
      delete workload.labels;
      delete workload.annotations;
    });
  }
  
  // Serialize based on the requested format
  switch (options.format) {
    case 'json':
    default:
      return JSON.stringify(contextCopy);
  }
}

/**
 * Deserializes a context string back into a ModelContext object
 * @param serialized The serialized context string
 * @param format The format of the serialized string
 * @returns Deserialized ModelContext object
 */
export function deserializeContext(
  serialized: string, 
  format: 'json' | 'msgpack' | 'protobuf' = 'json'
): ModelContext {
  switch (format) {
    case 'json':
    default:
      return JSON.parse(serialized) as ModelContext;
  }
}

/**
 * Serializes a CommandRequest for transmission to AI models
 * @param request The request to serialize
 * @param options Serialization options
 * @returns Serialized request as a string
 */
export function serializeRequest(
  request: CommandRequest,
  options: SerializationOptions = DEFAULT_OPTIONS
): string {
  const requestCopy = { ...request };
  requestCopy.context = JSON.parse(serializeContext(request.context, options));
  
  return JSON.stringify(requestCopy);
}

/**
 * Deserializes a request string back into a CommandRequest object
 * @param serialized The serialized request string
 * @param format The format of the serialized string
 * @returns Deserialized CommandRequest object
 */
export function deserializeRequest(
  serialized: string,
  format: 'json' | 'msgpack' | 'protobuf' = 'json'
): CommandRequest {
  switch (format) {
    case 'json':
    default:
      return JSON.parse(serialized) as CommandRequest;
  }
}

/**
 * Serializes a CommandResponse for transmission from AI models
 * @param response The response to serialize
 * @returns Serialized response as a string
 */
export function serializeResponse(response: CommandResponse): string {
  return JSON.stringify(response);
}

/**
 * Deserializes a response string back into a CommandResponse object
 * @param serialized The serialized response string
 * @param format The format of the serialized string
 * @returns Deserialized CommandResponse object
 */
export function deserializeResponse(
  serialized: string,
  format: 'json' | 'msgpack' | 'protobuf' = 'json'
): CommandResponse {
  switch (format) {
    case 'json':
    default:
      return JSON.parse(serialized) as CommandResponse;
  }
}