import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { IBiller } from '../../api/biller/interface';
import { ITransactionType } from '../../api/transaction';
import { RootState } from '../../redux';
import { convertCurrency, convertSenToRM, getFormattedTransactionTime } from '../../utils/common';
import TransactionDetail from '../TransactionDetail';
import './index.scss';

interface TransactionCardProps {
    transaction: ITransactionType;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction }) => {
    const [isShowDetail, setIsShowDetail] = useState<boolean>(false);
    const { billerData } = useSelector((state: RootState) => state.biller);

    const onClose = () => {
        setIsShowDetail(false);
    };

    const currentBiller = useMemo(() => {
        return billerData.find((item) => item.productDisplayName.trim() === transaction.merchantName.trim()) as IBiller;
    }, [billerData, transaction]);

    return (
        <>
            <TransactionDetail onClose={onClose} visible={isShowDetail} transaction={transaction} currentBiller={currentBiller} />
            <article
                className="transaction-card"
                onClick={() => {
                    setIsShowDetail(true);
                }}
            >
                <div className="transaction-card__wrapper">
                    <div className="transaction-card__img">
                        <img src={currentBiller?.providerLogoUrl} />
                    </div>
                    <div className="transaction-card__content">
                        <div className="transaction-card__content--left">
                            <h4 className="transaction-card__name">{transaction.merchantName}</h4>
                            <span className="transaction-card__time">{getFormattedTransactionTime(transaction.transactionDateTime)}</span>
                        </div>
                        <div className="transaction-card__amount">{`-${convertCurrency(convertSenToRM(transaction.amount))}`}</div>
                    </div>
                </div>
            </article>
        </>
    );
};

export default TransactionCard;
