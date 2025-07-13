import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import SafeTopWrapper from '../../components/SafeTopWrapper'; // ← ✅ 경로 확인
import AngleHeader from '../../components/AngleHeader';

import LeftAngle from '../../assets/images/common/left-angle.svg';

const reportReasons = [
    '거래 금지 물품이에요',
    '전문판매업자 같아요',
    '사기인 것 같아요',
    '대리 결제/구매/판매 행위를 해요',
    '낙찰 받았는데 연락이 안돼요',
    '그 외 다른 이유',
];

const ReportReasonPage = ({ route }) => {
    const navigation = useNavigation();
    const { targetId, targetType } = route.params;

    const handleSelectReason = (reason) => {
        console.log(targetType);
        navigation.navigate('ReportConfirm', {
            reason,
            targetId,
            targetType,
        });
    };

    return (
        <SafeTopWrapper>
            <ScrollView style={styles.container}>
                <AngleHeader
                    title="게시글 신고 사유 선택"
                    IconComponent={LeftAngle}
                    onPress={() => navigation.goBack()}
                />

                <View style={styles.list}>
                    {reportReasons.map((reason, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.reasonButton}
                            onPress={() => handleSelectReason(reason)}
                        >
                            <Text style={styles.reasonText}>{reason}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeTopWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    backButton: {
        zIndex: 10,
    },
    list: {
        paddingHorizontal: 16,
    },
    reasonButton: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    reasonText: {
        fontSize: 14,
    },
});

export default ReportReasonPage;
