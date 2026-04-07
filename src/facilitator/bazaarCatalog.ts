import { DiscoveredResource } from "@x402/extensions";
import { extractDiscoveryInfo } from "@x402/extensions";
import { PaymentPayload, PaymentRequirements} from "@x402/core/types";
import  Database from "better-sqlite3";

// BazaarCatalog stores discovered resources
/**
 * Catalog of discovered resources from bazaar discovery extension.
 */

// This class was shown in the examples, so we can customize what is stored in any way
// as of right now I just have an add function, extractAndAddDiscoveredResource which is just
// a method that extracts the resource for you in this class instead of in index.ts
export class BazaarCatalog {
  private resources: Map<string, DiscoveredResource> = new Map();
  private database;
  private insert;
  /**
   * Reads from given database file and loads data into mapping for fast access. If database doesn't
   * exist it will create it and use it to store entries  
   * @param databaseFile 
   */
  constructor (databaseFile: string) {
    // Setup database if it doesnt exist along with inserts.
    // If the database exists it reads all entries from it and puts it in a mapping for 
    // Faster access.
    // The reason I wanted a database was for persistent data, otherwise the mapping is (probably)
    // Faster and is better since agentic payments probably need more speed
    this.database = new Database(databaseFile, { fileMustExist: false })
    this.database.exec(
      `CREATE TABLE IF NOT EXISTS BazaarEntries(
        resourceURL VARCHAR(250) PRIMARY KEY,
        info TEXT NOT NULL
      )`)

    const databaseEntries = this.database.prepare(`SELECT * FROM BazaarEntries`)
      .all() as { resourceURL: string; info: string }[];

    databaseEntries.forEach((entry) => {
      this.resources.set(entry.resourceURL, JSON.parse(entry.info))
    })

    this.insert = this.database.prepare(`INSERT INTO BazaarEntries 
      (resourceURL, info) VALUES (?, ?)`);
  }

  /**
   * Adds a discovered resource to the catalog.
   *
   * @param res - The discovered resource to add
   */
  add(res: DiscoveredResource): void {
    if (!this.resources.has(res.resourceUrl)) {
      this.resources.set(res.resourceUrl, res);
      try {
        this.insert.run(res.resourceUrl, JSON.stringify(res))
      }
      catch (err){
        console.log(`Could not insert bazaarEntry into database ${err}`)
      }
    }
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