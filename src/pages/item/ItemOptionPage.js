import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform  } from 'react-native';
import SafeTopWrapper from '../../components/SafeTopWrapper';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { ItemUploadContext } from '../../contexts/ItemUploadProvider';

const PRIMARY_COLOR = '#6495ED';

const AuctionOptionPage = ({ navigation }) => {
    const { setAuctionOption } = useContext(ItemUploadContext);

    const toastOptions = {
        position: 'bottom',
        bottomOffset: 120,
        visibilityTime: 2000,
    };

    // 상품 상태
    const [productState, setProductState] = useState('중고');

    // 경매 기간
    const END_OPTIONS = ['수동마감', '3일뒤', '1주일뒤', '직접입력'];
    const [endOption, setEndOption] = useState('수동마감');
    const [endDate, setEndDate] = useState(new Date());
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    const [isManualSelected, setIsManualSelected] = useState(false);

    // 경매 가격 옵션
    const [bidUnit, setBidUnit] = useState('');
    const [buyNowPrice, setBuyNowPrice] = useState('');

    const formatDate = (date) => {
        const yyyy = date.getFullYear();
        const mm = ('0' + (date.getMonth() + 1)).slice(-2);
        const dd = ('0' + date.getDate()).slice(-2);
        const hh = ('0' + date.getHours()).slice(-2);
        const mi = ('0' + date.getMinutes()).slice(-2);
        return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
    }

    // 옵션 저장하기
    const handleSubmit = () => {
        setAuctionOption({
            productState,
            endOption,
            endDate: endDate.toISOString(),
            bidUnit: bidUnit.replace(/,/g, ''),
            buyNowPrice: buyNowPrice.replace(/,/g, ''),
        });

        navigation.goBack();
    };

    // 콤마 찍기
    const formatCurrency = (value) => {
        if (!value) return '';
        const num = value.replace(/,/g, '');  // 콤마 제거
        if (isNaN(num)) return '';
        return Number(num).toLocaleString();
    };

    return (
        <SafeTopWrapper>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0} // 필요시 조절
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="angle-left" size={26} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>경매 옵션</Text>
                </View>
                <ScrollView contentContainerStyle={styles.container}>
                    {/* 상품 상태 */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>상품 상태</Text>
                        <View style={styles.topNoticeBox}>
                            <Ionicons name="information-circle-outline" size={18} color="#ccc" style={{ marginRight: 6 }} />
                            <Text style={styles.topNoticeText}>
                                경매 물품의 상태를 선택해주세요.
                            </Text>
                        </View>
                        <View style={styles.row}>
                            <TouchableOpacity style={[styles.optionButton, productState === '중고' && styles.optionButtonSelected]} onPress={() => setProductState('중고')}>
                                <Text style={[styles.optionText, productState === '중고' && styles.optionTextSelected]}>중고</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.optionButton, productState === '새상품' && styles.optionButtonSelected]} onPress={() => setProductState('새상품')}>
                                <Text style={[styles.optionText, productState === '새상품' && styles.optionTextSelected]}>새상품</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 경매 기간 */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>경매 기간</Text>
                        <View style={styles.topNoticeBox}>
                            <Ionicons name="information-circle-outline" size={18} color="#ccc" style={{ marginRight: 6 }} />
                            <Text style={styles.topNoticeText}>
                                경매 마감시간을 선택해주세요.
                            </Text>
                        </View>
                        <View style={styles.gridRow}>
                            {END_OPTIONS.map((opt, index) => (
                                <TouchableOpacity
                                    key={opt}
                                    style={[
                                        styles.gridButton,
                                        endOption === opt && styles.gridButtonSelected,
                                        index % 2 === 0 ? { marginRight: 8 } : null // 좌우 간격 부여
                                    ]}
                                    onPress={() => {
                                        if (opt === '직접입력') {
                                            setDatePickerVisibility(true);
                                        } else {
                                            setEndOption(opt);
                                            setIsManualSelected(false);
                                            const now = new Date();
                                            let newDate = now;
                                            if (opt === '3일뒤') newDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
                                            else if (opt === '1주일뒤') newDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                                            else newDate = new Date('9999-12-31T23:59:59');
                                            setEndDate(newDate);
                                        }
                                    }}
                                >
                                    <Text style={[styles.gridButtonText, endOption === opt && styles.gridButtonTextSelected]}>
                                        {opt}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* 선택한 시간 표시 */}
                        <View style={{ marginTop: 10 }}>
                            {endOption === '수동마감' ? (
                                <Text style={styles.selectedDate}>수동마감</Text>
                            ) : (
                                <Text style={styles.selectedDate}>마감 시간: {formatDate(endDate)}</Text>
                            )}
                        </View>
                    </View>

                    {/* 경매 가격 옵션 */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>경매 가격 옵션 <Text style={{ color: '#ccc' }}>(선택)</Text></Text>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>입찰 단위 (원)</Text>
                            <View style={styles.topNoticeBox}>
                                <Ionicons name="information-circle-outline" size={18} color="#ccc" style={{ marginRight: 6 }} />
                                <Text style={styles.topNoticeText}>
                                    설정한 금액 단위로만 입찰을 할 수 있습니다.
                                </Text>
                            </View>
                            <TextInput style={styles.input} keyboardType="numeric" value={bidUnit} onChangeText={(text) => setBidUnit(formatCurrency(text))} placeholder="입찰단위 : 숫자만 입력해주세요." />
                        </View>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>즉시 구매가 (원)</Text>
                            <View style={styles.topNoticeBox}>
                                <Ionicons name="information-circle-outline" size={18} color="#ccc" style={{ marginRight: 6 }} />
                                <Text style={styles.topNoticeText}>
                                    입찰을 하여 기다리지 않는 즉시구매가 입니다.
                                </Text>
                            </View>
                            <TextInput style={styles.input} keyboardType="numeric" value={buyNowPrice} onChangeText={(text) => setBuyNowPrice(formatCurrency(text))} placeholder="즉시 구매가 : 숫자만 입력해주세요." />
                        </View>
                    </View>
                </ScrollView>

                {/* 모달 라이브러리 적용 */}
                <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="datetime"
                    date={endDate}
                    onConfirm={(date) => {
                        const now = new Date();
                        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

                        // 경매 마감시간은 최소 현재 시간보다 한시간 뒤에만 가능
                        if(date < oneHourLater) {
                            Toast.show({
                                ...toastOptions,
                                type: 'error',
                                text1: '마감시간은 현재시간보다 최소 1시간 이후로 설정해야 합니다.',
                            });
                            return;
                        }

                        setEndDate(date);
                        setEndOption('직접입력');
                        setIsManualSelected(true);
                        setDatePickerVisibility(false);
                    }}
                    onCancel={() => {
                        setDatePickerVisibility(false);
                        if (!isManualSelected) {
                            setEndOption('수동마감');
                        }
                    }}
                    locale="ko" // 한글화 (선택)
                />

                <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
                    <Text style={styles.saveButtonText}>선택 완료</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>

        </SafeTopWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingHorizontal: 10,
        position: 'relative',
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 4,
        zIndex: 10
    },
    headerTitle: {
        position: 'absolute',
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 16,
        color: '#000'
    },
    container: { padding: 20 },
    section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5, elevation: 3 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
    // 경고 문구
    topNoticeBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 15
    },
    topNoticeText: {
        fontSize: 12,
        lineHeight: 18,
        flex: 1,
        color: "#ccc",
    },
    inputWrapper: { marginBottom: 15 },
    inputLabel: { fontSize: 12, marginBottom: 8 },
    gridRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gridButton: {
        width: '48%',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingVertical: 5,
        marginBottom: 10,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    gridButtonSelected: {
        backgroundColor: PRIMARY_COLOR,
        borderColor: PRIMARY_COLOR,
    },
    gridButtonText: {
        fontSize: 12,
        color: '#333',
    },
    gridButtonTextSelected: {
        color: '#fff',
        fontWeight: 'bold',
    },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 14 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    optionButton: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 8, marginHorizontal: 5, alignItems: 'center' },
    optionButtonSelected: { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR },
    optionText: { fontSize: 12, color: '#333' },
    optionTextSelected: { color: '#fff', fontWeight: 'bold' },
    selectedDate: { marginTop: 10, fontSize: 12, color: '#666666' },
    saveButton: {
        backgroundColor: PRIMARY_COLOR, 
        padding: 15,
        borderRadius: 10, 
        marginVertical: 20, 
        paddingHorizontal: 16,
    },
    saveButtonText: { color: '#fff', fontSize: 16, textAlign: 'center' }
});

export default AuctionOptionPage;
