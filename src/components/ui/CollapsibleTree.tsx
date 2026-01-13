"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

export interface TreeNode {
  id: string | number;
  label: string;
  children?: TreeNode[];
  data?: unknown;
  path?: string | null;
}

interface TreeItemProps {
  node: TreeNode;
  renderLabel: (node: TreeNode) => React.ReactNode;
  level?: number;
  defaultExpanded?: boolean;
}

function TreeItem({ node, renderLabel, level = 0, defaultExpanded = false }: TreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col select-none">
      <div 
        className="flex items-center gap-1 py-1"
        style={{ paddingLeft: `${level * 12}px` }}
      >
        <button
          type="button"
          onClick={() => hasChildren && setIsExpanded(!isExpanded)}
          className={`p-1 rounded hover:bg-neutral-100 text-neutral-400 transition-colors ${!hasChildren ? 'opacity-0 cursor-default' : ''}`}
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        
        <div className="flex-1 min-w-0">
          {renderLabel(node)}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="flex flex-col">
          {node.children!.map((child) => (
            <TreeItem 
              key={child.id} 
              node={child} 
              renderLabel={renderLabel} 
              level={level + 1} 
              defaultExpanded={defaultExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CollapsibleTreeProps {
  nodes: TreeNode[];
  renderLabel: (node: TreeNode) => React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

export function CollapsibleTree({ nodes, renderLabel, defaultExpanded = false, className = "" }: CollapsibleTreeProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      {nodes.map((node) => (
        <TreeItem 
          key={node.id} 
          node={node} 
          renderLabel={renderLabel} 
          defaultExpanded={defaultExpanded}
        />
      ))}
    </div>
  );
}
