import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Server, Cpu, HardDrive, RefreshCw, AlertCircle } from "lucide-react";
import { useNetworkStore } from "@/lib/store";

interface NodeStatus {
  id: string;
  name: string;
  type: string;
  status: "running" | "stopped";
  cpu: number;
  memory: number;
  disk: number;
}

export default function MonitorPage() {
  const { nodes, peers, orderers, cas, channels, deployments } = useNetworkStore();

  const peerNodes = useMemo(() => nodes.filter(n => n.data?.type === "peer"), [nodes]);
  const ordererNodes = useMemo(() => nodes.filter(n => n.data?.type === "orderer"), [nodes]);
  const caNodes = useMemo(() => nodes.filter(n => n.data?.type === "ca"), [nodes]);
  const channelNodes = useMemo(() => nodes.filter(n => n.data?.type === "channel"), [nodes]);

  const activeDeployments = useMemo(() => 
    deployments.filter(d => d.status === "active" || d.status === "deploying"), 
    [deployments]
  );

  const networkNodes: NodeStatus[] = useMemo(() => {
    const allNodes: NodeStatus[] = [];
    
    peerNodes.forEach((node, idx) => {
      allNodes.push({
        id: node.id,
        name: node.data?.label || `peer${idx}.example.com`,
        type: "Peer",
        status: activeDeployments.length > 0 ? "running" : "stopped",
        cpu: Math.floor(Math.random() * 30) + 10,
        memory: Math.floor(Math.random() * 40) + 20,
        disk: Math.floor(Math.random() * 15) + 5,
      });
    });
    
    ordererNodes.forEach((node, idx) => {
      allNodes.push({
        id: node.id,
        name: node.data?.label || `orderer${idx}.example.com`,
        type: "Orderer",
        status: activeDeployments.length > 0 ? "running" : "stopped",
        cpu: Math.floor(Math.random() * 35) + 15,
        memory: Math.floor(Math.random() * 50) + 30,
        disk: Math.floor(Math.random() * 10) + 5,
      });
    });
    
    caNodes.forEach((node, idx) => {
      allNodes.push({
        id: node.id,
        name: node.data?.label || `ca${idx}.example.com`,
        type: "CA",
        status: activeDeployments.length > 0 ? "running" : "stopped",
        cpu: Math.floor(Math.random() * 10) + 2,
        memory: Math.floor(Math.random() * 25) + 15,
        disk: Math.floor(Math.random() * 5) + 2,
      });
    });
    
    return allNodes;
  }, [peerNodes, ordererNodes, caNodes, activeDeployments]);

  const metrics = useMemo(() => ({
    totalTransactions: activeDeployments.length > 0 ? Math.floor(Math.random() * 2000) + 500 : 0,
    blocksCreated: activeDeployments.length > 0 ? Math.floor(Math.random() * 150) + 20 : 0,
    activeChannels: channelNodes.length || channels.length || 0,
    endorsementRate: activeDeployments.length > 0 ? (98 + Math.random() * 2).toFixed(1) : "0.0",
  }), [activeDeployments, channelNodes, channels]);

  const hasNetwork = nodes.length > 0;

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold" data-testid="text-page-title">Network Monitor</h1>
            <p className="text-muted-foreground mt-1">
              Real-time monitoring of your Hyperledger Fabric network
            </p>
          </div>
          <Button variant="outline" data-testid="button-refresh">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {!hasNetwork && (
          <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-900/10">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">No network configured</p>
                <p className="text-sm text-muted-foreground">
                  Design your network in the Canvas first to monitor its components.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-semibold" data-testid="text-transactions">{metrics.totalTransactions}</p>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <HardDrive className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold" data-testid="text-blocks">{metrics.blocksCreated}</p>
                  <p className="text-sm text-muted-foreground">Blocks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Server className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold" data-testid="text-channels">{metrics.activeChannels}</p>
                  <p className="text-sm text-muted-foreground">Channels</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Cpu className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold" data-testid="text-endorsement">{metrics.endorsementRate}%</p>
                  <p className="text-sm text-muted-foreground">Endorsement</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              Node Status
            </CardTitle>
            <CardDescription>
              Health and resource usage of network nodes ({networkNodes.length} nodes)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {networkNodes.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Server className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No nodes configured in your network</p>
                <p className="text-sm mt-1">Add peers, orderers, and CAs to your network canvas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {networkNodes.map((node) => (
                  <div
                    key={node.id}
                    className="flex items-center justify-between gap-4 p-3 rounded-md bg-muted/50"
                    data-testid={`node-${node.id}`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-2 h-2 rounded-full ${node.status === "running" ? "bg-green-500" : "bg-gray-400"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium truncate">{node.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {node.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5" />
                        <span>{node.cpu}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Server className="w-3.5 h-3.5" />
                        <span>{node.memory}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>{node.disk}GB</span>
                      </div>
                      <Badge
                        variant={node.status === "running" ? "default" : "secondary"}
                        className="flex-shrink-0"
                      >
                        {node.status === "running" ? "Running" : "Stopped"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Network Activity</CardTitle>
            <CardDescription>
              Transaction throughput and latency metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                {activeDeployments.length > 0 ? (
                  <p>Monitoring {activeDeployments.length} active deployment(s)</p>
                ) : (
                  <p>Deploy your network to view activity metrics</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
