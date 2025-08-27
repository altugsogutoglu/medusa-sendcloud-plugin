import {
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework";
import { MiddlewareRoute } from "@medusajs/medusa";
import {
  listSendCloudShipmentsTransformQueryConfig,
  retrieveSendCloudShipmentTransformQueryConfig,
} from "./query-config";
import {
  AdminGetSendCloudParams,
  AdminCreateSendCloudShipment,
} from "./validators";

export const adminSendCloudMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/admin/sendcloud",
    middlewares: [
      validateAndTransformQuery(
        AdminGetSendCloudParams,
        listSendCloudShipmentsTransformQueryConfig
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/admin/sendcloud",
    middlewares: [
      validateAndTransformBody(AdminCreateSendCloudShipment),
      validateAndTransformQuery(
        AdminGetSendCloudParams,
        retrieveSendCloudShipmentTransformQueryConfig
      ),
    ],
  },
];
