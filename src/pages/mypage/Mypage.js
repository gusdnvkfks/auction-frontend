import React, { useState, useContext, useCallback } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import SafeTopWrapper from '../../components/SafeTopWrapper';
import axios from 'axios';
import Config from 'react-native-config';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthContext } from '../../contexts/AuthContext';

// SVG 아이콘
import UserNoImgIcon from '../../assets/images/user/noImgUser.svg';
import SettingIcon from '../../assets/images/common/setting.svg';

const MyPage = () => {
    const apiUrl = Config.API_URL;
    const navigation = useNavigation();
    const { token } = useContext(AuthContext);
    const toastOptions = {
        position: 'bottom',
        bottomOffset: 100,
        visibilityTime: 2000,
    };

    const [myInfo, setMyInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    // 사용자 정보 조회
    const getMyInfo = async () => {
        if (!token) {
            Toast.show({
                ...toastOptions,
                type: 'error',
                text1: '로그인 정보가 없습니다.',
            });
            return;
        }

        setLoading(true);
        try {
            const res = await axios.get(`${apiUrl}/api/user`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (res.data.result === 'success') {
                setMyInfo(res.data.user);
            } else {
                throw new Error(res.data.message || '조회 실패');
            }
        } catch (err) {
            console.error('getMyInfo error:', err);
            Toast.show({
                ...toastOptions,
                type: 'error',
                text1: '내 정보 조회에 실패했습니다.',
            });
        } finally {
            setLoading(false);
        }
    };

    // 화면 포커스 시마다 정보 갱신
    useFocusEffect(
        useCallback(() => {
            getMyInfo();
        }, [])
    );

    // 프로필 수정 화면 이동
    const editProfile = () => {
        if (token) {
            navigation.navigate('EditProfile');
        } else {
            Toast.show({
                ...toastOptions,
                type: 'error',
                text1: '유저 토큰이 누락되었습니다. 다시 시도 해주세요.',
            });
        }
    };

    return (
        <SafeTopWrapper>
            <ScrollView style={styles.container}>
                <View style={styles.headerWrapper}>
                    <Text style={styles.headerTitle}>나의 가치</Text>
                </View>

                {/* 프로필 카드 */}
                <View style={styles.profileCard}>
                    <View style={styles.profileRow}>
                        <View style={styles.avatarWrapper}>
                            {myInfo?.thumbnailImg ? (
                                <Image
                                    source={{ uri: myInfo.thumbnailImg }}
                                    style={styles.avatar}
                                    resizeMode="cover"
                                />
                            ) : (
                                <UserNoImgIcon width={60} height={60} />
                            )}
                        </View>
                        <View style={styles.profileTextContainer}>
                            <Text style={styles.nickname}>{myInfo?.nickname}</Text>
                            <TouchableOpacity
                                onPress={editProfile}
                                style={styles.editProfileBtn}
                            >
                                <Text style={styles.editProfileText}>프로필 수정</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Setting', { phone: myInfo?.phone })}
                        style={styles.settingIconWrapper}
                    >
                        <SettingIcon width={20} height={20} />
                    </TouchableOpacity>
                </View>

                {/* 경매 섹션 */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>나의 경매</Text>
                    <MenuItem
                        label="판매내역"
                        icon="tag-outline"
                        onPress={() => navigation.navigate('MySalesHistory')}
                    />
                    <MenuItem label="구매내역" icon="cart-outline" onPress={() => {}} />
                    <MenuItem label="찜한상품" icon="heart-outline" onPress={() => {}} />
                </View>

                {/* 내 활동 섹션 */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>나의 활동</Text>
                    <MenuItem label="내가 쓴 글" icon="pencil-outline" onPress={() => {}} />
                    <MenuItem label="내가 쓴 댓글" icon="comment-text-outline" onPress={() => {}} />
                </View>

                {/* 고객 편의 섹션 */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>고객 편의</Text>
                    <MenuItem label="설정" icon="cog-outline" onPress={() => {}} />
                    <MenuItem label="차단 유저 목록" icon="block-helper" onPress={() => {}} />
                    <MenuItem label="공지사항" icon="bullhorn-outline" onPress={() => {}} />
                    <MenuItem label="고객센터" icon="headset" onPress={() => {}} />
                    <MenuItem label="약관 및 정책" icon="file-document-outline" onPress={() => {}} />
                </View>
            </ScrollView>
            {loading && (
                <View style={styles.spinnerWrapper}>
                    <ActivityIndicator size="large" color="#6495ED" />
                </View>
            )}
        </SafeTopWrapper>
    );
};

const MenuItem = ({ label, icon, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuItemContent}>
            <Icon name={icon} size={20} color="#6495ED" style={styles.menuIcon} />
            <Text style={styles.menuText}>{label}</Text>
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerWrapper: {
        paddingTop: 25,
        paddingHorizontal: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    profileCard: {
        backgroundColor: '#f9f9f9',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    avatarWrapper: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#ddd',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    profileTextContainer: {
        flex: 1,
        marginLeft: 16,
    },
    nickname: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    editProfileBtn: {
        marginTop: 8,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        backgroundColor: '#6495ED',
        alignSelf: 'flex-start',
    },
    editProfileText: {
        color: '#fff',
        fontSize: 12,
    },
    settingIconWrapper: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
    sectionCard: {
        backgroundColor: '#f9f9f9',
        marginHorizontal: 16,
        marginTop: 16,
        padding: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 8,
    },
    menuItem: {
        paddingVertical: 12,
    },
    menuItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIcon: {
        marginRight: 12,
    },
    menuText: {
        fontSize: 14,
        color: '#333',
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
});

export default MyPage;