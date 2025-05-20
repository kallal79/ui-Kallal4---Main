/**
 * Command Input Component for the Model Context Protocol
 */

import React, { useState, useRef } from 'react';
import { useCommandProcessor } from '../mcp-hooks';
import { CommandAction } from '../mcp-types';

interface CommandInputProps {
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export const CommandInput: React.FC<CommandInputProps> = ({
  placeholder = "Enter a command (e.g., 'Show all clusters')",
  autoFocus = false,
  className = ''
}) => {
  const [command, setCommand] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { processCommand, executeActions, isProcessing, lastResponse } = useCommandProcessor();
  
  // Handle command submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!command.trim() || isProcessing) {
      return;
    }
    
    setIsExpanded(true);
    const response = await processCommand(command);
    
    if (response.actions && response.actions.length > 0) {
      setShowActions(true);
    }
  };
  
  // Handle executing actions
  const handleExecuteActions = async () => {
    if (!lastResponse || !lastResponse.actions || lastResponse.actions.length === 0) {
      return;
    }
    
    try {
      await executeActions(lastResponse.actions);
      setCommand('');
      setShowActions(false);
      setIsExpanded(false);
    } catch (error) {
      console.error('Error executing actions:', error);
    }
  };
  
  // Handle canceling actions
  const handleCancel = () => {
    setShowActions(false);
    setIsExpanded(false);
  };
  
  // Render action items
  const renderActionItems = (actions: CommandAction[]) => {
    return actions.map((action, index) => (
      <div key={index} className="p-2 border-b border-gray-200 last:border-b-0">
        <div className="font-medium">{action.type} {action.resource.kind}</div>
        <div className="text-sm text-gray-600">
          {action.resource.name && <span>Name: {action.resource.name}</span>}
          {action.resource.namespace && <span className="ml-2">Namespace: {action.resource.namespace}</span>}
          {action.resource.clusterId && <span className="ml-2">Cluster: {action.resource.clusterId}</span>}
        </div>
      </div>
    ));
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-lg ${className} ${isExpanded ? 'p-4' : 'p-2'}`}>
      <form onSubmit={handleSubmit} className="flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder={placeholder}
          disabled={isProcessing}
          className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isProcessing || !command.trim()}
          className={`px-4 py-2 rounded-r-lg text-white ${
            isProcessing || !command.trim() 
              ? 'bg-gray-400' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isProcessing ? 'Processing...' : 'Send'}
        </button>
      </form>
      
      {isExpanded && lastResponse && (
        <div className="mt-4">
          <div className="p-3 bg-gray-100 rounded-lg">
            <p className="font-medium">Response:</p>
            <p className="mt-1">{lastResponse.explanation}</p>
          </div>
          
          {showActions && lastResponse.actions && lastResponse.actions.length > 0 && (
            <div className="mt-4">
              <p className="font-medium mb-2">Actions to perform:</p>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {renderActionItems(lastResponse.actions)}
              </div>
              
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteActions}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Execute Actions
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};