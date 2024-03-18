import makeRequest from '../..';
import { BASE_API_BPT_URL } from '../../../constants';
import { ICancelToken, IOutletType, IUniqueReqKey } from '../../interface';

export interface IDataToUpdateBillOutlet extends ICancelToken {
    name: string;
    outletId: string;
    type: IOutletType;
}

export const updateBillOutletApi = ({ cancelToken, ...data }: IDataToUpdateBillOutlet, outletId: string) => {
    const url = `${BASE_API_BPT_URL}/outlets/${outletId}`;
    return makeRequest<any>({ url, method: 'PATCH', data, cancelToken });
};

//
export interface IDataToGetOutlet extends IUniqueReqKey {
    page: number;
    limit: number;
    search?: string;
}

export interface IDataOutlet {
    billId: string;
    createdAt: string;
    id: string;
    name: string;
    outletId: string;
    type: IOutletType;
    updatedAt: string;
}

export interface IDataToGetOutletRes {
    page: number;
    limit: number;
    total: number;
    data: IDataOutlet[];
}

export const getOutletApi = (params: IDataToGetOutlet) => {
    const url = `${BASE_API_BPT_URL}/outlets`;
    return makeRequest<IDataToGetOutletRes>({ url, method: 'GET', params });
};
