Enterprise MCP Servers
This repository contains two Model Context Protocol (MCP) servers for Enterprise car rental services:

Enterprise Upgrade Rates - Get upgrade rates and availability information
Enterprise Reservations - Manage car rental reservations (create, modify, cancel, view)
📋 Prerequisites
Node.js 18 or higher
npm (comes with Node.js)
Claude Desktop application installed
TypeScript knowledge (optional, for development)
🚀 Quick Start
1. Clone and Setup
bash
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
2. Verify Build Success
After building, you should see these files:

enterprise-upgrade-rates/dist/index.js
enterprise-reservation/dist/index.js
bash
# Check if both builds were successful
ls -la enterprise-upgrade-rates/dist/index.js
ls -la enterprise-reservation/dist/index.js
3. Configure Claude Desktop
Find Your Claude Desktop Config File
macOS:

bash
~/Library/Application Support/Claude/claude_desktop_config.json
Windows:

bash
%APPDATA%\Claude\claude_desktop_config.json
Linux:

bash
~/.config/Claude/claude_desktop_config.json
Update Configuration
Replace <FULL_PATH_TO_REPO> with the absolute path to your repository:

json
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
Example (macOS):

json
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
4. Restart Claude Desktop
Important: Completely quit and restart Claude Desktop for the configuration changes to take effect.

🧪 Testing the Installation
Test Individual Servers
bash
# Test upgrade rates server
cd enterprise-upgrade-rates
node dist/index.js
# Should output: "Enterprise Upgrade Rates MCP Server running on stdio"

# Test reservations server (in another terminal)
cd enterprise-reservation
node dist/index.js
# Should output: "Enterprise Reservations MCP Server running on stdio"
Test in Claude Desktop
Open Claude Desktop
Start a new conversation
Look for the 🔧 tools icon - you should see both Enterprise tools available
Try asking: "Can you check what Enterprise tools are available?"
🛠 Available Tools
Enterprise Upgrade Rates
get_upgrade_rates - Get upgrade pricing and availability
get_session_info - Check current session status
check_upgrade_availability - Verify upgrade options for reservations
Enterprise Reservations
get_reservation_details - Get detailed reservation information
list_reservations - List reservations by customer or date range
create_reservation - Create new car rental reservations
modify_reservation - Update existing reservations
cancel_reservation - Cancel reservations with optional reason
📖 Usage Examples
Get Upgrade Rates
"Can you get upgrade rates for reservation ID ABC123 picking up on 2025-06-15 at LAX?"
Create a Reservation
"Create a reservation for pickup at LAX on June 15th, 2025, returning to LAX on June 20th, 2025. Customer: John Doe, email: john@example.com"
List Reservations
"Show me all reservations for customer email john@example.com"
Modify a Reservation
"Change reservation RES123 to pickup on June 16th instead of June 15th"
🔧 Development
Project Structure
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
Making Changes
Edit the TypeScript source files (index.ts)
Rebuild the project:
bash
npm run build
Restart Claude Desktop to pick up changes
Available Scripts
bash
npm run build          # Compile TypeScript to JavaScript
npm run dev           # Watch mode for development
npm run clean         # Clean build artifacts
🐛 Troubleshooting
Common Issues
"Cannot find module" Error
Cause: Path in Claude Desktop config is incorrect
Solution: Verify the absolute path to dist/index.js files
"Server disconnected" Error
Cause: Build failed or JavaScript file has syntax errors
Solution: Run npm run build and check for compilation errors
Tools Not Showing in Claude Desktop
Cause: Configuration not loaded or servers not starting
Solutions:
Restart Claude Desktop completely
Check config file syntax (valid JSON)
Test servers individually with node dist/index.js
✅ Confirmed Working APIs
Based on successful testing, these Enterprise API endpoints are confirmed working:

API	Status	Base URL	Purpose
Location Spatial	✅ Working	https://prd.location.enterprise.com/enterprise-sls/search/location/enterprise/web/spatial	GPS coordinate search
Location Text	✅ Working	https://prd.location.enterprise.com/enterprise-sls/search/location/enterprise/web/text/{searchTerm}	City/airport name search
Session API	✅ Working	https://prd-east.webapi.enterprise.com/enterprise-ewt/reservations	Reservation workflow
Trips Service	✅ Accessible	https://www-gbo-trips.enterprise.ehiaws.com/	Trip management
🔐 Authentication Required
These services return 403 Forbidden (need API credentials):

Location Service: https://www-gbo-location.enterprise.ehiaws.com/
Rental Service: https://www-gbo-rental.enterprise.ehiaws.com/
Profile Service: https://www-gbo-profile.enterprise.ehiaws.com/
Ticket Service: https://www-gbo-ticket.enterprise.ehiaws.com/
🧪 Testing
Run the comprehensive API test suite:

bash
chmod +x test_enterprise_apis.sh
./test_enterprise_apis.sh
Or test individual endpoints:

bash
# Test coordinate search
curl -i "https://prd.location.enterprise.com/enterprise-sls/search/location/enterprise/web/spatial?dto=true&pickupDate=2025-05-29&pickupTime=16:00&dropoffDate=2025-05-30&dropoffTime=16:00&locale=en_US&rows=40&latitude=38.82755&longitude=-91.02014&cor=US&radius=30"

# Test text search  
curl -i "https://prd.location.enterprise.com/enterprise-sls/search/location/enterprise/web/text/Wright%20City?countryCode=US&includeExotics=true&brand=ENTERPRISE&dto=true&cor=US&locale=en_US"
Build Errors
bash
# Clean and rebuild
npm run clean
npm install
npm run build
Debug Steps
Verify Node.js version:
bash
node --version  # Should be 18+
Test servers manually:
bash
cd enterprise-upgrade-rates
node dist/index.js
Check Claude Desktop logs:
Look for connection errors in Claude Desktop console
Check if servers are starting properly
Validate config file:
bash
# Validate JSON syntax
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json | python -m json.tool
🔒 Security Notes
These servers connect to Enterprise's production APIs
Ensure you have proper authentication/authorization
Do not commit sensitive credentials to version control
API endpoints are configured for Enterprise's production environment
📝 API Documentation
Enterprise API Architecture
Enterprise uses a microservices architecture with different services:

Main Session API:

Base URL: https://prd-east.webapi.enterprise.com/enterprise-ewt
Working Endpoints: /status, /reservations (session-based workflow)
GBO (Global Business Operations) Microservices:

Location Service: https://www-gbo-location.enterprise.ehiaws.com/
Rental Service: https://www-gbo-rental.enterprise.ehiaws.com/
Profile Service: https://www-gbo-profile.enterprise.ehiaws.com/
Ticket Service: https://www-gbo-ticket.enterprise.ehiaws.com/
Trips Service: https://www-gbo-trips.enterprise.ehiaws.com/
Note: The API uses session-based workflows rather than pure REST endpoints.

🤝 Contributing
Fork the repository
Create a feature branch
Make your changes
Test thoroughly
Submit a pull request
📄 License
[Add your license information here]

📞 Support
For issues or questions:

Check the troubleshooting section above
Create an issue in this repository
Reference Claude Desktop MCP documentation: https://modelcontextprotocol.io/
Last Updated: June 2025
Compatible with: Claude Desktop, MCP Protocol 2024-11-05

