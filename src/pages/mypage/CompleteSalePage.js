import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import SafeTopWrapper from '../../components/SafeTopWrapper';
import { AuthContext } from '../../contexts/AuthContext';

import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import Config from 'react-native-config';
import Toast from 'react-native-toast-message';

const PRIMARY_COLOR = '#6495ED';

const CompleteSalePage = ({ route, navigation }) => {
    const apiUrl = Config.API_URL;
    const { token } = useContext(AuthContext);

    const { itemId } = route.params;
    const [review, setReview] = useState('');
    const [rating, setRating] = useState(0);
    const [item, setItem] = useState([]);
    const [loading, setLoading] = useState(false);

    const toastOptions = {
        position: 'bottom',
        bottomOffset: 120,
        visibilityTime: 2000,
    };

    useEffect(() => {
        getWinningInfo();
    }, []);

    // 낙찰자 정보 가져오기
    const getWinningInfo = async () => {
        setLoading(true);
        try {
            const res = await axios.post(`${apiUrl}/api/bid/winning-info`,
                {
                    itemId: itemId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    }
                }
            );
            console.log(res.data.item);
            if(res.data.result === "success") {
                setItem(res.data.item);
            }
        }catch (error) {
            console.log(error);
        }finally {
            setLoading(false);
        }
    }

    const handleCompleteSale = async () => {
        // 판매완료 처리 API 호출
        setLoading(true);
        try {
            if(rating === 0) {
                Toast.show({
                    ...toastOptions,
                    type: "error",
                    text1: "별점을 하나 이상 선택해주세요."
                });
                return;
            }
            const res = await axios.post(`${apiUrl}/api/bid/complete-sale`,
                {
                    itemId: itemId,
                    rating: rating,
                    review: review,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    }
                }
            );
            console.log(res);
            if(res.data.result === "success") {
                Toast.show({
                    ...toastOptions,
                    type: "success",
                    text1: "해당 경매 물품이 판매 완료 처리되었습니다."
                });

                navigation.goBack();
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeTopWrapper>
            {/* 헤더 영역 */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="angle-left" size={28} color={'#333'} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>판매 완료</Text>
                <View style={{ width: 30 }} />
            </View>
            <View style={styles.container}>
                <Text style={styles.title}>거래가 완료되었나요?</Text>
                <View style={styles.itemInfoWrapper}>
                    <View style={styles.itemRow}>
                        <Image
                            source={{ uri: item?.images?.[0].url }}
                            style={styles.thumbnail}
                            resizeMode="cover"
                        />
                        <View style={styles.itemTextWrapper}>
                        <Text style={styles.itemTitle} numberOfLines={2}>
                            {item.title}
                        </Text>
                        <Text style={styles.itemPrice}>
                            낙찰가: {item?.currentPrice?.toLocaleString()}원
                        </Text>
                        <Text style={styles.subText}>
                            낙찰자: <Text style={styles.highlight}>{item?.winner?.nickname}</Text>
                        </Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.label}>상대방에게 따뜻한 거래 후기를 남겨주세요.</Text>
                <TextInput
                    placeholder="간단한 후기를 작성해주세요"
                    value={review}
                    onChangeText={setReview}
                    multiline
                    style={styles.textArea}
                />

                <Text style={styles.label}>별점을 선택해주세요.</Text>
                <View style={styles.ratingRow}>
                    {[1, 2, 3, 4, 5].map((num) => (
                        <TouchableOpacity key={num} onPress={() => setRating(num)}>
                            <Icon
                                name={num <= rating ? 'star' : 'star-o'}
                                size={30}
                                color={PRIMARY_COLOR}
                                style={styles.star}
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 판매 완료 버튼 */}
                <View style={styles.fixedButtonWrapper}>
                    <TouchableOpacity style={styles.button} onPress={handleCompleteSale}>
                        <Text style={styles.buttonText}>판매완료</Text>
                    </TouchableOpacity>
                </View>

                {/* 로딩 스피너 */}
                {loading && (
                    <View style={styles.spinnerWrapper}>
                        <ActivityIndicator size="large" color="#6495ED" />
                    </View>
                )}
            </View>
        </SafeTopWrapper>
    );
};

export default CompleteSalePage;

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
        justifyContent: 'space-between',
        paddingTop: 12,
        height: 50,
    },
    backButton: {
        fontSize: 24,
        color: PRIMARY_COLOR,
        width: 30,
        textAlign: 'left'
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333'
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20
    },
    itemInfoWrapper: {
        marginBottom: 20,
        paddingTop: 20
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    thumbnail: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 16,
        backgroundColor: '#f0f0f0',
    },
    itemTextWrapper: {
        flex: 1,
        justifyContent: 'center',
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 6,
        color: '#333',
    },
    itemPrice: {
        fontSize: 14,
        color: '#666',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10
    },
    subText: {
        fontSize: 14,
        color: '#666',
    },
    highlight: {
        color: PRIMARY_COLOR,
        fontWeight: 'bold'
    },
    label: {
        fontSize: 15,
        marginBottom: 8
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        minHeight: 100,
        marginBottom: 20
    },
    ratingRow: {
        flexDirection: 'row',
        marginBottom: 30
    },
    star: {
        marginHorizontal: 4
    },
    button: {
        backgroundColor: '#6495ED',
        paddingVertical: 12,
        alignItems: 'center',
        margin: 16,
        borderRadius: 10,
        shadowColor: '#6495ED',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,
        marginBottom: 36
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    fixedButtonWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        // padding: 16,
        borderTopWidth: 1,
        borderColor: '#eee',
    },
});
