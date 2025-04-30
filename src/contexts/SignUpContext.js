// src/contexts/SignUpContext.js
import React, { createContext, useState } from 'react';

export const SignUpContext = createContext({
    address: { city: '', gu: '', dong: '' },
    setAddress: () => {},
});

export function SignUpProvider({ children }) {
    const [address, setAddress] = useState({
        city: '',
        gu: '',
        dong: ''
    });

    // children을 배열로 바꾸고 string 타입은 걸러냅니다
    const filtered = React.Children.toArray(children)
        .filter(child => typeof child !== 'string');

    return (
        <SignUpContext.Provider value={{ address, setAddress }}>
            {filtered}
        </SignUpContext.Provider>
    );
}
