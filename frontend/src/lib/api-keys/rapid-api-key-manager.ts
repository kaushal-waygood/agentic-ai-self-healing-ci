
import { promises as fs } from 'fs';
import path from 'path';

// This singleton manager ensures that key rotation is consistent across the entire application,
// preventing different parts of the app from using the same key simultaneously or getting stuck on a failing key.
// It reads keys from `rapid-api-keys.json` and falls back to the .env file.

export type ApiKey = {
  key: string;
};

// A shared, module-level index ensures that every call to `getNextKey` across the server
// will get the next key in the sequence, providing true round-robin rotation.
let currentIndex = 0;

class RapidApiKeyManager {
  private keys: ApiKey[] = [];
  private static instance: RapidApiKeyManager;

  private constructor() {}

  /**
   * Gets the singleton instance of the key manager.
   * Ensures that keys are loaded only once.
   */
  public static async getInstance(): Promise<RapidApiKeyManager> {
    if (!RapidApiKeyManager.instance) {
      RapidApiKeyManager.instance = new RapidApiKeyManager();
      await RapidApiKeyManager.instance.loadKeys();
    }
    return RapidApiKeyManager.instance;
  }

  /**
   * Loads keys from `rapid-api-keys.json`.
   * If the file doesn't exist or is empty, it will rely on the .env variable.
   */
  private async loadKeys(): Promise<void> {
    try {
      const filePath = path.join(process.cwd(), 'rapid-api-keys.json');
      const data = await fs.readFile(filePath, 'utf8');
      const keysData: ApiKey[] = JSON.parse(data);
      if (Array.isArray(keysData) && keysData.length > 0) {
        this.keys = keysData.filter(k => k && k.key); // Filter out any empty entries
      }
    } catch (error) {
      console.warn('Could not load or parse rapid-api-keys.json. Falling back to RAPIDAPI_KEY environment variable.');
      this.keys = [];
    }
  }

  /**
   * Retrieves the next available API key in a round-robin fashion.
   * Falls back to the RAPIDAPI_KEY from .env if the JSON file is not configured.
   */
  public getNextKey(): string | undefined {
    if (this.keys.length > 0) {
      const key = this.keys[currentIndex % this.keys.length].key;
      currentIndex++; // Increment the shared index for the next call
      return key;
    }
    // Fallback to environment variable if no keys are loaded from file
    return process.env.RAPIDAPI_KEY;
  }

  /**
   * Returns the total number of configured API keys.
   */
  public getTotalKeys(): number {
    if (this.keys.length > 0) {
      return this.keys.length;
    }
    return process.env.RAPIDAPI_KEY ? 1 : 0;
  }
}

/**
 * Export a singleton promise that resolves to the Key Manager instance.
 * This allows different parts of the app to easily access the shared manager.
 */
export const rapidApiKeyManager = RapidApiKeyManager.getInstance();
