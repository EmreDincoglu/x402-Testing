import { PaymentRequirements } from "@x402/fetch";
import { DiscoveryInfo } from "@x402/extensions";

interface DiscoveredResource {
  resource: string;
  description?: string;
  mimeType?: string;
  type: string;
  x402Version: number;
  accepts: PaymentRequirements[];
  discoveryInfo?: DiscoveryInfo;
  lastUpdated: string;
}

// BazaarCatalog stores discovered resources
/**
 * Catalog of discovered resources from bazaar discovery extension.
 */
export class BazaarCatalog {
  private resources: Map<string, DiscoveredResource> = new Map();

  /**
   * Adds a discovered resource to the catalog.
   *
   * @param res - The discovered resource to add
   */
  add(res: DiscoveredResource): void {
    this.resources.set(res.resource, res);
  }

  /**
   * Returns all discovered resources in the catalog.
   *
   * @returns Array of all discovered resources
   */
  getAll(): DiscoveredResource[] {
    return Array.from(this.resources.values());
  }

  /**
   * Removes a discovered resource from the catalog.
   * 
   * @param res - The discovered resource to remove
   * @returns true if removed, false if did not exist
   */
  remove(res: DiscoveredResource): boolean {
    return this.resources.delete(res.resource)
  }
}