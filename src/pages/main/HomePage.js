// src/pages/main/HomePage.js

import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Text, Modal, TouchableWithoutFeedback, Pressable, StyleSheet, View, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import AuctionItem from '../../components/AuctionItem';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import FloatingButton from '../../components/FloatingButton';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import axios from 'axios';
import Config from 'react-native-config';
import { AuthContext } from '../../contexts/AuthContext';
import { ItemUploadContext } from '../../contexts/ItemUploadProvider';

import Toast from 'react-native-toast-message';

const HomePage = () => {
    const toastOptions = {
        position: 'bottom',
        bottomOffset: 120,
        visibilityTime: 2000,
    };

    const {
        setTitle,
        setDescription,
        setStartPrice,
        setImages,
        setMainCategoryId,
        setSubCategoryId,
        setSelectedCategory,
        setAuctionOption,
        resetForm
    } = useContext(ItemUploadContext);

    const apiUrl = Config.API_URL;
    const route = useRoute();
    const navigation = useNavigation();
    const { token } = useContext(AuthContext);

    const [searchKeyword, setSearchKeyword] = useState(route.params?.searchKeyword || '');

    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [cursor, setCursor] = useState(null);

    // **드래프트 모달 상태추가**
    const [draftModalVisible, setDraftModalVisible] = useState(false);
    const [draftItem, setDraftItem] = useState(null);

    useFocusEffect(
        useCallback(() => {
            reset();
        }, [searchKeyword])
    );

    const reset = () => {
        setItems([]);
        setCursor(null);
        setHasMore(true);
        setLoading(false);

        if(page !== 1) {
            setPage(prev => {
                // page가 1인 상태에서 또 reset된 경우 → 직접 getItemList 호출 (중복 방지 핵심)
                getItemList();
                return prev;
            });
        } else {
            setPage(1);
        }
    };

    useEffect(() => {
        getItemList();
    }, [page]);

    const getItemList = async () => {
        // 더 불러올게 있는 지 확인
        if(loading || !hasMore) {
            return;
        }

        // 로딩 true로 세팅하기기
        setLoading(true);
        try {
            const res = await axios.get(`${apiUrl}/api/item`, {
                params: { 
                    page,
                    searchKeyword,
                    ...(cursor ? { cursor } : {}),
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            },);

            if(res.data.result == "success") {
                const newItems = res.data.items;  // 응답 구조에 따라 수정
                setItems(prev => {
                    const merged = [...prev, ...newItems];
                    const uniqueItems = Array.from(new Map(merged.map(i => [i.id, i])).values());
                    return uniqueItems;
                });

                setCursor(res.data.nextCursor);

                if(newItems.length < 10) {
                    // newItems가 10개 보다 작으면 매번 10개씩 불러오니까 더 불러올 데이터가 없다는거
                    setHasMore(false);
                }
            }
        } catch (err) {
            // console.log(err);
        } finally {
            setLoading(false);
        }
    }

    const handleLoadMore = () => {
        if(!loading && hasMore) {
            setPage(prev => prev + 1);
        }
    }

    const renderItem = ({ item, index }) => {
        return (
            <View key={item.id} style={index === 0 ? { marginTop: 4 } : null}>
                <AuctionItem
                    title={item.title}
                    bidCount={item._count.bids}
                    likeCount={item._count.favorites}
                    startPrice={item.startPrice}
                    stepPrice={item.stepPrice}
                    currentPrice={item.currentPrice}
                    image={item.images[0]?.url
                        ? { uri: item.images[0].url }
                        : require('../../assets/images/no-image.png')}
                    onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
                />
            </View>
        );
    }

    const goItemUpload = async () => {
        if(token) {
            // 임시저장 중인게 있는지 확인하기
            try {
                const res = await axios.get(`${apiUrl}/api/item/temp`,
                    {
                        params: { 
                        },
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        }
                    }
                );
    
                if(res.data.result === "success") {
                    if(res.data.item) {
                        // 임시저장된 경매물품 데이터가 있으면
                        // 뭐 쓸지 정해야됨
                        // 모달창 띄워주기
                        setDraftItem(res.data.item);
                        setDraftModalVisible(true);
                    }else {
                        // 없으면 그냥 업로드
                        navigation.navigate('ItemUpload')
                    }
                }
            } catch (error) {
                console.log(error.response);
                if(error.response.data.error === "REFRESH_EXPIRED") {
                    await AsyncStorage.multiRemove(['accessToken','refreshToken']);
                    navigation.reset({ index:0, routes:[{name:'Landing'}] });
                }
            }
        }else {
            Toast.show({ ...toastOptions, type: 'error', text1: '로그인이 필요합니다.' });
            navigation.navigate('Login');
        }
    }

    // 모달에서 “이어쓰기”
    const handleContinueDraft = () => {
        setDraftModalVisible(false);
        // draftItem 을 context 등에 세팅한 뒤
        console.log(draftItem);

        setTitle(draftItem.title);
        setDescription(draftItem.description);
        setStartPrice(draftItem.startPrice.toString());
        setImages(draftItem.images.map(img => ({
            uri: img.url,
            fileName: img.url.split('/').pop(),
            type: 'image/jpeg',
        })));
        setMainCategoryId(draftItem.mainCategoryId);
        setSubCategoryId(draftItem.subCategoryId);
        setSelectedCategory(`${draftItem.mainCategoryName} > ${draftItem.subCategoryName}`);
        setAuctionOption({
            productState: draftItem.productState,
            endOption: draftItem.endOption,
            bidUnit: draftItem.bidUnit?.toString() || '',
            buyNowPrice: draftItem.buyNowPrice?.toString() || '',
            endDate: draftItem.endTime,
        });

        navigation.navigate("ItemEdit", {
            itemId: draftItem.id,
        });
    };

    // 모달에서 “새로작성”
    const handleNewDraft = () => {
        setDraftModalVisible(false);
        // 서버에 남은 임시저장 지우고(선택사항), 
        navigation.navigate('ItemUpload');
    };

    const handleClear = () => {
        setItems([]);
        setHasMore(true);
        setCursor(null);
        setSearchKeyword(''); // ✅ 이 한 줄이 핵심
    };

    return (
        <View style={{ flex: 1 }}>
            {/* 헤더영역 */}
            <View style={styles.headerContainer}>
                <View style={{ flex: 1 }} />
                <View style={styles.iconContainer}>
                    <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                        <MIcon name="magnify" size={26} color="#000" style={styles.icon} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
                        <MIcon name="bell-outline" size={26} color="#000" style={styles.icon} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
                        <MIcon name="menu" size={26} color="#000" style={styles.icon} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* 경매 물품 영역 */}
            <FlatList 
                contentContainerStyle={
                    items.length === 0 
                    ? [styles.scrollContent, styles.noItemContent] 
                    : styles.scrollContent
                }
                data={items}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.2}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Image
                            source={require('../../assets/images/logo.png')} // 여기에 네 로고 경로
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.emptyText}>진행중인 경매 물품이 없습니다.</Text>
                    </View>
                }
            />

            {/* 고정 등록 버튼 */}
            <FloatingButton onPress={goItemUpload}></FloatingButton>

            {loading && (
                <View style={styles.spinnerWrapper}>
                    <ActivityIndicator size="large" color="#6495ED" />
                </View>
            )}

            <Modal
                visible={draftModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setDraftModalVisible(false)}
            >
                {/* 바깥 눌렀을 때 닫기 */}
                <TouchableWithoutFeedback onPress={() => setDraftModalVisible(false)}>
                    <View style={modalStyles.backdrop}>
                        {/* 내부 영역 터치 막기 */}
                        <TouchableWithoutFeedback>
                        <View style={modalStyles.modalBox}>
                            <Text style={modalStyles.title}>
                                작성중이던 경매 물품이 있습니다.
                            </Text>
                            <Text style={modalStyles.message}>
                                이어 작성하시겠습니까? {'\n'}새로 작성 시 작성중이던 글은 삭제됩니다.
                            </Text>
            
                            <View style={modalStyles.buttonRow}>
                                <Pressable
                                    style={modalStyles.button}
                                    onPress={handleContinueDraft}
                                >
                                    <Text style={modalStyles.buttonText}>이어쓰기</Text>
                                </Pressable>
                                <Pressable
                                    style={modalStyles.button}
                                    onPress={handleNewDraft}
                                >
                                    <Text style={modalStyles.buttonText}>새로작성</Text>
                                </Pressable>
                            </View>
                        </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const HEADER_HEIGHT = 48;  // 원하는 고정 높이

