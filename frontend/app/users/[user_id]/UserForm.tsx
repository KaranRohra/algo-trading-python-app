import { useState } from "react";

type TradeInstrument = {
  trading_symbol: string;
  product: string;
  quantity: number;
  active: boolean;
  direction: "BUY" | "SELL" | "BOTH";
};

type Strategy = {
  entry_instrument: {
    trading_symbol: string;
    timeframe: string;
  };
  exit_instrument: {
    trading_symbol: string;
    timeframe: string;
  };
  trade_instruments: TradeInstrument[];
};

type UserForm = {
  user_name: string;
  active: boolean;
  user_id: string;
  start_time: string;
  end_time: string;
  risk_amount: number;
  broker_name: string;
  priority: string;
  strategies: Strategy[];
};

const UserForm = () => {
  const [formData, setFormData] = useState<UserForm>({
    user_name: "John Doe",
    active: true,
    user_id: "user123",
    start_time: "09:00 AM",
    end_time: "05:00 PM",
    risk_amount: 1000,
    broker_name: "BrokerName",
    priority: "1",
    strategies: [
      {
        entry_instrument: {
          trading_symbol: "AAPL",
          timeframe: "1h", // For example, 1 hour timeframe
        },
        exit_instrument: {
          trading_symbol: "GOOGL",
          timeframe: "1d", // For example, 1 day timeframe
        },
        trade_instruments: [
          {
            trading_symbol: "TSLA",
            product: "Stock",
            quantity: 10,
            active: true,
            direction: "BUY",
          },
          {
            trading_symbol: "AMZN",
            product: "Stock",
            quantity: 5,
            active: false,
            direction: "SELL",
          },
        ],
      },
    ],
  });

  const handleInputChange = (key: keyof UserForm, value: any) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

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

  const handleTradeInstrumentChange = (
    strategyIndex: number,
    instrumentIndex: number,
    field: keyof TradeInstrument,
    value: string | number | boolean
  ) => {
    const updatedStrategies = [...formData.strategies];
    const updatedInstruments = [
      ...updatedStrategies[strategyIndex].trade_instruments,
    ];
    updatedInstruments[instrumentIndex] = {
      ...updatedInstruments[instrumentIndex],
      [field]: value,
    };
    updatedStrategies[strategyIndex].trade_instruments = updatedInstruments;

    setFormData((prev) => ({
      ...prev,
      strategies: updatedStrategies,
    }));
  };

  const addStrategy = () => {
    setFormData((prev) => ({
      ...prev,
      strategies: [
        ...prev.strategies,
        {
          entry_instrument: {
            trading_symbol: "",
            timeframe: "",
          },
          exit_instrument: {
            trading_symbol: "",
            timeframe: "",
          },
          trade_instruments: [
            {
              trading_symbol: "",
              product: "",
              quantity: 0,
              active: false,
              direction: "BUY",
            },
          ],
        },
      ],
    }));
  };

  const addTradeInstrument = (strategyIndex: number) => {
    const updatedStrategies = [...formData.strategies];
    updatedStrategies[strategyIndex].trade_instruments.push({
      trading_symbol: "",
      product: "",
      quantity: 0,
      active: false,
      direction: "BUY",
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

  const deleteTradeInstrument = (
    strategyIndex: number,
    instrumentIndex: number
  ) => {
    const updatedStrategies = [...formData.strategies];
    updatedStrategies[strategyIndex].trade_instruments = updatedStrategies[
      strategyIndex
    ].trade_instruments.filter((_, index) => index !== instrumentIndex);
    setFormData((prev) => ({
      ...prev,
      strategies: updatedStrategies,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
        <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">User Form</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.user_name}
              onChange={(e) => handleInputChange("user_name", e.target.value)}
              className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
    
          <div>
            <label className="block text-sm font-medium text-gray-700">User ID</label>
            <input
              type="text"
              value={formData.user_id}
              onChange={(e) => handleInputChange("user_id", e.target.value)}
              className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
    
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Time</label>
            <input
              type="text"
              value={formData.start_time}
              onChange={(e) => handleInputChange("start_time", e.target.value)}
              className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
    
          <div>
            <label className="block text-sm font-medium text-gray-700">End Time</label>
            <input
              type="text"
              value={formData.end_time}
              onChange={(e) => handleInputChange("end_time", e.target.value)}
              className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
    
          <div>
            <label className="block text-sm font-medium text-gray-700">Risk Amount</label>
            <input
              type="number"
              value={formData.risk_amount}
              onChange={(e) =>
                handleInputChange("risk_amount", parseFloat(e.target.value))
              }
              className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
    
          <div>
            <label className="block text-sm font-medium text-gray-700">Broker Name</label>
            <input
              type="text"
              value={formData.broker_name}
              onChange={(e) => handleInputChange("broker_name", e.target.value)}
              className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
    
          <div>
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <input
              type="number"
              value={formData.priority}
              onChange={(e) =>
                handleInputChange("priority", parseInt(e.target.value))
              }
              className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
    
          <div>
            <label className="block text-sm font-medium text-gray-700">Active</label>
            <input
              type="checkbox"
              checked={formData.active}
              onChange={(e) => handleInputChange("active", e.target.checked)}
              className="p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
    
        {formData.strategies.map((strategy, strategyIndex) => (
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
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Entry Instrument - Trading Symbol
                </label>
                <input
                  type="text"
                  value={strategy.entry_instrument.trading_symbol}
                  onChange={(e) =>
                    handleStrategyChange(
                      strategyIndex,
                      "entry_instrument",
                      "trading_symbol",
                      e.target.value
                    )
                  }
                  className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
    
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Entry Instrument - Time Frame
                </label>
                <input
                  type="text"
                  value={strategy.entry_instrument.timeframe}
                  onChange={(e) =>
                    handleStrategyChange(
                      strategyIndex,
                      "entry_instrument",
                      "timeframe",
                      e.target.value
                    )
                  }
                  className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
    
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Exit Instrument - Trading Symbol
                </label>
                <input
                  type="text"
                  value={strategy.exit_instrument.trading_symbol}
                  onChange={(e) =>
                    handleStrategyChange(
                      strategyIndex,
                      "exit_instrument",
                      "trading_symbol",
                      e.target.value
                    )
                  }
                  className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
    
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Exit Instrument - Time Frame
                </label>
                <input
                  type="text"
                  value={strategy.exit_instrument.timeframe}
                  onChange={(e) =>
                    handleStrategyChange(
                      strategyIndex,
                      "exit_instrument",
                      "timeframe",
                      e.target.value
                    )
                  }
                  className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
    
            <div className="mb-4">
              <h3 className="text-lg font-bold mb-4 text-gray-800">Trade Instruments</h3>
              {strategy.trade_instruments.map((instrument, instrumentIndex) => (
                <div key={instrumentIndex} className="mb-4 border p-6 rounded-lg bg-white">
                  <div className="mb-4 flex justify-between">
                    <h4 className="text-md font-bold text-gray-800">
                      Instrument {instrumentIndex + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() =>
                        deleteTradeInstrument(strategyIndex, instrumentIndex)
                      }
                      className="text-red-500 text-sm"
                    >
                      Delete Instrument
                    </button>
                  </div>
    
                  <div className="grid grid-cols-2 gap-6 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Trading Symbol
                      </label>
                      <input
                        type="text"
                        value={instrument.trading_symbol}
                        onChange={(e) =>
                          handleTradeInstrumentChange(
                            strategyIndex,
                            instrumentIndex,
                            "trading_symbol",
                            e.target.value
                          )
                        }
                        className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Product
                      </label>
                      <input
                        type="text"
                        value={instrument.product}
                        onChange={(e) =>
                          handleTradeInstrumentChange(
                            strategyIndex,
                            instrumentIndex,
                            "product",
                            e.target.value
                          )
                        }
                        className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={instrument.quantity}
                        onChange={(e) =>
                          handleTradeInstrumentChange(
                            strategyIndex,
                            instrumentIndex,
                            "quantity",
                            parseInt(e.target.value)
                          )
                        }
                        className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Direction
                      </label>
                      <select
                        value={instrument.direction}
                        onChange={(e) =>
                          handleTradeInstrumentChange(
                            strategyIndex,
                            instrumentIndex,
                            "direction",
                            e.target.value
                          )
                        }
                        className="border border-gray-300 p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="BUY">BUY</option>
                        <option value="SELL">SELL</option>
                        <option value="BOTH">BOTH</option>
                      </select>
                    </div>
                  </div>
                </div>
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
        ))}
    
        <div className="mb-8">
          <button
            type="button"
            onClick={addStrategy}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Strategy
          </button>
        </div>

        <div className="border-t pt-6">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded mt-6 hover:bg-blue-600"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
