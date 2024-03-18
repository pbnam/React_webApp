import React, { useEffect, useMemo, useState } from 'react';
import './index.scss';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import intl from 'react-intl-universal';

import walletIco from '../../../../assets/ico-wallet.png';
import { ArrowLeftSVG } from '../../../../allSvg';

import BillButton, { sizeButton } from '../../../../components/Button';
import Splash from '../../../../components/Splash';

import { convertCurrency, convertSenToRM, formatAccountNumber, getFormattedTransactionTime } from '../../../../utils/common';
import { RootState, useAppDispatch } from '../../../../redux';
import { updateBillsData } from '../../../../redux/bill/billThunk';
import { billActions } from '../../../../redux/bill/silce';
import { RouteConfig } from '../../../../router';
import { RESULT_PAYMENT_IMG } from '../../../../constants/ImgBase64';
import { useContextStore } from '../../../../App';
import { CHANNEL_CLEVER_TAP } from '../../../../constants';
import { IBiller } from '../../../../api/biller/interface';

const ResultForm = () => {
    let navigate = useNavigate();
    const { currentUser, platformAccess } = useSelector((state: RootState) => state.auth);
    const { billerId } = useParams<any>();
    const dispatch = useAppDispatch();
    const { handlePushEventCleverTap } = useContextStore();

    const { temporaryTransactionData, temporaryData } = useSelector((state: RootState) => state.bill);
    const currentBiller = useOutletContext<IBiller>();
    const [loading, setLoading] = useState<boolean>(false);

    const transactionData = useMemo(() => {
        return {
            ...temporaryTransactionData?.transactionData,
            billerName: currentBiller.productDisplayName,
            accountNumber: temporaryTransactionData?.defaultBillData?.accountNumber,
        };
    }, [temporaryTransactionData]);

    // check status transaction
    const transactionOb = {
        SUCCESS: {
            id: 1,
            img: RESULT_PAYMENT_IMG.successSrc,
            status: 'SUCCESS',
            label: intl.get('title.SUCCESS_TITLE'),
        },
        PENDING: {
            id: 0,
            img: RESULT_PAYMENT_IMG.pendingSrc,
            status: 'PENDING',
            label: intl.get('title.PENDING_TITLE'),
        },
        FAILED: {
            id: 2,
            img: RESULT_PAYMENT_IMG.failSrc,
            status: 'FAILED',
            label: intl.get('title.FAILED_TITLE'),
        },
    };
    const transactionResult = useMemo(() => {
        return transactionOb[transactionData?.status] || transactionOb['PENDING'];
    }, [transactionData?.status]);

    const handlingAfterClickNextStepToHomePage = () => {
        dispatch(billActions.deleteTemporaryData());

        // fix redirect related to stepRouter middleware
        setTimeout(() => {
            navigate(`/dashboard`);
        }, 0);
    };

    const handleNextStep = () => {
        if (temporaryData?.billExistence && transactionResult.status === 'SUCCESS') {
            setLoading(true);
            dispatch(
                updateBillsData({
                    merchantSettlementId: currentUser?.merchantSettlementId as string,
                    walletAccountId: currentUser?.walletAccountId as string,
                }),
            ).finally(() => {
                setLoading(false);
                handlingAfterClickNextStepToHomePage();
            });
        } else if (!temporaryData?.billExistence && transactionResult.status === 'SUCCESS') {
            navigate(`/sebiller/saveBiller/${billerId}`);
        } else {
            handlingAfterClickNextStepToHomePage();
        }
    };

    const styleDisableNextStep: React.CSSProperties = useMemo(() => {
        return transactionResult.status === 'PENDING' ? { pointerEvents: 'none', opacity: 0.3 } : { pointerEvents: 'auto' };
    }, [transactionResult]);

    const handleMakeScreenShot = () => {
        !temporaryData?.isSharing && dispatch(billActions.makeSharing());
        navigate(RouteConfig.share);
    };

    // cleverTap on pageView
    useEffect(() => {
        transactionResult &&
            handlePushEventCleverTap({
                channel: platformAccess.type + '-' + CHANNEL_CLEVER_TAP,
                section: 'Payment',
                screen: transactionResult.status.charAt(0).toUpperCase() + transactionResult.status.slice(1).toLowerCase(),
                payload: {
                    transaction_id: transactionData.transactionId,
                    biller_name: transactionData.billerName,
                    bill_amount: transactionData.amount,
                },
            });
    }, [transactionResult, transactionData]);

    return (
        <div className="page-bg-light">
            <Splash isOpen={loading} />
            <div className="biller-result-form">
                <img src={transactionResult.img} />
                <div className="biller-result-form__content container">
                    <h1 className={`entry-title ${transactionResult.status}`}>{transactionResult.label}!</h1>
                    <div className="entry-header">
                        <label className="entry-header__label">{intl.get('label.TOTAL_AMOUNT_LABEL')}</label>
                        <h2 className="entry-header__price">{convertCurrency(convertSenToRM(transactionData.amount))}</h2>
                    </div>
                    <div className="entry-summary">
                        <table className="biller-result-form__table">
                            <tbody>
                                <tr>
                                    <th>{intl.get('label.TRANSACTION_ID_LABEL')}</th>
                                    <td>{transactionData.transactionId}</td>
                                </tr>
                                <tr>
                                    <th>{intl.get('label.PAID_TO_LABEL')}</th>
                                    <td className="box-infor">
                                        <h5 className="box-infor__name">{transactionData.billerName}</h5>
                                        <span className="box-infor__number">{formatAccountNumber(transactionData.accountNumber)}</span>
                                        <span className="box-infor__time">{intl.get('text.ON_TEXT') + ' ' + getFormattedTransactionTime(transactionData.transactionAt)}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <th>{intl.get('label.MERCHANT_WALLET_LABEL')}</th>
                                    <td className="box-wallet">
                                        <span className="box-wallet__wrapper">
                                            <span className="wallet-icon">
                                                <img src={walletIco} />
                                            </span>
                                            <span className="wallet-content">
                                                <span className="wallet-content__paid">
                                                    <span className="minus-icon"></span>
                                                    <h5>{transactionResult.status === 'FAILED' ? convertCurrency(0) : convertCurrency(convertSenToRM(transactionData.amount))}</h5>
                                                </span>
                                                <span className="wallet-content__balance">Balance: {convertCurrency(convertSenToRM(currentUser?.balance?.amount ?? 0))}</span>
                                            </span>
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="entry-button">
                        {transactionResult.status !== 'FAILED' && (
                            <BillButton size={sizeButton.sizeXL} hasOutline={true} onClick={handleMakeScreenShot} style={styleDisableNextStep}>
                                {intl.get('button.RESULT_SHARE_BUTTON')}
                            </BillButton>
                        )}
                        <button className="entry-button__next" onClick={handleNextStep} style={styleDisableNextStep}>
                            <ArrowLeftSVG />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultForm;
