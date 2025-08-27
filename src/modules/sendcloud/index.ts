import { Module } from "@medusajs/framework/utils";
import SendCloudModuleService from "./services/sendcloud-module-service";
import loader from "./loaders";

export const SENDCLOUD_MODULE = "sendcloud";

export default Module(SENDCLOUD_MODULE, {
  service: SendCloudModuleService,
  loaders: [loader],
});

export { SendCloudShipment } from "./models/sendcloud-shipment";
export * from "./services";
export { default as SendCloudFulfillmentProvider } from "./providers/sendcloud-fulfillment";
