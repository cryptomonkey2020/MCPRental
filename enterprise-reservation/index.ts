#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";

// Types for the Enterprise Reservations API
interface ReservationDetails {
  reservationId?: string;
  confirmationNumber?: string;
  customerId?: string;
}

interface CreateReservationOptions {
  pickupLocation: string;
  returnLocation: string;
  pickupDate: string;
  returnDate: string;
  pickupTime?: string;
  returnTime?: string;
  vehicleClass?: string;
  customerInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
}

interface ModifyReservationOptions {
  reservationId: string;
  pickupLocation?: string;
  returnLocation?: string;
  pickupDate?: string;
  returnDate?: string;
  pickupTime?: string;
  returnTime?: string;
  vehicleClass?: string;
}

interface ListReservationsOptions {
  customerId?: string;
  email?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

interface CancelReservationOptions {
  reservationId?: string;
  confirmationNumber?: string;
  reason?: string;
}

class EnterpriseReservationsServer {
  private server: Server;
  private baseUrl = "https://prd-east.webapi.enterprise.com/enterprise-ewt";

  constructor() {
    this.server = new Server(
      {
        name: "enterprise-reservations",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "get_reservation_details",
            description: "Get detailed information about a specific reservation",
            inputSchema: {
              type: "object",
              properties: {
                reservationId: {
                  type: "string",
                  description: "The reservation ID to retrieve details for",
                },
                confirmationNumber: {
                  type: "string",
                  description: "The confirmation number as alternative to reservation ID",
                },
                customerId: {
                  type: "string",
                  description: "Customer ID for additional filtering",
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: "list_reservations",
            description: "List reservations for a customer or time period",
            inputSchema: {
              type: "object",
              properties: {
                customerId: {
                  type: "string",
                  description: "Customer ID to list reservations for",
                },
                email: {
                  type: "string",
                  description: "Customer email to find reservations",
                },
                startDate: {
                  type: "string",
                  description: "Start date for reservation search (YYYY-MM-DD)",
                },
                endDate: {
                  type: "string",
                  description: "End date for reservation search (YYYY-MM-DD)",
                },
                status: {
                  type: "string",
                  description: "Reservation status filter (active, completed, cancelled)",
                },
              },
              additionalProperties: false,
            },
          },
          {
            name: "create_reservation",
            description: "Create a new car rental reservation",
            inputSchema: {
              type: "object",
              properties: {
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
                pickupTime: {
                  type: "string",
                  description: "Pickup time (HH:MM format)",
                },
                returnTime: {
                  type: "string",
                  description: "Return time (HH:MM format)",
                },
                vehicleClass: {
                  type: "string",
                  description: "Preferred vehicle class code",
                },
                customerInfo: {
                  type: "object",
                  properties: {
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                    email: { type: "string" },
                    phone: { type: "string" },
                  },
                  description: "Customer information for the reservation",
                },
              },
              required: ["pickupLocation", "returnLocation", "pickupDate", "returnDate"],
              additionalProperties: false,
            },
          },
          {
            name: "modify_reservation",
            description: "Modify an existing reservation",
            inputSchema: {
              type: "object",
              properties: {
                reservationId: {
                  type: "string",
                  description: "The reservation ID to modify",
                },
                pickupLocation: {
                  type: "string",
                  description: "New pickup location code or name",
                },
                returnLocation: {
                  type: "string",
                  description: "New return location code or name",
                },
                pickupDate: {
                  type: "string",
                  description: "New pickup date in ISO format (YYYY-MM-DD)",
                },
                returnDate: {
                  type: "string",
                  description: "New return date in ISO format (YYYY-MM-DD)",
                },
                pickupTime: {
                  type: "string",
                  description: "New pickup time (HH:MM format)",
                },
                returnTime: {
                  type: "string",
                  description: "New return time (HH:MM format)",
                },
                vehicleClass: {
                  type: "string",
                  description: "New vehicle class code",
                },
              },
              required: ["reservationId"],
              additionalProperties: false,
            },
          },
          {
            name: "cancel_reservation",
            description: "Cancel a reservation",
            inputSchema: {
              type: "object",
              properties: {
                reservationId: {
                  type: "string",
                  description: "The reservation ID to cancel",
                },
                confirmationNumber: {
                  type: "string",
                  description: "Confirmation number as alternative to reservation ID",
                },
                reason: {
                  type: "string",
                  description: "Reason for cancellation",
                },
              },
              additionalProperties: false,
            },
          },
        ] satisfies Tool[],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "get_reservation_details":
            return await this.getReservationDetails(args as unknown as ReservationDetails);

          case "list_reservations":
            return await this.listReservations(args as unknown as ListReservationsOptions);

          case "create_reservation":
            return await this.createReservation(args as unknown as CreateReservationOptions);

          case "modify_reservation":
            return await this.modifyReservation(args as unknown as ModifyReservationOptions);

          case "cancel_reservation":
            return await this.cancelReservation(args as unknown as CancelReservationOptions);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
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

  private async makeRequest(endpoint: string, options: Record<string, any> = {}): Promise<any> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
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
        "User-Agent": "Enterprise-Reservations-MCP-Server/1.0.0",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json() as any;
  }

  private async getReservationDetails(args: ReservationDetails) {
    try {
      let endpoint = "/reservations";
      const queryParams: Record<string, any> = {};

      if (args.reservationId) {
        endpoint = `/reservations/${args.reservationId}`;
      } else if (args.confirmationNumber) {
        queryParams.confirmationNumber = args.confirmationNumber;
      }

      if (args.customerId) {
        queryParams.customerId = args.customerId;
      }

      const data = await this.makeRequest(endpoint, queryParams);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              reservation_details: data,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    } catch (error) {
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

  private async listReservations(args: ListReservationsOptions) {
    try {
      const queryParams: Record<string, any> = {};

      if (args.customerId) queryParams.customerId = args.customerId;
      if (args.email) queryParams.email = args.email;
      if (args.startDate) queryParams.startDate = args.startDate;
      if (args.endDate) queryParams.endDate = args.endDate;
      if (args.status) queryParams.status = args.status;

      const data = await this.makeRequest("/reservations", queryParams);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              reservations: data,
              search_criteria: args,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : String(error),
              search_criteria: args,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }
  }

  private async createReservation(args: CreateReservationOptions) {
    try {
      const reservationData = {
        pickupLocation: args.pickupLocation,
        returnLocation: args.returnLocation,
        pickupDate: args.pickupDate,
        returnDate: args.returnDate,
        ...(args.pickupTime && { pickupTime: args.pickupTime }),
        ...(args.returnTime && { returnTime: args.returnTime }),
        ...(args.vehicleClass && { vehicleClass: args.vehicleClass }),
        ...(args.customerInfo && { customerInfo: args.customerInfo }),
      };

      const response = await fetch(`${this.baseUrl}/reservations`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "User-Agent": "Enterprise-Reservations-MCP-Server/1.0.0",
        },
        body: JSON.stringify(reservationData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json() as any;
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              reservation_created: data,
              request_data: reservationData,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : String(error),
              request_data: args,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }
  }

  private async modifyReservation(args: ModifyReservationOptions) {
    try {
      const updateData: Record<string, any> = {};

      if (args.pickupLocation) updateData.pickupLocation = args.pickupLocation;
      if (args.returnLocation) updateData.returnLocation = args.returnLocation;
      if (args.pickupDate) updateData.pickupDate = args.pickupDate;
      if (args.returnDate) updateData.returnDate = args.returnDate;
      if (args.pickupTime) updateData.pickupTime = args.pickupTime;
      if (args.returnTime) updateData.returnTime = args.returnTime;
      if (args.vehicleClass) updateData.vehicleClass = args.vehicleClass;

      const response = await fetch(`${this.baseUrl}/reservations/${args.reservationId}`, {
        method: "PUT",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "User-Agent": "Enterprise-Reservations-MCP-Server/1.0.0",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json() as any;
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              reservation_modified: data,
              reservation_id: args.reservationId,
              changes_made: updateData,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : String(error),
              reservation_id: args.reservationId,
              attempted_changes: args,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }
  }

  private async cancelReservation(args: CancelReservationOptions) {
    try {
      let endpoint = "/reservations";
      const cancelData: Record<string, any> = {};

      if (args.reservationId) {
        endpoint = `/reservations/${args.reservationId}/cancel`;
      } else if (args.confirmationNumber) {
        cancelData.confirmationNumber = args.confirmationNumber;
        endpoint = "/reservations/cancel";
      } else {
        throw new Error("Either reservationId or confirmationNumber is required");
      }

      if (args.reason) {
        cancelData.reason = args.reason;
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "DELETE",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "User-Agent": "Enterprise-Reservations-MCP-Server/1.0.0",
        },
        body: Object.keys(cancelData).length > 0 ? JSON.stringify(cancelData) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json() as any;
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: true,
              cancellation_result: data,
              reservation_id: args.reservationId,
              confirmation_number: args.confirmationNumber,
              reason: args.reason,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : String(error),
              reservation_id: args.reservationId,
              confirmation_number: args.confirmationNumber,
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
    console.error("Enterprise Reservations MCP Server running on stdio");
  }
}

const server = new EnterpriseReservationsServer();
server.run().catch(console.error);