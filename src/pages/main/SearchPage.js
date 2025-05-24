// src/pages/main/SearchPage.js
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Keyboard
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Config from 'react-native-config';

const SearchPage = () => {
    const apiUrl = Config.API_URL;
    
    const [keyword, setKeyword] = useState('');
    const [recentSearches, setRecentSearches] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        loadRecentSearches();
    }, []);

    const loadRecentSearches = async () => {
        const token = await AsyncStorage.getItem('accessToken');
        try {
            const res = await axios.get(`${apiUrl}/api/user/search-history`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("searchHistory res : ", res.data.keywords);
            
            if (res.data.result === 'success') {
                setRecentSearches(res.data.keywords);
            }
        }catch (err) {
            console.log('최근 검색어 불러오기 실패', err);
        }
    };

    const handleSearch = async () => {
        if(!keyword.trim()) return;
        const token = await AsyncStorage.getItem('accessToken');
        console.log(token);
        if(token) {
            // 토큰이 있을때만 검색 기록 저장장
            try {
                await axios.post(`${Config.API_URL}/api/user/search-history`,
                    { keyword: keyword.trim() },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                navigation.navigate('Home', { searchKeyword: keyword.trim() });
            }catch (err) {
                console.log('검색 기록 저장 실패', err);
            }
        }
    };

    const handleSelectKeyword = (kw) => {
        navigation.navigate('Home', { searchKeyword: kw });
    };

    const handleDeleteKeyword = async (kw) => {
        const token = await AsyncStorage.getItem('accessToken');
        try {
            await axios.delete(`${Config.API_URL}/api/search-history/${encodeURIComponent(kw)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRecentSearches(prev => prev.filter(k => k !== kw));
        }catch (err) {
            console.log('검색어 삭제 실패', err);
        }
    };

    const clearAll = async () => {
        const token = await AsyncStorage.getItem('accessToken');
        try {
            await axios.delete(`${Config.API_URL}/api/search-history`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setRecentSearches([]);
        }catch (err) {
            console.log('전체 삭제 실패', err);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.recentItem}>
            <TouchableOpacity onPress={() => handleSelectKeyword(item)} style={styles.recentTextBox}>
                <Icon name="clock-o" size={16} color="#888" style={{ marginRight: 8 }} />
                <Text>{item}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteKeyword(item)}>
                <Icon name="times" size={16} color="#aaa" />
              </TouchableOpacity>
        </View>
    );

    return (
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
        </View>
    );
};

const HEADER_HEIGHT = 48;  // 원하는 고정 높이

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    searchHeader: {
        marginTop: HEADER_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderColor: '#ddd',
    },
    searchInput: {
        flex: 1,
        marginHorizontal: 12,
        borderBottomWidth: 1,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        paddingLeft: 10,
        height: 40,
    },
    searchBtn: { color: '#6495ED', fontSize: 16 },
    recentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    recentTitle: { fontSize: 16, fontWeight: 'bold' },
    clearAll: { fontSize: 14, color: '#888' },
    recentItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: '#f0f0f0',
    },
    recentTextBox: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
});

export default SearchPage;
