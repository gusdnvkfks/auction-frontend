import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, StyleSheet, TouchableOpacity,
    FlatList, ScrollView, ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// 가로 스크롤용 컴포넌트 (여기만 추가)
const CategoryHorizontalList = ({ categories }) => {
    const navigation = useNavigation();
    
    // 해당 카테고리 아이템 목록으로 가기
    const selectCategory = async (categoryId) => {
        if(categoryId === 0) {
            navigation.navigate("CategoryAll");
        }
    }
    return (
        <View style={styles.categorySection}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryList}
            >
                <TouchableOpacity style={styles.moreButton} onPress={() => selectCategory(0)}>
                    <Text style={styles.moreText}>전체</Text>
                </TouchableOpacity>
                {categories.map((cate, index) => (
                    <TouchableOpacity key={index} style={styles.categoryItem} onPress={() => selectCategory(cate.id)}>
                        <Text style={styles.categoryText}>{cate.name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};


const styles = StyleSheet.create({
    categorySection: {
        padding: 12,
        borderBottomWidth: 1,
        borderColor: '#eee'
    },
    categoryList: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryItem: {
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginRight: 10,
    },
    categoryText: {
        fontSize: 12,
        color: '#333',
    },
    moreButton: {
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        backgroundColor: '#E6F0FD',
        borderColor: '#6495ED',
        marginRight: 10,
    },
    moreText: {
        fontSize: 12,
        color: '#333',
    }

});

export default CategoryHorizontalList;
