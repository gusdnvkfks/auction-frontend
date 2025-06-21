import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const CloseHeader = ({ title, onPressLeft, onPressRight, RightComponent, LeftComponent }) => {
    
    return (
        <View style={styles.header}>
            <TouchableOpacity style={styles.headerLeft} onPress={onPressLeft}>
                {LeftComponent}
            </TouchableOpacity>

            <Text style={styles.headerTitle}>{title}</Text>

            <TouchableOpacity style={styles.headerRight} onPress={onPressRight}>
                {RightComponent}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
        paddingHorizontal: 15,
    },
    headerTitle: {
        fontSize: 16,
        textAlign: 'center',
        color: "#000",
    },
    headerLeft: {
        position: 'absolute',
        left: 0,
        height: '100%',
        justifyContent: 'center',
    },
    headerRight: {
        position: 'absolute',
        right: 0,
        height: '100%',
        justifyContent: 'center',
    },
});

export default CloseHeader;
