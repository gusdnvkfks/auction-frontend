// src/pages/SplashPage.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    View,
    Image,
    StyleSheet,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import AppText from '../../components/AppText';

const SplashPage = ({ navigation, route }) => {
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
        }
    }

    // 처음 앱 실행 시
    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            console.log("token : ", token);

            if(token) {
                // 로그인이 되어있으면 메인화면으로 -> 아직 메인화면 안나옴
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

    // 회원가입 중
    const startVerify = (storeId, channelKey) => {
        navigation.replace('Verify', { storeId, channelKey });
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