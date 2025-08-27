import { MedusaService } from "@medusajs/framework/utils";
import { SendCloudShipment } from "../models";

class SendCloudModuleService extends MedusaService({
  SendCloudShipment,
}) {
  
  /**
   * Create a new SendCloud shipment
   */
  async createShipment(data: any) {
    return await this.createSendCloudShipments(data);
  }

  /**
   * Get shipment by order ID
   */
  async getShipmentByOrderId(orderId: string) {
    return await this.listSendCloudShipments({ 
      order_id: orderId 
    });
  }

  /**
   * Update shipment status
   */
  async updateShipmentStatus(shipmentId: string, status: string, trackingData?: any) {
    return await this.updateSendCloudShipments(shipmentId, {
      status,
      ...trackingData,
    });
  }

  /**
   * Get all shipments with pagination
   */
  async listShipments(filters?: any, config?: any) {
    return await this.listSendCloudShipments(filters, config);
  }

  /**
   * Delete shipment
   */
  async deleteShipment(shipmentId: string) {
    return await this.deleteSendCloudShipments(shipmentId);
  }
}

export default SendCloudModuleService;
