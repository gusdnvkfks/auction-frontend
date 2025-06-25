// src/pages/mypage/SettingPage.js

import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, ActivityIndicator, Modal } from 'react-native';
import AngleHeader from '../../components/AngleHeader';
import SafeTopWrapper from '../../components/SafeTopWrapper';
import axios from 'axios';
import Config from 'react-native-config';
import { AuthContext } from '../../contexts/AuthContext';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 아이콘
import LeftAngle from '../../assets/images/common/left-angle.svg';
import RightAngle from '../../assets/images/common/right-angle.svg';

const SettingPage = ({ navigation, route }) => {
    const apiUrl = Config.API_URL;
    const { token, setToken, setUser } = useContext(AuthContext);
    const toastOptions = {
        position: 'bottom',
        bottomOffset: 50,
        visibilityTime: 2000,
    };

    const { phone } = route.params;

    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    // 앱 푸시 업데이트
    const handlePushSettingUpdate = async (value) => {
        try {
            setLoading(true);
            const res = await axios.patch(`${apiUrl}/api/user/notification`,
                { allowPush: value },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            if(res.data.result === "success") {
                
                let date = new Date();
                let today = date.toLocaleString();
                let allow = value === true ? "승인" : "철회";
                let text = ` 앱 푸시 동의를 ${allow} 하였습니다.`;
                Toast.show({
                    ...toastOptions,
                    type: 'success',
                    text1: today,
                    text2: text
                });
            }

        }catch (error) {
            Toast.show({
                ...toastOptions,
                type: 'error',
                text1: "앱 푸시 설정에 실패했습니다.",
            });
        }finally {
            setLoading(false);
        }
    }

    // 전화번호 세팅
    const formatPhoneNumber = (phone) => {
        if (phone.length === 11) {
            return `${phone.slice(0, 3)} ${phone.slice(3, 7)} ${phone.slice(7)}`;
        }
        return phone; // 11자리가 아니면 그대로 반환
    };

    // 차단 유저 목록
    const goBlockedUserList = () => {
        navigation.navigate("BlockedUsers");
    }

    // 로그아웃
    const logout = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${apiUrl}/api/logout`, 
                {
                    
                }, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    withCredentials: true,
                }
            );
            console.log(res);
            if(res.data.result === "success") {
                Toast.show({
                    ...toastOptions,
                    type: 'error',
                    text1: "로그아웃 되었습니다.",
                });
                setToken(null);
                setUser(null);
                await AsyncStorage.removeItem("accessToken");
                await AsyncStorage.removeItem("refreshToken");
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Splash' }],
                });
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    // 회원 탈퇴 확인모달
    const userWithrawal = () => {
        setModalVisible(true);
    }

    const confirmWithdraw = async () => {
        try {
            setLoading(true);
            const res = await axios.post(`${apiUrl}/api/withdraw`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                withCredentials: true,
            });

            console.log(res);

            if (res.data.result === 'success') {
                Toast.show({
                    ...toastOptions,
                    type: 'success',
                    text1: '회원탈퇴가 완료되었습니다.',
                });
                setToken(null);
                setUser(null);
                await AsyncStorage.removeItem("accessToken");
                await AsyncStorage.removeItem("refreshToken");
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Splash' }],
                });
            }
        } catch (error) {
            console.log(error);
            Toast.show({
                ...toastOptions,
                type: 'error',
                text1: '회원탈퇴 실패',
            });
        } finally {
            setLoading(false);
            setModalVisible(false);
        }
    };
    
    return (
        <SafeTopWrapper>

            <ScrollView style={styles.container}>
                {/* Title */}
                <AngleHeader
                    title="설정"
                    IconComponent={LeftAngle}
                    onPress={() => navigation.goBack()}
                />

                <View style={styles.viewContainer}>
                    {/* 알림 설정 */}
                    
                    <Section title="알림 설정">
                        <Item label="앱 푸시 설정" isSwitch onToggle={handlePushSettingUpdate} />
                        {/* <Item label="방해금지 시간 설정" isSwitch /> */}
                    </Section>

                    {/* 사용자 설정 */}
                    <Section title="유저 설정">
                        <Item label="계정 정보" rightText={formatPhoneNumber(phone)}/>
                        {/* <Item label="모아보기 사용자 관리" /> */}
                        <Item label="차단한 사용자" rightComponent={<RightAngle width={14} height={14} />} onPress={goBlockedUserList} />
                        {/* <Item label="게시글 미노출 사용자 관리" />
                        <Item label="동영상 자동 재생 설정" rightText="항상 사용" />
                        <Item label="중고거래 게시글의 동네 변경하기" />
                        <Item label="기타 설정" /> */}
                    </Section>

                    {/* 기타 */}
                    <Section title="기타">
                        <Item label="공지사항" />
                        <Item label="로그아웃" onPress={logout}/>
                        <Item label="회원탈퇴" onPress={userWithrawal}/>
                        {/* <Item label="국가 변경" /> */}
                    </Section>
                </View>
            </ScrollView>
            {loading && (
                <View style={styles.spinnerWrapper}>
                    <ActivityIndicator size="large" color="#6495ED" />
                </View>
            )}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>가치매김을 떠나시겠습니까?</Text>
                        <Text style={styles.modalContent}>탈퇴 시 <Text style={{ color: '#FF6B6B', fontWeight: 'bold' }}>7일 </Text>이내에는 재가입이 <Text style={{ color: '#FF6B6B', fontWeight: 'bold' }}>불가능</Text>합니다.</Text>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: '#6494ED' }]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={{ color: '#fff' }}>취소</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: '#eee' }]}
                                onPress={confirmWithdraw}
                            >
                                <Text style={{ color: '#333' }}>탈퇴하기</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeTopWrapper>
    );
};

const Section = ({ title, children }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

const Item = ({ label, rightText, isSwitch, onToggle, rightComponent, onPress }) => {
    const [enabled, setEnabled] = React.useState(false);

    return (
        <TouchableOpacity style={styles.item} activeOpacity={isSwitch ? 1 : 0.7} onPress={onPress}>
            <Text style={styles.itemLabel}>{label}</Text>
            {isSwitch ? (
                <Switch
                    value={enabled}
                    onValueChange={(value) => {
                        setEnabled(value);
                        onToggle?.(value);
                    }}
                    trackColor={{ false: '#ccc', true: '#6495ED' }}
                    thumbColor={enabled ? '#fff' : '#f4f3f4'}
                    ios_backgroundColor="#ccc"
                    style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
                />
            ) : rightComponent ? (
                rightComponent
            ) : (
                rightText && <Text style={styles.rightText}>{rightText}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        flex: 1,
    },
    viewContainer: {
        paddingVertical: 15,
        paddingHorizontal: 15,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6494ED',
        marginBottom: 10,
    },
    item: {
        paddingVertical: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemLabel: {
        fontSize: 14,
    },
    rightText: {
        color: '#6494ED',
        fontSize: 14,
    },
    spinnerWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.5)',
        zIndex: 999,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalContent: {
        fontSize: 12,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 6,
        marginHorizontal: 5,
        alignItems: 'center',
    },
});

export default SettingPage;
