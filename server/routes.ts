import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNetworkSchema, networkConfigSchema } from "@shared/schema";
import yaml from "js-yaml";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Network CRUD endpoints
  
  // Get all networks
  app.get("/api/networks", async (_req, res) => {
    try {
      const networks = await storage.getAllNetworks();
      res.json(networks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch networks" });
    }
  });

  // Get single network
  app.get("/api/networks/:id", async (req, res) => {
    try {
      const network = await storage.getNetwork(req.params.id);
      if (!network) {
        return res.status(404).json({ error: "Network not found" });
      }
      res.json(network);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch network" });
    }
  });

  // Create network
  app.post("/api/networks", async (req, res) => {
    try {
      const parsed = insertNetworkSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid network data", details: parsed.error.errors });
      }
      const network = await storage.createNetwork(parsed.data);
      res.status(201).json(network);
    } catch (error) {
      res.status(500).json({ error: "Failed to create network" });
    }
  });

  // Update network
  app.patch("/api/networks/:id", async (req, res) => {
    try {
      const network = await storage.updateNetwork(req.params.id, req.body);
      if (!network) {
        return res.status(404).json({ error: "Network not found" });
      }
      res.json(network);
    } catch (error) {
      res.status(500).json({ error: "Failed to update network" });
    }
  });

  // Delete network
  app.delete("/api/networks/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteNetwork(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Network not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete network" });
    }
  });

  // YAML Export endpoints
  
  // Export configtx.yaml
  app.get("/api/networks/:id/export/configtx", async (req, res) => {
    try {
      const network = await storage.getNetwork(req.params.id);
      if (!network) {
        return res.status(404).json({ error: "Network not found" });
      }
      
      const configTxYaml = generateConfigTxYaml(network);
      res.setHeader("Content-Type", "text/yaml");
      res.setHeader("Content-Disposition", `attachment; filename="configtx.yaml"`);
      res.send(configTxYaml);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate configtx.yaml" });
    }
  });

  // Export crypto-config.yaml
  app.get("/api/networks/:id/export/crypto-config", async (req, res) => {
    try {
      const network = await storage.getNetwork(req.params.id);
      if (!network) {
        return res.status(404).json({ error: "Network not found" });
      }
      
      const cryptoConfigYaml = generateCryptoConfigYaml(network);
      res.setHeader("Content-Type", "text/yaml");
      res.setHeader("Content-Disposition", `attachment; filename="crypto-config.yaml"`);
      res.send(cryptoConfigYaml);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate crypto-config.yaml" });
    }
  });

  // Export docker-compose.yaml
  app.get("/api/networks/:id/export/docker-compose", async (req, res) => {
    try {
      const network = await storage.getNetwork(req.params.id);
      if (!network) {
        return res.status(404).json({ error: "Network not found" });
      }
      
      const dockerComposeYaml = generateDockerComposeYaml(network);
      res.setHeader("Content-Type", "text/yaml");
      res.setHeader("Content-Disposition", `attachment; filename="docker-compose.yaml"`);
      res.send(dockerComposeYaml);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate docker-compose.yaml" });
    }
  });

  // Validation endpoint
  app.post("/api/networks/:id/validate", async (req, res) => {
    try {
      const network = await storage.getNetwork(req.params.id);
      if (!network) {
        return res.status(404).json({ error: "Network not found" });
      }
      
      const result = await storage.runValidation(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to run validation" });
    }
  });

  // Deployment CRUD endpoints
  
  // Get all deployments
  app.get("/api/deployments", async (_req, res) => {
    try {
      const deployments = await storage.getAllDeployments();
      res.json(deployments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch deployments" });
    }
  });

  // Get single deployment
  app.get("/api/deployments/:id", async (req, res) => {
    try {
      const deployment = await storage.getDeployment(req.params.id);
      if (!deployment) {
        return res.status(404).json({ error: "Deployment not found" });
      }
      res.json(deployment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch deployment" });
    }
  });

  // Create deployment (deploy network)
  app.post("/api/deployments", async (req, res) => {
    try {
      const { networkId } = req.body;
      const network = await storage.getNetwork(networkId);
      if (!network) {
        return res.status(404).json({ error: "Network not found" });
      }
      
      const deployment = await storage.createDeployment({
        networkId: network.id,
        networkName: network.name,
        status: "deploying",
        totalNodes: network.peers.length + network.orderers.length + network.cas.length,
        peerCount: network.peers.length,
        ordererCount: network.orderers.length,
        caCount: network.cas.length,
        progress: 0,
        createdAt: new Date().toISOString(),
      });
      
      // Simulate deployment progress
      simulateDeployment(deployment.id);
      
      res.status(201).json(deployment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create deployment" });
    }
  });

  // Update deployment
  app.patch("/api/deployments/:id", async (req, res) => {
    try {
      const deployment = await storage.updateDeployment(req.params.id, req.body);
      if (!deployment) {
        return res.status(404).json({ error: "Deployment not found" });
      }
      res.json(deployment);
    } catch (error) {
      res.status(500).json({ error: "Failed to update deployment" });
    }
  });

  // Delete deployment
  app.delete("/api/deployments/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteDeployment(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Deployment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete deployment" });
    }
  });

  return httpServer;
}

