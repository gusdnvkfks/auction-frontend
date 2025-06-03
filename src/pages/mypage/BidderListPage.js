import { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Modal } from 'react-native';
import { AuthContext } from '../../contexts/AuthContext';
import SafeTopWrapper from '../../components/SafeTopWrapper';
import { useNavigation } from '@react-navigation/native';

import axios from 'axios';
import Config from 'react-native-config';
import Toast from 'react-native-toast-message';

import useRemainingTime from '../../hooks/useRemainingTime';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

const BidderListPage = ({ route }) => {
    const { itemId, updateState } = route.params;
    const apiUrl = Config.API_URL;
    const { token } = useContext(AuthContext);
    const navigation = useNavigation();

    const [item, setItem] = useState([]);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [winnerId, setWinnerId] = useState(null);
    const [isFinished, setIsFinished] = useState(false);

    const toastOptions = {
        position: 'bottom',
        bottomOffset: 120,
        visibilityTime: 2000,
    };

    const padZero = (n) => (n < 10 ? '0' + n : n);

    const formatDateTime = (datetimeStr) => {
        const date = new Date(datetimeStr);
        const yyyy = date.getFullYear();
        const mm = padZero(date.getMonth() + 1);
        const dd = padZero(date.getDate());
        const hh = padZero(date.getHours());
        const mi = padZero(date.getMinutes());
        const ss = padZero(date.getSeconds());

        return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
    };

    const remainingText = useRemainingTime(item?.endTime);

    useEffect(() => {
        getItemDetail();
    }, []);

    const getItemDetail = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${apiUrl}/api/bid/list/${itemId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if(res.data.result === "success") {
                // 조회 성공
                console.log(res.data.item);
                console.log(remainingText);
                setItem(res.data.item);
                setBids(res.data.bids);
            }
        } catch (err) {
            console.log(err);
            Toast.show({
                ...toastOptions,
                type: 'error',
                text1: "해당 물품의 입찰자를 조회하는데 실패했습니다.",
            });
            navigation.goBack();
        }finally {
            setLoading(false);
        }
    }

    const onSelectWinner = () => {
        const now = dayjs();
        const end = dayjs.utc(item?.endTime).local();

        if (!item?.endTime || end.diff(now) <= 0 || isFinished === true) {
            // 이미 마감된 상태 → 바로 낙찰처리
            Toast.show({
                ...toastOptions,
                type: "error",
                text1: "이미 낙찰된 경매물품 입니다."
            });
            return;
        }

        // 마감 전 → 모달 띄우기
        setShowConfirmModal(true);
    }

    const handleConfirm = async () => {
        // 낙찰 처리 ㄱㄱ
        try {
            const res = await axios.post(`${apiUrl}/api/bid/success-bid`, 
                {
                    itemId: itemId,
                    isInstant: false
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            if(res.data.result === "success") {
                setWinnerId(res.data.winnerId);
                setIsFinished(true);
                setShowConfirmModal(false);
                Toast.show({
                    ...toastOptions,
                    type: 'success',
                    text1: "낙찰이 완료되었습니다."
                });
            }
        }catch (error) {
            console.log(error.data);
            Toast.show({
                ...toastOptions,
                type: 'error',
                text1: "낙찰에 실패했습니다."
            });
        }
    }

    return (
        <SafeTopWrapper>
            <View style={styles.container}>
                {/* 상단 - 경매 물품 정보 */}
                <View style={styles.itemHeader}>
                    <Image source={{ uri: item?.images?.[0].url }} style={styles.image} />
                    <View style={styles.itemInfo}>
                        <Text style={styles.title}>{item?.title}</Text>
                        <View style={styles.priceGroup}>
                            <Text style={styles.price}>시작가: {item?.startPrice?.toLocaleString()}원</Text>
                            <Text style={styles.price}>최고 입찰가: {item?.currentPrice?.toLocaleString()}원</Text>
                        </View>
                    </View>

                    {/* 👉 입찰자 수 표시 영역 */}
                    <View style={styles.bidCountWrapper}>
                        <Text style={styles.bidCountCombined}>
                            입찰자 수 : <Text style={styles.bidCountText}>{bids.length}명</Text>
                        </Text>
                        <Text style={styles.deadlineText}>
                            {isFinished ? '낙찰 완료' : `마감 ${remainingText}`}
                        </Text>
                    </View>
                </View>

                {/* 입찰자 목록 */}
                <View style={styles.scrollArea}>
                    <FlatList
                        data={bids}
                        keyExtractor={(bid) => bid.userId.toString()} // 또는 bid.id 있으면 bid.id.toString()
                        contentContainerStyle={styles.bidderList}
                        ListHeaderComponent={() => (
                            <View style={styles.headerRow}>
                                <Text style={[styles.headerText, { flex: 2, textAlign: 'left' }]}>닉네임</Text>
                                <Text style={[styles.headerText, { flex: 1, textAlign: 'right' }]}>입찰가</Text>
                                <Text style={[styles.headerText, { flex: 2, textAlign: 'right' }]}>입찰시간</Text>
                            </View>
                        )}
                        renderItem={({ item }) => (
                            <View style={[
                                styles.bidderRow,
                                item.userId === winnerId && styles.winnerHighlight
                            ]}>
                                <Text style={styles.nickname}>{item.nickname}</Text>
                                <Text style={styles.bidPrice}>{item.bidPrice.toLocaleString()}원</Text>
                                <Text style={styles.time}>{formatDateTime(item.createdAt)}</Text>
                            </View>
                        )}
                    />
                </View>

                {/* 낙찰 버튼 */}
                <TouchableOpacity style={styles.button} onPress={onSelectWinner}>
                    <Text style={styles.buttonText}>낙찰하기</Text>
                </TouchableOpacity>

                {/* 로딩 스피너 */}
                {loading && (
                    <View style={styles.spinnerWrapper}>
                        <ActivityIndicator size="large" color="#6495ED" />
                    </View>
                )}
            </View>

            <Modal
                transparent
                animationType="fade"
                visible={showConfirmModal}
                onRequestClose={() => setShowConfirmModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalText}>
                            아직 마감 시간이 남아있습니다.{"\n"}
                            현재 최고가로 낙찰을 진행할까요?
                        </Text>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setShowConfirmModal(false)} style={styles.modalCancel}>
                                <Text style={{ color: '#666' }}>취소</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleConfirm} style={styles.modalConfirm}>
                                <Text style={{ color: 'white' }}>진행</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeTopWrapper>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    itemHeader: { flexDirection: 'row', padding: 16, borderBottomWidth: 1.5, borderColor: '#ddd' },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        // marginTop: 10
    },
    itemInfo: { marginLeft: 12, justifyContent: 'center', flex: 1 },
    priceGroup: {
        marginTop: 12, // ✅ 가격 줄만 내려줌
    },
    title: { fontSize: 16, fontWeight: 'bold' },
    price: { color: '#888', marginTop: 4 },
    bidCountWrapper: {
        marginLeft: 'auto',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },
    bidCountCombined: {
        fontSize: 13,
        color: '#666',
    },
    bidCountText: {
        color: '#6495ED',
        fontWeight: 'bold',
    },
    deadlineText: {
        color: '#999',
        fontSize: 12,
        marginTop: 4,
    },
    scrollArea: {
        flex: 1,
        // paddingHorizontal: 12,
    },
    bidderList: { padding: 16 },
    headerRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 4, // 👉 bidderRow와 맞추기 위해 추가

    },
    headerText: {
        fontWeight: 'bold',
        fontSize: 13,
        color: '#666',
    },
    bidderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
        paddingVertical: 15,
        paddingHorizontal: 4, // headerRow와 동일하게
        borderRadius: 8,
    },
    nickname: {
        fontWeight: '600',
        color: '#333',
        flex: 2,
        textAlign: 'left',
    },
    bidPrice: {
        color: '#6495ED',
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'right',
    },
    time: {
        color: '#888',
        fontSize: 12,
        flex: 2,
        textAlign: 'right',
    },
    button: {
        backgroundColor: '#6495ED',
        paddingVertical: 12,
        alignItems: 'center',
        margin: 16,
        borderRadius: 10,
        shadowColor: '#6495ED',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,
        marginBottom: 36
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    winnerHighlight: {
        backgroundColor: '#e0f0ff', // 연한 파란색
        // borderWidth: 1,
        // borderColor: '#6495ED',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 12,
        width: '80%',
        alignItems: 'center',
    },
    modalText: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalCancel: {
        flex: 1,
        paddingVertical: 10,
        marginRight: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        alignItems: 'center',
    },
    modalConfirm: {
        flex: 1,
        paddingVertical: 10,
        marginLeft: 8,
        backgroundColor: '#6495ED',
        borderRadius: 8,
        alignItems: 'center',
    },
});

export default BidderListPage;
