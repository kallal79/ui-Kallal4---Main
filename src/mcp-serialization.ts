/**
 * Model Context Protocol - Serialization Utilities
 */

import { ModelContext, CommandRequest, CommandResponse } from './mcp-types';

export interface SerializationOptions {
  maxClusters?: number;
  maxNamespacesPerCluster?: number;
  maxWorkloadsPerNamespace?: number;
  includeResourceDetails?: boolean;
  includeLabelsAndAnnotations?: boolean;
  format?: 'json' | 'msgpack' | 'protobuf';
}

const DEFAULT_OPTIONS: SerializationOptions = {
  maxClusters: 10,
  maxNamespacesPerCluster: 20,
  maxWorkloadsPerNamespace: 50,
  includeResourceDetails: true,
  includeLabelsAndAnnotations: true,
  format: 'json'
};

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
  
  // Remove labels if not requested
  if (!options.includeLabelsAndAnnotations) {
    contextCopy.namespaces.forEach(ns => {
      delete ns.labels;
    });
    
    contextCopy.workloads.forEach(workload => {
      delete workload.labels;
    });
  }
  
  // Serialize based on the requested format
  return JSON.stringify(contextCopy);
}

export function deserializeContext(
  serialized: string, 
  format: 'json' | 'msgpack' | 'protobuf' = 'json'
): ModelContext {
  return JSON.parse(serialized) as ModelContext;
}

export function serializeRequest(
  request: CommandRequest,
  options: SerializationOptions = DEFAULT_OPTIONS
): string {
  const requestCopy = { ...request };
  requestCopy.context = JSON.parse(serializeContext(request.context, options));
  
  return JSON.stringify(requestCopy);
}

export function deserializeRequest(
  serialized: string,
  format: 'json' | 'msgpack' | 'protobuf' = 'json'
): CommandRequest {
  return JSON.parse(serialized) as CommandRequest;
}

export function serializeResponse(response: CommandResponse): string {
  return JSON.stringify(response);
}

export function deserializeResponse(
  serialized: string,
  format: 'json' | 'msgpack' | 'protobuf' = 'json'
): CommandResponse {
  return JSON.parse(serialized) as CommandResponse;
}