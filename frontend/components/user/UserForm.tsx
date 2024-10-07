"use client";
import { FormSubmitStatus, HOLDING_DIRECTION, Strategy, TRANSACTION_TYPE, User } from "@/components/user/types";
import { useState } from "react";
import { ANGELONE_PRODUCT_OPTIONS, BROKER_OPTIONS, TIME_FRAME_OPTIONS } from "../constants";
import { CheckboxInput, NumberInput, SelectInput, TextInput } from "../Inputs";
import { StrategyForm } from "./StrategyForm";

interface UserFormProps {
  user?: User;
  handleFormSubmit: (formData: User) => Promise<void>;
  handleDeleteUser?: () => Promise<void>;
}

const initialStrategy: Strategy = {
  entry_instrument: {
    tradingsymbol: "",
    timeframe: TIME_FRAME_OPTIONS[0].value,
  },
  exit_instrument: {
    tradingsymbol: "",
    timeframe: TIME_FRAME_OPTIONS[0].value,
  },
  trade_instruments: [
    {
      tradingsymbol: "",
      product: ANGELONE_PRODUCT_OPTIONS[0].value,
      quantity: 0,
      transaction_type: TRANSACTION_TYPE.BOTH,
    },
  ],
  holding_direction: HOLDING_DIRECTION.NA,
  active: true,
  trade_on_signal: [TRANSACTION_TYPE.BUY, TRANSACTION_TYPE.SELL],
};

const UserForm: React.FC<UserFormProps> = ({ user, handleFormSubmit, handleDeleteUser }) => {
  const [submitStatus, setSubmitStatus] = useState<FormSubmitStatus>(FormSubmitStatus.NOT_STARTED);
  const [formData, setFormData] = useState<User>(
    user || {
      user_name: "",
      active: true,
      user_id: "",
      start_time: "",
      end_time: "",
      risk_amount: 0,
      broker_name: BROKER_OPTIONS[0].value,
      priority: "",
      strategies: [{ ...initialStrategy }],
    }
  );

  const handleInputChange = (key: keyof User, value: any) => {
    setFormData((prevData) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const addStrategy = () => {
    setFormData((prev) => ({
      ...prev,
      strategies: [...prev.strategies, { ...initialStrategy }],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    setSubmitStatus(FormSubmitStatus.IN_PROGRESS);
    e.preventDefault();
    await handleFormSubmit(formData);
    setSubmitStatus(FormSubmitStatus.COMPLETED);
    setTimeout(() => setSubmitStatus(FormSubmitStatus.NOT_STARTED), 3000);
  };

  const handleDelete = async () => {
    const response = prompt("Please enter YES to delete the user: ");
    if (response === "YES" && handleDeleteUser) await handleDeleteUser();
  };

  return (
    <div className="container mx-auto p-6 mt-6 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">User Form</h1>
        {handleDeleteUser && (
          <button type="button" onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
            Delete User
          </button>
        )}
      </div>
      {submitStatus === FormSubmitStatus.IN_PROGRESS && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md">
            <p className="text-gray-800">Submitting...</p>
          </div>
        </div>
      )}

      {submitStatus === FormSubmitStatus.COMPLETED && (
        <div className="fixed top-0 left-0 right-0 bg-green-500 text-white text-center p-4">Form submission completed successfully!</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-6 mb-8">
          <TextInput label="Name" onChange={(e) => handleInputChange("user_name", e.target.value)} value={formData.user_name} required />

          <TextInput label="User ID" onChange={(e) => handleInputChange("user_id", e.target.value)} value={formData.user_id} required />

          <TextInput label="Start Time" onChange={(e) => handleInputChange("start_time", e.target.value)} value={formData.start_time} />

          <TextInput label="End Time" onChange={(e) => handleInputChange("end_time", e.target.value)} value={formData.end_time} />

          <NumberInput
            label="Risk Amount"
            onChange={(e) => handleInputChange("risk_amount", parseFloat(e.target.value))}
            value={formData.risk_amount}
            required
          />

          <SelectInput
            label="Broker Name"
            value={formData.broker_name}
            onChange={(e) => handleInputChange("broker_name", e.target.value)}
            options={BROKER_OPTIONS}
          />

          <NumberInput label="Priority" onChange={(e) => handleInputChange("priority", parseInt(e.target.value))} value={formData.priority} required />

          <CheckboxInput label="Active" checked={formData.active} onChange={(e) => handleInputChange("active", e.target.checked)} />
        </div>

        {formData.strategies.map((strategy, strategyIndex) => (
          <StrategyForm key={strategyIndex} strategy={strategy} strategyIndex={strategyIndex} formData={formData} setFormData={setFormData} />
        ))}

        <div className="mb-8 flex justify-between">
          <button type="button" onClick={addStrategy} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Add Strategy
          </button>

          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
