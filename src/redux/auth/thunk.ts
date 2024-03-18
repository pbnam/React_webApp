import { createAsyncThunk } from '@reduxjs/toolkit';
import { AxiosError } from 'axios';
import { getAccountSettingApi, getPinLogApi, IDataGetAccountSettingRes, patchAccountSettingsApi, postAccountSettingsApi } from '../../api/accountSetting';
import { IDataToVerifyRepresentmentConsent, postRepresentmentConsentApi } from '../../api/bill/representment';
import { getWalletApi } from '../../api/wallet';

export const checkAuthentication = createAsyncThunk('auth/checkToken', async (merchantSettlementId: string) => {
    return new Promise<any>((resolve, reject) => {
        getWalletApi(merchantSettlementId)
            .then((data) => {
                let convertBalance = {} as any;
                Object.entries(data.balance).forEach((item) => {
                    convertBalance[`${item[0]}`] = item[1];
                });

                let storesDefault = data.stores.map((item) => {
                    return {
                        name: item.name,
                        outletId: item.outletId,
                        type: 'AVAILABLE',
                    };
                });

                resolve({
                    accountId: data.accountId,
                    merchantId: data.merchantId,
                    merchantSettlementId: data.merchantSettlementId,
                    walletAccountId: data.walletAccountId,
                    balance: { ...convertBalance },
                    stores: storesDefault,
                    statusNew: true,
                    msisdn: `+60${data?.authorizePic[0]?.PhoneNumber}`,
                    checkedTutorialHighlight: false,
                    checkedSaveMoreBiller: false,
                    userId: data.userId,
                    fullName: data?.authorizePic[0]?.FullName?.trim(),
                });
            })
            .catch(() => reject());
    });
});

const convertNullDataToFalse = (data: any) => {
    return data === null ? false : data;
};

export const verifyRepresentmentConsent = createAsyncThunk('auth/representment/get', async (payload: string) => {
    let convertData = (data: IDataGetAccountSettingRes) => {
        return {
            consentUpdated: convertNullDataToFalse(data.consentUpdated),
            saveBillerShowed: convertNullDataToFalse(data.saveBillerShowed),
            tutorialShowed: convertNullDataToFalse(data.tutorialShowed),
        };
    };
    return new Promise<any>((resolve, reject) => {
        getAccountSettingApi(payload)
            .then((res) => {
                resolve(convertData(res));
            })
            .catch((e: AxiosError) => {
                if (e.response?.status === 404) {
                    postAccountSettingsApi({ merchantSettlementId: payload })
                        .then((res) => {
                            resolve(convertData(res));
                        })
                        .catch(() => reject());
                } else {
                    reject();
                }
            });
    });
});

interface IUpdateAccountSettings {
    consentUpdated?: boolean;
    saveBillerShowed?: boolean;
    tutorialShowed?: boolean;
    merchantSettlementId: string;
}

export const updateAccountSettings = createAsyncThunk('auth/accountSetting/post', async (params: IUpdateAccountSettings) => {
    return new Promise<any>((resolve, reject) => {
        patchAccountSettingsApi(params)
            .then(() => {
                let updateData: Partial<IUpdateAccountSettings> = params;
                delete updateData.merchantSettlementId;

                resolve(updateData);
            })
            .catch(() => reject());
    });
});

export const postRepresentmentConsent = createAsyncThunk('auth/representment/post', async (payload: IDataToVerifyRepresentmentConsent) => {
    return new Promise<any>((resolve, reject) => {
        postRepresentmentConsentApi(payload)
            .then(() => resolve(true))
            .catch(() => reject(false));
    });
});

export const getValidationPin = createAsyncThunk('auth/validationPin/get', async (payload: string) => {
    return new Promise<any>((resolve, reject) => {
        getPinLogApi(payload)
            .then((res) => resolve(res))
            .catch(() => reject());
    });
});
