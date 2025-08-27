export const sendCloudShipmentFields = [
  "id",
  "order_id",
  "sendcloud_id",
  "tracking_number",
  "tracking_url",
  "carrier",
  "service_point_id",
  "service_point_name",
  "service_point_address",
  "status",
  "weight",
  "length",
  "width", 
  "height",
  "recipient_name",
  "recipient_company",
  "recipient_address",
  "recipient_house_number",
  "recipient_city",
  "recipient_postal_code",
  "recipient_country",
  "recipient_email",
  "recipient_phone",
  "error_message",
  "retry_count",
  "shipped_at",
  "delivered_at",
  "created_at",
  "updated_at",
];

export const listSendCloudShipmentsTransformQueryConfig = {
  defaults: sendCloudShipmentFields,
  isList: true,
};

export const retrieveSendCloudShipmentTransformQueryConfig = {
  defaults: [
    ...sendCloudShipmentFields,
    "sendcloud_response", // Include full response data for individual shipment
  ],
  isList: false,
};
