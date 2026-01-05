import { 
  RefreshCw, 
  Plus, 
  Eye, 
  Settings, 
  Trash2,
  Server,
  Database,
  ShieldCheck,
  Play,
  Cloud,
  HardDrive,
  Cpu,
  CheckCircle2,
  Circle,
  Clock,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Terminal,
  Code2,
  FileCode,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useNetworkStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { DeploymentStatus, Deployment } from "@shared/schema";

function calculateUptime(createdAt: string): string {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

interface DeploymentCard {
  id: string;
  name: string;
  status: DeploymentStatus;
  createdAt: string;
  totalNodes: number;
  peerCount: number;
  ordererCount: number;
  caCount: number;
  uptime?: string;
  progress?: number;
  lastActive?: string;
  infraType?: string;
  osType?: string;
  consensusType?: string;
  channelName?: string;
  orgCount?: number;
}

const DEPLOYMENT_STEPS = [
  { 
    id: 1, 
    title: "Infrastructure Preparation", 
    description: "Set up the environment and dependencies for your network nodes.",
    details: (config: any) => (
      <div className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">System Requirements</h4>
          <ul className="text-xs space-y-1 list-disc pl-4 text-muted-foreground">
            <li>Docker v20.10.0+ and Docker Compose v2.0.0+</li>
            <li>Go v1.20+ (for chaincode development)</li>
            <li>Node.js v18+ (for client applications)</li>
          </ul>
        </div>
        <div className="bg-slate-950 p-3 rounded-md font-mono text-xs text-slate-50 overflow-x-auto">
          <p className="text-slate-500 mb-2"># Install prerequisites on Ubuntu</p>
          <p>sudo apt-get update && sudo apt-get install -y git curl jq build-essential</p>
          <p className="text-slate-500 my-2"># Install Fabric binaries and Docker images</p>
          <p>curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.5.4 1.5.7</p>
        </div>
      </div>
    )
  },
  { 
    id: 2, 
    title: "Organization Certificate Authorities", 
    description: "Deploy and configure CAs for each organization in the network.",
    details: (config: any) => (
      <div className="space-y-4">
        <p className="text-sm">Each organization requires its own Certificate Authority to manage its own identities and certificates.</p>
        <div className="bg-slate-950 p-3 rounded-md font-mono text-xs text-slate-50 overflow-x-auto">
          <p className="text-slate-500 mb-2"># Register organization admin with CA</p>
          <p>fabric-ca-client register --id.name admin --id.secret adminpw --id.type admin -u https://localhost:7054</p>
          <p className="text-slate-500 my-2"># Enroll organization admin</p>
          <p>fabric-ca-client enroll -u https://admin:adminpw@localhost:7054 --caname ca-org1 -M ./organizations/peerOrganizations/org1.example.com/msp</p>
        </div>
      </div>
    )
  },
  { 
    id: 3, 
    title: "MSP & Crypto Material Generation", 
    description: "Generate the Membership Service Provider structure and certificates.",
    details: () => (
      <div className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Deployment Note</h4>
          <p className="text-xs text-muted-foreground">Ensure the MSP folder structure matches the Hyperledger Fabric expected format for identity recognition.</p>
        </div>
        <div className="bg-slate-950 p-3 rounded-md font-mono text-xs text-slate-50 overflow-x-auto">
          <p className="text-slate-500 mb-2"># Example MSP structure</p>
          <p>msp/</p>
          <p>  admincerts/  # Admin certificates</p>
          <p>  cacerts/      # Root CA certificates</p>
          <p>  keystore/     # Private keys</p>
          <p>  signcerts/    # Node certificates</p>
          <p>  tlscacerts/   # TLS CA certificates</p>
        </div>
      </div>
    )
  },
  { 
    id: 4, 
    title: "Ordering Service Deployment", 
    description: "Initialize and start the ordering nodes for consensus.",
    details: (config: any) => (
      <div className="space-y-4">
        <p className="text-sm">The ordering service establishes consensus and creates blocks of transactions.</p>
        <div className="bg-slate-950 p-3 rounded-md font-mono text-xs text-slate-50 overflow-x-auto">
          <p className="text-slate-500 mb-2"># Orderer genesis block configuration (configtx.yaml snippet)</p>
          <p>Orderer: &OrdererDefaults</p>
          <p>    OrdererType: {config.consensusType || 'etcdraft'}</p>
          <p>    Addresses:</p>
          <p>        - orderer.example.com:7050</p>
        </div>
      </div>
    )
  },
  { 
    id: 5, 
    title: "Peer Node Deployment", 
    description: "Launch peer nodes and connect them to their organization's MSP.",
    details: () => (
      <div className="space-y-4">
        <p className="text-sm">Peers host the ledger and chaincode containers. Each peer must be associated with an organization.</p>
        <div className="bg-slate-950 p-3 rounded-md font-mono text-xs text-slate-50 overflow-x-auto">
          <p className="text-slate-500 mb-2"># Environment variables for Peer</p>
          <p>CORE_PEER_ID=peer0.org1.example.com</p>
          <p>CORE_PEER_ADDRESS=peer0.org1.example.com:7051</p>
          <p>CORE_PEER_LOCALMSPID=Org1MSP</p>
          <p>CORE_PEER_MSPCONFIGPATH=/organizations/peerOrganizations/org1.example.com/msp</p>
        </div>
      </div>
    )
  },
  { 
    id: 6, 
    title: "Channel Management", 
    description: "Create the channel genesis block and join peers to the channel.",
    details: (config: any) => (
      <div className="space-y-4">
        <div className="bg-slate-950 p-3 rounded-md font-mono text-xs text-slate-50 overflow-x-auto">
          <p className="text-slate-500 mb-2"># Join a peer to the channel</p>
          <p>export CORE_PEER_ADDRESS=localhost:7051</p>
          <p>peer channel join -b ./{config.channelName || 'mychannel'}.block</p>
          <p className="text-slate-500 my-2"># List joined channels</p>
          <p>peer channel list</p>
        </div>
      </div>
    )
  },
  { 
    id: 7, 
    title: "Chaincode Lifecycle", 
    description: "Package, install, approve, and commit smart contracts on the channel.",
    details: () => (
      <div className="space-y-4">
        <div className="bg-slate-950 p-3 rounded-md font-mono text-xs text-slate-50 overflow-x-auto">
          <p className="text-slate-500 mb-2"># Approve chaincode for organization</p>
          <p>peer lifecycle chaincode approveformyorg -o orderer.example.com:7050 --channelID mychannel --name basic --version 1.0 --package-id $PACKAGE_ID --sequence 1</p>
          <p className="text-slate-500 my-2"># Check commit readiness</p>
          <p>peer lifecycle chaincode checkcommitreadiness --channelID mychannel --name basic --version 1.0 --sequence 1 --output json</p>
        </div>
      </div>
    )
  },
];

function DeploymentConfigureModal({ 
  deployment, 
  open, 
  onOpenChange 
}: { 
  deployment: DeploymentCard | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const updateDeployment = useNetworkStore((state) => state.updateDeployment);
  const { toast } = useToast();
  const [infraType, setInfraType] = useState("cloud");
  const [provider, setProvider] = useState("aws");
  const [region, setRegion] = useState("us-east-1");
  const [instanceType, setInstanceType] = useState("t3.medium");
  const [clusterEnabled, setClusterEnabled] = useState(false);
  const [nodeCount, setNodeCount] = useState("3");
  const [osType, setOsType] = useState("ubuntu-22.04");

  const handleSave = () => {
    if (!deployment) return;
    updateDeployment(deployment.id, { 
      status: "deploying",
      progress: 10
    });
    toast({
      title: "Configuration Saved",
      description: "Advanced infrastructure details have been updated.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Infrastructure Configuration</DialogTitle>
          <DialogDescription>
            Configure environment for {deployment?.name} according to Hyperledger Fabric deployment standards.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label>Environment Type</Label>
            <Tabs value={infraType} onValueChange={setInfraType} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="cloud">Cloud Provider</TabsTrigger>
                <TabsTrigger value="local">Local / On-Premise</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {infraType === "cloud" ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="provider">Cloud Provider</Label>
                  <Select value={provider} onValueChange={setProvider}>
                    <SelectTrigger id="provider">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aws">Amazon Web Services (AWS)</SelectItem>
                      <SelectItem value="azure">Microsoft Azure</SelectItem>
                      <SelectItem value="gcp">Google Cloud Platform (GCP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="region">Region / Zone</Label>
                  <Input id="region" value={region} onChange={(e) => setRegion(e.target.value)} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="instance">Instance Architecture</Label>
                <Select value={instanceType} onValueChange={setInstanceType}>
                  <SelectTrigger id="instance">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="t3.small">Standard (2 vCPU, 2GB RAM)</SelectItem>
                    <SelectItem value="t3.medium">Performance (2 vCPU, 4GB RAM)</SelectItem>
                    <SelectItem value="t3.large">High Memory (2 vCPU, 8GB RAM)</SelectItem>
                    <SelectItem value="c5.large">Compute Optimized (2 vCPU, 4GB RAM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div className="grid gap-2">
                <Label htmlFor="os">Operating System</Label>
                <Select value={osType} onValueChange={setOsType}>
                  <SelectTrigger id="os">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ubuntu-22.04">Ubuntu 22.04 LTS</SelectItem>
                    <SelectItem value="ubuntu-20.04">Ubuntu 20.04 LTS</SelectItem>
                    <SelectItem value="debian-11">Debian 11</SelectItem>
                    <SelectItem value="rhel-8">RHEL 8</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="access">Connection Method</Label>
                <Select defaultValue="ssh">
                  <SelectTrigger id="access">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ssh">SSH (Public Key Authentication)</SelectItem>
                    <SelectItem value="local">Local Socket (Dev Mode)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>High Availability Cluster</Label>
                <p className="text-sm text-muted-foreground">Enable K8s/Raft distribution</p>
              </div>
              <Button 
                variant={clusterEnabled ? "default" : "outline"} 
                size="sm"
                onClick={() => setClusterEnabled(!clusterEnabled)}
              >
                {clusterEnabled ? "Enabled" : "Disabled"}
              </Button>
            </div>

            {clusterEnabled && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nodes">Cluster Node Count</Label>
                  <Input 
                    id="nodes" 
                    type="number" 
                    value={nodeCount} 
                    onChange={(e) => setNodeCount(e.target.value)} 
                    min="3"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="orchestrator">Orchestrator</Label>
                  <Select defaultValue="k8s">
                    <SelectTrigger id="orchestrator">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="k8s">Kubernetes</SelectItem>
                      <SelectItem value="swarm">Docker Swarm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <Separator />
          
          <div className="grid gap-2">
            <Label>Network Protocol Options</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2 border rounded-md p-2">
                <input type="checkbox" defaultChecked id="tls" className="h-4 w-4" />
                <Label htmlFor="tls" className="text-xs">Mutual TLS (mTLS)</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-md p-2">
                <input type="checkbox" defaultChecked id="couch" className="h-4 w-4" />
                <Label htmlFor="couch" className="text-xs">CouchDB State Database</Label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Initialize Infrastructure</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeploymentViewModal({ 
  deployment, 
  open, 
  onOpenChange 
}: { 
  deployment: DeploymentCard | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const updateDeployment = useNetworkStore((state) => state.updateDeployment);
  
  const currentStepIndex = useMemo(() => {
    if (!deployment?.progress) return 0;
    return Math.min(
      DEPLOYMENT_STEPS.length - 1, 
      Math.floor((deployment.progress / 100) * DEPLOYMENT_STEPS.length)
    );
  }, [deployment?.progress]);

  const [activeAccordion, setActiveAccordion] = useState<string>(`step-${currentStepIndex + 1}`);

  useEffect(() => {
    if (open) {
      setActiveAccordion(`step-${currentStepIndex + 1}`);
    }
  }, [open, currentStepIndex]);

  const handleStepChange = (direction: 'next' | 'prev') => {
    if (!deployment) return;
    
    let nextIndex = direction === 'next' ? currentStepIndex + 1 : currentStepIndex - 1;
    nextIndex = Math.max(0, Math.min(DEPLOYMENT_STEPS.length - 1, nextIndex));
    
    // Calculate progress as a percentage of steps completed
    // We adjust it so that the nextIndex becomes the 'current' step
    const nextProgress = Math.floor((nextIndex / DEPLOYMENT_STEPS.length) * 100) + 1;
    const nextStatus = nextProgress >= 100 ? "active" : "deploying";
    
    updateDeployment(deployment.id, { 
      progress: nextProgress,
      status: nextStatus
    });

    // Expand the destination step
    setActiveAccordion(`step-${nextIndex + 1}`);
  };

  const handleCompleteStep = () => {
    if (!deployment) return;
    
    const nextIndex = currentStepIndex + 1;
    const isFinished = nextIndex >= DEPLOYMENT_STEPS.length;
    
    const nextProgress = isFinished ? 100 : Math.floor(((nextIndex + 1) / DEPLOYMENT_STEPS.length) * 100);
    const nextStatus = isFinished ? "active" : "deploying";
    
    updateDeployment(deployment.id, { 
      progress: nextProgress,
      status: nextStatus
    });

    if (isFinished) {
      // Close the modal on final step
      onOpenChange(false);
    } else {
      // Automatically advance and expand the next step
      setActiveAccordion(`step-${nextIndex + 1}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Terminal className="w-6 h-6 text-primary" />
            Deployment Guide: {deployment?.name}
          </DialogTitle>
          <DialogDescription>
            Interactive step-by-step instructions based on Hyperledger Fabric deployment documentation.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <Accordion 
            type="single" 
            collapsible 
            value={activeAccordion} 
            onValueChange={setActiveAccordion}
            className="space-y-3"
          >
            {DEPLOYMENT_STEPS.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const stepId = `step-${step.id}`;

              return (
                <AccordionItem 
                  key={step.id} 
                  value={stepId} 
                  className={`border rounded-lg px-4 transition-all duration-200 ${
                    isCurrent ? "border-primary/50 bg-primary/5 shadow-sm ring-1 ring-primary/20" : 
                    isCompleted ? "border-green-500/30 bg-green-500/5" : "border-border"
                  }`}
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-4 text-left w-full">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-colors ${
                        isCompleted ? "bg-green-500 border-green-500 text-white" : 
                        isCurrent ? "border-primary text-primary" : 
                        "border-muted text-muted-foreground"
                      }`}>
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <span>{step.id}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${isCurrent ? "text-primary" : isCompleted ? "text-green-700 dark:text-green-400" : "text-foreground"}`}>
                            {step.title}
                          </span>
                          {isCurrent && <Badge variant="default" className="text-[10px] h-4 px-1.5 animate-pulse">Active</Badge>}
                          {isCompleted && <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200">Done</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 border-t pt-4">
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      {step.details({ 
                        infraType: deployment?.infraType || 'Cloud', 
                        osType: deployment?.osType || 'Ubuntu 22.04',
                        consensusType: deployment?.consensusType || 'raft',
                        channelName: deployment?.channelName || 'mychannel',
                        orgCount: deployment?.orgCount || 2,
                        peerCount: deployment?.peerCount || 4,
                        ordererCount: deployment?.ordererCount || 3,
                        caCount: deployment?.caCount || 2
                      })}
                      
                      {isCurrent && deployment?.status !== "active" && (
                        <div className="flex justify-end pt-4 border-t border-primary/10">
                          <Button size="sm" onClick={handleCompleteStep} className="gap-2 shadow-sm">
                            Mark Step as Complete
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        <div className="p-6 border-t bg-muted/30 flex items-center justify-between">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleStepChange('prev')}
              disabled={currentStepIndex === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous Step
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleStepChange('next')}
              disabled={currentStepIndex >= DEPLOYMENT_STEPS.length - 1}
              className="gap-2"
            >
              Next Step
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-tight">Progress</p>
              <p className="text-sm font-bold tabular-nums">{deployment?.progress || 0}%</p>
            </div>
            <div className="flex items-center gap-3">
              <Progress value={deployment?.progress || 0} className="w-32 h-2.5" />
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function DeploymentsPage() {
  const [filter, setFilter] = useState<"all" | "active" | "deploying" | "stopped">("all");
  const [selectedDeployment, setSelectedDeployment] = useState<DeploymentCard | null>(null);
  const [showConfigure, setShowConfigure] = useState(false);
  const [showView, setShowView] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const deployments = useNetworkStore((state) => state.deployments);
  const removeDeployment = useNetworkStore((state) => state.removeDeployment);
  const updateDeployment = useNetworkStore((state) => state.updateDeployment);

  const allDeployments: DeploymentCard[] = useMemo(() => {
    return deployments.map(d => ({
      id: d.id,
      name: d.networkName,
      status: d.status,
      createdAt: new Date(d.createdAt).toLocaleDateString(),
      totalNodes: d.totalNodes,
      peerCount: d.peerCount,
      ordererCount: d.ordererCount,
      caCount: d.caCount,
      uptime: d.status === "active" ? calculateUptime(d.createdAt) : undefined,
      progress: d.progress,
      lastActive: d.lastActive ? new Date(d.lastActive).toLocaleDateString() : undefined,
      infraType: d.infraType,
      osType: d.osType,
      consensusType: d.consensusType,
      channelName: d.channelName,
      orgCount: d.orgCount,
    }));
  }, [deployments]);

  const filteredDeployments = useMemo(() => {
    if (filter === "all") return allDeployments;
    return allDeployments.filter(d => d.status === filter);
  }, [allDeployments, filter]);

  const counts = useMemo(() => ({
    all: allDeployments.length,
    active: allDeployments.filter(d => d.status === "active").length,
    deploying: allDeployments.filter(d => d.status === "deploying").length,
    stopped: allDeployments.filter(d => d.status === "stopped").length,
  }), [allDeployments]);

  const handleDelete = (id: string) => {
    removeDeployment(id);
    toast({ title: "Deployment deleted", description: "The deployment has been removed." });
  };

  const handleUpdateStatus = (id: string, status: DeploymentStatus) => {
    updateDeployment(id, { status });
    toast({ title: "Status updated", description: "Deployment status has been changed." });
  };

  const handleNewDeployment = () => {
    navigate("/");
  };

  const getStatusBadge = (status: DeploymentStatus) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Active
          </Badge>
        );
      case "deploying":
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Deploying
          </Badge>
        );
      case "stopped":
        return (
          <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            Stopped
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Error
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between h-14 px-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
              <Server className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground">Deployment Dashboard</h1>
              <p className="text-xs text-muted-foreground">Manage active networks</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            className="gap-2"
            onClick={handleNewDeployment}
            data-testid="button-new-deployment"
          >
            <Plus className="w-4 h-4" />
            New Deployment
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h2 className="text-sm font-medium text-foreground mb-3">Filter by status</h2>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <TabsList>
                <TabsTrigger value="all" className="gap-2" data-testid="filter-all">
                  All <Badge variant="secondary" className="ml-1">{counts.all}</Badge>
                </TabsTrigger>
                <TabsTrigger value="active" className="gap-2" data-testid="filter-active">
                  Active <Badge variant="secondary" className="ml-1">{counts.active}</Badge>
                </TabsTrigger>
                <TabsTrigger value="deploying" className="gap-2" data-testid="filter-deploying">
                  Deploying <Badge variant="secondary" className="ml-1">{counts.deploying}</Badge>
                </TabsTrigger>
                <TabsTrigger value="stopped" className="gap-2" data-testid="filter-stopped">
                  Stopped <Badge variant="secondary" className="ml-1">{counts.stopped}</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDeployments.map((deployment) => (
              <Card key={deployment.id} className="p-6" data-testid={`deployment-card-${deployment.id}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{deployment.name}</h3>
                    <p className="text-sm text-muted-foreground">Created {deployment.createdAt}</p>
                  </div>
                  {getStatusBadge(deployment.status)}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Nodes</span>
                    <span className="text-lg font-semibold text-foreground">{deployment.totalNodes}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Server className="w-4 h-4 text-blue-500" />
                      <span className="text-muted-foreground">{deployment.peerCount} Peers</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-cyan-500" />
                      <span className="text-muted-foreground">{deployment.ordererCount} Orderers</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-green-500" />
                      <span className="text-muted-foreground">{deployment.caCount} CAs</span>
                    </div>
                  </div>

                  {deployment.status === "deploying" && deployment.progress !== undefined && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium text-foreground">{deployment.progress}%</span>
                      </div>
                      <Progress value={deployment.progress} className="h-2" />
                    </div>
                  )}

                  {deployment.status === "active" && deployment.uptime && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Uptime</span>
                      <span className="font-medium text-foreground">{deployment.uptime}</span>
                    </div>
                  )}

                  {deployment.status === "stopped" && deployment.lastActive && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Active</span>
                      <span className="font-medium text-foreground">{deployment.lastActive}</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1.5" 
                      onClick={() => {
                        setSelectedDeployment(deployment);
                        setShowView(true);
                      }}
                      data-testid={`button-view-${deployment.id}`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1.5" 
                      onClick={() => {
                        setSelectedDeployment(deployment);
                        setShowConfigure(true);
                      }}
                      data-testid={`button-configure-${deployment.id}`}
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Configure
                    </Button>
                    {deployment.status === "stopped" && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1.5" 
                        onClick={() => handleUpdateStatus(deployment.id, "deploying")}
                        data-testid={`button-start-${deployment.id}`}
                      >
                        <Play className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-auto text-muted-foreground"
                      onClick={() => handleDelete(deployment.id)}
                      data-testid={`button-delete-${deployment.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredDeployments.length === 0 && (
            <Card className="p-12 text-center">
              <Server className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No deployments found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {filter === "all" 
                  ? "Create your first deployment to get started"
                  : `No ${filter} deployments`
                }
              </p>
              <Button className="gap-2" onClick={handleNewDeployment}>
                <Plus className="w-4 h-4" />
                New Deployment
              </Button>
            </Card>
          )}
        </div>
      </div>
      
      <DeploymentConfigureModal 
        deployment={selectedDeployment}
        open={showConfigure}
        onOpenChange={setShowConfigure}
      />
      
      <DeploymentViewModal 
        deployment={selectedDeployment}
        open={showView}
        onOpenChange={setShowView}
      />
    </div>
  );
}
