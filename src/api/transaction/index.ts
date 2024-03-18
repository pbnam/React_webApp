import makeRequest from '..';
import { BASE_API_BPT_URL } from '../../constants';

export interface IDataToGetTransactions {
    limit: number;
    merchantSettlementId: string;
    serviceType: 'BILLER' | 'WALLET';
    startAt?: string;
    endAt?: string;
}

export interface ITransactionType {
    id: string;
    transactionId: string;
    merchantName: string;
    transactionDateTime: string;
    updatedAt: string;
    status: string;
    merchantSettlementId: string;
    amount: number;
    categoryType: string;
    accountNumber: string;
}

export interface ITransactionTypeRes extends ITransactionType {
    extendInfo: {
        from: any;
        to: string;
    };
}

export const getTransactionsApi = (params: IDataToGetTransactions) => {
    const url = `${BASE_API_BPT_URL}/open-api/wallet/transactions`;

    return makeRequest<ITransactionTypeRes[]>({ url, method: 'GET', params });
};
