import React, { useState, useContext } from 'react';
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

const ItemUploadPage = ({ navigation }) => {
    const apiUrl = Config.API_URL;
    const { token } = useContext(AuthContext);
    // 전역으로 관리
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

    const toastOptions = {
        position: 'bottom',
        bottomOffset: 120,
        visibilityTime: 2000,
    };

    const requestImagePermission = async () => {
        if(Platform.OS === 'android' && Platform.Version >= 33) {
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
    }

    // 이미지 선택
    const pickImage = async () => {
        setLoading(true);
        const hasPermission = await requestImagePermission();
        if(!hasPermission) {
            setLoading(false);
            Toast.show({
                ...toastOptions,
                type: 'error',
                text1: '권한 거부됨 : 이미지를 선택하려면 권한이 필요합니다.'
            });
            return;
        }

        const options = {
            mediaType: 'photo',
            includeBase64: true,
            quality: 0.8,
            selectionLimit: 0, // ✅ 0 = 무제한 선택 허용
        };
        
        ImagePicker.launchImageLibrary(options, async (response) => {
            if(response.didCancel || response.errorCode || !response.assets?.length) {
                // console.log('이미지 선택 취소 또는 오류');
                setLoading(false);
                return;
            }
        
            const selected = response.assets;
            const totalCount = images.length + selected.length;
        
            if(totalCount > 10) {
                setLoading(false);
                Toast.show({
                    ...toastOptions,
                    type: 'error',
                    text1: '사진은 최대 10장까지만 추가할 수 있습니다.',
                });
                return;
            }

            // ✅ 크기 확인 필터링
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

                    // 용량 제한 검사 (선택)
                    const path = resized.uri.replace('file://', '');
                    const stat = await RNFS.stat(path);
                    const sizeMB = stat.size / (1024 * 1024);
                    if (sizeMB > MAX_IMAGE_SIZE_MB) {
                        Toast.show({
                            ...toastOptions,
                            type: 'error',
                            text1: '압축 후에도 용량 초과 ' + `${img.fileName || '이미지'}는 제외됩니다.`,
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

            if (resizedImages.length === 0) {
                Toast.show({
                    ...toastOptions,
                    type: 'error',
                    text1: '모든 이미지가 용량 초과로 제외되었습니다.',
                });
                setLoading(false);
                return;
            }

            setImages(prev => [...prev, ...resizedImages]);
            setLoading(false);
        });
    };

    // 이미지 삭제
    const removeImage = (index) => {
        setLoading(true);
        setImages(prev => prev.filter((_, i) => i !== index));
        setLoading(false);
    };


    // 등록 시 필수 항목 체크
    const isDirty = Boolean(
        title.trim().length > 0 ||
        description.trim().length > 0 ||
        images.length > 0
    );

    const itemUpload = async () => {
        setLoading(true);
        const isValid = Boolean(
            title.trim() &&
            description.trim() &&
            startPrice.trim() &&
            images.length > 0
        );

        if(!isValid) {
            Toast.show({
                ...toastOptions,
                type: 'error',
                text1: '사진, 제목, 설명, 시작가는 필수 항목입니다.',
            });
            setLoading(false);
            return;
        }

        if (!auctionOption) {
            Toast.show({
                ...toastOptions,
                type: 'error',
                text1: '경매 옵션을 선택해 주세요.',
            });
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('productState', auctionOption.productState);
        formData.append('startPrice', Number(startPrice.replace(/,/g, '')))
        formData.append('endOption', auctionOption.endOption);
        formData.append('endTime', auctionOption.endDate);
        formData.append('bidUnit', Number(auctionOption.bidUnit.replace(/,/g, '')));
        formData.append('buyNowPrice', Number(auctionOption.buyNowPrice.replace(/,/g, '')));
        formData.append('isBidUnit', auctionOption.bidUnit === '' || auctionOption.bidUnit === 0 ? 0 : 1);
        formData.append('status', 1);
        formData.append('categoryId', subCategoryId);

        images.forEach((img, i) => {
            formData.append('images', {
                uri: Platform.OS === 'ios' ? img.uri.replace('file://', '') : img.uri,
                name: img.fileName || `image_${i}.jpg`,
                type: img.type || mime.lookup(img.uri) || 'image/jpeg',
            });
            formData.append('isThumbnail', i === 0 ? '1' : '0'); // 서버에서 첫 번째 이미지를 썸네일로 인식하게끔
        });

        try {
            const res = await axios.post(`${apiUrl}/api/item/create`, formData, {
                headers: {
                    // formData를 사용할때는 Content-Type을 설정하지않고, axios가 자동으로 설정하게 둬야함
                    // 그래서 주석처리
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });

            if(res.data.result === "success") {
                // 성공
                // Alert.alert("경매물품 등록이 완료되었습니다.");
                Toast.show({
                    ...toastOptions,
                    type: 'success',
                    text1: '경매물품 등록이 완료되었습니다.',
                });
                resetForm();
                navigation.replace("Main");
            }else {
                Toast.show({
                    ...toastOptions,
                    type: 'error',
                    text1: '경매물품 등록에 실패했습니다.',
                });
            }
            
        } catch (error) {
            // console.log('요청실패');
            console.log(error);
            Toast.show({
                ...toastOptions,
                type: 'error',
                text1: '경매물품 등록에 실패했습니다.',
            });
        } finally {
            setLoading(false);
        }
    };

    // 통화 포맷
    const formatCurrencyInput = (text) => {
        var numeric = text.replace(/[^0-9]/g, '');
        if(numeric.startsWith('0') && numeric.length > 1) {
            numeric = numeric.replace(/^0+/, '');
        }

        return numeric;
    }

    // 카테고리 선택 페이지
    const goCategoryPicker = () => {
        navigation.navigate("CategoryPicker");
    }

    // 옵션 선택 페이지
    const goOptionPage = () => {
        navigation.navigate("ItemOption");
    }

    // 옵션 선택 페이지에서 선택한 옵션들
    const getAuctionOptionText = () => {
        if(!auctionOption) return "";

        const {
            productState = '',
            endOption = '',
            bidUnit = '',
            buyNowPrice = ''
        } = auctionOption;

        let result = "";

        if (productState) result += productState;
        if (endOption) result += (result ? ' / ' : '') + endOption;
        if (bidUnit) result += (result ? ' / ' : '') + bidUnit;
        if (buyNowPrice) result += (result ? ' / ' : '') + buyNowPrice;

        return result;
    }

    // 임시 저장
    const handleTemporarySave = async () => {
        setLoading(true);
        try {
            const formData = new FormData();

            formData.append('title', title);
            formData.append('description', description);
            formData.append('productState', auctionOption?.productState);
            formData.append('endOption', auctionOption?.endOption);
            formData.append('endTime', auctionOption?.endDate);
            formData.append('startPrice', Number(startPrice.replace(/,/g, '')));
            formData.append('bidUnit', Number(auctionOption?.bidUnit ?? 0));
            formData.append('buyNowPrice', Number(auctionOption?.buyNowPrice ?? 0));
            formData.append('isBidUnit', auctionOption?.bidUnit ? 1 : 0);
            formData.append('categoryId', subCategoryId);
            formData.append('status', 2); // ✅ 이게 핵심

            // ✅ 이미지들도 추가 (기존과 동일하게)
            images.forEach((img, i) => {
                formData.append('images', {
                    uri: Platform.OS === 'ios' ? img.uri.replace('file://', '') : img.uri,
                    name: img.fileName || `image_${i}.jpg`,
                    type: img.type || mime.lookup(img.uri) || 'image/jpeg',
                });
                formData.append('isThumbnail', i === 0 ? '1' : '0');
            });

            await axios.post(`${apiUrl}/api/item/create`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            Toast.show({
                ...toastOptions,
                type: 'success',
                text1: '임시저장 완료'
            });
            resetForm();
            navigation.goBack();
        } catch(error) {
            console.log(error);
            Toast.show({
                ...toastOptions,
                type: 'error',
                text1: '임시저장 실패'
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeTopWrapper style={{ flex: 1 }}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
                style={{ flex: 1 }}
            >
                <AngleHeader
                    title="내 물건 경매"
                    IconComponent={() => <CloseIcon width={16} height={16} />}
                    onPress={handleTemporarySave}
                />


                <ScrollView style={styles.scrollArea} contentContainerStyle={styles.contentContainer}>
                    {/* 안내문구 추가 */}
                    <View style={styles.topNoticeBox}>
                        <Ionicons name="information-circle-outline" size={18} color="#6495ED" style={{ marginRight: 6 }} />
                        <Text style={styles.topNoticeText}>
                            판매금지 물품, 광고, 반복된 게시글은 경고 없이 삭제될 수 있습니다.
                        </Text>
                    </View>
                    {/* 사진 추가 */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.imageContainer}
                    >
                        {/* 사진 추가 버튼 */}
                        {images.length < 10 && (
                            <TouchableOpacity style={styles.addButton} onPress={pickImage}>
                                {/* <Text style={styles.addButtonText}>+</Text> */}
                                <Ionicons name="camera-outline" size={28} color="#6495ED" />
                                <Text style={styles.imageCountText}>{images.length}/10</Text>
                            </TouchableOpacity>
                        )}

                        {/* 이미지 리스트 */}
                        {images.map((img, i) => (
                            <View key={i} style={styles.imageWrapper}>
                                <Image source={{ uri: img.uri }} style={styles.preview} />
                                {/* 대표사진 라벨 */}
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

                    {/* 상품명 */}
                    <View style={styles.inputRow}>
                        <View style={styles.labelBox}>
                            <Text style={styles.rowLabel}>상품명</Text>
                        </View>
                        <TextInput
                            style={styles.rowInput}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="상품명을 입력해 주세요."
                        />
                    </View>

                    {/* 카테고리 */}
                    <View style={styles.inputRow}>
                        <View style={styles.labelBox}>
                            <Text style={styles.rowLabel}>카테고리</Text>
                        </View>
                        <TouchableOpacity style={{ flex: 1 }} onPress={goCategoryPicker}>
                            <TextInput
                                style={styles.rowInput}
                                placeholder="카테고리를 선택해 주세요."
                                value={selectedCategory || ''}
                                editable={false}  // 직접 입력 못 하게 막음
                                pointerEvents="none" // 안드로이드 터치 충돌 방지용
                            />
                        </TouchableOpacity>
                    </View>

                    {/* 시작가 */}
                    <View style={styles.inputRow}>
                        <View style={styles.labelBox}>
                            <Text style={styles.rowLabel}>시작가</Text>
                        </View>
                        <TextInput
                            style={styles.rowInput}
                            value={startPrice.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            onChangeText={(text) => setStartPrice(formatCurrencyInput(text))}
                            keyboardType="number-pad"
                            placeholder="시작가를 입력해주세요."
                        />
                    </View>

                    {/* 경매옵션 */}
                    <View style={styles.inputRow}>
                        <View style={styles.labelBox}>
                            <Text style={styles.rowLabel}>경매옵션</Text>
                        </View>
                        <TouchableOpacity style={{ flex: 1 }} onPress={goOptionPage}>
                            <TextInput
                                style={styles.rowInput}
                                placeholder="경매 옵션을 선택해 주세요."
                                editable={false}  // 직접 입력 못 하게 막음
                                pointerEvents="none" // 안드로이드 터치 충돌 방지용
                                value={getAuctionOptionText()}
                            />
                        </TouchableOpacity>
                    </View>
                    {/* 설명 영역 (라벨 없이 전체 박스처럼) */}
                    <View style={styles.descriptionWrapper}>
                        {(!description || description === '') && (
                            <Text style={styles.placeholderText}>
                                - 경매할 물건의 설명을 입력해 주세요.{"\n"}
                                - 제품명, 물건의 상태, 사용 기간 등
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
                    <AddButton title="등록하기" onPress={itemUpload} style={styles.footerButton} />
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
    // 경고 문구
    topNoticeBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#f0f4ff',
        borderColor: '#c6d4f5',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
    },
    topNoticeText: {
        fontSize: 12,
        color: '#333',
        lineHeight: 18,
        flex: 1,
    },
    // 이미지
    imageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        marginBottom: 5,
        marginTop: 5
    },
    imageCountText: {
        fontSize: 12,
        color: '#ccc',
        fontWeight: 'bold',
    },
    addButton: {
        width: 70,
        height: 70,
        borderWidth: 1,
        borderColor: '#6495ED',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 6,
        marginRight: 10,
        backgroundColor: '#fff',
    },
    imageWrapper: {
        position: 'relative',
        marginRight: 10,
    },
    preview: {
        width: 70,
        height: 70,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    labelTag: {
        position: 'absolute',
        bottom: 0,
        backgroundColor: '#6495ED',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 4,
        width: "100%"
    },
    labelText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: "center"
    },
    deleteButton: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#6495ED',
        borderRadius: 10,
        width: 18,
        height: 18,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        bottom: 2
    },
    // 인풋창
    inputRowLarge: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    inputRow: {
        flexDirection: 'column',  // ✅ 세로 배치
        borderBottomWidth: 1,
        borderColor: '#eee',
        paddingVertical: 8,  // 조금 넓게
    },
    labelBox: {
        width: "100%",  // ✅ 가로 전체
        justifyContent: 'center',
        alignItems: 'flex-start',  // 왼쪽 정렬
        borderBottomWidth: 0,  // ✅ 이제 아래 선은 안씀
    },
    rowLabel: {
        fontSize: 13,
        color: '#333333',
    },
    rowInput: {
        flex: 1,
        fontSize: 12,
        color: '#000',
        paddingVertical: 5,
    },
    // 설명 영역
    descriptionWrapper: {
        marginTop: 16,
        backgroundColor: '#f9f9f9',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#eee',
        padding: 12,
    },
    placeholderText: {
        position: 'absolute',
        top: 12,
        left: 12,
        right: 12,
        color: '#999',
        fontSize: 12,
        lineHeight: 25,  // 원하는 lineHeight 적용 가능
    },
    descriptionInput: {
        fontSize: 12,
        color: '#000',
        height: 180,
        textAlignVertical: 'top',
    },

    optionRow: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 },
    optionBtn: { paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, marginRight: 8, marginBottom: 8 },
    optionBtnActive: { backgroundColor: '#6495ED', borderColor: '#6495ED' },
    optionText: { fontSize: 12, color: '#000' },
    optionTextActive: { fontSize: 12, color: '#fff' },
    chosenDate: { fontSize: 14, color: '#333', marginBottom: 12 },
    // 모달
    modalBg: {
        flex: 1,
        backgroundColor: '#00000088',
        justifyContent: 'center',   // 세로 중앙
        alignItems: 'center',       // 가로 중앙
    },
    modal: {
        backgroundColor: '#fff',
        width: '90%',
        borderRadius: 8,
        padding: 16,
    },
    wheelsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        height: 200,
    },
    wheel: {
        width: '30%',
    },
    wheelItem: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    wheelItemSelected: {
        backgroundColor: '#eee',
    },
    wheelText: {
        fontSize: 16,
    },
    wheelTextSelected: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalBtns: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderColor: '#ddd',
    },
    
    // 등록하기 버튼
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        backgroundColor: '#fff',
    },
    footerButton: {
        width: '100%',
        // marginBottom: 20,
    },
    spinnerWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.5)',
        zIndex: 999,
    },
});

export default ItemUploadPage;