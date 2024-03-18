import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IBillRes } from '../../api/bill';
import { ITransactionStatusType } from '../../api/interface';
import { getAsapBills, getBills } from './billThunk';
import { createBill, deleteBill, editOutletAndTimeBill, getAllOutlets, postAccountNumber, postBillPayment, postPaymentAmount, searchOutletName } from './thunk';
import intl from 'react-intl-universal';

export type statusBill = 'paid' | 'due' | null;
export type statusTransaction = 'success' | 'failed' | 'pending' | null;

export type stepSaveBill = 'step1' | 'step2' | 'step3' | 'step4';
export type methodMessage = 'delete' | 'edit' | 'create' | null;

export type chargeUnitType = 'percentage' | 'sen';

export interface IServiceCharge {
    chargeUnit: chargeUnitType;
    chargeValue: string;
}

interface ITemporaryBillerData {
    serviceCharge: IServiceCharge;
    info: string;
    paymentConditions: {
        decimalsAllowed: boolean;
        maximumPayableAmount: string;
        minimumPayableAmount: string;
    };
    isCasaRequired: boolean;
    providerLogoUrl: string;
    productDisplayName: string;
}

interface ITemporaryTransactionData {
    defaultBillData: {
        outstandingAmount: string;
        payAmount: number;
        accountNumber: string;
        accountName: string;
        dueDate: string;
        defaultFieldAvailable: boolean;
    };
    transactionData: {
        amount: number;
        transactionAt: string;
        transactionId: string;
        updatedAt: string;
        createdAt: string;
        status: ITransactionStatusType;
    };
}

interface ITemporaryData {
    pinCodeCheck: boolean | null;
    pinCode: {
        valid: boolean | null;
        message: string;
    };
    stepDone: stepSaveBill[];
    isSharing: boolean;
    paymentAmount: number;
    billExistence: boolean;
}

export interface IStoreBillData {
    data: IBillRes[];
    limit: number;
    page: number;
    total: number;
}

interface IStoreGetBillData extends IStoreBillData {
    type: 'SEARCH' | 'LOADMORE';
}

export interface BillState {
    asapData: IBillRes[];
    storeData: IStoreBillData;
    temporaryBillerData: ITemporaryBillerData;
    temporaryTransactionData: ITemporaryTransactionData;
    temporaryData: ITemporaryData;
    isHandling: boolean;
    outletData: [];
    messageData: {
        isOpenMessage: boolean;
        content: string;
        method: methodMessage;
    };
}

const initPinCode = {
    valid: null,
    message: '',
};

const initTemporaryData = {
    pinCodeCheck: null,
    pinCode: initPinCode,
    paymentAmount: 0,
    stepDone: [],
    isSharing: false,
    billExistence: false,
};

const initialState: BillState = {
    asapData: [],
    storeData: {
        data: [],
        limit: 0,
        page: 0,
        total: 0,
    },
    temporaryBillerData: {} as ITemporaryBillerData,
    temporaryTransactionData: {} as ITemporaryTransactionData,
    temporaryData: initTemporaryData,
    isHandling: false,
    outletData: [],
    messageData: {
        isOpenMessage: false,
        content: '',
        method: null,
    },
};

