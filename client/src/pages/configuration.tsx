import { useState } from "react";
import { 
  RotateCcw, 
  Copy, 
  Save,
  Building2,
  Server,
  Database,
  Layers,
  Code2,
  Play,
  Square,
  RefreshCw,
  Link2,
  Shield,
  Cpu,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
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

type ComponentType = "organizations" | "peers" | "orderers" | "channels" | "chaincode";

interface ComponentItem {
  id: string;
  name: string;
  type: ComponentType;
  status: "running" | "stopped" | "error";
  organization?: string;
}

export default function ConfigurationPage() {
  const { toast } = useToast();
  const { nodes, organizations, peers, orderers } = useNetworkStore();
  const [selectedComponent, setSelectedComponent] = useState<ComponentItem | null>(null);
  const [advancedMode, setAdvancedMode] = useState(false);

  // Build component list from store
  const components: ComponentItem[] = [
    ...nodes
      .filter(n => n.data?.type === "organization")
      .map(n => ({
        id: n.id,
        name: n.data?.label || "Organization",
        type: "organizations" as ComponentType,
        status: "running" as const,
      })),
    ...nodes
      .filter(n => n.data?.type === "peer")
      .map(n => ({
        id: n.id,
        name: n.data?.label || "Peer",
        type: "peers" as ComponentType,
        status: "running" as const,
        organization: "Org1",
      })),
    ...nodes
      .filter(n => n.data?.type === "orderer")
      .map(n => ({
        id: n.id,
        name: n.data?.label || "Orderer",
        type: "orderers" as ComponentType,
        status: "running" as const,
      })),
    ...nodes
      .filter(n => n.data?.type === "channel")
      .map(n => ({
        id: n.id,
        name: n.data?.label || "Channel",
        type: "channels" as ComponentType,
        status: "running" as const,
      })),
    ...nodes
      .filter(n => n.data?.type === "chaincode")
      .map(n => ({
        id: n.id,
        name: n.data?.label || "Chaincode",
        type: "chaincode" as ComponentType,
        status: "running" as const,
      })),
  ];

  // Default demo component if none exist
  const demoComponent: ComponentItem = {
    id: "demo",
    name: "peer0.org1.example.com",
    type: "peers",
    status: "running",
    organization: "Org1",
  };

  const activeComponent = selectedComponent || (components.length > 0 ? components[0] : demoComponent);

  const handleSave = () => {
    toast({
      title: "Configuration saved",
      description: `${activeComponent.name} configuration has been updated.`,
    });
  };

  const getComponentIcon = (type: ComponentType) => {
    switch (type) {
      case "organizations": return <Building2 className="w-4 h-4 text-purple-500" />;
      case "peers": return <Server className="w-4 h-4 text-blue-500" />;
      case "orderers": return <Database className="w-4 h-4 text-cyan-500" />;
      case "channels": return <Layers className="w-4 h-4 text-amber-500" />;
      case "chaincode": return <Code2 className="w-4 h-4 text-orange-500" />;
    }
  };

  const componentGroups = [
    { type: "organizations" as ComponentType, label: "Organizations", icon: Building2 },
    { type: "peers" as ComponentType, label: "Peers", icon: Server },
    { type: "orderers" as ComponentType, label: "Orderers", icon: Database },
    { type: "channels" as ComponentType, label: "Channels", icon: Layers },
    { type: "chaincode" as ComponentType, label: "Chaincode", icon: Code2 },
  ];

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between h-14 px-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-primary" />
            <div>
              <h1 className="text-base font-semibold text-foreground">Configuration Manager</h1>
              <p className="text-xs text-muted-foreground font-mono">{activeComponent.name}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            data-testid="button-reset"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            data-testid="button-duplicate"
          >
            <Copy className="w-4 h-4" />
            Duplicate
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave}
            className="gap-2"
            data-testid="button-save-config"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Components Sidebar */}
        <div className="w-64 border-r border-border bg-card overflow-y-auto">
          <div className="p-4">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Components
            </h2>
            <div className="space-y-1">
              {componentGroups.map((group) => {
                const groupComponents = components.filter(c => c.type === group.type);
                const Icon = group.icon;
                
                return (
                  <div key={group.type}>
                    <button
                      className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-muted-foreground hover-elevate rounded"
                      data-testid={`nav-${group.type}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{group.label}</span>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {groupComponents.length}
                      </Badge>
                    </button>
                    {groupComponents.map((comp) => (
                      <button
                        key={comp.id}
                        onClick={() => setSelectedComponent(comp)}
                        className={`flex items-center gap-2 w-full px-4 py-1.5 text-sm rounded ml-2 ${
                          activeComponent.id === comp.id 
                            ? "bg-accent text-foreground" 
                            : "text-muted-foreground hover-elevate"
                        }`}
                        data-testid={`component-${comp.id}`}
                      >
                        <span className="truncate">{comp.name}</span>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          <div className="p-4">
            <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Quick Settings
            </h2>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Component Name</Label>
                <Input 
                  value={activeComponent.name} 
                  readOnly 
                  className="text-sm h-8"
                  data-testid="input-component-name"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Component Type</Label>
                <Select defaultValue={activeComponent.type}>
                  <SelectTrigger className="h-8 text-sm" data-testid="select-component-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="peers">Peer</SelectItem>
                    <SelectItem value="orderers">Orderer</SelectItem>
                    <SelectItem value="organizations">Organization</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {activeComponent.organization && (
                <div className="space-y-1">
                  <Label className="text-xs">Organization</Label>
                  <Input 
                    value={activeComponent.organization} 
                    readOnly 
                    className="text-sm h-8"
                    data-testid="input-organization"
                  />
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <h3 className="text-xs font-medium text-muted-foreground mb-2">Status</h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-foreground">Running</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Uptime: 48h 32m</p>
              <p className="text-xs text-muted-foreground">Last Updated: 2 hours ago</p>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <h3 className="text-xs font-medium text-muted-foreground mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2" data-testid="button-start-component">
                  <Play className="w-3.5 h-3.5" />
                  Start Component
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2" data-testid="button-stop-component">
                  <Square className="w-3.5 h-3.5" />
                  Stop Component
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2" data-testid="button-restart-component">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Restart Component
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="flex-1 overflow-y-auto bg-background">
          <div className="max-w-3xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Component Configuration</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Advanced Mode</span>
                <Switch 
                  checked={advancedMode} 
                  onCheckedChange={setAdvancedMode}
                  data-testid="switch-advanced-mode"
                />
              </div>
            </div>

            <Accordion type="multiple" defaultValue={["identity", "connection"]} className="space-y-4">
              <AccordionItem value="identity" className="border rounded-lg px-4">
                <AccordionTrigger className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Shield className="w-4 h-4 text-primary" />
                    </div>
                    <span className="font-medium">Network Identity</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="component-id">Component ID</Label>
                      <Input 
                        id="component-id"
                        defaultValue="peer0.org1.example.com"
                        placeholder="Unique identifier for this component"
                        data-testid="input-component-id"
                      />
                      <p className="text-xs text-muted-foreground">Unique identifier for this component</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="display-name">Display Name</Label>
                      <Input 
                        id="display-name"
                        defaultValue="Peer 0 - Organization 1"
                        data-testid="input-display-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description"
                        placeholder="Enter a description for this component"
                        className="min-h-[80px]"
                        data-testid="input-description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="domain">Domain</Label>
                      <Input 
                        id="domain"
                        defaultValue="org1.example.com"
                        data-testid="input-domain"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="connection" className="border rounded-lg px-4">
                <AccordionTrigger className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Link2 className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="font-medium">Connection Settings</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="host">Host Address</Label>
                        <Input 
                          id="host"
                          defaultValue="localhost"
                          data-testid="input-host"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="port">Port</Label>
                        <Input 
                          id="port"
                          type="number"
                          defaultValue="7051"
                          data-testid="input-port"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="external-endpoint">External Endpoint</Label>
                      <Input 
                        id="external-endpoint"
                        defaultValue="peer0.org1.example.com:7051"
                        data-testid="input-external-endpoint"
                      />
                      <p className="text-xs text-muted-foreground">Public endpoint for external clients</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable TLS</Label>
                        <p className="text-xs text-muted-foreground">Use secure connections for this component</p>
                      </div>
                      <Switch defaultChecked data-testid="switch-tls" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Client Authentication</Label>
                        <p className="text-xs text-muted-foreground">Require client certificates</p>
                      </div>
                      <Switch data-testid="switch-client-auth" />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="consensus" className="border rounded-lg px-4">
                <AccordionTrigger className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/10 rounded-lg">
                      <Database className="w-4 h-4 text-cyan-500" />
                    </div>
                    <span className="font-medium">Consensus Configuration</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Consensus Type</Label>
                      <Select defaultValue="etcdraft">
                        <SelectTrigger data-testid="select-consensus">
                          <SelectValue placeholder="Select consensus type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="etcdraft">Raft (etcdraft)</SelectItem>
                          <SelectItem value="bft">BFT (SmartBFT)</SelectItem>
                          <SelectItem value="solo">Solo (Dev only)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="batch-timeout">Batch Timeout</Label>
                        <Input 
                          id="batch-timeout"
                          defaultValue="2s"
                          data-testid="input-batch-timeout"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="batch-size">Batch Size</Label>
                        <Input 
                          id="batch-size"
                          type="number"
                          defaultValue="10"
                          data-testid="input-batch-size"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="max-message-count">Max Message Count</Label>
                        <Input 
                          id="max-message-count"
                          type="number"
                          defaultValue="100"
                          data-testid="input-max-message"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max-bytes">Absolute Max Bytes</Label>
                        <Input 
                          id="max-bytes"
                          defaultValue="99 MB"
                          data-testid="input-max-bytes"
                        />
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="resources" className="border rounded-lg px-4">
                <AccordionTrigger className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <Cpu className="w-4 h-4 text-orange-500" />
                    </div>
                    <span className="font-medium">Resource Limits</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>CPU Limit</Label>
                        <span className="text-sm text-muted-foreground">0.5 - 4.0 cores</span>
                      </div>
                      <Slider 
                        defaultValue={[50]} 
                        max={100} 
                        step={1}
                        data-testid="slider-cpu"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Memory Limit</Label>
                        <span className="text-sm text-muted-foreground">512 MB - 8 GB</span>
                      </div>
                      <Slider 
                        defaultValue={[30]} 
                        max={100} 
                        step={1}
                        data-testid="slider-memory"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="storage-size">Storage Size</Label>
                        <Input 
                          id="storage-size"
                          defaultValue="20 GB"
                          data-testid="input-storage"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Storage Class</Label>
                        <Select defaultValue="standard">
                          <SelectTrigger data-testid="select-storage-class">
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="ssd">SSD</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="security" className="border rounded-lg px-4">
                <AccordionTrigger className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Lock className="w-4 h-4 text-green-500" />
                    </div>
                    <span className="font-medium">Security Settings</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ca">Certificate Authority</Label>
                      <Input 
                        id="ca"
                        defaultValue="ca.org1.example.com"
                        data-testid="input-ca"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="msp-id">MSP ID</Label>
                      <Input 
                        id="msp-id"
                        defaultValue="Org1MSP"
                        data-testid="input-msp-id"
                      />
                      <p className="text-xs text-muted-foreground">Membership Service Provider Identifier</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Mutual TLS</Label>
                        <p className="text-xs text-muted-foreground">Require mutual TLS authentication</p>
                      </div>
                      <Switch data-testid="switch-mutual-tls" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-renew Certificates</Label>
                        <p className="text-xs text-muted-foreground">Automatically renew before expiration</p>
                      </div>
                      <Switch defaultChecked data-testid="switch-auto-renew" />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}
