// src/pages/main/SearchPage.js
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Keyboard,
    ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FIcon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Config from 'react-native-config';
import AppText from '../../components/AppText';
import SafeTopWrapper from '../../components/SafeTopWrapper';

const SearchPage = () => {
    const apiUrl = Config.API_URL;
    
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [recentSearches, setRecentSearches] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        loadRecentSearches();
    }, []);

    const loadRecentSearches = async () => {
        const token = await AsyncStorage.getItem('accessToken');
        try {
            setLoading(true); // 🔹 로딩 시작
            const res = await axios.get(`${apiUrl}/api/user/search-history`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.result === 'success') {
                setRecentSearches(res.data.keywords);
            }
        }catch (err) {
            // console.log('최근 검색어 불러오기 실패', err);
        }finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if(!keyword.trim()) return;
        const token = await AsyncStorage.getItem('accessToken');
        if(token) {
            // 토큰이 있을때만 검색 기록 저장장
            try {
                setLoading(true); // 🔹 로딩 시작
                await axios.post(`${apiUrl}/api/user/search-history`,
                    { keyword: keyword.trim() },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                navigation.navigate('Main', {
                    screen: '홈',
                    params: { searchKeyword: keyword }
                });
            }catch (err) {
                // console.log('검색 기록 저장 실패', err);
            }finally {
                setLoading(false);
            }
        }
    };

    const handleSelectKeyword = (keyword) => {
        navigation.navigate('Main', {
            screen: '홈',
            params: { searchKeyword: keyword }
        });
    };

    const handleDeleteKeyword = async (keyword) => {
        const token = await AsyncStorage.getItem('accessToken');
        try {
            setLoading(true); // 🔹 로딩 시작
            await axios.delete(`${apiUrl}/api/user/search-history/${encodeURIComponent(keyword)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRecentSearches(prev => prev.filter(k => k !== keyword));
        }catch (err) {
            // console.log('검색어 삭제 실패', err);
        }finally {
            setLoading(false);
        }
    };

    const clearAll = async () => {
        const token = await AsyncStorage.getItem('accessToken');
        try {
            setLoading(true); // 🔹 로딩 시작
            await axios.delete(`${apiUrl}/api/user/search-history`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setRecentSearches([]);
        }catch (err) {
            // console.log('전체 삭제 실패', err);
        }finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.recentItem}>
            <TouchableOpacity onPress={() => handleSelectKeyword(item)} style={styles.recentTextBox}>
                <Icon name="clock-o" size={16} color="#888" style={{ marginRight: 8 }} />
                <AppText style={styles.recentKeyword}>{item}</AppText>
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
                        <AppText style={styles.searchBtn}>닫기</AppText>
                    </TouchableOpacity>
                </View>

                {/* 최근 검색어 */}
                <View style={styles.recentHeader}>
                    <AppText style={styles.recentTitle}>최근 검색어</AppText>
                    {recentSearches.length > 0 && (
                        <TouchableOpacity onPress={clearAll}>
                            <AppText style={styles.clearAll}>전체 삭제</AppText>
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
        // marginTop: HEADER_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    searchInput: {
        flex: 1,
        marginHorizontal: 15,
        borderBottomWidth: 1,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        paddingLeft: 10,
        height: 45,
        backgroundColor: '#f5f5f5',
    },
    searchBtn: { color: '#6495ED', fontSize: 16 },
    recentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
    },
    recentTitle: { fontSize: 18 },
    clearAll: { fontSize: 14, color: '#888' },
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
        fontSize: 14, // 원하면 크기도 지정
    },
    spinnerWrapper: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.5)', // 살짝 흐리게
        zIndex: 999,
    }
});

export default SearchPage;
