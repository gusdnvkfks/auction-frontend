import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const ItemDetailPage = () => {
    return (
        <View style={styles.container}>
            <ScrollView>
                {/* 이미지 영역 */}
                <View style={styles.imagePlaceholder}>
                    <Text style={styles.imageText}>사진들어가는 자리</Text>
                </View>

                {/* 유저 정보 */}
                <View style={styles.userInfo}>
                    <Image
                        // source={require('../../assets/images/no-image.png')} // 대체 이미지 경로
                        // source={require('../../../assets/images/no-image.png')}
                        style={styles.avatar}
                    />
                    <View>
                        <Text style={styles.nickname}>닉네임</Text>
                        <Text style={styles.location}>주안4동</Text>
                    </View>
                </View>

                {/* 제목 + 시간 */}
                <View style={styles.titleBox}>
                    <Text style={styles.title}>맥북 m1 2020년식</Text>
                    <Text style={styles.time}>1시간전</Text>
                </View>

                {/* 내용 */}
                <Text style={styles.description}>
                    맥북 m1 2020년식 올려요. 공장 초기화 해서 드릴거고 배터리 효율 85퍼센트 입니다.
                </Text>

                {/* 거래 희망장소 */}
                <View style={styles.locationBox}>
                    <Text style={styles.label}>거래희망장소</Text>
                    <Text style={styles.place}>주안캐슬앤더샵 에듀포레</Text>
                </View>
            </ScrollView>

            {/* 하단 버튼 */}
            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.likeBtn}>
                    <Icon name="heart-outline" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.bidBtn}>
                    <Text style={styles.bidText}>입찰하기</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ItemDetailPage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    imagePlaceholder: {
        height: 250,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageText: {
        fontSize: 18,
        color: '#777',
    },
    userInfo: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
        backgroundColor: '#ccc',
    },
    nickname: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    location: {
        color: '#777',
        fontSize: 14,
    },
    titleBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    time: {
        fontSize: 13,
        color: '#888',
    },
    description: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        fontSize: 16,
        color: '#333',
    },
    locationBox: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    label: {
        fontSize: 15,
        color: '#666',
        marginBottom: 4,
    },
    place: {
        fontSize: 16,
        fontWeight: '500',
        color: '#444',
    },
    bottomBar: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderColor: '#ddd',
    },
    likeBtn: {
        width: 48,
        height: 48,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    bidBtn: {
        flex: 1,
        backgroundColor: '#4F80FF',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bidText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
