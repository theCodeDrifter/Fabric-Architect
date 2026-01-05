import { useCallback, useRef, useState, useMemo } from "react";
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  type NodeChange,
  type EdgeChange,
  ConnectionMode,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { nodeTypes } from "@/components/nodes";
import { useNetworkStore, type CanvasNodeData } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

interface NetworkCanvasProps {
  className?: string;
}

export function NetworkCanvas({ className = "" }: NetworkCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const { 
    nodes: storeNodes, 
    edges: storeEdges, 
    setNodes: setStoreNodes, 
    setEdges: setStoreEdges,
    isValidConnection,
    addNode,
  } = useNetworkStore();
  
  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Counter for generating unique node labels
  const nodeCounterRef = useRef<Record<string, number>>({
    organization: 1,
    peer: 0,
    orderer: 1,
    ca: 1,
    channel: 1,
    chaincode: 1,
  });

  // Sync local state with store
  const handleNodesChange = useCallback((changes: NodeChange<Node<CanvasNodeData>>[]) => {
    onNodesChange(changes);
  }, [onNodesChange]);

  const handleEdgesChange = useCallback((changes: EdgeChange<Edge>[]) => {
    onEdgesChange(changes);
  }, [onEdgesChange]);

  // Update store when local state changes
  const syncToStore = useCallback(() => {
    setStoreNodes(nodes);
    setStoreEdges(edges);
  }, [nodes, edges, setStoreNodes, setStoreEdges]);

  // Validate connections before adding
  const onConnect = useCallback(
    (params: Connection) => {
      if (!isValidConnection(params)) {
        toast({
          title: "Invalid Connection",
          description: "Peers can only connect to Organizations. Check your topology rules.",
          variant: "destructive",
        });
        return;
      }
      
      const newEdge: Edge = {
        ...params,
        id: `edge-${params.source}-${params.target}`,
        type: "smoothstep",
        animated: false,
        style: { stroke: "#94a3b8", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#94a3b8",
        },
      } as Edge;
      
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [isValidConnection, setEdges, toast]
  );

  // Handle drop from sidebar
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Generate label based on node type
      const labelMap: Record<string, string> = {
        organization: `Org${nodeCounterRef.current.organization++}`,
        peer: `Peer${nodeCounterRef.current.peer++}`,
        orderer: "Orderer",
        ca: "CA",
        channel: "Channel",
        chaincode: "Chaincode",
      };

      const descriptionMap: Record<string, string> = {
        organization: "Organization",
        peer: `Org${Math.max(1, nodeCounterRef.current.organization - 1)} Peer`,
        orderer: "Consensus Service",
        ca: "Certificate Authority",
        channel: "Private Channel",
        chaincode: "Smart Contract",
      };

      const newNode: Node<CanvasNodeData> = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: {
          label: labelMap[type] || type,
          description: descriptionMap[type] || "",
          type,
        },
      };

      setNodes((nds) => [...nds, newNode]);
      addNode(newNode);
    },
    [reactFlowInstance, setNodes, addNode]
  );

  // Custom minimap node colors
  const minimapNodeColor = useCallback((node: Node) => {
    const colorMap: Record<string, string> = {
      organization: "#a855f7",
      peer: "#3b82f6",
      orderer: "#06b6d4",
      ca: "#22c55e",
      channel: "#f59e0b",
      chaincode: "#f97316",
    };
    return colorMap[node.type || ""] || "#94a3b8";
  }, []);

  // Default edge options for SmoothStep
  const defaultEdgeOptions = useMemo(() => ({
    type: "smoothstep",
    style: { stroke: "#94a3b8", strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#94a3b8",
    },
  }), []);

  return (
    <div 
      ref={reactFlowWrapper} 
      className={`flex-1 h-full ${className}`}
      data-testid="network-canvas"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionMode={ConnectionMode.Loose}
        fitView
        proOptions={{ hideAttribution: true }}
        className="bg-background"
      >
        <Controls 
          className="bg-card border border-border rounded-lg shadow-sm"
          showZoom
          showFitView
          showInteractive={false}
        />
        <MiniMap
          nodeColor={minimapNodeColor}
          maskColor="rgba(0, 0, 0, 0.1)"
          className="bg-card border border-border rounded-lg shadow-sm"
          pannable
          zoomable
        />
        <Background
          variant={BackgroundVariant.Dots}
          gap={16}
          size={1}
          color="hsl(var(--muted-foreground) / 0.2)"
        />
      </ReactFlow>
    </div>
  );
}
