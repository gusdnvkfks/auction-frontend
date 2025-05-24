// App.js
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/app/store';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// // COMPONENT
import HeaderLayout from './src/components/HeaderLayout';  // 공통 헤더

// PAGE
// common page
import SplashPage from './src/pages/common/SplashPage';
import LandingPage from './src/pages/common/LandingPage';
import LocationPage from './src/pages/common/LocationPage';
// auth page
import LoginPage from './src/pages/auth/LoginPage';
import VerifyPage from './src/pages/auth/VerifyPage';
import TermsOfUsePage from './src/pages/auth/TermsOfUsePage';
// main page
import SearchPage from './src/pages/main/SearchPage';
// item page
import ItemUploadPage from './src/pages/item/ItemUploadPage';
import ItemDetailPage from './src/pages/item/ItemDetailPage';

// NAVIGATORS
import MainTabNavigator from './src/navigators/MainTabNavigator';

const Stack = createStackNavigator();

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Provider store={store}>{/* ✅ 이거 안 넣으면 Redux 작동안 함 */}
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
                        <Stack.Screen name="Location" component={LocationPage} />
                        <Stack.Screen name="Verify" component={VerifyPage} />
                        <Stack.Screen name="TermsOfUse" component={TermsOfUsePage} />
                        {/* <Stack.Screen name="Home" component={HomePage} options={{ headerShown: false }} /> */}
                        <Stack.Screen name="Search" component={SearchPage} options={{ headerShown: false }} />
                        <Stack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} />
                        <Stack.Screen name="ItemUpload" component={ItemUploadPage} options={{ headerShown: false }} />
                        <Stack.Screen name="ItemDetail" component={ItemDetailPage} options={{ headerShown: false }} />
                        
                    </Stack.Navigator>
                </NavigationContainer>
            </Provider>
        </GestureHandlerRootView>
    );
}
