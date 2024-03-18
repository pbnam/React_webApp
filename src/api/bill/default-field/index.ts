import makeRequest from '../..';
import { BASE_API_BPT_URL } from '../../../constants';
import { ICancelToken, IUniqueReqKey } from '../../interface';

export interface IDataToGetDefaultField extends IUniqueReqKey, Partial<ICancelToken> {
    productId: string;
    categoryId: string;
    accountNumber: string;
}

interface IBillDefaultFieldRes {
    responseCode: string;
    responseMessage: string;
    isBillRepresentmentAvailable: string;
    fields: IDataDefaultField[];
}

export interface IDataDefaultField {
    name: string;
    value: string;
}

export const getDefaultFieldBill = ({ cancelToken, ...params }: IDataToGetDefaultField) => {
    const url = `${BASE_API_BPT_URL}/wallet-services/biller/default-field`;
    return makeRequest<IBillDefaultFieldRes>({ url, method: 'GET', params, cancelToken });
};
