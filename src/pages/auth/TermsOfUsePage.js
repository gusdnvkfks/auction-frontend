// src/pages/auth/TermsOfUsePage.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';
import AppText from '../../components/AppText';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Config from 'react-native-config';
import { useSelector, useDispatch } from 'react-redux';
import { setConsent } from '../../features/signupSlice';

const CHECKBOX_SIZE = 20;

// 재사용 가능한 체크박스 컴포넌트
const Checkbox = ({ label, value, onToggle, onArrowPress, arrowIconName = 'chevron-forward' }) => (
    <View style={styles.checkboxRow}>
        {/* 체크박스 + 라벨 터치영역 */}
        <TouchableOpacity style={styles.checkboxTouch} onPress={onToggle}>
            <View style={[styles.checkbox, value && styles.checkboxChecked]}>
                {value && <View style={styles.checkboxInner} />}
            </View>
            <AppText style={styles.checkboxLabel}>{label}</AppText>
        </TouchableOpacity>

        {/* 화살표가 필요한 경우만 */}
        {onArrowPress && (
        <TouchableOpacity 
            style={styles.arrowContainer}
            onPress={onArrowPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name={arrowIconName} size={24} color="#333" />
        </TouchableOpacity>
        )}
    </View>
)

export default function TermsOfUsePage({ navigation }) {
    const dispatch = useDispatch();

    // Redux 상태 가져오기
    const consent = useSelector(state => state.signup.consent);

    // 본인확인 서비스 동의 사항 확장 여부
    const [verificationExpanded, setVerificationExpanded] = useState(false);

    const toggleConsent = (key) => {
        // setConsent에 기존에 있던 consent[key]의 반대로 데이터 저장
        dispatch(setConsent({ [key]: !consent[key] }));
    }

    // 전체동의 (모두 동의되었는지)
    const allChecked = Object.values(consent).every(value => value === true);

    // 필수 동의 상태 체크
    const allRequiredChecked =
        consent.privacy &&
        consent.terms &&
        consent.verification &&
        consent.location &&
        consent.age14;
    
    const subCertificationContent = (content) => {
        console.log(content);
    }

    const toggleAll = () => {
        const next = !allChecked;
        dispatch(setConsent({
            privacy: next,
            terms: next,
            verification: next,
            location: next,
            age14: next,
            marketing: next,
        }));
    };

    const onSubmit = () => {
        // 다음 처리
        navigation.replace('Splash', {
            nextPage: "SignUp",
            text: '회원가입을 위해\n본인인증을 시작합니다.',
            storeId: Config.IMP_STORE_ID,
            channelKey: Config.IMP_CHANNEL_KEY
        });
    }

    return (
        <View style={styles.wrapper}>
            <ScrollView contentContainerStyle={styles.container}>
                {/* 1. 설명 문구 영역 */}
                <View style={styles.noticeContainer}>
                    <Text style={styles.noticeText}>
                        <Text style={styles.title}>'가치매김' </Text>
                        서비스를 이용하기 위한 동의가 필요해요.{'\n'}
                    </Text>
                    <Text style={styles.description}>개인정보 수집 및 활용, 서비스 이용약관, 본인확인, 위치정보,{'\n'} 마케팅 정보(선택) 등을 포함합니다.</Text>
                </View>

                {/* 1) 전체 동의 */}
                <Checkbox
                    label="전체 동의"
                    value={allChecked}
                    onToggle={toggleAll}
                />
                {/* 2) 개별 동의 + 화살표 */}
                <Checkbox
                    label="(필수) 개인정보 수집 및 활용"
                    value={consent.privacy}
                    onToggle={() => toggleConsent('privacy')}
                    onArrowPress={() => navigation.navigate('PrivacyPolicy')}
                />
                <Checkbox
                    label="(필수) 서비스 이용약관"
                    value={consent.terms}
                    onToggle={() => toggleConsent('terms')}
                    onArrowPress={() => navigation.navigate('TermsService')}
                />
                <Checkbox
                    label="(필수) 본인확인 서비스 동의사항"
                    value={consent.verification}
                    onToggle={() => toggleConsent('verification')}
                    onArrowPress={() => setVerificationExpanded(v => !v)}
                    arrowIconName={verificationExpanded ? 'chevron-up' : 'chevron-down'}
                />
                {verificationExpanded && (
                    <View style={styles.subContent}>
                        <TouchableOpacity onPress={() => subCertificationContent('certification')}>
                            <AppText style={styles.subItem}>본인확인 서비스 동의사항</AppText>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => subCertificationContent('mobile')}>
                            <AppText style={styles.subItem}>통신사 이용 약관</AppText>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => subCertificationContent('identifier')}>
                            <AppText style={styles.subItem}>고유식별정보 처리 동의</AppText>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => subCertificationContent('offering')}>
                            <AppText style={styles.subItem}>개인정보 제3자 제공 동의</AppText>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => subCertificationContent('entrust')}>
                            <AppText style={styles.subItem}>개인정보 수집·이용·위탁 동의</AppText>
                        </TouchableOpacity>
                    </View>
                )}
                <Checkbox
                    label="(필수) 위치기반 서비스 이용약관"
                    value={consent.location}
                    onToggle={() => toggleConsent('location')}
                    onArrowPress={() => navigation.navigate('LocationService')}
                />
                <Checkbox
                    label="(필수) 만 14세 이상"
                    value={consent.age14}
                    onToggle={() => toggleConsent('age14')}
                />
                <Checkbox
                    label="(선택) 마케팅 활용 수신 동의"
                    value={consent.marketing}
                    onToggle={() => toggleConsent('marketing')}
                    onArrowPress={() => navigation.navigate('MarketingPolicy')}
                />

            </ScrollView>

            {/* 3) 하단 고정 "다음" 버튼 */}
            <TouchableOpacity
                style={[
                    styles.submitButton,
                    !allRequiredChecked && styles.submitDisabled
                ]}
                onPress={onSubmit}
                disabled={!allRequiredChecked}
            >
                <AppText style={styles.submitText}>다음</AppText>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 48,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: "#6495ED"
    },
    description: {
        fontSize: 12,
        color: '#444',
    },
    noticeContainer: {
        marginBottom: 24,
        padding: 12,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
    },
    noticeText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#444',
    },
    container: {
        paddingVertical: 24,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    checkboxTouch: {
        flexDirection: 'row',
        alignItems: 'center',
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
    arrowContainer: {
        marginLeft: 'auto',
    },
    subContent: {
        paddingLeft: CHECKBOX_SIZE + 12, // checkbox + margin
        marginBottom: 16
    },
    subItem: {
        fontSize: 14,
        lineHeight: 30,
        marginBottom: 4,
        textDecorationLine: 'underline'
    },
    submitButton: {
        width: '100%',
        height: 48,
        backgroundColor: '#6495ED',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 50,
    },
    submitDisabled: {
        backgroundColor: '#ccc',
    },
    submitText: {
        color: '#fff',
        fontSize: 18,
    },
})
