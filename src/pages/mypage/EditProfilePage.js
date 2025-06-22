import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Image, PermissionsAndroid, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import SafeTopWrapper from '../../components/SafeTopWrapper';
import CloseHeader from '../../components/CloseHeader';
import axios from 'axios';
import Config from 'react-native-config';
import { AuthContext } from '../../contexts/AuthContext';
import { launchImageLibrary } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';

import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';

// 아이콘
import UserNoImgIcon from '../../assets/images/user/noImgUser.svg';
import CloseIcon from '../../assets/images/common/close.svg';

const MAX_IMAGE_SIZE_MB = 2;

const EditProfilePage = ( {navigation }) => {
    const apiUrl = Config.API_URL;
    const { token } = useContext(AuthContext);

    const [userInfo, setUserInfo] = useState([]);
    const [nickname, setNickname] = useState('');
    const [isImgChange, setIsImgChange] = useState(false);
    const [loading, setLoading] = useState(false);

    const toastOptions = {
        position: 'bottom',
        bottomOffset: 50,
        visibilityTime: 2000,
    };

    useEffect(() => {
        getUserInfo();
    }, []);

    useEffect(() => {
        if (userInfo?.nickname) {
            setNickname(userInfo.nickname);
        }
    }, [userInfo]);

    // 유저 정보 조회
    const getUserInfo = async () => {
        setLoading(true);
        if(token) {
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
                    setLoading(false);
                    setUserInfo(res.data.user);
                }else {
                    setLoading(false);
                    Toast.show({
                        ...toastOptions,
                        type: 'error',
                        text1: '유저 정보 조회 실패',
                    });
                    navigation.goBack();
                }
            }catch {
                setLoading(false);
                Toast.show({
                    ...toastOptions,
                    type: 'error',
                    text1: '유저 정보 조회 실패',
                });
                navigation.goBack();
            }
        }else {
            setLoading(false);
            Toast.show({
                ...toastOptions,
                type: 'error',
                text1: '로그인 정보가 없습니다.',
            });
            // 로그아웃 후 로그인 페이지로 넘겨주기
        }
    }

    // 이미지 선택 핸들러
    const handleSelectImage = async () => {
        const options = {
            mediaType: 'photo',
            maxWidth: 512,
            maxHeight: 512,
            quality: 0.8,
            selectionLimit: 1, // 한 장만
        };

        const hasPermission = await requestImagePermission();
        if (!hasPermission) {
            Toast.show({
                type: 'error',
                text1: '이미지 접근 권한이 필요합니다.',
            });
            return;
        }

        launchImageLibrary(options, async (response) => {
            setLoading(true);
            if (response.didCancel) {
                setLoading(false);
                return;
            }

            if (response.errorCode) {
                setLoading(false);
                Toast.show({
                    ...toastOptions,
                    type: 'error',
                    text1: '이미지 첨부 실패, 다시 시도해주세요.',
                });
                return;
            }

            const selected = response.assets;
            if (!selected || selected.length === 0) return;

            const resizedImages = [];
            for (const img of selected) {
                try {
                    const resized = await ImageResizer.createResizedImage(
                        img.uri,
                        800,
                        800,
                        'JPEG',
                        70
                    );

                    const path = resized.uri.replace('file://', '');
                    const stat = await RNFS.stat(path);
                    const sizeMB = stat.size / (1024 * 1024);

                    if (sizeMB > MAX_IMAGE_SIZE_MB) {
                        Toast.show({
                            ...toastOptions,
                            type: 'error',
                            text1: `압축 후에도 용량 초과: ${img.fileName || '이미지'} 제외됨`,
                        });
                        continue;
                    }

                    resizedImages.push({
                        uri: resized.uri,
                        fileName: getCleanFileName(img.fileName, 'jpg'),
                        type: 'image/jpeg',
                    });

                    console.log("resizedImages : ", resizedImages);
                } catch (err) {
                    setLoading(false);
                    console.warn('리사이즈 실패:', err);
                }
            }

            if (resizedImages.length > 0) {
                const first = resizedImages[0];
                setUserInfo((prev) => ({
                    ...prev,
                    thumbnailImg: first.uri,
                    resizedImageMeta: first, 
                }));
                setIsImgChange(true);
            }

            setLoading(false);
        });
    };

    // 파일 확장자 처리
    const getCleanFileName = (originalName, extension = 'jpg') => {
        if (!originalName) {
            return `resized_${Date.now()}.${extension}`;
        }

        const parts = originalName.split('.');
        
        console.log(parts);
        // 확장자가 있고 최소 2개 이상이면 마지막 확장자 제거
        if (parts.length > 2) {
            parts.pop();
        }

        const baseName = parts.join('.');
        return `${baseName}`;
    };

    // 프로필 수정 완료
    const editProfileComplete = async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append('nickname', nickname);
        formData.append('isImgChange', String(isImgChange));
        
        if(userInfo.thumbnailImg?.startsWith('file://')) {
            const imageMeta = userInfo.resizedImageMeta;
            formData.append('profileImage', {
                uri: imageMeta.uri,
                type: imageMeta.type,
                name: imageMeta.fileName,
            });
        }

        try {
            if(token) {
                const res = await axios.patch(`${apiUrl}/api/user/profile`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });

                console.log(res);

                if(res.data.result === "success") {
                    Toast.show({
                        ...toastOptions,
                        type: 'success',
                        text1: '프로필 수정이 완료되었습니다.',
                    });

                    setLoading(false);
                    navigation.goBack();
                }
            }else {
                setLoading(false);
                Toast.show({
                    ...toastOptions,
                    type: 'error',
                    text1: '유저 정보 조회 실패',
                });
                navigation.goBack();
            }
        }catch (error) {
            console.log(error);
            setLoading(false);
            Toast.show({
                ...toastOptions,
                type: 'error',
                text1: '프로필 수정에 실패했습니다. 다시 시도 해주세요.',
            });
            return;
        }
    }

    // 이미지 접근 권한
    const requestImagePermission = async () => {
        if (Platform.OS === 'android' && Platform.Version >= 33) {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                {
                    title: '이미지 접근 권한',
                    message: '갤러리에서 이미지를 선택하려면 권한이 필요합니다.',
                    buttonNeutral: '나중에',
                    buttonNegative: '거부',
                    buttonPositive: '허용',
                },
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
    };

    return (
        <SafeTopWrapper style={styles.container}>
            <CloseHeader
                title="프로필 수정"
                onPressLeft={() => navigation.goBack()}
                onPressRight={editProfileComplete}
                LeftComponent={<CloseIcon width={16} height={16} />}
                RightComponent={<Text>완료</Text>}
            />

            {/* 프로필 이미지 */}
            <View style={styles.profileContainer}>
                <View style={styles.profileImageWrapper}>
                    {userInfo?.thumbnailImg ? (
                        <Image
                            source={{ uri: userInfo.thumbnailImg }}
                            style={styles.profileImage}
                        />
                    ) : (
                        <UserNoImgIcon width={150} height={150} />
                    )}
                    
                    <TouchableOpacity style={styles.cameraIcon} onPress={handleSelectImage}>
                        <Icon name="camera" size={16} color="#555" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* 닉네임 입력 */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>닉네임</Text>
                <TextInput
                    style={styles.input}
                    placeholder="닉네임을 입력하세요"
                    value={nickname}
                    onChangeText={setNickname}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 15,
    },
    header: {
        height: 48,
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
    },
    headerTitle: {
        fontSize: 16,
        textAlign: 'center',
        color: "#000",
    },
    headerLeft: {
        position: 'absolute',
        left: 0,
        height: '100%',
        justifyContent: 'center',
    },
    headerRight: {
        position: 'absolute',
        right: 0,
        height: '100%',
        justifyContent: 'center',
    },
    profileContainer: {
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 10,
    },
    profileImageWrapper: {
        width: 97,
        height: 97,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#eee', // 테스트용 배경
        borderRadius: 75,        // 동그랗게 만들고 싶다면
        // overflow: 'hidden',      // 넘치는 부분 잘라내기 (optional)
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 75,
        backgroundColor: '#eee',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 6,
        elevation: 3,

        // 겹치는 느낌을 더 내기 위해 약간 이미지 안쪽으로 이동
        // transform: [{ translateX: -20 }, { translateY: -20 }],
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        marginBottom: 8,
        left: 5,
        fontWeight: 'bold'
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        fontSize: 13,
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

export default EditProfilePage;
