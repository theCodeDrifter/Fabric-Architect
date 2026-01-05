import { useState } from "react";
import { Copy, Download, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNetworkStore } from "@/lib/store";
import { generateConfigTxYamlFromCanvas } from "@/lib/yamlGenerator";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const [copied, setCopied] = useState(false);
  const store = useNetworkStore();
  
  const yamlContent = generateConfigTxYamlFromCanvas({
    networkName: store.networkName,
    consensusType: store.consensusType as "etcdraft" | "bft" | "solo",
    channelName: store.channelName,
    nodes: store.nodes,
    edges: store.edges,
    organizations: store.organizations,
    peers: store.peers,
    orderers: store.orderers,
    cas: store.cas,
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(yamlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([yamlContent], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "configtx.yaml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Export Configuration</DialogTitle>
          <DialogDescription>
            Generated Hyperledger Fabric configtx.yaml based on your network topology
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="yaml" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="yaml" data-testid="tab-yaml">configtx.yaml</TabsTrigger>
            <TabsTrigger value="docker" data-testid="tab-docker">docker-compose.yaml</TabsTrigger>
            <TabsTrigger value="scripts" data-testid="tab-scripts">Scripts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="yaml" className="mt-4">
            <div className="relative">
              <div className="absolute top-2 right-2 flex gap-2 z-10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-2"
                  data-testid="button-copy-yaml"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="gap-2"
                  data-testid="button-download-yaml"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
              <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[400px] text-sm font-mono text-foreground">
                {yamlContent}
              </pre>
            </div>
          </TabsContent>
          
          <TabsContent value="docker" className="mt-4">
            <div className="bg-muted p-4 rounded-lg text-center text-muted-foreground">
              <p>Docker Compose export coming soon</p>
              <p className="text-sm mt-2">
                This will generate a docker-compose.yaml for local development
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="scripts" className="mt-4">
            <div className="bg-muted p-4 rounded-lg text-center text-muted-foreground">
              <p>Deployment scripts coming soon</p>
              <p className="text-sm mt-2">
                Shell scripts for network initialization and channel creation
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
