import React, { useRef, useState } from 'react';
import { Modal, View, Image, StyleSheet, TouchableOpacity, Dimensions, FlatList, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width, height } = Dimensions.get('window');

const FullScreenImageViewer = ({ visible, onClose, images = [], initialIndex = 0 }) => {
    const flatListRef = useRef();
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    // 이미지 넘기기기
    const handleScroll = (event) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(index);
    };

    // 닷 버튼 누르면 이미지 넘어가기
    const scrollToIndex = (index) => {
        flatListRef.current?.scrollToIndex({ index, animated: true });
        setCurrentIndex(index);
    };

    return (
        <Modal
            animationType="fade"
            transparent={false}
            visible={visible}
            onRequestClose={onClose}
        >
            <StatusBar hidden />
            <View style={styles.container}>
                <FlatList
                    ref={flatListRef}
                    data={images}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    initialScrollIndex={initialIndex}
                    keyExtractor={(_, index) => index.toString()}
                    onScroll={handleScroll}
                    getItemLayout={(_, index) => ({
                        length: width,
                        offset: width * index,
                        index,
                    })}
                    renderItem={({ item }) => (
                        <Image
                            source={{ uri: item }}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    )}
                />

                {/* 닫기 버튼 */}
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Icon name="close" size={28} color="#fff" />
                </TouchableOpacity>

                {/* 하단 dot indicator */}
                <View style={styles.dotContainer}>
                    {images.map((_, idx) => (
                        <TouchableOpacity key={idx} onPress={() => scrollToIndex(idx)}>
                            <View
                                key={idx}
                                style={[
                                    styles.dot,
                                    currentIndex === idx ? styles.activeDot : null,
                                ]}
                            />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </Modal>
    );
};

export default FullScreenImageViewer;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    image: {
        width,
        height,
        bottom: 48,
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 8,
        zIndex: 10,
    },
    dotContainer: {
        position: 'absolute',
        bottom: 64,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#777',
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: '#fff',
    },
});
