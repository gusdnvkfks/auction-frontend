// src/pages/mypage/SettingPage.js

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import AngleHeader from '../../components/AngleHeader';

// 아이콘
import LeftAngle from '../../assets/images/common/left-angle.svg';

const SettingPage = ({ navigation }) => {
    return (
        <ScrollView style={styles.container}>
            {/* Title */}
            {/* <View style={styles.headerWrapper}>
                <LeftAngle width={20} height={20} style={styles.leftIcon} />
                <Text style={styles.header}>설정</Text>
            </View> */}
            <AngleHeader
                title="설정"
                IconComponent={LeftAngle}
                onPress={() => navigation.goBack()}
            />

            <View>
                {/* 알림 설정 */}
                
                <Section title="알림 설정">
                    <Item label="알림 수신 설정" />
                    <Item label="방해금지 시간 설정" isSwitch />
                </Section>

                {/* 사용자 설정 */}
                <Section title="사용자 설정">
                    <Item label="계정 / 정보 관리" />
                    <Item label="모아보기 사용자 관리" />
                    <Item label="차단 사용자 관리" />
                    <Item label="게시글 미노출 사용자 관리" />
                    <Item label="동영상 자동 재생 설정" rightText="항상 사용" />
                    <Item label="중고거래 게시글의 동네 변경하기" />
                    <Item label="기타 설정" />
                </Section>

                {/* 기타 */}
                <Section title="기타">
                    <Item label="공지사항" />
                    <Item label="국가 변경" />
                </Section>
            </View>
        </ScrollView>
    );
};

const Section = ({ title, children }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

const Item = ({ label, rightText, isSwitch }) => (
    <TouchableOpacity style={styles.item}>
        <Text style={styles.itemLabel}>{label}</Text>
        {isSwitch ? (
            <Switch value={false} onValueChange={() => {}} />
        ) : (
            rightText && <Text style={styles.rightText}>{rightText}</Text>
        )}
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        flex: 1,
    },
    headerWrapper: {
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    leftIcon: {
        position: 'absolute',
        left: 0,
        top: '50%',
        transform: [{ translateY: -12 }],
        // paddingHorizontal: 20,
    },
    header: {
        fontSize: 20,
        fontWeight: '600',
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
        marginBottom: 10,
    },
    item: {
        paddingVertical: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemLabel: {
        fontSize: 15,
    },
    rightText: {
        color: '#6494ED',
        fontSize: 14,
    },
});

export default SettingPage;