const styles = StyleSheet.create({
    headerContainer: {
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    iconContainer: {
        flexDirection: 'row',
    },
    icon: {
        marginLeft: 16,
    },
    scrollContent: {
        padding: 12,
    },
    noItemContent: {
        paddingTop: 0,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 200,
    },
    logo: {
        width: 140,
        height: 140,
        marginBottom: 16,
        opacity: 0.7,
    },
    emptyText: {
        color: '#888',
        fontSize: 18,
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

    scrollContent: {
        padding: 12,
    },
    noItemContent: {
        paddingTop: 0,  // 원하는 위치로 조정
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchTouchable: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        margin: 10,
        backgroundColor: '#fff',
        zIndex: 1,
        height: 40,
        flex: 1,
    },
    clearBtn: {
        paddingLeft: 5,
        zIndex: 2,
    },
    searchIcon: {
        marginRight: 8,
    },
    categoryWrapper: {
        paddingVertical: 12,
        paddingHorizontal: 10
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#f2f2f2',
        marginRight: 7,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    selectedCategoryButton: {
        backgroundColor: '#6495ED',
        borderColor: '#6495ED',
    },
    categoryText: {
        fontSize: 10,
        color: '#333',
    },
    selectedCategoryText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    fakeInput: {
        color: '#888',
        fontSize: 15,
        flex: 1,
        lineHeight: 20,              // ✅ 텍스트 정렬 안정화
        textAlignVertical: 'center'  // ✅ 일부 안드로이드에서 유효
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 200,  // 상단 바 + 검색창 고려해서 약간 내려줌
    },
    logo: {
        width: 140,
        height: 140,
        marginBottom: 16,
        opacity: 0.7,
    },
    emptyText: {
        color: '#888',
        fontSize: 18,
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

const modalStyles = StyleSheet.create({
    backdrop: {
        flex:1, backgroundColor:'rgba(0,0,0,0.4)',
        justifyContent:'center', alignItems:'center'
    },
    modalBox: {
        width:'80%', backgroundColor:'#fff', borderRadius:8,
        padding:20, alignItems:'center'
    },
    title: {
        fontSize:14, fontWeight:'bold', marginBottom:8
    },
    message: {
        fontSize:12, color:'#555', marginBottom:20, textAlign:'center'
    },
    buttonRow: {
        flexDirection:'row', justifyContent:'space-between', width:'100%'
    },
    button: {
        flex:1, paddingVertical:10, marginHorizontal:5,
        backgroundColor:'#6495ED', borderRadius:4,
        alignItems:'center'
    },
    buttonText: {
        color:'#fff', fontSize:14, fontWeight:'600'
    },
});

export default HomePage;
