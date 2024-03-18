import makeRequest from '../..';
import { BASE_API_BPT_URL } from '../../../constants';

export interface IDataToVerifyRepresentmentConsent {
    merchantSettlementId: string;
    walletAccountId: string;
    consent: boolean;
}

export const postRepresentmentConsentApi = (data: IDataToVerifyRepresentmentConsent) => {
    const url = `${BASE_API_BPT_URL}/wallet-services/biller/representment/consent`;
    return makeRequest<any>({ url, method: 'POST', data });
};
