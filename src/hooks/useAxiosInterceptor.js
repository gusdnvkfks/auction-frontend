import { useEffect, useContext } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';
import { AuthContext } from '../contexts/AuthContext';

export const useAxiosInterceptor = () => {
    const { token, setToken, logout } = useContext(AuthContext);

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            response => response,
            async error => {
                const originalRequest = error.config;

                if (
                    error.response?.data?.message === 'jwt expired' &&
                    !originalRequest._retry
                ) {
                    originalRequest._retry = true;

                    try {
                        const refreshToken = await AsyncStorage.getItem('refreshToken');
                        if (!refreshToken) throw new Error('No refresh token');

                        const res = await axios.post(
                            `${Config.API_URL}/api/auth/refresh`,
                            { refreshToken }
                        );

                        const newAccessToken = res.data.accessToken;

                        await AsyncStorage.setItem('accessToken', newAccessToken);
                        setToken(newAccessToken);

                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        return axios(originalRequest);
                    } catch (refreshErr) {
                        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
                        logout?.();
                        return Promise.reject(refreshErr);
                    }
                }

                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [token]);
};
