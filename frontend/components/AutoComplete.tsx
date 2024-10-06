"use client";
import React, { useState } from "react";
import { InstrumentSuggestion } from "./user/types";
import { TextInput } from "./Inputs";

interface AutoCompleteInputProps {
  label: string;
  suggestions: InstrumentSuggestion[];
  onChange: (value: InstrumentSuggestion) => void;
  value: string;
  required?: boolean;
}

export const AutoCompleteInput: React.FC<AutoCompleteInputProps> = ({ label, suggestions, onChange, value, required }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<InstrumentSuggestion[]>([]);
  const [inputValue, setInputValue] = useState<string>(value);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue) {
      const words = inputValue.toLowerCase().split(" ");
      const filtered = suggestions.filter((suggestion) => words.every((word) => suggestion.value.toLowerCase().includes(word)));
      setFilteredSuggestions(filtered.slice(0, 30));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
    setInputValue(inputValue);
  };

  const handleSuggestionClick = (suggestion: InstrumentSuggestion) => {
    onChange(suggestion);
    setInputValue(suggestion.value);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <TextInput label={label} value={inputValue} onChange={handleInputChange} required={required} />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="absolute bg-white border border-gray-300 rounded mt-1 w-full max-h-40 overflow-auto shadow-lg z-10">
          {filteredSuggestions.map((suggestion, index) => (
            <li key={index} onClick={() => handleSuggestionClick(suggestion)} className="p-2 hover:bg-blue-100 cursor-pointer">
              {suggestion.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
