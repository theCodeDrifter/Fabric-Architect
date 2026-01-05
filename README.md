# Fabric Architect

Fabric Architect is a visual network design tool for Hyperledger Fabric blockchain networks. It provides a drag-and-drop canvas interface for designing, validating, and exporting production-ready Fabric network configurations.
<img width="1909" height="952" alt="screenshot-1765713927298" src="https://github.com/user-attachments/assets/05db653e-a522-4063-9fd7-03dc96c5bd5a" />


## Features

- **Visual Design Canvas**: Drag-and-drop interface for composing network topologies using Hyperledger Fabric components (organizations, peers, orderers, CAs, channels, and chaincodes).
- **Validation Studio**: Real-time validation of network topology to ensure compliance with Hyperledger Fabric best practices and requirements.
- **Config Export**: Export complete configuration as YAML files compatible with Fabric's `configtx` and `crypto-config` tools.
- **Interactive Deployment Guide**: Step-by-step wizard to guide users through the physical deployment process based on official documentation.
- **Template Management**: Save your designs as templates for rapid prototyping of similar networks.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/theCodeDrifter/Fabric-Architect.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Architecture

- **Frontend**: React, TypeScript, Vite, React Flow (@xyflow/react), shadcn/ui, Tailwind CSS.
- **Backend**: Express.js, Node.js.
- **State Management**: Zustand with persistence.
- **Data Model**: Zod schemas for validation and type-safe data handling.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
