import React from 'react';
import Documents from '@screens/PropertyDocuments';

// Rental contracts of the selected outlet (current and previous).
export default function Contracts(props) {
  return <Documents {...props} mode="contracts" />;
}
