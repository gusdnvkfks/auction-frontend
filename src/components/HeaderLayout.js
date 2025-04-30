import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const HEADER_HEIGHT = 48;  // 원하는 고정 높이

const HeaderLayout = ({ navigation, children }) => {
    return (
        <View style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
        </View>
        <View style={styles.content}>
            {children}
        </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        height: HEADER_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
    },
    backButton: {
        width: 32,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    content: {
        flex: 1,
        marginTop: 0,  // 이미 header가 별도 View라 추가 마진 불필요
    },
});


export default HeaderLayout