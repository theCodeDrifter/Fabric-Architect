import { 
  FolderOpen, 
  Plus, 
  Download,
  Building2,
  Server,
  Database,
  Star,
  Clock,
  Trash2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useNetworkStore } from "@/lib/store";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: string;
  name: string;
  description: string;
  orgCount: number;
  peerCount: number;
  ordererCount: number;
  featured?: boolean;
  usageCount: number;
}

const templates: Template[] = [
  {
    id: "1",
    name: "Two-Org Basic Network",
    description: "Simple network with two organizations, ideal for development and testing",
    orgCount: 2,
    peerCount: 4,
    ordererCount: 1,
    featured: true,
    usageCount: 1243,
  },
  {
    id: "2",
    name: "Three-Org Production",
    description: "Production-ready network with three organizations and Raft consensus",
    orgCount: 3,
    peerCount: 6,
    ordererCount: 3,
    featured: true,
    usageCount: 856,
  },
  {
    id: "3",
    name: "Multi-Channel Enterprise",
    description: "Enterprise setup with multiple channels for different business processes",
    orgCount: 4,
    peerCount: 8,
    ordererCount: 5,
    usageCount: 432,
  },
  {
    id: "4",
    name: "Dev Single Org",
    description: "Minimal single organization setup for rapid prototyping",
    orgCount: 1,
    peerCount: 2,
    ordererCount: 1,
    usageCount: 2156,
  },
  {
    id: "5",
    name: "High Availability Cluster",
    description: "Fault-tolerant configuration with redundant orderers and peers",
    orgCount: 3,
    peerCount: 9,
    ordererCount: 5,
    usageCount: 324,
  },
  {
    id: "6",
    name: "Supply Chain Network",
    description: "Pre-configured for supply chain use cases with multiple stakeholders",
    orgCount: 5,
    peerCount: 10,
    ordererCount: 3,
    featured: true,
    usageCount: 567,
  },
];

