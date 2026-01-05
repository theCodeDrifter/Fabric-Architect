import { useState } from "react";
import { Save, FileCode, Rocket, ZoomIn, ZoomOut, Maximize2, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNetworkStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";

interface CanvasHeaderProps {
  onExportConfig?: () => void;
  onSave?: () => void;
  onDeploy?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitView?: () => void;
}

export function CanvasHeader({ 
  onExportConfig, 
  onSave, 
  onDeploy,
  onZoomIn,
  onZoomOut,
  onFitView
}: CanvasHeaderProps) {
  const { networkName, saveNetwork, saveAsTemplate, nodes, edges } = useNetworkStore();
  const { toast } = useToast();
  
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");

  const handleSaveAsTemplate = () => {
    if (nodes.length === 0) {
      toast({
        title: "Nothing to save",
        description: "Add some nodes to the canvas first.",
        variant: "destructive",
      });
      return;
    }
    
    if (!templateName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a template name.",
        variant: "destructive",
      });
      return;
    }
    
    saveAsTemplate(templateName.trim(), templateDescription.trim());
    toast({
      title: "Template saved",
      description: `${templateName} has been saved as a template.`,
    });
    setShowTemplateDialog(false);
    setTemplateName("");
    setTemplateDescription("");
  };

  const handleExport = () => {
    if (nodes.length === 0) {
      toast({
        title: "Nothing to export",
        description: "Add some nodes to the canvas first.",
        variant: "destructive",
      });
      return;
    }
    onExportConfig?.();
  };

  const handleDeploy = () => {
    if (nodes.length === 0) {
      toast({
        title: "Nothing to deploy",
        description: "Design your network first.",
        variant: "destructive",
      });
      return;
    }
    onDeploy?.();
    toast({
      title: "Deployment initiated",
      description: "Your network is being prepared for deployment.",
    });
  };

  return (
    <>
    <header className="flex items-center justify-between h-14 px-4 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
            <LayoutGrid className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">
              Fabric Network Designer
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              {networkName}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTemplateDialog(true)}
          className="gap-2"
          data-testid="button-save-template"
        >
          <Save className="w-4 h-4" />
          Save as Template
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="gap-2"
          data-testid="button-export-config"
        >
          <FileCode className="w-4 h-4" />
          Export Config
        </Button>
        
        <Button
          size="sm"
          onClick={handleDeploy}
          className="gap-2"
          data-testid="button-deploy"
        >
          <Rocket className="w-4 h-4" />
          Deploy Network
        </Button>

        <Separator orientation="vertical" className="h-6 mx-2" />

        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-8 h-8"
            onClick={onZoomIn}
            data-testid="button-zoom-in"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-8 h-8"
            onClick={onZoomOut}
            data-testid="button-zoom-out"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-8 h-8"
            onClick={onFitView}
            data-testid="button-fit-view"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
    
    <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              placeholder="My Custom Network"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              data-testid="input-template-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              placeholder="Describe your network template..."
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              data-testid="input-template-description"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveAsTemplate} data-testid="button-confirm-save-template">
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
