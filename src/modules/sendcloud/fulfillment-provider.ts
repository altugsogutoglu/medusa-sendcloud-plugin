import { ModuleProvider, Modules } from "@medusajs/framework/utils";
import SendCloudFulfillmentProvider from "./providers/sendcloud-fulfillment";

export default ModuleProvider(Modules.FULFILLMENT, {
  services: [SendCloudFulfillmentProvider]
});
