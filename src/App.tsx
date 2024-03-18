import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import intl from 'react-intl-universal';

import 'react-alice-carousel/lib/alice-carousel.css';
import 'antd/dist/antd.min.css';
import './App.scss';

import { CHANNEL_CLEVER_TAP } from './constants';
import { RootState, useAppDispatch } from './redux';
import { postRepresentmentConsent } from './redux/auth/thunk';
import AppRouter from './router';
import { authActions } from './redux/auth/slice';
import { detectWebView } from './utils/common';

import Splash from './components/Splash';
import Greeting from './view/greeting';
import ErrorView from './view/error404';
import { IDataGetWalletApiRes } from './api/wallet';
import { billActions } from './redux/bill/silce';
import { useCleverTap, useFirstLoaded, useVerifyAccount } from './customHooks';

interface ICleverTagData {
    [x: string]: any;
    channel: string;
    section: string;
    screen?: string;
    action?: string;
    payload?: any;
}

interface ICleverTagContext {
    handlePushEventCleverTap: (data: ICleverTagData) => void;
    handleValidatorFeature: (cb: () => void) => void;
}

const StoreContext = React.createContext<ICleverTagContext>({
    handlePushEventCleverTap: () => {},
    handleValidatorFeature: () => {},
});

export const useContextStore = () => {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error('Component must be inside app');
    }
    return context;
};

function App() {
    const dispatch = useAppDispatch();
    const authData = useSelector((state: RootState) => state.auth);

    const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
    const { splashLoaded, setSplashLoaded, getDefaultData } = useFirstLoaded();
    const { handlePushEventCleverTap } = useCleverTap();
    const { verifyAcccountByCookie, removeCookie } = useVerifyAccount();

    const handleValidatorFeature = useCallback(
        (callback: () => void) => {
            authData.pinLog?.isBlocked && authData.pinLog?.checked
                ? dispatch(
                      billActions.addBoxMessage({
                          content: intl.get('notification.ACCOUNT_BLOCKED'),
                          method: null,
                      }),
                  )
                : callback();
        },
        [authData.pinLog?.isBlocked, authData.pinLog?.checked],
    );

    // Step1: verify account first
    useEffect(() => {
        verifyAcccountByCookie();

        return () => {
            removeCookie();
        };
    }, []);

    // Step1: detect device with resize window
    useEffect(() => {
        window.addEventListener('resize', function () {
            dispatch(authActions.verifyPlatForm(detectWebView()));
        });
        return () => {
            window.removeEventListener('resize', function () {
                dispatch(authActions.verifyPlatForm(detectWebView()));
            });
        };
    }, []);

    // Step2: For auth: false,
    useEffect(() => {
        if (!authData.isLogging && authData.auth === false) {
            setSplashLoaded(true);
            setIsNewUser(false);
        }
    }, [authData.isLogging, authData.auth]);

    // Step2: For auth: true, get default data
    useEffect(() => {
        if (authData.auth) {
            let { walletAccountId, merchantSettlementId } = authData.currentUser as IDataGetWalletApiRes;
            getDefaultData({
                walletAccountId,
                merchantSettlementId,
            });
        }
    }, [authData.auth]);

    // Step2: For auth: true, Check newUser
    useEffect(() => {
        if (authData.accountSetting.consentUpdated !== null && authData.auth) {
            setIsNewUser(!authData.accountSetting.consentUpdated);
        }
    }, [authData.auth, authData.accountSetting.consentUpdated]);

    if (authData.auth && authData.accountSetting.consentUpdated === false) {
        const handleCloseIntro = () => {
            dispatch(
                postRepresentmentConsent({
                    merchantSettlementId: authData.currentUser?.merchantSettlementId as string,
                    walletAccountId: authData.currentUser?.walletAccountId as string,
                    consent: true,
                }),
            ).then((res) => {
                res.payload &&
                    handlePushEventCleverTap({
                        channel: authData.platformAccess.type + '-' + CHANNEL_CLEVER_TAP,
                        section: 'Activate',
                    });
            });
        };
        return <Greeting onClose={handleCloseIntro} />;
    }

    return (
        <StoreContext.Provider
            value={{
                handlePushEventCleverTap,
                handleValidatorFeature,
            }}
        >
            <div className="App">
                <Splash isOpen={!splashLoaded} />
                {authData.auth && splashLoaded && isNewUser !== null ? <AppRouter isNewUser={isNewUser} /> : <ErrorView />}
            </div>
        </StoreContext.Provider>
    );
}

export default App;
