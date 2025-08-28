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
  
  // Plugins in Medusa v2 don't register fulfillment providers directly
  // The consuming application must configure the Fulfillment Module
  const config = {
    modules: [
      SendCloudModule,
    ],
    links: [orderSendCloudShipmentLink],
  };
  
  return config;
};

export { SENDCLOUD_MODULE, SendCloudModule };
export * from "./modules/sendcloud/services";
export { SendCloudShipment } from "./modules/sendcloud/models/sendcloud-shipment";
export * from "./workflows/sendcloud/workflows";
export * from "./types/sendcloud";