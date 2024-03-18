import makeRequest from '../..';
import { BASE_API_BPT_URL } from '../../../constants';

// bill payment
export interface IDataPostBillPayment {
    merchantSettlementId: string;
    accountNumber: string;
    amount: number;
    categoryId: string;
    productId: string;
    providerId: string;
    pin: string;
}

export interface IDataPostBillPaymentRes {
    biller: {
        guid: string;
        receiptNumber: string;
    };
    item: {
        transactionId: string;
        merchantSettlementId: string;
        referenceId: string;
        receiptNumber: string;
        currencyType: string;
        amount: number;
        paidAmount: number;
        status: string;
        merchantName: string;
        transactionAt: string;
        updatedAt: string;
        createdAt: string;
    };
}

export const postBillPaymentApi = (data: IDataPostBillPayment) => {
    const url = `${BASE_API_BPT_URL}/open-api/biller-payment`;
    return makeRequest<IDataPostBillPaymentRes>({ url, method: 'POST', data });
};
