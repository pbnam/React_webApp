import makeRequest from '../..';
import { BASE_API_BPT_URL } from '../../../constants';
import { ICancelToken, IUniqueReqKey } from '../../interface';

export interface IDataToVerifyAccountNumber extends IUniqueReqKey, ICancelToken {
    productId: string;
    categoryId: string;
    accountNumber: string;
    msisdn: string;
}

interface IAccountNumberRes {
    responseCode: string;
    responseMessage: string;
    productId: string;
}

export const verifyAccountNumber = ({ cancelToken, ...data }: IDataToVerifyAccountNumber) => {
    const url = `${BASE_API_BPT_URL}/wallet-services/biller/requisite`;
    return makeRequest<IAccountNumberRes>({ url, method: 'POST', data, cancelToken });
};
