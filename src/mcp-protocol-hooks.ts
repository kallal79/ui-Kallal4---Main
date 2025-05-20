/**
 * Model Context Protocol - React Hooks
 * 
 * This file provides React hooks for integrating the Model Context Protocol
 * with the KubeStellar UI components.
 */

import { useEffect, useState, useCallback, useContext, createContext } from 'react';
import { ModelContextProtocolService } from './mcp-protocol-service';
import { ContextManager, ContextUpdateEvent, ContextUpdateType } from './mcp-protocol-context-manager';
import { ModelContext, CommandResponse, ModelProviderConfig, CommandAction } from './mcp-protocol-types';
import { createProviderAdapter } from './mcp-protocol-providers';

// Create a context for the MCP service
const MCPServiceContext = createContext<ModelContextProtocolService | null>(null);

// Create a context for the Context Manager
const ContextManagerContext = createContext<ContextManager | null>(null);

/**
 * Provider component for the MCP service
 */
export function MCPServiceProvider({ 
  children, 
  config 
}: { 
  children: React.ReactNode, 
  config: ModelProviderConfig 
}) {
  const [service] = useState(() => new ModelContextProtocolService(config));
  
  return (
    <MCPServiceContext.Provider value={service}>
      {children}
    </MCPServiceContext.Provider>
  );
}

/**
 * Provider component for the Context Manager
 */
export function ContextManagerProvider({ 
  children, 
  userId,
  initialContext
}: { 
  children: React.ReactNode, 
  userId: string,
  initialContext?: ModelContext
}) {
  const [manager] = useState(() => new ContextManager(userId, initialContext));
  
  return (
    <ContextManagerContext.Provider value={manager}>
      {children}
    </ContextManagerContext.Provider>
  );
}

/**
 * Hook to access the MCP service
 */
export function useMCPService() {
  const service = useContext(MCPServiceContext);
  
  if (!service) {
    throw new Error('useMCPService must be used within an MCPServiceProvider');
  }
  
  return service;
}

/**
 * Hook to access the Context Manager
 */
export function useContextManager() {
  const manager = useContext(ContextManagerContext);
  
  if (!manager) {
    throw new Error('useContextManager must be used within a ContextManagerProvider');
  }
  
  return manager;
}

/**
 * Hook to access and update the current context
 */
export function useModelContext() {
  const manager = useContextManager();
  const [context, setContext] = useState<ModelContext>(manager.getContext());
  
  useEffect(() => {
    // Update the local state when the context changes
    const removeListener = manager.addListener((event) => {
      setContext(manager.getContext());
    });
    
    return removeListener;
  }, [manager]);
  
  return context;
}

/**
 * Hook to process natural language commands
 */
export function useCommandProcessor() {
  const service = useMCPService();
  const manager = useContextManager();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<CommandResponse | null>(null);
  
  const processCommand = useCallback(async (command: string) => {
    setIsProcessing(true);
    try {
      // Get the current context from the manager
      const context = manager.getContext();
      
      // Process the command
      const response = await service.processCommand(command, context.metadata.userId);
      
      setLastResponse(response);
      return response;
    } catch (error) {
      console.error('Error processing command:', error);
      const errorResponse: CommandResponse = {
        actions: [],
        explanation: `Error processing command: ${error.message}`,
        status: 'error'
      };
      setLastResponse(errorResponse);
      return errorResponse;
    } finally {
      setIsProcessing(false);
    }
  }, [service, manager]);
  
  const executeActions = useCallback(async (actions: CommandAction[]) => {
    setIsProcessing(true);
    try {
      return await service.executeActions(actions);
    } catch (error) {
      console.error('Error executing actions:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [service]);
  
  return {
    processCommand,
    executeActions,
    isProcessing,
    lastResponse
  };
}

/**
 * Hook to listen for specific context update events
 */
export function useContextUpdateListener(
  type: ContextUpdateType | ContextUpdateType[],
  callback: (event: ContextUpdateEvent) => void
) {
  const manager = useContextManager();
  
  useEffect(() => {
    const types = Array.isArray(type) ? type : [type];
    
    const listener = (event: ContextUpdateEvent) => {
      if (types.includes(event.type)) {
        callback(event);
      }
    };
    
    return manager.addListener(listener);
  }, [manager, type, callback]);
}

/**
 * Hook to access cluster data from the context
 */
export function useClusters() {
  const context = useModelContext();
  return context.clusters;
}

/**
 * Hook to access namespace data from the context
 */
export function useNamespaces(clusterId?: string) {
  const context = useModelContext();
  
  if (clusterId) {
    return context.namespaces.filter(ns => ns.clusterId === clusterId);
  }
  
  return context.namespaces;
}

/**
 * Hook to access workload data from the context
 */
export function useWorkloads(clusterId?: string, namespace?: string) {
  const context = useModelContext();
  
  if (clusterId && namespace) {
    return context.workloads.filter(
      w => w.clusterId === clusterId && w.namespace === namespace
    );
  } else if (clusterId) {
    return context.workloads.filter(w => w.clusterId === clusterId);
  } else if (namespace) {
    return context.workloads.filter(w => w.namespace === namespace);
  }
  
  return context.workloads;
}

/**
 * Hook to access binding policy data from the context
 */
export function useBindingPolicies() {
  const context = useModelContext();
  return context.bindingPolicies;
}