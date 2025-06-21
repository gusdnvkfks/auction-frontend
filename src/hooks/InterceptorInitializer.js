// src/hooks/InterceptorInitializer.js

import React from 'react';
import { useAxiosInterceptor } from './useAxiosInterceptor';

const InterceptorInitializer = () => {
    useAxiosInterceptor();
    return null; // 렌더링 안 함
};

export default InterceptorInitializer;
