import React, { useEffect } from 'react';
import axios from 'axios';
import IMP from 'iamport-react-native';

import Config from 'react-native-config';
import { useSelector, useDispatch } from 'react-redux';
import { setUserInfo } from '../../features/signupSlice';

const VerifyPage = ({ navigation }) => {
    const dispatch = useDispatch();
    // Redux 상태 가져오기
    const userInfo = useSelector(state => state.signup.userInfo);

    useEffect(() => {
        if (userInfo.name && userInfo.phone) {
          navigation.replace('Splash', {
            nextPage: "Main",
            text: '회원가입 진행중 입니다.',
          });
        }
    }, [userInfo, navigation]);

    const getAccessToken = async () => {
        const { data } = await axios.post(
            'https://api.iamport.kr/users/getToken',
            {
                imp_key: Config.IMP_API_KEY,       // 포트원 관리자콘솔에서 발급받은 API Key
                imp_secret: Config.IMP_API_SECRET_KEY  // 포트원 관리자콘솔에서 발급받은 API Secret
            },
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );
        return data.response.access_token;
    }

    const certificationCallback = async (response) => {
        console.log(response);
        if(response.success === "true") {
            const impToken = await getAccessToken();
            console.log(impToken);
            const res = await axios.get(
                "https://api.iamport.kr/certifications/" + response.imp_uid, 
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': impToken
                    }
                }
            );

            const info = res.data?.response;
            if(info?.certified) {
                dispatch(setUserInfo({
                    name: info.name,
                    phone: info.phone,
                }));
            }
        }else {
            // 실패
            navigation.goBack();
        }
    }

    const data = {
        merchant_uid: `mid_${Date.now()}`,
        company: 'inicis_unified',
        name: '',
        phone:  '',
        carrier: '',
    };

    return (
        <IMP.Certification
            userCode={Config.IMP_CHAIN_IDENTICODE}
            data={data}
            callback={certificationCallback}
        />
    );
}

export default VerifyPage;