import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { SENDCLOUD_MODULE } from "../../../modules/sendcloud";
import SendCloudModuleService from "../../../modules/sendcloud/services/sendcloud-module-service";
import { createSendCloudShipmentWorkflow } from "../../../workflows/sendcloud/workflows";
import { SendCloudParcel } from "../../../modules/sendcloud/services/sendcloud-api-service";
import type { AdminGetSendCloudParamsType, AdminCreateSendCloudShipmentType } from "./validators";

export const GET = async (
  req: MedusaRequest<AdminGetSendCloudParamsType>,
  res: MedusaResponse
) => {
  const sendCloudModuleService = req.scope.resolve<SendCloudModuleService>(SENDCLOUD_MODULE);

  const { fields, pagination } = req.queryConfig;
  
  const shipments = await sendCloudModuleService.listShipments(
    req.filterableFields || {},
    {
      select: fields,
      skip: pagination.skip,
      take: pagination.take,
    }
  );

  res.json({
    shipments,
    count: shipments.length,
    offset: pagination.skip,
    limit: pagination.take,
  });
};

export const POST = async (
  req: MedusaRequest<AdminCreateSendCloudShipmentType>,
  res: MedusaResponse
) => {
  const { order_id, parcel_data } = req.validatedBody;

  // Get SendCloud config from environment
  const sendcloud_config = {
    apiKey: process.env.SENDCLOUD_API_KEY!,
    apiSecret: process.env.SENDCLOUD_API_SECRET!,
    baseUrl: process.env.SENDCLOUD_BASE_URL,
    partnerId: process.env.SENDCLOUD_PARTNER_ID,
  };

  if (!sendcloud_config.apiKey || !sendcloud_config.apiSecret) {
    return res.status(400).json({
      message: "SendCloud API credentials not configured",
    });
  }

  if (!parcel_data) {
    return res.status(400).json({
      message: "Parcel data is required",
    });
  }

  const { result } = await createSendCloudShipmentWorkflow(req.scope).run({
    input: {
      order_id,
      parcel_data: parcel_data as unknown as SendCloudParcel,
      sendcloud_config,
    },
  });

  res.json({
    shipment: result,
  });
};
