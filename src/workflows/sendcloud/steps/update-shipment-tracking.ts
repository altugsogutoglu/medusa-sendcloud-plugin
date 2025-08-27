import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { SENDCLOUD_MODULE } from "../../../modules/sendcloud";
import SendCloudModuleService from "../../../modules/sendcloud/services/sendcloud-module-service";
import SendCloudApiService, { SendCloudConfig } from "../../../modules/sendcloud/services/sendcloud-api-service";

export interface UpdateShipmentTrackingInput {
  shipment_id: string;
  sendcloud_config: SendCloudConfig;
}

export const updateShipmentTrackingStep = createStep(
  "update-shipment-tracking",
  async (input: UpdateShipmentTrackingInput, { container }) => {
    const sendCloudModuleService = container.resolve<SendCloudModuleService>(SENDCLOUD_MODULE);
    const logger = container.resolve("logger");

    try {
      // Get shipment from database
      const shipments = await sendCloudModuleService.listShipments({ id: input.shipment_id });
      const shipment = shipments[0];

      if (!shipment || !shipment.sendcloud_id) {
        throw new Error(`Shipment not found or missing SendCloud ID: ${input.shipment_id}`);
      }

      // Initialize SendCloud API service
      const sendCloudApi = new SendCloudApiService(input.sendcloud_config, logger);

      // Get latest tracking info from SendCloud
      const trackingInfo = await sendCloudApi.getTrackingInfo(parseInt(shipment.sendcloud_id));

      // Map SendCloud status to our status
      const statusMapping = {
        1: "created",
        2: "pending", 
        3: "announced",
        4: "en_route_to_sorting_center",
        5: "delivered_at_sorting_center",
        6: "sorted",
        7: "en_route",
        8: "delivered",
        9: "exception",
        0: "unknown"
      };

      const newStatus = statusMapping[trackingInfo.status?.id] || "unknown";

      // Update shipment with latest tracking info
      const updatedShipment = await sendCloudModuleService.updateShipmentStatus(
        input.shipment_id,
        newStatus,
        {
          tracking_number: trackingInfo.tracking_number,
          tracking_url: trackingInfo.tracking_url,
          carrier: trackingInfo.carrier?.name,
          sendcloud_response: trackingInfo,
          ...(newStatus === "delivered" && { delivered_at: new Date() }),
        }
      );

      return new StepResponse(updatedShipment, {
        shipment_id: input.shipment_id,
        previous_status: shipment.status,
        new_status: newStatus,
      });
    } catch (error) {
      logger.error("Failed to update shipment tracking: " + JSON.stringify({ 
        message: error instanceof Error ? error.message : String(error), 
        shipment_id: input.shipment_id 
      }));
      throw error;
    }
  },
  async (compensationData, { container }) => {
    if (!compensationData?.previous_status) {
      return;
    }

    const sendCloudModuleService = container.resolve<SendCloudModuleService>(SENDCLOUD_MODULE);
    const logger = container.resolve("logger");

    try {
      // Revert status back to previous state
      await sendCloudModuleService.updateShipmentStatus(
        compensationData.shipment_id,
        compensationData.previous_status
      );
    } catch (error) {
      logger.error("Failed to compensate shipment tracking update: " + JSON.stringify({ 
        message: error instanceof Error ? error.message : String(error), 
        shipment_id: compensationData.shipment_id 
      }));
    }
  }
);
