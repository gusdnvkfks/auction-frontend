// components/AuctionItem.js
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const AuctionItem = ({ image, title, bidCount, likeCount, startPrice, stepPrice, currentPrice }) => {
    return (
        <View style={styles.container}>
            <Image source={image} style={styles.image} resizeMode="cover" />
            <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>

                {/* 가격 정보 */}
                <View style={styles.priceRow}>
                    <Text style={styles.priceText}>시작가: {startPrice.toLocaleString()}원</Text>
                    <Text style={styles.priceText}>호가: {stepPrice.toLocaleString()}원</Text>
                    <Text style={styles.priceText}>입찰가: {currentPrice.toLocaleString()}원</Text>
                </View>

                {/* 하단 아이콘 */}
                <View style={styles.meta}>
                    <Icon name="gavel" size={16} color="black" />
                    <Text style={styles.metaText}>{bidCount}</Text>
                    <Icon name="heart" size={16} color="black" style={{ marginLeft: 10 }} />
                    <Text style={styles.metaText}>{likeCount}</Text>
                </View>
            </View>
        </View>
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
        width: 96,
        height: 96,
        backgroundColor:'#ddd',
        borderRadius: 8
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
