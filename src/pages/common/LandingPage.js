import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
    InteractionManager
} from 'react-native';

import { requestLocationPermission } from '../../utils/location';

const { width } = Dimensions.get('window');

const LandingPage = ({ navigation }) => {
    return (
        <View style={styles.container}>
            {/* 중앙 그룹: 로고 + 텍스트 */}
            <View style={styles.centerGroup}>
                <Image
                    source={require('../../assets/images/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.title}>내 물건의 가치를,</Text>
                <Text style={styles.highlight}>가치매김</Text>
                <Text style={styles.description}>
                    내 물건을 경매물품으로 등록하여{`\n`}
                    실시간으로 입찰 받아보세요.
                </Text>
            </View>

            {/* 하단 그룹: 버튼 + 로그인 링크 */}
            <View style={styles.bottomGroup}>
                {/* <TouchableOpacity
                    style={styles.startButton}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate('Location')}
                > */}
                <TouchableOpacity
                    style={styles.startButton}
                    activeOpacity={0.8}
                    onPress={async () => {
                        // 1) InteractionManager 로딩 이후에 권한 요청
                        await InteractionManager.runAfterInteractions(requestLocationPermission);
                        // 2) 권한 여부 상관없이 LocationPage 로 이동
                        navigation.navigate('Location');
                    }}
                >
                    <Text style={styles.startButtonText}>시작하기</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>이미 아이디가 있으신가요? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.footerLink}>로그인하러 가기</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default LandingPage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centerGroup: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    logo: {
        width: 200,
        height: 200,
        marginBottom: 24,
    },
    title: {
        fontSize: 26,
        color: '#333',
    },
    highlight: {
        fontSize: 26,
        color: '#6495ED',
        marginTop: 4,
        marginBottom: 16,
    },
    description: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    bottomGroup: {
        paddingBottom: 50,
        alignItems: 'center',
    },
    startButton: {
        width: width * 0.9,
        height: 50,
        backgroundColor: '#6495ED',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    startButtonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#9E9E9E',
    },
    footerLink: {
        fontSize: 14,
        color: '#6495ED',
        textDecorationLine: 'underline',
    },
});
