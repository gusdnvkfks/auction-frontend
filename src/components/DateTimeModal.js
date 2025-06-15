import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Modal, View, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import AppText from './AppText';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ITEM_HEIGHT = 40;
const PICKER_HEIGHT = 200;

const DateTimeModal = ({ title, visible, initialDate, onCancel, onConfirm }) => {
    const [step, setStep] = useState('date');
    const [selectedDate, setSelectedDate] = useState(initialDate);

    // 항상 렌더 유지, visible 변경시만 초기화 (핵심)
    useEffect(() => {
        if (visible) {
            setStep('date');
            setSelectedDate(initialDate);
        }
    }, [visible, initialDate]);

    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    const day = selectedDate.getDate();
    const hour = selectedDate.getHours();
    const minute = selectedDate.getMinutes();

    const years = useMemo(() => {
        const current = new Date().getFullYear();
        return Array.from({ length: 6 }, (_, i) => current + i);
    }, []);
    const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
    const days = useMemo(() => {
        const dayCount = new Date(year, month, 0).getDate();
        return Array.from({ length: dayCount }, (_, i) => i + 1);
    }, [year, month]);
    const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
    const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);

    const updateDate = (y, m, d, h, min) => {
        const updated = new Date(y, m - 1, d, h, min);
        setSelectedDate(updated);
    };

    const WheelPicker = ({ data, selected, onSelect }) => {
        const ref = useRef(null);
        useEffect(() => {
            const idx = data.findIndex(v => v === selected);
            if (ref.current && idx >= 0) {
                setTimeout(() => {
                    ref.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: false });
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
                        style={[styles.wheelItem, { height: ITEM_HEIGHT }, v === selected && styles.wheelItemSelected]}
                    >
                        <AppText style={v === selected ? styles.wheelTextSelected : styles.wheelText}>{v}</AppText>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onCancel}
            presentationStyle={Platform.OS === 'android' ? 'overFullScreen' : 'fullScreen'} // 안정화 핵심
        >
            <View style={styles.bg}>
                <View style={styles.modal}>
                    <AppText style={styles.modalTitle}>{title}</AppText>
                    <View style={styles.selectionBox} />

                    {step === 'date' ? (
                        <>
                            <View style={styles.labelRow}>
                                <AppText style={styles.columnLabel}>년</AppText>
                                <AppText style={styles.columnLabel}>월</AppText>
                                <AppText style={styles.columnLabel}>일</AppText>
                            </View>
                            <View style={styles.wheelsRow}>
                                <WheelPicker data={years} selected={year} onSelect={(v) => updateDate(v, month, day, hour, minute)} />
                                <WheelPicker data={months} selected={month} onSelect={(v) => updateDate(year, v, day, hour, minute)} />
                                <WheelPicker data={days} selected={day} onSelect={(v) => updateDate(year, month, v, hour, minute)} />
                            </View>
                            <View style={styles.btnRow}>
                                <TouchableOpacity onPress={onCancel}><AppText style={styles.btn}>취소</AppText></TouchableOpacity>
                                <TouchableOpacity onPress={() => setStep('time')}><AppText style={styles.btn}>다음</AppText></TouchableOpacity>
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
                                <WheelPicker data={hours} selected={hour} onSelect={(v) => updateDate(year, month, day, v, minute)} />
                                <WheelPicker data={minutes} selected={minute} onSelect={(v) => updateDate(year, month, day, hour, v)} />
                            </View>
                            <View style={styles.btnRow}>
                                <TouchableOpacity onPress={onCancel}><AppText style={styles.btn}>취소</AppText></TouchableOpacity>
                                <TouchableOpacity onPress={() => onConfirm(selectedDate)}><AppText style={styles.btn}>완료</AppText></TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    bg: { flex: 1, backgroundColor: '#00000088', justifyContent: 'center', alignItems: 'center' },
    modal: { width: '90%', backgroundColor: '#fff', borderRadius: 12, paddingVertical: 16, paddingHorizontal: 12 },
    modalTitle: { fontSize: 14, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
    selectionBox: { position: 'absolute', left: '5%', right: '5%', height: ITEM_HEIGHT, top: (PICKER_HEIGHT / 2) + 16, borderColor: '#00796b', borderWidth: 2, borderRadius: 8 },
    wheelsRow: { flexDirection: 'row', justifyContent: 'space-around', height: PICKER_HEIGHT, marginBottom: 16 },
    wheel: { width: '30%', backgroundColor: '#fafafa', borderRadius: 8, borderColor: '#ddd', borderWidth: 1 },
    wheelItem: { justifyContent: 'center', alignItems: 'center' },
    wheelItemSelected: { backgroundColor: '#e0f2f1' },
    wheelText: { fontSize: 18, color: '#444' },
    wheelTextSelected: { fontSize: 20, fontWeight: 'bold', color: '#00796b' },
    btnRow: { flexDirection: 'row', justifyContent: 'space-between' },
    btn: { paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: '#6495ED', backgroundColor: '#6495ED', borderRadius: 4, marginBottom: 8, color: "#fff" },
    labelRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
    columnLabel: { width: '30%', textAlign: 'center', fontSize: 16, fontWeight: '500', color: '#333' },
});

export default DateTimeModal;
