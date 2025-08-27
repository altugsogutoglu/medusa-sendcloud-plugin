import { model } from "@medusajs/framework/utils";

export const SendCloudShipment = model.define("sendcloud_shipment", {
  id: model.id().primaryKey(),
  
  // Order reference
  order_id: model.text(),
  
  // SendCloud specific fields
  sendcloud_id: model.text().nullable(), // SendCloud parcel ID
  tracking_number: model.text().nullable(),
  tracking_url: model.text().nullable(),
  
  // Shipping details
  carrier: model.text().nullable(),
  service_point_id: model.text().nullable(),
  service_point_name: model.text().nullable(),
  service_point_address: model.text().nullable(),
  
  // Status tracking
  status: model.enum([
    "created",
    "pending",
    "announced",
    "en_route_to_sorting_center",
    "delivered_at_sorting_center", 
    "sorted",
    "en_route",
    "delivered",
    "exception",
    "unknown"
  ]).default("created"),
  
  // Shipping information
  weight: model.number().nullable(),
  length: model.number().nullable(),
  width: model.number().nullable(),
  height: model.number().nullable(),
  
  // Recipient information
  recipient_name: model.text(),
  recipient_company: model.text().nullable(),
  recipient_address: model.text(),
  recipient_house_number: model.text(),
  recipient_city: model.text(),
  recipient_postal_code: model.text(),
  recipient_country: model.text(),
  recipient_email: model.text().nullable(),
  recipient_phone: model.text().nullable(),
  
  // SendCloud response data
  sendcloud_response: model.json().nullable(),
  
  // Error handling
  error_message: model.text().nullable(),
  retry_count: model.number().default(0),
  
  // Timestamps
  shipped_at: model.dateTime().nullable(),
  delivered_at: model.dateTime().nullable(),
});
