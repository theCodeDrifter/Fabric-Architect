import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Database } from "lucide-react";
import type { CanvasNodeData } from "@/lib/store";

export function OrdererNode({ data, selected }: NodeProps<CanvasNodeData>) {
  return (
    <div
      className={`
        relative px-4 py-3 bg-cyan-50 dark:bg-cyan-950/30 border-2 
        ${selected ? "border-cyan-600 shadow-lg" : "border-cyan-300 dark:border-cyan-700"} 
        rounded-lg min-w-[120px] transition-all duration-200
      `}
      data-testid={`node-orderer-${data.label}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-white"
        data-testid="handle-target-top"
      />
      <div className="flex flex-col items-center gap-2">
        <div className="p-2 bg-cyan-100 dark:bg-cyan-900/50 rounded-lg">
          <Database className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-cyan-900 dark:text-cyan-100">{data.label}</p>
          <p className="text-xs text-cyan-600 dark:text-cyan-400">{data.description || "Consensus Service"}</p>
        </div>
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-cyan-300 dark:bg-cyan-600" />
          <span className="w-2 h-2 rounded-full bg-cyan-300 dark:bg-cyan-600" />
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-white"
        data-testid="handle-source-bottom"
      />
    </div>
  );
}