export default function TemplatesPage() {
  const store = useNetworkStore();
  const { customTemplates, loadTemplate, deleteTemplate } = useNetworkStore();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleUseCustomTemplate = (templateId: string, templateName: string) => {
    loadTemplate(templateId);
    toast({
      title: "Template loaded",
      description: `${templateName} has been loaded to the canvas.`,
    });
    navigate("/");
  };

  const handleDeleteCustomTemplate = (templateId: string, templateName: string) => {
    deleteTemplate(templateId);
    toast({
      title: "Template deleted",
      description: `${templateName} has been deleted.`,
    });
  };

  const handleUseTemplate = (template: Template) => {
    store.clearCanvas();
    
    const baseTimestamp = Date.now();
    const orgSpacing = 200;
    const peerSpacing = 120;
    const ordererSpacing = 150;
    
    const peersPerOrg = Math.ceil(template.peerCount / template.orgCount);
    const createdOrgs: Array<{ id: string; name: string }> = [];
    
    for (let i = 0; i < template.orgCount; i++) {
      const orgId = `org-${baseTimestamp}-${i}`;
      const orgName = `Org${i + 1}`;
      
      store.addOrganization({
        id: orgId,
        name: orgName,
        mspId: `${orgName}MSP`,
        domain: `org${i + 1}.example.com`,
      });
      
      store.addNode({
        id: orgId,
        type: "organization",
        position: { x: 100 + i * 300, y: 100 },
        data: {
          label: orgName,
          type: "organization",
          description: `Organization ${i + 1}`,
        },
      });
      
      createdOrgs.push({ id: orgId, name: orgName });
      
      for (let j = 0; j < peersPerOrg; j++) {
        const peerIndex = i * peersPerOrg + j;
        if (peerIndex >= template.peerCount) break;
        
        const peerId = `peer-${baseTimestamp}-${peerIndex}`;
        const peerName = `peer${j}.${orgName.toLowerCase()}`;
        
        store.addPeer({
          id: peerId,
          name: peerName,
          organizationId: orgId,
          port: 7051 + peerIndex * 1000,
          couchDbPort: 5984 + peerIndex,
          isAnchor: j === 0,
        });
        
        store.addNode({
          id: peerId,
          type: "peer",
          position: { x: 100 + i * 300, y: 250 + j * peerSpacing },
          data: {
            label: peerName,
            type: "peer",
            description: `Peer node for ${orgName}`,
          },
        });
        
        store.addEdge({
          id: `edge-${peerId}-${orgId}`,
          source: peerId,
          target: orgId,
          type: "smoothstep",
        });
      }
    }
    
    for (let i = 0; i < template.ordererCount; i++) {
      const ordererId = `orderer-${baseTimestamp}-${i}`;
      const ordererName = `orderer${i + 1}`;
      
      store.addOrderer({
        id: ordererId,
        name: ordererName,
        port: 7050 + i * 1000,
        adminPort: 7053 + i * 1000,
      });
      
      store.addNode({
        id: ordererId,
        type: "orderer",
        position: { x: 600 + Math.floor(i / 3) * 200, y: 100 + (i % 3) * ordererSpacing },
        data: {
          label: ordererName,
          type: "orderer",
          description: `Orderer node ${i + 1}`,
        },
      });
    }
    
    store.setNetworkName(template.name.toLowerCase().replace(/\s+/g, '-'));
    
    toast({
      title: "Template loaded",
      description: `${template.name} has been loaded to the canvas with ${template.orgCount} organizations, ${template.peerCount} peers, and ${template.ordererCount} orderers.`,
    });
    
    navigate("/");
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between h-14 px-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary" />
            <h1 className="text-base font-semibold text-foreground">Network Templates</h1>
          </div>
        </div>
        <Button size="sm" className="gap-2" data-testid="button-create-template" onClick={() => navigate("/")}>
          <Plus className="w-4 h-4" />
          Create Template
        </Button>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {customTemplates.length > 0 && (
            <>
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-foreground mb-2">My Templates</h2>
                <p className="text-sm text-muted-foreground">
                  Your custom saved network templates
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {customTemplates.map((template) => (
                  <Card key={template.id} className="p-6 hover-elevate transition-all" data-testid={`custom-template-${template.id}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold text-foreground">{template.name}</h3>
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">{template.description || "No description"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-purple-500" />
                        <span className="text-muted-foreground">{template.orgCount} Orgs</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Server className="w-4 h-4 text-blue-500" />
                        <span className="text-muted-foreground">{template.peerCount} Peers</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Database className="w-4 h-4 text-cyan-500" />
                        <span className="text-muted-foreground">{template.ordererCount} Orderers</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="gap-1.5 text-destructive hover:text-destructive" 
                          onClick={() => handleDeleteCustomTemplate(template.id, template.name)}
                          data-testid={`button-delete-${template.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="gap-1.5" 
                          onClick={() => handleUseCustomTemplate(template.id, template.name)}
                          data-testid={`button-use-custom-${template.id}`}
                        >
                          <Download className="w-3.5 h-3.5" />
                          Use Template
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-2">Featured Templates</h2>
            <p className="text-sm text-muted-foreground">
              Pre-built network configurations to get you started quickly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="p-6 hover-elevate transition-all" data-testid={`template-${template.id}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-foreground">{template.name}</h3>
                      {template.featured && (
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-purple-500" />
                    <span className="text-muted-foreground">{template.orgCount} Orgs</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-blue-500" />
                    <span className="text-muted-foreground">{template.peerCount} Peers</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-cyan-500" />
                    <span className="text-muted-foreground">{template.ordererCount} Orderers</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{template.usageCount.toLocaleString()} uses</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-1.5" 
                    onClick={() => handleUseTemplate(template)}
                    data-testid={`button-use-${template.id}`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Use Template
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
