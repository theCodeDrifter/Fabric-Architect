import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Terminal, Copy, CheckCircle2, Play, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNetworkStore } from "@/lib/store";

export default function CLIGeneratorPage() {
  const [selectedCommand, setSelectedCommand] = useState<string>("create-channel");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const { networkName, channelName, nodes, organizations, peers, orderers } = useNetworkStore();

  const orgNodes = useMemo(() => nodes.filter(n => n.data?.type === "organization"), [nodes]);
  const peerNodes = useMemo(() => nodes.filter(n => n.data?.type === "peer"), [nodes]);
  const ordererNodes = useMemo(() => nodes.filter(n => n.data?.type === "orderer"), [nodes]);

  const firstOrg = orgNodes[0]?.data?.label || organizations[0]?.name || "org1";
  const firstOrgDomain = organizations[0]?.domain || `${firstOrg.toLowerCase()}.example.com`;
  const firstPeer = peerNodes[0]?.data?.label || peers[0]?.name || "peer0";
  const firstOrderer = ordererNodes[0]?.data?.label || orderers[0]?.name || "orderer";
  const ordererPort = orderers[0]?.port || 7050;
  const peerPort = peers[0]?.port || 7051;
  const channel = channelName || "mychannel";

  const cliCommands = useMemo(() => ({
    "create-channel": {
      title: "Create Channel",
      description: `Initialize channel "${channel}" on the network`,
      command: `peer channel create \\
  -o ${firstOrderer}.example.com:${ordererPort} \\
  -c ${channel} \\
  -f ./channel-artifacts/${channel}.tx \\
  --tls --cafile /opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/${firstOrderer}.example.com/msp/tlscacerts/tlsca.example.com-cert.pem`,
    },
    "join-channel": {
      title: "Join Channel",
      description: `Join ${firstPeer} to channel "${channel}"`,
      command: `peer channel join \\
  -b ${channel}.block`,
    },
    "install-chaincode": {
      title: "Install Chaincode",
      description: `Install chaincode on ${firstPeer}`,
      command: `peer lifecycle chaincode install \\
  ${networkName || "mycc"}.tar.gz`,
    },
    "approve-chaincode": {
      title: "Approve Chaincode",
      description: `Approve chaincode definition for ${firstOrg}`,
      command: `peer lifecycle chaincode approveformyorg \\
  -o ${firstOrderer}.example.com:${ordererPort} \\
  --channelID ${channel} \\
  --name ${networkName || "mycc"} \\
  --version 1.0 \\
  --package-id ${networkName || "mycc"}_1.0:hash \\
  --sequence 1 \\
  --tls --cafile /path/to/orderer/tls/cert.pem`,
    },
    "commit-chaincode": {
      title: "Commit Chaincode",
      description: "Commit chaincode definition to the channel",
      command: `peer lifecycle chaincode commit \\
  -o ${firstOrderer}.example.com:${ordererPort} \\
  --channelID ${channel} \\
  --name ${networkName || "mycc"} \\
  --version 1.0 \\
  --sequence 1 \\
  --tls --cafile /path/to/orderer/tls/cert.pem \\
  --peerAddresses ${firstPeer}.${firstOrgDomain}:${peerPort} \\
  --tlsRootCertFiles /path/to/peer/tls/cert.pem`,
    },
    "invoke-chaincode": {
      title: "Invoke Chaincode",
      description: "Invoke a chaincode function",
      command: `peer chaincode invoke \\
  -o ${firstOrderer}.example.com:${ordererPort} \\
  -C ${channel} \\
  -n ${networkName || "mycc"} \\
  -c '{"function":"initLedger","Args":[]}' \\
  --tls --cafile /path/to/orderer/tls/cert.pem \\
  --peerAddresses ${firstPeer}.${firstOrgDomain}:${peerPort} \\
  --tlsRootCertFiles /path/to/peer/tls/cert.pem`,
    },
  }), [networkName, channel, firstOrg, firstOrgDomain, firstPeer, firstOrderer, ordererPort, peerPort]);

  const currentCommand = cliCommands[selectedCommand as keyof typeof cliCommands];

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(currentCommand.command);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "CLI command has been copied",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const hasNetwork = nodes.length > 0 || organizations.length > 0;

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">CLI Generator</h1>
          <p className="text-muted-foreground mt-1">
            Generate Hyperledger Fabric CLI commands for your network: <span className="font-mono text-foreground">{networkName || "my-fabric-network"}</span>
          </p>
        </div>

        {!hasNetwork && (
          <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-900/10">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">No network configured</p>
                <p className="text-sm text-muted-foreground">
                  Design your network in the Canvas first to generate accurate CLI commands. Currently showing example commands.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Command Generator
            </CardTitle>
            <CardDescription>
              Select an operation to generate the corresponding CLI command for your network
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-48">
                <Select value={selectedCommand} onValueChange={setSelectedCommand}>
                  <SelectTrigger data-testid="select-command">
                    <SelectValue placeholder="Select command" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(cliCommands).map(([key, cmd]) => (
                      <SelectItem key={key} value={key}>
                        {cmd.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={copyToClipboard} data-testid="button-copy-command">
                {copied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                Copy Command
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-medium" data-testid="text-command-title">{currentCommand.title}</h3>
                <Badge variant="secondary">peer CLI</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{currentCommand.description}</p>
            </div>

            <pre className="bg-muted p-4 rounded-md overflow-auto text-sm font-mono" data-testid="code-command">
              {currentCommand.command}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Network Summary</CardTitle>
            <CardDescription>
              Current network configuration used for command generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-3 rounded-md bg-muted/50">
                <p className="text-sm text-muted-foreground">Organizations</p>
                <p className="text-2xl font-semibold" data-testid="text-org-count">{orgNodes.length || organizations.length}</p>
              </div>
              <div className="p-3 rounded-md bg-muted/50">
                <p className="text-sm text-muted-foreground">Peers</p>
                <p className="text-2xl font-semibold" data-testid="text-peer-count">{peerNodes.length || peers.length}</p>
              </div>
              <div className="p-3 rounded-md bg-muted/50">
                <p className="text-sm text-muted-foreground">Orderers</p>
                <p className="text-2xl font-semibold" data-testid="text-orderer-count">{ordererNodes.length || orderers.length}</p>
              </div>
              <div className="p-3 rounded-md bg-muted/50">
                <p className="text-sm text-muted-foreground">Channel</p>
                <p className="text-lg font-semibold font-mono truncate" data-testid="text-channel">{channel}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common command sequences for network operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              <Button variant="outline" className="justify-start" data-testid="button-full-deployment">
                <Play className="w-4 h-4 mr-2" />
                Full Network Deployment
              </Button>
              <Button variant="outline" className="justify-start" data-testid="button-chaincode-lifecycle">
                <Play className="w-4 h-4 mr-2" />
                Chaincode Lifecycle
              </Button>
              <Button variant="outline" className="justify-start" data-testid="button-channel-setup">
                <Play className="w-4 h-4 mr-2" />
                Channel Setup
              </Button>
              <Button variant="outline" className="justify-start" data-testid="button-org-join">
                <Play className="w-4 h-4 mr-2" />
                Organization Join
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
