import { useState } from "react";
import PropertyTypeSelector from "./PropertyTypeSelector";
import BuildingVirtualTours from "./BuildingVirtualTours";
import VillaVirtualTours from "./VillaVirtualTours";

const VirtualDemoPage = () => {
  const [propertyType, setPropertyType] = useState("buildings");

  return (
    <div className=" mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Virtual Property Tours
      </h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        {/* Property Type Selector */}
        <PropertyTypeSelector
          activeType={propertyType}
          onTypeChange={setPropertyType}
        />

        <div className="p-6">
          {/* Conditional rendering based on property type */}
          {propertyType === "buildings" ? (
            <BuildingVirtualTours />
          ) : (
            <VillaVirtualTours />
          )}
        </div>
      </div>
    </div>
  );
};

export default VirtualDemoPage;
