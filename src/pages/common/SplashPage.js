// src/pages/common/SplashPage.js

import React, { useEffect, useContext } from 'react';
import {
    View,
    Image,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    Alert,
    InteractionManager,
    Text,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../contexts/AuthContext';
import axios from 'axios';
import Config from 'react-native-config';
import { useSelector } from 'react-redux';
import { requestLocationPermission } from '../../utils/location';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

const SplashPage = ({ navigation, route }) => {
    const { userInfo, address, consent } = useSelector(state => state.signup);
    const apiUrl = Config.API_URL;
    const { nextPage, text } = route.params;
    const toastOptions = {
        position: 'bottom',
        bottomOffset: 120,
        visibilityTime: 2000,
    };
    const { setToken } = useContext(AuthContext); // 👈 이 줄 추가
    

    useEffect(() => {
        // Splash 화면이 뜨고난 뒤 JS 스레드 여유 시점에 권한 요청
        InteractionManager.runAfterInteractions(async () => {
            await requestLocationPermission();
            // 권한 요청 후, 기존처럼 2초 대기
            const timeout = setTimeout(pageSetting, 2000);
            return () => clearTimeout(timeout);
        });
    }, []);

    const pageSetting = () => {
        if (nextPage === 'Landing') {
            checkAuth();
        } else if (nextPage === 'SignUp') {
            const { storeId, channelKey } = route.params;
            startVerify(storeId, channelKey);
        } else if (nextPage === 'Main') {
            signUpCall();
        }
    };

    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            const refreshToken = await AsyncStorage.getItem('refreshToken');

            console.log("token : " + token);
            console.log("refreshToken : " + refreshToken);

            if (!token) {
                if (!refreshToken) {
                    navigation.replace('Landing');
                } else {
                    return tryRefreshToken(refreshToken);
                }
            } else {
                const isValid = await validateAccessToken(token);
                if (isValid) {
                    navigation.replace('Main');
                } else {
                    if (!refreshToken) {
                        navigation.replace('Landing');
                    } else {
                        return tryRefreshToken(refreshToken);
                    }
                }
            }
        } catch {
            navigation.replace('Landing');
        }
    };

    const tryRefreshToken = async (refreshToken) => {
        try {
            const res = await axios.post(
                `${apiUrl}/api/refresh-token`,
                { 
                    refreshToken 
                },
                { 
                    headers: { 'Content-Type': 'application/json' } 
                }
            );
            const { accessToken: newAccessToken } = res.data;
            await AsyncStorage.setItem('accessToken', newAccessToken);
            navigation.replace('Main');
        } catch {
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('refreshToken');
            navigation.replace('Landing');
        }
    };

    const validateAccessToken = async (accessToken) => {
        try {
            // console.log("validateAccessToken : ", accessToken);
            const response = await axios.get(
            `${apiUrl}/api/validate-token`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            console.log("response : " + response.data);

            return response.data.result === "success";
        } catch {
            // console.error("validateAccessToken error:", err);
            return false;
        }
    };

    const startVerify = (storeId, channelKey) => {
        navigation.replace('Verify', { storeId, channelKey });
    };

    const signUpCall = async () => {
        try {
            const res = await axios.post(
                `${apiUrl}/api/register`,
                {
                    name: userInfo.name,
                    phone: userInfo.phone,
                    city: address.city,
                    gu: address.gu,
                    dong: address.dong,
                    privacy: consent.privacy,
                    terms: consent.terms,
                    verification: consent.verification,
                    location: consent.location,
                    age14: consent.age14,
                    marketing: consent.marketing,
                },
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (res.data.result === 'success') {
                try {
                    const loginRes = await axios.post(
                        `${apiUrl}/api/login`,
                        { phone: userInfo.phone },
                        { headers: { 'Content-Type': 'application/json' } }
                    );
                    if (loginRes.data.result === 'success') {
                        Toast.show({
                            ...toastOptions,
                            type: 'success',
                            text1: '회원가입이 완료되었습니다.',
                        });
                        // accessToken과 refreshToken asyncStorage에 보관해주기
                        await AsyncStorage.setItem('accessToken', loginRes.data.accessToken);
                        await AsyncStorage.setItem('refreshToken', loginRes.data.refreshToken);
                        setToken(loginRes.data.accessToken);
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Main' }],
                        });
                    } else {
                        navigation.navigate('Login');
                    }
                } catch {
                    navigation.navigate('Login');
                }
            } else {
                Alert.alert(res.data.message);
            }
        } catch {
            /* silent */
        }
    };

    return (
        <View style={styles.container}>
            <Image
                source={require('../../assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
            />
            <Text style={styles.text}>{text}</Text>
            <ActivityIndicator size="small" color="#6495ED" style={styles.indicator} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: width * 0.5,
        height: height * 0.5,
    },
    text: {
        fontSize: 12,
    },
    indicator: {
        marginTop: 24,
    },
});

export default SplashPage;
