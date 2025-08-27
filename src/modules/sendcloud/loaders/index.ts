// LoaderOptions type from Medusa v2.4
interface LoaderOptions<T = any> {
  options: T;
  container: any;
  logger: any;
}

export interface SendCloudModuleOptions {
  publicKey: string;
  secretKey: string;
  webhookSecret?: string;
  defaultParcelId?: number;
  defaultShippingMethodId?: number;
  defaultServicePointId?: number;
  defaultFromCountry?: string;
  defaultFromPostalCode?: string;
}

export default async function sendcloudLoader({
  options,
  container,
  logger,
}: LoaderOptions<SendCloudModuleOptions>) {
  // Validate required options
  if (!options.publicKey || !options.secretKey) {
    throw new Error(
      "SendCloud plugin requires publicKey and secretKey in options"
    );
  }

  logger.info("SendCloud plugin loaded with options");

  // Store options in container for use by services
  container.register({
    sendCloudOptions: {
      resolve: () => options,
    },
  });
}