import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ShieldCheck } from "lucide-react";
import type { CanvasNodeData } from "@/lib/store";

export function CANode({ data, selected }: NodeProps<CanvasNodeData>) {
  return (
    <div
      className={`
        relative px-4 py-3 bg-green-50 dark:bg-green-950/30 border-2 
        ${selected ? "border-green-600 shadow-lg" : "border-green-300 dark:border-green-700"} 
        rounded-lg min-w-[120px] transition-all duration-200
      `}
      data-testid={`node-ca-${data.label}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-green-500 !border-2 !border-white"
        data-testid="handle-target-top"
      />
      <div className="flex flex-col items-center gap-2">
        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
          <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-green-900 dark:text-green-100">{data.label}</p>
          <p className="text-xs text-green-600 dark:text-green-400">{data.description || "Certificate Authority"}</p>
        </div>
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-green-300 dark:bg-green-600" />
          <span className="w-2 h-2 rounded-full bg-green-300 dark:bg-green-600" />
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-green-500 !border-2 !border-white"
        data-testid="handle-source-bottom"
      />
    </div>
  );
}
