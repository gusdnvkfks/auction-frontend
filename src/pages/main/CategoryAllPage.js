// src/pages/common/CategoryAllPage.js

import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import SafeTopWrapper from '../../components/SafeTopWrapper';
import axios from 'axios';
import Config from 'react-native-config';
import { AuthContext } from '../../contexts/AuthContext';

const screenWidth = Dimensions.get('window').width;

const CategoryAllPage = ({ navigation }) => {
    const apiUrl = Config.API_URL;
    const { token } = useContext(AuthContext);

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        getCategoryList();
    }, []);

    const getCategoryList = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${apiUrl}/api/category/first/0`, {
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

    const handleMainCategoryClick = (category) => {
        navigation.navigate('CategoryItem', {
            mainCategoryId: category.id,
            mainCategoryName: category.name
        });
    };

    return (
        <SafeTopWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="angle-left" size={26} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>전체 카테고리</Text>
            </View>

            <View style={styles.container}>
                <ScrollView>
                    {categories.map((cate) => (
                        <View key={cate.id} style={styles.mainCategoryBox}>
                            <TouchableOpacity onPress={() => handleMainCategoryClick(cate)} style={styles.mainCategoryBtn}>
                                <Text style={styles.mainCategory}>{cate.name}</Text>
                            </TouchableOpacity>
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

export default CategoryAllPage;
