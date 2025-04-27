import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import AppText from '../components/AppText';

const { width } = Dimensions.get('window');

const LandingScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* 중앙 그룹: 로고 + 텍스트 */}
      <View style={styles.centerGroup}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <AppText style={styles.title}>내 물건의 가치를,</AppText>
        <AppText style={styles.highlight}>가치매김</AppText>
        <AppText style={styles.description}>
          내 물건을 경매물품으로 등록하여{`\n`}
          실시간으로 입찰 받아보세요.
        </AppText>
      </View>

      {/* 하단 그룹: 버튼 + 로그인 링크 */}
      <View style={styles.bottomGroup}>
        <TouchableOpacity
          style={styles.startButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('SignUp')}
        >
          <AppText style={styles.startButtonText}>시작하기</AppText>
        </TouchableOpacity>

        <View style={styles.footer}>
          <AppText style={styles.footerText}>이미 아이디가 있으신가요? </AppText>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <AppText style={styles.footerLink}>로그인하러 가기</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LandingScreen;

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
    fontSize: 32,
    fontWeight: '600',
    color: '#333',
  },
  highlight: {
    fontSize: 28,
    color: '#6495ED',
    marginTop: 4,
    marginBottom: 16,
    textShadowColor: '#6495ED',
    textShadowOffset: { width: 0.7, height: 0 },
    textShadowRadius: 0,
    // 2) 글자를 조금 확대(scale)해서 두께 강조
    transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }],
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
    color: '#444',
  },
  footerLink: {
    fontSize: 14,
    color: '#6495ED',
    textDecorationLine: 'underline',
  },
});