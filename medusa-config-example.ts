/**
 * Example configuration for using the SendCloud plugin in your Medusa backend
 * Copy this configuration to your backend's medusa-config.ts and adjust as needed
 */

import { loadEnv, defineConfig, Modules } from "@medusajs/framework/utils"
import * as dotenv from "dotenv";

dotenv.config();
loadEnv(process.env.NODE_ENV || "development", process.cwd())

const REDIS_URL = process.env.REDIS_URL;

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  plugins: [
    {
      // Use relative path for local development
      resolve: "../sendcloud-medusa",
      // Or use package name after publishing
      // resolve: "medusa-sendcloud-plugin",
      options: {
        publicKey: process.env.SENDCLOUD_API_KEY!,
        secretKey: process.env.SENDCLOUD_API_SECRET!,
        webhookSecret: process.env.SENDCLOUD_WEBHOOK_SECRET,
        defaultParcelId: parseInt(process.env.SENDCLOUD_DEFAULT_PARCEL_ID || "1"),
        defaultShippingMethodId: parseInt(process.env.SENDCLOUD_DEFAULT_SHIPPING_METHOD || "8"),
        defaultServicePointId: process.env.SENDCLOUD_DEFAULT_SERVICE_POINT,
        defaultFromCountry: process.env.SENDCLOUD_FROM_COUNTRY || "NL",
        defaultFromPostalCode: process.env.SENDCLOUD_FROM_POSTAL_CODE || "1000AA",
      },
    },
  ],
  modules: {
    // Your other modules (Company, Quote, Approval, etc.)
    // Note: Remove the SendCloud module from here as it's now a plugin
    
    [Modules.FULFILLMENT]: {
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: [
          {
            // Reference the fulfillment provider from the plugin
            resolve: "medusa-sendcloud-plugin/providers/sendcloud-fulfillment",
            id: "sendcloud-fulfillment",
            options: {
              apiKey: process.env.SENDCLOUD_API_KEY,
              apiSecret: process.env.SENDCLOUD_API_SECRET,
              baseUrl: process.env.SENDCLOUD_BASE_URL,
              partnerId: process.env.SENDCLOUD_PARTNER_ID,
            },
          },
        ],
      },
    },
    // ... other module configurations
  },
});