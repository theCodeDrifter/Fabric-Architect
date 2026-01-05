import { useState } from "react";
import { ReactFlowProvider, useReactFlow } from "@xyflow/react";
import { useLocation } from "wouter";
import { NodeLibrary } from "@/components/NodeLibrary";
import { NetworkCanvas } from "@/components/NetworkCanvas";
import { CanvasHeader } from "@/components/CanvasHeader";
import { ExportDialog } from "@/components/ExportDialog";
import { useNetworkStore } from "@/lib/store";
import type { Deployment } from "@shared/schema";

function CanvasContent() {
  const [showLibrary, setShowLibrary] = useState(true);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [, navigate] = useLocation();
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  
  const { networkName, nodes, peers, orderers, cas, addDeployment } = useNetworkStore();

  const handleDeploy = () => {
    const peerCount = nodes.filter(n => n.data?.type === "peer").length || peers.length;
    const ordererCount = nodes.filter(n => n.data?.type === "orderer").length || orderers.length;
    const caCount = nodes.filter(n => n.data?.type === "ca").length || cas.length;
    const totalNodes = peerCount + ordererCount + caCount;
    
    const deployment: Deployment = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      networkId: `network-${Date.now()}`,
      networkName: networkName,
      status: "deploying",
      totalNodes,
      peerCount,
      ordererCount,
      caCount,
      progress: 0,
      createdAt: new Date().toISOString(),
    };
    
    addDeployment(deployment);
    navigate("/deployments");
  };

  return (
    <div className="flex flex-col h-full">
      <CanvasHeader 
        onExportConfig={() => setShowExportDialog(true)}
        onDeploy={handleDeploy}
        onZoomIn={() => zoomIn()}
        onZoomOut={() => zoomOut()}
        onFitView={() => fitView()}
      />
      <div className="flex flex-1 overflow-hidden">
        {showLibrary && (
          <div className="w-72 flex-shrink-0">
            <NodeLibrary onCollapse={() => setShowLibrary(false)} />
          </div>
        )}
        <NetworkCanvas className={showLibrary ? "" : "w-full"} />
      </div>
      <ExportDialog 
        open={showExportDialog} 
        onOpenChange={setShowExportDialog} 
      />
    </div>
  );
}

export default function NetworkCanvasPage() {
  return (
    <ReactFlowProvider>
      <CanvasContent />
    </ReactFlowProvider>
  );
}