const billSlice = createSlice({
    name: 'bill',
    initialState,
    reducers: {
        deleteTemporaryData(state) {
            state.temporaryData = initTemporaryData;
        },
        closeBoxMessage(state) {
            state.messageData.content = '';
            state.messageData.isOpenMessage = false;
            state.messageData.method = null;
        },
        addBoxMessage(state, action: PayloadAction<{ content: string; method: methodMessage }>) {
            state.messageData.content = action.payload.content;
            state.messageData.isOpenMessage = true;
            state.messageData.method = action.payload.method;
        },
        resetPincode(state) {
            state.temporaryData.pinCodeCheck = null;
        },
        resetPinCodeStore(state) {
            state.temporaryData.pinCode = initPinCode;
        },
        makeSharing(state) {
            state.temporaryData.isSharing = true;
        },
        resetOutlet(state) {
            state.outletData = [];
        },
        // showPending(state) {
        //     // state.temporaryData.transactionData.status = 'pending';
        // },
        directEditBill(state) {
            !state.temporaryData.stepDone.includes('step3') && state.temporaryData.stepDone.push('step3');
        },
        deleteTemporaryTransactionData(state) {
            state.temporaryTransactionData = {} as ITemporaryTransactionData;
        },
    },
    extraReducers: (buider) => {
        buider
            .addCase(getBills.pending, (state) => {
                state.isHandling = true;
            })
            .addCase(getBills.fulfilled, (state, action) => {
                let { data, type, ...payloadData } = action?.payload as IStoreGetBillData;
                if (type === 'SEARCH') {
                    state.storeData = {
                        data,
                        ...payloadData,
                    };
                } else {
                    state.storeData.data = [...state.storeData.data, ...data];
                    state.storeData = {
                        ...state.storeData,
                        ...payloadData,
                    };
                }

                state.isHandling = false;
            })
            .addCase(getBills.rejected, (state) => {
                state.isHandling = false;
            })
            .addCase(getAsapBills.pending, (state) => {
                state.isHandling = true;
            })
            .addCase(getAsapBills.fulfilled, (state, action) => {
                state.asapData = action.payload;
                state.isHandling = false;
            })
            .addCase(getAsapBills.rejected, (state) => {
                state.isHandling = false;
            })

            .addCase(createBill.pending, (state) => {
                state.isHandling = true;
            })
            .addCase(createBill.fulfilled, (state, action) => {
                state.isHandling = false;
                state.messageData = {
                    isOpenMessage: true,
                    content: `"${action.payload?.outlet?.name ? action.payload?.outlet?.name : action.payload?.productDisplayName}" ${intl.get('notification.ADDED_BILL')}`,
                    method: 'create',
                };
                state.temporaryData.stepDone.push('step4');
            })
            .addCase(createBill.rejected, (state) => {
                state.isHandling = false;
            })

            // checking accountNumber
            .addCase(postAccountNumber.pending, (state) => {
                state.isHandling = true;
            })
            .addCase(postAccountNumber.fulfilled, (state, action) => {
                state.temporaryBillerData = action.payload.paymentConditionsData;
                state.temporaryTransactionData.defaultBillData = action.payload.defaultData;
                !state.temporaryData.stepDone.includes('step1') && state.temporaryData.stepDone.push('step1');
                state.isHandling = false;
            })
            .addCase(postAccountNumber.rejected, (state) => {
                state.isHandling = false;
                state.temporaryData = initTemporaryData;
            })

            // checking paymentAmount
            .addCase(postPaymentAmount.pending, (state) => {
                state.isHandling = true;
            })
            .addCase(postPaymentAmount.fulfilled, (state, action) => {
                state.temporaryData.paymentAmount = action.payload as number;
                !state.temporaryData.stepDone.includes('step2') && state.temporaryData.stepDone.push('step2');
                state.isHandling = false;
            })
            .addCase(postPaymentAmount.rejected, (state) => {
                state.isHandling = false;
            })

            // post transaction
            .addCase(postBillPayment.pending, (state) => {
                state.isHandling = true;
            })
            .addCase(postBillPayment.fulfilled, (state, action) => {
                state.temporaryData.pinCodeCheck = true;
                state.temporaryTransactionData.transactionData = action.payload?.data;
                !state.temporaryData.stepDone.includes('step3') && state.temporaryData.stepDone.push('step3');
                state.isHandling = false;
                state.temporaryData.pinCode.valid = true;
                state.temporaryData.billExistence = action.payload?.billExistence;
                if (action.payload?.billExistence) {
                    state.messageData = {
                        isOpenMessage: true,
                        content: `"${state.temporaryBillerData?.productDisplayName}" ${intl.get('notification.PAY_BILL_EXISTENCE_SUCCESS')}`,
                        method: 'edit',
                    };
                }
            })
            .addCase(postBillPayment.rejected, (state, action: PayloadAction<any>) => {
                state.isHandling = false;
                state.temporaryData.pinCodeCheck = false;
                state.temporaryData.pinCode = action?.payload?.data;
                state.temporaryData.billExistence = action?.payload?.billExistence;
            })

            // search outlet
            .addCase(searchOutletName.pending, (state) => {
                state.isHandling = true;
            })
            .addCase(searchOutletName.fulfilled, (state, action) => {
                state.outletData = action.payload;
                state.isHandling = false;
            })
            .addCase(searchOutletName.rejected, (state) => {
                state.isHandling = false;
            })

            // delete bill
            .addCase(deleteBill.pending, (state) => {
                state.isHandling = true;
            })
            .addCase(deleteBill.fulfilled, (state, action) => {
                state.isHandling = false;
                state.messageData.isOpenMessage = true;
                state.messageData.content = `"${action.payload?.productDisplayName} - ${action.payload?.outletName}" ${intl.get('notification.REMOVE_BILL_SUCCESS')}`;
                state.messageData.method = 'delete';
            })
            .addCase(deleteBill.rejected, (state) => {
                state.isHandling = false;
            })

            // editOutletAngTimeBill
            .addCase(editOutletAndTimeBill.pending, (state) => {
                state.isHandling = true;
            })
            .addCase(editOutletAndTimeBill.fulfilled, (state, action) => {
                let updateData = state.storeData.data.map((item: IBillRes) => {
                    if (item.id === action.payload.billId) {
                        return {
                            ...item,
                            outlet: {
                                ...item.outlet,
                                ...action.payload.outletUpdate,
                            },
                            reminder: {
                                ...item.reminder,
                                ...action.payload.reminderUpdate,
                            },
                        };
                    } else {
                        return item;
                    }
                });

                state.storeData.data = updateData;
                state.isHandling = false;
                state.messageData.isOpenMessage = true;
                state.messageData.content = intl.get('notification.EDIT_BILL_SUCCESS');
                state.messageData.method = 'edit';
            })
            .addCase(editOutletAndTimeBill.rejected, (state) => {
                state.isHandling = false;
            })

            // outlet
            .addCase(getAllOutlets.pending, (state) => {
                state.isHandling = true;
            })
            .addCase(getAllOutlets.fulfilled, (state, action) => {
                state.outletData = action.payload;
                state.isHandling = false;
            })
            .addCase(getAllOutlets.rejected, (state) => {
                state.isHandling = false;
            });
    },
});

export const billActions = billSlice.actions;

const billReducer = billSlice.reducer;

export default billReducer;
