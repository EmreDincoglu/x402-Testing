import { DiscoveredResource } from "@x402/extensions";
import { extractDiscoveryInfo } from "@x402/extensions";
import { PaymentPayload, PaymentRequirements} from "@x402/core/types";
// BazaarCatalog stores discovered resources
/**
 * Catalog of discovered resources from bazaar discovery extension.
 */

// This class was shown in the examples, so we can customize what is stored in any way
// as of right now I just have an add function, extractAndAddDiscoveredResource which is just
// a method that extracts the resource for you in this class instead of in index.ts
export class BazaarCatalog {
  private resources: Map<string, DiscoveredResource> = new Map();

  /**
   * Adds a discovered resource to the catalog.
   *
   * @param res - The discovered resource to add
   */
  add(res: DiscoveredResource): void {
    this.resources.set(res.resourceUrl, res);
  }

  /**
   * extracts info from paymentPayload and requirements
   * and adds the discovered resource to the catalog
   *
   * @param paymentPayload 
   * @param requirements 
   * @returns 
   */
  extractAndAddDiscoveredResource(
    paymentPayload: PaymentPayload, 
    requirements: PaymentRequirements
  ): boolean {
    try {
      const discovered = extractDiscoveryInfo(
        paymentPayload,
        requirements,
        true,
      );
      if (discovered) {
        console.log(`   Discovered resource: ${discovered.resourceUrl}`);
        console.log(`   Description: ${discovered.description}`);
        console.log(`   MimeType: ${discovered.mimeType}`);
        if ("method" in discovered && discovered.method !== undefined) {
          console.log(`   Method: ${discovered.method}`);
        } else if ("toolName" in discovered) {
          console.log(`   Tool: ${discovered.toolName}`);
        }
        console.log(`   X402Version: ${discovered.x402Version}`);
        this.add(discovered)
      }
    }
    catch (err) {
      console.log("Failed to extract discovery info")
      return false
    }
    return true
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
    return this.resources.delete(res.resourceUrl)
  }
}