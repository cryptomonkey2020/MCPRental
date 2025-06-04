# Enterprise Upgrade Rates MCP Server

An MCP (Model Context Protocol) server that provides tools to interact with Enterprise car rental's upgrade rates API.

## Features

This MCP server provides the following tools:

- **get_upgrade_rates**: Get reservation upgrade rates with various filtering options
- **get_session_info**: Retrieve current session information and reservation status  
- **check_upgrade_availability**: Check if upgrades are available for a specific reservation

## Installation

1. Clone or download the server files
2. Install dependencies:

```bash
npm install
```

3. Build the TypeScript code:

```bash
npm run build
```

## Usage

### Running the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

### Connecting to Claude Desktop

Add this server to your Claude Desktop configuration file:

**On macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**On Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "enterprise-upgrade-rates": {
      "command": "node",
      "args": ["/path/to/your/enterprise-upgrade-rates-mcp/index.js"]
    }
  }
}
```

### Tool Parameters

#### get_upgrade_rates
- `reservationId` (optional): The reservation ID to get upgrade rates for
- `pickupLocation` (optional): Pickup location code or name
- `returnLocation` (optional): Return location code or name
- `pickupDate` (optional): Pickup date in ISO format (YYYY-MM-DD)
- `returnDate` (optional): Return date in ISO format (YYYY-MM-DD)
- `vehicleClass` (optional): Vehicle class code (e.g., ECAR, CCAR, ICAR)
- `customerType` (optional): Customer type (e.g., leisure, business)
- `renterAge` (optional): Age of the renter

#### get_session_info
- `sessionId` (optional): Optional session ID to check specific session

#### check_upgrade_availability
- `reservationId` (required): The reservation ID to check upgrades for
- `preferredClass` (optional): Preferred vehicle class for upgrade

## API Endpoint

This server connects to:
```
https://prd-east.webapi.enterprise.com/enterprise-ewt/reservations/upgrade/rates
```

## Response Format

All tools return JSON responses with the following structure:
```json
{
  "success": true|false,
  "data": {...},
  "timestamp": "ISO timestamp",
  "error": "error message if success is false"
}
```

## Error Handling

The server includes comprehensive error handling for:
- Network connectivity issues
- Invalid API responses
- Missing required parameters
- Authentication failures

## Development

### File Structure
```
├── index.ts          # Main server implementation
├── package.json      # Dependencies and scripts
├── tsconfig.json     # TypeScript configuration
└── README.md         # This file
```

### Adding New Tools

To add new tools:

1. Add the tool definition to the `ListToolsRequestSchema` handler
2. Add a case for the tool in the `CallToolRequestSchema` handler
3. Implement the tool method
4. Update this README

## License

MIT License

## Support

For issues related to the Enterprise API, contact Enterprise car rental support.
For issues with this MCP server, please file an issue in the project repository.
