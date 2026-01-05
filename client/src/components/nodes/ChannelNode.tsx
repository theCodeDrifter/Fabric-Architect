import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Layers } from "lucide-react";
import type { CanvasNodeData } from "@/lib/store";

export function ChannelNode({ data, selected }: NodeProps<CanvasNodeData>) {
  return (
    <div
      className={`
        relative px-4 py-3 bg-amber-50 dark:bg-amber-950/30 border-2 
        ${selected ? "border-amber-600 shadow-lg" : "border-amber-300 dark:border-amber-700"} 
        rounded-lg min-w-[120px] transition-all duration-200
      `}
      data-testid={`node-channel-${data.label}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white"
        data-testid="handle-target-top"
      />
      <div className="flex flex-col items-center gap-2">
        <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
          <Layers className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-100">{data.label}</p>
          <p className="text-xs text-amber-600 dark:text-amber-400">{data.description || "Channel"}</p>
        </div>
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-300 dark:bg-amber-600" />
          <span className="w-2 h-2 rounded-full bg-amber-300 dark:bg-amber-600" />
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white"
        data-testid="handle-source-bottom"
      />
    </div>
  );
}
