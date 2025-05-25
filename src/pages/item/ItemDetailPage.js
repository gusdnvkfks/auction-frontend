import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import Config from 'react-native-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppText from '../../components/AppText';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';

import FullScreenImageViewer from '../../components/FullScreenImageViewer';
import BottomActionModal from '../../components/BottomActionModal';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

dayjs.extend(relativeTime);
dayjs.locale('ko');

const ItemDetailPage = () => {
    const insets = useSafeAreaInsets();
    const apiUrl = Config.API_URL;
    
    const navigation = useNavigation();
    const route = useRoute();
    const itemId = route.params?.itemId;

    const [item, setItem] = useState(null);                 // 경매 물품 정보보
    const [isFavorite, setIsFavorite] = useState(false);    // 좋아요 아이콘 name을 바꿔줄 state
    const [isVisible, setIsVisible] = useState(false);      // 풀스크린 이미지 모달 visible 여부
    const [currentIndex, setCurrentIndex] = useState(0);    // 풀스크린 이미지 모달에서 이미지의 index state
    const [scrollY, setScrollY] = useState(0);              // 특정 영역까지 스크롤이 되면 헤더 백그라운드 컬러를 바꿔줄 state
    const [isModalVisible, setIsModalVisible] = useState(false);    // 오른쪽 상단 ... 모달

    const openModal = () => setIsModalVisible(true);
    const closeModal = () => setIsModalVisible(false);

    useEffect(() => {
        // 경매 물품 상세 조회
        if(!itemId) {
            // itemId가 없으면 안되니까 백
            Alert.alert(
                "알림",
                "해당 경매물품을 조회할 수 없습니다.",
                [
                    {
                        text: "확인",
                        onPress: () => navigation.goBack(),  // ✅ 버튼 눌렀을 때만 뒤로가기
                    },
                ],
                { cancelable: false }
            );
        }

        // 조회수는 비동기로 그냥 던지고
        increaseViewCount().catch(() => {
            console.log('조회수 증가 실패 (무시)');
        });

        getItemDetail();
    }, []);

    // 조회수 증가
    const increaseViewCount = async () => {
        const token = await AsyncStorage.getItem("accessToken");
        if(token) {
            try {
                await axios.post(`${apiUrl}/api/item/view-count`,
                    { itemId },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    }
                );
            }catch(err) {
                console.log('조회수 증가 실패');
            }
        }
    }

    // 경매물품 등록 시간 설정정
    const getRelativeTime = (createdAt) => {
        const now = dayjs();
        const created = dayjs(createdAt);

        const diffInMinutes = now.diff(created, 'minute');
        const diffInHours = now.diff(created, 'hour');
        const diffInDays = now.diff(created, 'day');

        if(diffInMinutes < 60) {
            return `${diffInMinutes}분 전`;
        }else if (diffInHours < 24) {
            return `${diffInHours}시간 전`;
        }else {
            return `${diffInDays}일 전`;
        }
    };

    // 경매물품 상세조회회
    const getItemDetail = async () => {
        // itemId가 있으면 조회 하기
        try {
            const token = await AsyncStorage.getItem("accessToken");
            const res = await axios.get(`${apiUrl}/api/item/${itemId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if(res.data.result === "success") {
                // 조회 성공
                setItem(res.data.item);
            }
        } catch (err) {
            Alert.alert(
                "알림",
                "경매 물품을 조회하지 못했습니다. \n잠시 후 다시 시도해주세요.",
                [
                    {
                        text: "확인",
                        onPress: () => navigation.goBack(),  // ✅ 버튼 눌렀을 때만 뒤로가기
                    },
                ],
                { cancelable: false }
            );
        }
    }

    // 좋아요 저장 및 삭제
    const changeFavoriteItem = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            await axios.post(`${apiUrl}/api/item/favorite`, 
                { itemId },  // body
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            setIsFavorite(prev => !prev); // UI만 토글
        }catch (err) {
            Alert.alert("알림", "찜 상태 변경에 실패했습니다.");
        }
    }

    // 스크롤
    const handleScroll = (e) => {
        setScrollY(e.nativeEvent.contentOffset.y);
    };

    return (
        <View style={styles.container}>
            <View style={[styles.header, scrollY > 250 && styles.headerScrolled]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="angle-left" size={28} color={scrollY > 250 ? '#333' : '#fff'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={openModal} style={{ marginLeft: 'auto' }}>
                    <MaterialIcon name="more-vert" size={24} color={scrollY > 100 ? '#333' : '#fff'} />
                </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
                <ScrollView 
                    style={{ flex: 1 }}
                    contentContainerStyle={{ 
                        paddingBottom: 200,
                        minHeight: Dimensions.get('window').height - HEADER_HEIGHT,
                    }}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                >
                    {/* 이미지 영역 */}
                    <View style={styles.imageCarouselWrapper}>
                        <ScrollView
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            style={styles.imageCarousel}
                        >
                            {item?.images?.map((img, index) => (
                                <TouchableOpacity key={index} onPress={() => {
                                    setCurrentIndex(index); // 선택된 이미지 인덱스
                                    setIsVisible(true);
                                }}>
                                    <Image
                                        key={index}
                                        source={{ uri: img.url }}
                                        style={styles.carouselImage}
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* 유저 정보 */}
                    <View style={styles.userInfo}>
                        <Image
                            // source={require('../../assets/images/no-image.png')} // 대체 이미지 경로
                            // source={require('../../../assets/images/no-image.png')}
                            style={styles.avatar}
                        />
                        <View>
                            <AppText style={styles.nickname}>{item?.user?.nickname}</AppText>
                            <AppText style={styles.location}>{item?.user?.city} {item?.user?.gu} {item?.user?.dong}</AppText>
                        </View>
                    </View>

                    {/* 제목 + 시간 */}
                    <View style={styles.titleBox}>
                        <Text style={styles.title}>{item?.title}</Text>
                        <Text style={styles.time}>{item ? getRelativeTime(item.createdAt) : ''}</Text>
                    </View>

                    {/* 내용 */}
                    <Text style={styles.description}>
                        {item?.description}
                    </Text>

                    {/* 거래 희망장소 -> 지금 당장은 없어서 주석 처리 */}
                    {/* <View style={styles.locationBox}>
                        <Text style={styles.label}>거래희망장소</Text>
                        <Text style={styles.place}>주안캐슬앤더샵 에듀포레</Text>
                    </View> */}

                    <View 
                        style={[
                            styles.infoRow,
                            item?.description?.length < 50 && { paddingTop: screenHeight * 0.08, bottom: -50 } // 설명이 짧으면 최소 높이 줌
                        ]}
                    >
                        <View style={styles.infoLeft}>
                            <AppText style={styles.infoText}>조회 {item?.viewCount ?? 0} · 찜 {item?._count?.favorites ?? 0}</AppText>
                        </View>
                        <View style={styles.infoRight}>
                            <AppText style={styles.infoText2}> 현재 입찰가: {item?.currentPrice?.toLocaleString() ?? 0}원</AppText>
                            <AppText style={styles.infoText}> 입찰 단위: {item?.bidUnit?.toLocaleString() ?? 0}원</AppText>
                        </View>
                    </View>
                </ScrollView>
            </View>

            {/* 하단 버튼 */}
            <View style={[styles.bottomBar, { paddingBottom: 64 + insets.bottom }]}>
                <TouchableOpacity style={styles.likeBtn} onPress={changeFavoriteItem}>
                    <Icon name={isFavorite ? 'heart' : 'heart-o'} size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.bidBtn}>
                    <Text style={styles.bidText}>입찰하기</Text>
                </TouchableOpacity>
            </View>

            {/* 풀스크린 이미지 모달달 */}
            <FullScreenImageViewer
                visible={isVisible}
                onClose={() => setIsVisible(false)}
                images={item?.images.map(i => i.url)}
                initialIndex={currentIndex}
            />

            <BottomActionModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                actions={[
                    { label: '신고', color: 'red', onPress: () => console.log('신고') },
                    { label: '이 사용자 글 안 보기', onPress: () => console.log('숨기기') },
                    { label: '닫기', color: 'gray' },
                ]}
            />

        </View>
    );
};

export default ItemDetailPage;

const HEADER_HEIGHT = 50;
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
    container: {
        top: HEADER_HEIGHT,
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 50,
        paddingHorizontal: 16,
        paddingTop: 12,
        zIndex: 20,
        backgroundColor: 'transparent',
        flexDirection: 'row',         // ← 아이콘 가로 배치
        alignItems: 'center',         // ← 수직 정렬
        justifyContent: 'space-between', // ← 양쪽 끝 정렬
    },

    headerScrolled: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    imageCarouselWrapper: {
        position: 'relative',
        height: 350,
        backgroundColor: '#eee',
    },
    imageCarousel: {
        flex: 1,
    },
    carouselImage: {
        width: screenWidth,
        height: 350,
    },
    backButton: {
        position: 'absolute',
        left: 12,
        zIndex: 10,
        borderRadius: 24,
        padding: 6,
    },
    userInfo: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
        backgroundColor: '#ccc',
    },
    nickname: {
        fontSize: 18,
        marginBottom: 5,
    },
    location: {
        color: '#777',
        fontSize: 14,
    },
    titleBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    time: {
        fontSize: 13,
        color: '#888',
    },
    description: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        fontSize: 16,
        color: '#333',
    },
    locationBox: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    label: {
        fontSize: 15,
        color: '#666',
        marginBottom: 4,
    },
    place: {
        fontSize: 16,
        fontWeight: '500',
        color: '#444',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 12,
        bottom: -50,
    },
    infoLeft: {
        flex: 1,
        justifyContent: 'center',
    },
    infoRight: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    infoText: {
        fontSize: 14,
        color: 'gray',
        marginBottom: 2,
    },
    infoText2: {
        fontSize: 18,
        color: '#444',
        marginBottom: 2,
    },
    bottomBar: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16, // 기본값, 여기에 insets.bottom 추가
        borderTopWidth: 1,
        borderColor: '#ddd',
        position: 'absolute',
        backgroundColor: "#fff",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
    },
    likeBtn: {
        width: 48,
        height: 48,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    bidBtn: {
        flex: 1,
        backgroundColor: '#4F80FF',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bidText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
