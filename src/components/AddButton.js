import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import AppText from './AppText';

const AddButton = ({ title, onPress, style }) => {
    return (
        <TouchableOpacity
            style={[styles.button, style]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <AppText style={styles.text}>{title}</AppText>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#6495ED',
        paddingHorizontal: 24,
        minHeight: 44,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default AddButton;