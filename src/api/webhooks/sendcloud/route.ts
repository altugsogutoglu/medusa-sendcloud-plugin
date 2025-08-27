import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { SENDCLOUD_MODULE } from "../../../modules/sendcloud";
import SendCloudModuleService from "../../../modules/sendcloud/services/sendcloud-module-service";

interface SendCloudWebhookPayload {
  parcel: {
    id: number;
    tracking_number: string;
    tracking_url: string;
    status: {
      id: number;
      message: string;
    };
    carrier: {
      code: string;
      name: string;
    };
    external_reference?: string;
    order_number?: string;
  };
  timestamp: string;
  action: string;
}

export const POST = async (
  req: MedusaRequest<SendCloudWebhookPayload>,
  res: MedusaResponse
) => {
  const logger = req.scope.resolve("logger");
  const sendCloudModuleService = req.scope.resolve<SendCloudModuleService>(SENDCLOUD_MODULE);

  try {
    const payload = req.body;
    
    logger.info("Received SendCloud webhook: " + JSON.stringify({ 
      parcel_id: payload.parcel?.id,
      action: payload.action,
      status: payload.parcel?.status?.message 
    }));

    // Find shipment by SendCloud ID
    const shipments = await sendCloudModuleService.listShipments({
      sendcloud_id: payload.parcel.id.toString(),
    });

    if (!shipments || shipments.length === 0) {
      logger.warn("Shipment not found for SendCloud webhook: " + JSON.stringify({ 
        sendcloud_id: payload.parcel.id 
      }));
      return res.status(404).json({ message: "Shipment not found" });
    }

    const shipment = shipments[0];

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

    const newStatus = statusMapping[payload.parcel.status.id] || "unknown";

    // Update shipment status
    await sendCloudModuleService.updateShipmentStatus(
      shipment.id,
      newStatus,
      {
        tracking_number: payload.parcel.tracking_number,
        tracking_url: payload.parcel.tracking_url,
        carrier: payload.parcel.carrier?.name,
        sendcloud_response: payload.parcel,
        ...(newStatus === "delivered" && { delivered_at: new Date() }),
      }
    );

    logger.info("Updated shipment from SendCloud webhook: " + JSON.stringify({
      shipment_id: shipment.id,
      old_status: shipment.status,
      new_status: newStatus,
    }));

    // TODO: Emit event for other services to react to status changes
    // await eventBusService.emit("sendcloud.shipment.updated", {
    //   shipment_id: shipment.id,
    //   order_id: shipment.order_id,
    //   status: newStatus,
    // });

    res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    logger.error("Failed to process SendCloud webhook: " + (error instanceof Error ? error.message : String(error)));
    res.status(500).json({ message: "Internal server error" });
  }
};
