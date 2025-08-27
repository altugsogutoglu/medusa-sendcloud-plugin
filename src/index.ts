import { Module } from "@medusajs/framework/utils";
import SendCloudModule, { SENDCLOUD_MODULE } from "./modules/sendcloud";
import orderSendCloudShipmentLink from "./links/order-sendcloud-shipment";
import SendCloudFulfillmentProvider from "./modules/sendcloud/providers/sendcloud-fulfillment";

export interface SendCloudPluginOptions {
  publicKey: string;
  secretKey: string;
  webhookSecret?: string;
  defaultParcelId?: number;
  defaultShippingMethodId?: number;
  defaultServicePointId?: number;
  defaultFromCountry?: string;
  defaultFromPostalCode?: string;
}

export default (options: SendCloudPluginOptions) => ({
  modules: [
    {
      resolve: "./modules/sendcloud",
      options: {
        publicKey: options.publicKey,
        secretKey: options.secretKey,
        webhookSecret: options.webhookSecret,
        defaultParcelId: options.defaultParcelId,
        defaultShippingMethodId: options.defaultShippingMethodId,
        defaultServicePointId: options.defaultServicePointId,
        defaultFromCountry: options.defaultFromCountry || "NL",
        defaultFromPostalCode: options.defaultFromPostalCode || "1000AA",
      },
    },
  ],
  links: [orderSendCloudShipmentLink],
  fulfillmentProviders: [SendCloudFulfillmentProvider],
});

export { SENDCLOUD_MODULE, SendCloudModule };
export * from "./modules/sendcloud/services";
export { SendCloudShipment } from "./modules/sendcloud/models/sendcloud-shipment";
export * from "./workflows/sendcloud/workflows";
export * from "./types/sendcloud";