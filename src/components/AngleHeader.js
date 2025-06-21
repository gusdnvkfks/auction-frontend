import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const HEADER_HEIGHT = 48;

const AngleHeader = ({ title = '', IconComponent, onPress }) => {
    return (
        <View style={styles.header}>
            {/* 왼쪽 아이콘 */}
            <TouchableOpacity onPress={onPress} style={styles.leftIcon}>
                {IconComponent ? <IconComponent width={20} height={20} /> : null}
            </TouchableOpacity>

            {/* 중앙 타이틀 */}
            <Text style={styles.title}>{title}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        height: HEADER_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
    },
    leftIcon: {
        position: 'absolute',
        left: 15,
        top: '50%',
        transform: [{ translateY: -10 }],
        padding: 4,
    },
    title: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
});

export default AngleHeader;
