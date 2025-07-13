import React, { useEffect, useState, useContext } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    StatusBar,
    Platform,
    Text,
    PermissionsAndroid,
    ActivityIndicator,
    KeyboardAvoidingView
} from 'react-native';
import mime from 'react-native-mime-types';
import axios from 'axios';
import Config from 'react-native-config';
import * as ImagePicker from 'react-native-image-picker';
import AddButton from '../../components/AddButton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';
import Toast from 'react-native-toast-message';
import { AuthContext } from '../../contexts/AuthContext';
import { ItemUploadContext } from '../../contexts/ItemUploadProvider';
import ImageResizer from 'react-native-image-resizer';
import SafeTopWrapper from '../../components/SafeTopWrapper';

import AngleHeader from '../../components/AngleHeader';
import CloseIcon from '../../assets/images/common/close.svg';

const STATUS_BAR_HEIGHT = Platform.OS === 'android'
    ? StatusBar.currentHeight
    : 20;
const HOME_INDICATOR_HEIGHT = Platform.OS === 'ios' ? 34 : 0;
const HEADER_HEIGHT = 48;
const FOOTER_HEIGHT = 56;
const MAX_IMAGE_SIZE_MB = 2;

export default function ItemEditPage({ navigation, route }) {
    const apiUrl = Config.API_URL;
    const { token } = useContext(AuthContext);
    const {
        title, setTitle,
        description, setDescription,
        startPrice, setStartPrice,
        images, setImages,
        mainCategoryId, setMainCategoryId,
        subCategoryId, setSubCategoryId,
        selectedCategory, setSelectedCategory,
        auctionOption, setAuctionOption,
        resetForm
    } = useContext(ItemUploadContext);

    const [loading, setLoading] = useState(false);
    const [itemState, setItemState] = useState(null);
    const [bidCount, setBidCount] = useState(0);
    const { itemId } = route.params;

    const toastOptions = {
        position: 'bottom',
        bottomOffset: 120,
        visibilityTime: 2000,
    };

    useEffect(() => {
        const fetchItem = async () => {
            setLoading(true);
            try {
                const res = await axios.get(
                    `${apiUrl}/api/item/edit-info/${itemId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (res.data.result === 'success') {
                    const item = res.data.item;
                    console.log(item);
                    // 기본 필드
                    setTitle(item.title);
                    setDescription(item.description);
                    setStartPrice(item.startPrice.toString());
                    // 카테고리
                    setMainCategoryId(item.mainCategoryId);
                    setSubCategoryId(item.subCategoryId);
                    setSelectedCategory(`${item.mainCategoryName} > ${item.subCategoryName}`);
                    // 옵션
                    setAuctionOption({
                        productState: item.productState,
                        endOption: item.endOption,
                        bidUnit: item.bidUnit?.toString() || '',
                        buyNowPrice: item.buyNowPrice?.toString() || '',
                        endDate: item.endTime
                    });
                    // 상태, 입찰자 수
                    setItemState(item.state);
                    setBidCount(item.currentPrice === 0 ? 0 : 1);
                    // 이미지
                    const imgs = item.images.map((imgObj, idx) => {
                        const url = imgObj.url;  // 객체에서 실제 URL 문자열 꺼내기
                        return {
                            uri: url,
                            fileName: url.split('/').pop(),
                            type: 'image/jpeg',
                        };
                    });
                    setImages(imgs);
                } else {
                    Toast.show({ ...toastOptions, type: 'error', text1: '아이템 정보 불러오기 실패' });
                }
            } catch (err) {
                console.error(err);
                Toast.show({ ...toastOptions, type: 'error', text1: '아이템 불러오기 중 오류' });
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [itemId]);

    const requestImagePermission = async () => {
        if (Platform.OS === 'android' && Platform.Version >= 33) {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                {
                    title: '이미지 접근 권한',
                    message: '갤러리에서 이미지를 선택하려면 권한이 필요합니다.',
                    buttonNeutral: '나중에',
                    buttonNegative: '거부',
                    buttonPositive: '허용',
                },
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
    };

    const pickImage = async () => {
        setLoading(true);
        const hasPermission = await requestImagePermission();
        if (!hasPermission) {
            setLoading(false);
            Toast.show({
                ...toastOptions,
                type: 'error',
                text1: '권한 거부됨 : 이미지를 선택하려면 권한이 필요합니다.',
            });
            return;
        }

        const options = {
            mediaType: 'photo',
            includeBase64: true,
            quality: 0.8,
            selectionLimit: 0,
        };

        ImagePicker.launchImageLibrary(options, async (response) => {
            if (response.didCancel || response.errorCode || !response.assets?.length) {
                setLoading(false);
                return;
            }

            const selected = response.assets;
            const totalCount = images.length + selected.length;

            if (totalCount > 10) {
                setLoading(false);
                Toast.show({
                    ...toastOptions,
                    type: 'error',
                    text1: '사진은 최대 10장까지만 추가할 수 있습니다.',
                });
                return;
            }

            const resizedImages = [];
            for (const img of selected) {
                try {
                    const resized = await ImageResizer.createResizedImage(
                        img.uri,
                        800,
                        800,
                        'JPEG',
                        70
                    );
                    const path = resized.uri.replace('file://', '');
                    const stat = await RNFS.stat(path);
                    const sizeMB = stat.size / (1024 * 1024);
                    if (sizeMB > MAX_IMAGE_SIZE_MB) {
                        Toast.show({
                            ...toastOptions,
                            type: 'error',
                            text1: `압축 후에도 용량 초과: ${img.fileName || '이미지'} 제외됩니다.`,
                        });
                        continue;
                    }
                    resizedImages.push({
                        uri: resized.uri,
                        fileName: img.fileName || `resized_${Date.now()}.jpg`,
                        type: 'image/jpeg',
                    });
                } catch (err) {
                    console.warn('리사이즈 실패:', err);
                }
            }
            setImages(prev => [...prev, ...resizedImages]);
            setLoading(false);
        });
    };

    const removeImage = (index) => {
        setLoading(true);
        setImages(prev => prev.filter((_, i) => i !== index));
        setLoading(false);
    };

    const formatCurrencyInput = (text) => {
        let numeric = text.replace(/[^0-9]/g, '');
        if (numeric.startsWith('0') && numeric.length > 1) {
            numeric = numeric.replace(/^0+/, '');
        }
        return numeric;
    };

    const goCategoryPicker = () => {
        navigation.navigate('CategoryPicker');
    };

    const goOptionPage = () => {
        if(itemState === 0 || (itemState === 1 && bidCount === 0)) {
            navigation.navigate('ItemOption');
        }else {
            navigation.navigate('ItemOption', { readOnly: true });
        }
    };


    const getAuctionOptionText = () => {
        if (!auctionOption) return '';
        const { productState, endOption, bidUnit, buyNowPrice } = auctionOption;
        let parts = [];
        if (productState) parts.push(productState);
        if (endOption) parts.push(endOption);
        if (bidUnit) parts.push(bidUnit);
        if (buyNowPrice) parts.push(buyNowPrice);

        return parts.join(' / ').length === 4 ? parts.join(' / ') : '';
    };

    const itemUpdate = async () => {
        // setLoading(true);
        const isValid = Boolean(
            title.trim() &&
            description.trim() &&
            startPrice.trim() &&
            images.length > 0
        );
        if (!isValid) {
            Toast.show({ ...toastOptions, type: 'error', text1: '필수 항목을 모두 입력해 주세요.' });
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('productState', auctionOption.productState);
        formData.append('startPrice', Number(startPrice.replace(/,/g, '')));
        formData.append('endOption', auctionOption.endOption);
        formData.append('endTime', auctionOption.endDate);
        formData.append('bidUnit', Number(auctionOption.bidUnit.replace(/,/g, '') || 0));
        formData.append('buyNowPrice', Number(auctionOption.buyNowPrice.replace(/,/g, '') || 0));
        formData.append('isBidUnit', auctionOption.bidUnit ? 1 : 0);
        formData.append('status', 1);
        formData.append('categoryId', subCategoryId);

        images.forEach((img, i) => {
            formData.append('images', {
                uri: img.uri.startsWith('http')
                    ? img.uri
                    : (Platform.OS === 'ios' ? img.uri.replace('file://', '') : img.uri),
                name: img.fileName,
                type: img.type,
            });
            formData.append('isThumbnail', i === 0 ? '1' : '0');
        });

        try {
            const res = await axios.patch(
                `${apiUrl}/api/item/edit/${itemId}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );
            if (res.data.result === 'success') {
                Toast.show({ ...toastOptions, type: 'success', text1: '수정이 완료되었습니다.' });
                resetForm();
                navigation.goBack();
            } else {
                throw new Error();
            }
        } catch (err) {
            console.error(err);
            Toast.show({ ...toastOptions, type: 'error', text1: '수정에 실패했습니다.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeTopWrapper style={{ flex: 1 }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
                style={{ flex: 1 }}
            >
                {/* <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>내 물건 수정</Text>
                </View> */}

                <AngleHeader
                    title="내 물건 수정"
                    IconComponent={() => <CloseIcon width={16} height={16} />}
                    // onPress={handleTemporarySave}
                />

                <ScrollView style={styles.scrollArea} contentContainerStyle={styles.contentContainer}>
                    <View style={styles.topNoticeBox}>
                        <Ionicons name="information-circle-outline" size={18} color="#6495ED" style={{ marginRight: 6 }} />
                        <Text style={styles.topNoticeText}>
                            판매금지 물품, 광고, 반복된 게시글은 경고 없이 삭제될 수 있습니다.
                        </Text>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.imageContainer}
                    >
                        {images.length < 10 && (
                            <TouchableOpacity style={styles.addButton} onPress={pickImage}>
                                <Ionicons name="camera-outline" size={28} color="#6495ED" />
                                <Text style={styles.imageCountText}>{images.length}/10</Text>
                            </TouchableOpacity>
                        )}
                        {images.map((img, i) => (
                            <View key={i} style={styles.imageWrapper}>
                                <Image source={{ uri: img.uri }} style={styles.preview} />
                                {i === 0 && (
                                    <View style={styles.labelTag}>
                                        <Text style={styles.labelText}>대표 사진</Text>
                                    </View>
                                )}
                                <TouchableOpacity
                                    style={styles.deleteButton}
                                    onPress={() => removeImage(i)}
                                >
                                    <Text style={styles.deleteButtonText}>×</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>

                    <View style={styles.inputRow}>
                        <View style={styles.labelBox}><Text style={styles.rowLabel}>상품명</Text></View>
                        <TextInput
                            style={styles.rowInput}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="상품명을 입력해 주세요."
                        />
                    </View>

                    <View style={styles.inputRow}>
                        <View style={styles.labelBox}><Text style={styles.rowLabel}>카테고리</Text></View>
                        <TouchableOpacity style={{ flex: 1 }} onPress={goCategoryPicker}>
                            <TextInput
                                style={styles.rowInput}
                                value={mainCategoryId != null ? selectedCategory : ''}
                                placeholder="카테고리를 선택해 주세요."
                                editable={false}
                                pointerEvents="none"
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputRow}>
                        <View style={styles.labelBox}><Text style={styles.rowLabel}>시작가</Text></View>
                        <TextInput
                            style={styles.rowInput}
                            value={
                                Number(startPrice) > 0
                                ? startPrice.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                : ''
                            }
                            onChangeText={text => setStartPrice(formatCurrencyInput(text))}
                            keyboardType="number-pad"
                            placeholder="시작가를 입력해주세요."
                        />
                    </View>

                    <View style={styles.inputRow}>
                        <View style={styles.labelBox}><Text style={styles.rowLabel}>경매옵션</Text></View>
                        <TouchableOpacity style={{ flex: 1 }} onPress={goOptionPage}>
                            <TextInput
                                style={styles.rowInput}
                                value={getAuctionOptionText()}
                                placeholder="경매 옵션을 선택해 주세요."
                                editable={false}
                                pointerEvents="none"
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.descriptionWrapper}>
                        {(!description) && (
                            <Text style={styles.placeholderText}>
                                - 경매할 물건의 설명을 입력해 주세요.{"\n"}- 제품명, 물건의 상태, 사용 기간 등
                            </Text>
                        )}
                        <TextInput
                            style={styles.descriptionInput}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                        />
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <AddButton title="수정하기" onPress={itemUpdate} style={styles.footerButton} />
                </View>

                {loading && (
                    <View style={styles.spinnerWrapper}>
                        <ActivityIndicator size="large" color="#6495ED" />
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeTopWrapper>
    );
}

const styles = StyleSheet.create({
    scrollArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    contentContainer: {
        padding: 16,
    },
    topNoticeBox: {
        flexDirection: 'row', alignItems: 'flex-start',
        backgroundColor: '#f0f4ff', borderColor: '#c6d4f5', borderWidth: 1,
        borderRadius: 8,
        padding: 10,
    },
    topNoticeText: { fontSize: 12, color: '#333', lineHeight: 18, flex: 1 },
    imageContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, marginBottom: 5, marginTop: 5 },
    addButton: {
        width: 70, height: 70, borderWidth: 1, borderColor: '#6495ED',
        justifyContent: 'center', alignItems: 'center', borderRadius: 6,
        marginRight: 10, backgroundColor: '#fff',
    },
    imageCountText: { fontSize: 12, color: '#ccc', fontWeight: 'bold' },
    imageWrapper: { position: 'relative', marginRight: 10 },
    preview: { width: 70, height: 70, borderRadius: 6, borderWidth: 1, borderColor: '#ccc' },
    labelTag: {
        position: 'absolute', bottom: 0, backgroundColor: '#6495ED',
        paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, width: '100%'
    },
    labelText: { color: '#fff', fontSize: 10, fontWeight: 'bold', textAlign: 'center' },
    deleteButton: {
        position: 'absolute', top: -4, right: -4,
        backgroundColor: '#6495ED', borderRadius: 10, width: 18, height: 18, alignItems: 'center'
    },
    deleteButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold', bottom: 2 },
    inputRow: { flexDirection: 'column', borderBottomWidth: 1, borderColor: '#eee', paddingVertical: 8 },
    labelBox: { width: '100%', justifyContent: 'center', alignItems: 'flex-start' },
    rowLabel: { fontSize: 13, color: '#333333' },
    rowInput: { flex: 1, fontSize: 12, color: '#000', paddingVertical: 5 },
    descriptionWrapper: {
        marginTop: 16, backgroundColor: '#f9f9f9',
        borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#eee', padding: 12,
    },
    placeholderText: {
        position: 'absolute', top: 12, left: 12, right: 12,
        color: '#999', fontSize: 12, lineHeight: 25,
    },
    descriptionInput: { fontSize: 12, color: '#000', height: 180, textAlignVertical: 'top' },
    footer: {
        padding: 16, borderTopWidth: 1, borderTopColor: '#ccc', backgroundColor: '#fff'
    },
    footerButton: { width: '100%' },
    spinnerWrapper: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.5)', zIndex: 999,
    },
});
