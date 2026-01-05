import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, Video, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const guides = [
  {
    title: "Getting Started",
    description: "Learn the basics of creating Hyperledger Fabric networks with the visual designer",
    type: "Guide",
    readTime: "5 min",
  },
  {
    title: "Network Architecture",
    description: "Understanding organizations, peers, orderers, and channels in Fabric networks",
    type: "Concept",
    readTime: "10 min",
  },
  {
    title: "Chaincode Deployment",
    description: "Step-by-step guide to deploying and managing smart contracts",
    type: "Tutorial",
    readTime: "15 min",
  },
  {
    title: "Configuration Export",
    description: "How to export your network design as production-ready YAML configurations",
    type: "Guide",
    readTime: "8 min",
  },
];

const resources = [
  {
    title: "Hyperledger Fabric Docs",
    description: "Official documentation for Hyperledger Fabric",
    icon: ExternalLink,
    href: "https://hyperledger-fabric.readthedocs.io/",
  },
  {
    title: "API Reference",
    description: "Complete API documentation for the Fabric Architect tool",
    icon: FileText,
    href: "#",
  },
  {
    title: "Video Tutorials",
    description: "Watch step-by-step tutorials on network design",
    icon: Video,
    href: "#",
  },
];

export default function DocumentationPage() {
  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Documentation</h1>
          <p className="text-muted-foreground mt-1">
            Learn how to design and deploy Hyperledger Fabric networks
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <Card key={resource.title} className="hover-elevate cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <resource.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium" data-testid={`text-resource-${resource.title.toLowerCase().replace(/\s+/g, "-")}`}>
                      {resource.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {resource.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
          <h2 className="text-lg font-medium mb-4">Guides & Tutorials</h2>
          <div className="space-y-3">
            {guides.map((guide) => (
              <Card key={guide.title} className="hover-elevate cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <BookOpen className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium" data-testid={`text-guide-${guide.title.toLowerCase().replace(/\s+/g, "-")}`}>
                            {guide.title}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            {guide.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {guide.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {guide.readTime}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button variant="outline" data-testid="button-view-all-docs">
            View All Documentation
          </Button>
        </div>
      </div>
    </div>
  );
}
