import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { SENDCLOUD_MODULE } from "../../../modules/sendcloud";
import SendCloudModuleService from "../../../modules/sendcloud/services/sendcloud-module-service";
import { createSendCloudShipmentWorkflow } from "../../../workflows/sendcloud/workflows";
import { SendCloudParcel } from "../../../modules/sendcloud/services/sendcloud-api-service";
import type { AdminGetSendCloudParamsType, AdminCreateSendCloudShipmentType } from "./validators";

export const GET = async (
  req: MedusaRequest<AdminGetSendCloudParamsType>,
  res: MedusaResponse
) => {
  const logger = req.scope.resolve("logger");
  
  logger.info("🔥 [API UPDATED] GET /admin/sendcloud called");
  logger.debug("req.queryConfig: " + JSON.stringify(req.queryConfig));
  logger.debug("req.filterableFields: " + JSON.stringify(req.filterableFields));
  
  // Check fulfillment providers first
  try {
    logger.info("🔥 [SENDCLOUD ROUTE] Attempting to resolve fulfillmentModuleService...");
    
    // Try different ways to resolve the fulfillment service
    let fulfillmentModuleService: any;
    try {
      // Use Modules.FULFILLMENT constant for proper resolution
      fulfillmentModuleService = req.scope.resolve(Modules.FULFILLMENT);
      logger.info("🔥 [SENDCLOUD ROUTE] Resolved using Modules.FULFILLMENT");
    } catch (resolveError: any) {
      logger.error("🔥 [SENDCLOUD ROUTE] Could not resolve Modules.FULFILLMENT: " + resolveError.message);
      // Try alternative resolutions
      try {
        fulfillmentModuleService = req.scope.resolve("fulfillmentModuleService");
        logger.info("🔥 [SENDCLOUD ROUTE] Resolved using 'fulfillmentModuleService'");
      } catch (altError: any) {
        logger.error("🔥 [SENDCLOUD ROUTE] Could not resolve fulfillmentModuleService: " + altError.message);
        try {
          fulfillmentModuleService = req.scope.resolve("fulfillment");
          logger.info("🔥 [SENDCLOUD ROUTE] Resolved using 'fulfillment'");
        } catch (lastError: any) {
          logger.error("🔥 [SENDCLOUD ROUTE] Could not resolve fulfillment either: " + lastError.message);
        }
      }
    }
    
    logger.info("🔥 [SENDCLOUD ROUTE] FulfillmentModuleService resolved: " + !!fulfillmentModuleService);
    
    if (fulfillmentModuleService) {
      const fulfillmentProviders = await fulfillmentModuleService.listFulfillmentProviders({});
      logger.info("🔥 [SENDCLOUD ROUTE] Fulfillment providers count: " + fulfillmentProviders.length);
      logger.debug("🔥 [SENDCLOUD ROUTE] Raw fulfillment providers: " + JSON.stringify(fulfillmentProviders, null, 2));
      
      const sendCloudProvider = fulfillmentProviders.find((p: any) => p?.id === 'sendcloud-fulfillment');
      logger.info("🔥 [SENDCLOUD ROUTE] SendCloud provider found: " + JSON.stringify(sendCloudProvider));
    } else {
      logger.warn("🔥 [SENDCLOUD ROUTE] FulfillmentModuleService not available");
    }
  } catch (error: any) {
    logger.error("🔥 [SENDCLOUD ROUTE] Error getting fulfillment providers - Message: " + error?.message);
    logger.error("🔥 [SENDCLOUD ROUTE] Error type: " + typeof error);
    logger.error("🔥 [SENDCLOUD ROUTE] Error name: " + error?.name);
    logger.error("🔥 [SENDCLOUD ROUTE] Error stack: " + error?.stack);
    logger.error("🔥 [SENDCLOUD ROUTE] Full error: " + JSON.stringify(error, Object.getOwnPropertyNames(error)));
  }
  
  const sendCloudModuleService = req.scope.resolve<SendCloudModuleService>(SENDCLOUD_MODULE);

  // Handle case where queryConfig might be undefined
  const fields = req.queryConfig?.fields;
  const pagination = req.queryConfig?.pagination || { skip: 0, take: 20 };
  
  logger.debug("fields: " + JSON.stringify(fields));
  logger.debug("pagination: " + JSON.stringify(pagination));
  
  const shipments = await sendCloudModuleService.listShipments(
    req.filterableFields || {},
    {
      select: fields,
      skip: pagination.skip,
      take: pagination.take,
    }
  );

  logger.info("shipments found: " + shipments.length);
  logger.debug("shipments data: " + JSON.stringify(shipments));

  const response = {
    shipments,
    count: shipments.length,
    offset: pagination.skip,
    limit: pagination.take,
  };
  
  logger.debug("API response: " + JSON.stringify(response));
  res.json(response);
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
