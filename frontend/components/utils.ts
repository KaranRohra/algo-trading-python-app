import { BROKER_OPTIONS } from "./constants";
import { Instrument } from "./user/types";
import KiteInstruments from "@/data/kite-instruments.json";

export const getZerodhaSymbols = async (): Promise<Instrument[]> => KiteInstruments as Instrument[];

export const getAngelOneSymbols = async (): Promise<Instrument[]> => {
  const response = await fetch(BROKER_OPTIONS[0].instrumentListURL);
  const instruments = await response.json();
  return instruments.map((instrument: { token: string, symbol: string, exch_seg: string }) => ({
    instrument_token: instrument["token"],
    tradingsymbol: instrument["symbol"],
    exchange: instrument["exch_seg"],
  }));
};

export const recursiveStringToJsonFormatter = (jsonString: string): string => {
  // Recursive function to handle nested objects or arrays
  function formatJson(value: unknown): unknown {
    if (typeof value === "string") {
      try {
        // Try to parse the string as JSON (in case it's a nested JSON string)
        const parsedValue = JSON.parse(value);
        // Recursively format nested objects/arrays
        return formatJson(parsedValue);
      } catch {
        // If parsing fails, return the value as-is (not a JSON string)
        return value;
      }
    } else if (Array.isArray(value)) {
      // Handle arrays by recursively formatting each element
      return value.map(formatJson);
    } else if (typeof value === "object" && value !== null) {
      // Handle objects by recursively formatting each key-value pair
      const formattedObject: Record<string, unknown> = {};
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          formattedObject[key] = formatJson((value as Record<string, unknown>)[key]);
        }
      }
      return formattedObject;
    } else {
      // If it's a primitive value (number, boolean, etc.), return it as-is
      return value;
    }
  }

  try {
    // Parse the top-level JSON string
    const jsonObject = JSON.parse(jsonString);

    // Recursively format the entire object
    const formattedObject = formatJson(jsonObject);

    // Convert the formatted object back to a string with 4-space indentation
    return JSON.stringify(formattedObject, null, 4);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Invalid JSON string or failed to parse:", error.message);
    } else {
      console.error("Invalid JSON string or failed to parse.");
    }
    return "";
  }
}
