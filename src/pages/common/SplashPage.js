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
            console.log('메인페이지');
            signUpCall();
        }
    }

    // 처음 앱 실행 시
    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            console.log("token : ", token);

            if(token) {
                // 로그인이 되어있으면 메인화면으로 -> 아직 메인화면 안나옴
                navigation.replace("Main");
            }else {
                // 안되어있으면 Landing화면으로
                navigation.replace('Landing');
            }
        } catch (error) {
            // 에러나도 랜딩페이지
            console.log("error");
            navigation.replace('Landing');
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

            console.log(res);

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

                    console.log(loginRes);
                    
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
                console.log(res);
                Alert.alert(res.data.message);
                return;
            }
        } catch (error) {
            console.log(error);
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