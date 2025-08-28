import { AbstractFulfillmentProviderService, MedusaError } from "@medusajs/framework/utils";
import {
  CreateFulfillmentResult,
  FulfillmentDTO,
  FulfillmentItemDTO,
  FulfillmentOption,
  FulfillmentOrderDTO,
  Logger,
  CreateShippingOptionDTO,
  CalculatedShippingOptionPrice
} from "@medusajs/framework/types";
import SendCloudApiService, { SendCloudConfig, SendCloudParcel } from "../../modules/sendcloud/services/sendcloud-api-service";

interface SendCloudFulfillmentOptions {
  apiKey: string;
  apiSecret: string;
  baseUrl?: string;
  partnerId?: string;
}

type InjectedDependencies = {
  logger: Logger;
}

class SendCloudFulfillmentProvider extends AbstractFulfillmentProviderService {
  static identifier = "sendcloud-fulfillment";
  
  // Add static block to log when class is loaded
  static {
    console.log("🌟 [STATIC] SendCloudFulfillmentProvider class loaded with identifier:", this.identifier);
  }
  
  protected logger_: Logger;
  protected options_: SendCloudFulfillmentOptions;
  protected sendCloudApi_: SendCloudApiService;

  constructor({ logger }: InjectedDependencies, options: SendCloudFulfillmentOptions) {
    super();
    
    console.log("🚀🚀🚀 [CONSTRUCTOR] SendCloud provider constructor called!");
    console.log("🚀🚀🚀 [CONSTRUCTOR] Logger exists:", !!logger);
    console.log("🚀🚀🚀 [CONSTRUCTOR] Options:", JSON.stringify(options, null, 2));
    
    this.logger_ = logger;
    this.options_ = options;
    
    // Log initialization
    this.logger_.info("SendCloud Fulfillment Provider initializing with identifier: " + SendCloudFulfillmentProvider.identifier);
    
    try {
      // Initialize SendCloud API service
      this.sendCloudApi_ = new SendCloudApiService({
        apiKey: options.apiKey,
        apiSecret: options.apiSecret,
        baseUrl: options.baseUrl,
        partnerId: options.partnerId,
      }, this.logger_);
      
      console.log("🚀🚀🚀 [CONSTRUCTOR] API service initialized successfully");
      this.logger_.info("SendCloud Fulfillment Provider initialized successfully");
    } catch (error) {
      console.error("🚀🚀🚀 [CONSTRUCTOR] Error initializing API service:", error);
      this.logger_.error("Error initializing SendCloud API service: " + error);
      throw error;
    }
  }

  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    console.log("🔥 [getFulfillmentOptions] Called");
    this.logger_.info("🔥 [getFulfillmentOptions] Called via logger");
    try {
      console.log("🔥 [getFulfillmentOptions] Fetching shipping methods from SendCloud...");
      this.logger_.info("🔥 [getFulfillmentOptions] Fetching shipping methods from SendCloud...");
      const shippingMethods = await this.sendCloudApi_.getShippingMethods();
      // Log basic info about the response without full details
      console.log("🔥 [getFulfillmentOptions] Shipping methods keys:", Object.keys(shippingMethods || {}));
      console.log("🔥 [getFulfillmentOptions] Shipping methods array length:", shippingMethods?.shipping_methods?.length);
      
      if (!shippingMethods || !shippingMethods.shipping_methods) {
        console.log("🔥 [getFulfillmentOptions] No shipping methods found in response");
        return [];
      }
      
      const options = (shippingMethods.shipping_methods || []).map((method: any) => ({
        id: method.id.toString(),
        name: method.name,
        carrier: method.carrier?.name,
        data: method
      }));
      
      // Show only basic summary to reduce log clutter
      const summary = options.slice(0, 3).map(option => ({
        id: option.id,
        name: option.name,
        carrier: option.carrier
      }));
      console.log("🔥 [getFulfillmentOptions] Summary (first 3):", JSON.stringify(summary, null, 2));
      console.log(`🔥 [getFulfillmentOptions] Total: ${options.length} shipping methods`);
      this.logger_.info("🔥 [getFulfillmentOptions] Mapped options count: " + options.length);
      return options;
    } catch (error) {
      console.error("🔥 [getFulfillmentOptions] ERROR:", error);
      this.logger_.error("🔥 [getFulfillmentOptions] ERROR: " + error);
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Failed to retrieve shipping options from SendCloud"
      );
    }
  }

  async validateOption(data: Record<string, unknown>): Promise<boolean> {
    console.log("🔥 [validateOption] Called with data:", data);
    this.logger_.info("🔥 [validateOption] Called");
    try {
      const shippingMethods = await this.sendCloudApi_.getShippingMethods();
      const isValid = shippingMethods.shipping_methods?.some(
        (method: any) => method.id == data.id
      );
      console.log("🔥 [validateOption] Result:", isValid);
      return Boolean(isValid);
    } catch (error: any) {
      console.error("🔥 [validateOption] ERROR:", error);
      this.logger_.error("Failed to validate SendCloud shipping option: " + JSON.stringify({ 
        message: error?.message,
        data 
      }));
      return false;
    }
  }

  async validateFulfillmentData(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    return {
      ...data,
      ...optionData,
    };
  }

  async createFulfillment(
    data: Record<string, unknown>,
    items: Partial<Omit<FulfillmentItemDTO, "fulfillment">>[],
    order: Partial<FulfillmentOrderDTO> | undefined,
    fulfillment: Partial<Omit<FulfillmentDTO, "provider_id" | "data" | "items">>
  ): Promise<CreateFulfillmentResult> {
    try {
      if (!order) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Order is required for fulfillment creation"
        );
      }

      // Extract parcel items from order items
      const parcelItems = items.map((item: any) => {
        const variant = item.variant;
        const product = variant?.product;
        
        return {
          description: `${product?.title || 'Product'} - ${product?.description || ''}`,
          weight: product?.weight || 0,
          properties: {
            title: product?.title || 'Product',
          },
          hs_code: product?.hs_code || '',
          origin_country: product?.origin_country || 'NL',
          product_id: product?.id || '',
          quantity: item.quantity || 1,
          value: (item.unit_price || 0) / 100, // Convert from cents
        };
      });

      // Extract shipping address
      const shippingAddress = order.shipping_address;
      if (!shippingAddress) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Order must have a shipping address"
        );
      }

      // Build parcel data
      const parcelData: SendCloudParcel = {
        name: `${shippingAddress.first_name || ''} ${shippingAddress.last_name || ''}`.trim(),
        company_name: shippingAddress.company,
        address: shippingAddress.address_1 || '',
        house_number: shippingAddress.address_2 || '1',
        city: shippingAddress.city || '',
        postal_code: shippingAddress.postal_code || '',
        country: shippingAddress.country_code?.toUpperCase() || 'NL',
        email: order.email,
        telephone: order.billing_address?.phone || shippingAddress.phone,
        weight: parcelItems.reduce((total, item) => total + (item.weight * (item.quantity || 1)), 0),
        order_number: order.display_id?.toString() || order.id || '',
        external_reference: order.id || '',
        external_shipment_id: fulfillment.id,
        // Get shipping method from order
        shipping_method: order.shipping_methods?.[0]?.shipping_option_id ? 
          parseInt(order.shipping_methods[0].shipping_option_id) : undefined,
      };

      // Create parcel in SendCloud
      const parcel = await this.sendCloudApi_.createParcel(parcelData);
      
      this.logger_.info("Created SendCloud parcel: " + JSON.stringify({ 
        order_id: order.id, 
        parcel_id: parcel.id 
      }));

      return {
        data: {
          id: parcel.id,
          tracking_number: parcel.tracking_number,
          tracking_url: parcel.tracking_url,
          carrier: parcel.carrier?.name,
          status: parcel.status?.message,
          sendcloud_data: parcel,
        },
        labels: []
      };
    } catch (error: any) {
      this.logger_.error("Failed to create SendCloud fulfillment: " + JSON.stringify({ 
        message: error?.message,
        order_id: order?.id 
      }));
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to create SendCloud fulfillment: ${error?.message || 'Unknown error'}`
      );
    }
  }

  async cancelFulfillment(fulfillment: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      const fulfillmentData = fulfillment.data as Record<string, unknown>;
      
      // Check if cancellation is triggered by webhook (status id 2000)
      const status = fulfillmentData?.status as Record<string, unknown> | undefined;
      if (status?.id === 2000) {
        return {};
      }

      // Cancel parcel in SendCloud
      const parcelId = fulfillmentData?.id || fulfillmentData?.parcel_id;
      if (parcelId && typeof parcelId === 'string') {
        const result = await this.sendCloudApi_.cancelParcel(parseInt(parcelId));
        this.logger_.info("Cancelled SendCloud parcel: " + JSON.stringify({ parcel_id: parcelId }));
        return { result };
      }

      return {};
    } catch (error: any) {
      this.logger_.error("Failed to cancel SendCloud fulfillment: " + JSON.stringify({ 
        message: error?.message,
        fulfillment_id: fulfillment.id 
      }));
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to cancel SendCloud fulfillment: ${error.message}`
      );
    }
  }

  async calculatePrice(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>,
    context: any
  ): Promise<CalculatedShippingOptionPrice> {
    try {
      // Get sender addresses and contracts
      const [addressData, contracts] = await Promise.all([
        this.sendCloudApi_.getAddress?.() || { sender_addresses: [] },
        this.sendCloudApi_.getContracts?.() || { contracts: [] }
      ]);

      // Calculate total weight
      let totalWeightGrams = 0;
      const cart = context.cart || context;
      cart.items?.forEach((item: any) => {
        const itemWeight = item.variant?.product?.weight || 0;
        const itemQuantity = item.quantity || 0;
        totalWeightGrams += itemWeight * itemQuantity;
      });

      const totalWeightKg = totalWeightGrams / 1000;
      
      // Check weight limit
      if (data.max_weight && (data.max_weight as number) < totalWeightKg) {
        return { 
          calculated_amount: 0,
          is_calculated_price_tax_inclusive: false
        }; // Return 0 if weight exceeds limit
      }

      // Extract sender addresses
      const senderAddresses = addressData.sender_addresses?.map((address: any) => ({
        postalCode: address.postal_code,
        country: address.country,
      })) || [];

      // Get target countries and carrier
      const targetCountries = (data?.countries as Array<{ iso_2: string }>)?.map(
        (country) => country.iso_2
      ) || [];
      const targetCarrier = data.carrier;

      // Find matching contracts
      const matchingContracts = contracts.contracts?.filter((contract: any) => {
        if (!contract.is_active) return false;
        
        const contractCountries = [contract.country];
        const contractCarrier = contract.carrier?.code;

        return (
          targetCountries.some((country) => contractCountries.includes(country)) &&
          targetCarrier === contractCarrier
        );
      }) || [];

      // Set up pricing parameters
      let senderCountry: string | undefined;
      let senderPostal: string | undefined;
      let contractId: number | undefined;

      if (senderAddresses.length === 1) {
        senderCountry = senderAddresses[0].country;
        senderPostal = senderAddresses[0].postalCode;
      }

      if (matchingContracts.length === 1) {
        contractId = matchingContracts[0].id;
      }

      const receiverCountry = cart.shipping_address?.country_code?.toUpperCase();
      const receiverPostal = cart.shipping_address?.postal_code;

      if (!senderCountry || !receiverCountry || !contractId) {
        this.logger_.warn("Missing required data for price calculation: " + JSON.stringify({
          senderCountry,
          receiverCountry,
          contractId,
        }));
        return { 
          calculated_amount: 0,
          is_calculated_price_tax_inclusive: false
        };
      }

      // Get price from SendCloud
      const priceResult = await this.sendCloudApi_.getPrice?.(
        senderCountry,
        senderPostal || '',
        receiverCountry,
        receiverPostal,
        contractId,
        totalWeightGrams,
        "gram",
        data.id as number
      );

      if (priceResult && priceResult[0]?.price) {
        return { 
          calculated_amount: Math.round(priceResult[0].price * 100),
          is_calculated_price_tax_inclusive: false
        }; // Convert to cents
      }

      return { 
        calculated_amount: 0,
        is_calculated_price_tax_inclusive: false
      };
    } catch (error: any) {
      this.logger_.error("Failed to calculate SendCloud price: " + JSON.stringify({ 
        message: error?.message,
        data 
      }));
      return { 
        calculated_amount: 0,
        is_calculated_price_tax_inclusive: false
      };
    }
  }

  async canCalculate(data: CreateShippingOptionDTO): Promise<boolean> {
    try {
      const shippingMethods = await this.sendCloudApi_.getShippingMethods();
      const canCalculate = shippingMethods.shipping_methods?.some(
        (method: Record<string, unknown>) => method.id == (data as unknown as Record<string, unknown>).id
      );
      return Boolean(canCalculate);
    } catch (error: any) {
      this.logger_.error("Failed to check if SendCloud can calculate: " + JSON.stringify({ 
        message: error?.message,
        data 
      }));
      return false;
    }
  }

  async retrieveDocuments(
    fulfillmentData: Record<string, unknown>,
    documentType: "invoice" | "label"
  ): Promise<any> {
    // TODO: Implement document retrieval from SendCloud
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `Document retrieval not implemented for type: ${documentType}`
    );
  }

  async createReturnFulfillment(
    fulfillment: Record<string, unknown>
  ): Promise<CreateFulfillmentResult> {
    try {
      // For returns, we'll use the existing createReturn method
      // This method should handle return fulfillment creation
      const returnResult = await this.createReturn(fulfillment);
      
      return {
        data: returnResult,
        labels: []
      };
    } catch (error: any) {
      this.logger_.error("Failed to create SendCloud return fulfillment: " + JSON.stringify({ 
        message: error?.message,
        fulfillment_id: fulfillment.id 
      }));
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to create SendCloud return fulfillment: ${error?.message || 'Unknown error'}`
      );
    }
  }

  async getFulfillmentDocuments(data: Record<string, unknown>): Promise<any> {
    // TODO: Implement fulfillment document retrieval
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Fulfillment document retrieval not implemented"
    );
  }

  async getReturnDocuments(data: Record<string, unknown>): Promise<any> {
    // TODO: Implement return document retrieval
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Return document retrieval not implemented"
    );
  }

  async getShipmentDocuments(data: Record<string, unknown>): Promise<any> {
    // TODO: Implement shipment document retrieval
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Shipment document retrieval not implemented"
    );
  }

  // Helper method to create returns (converted from v1)
  async createReturn(returnOrder: any): Promise<any> {
    try {
      // Extract order ID from different return types
      let orderId: string;
      if (returnOrder.order_id) {
        orderId = returnOrder.order_id;
      } else if (returnOrder.swap?.order_id) {
        orderId = returnOrder.swap.order_id;
      } else if (returnOrder.claim_order?.order_id) {
        orderId = returnOrder.claim_order.order_id;
      } else {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Unable to determine order ID from return order"
        );
      }

      // TODO: Retrieve full order data using the order module
      // For now, we'll use the basic return order data
      const shippingAddress = returnOrder.shipping_address || {};

      const returnData = {
        reason: 0,
        message: "Return request",
        outgoing_parcel: 0,
        service_point: {
          id: 10875349, // Default service point
        },
        refund: {
          refund_type: {
            code: "money",
          },
          message: "Refund request",
        },
        delivery_option: "drop_off_point",
        products: returnOrder.items?.map((item: any) => ({
          product_id: item.id,
          quantity: item.quantity,
          description: item.description || 'Product',
          value: item.price || 0.0,
          return_reason: 1,
        })) || [],
        incoming_parcel: {
          collo_count: 1,
          from_address_1: shippingAddress.address_1,
          from_address_2: shippingAddress.address_2,
          from_city: shippingAddress.city,
          from_company_name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
          from_country: shippingAddress.country_code?.toUpperCase() || 'NL',
          from_email: returnOrder.email,
          from_house_number: shippingAddress.address_2 || '1',
          from_country_state: shippingAddress.province,
          from_name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
          from_postal_code: shippingAddress.postal_code,
          from_telephone: shippingAddress.phone,
        },
        selected_functionalities: {
          first_mile: "dropoff",
        },
      };

      // TODO: Call SendCloud return portal API
      // const response = await axios.post(
      //   `https://panel.sendcloud.sc/api/v2/brand/{brand_domain}/return-portal/incoming`,
      //   returnData,
      //   {
      //     headers: {
      //       Authorization: `Basic ${this.options_.token}`,
      //       'Content-Type': 'application/json',
      //     },
      //   }
      // );

      this.logger_.info("Created SendCloud return: " + JSON.stringify({ order_id: orderId }));
      return returnData;
    } catch (error: any) {
      this.logger_.error("Failed to create SendCloud return: " + JSON.stringify({ 
        message: error?.message 
      }));
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to create SendCloud return: ${error?.message || 'Unknown error'}`
      );
    }
  }
}

export default SendCloudFulfillmentProvider;
