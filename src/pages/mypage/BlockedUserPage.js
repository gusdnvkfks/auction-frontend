// BlockedUsersPage.js
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import SafeTopWrapper from '../../components/SafeTopWrapper';
import axios from 'axios';
import Config from 'react-native-config';
import { AuthContext } from '../../contexts/AuthContext';
import Toast from 'react-native-toast-message';
import AngleHeader from '../../components/AngleHeader';

// 아이콘
import UserNoImgIcon from '../../assets/images/user/noImgUser.svg';
import LeftAngle from '../../assets/images/common/left-angle.svg';

const BlockedUsersPage = ({ navigation }) => {
    const apiUrl = Config.API_URL;
    const { token } = useContext(AuthContext);
    const toastOptions = {
        position: 'bottom',
        bottomOffset: 50,
        visibilityTime: 2000,
    };

    const [blockedUsers, setBlockedUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getBlockedUserList();
    }, []);

    // 차단한 유저 목록
    const getBlockedUserList = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${apiUrl}/api/user/block/list`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if(res.data.result === "success") {
                setBlockedUsers(res.data.data);
            }
        }catch (error) {

        }finally {
            setLoading(false);
        }
    }

    // 차단 변경
    const changeUserBlock = async (item) => {
        setLoading(true);
        try {
            const res = await axios.post(`${apiUrl}/api/user/block/${item.blockUserId}`,
                {
                    isBlock: item.isBlock,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            console.log(res);
            if(res.data.result === "success") {
                setBlockedUsers(res.data.data); // ← 최신 목록 반영
                Toast.show({
                    ...toastOptions,
                    type: 'success',
                    text1: '차단 상태가 변경되었습니다.',
                });
            }
        }catch (error) {
            console.log(error);
        }finally {
            setLoading(false);
        }
    }

    const renderItem = ({ item }) => (
        <View style={styles.userRow}>
            {item?.thumbnailImg ? (
                <Image
                    source={{ uri: item.thumbnailImg }}
                    style={styles.profileImage}
                    resizeMode="cover"
                />
            ) : (
                <View style={styles.profileImageWrapper}>
                    <UserNoImgIcon width={74} height={74} />
                </View>
            )}
            <View style={styles.userInfo}>
                <Text style={styles.name}>{item.nickname}</Text>
            </View>
            <TouchableOpacity 
                style={[
                    styles.blockButton,
                    item?.isBlock ? {backgroundColor: '#8CB0F4'} : null
                ]}
                onPress={() => changeUserBlock(item)}
            >
                {item?.isBlock ? (
                    <Text style={[
                        styles.blockButtonText,
                        item?.isBlock ? {color: '#FFF'} : null,
                    ]}>
                        차단중
                    </Text>
                ) : (
                    <Text style={[
                        styles.blockButtonText,
                        item?.isBlock ? null : {color: '#6494ED'}
                    ]}>
                        차단하기
                    </Text>
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeTopWrapper>
            <AngleHeader
                title="차단 유저 관리"
                IconComponent={LeftAngle}
                onPress={() => navigation.goBack()}
            />
            <View style={styles.container}>
                <FlatList
                    data={blockedUsers}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.blockUserId}
                    contentContainerStyle={{ paddingBottom: 30 }}
                />
            </View>
            {loading && (
                <View style={styles.spinnerWrapper}>
                    <ActivityIndicator size="large" color="#6495ED" />
                </View>
            )}
        </SafeTopWrapper>
    );
};

export default BlockedUsersPage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 20,
        paddingHorizontal: 20,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    profileImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#eee',
    },
    profileImageWrapper: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#eee',
        overflow: 'hidden',
    },
    userInfo: {
        marginLeft: 12,
        flex: 1,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
    },
    location: {
        color: '#999',
        fontSize: 14,
    },
    blockButton: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        minWidth: 80, // ← 추가
        alignItems: 'center', // 텍스트 가운데 정렬
    },
    blockButtonText: {
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
