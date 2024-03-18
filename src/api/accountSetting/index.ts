import makeRequest from '..';
import { BASE_API_BPT_URL } from '../../constants';

export interface IDataGetAccountSettingRes {
    createdAt: string;
    id: string;
    merchantSettlementId: string;
    consentUpdated: boolean;
    saveBillerShowed: boolean;
    tutorialShowed: boolean;
    updatedAt: string;
}

export const getAccountSettingApi = (merchantSettlementId: string) => {
    const url = `${BASE_API_BPT_URL}/account-settings/${merchantSettlementId}/`;
    return makeRequest<IDataGetAccountSettingRes>({ url, method: 'GET' });
};

export interface IDataToPostAccountSetting {
    merchantSettlementId: string;
    consentUpdated?: boolean;
    saveBillerShowed?: boolean;
    tutorialShowed?: boolean;
}

export const postAccountSettingsApi = (data: IDataToPostAccountSetting) => {
    const url = `${BASE_API_BPT_URL}/account-settings/`;
    return makeRequest<any>({ url, method: 'POST', data });
};

export const patchAccountSettingsApi = ({ merchantSettlementId, ...data }: IDataToPostAccountSetting) => {
    const url = `${BASE_API_BPT_URL}/account-settings/${merchantSettlementId}/`;
    return makeRequest<any>({ url, method: 'PATCH', data });
};

// validation pin
export const getPinLogApi = (merchantSettlementId: string) => {
    const url = `${BASE_API_BPT_URL}/pin-logs/validation-info`;
    return makeRequest<any>({ url, method: 'GET', params: { merchantSettlementId } });
};
