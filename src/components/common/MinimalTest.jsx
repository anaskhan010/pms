import React, { useState } from "react";
import { Input } from "./index";

/**
 * Minimal test component to isolate the Input focus issue
 * This will help us determine if the issue is with:
 * 1. The Input component itself
 * 2. The modal wrapper
 * 3. Something else
 */
function MinimalTest() {
  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");

  function handleValue1Change(e) {
    setValue1(e.target.value);
  }

  function handleValue2Change(e) {
    setValue2(e.target.value);
  }

  return (
    <div className="p-6 space-y-4 bg-white border rounded-lg">
      <h3 className="text-lg font-semibold">Minimal Input Test</h3>
      
      {/* Test 1: Input component with separate state */}
      <Input
        label="Test Input 1 (Input Component)"
        name="test1"
        value={value1}
        onChange={handleValue1Change}
        placeholder="Type here..."
      />
      
      {/* Test 2: Raw HTML input with separate state */}
      <div className="space-y-1">
        <label className="form-label">Test Input 2 (Raw HTML)</label>
        <input
          type="text"
          name="test2"
          value={value2}
          onChange={handleValue2Change}
          placeholder="Type here..."
          className="form-input"
        />
      </div>
      
      <div className="text-sm text-gray-500">
        <p>Value 1: {value1}</p>
        <p>Value 2: {value2}</p>
      </div>
    </div>
  );
}

export default MinimalTest;
