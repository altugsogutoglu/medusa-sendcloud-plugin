# SendCloud Module

A comprehensive SendCloud shipping integration module for Medusa v2.9.

## Features

- **Shipment Creation**: Create shipments in SendCloud directly from orders
- **Tracking Updates**: Automatic tracking status updates via webhooks
- **Service Points**: Support for pickup locations and service points
- **Multi-Carrier**: Works with all SendCloud supported carriers
- **Error Handling**: Robust error handling with retry mechanisms
- **Workflow Integration**: Full Medusa v2 workflow support

## Installation

The module is already integrated into your Medusa application. To configure:

1. **Environment Variables**: Set up your SendCloud API credentials in `.env`:
   ```env
   SENDCLOUD_API_KEY=your-api-key
   SENDCLOUD_API_SECRET=your-api-secret
   SENDCLOUD_BASE_URL=https://panel.sendcloud.sc/api/v2
   SENDCLOUD_PARTNER_ID=your-partner-id
   ```

2. **Database Migration**: Run the migration to create the shipment table:
   ```bash
   npx medusa db:migrate
   ```

3. **Link Sync**: Sync the module links:
   ```bash
   npx medusa db:sync-links
   ```

## API Endpoints

### Admin Endpoints

#### `GET /admin/sendcloud`
List all SendCloud shipments with pagination and filtering.

#### `POST /admin/sendcloud`
Create a new shipment in SendCloud.

**Body:**
```json
{
  "order_id": "order_123",
  "parcel_data": {
    "name": "John Doe",
    "company_name": "ACME Corp",
    "address": "Main Street",
    "house_number": "123",
    "city": "Amsterdam",
    "postal_code": "1000AA",
    "country": "NL",
    "email": "john@example.com",
    "telephone": "+31612345678",
    "weight": 1000,
    "order_number": "ORDER-123"
  }
}
```

### Webhook Endpoint

#### `POST /webhooks/sendcloud`
Receives status updates from SendCloud. Configure this URL in your SendCloud panel:
```
https://your-domain.com/webhooks/sendcloud
```

## Usage Examples

### Create Shipment Workflow

```typescript
import { createSendCloudShipmentWorkflow } from "./workflows/sendcloud";

const { result } = await createSendCloudShipmentWorkflow(container).run({
  input: {
    order_id: "order_123",
    parcel_data: {
      name: "John Doe",
      address: "Main Street",
      house_number: "123",
      city: "Amsterdam",
      postal_code: "1000AA",
      country: "NL",
      weight: 1000,
      order_number: "ORDER-123"
    },
    sendcloud_config: {
      apiKey: process.env.SENDCLOUD_API_KEY!,
      apiSecret: process.env.SENDCLOUD_API_SECRET!,
    }
  }
});
```

### Query Shipments

```typescript
import { SENDCLOUD_MODULE } from "./modules/sendcloud";

const sendCloudService = container.resolve(SENDCLOUD_MODULE);

// Get shipments by order
const shipments = await sendCloudService.getShipmentByOrderId("order_123");

// List all shipments
const allShipments = await sendCloudService.listShipments({
  status: "delivered"
});
```

## Shipment Status Flow

1. **created** - Shipment created in database
2. **pending** - Waiting for carrier pickup
3. **announced** - Announced to carrier
4. **en_route_to_sorting_center** - In transit to sorting center
5. **delivered_at_sorting_center** - At sorting center
6. **sorted** - Sorted at center
7. **en_route** - Out for delivery
8. **delivered** - Successfully delivered
9. **exception** - Delivery exception occurred
10. **unknown** - Status unknown

## Configuration

### SendCloud Panel Setup

1. Go to Settings > Integrations in your SendCloud panel
2. Add webhook URL: `https://your-domain.com/webhooks/sendcloud`
3. Enable status update notifications
4. Note your API key and secret from the API settings

### Carrier Configuration

Configure your preferred carriers in the SendCloud panel. The module supports all SendCloud carriers including:

- PostNL
- DPD
- DHL
- UPS
- FedEx
- And many more

## Error Handling

The module includes comprehensive error handling:

- **API Failures**: Retries with exponential backoff
- **Invalid Data**: Validation errors with detailed messages
- **Network Issues**: Automatic retry mechanisms
- **Webhook Failures**: Graceful error handling with logging

## Database Schema

The module creates a `sendcloud_shipment` table with the following structure:

- Shipment tracking information
- Recipient details
- Status and timestamps
- SendCloud API responses
- Error tracking and retry counts

## Integration with Orders

The module automatically links to orders via the `order-sendcloud-shipment` link, allowing you to:

- Query shipments for specific orders
- Track delivery status per order
- Generate shipping reports
- Handle returns and exchanges

## Support

For issues related to:
- **SendCloud API**: Check SendCloud documentation
- **Module Integration**: Review the workflow and service implementations
- **Database Issues**: Check migration files and model definitions
