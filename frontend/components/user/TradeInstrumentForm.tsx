import { Instrument, TradeInstrument, User } from "@/components/user/types";
import React, { useState } from "react";
import { ANGELONE_PRODUCT_OPTIONS, Brokers, TRADE_TYPE_OPTIONS, ZERODHA_PRODUCT_OPTIONS } from "../constants";
import { AutoCompleteInput } from "../inputs/AutoComplete";
import { NumberInput, SelectInput } from "../inputs/Inputs";

interface TradeInstrumentFormProps {
  instrument: TradeInstrument;
  strategyIndex: number;
  instrumentIndex: number;
  formData: User;
  setFormData: React.Dispatch<React.SetStateAction<User>>;
  tradingInstruments: Instrument[];
}

export const TradeInstrumentForm: React.FC<TradeInstrumentFormProps> = ({
  instrument,
  strategyIndex,
  instrumentIndex,
  formData,
  setFormData,
  tradingInstruments,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTradeInstrumentChange = (
    strategyIndex: number,
    instrumentIndex: number,
    field: keyof TradeInstrument,
    value: any // eslint-disable-line @typescript-eslint/no-explicit-any
  ) => {
    const updatedStrategies = [...formData.strategies];
    const updatedInstruments = [...updatedStrategies[strategyIndex].trade_instruments];
    if (field === "tradingsymbol") {
      updatedInstruments[instrumentIndex] = {
        ...updatedInstruments[instrumentIndex],
        ...tradingInstruments[value.index],
      };
    } else {
      updatedInstruments[instrumentIndex] = {
        ...updatedInstruments[instrumentIndex],
        [field]: value,
      };
    }
    updatedStrategies[strategyIndex].trade_instruments = updatedInstruments;

    setFormData((prev) => ({
      ...prev,
      strategies: updatedStrategies,
    }));
  };

  const deleteTradeInstrument = (strategyIndex: number, instrumentIndex: number) => {
    const updatedStrategies = [...formData.strategies];
    updatedStrategies[strategyIndex].trade_instruments = updatedStrategies[strategyIndex].trade_instruments.filter((_, index) => index !== instrumentIndex);
    setFormData((prev) => ({
      ...prev,
      strategies: updatedStrategies,
    }));
  };

  return (
    <div key={instrumentIndex} className="border p-6 rounded-lg bg-white mb-4">
      <div className="flex justify-between items-center">
        <h4 className="text-md font-bold text-gray-800 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          {instrument.tradingsymbol || `Instrument ${instrumentIndex + 1}`}
        </h4>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setIsExpanded(!isExpanded)} className="text-blue-500 text-sm">
            {isExpanded ? "Collapse" : "Expand"}
          </button>
          <button type="button" onClick={() => deleteTradeInstrument(strategyIndex, instrumentIndex)} className="text-red-500 text-sm">
            Delete Instrument
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-2 gap-6 mb-4 mt-4">
          <AutoCompleteInput
            label="Trading Symbol"
            suggestions={tradingInstruments.map((item, i) => ({
              index: i,
              value: `${item.tradingsymbol} - ${item.exchange}`,
            }))}
            onChange={(value) => handleTradeInstrumentChange(strategyIndex, instrumentIndex, "tradingsymbol", value)}
            value={`${instrument.tradingsymbol} - ${instrument.exchange}`}
          />
          <SelectInput
            label="Product"
            value={instrument.product}
            onChange={(e) => handleTradeInstrumentChange(strategyIndex, instrumentIndex, "product", e.target.value)}
            options={formData.broker_name === Brokers.ANGELONE ? ANGELONE_PRODUCT_OPTIONS : ZERODHA_PRODUCT_OPTIONS}
            required
          />

          <NumberInput
            label="Quantity"
            value={instrument.quantity}
            onChange={(e) => handleTradeInstrumentChange(strategyIndex, instrumentIndex, "quantity", parseInt(e.target.value))}
            required
          />

          <SelectInput
            label="Transaction Type"
            value={instrument.transaction_type}
            onChange={(e) => handleTradeInstrumentChange(strategyIndex, instrumentIndex, "transaction_type", e.target.value)}
            options={TRADE_TYPE_OPTIONS}
          />
        </div>
      )}
    </div>
  );
};
