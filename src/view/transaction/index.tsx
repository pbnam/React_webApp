import React, { useEffect, useMemo, useState } from 'react';
import intl from 'react-intl-universal';

import { useSelector } from 'react-redux';
import moment from 'moment';
import './index.scss';

import Breadcrumb from '../../components/Breadcrumb';
import PublicLayout from '../../layout/PublicLayout';
import TransactionByDate from '../../components/TransactionByDate';
import TransactionFilterByDate from '../../components/TransactionFilterByDate';

import { RootState, useAppDispatch } from '../../redux';

import { NoSearchDataImg, NoDataImg } from '../../constants/ImgAsset';
import { CalendarSVG } from '../../allSvg';

import { RadioChangeEvent } from 'antd/lib/radio/interface';
import { useContextStore } from '../../App';
import { CHANNEL_CLEVER_TAP, DATE_FROM_API_FORMAT } from '../../constants';

import TransactionFilterByType from '../../components/TransactionFilterByType';
import { getTransactionsApi, IDataToGetTransactions, ITransactionType } from '../../api/transaction';
import { getTransaction, handleConvertTransactionDataApi } from '../../redux/transaction/thunk';
import Splash from '../../components/Splash';

interface TransactionByDay {
    date: string;
    transactions: ITransactionType[];
}

export interface DateRange {
    startDate: moment.Moment | null;
    endDate: moment.Moment | null;
}

interface FilterState extends DateRange {
    type: string;
}

export interface QuickFilter {
    text: string;
    isActive: boolean;
    daysBeforeToday: number;
}

