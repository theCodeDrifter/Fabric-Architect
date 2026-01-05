import { 
  Database, 
  Server, 
  ShieldCheck, 
  Building2, 
  Layers,
  Code2,
  ChevronLeft
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useNetworkStore } from "@/lib/store";

interface DraggableNodeProps {
  type: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
}

function DraggableNode({ type, label, description, icon, bgColor, borderColor }: DraggableNodeProps) {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 ${bgColor} border ${borderColor} rounded-lg cursor-grab hover-elevate active-elevate-2 transition-all duration-200`}
      draggable
      onDragStart={(e) => onDragStart(e, type)}
      data-testid={`draggable-node-${type}`}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
    </div>
  );
}

interface NodeLibraryProps {
  onCollapse?: () => void;
}

export function NodeLibrary({ onCollapse }: NodeLibraryProps) {
  const { 
    networkName, 
    setNetworkName, 
    consensusType, 
    setConsensusType, 
    channelName, 
    setChannelName 
  } = useNetworkStore();

  const networkComponents = [
    {
      type: "orderer",
      label: "Orderer",
      description: "Consensus and ordering service",
      icon: <Database className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />,
      bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
      borderColor: "border-cyan-200 dark:border-cyan-800",
    },
    {
      type: "peer",
      label: "Peer",
      description: "Ledger and chaincode execution",
      icon: <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      type: "ca",
      label: "CA",
      description: "Certificate Authority",
      icon: <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />,
      bgColor: "bg-green-50 dark:bg-green-950/30",
      borderColor: "border-green-200 dark:border-green-800",
    },
    {
      type: "organization",
      label: "Organization",
      description: "Network member identity",
      icon: <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
    {
      type: "channel",
      label: "Channel",
      description: "Private communication channel",
      icon: <Layers className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
      borderColor: "border-amber-200 dark:border-amber-800",
    },
    {
      type: "chaincode",
      label: "Chaincode",
      description: "Smart contract logic",
      icon: <Code2 className="w-5 h-5 text-orange-600 dark:text-orange-400" />,
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
      borderColor: "border-orange-200 dark:border-orange-800",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Node Library</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Network Components
            </h3>
            <div className="space-y-2">
              {networkComponents.map((component) => (
                <DraggableNode key={component.type} {...component} />
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Network Settings
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="network-name" className="text-sm text-foreground">
                  Network Name
                </Label>
                <Input
                  id="network-name"
                  value={networkName}
                  onChange={(e) => setNetworkName(e.target.value)}
                  placeholder="my-fabric-network"
                  className="bg-background"
                  data-testid="input-network-name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="consensus-type" className="text-sm text-foreground">
                  Consensus Type
                </Label>
                <Select value={consensusType} onValueChange={setConsensusType}>
                  <SelectTrigger id="consensus-type" className="bg-background" data-testid="select-consensus-type">
                    <SelectValue placeholder="Select consensus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="etcdraft">Raft (etcdraft)</SelectItem>
                    <SelectItem value="bft">BFT (SmartBFT)</SelectItem>
                    <SelectItem value="solo">Solo (Dev only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="channel-name" className="text-sm text-foreground">
                  Channel Name
                </Label>
                <Input
                  id="channel-name"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="mychannel"
                  className="bg-background"
                  data-testid="input-channel-name"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
