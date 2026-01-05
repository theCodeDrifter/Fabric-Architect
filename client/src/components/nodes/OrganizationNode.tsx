import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Building2 } from "lucide-react";
import type { CanvasNodeData } from "@/lib/store";

export function OrganizationNode({ data, selected }: NodeProps<CanvasNodeData>) {
  return (
    <div
      className={`
        relative px-4 py-3 bg-purple-50 dark:bg-purple-950/30 border-2 
        ${selected ? "border-purple-600 shadow-lg" : "border-purple-300 dark:border-purple-700"} 
        rounded-lg min-w-[120px] transition-all duration-200
      `}
      data-testid={`node-organization-${data.label}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white"
        data-testid="handle-target-top"
      />
      <div className="flex flex-col items-center gap-2">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
          <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-purple-900 dark:text-purple-100">{data.label}</p>
          <p className="text-xs text-purple-600 dark:text-purple-400">{data.description || "Organization"}</p>
        </div>
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-purple-300 dark:bg-purple-600" />
          <span className="w-2 h-2 rounded-full bg-purple-300 dark:bg-purple-600" />
          <span className="w-2 h-2 rounded-full bg-purple-300 dark:bg-purple-600" />
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white"
        data-testid="handle-source-bottom"
      />
    </div>
  );
}
