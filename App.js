import { enableScreens } from 'react-native-screens';
enableScreens();
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/app/store';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './src/contexts/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast, { BaseToast } from 'react-native-toast-message';
import { ItemUploadProvider } from './src/contexts/ItemUploadProvider';

// 페이지 import
import SplashPage from './src/pages/common/SplashPage';
import LandingPage from './src/pages/common/LandingPage';
import LocationPage from './src/pages/common/LocationPage';
import ReportReasonPage from './src/pages/common/ReportReasonPage';
import ReportConfirmPage from './src/pages/common/ReportConfirmPage';
import CategoryPickerPage from './src/pages/common/CategoryPickerPage';
import LoginPage from './src/pages/auth/LoginPage';
import VerifyPage from './src/pages/auth/VerifyPage';
import TermsOfUsePage from './src/pages/auth/TermsOfUsePage';
import SearchPage from './src/pages/main/SearchPage';
import ItemUploadPage from './src/pages/item/ItemUploadPage';
import ItemDetailPage from './src/pages/item/ItemDetailPage';
import ItemEditPage from './src/pages/item/ItemEditPage';
import ItemOptionPage from './src/pages/item/ItemOptionPage';
import MySalesHistoryPage from './src/pages/mypage/MySalesHistoryPage';
import BidderListPage from './src/pages/mypage/BidderListPage';
import CompleteSalePage from './src/pages/mypage/CompleteSalePage';
import MainTabNavigator from './src/navigators/MainTabNavigator';
import CategoryAllPage from './src/pages/main/CategoryAllPage';
import CategoryItemPage from './src/pages/main/CategoryItemPage';
import InterceptorInitializer from './src/hooks/InterceptorInitializer';
import EditProfilePage from './src/pages/mypage/EditProfilePage';
import SettingPage from './src/pages/mypage/SettingPage';
import BlockedUsersPage from './src/pages/mypage/BlockedUserPage';
import PrivacyPolicyPage from './src/pages/terms/PrivacyPolicyPage';

// 토스트 설정
const toastConfig = {
    success: (props) => (
        <BaseToast
            {...props}
            style={{ backgroundColor: '#BFD4FA', borderLeftWidth: 4, borderRadius: 8 }}
            contentContainerStyle={{ paddingHorizontal: 14 }}
            text1Style={{ fontSize: 13, fontWeight: '500', color: '#202124' }}
            text2Style={{ fontSize: 13, color: '#5f6368' }}
        />
    ),
    error: (props) => (
        <BaseToast
            {...props}
            style={{ backgroundColor: '#d3d3d3', borderLeftWidth: 4, borderRadius: 8 }}
            contentContainerStyle={{ paddingHorizontal: 14 }}
            text1Style={{ fontSize: 13, fontWeight: '500', color: '#202124' }}
            text2Style={{ fontSize: 13, color: '#5f6368' }}
        />
    ),
};

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <AuthProvider>
            <InterceptorInitializer />
            <SafeAreaProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <Provider store={store}>
                        <NavigationContainer>
                            <ItemUploadProvider>
                                <Stack.Navigator
                                    initialRouteName="Splash"
                                    screenOptions={{
                                        headerShown: false   // header: () => <HeaderLayout /> 제거
                                    }}
                                >
                                    <Stack.Screen name="Splash" component={SplashPage} options={{ headerShown: false, animation: 'none' }} initialParams={{ nextPage: "Landing", text: "" }}/>
                                    <Stack.Screen name="Landing" component={LandingPage} options={{ headerShown: false }} />
                                    <Stack.Screen name="Login" component={LoginPage} />
                                    {/* <Stack.Screen name="Location" component={LocationPage} /> */}
                                    <Stack.Screen
                                      name="Location"
                                      component={LocationPage}
                                      options={{ animation: 'none' }}
                                    />
                                    <Stack.Screen name="Report" component={ReportReasonPage} options={{ headerShown: false }} />
                                    <Stack.Screen name="ReportConfirm" component={ReportConfirmPage} options={{ headerShown: false }} />
                                    <Stack.Screen name="Verify" component={VerifyPage} />
                                    <Stack.Screen name="TermsOfUse" component={TermsOfUsePage} />
                                    <Stack.Screen name="Search" component={SearchPage} options={{ headerShown: false }} />
                                    <Stack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} />
                                    <Stack.Screen name="MySalesHistory" component={MySalesHistoryPage} options={{ headerShown: false }} />
                                    <Stack.Screen name="BidderList" component={BidderListPage} options={{ headerShown: false }} />
                                    <Stack.Screen name="CompleteSale" component={CompleteSalePage} options={{ headerShown: false }} />
                                    <Stack.Screen name="ItemDetail" component={ItemDetailPage} options={{ headerShown: false }} />
                                    <Stack.Screen name="ItemEdit" component={ItemEditPage} options={{ headerShown: false }} />
                                    <Stack.Screen name="ItemUpload" component={ItemUploadPage} options={{ headerShown: false }} />
                                    <Stack.Screen name="ItemOption" component={ItemOptionPage} options={{ headerShown: false }} />
                                    <Stack.Screen name="CategoryPicker" component={CategoryPickerPage} options={{ headerShown: false }} />
                                    <Stack.Screen name="CategoryAll" component={CategoryAllPage} options={{ headerShown: false }} />
                                    <Stack.Screen name="CategoryItem" component={CategoryItemPage} options={{ headerShown: false }} />
                                    <Stack.Screen name="EditProfile" component={EditProfilePage} options={{ headerShown: false }} />
                                    <Stack.Screen name="Setting" component={SettingPage} options={{ headerShown: false }} />
                                    <Stack.Screen name="BlockedUsers" component={BlockedUsersPage} options={{ headerShown: false }} />
                                    <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyPage} options={{ headerShown: false }} />
                                </Stack.Navigator>
                            </ItemUploadProvider>
                        </NavigationContainer>
                        <Toast config={toastConfig} />
                    </Provider>
                </GestureHandlerRootView>
            </SafeAreaProvider>
        </AuthProvider>
    );
}
