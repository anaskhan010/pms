import React, { useCallback } from "react";

/**
 * Test input that uses shared state but with stabilized onChange
 */
function SharedStateTestInput({ value, onChange, name }) {
  // Stabilized change handler
  const handleChange = useCallback((e) => {
    console.log('🧪 SharedStateTestInput change:', e.target.name, '=', e.target.value);
    onChange(e);
  }, [onChange]);

  return (
    <div className="space-y-1">
      <label className="form-label">Shared State Test Input [{name}]</label>
      <input
        type="text"
        name={name}
        value={value || ""}
        onChange={handleChange}
        placeholder="Test shared state..."
        className="form-input"
      />
      <p className="text-sm text-gray-500">Value: {value}</p>
    </div>
  );
}

export default SharedStateTestInput;
