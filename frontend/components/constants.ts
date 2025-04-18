export enum TRANSACTION_TYPE {
  BUY = "BUY",
  SELL = "SELL",
  BOTH = "BOTH",
}

export enum HOLDING_DIRECTION {
  LONG = "BUY",
  SHORT = "SELL",
  NA = "NA",
}

export enum FormSubmitStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

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
  { value: TRANSACTION_TYPE.BUY, label: TRANSACTION_TYPE.BUY },
  { value: TRANSACTION_TYPE.SELL, label: TRANSACTION_TYPE.SELL },
  { value: TRANSACTION_TYPE.BOTH, label: TRANSACTION_TYPE.BOTH },
];

export enum Brokers {
  ZERODHA = "Zerodha",
  ANGELONE = "AngelOne",
}

export const BROKER_OPTIONS = [
  {
    value: Brokers.ANGELONE,
    label: Brokers.ANGELONE,
    instrumentListURL: "https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json",
  },
  {
    value: Brokers.ZERODHA,
    label: Brokers.ZERODHA,
    instrumentListURL: "https://api.kite.trade/instruments",
  },
];

export const HOLDING_DIRECTION_OPTIONS = [
  { value: HOLDING_DIRECTION.LONG, label: HOLDING_DIRECTION.LONG },
  { value: HOLDING_DIRECTION.SHORT, label: HOLDING_DIRECTION.SHORT },
  { value: HOLDING_DIRECTION.NA, label: HOLDING_DIRECTION.NA },
];

export const ANGELONE_PRODUCT_OPTIONS = [
  { value: "DELIVERY", label: "DELIVERY" },
  { value: "CARRYFORWARD", label: "CARRYFORWARD" },
  { value: "MARGIN", label: "MARGIN" },
  { value: "INTRADAY", label: "INTRADAY" },
];

export const ZERODHA_PRODUCT_OPTIONS = [
  { value: "CNC", label: "CNC" },
  { value: "NRML", label: "NRML" },
  { value: "MIS", label: "MIS" },
];
