// src/components/AppText.js
import React from 'react';
import { Text } from 'react-native';

export default function AppText(props) {
  // custom font always first, then whatever style you passed
  return (
    <Text
      {...props}
      style={[{ fontFamily: 'Hakgyoansim' }, props.style]}
    />
  );
}
