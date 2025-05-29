import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BottomActionModal = ({ visible, onClose, onReport, onHideUser }) => {
    const insets = useSafeAreaInsets();

    return (
        <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={styles.wrapper}>
                {/* 화면 전체 덮는 영역 - 아래 누르면 닫기 */}
                <Pressable style={styles.overlay} onPress={onClose} />

                {/* 실제 모달 내용 */}
                <View style={[styles.container, { paddingBottom: insets.bottom || 16 }]}>
                {/* <TouchableOpacity onPress={onReport}> */}
                <TouchableOpacity onPress={onReport}>
                    <Text style={[styles.item, { color: 'red' }]}>신고</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onHideUser}>
                    <Text style={styles.item}>이 사용자 글 안 보기</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onClose}>
                    <Text style={[styles.item, { color: 'gray' }]}>닫기</Text>
                </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    container: {
        backgroundColor: '#fff',
        paddingTop: 16,
        paddingHorizontal: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    item: {
        fontSize: 16,
        paddingVertical: 16,
    },
});

export default BottomActionModal;
