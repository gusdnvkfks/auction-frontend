import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import SafeTopWrapper from '../../components/SafeTopWrapper'; // ← ✅ 경로 확인

const reportReasons = [
    '거래 금지 물품이에요',
    '전문판매업자 같아요',
    '사기인 것 같아요',
    '대리 결제/구매/판매 행위를 해요',
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
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="angle-left" size={28} color={'#333'} />
                </TouchableOpacity>

                <Text style={styles.title}>게시글 신고 사유를 선택해주세요.</Text>

                {reportReasons.map((reason, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.reasonButton}
                    onPress={() => handleSelectReason(reason)}
                >
                    <Text style={styles.reasonText}>{reason}</Text>
                </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeTopWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    backButton: {
        zIndex: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 10,
        marginBottom: 10,
    },
    reasonButton: {
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    reasonText: {
        fontSize: 16,
    },
});

export default ReportReasonPage;
