// // src/components/IdentityVerify.js
// import React from 'react';
// import { View, ActivityIndicator, StyleSheet } from 'react-native';
// import IMP from 'iamport-react-native';
// import Config from 'react-native-config';

// const IdentityVerify = ({ navigation, onSuccess, onFail }) => {
//     // 아임포트에 등록된 내 가맹점의 REST API 키
//     const userCode = Config.IMP_API_KEY;  
//     console.log(userCode);

//     // 콜백으로 돌아올 데이터 포맷
//     const callback = (response) => {
//         // response.success: boolean
//         // response.imp_uid, response.merchant_uid, response.name, response.birth, ...
//         if (response.success) {
//             onSuccess(response);   // 예: { imp_uid, merchant_uid, ... }
//         } else {
//             onFail(response);      // 예: { success: false, error_msg: '…' }
//         }
//         // 화면 닫기 -> SignUp 페이지로 보내주기기
//         navigation.goBack();
//     };

//     return (
//         <View style={styles.container}>
//             <IMP.Certification
//                 loading={<ActivityIndicator size="large" />}
//                 userCode={userCode}
//                 data={{ 
//                     // merchant_uid는 유니크하게 만드셔야 합니다.
//                     merchant_uid: `mid_${new Date().getTime()}`,  
//                     // 실명인증 타입 설정: 
//                     //   ‘cert’ → 본인인증만, 
//                     //   ‘mobile’ → 휴대폰 실명인증 + 정보제공 동의
//                     // 기본값은 mobile
//                     type: 'mobile',  
//                 }}
//                 callback={callback}
//             />
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: { flex: 1 },
// });

// export default IdentityVerify;