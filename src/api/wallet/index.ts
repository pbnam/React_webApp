import makeRequest from '..';
import { BASE_API_BPT_URL } from '../../constants';
import { IBillOutlet } from '../interface';

export interface IDataGetWalletApiRes {
    accountId: string;
    merchantId: string;
    merchantSettlementId: string;
    walletAccountId: string;
    balance: {
        amount: number;
        limit: number;
        holdAmount: number;
    };
    stores: IBillOutlet[];
    statusNew: boolean;
    msisdn: string;
    checkedTutorialHighlight: boolean;
    checkedSaveMoreBiller: boolean;
    userId: string;
    fullName: string;
}

export interface IDataItemGetWalletApiRes extends IDataGetWalletApiRes {
    authorizePic: [
        {
            PhoneNumber: string;
            FullName: string;
        },
    ];
}

export const getWalletApi = (merchantSettlementId: string) => {
    const url = `${BASE_API_BPT_URL}/open-api/wallet?merchantSettlementId=${merchantSettlementId}`;
    return makeRequest<IDataItemGetWalletApiRes>({ url, method: 'GET' });
};
