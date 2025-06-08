import React, { useState, useContext } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    ScrollView,
    Alert,
    TouchableOpacity,
    Image,
    StatusBar,
    Platform,
    Text,
    PermissionsAndroid,
    ActivityIndicator
} from 'react-native';
import mime from 'react-native-mime-types';
import axios from 'axios';
import Config from 'react-native-config';
import * as ImagePicker from 'react-native-image-picker';
import AppText from '../../components/AppText';
import AddButton from '../../components/AddButton';
import RequiredLabel from '../../components/RequireLabel';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimeModal from '../../components/DateTimeModal';
import RNFS from 'react-native-fs';
import Toast from 'react-native-toast-message';
import { AuthContext } from '../../contexts/AuthContext';
import ImageResizer from 'react-native-image-resizer';
import SafeTopWrapper from '../../components/SafeTopWrapper';

const STATUS_BAR_HEIGHT = Platform.OS === 'android'
    ? StatusBar.currentHeight
    : 20;
const HOME_INDICATOR_HEIGHT = Platform.OS === 'ios' ? 34 : 0;
const HEADER_HEIGHT = 48;
const FOOTER_HEIGHT = 56;

const START_OPTIONS = ['등록즉시', '1일뒤', '직접입력'];
const END_OPTIONS = ['수동마감', '3일뒤', '1주일뒤', '직접입력'];

const MAX_IMAGE_SIZE_MB = 2;

