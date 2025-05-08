// DateTimeModal.js
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Modal, View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import AppText from './AppText';
import Ionicons from 'react-native-vector-icons/Ionicons';


const ITEM_HEIGHT = 40;
const PICKER_HEIGHT = 200;

const DateTimeModal = ({ title, visible, initialDate, onCancel, onConfirm }) => {
    const [step, setStep] = useState('date');

    const [tempYear, setTempYear] = useState(initialDate.getFullYear());
    const [tempMonth, setTempMonth] = useState(initialDate.getMonth()+1);
    const [tempDay, setTempDay] = useState(initialDate.getDate());
    const [tempHour, setTempHour] = useState(initialDate.getHours());
    const [tempMinute, setTempMinute] = useState(initialDate.getMinutes());

    // initialDate 가 바뀔 때마다 temp 초기화
    useEffect(() => {
        setTempYear(initialDate.getFullYear());
        setTempMonth(initialDate.getMonth()+1);
        setTempDay(initialDate.getDate());
        setTempHour(initialDate.getHours());
        setTempMinute(initialDate.getMinutes());
        setStep('date');
    }, [initialDate]);

    // 모달이 열릴 때마다 step을 'date'로 초기화
    useEffect(() => {
        if(visible) {
            setStep('date');
        }
    }, [visible]);

    // 년 배열 (현재 년도부터 +5년)
    const years = useMemo(() => {
        const y = [];
        const current = new Date().getFullYear();
        for(let i = current; i <= current + 5; i++) y.push(i);
        return y;
    }, []);
    // 월 배열
    const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
    // 특정 년·월의 일 수 계산 함수
    const daysForCount = (y, m) => new Date(y, m, 0).getDate();
    // 일 배열 (tempYear, tempMonth 변경 시 재생성)
    const days = useMemo(
        () => Array.from({ length: daysForCount(tempYear, tempMonth) }, (_, i) => i + 1),
        [tempYear, tempMonth]
    );
    // 시 배열
    const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
    // 분 배열
    const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);

    // 날짜 커밋: 단계 전환
    const commitDate = () => setStep('time');
    // 시간 커밋: onConfirm 호출
    const commitTime = () => {
        const finalDate = new Date(
            tempYear, tempMonth - 1, tempDay,
            tempHour, tempMinute
        );
        onConfirm(finalDate);
    };

    const WheelPicker = ({ data, selected, onSelect }) => {
        const ref = useRef(null);
        useEffect(() => {
            const idx = data.findIndex(v => v === selected);
            const scrollView = ref.current;
            if(scrollView && typeof scrollView.scrollTo === 'function' && idx >= 0) {
                setTimeout(() => {
                    if(scrollView) {
                        scrollView.scrollTo({ y: idx * ITEM_HEIGHT, animated: false });
                    }
                }, 0);
            }
        }, [selected, data]);
        return (
            <ScrollView
                ref={ref}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: (PICKER_HEIGHT - ITEM_HEIGHT) / 2 }}
                style={styles.wheel}
            >
                {data.map(v => (
                <TouchableOpacity
                    key={v}
                    onPress={() => onSelect(v)}
                    style={[
                        styles.wheelItem,
                        { height: ITEM_HEIGHT },
                        v === selected && styles.wheelItemSelected,
                    ]}
                >
                    <AppText style={v === selected ? styles.wheelTextSelected : styles.wheelText}>{v}</AppText>
                </TouchableOpacity>
                ))}
            </ScrollView>
        );
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
            <View style={styles.bg}>
                <View style={styles.modal}>
                    <AppText style={styles.modalTitle}>
                        {title}
                    </AppText>
                    <View style={styles.selectionBox} />
                    {step === 'date' ? (
                        <>
                            <View style={styles.labelRow}>
                                <AppText style={styles.columnLabel}>년</AppText>
                                <AppText style={styles.columnLabel}>월</AppText>
                                <AppText style={styles.columnLabel}>일</AppText>
                            </View>
                            <View style={styles.wheelsRow}>
                                <WheelPicker data={years} selected={tempYear} onSelect={setTempYear} />
                                <WheelPicker data={months} selected={tempMonth} onSelect={setTempMonth} />
                                <WheelPicker data={days} selected={tempDay} onSelect={setTempDay} />
                            </View>
                            <View style={styles.btnRow}>
                                <TouchableOpacity onPress={onCancel}>
                                    <AppText style={styles.btn}>취소</AppText>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={commitDate}>
                                    <AppText style={styles.btn}>다음</AppText>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity onPress={() => setStep('date')} style={styles.backIcon}>
                                <Ionicons name="arrow-back" size={20} color="#333" />
                            </TouchableOpacity>
                            <View style={styles.labelRow}>
                                <AppText style={styles.columnLabel}>시</AppText>
                                <AppText style={styles.columnLabel}>분</AppText>
                            </View>
                            <View style={styles.wheelsRow}>
                                <WheelPicker data={hours} selected={tempHour} onSelect={setTempHour} />
                                <WheelPicker data={minutes} selected={tempMinute} onSelect={setTempMinute} />
                            </View>
                            <View style={styles.btnRow}>
                                <TouchableOpacity onPress={onCancel}>
                                    <AppText style={styles.btn}>취소</AppText>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={commitTime}>
                                    <AppText style={styles.btn}>완료</AppText>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    bg: {
        flex: 1,
        backgroundColor: '#00000088',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 12,
    },
    modalTitle: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 8
    },
    selectionBox: {
        position: 'absolute',
        left: '5%',
        right: '5%',
        height: ITEM_HEIGHT,
        top: (PICKER_HEIGHT / 2) + 16,
        borderColor: '#00796b',
        borderWidth: 2,
        borderRadius: 8,
    },
    wheelsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        height: PICKER_HEIGHT,
        marginBottom: 16,
    },
    wheel: {
        width: '30%',
        backgroundColor: '#fafafa',
        borderRadius: 8,
        borderColor: '#ddd',
        borderWidth: 1,
    },
    wheelItem: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    wheelItemSelected: {
        backgroundColor: '#e0f2f1',
    },
    wheelText: {
        fontSize: 18,
        color: '#444',
    },
    wheelTextSelected: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#00796b',
    },
    btnRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    btn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#6495ED',
        backgroundColor: '#6495ED',
        borderRadius: 4,
        marginBottom: 8,
        color: "#fff"
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 8,
    },
    columnLabel: {
        width: '30%',          // 휠 너비와 맞추기
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
});
  

export default DateTimeModal;