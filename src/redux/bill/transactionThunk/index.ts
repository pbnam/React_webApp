import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import moment from 'moment';
import { postBillPaymentApi, verifyBillApi } from '../../../api/bill';
import { IDataPostBillPayment } from '../../../api/bill/interface';
import { IErrorApi, IErrorBillPayment } from '../../../api/interface';
import { PIN_BLOCKED_CODE, PIN_INVALID } from '../../../constants/errorCode';
import { checkAuthentication, getValidationPin } from '../../auth/thunk';
import { transactionActions } from '../../transaction/slice';

const postBillPayment = createAsyncThunk('billPayment/post', async ({ amount, pin, ...payload }: IDataPostBillPayment, { rejectWithValue, dispatch }) => {
    let billExistence = await verifyBillApi(payload)
        .then((res) => res)
        .catch(() => null);

    if (typeof billExistence === 'boolean') {
        return new Promise<any>((resolve, reject) => {
            postBillPaymentApi({
                amount,
                pin,
                ...payload,
            })
                .then((res) => {
                    const resData = {
                        amount: res.item.paidAmount,
                        transactionAt: moment(res?.item?.transactionAt).format(),
                        transactionId: res?.item?.transactionId,
                        updatedAt: moment(res?.item?.updatedAt).format(),
                        createdAt: moment(res?.item?.createdAt).format(),
                        status: res?.item?.status,
                    };

                    dispatch(checkAuthentication(payload.merchantSettlementId)).finally(() => {
                        dispatch(transactionActions.changeStatusToUpdate());
                        resolve({
                            data: resData,
                            billExistence,
                        });
                    });
                })
                .catch((e: AxiosError) => {
                    let errorData = e.response?.data as IErrorApi<IErrorBillPayment>;

                    let rejectData = {
                        valid: true,
                        message: errorData?.errorPayload?.error?.message,
                    };

                    if (errorData?.errorPayload?.error?.code === PIN_INVALID) {
                        rejectData.valid = false;
                        rejectData.message = null;
                    } else if (errorData?.errorCode === PIN_BLOCKED_CODE || errorData?.errorPayload?.isBlocked) {
                        dispatch(getValidationPin(payload.merchantSettlementId));
                    }
                    reject(
                        rejectWithValue({
                            data: rejectData,
                            billExistence,
                        }),
                    );
                });
        });
    } else {
        return Promise.reject(
            rejectWithValue({
                data: {
                    valid: true,
                    message: `network error: can't check bill existence`,
                },
            }),
        );
    }
});

export { postBillPayment };
