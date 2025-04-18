export interface TechnicalDetails {
  manufacturer: string;
  installation_date: Date;
  last_maintenance_date: Date;
  software_version: string;
  hardware_version: string;
  network_config: {
    ip_address: string;
    subnet_mask: string;
    gateway: string;
  };
  capabilities: string[];
}

export type PartialTechnicalDetails = Partial<TechnicalDetails>;
