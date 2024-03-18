import React, { ReactNode, useLayoutEffect, useMemo } from 'react';
import { Routes, Route, Navigate, HashRouter, useLocation } from 'react-router-dom';
import { HIDDEN_ARROW_BREADCRUMB } from '../constants';
import BillerView from '../view/biller';
import BillerListing from '../view/biller/billListing';
import AccountInfoAndAmount from '../view/biller/billListing/accountInfoAndAmount';
import AccountNumber from '../view/biller/billListing/accountNumber';
import ConfirmPayment from '../view/biller/billListing/confirmPayment';
import ResultForm from '../view/biller/billListing/result';
import SaveBiller from '../view/biller/billListing/saveBiller';
import ShareReceipt from '../view/biller/billListing/shareReceipt';
import Dashboard from '../view/dashboard';
import Transaction from '../view/transaction';
import StepRouter from './StepRouter';

interface IWrapper {
    children: React.ReactElement;
}
// on to top when switch navigation
const Wrapper: React.FC<IWrapper> = ({ children }) => {
    const location = useLocation();
    useLayoutEffect(() => {
        document.documentElement.scrollTo(0, 0);
    }, [location.pathname]);

    return children;
};

export const RouteConfig = {
    initialRoute: `/`,
    dashboard: '/dashboard',
    biller: '/biller',
    sebiller: '/sebiller',
    transaction: '/transaction',
    share: '/shareReceipt',
};

export const stepToAddBillUrl = {
    step1: '/sebiller/form',
    step2: '/sebiller/infoandamount',
    step3: '/sebiller/confirm',
    step4: '/sebiller/result',
    step5: '/sebiller/saveBiller',
};
interface IRouteObjType {
    id: number;
    step: string;
    stepCleverTapName: string;
    element: ReactNode;
    url: string;
    beforeStep: keyof typeof stepToAddBillUrl;
}

interface AppRouterProps {
    isNewUser?: boolean;
}

const AppRouter: React.FC<AppRouterProps> = ({ isNewUser = true }) => {
    const routeObj = useMemo((): IRouteObjType[] => {
        return [
            {
                id: 1,
                step: '',
                stepCleverTapName: 'EnterAccount',
                element: <AccountNumber />,
                url: stepToAddBillUrl.step1,
                beforeStep: 'step1',
            },
            {
                id: 2,
                step: 'step1',
                stepCleverTapName: 'AccountInfo',
                element: <AccountInfoAndAmount />,
                url: stepToAddBillUrl.step2,
                beforeStep: 'step1',
            },
            {
                id: 3,
                step: 'step2',
                stepCleverTapName: 'ConfirmAmount',
                element: <ConfirmPayment />,
                url: stepToAddBillUrl.step3,
                beforeStep: 'step2',
            },
            {
                id: 4,
                step: 'step3',
                stepCleverTapName: '',
                element: <ResultForm />,
                url: stepToAddBillUrl.step4,
                beforeStep: 'step3',
            },
            {
                id: 5,
                step: 'step3',
                stepCleverTapName: 'SaveBiller',
                element: <SaveBiller />,
                url: stepToAddBillUrl.step5,
                beforeStep: 'step4',
            },
        ];
    }, []);

    return (
        <HashRouter>
            <Wrapper>
                <Routes>
                    <Route
                        path={RouteConfig.initialRoute}
                        element={<Navigate to={!isNewUser ? RouteConfig.dashboard : RouteConfig.biller} state={!isNewUser ? '' : HIDDEN_ARROW_BREADCRUMB} />}
                    />
                    <Route path={RouteConfig.dashboard} element={<Dashboard />} />
                    <Route path={RouteConfig.biller} element={<BillerView />} />
                    <Route path={`${RouteConfig.sebiller}/:catName`} element={<BillerListing />} />
                    <Route path={RouteConfig.transaction} element={<Transaction />} />
                    <Route path="*" element={<Dashboard />} />

                    {routeObj.map((item: any) => {
                        return (
                            <Route
                                key={item.id}
                                path={`${item.url}/:billerId`}
                                element={<StepRouter requireStep={item.step} beforeStep={item.beforeStep} cleverTapName={item.stepCleverTapName} />}
                            >
                                <Route path={`${item.url}/:billerId`} element={item.element} />
                            </Route>
                        );
                    })}
                    <Route path={RouteConfig.share} element={<ShareReceipt />} />
                </Routes>
            </Wrapper>
        </HashRouter>
    );
};

export default AppRouter;
