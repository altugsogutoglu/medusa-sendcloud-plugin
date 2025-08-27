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
    SendCloudModule,
  ],
  links: [orderSendCloudShipmentLink],
  fulfillmentProviders: [
    {
      resolve: SendCloudFulfillmentProvider,
      id: "sendcloud-fulfillment",
      options: {
        apiKey: options.publicKey,
        apiSecret: options.secretKey,
        baseUrl: "https://panel.sendcloud.sc/api/v2",
        partnerId: options.defaultParcelId?.toString(),
      },
    },
  ],
});

export { SENDCLOUD_MODULE, SendCloudModule };
export * from "./modules/sendcloud/services";
export { SendCloudShipment } from "./modules/sendcloud/models/sendcloud-shipment";
export * from "./workflows/sendcloud/workflows";
export * from "./types/sendcloud";