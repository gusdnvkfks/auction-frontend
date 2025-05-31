import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import SafeTopWrapper from '../../components/SafeTopWrapper';
import AuctionItem from '../../components/AuctionItem';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

import axios from 'axios';
import Config from 'react-native-config';
import { AuthContext } from '../../contexts/AuthContext';

const MySalesHistoryPage = () => {    
    const navigation = useNavigation();
    const { token } = useContext(AuthContext);
    const apiUrl = Config.API_URL;
    
    const [activeTab, setActiveTab] = useState('경매중');
    const [items, setItems] = useState([]);

    const [page, setPage] = useState(1);               // 현재 페이지
    const [hasMore, setHasMore] = useState(true);      // 다음 페이지 여부
    const [isLoading, setIsLoading] = useState(false); // 중복 요청 방지


    const tabs = [
        { label: '경매중', key: '경매중' },
        { label: '낙찰완료', key: '낙찰완료' },
        { label: '판매완료', key: '판매완료' },
    ];

    // tab을 누를때 마다 실행
    useEffect(() => {
        getMyItem(true);
    }, [activeTab]);

    const getMyItem = async (reset = false) => {
        if(isLoading || (!reset && !hasMore)) return;

        setIsLoading(true);
        try {
            const res = await axios.get(`${apiUrl}/api/item/mine`,
                {
                    params: {
                        activeTab: activeTab, // 👈 쿼리스트링으로 붙음: ?activeTab=경매중
                        page: reset ? 1 : page,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    }
                }
            );
            console.log(res.data);
            if(res.data.result === "success") {
                const newItems = res.data.items;

                if (reset) {
                    setItems(newItems);
                    setPage(2); // 초기화 후 다음 페이지 2로 설정
                } else {
                    setItems(prev => [...prev, ...newItems]);
                    setPage(prev => prev + 1);
                }

                setHasMore(newItems.length > 0);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }

    const renderContent = () => {
        if(items.length === 0) {
            var message = "";
            if (activeTab === '경매중') {
                message = '경매중인 물품이 없어요.';
            }else if (activeTab === '낙찰완료') {
                message = '낙찰이 완료된 물품이 없어요.';
            }else if (activeTab === '판매완료') {
                message = '판매가 완료된 물품이 없어요.';
            }
            
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>{message}</Text>
                </View>
            )
        }

        return items.map((item, index) => (
            <View key={item.id} style={index === 0 ? { marginTop: 4 } : null}>
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
        ));
    };

    return (
        <SafeTopWrapper>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name="angle-left" size={28} color={'#333'} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>나의 판매내역</Text>
                    <View style={{ width: 28 }} /> 
                </View>

                {/* 글쓰기 버튼 */}
                <View style={styles.writeButtonWrapper}>
                    {/* <TouchableOpacity style={styles.writeButton}>
                        <Text style={styles.writeButtonText}>글쓰기</Text>
                    </TouchableOpacity> */}
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    {tabs.map(tab => (
                        <TouchableOpacity
                            key={tab.key}
                            style={[styles.tabItem, activeTab === tab.key && styles.activeTab]}
                            onPress={() => setActiveTab(tab.key)}>
                            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <ScrollView
                    onScroll={({ nativeEvent }) => {
                        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                        const distanceFromBottom = contentSize.height - (layoutMeasurement.height + contentOffset.y);
                        if (distanceFromBottom < contentSize.height * 0.1) {
                            getMyItem(); // 다음 페이지 로드
                        }
                    }}
                    scrollEventThrottle={200}
                >
                    {renderContent()}
                </ScrollView>

                {isLoading && (
                    <View style={styles.spinnerWrapper}>
                        <ActivityIndicator size="large" color="#6495ED" />
                    </View>
                )}
            </View>
        </SafeTopWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 12,
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    writeButtonWrapper: {
        paddingHorizontal: 20,
        marginTop: 16,
    },
    writeButton: {
        backgroundColor: '#FCEFE6',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    writeButtonText: {
        color: '#F47C1C',
        fontWeight: '600',
    },
    tabsContainer: {
        flexDirection: 'row',
        marginTop: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tabItem: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    tabText: {
        fontSize: 14,
        color: '#999',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#6495ED',
    },
    activeTabText: {
        color: '#333',
        fontWeight: 'bold',
    },
    emptyContainer: {
        marginTop: 60,
        alignItems: 'center',
    },
    emptyText: {
        color: '#999',
        fontSize: 14,
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

export default MySalesHistoryPage;
