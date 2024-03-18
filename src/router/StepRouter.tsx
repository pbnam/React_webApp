import React, { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import { RouteConfig, stepToAddBillUrl } from '.';
import { useContextStore } from '../App';
import { CHANNEL_CLEVER_TAP } from '../constants';
import { RootState, useAppDispatch } from '../redux';
import { billActions, stepSaveBill } from '../redux/bill/silce';
import intl from 'react-intl-universal';

interface StepRouterProps {
    requireStep: stepSaveBill;
    beforeStep: keyof typeof stepToAddBillUrl;
    cleverTapName: string;
}

const StepRouter: React.FC<StepRouterProps> = ({ requireStep, beforeStep, cleverTapName }) => {
    const { temporaryData } = useSelector((state: RootState) => state.bill);
    const { billerData } = useSelector((state: RootState) => state.biller);
    const { platformAccess, pinLog } = useSelector((state: RootState) => state.auth);
    const { billerId } = useParams();
    const dispatch = useAppDispatch();
    const { handlePushEventCleverTap } = useContextStore();

    const currentBiller = useMemo(() => {
        return billerData.find((item) => item.productId === billerId);
    }, [billerData, billerId]);

    // cleverTap on pageView
    useEffect(() => {
        cleverTapName &&
            handlePushEventCleverTap({
                channel: platformAccess.type + '-' + CHANNEL_CLEVER_TAP,
                section: cleverTapName,
            });
    }, [cleverTapName]);

    if (!currentBiller || (pinLog?.isBlocked && pinLog.checked)) {
        let contentMessage = !currentBiller ? `Can't find the biller or error server` : intl.get('notification.ACCOUNT_BLOCKED');

        dispatch(
            billActions.addBoxMessage({
                content: contentMessage,
                method: null,
            }),
        );
        return <Navigate to={`${RouteConfig.dashboard}`} />;
    } else if (!temporaryData.stepDone.includes(requireStep) && requireStep) {
        return <Navigate to={`${stepToAddBillUrl[beforeStep]}/${billerId}`} />;
    } else {
        return <Outlet context={currentBiller} />;
    }
};

export default StepRouter;
