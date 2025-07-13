// src/pages/common/CategoryPickerPage.js

import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import SafeTopWrapper from '../../components/SafeTopWrapper';
import axios from 'axios';
import Config from 'react-native-config';
import { AuthContext } from '../../contexts/AuthContext';
import { ItemUploadContext } from '../../contexts/ItemUploadProvider';

const screenWidth = Dimensions.get('window').width;

const CategoryPickerPage = ({ navigation, route }) => {
    const apiUrl = Config.API_URL;
    const { token } = useContext(AuthContext);

    const { 
        mainCategoryId, setMainCategoryId, 
        subCategoryId, setSubCategoryId, 
        selectedCategory, setSelectedCategory 
    } = useContext(ItemUploadContext);

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [openCategoryId, setOpenCategoryId] = useState(null);

    // 카테고리 목록 가져오기
    useEffect(() => {
        console.log(subCategoryId);
        getCategoryList();
    }, []);

    // 기존에 선택한 카테고리가 있으면 표시해주기
    useEffect(() => {
        if (mainCategoryId) {
            setOpenCategoryId(mainCategoryId);
        }
    }, [mainCategoryId]);

    const getCategoryList = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${apiUrl}/api/category`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.result === "success") {
                setCategories(res.data.categories);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleMainCategoryClick = (id) => {
        setOpenCategoryId(prev => prev === id ? null : id);
    };

    const selectCategory = (mainCategoryId, subCategoryId, mainCategoryName, subCategoryName) => {
        setMainCategoryId(mainCategoryId);
        setSubCategoryId(subCategoryId);
        setSelectedCategory(`${mainCategoryName} > ${subCategoryName}`);
        navigation.goBack();
    };

    return (
        <SafeTopWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="angle-left" size={26} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>카테고리</Text>
            </View>

            <View style={styles.container}>
                <ScrollView>
                    {categories.map((cate) => (
                        <View key={cate.id} style={styles.mainCategoryBox}>
                            <TouchableOpacity onPress={() => handleMainCategoryClick(cate.id)} style={styles.mainCategoryBtn}>
                                <Text style={styles.mainCategory}>{cate.name}</Text>
                                <Icon
                                    name={openCategoryId === cate.id ? 'angle-up' : 'angle-down'}
                                    size={20}
                                    color="#333333"
                                    style={{ marginLeft: 8 }}
                                />
                            </TouchableOpacity>

                            {openCategoryId === cate.id && (
                                <View style={styles.subCategoryContainer}>
                                    {cate.subCategories.map((sub, idx) => {
                                        const total = cate.subCategories.length;
                                        const rows = Math.ceil(total / 2);
                                        const isLastRow = idx >= (rows - 1) * 2;

                                        return (
                                            <TouchableOpacity 
                                                key={sub.id}
                                                style={[
                                                    styles.subCategoryBtn,
                                                    isLastRow && { borderBottomWidth: 0 },
                                                ]}
                                                onPress={() => selectCategory(cate.id, sub.id, cate.name, sub.name)}
                                            >
                                                <Text style={[
                                                    styles.subCategoryText,
                                                    subCategoryId === sub.id && styles.selectedSubCategoryText
                                                ]}>
                                                    {sub.name}
                                                </Text>
                                            </TouchableOpacity>
                                        )
                                    })}
                                </View>
                            )}
                            <View style={styles.divider} />
                        </View>
                    ))}
                </ScrollView>
            </View>

            {loading && (
                <View style={styles.spinnerWrapper}>
                    <ActivityIndicator size="large" color="#6495ED" />
                </View>
            )}
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
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16
    },
    mainCategoryBox: {
        marginBottom: 10
    },
    mainCategoryBtn: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    mainCategory: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333333'
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginTop: 8
    },
    subCategoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    subCategoryBtn: {
        width: (screenWidth - 40 - 10) / 2,
        paddingVertical: 12,
        marginBottom: 10,
        alignItems: 'flex-start',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    subCategoryText: {
        color: '#333',
        fontSize: 12
    },
    selectedSubCategoryText: {
        color: '#6495ED',
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
        zIndex: 999
    }
});

export default CategoryPickerPage;
