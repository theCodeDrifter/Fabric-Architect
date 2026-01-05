import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Server } from "lucide-react";
import type { CanvasNodeData } from "@/lib/store";

export function PeerNode({ data, selected }: NodeProps<CanvasNodeData>) {
  return (
    <div
      className={`
        relative px-4 py-3 bg-blue-50 dark:bg-blue-950/30 border-2 
        ${selected ? "border-blue-600 shadow-lg" : "border-blue-300 dark:border-blue-700"} 
        rounded-lg min-w-[120px] transition-all duration-200
      `}
      data-testid={`node-peer-${data.label}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
        data-testid="handle-target-top"
      />
      <div className="flex flex-col items-center gap-2">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
          <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">{data.label}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400">{data.description || "Peer Node"}</p>
        </div>
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-300 dark:bg-blue-600" />
          <span className="w-2 h-2 rounded-full bg-blue-300 dark:bg-blue-600" />
          <span className="w-2 h-2 rounded-full bg-blue-300 dark:bg-blue-600" />
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
        data-testid="handle-source-bottom"
      />
    </div>
  );
}
