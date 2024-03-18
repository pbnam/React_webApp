import makeRequest from '../..';
import { BASE_API_BPT_URL } from '../../../constants';
import { ICancelToken, IUniqueReqKey } from '../../interface';

export interface IDataToVerifyBillInfo extends IUniqueReqKey, ICancelToken {
    categoryId: string;
    providerId: string;
    productId: string;
}

interface IVerifyBillInfoRes {
    responseCode: string;
    responseMessage: string;
    categoryId: string;
    categoryName: string;
    providerId: string;
    providerName: string;
    providerLogoUrl: string;
    info: string;
    serviceCharge: {
        chargeValue: string;
        chargeUnit: string;
    };
    productId: string;
    productDisplayName: string;
    productFullName: string;
    isCasaRequired: boolean;
    paymentConditions: {
        minimumPayableAmount: string;
        maximumPayableAmount: string;
        decimalsAllowed: boolean;
    };
    userFields: any;
}

export const verifyBillInfo = ({ cancelToken, ...params }: IDataToVerifyBillInfo) => {
    const url = `${BASE_API_BPT_URL}/wallet-services/biller/product/info`;
    return makeRequest<IVerifyBillInfoRes>({ url, method: 'GET', params, cancelToken });
};
