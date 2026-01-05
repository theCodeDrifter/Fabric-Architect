import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Play, AlertCircle } from "lucide-react";
import { useNetworkStore } from "@/lib/store";

const validationRules = [
  {
    id: "org-count",
    title: "Organization Count",
    description: "Network must have at least one organization",
    category: "Structure",
  },
  {
    id: "orderer-count",
    title: "Orderer Presence",
    description: "Network must have at least one orderer node",
    category: "Structure",
  },
  {
    id: "peer-org",
    title: "Peer-Organization Mapping",
    description: "Each peer must be connected to an organization",
    category: "Connectivity",
  },
  {
    id: "channel-orgs",
    title: "Channel Organizations",
    description: "Each channel should have at least two organizations",
    category: "Channels",
  },
  {
    id: "chaincode-channel",
    title: "Chaincode Deployment",
    description: "Chaincodes must be associated with a channel",
    category: "Smart Contracts",
  },
  {
    id: "ca-org",
    title: "CA Configuration",
    description: "Each organization should have a Certificate Authority",
    category: "Security",
  },
];

export default function ValidatorPage() {
  const { nodes, organizations, orderers, peers, channels, chaincodes, cas } = useNetworkStore();

  const orgCount = useMemo(() => 
    nodes.filter(n => n.data?.type === "organization").length || organizations.length, 
    [nodes, organizations]
  );
  const peerCount = useMemo(() => 
    nodes.filter(n => n.data?.type === "peer").length || peers.length, 
    [nodes, peers]
  );
  const ordererCount = useMemo(() => 
    nodes.filter(n => n.data?.type === "orderer").length || orderers.length, 
    [nodes, orderers]
  );
  const caCount = useMemo(() => 
    nodes.filter(n => n.data?.type === "ca").length || cas.length, 
    [nodes, cas]
  );
  const channelCount = useMemo(() => 
    nodes.filter(n => n.data?.type === "channel").length || channels.length, 
    [nodes, channels]
  );
  const chaincodeCount = useMemo(() => 
    nodes.filter(n => n.data?.type === "chaincode").length || chaincodes.length, 
    [nodes, chaincodes]
  );

  const hasNetwork = nodes.length > 0;

  const getValidationStatus = (ruleId: string) => {
    switch (ruleId) {
      case "org-count":
        return orgCount >= 1 ? "pass" : "fail";
      case "orderer-count":
        return ordererCount >= 1 ? "pass" : "fail";
      case "peer-org":
        return peerCount === 0 || peers.every(p => p.organizationId) ? "pass" : "warning";
      case "channel-orgs":
        return channelCount === 0 || channels.every(c => (c.organizations?.length || 0) >= 2) ? "pass" : "warning";
      case "chaincode-channel":
        return chaincodeCount === 0 || chaincodes.every(cc => cc.channelId) ? "pass" : "warning";
      case "ca-org":
        return orgCount === 0 || caCount >= orgCount ? "pass" : "warning";
      default:
        return "pending";
    }
  };

  const statusCounts = {
    pass: validationRules.filter(r => getValidationStatus(r.id) === "pass").length,
    warning: validationRules.filter(r => getValidationStatus(r.id) === "warning").length,
    fail: validationRules.filter(r => getValidationStatus(r.id) === "fail").length,
  };

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold" data-testid="text-page-title">Network Validator</h1>
            <p className="text-muted-foreground mt-1">
              Validate your network configuration against best practices
            </p>
          </div>
          <Button data-testid="button-run-validation">
            <Play className="w-4 h-4 mr-2" />
            Run Validation
          </Button>
        </div>

        {!hasNetwork && (
          <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-900/10">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">No network configured</p>
                <p className="text-sm text-muted-foreground">
                  Design your network in the Canvas first to run validation checks.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold" data-testid="text-pass-count">{statusCounts.pass}</p>
                  <p className="text-sm text-muted-foreground">Passed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold" data-testid="text-warning-count">{statusCounts.warning}</p>
                  <p className="text-sm text-muted-foreground">Warnings</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <XCircle className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-semibold" data-testid="text-fail-count">{statusCounts.fail}</p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              Validation Rules
            </CardTitle>
            <CardDescription>
              Configuration rules validated against your network design
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {validationRules.map((rule) => {
                const status = getValidationStatus(rule.id);
                return (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between gap-4 p-3 rounded-md bg-muted/50"
                    data-testid={`rule-${rule.id}`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {status === "pass" && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />}
                      {status === "warning" && <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />}
                      {status === "fail" && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium">{rule.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {rule.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {rule.description}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={status === "pass" ? "default" : status === "warning" ? "secondary" : "destructive"}
                      className="flex-shrink-0"
                    >
                      {status === "pass" ? "Passed" : status === "warning" ? "Warning" : "Failed"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
