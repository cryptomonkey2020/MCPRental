#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from "@modelcontextprotocol/sdk/types.js";
class EnterpriseLocationTextServer {
    server;
    baseUrl = "https://prd.location.enterprise.com/enterprise-sls/search/location/enterprise/web";
    constructor() {
        this.server = new Server({
            name: "enterprise-location-text",
            version: "1.0.0",
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupToolHandlers();
        // Error handling
        this.server.onerror = (error) => console.error("[MCP Error]", error);
        process.on("SIGINT", async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: "search_locations_by_city",
                    description: "Search for Enterprise car rental locations by city name and country",
                    inputSchema: {
                        type: "object",
                        properties: {
                            cityName: {
                                type: "string",
                                description: "Name of the city to search (e.g., 'Wright City', 'New York', 'Los Angeles')",
                                minLength: 1,
                            },
                            countryCode: {
                                type: "string",
                                description: "Country code where the city is located",
                                enum: ["US", "CA", "MX"],
                            },
                            stateCode: {
                                type: "string",
                                description: "Optional state/province code (e.g., 'NY', 'CA', 'ON')",
                                minLength: 2,
                                maxLength: 3,
                            },
                            brand: {
                                type: "string",
                                description: "Car rental brand to search (default: ENTERPRISE)",
                                enum: ["ENTERPRISE", "ALAMO", "NATIONAL"],
                            },
                            includeExotics: {
                                type: "boolean",
                                description: "Include exotic/luxury vehicle locations (default: true)",
                            },
                            locale: {
                                type: "string",
                                description: "Locale for the response (default: en_US)",
                                enum: ["en_US", "en_CA", "es_US", "fr_CA"],
                            },
                            cor: {
                                type: "string",
                                description: "Country of residence code (default: US)",
                                enum: ["US", "CA", "MX"],
                            },
                        },
                        required: ["cityName", "countryCode"],
                    },
                },
                {
                    name: "search_locations_by_state",
                    description: "Search for all Enterprise locations in a specific state/province",
                    inputSchema: {
                        type: "object",
                        properties: {
                            stateCode: {
                                type: "string",
                                description: "State or province code (e.g., 'NY', 'CA', 'ON', 'BC')",
                                minLength: 2,
                                maxLength: 3,
                            },
                            countryCode: {
                                type: "string",
                                description: "Country code",
                                enum: ["US", "CA", "MX"],
                            },
                            brand: {
                                type: "string",
                                description: "Car rental brand to search (default: ENTERPRISE)",
                                enum: ["ENTERPRISE", "ALAMO", "NATIONAL"],
                            },
                            includeExotics: {
                                type: "boolean",
                                description: "Include exotic/luxury vehicle locations (default: true)",
                            },
                            locale: {
                                type: "string",
                                description: "Locale for the response (default: en_US)",
                                enum: ["en_US", "en_CA", "es_US", "fr_CA"],
                            },
                        },
                        required: ["stateCode", "countryCode"],
                    },
                },
                {
                    name: "search_locations_by_airport",
                    description: "Search for Enterprise locations at or near airports by airport code or city",
                    inputSchema: {
                        type: "object",
                        properties: {
                            searchTerm: {
                                type: "string",
                                description: "Airport code (e.g., 'LAX', 'JFK') or city name with 'airport' (e.g., 'Los Angeles Airport')",
                                minLength: 3,
                            },
                            countryCode: {
                                type: "string",
                                description: "Country code",
                                enum: ["US", "CA", "MX"],
                            },
                            brand: {
                                type: "string",
                                description: "Car rental brand to search (default: ENTERPRISE)",
                                enum: ["ENTERPRISE", "ALAMO", "NATIONAL"],
                            },
                            includeExotics: {
                                type: "boolean",
                                description: "Include exotic/luxury vehicle locations (default: true)",
                            },
                        },
                        required: ["searchTerm", "countryCode"],
                    },
                },
            ],
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case "search_locations_by_city":
                        return await this.searchLocationsByCity(args);
                    case "search_locations_by_state":
                        return await this.searchLocationsByState(args);
                    case "search_locations_by_airport":
                        return await this.searchLocationsByAirport(args);
                    default:
                        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
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
    async makeTextSearchRequest(searchTerm, params) {
        // URL encode the search term
        const encodedSearchTerm = encodeURIComponent(searchTerm);
        const url = new URL(`${this.baseUrl}/text/${encodedSearchTerm}`);
        // Set required parameters
        url.searchParams.append("countryCode", params.countryCode || "US");
        // Set optional parameters with defaults
        url.searchParams.append("brand", params.brand || "ENTERPRISE");
        url.searchParams.append("includeExotics", (params.includeExotics !== false).toString());
        url.searchParams.append("dto", (params.dto !== false).toString());
        url.searchParams.append("cor", params.cor || "US");
        url.searchParams.append("locale", params.locale || "en_US");
        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "User-Agent": "Enterprise-Location-Text-MCP-Server/1.0.0",
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    }
    async searchLocationsByCity(params) {
        try {
            let searchTerm = params.cityName;
            // Add state to search term if provided
            if (params.stateCode) {
                searchTerm = `${params.cityName}, ${params.stateCode}`;
            }
            const data = await this.makeTextSearchRequest(searchTerm, params);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            search_type: "city",
                            search_params: {
                                city: params.cityName,
                                state: params.stateCode,
                                country: params.countryCode,
                                brand: params.brand || "ENTERPRISE",
                                include_exotics: params.includeExotics !== false,
                            },
                            search_term_used: searchTerm,
                            locations_found: Array.isArray(data?.locations) ? data.locations.length : 0,
                            locations: data?.locations || data,
                            raw_response: data,
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
                            search_type: "city",
                            error: error instanceof Error ? error.message : String(error),
                            search_params: params,
                            timestamp: new Date().toISOString(),
                        }, null, 2),
                    },
                ],
            };
        }
    }
    async searchLocationsByState(params) {
        try {
            const searchTerm = params.stateCode;
            const data = await this.makeTextSearchRequest(searchTerm, params);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            search_type: "state",
                            search_params: {
                                state: params.stateCode,
                                country: params.countryCode,
                                brand: params.brand || "ENTERPRISE",
                                include_exotics: params.includeExotics !== false,
                            },
                            locations_found: Array.isArray(data?.locations) ? data.locations.length : 0,
                            locations: data?.locations || data,
                            raw_response: data,
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
                            search_type: "state",
                            error: error instanceof Error ? error.message : String(error),
                            search_params: params,
                            timestamp: new Date().toISOString(),
                        }, null, 2),
                    },
                ],
            };
        }
    }
    async searchLocationsByAirport(params) {
        try {
            // Format airport search - could be airport code or city + airport
            let searchTerm = params.searchTerm;
            // If it looks like an airport code (3-4 uppercase letters), search as-is
            // Otherwise, append "airport" if not already included
            if (!/^[A-Z]{3,4}$/.test(searchTerm) && !searchTerm.toLowerCase().includes('airport')) {
                searchTerm = `${searchTerm} airport`;
            }
            const data = await this.makeTextSearchRequest(searchTerm, params);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
                            success: true,
                            search_type: "airport",
                            search_params: {
                                original_search: params.searchTerm,
                                formatted_search: searchTerm,
                                country: params.countryCode,
                                brand: params.brand || "ENTERPRISE",
                                include_exotics: params.includeExotics !== false,
                            },
                            locations_found: Array.isArray(data?.locations) ? data.locations.length : 0,
                            locations: data?.locations || data,
                            raw_response: data,
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
                            search_type: "airport",
                            error: error instanceof Error ? error.message : String(error),
                            search_params: params,
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
        console.error("Enterprise Location Text Search MCP server running on stdio");
    }
}
const server = new EnterpriseLocationTextServer();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map