// src/utils/location.js

import { PermissionsAndroid, Platform } from 'react-native';

/**
 * 안드로이드에서 FINE_LOCATION 권한을 요청하고,
 * 허용된 경우에만 true를 반환합니다.
 */
export async function requestLocationPermission() {
    if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: '위치 권한 요청',
                message: '앱이 위치를 사용하도록 허용해주세요',
                buttonPositive: '허용',
                buttonNegative: '거부',
                buttonNeutral: '나중에',
            }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    // iOS는 별도 요청이 필요 없다고 가정
    return true;
}
