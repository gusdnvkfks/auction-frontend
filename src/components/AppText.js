import React from 'react';
import { Text } from 'react-native';

export default function AppText(props) {
    return (
        <Text
            {...props}
            style={[{ fontFamily: 'Hakgyoansim' }, props.style]}
        >
            {props.children ?? ''}
        </Text>
    );
}
