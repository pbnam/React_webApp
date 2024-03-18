import React, { useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import Breadcrumb from '../../../../components/Breadcrumb';
import { RootState } from '../../../../redux';
import './index.scss';
import intl from 'react-intl-universal';

import { Wallet2SVG, ShareSVG } from '../../../../allSvg';

import { convertCurrency, convertSenToRM, formatAccountNumber, getFormattedTransactionTime, makeScreenshot } from '../../../../utils/common';
import { ShareImg } from '../../../../constants/ImgAsset';
import { useLocation } from 'react-router-dom';
import { ITransactionType } from '../../../../api/transaction';

const ShareReceipt = () => {
    const resultRef = useRef<HTMLDivElement | any>();
    const { temporaryBillerData, temporaryTransactionData } = useSelector((state: RootState) => state.bill);
    const { currentUser, platformAccess } = useSelector((state: RootState) => state.auth);
    let location = useLocation();

    const handleShare = async () => {
        if (platformAccess.type === 'Web') {
            resultRef.current.classList.add('make-screenshot');

            let blob = await makeScreenshot(resultRef.current).then(async (urlRes: any) => await (await fetch(urlRes)).blob());

            resultRef.current.classList.remove('make-screenshot');

            const filesArray = [
                new File([blob], 'animation.png', {
                    type: blob.type,
                }),
            ];

            const shareData = {
                files: filesArray,
            };

            try {
                if (!navigator.canShare(shareData)) {
                    throw new Error("Can't share data.");
                }
                await navigator.share(shareData);
            } catch (err) {
                console.log(err);
            }
        } else {
            console.log('App-Share');
        }
    };

    const dataLocationTransaction = useMemo(() => {
        return location.state as ITransactionType;
    }, [location.state]);

    const transactionInforData = useMemo(() => {
        return {
            desc: dataLocationTransaction?.merchantName ?? temporaryBillerData?.productDisplayName,
            accountNumber: formatAccountNumber(dataLocationTransaction?.accountNumber ?? temporaryTransactionData?.defaultBillData?.accountNumber),
            transactionId: dataLocationTransaction?.transactionId ?? temporaryTransactionData?.transactionData?.transactionId,
            paymentAmount: convertCurrency(convertSenToRM(dataLocationTransaction?.amount ?? temporaryTransactionData?.transactionData?.amount)),
            billName: dataLocationTransaction?.merchantName ?? '',
        };
    }, [dataLocationTransaction, temporaryTransactionData, temporaryBillerData]);

    const transactionInforRender = useMemo(() => {
        return [
            {
                id: 0,
                name: intl.get('text.DESCRIPTION_TEXT'),
                value: transactionInforData.desc,
            },
            {
                id: 1,
                name: intl.get('label.ACCOUNT_NUMBER_LABEL'),
                value: transactionInforData.accountNumber,
            },
            {
                id: 2,
                name: intl.get('label.ACCOUNT_NAME_LABEL'),
                value: currentUser?.fullName,
            },
            {
                id: 3,
                name: intl.get('label.TRANSACTION_ID_LABEL'),
                value: transactionInforData.transactionId,
            },
            {
                id: 4,
                name: 'Merchant Wallet',
                value: `- ${transactionInforData.paymentAmount}`,
            },
        ];
    }, [transactionInforData]);

    return (
        <div className="share-page page-bg-light" ref={resultRef}>
            <Breadcrumb />
            <header className="share-page__header">
                <div className="header-content">
                    <img src={ShareImg} />
                    <h2>{intl.get('title.SHARE_SCREEN_TITLE')}</h2>
                </div>
                <ShareSVG className="share-svg" onClick={handleShare} />
            </header>
            <div className="share-page__content">
                <div className="container">
                    <div className="transaction-header">
                        <div className="transaction-header__svg">
                            <Wallet2SVG />
                        </div>
                        <div className="transaction-header__text">
                            <span>{getFormattedTransactionTime(dataLocationTransaction?.transactionDateTime ?? temporaryTransactionData?.transactionData?.transactionAt)}</span>
                            <h2>{transactionInforData.paymentAmount}</h2>
                        </div>
                    </div>
                    <ul className="transaction-infor">
                        {transactionInforRender.map((item: any) => {
                            if (!item.value) return false;
                            return (
                                <li key={item.id} className="transaction-infor__item">
                                    <h4 className="transaction-infor__name">{item.name}</h4>
                                    <span className="transaction-infor__value">{item.value}</span>
                                </li>
                            );
                        })}
                    </ul>
                    <p className="transaction-bottom">{intl.get('desc.SHARE_SCREEN_DESC')}</p>
                    <p className="result"></p>
                </div>
            </div>
        </div>
    );
};

export default ShareReceipt;
