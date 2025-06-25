// LocationPage.js

import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Text,
    TextInput,
    Platform,
    FlatList,
    ActivityIndicator,
    Keyboard
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { setAddress } from '../../features/signupSlice';
import SafeTopWrapper from '../../components/SafeTopWrapper';
import AngleHeader from '../../components/AngleHeader';
import Config from 'react-native-config';
import axios from 'axios';

// 아이콘
import LeftAngle from '../../assets/images/common/left-angle.svg';
import Target from '../../assets/images/common/target.svg';

// 위치 권한 요청 함수
const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: '위치 권한 요청',
                message: '앱이 위치를 사용하도록 허용해주세요',
                buttonPositive: '허용',
                buttonNegative: '거부',
                buttonNeutral: '나중에',
            }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
};

const LocationPage = ({ navigation }) => {
    const dispatch = useDispatch();
    const address = useSelector(state => state.signup.address);
    const KAKAO_API_KEY = Config.KAKAO_API_KEY;
    const apiUrl = Config.API_URL;

    const [searchText, setSearchText] = useState('');
    const [nearbyList, setNearbyList] = useState([]);
    const [loading, setLoading] = useState(false);

    // 디바운스 타이머 ref
    const searchDebounce = useRef(null);

    // 검색어가 바뀔 때마다 호출
    useEffect(() => {
        // 기존 타이머가 있으면 취소
        if (searchDebounce.current) {
            clearTimeout(searchDebounce.current);
        }
        // 빈 검색어면 그냥 초기화
        if (searchText.trim() === '') {
            setNearbyList([]);
            return;
        }
        // 디바운스: 300ms 뒤에 API 요청
        searchDebounce.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${apiUrl}/api/user/address`, {
                    params: { dong: searchText },
                    headers: { 'Content-Type': 'application/json' }
                });
                if (res.data.result === 'success') {
                    setNearbyList(res.data.addressList);
                }
            } catch (err) {
                console.error('검색 에러', err);
            } finally {
                setLoading(false);
            }
        }, 300);

        // cleanup
        return () => {
            if (searchDebounce.current) clearTimeout(searchDebounce.current);
        };
    }, [searchText]);

    // 위경도 → 행정동 변환 + 리스트 저장
    const handleCurrentLocation = async () => {
        setSearchText('');
        setLoading(true);

        // 1) 권한 요청
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
            Alert.alert('권한 오류', '위치 권한이 없습니다.');
            setLoading(false);
            return;
        }

        Geolocation.getCurrentPosition(
            async pos => {
                try {
                    const { latitude, longitude } = pos.coords;
                    const res = await axios.get(
                        'https://dapi.kakao.com/v2/local/geo/coord2regioncode.json',
                        {
                            params: { x: longitude, y: latitude },
                            headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
                        }
                    );
                    const docs = res.data.documents;
                    if (docs.length > 0) {
                        const first = docs[0];
                        addressSetting({
                            sido: first.region_1depth_name,
                            sigungu: first.region_2depth_name,
                            dong: first.region_3depth_name,
                        });
                        await getNearbyList(first);
                    }
                } catch (err) {
                    console.error('Kakao API 에러:', err);
                } finally {
                    setLoading(false);
                }
            },
            err => {
                console.error('위치 가져오기 실패:', err);
                setLoading(false);
            },
            {
                maximumAge: 300000,      // 5분 전 위치까지 허용
                enableHighAccuracy: false,
                timeout: 10000,          // 10초 내에 위치 못 받으면 에러
            }
        );
    };
    // 페이지 진입 시 자동 실행
    useEffect(() => {
        setLoading(true);
        handleCurrentLocation();
    }, []);

    // 주소 세팅 (redux + navigation)
    const addressSetting = data => {
        console.log(data);
        // dispatch(
        //     setAddress({
        //         city: data.sido,
        //         gu: data.sigungu,
        //         dong: data.dong,
        //     })
        // );
        // navigation.navigate('TermsOfUse');
    };

    // 조회된 주소로 근처 주소 검색하기
    const getNearbyList = async (first) => {
        setLoading(true);
        try {
            const res = await axios.get(`${apiUrl}/api/user/address`, {
                params: {
                    sido: first.region_1depth_name,
                    sigungu: first.region_2depth_name,
                    dong: first.region_3depth_name,
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if(res.data.result === "success") {
                setNearbyList(res.data.addressList);
            }
        } catch (error) {
            console.log(error.message);
        } finally {
            setLoading(false);
        }
    }

    // 검색 버튼 핸들러
    const handleSearchSubmit = async () => {
        Keyboard.dismiss();

        console.log('검색 실행:', searchText);
        // TODO: 검색 로직 구현
        setLoading(true);
        try {
            const res = await axios.get(`${apiUrl}/api/user/address`, {
                params: {
                    dong: searchText,
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if(res.data.result === "success") {
                setNearbyList(res.data.addressList);
            }
        } catch (error) {
            console.log(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeTopWrapper>
            <View style={styles.container}>
                <AngleHeader
                    title="내 지역 검색"
                    IconComponent={LeftAngle}
                    onPress={() => navigation.goBack()}
                />

                <View style={styles.searchContainer}>
                    <TextInput
                        placeholder="동 이름을 검색하세요. (ex. 반포동)"
                        placeholderTextColor="#aaa"
                        style={styles.searchInput}
                        value={searchText}
                        onChangeText={setSearchText}
                        returnKeyType="search"
                        onSubmitEditing={handleSearchSubmit}
                    />
                </View>

                <TouchableOpacity
                    style={styles.currentButton}
                    onPress={handleCurrentLocation}
                >
                    <View style={styles.currentButtonInner}>
                        <Target width={20} height={20} style={{ marginRight: 6 }} />
                        <Text style={styles.currentButtonText}>현재 내 위치는?</Text>
                    </View>
                </TouchableOpacity>

                {searchText.length > 0 && (
                    <Text style={styles.searchInfo}>
                        {`"${searchText}" 검색 결과`}
                    </Text>
                )}
                <FlatList
                    data={nearbyList}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.listItem}
                            onPress={() =>
                                addressSetting({
                                    sido: item.sido_name,
                                    sigungu: item.sigungu_name,
                                    dong: item.dong_name,
                                })
                            }
                        >
                            <Text style={styles.addressText}>
                                {item.sido_name} {item.sigungu_name}{' '}
                                {item.dong_name}
                            </Text>
                        </TouchableOpacity>
                    )}
                />

                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={() => navigation.navigate('TermsOfUse')}
                >
                    <Text style={styles.skipText}>건너뛰기</Text>
                </TouchableOpacity>
            </View>
            {loading && (
                <View style={styles.spinnerWrapper}>
                    <ActivityIndicator size="large" color="#6495ED" />
                </View>
            )}
        </SafeTopWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    searchContainer: {
        marginHorizontal: 16,
        marginTop: 24,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 13,
        color: '#9E9E9E',
    },
    searchInfo: {
        marginHorizontal: 16,
        marginBottom: 8,
        fontSize: 11,
        color: '#000',
    },
    currentButton: {
        margin: 16,
        backgroundColor: '#6495ed',
        borderRadius: 6,
        paddingVertical: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    currentButtonInner: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    currentButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    mapContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 28,
        color: '#ccc',
        textAlign: 'center',
    },
    listItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    addressText: {
        fontSize: 12,
    },
    skipButton: {
        position: 'absolute',
        bottom: '5%',
        right: 16,
        paddingHorizontal: 12,
    },
    skipText: {
        fontSize: 14,
        color: '#9E9E9E',
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

export default LocationPage;
