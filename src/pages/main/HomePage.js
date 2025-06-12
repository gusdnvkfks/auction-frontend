// src/pages/main/HomePage.js

import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Text, StyleSheet, View, Alert, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import AuctionItem from '../../components/AuctionItem';
import Icon from 'react-native-vector-icons/FontAwesome';
import FIcon from 'react-native-vector-icons/Feather';
import FloatingButton from '../../components/FloatingButton';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import axios from 'axios';
import Config from 'react-native-config';
import AppText from '../../components/AppText';
import { AuthContext } from '../../contexts/AuthContext';

const HomePage = () => {
    const apiUrl = Config.API_URL;
    const route = useRoute();
    const navigation = useNavigation();
    const { token } = useContext(AuthContext);

    const [searchKeyword, setSearchKeyword] = useState(route.params?.searchKeyword || '');
    const [categories, setCategories] = useState([]);   // 카테고리 목록록
    const [selectedCategory, setSelectedCategory] = useState(0); // 카테고리 선택 상태

    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [cursor, setCursor] = useState(null);

    const categoryData = useMemo(() => [
        { id: 0, name: '전체' },
        ...categories,
        { id: -1, name: '더보기' }
    ], [categories]);

    // 카테고리 호출
    useEffect(() => {
        getCategoryList();
    }, []);

    const getCategoryList = async () => {
        try {
            const res = await axios.get(`${apiUrl}/api/category`, {
                params: {
                    mode: "main"
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if(res.data.result === "success") {
                setCategories(res.data.categories);
            }
        } catch (error) {
            console.log(error);
        }
    }
    
    useEffect(() => {
        getItemList();
    }, [page, selectedCategory]);

    useFocusEffect(
        useCallback(() => {
            setItems([]);
            setPage(1);
            setCursor(null);
            setHasMore(true);
            getItemList();
            setLoading(false);  // 혹시 남아있을 loading 상태 초기화
        }, [searchKeyword, selectedCategory])
    );

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
                    ...(selectedCategory !== 0 ? { categoryId: selectedCategory } : {}),
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

    const goItemUpload = () => {
        const token = AsyncStorage.getItem("accessToken");
        if(token) {
            navigation.navigate('ItemUpload')
        }else {
            Alert.alert("로그인이 필요합니다.");
            navigation.navigate('Login');
        }
    }

    const handleClear = () => {
        setItems([]);
        setHasMore(true);
        setCursor(null);
        setSearchKeyword(''); // ✅ 이 한 줄이 핵심
    };

    const renderCategoryItem = ({ item }) => {
        const selectedCategoryHandle = () => {
            if (item.id === -1) {
                // -1이면 카테고리 목록 페이지로 이동
                navigation.navigate("CategoryPage");
            } else {
                setSelectedCategory(item.id);
            }
        }
        return (
            <TouchableOpacity
                style={[
                    styles.categoryButton,
                    selectedCategory === item.id && styles.selectedCategoryButton
                ]}
                onPress={selectedCategoryHandle}
            >
                <Text style={[
                    styles.categoryText,
                    selectedCategory === item.id && styles.selectedCategoryText
                ]}>
                    {item.name}
                </Text>
            </TouchableOpacity>
        )
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={[
                styles.searchContainer,
                searchKeyword !== ''
                    ? {marginRight: 20}
                    : {}
            ]}>
                <TouchableOpacity
                    onPress={() => navigation.getParent()?.navigate('Search')}
                    activeOpacity={0.9}
                    style={styles.searchTouchable}
                >
                    <Icon name="search" size={18} color="#888" style={styles.searchIcon} />
                    <Text style={styles.fakeInput}>
                        {searchKeyword !== '' ? searchKeyword : '검색어를 입력하세요'}
                    </Text>
                </TouchableOpacity>
                {searchKeyword !== '' && (
                    <TouchableOpacity 
                        onPress={handleClear}
                        style={styles.clearBtn}>
                        <FIcon name="x" size={20} color="#888" />
                    </TouchableOpacity>
                )}
            </View>
            {/* 카테고리 영역 */}
            <View style={styles.categoryWrapper}>
                <FlatList
                    data={categoryData}
                    renderItem={renderCategoryItem}
                    keyExtractor={item => item.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                />
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
                        <AppText style={styles.emptyText}>조건에 맞는 경매 물품이 없습니다.</AppText>
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
        </View>
    );
};

const HEADER_HEIGHT = 48;  // 원하는 고정 높이

const styles = StyleSheet.create({
    scrollContent: {
        padding: 12,
        paddingTop: HEADER_HEIGHT,
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

export default HomePage;
