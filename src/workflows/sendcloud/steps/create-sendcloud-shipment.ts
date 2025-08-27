import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { SENDCLOUD_MODULE } from "../../../modules/sendcloud";
import SendCloudModuleService from "../../../modules/sendcloud/services/sendcloud-module-service";
import SendCloudApiService, { SendCloudConfig, SendCloudParcel } from "../../../modules/sendcloud/services/sendcloud-api-service";

export interface CreateSendCloudShipmentInput {
  order_id: string;
  parcel_data: SendCloudParcel;
  sendcloud_config: SendCloudConfig;
}

export const createSendCloudShipmentStep = createStep(
  "create-sendcloud-shipment",
  async (input: CreateSendCloudShipmentInput, { container }) => {
    const sendCloudModuleService = container.resolve<SendCloudModuleService>(SENDCLOUD_MODULE);
    const logger = container.resolve("logger");

    try {
      // Initialize SendCloud API service
      const sendCloudApi = new SendCloudApiService(input.sendcloud_config, logger);

      // Create parcel in SendCloud
      const sendCloudParcel = await sendCloudApi.createParcel(input.parcel_data);

      // Create shipment record in our database
      const shipment = await sendCloudModuleService.createShipment({
        order_id: input.order_id,
        sendcloud_id: sendCloudParcel.id?.toString(),
        tracking_number: sendCloudParcel.tracking_number,
        tracking_url: sendCloudParcel.tracking_url,
        carrier: sendCloudParcel.carrier?.name,
        service_point_id: input.parcel_data.service_point_id,
        status: "created",
        weight: input.parcel_data.weight,
        recipient_name: input.parcel_data.name,
        recipient_company: input.parcel_data.company_name,
        recipient_address: input.parcel_data.address,
        recipient_house_number: input.parcel_data.house_number,
        recipient_city: input.parcel_data.city,
        recipient_postal_code: input.parcel_data.postal_code,
        recipient_country: input.parcel_data.country,
        recipient_email: input.parcel_data.email,
        recipient_phone: input.parcel_data.telephone,
        sendcloud_response: sendCloudParcel,
      });

      return new StepResponse(shipment, {
        shipment_id: shipment.id,
        sendcloud_id: sendCloudParcel.id,
      });
    } catch (error) {
      logger.error("Failed to create SendCloud shipment: " + JSON.stringify({ 
        message: error instanceof Error ? error.message : String(error), 
        order_id: input.order_id 
      }));
      
      // Create error record in database
      const errorShipment = await sendCloudModuleService.createShipment({
        order_id: input.order_id,
        status: "exception",
        error_message: error.message,
        recipient_name: input.parcel_data.name,
        recipient_address: input.parcel_data.address,
        recipient_house_number: input.parcel_data.house_number,
        recipient_city: input.parcel_data.city,
        recipient_postal_code: input.parcel_data.postal_code,
        recipient_country: input.parcel_data.country,
      });

      throw error;
    }
  },
  async (compensationData, { container }) => {
    if (!compensationData?.shipment_id) {
      return;
    }

    const sendCloudModuleService = container.resolve<SendCloudModuleService>(SENDCLOUD_MODULE);
    const logger = container.resolve("logger");

    try {
      // Delete the shipment record
      await sendCloudModuleService.deleteShipment(compensationData.shipment_id);
      
      // Optionally cancel the SendCloud parcel if it was created
      if (compensationData.sendcloud_id) {
        // Note: Implement SendCloud parcel cancellation if needed
                logger.info("SendCloud parcel may need manual cancellation: " + JSON.stringify({
          sendcloud_id: compensationData.sendcloud_id
        }));
      }
    } catch (error) {
      logger.error("Failed to compensate SendCloud shipment creation: " + JSON.stringify({ 
        message: error instanceof Error ? error.message : String(error), 
        shipment_id: compensationData.shipment_id 
      }));
    }
  }
);
