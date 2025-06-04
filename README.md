# 🚗 Enterprise MCP Servers

A comprehensive suite of Model Context Protocol (MCP) servers that integrate with Enterprise Rent-A-Car's APIs, enabling AI assistants to search locations, manage reservations, and check upgrade rates.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Available MCP Servers](#available-mcp-servers)
- [Prerequisites](#prerequisites)
- [Installation Guide](#installation-guide)
- [Claude Desktop Configuration](#claude-desktop-configuration)
- [Usage Examples](#usage-examples)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Development](#development)
- [Security Notes](#security-notes)

## 🎯 Overview

This repository contains three specialized MCP servers that provide seamless integration with Enterprise car rental services:

1. **Location Search** - Find Enterprise rental locations by city, state, or airport
2. **Upgrade Rates** - Check vehicle upgrade pricing and availability
3. **Reservations** - Create, modify, view, and cancel car rental reservations

Each server is designed as an independent microservice, following MCP best practices and providing a clean interface for AI assistants to interact with Enterprise's APIs.

## 🏗️ Architecture

### Design Principles

- **Modular Design**: Each server handles a specific domain (locations, upgrades, reservations)
- **TypeScript First**: Full type safety and modern JavaScript features
- **Error Resilience**: Comprehensive error handling and informative error messages
- **API Abstraction**: Clean separation between MCP protocol and Enterprise API calls
- **Stateless Operations**: Each request is independent, ensuring reliability

### Project Structure

```
EMMCP2/
├── README.md                           # This file
├── enterprise-location-text-mcp/       # Location search server
│   ├── index.ts                       # Server implementation
│   ├── package.json                   # Dependencies and scripts
│   ├── tsconfig.json                  # TypeScript configuration
│   └── dist/                          # Compiled JavaScript (after build)
├── enterprise-upgrade-rates/           # Upgrade rates server
│   ├── index.ts                       # Server implementation
│   ├── package.json                   # Dependencies and scripts
│   ├── tsconfig.json                  # TypeScript configuration
│   └── dist/                          # Compiled JavaScript (after build)
└── enterprise-reservation/             # Reservations server
    ├── index.ts                       # Server implementation
    ├── package.json                   # Dependencies and scripts
    ├── tsconfig.json                  # TypeScript configuration
    └── dist/                          # Compiled JavaScript (after build)
```

### Technical Stack

- **Runtime**: Node.js 18+ (required for modern JavaScript features)
- **Language**: TypeScript 5.0+
- **Protocol**: Model Context Protocol (MCP) 2024-11-05
- **HTTP Client**: node-fetch 3.x
- **Transport**: StdioServerTransport (standard input/output communication)

## 📦 Available MCP Servers

### 1. Enterprise Location Search (`enterprise-location-text-mcp`)

Powerful text-based location search capabilities for finding Enterprise rental locations.

**Available Tools:**
- `search_locations_by_city` - Find locations in a specific city
- `search_locations_by_state` - List all locations in a state/province
- `search_locations_by_airport` - Find airport or near-airport locations

**Features:**
- Multi-country support (US, CA, MX)
- Brand filtering (Enterprise, Alamo, National)
- Exotic/luxury vehicle location filtering
- Detailed location information including hours and contact details

### 2. Enterprise Upgrade Rates (`enterprise-upgrade-rates`)

Check upgrade availability and pricing for existing or potential reservations.

**Available Tools:**
- `get_upgrade_rates` - Get detailed upgrade pricing
- `get_session_info` - Check current session and reservation status
- `check_upgrade_availability` - Verify upgrade options for specific vehicle classes

**Features:**
- Real-time pricing information
- Session-based reservation workflow support
- Vehicle class upgrade paths
- Customer type and age-based pricing

### 3. Enterprise Reservations (`enterprise-reservation`)

Complete reservation management system for creating and managing car rentals.

**Available Tools:**
- `create_reservation` - Book new car rentals
- `get_reservation_details` - Retrieve specific reservation information
- `list_reservations` - Search reservations by customer or date
- `modify_reservation` - Update dates, locations, or vehicle class
- `cancel_reservation` - Cancel bookings with optional reasons

**Features:**
- Full CRUD operations for reservations
- Customer information management
- Flexible date/time handling
- Multiple search criteria support

## 🔧 Prerequisites

Before installing, ensure you have:

1. **Node.js 18 or higher** - [Download here](https://nodejs.org/)
   ```bash
   # Check your Node.js version
   node --version  # Should show v18.0.0 or higher
   ```

2. **npm** (comes with Node.js)
   ```bash
   # Check npm version
   npm --version
   ```

3. **Claude Desktop** - [Download here](https://claude.ai/download)

4. **Git** (for cloning the repository)

## 📥 Installation Guide

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <your-repo-url>
cd EMMCP2
```

### Step 2: Install Dependencies for Each Server

```bash
# Install Location Search server
cd enterprise-location-text-mcp
npm install
npm run build

# Install Upgrade Rates server
cd ../enterprise-upgrade-rates
npm install
npm run build

# Install Reservations server
cd ../enterprise-reservation
npm install
npm run build

# Return to root directory
cd ..
```

### Step 3: Verify Successful Build

Check that all servers built successfully:

```bash
# You should see these files
ls -la enterprise-location-text-mcp/dist/index.js
ls -la enterprise-upgrade-rates/dist/index.js
ls -la enterprise-reservation/dist/index.js
```

If any files are missing, check for build errors in the respective directories.

## 🖥️ Claude Desktop Configuration

### Step 1: Locate Your Configuration File

The Claude Desktop configuration file location varies by operating system:

**macOS:**
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**
```bash
~/.config/Claude/claude_desktop_config.json
```

### Step 2: Get Your Repository Path

Find the absolute path to your repository:

```bash
# In your EMMCP2 directory, run:
pwd
# This will output something like: /Users/username/Documents/EMMCP2
```

### Step 3: Update Configuration

Open the configuration file in a text editor and add all three MCP servers:

```json
{
  "mcpServers": {
    "enterprise-location-search": {
      "command": "node",
      "args": ["<YOUR_PATH>/enterprise-location-text-mcp/dist/index.js"]
    },
    "enterprise-upgrade-rates": {
      "command": "node",
      "args": ["<YOUR_PATH>/enterprise-upgrade-rates/dist/index.js"]
    },
    "enterprise-reservations": {
      "command": "node",
      "args": ["<YOUR_PATH>/enterprise-reservation/dist/index.js"]
    }
  }
}
```

**Example with actual path (macOS):**
```json
{
  "mcpServers": {
    "enterprise-location-search": {
      "command": "node",
      "args": ["/Users/b/Documents/EMMCP2/enterprise-location-text-mcp/dist/index.js"]
    },
    "enterprise-upgrade-rates": {
      "command": "node",
      "args": ["/Users/b/Documents/EMMCP2/enterprise-upgrade-rates/dist/index.js"]
    },
    "enterprise-reservations": {
      "command": "node",
      "args": ["/Users/b/Documents/EMMCP2/enterprise-reservation/dist/index.js"]
    }
  }
}
```

### Step 4: Restart Claude Desktop

**Important:** You must completely quit and restart Claude Desktop for the changes to take effect.

1. **macOS**: Cmd+Q or right-click dock icon → Quit
2. **Windows**: Right-click system tray icon → Exit
3. **Linux**: Close all windows and ensure process is terminated

Then launch Claude Desktop again.

### Step 5: Verify Installation

1. Open Claude Desktop
2. Start a new conversation
3. Look for the 🔧 tools icon in the interface
4. You should see all three Enterprise tool sets available

Test with: "What Enterprise car rental tools do you have available?"

## 💡 Usage Examples

### Location Search

**Find locations in a city:**
```
"Find all Enterprise locations in Miami, Florida"
"Show me car rental locations in Toronto, Canada"
"List all National brand locations in Los Angeles"
```

**Search by state/province:**
```
"Show me all Enterprise locations in New York state"
"List all rental locations in British Columbia, Canada"
```

**Airport searches:**
```
"Find Enterprise locations at LAX airport"
"Show me rental locations near JFK"
"Find car rental at Dallas Fort Worth airport"
```

### Upgrade Rates

**Check upgrade options:**
```
"Check upgrade rates for reservation ABC123"
"What vehicle upgrades are available for my rental?"
"Get upgrade pricing for a pickup on June 15th at LAX"
```

### Reservation Management

**Create reservation:**
```
"Create a car rental reservation:
- Pickup: LAX on June 15, 2025 at 10:00 AM
- Return: LAX on June 20, 2025 at 2:00 PM
- Customer: John Doe (john@example.com)"
```

**View reservations:**
```
"Show me reservation details for confirmation number RES123"
"List all reservations for customer email john@example.com"
"Find reservations between June 1 and June 30, 2025"
```

**Modify reservation:**
```
"Change reservation RES123 to pickup on June 16 instead"
"Update my reservation to return at SFO instead of LAX"
"Change vehicle class to full-size for reservation ABC123"
```

**Cancel reservation:**
```
"Cancel reservation RES123 due to change of plans"
"Cancel my reservation with confirmation number ABC123"
```

## 📖 API Documentation

### Enterprise API Architecture

The MCP servers integrate with two main Enterprise API systems:

#### 1. Location Service API
- **Base URL**: `https://prd.location.enterprise.com/enterprise-sls/`
- **Purpose**: Location search and information
- **Authentication**: None required (public API)

#### 2. Session/Reservation API
- **Base URL**: `https://prd-east.webapi.enterprise.com/enterprise-ewt/`
- **Purpose**: Reservations and upgrade management
- **Authentication**: Session-based workflow

### Response Format

All MCP servers return structured JSON responses with consistent formatting:

```json
{
  "success": true|false,
  "data": { /* API response data */ },
  "error": "Error message if applicable",
  "timestamp": "ISO 8601 timestamp",
  "search_params": { /* Request parameters used */ }
}
```

## 🐛 Troubleshooting

### Common Issues and Solutions

#### "Cannot find module" Error
**Cause**: Path in Claude Desktop config is incorrect  
**Solution**: 
1. Verify the absolute path using `pwd`
2. Ensure no typos in the configuration
3. Check that `/dist/index.js` files exist

#### "Server disconnected" Error
**Cause**: Build failed or runtime error  
**Solution**:
1. Rebuild the affected server: `npm run build`
2. Test manually: `node dist/index.js`
3. Check for error messages

#### Tools Not Showing in Claude Desktop
**Cause**: Configuration not loaded properly  
**Solutions**:
1. Ensure Claude Desktop is completely restarted
2. Validate JSON syntax in config file
3. Check for duplicate server names

#### Build Errors
**Solution**:
```bash
# Clean and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Testing Individual Servers

You can test each server independently:

```bash
# Test location server
cd enterprise-location-text-mcp
node dist/index.js
# Should output: "Enterprise Location Text Search MCP server running on stdio"

# Test upgrade rates server  
cd enterprise-upgrade-rates
node dist/index.js
# Should output: "Enterprise Upgrade Rates MCP Server running on stdio"

# Test reservations server
cd enterprise-reservation
node dist/index.js
# Should output: "Enterprise Reservations MCP Server running on stdio"
```

Press Ctrl+C to stop the test.

## 🔨 Development

### Making Changes

1. Edit the TypeScript source files (`index.ts`)
2. Rebuild the affected server:
   ```bash
   npm run build
   ```
3. Restart Claude Desktop to load changes

### Development Mode

For active development with auto-reload:
```bash
npm run dev
```

### Available Scripts

Each server includes these npm scripts:
- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Development mode with auto-reload
- `npm run clean` - Remove build artifacts
- `npm start` - Run the compiled server

### Adding New Tools

To add new tools to a server:
1. Add the tool definition in `ListToolsRequestSchema` handler
2. Implement the tool logic in `CallToolRequestSchema` handler
3. Add appropriate TypeScript interfaces
4. Rebuild and test

## 🔒 Security Notes

- These servers connect to Enterprise's production APIs
- No authentication credentials are stored in the code
- API endpoints are publicly accessible but rate-limited
- Ensure you have proper authorization for reservation operations
- Do not commit sensitive data to version control

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For issues or questions:
- Create an issue in this repository
- Check Enterprise API documentation
- Reference [MCP documentation](https://modelcontextprotocol.io/)

---

**Last Updated**: June 2025  
**Compatible with**: Claude Desktop, MCP Protocol 2024-11-05  
**Node.js Required**: 18.0.0 or higher