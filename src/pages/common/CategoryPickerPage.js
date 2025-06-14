// src/pages/common/CategoryPickerPage.js

import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

import SafeTopWrapper from '../../components/SafeTopWrapper';
import axios from 'axios';
import Config from 'react-native-config';
import { AuthContext } from '../../contexts/AuthContext';

// const categories = [
//     {
//         id: 1,
//         name: '여성의류',
//         subCategories: ['상의', '하의', '아우터', '원피스']
//     },
//     {
//         id: 2,
//         name: '남성의류',
//         subCategories: ['상의', '하의', '아우터', '정장']
//     },
//     {
//         id: 3,
//         name: '디지털',
//         subCategories: ['노트북', '휴대폰', '태블릿', '스마트워치']
//     },
//     {
//         id: 4,
//         name: '가전제품',
//         subCategories: ['청소기', '에어컨', '냉장고', '세탁기']
//     }
// ];

const CategoryPickerPage = ({ navigation }) => {
    const apiUrl = Config.API_URL;
    const { token } = useContext(AuthContext);

    // 로딩 스피터
    const [loading, setLoading] = useState(false);
    // 카테고리 목록
    const [categories, setCategories] = useState([]);
    // 선택한 카테고리
    const [selectedCategory, setSelectedCategory] = useState({
        "categoryId": null,
        "categoryName": "",
    });
    
    // 선택했을 때 itemUpload로 보내기
    const handleSelect = (mainCategory, subCategory) => {
        navigation.navigate('ItemUpload', {
            selectedCategory: `${mainCategory} > ${subCategory}`
        });
    };

    // 페이지 진입 시 카테고리 목록 조회하기
    useEffect(() => {
        getCategoryList();
    }, []);

    // 카테고리 목록 조회
    const getCategoryList = async () => {
        try {
            const res = await axios.get(`${apiUrl}/api/category`, {
                params: {
                    mode: "main"
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if(res.data.result === "success") {
                setCategories(res.data.categories);
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <SafeTopWrapper>
            <View style={styles.container}>
                <ScrollView>
                    {categories.map((cat) => (
                    <View key={cat.id} style={styles.mainCategoryBox}>
                        <Text style={styles.mainCategory}>{cat.name}</Text>
                        <View style={styles.subCategoryContainer}>
                        {cat.subCategories.map((sub, idx) => (
                            <TouchableOpacity 
                            key={idx}
                            style={styles.subCategoryBtn}
                            onPress={() => handleSelect(cat.name, sub)}
                            >
                            <Text style={styles.subCategoryText}>{sub}</Text>
                            </TouchableOpacity>
                        ))}
                        </View>
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
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16
    },
    mainCategoryBox: {
        marginBottom: 20
    },
    mainCategory: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333'
    },
    subCategoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    subCategoryBtn: {
        backgroundColor: '#E6EFFB',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        marginBottom: 10
    },
    subCategoryText: { color: '#6495ED', fontSize: 13 }
});

export default CategoryPickerPage;
