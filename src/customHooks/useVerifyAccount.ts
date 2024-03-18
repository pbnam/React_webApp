import { useEffect, useRef } from 'react';
import { BuildVariants, BuildVariantsType } from '../config';
import { MERCHANT_SETTLEMENT_ID, TOKEN_MINI_APP } from '../constants';
import { useAppDispatch } from '../redux';
import { checkAuthentication } from '../redux/auth/thunk';
import { eraseCookie, getCookie, setCookie } from '../utils/storage';

const useVerifyAccount = () => {
    const dispatch = useAppDispatch();
    const devEnv = useRef(BuildVariants.DEVELOPMENT);
    const setMockCookie = () => {
        setCookie({
            name: 'auth',
            value: `Bearer ${TOKEN_MINI_APP}`,
            days: 30,
        });
        setCookie({
            name: 'merchantSettlementId',
            value: MERCHANT_SETTLEMENT_ID,
            days: 30,
        });
    };

    useEffect(() => {
        (process.env.REACT_APP_ENV as BuildVariantsType) === devEnv.current && setMockCookie();
    }, []);

    const removeCookie = () => {
        eraseCookie('merchantSettlementId');
        eraseCookie('auth');
    };

    const verifyAcccountByCookie = () => {
        dispatch(checkAuthentication(getCookie('merchantSettlementId') as string));
    };

    return { verifyAcccountByCookie, removeCookie };
};

export default useVerifyAccount;
