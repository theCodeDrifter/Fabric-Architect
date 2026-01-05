import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Code2 } from "lucide-react";
import type { CanvasNodeData } from "@/lib/store";

export function ChaincodeNode({ data, selected }: NodeProps<CanvasNodeData>) {
  return (
    <div
      className={`
        relative px-4 py-3 bg-orange-50 dark:bg-orange-950/30 border-2 
        ${selected ? "border-orange-600 shadow-lg" : "border-orange-300 dark:border-orange-700"} 
        rounded-lg min-w-[120px] transition-all duration-200
      `}
      data-testid={`node-chaincode-${data.label}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-orange-500 !border-2 !border-white"
        data-testid="handle-target-top"
      />
      <div className="flex flex-col items-center gap-2">
        <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
          <Code2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-orange-900 dark:text-orange-100">{data.label}</p>
          <p className="text-xs text-orange-600 dark:text-orange-400">{data.description || "Smart Contract"}</p>
        </div>
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-300 dark:bg-orange-600" />
          <span className="w-2 h-2 rounded-full bg-orange-300 dark:bg-orange-600" />
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-orange-500 !border-2 !border-white"
        data-testid="handle-source-bottom"
      />
    </div>
  );
}
