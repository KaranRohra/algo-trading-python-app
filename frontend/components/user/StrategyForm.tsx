import { Instrument, InstrumentSuggestion, Strategy, User } from "@/components/user/types";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { AutoCompleteInput } from "../inputs/AutoComplete";
import {
  ANGELONE_PRODUCT_OPTIONS,
  Brokers,
  HOLDING_DIRECTION,
  HOLDING_DIRECTION_OPTIONS,
  TIME_FRAME_OPTIONS,
  TRADE_TYPE_OPTIONS,
  TRANSACTION_TYPE,
} from "../constants";
import { CheckboxInput, SelectInput, TextInput } from "../inputs/Inputs";
import { getAngelOneSymbols, getZerodhaSymbols } from "../utils";
import { TradeInstrumentForm } from "./TradeInstrumentForm";
import { PencilIcon } from "@heroicons/react/16/solid";

interface StrategyFormProps {
  strategyIndex: number;
  strategy: Strategy;
  formData: User;
  setFormData: Dispatch<SetStateAction<User>>;
}

export const StrategyForm: React.FC<StrategyFormProps> = ({ strategyIndex, strategy, formData, setFormData }) => {
  const [tradingInstruments, setTradingInstruments] = useState<Instrument[]>([]);
  const [tradingSymbols, setTradingSymbols] = useState<InstrumentSuggestion[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStrategyChange = (strategyIndex: number, section: "entry_instrument" | "exit_instrument", field: "tradingsymbol" | "timeframe", value: any) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    const updatedStrategies = [...formData.strategies];
    let modifiedValue = { ...updatedStrategies[strategyIndex][section] };
    if (field === "tradingsymbol") {
      modifiedValue = {
        ...modifiedValue,
        ...tradingInstruments[value.index],
      };
    } else {
      modifiedValue = {
        ...modifiedValue,
        [field]: value as string,
      };
    }
    updatedStrategies[strategyIndex] = {
      ...updatedStrategies[strategyIndex],
      [section]: modifiedValue,
    };
    setFormData((prev) => ({
      ...prev,
      strategies: updatedStrategies,
    }));
  };

  const handleInputChange = <K extends keyof Strategy>(strategyIndex: number, key: K, value: Strategy[K]) => {
    const updatedStrategies = [...formData.strategies];
    updatedStrategies[strategyIndex][key] = value;
    setFormData((prevData) => ({
      ...prevData,
      strategies: updatedStrategies,
    }));
  };

  const addTradeInstrument = (strategyIndex: number) => {
    const updatedStrategies = [...formData.strategies];
    updatedStrategies[strategyIndex].trade_instruments.push({
      tradingsymbol: "",
      product: ANGELONE_PRODUCT_OPTIONS[0].value,
      quantity: 0,
      transaction_type: TRANSACTION_TYPE.BOTH,
    });
    setFormData((prev) => ({
      ...prev,
      strategies: updatedStrategies,
    }));
  };

  const deleteStrategy = (strategyIndex: number) => {
    const updatedStrategies = formData.strategies.filter((_, index) => index !== strategyIndex);
    setFormData((prev) => ({
      ...prev,
      strategies: updatedStrategies,
    }));
  };

  const updateInstrumentSuggestion = async () => {
    let suggestions: Instrument[] = [];
    switch (formData.broker_name) {
      case Brokers.ANGELONE:
        suggestions = await getAngelOneSymbols();
        break;
      case Brokers.ZERODHA:
        suggestions = await getZerodhaSymbols();
        break;
    }
    setTradingInstruments(suggestions);
    setTradingSymbols(
      suggestions.map((s, i) => ({
        index: i,
        value: `${s.tradingsymbol} - ${s.exchange}`,
      }))
    );
  };

  useEffect(() => {
    updateInstrumentSuggestion();
  }, [formData.broker_name]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div key={strategyIndex} className="border p-6 rounded-lg mb-8 bg-gray-50">
      <div className="flex justify-between">
        <div className="flex items-center gap-3">
          {isEditing ? (
            <TextInput
              value={strategy.name}
              onChange={(e) => handleInputChange(strategyIndex, "name", e.target.value)}
              onBlur={() => setIsEditing(false)}
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-800">{strategy.name || `Strategy ${strategyIndex + 1}`}</h2>
              <PencilIcon className="h-5 cursor-pointer" onClick={() => setIsEditing(true)} />
            </div>
          )}
          <span>|</span>
          <CheckboxInput
            className="flex gap-2 items-center"
            label="Active"
            checked={strategy.active}
            onChange={(e) => handleInputChange(strategyIndex, "active", e.target.checked)}
          />
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setIsExpanded(!isExpanded)} className="text-blue-500 text-sm">
            {isExpanded ? "Collapse" : "Expand"}
          </button>
          <button type="button" onClick={() => deleteStrategy(strategyIndex)} className="text-red-500 text-sm">
            Delete Strategy
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <AutoCompleteInput
              label="Entry Instrument - Trading Symbol"
              suggestions={tradingSymbols}
              onChange={(value) => handleStrategyChange(strategyIndex, "entry_instrument", "tradingsymbol", value)}
              value={strategy.entry_instrument.tradingsymbol}
            />

            <SelectInput
              label="Entry Instrument - Time Frame"
              value={strategy.entry_instrument.timeframe}
              onChange={(e) => handleStrategyChange(strategyIndex, "entry_instrument", "timeframe", e.target.value)}
              options={TIME_FRAME_OPTIONS}
              required
            />

            <AutoCompleteInput
              label="Exit Instrument - Trading Symbol"
              suggestions={tradingSymbols}
              onChange={(value) => handleStrategyChange(strategyIndex, "exit_instrument", "tradingsymbol", value)}
              value={strategy.exit_instrument.tradingsymbol}
            />

            <SelectInput
              label="Exit Instrument - Time Frame"
              value={strategy.exit_instrument.timeframe}
              onChange={(e) => handleStrategyChange(strategyIndex, "exit_instrument", "timeframe", e.target.value)}
              options={TIME_FRAME_OPTIONS}
              required
            />
            <SelectInput
              label="Holding Direction"
              value={strategy.holding_direction}
              onChange={(e) => handleInputChange(strategyIndex, "holding_direction", e.target.value as HOLDING_DIRECTION)}
              options={HOLDING_DIRECTION_OPTIONS}
              required
            />
            <SelectInput
              label="Trade only on Signal"
              value={strategy.trade_on_signal.length > 1 ? TRANSACTION_TYPE.BOTH : strategy.trade_on_signal[0]}
              onChange={(e) =>
                handleInputChange(
                  strategyIndex,
                  "trade_on_signal",
                  e.target.value === TRANSACTION_TYPE.BOTH ? [TRANSACTION_TYPE.BUY, TRANSACTION_TYPE.SELL] : [e.target.value as TRANSACTION_TYPE]
                )
              }
              options={TRADE_TYPE_OPTIONS}
              required
            />
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Trade Instruments</h3>
            {strategy.trade_instruments.map((instrument, instrumentIndex) => (
              <TradeInstrumentForm
                key={instrumentIndex}
                instrument={instrument}
                instrumentIndex={instrumentIndex}
                strategyIndex={strategyIndex}
                formData={formData}
                setFormData={setFormData}
                tradingInstruments={tradingInstruments}
              />
            ))}

            <button type="button" onClick={() => addTradeInstrument(strategyIndex)} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Add Trade Instrument
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
