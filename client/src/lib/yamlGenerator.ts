import yaml from "js-yaml";
import type { Node, Edge } from "@xyflow/react";
import type { CanvasNodeData } from "@/lib/store";
import type { Organization, Peer, Orderer, CA, Channel, NetworkConfig } from "@shared/schema";

interface GenerateConfigParams {
  networkName: string;
  consensusType: "etcdraft" | "bft" | "solo";
  channelName: string;
  nodes: Node<CanvasNodeData>[];
  edges: Edge[];
  organizations: Organization[];
  peers: Peer[];
  orderers: Orderer[];
  cas: CA[];
}

// Generates a valid Hyperledger Fabric configtx.yaml from the visual topology
export function generateConfigTxYaml(
  networkConfig: NetworkConfig,
  organizations: Organization[],
  orderers: Orderer[],
  channels: Channel[]
): string {
  const networkName = networkConfig.name || "fabric-network";
  const consensusType = networkConfig.consensusType || "etcdraft";
  const channelName = channels.length > 0 ? channels[0].name : "mychannel";

  // Build organization definitions
  const orgDefinitions = organizations.map((org) => {
    const domain = org.domain || `${org.name.toLowerCase()}.example.com`;
    const mspId = org.mspId || `${org.name}MSP`;

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

  // Build orderer organization if orderer nodes exist
  const ordererOrg = orderers.length > 0 ? {
    Name: "OrdererMSP",
    ID: "OrdererMSP",
    MSPDir: `crypto-config/ordererOrganizations/${networkName.toLowerCase()}.com/msp`,
    Policies: {
      Readers: { Type: "Signature", Rule: "OR('OrdererMSP.member')" },
      Writers: { Type: "Signature", Rule: "OR('OrdererMSP.member')" },
      Admins: { Type: "Signature", Rule: "OR('OrdererMSP.admin')" },
    },
    OrdererEndpoints: orderers.map((o, i) => 
      `orderer${i > 0 ? i : ""}.${networkName.toLowerCase()}.com:7050`
    ),
  } : null;

  // Construct the configtx.yaml structure following Fabric v2.5/v3.0 schema
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

    Orderer: buildOrdererConfig(orderers, consensusType, networkName),

    Channel: {
      Policies: {
        Readers: { Type: "ImplicitMeta", Rule: "ANY Readers" },
        Writers: { Type: "ImplicitMeta", Rule: "ANY Writers" },
        Admins: { Type: "ImplicitMeta", Rule: "MAJORITY Admins" },
      },
      Capabilities: { V3_0: true },
    },

    Profiles: buildProfiles(orgDefinitions, ordererOrg, channelName),
  };

  // Add header comment and serialize to YAML
  const yamlOutput = yaml.dump(config, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
  });

  const header = `# Hyperledger Fabric configtx.yaml
# Network: ${networkName}
# Generated for Fabric v2.5/v3.0
# Consensus: ${consensusType}
# Channel: ${channelName}
#
# Reference: https://hyperledger-fabric.readthedocs.io/en/latest/create_channel/create_channel_config.html

`;

  return header + yamlOutput;
}

