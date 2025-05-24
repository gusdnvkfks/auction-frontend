// src/pages/main/HomePage.js

import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, View, TextInput, Alert, FlatList, TouchableOpacity } from 'react-native';
import AuctionItem from '../../components/AuctionItem';
import Icon from 'react-native-vector-icons/FontAwesome';
import FloatingButton from '../../components/FloatingButton';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import axios from 'axios';
import Config from 'react-native-config';

const HomePage = () => {
    // API URL
    const apiUrl = Config.API_URL;

    const [searchKeyword, setSearchKeyword] = useState('');
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [cursor, setCursor] = useState(null);

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
                    cursor,
                },
                headers: {
                    'Content-Type': 'application/json'
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
            console.log(err);
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
                />
            </View>
        );
    }

    const navigation = useNavigation();

    const goItemUpload = () => {
        const token = AsyncStorage.getItem("accessToken");
        if(token) {
            navigation.navigate('ItemUpload')
        }else {
            Alert.alert("로그인이 필요합니다.");
            navigation.navigate('Login');
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Search')}
                activeOpacity={0.9}
                style={styles.searchTouchable}  // 바깥 마진은 여기서
            >
                {/* <View style={styles.searchBox}> */}
                    <Icon name="search" size={18} color="#888" style={styles.searchIcon} />
                    <Text style={styles.fakeInput}>검색어를 입력하세요</Text>
                {/* </View> */}
            </TouchableOpacity>
            <FlatList contentContainerStyle={styles.scrollContent}
                data={items}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.2}
                ListFooterComponent={loading ? <View style={{ padding: 16 }}><Text>로딩 중...</Text></View> : null}
            />

            {/* 고정 등록 버튼 */}
            <FloatingButton onPress={goItemUpload}></FloatingButton>
        </View>
    );
};

const HEADER_HEIGHT = 48;  // 원하는 고정 높이

const styles = StyleSheet.create({
    scrollContent: {
        padding: 12,
        paddingTop: HEADER_HEIGHT,
    },
    searchTouchable: {
        top: HEADER_HEIGHT,
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
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 40,
    },
    fakeInput: {
        color: '#888',
        fontSize: 15,
        flex: 1,
        lineHeight: 20,              // ✅ 텍스트 정렬 안정화
        textAlignVertical: 'center'  // ✅ 일부 안드로이드에서 유효
    },
});

export default HomePage;
