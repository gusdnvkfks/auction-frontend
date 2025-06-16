// src/pages/main/CategoryItemPage.js

import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import Config from 'react-native-config';
import AppText from '../../components/AppText';
import SafeTopWrapper from '../../components/SafeTopWrapper';
import AuctionItem from '../../components/AuctionItem';
import { AuthContext } from '../../contexts/AuthContext';
import BottomSheet from '@gorhom/bottom-sheet';

const screenWidth = Dimensions.get('window').width;

const CategoryItemPage = ({ navigation, route }) => {
    const apiUrl = Config.API_URL;
    const { token } = useContext(AuthContext);
    const bottomSheetRef = useRef(null);

    const { mainCategoryId, mainCategoryName } = route.params;

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [subCategories, setSubCategories] = useState([]);
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [page, setPage] = useState(1);
    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        fetchSubCategories();
    }, []);

    useEffect(() => {
        reset();
    }, [selectedSubCategoryId, searchKeyword]);

    useEffect(() => {
        fetchProducts();
    }, [page]);

    const reset = () => {
        setProducts([]);
        setCursor(null);
        setHasMore(true);
        setLoading(false);
        setPage(1);
    };

    const fetchProducts = async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            const res = await axios.get(`${apiUrl}/api/item`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    mainCategoryId,
                    ...(selectedSubCategoryId ? { subCategoryId: selectedSubCategoryId } : {}),
                    ...(searchKeyword ? { searchKeyword } : {}),
                    page,
                    ...(cursor ? { cursor } : {}),
                }
            });
            if (res.data.result === 'success') {
                const newItems = res.data.items;
                setProducts(prev => {
                    const merged = [...prev, ...newItems];
                    const uniqueItems = Array.from(new Map(merged.map(i => [i.id, i])).values());
                    return uniqueItems;
                });
                setCursor(res.data.nextCursor);
                if (newItems.length < 10) setHasMore(false);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubCategories = async () => {
        try {
            const res = await axios.get(`${apiUrl}/api/category/${mainCategoryId}/children`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.result === "success") {
                setSubCategories(res.data.categories);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const handleSelectSubCategory = (id) => {
        setSelectedSubCategoryId(id === selectedSubCategoryId ? null : id);
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1);
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

    return (
        <SafeTopWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="angle-left" size={24} color="#000" />
                </TouchableOpacity>

                <View style={styles.headerTitleWrapper}>
                    <Text style={styles.headerTitle}>{mainCategoryName}</Text>
                </View>

                <TouchableOpacity onPress={() => bottomSheetRef.current?.expand()} style={styles.rightMenuButton}>
                    <FeatherIcon name="menu" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <View style={styles.subCategoryContainer}>
                <FlatList
                    data={subCategories}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.subCategoryBtn,
                                selectedSubCategoryId === item.id && styles.selectedSubCategoryBtn
                            ]}
                            onPress={() => handleSelectSubCategory(item.id)}
                        >
                            <AppText style={[
                                styles.subCategoryText,
                                selectedSubCategoryId === item.id && styles.selectedSubCategoryText
                            ]}>
                                {item.name}
                            </AppText>
                        </TouchableOpacity>
                    )}
                />
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
                            <AppText style={styles.emptyText}>조건에 맞는 경매 물품이 없습니다.</AppText>
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
            {/* 2차 카테고리 바텀시트 */}
            <BottomSheet ref={bottomSheetRef} snapPoints={['40%']} enablePanDownToClose={true}>
                <View style={styles.bottomSheetContent}>
                    <FlatList
                        data={subCategories}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.subCategoryBtn,
                                    selectedSubCategoryId === item.id && styles.selectedSubCategoryBtn
                                ]}
                                onPress={() => handleSelectSubCategory(item.id)}
                            >
                                <AppText style={[
                                    styles.subCategoryText,
                                    selectedSubCategoryId === item.id && styles.selectedSubCategoryText
                                ]}>
                                    {item.name}
                                </AppText>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </BottomSheet>
            {loading && (
                <View style={styles.spinnerWrapper}>
                    <ActivityIndicator size="large" color="#6495ED" />
                </View>
            )}
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
    backButton: {
        padding: 4,
        width: 40,
    },
    headerTitleWrapper: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'light',
    },
    rightMenuButton: {
        padding: 4,
        width: 40,
        alignItems: 'flex-end',
    },
    bottomSheetContent: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff'
    },
    subCategoryContainer: {
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff'
    },
    subCategoryBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#f2f2f2',
        borderRadius: 20,
        marginRight: 10
    },
    selectedSubCategoryBtn: {
        backgroundColor: '#6495ED'
    },
    subCategoryText: { color: '#333', fontSize: 14 },
    selectedSubCategoryText: { color: '#fff' },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#888'
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

export default CategoryItemPage;
