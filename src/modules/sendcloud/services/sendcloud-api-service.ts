import { Logger } from "@medusajs/framework/types";

export interface SendCloudConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl?: string;
  partnerId?: string;
}

export interface SendCloudParcel {
  name: string;
  company_name?: string;
  address: string;
  house_number: string;
  city: string;
  postal_code: string;
  country: string;
  email?: string;
  telephone?: string;
  weight: number;
  order_number: string;
  insured_value?: number;
  total_order_value_currency?: string;
  total_order_value?: number;
  quantity?: number;
  shipping_method?: number;
  service_point_id?: string;
  external_reference?: string;
  external_shipment_id?: string;
  to_service_point?: boolean;
}

export interface SendCloudTrackingInfo {
  id: number;
  tracking_number: string;
  tracking_url: string;
  status: {
    id: number;
    message: string;
  };
  carrier: {
    code: string;
    name: string;
  };
}

class SendCloudApiService {
  private config: SendCloudConfig;
  private logger: Logger;
  private baseUrl: string;

  constructor(config: SendCloudConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
    this.baseUrl = config.baseUrl || "https://panel.sendcloud.sc/api/v2";
  }

  /**
   * Get authentication headers for SendCloud API
   */
  private getAuthHeaders() {
    const auth = Buffer.from(`${this.config.apiKey}:${this.config.apiSecret}`).toString('base64');
    return {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Make API request to SendCloud
   */
  private async makeRequest(endpoint: string, method: string = 'GET', data?: any) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getAuthHeaders();

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SendCloud API error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error('SendCloud API request failed: ' + JSON.stringify({ 
        message: error instanceof Error ? error.message : String(error), 
        endpoint, 
        method 
      }));
      throw error;
    }
  }

  /**
   * Create a parcel in SendCloud
   */
  async createParcel(parcelData: SendCloudParcel) {
    this.logger.info('Creating SendCloud parcel: ' + JSON.stringify({ order_number: parcelData.order_number }));
    
    const response = await this.makeRequest('/parcels', 'POST', {
      parcel: parcelData,
    });

    return response.parcel;
  }

  /**
   * Get parcel information
   */
  async getParcel(parcelId: number) {
    return await this.makeRequest(`/parcels/${parcelId}`);
  }

  /**
   * Get tracking information
   */
  async getTrackingInfo(parcelId: number): Promise<SendCloudTrackingInfo> {
    const response = await this.makeRequest(`/parcels/${parcelId}`);
    return response.parcel;
  }

  /**
   * Cancel a parcel
   */
  async cancelParcel(parcelId: number) {
    return await this.makeRequest(`/parcels/${parcelId}/cancel`, 'POST');
  }

  /**
   * Get shipping methods
   */
  async getShippingMethods() {
    try {
      // Get regular shipping methods
      const shippingMethods = await this.makeRequest('/shipping_methods', 'GET');
      
      // Get return shipping methods
      const returnShippingMethods = await this.makeRequest('/shipping_methods?is_return=true', 'GET');
      
      // Combine and mark return methods
      const modifiedReturnMethods = returnShippingMethods.shipping_methods?.map((method: any) => ({
        ...method,
        is_return: true,
      })) || [];

      return {
        shipping_methods: [
          ...(shippingMethods.shipping_methods || []),
          ...modifiedReturnMethods,
        ],
      };
    } catch (error) {
      this.logger.error('Failed to get shipping methods: ' + (error instanceof Error ? error.message : String(error)));
      throw error;
    }
  }

  /**
   * Get contracts
   */
  async getContracts() {
    return await this.makeRequest('/contracts');
  }

  /**
   * Get sender addresses
   */
  async getAddress() {
    return await this.makeRequest('/user/addresses/sender');
  }

  /**
   * Get shipping price
   */
  async getPrice(
    senderCountry: string,
    senderPostal: string,
    receiverCountry: string,
    receiverPostal: string,
    contractId: number,
    weight: number,
    weightUnit: string,
    shippingMethodId: number
  ) {
    const params = new URLSearchParams({
      shipping_method_id: shippingMethodId.toString(),
      from_country: senderCountry,
      to_country: receiverCountry,
      weight: weight.toString(),
      weight_unit: weightUnit,
      contract: contractId.toString(),
      from_postal_code: senderPostal,
      to_postal_code: receiverPostal,
    });

    const response = await this.makeRequest(`/shipping-price?${params}`);
    return response;
  }

  /**
   * Get service points near an address
   */
  async getServicePoints(country: string, postalCode: string, carrier?: string) {
    const params = new URLSearchParams({
      country,
      postal_code: postalCode,
      ...(carrier && { carrier }),
    });

    return await this.makeRequest(`/service-points?${params}`);
  }

  /**
   * Webhook verification
   */
  verifyWebhook(payload: string, signature: string): boolean {
    // Implement webhook signature verification if needed
    // This depends on SendCloud's webhook implementation
    return true;
  }
}

export default SendCloudApiService;
