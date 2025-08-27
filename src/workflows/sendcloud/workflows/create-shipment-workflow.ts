import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { createSendCloudShipmentStep, CreateSendCloudShipmentInput } from "../steps/create-sendcloud-shipment";

export const createSendCloudShipmentWorkflow = createWorkflow(
  "create-sendcloud-shipment-workflow",
  function (input: CreateSendCloudShipmentInput) {
    const shipment = createSendCloudShipmentStep(input);
    return new WorkflowResponse(shipment);
  }
);
