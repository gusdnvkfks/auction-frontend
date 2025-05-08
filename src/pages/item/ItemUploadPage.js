import React, { useState, useMemo } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    ScrollView,
    Alert,
    TouchableOpacity,
    Image,
    SafeAreaView,
    StatusBar,
    Platform,
    Text,
} from 'react-native';
import axios from 'axios';
import Config from 'react-native-config';
import * as ImagePicker from 'react-native-image-picker';
import AppText from '../../components/AppText';
import AddButton from '../../components/AddButton';
import RequiredLabel from '../../components/RequireLabel';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimeModal from '../../components/DateTimeModal';

const STATUS_BAR_HEIGHT = Platform.OS === 'android'
    ? StatusBar.currentHeight
    : 20;
const HOME_INDICATOR_HEIGHT = Platform.OS === 'ios' ? 34 : 0;
const HEADER_HEIGHT = 48;
const FOOTER_HEIGHT = 56;

const START_OPTIONS = ['등록즉시', '1일뒤', '직접입력'];
const END_OPTIONS = ['수동마감', '3일뒤', '1주일뒤', '직접입력'];

const ItemUploadPage = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startPrice, setStartPrice] = useState('');
    const [bidIncrement, setBidIncrement] = useState('');
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

    const pickImage = () => {
        ImagePicker.launchImageLibrary({ mediaType: 'photo' }, response => {
            if(response.didCancel) return;
            if(response.errorCode) {
                Alert.alert('이미지 선택 에러', response.errorMessage);
            }else {
                setImages(prev => [...prev, response.assets[0]]);
            }
        });
    };

    const isDirty = Boolean(
        title.trim().length > 0 ||
        description.trim().length > 0 ||
        images.length > 0
    );

    const handleTempSave = () => {};

    const itemUpload = async () => {
        console.log(123);
        return;
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


    return (
        <SafeAreaView style={styles.container}>
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
                <AppText style={styles.label}>사진 추가</AppText>
                <View style={styles.imageContainer}>
                    {images.map((img, i) => (
                        <Image key={i} source={{ uri: img.uri }} style={styles.preview} />
                    ))}
                    <TouchableOpacity style={styles.addButton} onPress={pickImage}>
                        <AppText style={styles.addButtonText}>+</AppText>
                    </TouchableOpacity>
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
                <TextInput style={styles.input} placeholder="상품명을 입력하세요" value={title} onChangeText={setTitle} />
                <AppText style={styles.label}>
                    <RequiredLabel>설명</RequiredLabel>
                </AppText>
                <TextInput style={[styles.input, styles.textArea]} placeholder="상세 설명 입력" value={description} onChangeText={setDescription} multiline />
                <AppText style={styles.label}>
                    <RequiredLabel>시작가 (₩)</RequiredLabel>
                </AppText>
                <TextInput style={styles.input} placeholder="예: 10000" value={startPrice} onChangeText={setStartPrice} keyboardType="number-pad" />
                <AppText style={styles.label}>입찰 단위 (₩)</AppText>
                <TextInput style={styles.input} placeholder="예: 1000" value={bidIncrement} onChangeText={setBidIncrement} keyboardType="number-pad" />
                <AppText style={styles.label}>즉시 구매가 (₩)</AppText>
                <TextInput style={styles.input} placeholder="예: 1000" value={bidIncrement} onChangeText={setBidIncrement} keyboardType="number-pad" />
            </ScrollView>

            <View style={styles.footer}>
                <AddButton title="등록하기" onPress={itemUpload} style={styles.footerButton} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        position: 'absolute', top: 0, left: 0, right: 0,
        height: HEADER_HEIGHT + STATUS_BAR_HEIGHT,
        paddingTop: STATUS_BAR_HEIGHT,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ccc',
        zIndex: 10, elevation: 10,
    },
    headerTitle: { fontSize: 18, fontWeight: '600' },
    headerBtn: { fontSize: 16, color: '#000' },
    headerBtnDisabled: { color: '#aaa' },
    scrollArea: { flex: 1, backgroundColor: '#fff', marginTop: HEADER_HEIGHT + STATUS_BAR_HEIGHT },
    contentContainer: { padding: 16, paddingBottom: FOOTER_HEIGHT + HOME_INDICATOR_HEIGHT },
    label: { marginTop: 20, fontSize: 14, fontWeight: '500', marginBottom: 12 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8, marginTop: 4 },
    textArea: { height: 100, textAlignVertical: 'top' },
    imageContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
    preview: { width: 80, height: 80, marginRight: 8, marginBottom: 8, borderRadius: 4 },
    addButton: { width: 80, height: 80, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#6495ED', borderRadius: 4 },
    addButtonText: { fontSize: 32, fontWeight: '300' },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, height: FOOTER_HEIGHT + HOME_INDICATOR_HEIGHT, paddingBottom: HOME_INDICATOR_HEIGHT, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#ccc', justifyContent: 'center', paddingHorizontal: 16, zIndex: 10, elevation: 10 },
    footerButton: { width: '100%' },
    optionRow: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 },
    optionBtn: { paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, marginRight: 8, marginBottom: 8 },
    optionBtnActive: { backgroundColor: '#6495ED', borderColor: '#6495ED' },
    optionText: { fontSize: 12, color: '#000' },
    optionTextActive: { fontSize: 12, color: '#fff' },
    chosenDate: { fontSize: 14, color: '#333', marginBottom: 12 },

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
});

export default ItemUploadPage;