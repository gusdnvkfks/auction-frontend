// App.js
import React from 'react';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// COMPONENT
import HeaderLayout from './src/components/HeaderLayout';  // 공통 헤더

// NAVIGATION
import SignUpFlow from './src/navigation/SignUpFlow';

// PAGE
// common page
import SplashPage from './src/pages/common/SplashPage';
import LandingPage from './src/pages/common/LandingPage';
// auth page
import LoginPage from './src/pages/auth/LoginPage';

const Stack = createStackNavigator();

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <NavigationContainer>
                <Stack.Navigator
                    initialRouteName="Splash"
                    screenOptions={({ navigation }) => ({
                        header: () => <HeaderLayout navigation={navigation} />,
                    })}
                >
                    <Stack.Screen name="Splash" component={SplashPage} options={{ headerShown: false }} initialParams={{ nextPage: 'Landing', text: '' }}/>
                    <Stack.Screen name="Landing" component={LandingPage} options={{ headerShown: false }} />
                    <Stack.Screen name="Login" component={LoginPage} />
                    <Stack.Screen name="SignUpFlow" component={SignUpFlow} options={{ headerShown: false }} />
                </Stack.Navigator>
            </NavigationContainer>
        </GestureHandlerRootView>
    );
}
