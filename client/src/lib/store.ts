import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { 
  NetworkConfig, 
  FabricCanvasNode, 
  Organization, 
  Peer, 
  Orderer, 
  CA, 
  Channel, 
  Chaincode,
  Deployment,
  ValidationTest,
  ValidationIssue 
} from "@shared/schema";
import type { Edge, Node, Connection } from "@xyflow/react";

// Canvas node data structure for React Flow
export interface CanvasNodeData extends Record<string, unknown> {
  label: string;
  description?: string;
  type: string;
  config?: Record<string, unknown>;
}

// Zustand store interface for network state management
interface NetworkStore {
  // Current network configuration
  currentNetwork: NetworkConfig | null;
  networkName: string;
  consensusType: string;
  channelName: string;
  
  // React Flow state
  nodes: Node<CanvasNodeData>[];
  edges: Edge[];
  
  // Entity collections
  organizations: Organization[];
  peers: Peer[];
  orderers: Orderer[];
  cas: CA[];
  channels: Channel[];
  chaincodes: Chaincode[];
  
  // Saved networks
  savedNetworks: NetworkConfig[];
  
  // Custom templates
  customTemplates: Array<{
    id: string;
    name: string;
    description: string;
    orgCount: number;
    peerCount: number;
    ordererCount: number;
    nodes: Node<CanvasNodeData>[];
    edges: Edge[];
    organizations: Organization[];
    peers: Peer[];
    orderers: Orderer[];
    cas: CA[];
    channels: Channel[];
    chaincodes: Chaincode[];
    createdAt: string;
  }>;
  
  // Deployments
  deployments: Deployment[];
  
  // Validation state
  validationTests: ValidationTest[];
  validationIssues: ValidationIssue[];
  
  // Network settings actions
  setNetworkName: (name: string) => void;
  setConsensusType: (type: string) => void;
  setChannelName: (name: string) => void;
  
  // Node/Edge actions for React Flow
  setNodes: (nodes: Node<CanvasNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node<CanvasNodeData>) => void;
  removeNode: (nodeId: string) => void;
  updateNode: (nodeId: string, data: Partial<CanvasNodeData>) => void;
  addEdge: (edge: Edge) => void;
  removeEdge: (edgeId: string) => void;
  
  // Connection validation: Peers can only connect to Organizations
  isValidConnection: (connection: Connection) => boolean;
  
  // Entity actions
  addOrganization: (org: Organization) => void;
  updateOrganization: (id: string, org: Partial<Organization>) => void;
  removeOrganization: (id: string) => void;
  
  addPeer: (peer: Peer) => void;
  updatePeer: (id: string, peer: Partial<Peer>) => void;
  removePeer: (id: string) => void;
  
  addOrderer: (orderer: Orderer) => void;
  updateOrderer: (id: string, orderer: Partial<Orderer>) => void;
  removeOrderer: (id: string) => void;
  
  addCA: (ca: CA) => void;
  updateCA: (id: string, ca: Partial<CA>) => void;
  removeCA: (id: string) => void;
  
  addChannel: (channel: Channel) => void;
  updateChannel: (id: string, channel: Partial<Channel>) => void;
  removeChannel: (id: string) => void;
  
  addChaincode: (chaincode: Chaincode) => void;
  updateChaincode: (id: string, chaincode: Partial<Chaincode>) => void;
  removeChaincode: (id: string) => void;
  
  // Network actions
  saveNetwork: () => void;
  loadNetwork: (networkId: string) => void;
  deleteNetwork: (networkId: string) => void;
  clearCanvas: () => void;
  
  // Template actions
  saveAsTemplate: (name: string, description: string) => void;
  loadTemplate: (templateId: string) => void;
  deleteTemplate: (templateId: string) => void;
  
  // Deployment actions
  addDeployment: (deployment: Deployment) => void;
  updateDeployment: (id: string, deployment: Partial<Deployment>) => void;
  removeDeployment: (id: string) => void;
  
  // Validation actions
  setValidationTests: (tests: ValidationTest[]) => void;
  setValidationIssues: (issues: ValidationIssue[]) => void;
}

