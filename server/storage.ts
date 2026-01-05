import { 
  type User, 
  type InsertUser,
  type NetworkConfig,
  type InsertNetwork,
  type Organization,
  type Peer,
  type Orderer,
  type CA,
  type Channel,
  type Chaincode,
  type Deployment,
  type ValidationTest,
  type ValidationIssue
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods (legacy)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Network methods
  getAllNetworks(): Promise<NetworkConfig[]>;
  getNetwork(id: string): Promise<NetworkConfig | undefined>;
  createNetwork(network: InsertNetwork): Promise<NetworkConfig>;
  updateNetwork(id: string, network: Partial<NetworkConfig>): Promise<NetworkConfig | undefined>;
  deleteNetwork(id: string): Promise<boolean>;
  
  // Deployment methods
  getAllDeployments(): Promise<Deployment[]>;
  getDeployment(id: string): Promise<Deployment | undefined>;
  createDeployment(deployment: Omit<Deployment, "id">): Promise<Deployment>;
  updateDeployment(id: string, deployment: Partial<Deployment>): Promise<Deployment | undefined>;
  deleteDeployment(id: string): Promise<boolean>;
  
  // Validation methods
  runValidation(networkId: string): Promise<{ tests: ValidationTest[]; issues: ValidationIssue[] }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private networks: Map<string, NetworkConfig>;
  private deployments: Map<string, Deployment>;

  constructor() {
    this.users = new Map();
    this.networks = new Map();
    this.deployments = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Add sample networks
    const sampleNetwork: NetworkConfig = {
      id: "sample-1",
      name: "Production Network",
      consensusType: "etcdraft",
      channelName: "prodchannel",
      organizations: [
        { id: "org1", name: "Org1", mspId: "Org1MSP", domain: "org1.example.com" },
        { id: "org2", name: "Org2", mspId: "Org2MSP", domain: "org2.example.com" },
      ],
      peers: [
        { id: "peer0-org1", name: "peer0.org1", organizationId: "org1", host: "peer0.org1.example.com", port: 7051, tlsEnabled: true, couchDbEnabled: false },
        { id: "peer0-org2", name: "peer0.org2", organizationId: "org2", host: "peer0.org2.example.com", port: 7051, tlsEnabled: true, couchDbEnabled: false },
      ],
      orderers: [
        { id: "orderer0", name: "orderer0", host: "orderer.example.com", port: 7050, tlsEnabled: true },
      ],
      cas: [
        { id: "ca-org1", name: "ca.org1", organizationId: "org1", host: "ca.org1.example.com", port: 7054, tlsEnabled: true },
        { id: "ca-org2", name: "ca.org2", organizationId: "org2", host: "ca.org2.example.com", port: 7054, tlsEnabled: true },
      ],
      channels: [
        { id: "ch1", name: "prodchannel", organizations: ["org1", "org2"], orderers: ["orderer0"] },
      ],
      chaincodes: [
        { id: "cc1", name: "asset-transfer", version: "1.0", language: "go", channelId: "ch1" },
      ],
      nodes: [],
      edges: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "active",
    };
    
    this.networks.set(sampleNetwork.id, sampleNetwork);
    
    // Add sample deployment
    const sampleDeployment: Deployment = {
      id: "deploy-1",
      networkId: "sample-1",
      networkName: "Production Network",
      status: "active",
      totalNodes: 5,
      peerCount: 2,
      ordererCount: 1,
      caCount: 2,
      uptime: "14d 6h 23m",
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      lastActive: new Date().toISOString(),
    };
    
    this.deployments.set(sampleDeployment.id, sampleDeployment);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Network methods
  async getAllNetworks(): Promise<NetworkConfig[]> {
    return Array.from(this.networks.values());
  }

  async getNetwork(id: string): Promise<NetworkConfig | undefined> {
    return this.networks.get(id);
  }

  async createNetwork(network: InsertNetwork): Promise<NetworkConfig> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const newNetwork: NetworkConfig = { 
      ...network, 
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.networks.set(id, newNetwork);
    return newNetwork;
  }

  async updateNetwork(id: string, updates: Partial<NetworkConfig>): Promise<NetworkConfig | undefined> {
    const existing = this.networks.get(id);
    if (!existing) return undefined;
    
    const updated: NetworkConfig = { 
      ...existing, 
      ...updates, 
      id,
      updatedAt: new Date().toISOString(),
    };
    this.networks.set(id, updated);
    return updated;
  }

  async deleteNetwork(id: string): Promise<boolean> {
    return this.networks.delete(id);
  }

  // Deployment methods
  async getAllDeployments(): Promise<Deployment[]> {
    return Array.from(this.deployments.values());
  }

  async getDeployment(id: string): Promise<Deployment | undefined> {
    return this.deployments.get(id);
  }

  async createDeployment(deployment: Omit<Deployment, "id">): Promise<Deployment> {
    const id = randomUUID();
    const newDeployment: Deployment = { ...deployment, id };
    this.deployments.set(id, newDeployment);
    return newDeployment;
  }

  async updateDeployment(id: string, updates: Partial<Deployment>): Promise<Deployment | undefined> {
    const existing = this.deployments.get(id);
    if (!existing) return undefined;
    
    const updated: Deployment = { ...existing, ...updates, id };
    this.deployments.set(id, updated);
    return updated;
  }

  async deleteDeployment(id: string): Promise<boolean> {
    return this.deployments.delete(id);
  }

  // Validation methods
  async runValidation(networkId: string): Promise<{ tests: ValidationTest[]; issues: ValidationIssue[] }> {
    const network = await this.getNetwork(networkId);
    const tests: ValidationTest[] = [];
    const issues: ValidationIssue[] = [];
    
    // Org count validation
    const orgStatus = network && network.organizations.length >= 1 ? "passed" : "error";
    tests.push({
      id: "org-count",
      name: "Organization Count",
      status: orgStatus,
      issueCount: orgStatus === "error" ? 1 : 0,
    });
    if (orgStatus === "error") {
      issues.push({
        id: randomUUID(),
        type: "error",
        title: "No organizations defined",
        description: "Network must have at least one organization",
        fixable: false,
      });
    }
    
    // Orderer count validation
    const ordererStatus = network && network.orderers.length >= 1 ? "passed" : "error";
    tests.push({
      id: "orderer-count",
      name: "Orderer Presence",
      status: ordererStatus,
      issueCount: ordererStatus === "error" ? 1 : 0,
    });
    if (ordererStatus === "error") {
      issues.push({
        id: randomUUID(),
        type: "error",
        title: "No orderers defined",
        description: "Network must have at least one orderer node",
        fixable: false,
      });
    }
    
    // Peer-org mapping validation
    const unmappedPeers = network ? network.peers.filter(p => !p.organizationId) : [];
    const peerStatus = unmappedPeers.length === 0 ? "passed" : "warning";
    tests.push({
      id: "peer-org",
      name: "Peer-Organization Mapping",
      status: peerStatus,
      issueCount: unmappedPeers.length,
    });
    unmappedPeers.forEach(peer => {
      issues.push({
        id: randomUUID(),
        type: "warning",
        title: `Peer ${peer.name} has no organization`,
        description: "Each peer should be connected to an organization",
        nodeId: peer.id,
        fixable: true,
      });
    });
    
    // Channel organizations validation
    const channelsWithFewOrgs = network ? network.channels.filter(c => c.organizations.length < 2) : [];
    const channelStatus = channelsWithFewOrgs.length === 0 ? "passed" : "warning";
    tests.push({
      id: "channel-orgs",
      name: "Channel Organizations",
      status: channelStatus,
      issueCount: channelsWithFewOrgs.length,
    });
    channelsWithFewOrgs.forEach(channel => {
      issues.push({
        id: randomUUID(),
        type: "warning",
        title: `Channel ${channel.name} has fewer than 2 organizations`,
        description: "Channels should have at least two organizations for proper decentralization",
        nodeId: channel.id,
        fixable: true,
      });
    });
    
    // Chaincode channel validation
    const orphanedChaincodes = network ? network.chaincodes.filter(cc => !cc.channelId) : [];
    const chaincodeStatus = orphanedChaincodes.length === 0 ? "passed" : "warning";
    tests.push({
      id: "chaincode-channel",
      name: "Chaincode Deployment",
      status: chaincodeStatus,
      issueCount: orphanedChaincodes.length,
    });
    orphanedChaincodes.forEach(cc => {
      issues.push({
        id: randomUUID(),
        type: "warning",
        title: `Chaincode ${cc.name} has no channel`,
        description: "Chaincodes must be associated with a channel",
        nodeId: cc.id,
        fixable: true,
      });
    });
    
    // CA configuration validation
    const caOrgIds = network ? new Set(network.cas.map(ca => ca.organizationId)) : new Set();
    const orgsWithoutCA = network ? network.organizations.filter(org => !caOrgIds.has(org.id)) : [];
    const caStatus = orgsWithoutCA.length === 0 ? "passed" : "warning";
    tests.push({
      id: "ca-org",
      name: "CA Configuration",
      status: caStatus,
      issueCount: orgsWithoutCA.length,
    });
    orgsWithoutCA.forEach(org => {
      issues.push({
        id: randomUUID(),
        type: "warning",
        title: `Organization ${org.name} has no Certificate Authority`,
        description: "Each organization should have a Certificate Authority for identity management",
        nodeId: org.id,
        fixable: true,
      });
    });
    
    return { tests, issues };
  }
}

export const storage = new MemStorage();
