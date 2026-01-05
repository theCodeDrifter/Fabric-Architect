import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCode2, Download, Copy, CheckCircle2 } from "lucide-react";
import { useNetworkStore } from "@/lib/store";
import { generateConfigTxYamlFromCanvas, generateCryptoConfigYaml, generateDockerComposeYaml } from "@/lib/yamlGenerator";
import { useToast } from "@/hooks/use-toast";

export default function ExportPage() {
  const { networkName, consensusType, channelName, organizations, orderers, peers, cas, channels, chaincodes, nodes, edges } = useNetworkStore();
  const { toast } = useToast();
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const configTxYaml = generateConfigTxYamlFromCanvas({
    networkName,
    consensusType: consensusType as "etcdraft" | "bft" | "solo",
    channelName,
    nodes,
    edges,
    organizations,
    peers,
    orderers,
    cas,
  });
  const cryptoConfigYaml = generateCryptoConfigYaml(organizations, orderers);
  const dockerComposeYaml = generateDockerComposeYaml(organizations, orderers);

  const copyToClipboard = async (content: string, tab: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedTab(tab);
    toast({
      title: "Copied to clipboard",
      description: "Configuration content has been copied",
    });
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Download started",
      description: `${filename} is being downloaded`,
    });
  };

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold" data-testid="text-page-title">Config Export</h1>
            <p className="text-muted-foreground mt-1">
              Export your network configuration as production-ready YAML files
            </p>
          </div>
          <Button data-testid="button-download-all" onClick={() => {
            downloadFile(configTxYaml, "configtx.yaml");
            downloadFile(cryptoConfigYaml, "crypto-config.yaml");
            downloadFile(dockerComposeYaml, "docker-compose.yaml");
          }}>
            <Download className="w-4 h-4 mr-2" />
            Download All
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <FileCode2 className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold" data-testid="text-orgs-count">{organizations.length}</p>
                  <p className="text-sm text-muted-foreground">Organizations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10">
                  <FileCode2 className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold" data-testid="text-channels-count">{channels.length}</p>
                  <p className="text-sm text-muted-foreground">Channels</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <FileCode2 className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold" data-testid="text-chaincode-count">{chaincodes.length}</p>
                  <p className="text-sm text-muted-foreground">Chaincodes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configuration Files</CardTitle>
            <CardDescription>
              Preview and download individual configuration files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="configtx">
              <TabsList className="mb-4">
                <TabsTrigger value="configtx" data-testid="tab-configtx">configtx.yaml</TabsTrigger>
                <TabsTrigger value="crypto" data-testid="tab-crypto">crypto-config.yaml</TabsTrigger>
                <TabsTrigger value="docker" data-testid="tab-docker">docker-compose.yaml</TabsTrigger>
              </TabsList>

              <TabsContent value="configtx">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="secondary">Channel & Policy Configuration</Badge>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(configTxYaml, "configtx")} data-testid="button-copy-configtx">
                      {copiedTab === "configtx" ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                      Copy
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => downloadFile(configTxYaml, "configtx.yaml")} data-testid="button-download-configtx">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-sm font-mono" data-testid="code-configtx">
                  {configTxYaml}
                </pre>
              </TabsContent>

              <TabsContent value="crypto">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="secondary">Cryptographic Material</Badge>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(cryptoConfigYaml, "crypto")} data-testid="button-copy-crypto">
                      {copiedTab === "crypto" ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                      Copy
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => downloadFile(cryptoConfigYaml, "crypto-config.yaml")} data-testid="button-download-crypto">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-sm font-mono" data-testid="code-crypto">
                  {cryptoConfigYaml}
                </pre>
              </TabsContent>

              <TabsContent value="docker">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="secondary">Container Orchestration</Badge>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(dockerComposeYaml, "docker")} data-testid="button-copy-docker">
                      {copiedTab === "docker" ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                      Copy
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => downloadFile(dockerComposeYaml, "docker-compose.yaml")} data-testid="button-download-docker">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-sm font-mono" data-testid="code-docker">
                  {dockerComposeYaml}
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
