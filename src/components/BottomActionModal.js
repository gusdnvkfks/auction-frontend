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

const BottomActionModal = ({ visible, isAuthority, onClose, userActions, itemActions, itemState }) => {
    const insets = useSafeAreaInsets();

    return (
        <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={styles.wrapper}>
                {/* 화면 전체 덮는 영역 - 아래 누르면 닫기 */}
                <Pressable style={styles.overlay} onPress={onClose} />

                {/* 실제 모달 내용 */}
                <View style={[styles.container, { paddingBottom: insets.bottom || 16 }]}>
                    {isAuthority === true ? (
                        <>
                            {itemState !== 3 ? (
                                <TouchableOpacity onPress={itemActions.onUpdate}>
                                    <Text style={styles.item}>
                                        {/* {itemState === 0 ? "경매중" : itemState === 1 ? "낙찰하기" : "판매완료"} */}
                                        경매 상태 변경
                                    </Text>
                                </TouchableOpacity>
                            ) : null}

                            <TouchableOpacity onPress={itemActions.onModify}>
                                <Text style={styles.item}>경매 물품 수정</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={itemActions.onDelete}>
                                <Text style={[styles.item, { color: 'red' }]}>삭제</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={onClose}>
                                <Text style={[styles.item, { color: 'gray' }]}>닫기</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity onPress={userActions.onReport}>
                                <Text style={[styles.item, { color: 'red' }]}>신고</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={userActions.onHideUser}>
                                <Text style={styles.item}>이 사용자의 게시글 보지 않기</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={onClose}>
                                <Text style={[styles.item, { color: 'gray' }]}>닫기</Text>
                            </TouchableOpacity>
                        </>
                    )}
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
        fontSize: 14,
        paddingVertical: 16,
    },
});

export default BottomActionModal;
