import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    userInfo: {
        name: "",
        phone: "",
    },
    address: {
        city: "",
        gu: "",
        dong: "",
    },
    consent: {
        privacy: false,
        terms: false,
        verification: false,
        location: false,
        age14: false,
        marketing: false,
    },
}

export const signupSlice = createSlice({
    name: 'signup',
    initialState,
    reducers: {
        setUserInfo: (state, action) => {
            state.userInfo = { ...state.userInfo, ...action.payload };
        },
        setAddress: (state, action) => {
            state.address = { ...state.address, ...action.payload };
        },
        setConsent: (state, action) => {
            state.consent = { ...state.consent, ...action.payload };
        },
        clearSignupInfo: (state) => {
            state.userInfo = { name: "", phone: "" };
            state.address = { city: "", gu: "", dong: ""};
            state.consent = {
                privacy: false,
                terms: false,
                verification: false,
                location: false,
                age14: false,
                marketing: false,
            };
        },
    }
});

export const { setUserInfo, setAddress, setConsent, clearSignupInfo } = signupSlice.actions;
export default signupSlice.reducer;