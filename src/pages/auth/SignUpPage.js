import React, { useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import AppText from '../../components/AppText';
import { SignUpContext } from '../../contexts/SignUpContext';
import { AuthContext } from '../../contexts/AuthContext';

const SignUpPage = () => {
    const { address } = useContext(SignUpContext);
    const { userInfo } = useContext(AuthContext);

    useEffect(() => {
        console.log(address);
        console.log(userInfo);
    }, []);
    return (
        <AppText>회원가입 페이지 입니다.</AppText>
    );
};

export default SignUpPage;