// components/AuctionItem.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const AuctionItem = ({ image, title, bidCount, likeCount, startPrice, stepPrice, currentPrice, onPress }) => {
    const displayStartPrice = typeof startPrice === 'number' ? startPrice.toLocaleString() : '0';
    const displayStepPrice = typeof stepPrice === 'number' ? stepPrice.toLocaleString() : '0';
    const displayCurrentPrice = typeof currentPrice === 'number' ? currentPrice.toLocaleString() : '0';
    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
            <Image source={image} style={styles.image} resizeMode="cover" />
            <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>

                {/* 가격 정보 */}
                <View style={styles.priceRow}>
                    <Text style={styles.priceText}>시작가: {displayStartPrice.toLocaleString()}원</Text>
                    <Text style={styles.priceText}>입찰 단위: {displayStepPrice.toLocaleString()}원</Text>
                    <Text style={styles.priceText}>현재 입찰가: {displayCurrentPrice.toLocaleString()}원</Text>
                </View>

                {/* 하단 아이콘 */}
                <View style={styles.meta}>
                    <Icon name="tags" size={16} color="#6495ED" />
                    <Text style={styles.metaText}>{bidCount}</Text>
                    <Icon name="star" size={16} color="#6495ED" style={{ marginLeft: 10 }} />
                    <Text style={styles.metaText}>{likeCount}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 16,               // 🔼 여백 증가
        marginBottom: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 2,              // Android 그림자
        height: 160
    },
    image: {
        width: 106,
        height: 106,
        backgroundColor:'#ddd',
        borderRadius: 8,
        borderWidth: 1,            // 테두리 두께
        borderColor: '#ccc',       // 테두리 색
    },
    content: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',  // 위아래 공간 분배
    },
    title: {
        fontSize: 14,
        marginBottom: 4
    },
    priceRow: {
        marginTop: 6,
        marginBottom: 6,
    },
    priceText: {
        fontSize: 13,
        color: '#333',
        marginBottom: 3,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',       // → 우측 정렬
    },
    metaText: {
        marginLeft: 4
    },
});

export default AuctionItem;
