import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const FloatingButton = ({ onPress, icon = 'plus', size = 24 }) => {
  return (
    <TouchableOpacity style={styles.floatingBtn} onPress={onPress}>
      <Icon name={icon} size={size} color="#fff" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingBtn: {
    position: 'absolute',
    right: 30,
    bottom: 60, // ← 탭 네비게이터 위
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6495ED',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    zIndex: 99, // 혹시 덮이는 것 방지
  },
});

export default FloatingButton;
