/**
 * Model Context Protocol for KubeStellar MCP Server
 * 
 * This module exports the core components of the Model Context Protocol,
 * which establishes a standardized communication framework between
 * KubeStellar's internal components and AI models.
 */

// Export types
export * from './mcp-types';

// Export core services
export * from './mcp-service';

// Export context management
export * from './mcp-context';

// Export provider adapters
export * from './mcp-providers';

// Export serialization utilities
export * from './mcp-serialization';

// Export React hooks
export * from './mcp-hooks';

// Export integration utilities
export * from './mcp-integration';

// Export performance optimizations
export * from './mcp-performance';