// CategoryItemPage.js
import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    Modal,
    ScrollView,
    Image
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import Config from 'react-native-config';
import SafeTopWrapper from '../../components/SafeTopWrapper';
import AuctionItem from '../../components/AuctionItem';
import { AuthContext } from '../../contexts/AuthContext';

import LeftAngleIcon from '../../assets/images/common/left-angle.svg';

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
    const [selectedSubCategoryName, setSelectedSubCategoryName] = useState('');
    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState('');

    const [modalVisible, setModalVisible] = useState(false);
    const [isViewingMainCategory, setIsViewingMainCategory] = useState(false);
    const [mainCategories, setMainCategories] = useState([]);
    const [mainCategoriesLoaded, setMainCategoriesLoaded] = useState(false);
    const [tempMainCategoryId, setTempMainCategoryId] = useState(null);
    const [tempMainCategoryName, setTempMainCategoryName] = useState('');

    useEffect(() => {
        fetchSubCategories(mainCategoryId);
    }, []);

    useEffect(() => {
        setProducts([]);
        setHasMore(true);
        setCursor(null);
    }, [selectedSubCategoryId, searchKeyword]);

    useEffect(() => {
        if (cursor === null && hasMore && !loading) {
            fetchProducts();
        }
    }, [cursor, hasMore, loading]);

    const fetchProducts = async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            const params = {
                mainCategoryId,
                ...(selectedSubCategoryId ? { subCategoryId: selectedSubCategoryId } : {}),
                ...(searchKeyword ? { searchKeyword } : {}),
            };
            if (cursor !== null) params.cursor = cursor;

            const res = await axios.get(`${apiUrl}/api/item`, {
                headers: { Authorization: `Bearer ${token}` },
                params,
            });

            if (res.data.result === 'success') {
                const newItems = res.data.items;
                setProducts(prev => Array.from(new Map([...prev, ...newItems].map(i => [i.id, i])).values()));
                setCursor(res.data.nextCursor);
                if (!res.data.nextCursor || newItems.length === 0) setHasMore(false);
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

    const handleLoadMore = () => {
        if (!loading && hasMore && cursor) {
            fetchProducts();
        }
    };

    return (
        <SafeTopWrapper style={{ flex: 1 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <LeftAngleIcon width={24} height={24} fill={'#333'} />
                </TouchableOpacity>
                <Text style={{ color: "#333" }}>
                    {mainCategoryName}
                    {selectedSubCategoryName && selectedSubCategoryName !== '전체보기' && ` > ${selectedSubCategoryName}`}
                </Text>
                <TouchableOpacity onPress={async () => {
                    if (!mainCategoriesLoaded) {
                        await fetchMainCategories();
                        setMainCategoriesLoaded(true);
                    }
                    if (mainCategoryId) {
                        setTempMainCategoryId(mainCategoryId);
                        setTempMainCategoryName(mainCategoryName);
                        await fetchSubCategories(mainCategoryId);
                        setIsViewingMainCategory(false);
                    } else {
                        setIsViewingMainCategory(true);
                    }
                    setModalVisible(true);
                }}>
                    <FeatherIcon name="menu" size={24} color={"#333"} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={products}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <AuctionItem
                        title={item.title}
                        image={item.images[0]?.url ? { uri: item.images[0].url } : require('../../assets/images/no-image.png')}
                        currentPrice={item.currentPrice}
                        onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
                    />
                )}
                contentContainerStyle={{ padding: 12 }}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.2}
                ListFooterComponent={loading && <ActivityIndicator size="large" color="#6495ED" style={{ marginVertical: 20 }} />}
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

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.fixedBottomModal}>
                        <View style={styles.modalHeader}>
                            {isViewingMainCategory ? <View /> : (
                                <TouchableOpacity onPress={() => setIsViewingMainCategory(true)}>
                                    <Icon name="angle-left" size={24} />
                                </TouchableOpacity>
                            )}
                            <Text style={styles.modalTitle}>{isViewingMainCategory ? '카테고리' : tempMainCategoryName}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <FeatherIcon name="x" size={22} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            {(isViewingMainCategory ? mainCategories : [{ id: null, name: "전체보기" }, ...subCategories]).map((cat) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={styles.modalListItem}
                                    onPress={async () => {
                                        if (isViewingMainCategory) {
                                            setTempMainCategoryId(cat.id);
                                            setTempMainCategoryName(cat.name);
                                            await fetchSubCategories(cat.id);
                                            setIsViewingMainCategory(false);
                                        } else {
                                            setMainCategoryId(tempMainCategoryId);
                                            setMainCategoryName(tempMainCategoryName);
                                            setSelectedSubCategoryId(cat.id);
                                            setSelectedSubCategoryName(cat.name);
                                            setModalVisible(false);
                                        }
                                    }}
                                >
                                    <Text>{cat.name}</Text>
                                    <FeatherIcon name="chevron-right" size={20} color="#888" />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
    },
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
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111',
    },
    modalListItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
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
});

export default CategoryItemPage;
