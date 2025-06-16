// src/pages/main/SearchPage.js
import React, { useState, useEffect, useContext } from 'react';
import {
    View, Text, TextInput, StyleSheet, TouchableOpacity,
    FlatList, Keyboard, ActivityIndicator, ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FIcon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Config from 'react-native-config';
import SafeTopWrapper from '../../components/SafeTopWrapper';
import { AuthContext } from '../../contexts/AuthContext';
import CategoryHorizontalList from '../../components/CategoryHorizontalList';

const SearchPage = () => {
    const apiUrl = Config.API_URL;
    const { token } = useContext(AuthContext);

    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [recentSearches, setRecentSearches] = useState([]);

    const [categories, setCategories] = useState([]);

    const navigation = useNavigation();

    useEffect(() => {
        loadRecentSearches();
        loadCategoryList();
    }, []);

    // 최근 검색어 조회
    const loadRecentSearches = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${apiUrl}/api/user/search-history`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.result === 'success') {
                setRecentSearches(res.data.keywords);
            }
        } catch (err) {
            // console.log(err);
        } finally {
            setLoading(false);
        }
    };

    // 카테고리 조회
    const loadCategoryList = async () => {
        try {
            const res = await axios.get(`${apiUrl}/api/category/first/7`, {
                headers: { Authorization: `Bearer ${token}` } 
            });
            
            if(res.data.result === "success") {
                setCategories(res.data.categories);
            }
        }catch(error) {
            console.log(error);
        }
    }

    const handleSearch = async () => {
        if (!keyword.trim()) return;
        if (token) {
            try {
                setLoading(true);
                await axios.post(`${apiUrl}/api/user/search-history`,
                    { keyword: keyword.trim() },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                navigation.reset({
                    index: 0,
                    routes: [{
                        name: 'Main',
                        state: {
                            routes: [{ name: '홈', params: { searchKeyword: keyword } }]
                        }
                    }]
                });
            } catch (err) {
                // console.log(err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSelectKeyword = (keyword) => {
        navigation.reset({
            index: 0,
            routes: [{
                name: 'Main',
                state: {
                    routes: [{ name: '홈', params: { searchKeyword: keyword } }]
                }
            }]
        });
    };

    const handleDeleteKeyword = async (keyword) => {
        const token = await AsyncStorage.getItem('accessToken');
        try {
            setLoading(true);
            await axios.delete(`${apiUrl}/api/user/search-history/${encodeURIComponent(keyword)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRecentSearches(prev => prev.filter(k => k !== keyword));
        } catch (err) {
            // console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const clearAll = async () => {
        const token = await AsyncStorage.getItem('accessToken');
        try {
            setLoading(true);
            await axios.delete(`${apiUrl}/api/user/search-history`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRecentSearches([]);
        } catch (err) {
            // console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.recentItem}>
            <TouchableOpacity onPress={() => handleSelectKeyword(item)} style={styles.recentTextBox}>
                <Icon name="clock-o" size={16} color="#888" style={{ marginRight: 8 }} />
                <Text style={styles.recentKeyword}>{item}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteKeyword(item)}>
                <FIcon name="x" size={16} color="#aaa" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeTopWrapper>
            <View style={styles.container}>
                {/* 상단 검색바 */}
                <View style={styles.searchHeader}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name="angle-left" size={30} color="#000" />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="검색어를 입력하세요"
                        value={keyword}
                        onChangeText={setKeyword}
                        returnKeyType="search"
                        onSubmitEditing={handleSearch}
                        autoFocus
                    />
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.searchBtn}>닫기</Text>
                    </TouchableOpacity>
                </View>

                {/* 🔹 카테고리 미리보기 */}
                <View style={styles.categoryList}>
                    {/* {categories.map((cat, index) => (
                        <TouchableOpacity key={index} style={styles.categoryItem}>
                            <Text style={{ color: '#333' }}>{cat}</Text>
                        </TouchableOpacity>
                    ))} */}
                    <CategoryHorizontalList categories={categories} />
                </View>

                {/* 최근 검색어 */}
                <View style={styles.recentHeader}>
                    <Text style={styles.recentTitle}>최근 검색어</Text>
                    {recentSearches.length > 0 && (
                        <TouchableOpacity onPress={clearAll}>
                            <Text style={styles.clearAll}>전체 삭제</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <FlatList
                    data={recentSearches}
                    keyExtractor={(item, index) => `${item}-${index}`}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingHorizontal: 12 }}
                />
                {loading && (
                    <View style={styles.spinnerWrapper}>
                        <ActivityIndicator size="large" color="#6495ED" />
                    </View>
                )}
            </View>
        </SafeTopWrapper>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    searchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    searchInput: {
        flex: 1,
        marginHorizontal: 15,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 30,
        paddingLeft: 20,
        height: 45,
        backgroundColor: '#f5f5f5',
    },
    searchBtn: { color: '#000', fontSize: 15, fontWeight: '200' },

    // 🔹 카테고리 스타일 추가
    categoryList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    recentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
    },
    recentTitle: { fontSize: 14 },
    clearAll: { fontSize: 12, color: '#888' },
    recentItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 11,
    },
    recentTextBox: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    recentKeyword: {
        color: '#888',
        fontSize: 12,
    },
    spinnerWrapper: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.5)',
        zIndex: 999,
    }
});

export default SearchPage;
