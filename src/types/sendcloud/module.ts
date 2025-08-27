export type ModuleSendCloudShipment = {
  id: string;
  order_id: string;
  sendcloud_id: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  carrier: string | null;
  service_point_id: string | null;
  service_point_name: string | null;
  service_point_address: string | null;
  status: SendCloudShipmentStatus;
  weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  recipient_name: string;
  recipient_company: string | null;
  recipient_address: string;
  recipient_house_number: string;
  recipient_city: string;
  recipient_postal_code: string;
  recipient_country: string;
  recipient_email: string | null;
  recipient_phone: string | null;
  sendcloud_response: any;
  error_message: string | null;
  retry_count: number;
  shipped_at: Date | null;
  delivered_at: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

export type SendCloudShipmentStatus = 
  | "created"
  | "pending"
  | "announced"
  | "en_route_to_sorting_center"
  | "delivered_at_sorting_center"
  | "sorted"
  | "en_route"
  | "delivered"
  | "exception"
  | "unknown";

export type ModuleCreateSendCloudShipment = {
  order_id: string;
  sendcloud_id?: string | null;
  tracking_number?: string | null;
  tracking_url?: string | null;
  carrier?: string | null;
  service_point_id?: string | null;
  service_point_name?: string | null;
  service_point_address?: string | null;
  status?: SendCloudShipmentStatus;
  weight?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  recipient_name: string;
  recipient_company?: string | null;
  recipient_address: string;
  recipient_house_number: string;
  recipient_city: string;
  recipient_postal_code: string;
  recipient_country: string;
  recipient_email?: string | null;
  recipient_phone?: string | null;
  sendcloud_response?: any;
  error_message?: string | null;
  retry_count?: number;
  shipped_at?: Date | null;
  delivered_at?: Date | null;
};

export interface ModuleUpdateSendCloudShipment extends Partial<ModuleSendCloudShipment> {
  id: string;
}
