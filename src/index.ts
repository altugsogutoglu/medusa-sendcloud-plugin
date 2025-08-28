import { Module } from "@medusajs/framework/utils";
import SendCloudModule, { SENDCLOUD_MODULE } from "./modules/sendcloud";
import orderSendCloudShipmentLink from "./links/order-sendcloud-shipment";

export interface SendCloudPluginOptions {
  publicKey: string;
  secretKey: string;
  baseUrl: string;
  partnerId: string;
}

export default (options: SendCloudPluginOptions) => {
  // Use console.log for plugin initialization as logger isn't available yet
  console.log("🔥 [PLUGIN INDEX] Plugin initialization called");
  console.log("🔥 [PLUGIN INDEX] Options:", JSON.stringify(options));
  console.log("🔥 [PLUGIN INDEX] SendCloudModule:", SendCloudModule);
  
  // Plugins in Medusa v2 don't register fulfillment providers directly
  // The consuming application must configure the Fulfillment Module
  const config = {
    modules: [
      SendCloudModule,
    ],
    links: [orderSendCloudShipmentLink],
  };
  
  console.log("🔥 [PLUGIN INDEX] Config being returned:", JSON.stringify(config, null, 2));
  return config;
};

export { SENDCLOUD_MODULE, SendCloudModule };
export * from "./modules/sendcloud/services";
export { SendCloudShipment } from "./modules/sendcloud/models/sendcloud-shipment";
export * from "./workflows/sendcloud/workflows";
export * from "./types/sendcloud";