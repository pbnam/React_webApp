import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import Breadcrumb from '../../../../components/Breadcrumb';
import { convertCurrency, convertSenToRM, formatAccountNumber } from '../../../../utils/common';
import BillButton, { sizeButton } from '../../../../components/Button';
import Drawer from '../../../../components/Drawer';
import PinField from 'react-pin-field';
import intl from 'react-intl-universal';

import { WalletSVG, LockSVG } from '../../../../allSvg';

import './index.scss';
import { RootState, useAppDispatch } from '../../../../redux';
import { postBillPayment } from '../../../../redux/bill/thunk';
import { useSelector } from 'react-redux';
import { billActions } from '../../../../redux/bill/silce';
import Splash from '../../../../components/Splash';
import { IBiller } from '../../../../api/biller/interface';
import { useContextStore } from '../../../../App';
import { CHANNEL_CLEVER_TAP } from '../../../../constants';
import { IDataPostBillPayment } from '../../../../api/bill/interface';
import BoxMessage from '../../../../components/BoxMessage';
import { PIN_BLOCKED_CODE } from '../../../../constants/errorCode';
import BoxThumbnail from '../../../../components/BoxThumbnail';

const ConfirmPayment: React.FC = () => {
    const [showDrawer, setShowDrawer] = useState(false);
    const { currentUser: authData, pinLog } = useSelector((state: RootState) => state.auth);
    const { platformAccess } = useSelector((state: RootState) => state.auth);

    const { temporaryBillerData, temporaryTransactionData, isHandling, temporaryData } = useSelector((state: RootState) => state.bill);

    const { billerId } = useParams<any>();
    let navigate = useNavigate();
    const dispatch = useAppDispatch();
    let location = useLocation();

    const pinRef = useRef<HTMLInputElement | any>(null);

    const [isHandleNextStep, setIsHandleNextStep] = useState(false);

    const currentBiller = useOutletContext<IBiller>();
    const [openSnackbarMessage, setOpenSnackbarMessage] = useState(false);

    const [messageWallet, setMessageWallet] = useState<string | null>(null);

    const { handlePushEventCleverTap } = useContextStore();

    const currentData = useMemo(() => {
        return {
            chargeUnit: temporaryBillerData?.serviceCharge?.chargeUnit || null,
            chargeValue: Number(temporaryBillerData?.serviceCharge?.chargeValue) || 0,
            paymentAmount: temporaryData?.paymentAmount || 0,
            accountNumber: temporaryTransactionData?.defaultBillData?.accountNumber || '',
        };
    }, []);

    const formattedServiceCharge = useMemo(() => {
        return currentData.chargeUnit === 'percentage' ? (currentData.paymentAmount * Number(currentData.chargeValue)) / 100 : Number(currentData.chargeValue);
    }, [currentData]);

    const formattedData = useMemo(() => {
        return {
            paymentAmount: convertCurrency(convertSenToRM(currentData.paymentAmount)),
            chargeValue: formattedServiceCharge ? convertCurrency(convertSenToRM(formattedServiceCharge)) : false,
            totalPaymentAmount: convertCurrency(convertSenToRM(currentData.paymentAmount + formattedServiceCharge)),
            balance: convertCurrency(convertSenToRM((authData?.balance?.amount as number) || 0)),
        };
    }, [currentData.paymentAmount, formattedServiceCharge]);

    const validPinCode = useMemo(() => temporaryData?.pinCode?.valid, [temporaryData?.pinCode?.valid]);
    const messagePayment = useMemo(() => temporaryData?.pinCode?.message, [temporaryData?.pinCode?.message]);

    const handleCloseBoxMessage = () => {
        setOpenSnackbarMessage(false);
    };

    const handleOpenPinDrawer = () => {
        if (Number(authData?.balance?.amount) < currentData.paymentAmount + currentData.chargeValue) {
            setOpenSnackbarMessage(true);
            setMessageWallet('Insufficient merchant wallet balance');
        } else {
            setShowDrawer(true);
            setMessageWallet(null);
        }
    };

    const handleCheckingPin = (e: any) => {
        if (billerId && authData) {
            let billPaymentData: IDataPostBillPayment = {
                merchantSettlementId: authData?.merchantSettlementId,
                accountNumber: currentData.accountNumber,
                amount: currentData.paymentAmount,
                categoryId: currentBiller?.categoryId as string,
                productId: currentBiller?.productId as string,
                providerId: currentBiller?.providerId as string,
                pin: e,
            };

            !isHandling &&
                dispatch(postBillPayment(billPaymentData)).then((res) => {
                    let pinValid = res.payload?.data?.valid;
                    // auto close drawer when enter exactly pin
                    pinValid && setShowDrawer(false);

                    // when payment failed
                    pinValid && res.payload?.data?.message && setOpenSnackbarMessage(true);

                    // when enter pin wrong
                    !pinValid && handleResetPin();
                });
        }
        setIsHandleNextStep(true);
    };

    const handleContinueFocusPin = async () => {
        let key = 0;
        pinRef.current.forEach((input: HTMLInputElement) => {
            if (input.value) {
                key++;
            }
        });
        pinRef.current[key].focus();
    };

    const handleResetPin = () => {
        if (pinRef.current) {
            pinRef.current[0].focus();
            pinRef.current.forEach((input: HTMLInputElement) => (input.value = ''));
        }
    };

    // cleverTap on pageView
    useEffect(() => {
        showDrawer &&
            handlePushEventCleverTap({
                channel: platformAccess.type + '-' + CHANNEL_CLEVER_TAP,
                section: 'Pin',
            });
    }, [showDrawer]);

    // auto close snackbar
    useEffect(() => {
        !messageWallet && !messagePayment && setOpenSnackbarMessage(false);
    }, [messagePayment, messageWallet]);

    // remove old pincode store first
    useEffect(() => {
        validPinCode !== null && dispatch(billActions.resetPinCodeStore());
    }, []);

    //transaction payment now
    useEffect(() => {
        if (isHandleNextStep && temporaryData.stepDone.includes('step3') && !isHandling && temporaryTransactionData?.transactionData?.status !== null) {
            navigate(`/sebiller/result/${billerId}`, { state: location.state });
        }
    }, [temporaryData.stepDone, isHandleNextStep, temporaryTransactionData?.transactionData?.status, isHandling]);

    //when pin block, redirect to dashboard
    useEffect(() => {
        if (isHandleNextStep && pinLog.isBlocked) {
            navigate(`/dashboard`, { state: PIN_BLOCKED_CODE });
        }
    }, [pinLog.isBlocked, isHandleNextStep]);

    return (
        <div className="confirm-payment-page page-bg-light">
            {openSnackbarMessage && <BoxMessage status="warning" onCloseBtn={handleCloseBoxMessage} content={messageWallet ?? messagePayment} />}
            {isHandleNextStep && <Splash isOpen={isHandling} style={{ opacity: '.7', position: 'fixed', zIndex: 9999 }} />}
            <Breadcrumb breadName={intl.get('title.AMOUNT_TITLE')} verticalStyle={true} />
            <div className="confirm-payment-content">
                <div className="confirm-payment-content__scroll">
                    <section className="confirm-payment__header container">
                        <h2 className="pay-amount">{formattedData.paymentAmount}</h2>
                        <div className="balance-box">
                            <WalletSVG className="balance-box__icon" />
                            <span className="balance-box__amount">{`${intl.get('title.WALLET_BALANCE_TITLE')}: ${formattedData.balance}`}</span>
                        </div>
                    </section>
                    <section className="confirm-payment__payto container">
                        <h4 className="payto__header">{intl.get('title.CONFIRM_BILL_PAY_TO_TITLE')}</h4>
                        <div className="payto__card">
                            <div className="payto__biller-infor">
                                <BoxThumbnail height={80} src={currentBiller?.providerLogoUrl} />
                                {currentBiller.productDisplayName && <h3 className="payto__name">{currentBiller.productDisplayName}</h3>}
                                <span className="payto__account-number">{formatAccountNumber(currentData.accountNumber)}</span>
                            </div>
                            {formattedData.chargeValue && (
                                <div className="payto__charge">
                                    <li className="charge-item charge-item--fee">
                                        <h5 className="charge-item__label">{intl.get('label.SERVICE_CHARGE_LABEL')}</h5>
                                        <span className="charge-item__price">{formattedData.chargeValue}</span>
                                    </li>
                                    <li className="charge-item charge-item--total">
                                        <h4 className="charge-item__label">{intl.get('label.TOTAL_AMOUNT_LABEL')}</h4>
                                        <span className="charge-item__price">{formattedData.totalPaymentAmount}</span>
                                    </li>
                                </div>
                            )}
                        </div>
                        {temporaryBillerData.info && (
                            <div className="payto__info">
                                <h4 className="info-title">{intl.get('title.CONFIRM_BILL_MORE_INFO_TITLE')}</h4>
                                <div className="info-content">{temporaryBillerData.info}</div>
                            </div>
                        )}
                    </section>
                </div>
                <section className="confirm-payment__more-info container">
                    <BillButton onClick={handleOpenPinDrawer} fullWidth size={sizeButton.sizeXL}>
                        {intl.get('button.PAY_BUTTON') + ' ' + formattedData.totalPaymentAmount}
                    </BillButton>
                </section>
            </div>
            <Drawer
                onClose={() => {
                    setShowDrawer((prevState) => !prevState);
                }}
                title={validPinCode === false ? intl.get('notification.ENTER_INCORRECT_PIN') : intl.get('button.CONFIRM_BILL_PAY_BILL_BUTTON')}
                icon={<LockSVG />}
                visible={showDrawer}
                className={validPinCode === false ? 'drawer-confirm-payment error' : 'drawer-confirm-payment'}
                afterVisibleChange={(visible) => {
                    visible && handleResetPin();
                }}
            >
                <div className="drawer-pin__wrapper" onClick={handleContinueFocusPin}>
                    <h2 className="drawer__title">{currentBiller.productDisplayName}</h2>
                    <span>
                        <b className="drawer__amount">{formattedData.totalPaymentAmount}</b> {intl.get('desc.CONFIRM_BILL_DESC')}
                    </span>
                    <div className="pin-field__container">
                        <PinField ref={pinRef} inputMode="numeric" length={6} type={'number'} placeholder="." pattern="[0-9]" onComplete={handleCheckingPin} autoFocus />
                    </div>
                    <div className="pin-field__forgot-pin">{intl.get('notification.CONFIRM_BILL_FORGOT_PIN')}</div>
                </div>
            </Drawer>
        </div>
    );
};
export default ConfirmPayment;
