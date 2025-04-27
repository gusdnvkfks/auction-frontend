import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Keyboard,
    Dimensions,
    Alert
} from 'react-native';
import { TextInputMask } from 'react-native-masked-text';
import axios from 'axios';
import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppText from '../components/AppText';

const LoginPage = () => {
    // API URL
    const apiUrl = Config.API_URL;
    const [phoneNumber, setPhoneNumber] = useState('');
    const [certifyNumber, setCertifyNumber] = useState('');
    // 처음에는 전화번호 인풋창만 있다가, 전화번호 입력이 완료되면 그 때 인증번호 입력창이 나옴
    // 전화번호 입력 후 인증번호 발송을 눌렀을 때 값 변화화
    const [isPhoneComplete, setIsPhoneComplete] = useState(false);
    // 전화번호 입력 후 확인 눌렀을때 전화 번호 입력창은 readonly시키기
    const [isPhoneEditable, setIsPhoneEditable] = useState(true);
    // 앱에서 인풋창 눌렀을때 키패드 창높이를 확인해서 그거 위에다가 버튼 뿌려주기위한 state
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    // 어떤 인풋창이냐에 따라 나와야 하는 버튼이 달라서 어떤 인풋창인지 담아주는 state
    const [activeInput, setActiveInput] = useState(null);
    // 인증번호 입력 시 3분 제한 시간 두기
    const [timer, setTimer] = useState(180); // 180초 = 3분

    // 인증번호 입력할 때 isPhoneComplete가 true이면 1초씩 빠지기
    useEffect(() => {
        let interval;
        if (isPhoneComplete) {
          setTimer(180);
          interval = setInterval(() => {
            setTimer(prev => {
              if (prev <= 1) {
                clearInterval(interval);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
        return () => clearInterval(interval);
      }, [isPhoneComplete]);

    // 로그인 페이지 들어왔을 때 실행
    useEffect(() => {
        const showSub = Keyboard.addListener(
            'keyboardDidShow', e => setKeyboardHeight(e.endCoordinates.height)
        );

        const hideSub = Keyboard.addListener(
            'keyboardDidHide', () => setKeyboardHeight(0)
        );

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    // 분:초 포맷팅, 3분 시간을 주는데 180초로 보이기 시간 포맷하기
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

    const isKeyboardVisible = () => keyboardHeight > 100;

    const handleConfirm = async (inputType) => {
        // 전화 번호 입력 후에 확인 버튼이랑, 인증번호 입력 후에 확인 버튼이랑 처리가 다름
        if(inputType === 'phone') {
            // 인풋타입이 폰이면
            if(phoneNumber.length == 13) {
                await requestPhoneCertify();
            }else {
                Alert.alert("전화번호를 다시 확인해주세요.");
                return;
            }
            
        }else if(inputType === 'certify') {
            if(certifyNumber.length == 6) {
                // 인풋타입이 certify 이면 인증번호 맞는지 API 확인 후
                // 로그인 처리하기.
                // 시간 확인해서 시간이 0이면 인증번호 재발송 하라고 하기
                if(timer <= 0) {
                    Alert.alert("인증 시간이 초과되었습니다. 다시 요청해주세요.");
                    // 다시 요청할 때 state값 뭐 바꿔야되는지 확인하기
                    return;
                }
                await verifyPhoneCertify();
            }else {
                Alert.alert("인증번호를 다시 확인해주세요.");
                return;
            }

        }else {
            // 재 요청인 경우
            try {
                await requestPhoneCertify();  // 다시 인증번호 요청
                setTimer(180);  // 타이머도 리셋
            } catch (error) {
                console.error(error);
                Alert.alert('서버 오류', '잠시 후 다시 시도해주세요.');
            }
        }
    }

    // 인증번호 발송 함수
    const requestPhoneCertify = async () => {
        try {
            const res = await axios.post(`${apiUrl}/api/phone-certify/send`, 
                {
                    "phone": phoneNumber,
                    "type": "login"
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
    
            if(res.data.result === "success") {
                setIsPhoneComplete(true);
                setIsPhoneEditable(false);
                setActiveInput('certify');
    
                requestAnimationFrame(() => {
                    certifyInputRef.current && certifyInputRef.current.focus();
                });
            }else {
                Alert.alert('오류', res.data.message || '인증번호 발송 실패');
            }
        } catch (error) {
            Alert.alert('잠시 후 다시 시도해주세요.');
        }
    }

    // 인증번호 검증 함수
    const verifyPhoneCertify = async () => {
        try {
            const res = await axios.post(`${apiUrl}/api/phone-certify/verify`, 
                {
                    "phone": phoneNumber,
                    "code": certifyNumber
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if(res.data.result === "success") {
    
                // 로그인 api 호출해주기.
                await loginApiCall();
            }else {
                Alert.alert("오류", res.data.message || '인증 실패');
            }
        } catch (error) {
            Alert.alert('잠시 후 다시 시도해주세요.');
        }
    }

    // 로그인 호출하기기
    const loginApiCall = async () => {
        try {
            const res = await axios.post(`${apiUrl}/api/login`, 
                {
                    "phone": phoneNumber,
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
    
            // accessToken과 refreshToken asyncStorage에 보관해주기
            await AsyncStorage.setItem('accessToken', res.data.accessToken);
            await AsyncStorage.setItem('refreshToken', res.data.refreshToken);
    
            Alert.alert("로그인이 완료되었습니다.");
            // TODO : 로그인 이후 처리 하기
        } catch (error) {
            Alert.alert('잠시 후 다시 시도해주세요.');
        }
        
    }

    // 전화 번호 입력 후 확인 누르면 인증번호 입력창으로 포커스
    // ref 선언
    const certifyInputRef = useRef(null);

    return (
        <View style={styles.container}>

            {/* 임시 토글 버튼 */}
            <TouchableOpacity
                style={styles.debugToggle}
                onPress={() => setKeyboardHeight(prev => (prev > 0 ? 0 : 300))}
            >
                <Text style={{color:'#fff'}}>Toggle KB</Text>
            </TouchableOpacity>


            <AppText style={styles.title}>전화번호 인증을 해주세요.</AppText>

            {/* 전화번호 입력, 인증번호 발송 버튼 */}
            <TextInputMask
                type={'custom'}
                options={{ mask: '999 9999 9999' }}
                placeholder='전화번호를 입력해주세요.'
                keyboardType='number-pad'   // 숫자용 키보드
                maxLength={13}              // 최대 자리수 제한(11자리)
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                onFocus={() => setActiveInput('phone')}
                onBlur={() => setActiveInput(null)}
                editable={isPhoneEditable}
                style={[
                    styles.input,
                    !isPhoneEditable && styles.inputDisabled,  // editable=false일 때만 이 스타일 적용
                ]}
            />
            {!isPhoneComplete && (
                <>
                    {(isKeyboardVisible() && activeInput === 'phone') && (
                        <View style={[
                            styles.confirmWrapper,
                            { bottom: keyboardHeight },
                            phoneNumber.length < 13 && styles.inActiveComfirmBtn
                        ]}>
                            <TouchableOpacity onPress={() => handleConfirm('phone')}>
                                <AppText style={styles.btnText}>확인</AppText>
                            </TouchableOpacity>
                        </View>
                    )}
                </>
            )}


            {/* 인증번호 입력, 인증번호 재발송 버튼 */}
            {isPhoneComplete && (
                <>
                    <View style={styles.otpContainer}>
                        <View style={styles.inputWrapper}>
                            <TextInputMask
                                type={'custom'}
                                options={{ mask: '999999' }}
                                placeholder='인증번호를 입력해주세요.'
                                style={styles.certifyInput}
                                keyboardType='number-pad'
                                maxLength={6}
                                value={certifyNumber}
                                onChangeText={setCertifyNumber}
                                onFocus={() => setActiveInput('certify')}
                                onBlur={() => setActiveInput(null)}
                                refInput={input => {
                                    // input은 실제 TextInput 인스턴스
                                    certifyInputRef.current = input;
                                }}
                            />
                            <AppText style={styles.timerText}>
                                {minutes}:{formattedSeconds}
                            </AppText>
                        </View>
                    </View>
                    
                    <TouchableOpacity style={styles.reCertify} onPress={() => handleConfirm('reCertify')}>
                        <AppText style={styles.reCertifyText}>인증번호 재발송</AppText>
                    </TouchableOpacity>
                </>
            )}

            {(isKeyboardVisible() && activeInput === 'certify') && (
                <View style={[styles.confirmWrapper,
                            { bottom: keyboardHeight },
                            certifyNumber.length < 6 && styles.inActiveComfirmBtn
                ]}>
                    <TouchableOpacity onPress={() => handleConfirm('certify')}>
                        <AppText>완료</AppText>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
    debugToggle: {
        position: 'absolute',
        top: 40,
        right: 20,
        padding: 8,
        backgroundColor: 'red',
        zIndex: 999,
    },
    container: {
        flex: 1,
        paddingTop: '30%',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        paddingLeft: '5%',
        marginBottom: '10%',
        color: '#333',
        textShadowColor: '#6495ED',
        textShadowOffset: { width: 0.7, height: 0 },
        textShadowRadius: 0,
        // 2) 글자를 조금 확대(scale)해서 두께 강조
        transform: [{ scaleX: 1.0 }, { scaleY: 1.0 }],
    },
    input: {
        alignSelf: 'center',
        paddingLeft: '5%',
        height: 50,
        width: '90%',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 12,
        fontFamily: 'Hakgyoansim'
    },
    inputDisabled: {
        color: 'gray',
    },
    confirmWrapper: {
        position: 'absolute',
        width,
        backgroundColor: '#6495ED',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50
    },
    inActiveComfirmBtn: {
        backgroundColor: 'gray',
    },
    btnText: {
        fontSize: 18
    },
    reCertify: {
        alignItems: 'center',
        marginTop: '5%',
    },
    reCertifyText: {
        color: 'gray',
        fontSize: 12,
        textDecorationLine: 'underline'
    },
    otpContainer: {
        marginTop: 16,
        width: '100%',
        alignItems: 'center',      // 내부를 가운데 정렬
    },
    inputWrapper: {
        position: 'relative',
        width: '90%',              // 인풋과 같은 너비
    },
    certifyInput: {
        paddingLeft: '5%',
        paddingRight: '5%',          // 타이머가 올라올 공간 확보
        width: '100%',             // Wrapper 가 90% 이므로, 인풋은 100% 채움
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        fontFamily: 'Hakgyoansim'
    },
    timerText: {
        position: 'absolute',
        right: 16,                 // 인풋 내부 오른쪽에서 약간 들어오게
        top: '50%',
        transform: [{ translateY: -9 }],  // 텍스트 높이(약 18) 절반만큼 올리기
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
});
export default LoginPage;
