import { configureStore } from "@reduxjs/toolkit";
import signupReducer from '../features/signupSlice';

export const store = configureStore({
    reducer: {
        signup: signupReducer,
    }
})