import { Module } from "@medusajs/framework/utils";
import SendCloudModuleService from "./services/sendcloud-module-service";
import { SendCloudShipment } from "./models/sendcloud-shipment";

export const SENDCLOUD_MODULE = "sendcloud";

export default Module(SENDCLOUD_MODULE, {
  service: SendCloudModuleService,
});

export { SendCloudShipment } from "./models/sendcloud-shipment";
export * from "./services";
export { default as SendCloudFulfillmentProvider } from "./providers/sendcloud-fulfillment";
