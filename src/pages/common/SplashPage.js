// src/pages/SplashPage.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect } from 'react';
import {
    View,
    Image,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    Alert
} from 'react-native';
import AppText from '../../components/AppText';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Config from 'react-native-config';

const SplashPage = ({ navigation, route }) => {
    const { userInfo, address, consent } = useSelector(state => state.signup);

    const apiUrl = Config.API_URL;
    const { nextPage, text } = route.params;

    useEffect(() => {
        const timeout = setTimeout(pageSetting, 2000);
        return () => clearTimeout(timeout);
    }, []);

    const pageSetting = () => {
        if(nextPage === "Landing") {
            checkAuth();
        }else if(nextPage === "SignUp") {
            const { storeId, channelKey } = route.params;
            startVerify(storeId, channelKey);
        }else if(nextPage === "Main") {
            // console.log('메인페이지');
            signUpCall();
        }
    }

    // 처음 앱 실행 시
    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            console.log("accessToken : ", token);
            console.log("refreshToken : ", refreshToken);
            if(!token) {
                // 토큰이 없다? -> refreshToken 확인
                if(!refreshToken) {
                    // 리프레시 토큰도 없다? -> 랜딩 페이지 ㄱㄱ
                    navigation.replace('Landing');
                }else {
                    // 리프레시 토큰이 있다? -> 토큰갱신
                    return tryRefreshToken(refreshToken);
                }
            }

            // 토큰이 있다면 이쪽으로 옴
            const isValid = await validateAccessToken(token);
            if(isValid) {
                // 토큰 유효성 검사 통과
                navigation.replace('Main');
            }else {
                // 유효성 검사 실패 -> 리프레시 토큰 확인
                if(!refreshToken) {
                    // 리프레시 토큰도 없다? -> 랜딩 페이지 ㄱㄱ
                    navigation.replace('Landing');
                }else {
                    // 리프레시 토큰이 있다? -> 토큰갱신
                    return tryRefreshToken(refreshToken);
                }
            }

        } catch (error) {
            // 에러나도 랜딩페이지
            navigation.replace('Landing');
        }
    }

    // 리프레시 토큰있음 -> 토큰 갱신
    const tryRefreshToken = async (refreshToken) => {
        // console.log(refreshToken);
        try {
            const res = await axios.post(`${apiUrl}/api/refresh-token`, {
                headers: { Authorization: `Bearer ${refreshToken}` }
            });

            const { accessToken: newAccessToken } = res.data;
            await AsyncStorage.setItem('accessToken', newAccessToken);
            navigation.replace("Main");
        }catch(err) {
            // 여기서도 리프레시 토큰이 유효성이 맞지 않거나, 생성에 실패하면
            // asyncStorage에 있는 토큰들 삭제 후 로그인 페이지 이동
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('refreshToken');
            navigation.replace('Landing');
        }
    }

    // accessToken 유효성 확인
    const validateAccessToken = async (accessToken) => {
        // 토큰이 있으면 유효성 검사 먼저 실행
        try {
            const res = await axios.get(`${apiUrl}/api/validateToken`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            return true;
        } catch (err) {
            return false;
        }
    }

    // 회원가입 중 본인인증 페이지로 이동
    const startVerify = (storeId, channelKey) => {
        navigation.replace('Verify', { storeId, channelKey });
    }

    // 회원가입 요청
    const signUpCall = async () => {
        try {
            const res = await axios.post(`${apiUrl}/api/register`, 
                {
                    "name": userInfo.name,
                    "phone": userInfo.phone,
                    "city": address.city,
                    "gu": address.gu,
                    "dong": address.dong,
                    "privacy": consent.privacy,
                    "terms": consent.terms,
                    "verification": consent.verification,
                    "location": consent.location,
                    "age14": consent.age14,
                    "marketing": consent.marketing,
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if(res.data.result === "success") {
                // 로그인 요청 후 메인페이지로 이동
                try {
                    const loginRes = await axios.post(`${apiUrl}/api/login`,
                        {
                            "phone": userInfo.phone
                        },
                        {
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                    if(loginRes.data.result === "success") {
                        // 메인페이지 이동
                        Alert.alert("로그인까지 성공");
                    }else {
                        // 로그인 실패 -> 로그인 페이지로 이동
                        navigation.navigate("Login");
                    }
                } catch (loginError) {
                    // 로그인 실패 에러 -> 로그인 페이지로 이동
                    navigation.navigate("Login");
                }
            }else {
                Alert.alert(res.data.message);
                return;
            }
        } catch (error) {
        }
    }

  
    return (
        <View style={styles.container}>
            <Image 
                source={require('../../assets/images/logo.png')}
                style={styles.logo}
                resizeMode='contain'
            />
            <AppText>{text}</AppText>
            <ActivityIndicator size="small" color="#6495ED" style={styles.indicator} />
        </View>
    );
}

const { width, height } = Dimensions.get('window');
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
    indicator: {
        marginTop: 24,
    },
});

export default SplashPage;