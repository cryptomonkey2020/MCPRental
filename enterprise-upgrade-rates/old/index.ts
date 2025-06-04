#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";

// Types for the Enterprise API
interface SessionData {
  session: {
    gma: {
      country_of_residence: Record<string, any>;
      timeout: number;
      creation_time: string;
      testing_early_timeout: boolean;
      remember_me_eligible: boolean;
      logged_in: boolean;
      keep_me_logged_in_enabled: boolean;
      manually_selected_extras: boolean;
      prep_allow_collect_payment: boolean;
      associated_with_profile: boolean;
      prepay_card_registration_successful: boolean;
      inflight_modification: boolean;
      show_modal: boolean;
      logged_on_res_flow: boolean;
      reservation: {
        allowed_res_screens: string[];
        modify: boolean;
        modify_previous_vehicle_invalid: boolean;
        modify_previous_extras_invalid: boolean;
        modify_previous_vehicle_invalid_for_redemption: boolean;
        modify_longer_points_duration: boolean;
        deeplink: boolean;
        upgrade_selected: boolean;
        creation_time: string;
        contract_updated_to_leisure_contract: boolean;
        contract_updated_to_ec_contract: boolean;
        contract_removed: boolean;
        inferred_age: boolean;
        prep_show_associate_modal: boolean;
        on_request_car_class_selected: boolean;
        has_enough_redemption_points_to_redeem_one_day: boolean;
        redemption_points_expire_before_return_date: boolean;
        show_drive_type_filter: boolean;
        modify_complete: boolean;
        view_mod_cancel_by_ta: boolean;
        digital_signature: boolean;
        expedite: {
          expedited: boolean;
          expedited_profile_found: boolean;
          expedited_enroll: boolean;
        };
        default_top_nav_amount: {
          amount: string;
          format: string;
          formatted_amount: string;
          decimal_separator: string;
        };
      };
    };
  };
  session_timeout: number;
  gbo: {
    promotion_ineligible: boolean;
  };
  analytics: {
    renter: {
      email_opt_in: boolean;
    };
    show_concur: boolean;
  };
  go_to: {
    children: string[];
    parent: string;
  };
}

interface UpgradeRatesOptions {
  reservationId?: string;
  pickupLocation?: string;
  returnLocation?: string;
  pickupDate?: string;
  returnDate?: string;
  vehicleClass?: string;
  customerType?: string;
  renterAge?: number;
}

class EnterpriseUpgradeRatesServer {
  private server: Server;
  private baseUrl = "https://prd-east.webapi.enterprise.com/enterprise-ewt";

  constructor() {
    this.server = new Server(
      {
        name: "enterprise-upgrade-rates",
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
        ] satisfies Tool[],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "get_upgrade_rates":
            return await this.getUpgradeRates(args as UpgradeRatesOptions);
          
          case "get_session_info":
            return await this.getSessionInfo(args as { sessionId?: string });
          
          case "check_upgrade_availability":
            return await this.checkUpgradeAvailability(args as { reservationId: string; preferredClass?: string });

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

    return await response.json() as any;
  }

  private async getUpgradeRates(options: UpgradeRatesOptions) {
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

  private async getSessionInfo(args: { sessionId?: string }) {
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

  private async checkUpgradeAvailability(args: { reservationId: string; preferredClass?: string }) {
    try {
      const options = {
        reservationId: args.reservationId,
        ...(args.preferredClass && { vehicleClass: args.preferredClass }),
      };
      
      const data = await this.makeRequest("/reservations/upgrade/rates", options);
      
      // Analyze the response to determine upgrade availability
      const sessionData = data as SessionData;
      const upgradeAvailable = sessionData.session?.gma?.reservation?.upgrade_selected !== undefined;
      
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
    } catch (error) {
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
