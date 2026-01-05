import { OrganizationNode } from "./OrganizationNode";
import { PeerNode } from "./PeerNode";
import { OrdererNode } from "./OrdererNode";
import { CANode } from "./CANode";
import { ChannelNode } from "./ChannelNode";
import { ChaincodeNode } from "./ChaincodeNode";

export const nodeTypes = {
  organization: OrganizationNode,
  peer: PeerNode,
  orderer: OrdererNode,
  ca: CANode,
  channel: ChannelNode,
  chaincode: ChaincodeNode,
};

export { OrganizationNode, PeerNode, OrdererNode, CANode, ChannelNode, ChaincodeNode };
