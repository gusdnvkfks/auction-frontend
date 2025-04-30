import React, { useState, useContext, useEffect } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert
} from 'react-native';
import AppText from '../../components/AppText';
import { SignUpContext } from '../../contexts/SignUpContext';
import { AuthContext } from '../../contexts/AuthContext';
import Config from 'react-native-config';
import axios from 'axios';

const SignUpPage = ({ navigation }) => {
    const apiUrl = Config.API_URL;
    const { address } = useContext(SignUpContext);
    const { certificationInfo } = useContext(AuthContext);

    const [agreePrivacy, setAgreePrivacy] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [agreeMarketing, setAgreeMarketing] = useState(false);

    const onSubmit = async () => {
        // TODO: 회원가입 제출
        if(agreePrivacy && agreeTerms) {
            // 둘다 true여야지 회원가입
            // 회원가입 api 호출
            try {
                const res = await axios.post(`${apiUrl}/api/register`, 
                    {
                        "name": certificationInfo.name,
                        "phone": certificationInfo.phone,
                        "city": address.city,
                        "gu": address.gu,
                        "dong": address.dong,
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
                                "phone": certificationInfo.phone
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
                    console.log(res);
                    Alert.alert(res.data.message);
                    return;
                }
            } catch (err) {
                console.log(err);
                Alert.alert("서버 에러! 잠시 후 다시 시도해주세요.");
                return;
            }
        }else {
            // 그게 아니면 체크하라고 하기
            Alert.alert("개인정보 수집 및 활용 동의, 서비스 이용약관에 동의해주세요.");
            return;
        }
    };

    const Checkbox = ({ label, value, onToggle }) => (
        <TouchableOpacity style={styles.checkboxRow} onPress={onToggle}>
            <View style={[styles.checkbox, value && styles.checkboxChecked]}>
                {value && <View style={styles.checkboxInner} />}
            </View>
            <AppText style={styles.checkboxLabel}>{label}</AppText>
        </TouchableOpacity>
    );

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.field}>
                <AppText style={styles.label}>이름</AppText>
                <TextInput
                    style={styles.input}
                    value={certificationInfo.name}
                    editable={false}
                />
            </View>

            <View style={styles.field}>
                <AppText style={styles.label}>전화번호</AppText>
                <View style={styles.row}>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        value={certificationInfo.phone}
                        editable={false}
                    />
                </View>
            </View>

            <View style={styles.agreements}>
                <Checkbox
                label="개인정보 수집 및 활용 동의"
                value={agreePrivacy}
                onToggle={() => setAgreePrivacy(v => !v)}
                />
                <Checkbox
                label="서비스 이용약관 동의"
                value={agreeTerms}
                onToggle={() => setAgreeTerms(v => !v)}
                />
                <Checkbox
                label="마케팅 활용 수신 동의"
                value={agreeMarketing}
                onToggle={() => setAgreeMarketing(v => !v)}
                />
            </View>

            <TouchableOpacity
                style={[
                    styles.submitButton,
                    !(agreePrivacy && agreeTerms) && styles.submitDisabled
                ]}
                onPress={onSubmit}
                disabled={!(agreePrivacy && agreeTerms)}
            >
                <AppText style={styles.submitText}>완료</AppText>
            </TouchableOpacity>
        </ScrollView>
    );
};

const CHECKBOX_SIZE = 24;

const styles = StyleSheet.create({
    container: {
        padding: 24,
        paddingTop: "30%",
        alignItems: 'center',
    },
    field: {
        width: '100%',
        marginBottom: 24,
    },
    label: {
        marginBottom: 8,
        fontSize: 16,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: '#6495ED',
        borderRadius: 6,
        paddingHorizontal: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    agreements: {
        width: '100%',
        marginVertical: 24,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    checkbox: {
        width: CHECKBOX_SIZE,
        height: CHECKBOX_SIZE,
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 4,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        borderColor: '#6495ED',
    },
    checkboxInner: {
        width: CHECKBOX_SIZE - 8,
        height: CHECKBOX_SIZE - 8,
        backgroundColor: '#6495ED',
        borderRadius: 2,
    },
    checkboxLabel: {
        fontSize: 16,
    },
    submitButton: {
        width: '100%',
        height: 48,
        backgroundColor: '#6495ED',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitDisabled: {
        backgroundColor: '#ccc',
    },
    submitText: {
        color: '#fff',
        fontSize: 18,
    },
});

export default SignUpPage;