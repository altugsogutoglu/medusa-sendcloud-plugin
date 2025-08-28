# SendCloud Plugin for Medusa v2.9

A comprehensive SendCloud integration plugin for MedusaJS v2.9.0 that provides shipping and fulfillment capabilities.

## Compatibility

- **Medusa v2.9.0+**: Fully compatible
- **Medusa v2.8.x and below**: Not supported
- **Node.js**: v20+ required
- **TypeScript**: v5.6+ recommended

## Features

- SendCloud shipment creation and management
- Order fulfillment integration
- Webhook handling for tracking updates
- Admin UI for shipment management
- Automated shipping workflows
- Full Medusa v2.9.0 compatibility with latest framework patterns
- Enhanced type safety with Zod validation
- Streamlined plugin architecture without loaders

## Installation

### Local Development

1. Install dependencies in the plugin folder:
```bash
cd sendcloud-medusa
yarn install
```

2. Build the plugin:
```bash
yarn build
```

3. For development with hot-reloading:
```bash
yarn dev
```

## Configuration

### Using as a Module Provider (Recommended)

In your `medusa-config.ts`:

```typescript
import { loadEnv, defineConfig, Modules } from "@medusajs/framework/utils"

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS,
      adminCors: process.env.ADMIN_CORS,
      authCors: process.env.AUTH_CORS,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  modules: {
    [Modules.FULFILLMENT]: {
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: [
          {
            resolve: "@medita/medusa-sendcloud-plugin/providers/sendcloud-fulfillment",
            id: "sendcloud-fulfillment",
            options: {
              apiKey: process.env.SENDCLOUD_API_KEY,
              apiSecret: process.env.SENDCLOUD_API_SECRET,
              baseUrl: process.env.SENDCLOUD_BASE_URL,
              partnerId: process.env.SENDCLOUD_PARTNER_ID,
              defaultCountry: process.env.SENDCLOUD_DEFAULT_COUNTRY || 'NL',
            },
          },
        ],
      },
    },
  },
});
```

### Alternative: Using as a Plugin

You can also register it as a plugin (includes additional features like webhooks and admin APIs):

```typescript
plugins: [
  {
    resolve: "@medita/medusa-sendcloud-plugin",
    options: {
      apiKey: process.env.SENDCLOUD_API_KEY,
      apiSecret: process.env.SENDCLOUD_API_SECRET,
      baseUrl: process.env.SENDCLOUD_BASE_URL,
      partnerId: process.env.SENDCLOUD_PARTNER_ID,
      defaultCountry: process.env.SENDCLOUD_DEFAULT_COUNTRY || 'NL',
    },
  },
],
```

### Environment Variables

Add these to your `.env` file:

```bash
SENDCLOUD_API_KEY=your_api_key
SENDCLOUD_API_SECRET=your_api_secret
SENDCLOUD_BASE_URL=https://panel.sendcloud.sc/api/v2
SENDCLOUD_PARTNER_ID=your_partner_id
SENDCLOUD_DEFAULT_COUNTRY=NL  # Optional: Default country code (ISO 2-letter format)
```

### Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `apiKey` | string | ✅ | - | Your SendCloud API public key |
| `apiSecret` | string | ✅ | - | Your SendCloud API secret key |
| `baseUrl` | string | ❌ | `https://panel.sendcloud.sc/api/v2` | SendCloud API base URL |
| `partnerId` | string | ❌ | - | Your SendCloud partner ID (if applicable) |
| `defaultCountry` | string | ❌ | `NL` | Default country code for shipments (ISO 2-letter format) |

**Note on `defaultCountry`**: This is used as a fallback when:
- Product origin country is not specified (affects customs declarations)
- Sender address country is missing
- Return shipment origin country is not available

Common values: `NL` (Netherlands), `DE` (Germany), `FR` (France), `BE` (Belgium), etc.

## API Routes

The plugin provides the following API routes:

### Admin Routes
- `GET /admin/sendcloud` - List all shipments
- `GET /admin/sendcloud/:id` - Get shipment details
- `POST /admin/sendcloud` - Create a shipment
- `PUT /admin/sendcloud/:id` - Update a shipment
- `DELETE /admin/sendcloud/:id` - Delete a shipment

### Webhook Routes
- `POST /webhooks/sendcloud` - Handle SendCloud webhooks for tracking updates

## Workflows

The plugin includes the following workflows:

- `createShipmentWorkflow` - Creates a SendCloud shipment for an order
- `updateTrackingWorkflow` - Updates tracking information from webhooks

## Module Services

### SendCloudModuleService

Main service for managing SendCloud shipments:

```typescript
const sendCloudService = container.resolve("sendcloud");

// Create a shipment
const shipment = await sendCloudService.createShipment({
  order_id: "order_123",
  // ... shipment data
});

// Get shipments for an order
const shipments = await sendCloudService.getShipmentByOrderId("order_123");
```

## License

MIT

 npx medusa plugin:build
yalc update @medita/medusa-sendcloud-plugin
npx medusa plugin:add @medita/medusa-sendcloud-plugin