import { configureStore } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';
import logger from 'redux-logger';
import { BuildVariants } from '../config';
import authReducer from './auth/slice';
import billReducer from './bill/silce';
import billerReducer from './biller/slice';
import transactionReducer from './transaction/slice';

export const appStore = configureStore({
    reducer: {
        auth: authReducer,
        bill: billReducer,
        biller: billerReducer,
        transaction: transactionReducer,
    },
    middleware: (getDefaultMiddleware) => {
        return process.env.REACT_APP_ENV !== BuildVariants.PRODUCTION ? getDefaultMiddleware().concat(logger) : getDefaultMiddleware();
    },
    devTools: process.env.REACT_APP_ENV !== BuildVariants.PRODUCTION,
});

export type RootState = ReturnType<typeof appStore.getState>;

export type AppDispatch = typeof appStore.dispatch;

// Dispatch action
export const useAppDispatch = () => useDispatch<AppDispatch>();