const ItemUploadPage = ({ navigation }) => {
    const apiUrl = Config.API_URL;
    const { token } = useContext(AuthContext);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startPrice, setStartPrice] = useState('');
    const [bidIncrement, setBidIncrement] = useState('');
    const [buyNowPrice, setBuyNowPrice] = useState('');
    const [images, setImages] = useState([]);

    const [startOption, setStartOption] = useState('등록즉시');
    const [startDate, setStartDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [startDateString, setStartDateString] = useState("");
    
    const [endOption, setEndOption] = useState('수동마감');
    const [endDate, setEndDate] = useState(() => new Date('9999-12-31T23:59:59'));
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [endDateString, setEndDateString] = useState("");

    const [pickerType, setPickerType] = useState("");
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
        const hasPermission = await requestImagePermission();
        if(!hasPermission) {
            Alert.alert('권한 거부됨', '이미지를 선택하려면 권한이 필요합니다.');
            return;
        }

        const options = {
            mediaType: 'photo',
            includeBase64: true,
            quality: 0.8,
            selectionLimit: 0, // ✅ 0 = 무제한 선택 허용
        };
        
        ImagePicker.launchImageLibrary(options, async (response) => {
            setLoading(true);
            if(response.didCancel || response.errorCode || !response.assets?.length) {
                // console.log('이미지 선택 취소 또는 오류');
                setLoading(false);
                return;
            }
        
            const selected = response.assets;
            const totalCount = images.length + selected.length;
        
            if(totalCount > 10) {
                setLoading(false);
                Alert.alert('사진은 최대 10장까지만 추가할 수 있습니다.');
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
                        Alert.alert('압축 후에도 용량 초과', `${img.fileName || '이미지'}는 제외됩니다.`);
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
                Alert.alert('모든 이미지가 용량 초과로 제외되었습니다.');
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

    const handleTempSave = () => {};

    const itemUpload = async () => {
        setLoading(true);
        const isValid = Boolean(
            title.trim() &&
            description.trim() &&
            startPrice.trim() &&
            images.length > 0
        );

        if(!isValid) {
            Alert.alert("사진, 제목, 설명, 시작가는 필수 항목입니다.");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('startTime', startDate.toISOString());
        formData.append('endTime', endDate.toISOString());
        formData.append('startPrice', Number(startPrice.replace(/,/g, '')));
        formData.append('bidUnit', Number(bidIncrement.replace(/,/g, '')));
        formData.append('buyNowPrice', Number(buyNowPrice.replace(/,/g, '')));
        formData.append('isBidUnit', bidIncrement === '' || bidIncrement === 0 ? 0 : 1);
        formData.append('status', 1);

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
            // console.log(error);
            Toast.show({
                ...toastOptions,
                type: 'error',
                text1: '경매물품 등록에 실패했습니다.',
            });
        } finally {
            setLoading(false);
        }
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

    const formatDate = (date) => {
        const pad = (n) => String(n).padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
               `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    const formatCurrencyInput = (text) => {
        var numeric = text.replace(/[^0-9]/g, '');
        if(numeric.startsWith('0') && numeric.length > 1) {
            numeric = numeric.replace(/^0+/, '');
        }

        return numeric;
    }


    return (
        <SafeTopWrapper style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
                <AppText style={styles.headerTitle}>내 물건 경매</AppText>
                <TouchableOpacity onPress={handleTempSave} disabled={!isDirty}>
                    <AppText style={[styles.headerBtn, !isDirty && styles.headerBtnDisabled]}>임시저장</AppText>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollArea} contentContainerStyle={styles.contentContainer}>
                {/* 사진 추가 */}
                <AppText style={styles.label}>
                    <RequiredLabel>사진 추가</RequiredLabel>
                </AppText>
                <View style={styles.imageContainer}>
                    {images.length < 10 && (
                        <TouchableOpacity style={styles.addButton} onPress={pickImage}>
                            <AppText style={styles.addButtonText}>+</AppText>
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

                {/* 제목 등 나머지 폼 */}
                <AppText style={styles.label}>
                    <RequiredLabel>제목</RequiredLabel>
                </AppText>
                <TextInput style={styles.input} placeholder="타이틀을 작성해 주세요." value={title} onChangeText={setTitle} />
                <AppText style={styles.label}>
                    <RequiredLabel>설명</RequiredLabel>
                </AppText>
                <TextInput style={[styles.input, styles.textArea]} placeholder={"사람들에게 입찰을 받을 수 있게 신뢰할 수 있는 내용을\n작성해 주세요.\n\n등록 금지 물품은 제한되거나, 삭제될 수 있어요."} value={description} onChangeText={setDescription} multiline />
                <AppText style={styles.label}>
                    <RequiredLabel>시작가 (₩)</RequiredLabel>
                </AppText>
                <TextInput
                    style={styles.input}
                    placeholder="예: 10,000"
                    value={startPrice.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    onChangeText={(text) => {
                        const formattedStartPrice = formatCurrencyInput(text);
                        setStartPrice(formattedStartPrice);
                    }}
                    keyboardType="number-pad" />
                <AppText style={styles.label}>입찰 단위 (₩)</AppText>
                <TextInput
                    style={styles.input}
                    placeholder="예: 1,000"
                    value={bidIncrement.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    onChangeText={(text) => {
                        const formattedBidPrice = formatCurrencyInput(text);
                        setBidIncrement(formattedBidPrice);
                    }}
                    keyboardType="number-pad" />
                <AppText style={styles.label}>즉시 구매가 (₩)</AppText>
                <TextInput
                    style={styles.input}
                    placeholder="예: 50,000"
                    value={buyNowPrice.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    onChangeText={(text) => {
                        const formattedBuyNowPrice = formatCurrencyInput(text);
                        setBuyNowPrice(formattedBuyNowPrice)
                    }}
                    keyboardType="number-pad" />
            </ScrollView>

            <View style={styles.footer}>
                <AddButton title="등록하기" onPress={itemUpload} style={styles.footerButton} />
            </View>

            {loading && (
                <View style={styles.spinnerWrapper}>
                    <ActivityIndicator size="large" color="#6495ED" />
                </View>
            )}
        </SafeTopWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    header: {
        position: 'absolute', top: 0, left: 0, right: 0,
        height: HEADER_HEIGHT,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ccc',
        zIndex: 10, elevation: 10,
    },
    headerTitle: { fontSize: 18, fontWeight: '600' },
    headerBtn: { fontSize: 16, color: '#000' },
    headerBtnDisabled: { color: '#aaa' },
    scrollArea: {
        flex: 1,
        backgroundColor: '#fff',
        marginTop: STATUS_BAR_HEIGHT
    },
    contentContainer: {
        padding: 16,
        paddingBottom: FOOTER_HEIGHT + HOME_INDICATOR_HEIGHT + 40,
    },
    label: { marginTop: 20, fontSize: 14, fontWeight: '500', marginBottom: 12 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8, marginTop: 4 },
    textArea: { height: 100, textAlignVertical: 'top' },
    optionRow: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 },
    optionBtn: { paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, marginRight: 8, marginBottom: 8 },
    optionBtnActive: { backgroundColor: '#6495ED', borderColor: '#6495ED' },
    optionText: { fontSize: 12, color: '#000' },
    optionTextActive: { fontSize: 12, color: '#fff' },
    chosenDate: { fontSize: 14, color: '#333', marginBottom: 12 },

    // 이미지
    imageContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        paddingRight: 2,
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
    imageWrapper: {
        position: 'relative',
        marginRight: 10,
    },
    labelTag: {
        position: 'absolute',
        bottom: 12,
        left: 1,
        backgroundColor: '#6495ED', // 하늘색
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
    preview: {
        width: 60,
        height: 60,
        borderRadius: 8,
        borderWidth: 1,           // ✅ 테두리 추가
        borderColor: '#ccc',      // ✅ 연한 회색
        backgroundColor: '#fff',  // ✅ 이미지 없을 때 대비용 (선택)
    },
    deleteButton: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#6495ED',
        borderRadius: 12,
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },

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
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: FOOTER_HEIGHT + HOME_INDICATOR_HEIGHT + 24,
        paddingBottom: HOME_INDICATOR_HEIGHT,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        justifyContent: 'center',
        paddingHorizontal: 16,
        zIndex: 10,
        elevation: 10,
    },
    footerButton: {
        width: '100%',
        marginBottom: 20,
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