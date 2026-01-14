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
  rowClassName?: string;
  toggleClassName?: string;
  indentSize?: number;
}

function TreeItem({
  node,
  renderLabel,
  level = 0,
  defaultExpanded = false,
  rowClassName = "gap-1 py-1",
  toggleClassName,
  indentSize = 12,
}: TreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col select-none">
      <div 
        className={`flex items-center ${rowClassName}`}
        style={{ paddingLeft: `${level * indentSize}px` }}
      >
        <div className="flex-1 min-w-0">
          {renderLabel(node)}
        </div>
        {hasChildren && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-0.5 rounded hover:bg-neutral-100 text-neutral-400 transition-colors ${toggleClassName ?? ""}`}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}
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
              rowClassName={rowClassName}
              toggleClassName={toggleClassName}
              indentSize={indentSize}
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
  rowClassName?: string;
  toggleClassName?: string;
  indentSize?: number;
}

export function CollapsibleTree({
  nodes,
  renderLabel,
  defaultExpanded = false,
  className = "",
  rowClassName,
  toggleClassName,
  indentSize,
}: CollapsibleTreeProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      {nodes.map((node) => (
        <TreeItem 
          key={node.id} 
          node={node} 
          renderLabel={renderLabel} 
          defaultExpanded={defaultExpanded}
          rowClassName={rowClassName}
          toggleClassName={toggleClassName}
          indentSize={indentSize}
        />
      ))}
    </div>
  );
}
