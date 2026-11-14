import React from 'react';
import Documents from '@screens/PropertyDocuments';

// Compliance documents of the selected outlet (FSSAI licence today; other licences / certificates can be added here).
export default function Compliance(props) {
  return <Documents {...props} mode="compliance" />;
}
