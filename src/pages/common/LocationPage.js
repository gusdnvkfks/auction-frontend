import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal
} from 'react-native';
import AppText from '../../components/AppText';
import Postcode from '@actbase/react-daum-postcode';
import { useSelector, useDispatch } from 'react-redux';
import { setAddress } from '../../features/signupSlice';

const LocationPage = ({ navigation }) => {
    const dispatch = useDispatch();
    
    // Redux 상태 가져오기
    const address = useSelector(state => state.signup.address);

    const [isModal, setModal] = useState(false);

    const kakaoApiCall = () => {
        setModal(true);
    }

    const addressSetting = (data) => {
        dispatch(setAddress({
            city: data.sido,
            gu: data.sigungu,
            dong: data.bname,
        }));
        
        navigation.replace('TermsOfUse');
        // navigation.replace('Splash', {
        //     nextPage: "SignUp",
        //     text: '회원가입을 위해\n본인인증을 시작합니다.',
        //     storeId: 'store-607080c4-993a-4376-9a62-37a2fdde1a22',
        //     channelKey: 'channel-key-f83a443f-de9b-4516-83ec-e4ef7cb4b953'
        // });
    }

    return (
        <View style={styles.container}>
            {isModal && (
                <Modal animationType="slide">
                    <Postcode
                        style={{ flex: 1, width: '100%', zIndex: 999 }}
                        jsOptions={{ animation: true, hideMapBtn: true }}
                        onSelected={data => {addressSetting(data)}}
                    />
                </Modal>
            )}

            {/* 구분선 */}
            <View style={styles.divider} />

            {/* 현재 위치 찾기 버튼 */}
            <TouchableOpacity
                style={styles.currentButton}
                onPress={kakaoApiCall}
            >
                <AppText style={styles.currentButtonText}>주소 검색하기</AppText>
            </TouchableOpacity>

            {/* 지도 영역 또는 설정 안내 */}
            <View style={styles.mapContainer}>
                {address.city ? (
                    <AppText style={styles.placeholderText}>{address.city} {address.gu}{'\n'}{address.dong}</AppText>
                ) : (
                    <AppText style={styles.placeholderText}>
                        주소를 설정해{'\n'}주세요.
                    </AppText>
                )}
            </View>

            {/* ← 추가: 오른쪽 하단 “건너뛰기” 버튼 */}
            <TouchableOpacity
                style={styles.skipButton}
                onPress={() => navigation.navigate('TermsOfUse')}
                // onPress={() => navigation.navigate('Splash', {
                //     nextPage: "SignUp",
                //     text: '회원가입을 위해\n본인인증을 시작합니다.'
                // })}
            >
                <AppText style={styles.skipText}>건너뛰기</AppText>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        top: 48
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginHorizontal: 16
    },
    currentButton: {
        margin: 16,
        backgroundColor: '#6495ed',
        borderRadius: 6,
        paddingVertical: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    currentButtonText: {
        color: '#fff',
        fontSize: 16
    },
    mapContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    placeholderText: {
        fontSize: 36,
        color: '#ccc',
        textAlign: 'center'
    },
    skipButton: {
        position: 'absolute',
        bottom: 96,       // 화면 하단에서 16pt 위
        right: 16,        // 화면 오른쪽에서 16pt 안쪽
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    skipText: {
        fontSize: 18,
        color: '#6495ED',
    },
});

export default LocationPage;