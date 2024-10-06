import { ObjectId } from "mongodb";
import { Brokers } from "../constants";

export enum TRANSACTION_TYPE {
  BUY = "BUY",
  SELL = "SELL",
  BOTH = "BOTH",
}

export enum FormSubmitStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export interface Instrument {
  tradingsymbol: string;
  instrument_token?: string;
  exchange?: string;
}

export interface TradeInstrument extends Instrument {
  product: string;
  quantity: number;
  active: boolean;
  trade_on_signal: TRANSACTION_TYPE;
  transaction_type: TRANSACTION_TYPE;
}

export interface EntryExitInstrument extends Instrument {
  timeframe: string;
}

export interface Strategy {
  entry_instrument: EntryExitInstrument;
  exit_instrument: EntryExitInstrument;
  trade_instruments: TradeInstrument[];
  is_in_holding: boolean;
  active: boolean;
}

export interface User {
  _id?: ObjectId;
  user_name: string;
  active: boolean;
  user_id: string;
  start_time: string;
  end_time: string;
  risk_amount: number;
  broker_name: Brokers;
  priority: string;
  strategies: Strategy[];
}

export interface InstrumentSuggestion {
  index: number;
  value: string;
}