// Helper to generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useNetworkStore = create<NetworkStore>()(
  persist(
    (set, get) => ({
      currentNetwork: null,
      networkName: "my-fabric-network",
      consensusType: "etcdraft",
      channelName: "mychannel",
      nodes: [],
      edges: [],
      organizations: [],
      peers: [],
      orderers: [],
      cas: [],
      channels: [],
      chaincodes: [],
      savedNetworks: [],
      customTemplates: [],
      deployments: [],
      validationTests: [],
      validationIssues: [],
      
      setNetworkName: (name) => set({ networkName: name }),
      setConsensusType: (type) => set({ consensusType: type }),
      setChannelName: (name) => set({ channelName: name }),
      
      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),
      
      addNode: (node) => set((state) => ({ 
        nodes: [...state.nodes, node] 
      })),
      
      removeNode: (nodeId) => set((state) => ({
        nodes: state.nodes.filter((n) => n.id !== nodeId),
        edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      })),
      
      updateNode: (nodeId, data) => set((state) => ({
        nodes: state.nodes.map((n) => 
          n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
        ),
      })),
      
      addEdge: (edge) => set((state) => ({
        edges: [...state.edges, edge],
      })),
      
      removeEdge: (edgeId) => set((state) => ({
        edges: state.edges.filter((e) => e.id !== edgeId),
      })),
      
      // Validation: Peers can only connect to Organizations
      isValidConnection: (connection) => {
        const { nodes } = get();
        const sourceNode = nodes.find((n) => n.id === connection.source);
        const targetNode = nodes.find((n) => n.id === connection.target);
        
        if (!sourceNode || !targetNode) return false;
        
        const sourceType = sourceNode.data?.type;
        const targetType = targetNode.data?.type;
        
        // Peer nodes can only connect to Organization nodes
        if (sourceType === "peer" && targetType !== "organization") return false;
        if (targetType === "peer" && sourceType !== "organization") return false;
        
        // CA nodes connect to Organizations
        if (sourceType === "ca" && targetType !== "organization") return false;
        if (targetType === "ca" && sourceType !== "organization") return false;
        
        // Orderers connect to Channels or Organizations
        if (sourceType === "orderer" && !["channel", "organization"].includes(targetType || "")) return false;
        
        // Channel connects to Organizations
        if (sourceType === "channel" && targetType !== "organization") return false;
        if (targetType === "channel" && !["organization", "orderer"].includes(sourceType || "")) return false;
        
        return true;
      },
      
      addOrganization: (org) => set((state) => ({
        organizations: [...state.organizations, org],
      })),
      
      updateOrganization: (id, org) => set((state) => ({
        organizations: state.organizations.map((o) =>
          o.id === id ? { ...o, ...org } : o
        ),
      })),
      
      removeOrganization: (id) => set((state) => ({
        organizations: state.organizations.filter((o) => o.id !== id),
      })),
      
      addPeer: (peer) => set((state) => ({
        peers: [...state.peers, peer],
      })),
      
      updatePeer: (id, peer) => set((state) => ({
        peers: state.peers.map((p) =>
          p.id === id ? { ...p, ...peer } : p
        ),
      })),
      
      removePeer: (id) => set((state) => ({
        peers: state.peers.filter((p) => p.id !== id),
      })),
      
      addOrderer: (orderer) => set((state) => ({
        orderers: [...state.orderers, orderer],
      })),
      
      updateOrderer: (id, orderer) => set((state) => ({
        orderers: state.orderers.map((o) =>
          o.id === id ? { ...o, ...orderer } : o
        ),
      })),
      
      removeOrderer: (id) => set((state) => ({
        orderers: state.orderers.filter((o) => o.id !== id),
      })),
      
      addCA: (ca) => set((state) => ({
        cas: [...state.cas, ca],
      })),
      
      updateCA: (id, ca) => set((state) => ({
        cas: state.cas.map((c) =>
          c.id === id ? { ...c, ...ca } : c
        ),
      })),
      
      removeCA: (id) => set((state) => ({
        cas: state.cas.filter((c) => c.id !== id),
      })),
      
      addChannel: (channel) => set((state) => ({
        channels: [...state.channels, channel],
      })),
      
      updateChannel: (id, channel) => set((state) => ({
        channels: state.channels.map((c) =>
          c.id === id ? { ...c, ...channel } : c
        ),
      })),
      
      removeChannel: (id) => set((state) => ({
        channels: state.channels.filter((c) => c.id !== id),
      })),
      
      addChaincode: (chaincode) => set((state) => ({
        chaincodes: [...state.chaincodes, chaincode],
      })),
      
      updateChaincode: (id, chaincode) => set((state) => ({
        chaincodes: state.chaincodes.map((c) =>
          c.id === id ? { ...c, ...chaincode } : c
        ),
      })),
      
      removeChaincode: (id) => set((state) => ({
        chaincodes: state.chaincodes.filter((c) => c.id !== id),
      })),
      
      saveNetwork: () => {
        const state = get();
        const network: NetworkConfig = {
          id: generateId(),
          name: state.networkName,
          consensusType: state.consensusType as "etcdraft" | "bft" | "solo",
          channelName: state.channelName,
          organizations: state.organizations,
          peers: state.peers,
          orderers: state.orderers,
          cas: state.cas,
          channels: state.channels,
          chaincodes: state.chaincodes,
          nodes: state.nodes.map((n) => ({
            id: n.id,
            type: n.data?.type as any,
            label: n.data?.label || "",
            description: n.data?.description,
            position: n.position,
            data: n.data?.config,
          })),
          edges: state.edges.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            type: e.type,
          })),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: "stopped",
        };
        
        set((s) => ({
          savedNetworks: [...s.savedNetworks, network],
          currentNetwork: network,
        }));
      },
      
      loadNetwork: (networkId) => {
        const { savedNetworks } = get();
        const network = savedNetworks.find((n) => n.id === networkId);
        if (!network) return;
        
        set({
          currentNetwork: network,
          networkName: network.name,
          consensusType: network.consensusType,
          channelName: network.channelName,
          organizations: network.organizations,
          peers: network.peers,
          orderers: network.orderers,
          cas: network.cas,
          channels: network.channels,
          chaincodes: network.chaincodes,
          nodes: network.nodes.map((n) => ({
            id: n.id,
            type: n.type,
            position: n.position,
            data: {
              label: n.label,
              description: n.description,
              type: n.type,
              config: n.data,
            },
          })),
          edges: network.edges.map((e) => ({
            id: e.id,
            source: e.source,
            target: e.target,
            type: e.type || "smoothstep",
          })),
        });
      },
      
      deleteNetwork: (networkId) => set((state) => ({
        savedNetworks: state.savedNetworks.filter((n) => n.id !== networkId),
      })),
      
      clearCanvas: () => set({
        nodes: [],
        edges: [],
        organizations: [],
        peers: [],
        orderers: [],
        cas: [],
        channels: [],
        chaincodes: [],
        currentNetwork: null,
      }),
      
      saveAsTemplate: (name, description) => {
        const state = get();
        const orgCount = state.nodes.filter(n => n.data?.type === "organization").length;
        const peerCount = state.nodes.filter(n => n.data?.type === "peer").length;
        const ordererCount = state.nodes.filter(n => n.data?.type === "orderer").length;
        
        const template = {
          id: generateId(),
          name,
          description,
          orgCount,
          peerCount,
          ordererCount,
          nodes: state.nodes,
          edges: state.edges,
          organizations: state.organizations,
          peers: state.peers,
          orderers: state.orderers,
          cas: state.cas,
          channels: state.channels,
          chaincodes: state.chaincodes,
          createdAt: new Date().toISOString(),
        };
        
        set((s) => ({
          customTemplates: [...s.customTemplates, template],
        }));
      },
      
      loadTemplate: (templateId) => {
        const { customTemplates } = get();
        const template = customTemplates.find((t) => t.id === templateId);
        if (!template) return;
        
        set({
          nodes: template.nodes,
          edges: template.edges,
          organizations: template.organizations,
          peers: template.peers,
          orderers: template.orderers,
          cas: template.cas,
          channels: template.channels,
          chaincodes: template.chaincodes,
          networkName: template.name.toLowerCase().replace(/\s+/g, '-'),
        });
      },
      
      deleteTemplate: (templateId) => set((state) => ({
        customTemplates: state.customTemplates.filter((t) => t.id !== templateId),
      })),
      
      addDeployment: (deployment) => set((state) => ({
        deployments: [...state.deployments, deployment],
      })),
      
      updateDeployment: (id, deployment) => set((state) => ({
        deployments: state.deployments.map((d) =>
          d.id === id ? { ...d, ...deployment } : d
        ),
      })),
      
      removeDeployment: (id) => set((state) => ({
        deployments: state.deployments.filter((d) => d.id !== id),
      })),
      
      setValidationTests: (tests) => set({ validationTests: tests }),
      setValidationIssues: (issues) => set({ validationIssues: issues }),
    }),
    {
      name: "fabric-network-store",
      partialize: (state) => ({
        savedNetworks: state.savedNetworks,
        customTemplates: state.customTemplates,
        deployments: state.deployments,
      }),
    }
  )
);
