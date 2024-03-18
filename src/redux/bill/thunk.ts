import { createAsyncThunk } from '@reduxjs/toolkit';
import { postBillPayment } from './transactionThunk';
import postAccountNumber from './accountNumberThunk';
import { createBill, deleteBill } from './billThunk';
import { searchOutletName, getAllOutlets } from './outletThunk';

import { updateBillReminderApi } from '../../api/bill';
import { IDataToUpdateBillOutlet, updateBillOutletApi } from '../../api/bill/outlet';
import { IDataUpdateReminder } from '../../api/bill/reminder';
import { ICancelToken } from '../../api/interface';

export const postPaymentAmount = createAsyncThunk('paymentAmount/post', async (paymentAmount: number) => {
    return new Promise<any>((res) => {
        res(paymentAmount);
    });
});

interface IEditOutletAndTimeBill extends ICancelToken {
    billId: string;
    outlet: IDataToUpdateBillOutlet;
    outletId: string;
    reminder: IDataUpdateReminder;
    reminderId: string;
}
const editOutletAndTimeBill = createAsyncThunk('bill/outletAndTime/edit', async (payload: IEditOutletAndTimeBill) => {
    return new Promise<any>((resolve, reject) => {
        const outletPromise = new Promise((resolve1, reject1) => {
            updateBillOutletApi({ ...payload.outlet, cancelToken: payload.cancelToken }, payload.outletId)
                .then(() => resolve1(payload.outlet))
                .catch(() => reject1());
        });

        const reminderPromise = new Promise((resolve1, reject1) => {
            updateBillReminderApi({ ...payload.reminder, cancelToken: payload.cancelToken }, payload.reminderId)
                .then(() => resolve1(payload.reminder))
                .catch(() => reject1());
        });

        Promise.all([outletPromise, reminderPromise])
            .then((values) => {
                resolve({
                    billId: payload.billId,
                    outletUpdate: values[0],
                    reminderUpdate: values[1],
                });
            })
            .catch(() => reject());
    });
});

export { editOutletAndTimeBill, postAccountNumber, createBill, deleteBill, searchOutletName, getAllOutlets, postBillPayment };
