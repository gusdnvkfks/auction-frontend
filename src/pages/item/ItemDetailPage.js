import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Alert, Dimensions, Modal, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import Config from 'react-native-config';
import AppText from '../../components/AppText';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';

import FullScreenImageViewer from '../../components/FullScreenImageViewer';
import BottomActionModal from '../../components/BottomActionModal';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { AuthContext } from '../../contexts/AuthContext';

import useRemainingTime from '../../hooks/useRemainingTime';

dayjs.extend(relativeTime);
dayjs.locale('ko');

const ItemDetailPage = () => {
    const insets = useSafeAreaInsets();
    const apiUrl = Config.API_URL;
    
    const navigation = useNavigation();
    const route = useRoute();
    const itemId = route.params?.itemId;

    const [item, setItem] = useState(null);                 // 경매 물품 정보
    const [isAuthority, setIsAuthority] = useState(false);   // 이 경매 물품에 권한이 있는지 수정을 할 수 있는
    const [isFavorite, setIsFavorite] = useState(false);    // 좋아요 아이콘 name을 바꿔줄 state
    const [isVisible, setIsVisible] = useState(false);      // 풀스크린 이미지 모달 visible 여부
    const [currentIndex, setCurrentIndex] = useState(0);    // 풀스크린 이미지 모달에서 이미지의 index state
    const [scrollY, setScrollY] = useState(0);              // 특정 영역까지 스크롤이 되면 헤더 백그라운드 컬러를 바꿔줄 state
    const [isModalVisible, setIsModalVisible] = useState(false);    // 오른쪽 상단 ... 모달
    const [isBidModalVisible, setIsBidModalVisible] = useState(false);  // 입찰 모달
    const [isSuccessfulBidModalVisible, setIsSuccessfullBidModalVisible] = useState(false);  // 낙찰 모달
    const [bidPrice, setBidPrice] = useState(0);
    const remainingText = useRemainingTime(item?.endTime);

    const { token } = useContext(AuthContext);

    const toastOptions = {
        position: 'bottom',
        bottomOffset: 120,
        visibilityTime: 2000,
    };

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

    // 경매물품 상세조회
    const getItemDetail = async () => {
        // itemId가 있으면 조회 하기
        try {
            const res = await axios.get(`${apiUrl}/api/item/${itemId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if(res.data.result === "success") {
                // 조회 성공
                setItem(res.data.item);
                console.log(res.data.item.endTime);
                // 수정 권한 처리
                setIsAuthority(res.data.authority);
                // 찜 아이콘 처리
                if(res.data.item.favorites.length > 0) {
                    // 0보다크면 userId, itemId로 조회했기 때문에 찜한거임
                    setIsFavorite(true);
                }
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
            if (!token) {
                Toast.show({
                    ...toastOptions,
                    type: 'error',
                    text1: '로그인이 필요합니다.',
                });
                return;
            }
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

    // 입찰 모달에서 입찰
    const handleSubmitBid = () => {
        let price = 0;

        if(item.isBidUnit === 1) {
            price = item.currentPrice === 0 ? item.startPrice : item.currentPrice + item.bidUnit;
        }else {
            const parsed = parseInt(bidPrice);
            if (isNaN(parsed)) {
                Toast.show({
                    ...toastOptions,
                    type: 'error',
                    text1: '숫자를 입력해주세요.',
                });
                return;
            }

            if ((item.currentPrice > 0 && parsed <= item.currentPrice) || item.currentPrice === 0 && parsed < item.startPrice) {
                Toast.show({
                    ...toastOptions,
                    type: 'error',
                    text1: item.currentPrice === 0 ? '입찰가는 시작가보다 높아야 합니다.' : '입찰가는 현재가보다 높아야 합니다.',
                });
                return;
            }

            if (parsed % 100 !== 0) {
                Toast.show({
                    ...toastOptions,
                    type: 'error',
                    text1: '입찰가에 10원단위는 입력할 수 없습니다.',
                });
                return;
            }
            price = parsed;
            if (item.buyNowPrice && parsed > item.buyNowPrice) {
                Toast.show({
                    ...toastOptions,
                    type: 'error',
                    text1: '즉시 구매가를 초과할 수 없습니다.',
                });
                const fixedPrice = item.buyNowPrice;
                setBidPrice(item.buyNowPrice.toString()); // 문자열로 넣어줘야 TextInput에 반영됨
                price = fixedPrice;
                return;
            }
        }

        // ✅ 여기서 입찰 API 호출
        submitBid(price);
    };

    // 입찰 처리
    const submitBid = async (price) => {
        // console.log(price);
        try {
            if (!token) {
                Toast.show({
                    ...toastOptions,
                    type: 'error',
                    text1: '로그인이 필요합니다.',
                });
                return;
            }

            // 즉시 구매가가 있고, 즉시구매가과 입찰한 금액이 같으면 바로 낙찰 처리해주기기
            if(item?.buyNowPrice && item.buyNowPrice === price) {
                const res = await axios.post(`${apiUrl}/api/bid/successBid`,
                    {
                        itemId: itemId,
                        buyNowPrice: item.buyNowPrice,
                        isInstant: true,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                if(res.data.result === "success") {
                    Toast.show({
                        ...toastOptions,
                        type: 'success',
                        text1: '본 물품에 낙찰되었습니다. \n경매자와 채팅을 통해 거래약속을 잡으세요.',
                    });
                    setItem(res.data.item);
                    closeBidModal();
                    setBidPrice(0);
                }
            }else {
                const res = await axios.post(`${apiUrl}/api/bid/create`,
                    {
                        itemId: itemId,
                        bidPrice: price,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                if(res.data.result === "success") {
                    Toast.show({
                        ...toastOptions,
                        type: 'success',
                        text1: '입찰이 완료되었습니다!',
                    });
                    setItem(res.data.item);
                    closeBidModal();
                    setBidPrice(0);
                }
            }
        }catch (error) {
            // console.log("errorResponse : ", error.response.data);
            closeBidModal();
            setBidPrice(0);
            const errorCode = error.response?.data?.errorCode;

            switch (errorCode) {
                case 4001:
                    Toast.show({ ...toastOptions, type: 'error', text1: '유저 정보가 유효하지 않습니다.' });
                    break;
                case 4002:
                    Toast.show({ ...toastOptions, type: 'error', text1: '상품 정보가 잘못되었습니다.' });
                    break;
                case 4003:
                    Toast.show({ ...toastOptions, type: 'error', text1: '입찰 금액을 입력해주세요.' });
                    break;
                case 4004:
                    Toast.show({ ...toastOptions, type: 'error', text1: '마지막 입찰자입니다.' });
                    break;
                case 4015:
                    Toast.show({ ...toastOptions, type: 'error', text1: '입찰 가능한 상품이 아닙니다.' });
                    break;
                default:
                    Toast.show({ ...toastOptions, type: 'error', text1: '입찰에 실패했습니다.' });
                    break;
            }
        }
    }

    // 입찰 모달 열기
    const openBidModal = () => {
        
        switch (item.state) {
            case 0:
                Toast.show({ ...toastOptions, type: 'error', text1: '경매 시작전 상품 입니다.' });
                return;
            case 2:
                Toast.show({ ...toastOptions, type: 'error', text1: '낙찰이 완료된 상품 입니다.' });
                return;
            case 3:
                Toast.show({ ...toastOptions, type: 'error', text1: '판매가 완료된 상품 입니다.' });
                return;
            default:
                break;
        }
        // 로그인 유저와 이 경매 물품을 올린 유저아이디가 같은지 확인해보기
        if(isAuthority === true) {
            Toast.show({
                ...toastOptions,
                type: 'error',
                text1: '내 경매 물품에는 입찰할 수 없습니다.',
            });
            return;
        }
        setIsBidModalVisible(true);
    };
    
    // 입찰 모달 닫기
    const closeBidModal = () => {
        setIsBidModalVisible(false);
        setBidPrice(0);
    };

    // 낙찰 모달 열기
    const openSuccessfullBidModal = () => {
        switch (item.state) {
            case 0:
                Toast.show({ ...toastOptions, type: 'error', text1: '경매 시작전 상품 입니다.' });
                return;
            case 2:
                Toast.show({ ...toastOptions, type: 'error', text1: '낙찰이 완료된 상품 입니다.' });
                return;
            case 3:
                Toast.show({ ...toastOptions, type: 'error', text1: '판매가 완료된 상품 입니다.' });
                return;
            default:
                break;
        }
        
        setIsSuccessfullBidModalVisible(true);
    }
    // 낙찰 모달 닫기
    const closeSuccessfullBidModal = () => setIsSuccessfullBidModalVisible(false);
    
    // 낙찰
    const handleSuccessfullBid = async () => {
        try {
            if (!token) {
                Toast.show({
                    ...toastOptions,
                    type: 'error',
                    text1: '로그인이 필요합니다.',
                });
                return;
            }

            const res = await axios.post(`${apiUrl}/api/bid/successBid`, 
                {
                    itemId: itemId,
                    buyNowPrice: item.buyNowPrice,
                    isInstant: true,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // console.log(res);
            if(res.data.result === "success") {
                Toast.show({
                    ...toastOptions,
                    type: 'success',
                    text1: '본 물품에 낙찰되었습니다. \n경매자와 채팅을 통해 거래약속을 잡으세요.',
                });
                setItem(res.data.item);
                closeSuccessfullBidModal();
            }
        }catch (error) {
            // console.log(error);
            closeSuccessfullBidModal();
            const errorCode = error.response?.data?.errorCode;

            switch (errorCode) {
                case 4001:
                    Toast.show({ ...toastOptions, type: 'error', text1: '유저 정보가 유효하지 않습니다.' });
                    break;
                case 4002:
                    Toast.show({ ...toastOptions, type: 'error', text1: '상품 정보가 잘못되었습니다.' });
                    break;
                case 4006:
                    Toast.show({ ...toastOptions, type: 'error', text1: '낙찰 타입이 유효하지 않습니다.' });
                    break;
                case 4007:
                    Toast.show({ ...toastOptions, type: 'error', text1: '즉시 구매가가 유효하지 않습니다.' });
                    break;
                case 4009:
                    Toast.show({ ...toastOptions, type: 'error', text1: '경매 물품이 존재하지 않거나 삭제되었습니다.' });
                    break;
                case 4010:
                    Toast.show({ ...toastOptions, type: 'error', text1: '경매중인 물품이 아닙니다.' });
                    break;
                case 4011:
                    Toast.show({ ...toastOptions, type: 'error', text1: '이미 낙찰된 경매 물품 입니다.' });
                    break;
                case 4012:
                    Toast.show({ ...toastOptions, type: 'error', text1: '이미 마감된 경매 물품 입니다.' });
                    break;
                case 4013:
                    Toast.show({ ...toastOptions, type: 'error', text1: '설정된 즉시 구매가와 일치하지 않습니다.' });
                    break;
                default:
                    Toast.show({ ...toastOptions, type: 'error', text1: '낙찰에에 실패했습니다.' });
                    break;
            }
        }
    }

    // 신고하기
    const itemReport = () => {
        setIsModalVisible(false);

        navigation.navigate("Report", {
            targetId: item.id,
            targetType: "ITEM",
        });
    }

    // 유저 차단하기
    const hideUser = async () => {
        
    }

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
                        paddingBottom: 140 + insets.bottom,
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
                                    {/* ✅ 낙찰 완료 오버레이 */}
                                    {item.state === 2 && (
                                        <View style={styles.overlay}>
                                            <Image
                                                source={require('../../assets/images/logo.png')} // 경매봉 이미지
                                                style={styles.gavel}
                                                resizeMode="contain"
                                            />
                                            <Text style={styles.overlayText}>낙찰완료</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* 유저 정보 */}
                    <View style={styles.userInfo}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Image style={styles.avatar} />
                            <View>
                                <AppText style={styles.nickname}>{item?.user?.nickname}</AppText>
                                <AppText style={styles.location}>{item?.user?.city} {item?.user?.gu} {item?.user?.dong}</AppText>
                            </View>
                        </View>
                        <View style={styles.viewLikeBox}>
                            <AppText style={styles.viewLikeText}>조회 {item?.viewCount ?? 0} · 찜 {item?._count?.favorites ?? 0}</AppText>
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
                            item?.description?.length < 50 && { paddingTop: screenHeight * 0.08, bottom: -40 } // 설명이 짧으면 최소 높이 줌
                        ]}
                    >
                    </View>
                    <View style={styles.bidNoticeSection}>
                        {item?.state === 1 && (
                            <View style={styles.bidNoticeBox}>
                                <View style={styles.bidNoticeRow}>
                                    {item?._count?.bids > 0 && (
                                        <AppText style={styles.bidNoticeText}>
                                            {item?._count?.bids}명 입찰 중!
                                        </AppText>
                                    )}
                                    <AppText style={styles.rightText}>
                                        {/* {getRemainingTimeText(item?.endTime)}  */}
                                        마감까지 {remainingText} 
                                    </AppText>
                                </View>
                            </View>
                        )}

                        {item?.state === 2 && (
                            <View style={styles.bidNoticeBox}>
                                <AppText style={[
                                    styles.bidNoticeText,
                                    { color: "red" }
                                ]}>
                                    낙찰된 상품입니다.
                                </AppText>
                            </View>
                        )}
                    </View>

                    <View style={styles.priceContainer}>
                        <View style={styles.priceBox}>
                            <AppText style={styles.priceLabel}>경매 시작가</AppText>
                            <AppText style={styles.priceValue}>
                                {item?.startPrice?.toLocaleString()}원
                            </AppText>
                        </View>
                        <View style={styles.priceBox}>
                            <AppText style={styles.priceLabel}>
                                <AppText style={styles.priceLabel}>
                                    {{
                                        0: '경매 대기 중',
                                        1: '현재 입찰가',
                                        2: '낙찰가',
                                        3: '경매 완료',
                                    }[item?.state] ?? ''}
                                </AppText>
                            </AppText>
                            {item?.currentPrice > 0 ? (
                                <>
                                    <AppText style={styles.priceValue}>
                                        {item.currentPrice.toLocaleString()}원
                                        {/* {item?._count?.bids > 0 && ` · ${item._count.bids}명 입찰 중`} */}
                                    </AppText>
                                </>
                            ) : (
                                <>
                                    <AppText style={styles.firstBidText}>첫 입찰자가 되어주세요!</AppText>
                                </>
                            )}
                        </View>
                        {item?.isBidUnit === 1 && (
                            <View style={styles.priceBox}>
                                <AppText style={styles.priceLabel}>입찰 단위</AppText>
                                <AppText style={styles.priceValue}>
                                    {item?.bidUnit?.toLocaleString()}원
                                </AppText>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>

            {/* 하단 버튼 */}
            <View style={[styles.bottomBar, { paddingBottom: 64 + insets.bottom }]}>
                <TouchableOpacity style={styles.likeBtn} onPress={changeFavoriteItem}>
                    <Icon name={isFavorite ? 'heart' : 'heart-o'} size={24} color="#F05650" />
                </TouchableOpacity>
                {item?.buyNowPrice ? (
                    <View style={styles.bidBtnArea}>
                        <TouchableOpacity style={[styles.bidBtn, item.state !== 1 && styles.disabledBtn]} onPress={openBidModal}>
                            <Text style={styles.bidText}>입찰하기</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.bidBtn, { marginLeft: 20, backgroundColor: '#FAFAD2' }, item.state !== 1 && styles.disabledBtn]} onPress={openSuccessfullBidModal} >
                            <Text style={[styles.bidText, { color: '#333333'}]}>즉시 낙찰받기</Text>
                            <Text style={{ fontSize: 12, color: 'gray' }}>즉시구매가({item?.buyNowPrice.toLocaleString()}원) </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.bidBtnArea}>
                        <TouchableOpacity style={styles.bidBtn} onPress={openBidModal}>
                            <Text style={styles.bidText}>입찰하기</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* 풀스크린 이미지 모달 */}
            <FullScreenImageViewer
                visible={isVisible}
                onClose={() => setIsVisible(false)}
                images={item?.images.map(i => i.url)}
                initialIndex={currentIndex}
            />

            {/* 우측 상단 ... 아이콘 누르면 나오는 모달 */}
            <BottomActionModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onReport={itemReport} // ✅ 이걸 꼭 추가!
                onHideUser={hideUser}
            />

            {/* 입찰 모달 */}
            <Modal visible={isBidModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.bidModal}>
                        <Text style={styles.bidModalTitle}>입찰하기</Text>

                        <Text style={styles.currentPrice}>현재 입찰가: {item?.currentPrice?.toLocaleString()}원</Text>

                        {item?.isBidUnit === 1 ? (
                            <Text style={styles.yourBid}>
                                내 입찰가: {(
                                    (item.currentPrice === 0 
                                    ? item.startPrice 
                                    : item.currentPrice + item.bidUnit)
                                ).toLocaleString()}원
                            </Text>
                        ) : (
                            <>
                                <Text style={styles.label}>내 입찰가</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    value={Number(bidPrice).toLocaleString()}
                                    onChangeText={setBidPrice}
                                    placeholder="100원 단위까지 입력"
                                />
                            </>
                        )}

                        {/* 버튼 영역 */}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity onPress={closeBidModal} style={styles.cancelBtn}>
                                <Text style={styles.cancelText}>취소</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSubmitBid} style={styles.confirmBtn}>
                                <Text style={styles.confirmText}>입찰</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* 즉시 낙찰 모달 */}
            <Modal visible={isSuccessfulBidModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.bidModal}>
                        <Text style={styles.bidModalTitle}>즉시 낙찰받기</Text>

                        <Text style={styles.currentPrice}>
                            즉시 구매가: {item?.buyNowPrice?.toLocaleString()}원
                        </Text>

                        <Text style={styles.warningText}>
                            즉시 낙찰 시 본 상품은 더 이상 입찰이 불가능하며,{'\n'}
                            낙찰이 확정됩니다. 진행하시겠습니까?
                        </Text>

                        {/* 버튼 영역 */}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity onPress={closeSuccessfullBidModal} style={styles.cancelBtn}>
                                <Text style={styles.cancelText}>취소</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSuccessfullBid} style={styles.confirmBtn}>
                                <Text style={styles.confirmText}>낙찰받기</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    gavel: {
        width: 160,
        height: 160,
        // transform: [{ rotate: '30deg' }],
        opacity: 0.6,
    },
    overlayText: {
        // position: 'absolute',
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.7)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
        // transform: [{ rotate: '30deg' }], // ← ✅ 대각선으로 회전
        letterSpacing: 20,
        opacity: 0.6,
    },
    backButton: {
        position: 'absolute',
        left: 12,
        zIndex: 10,
        borderRadius: 24,
        padding: 6,
    },
    disabledBtn: {
        opacity: 0.6,
    },
    // userInfo: {
    //     flexDirection: 'row',
    //     padding: 16,
    //     borderBottomWidth: 1,
    //     borderColor: '#ddd',
    //     alignItems: 'center',
    // },
    nickname: {
        fontSize: 18,
        marginBottom: 5,
    },
    location: {
        color: '#777',
        fontSize: 14,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
        backgroundColor: '#ccc',
    },
    userInfo: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'space-between', // ✅ 오른쪽 정렬 가능하게
    },
    viewLikeBox: {
        alignItems: 'flex-end',
        paddingTop: 20,
    },

    viewLikeText: {
        fontSize: 13,
        color: '#666',
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
    bidNoticeSection: {
    },
    bidNoticeBox: {
        paddingHorizontal: 16,
        paddingBottom: 5,
    },
    bidNoticeText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6495ED',
    },
    bidNoticeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rightText: {
        fontSize: 14,
        color: '#666', // 원하면 다른 색상
        fontWeight: '400',
    },
    priceContainer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 12,
        marginTop: 12,
        justifyContent: 'space-around',
    },
    priceBox: {
        alignItems: 'center',
        flex: 1, // 각 항목 너비 동일하게
    },
    priceLabel: {
        fontSize: 14,
        color: '#888',
        marginBottom: 4,
    },
    priceValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#222',
    },
    firstBidText: {
        fontSize: 13,
        color: '#6495ED',
        marginTop: 4,
    },
    subInfo: {
        fontSize: 11,
        color: '#888',
    },
    bottomBar: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16,
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
    bidBtnArea: {
        flex: 1,
        flexDirection: 'row',
    },
    bidBtn: {
        flex: 1,
        backgroundColor: '#6495ED',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bidText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bidModal: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
    },
    bidModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    currentPrice: {
        fontSize: 16,
        marginBottom: 8,
    },
    yourBid: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    label: {
        alignSelf: 'flex-start',
        marginTop: 12,
        fontSize: 14,
        color: '#666',
    },
    input: {
        width: '100%',
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginTop: 6,
    },
    buttonRow: {
        flexDirection: 'row',
        marginTop: 20,
        width: '100%',
        justifyContent: 'space-between',
    },
    cancelBtn: {
        flex: 1,
        backgroundColor: '#F0F0F0',
        paddingVertical: 12,
        borderRadius: 8,
        marginRight: 8,
        alignItems: 'center',
    },
    confirmBtn: {
        flex: 1,
        backgroundColor: '#6495ED', // Cornflower Blue
        paddingVertical: 12,
        borderRadius: 8,
        marginLeft: 8,
        alignItems: 'center',
    },
    cancelText: {
        color: '#333',
        fontSize: 16,
    },
    confirmText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    warningText: {
        fontSize: 13,
        color: '#666',
        textAlign: 'center',
        marginBottom: 10,
        lineHeight: 20,
    },

});
