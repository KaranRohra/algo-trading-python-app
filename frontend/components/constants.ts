export const TIME_FRAME_OPTIONS = [
  { value: "minute", label: "minute" },
  { value: "day", label: "day" },
  { value: "3minute", label: "3minute" },
  { value: "5minute", label: "5minute" },
  { value: "10minute", label: "10minute" },
  { value: "15minute", label: "15minute" },
  { value: "30minute", label: "30minute" },
  { value: "60minute", label: "60minute" },
];

export const TRADE_TYPE_OPTIONS = [
  { value: "BUY", label: "BUY" },
  { value: "SELL", label: "SELL" },
  { value: "BOTH", label: "BOTH" },
];

export enum Brokers {
  ZERODHA = "Zerodha",
  ANGELONE = "AngelOne",
}

export const BROKER_OPTIONS = [
  {
    value: Brokers.ANGELONE,
    label: Brokers.ANGELONE,
    instrumentListURL:
      "https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json",
  },
  {
    value: Brokers.ZERODHA,
    label: Brokers.ZERODHA,
    instrumentListURL: "https://api.kite.trade/instruments",
  },
];
