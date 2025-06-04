# Enterprise MCP Servers

This repository contains two Model Context Protocol (MCP) servers for Enterprise car rental services:

1. **Enterprise Upgrade Rates** - Get upgrade rates and availability information
2. **Enterprise Reservations** - Manage car rental reservations (create, modify, cancel, view)

## 📋 Prerequisites

- **Node.js** 18 or higher
- **npm** (comes with Node.js)
- **Claude Desktop** application installed
- **TypeScript** knowledge (optional, for development)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone this repository
git clone <your-repo-url>
cd <repo-name>

# Install dependencies for both MCP servers
cd enterprise-upgrade-rates
npm install
npm run build

cd ../enterprise-reservation
npm install
npm run build
```

### 2. Verify Build Success

After building, you should see these files:
- `enterprise-upgrade-rates/dist/index.js`
- `enterprise-reservation/dist/index.js`

```bash
# Check if both builds were successful
ls -la enterprise-upgrade-rates/dist/index.js
ls -la enterprise-reservation/dist/index.js
```

### 3. Configure Claude Desktop

#### Find Your Claude Desktop Config File

**macOS:**
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```bash
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**
```bash
~/.config/Claude/claude_desktop_config.json
```

#### Update Configuration

Replace `<FULL_PATH_TO_REPO>` with the absolute path to your repository:

```json
{
  "mcpServers": {
    "enterprise-upgrade-rates": {
      "command": "node",
      "args": ["<FULL_PATH_TO_REPO>/enterprise-upgrade-rates/dist/index.js"]
    },
    "enterprise-reservations": {
      "command": "node",
      "args": ["<FULL_PATH_TO_REPO>/enterprise-reservation/dist/index.js"]
    }
  }
}
```

**Example (macOS):**
```json
{
  "mcpServers": {
    "enterprise-upgrade-rates": {
      "command": "node",
      "args": ["/Users/username/Documents/enterprise-mcp/enterprise-upgrade-rates/dist/index.js"]
    },
    "enterprise-reservations": {
      "command": "node",
      "args": ["/Users/username/Documents/enterprise-mcp/enterprise-reservation/dist/index.js"]
    }
  }
}
```

### 4. Restart Claude Desktop

**Important:** Completely quit and restart Claude Desktop for the configuration changes to take effect.

## 🧪 Testing the Installation

### Test Individual Servers

```bash
# Test upgrade rates server
cd enterprise-upgrade-rates
node dist/index.js
# Should output: "Enterprise Upgrade Rates MCP Server running on stdio"

# Test reservations server (in another terminal)
cd enterprise-reservation
node dist/index.js
# Should output: "Enterprise Reservations MCP Server running on stdio"
```

### Test in Claude Desktop

1. Open Claude Desktop
2. Start a new conversation
3. Look for the 🔧 tools icon - you should see both Enterprise tools available
4. Try asking: *"Can you check what Enterprise tools are available?"*

## 🛠 Available Tools

### Enterprise Upgrade Rates

- `get_upgrade_rates` - Get upgrade pricing and availability
- `get_session_info` - Check current session status
- `check_upgrade_availability` - Verify upgrade options for reservations

### Enterprise Reservations

- `get_reservation_details` - Get detailed reservation information
- `list_reservations` - List reservations by customer or date range
- `create_reservation` - Create new car rental reservations
- `modify_reservation` - Update existing reservations
- `cancel_reservation` - Cancel reservations with optional reason

## 📖 Usage Examples

### Get Upgrade Rates
```
"Can you get upgrade rates for reservation ID ABC123 picking up on 2025-06-15 at LAX?"
```

### Create a Reservation
```
"Create a reservation for pickup at LAX on June 15th, 2025, returning to LAX on June 20th, 2025. Customer: John Doe, email: john@example.com"
```

### List Reservations
```
"Show me all reservations for customer email john@example.com"
```

### Modify a Reservation
```
"Change reservation RES123 to pickup on June 16th instead of June 15th"
```

## 🔧 Development

### Project Structure

```
├── enterprise-upgrade-rates/
│   ├── src/                    # TypeScript source
│   ├── dist/                   # Compiled JavaScript
│   ├── package.json
│   ├── tsconfig.json
│   └── index.ts               # Main server file
├── enterprise-reservation/
│   ├── dist/                   # Compiled JavaScript  
│   ├── package.json
│   ├── tsconfig.json
│   └── index.ts               # Main server file
└── README.md
```

### Making Changes

1. Edit the TypeScript source files (`index.ts`)
2. Rebuild the project:
   ```bash
   npm run build
   ```
3. Restart Claude Desktop to pick up changes

### Available Scripts

```bash
npm run build          # Compile TypeScript to JavaScript
npm run dev           # Watch mode for development
npm run clean         # Clean build artifacts
```

## 🐛 Troubleshooting

### Common Issues

#### "Cannot find module" Error
- **Cause:** Path in Claude Desktop config is incorrect
- **Solution:** Verify the absolute path to `dist/index.js` files

#### "Server disconnected" Error
- **Cause:** Build failed or JavaScript file has syntax errors
- **Solution:** Run `npm run build` and check for compilation errors

#### Tools Not Showing in Claude Desktop
- **Cause:** Configuration not loaded or servers not starting
- **Solutions:**
  1. Restart Claude Desktop completely
  2. Check config file syntax (valid JSON)
  3. Test servers individually with `node dist/index.js`

#### Build Errors
```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

### Debug Steps

1. **Verify Node.js version:**
   ```bash
   node --version  # Should be 18+
   ```

2. **Test servers manually:**
   ```bash
   cd enterprise-upgrade-rates
   node dist/index.js
   ```

3. **Check Claude Desktop logs:**
   - Look for connection errors in Claude Desktop console
   - Check if servers are starting properly

4. **Validate config file:**
   ```bash
   # Validate JSON syntax
   cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | python -m json.tool
   ```

## 🔒 Security Notes

- These servers connect to Enterprise's production APIs
- Ensure you have proper authentication/authorization
- Do not commit sensitive credentials to version control
- API endpoints are configured for Enterprise's production environment

## 📝 API Documentation

### Enterprise Upgrade Rates API
- Base URL: `https://prd-east.webapi.enterprise.com/enterprise-ewt`
- Endpoints: `/upgrade-rates`, `/session-info`, `/upgrade-availability`

### Enterprise Reservations API  
- Base URL: `https://prd-east.webapi.enterprise.com/enterprise-ewt`
- Endpoints: `/reservations`, `/reservations/{id}`, etc.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

[Add your license information here]

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Create an issue in this repository
3. Reference Claude Desktop MCP documentation: https://modelcontextprotocol.io/

---

**Last Updated:** June 2025  
**Compatible with:** Claude Desktop, MCP Protocol 2024-11-05