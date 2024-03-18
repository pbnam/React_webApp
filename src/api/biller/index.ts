import makeRequest from '..';
import { BASE_API_BPT_URL } from '../../constants';
import { IUniqueReqKey } from '../interface';
import { IBillerRes } from './interface';

export const getAllBiller = (params: IUniqueReqKey) => {
    const url = `${BASE_API_BPT_URL}/wallet-services/biller/categories`;
    return makeRequest<IBillerRes>({ url, method: 'GET', params });
};
