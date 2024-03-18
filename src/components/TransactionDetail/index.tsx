import React, { useMemo } from 'react';
import intl from 'react-intl-universal';

import { convertCurrency, convertSenToRM, formatAccountNumber, getFormattedTransactionTime } from '../../utils/common';
import Drawer from '../Drawer';
import { PhoneSVG, ShareSVG, Wallet3SVG } from '../../allSvg';

import './index.scss';
import { useNavigate } from 'react-router-dom';
import { RouteConfig } from '../../router';
import { ITransactionType } from '../../api/transaction';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux';
import { IBiller } from '../../api/biller/interface';

interface TransactionDetailProps {
    onClose: () => void;
    visible: boolean;
    transaction: ITransactionType;
    currentBiller: IBiller;
}

const TransactionDetail: React.FC<TransactionDetailProps> = ({ visible, onClose, transaction, currentBiller }) => {
    let navigate = useNavigate();
    const { currentUser } = useSelector((state: RootState) => state.auth);

    const handleShareDetail = () => {
        navigate(RouteConfig.share, { state: transaction });
    };

    const convertTransaction = useMemo(() => {
        return {
            amount: convertCurrency(convertSenToRM(transaction.amount)),
            balance: convertCurrency(convertSenToRM(currentUser?.balance.amount as number)),
        };
    }, [transaction.amount, currentUser?.balance]);

    return (
        <Drawer
            title={intl.get('navigation.BILLS')}
            visible={visible}
            onClose={onClose}
            closable={true}
            className="transaction-detail-drawer"
            icon={
                <div className="transaction-detail__icon-header">
                    <PhoneSVG />
                </div>
            }
        >
            <div className="transaction-detail__summary">
                <div className="transaction-detail__summary-text">{intl.get('title.TRANSACTION_DETAIL_TITLE')}</div>
                <h2 className="transaction-detail__summary-amount">{convertTransaction.amount}</h2>
            </div>
            <div className="transaction-detail__wrapper">
                <div className="transaction-detail__title">{intl.get('label.TRANSACTION_ID_LABEL')}</div>
                <div className="transaction-detail__id">{transaction.transactionId}</div>
            </div>
            <div className="transaction-detail__wrapper">
                <div className="transaction-detail__title">{intl.get('text.DESCRIPTION_TEXT')}</div>
                <div className="transaction-detail__description">
                    <span className="transaction-detail__biller">{currentBiller?.productDisplayName}</span>
                    <span className="transaction-detail__account">{formatAccountNumber(transaction?.accountNumber) ?? ''}</span>
                    <span className="transaction-detail__time">{intl.get('text.ON_TEXT') + ' ' + getFormattedTransactionTime(transaction.transactionDateTime)}</span>
                </div>
            </div>
            <div className="transaction-detail__wrapper">
                <div className="transaction-detail__title">{intl.get('label.MERCHANT_WALLET_LABEL')}</div>
                <div className="transaction-detail__wallet-wrapper">
                    <div className="transaction-detail__wallet-icon">
                        <Wallet3SVG />
                    </div>
                    <div className="transaction-detail__wallet-paid-balance">
                        <div className="transaction-detail__wallet-paid">
                            <span className="transaction-detail__wallet-minus"></span>
                            <span className="transaction-detail__wallet-amount">{convertTransaction.amount}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="transaction-detail__wrapper">
                <div className="transaction-detail__title">{intl.get('text.FROM_TEXT')}</div>
                <div className="transaction-detail__from">{currentUser?.fullName}</div>
            </div>
            <div className="transaction-detail__wrapper">
                <div className="transaction-detail__title">{intl.get('label.TOTAL_AMOUNT_LABEL')}</div>
                <div className="transaction-detail__amount">{convertTransaction.amount}</div>
            </div>
            <div className="transaction-detail__share" onClick={handleShareDetail}>
                <div className="transaction-detail__share-icon">
                    <ShareSVG />
                </div>
                <div className="transaction-detail__share-text">{intl.get('text.SHARE_TEXT')}</div>
            </div>
        </Drawer>
    );
};

export default TransactionDetail;
