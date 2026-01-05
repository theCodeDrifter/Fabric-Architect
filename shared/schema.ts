import { z } from "zod";

// Fabric Node Types for the visual canvas
export const FabricNodeType = {
  ORGANIZATION: "organization",
  PEER: "peer",
  ORDERER: "orderer",
  CA: "ca",
  CHANNEL: "channel",
  CHAINCODE: "chaincode",
} as const;

export type FabricNodeType = (typeof FabricNodeType)[keyof typeof FabricNodeType];

// Consensus types supported by Hyperledger Fabric
export const ConsensusType = {
  RAFT: "etcdraft",
  BFT: "bft",
  SOLO: "solo",
} as const;

export type ConsensusType = (typeof ConsensusType)[keyof typeof ConsensusType];

// Network deployment status
export const DeploymentStatus = {
  ACTIVE: "active",
  DEPLOYING: "deploying",
  STOPPED: "stopped",
  ERROR: "error",
} as const;

export type DeploymentStatus = (typeof DeploymentStatus)[keyof typeof DeploymentStatus];

// Validation result status
export const ValidationStatus = {
  PASSED: "passed",
  WARNING: "warning",
  ERROR: "error",
  PENDING: "pending",
  NOT_RUN: "not_run",
} as const;

export type ValidationStatus = (typeof ValidationStatus)[keyof typeof ValidationStatus];

// Base schema for Fabric canvas nodes
export const fabricCanvasNodeSchema = z.object({
  id: z.string(),
  type: z.enum(["organization", "peer", "orderer", "ca", "channel", "chaincode"]),
  label: z.string(),
  description: z.string().optional(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.record(z.unknown()).optional(),
});

export type FabricCanvasNode = z.infer<typeof fabricCanvasNodeSchema>;

// Organization configuration
export const organizationSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  mspId: z.string().min(1),
  domain: z.string().min(1),
  anchorPeers: z.array(z.object({
    host: z.string(),
    port: z.number(),
  })).optional(),
});

export type Organization = z.infer<typeof organizationSchema>;

// Peer configuration
export const peerSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  organizationId: z.string(),
  host: z.string(),
  port: z.number().default(7051),
  tlsEnabled: z.boolean().default(true),
  couchDbEnabled: z.boolean().default(false),
});

export type Peer = z.infer<typeof peerSchema>;

// Orderer configuration
export const ordererSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  organizationId: z.string().optional(),
  host: z.string(),
  port: z.number().default(7050),
  tlsEnabled: z.boolean().default(true),
});

export type Orderer = z.infer<typeof ordererSchema>;

// Certificate Authority configuration
export const caSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  organizationId: z.string(),
  host: z.string(),
  port: z.number().default(7054),
  tlsEnabled: z.boolean().default(true),
});

export type CA = z.infer<typeof caSchema>;

// Channel configuration
export const channelSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  organizations: z.array(z.string()),
  orderers: z.array(z.string()),
});

export type Channel = z.infer<typeof channelSchema>;

// Chaincode configuration
export const chaincodeSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  version: z.string().default("1.0"),
  language: z.enum(["go", "node", "java"]).default("go"),
  channelId: z.string(),
});

export type Chaincode = z.infer<typeof chaincodeSchema>;

// Complete network configuration
export const networkConfigSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  consensusType: z.enum(["etcdraft", "bft", "solo"]).default("etcdraft"),
  channelName: z.string().default("mychannel"),
  organizations: z.array(organizationSchema),
  peers: z.array(peerSchema),
  orderers: z.array(ordererSchema),
  cas: z.array(caSchema),
  channels: z.array(channelSchema),
  chaincodes: z.array(chaincodeSchema),
  nodes: z.array(fabricCanvasNodeSchema),
  edges: z.array(z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    type: z.string().optional(),
  })),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  status: z.enum(["active", "deploying", "stopped", "error"]).optional(),
});

export type NetworkConfig = z.infer<typeof networkConfigSchema>;

// Insert schema for creating new networks
export const insertNetworkSchema = networkConfigSchema.omit({ id: true });
export type InsertNetwork = z.infer<typeof insertNetworkSchema>;

// Validation issue
export const validationIssueSchema = z.object({
  id: z.string(),
  type: z.enum(["warning", "error"]),
  title: z.string(),
  description: z.string(),
  nodeId: z.string().optional(),
  fixable: z.boolean().default(false),
});

export type ValidationIssue = z.infer<typeof validationIssueSchema>;

// Validation test suite
export const validationTestSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(["passed", "warning", "error", "pending", "not_run"]),
  issueCount: z.number().default(0),
});

export type ValidationTest = z.infer<typeof validationTestSchema>;

// Network deployment record
export const deploymentSchema = z.object({
  id: z.string(),
  networkId: z.string(),
  networkName: z.string(),
  status: z.enum(["active", "deploying", "stopped", "error"]),
  totalNodes: z.number(),
  peerCount: z.number(),
  ordererCount: z.number(),
  caCount: z.number(),
  uptime: z.string().optional(),
  progress: z.number().optional(),
  createdAt: z.string(),
  lastActive: z.string().optional(),
});

export type Deployment = z.infer<typeof deploymentSchema>;

// Legacy user schema for compatibility
export const users = {
  id: "",
  username: "",
  password: "",
};

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = { id: string; username: string; password: string };
