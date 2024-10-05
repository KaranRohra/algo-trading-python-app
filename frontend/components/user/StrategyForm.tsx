import {
    Strategy,
    TRANSACTION_TYPE,
    User
} from "@/components/user/types";
import React, { Dispatch, SetStateAction } from "react";
import { TIME_FRAME_OPTIONS } from "../constants";
import { SelectInput, TextInput } from "../Inputs";
import { TradeInstrumentForm } from "./TradeInstrumentForm";

interface StrategyFormProps {
  strategyIndex: number;
  strategy: Strategy;
  formData: User;
  setFormData: Dispatch<SetStateAction<User>>;
}

export const StrategyForm: React.FC<StrategyFormProps> = ({
  strategyIndex,
  strategy,
  formData,
  setFormData,
}) => {
  const handleStrategyChange = (
    strategyIndex: number,
    section: "entry_instrument" | "exit_instrument",
    field: "trading_symbol" | "timeframe",
    value: string
  ) => {
    const updatedStrategies = [...formData.strategies];
    updatedStrategies[strategyIndex] = {
      ...updatedStrategies[strategyIndex],
      [section]: {
        ...updatedStrategies[strategyIndex][section],
        [field]: value,
      },
    };
    setFormData((prev) => ({
      ...prev,
      strategies: updatedStrategies,
    }));
  };

  const addTradeInstrument = (strategyIndex: number) => {
    const updatedStrategies = [...formData.strategies];
    updatedStrategies[strategyIndex].trade_instruments.push({
      trading_symbol: "",
      product: "",
      quantity: 0,
      active: false,
      trade_on_signal: TRANSACTION_TYPE.BOTH,
      transaction_type: TRANSACTION_TYPE.BOTH,
    });
    setFormData((prev) => ({
      ...prev,
      strategies: updatedStrategies,
    }));
  };

  const deleteStrategy = (strategyIndex: number) => {
    const updatedStrategies = formData.strategies.filter(
      (_, index) => index !== strategyIndex
    );
    setFormData((prev) => ({
      ...prev,
      strategies: updatedStrategies,
    }));
  };

  return (
    <div key={strategyIndex} className="border p-6 rounded-lg mb-8 bg-gray-50">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">
          Strategy {strategyIndex + 1}
        </h2>
        <button
          type="button"
          onClick={() => deleteStrategy(strategyIndex)}
          className="text-red-500 text-sm"
        >
          Delete Strategy
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <TextInput
          label="Entry Instrument - Trading Symbol"
          value={strategy.entry_instrument.trading_symbol}
          onChange={(e) =>
            handleStrategyChange(
              strategyIndex,
              "entry_instrument",
              "trading_symbol",
              e.target.value
            )
          }
          required
        />

        <SelectInput
          label="Entry Instrument - Time Frame"
          value={strategy.entry_instrument.timeframe}
          onChange={(e) =>
            handleStrategyChange(
              strategyIndex,
              "entry_instrument",
              "timeframe",
              e.target.value
            )
          }
          options={TIME_FRAME_OPTIONS}
          required
        />

        <TextInput
          label="Exit Instrument - Trading Symbol"
          value={strategy.exit_instrument.trading_symbol}
          onChange={(e) =>
            handleStrategyChange(
              strategyIndex,
              "exit_instrument",
              "trading_symbol",
              e.target.value
            )
          }
          required
        />

        <SelectInput
          label="Exit Instrument - Time Frame"
          value={strategy.exit_instrument.timeframe}
          onChange={(e) =>
            handleStrategyChange(
              strategyIndex,
              "exit_instrument",
              "timeframe",
              e.target.value
            )
          }
          options={TIME_FRAME_OPTIONS}
          required
        />
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-bold mb-4 text-gray-800">
          Trade Instruments
        </h3>
        {strategy.trade_instruments.map((instrument, instrumentIndex) => (
          <TradeInstrumentForm
            key={instrumentIndex}
            instrument={instrument}
            instrumentIndex={instrumentIndex}
            strategyIndex={strategyIndex}
            formData={formData}
            setFormData={setFormData}
          />
        ))}

        <button
          type="button"
          onClick={() => addTradeInstrument(strategyIndex)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add Trade Instrument
        </button>
      </div>
    </div>
  );
};
