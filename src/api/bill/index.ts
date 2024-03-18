import { updateBillReminderApi } from '../../api/bill/reminder';
import { verifyAccountNumber } from '../../api/bill/account-number';
import { getDefaultFieldBill } from '../../api/bill/default-field';
import { verifyBillInfo } from '../../api/bill/payment-conditions';
import { updateBillOutletApi } from '../../api/bill/outlet';
import { postBillPaymentApi } from '../../api/bill/request-transaction';
import convertAndCompareNewBills from '../../api/bill/compare';
import { BASE_API_BPT_URL } from '../../constants';
import makeRequest from '..';
import { ICancelToken, IOutletType, IReminderType } from '../interface';
import { statusBill } from '../../redux/bill/silce';

export interface IBillRes {
    id: string;
    merchantId: string;
    merchantSettlementId: string;
    accountId: string;
    userId: string;
    walletAccountId: string;
    accountNumber: string;
    categoryId: string;
    providerId: string;
    productId: string;
    createdAt: string;
    dueDate: string;
    outstandingAmount: string;
    payAmount: string;
    updatedAt: string;
    info: string;
    productDisplayName: string;
    providerLogoUrl: string;
    categoryName: string;
    outlet: {
        id: string;
        name: string;
        outletId: string;
        type: IOutletType;
    };
    reminder: {
        id: string;
        dayOfMonth: number;
        dayOfWeek: number;
        nextReminderDate: string;
        period: IReminderType;
    };
    status: statusBill;
}

// Create
export interface IPayloadCreateBillApi extends ICancelToken {
    outlet: {
        name: string;
        outletId: string;
        type: IOutletType;
    };
    reminder: {
        dayOfMonth: number;
        dayOfWeek: number;
        period: IReminderType;
    };
    merchantSettlementId: string;
    accountNumber: string;
    categoryId: string;
    productId: string;
    providerId: string;
}

const postCreateBillApi = ({ cancelToken, ...data }: IPayloadCreateBillApi) => {
    const url = `${BASE_API_BPT_URL}/bills`;
    return makeRequest<IBillRes>({ url, method: 'POST', data, cancelToken });
};

// Get
interface IGetBillsRes {
    page: number;
    limit: number;
    total: number;
    data: IBillRes[];
}

export interface IParamGetBillsApi {
    page: number;
    limit: number;
    walletAccountId: string;
    merchantSettlementId: string;
    outletName?: string;
    dueDate?: 'IS_NULL' | 'NOT_NULL';
    sortDirection?: 'DESC' | 'ASC';
    sortField?: string;
    outstandingAmount?: 'PAID' | 'UNPAID';
}

const getBillsApi = (params: IParamGetBillsApi) => {
    const url = `${BASE_API_BPT_URL}/bills`;
    return makeRequest<IGetBillsRes>({ url, method: 'GET', params });
};

// Delete
const deleteBillApi = (id: string) => {
    const url = `${BASE_API_BPT_URL}/bills/${id}`;
    return makeRequest<any>({ url, method: 'DELETE' });
};

// Patch to sync with new data
const patchBillApi = (id: string) => {
    const url = `${BASE_API_BPT_URL}/bills/${id}`;
    return makeRequest<any>({ url, method: 'PATCH' });
};

// Verify
interface IParamVerifyBill {
    merchantSettlementId: string;
    accountNumber: string;
    categoryId: string;
    productId: string;
    providerId: string;
}

const verifyBillApi = (params: IParamVerifyBill) => {
    const url = `${BASE_API_BPT_URL}/bills/check-bill-existence`;
    return makeRequest<boolean>({ url, method: 'GET', params });
};

export {
    updateBillReminderApi,
    verifyAccountNumber,
    getDefaultFieldBill,
    verifyBillInfo,
    postBillPaymentApi,
    postCreateBillApi,
    getBillsApi,
    deleteBillApi,
    updateBillOutletApi,
    verifyBillApi,
    patchBillApi,
    convertAndCompareNewBills,
};
