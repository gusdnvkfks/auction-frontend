import React, { useState } from 'react';
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
    Button,
} from 'react-native';
import axios from 'axios';
import Config from 'react-native-config';
import * as ImagePicker from 'react-native-image-picker';
import AppText from '../../components/AppText';
import AddButton from '../../components/AddButton';
import RequiredLabel from '../../components/RequireLabel';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

const STATUS_BAR_HEIGHT = Platform.OS === 'android'
    ? StatusBar.currentHeight
    : 20;
const HOME_INDICATOR_HEIGHT = Platform.OS === 'ios' ? 34 : 0;
const HEADER_HEIGHT = 48;
const FOOTER_HEIGHT = 56;

const ItemUploadPage = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startPrice, setStartPrice] = useState('');
    const [bidIncrement, setBidIncrement] = useState('');
    const [images, setImages] = useState([]);

    const [startOption, setStartOption] = useState('등록즉시');
    const [endOption, setEndOption] = useState('낙찰시까지');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date(Date.now() + 3*24*60*60*1000));

    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const [date, setDate] = useState(new Date());
    const [show, setShow] = useState(false);


    const pickImage = () => {
        ImagePicker.launchImageLibrary({ mediaType: 'photo' }, response => {
            if (response.didCancel) return;
            if (response.errorCode) {
                Alert.alert('이미지 선택 에러', response.errorMessage);
            } else {
                setImages(prev => [...prev, response.assets[0]]);
            }
        });
    };

    // Unified picker open
    const openPicker = async (event, selectedDate) => {
        console.log(target);
        console.log(Platform.OS);
        if (Platform.OS === 'android') {
            console.log("android??");
            const { type } = event;
            console.log(type);
        } else {
            setPickerTarget(target);
            setShowPicker(true);
        }
    };

    const onIOSPickerChange = (event, date) => {
        setShowPicker(false);
        if (date) {
            if (pickerTarget === 'start') {
                setStartDate(date);
                setStartOption('직접입력');
            } else {
                setEndDate(date);
                setEndOption('직접입력');
            }
        }
    };

    // Native Date + Time pickers
    const openAndroidPicker = (mode, target) => {
        DateTimePickerAndroid.open({
            value: target === 'start' ? startDate : endDate,
            onChange: (_, date) => {
                if (date) {
                    if (target === 'start') {
                        setStartDate(date);
                        setStartOption('직접입력');
                    } else {
                        setEndDate(date);
                        setEndOption('직접입력');
                    }
                }
            },
            mode: mode,
            is24Hour: true
        });
    };

    const onStartChange = (_, date) => {
        setShowStartPicker(false);
        if (date) {
            setStartDate(date);
            setStartOption('직접입력');
        }
    };
    const onEndChange = (_, date) => {
        setShowEndPicker(false);
        if (date) {
            setEndDate(date);
            setEndOption('직접입력');
        }
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
                <View>
                    <Button title="날짜 선택" onPress={() => setShow(true)} />
                    {show && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display="default"
                            onChange={openPicker}
                        />
                    )}
                </View>
                <View style={styles.optionRow}>
                    {['등록즉시','24시간후','직접입력'].map(opt => (
                        <TouchableOpacity
                            key={opt}
                            style={[styles.optionBtn, startOption === opt && styles.optionBtnActive]}
                            onPress={() => opt === '직접입력' ? openPicker('start') : setStartOption(opt)}
                        >
                            <AppText style={[styles.optionText, startOption === opt && styles.optionTextActive]}>{opt}</AppText>
                        </TouchableOpacity>
                    ))}
                </View>
                {startOption === '직접입력' && <AppText style={styles.chosenDate}>{startDate.toLocaleString()}</AppText>}

                {/* 경매 마감 시간 */}
                <AppText style={styles.label}>경매 마감 시간</AppText>
                <View style={styles.optionRow}>
                    {['3일후','1주일후','1개월후','낙찰시까지','직접입력'].map(opt => (
                        <TouchableOpacity
                            key={opt}
                            style={[styles.optionBtn, endOption === opt && styles.optionBtnActive]}
                            onPress={() => opt === '직접입력' ? openPicker('end') : setEndOption(opt)}
                        >
                            <AppText style={[styles.optionText, endOption === opt && styles.optionTextActive]}>{opt}</AppText>
                        </TouchableOpacity>
                    ))}
                </View>
                {endOption === '직접입력' && <AppText style={styles.chosenDate}>{endDate.toLocaleString()}</AppText>}

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
    optionText: { fontSize: 14, color: '#000' },
    optionTextActive: { color: '#fff' },
    chosenDate: { fontSize: 14, color: '#333', marginBottom: 12 },
});

export default ItemUploadPage;