const Transaction = () => {
    const { transactionStore, needUpdate } = useSelector((state: RootState) => state.transaction);
    const [transactionData, setTransactionData] = useState(transactionStore);

    const { platformAccess, currentUser } = useSelector((state: RootState) => state.auth);

    const [isShowFilterByDate, setIsShowFilterByDate] = useState<boolean>(false);
    const [isShowFilterByType, setIsShowFilterByType] = useState<boolean>(false);

    const [quickFilter, setQuickFilter] = useState<QuickFilter[]>([
        { text: intl.get('text.YESTERDAY_TEXT'), isActive: false, daysBeforeToday: 1 },
        { text: intl.get('text.LAST_7_DAYS_TEXT'), isActive: false, daysBeforeToday: 7 },
        { text: intl.get('text.LAST_30_DAYS_TEXT'), isActive: false, daysBeforeToday: 30 },
    ]);
    const [selectedQuickFilterIndex, setSelectedQuickFilterIndex] = useState<number | undefined>();

    const [isEnableReset, setIsEnableReset] = useState<boolean>(false);
    const [isEnableConfirm, setIsEnableConfirm] = useState<boolean>(true);

    const [selectedDatePicker, setSelectedDatePicker] = useState<DateRange>({
        startDate: null,
        endDate: null,
    });

    // State to recover last state when close filter dialog but have not clicked confirm yet
    const [prevSelectedDatePicker, setPrevSelectedDatePicker] = useState<DateRange>({
        startDate: null,
        endDate: null,
    });

    const [selectedType, setSelectedType] = useState('All');
    const [filter, setFilter] = useState<FilterState>({
        startDate: null,
        endDate: null,
        type: 'All',
    });
    const [loading, setLoading] = useState<boolean>(needUpdate);

    const dispatch = useAppDispatch();

    const { handlePushEventCleverTap } = useContextStore();

    const isApp = platformAccess?.type === 'App';

    const handleGetDataFilter = (params: IDataToGetTransactions) => {
        try {
            setLoading(true);
            getTransactionsApi(params)
                .then((res) => {
                    let updateData: ITransactionType[] = handleConvertTransactionDataApi(res);
                    setTransactionData(updateData);
                })
                .catch(() => setTransactionData([]))
                .finally(() => {
                    setLoading(false);
                });
        } catch (error) {
            setTransactionData([]);
            setLoading(false);
        }
    };

    const groupTransactionByDay = (transactions: ITransactionType[]): TransactionByDay[] => {
        const groupData = transactions.reduce((groups: { [key: string]: ITransactionType[] }, transaction) => {
            const date = moment(transaction.transactionDateTime, DATE_FROM_API_FORMAT).format('YYYY-MM-DD');
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(transaction);
            return groups;
        }, {});

        return Object.keys(groupData).map((date) => ({
            date,
            transactions: groupData[date],
        }));
    };

    const sortTransactionByTime = (transactions: ITransactionType[]): ITransactionType[] => {
        if (!transactions) return [];
        return [...transactions].sort((firstTrans, secondTrans): number => {
            const timeOfFirstTrans = moment(firstTrans.transactionDateTime, DATE_FROM_API_FORMAT);
            const timeOfSecondTrans = moment(secondTrans.transactionDateTime, DATE_FROM_API_FORMAT);
            if (timeOfFirstTrans < timeOfSecondTrans) return 1;
            else if (timeOfFirstTrans > timeOfSecondTrans) return -1;
            else return 0;
        });
    };

    const groupTransaction = useMemo(() => {
        let sortedTransaction = sortTransactionByTime(transactionData);

        if (filter.type !== 'All') {
            sortedTransaction = sortedTransaction.filter((transaction) => transaction.categoryType === filter.type);
        }

        return groupTransactionByDay(sortedTransaction);
    }, [transactionData, filter]);

    const onClose = () => {
        setIsShowFilterByDate(false);
        setIsShowFilterByType(false);
        setSelectedType(filter.type);

        const tmp = quickFilter.map((item, i) => {
            return i === selectedQuickFilterIndex ? { ...item, isActive: true } : { ...item, isActive: false };
        });
        setQuickFilter(tmp);

        setSelectedDatePicker(prevSelectedDatePicker);

        if (selectedQuickFilterIndex !== undefined || prevSelectedDatePicker.startDate || prevSelectedDatePicker.endDate) setIsEnableReset(true);
    };

    const onResetFilter = () => {
        if (!isEnableReset) {
            return;
        }
        const tmp = quickFilter.map((item) => {
            return { ...item, isActive: false };
        });
        setQuickFilter(tmp);
        setSelectedDatePicker({ startDate: null, endDate: null });
        setIsEnableReset(false);
        setIsEnableConfirm(true);
    };

    const onConfirmFilter = () => {
        if (!isEnableConfirm) return;
        let endDate = null;
        let startDate = null;
        setSelectedQuickFilterIndex(undefined);
        setPrevSelectedDatePicker({ startDate: null, endDate: null });

        //Handle quick filter
        const dateFilter = quickFilter.find((item, i) => {
            if (item.isActive === true) {
                setSelectedQuickFilterIndex(i);
            }
            return item.isActive === true;
        });
        if (dateFilter) {
            endDate = moment().endOf('day');
            const daysBeforeToday = dateFilter.daysBeforeToday;
            // yesterday
            if (daysBeforeToday === 1) endDate.subtract(1, 'days').endOf('day');

            const tmp = moment();
            startDate = tmp.subtract(daysBeforeToday, 'days').startOf('day');

            setPrevSelectedDatePicker({ startDate: null, endDate: null });
        }

        //Handle datepicker
        if (selectedDatePicker.startDate && selectedDatePicker.endDate) {
            startDate = selectedDatePicker.startDate;
            endDate = selectedDatePicker.endDate;
            setPrevSelectedDatePicker({ startDate: selectedDatePicker.startDate, endDate: selectedDatePicker.endDate });
            setSelectedQuickFilterIndex(undefined);
        }

        setFilter({ ...filter, startDate, endDate });
        setIsShowFilterByDate(false);

        const otherProps =
            startDate && endDate
                ? {
                      startAt: moment(startDate).format(),
                      endAt: moment(endDate).format(),
                  }
                : null;

        handleGetDataFilter({
            limit: 50,
            merchantSettlementId: currentUser?.merchantSettlementId as string,
            serviceType: 'BILLER',
            ...otherProps,
        });
    };

    const onSelectQuickFilter = (index: number) => {
        const tmp = quickFilter.map((item, i) => {
            return i === index ? { ...item, isActive: true } : { ...item, isActive: false };
        });

        setQuickFilter(tmp);
        setIsEnableReset(true);
        setIsEnableConfirm(true);
        setSelectedDatePicker({ startDate: null, endDate: null });
    };

    const onSelectStartDate = (date: moment.Moment | null) => {
        setSelectedDatePicker((currentState) => {
            return { ...currentState, startDate: date ? date.startOf('day') : date };
        });

        //reset quick filter
        const tmp = quickFilter.map((item) => {
            return { ...item, isActive: false };
        });
        setQuickFilter(tmp);

        setIsEnableReset(true);

        if (selectedDatePicker.endDate) setIsEnableConfirm(true);
        else setIsEnableConfirm(false);
    };

    const onSelectEndDate = (date: moment.Moment | null) => {
        setSelectedDatePicker((currentState) => {
            return { ...currentState, endDate: date ? date.endOf('day') : date };
        });

        //reset quick filter
        const tmp = quickFilter.map((item) => {
            return { ...item, isActive: false };
        });

        setQuickFilter(tmp);

        setIsEnableReset(true);

        if (selectedDatePicker.startDate) setIsEnableConfirm(true);
        else setIsEnableConfirm(false);
    };

    const onSelectType = (e: RadioChangeEvent) => {
        if (!e.target) return;

        //handle select type on mobile
        if (isApp) {
            setFilter({ ...filter, type: e.target.value });
            setIsShowFilterByType(false);
        }
        //handle select type on web
        else {
            setSelectedType(e.target.value);
        }
    };

    const contentTransaction = useMemo(() => {
        let content = null;
        if (transactionData.length === 0) {
            content = (
                <div className="empty-transaction__container">
                    <img className="empty-transaction__img" src={NoDataImg} />
                    <h2 className="empty-transaction__header">{intl.get('title.TRANSACTION_WITHOUT_TRANSACTION_TITLE')}</h2>
                    <span className="empty-transaction__text">{intl.get('desc.TRANSACTION_WITHOUT_TRANSACTION_DESC')}</span>
                </div>
            );
        } else {
            if (groupTransaction.length === 0) {
                let quickFilterActive = quickFilter.find((item) => item.isActive === true);
                let dateActive = quickFilterActive
                    ? moment()
                          .add(Number(`-${quickFilterActive.daysBeforeToday}`), 'days')
                          .toString()
                    : moment().toString();

                content = (
                    <>
                        <div className="empty-transaction__container">
                            <img className="empty-transaction__img" src={NoSearchDataImg} />
                            <h2 className="empty-transaction__header">{intl.get('title.TRANSACTION_SEARCH_WITHOUT_TRANSACTION_TITLE')}</h2>
                            <span className="empty-transaction__text">{intl.get('desc.TRANSACTION_SEARCH_WITHOUT_TRANSACTION_DESC')}</span>
                        </div>
                        <TransactionByDate
                            date={dateActive}
                            transactions={[]}
                            key={dateActive}
                            isFirstGroup={true}
                            onClickIcon={() => {
                                setIsShowFilterByType(true);
                            }}
                        />
                    </>
                );
            } else {
                content = groupTransaction.map((group, index) => {
                    return (
                        <TransactionByDate
                            date={group.date}
                            transactions={group.transactions}
                            key={group.date}
                            isFirstGroup={index === 0}
                            onClickIcon={() => {
                                setIsShowFilterByType(true);
                            }}
                        />
                    );
                });
            }
        }
        return content;
    }, [transactionData, groupTransaction]);

    // cleverTap on pageView
    useEffect(() => {
        handlePushEventCleverTap({
            channel: platformAccess.type + '-' + CHANNEL_CLEVER_TAP,
            section: 'TransactionHistory',
        });
    }, []);

    const handleDispatchGetTransaction = (params: IDataToGetTransactions) => {
        setLoading(true);
        dispatch(getTransaction(params))
            .then((res) => {
                setTransactionData(res.payload);
            })
            .catch(() => {
                setTransactionData([]);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // load data
    useEffect(() => {
        needUpdate &&
            handleDispatchGetTransaction({
                limit: 50,
                merchantSettlementId: currentUser?.merchantSettlementId as string,
                serviceType: 'BILLER',
            });
    }, [needUpdate]);

    return (
        <>
            {loading && <Splash isOpen={loading} />}
            <PublicLayout>
                <Breadcrumb breadName={intl.get('navigation.TRANSACTION')} verticalStyle={true} />
                <div className="transaction-wrapper">{contentTransaction}</div>
                <div
                    className="filter-calendar-icon__wrapper"
                    onClick={() => {
                        setIsShowFilterByDate(true);
                    }}
                >
                    <CalendarSVG className="filter-calendar-icon" />
                </div>
                <TransactionFilterByType onClose={onClose} visible={isShowFilterByType} currentType={filter.type} onSelectType={onSelectType} />
                <TransactionFilterByDate
                    onClose={onClose}
                    visible={isShowFilterByDate}
                    onConfirmFilter={onConfirmFilter}
                    onSelectQuickFilter={onSelectQuickFilter}
                    quickFilter={quickFilter}
                    onSelectEndDate={onSelectEndDate}
                    onSelectStartDate={onSelectStartDate}
                    selectedDatePicker={selectedDatePicker}
                    enableReset={isEnableReset}
                    enableConfirm={isEnableConfirm}
                    onResetFilter={onResetFilter}
                />
            </PublicLayout>
        </>
    );
};

export default Transaction;
