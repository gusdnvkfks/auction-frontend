// src/pages/main/HomePage.js

import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, TextInput } from 'react-native';
import AuctionItem from '../../components/AuctionItem';
import Icon from 'react-native-vector-icons/FontAwesome';
import FloatingButton from '../../components/FloatingButton';
import { useNavigation } from '@react-navigation/native';

const HEADER_HEIGHT = 48;  // 원하는 고정 높이
const dummyData = [
    {
        id: 1,
        title: '휴대폰 올려 봅니다. 희망가로 입찰해주세요. 편하게 가격 제시해주세요.',
        bidCount: 3,
        likeCount: 3,
        startPrice: 10000,
        stepPrice: 1000,
        currentPrice: 13000,
    },
    {
        id: 2,
        title: '안먹는 콜라 대량으로 올립니다. 유통기한 많이 남아있어요.',
        bidCount: 3,
        likeCount: 3,
        startPrice: 10000,
        stepPrice: 1000,
        currentPrice: 13000,
    },
    {
        id: 3,
        title: '안먹는 콜라 대량으로 올립니다. 유통기한 많이 남아있어요.',
        bidCount: 3,
        likeCount: 3,
        startPrice: 10000,
        stepPrice: 1000,
        currentPrice: 13000,
    },
    {
        id: 4,
        title: '안먹는 콜라 대량으로 올립니다. 유통기한 많이 남아있어요.',
        bidCount: 3,
        likeCount: 3,
        startPrice: 10000,
        stepPrice: 1000,
        currentPrice: 13000,
    },
    {
        id: 5,
        title: '안먹는 콜라 대량으로 올립니다. 유통기한 많이 남아있어요.',
        bidCount: 3,
        likeCount: 3,
        startPrice: 10000,
        stepPrice: 1000,
        currentPrice: 13000,
    },
    {
        id: 6,
        title: '안먹는 콜라 대량으로 올립니다. 유통기한 많이 남아있어요.',
        bidCount: 3,
        likeCount: 3,
        startPrice: 10000,
        stepPrice: 1000,
        currentPrice: 13000,
    },
    {
        id: 7,
        title: '안먹는 콜라 대량으로 올립니다. 유통기한 많이 남아있어요.',
        bidCount: 3,
        likeCount: 3,
        startPrice: 10000,
        stepPrice: 1000,
        currentPrice: 13000,
    },
    {
        id: 8,
        title: '안먹는 콜라 대량으로 올립니다. 유통기한 많이 남아있어요.',
        bidCount: 3,
        likeCount: 3,
        startPrice: 10000,
        stepPrice: 1000,
        currentPrice: 13000,
    },
    {
        id: 9,
        title: '안먹는 콜라 대량으로 올립니다. 유통기한 많이 남아있어요.',
        bidCount: 3,
        likeCount: 3,
        startPrice: 10000,
        stepPrice: 1000,
        currentPrice: 13000,
    },
];

const HomePage = () => {
    const [searchKeyword, setSearchKeyword] = useState('');
    const navigation = useNavigation();

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.searchBox}>
                <Icon name="search" size={18} color="#888" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="검색어를 입력하세요"
                    value={searchKeyword}
                    onChangeText={setSearchKeyword}
                />
            </View>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {dummyData.map((item, index) => (
                    <View key={item.id} style={index === 0 ? { marginTop: 4 } : null}>
                        <AuctionItem
                            title={item.title}
                            bidCount={item.bidCount}
                            likeCount={item.likeCount}
                            startPrice={item.startPrice}
                            stepPrice={item.stepPrice}
                            currentPrice={item.currentPrice}
                            image={require('../../assets/images/no-image.png')}  // 기본 이미지
                        />
                    </View>
                ))}
            </ScrollView>

            {/* 고정 등록 버튼 */}
            <FloatingButton onPress={() => navigation.navigate('ItemUpload')}></FloatingButton>
        </View>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        padding: 12,
        paddingTop: HEADER_HEIGHT,
    },
    searchBox: {
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
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 40,
    },
});

export default HomePage;
