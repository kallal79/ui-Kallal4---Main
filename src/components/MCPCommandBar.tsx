/**
 * MCP Command Bar Component
 */

import React, { useState } from 'react';
import { CommandInput } from './CommandInput';
import { useModelContext } from '../mcp-hooks';

interface MCPCommandBarProps {
  className?: string;
  position?: 'top' | 'bottom';
  showContextInfo?: boolean;
}

export const MCPCommandBar: React.FC<MCPCommandBarProps> = ({
  className = '',
  position = 'bottom',
  showContextInfo = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const context = useModelContext();
  
  // Get summary counts from context
  const clusterCount = context.clusters.length;
  const namespaceCount = context.namespaces.length;
  const workloadCount = context.workloads.length;
  const policyCount = context.bindingPolicies.length;
  
  // Toggle expanded state
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div className={`fixed ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 z-50 ${className}`}>
      <div className="container mx-auto px-4 py-2">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {isExpanded && showContextInfo && (
            <div className="p-3 bg-gray-100 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">KubeStellar Context</h3>
                <button
                  onClick={toggleExpanded}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-2 grid grid-cols-4 gap-4">
                <div className="bg-white p-2 rounded shadow-sm">
                  <div className="text-sm text-gray-500">Clusters</div>
                  <div className="text-xl font-semibold">{clusterCount}</div>
                </div>
                <div className="bg-white p-2 rounded shadow-sm">
                  <div className="text-sm text-gray-500">Namespaces</div>
                  <div className="text-xl font-semibold">{namespaceCount}</div>
                </div>
                <div className="bg-white p-2 rounded shadow-sm">
                  <div className="text-sm text-gray-500">Workloads</div>
                  <div className="text-xl font-semibold">{workloadCount}</div>
                </div>
                <div className="bg-white p-2 rounded shadow-sm">
                  <div className="text-sm text-gray-500">Binding Policies</div>
                  <div className="text-xl font-semibold">{policyCount}</div>
                </div>
              </div>
            </div>
          )}
          
          <div className="p-2">
            <div className="flex items-center">
              {!isExpanded && (
                <button
                  onClick={toggleExpanded}
                  className="mr-2 text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
              
              <CommandInput 
                placeholder="Ask KubeStellar (e.g., 'Show all clusters', 'Create a new deployment')"
                className="flex-grow"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};