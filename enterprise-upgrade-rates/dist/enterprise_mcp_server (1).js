#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";
class EnterpriseUpgradeRatesServer {
    server;
    baseUrl = "https://prd-east.webapi.enterprise.com/enterprise-ewt";
    constructor() {
        this.server = new Server({
            name: "enterprise-upgrade-rates",
            version: "1.0.0",
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupToolHandlers();
    }
    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: "get_upgrade_rates",
                        description: "Get reservation upgrade rates from Enterprise car rental",
                        inputSchema: {
                            type: "object",
                            properties: {
                                reservationId: {
                                    type: "string",
                                    description: "The reservation ID to get upgrade rates for",
                                },
                                pickupLocation: {
                                    type: "string",
                                    description: "Pickup location code or name",
                                },
                                returnLocation: {
                                    type: "string",
                                    description: "Return location code or name",
                                },
                                pickupDate: {
                                    type: "string",
                                    description: "Pickup date in ISO format (YYYY-MM-DD)",
                                },
                                returnDate: {
                                    type: "string",
                                    description: "Return date in ISO format (YYYY-MM-DD)",
                                },
                                vehicleClass: {
                                    type: "string",
                                    description: "Vehicle class code (e.g., ECAR, CCAR, ICAR)",
                                },
                                customerType: {
                                    type: "string",
                                    description: "Customer type (e.g., leisure, business)",
                                },
                                renterAge: {
                                    type: "number",
                                    description: "Age of the renter",
                                },
                            },
                            additionalProperties: false,
                        },
                    },
                    {
                        name: "get_session_info",
                        description: "Get current session information and reservation status",
                        inputSchema: {
                            type: "object",
                            properties: {
                                sessionId: {
                                    type: "string",
                                    description: "Optional session ID to check specific session",
                                },
                            },
                            additionalProperties: false,
                        },
                    },
                    {
                        name: "check_upgrade_availability",
                        description: "Check if upgrades are available for a reservation",
                        inputSchema: {
                            type: "object",
                            properties: {
                                reservationId: {
                                    type: "string",
                                    description: "The reservation ID to check upgrades for",
                                    required: true,
                                },
                                preferredClass: {
                                    type: "string",
                                    description: "Preferred vehicle class for upgrade",
                                },
                            },
                            required: ["reservationId"],
                            additionalProperties: false,
                        },
                    },
                ],
            };
        });
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case "get_upgrade_rates":
                        return await this.getUpgradeRates(args);
                    case "get_session_info":
                        return await this.getSessionInfo(args);
                    case "check_upgrade_availability":
                        return await this.checkUpgradeAvailability(args);
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                };
            }
        });
    }
    async makeRequest(endpoint, options = {}) {
        const url = new URL(`${this.baseUrl}${endpoint}`);
        // Add query parameters if provided
        Object.entries(options).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, String(value));
            }
        });
        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "User-Agent": "Enterprise-MCP-Server/1.0.0",
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    }
    async getUpgradeRates(options) {
        try {
            const data = await this.makeRequest("/reservations/upgrade/rates", options);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            data: data,
                            timestamp: new Date().toISOString(),
                            options_used: options,
                        }, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            success: false,
                            error: error instanceof Error ? error.message : String(error),
                            timestamp: new Date().toISOString(),
                        }, null, 2),
                    },
                ],
            };
        }
    }
    async getSessionInfo(args) {
        try {
            const endpoint = args.sessionId
                ? `/session/${args.sessionId}`
                : "/reservations/upgrade/rates";
            const data = await this.makeRequest(endpoint);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            session_data: data,
                            timestamp: new Date().toISOString(),
                        }, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            success: false,
                            error: error instanceof Error ? error.message : String(error),
                            timestamp: new Date().toISOString(),
                        }, null, 2),
                    },
                ],
            };
        }
    }
    async checkUpgradeAvailability(args) {
        try {
            const options = {
                reservationId: args.reservationId,
                ...(args.preferredClass && { vehicleClass: args.preferredClass }),
            };
            const data = await this.makeRequest("/reservations/upgrade/rates", options);
            // Analyze the response to determine upgrade availability
            const upgradeAvailable = data.session?.gma?.reservation?.upgrade_selected !== undefined;
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            reservation_id: args.reservationId,
                            upgrade_available: upgradeAvailable,
                            preferred_class: args.preferredClass,
                            session_data: data,
                            timestamp: new Date().toISOString(),
                        }, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            success: false,
                            reservation_id: args.reservationId,
                            error: error instanceof Error ? error.message : String(error),
                            timestamp: new Date().toISOString(),
                        }, null, 2),
                    },
                ],
            };
        }
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("Enterprise Upgrade Rates MCP Server running on stdio");
    }
}
const server = new EnterpriseUpgradeRatesServer();
server.run().catch(console.error);
//# sourceMappingURL=enterprise_mcp_server%20(1).js.map