import { BROKER_OPTIONS } from "./constants";
import { Instrument } from "./user/types";
import KiteInstruments from "@/data/kite-instruments.json";

export const getZerodhaSymbols = async (): Promise<any[]> => KiteInstruments as any[];

export const getAngelOneSymbols = async (): Promise<Instrument[]> => {
  const response = await fetch(BROKER_OPTIONS[0].instrumentListURL);
  const instruments = await response.json();
  return instruments.map((instrument: any) => ({
    instrument_token: instrument["token"],
    tradingsymbol: instrument["symbol"],
    exchange: instrument["exch_seg"],
  }));
};
