import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import moment from 'moment';
import { getDefaultFieldBill, verifyAccountNumber, verifyBillInfo } from '../../../api/bill';
import { IDataToGetDefaultField } from '../../../api/bill/default-field';
import { IDataToVerifyBillInfo } from '../../../api/bill/payment-conditions';
import { ICancelToken, IErrorApi, IErrorPayloadBoostWallet, IUniqueReqKey } from '../../../api/interface';
import { FORMAT_DATE_VN } from '../../../constants';
import { DEFAULT_FIELD_INVALID } from '../../../constants/errorCode';
import { convertArrayToObject } from '../../../utils/common';

interface IPayloadPostAccountNumber extends IUniqueReqKey, ICancelToken {
    accountNumber: string;
    msisdn: string;
    productId: string;
    categoryId: string;
    providerId: string;
}

const handleVerifyBillInfo = (params: IDataToVerifyBillInfo): Promise<any> => {
    return new Promise((resolve, reject) => {
        verifyBillInfo(params)
            .then((res) => {
                resolve({
                    providerLogoUrl: res.providerLogoUrl,
                    serviceCharge: { ...res.serviceCharge },
                    info: res.info,
                    paymentConditions: { ...res.paymentConditions },
                    isCasaRequired: res.isCasaRequired,
                    productDisplayName: res.productDisplayName,
                });
            })
            .catch((e: AxiosError) => {
                reject(false);
            });
    });
};

const handleGetDefaultFieldBill = (params: IDataToGetDefaultField): Promise<any> => {
    return new Promise((resolve, reject) => {
        getDefaultFieldBill(params)
            .then((res) => {
                let obRes = convertArrayToObject(res.fields);
                res?.isBillRepresentmentAvailable
                    ? resolve({
                          outstandingAmount: obRes?.outstandingAmount ?? '',
                          payAmount: obRes?.payAmount ?? 0,
                          accountNumber: params.accountNumber,
                          accountName: obRes?.fullName ?? '***',
                          dueDate: obRes?.dueDate !== 'N/A' ? moment(obRes?.dueDate, FORMAT_DATE_VN).format() : obRes?.dueDate,
                          defaultFieldAvailable: true,
                      })
                    : resolve({
                          accountNumber: params.accountNumber,
                          defaultFieldAvailable: false,
                      });
            })
            .catch((e: AxiosError) => {
                let errorData = e.response?.data as IErrorApi<IErrorPayloadBoostWallet>;
                errorData && errorData?.errorPayload.responseCode === DEFAULT_FIELD_INVALID
                    ? resolve({
                          accountNumber: params.accountNumber,
                          defaultFieldAvailable: false,
                      })
                    : reject();
            });
    });
};

export const postAccountNumber = createAsyncThunk('accountNumber/post', async ({ msisdn, accountNumber, providerId, ...payloadGeneral }: IPayloadPostAccountNumber) => {
    let checkingAccount = await verifyAccountNumber({
        ...payloadGeneral,
        msisdn,
        accountNumber,
    });

    return new Promise<any>((resolve, reject) => {
        if (checkingAccount.productId) {
            const verifyBill = handleVerifyBillInfo({
                ...payloadGeneral,
                providerId,
            });

            const defaultFieldBill = handleGetDefaultFieldBill({
                ...payloadGeneral,
                accountNumber,
            });

            Promise.all([verifyBill, defaultFieldBill])
                .then((values) => {
                    resolve({
                        paymentConditionsData: values[0],
                        defaultData: values[1],
                    });
                })
                .catch(() => {
                    reject();
                });
        } else {
            reject();
        }
    });
});

export default postAccountNumber;
