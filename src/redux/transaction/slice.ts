import { createSlice } from '@reduxjs/toolkit';
import { ITransactionType } from '../../api/transaction';
import { getTransaction } from './thunk';

export interface TransactionType {
    transactionId: string;
    billerName: string;
    accountNumber: string;
    time: string;
    totalAmount: number;
    balance: number;
    from: string;
    note: string;
    thumbnail: string;
    type: string;
    categoryType: string;
}

export interface TransactionState {
    transactionStore: ITransactionType[];
    isHandling: boolean;
    needUpdate: boolean;
}

const initialState: TransactionState = {
    transactionStore: [],
    isHandling: false,
    needUpdate: true,
};

const transactionSlice = createSlice({
    name: 'transaction',
    initialState,
    reducers: {
        changeStatusToUpdate(state) {
            state.needUpdate = true;
        },
    },
    extraReducers: (buider) => {
        buider
            .addCase(getTransaction.pending, (state) => {
                state.isHandling = true;
            })
            .addCase(getTransaction.fulfilled, (state, action) => {
                state.transactionStore = action.payload;
                state.isHandling = false;
                state.needUpdate = false;
            })
            .addCase(getTransaction.rejected, (state) => {
                state.isHandling = false;
                state.needUpdate = false;
            });
    },
});

export const transactionActions = transactionSlice.actions;

const transactionReducer = transactionSlice.reducer;

export default transactionReducer;
