// SignUpFlow.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { SignUpProvider } from '../contexts/SignUpContext';
import { AuthProvider }   from '../contexts/AuthContext';

import LocationPage from '../../src/pages/common/LocationPage';
import VerifyPage   from '../../src/pages/auth/VerifyPage';
import SignupPage   from '../../src/pages/auth/SignUpPage';

const Stack = createStackNavigator();

export default function SignUpFlow() {
  return (
    <SignUpProvider>     {/* ← 여기에 주소 저장 */}
      <AuthProvider>     {/* ← 여기에 인증정보 저장 */}
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Location" component={LocationPage} />
          <Stack.Screen name="Verify" component={VerifyPage} />
          <Stack.Screen name="SignUp" component={SignupPage} />
        </Stack.Navigator>
      </AuthProvider>
    </SignUpProvider>
  );
}
