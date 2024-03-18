import { createAsyncThunk } from '@reduxjs/toolkit';
import moment from 'moment';
import { getTransactionsApi, IDataToGetTransactions, ITransactionType, ITransactionTypeRes } from '../../api/transaction';

export const handleConvertTransactionDataApi = (data: ITransactionTypeRes[]): ITransactionType[] => {
    return data.map((item) => {
        return {
            id: item.id,
            merchantName: item.merchantName,
            transactionDateTime: moment(new Date(item.transactionDateTime)).format(),
            updatedAt: moment(new Date(item.updatedAt)).format(),
            status: item.status,
            merchantSettlementId: item.merchantSettlementId,
            amount: item.amount,
            categoryType: item.extendInfo?.from?.field3,
            accountNumber: item?.accountNumber,
            transactionId: item?.transactionId,
        };
    });
};
export const getTransaction = createAsyncThunk('transaction/get', async (params: IDataToGetTransactions) => {
    return new Promise<any>((resolves, rejects) => {
        getTransactionsApi(params)
            .then((res) => {
                let updateData: ITransactionType[] = handleConvertTransactionDataApi(res);
                resolves(updateData);
            })
            .catch(() => rejects());
    });
});