// Generates crypto-config.yaml for cryptogen tool
export function generateCryptoConfigYaml(
  organizations: Organization[],
  orderers: Orderer[]
): string {
  const peerOrgs = organizations.map((org) => {
    const domain = org.domain || `${org.name.toLowerCase()}.example.com`;
    return {
      Name: org.name,
      Domain: domain,
      EnableNodeOUs: true,
      Template: { Count: 2 },
      Users: { Count: 1 },
    };
  });

  const ordererOrgs = orderers.length > 0 ? [{
    Name: "Orderer",
    Domain: "example.com",
    EnableNodeOUs: true,
    Specs: orderers.map((o, i) => ({
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

// Generates docker-compose.yaml for container orchestration
export function generateDockerComposeYaml(
  organizations: Organization[],
  orderers: Orderer[]
): string {
  const services: Record<string, any> = {};

  // Add orderer services
  orderers.forEach((orderer, index) => {
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

  // Add peer services for each organization
  organizations.forEach((org) => {
    const domain = org.domain || `${org.name.toLowerCase()}.example.com`;
    const mspId = org.mspId || `${org.name}MSP`;

    // Add two peers per organization
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
        ports: [`${7051 + i + (organizations.indexOf(org) * 10)}:7051`],
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
# Generated by Fabric Architect
#
# Usage: docker-compose up -d

`;

  return header + yamlOutput;
}

// Builds orderer configuration section based on consensus type
function buildOrdererConfig(
  orderers: Orderer[],
  consensusType: string,
  networkName: string
): Record<string, any> {
  const domain = `${networkName.toLowerCase()}.com`;
  
  const baseConfig: Record<string, any> = {
    OrdererType: consensusType,
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
  };

  // Add consensus-specific configuration
  if (consensusType === "etcdraft") {
    baseConfig.EtcdRaft = {
      Consenters: orderers.map((_, index) => ({
        Host: `orderer${index > 0 ? index : ""}.${domain}`,
        Port: 7050,
        ClientTLSCert: `crypto-config/ordererOrganizations/${domain}/orderers/orderer${index > 0 ? index : ""}.${domain}/tls/server.crt`,
        ServerTLSCert: `crypto-config/ordererOrganizations/${domain}/orderers/orderer${index > 0 ? index : ""}.${domain}/tls/server.crt`,
      })),
    };
  } else if (consensusType === "bft") {
    baseConfig.SmartBFT = {
      RequestBatchMaxCount: 100,
      RequestBatchMaxInterval: "50ms",
      IncomingMessageBufferSize: 200,
      RequestPoolSize: 400,
      LeaderHeartbeatTimeout: "1s",
    };
  }

  return baseConfig;
}

// Builds channel profiles for genesis block and channel creation
function buildProfiles(
  organizations: Record<string, any>[],
  ordererOrg: Record<string, any> | null,
  channelName: string
): Record<string, any> {
  const orgRefs = organizations.map((org) => ({ Name: org.Name, ID: org.ID }));
  
  return {
    [`${channelName}Genesis`]: {
      Orderer: {
        OrdererType: "etcdraft",
        Organizations: ordererOrg ? [{ Name: ordererOrg.Name, ID: ordererOrg.ID }] : [],
      },
      Application: {
        Organizations: orgRefs,
      },
      Capabilities: { V3_0: true },
    },
    [`${channelName}Channel`]: {
      Application: {
        Organizations: orgRefs,
        Capabilities: { V2_5: true },
      },
    },
  };
}

// Legacy function for canvas-based generation
export function generateConfigTxYamlFromCanvas(params: GenerateConfigParams): string {
  const { networkName, consensusType, channelName, nodes, edges } = params;

  // Extract organization nodes from canvas
  const orgNodes = nodes.filter((n) => n.data?.type === "organization");
  const peerNodes = nodes.filter((n) => n.data?.type === "peer");
  const ordererNodes = nodes.filter((n) => n.data?.type === "orderer");

  // Build organization definitions based on topology
  const organizations = buildOrganizationsFromNodes(orgNodes, peerNodes, edges, networkName);
  
  // Build orderer organization if orderer nodes exist
  const ordererOrg = ordererNodes.length > 0 ? buildOrdererOrganization(ordererNodes, networkName) : null;

  // Construct the configtx.yaml structure following Fabric v2.5/v3.0 schema
  const config: Record<string, any> = {
    Organizations: [
      ...(ordererOrg ? [ordererOrg] : []),
      ...organizations,
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

    Orderer: buildOrdererConfigFromNodes(ordererNodes, consensusType, networkName),

    Channel: {
      Policies: {
        Readers: { Type: "ImplicitMeta", Rule: "ANY Readers" },
        Writers: { Type: "ImplicitMeta", Rule: "ANY Writers" },
        Admins: { Type: "ImplicitMeta", Rule: "MAJORITY Admins" },
      },
      Capabilities: { V3_0: true },
    },

    Profiles: buildProfiles(organizations, ordererOrg, channelName),
  };

  // Add header comment and serialize to YAML
  const yamlOutput = yaml.dump(config, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
  });

  const header = `# Hyperledger Fabric configtx.yaml
# Network: ${networkName}
# Generated for Fabric v2.5/v3.0
# Consensus: ${consensusType}
# Channel: ${channelName}
#
# Reference: https://hyperledger-fabric.readthedocs.io/en/latest/create_channel/create_channel_config.html

`;

  return header + yamlOutput;
}

// Builds organization definitions from topology nodes
function buildOrganizationsFromNodes(
  orgNodes: Node<CanvasNodeData>[],
  peerNodes: Node<CanvasNodeData>[],
  edges: Edge[],
  networkName: string
): Record<string, any>[] {
  return orgNodes.map((org, index) => {
    const orgLabel = org.data?.label || `Org${index + 1}`;
    const mspId = `${orgLabel}MSP`;
    const domain = `${orgLabel.toLowerCase()}.${networkName.toLowerCase()}.com`;

    // Find peers connected to this organization
    const connectedPeerIds = edges
      .filter((e) => e.target === org.id || e.source === org.id)
      .map((e) => (e.source === org.id ? e.target : e.source));
    
    const connectedPeers = peerNodes.filter((p) => connectedPeerIds.includes(p.id));

    // Build anchor peers list from connected peers
    const anchorPeers = connectedPeers.map((peer, peerIndex) => ({
      Host: `peer${peerIndex}.${domain}`,
      Port: 7051,
    }));

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
      AnchorPeers: anchorPeers.length > 0 ? anchorPeers : [{ Host: `peer0.${domain}`, Port: 7051 }],
    };
  });
}

// Builds orderer organization configuration
function buildOrdererOrganization(
  ordererNodes: Node<CanvasNodeData>[],
  networkName: string
): Record<string, any> {
  const domain = `${networkName.toLowerCase()}.com`;
  const mspId = "OrdererMSP";

  return {
    Name: mspId,
    ID: mspId,
    MSPDir: `crypto-config/ordererOrganizations/${domain}/msp`,
    Policies: {
      Readers: {
        Type: "Signature",
        Rule: `OR('${mspId}.member')`,
      },
      Writers: {
        Type: "Signature",
        Rule: `OR('${mspId}.member')`,
      },
      Admins: {
        Type: "Signature",
        Rule: `OR('${mspId}.admin')`,
      },
    },
    OrdererEndpoints: ordererNodes.map((_, index) => 
      `orderer${index > 0 ? index : ""}.${domain}:7050`
    ),
  };
}

// Builds orderer configuration section based on consensus type for canvas nodes
function buildOrdererConfigFromNodes(
  ordererNodes: Node<CanvasNodeData>[],
  consensusType: string,
  networkName: string
): Record<string, any> {
  const domain = `${networkName.toLowerCase()}.com`;
  
  const baseConfig: Record<string, any> = {
    OrdererType: consensusType,
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
  };

  // Add consensus-specific configuration
  if (consensusType === "etcdraft") {
    baseConfig.EtcdRaft = {
      Consenters: ordererNodes.map((_, index) => ({
        Host: `orderer${index > 0 ? index : ""}.${domain}`,
        Port: 7050,
        ClientTLSCert: `crypto-config/ordererOrganizations/${domain}/orderers/orderer${index > 0 ? index : ""}.${domain}/tls/server.crt`,
        ServerTLSCert: `crypto-config/ordererOrganizations/${domain}/orderers/orderer${index > 0 ? index : ""}.${domain}/tls/server.crt`,
      })),
    };
  } else if (consensusType === "bft") {
    baseConfig.SmartBFT = {
      RequestBatchMaxCount: 100,
      RequestBatchMaxInterval: "50ms",
      IncomingMessageBufferSize: 200,
      RequestPoolSize: 400,
      LeaderHeartbeatTimeout: "1s",
    };
  }

  return baseConfig;
}
