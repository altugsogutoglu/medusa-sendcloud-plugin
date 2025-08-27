import { z } from "zod";
import { 
  createFindParams,
  createOperatorMap,
} from "@medusajs/medusa/api/utils/validators";

export const AdminGetSendCloudParams = createFindParams({
  limit: 20,
  offset: 0,
})
  .merge(
    z.object({
      q: z.string().optional(),
      id: z
        .union([z.string(), z.array(z.string()), createOperatorMap()])
        .optional(),
      order_id: z
        .union([z.string(), z.array(z.string()), createOperatorMap()])
        .optional(),
      sendcloud_id: z
        .union([z.string(), z.array(z.string()), createOperatorMap()])
        .optional(),
      tracking_number: z
        .union([z.string(), z.array(z.string()), createOperatorMap()])
        .optional(),
      status: z
        .union([z.string(), z.array(z.string()), createOperatorMap()])
        .optional(),
      carrier: z
        .union([z.string(), z.array(z.string()), createOperatorMap()])
        .optional(),
      created_at: createOperatorMap().optional(),
      updated_at: createOperatorMap().optional(),
    })
  )
  .strict();

export type AdminGetSendCloudParamsType = z.infer<typeof AdminGetSendCloudParams>;

export const AdminCreateSendCloudShipment = z.object({
  order_id: z.string(),
  parcel_data: z.record(z.unknown()).optional(),
});
export type AdminCreateSendCloudShipmentType = z.infer<typeof AdminCreateSendCloudShipment>;