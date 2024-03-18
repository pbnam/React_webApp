import React, { useMemo } from 'react';
import moment from 'moment';
import intl from 'react-intl-universal';

import TransactionCard from '../TransactionCard';
import { FilterSVG } from '../../allSvg';

import './index.scss';
import { ITransactionType } from '../../api/transaction';
import { DATE_FROM_API_FORMAT } from '../../constants';

interface TransactionByDateProps {
    transactions: ITransactionType[];
    date: string;
    isFirstGroup?: boolean;
    onClickIcon?: () => void;
}

const TransactionByDate: React.FC<TransactionByDateProps> = ({ date, transactions, isFirstGroup = false, onClickIcon }) => {
    const getFormattedTransactionTitle = (date: string): string => {
        const time = moment(new Date(date), DATE_FROM_API_FORMAT);

        const today = moment.now();
        let day = time.date().toString();

        switch (time.diff(today, 'days')) {
            case 0:
                day = intl.get('text.TODAY_TEXT');
                break;

            case -1:
                day = intl.get('text.YESTERDAY_TEXT');
                break;

            case -7:
                day = intl.get('text.LAST_7_DAYS_TEXT');
                break;

            case -30:
                day = intl.get('text.LAST_30_DAYS_TEXT');
                break;

            default:
                break;
        }

        return `${day}, ${time.format('MMM YYYY')}`;
    };

    const title = useMemo(() => getFormattedTransactionTitle(date), [date]);
    return (
        <section className="transaction-group">
            <div className="transaction-group__wrapper">
                <h4 className="transaction-group__title">{title}</h4>
                {isFirstGroup && (
                    <div className="filter-filter-icon__wrapper" onClick={onClickIcon}>
                        <FilterSVG className="filter-filter-icon" />
                    </div>
                )}
            </div>
            {transactions.map((transaction) => {
                return <TransactionCard transaction={transaction} key={transaction.id} />;
            })}
        </section>
    );
};

export default TransactionByDate;
