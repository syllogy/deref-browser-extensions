import React from 'react';
import Bar from './temp_styling/Bar';
import BarButton from './temp_styling/BarButton';

export default function StylingPlayground() {
  const barChildren = (size: any) => [
    <BarButton size={size}>
      <h1 className="font-bold">-></h1>
    </BarButton>,
    <BarButton size={size}>
      <p>US $582/mo</p>
    </BarButton>,
    <BarButton size={size}>
      <p>Brandon recently modified</p>
    </BarButton>,
    <BarButton size={size}>
      <p>Create a note</p>
    </BarButton>,
  ];

  return (
    <div
      style={{ maxWidth: 1240, margin: '0 auto', padding: 120, fontSize: 14 }}
    >
      <h1 className="font-bold mb-2 text-lg">Styling Playground</h1>
      <p>
        This document serves as an area to build out and style basic layout
        components for general use in the extensions.
      </p>
      <h1 className="font-bold mb-4 mt-8">Compact Bar</h1>
      <Bar size="compact">{barChildren('compact')}</Bar>
      <h1 className="font-bold mb-4 mt-8">Comfortable Bar</h1>
      <Bar size="comfortable">{barChildren('comfortable')}</Bar>
    </div>
  );
}