// Simulates deployment progress
async function simulateDeployment(deploymentId: string) {
  const steps = [10, 25, 40, 60, 80, 100];
  for (const progress of steps) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const deployment = await storage.getDeployment(deploymentId);
    if (!deployment || deployment.status !== "deploying") break;
    
    await storage.updateDeployment(deploymentId, {
      progress,
      status: progress === 100 ? "active" : "deploying",
      lastActive: new Date().toISOString(),
    });
  }
}

// YAML generation functions

function generateConfigTxYaml(network: {
  name: string;
  consensusType: string;
  channelName?: string;
  organizations: Array<{ name: string; mspId: string; domain: string }>;
  orderers: Array<{ name: string; host: string; port: number }>;
  channels: Array<{ name: string; organizations: string[]; orderers: string[] }>;
}): string {
  const channelName = network.channelName || "mychannel";
  
  const orgDefinitions = network.organizations.map((org) => {
    const mspId = org.mspId || `${org.name}MSP`;
    const domain = org.domain || `${org.name.toLowerCase()}.example.com`;

    return {
      Name: mspId,
      ID: mspId,
      MSPDir: `crypto-config/peerOrganizations/${domain}/msp`,
      Policies: {
        Readers: {
          Type: "Signature",
          Rule: `OR('${mspId}.admin', '${mspId}.peer', '${mspId}.client')`,
        },
        Writers: {
          Type: "Signature",
          Rule: `OR('${mspId}.admin', '${mspId}.client')`,
        },
        Admins: {
          Type: "Signature",
          Rule: `OR('${mspId}.admin')`,
        },
        Endorsement: {
          Type: "Signature",
          Rule: `OR('${mspId}.peer')`,
        },
      },
      AnchorPeers: [{ Host: `peer0.${domain}`, Port: 7051 }],
    };
  });

  const ordererOrg = network.orderers.length > 0 ? {
    Name: "OrdererMSP",
    ID: "OrdererMSP",
    MSPDir: `crypto-config/ordererOrganizations/${network.name.toLowerCase()}.com/msp`,
    Policies: {
      Readers: { Type: "Signature", Rule: "OR('OrdererMSP.member')" },
      Writers: { Type: "Signature", Rule: "OR('OrdererMSP.member')" },
      Admins: { Type: "Signature", Rule: "OR('OrdererMSP.admin')" },
    },
    OrdererEndpoints: network.orderers.map((o, i) => 
      `orderer${i > 0 ? i : ""}.${network.name.toLowerCase()}.com:7050`
    ),
  } : null;

  const config: Record<string, any> = {
    Organizations: [
      ...(ordererOrg ? [ordererOrg] : []),
      ...orgDefinitions,
    ],
    Capabilities: {
      Channel: { V3_0: true },
      Orderer: { V2_0: true },
      Application: { V2_5: true },
    },
    Application: {
      Organizations: null,
      Policies: {
        Readers: { Type: "ImplicitMeta", Rule: "ANY Readers" },
        Writers: { Type: "ImplicitMeta", Rule: "ANY Writers" },
        Admins: { Type: "ImplicitMeta", Rule: "MAJORITY Admins" },
        LifecycleEndorsement: { Type: "ImplicitMeta", Rule: "MAJORITY Endorsement" },
        Endorsement: { Type: "ImplicitMeta", Rule: "MAJORITY Endorsement" },
      },
      Capabilities: { V2_5: true },
    },
    Orderer: {
      OrdererType: network.consensusType,
      BatchTimeout: "2s",
      BatchSize: {
        MaxMessageCount: 500,
        AbsoluteMaxBytes: "10 MB",
        PreferredMaxBytes: "2 MB",
      },
      Organizations: null,
      Policies: {
        Readers: { Type: "ImplicitMeta", Rule: "ANY Readers" },
        Writers: { Type: "ImplicitMeta", Rule: "ANY Writers" },
        Admins: { Type: "ImplicitMeta", Rule: "MAJORITY Admins" },
        BlockValidation: { Type: "ImplicitMeta", Rule: "ANY Writers" },
      },
      Capabilities: { V2_0: true },
    },
    Channel: {
      Policies: {
        Readers: { Type: "ImplicitMeta", Rule: "ANY Readers" },
        Writers: { Type: "ImplicitMeta", Rule: "ANY Writers" },
        Admins: { Type: "ImplicitMeta", Rule: "MAJORITY Admins" },
      },
      Capabilities: { V3_0: true },
    },
    Profiles: {
      [`${channelName}Genesis`]: {
        Orderer: {
          OrdererType: network.consensusType,
          Organizations: ordererOrg ? [{ Name: ordererOrg.Name, ID: ordererOrg.ID }] : [],
        },
        Application: {
          Organizations: orgDefinitions.map((org) => ({ Name: org.Name, ID: org.ID })),
        },
        Capabilities: { V3_0: true },
      },
      [`${channelName}Channel`]: {
        Application: {
          Organizations: orgDefinitions.map((org) => ({ Name: org.Name, ID: org.ID })),
          Capabilities: { V2_5: true },
        },
      },
    },
  };

  const yamlOutput = yaml.dump(config, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
  });

  const header = `# Hyperledger Fabric configtx.yaml
# Network: ${network.name}
# Generated for Fabric v2.5/v3.0
# Consensus: ${network.consensusType}
# Channel: ${channelName}
#
# Reference: https://hyperledger-fabric.readthedocs.io/en/latest/create_channel/create_channel_config.html

`;

  return header + yamlOutput;
}

