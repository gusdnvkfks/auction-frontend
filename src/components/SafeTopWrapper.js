import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * SafeTopWrapper
 * - 상단 노치/StatusBar 영역을 자동으로 패딩 처리해주는 래퍼
 * - 스타일은 props.style 로 전달 가능
 */
const SafeTopWrapper = ({ children, style }) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.wrapper, { paddingTop: insets.top }, style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
    },
});

export default SafeTopWrapper;
