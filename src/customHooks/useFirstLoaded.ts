import { useState } from 'react';
import { useAppDispatch } from '../redux';
import { authActions } from '../redux/auth/slice';
import { getValidationPin, verifyRepresentmentConsent } from '../redux/auth/thunk';
import { getAsapBills, updateBillsData } from '../redux/bill/billThunk';
import { getBillers } from '../redux/biller/thunk';
import { detectWebView } from '../utils/common';
import useTranslate from './useTranslate';

interface IUseFirstLoaded {
    walletAccountId: string;
    merchantSettlementId: string;
}
const useFirstLoaded = () => {
    const [splashLoaded, setSplashLoaded] = useState<boolean>(false);
    const dispatch = useAppDispatch();
    const { loadLocales } = useTranslate();

    const getDefaultData = ({ walletAccountId, merchantSettlementId }: IUseFirstLoaded) => {
        dispatch(authActions.verifyPlatForm(detectWebView()));

        let consentPromise = new Promise((res) => {
            dispatch(verifyRepresentmentConsent(merchantSettlementId)).finally(() => res(true));
        });

        let billersPromise = new Promise((res) => {
            dispatch(
                getBillers({
                    walletAccountId,
                    merchantSettlementId,
                }),
            ).finally(() => res(true));
        });

        let billDataPromise = new Promise((res) => {
            dispatch(
                updateBillsData({
                    walletAccountId,
                    merchantSettlementId,
                }),
            ).finally(() => res(true));
        });

        let validatorPinPromise = new Promise((res) => {
            dispatch(getValidationPin(merchantSettlementId)).finally(() => res(true));
        });

        let translatePromise = new Promise((res) => {
            loadLocales().finally(() => res(true));
        });

        Promise.all([consentPromise, billersPromise, billDataPromise, validatorPinPromise, translatePromise]).finally(() => {
            setSplashLoaded(true);
        });
    };

    return { splashLoaded, setSplashLoaded, getDefaultData };
};

export default useFirstLoaded;