function generateCryptoConfigYaml(network: {
  name: string;
  organizations: Array<{ name: string; domain: string }>;
  orderers: Array<{ name: string }>;
}): string {
  const peerOrgs = network.organizations.map((org) => {
    const domain = org.domain || `${org.name.toLowerCase()}.example.com`;
    return {
      Name: org.name,
      Domain: domain,
      EnableNodeOUs: true,
      Template: { Count: 2 },
      Users: { Count: 1 },
    };
  });

  const ordererOrgs = network.orderers.length > 0 ? [{
    Name: "Orderer",
    Domain: "example.com",
    EnableNodeOUs: true,
    Specs: network.orderers.map((o, i) => ({
      Hostname: `orderer${i > 0 ? i : ""}`,
    })),
  }] : [];

  const config = {
    OrdererOrgs: ordererOrgs,
    PeerOrgs: peerOrgs,
  };

  const yamlOutput = yaml.dump(config, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
  });

  const header = `# Hyperledger Fabric crypto-config.yaml
# Generated for use with cryptogen tool
#
# Reference: https://hyperledger-fabric.readthedocs.io/en/latest/commands/cryptogen.html

`;

  return header + yamlOutput;
}

function generateDockerComposeYaml(network: {
  name: string;
  organizations: Array<{ name: string; mspId: string; domain: string }>;
  orderers: Array<{ name: string; host: string; port: number }>;
}): string {
  const services: Record<string, any> = {};

  network.orderers.forEach((orderer, index) => {
    const hostname = `orderer${index > 0 ? index : ""}`;
    services[`${hostname}.example.com`] = {
      container_name: `${hostname}.example.com`,
      image: "hyperledger/fabric-orderer:2.5",
      environment: [
        "FABRIC_LOGGING_SPEC=INFO",
        "ORDERER_GENERAL_LISTENADDRESS=0.0.0.0",
        "ORDERER_GENERAL_LISTENPORT=7050",
        "ORDERER_GENERAL_LOCALMSPID=OrdererMSP",
        "ORDERER_GENERAL_LOCALMSPDIR=/var/hyperledger/orderer/msp",
        "ORDERER_GENERAL_TLS_ENABLED=true",
        "ORDERER_GENERAL_TLS_PRIVATEKEY=/var/hyperledger/orderer/tls/server.key",
        "ORDERER_GENERAL_TLS_CERTIFICATE=/var/hyperledger/orderer/tls/server.crt",
        "ORDERER_GENERAL_TLS_ROOTCAS=[/var/hyperledger/orderer/tls/ca.crt]",
      ],
      working_dir: "/opt/gopath/src/github.com/hyperledger/fabric",
      command: "orderer",
      ports: [`${7050 + index}:7050`],
      volumes: [
        `./crypto-config/ordererOrganizations/example.com/orderers/${hostname}.example.com/msp:/var/hyperledger/orderer/msp`,
        `./crypto-config/ordererOrganizations/example.com/orderers/${hostname}.example.com/tls:/var/hyperledger/orderer/tls`,
      ],
      networks: ["fabric-network"],
    };
  });

  network.organizations.forEach((org, orgIndex) => {
    const domain = org.domain || `${org.name.toLowerCase()}.example.com`;
    const mspId = org.mspId || `${org.name}MSP`;

    for (let i = 0; i < 2; i++) {
      const peerName = `peer${i}.${domain}`;
      services[peerName] = {
        container_name: peerName,
        image: "hyperledger/fabric-peer:2.5",
        environment: [
          "FABRIC_LOGGING_SPEC=INFO",
          `CORE_PEER_ID=${peerName}`,
          `CORE_PEER_ADDRESS=${peerName}:7051`,
          `CORE_PEER_LOCALMSPID=${mspId}`,
          "CORE_PEER_TLS_ENABLED=true",
          `CORE_PEER_TLS_CERT_FILE=/etc/hyperledger/fabric/tls/server.crt`,
          `CORE_PEER_TLS_KEY_FILE=/etc/hyperledger/fabric/tls/server.key`,
          `CORE_PEER_TLS_ROOTCERT_FILE=/etc/hyperledger/fabric/tls/ca.crt`,
          `CORE_PEER_GOSSIP_BOOTSTRAP=${peerName}:7051`,
          `CORE_PEER_GOSSIP_EXTERNALENDPOINT=${peerName}:7051`,
        ],
        working_dir: "/opt/gopath/src/github.com/hyperledger/fabric/peer",
        command: "peer node start",
        ports: [`${7051 + i + (orgIndex * 10)}:7051`],
        volumes: [
          `./crypto-config/peerOrganizations/${domain}/peers/${peerName}/msp:/etc/hyperledger/fabric/msp`,
          `./crypto-config/peerOrganizations/${domain}/peers/${peerName}/tls:/etc/hyperledger/fabric/tls`,
        ],
        networks: ["fabric-network"],
      };
    }
  });

  const config = {
    version: "3.7",
    networks: {
      "fabric-network": {
        name: "fabric-network",
      },
    },
    services,
  };

  const yamlOutput = yaml.dump(config, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
  });

  const header = `# Docker Compose configuration for Hyperledger Fabric network
# Network: ${network.name}
# Generated by Fabric Architect
#
# Usage: docker-compose up -d

`;

  return header + yamlOutput;
}
