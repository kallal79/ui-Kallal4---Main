/**
 * MCP Context Provider Component
 */

import React from 'react';
import { MCPServiceProvider, ContextManagerProvider } from '../mcp-hooks';
import { ModelProviderConfig } from '../mcp-types';

interface MCPContextProviderProps {
  children: React.ReactNode;
  userId: string;
  modelConfig: ModelProviderConfig;
}

export const MCPContextProvider: React.FC<MCPContextProviderProps> = ({
  children,
  userId,
  modelConfig
}) => {
  return (
    <MCPServiceProvider config={modelConfig}>
      <ContextManagerProvider userId={userId}>
        {children}
      </ContextManagerProvider>
    </MCPServiceProvider>
  );
};

/**
 * Default model configurations
 */
export const defaultOpenAIConfig: ModelProviderConfig = {
  provider: 'openai',
  modelName: 'gpt-4',
  contextWindowSize: 8192,
  maxTokens: 1024,
  temperature: 0.7
};

export const defaultAWSConfig: ModelProviderConfig = {
  provider: 'aws',
  modelName: 'anthropic.claude-v2',
  contextWindowSize: 100000,
  maxTokens: 2048,
  temperature: 0.5
};