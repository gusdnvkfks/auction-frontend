import axios from 'axios';
import IMP from 'iamport-react-native';
import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

const VerifyPage = ({ navigation }) => {
    const { setCertificationInfo } = useContext(AuthContext);

    const getAccessToken = async () => {
        const { data } = await axios.post(
            'https://api.iamport.kr/users/getToken',
            {
                imp_key: '3015423132473177',       // 포트원 관리자콘솔에서 발급받은 API Key
                imp_secret: 'NbPI4ZNkeKZ3nWtP6QuZGm6Sn5aCpjTek1vMuPUIdR8J9hhbg7JpUPO5zqsOLnicmCu15QY9fQu80lpA'  // 포트원 관리자콘솔에서 발급받은 API Secret
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
            await axios
                .get("https://api.iamport.kr/certifications/" + response.imp_uid, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': impToken
                    }
                })
                .then(res => {
                    console.log(res);
                    if(res.data) {
                        if(res.data.response) {
                            setCertificationInfo({
                                name: res.data.response.name,
                                phone: res.data.response.phone,
                            });
                            navigation.navigate("SignUpFlow", {
                                screen: "SignUp",
                                params: {},
                            });
                        }else {
                            // 이상함
                        }
                    }else {
                        // 이상함함
                    }
                })
                .catch(error => {
                    console.log(error);
                })
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
            userCode="imp68575328"
            data={data}
            callback={certificationCallback}
        />
    );
}

export default VerifyPage;