import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Text,
    TextInput,
    FlatList,
    ActivityIndicator,
    Keyboard,
    InteractionManager,
    Alert,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { setAddress } from '../../features/signupSlice';
import SafeTopWrapper from '../../components/SafeTopWrapper';
import AngleHeader from '../../components/AngleHeader';
import Config from 'react-native-config';

// 아이콘
import LeftAngle from '../../assets/images/common/left-angle.svg';
import Target from '../../assets/images/common/target.svg';

const apiUrl = Config.API_URL;
const KAKAO_API_KEY = Config.KAKAO_API_KEY;

const LocationPage = ({ navigation }) => {
    const dispatch = useDispatch();
    const address = useSelector(state => state.signup.address);

    const [searchText, setSearchText] = useState('');
    const [nearbyList, setNearbyList] = useState([]);
    const [liName, setLiName] = useState("");
    const [loading, setLoading] = useState(false);
    const [showSpinner, setShowSpinner] = useState(false);

    const searchDebounce = useRef(null);

    // 스피너 디바운스 처리 (100ms 이상 로딩 시에만 표시)
    useEffect(() => {
        let timer;
        if (loading) {
            timer = setTimeout(() => setShowSpinner(true), 100);
        } else {
            clearTimeout(timer);
            setShowSpinner(false);
        }
        return () => clearTimeout(timer);
    }, [loading]);

    // 초기 진입: 애니메이션 끝난 뒤 권한 확인 & 위치 조회
    useEffect(() => {
        const task = InteractionManager.runAfterInteractions(() => {
            setLoading(true);
            getPositionAndFetch();   // ← await 없이 실행
        });
        return () => task.cancel();
    }, []);

    // 실제 위치 조회 + 카카오 API 호출
    const getPositionAndFetch = () => {
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
                    await fetchNearby(first);
                }
            } catch (err) {
                console.error('Kakao API 에러:', err);
            } finally {
                setLoading(false);
            }
        },
        err => {
            console.error('위치 가져오기 실패:', err);
            Alert.alert('오류', '위치 정보를 가져올 수 없습니다.');
            setLoading(false);
        },
        {
            maximumAge: 300000,
            enableHighAccuracy: false,
            timeout: 10000,
        }
        );
    };

    // 검색어 디바운스
    useEffect(() => {
        if (searchDebounce.current) clearTimeout(searchDebounce.current);
        if (searchText.trim() === '') {
            setNearbyList([]);
            return;
        }
        searchDebounce.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${apiUrl}/api/user/address`, {
                    params: { dong: searchText },
                    headers: { 'Content-Type': 'application/json' },
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
        return () => clearTimeout(searchDebounce.current);
    }, [searchText]);

    const setAddressAndNavigate = data => {
        dispatch(
            setAddress({
                city: data.region_1depth_name,
                gu: data.region_2depth_name,
                dong: data.region_3depth_name,
            })
        );
        navigation.replace('TermsOfUse');
    };

    const fetchNearby = async first => {
        setLoading(true);
        try {
            const res = await axios.get(`${apiUrl}/api/user/address`, {
                params: {
                    sido: first.region_1depth_name,
                    sigungu: first.region_2depth_name,
                    dong: first.region_3depth_name,
                },
                headers: { 'Content-Type': 'application/json' },
            });
            if (res.data.result === 'success') {
                setNearbyList(res.data.addressList);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = () => {
        Keyboard.dismiss();
    };

    const handleSkip = () => {
        dispatch(setAddress({ city: '', gu: '', dong: '' }));
        navigation.replace('TermsOfUse');
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.listItem}
            onPress={() =>
                setAddressAndNavigate({
                    region_1depth_name: item.sidoName,
                    region_2depth_name: item.sigunguName,
                    region_3depth_name: item.dongName,
                })
            }
        >
            <Text style={styles.addressText}>
                {item.sidoName} {item.sigunguName} {item.dongName}
            </Text>
            {item.liName ? (
                <Text style={styles.liText}>
                    {item.liName}
                </Text>
            ) : null}
        </TouchableOpacity>
    );

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
                    onPress={getPositionAndFetch}
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
                    renderItem={renderItem}
                    getItemLayout={(_, index) => ({
                        length: 48,
                        offset: 48 * index,
                        index,
                    })}
                    contentContainerStyle={
                        nearbyList.length === 0 ? { flex: 1, justifyContent: 'center' } : {}
                    }
                    ListEmptyComponent={
                        !loading && (
                        <Text style={styles.placeholderText}>
                            동 이름을 검색하거나, 현재 위치를 눌러주세요.
                        </Text>
                        )
                    }
                />

                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={styles.skipText}>건너뛰기</Text>
                </TouchableOpacity>
            </View>

            {showSpinner && (
                <View style={styles.spinnerWrapper}>
                    <ActivityIndicator size="large" color="#6495ED" />
                </View>
            )}
        </SafeTopWrapper>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    searchContainer: { marginHorizontal: 16, marginTop: 24 },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 13,
        color: '#9E9E9E',
    },
    currentButton: {
        margin: 16,
        backgroundColor: '#6495ed',
        borderRadius: 6,
        paddingVertical: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchInfo: {
        marginHorizontal: 16,
        marginBottom: 8,
        fontSize: 11,
        color: '#000',
    },
    currentButtonInner: { flexDirection: 'row', alignItems: 'center' },
    currentButtonText: { color: '#fff', fontSize: 16 },
    listItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    addressText: { fontSize: 12, color: '#333' },
    liText: { fontSize: 10, color: '#888', marginTop: 2 },
    placeholderText: {
        fontSize: 14,
        color: '#aaa',
        textAlign: 'center',
    },
    skipButton: {
        position: 'absolute',
        bottom: '5%',
        right: 16,
        paddingHorizontal: 12,
    },
    skipText: { fontSize: 14, color: '#9E9E9E' },
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
