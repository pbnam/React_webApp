import { createAsyncThunk } from '@reduxjs/toolkit';
import { deleteBillApi, getBillsApi, IParamGetBillsApi, IPayloadCreateBillApi, postCreateBillApi, convertAndCompareNewBills } from '../../../api/bill';

import { ICancelToken, IUniqueReqKey, IUpdateBillData } from '../../../api/interface';
import { checkingBillType } from '../../../utils/common';

// update all bill for app
const updateBillsData = createAsyncThunk('bills/update', async (payload: IUniqueReqKey, { dispatch }) => {
    return new Promise<any>((resolve) => {
        let asapBillPromise = new Promise((res) => {
            dispatch(
                getAsapBills({
                    limit: 3,
                    page: 1,
                    walletAccountId: payload.walletAccountId,
                    merchantSettlementId: payload.merchantSettlementId,
                    dueDate: 'NOT_NULL',
                    sortField: 'dueDate',
                    sortDirection: 'ASC',
                    outstandingAmount: 'UNPAID',
                }),
            ).finally(() => res(true));
        });

        let billsPromise = new Promise((res) => {
            dispatch(
                getBills({
                    limit: 3,
                    page: 1,
                    walletAccountId: payload.walletAccountId,
                    merchantSettlementId: payload.merchantSettlementId,
                    sortField: 'dueDate',
                    sortDirection: 'ASC',
                    type: 'SEARCH',
                }),
            ).finally(() => res(true));
        });

        Promise.all([asapBillPromise, billsPromise]).finally(() => {
            resolve(true);
        });
    });
});

// Create
export interface IPayloadCreateBill extends IPayloadCreateBillApi, ICancelToken {
    walletAccountId: string;
}

const createBill = createAsyncThunk('bill/create', async ({ walletAccountId, ...payload }: IPayloadCreateBill, { dispatch }) => {
    return new Promise<any>((resolve, reject) => {
        postCreateBillApi(payload)
            .then((res) => {
                let status = checkingBillType(res.outstandingAmount);

                dispatch(
                    updateBillsData({
                        walletAccountId,
                        merchantSettlementId: payload.merchantSettlementId,
                    }),
                ).finally(() => {
                    resolve({ ...res, status });
                });
            })
            .catch(() => reject());
    });
});

// Get
const getAsapBills = createAsyncThunk('asapBill/get', async (params: IParamGetBillsApi, { dispatch }) => {
    return new Promise<any>((resolve, reject) => {
        getBillsApi(params)
            .then(async (res) => {
                let dataAsap = await convertAndCompareNewBills(res.data, params.walletAccountId as string, params.merchantSettlementId as string);

                if (dataAsap.hasUpdate) {
                    dispatch(
                        updateBillsData({
                            walletAccountId: params.walletAccountId,
                            merchantSettlementId: params.merchantSettlementId,
                        }),
                    ).finally(() => {
                        reject();
                    });
                }
                resolve(dataAsap.data);
            })
            .catch(() => reject());
    });
});
export interface IParamGetBills extends IParamGetBillsApi {
    type?: 'SEARCH' | 'LOADMORE';
}

const getBills = createAsyncThunk('bill/get', async ({ type, ...params }: IParamGetBills, { dispatch }) => {
    return new Promise<any>((resolve, reject) => {
        getBillsApi(params)
            .then(async (res) => {
                let dataNew = await convertAndCompareNewBills(res.data, params.walletAccountId as string, params.merchantSettlementId as string);

                if (dataNew.hasUpdate) {
                    dispatch(
                        updateBillsData({
                            walletAccountId: params.walletAccountId,
                            merchantSettlementId: params.merchantSettlementId,
                        }),
                    ).finally(() => {
                        reject();
                    });
                }
                resolve({ ...res, data: dataNew.data, type });
            })
            .catch(() => reject());
    });
});

// Delete
interface IDeleteBill extends IUniqueReqKey {
    id: string;
    productDisplayName: string;
    outletName: string;
}

const deleteBill = createAsyncThunk('bill/delete', async (payload: IDeleteBill, { dispatch }) => {
    return new Promise<any>((resolve, reject) => {
        deleteBillApi(payload.id)
            .then(() => {
                dispatch(
                    getAsapBills({
                        limit: 3,
                        page: 1,
                        walletAccountId: payload.walletAccountId,
                        merchantSettlementId: payload.merchantSettlementId,
                        dueDate: 'NOT_NULL',
                        sortField: 'dueDate',
                        sortDirection: 'ASC',
                        outstandingAmount: 'UNPAID',
                    }),
                ).finally(() => {
                    resolve({
                        productDisplayName: payload.productDisplayName,
                        outletName: payload.outletName,
                    });
                });
            })
            .catch(() => reject());
    });
});

// Patch to update bill
interface IPatchBill extends IUpdateBillData {
    id: string;
}

export { createBill, deleteBill, getBills, getAsapBills, updateBillsData, IPatchBill };
