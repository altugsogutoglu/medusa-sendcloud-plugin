import { defineMiddlewares } from "@medusajs/framework/http";
import { adminSendCloudMiddlewares } from "./admin/sendcloud/middlewares";

export default defineMiddlewares({
  routes: adminSendCloudMiddlewares,
});