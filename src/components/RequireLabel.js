import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppText from './AppText';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

export default function RequiredLabel({ children }) {
    return (
        <View style={styles.wrap}>
            <AppText>{children}</AppText>
            <FontAwesome 
                name="asterisk" 
                size={10} 
                color="#6495ED"
                style={styles.icon}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { flexDirection: 'row', alignItems: 'center' },
    icon: { marginLeft: 4 },
});
