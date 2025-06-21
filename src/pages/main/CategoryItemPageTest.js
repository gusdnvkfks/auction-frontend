// src/pages/main/CategoryItemPage.js

import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Dimensions, Modal, ScrollView, TouchableWithoutFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import Config from 'react-native-config';
import AppText from '../../components/AppText';
import SafeTopWrapper from '../../components/SafeTopWrapper';
import AuctionItem from '../../components/AuctionItem';
import { AuthContext } from '../../contexts/AuthContext';

const screenWidth = Dimensions.get('window').width;

const CategoryItemPage = ({ navigation, route }) => {
    const apiUrl = Config.API_URL;
    const { token } = useContext(AuthContext);

    const [mainCategoryId, setMainCategoryId] = useState(route.params.mainCategoryId);
    const [mainCategoryName, setMainCategoryName] = useState(route.params.mainCategoryName);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [subCategories, setSubCategories] = useState([]);
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null);
    const [selectedSubCategoryName, setSelectedSubCategoryName] = useState("");
    const [searchKeyword, setSearchKeyword] = useState('');
    // const [page, setPage] = useState(1);
    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    // 모달 보이기 여부
    const [modalVisible, setModalVisible] = useState(false);

    // 모달에 보이는 카테고리가 1차카테고리 인지 여부
    const [isViewingMainCategory, setIsViewingMainCategory] = useState(false);
    // 1차카테고리  목록
    const [mainCategories, setMainCategories] = useState([]);
    const [mainCategoriesLoaded, setMainCategoriesLoaded] = useState(false);

    // 카테고리 다 선택할때까지 임시로 저장해두기
    const [tempMainCategoryId, setTempMainCategoryId] = useState(null);
    const [tempMainCategoryName, setTempMainCategoryName] = useState('');


    useEffect(() => {
        fetchSubCategories(mainCategoryId);
    }, []);

    // 서브카테고리나 키워드가 바뀌면 초기화만 수행 (요청 X)
    useEffect(() => {
        setProducts([]);
        setHasMore(true);
        setLoading(false);

        // cursor를 마지막에 null로 설정 → 이게 변경 트리거가 됨
        setCursor(null);
        fetchProducts();
    }, [selectedSubCategoryId, searchKeyword]);


    // cursor가 null일 때만 fetchProducts 실행 (진짜 트리거는 이거 하나)
    // useEffect(() => {
    //     if (cursor === null && !loading) {
    //         fetchProducts();
    //     }
    // }, [cursor]);

    const fetchProducts = async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            const currentCursor = cursor;
            const params = {
                mainCategoryId,
                ...(selectedSubCategoryId ? { subCategoryId: selectedSubCategoryId } : {}),
                ...(searchKeyword ? { searchKeyword } : {}),
            };
            if (cursor !== null) {
                params.cursor = cursor;
            }
            const res = await axios.get(`${apiUrl}/api/item`, {
                headers: { Authorization: `Bearer ${token}` },
                params,
            });
            console.log('res.data.items.length:', res.data.items.length);
            console.log('res.data.nextCursor:', res.data.nextCursor);
            if (res.data.result === 'success') {
                const newItems = res.data.items;
                setProducts(prev => {
                    const merged = [...prev, ...newItems];
                    const uniqueItems = Array.from(new Map(merged.map(i => [i.id, i])).values());
                    return uniqueItems;
                });
                setCursor(res.data.nextCursor);
                if (!res.data.nextCursor || newItems.length === 0) {
                    setHasMore(false);
                }
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubCategories = async (mainCategoryId) => {
        try {
            const res = await axios.get(`${apiUrl}/api/category/scnd/${mainCategoryId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.result === "success") {
                setSubCategories(res.data.categories);
            }
        } catch (err) {
            console.log("fetchSubCategories error:", err);
        }
    };

    const handleSelectSubCategory = (id, name) => {
        setSelectedSubCategoryId(id);
        setSelectedSubCategoryName(name || '');
    };

    const handleLoadMore = () => {
        if (!loading && hasMore && cursor) {
            fetchProducts();
        }
    };

    const renderItem = ({ item }) => (
        <View style={{ marginBottom: 10 }}>
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

    // 1차카테고리 목록
    const fetchMainCategories = async () => {
        try {
            const res = await axios.get(`${apiUrl}/api/category/first/0`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.result === "success") {
                setMainCategories(res.data.categories);
            }
        } catch (err) {
            console.log("fetchMainCategories error:", err);
        }
    };

    return (
        <SafeTopWrapper style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="angle-left" size={24} color="#000" />
                    </TouchableOpacity>

                    <View style={styles.headerTitleWrapper}>
                        <View style={styles.titleRow}>
                            <Text style={styles.headerTitle}>{mainCategoryName}</Text>
                            {selectedSubCategoryName !== "" && (
                                <>
                                    <Icon name="angle-right" size={16} color="#000" style={{ marginHorizontal: 4 }} />
                                    <Text style={styles.headerTitle}>{selectedSubCategoryName}</Text>
                                </>
                            )}
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.rightMenuButton}
                        onPress={async () => {
                            if (!mainCategoriesLoaded) {
                                await fetchMainCategories();
                                setMainCategoriesLoaded(true);
                            }

                            // 현재 선택된 main, sub 카테고리가 존재하면 → 바로 2차 카테고리 보여주기
                            if (mainCategoryId) {
                                setTempMainCategoryId(mainCategoryId);
                                setTempMainCategoryName(mainCategoryName);
                                await fetchSubCategories(mainCategoryId);
                                setIsViewingMainCategory(false); // 바로 2차 카테고리부터 보기
                            } else {
                                setIsViewingMainCategory(true); // 기본은 1차부터
                            }

                            setModalVisible(true);
                        }}
                    >
                        <FeatherIcon name="menu" size={24} color="#000" />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 12 }}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.2}
                    ListEmptyComponent={
                        !loading && (
                            <View style={styles.emptyContainer}>
                                <AppText style={styles.emptyText}>조건에 맞는 경매 물품이 없습니다.{"\n"}다른 카테고리를 선택해보세요.</AppText>
                            </View>
                        )
                    }
                    ListFooterComponent={
                        loading && (
                            <View style={{ paddingVertical: 20 }}>
                                <ActivityIndicator size="large" color="#6495ED" />
                            </View>
                        )
                    }
                />
            </View>

            {loading && (
                <View style={styles.spinnerWrapper}>
                    <ActivityIndicator size="large" color="#6495ED" />
                </View>
            )}

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.fixedBottomModal}>
                        <View style={styles.modalHeader}>
                            {/* 왼쪽 뒤로가기 */}
                            {isViewingMainCategory ? (
                                <View style={styles.modalHeaderSide} /> // 빈 공간으로 균형 맞춤
                            ) : (
                                <TouchableOpacity
                                    onPress={() => setIsViewingMainCategory(true)}
                                    style={styles.modalHeaderSide}
                                >
                                    <Icon name="angle-left" size={24} color="#000" />
                                </TouchableOpacity>
                            )}

                            {/* 가운데 텍스트 */}
                            <View style={styles.modalHeaderCenter}>
                                <AppText style={styles.modalTitle}>
                                    {isViewingMainCategory ? '카테고리' : tempMainCategoryName}
                                </AppText>
                            </View>

                            {/* 오른쪽 닫기 버튼 */}
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={styles.modalHeaderSide}
                            >
                                <FeatherIcon name="x" size={22} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            {isViewingMainCategory
                                ? mainCategories.map((cat) => {
                                    const isSelected = tempMainCategoryId === cat.id;
                                    return (
                                        <TouchableOpacity
                                            key={cat.id}
                                            style={[
                                                styles.modalListItem,
                                                isSelected && styles.selectedModalItem
                                            ]}
                                            onPress={async () => {
                                                setTempMainCategoryId(cat.id);
                                                setTempMainCategoryName(cat.name);
                                                await fetchSubCategories(cat.id);
                                                setIsViewingMainCategory(false);
                                            }}
                                        >
                                            <Text style={[
                                                styles.modalListText,
                                                isSelected && styles.selectedModalText
                                            ]}>
                                                {cat.name}
                                            </Text>
                                            <FeatherIcon name="chevron-right" size={20} color="#888" />
                                        </TouchableOpacity>
                                    );
                                })
                                : <>
                                    <TouchableOpacity
                                        style={[
                                            styles.modalListItem,
                                            selectedSubCategoryId === null && mainCategoryId === tempMainCategoryId && styles.selectedModalItem
                                        ]}
                                        onPress={() => {
                                            setMainCategoryId(tempMainCategoryId);
                                            setMainCategoryName(tempMainCategoryName);
                                            setSelectedSubCategoryId(null);
                                            setSelectedSubCategoryName("");
                                            setModalVisible(false);
                                        }}
                                    >
                                        <Text style={[
                                            styles.modalListText,
                                            selectedSubCategoryId === null && mainCategoryId === tempMainCategoryId && styles.selectedModalText
                                        ]}>
                                            전체 보기
                                        </Text>
                                        <FeatherIcon name="chevron-right" size={20} color="#888" />
                                    </TouchableOpacity>
                                    {subCategories.map((item) => {
                                        const isSelected = selectedSubCategoryId === item.id && mainCategoryId === tempMainCategoryId;
                                        return (
                                            <TouchableOpacity
                                                key={item.id}
                                                style={[
                                                    styles.modalListItem,
                                                    isSelected && styles.selectedModalItem
                                                ]}
                                                onPress={() => {
                                                    setMainCategoryId(tempMainCategoryId);
                                                    setMainCategoryName(tempMainCategoryName);
                                                    setSelectedSubCategoryId(item.id);
                                                    setSelectedSubCategoryName(item.name);
                                                    setModalVisible(false);
                                                }}
                                            >
                                                <Text
                                                    style={[
                                                        styles.modalListText,
                                                        isSelected && styles.selectedModalText
                                                    ]}
                                                >
                                                    {item.name}
                                                </Text>
                                                <FeatherIcon name="chevron-right" size={20} color={'#888'} />
                                            </TouchableOpacity>
                                        );
                                    })}
                                </>
                            }
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeTopWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
    },
    backButton: { padding: 4, width: 40 },
    headerTitleWrapper: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 16, fontWeight: 'light' },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // 중앙 정렬
    },
    rightMenuButton: { padding: 4, width: 40, alignItems: 'flex-end' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 },
    emptyText: { fontSize: 16, color: '#888', textAlign: 'center' },
    spinnerWrapper: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.5)',
        zIndex: 999,
    },
    bottomSheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    bottomSheetTitle: { fontSize: 16, fontWeight: 'bold' },
    resetButton: { fontSize: 14, color: '#6495ED' },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16 },
    gridItem: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        backgroundColor: '#f2f2f2', margin: 6, borderWidth: 1, borderColor: '#ddd'
    },
    selectedGridItem: { backgroundColor: '#6495ED', borderColor: '#6495ED' },
    gridItemText: { color: '#333' },
    selectedGridItemText: { color: '#fff' },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    fixedBottomModal: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingTop: 20,
        paddingBottom: 30,
        paddingHorizontal: 20,
        maxHeight: '70%',
    },
    modalListItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalListText: {
        fontSize: 12,
        color: '#333',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingHorizontal: 4, // 추가하면 좀 더 균형 잡힘
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111',
        textAlign: 'center',
        flex: 1,
    },
    closeButton: {
        padding: 4,
    },
    selectedModalItem: {
        // backgroundColor: '#6495ED',
        // borderRadius: 8,
        // paddingHorizontal: 10,
    },

    selectedModalText: {
        color: '#6495ED',
        // fontWeight: 'bold',
    },
});

export default CategoryItemPage;
