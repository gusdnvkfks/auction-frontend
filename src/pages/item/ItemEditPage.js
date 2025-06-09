import React, { useState, useContext, useEffect } from 'react';
import {
    View, TextInput, StyleSheet, ScrollView, Alert, TouchableOpacity,
    Image, SafeAreaView, StatusBar, Platform, Text, ActivityIndicator, PermissionsAndroid
} from 'react-native';
import mime from 'react-native-mime-types';
import axios from 'axios';
import Config from 'react-native-config';
import * as ImagePicker from 'react-native-image-picker';
import AppText from '../../components/AppText';
import AddButton from '../../components/AddButton';
import RequiredLabel from '../../components/RequireLabel';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { AuthContext } from '../../contexts/AuthContext';
import SafeTopWrapper from '../../components/SafeTopWrapper';
import DateTimeModal from '../../components/DateTimeModal';
import { RotationGestureHandler } from 'react-native-gesture-handler';

const START_OPTIONS = ['등록즉시', '1일뒤', '직접입력'];
const END_OPTIONS = ['수동마감', '3일뒤', '1주일뒤', '직접입력'];

const ItemEditPage = ({ navigation, route }) => {
    const apiUrl = Config.API_URL;
    const { token } = useContext(AuthContext);
    const { itemId } = route.params;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startPrice, setStartPrice] = useState('');
    const [bidIncrement, setBidIncrement] = useState('');
    const [buyNowPrice, setBuyNowPrice] = useState('');
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    // 경매 시작시간, 마감시간 관련
    const [startOption, setStartOption] = useState('등록즉시');
    const [startDate, setStartDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [startDateString, setStartDateString] = useState("");

    const [endOption, setEndOption] = useState('수동마감');
    const [endDate, setEndDate] = useState(() => new Date('9999-12-31T23:59:59'));
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [endDateString, setEndDateString] = useState("");

    const [pickerType, setPickerType] = useState("");

    // 기존에 등록된 이미지들 x누르면 배열에서 삭제해줌
    const [existingImages, setExistingImages] = useState([]);

    const toastOptions = {
        position: 'bottom',
        bottomOffset: 120,
        visibilityTime: 2000,
    };

    useEffect(() => {
        fetchItemInfo();
    }, []);

    const fetchItemInfo = async () => {
        setLoading(true);

        try {
            const res = await axios.get(`${apiUrl}/api/item/edit-info/${itemId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            if (res.data.result === 'success') {
                const item = res.data.item;
                setStartDate(new Date(item.startTime));
                setEndDate(new Date(item.endTime));
                setTitle(item.title);
                setDescription(item.description);
                setStartPrice(item.startPrice.toString());
                setBidIncrement(item.bidUnit?.toString() || '');
                setBuyNowPrice(item.buyNowPrice?.toString() || '');
                setImages(item.images.map(img => ({
                    uri: img.url,
                    fileName: img.url.split('/').pop(),
                    type: 'image/jpeg'
                })));

                setExistingImages(item.images.map(img => img.url));
                
                
                const compareTime = new Date();
                if (startDate > compareTime) {
                    setStartDateString(formatDate(startDate));
                } else {
                    setStartDateString("");
                }

                if (!(endDate.getFullYear() === 9999 && endDate.getMonth() === 11 && endDate.getDate() === 31)) {
                    setEndDateString(formatDate(endDate));
                } else {
                    setEndDateString("");
                }
            }
        } catch (e) {
            console.error(e);
            Toast.show({ ...toastOptions, type: 'error', text1: '물품 정보를 불러오지 못했습니다.' });
        } finally {
            setLoading(false);
        }
    };

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
        const hasPermission = await requestImagePermission();
        if (!hasPermission) {
            Alert.alert('권한 거부됨', '이미지를 선택하려면 권한이 필요합니다.');
            return;
        }

        const options = {
            mediaType: 'photo',
            includeBase64: false,
            selectionLimit: 0,
        };

        ImagePicker.launchImageLibrary(options, async (response) => {
            if (response.didCancel || response.errorCode || !response.assets?.length) return;

            const selected = response.assets;
            const totalCount = images.length + selected.length;

            if (totalCount > 10) {
                Alert.alert('사진은 최대 10장까지만 추가할 수 있습니다.');
                return;
            }

            const newImages = selected.map((img) => ({
                uri: img.uri,
                fileName: img.fileName || `image_${Date.now()}.jpg`,
                type: img.type || mime.lookup(img.uri) || 'image/jpeg',
            }));

            setImages(prev => [...prev, ...newImages]);
        });
    };

    const removeImage = (index) => {
        // 이미존재하는 이미지배열에서 삭제해주기
        const removedImage = images[index];
        
        setImages(prev => prev.filter((_, i) => i !== index));

        if(existingImages.includes(removedImage.uri)) {
            setExistingImages(prev => prev.filter(url => url !== removedImage.uri));
        }
    };

    const formatCurrencyInput = (text) => {
        var numeric = text.replace(/[^0-9]/g, '');
        if(numeric.startsWith('0') && numeric.length > 1) {
            numeric = numeric.replace(/^0+/, '');
        }
        return numeric;
    };

    const handleSubmitEdit = async () => {
        // setLoading(true);
        const isValid = Boolean(title.trim() && description.trim() && startPrice.trim());

        if (!isValid) {
            Alert.alert("필수 항목을 입력해주세요.");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('itemId', itemId);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('startTime', startDate.toISOString());
        formData.append('endTime', endDate.toISOString());
        formData.append('startPrice', Number(startPrice.replace(/,/g, '')));
        formData.append('bidUnit', Number(bidIncrement.replace(/,/g, '')));
        formData.append('buyNowPrice', Number(buyNowPrice.replace(/,/g, '')));
        formData.append('isBidUnit', bidIncrement === '' || bidIncrement === '0' ? 0 : 1);

        (existingImages || []).forEach(url => {
            if (typeof url === 'string' && url.trim().startsWith('http')) {
                formData.append('existingImageUrls', url);
            } else {
                console.warn('[formData] 잘못된 existingImage url 제거됨:', url);
            }
        });

        images.forEach((img, i) => {
            formData.append('images', {
                uri: Platform.OS === 'ios' ? img.uri.replace('file://', '') : img.uri,
                name: img.fileName || `image_${i}.jpg`,
                type: img.type || mime.lookup(img.uri) || 'image/jpeg',
            });
            formData.append('isThumbnail', i === 0 ? '1' : '0');
        });

        try {
            const res = await axios.patch(`${apiUrl}/api/item/edit/${itemId}`, formData, 
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (res.data.result === 'success') {
                Toast.show({ ...toastOptions, type: 'success', text1: '수정 완료되었습니다.' });
                navigation.goBack();
            } else {
                Toast.show({ ...toastOptions, type: 'error', text1: '수정에 실패했습니다.' });
            }
        } catch (err) {
            Alert.alert(JSON.stringify(err));
            console.error(err);
            Toast.show({ ...toastOptions, type: 'error', text1: '수정 중 오류가 발생했습니다.' });
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        const pad = (n) => String(n).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
               `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    // 경매 시작시간 선택할 때
    const onPressStartOption = (opt) => {
        setStartOption(opt);
        setStartDateString("");
        if(opt === '직접입력') {
            // 모달창 띄워주기
            setPickerType("경매 시작시간");
            setShowStartPicker(true);
        }else {
            setShowStartPicker(false);
            setPickerType("");
            // 등록즉시 / 24시간후 로직 예시
            setStartDate(
                opt === '등록즉시' ? new Date() : new Date(Date.now() + 24 * 60 * 60 * 1000)
            );
        }
    };

    // 경매 마감시간 선택할 때
    const onPressEndOption = (opt) => {
        setEndOption(opt);
        setEndDateString("");
        if(opt === '직접입력') {
            // 모달창 띄워주기기
            setShowEndPicker(true);
            setPickerType("경매 마감시간");
        }else {
            setShowEndPicker(false);
            setPickerType("");
            if(opt === '3일후') {
                setEndDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
            }else if (opt === '1주일후') {
                setEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
            }else if (opt === '1개월후') {
                const tmp = new Date();
                tmp.setMonth(tmp.getMonth() + 1);
                setEndDate(tmp);
            }else {
                // '수동마감'
                setEndDate(new Date('9999-12-31T23:59:59'));
            }
        }
    };

    return (
        <SafeTopWrapper style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
                <AppText style={styles.headerTitle}>내 경매 상품 수정</AppText>
                <TouchableOpacity>
                    {/* <AppText style={styles.headerBtn}>임시저장</AppText> */}
                </TouchableOpacity>
            </View>
            <ScrollView style={styles.scrollArea} contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
                {/* 사진 추가 */}
                <AppText style={styles.label}>
                    <RequiredLabel>사진 추가</RequiredLabel>
                </AppText>
                <View style={styles.imageContainer}>
                    {images.length < 10 && (
                        <TouchableOpacity style={styles.addButton} onPress={pickImage}>
                            <Text style={styles.addButtonText}>+</Text>
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
                                onPress={() => removeImage(i)}>
                                <Text style={styles.deleteButtonText}>×</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* 경매 시작 시간 */}
                <AppText style={styles.label}>경매 시작 시간</AppText>
                <View style={styles.optionRow}>
                    {START_OPTIONS.map(opt => (
                        <TouchableOpacity
                            key={opt}
                            onPress={() => onPressStartOption(opt)}
                            style={[styles.optionBtn, startOption === opt && styles.optionBtnActive]}
                        >
                        <Text style={ startOption === opt ? styles.optionTextActive : styles.optionText }>
                            {opt}
                        </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                
                {/* 선택한 경매 시간 보여주기 */}
                {startDateString !== "" && (
                    <AppText>
                        선택한 시작 시간 : {startDateString}
                    </AppText>
                )}

                {/* 경매 마감 시간 */}
                <AppText style={styles.label}>경매 마감 시간</AppText>
                    <View style={styles.optionRow}>
                    {END_OPTIONS.map(opt => (
                        <TouchableOpacity
                        key={opt}
                        onPress={() => onPressEndOption(opt)}
                        style={[styles.optionBtn, endOption === opt && styles.optionBtnActive]}
                        >
                        <Text style={ endOption === opt ? styles.optionTextActive : styles.optionText }>
                            {opt}
                        </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 선택한 경매 시간 보여주기 */}
                {endDateString !== "" && (
                    <AppText>
                        선택한 마감 시간 : {endDateString}
                    </AppText>
                )}

                <DateTimeModal
                    title={pickerType}
                    visible={showStartPicker || showEndPicker}
                    initialDate={startDate}
                    onCancel={() => {
                        if(showStartPicker) {
                            setStartOption('등록즉시');
                            setShowStartPicker(false);
                        }else if(showEndPicker) {
                            setStartOption('수동마감');
                            setShowEndPicker(false);
                        }
                    }}
                    onConfirm={date => {
                        if(showStartPicker) {
                            const now = new Date();
                            const valid = date < now ? now : date;
                            setStartDate(valid);
                            setShowStartPicker(false);
                            var showStartDate = formatDate(valid);   // 보여줄 날짜
                            setStartDateString(showStartDate);
                            
                        }else if(showEndPicker) {
                            // 마감시간은 시작시간보다 크고 최소 한시간 뒤로 가야됨
                            // 마감시간은 최소 한시간 뒤로 설정
                            const minEnd = new Date(startDate.getTime() + 60 * 60 * 1000);
                            if (date < minEnd) {
                                Alert.alert('경고', '마감시간은 시작시간보다 최소 1시간 이후여야 합니다.', [
                                    { text: '확인', onPress: () => {} },
                                ]);
                                date = minEnd;
                            }
                            setEndDate(date);
                            setShowEndPicker(false);
                            var showEndDate = formatDate(date);
                            setEndDateString(showEndDate);
                        }
                    }}
                />

                <AppText style={styles.label}><RequiredLabel />제목</AppText>
                <TextInput style={styles.input} value={title} onChangeText={setTitle} />

                <AppText style={styles.label}><RequiredLabel />설명</AppText>
                <TextInput style={[styles.input, styles.textArea]} multiline value={description} onChangeText={setDescription} />

                <AppText style={styles.label}><RequiredLabel />시작가</AppText>
                <TextInput style={styles.input} keyboardType='number-pad' value={startPrice.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} onChangeText={text => setStartPrice(formatCurrencyInput(text))} />

                <AppText style={styles.label}>입찰 단위</AppText>
                <TextInput style={styles.input} keyboardType='number-pad' value={bidIncrement.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} onChangeText={text => setBidIncrement(formatCurrencyInput(text))} />

                <AppText style={styles.label}>즉시 구매가</AppText>
                <TextInput style={styles.input} keyboardType='number-pad' value={buyNowPrice.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} onChangeText={text => setBuyNowPrice(formatCurrencyInput(text))} />
            </ScrollView>

            <View style={styles.footer}>
                <AddButton title="수정 완료" onPress={handleSubmitEdit} />
            </View>

            {loading && (
                <View style={styles.spinnerWrapper}>
                    <ActivityIndicator size="large" color="#6495ED" />
                </View>
            )}
        </SafeTopWrapper>
    );
};

const STATUS_BAR_HEIGHT = Platform.OS === 'android'
    ? StatusBar.currentHeight
    : 20;
const HOME_INDICATOR_HEIGHT = Platform.OS === 'ios' ? 34 : 0;
const HEADER_HEIGHT = 48;
const FOOTER_HEIGHT = 56;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        position: 'absolute', top: 0, left: 0, right: 0,
        height: HEADER_HEIGHT,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ccc',
        zIndex: 10, elevation: 10,
    },
    headerTitle: { fontSize: 18, fontWeight: '600', right: 10 },
    headerBtn: { fontSize: 16, color: '#000' },
    headerBtnDisabled: { color: '#aaa' },
    scrollArea: {
        flex: 1,
        backgroundColor: '#fff',
        marginTop: STATUS_BAR_HEIGHT
    },
    label: { marginTop: 20, fontSize: 14, fontWeight: '500', marginBottom: 12 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8, marginTop: 4 },
    textArea: { height: 100, textAlignVertical: 'top' },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    imageContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 12,
        paddingRight: 2,
    },
    imageWrapper: {
        position: 'relative',
        marginRight: 10,
    },
    preview: { width: 60, height: 60, borderRadius: 8, borderWidth: 1, borderColor: '#ccc' },
    deleteButton: {
        position: 'absolute', top: -6, right: -6,
        backgroundColor: '#6495ED', borderRadius: 12,
        width: 18, height: 18, justifyContent: 'center', alignItems: 'center'
    },
    deleteButtonText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    spinnerWrapper: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.5)', zIndex: 999,
    },
    addButton: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#6495ED',
        borderRadius: 4,
        marginRight: 10,
        marginBottom: 10
    },
    addButtonText: {
        fontSize: 30,
        fontWeight: '300'
    },
    labelTag: {
        position: 'absolute',
        bottom: 12,
        left: 1,
        backgroundColor: '#6495ED',
        paddingHorizontal: 9,
        paddingVertical: 2,
        borderRadius: 4,
        zIndex: 1,
    },
    labelText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    optionRow: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 },
    optionBtn: { paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, marginRight: 8, marginBottom: 8 },
    optionBtnActive: { backgroundColor: '#6495ED', borderColor: '#6495ED' },
    optionText: { fontSize: 12, color: '#000' },
    optionTextActive: { fontSize: 12, color: '#fff' },
    chosenDate: { fontSize: 14, color: '#333', marginBottom: 12 },

});

export default ItemEditPage;
