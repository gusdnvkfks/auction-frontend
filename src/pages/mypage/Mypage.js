import { useEffect, useState, useContext } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import SafeTopWrapper from '../../components/SafeTopWrapper';
import { useNavigation } from '@react-navigation/native';

import axios from 'axios';
import Config from 'react-native-config';
import { AuthContext } from '../../contexts/AuthContext';
import Toast from 'react-native-toast-message';

// 아이콘
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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
    const [reSetting, setReSetting] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // 토큰으로 내 정보 가져오기
        getMyInfo();
    }, [reSetting]);

    // 내 정보 조회
    const getMyInfo = async () => {
        setLoading(true);
        try {
            const res = await axios(`${apiUrl}/api/user`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );
            if(res.data.result === "success") {
                setMyInfo(res.data.user);
            }
        }catch (error) {
            console.log("error : ", error);
        }finally {
            setLoading(false);
        }
    }

    // 프로필 수정 페이지 이동
    const editProfile = () => {
        if(token) {
            navigation.navigate("EditProfile");
        }else {
            Toast.show({
                ...toastOptions,
                type: 'error',
                text1: '유저 토큰이 누락되었습니다. 다시 시도 해주세요.',
            });
            setReSetting(prev => !prev);
        }
    }
    
    return (
        <SafeTopWrapper>
            <ScrollView style={styles.container}>
                <View style={styles.headerWrapper}>
                    <Text style={styles.headerTitle}>나의 가치</Text>
                </View>
                {/* 프로필 카드 영역 */}
                <View style={styles.profileCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {myInfo?.thumbnailImg ? (
                            <Image source={{ uri: myInfo?.thumbnailImg }} style={styles.profileImage}/>
                        ) : (
                            <UserNoImgIcon width={60} height={60} style={{ transform: [{ scale: 1 }] }} />
                        )}
                        {/* <Image source={{ uri: myInfo?.thumbnailImg }} style={styles.profileImage} /> */}
                        <View style={styles.profileTextContainer}>
                            <Text style={styles.nickname}>{myInfo?.nickname}</Text>
                            <TouchableOpacity onPress={editProfile} style={styles.editProfileBtn}>
                                <Text style={styles.editProfileText}>프로필 수정</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    
                    {/* 오른쪽 상단: 설정 아이콘 */}
                    <TouchableOpacity onPress={() => navigation.navigate('Setting', { phone: myInfo.phone })} style={styles.settingIconWrapper}>
                        <SettingIcon width={20} height={20}/>
                    </TouchableOpacity>
                </View>

                {/* 경매 섹션 */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>나의 경매</Text>
                    <MenuItem label="판매내역" icon="tag-outline" onPress={() => {navigation.navigate('MySalesHistory')}} />
                    <MenuItem label="구매내역" icon="cart-outline" onPress={() => {}} />
                    <MenuItem label="찜한상품" icon="heart-outline" onPress={() => {}} />
                </View>

                {/* 내 활동 섹션 */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>나의 활동</Text>
                    <MenuItem label="내가 쓴 글" icon="pencil-outline" onPress={() => {}} />
                    <MenuItem label="내가 쓴 댓글" icon="comment-text-outline" onPress={() => {}} />
                </View>

                {/* 기타 섹션 */}
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
        flexDirection: 'row',
        justifyContent: 'space-between', // 👈 추가
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        padding: 16,
        margin: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    profileImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'center', // 👈 SVG가 가운데 정렬되도록
        overflow: 'hidden',       // 혹시 튀어나올 경우 잘라냄
    },
    profileTextContainer: {
        marginLeft: 16,
        flex: 1,
    },
    nickname: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    editProfileBtn: {
        marginTop: 6,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 6,
        backgroundColor: '#6495ED',
        alignSelf: 'flex-start',
    },
    editProfileText: {
        color: 'white',
        fontSize: 12,
    },
    settingIconWrapper: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 4,
    },
    section: {
        marginTop: 24,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 8,
    },
    sectionCard: {
        backgroundColor: '#f9f9f9',
        marginHorizontal: 20,
        marginTop: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    menuItem: {
        paddingVertical: 16,
    },
    menuText: {
        fontSize: 14,
        color: '#333',
    },
    menuItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIcon: {
        marginRight: 12,
    },
});

export default MyPage;
