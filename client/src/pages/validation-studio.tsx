import { useState, useMemo } from "react";
import { 
  Play, 
  RefreshCw, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock,
  ChevronDown,
  ChevronRight,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useNetworkStore } from "@/lib/store";

type ValidationStatus = "passed" | "warning" | "error" | "pending" | "not_run";

interface TestSuite {
  id: string;
  name: string;
  status: ValidationStatus;
  issueCount: number;
}

interface ValidationIssue {
  id: string;
  type: "warning" | "error";
  title: string;
  description: string;
  actions: { label: string; action: string }[];
}

interface TestResult {
  name: string;
  status: ValidationStatus;
  issueCount?: number;
}

export default function ValidationStudioPage() {
  const { nodes, edges } = useNetworkStore();
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null);

  // Mock test suites based on actual network state
  const testSuites: TestSuite[] = useMemo(() => [
    { 
      id: "connectivity", 
      name: "Network Connectivity", 
      status: nodes.length > 0 ? "passed" : "not_run",
      issueCount: 0 
    },
    { 
      id: "config", 
      name: "Configuration Validation", 
      status: edges.length > 0 ? "passed" : "warning",
      issueCount: edges.length === 0 ? 2 : 0 
    },
    { 
      id: "performance", 
      name: "Performance Tests", 
      status: "pending",
      issueCount: 0 
    },
    { 
      id: "security", 
      name: "Security Checks", 
      status: "not_run",
      issueCount: 0 
    },
  ], [nodes.length, edges.length]);

  const validationHistory = [
    { id: "1", name: "Full Network Validation", date: "Today at 2:45 PM", status: "passed" as ValidationStatus },
    { id: "2", name: "Quick Configuration Check", date: "Today at 11:23 AM", status: "warning" as ValidationStatus, issues: 2 },
    { id: "3", name: "Security Audit", date: "Yesterday at 4:15 PM", status: "passed" as ValidationStatus },
  ];

  const issues: ValidationIssue[] = useMemo(() => {
    const detectedIssues: ValidationIssue[] = [];
    
    if (edges.length === 0 && nodes.length > 1) {
      detectedIssues.push({
        id: "1",
        type: "warning",
        title: "No Connections Detected",
        description: "Your network nodes are not connected. Connect peers to organizations to establish the network topology.",
        actions: [
          { label: "View Details", action: "view" },
        ],
      });
    }
    
    const orgCount = nodes.filter(n => n.data?.type === "organization").length;
    const peerCount = nodes.filter(n => n.data?.type === "peer").length;
    
    if (orgCount > 0 && peerCount === 0) {
      detectedIssues.push({
        id: "2",
        type: "warning",
        title: "Organizations Without Peers",
        description: "You have organizations defined but no peer nodes. Add peer nodes for a functional network.",
        actions: [
          { label: "View Details", action: "view" },
        ],
      });
    }

    return detectedIssues;
  }, [nodes, edges]);

  const testSummary: TestResult[] = useMemo(() => [
    { name: "Network topology validation", status: nodes.length > 0 ? "passed" : "not_run" },
    { name: "Channel configuration", status: "passed" },
    { name: "Orderer connectivity", status: nodes.filter(n => n.data?.type === "orderer").length > 0 ? "passed" : "pending" },
    { name: "Peer network configuration", status: edges.length > 0 ? "passed" : "warning", issueCount: edges.length === 0 ? 2 : 0 },
    { name: "Chaincode deployment readiness", status: "passed" },
    { name: "MSP configuration validation", status: "passed" },
  ], [nodes, edges]);

  const stats = useMemo(() => ({
    passed: testSummary.filter(t => t.status === "passed").length,
    warnings: testSummary.filter(t => t.status === "warning").length,
    errors: testSummary.filter(t => t.status === "error").length,
  }), [testSummary]);

  const runValidation = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 2000);
  };

  const getStatusIcon = (status: ValidationStatus) => {
    switch (status) {
      case "passed": return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "error": return <XCircle className="w-4 h-4 text-red-500" />;
      case "pending": return <Clock className="w-4 h-4 text-muted-foreground" />;
      default: return <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: ValidationStatus, issueCount?: number) => {
    switch (status) {
      case "passed":
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Passed</Badge>;
      case "warning":
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">{issueCount} Issues</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Failed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">Not Run</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between h-14 px-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <h1 className="text-base font-semibold text-foreground">Validation Studio</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={runValidation}
            disabled={isRunning}
            className="gap-2"
            data-testid="button-run-validation"
          >
            <Play className="w-4 h-4" />
            Run Validation
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            data-testid="button-rerun-tests"
          >
            <RefreshCw className="w-4 h-4" />
            Re-run Tests
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            data-testid="button-settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Test Suites Sidebar */}
        <div className="w-72 border-r border-border bg-card overflow-y-auto">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">Test Suites</h2>
              <Button variant="ghost" size="icon" className="w-6 h-6">
                <span className="text-lg">+</span>
              </Button>
            </div>
            <div className="space-y-2">
              {testSuites.map((suite) => (
                <div
                  key={suite.id}
                  onClick={() => setSelectedSuite(suite.id)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover-elevate ${
                    selectedSuite === suite.id ? "bg-accent" : ""
                  }`}
                  data-testid={`test-suite-${suite.id}`}
                >
                  <div className="flex items-center gap-2">
                    {getStatusIcon(suite.status)}
                    <span className="text-sm text-foreground">{suite.name}</span>
                  </div>
                  {getStatusBadge(suite.status, suite.issueCount)}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Validation History
            </h3>
            <div className="space-y-2">
              {validationHistory.map((item) => (
                <div key={item.id} className="p-3 rounded-lg bg-accent/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                    {getStatusBadge(item.status, item.issues)}
                  </div>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Network Diagram */}
        <div className="flex-1 p-4 bg-background overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Network Diagram</h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <span className="text-xs">+</span>
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <span className="text-xs">-</span>
              </Button>
            </div>
          </div>

          <Card className="min-h-[400px] flex items-center justify-center">
            {nodes.length === 0 ? (
              <div className="text-center text-muted-foreground">
                <p>No network topology to validate</p>
                <p className="text-sm mt-2">Design your network in the Canvas first</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-8 p-8">
                {nodes.filter(n => n.data?.type === "orderer").length > 0 && (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                      <div className="w-10 h-10 bg-cyan-200 dark:bg-cyan-800/50 rounded" />
                    </div>
                    <span className="text-sm font-medium">Orderer</span>
                    <Badge className="bg-green-100 text-green-700 text-xs">Valid</Badge>
                  </div>
                )}
                {nodes.filter(n => n.data?.type === "peer").map((peer, idx) => (
                  <div key={peer.id} className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <div className="w-10 h-10 bg-blue-200 dark:bg-blue-800/50 rounded" />
                    </div>
                    <span className="text-sm font-medium">{peer.data?.label || `Peer ${idx}`}</span>
                    <Badge className="bg-green-100 text-green-700 text-xs">Valid</Badge>
                  </div>
                ))}
                {nodes.filter(n => n.data?.type === "organization").map((org, idx) => (
                  <div key={org.id} className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <div className="w-10 h-10 bg-purple-200 dark:bg-purple-800/50 rounded" />
                    </div>
                    <span className="text-sm font-medium">{org.data?.label || `Org ${idx + 1}`}</span>
                    <Badge className="bg-green-100 text-green-700 text-xs">Valid</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Validation Results */}
        <div className="w-80 border-l border-border bg-card overflow-y-auto">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">Validation Results</h2>
              <Button variant="ghost" size="sm" className="gap-1 text-xs" data-testid="button-export-report">
                <Download className="w-3 h-3" />
                Export Report
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.passed}</p>
                <p className="text-xs text-muted-foreground">Tests Passed</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.warnings}</p>
                <p className="text-xs text-muted-foreground">Warnings</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.errors}</p>
                <p className="text-xs text-muted-foreground">Errors</p>
              </div>
            </div>
          </div>

          {issues.length > 0 && (
            <div className="p-4 border-b border-border">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                Issues Detected
              </h3>
              <div className="space-y-3">
                {issues.map((issue) => (
                  <Card key={issue.id} className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                          issue.type === "error" ? "text-red-500" : "text-amber-500"
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-foreground">{issue.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{issue.description}</p>
                        </div>
                      </div>
                      <Badge className={`text-xs ${
                        issue.type === "error" 
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" 
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      }`}>
                        {issue.type === "error" ? "Error" : "Warning"}
                      </Badge>
                    </div>
                    <div className="flex gap-2 pt-1">
                      {issue.actions.map((action, idx) => (
                        <Button key={idx} variant="link" size="sm" className="h-auto p-0 text-xs">
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="p-4">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Test Summary
            </h3>
            <div className="space-y-2">
              {testSummary.map((test, idx) => (
                <div key={idx} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(test.status)}
                    <span className="text-sm text-foreground">{test.name}</span>
                  </div>
                  {getStatusBadge(test.status, test.issueCount)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
