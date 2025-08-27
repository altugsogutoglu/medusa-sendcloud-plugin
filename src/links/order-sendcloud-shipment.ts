import { defineLink } from "@medusajs/framework/utils";
import OrderModule from "@medusajs/medusa/order";
import SendCloudModule from "../modules/sendcloud";

export default defineLink(
  OrderModule.linkable.order,
  {
    linkable: SendCloudModule.linkable.sendcloudShipment,
    isList: true, // One order can have multiple shipments
  }
);
