import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { updateShipmentTrackingStep, UpdateShipmentTrackingInput } from "../steps/update-shipment-tracking";

export const updateSendCloudTrackingWorkflow = createWorkflow(
  "update-sendcloud-tracking-workflow",
  function (input: UpdateShipmentTrackingInput) {
    const updatedShipment = updateShipmentTrackingStep(input);
    return new WorkflowResponse(updatedShipment);
  }
);
