/**
 * Model Context Protocol - React Hooks
 */

import { useEffect, useState, useCallback, useContext, createContext } from 'react';
import { ModelContextProtocolService } from './mcp-service';
import { ContextManager, ContextUpdateEvent, ContextUpdateType } from './mcp-context';
import { ModelContext, CommandResponse, ModelProviderConfig, CommandAction } from './mcp-types';
import { createProviderAdapter } from './mcp-providers';

// Create contexts
const MCPServiceContext = createContext<ModelContextProtocolService | null>(null);
const ContextManagerContext = createContext<ContextManager | null>(null);

// Provider components
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

// Hooks
export function useMCPService() {
  const service = useContext(MCPServiceContext);
  
  if (!service) {
    throw new Error('useMCPService must be used within an MCPServiceProvider');
  }
  
  return service;
}

export function useContextManager() {
  const manager = useContext(ContextManagerContext);
  
  if (!manager) {
    throw new Error('useContextManager must be used within a ContextManagerProvider');
  }
  
  return manager;
}

export function useModelContext() {
  const manager = useContextManager();
  const [context, setContext] = useState<ModelContext>(manager.getContext());
  
  useEffect(() => {
    const removeListener = manager.addListener(() => {
      setContext(manager.getContext());
    });
    
    return removeListener;
  }, [manager]);
  
  return context;
}

export function useCommandProcessor() {
  const service = useMCPService();
  const manager = useContextManager();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<CommandResponse | null>(null);
  
  const processCommand = useCallback(async (command: string) => {
    setIsProcessing(true);
    try {
      const context = manager.getContext();
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