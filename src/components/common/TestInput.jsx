import React, { useState } from "react";

/**
 * Isolated Test Input - Completely separate from any complex logic
 * This should NEVER lose focus if the issue is in the modal/parent
 */
function TestInput() {
  const [value, setValue] = useState("");

  function handleChange(e) {
    setValue(e.target.value);
  }

  return (
    <div className="space-y-2">
      <label className="form-label">Test Input (Should Never Lose Focus)</label>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Type here to test focus..."
        className="form-input"
      />
      <p className="text-sm text-gray-500">Value: {value}</p>
    </div>
  );
}

export default TestInput;
