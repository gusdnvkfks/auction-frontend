import React, { useContext, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import SafeTopWrapper from '../../components/SafeTopWrapper';
import Icon from 'react-native-vector-icons/FontAwesome'
import Config from 'react-native-config';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';

const ReportConfirmPage = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const apiUrl = Config.API_URL;

    const { reason, targetId, targetType } = route.params;

    const [content, setContent] = useState('');
    const [hideUserPosts, setHideUserPosts] = useState(false);

    const { token } = useContext(AuthContext);
    
    const handleSubmit = async () => {
        // 여기서 신고 API 요청 보내면 됨
        try {
            const res = await axios.post(`${apiUrl}/api/report/create`,
                {
                    reason: reason,
                    targetId: targetId,
                    targetType: targetType,
                    hideUserPosts: hideUserPosts,
                    content: content,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            if(res.data.result === "success") {
                Toast.show({
                    type: 'success',
                    text1: '신고가 접수되었습니다.',
                    text2: hideUserPosts ? '이 사용자의 게시글은 더 이상 보이지 않습니다.' : undefined,
                    position: 'bottom',
                    bottomOffset: 120,
                    visibilityTime: 2000,
                });

                navigation.reset({
                    index: 1,
                    routes: [
                        { 
                            name: 'Main' 
                        },
                        {
                            name: 'ItemDetail',
                            params: { itemId: res.data.targetId },
                        },
                    ],
                });
            }

        }catch(error) {
            console.log(error);
            Toast.show({
                type: 'error',
                text1: error.response?.data.message,
                position: 'bottom',
                bottomOffset: 120,
                visibilityTime: 2000,
            });
        }
    };

    return (
        <SafeTopWrapper>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="angle-left" size={28} color={'#333'} />
                </TouchableOpacity>

                <Text style={styles.title}>이유: {reason}</Text>

                <Text style={styles.label}>상세 내용 (선택)</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder="자세한 사유를 입력해주세요."
                    value={content}
                    onChangeText={setContent}
                    multiline
                />

                <TouchableOpacity onPress={() => setHideUserPosts(prev => !prev)} style={styles.checkboxRow}>
                    <Icon
                        name={hideUserPosts ? 'check-square-o' : 'square-o'}
                        size={22}
                        color={hideUserPosts ? '#6495ED' : '#aaa'}
                    />
                    <Text style={styles.checkboxLabel}>이 사용자의 게시글 보지 않기</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitText}>신고 제출</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeTopWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    backButton: {
        marginBottom: 20,
    },
    backText: {
        fontSize: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    label: {
        fontSize: 14,
        marginBottom: 10,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        height: 100,
        padding: 10,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
    },
    checkboxLabel: {
        marginLeft: 10,
        fontSize: 14,
        color: '#333',
    },
    submitButton: {
        backgroundColor: '#6495ED',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ReportConfirmPage;
