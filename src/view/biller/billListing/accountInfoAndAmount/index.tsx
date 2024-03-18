import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { Form, Modal } from 'antd';
import { useSelector } from 'react-redux';
import intl from 'react-intl-universal';

import { PhoneSVG, UserSVG, CalendarSVG, Wallet2SVG, CheckmarkSVG, CloseSVG } from '../../../../allSvg';
import '../accountNumber/index.scss';
import './index.scss';
import { RootState, useAppDispatch } from '../../../../redux';
import { postPaymentAmount } from '../../../../redux/bill/thunk';
import { billActions } from '../../../../redux/bill/silce';
import { IBiller } from '../../../../api/biller/interface';

import Breadcrumb from '../../../../components/Breadcrumb';
import ButtonSubmition from '../../../../components/ButtonSubmition';
import FormRender, { IItemFormProps } from '../../../../components/FormRender';
import BoxMessage from '../../../../components/BoxMessage';
import BoxThumbnail from '../../../../components/BoxThumbnail';

import { convertCurrency, formatAccountNumber, formatISODate } from '../../../../utils/common';
import { BACK_NONE_TO_FAV, BACK_TO_FAV, FORMAT_DATE, MAX_PAYMENT_AMOUNT, MIN_PAYMENT_AMOUNT, SEN_UNIT } from '../../../../constants';
import { RouteConfig } from '../../../../router';
import { setCookie } from '../../../../utils/storage';
import NumericInput from '../../../../components/NumericInput';

const AccountInfoAndAmount: React.FC = () => {
    const { temporaryBillerData, temporaryTransactionData, isHandling, temporaryData } = useSelector((state: RootState) => state.bill);

    const { billerId } = useParams();
    const [errorMessage, setErrorMessage] = useState('');
    const [form] = Form.useForm();
    const [paymentAmount, setPaymentAmount] = useState<number | string | undefined>('');

    const [visibleInforModal, setVisibleInforModal] = useState(false);

    const [snackbarMessage, setSnackbarMessage] = useState({
        visiable: false,
        content: '',
    });

    const [validateSubmit, setValidateSubmit] = useState(false);

    let navigate = useNavigate();
    const dispatch = useAppDispatch();
    let location = useLocation();
    const currentBiller = useOutletContext<IBiller>();

    const notAvailableInfoBill = useMemo(() => {
        return !temporaryTransactionData?.defaultBillData?.defaultFieldAvailable;
    }, []);

    const paymentCondition = useMemo(() => {
        return {
            minimumPayableAmount: Number(temporaryBillerData?.paymentConditions?.minimumPayableAmount || MIN_PAYMENT_AMOUNT),
            maximumPayableAmount: Number(temporaryBillerData?.paymentConditions?.maximumPayableAmount || MAX_PAYMENT_AMOUNT),
        };
    }, [temporaryBillerData?.paymentConditions]);

    const paymentMessageText = useMemo(() => {
        let minPayment = convertCurrency(Number(paymentCondition.minimumPayableAmount));
        let maxPayment = convertCurrency(Number(paymentCondition.maximumPayableAmount));

        return {
            errorMinimunAccount: `${intl.get('notification.ENTER_MINIMUM_AMOUNT')} ${minPayment}`,
            errorMaxAccount: `${maxPayment} ${intl.get('notification.MAXIMUM_PAY_AMOUNT')}.`,
            minimunAccount: `${intl.get('text.MINIMUM_AMOUNT_TEXT')}: ${minPayment}`,
        };
    }, [paymentCondition]);

    const renderFormData = useMemo((): IItemFormProps[] => {
        if (notAvailableInfoBill) return [];

        return [
            {
                type: 'text',
                name: 'accountNumber',
                options: {
                    prefix: (
                        <>
                            <div className="input-prefix">
                                <PhoneSVG className="input-prefix__icon" />
                                <span className="input-prefix__label">{intl.get('label.ACCOUNT_NUMBER_LABEL')}</span>
                            </div>
                        </>
                    ),
                    type: 'text',
                    bordered: false,
                    disabled: true,
                },
            },
            {
                type: 'text',
                name: 'accountName',
                options: {
                    prefix: (
                        <>
                            <div className="input-prefix">
                                <UserSVG className="input-prefix__icon" />
                                <span className="input-prefix__label">{intl.get('label.ACCOUNT_NAME_LABEL')}</span>
                            </div>
                        </>
                    ),
                    type: 'text',
                    bordered: false,
                    disabled: true,
                },
            },
            {
                type: 'text',
                name: 'totalPayableAmount',
                options: {
                    prefix: (
                        <>
                            <div className="input-prefix">
                                <PhoneSVG className="input-prefix__icon" />
                                <span className="input-prefix__label">{intl.get('label.PAYABLE_LABEL')}</span>
                            </div>
                        </>
                    ),
                    type: 'text',
                    bordered: false,
                    disabled: true,
                },
                addClass: 'biller-form__input--currency',
            },
            {
                type: 'text',
                name: 'dueDate',
                options: {
                    prefix: (
                        <>
                            <div className="input-prefix">
                                <CalendarSVG className="input-prefix__icon" />
                                <span className="input-prefix__label">{intl.get('label.DUE_DATE_LABEL')}</span>
                            </div>
                        </>
                    ),
                    type: 'text',
                    bordered: false,
                    disabled: true,
                },
            },
        ];
    }, [notAvailableInfoBill]);

    const errorMessageHtml = useMemo(() => {
        return <span className="payment-amount__notice">{notAvailableInfoBill || !errorMessage ? paymentMessageText.minimunAccount : errorMessage}</span>;
    }, [errorMessage, paymentMessageText.minimunAccount, notAvailableInfoBill]);

    const handleSubmit = () => {
        if (!validateSubmit) return;
        dispatch(postPaymentAmount(Math.round((paymentAmount as number) * SEN_UNIT))).then(() => {
            navigate(`/sebiller/confirm/${billerId}`, { state: location.state });
        });
    };

    const handleCloseBoxMessage = () => {
        setSnackbarMessage({
            visiable: false,
            content: '',
        });
    };

    const handleBackScreen = () => {
        let data = location.state as {
            name: string;
            isBackToFav: boolean;
        };

        if (data && data.name === 'isPayNow') {
            navigate(`${RouteConfig.dashboard}`, { state: data.isBackToFav ? BACK_TO_FAV : BACK_NONE_TO_FAV });
        } else {
            navigate(-1);
            setCookie({
                name: 'accountNumber',
                value: temporaryTransactionData?.defaultBillData?.accountNumber,
                days: 1,
            });
        }
    };

    const propsNumberFormat = useMemo(() => {
        return {
            disabled: Number(temporaryTransactionData?.defaultBillData?.payAmount) === 0 ? true : false,
        };
    }, [temporaryTransactionData?.defaultBillData?.payAmount]);

    const handleSetDefaultPayAmount = () => {
        try {
            let payAmount = undefined;
            //
            if (
                temporaryBillerData?.paymentConditions?.maximumPayableAmount &&
                Number(temporaryBillerData?.paymentConditions?.maximumPayableAmount) < temporaryTransactionData?.defaultBillData?.payAmount &&
                !notAvailableInfoBill
            ) {
                payAmount = Number(temporaryBillerData?.paymentConditions?.maximumPayableAmount);
            } else if (temporaryTransactionData?.defaultBillData?.dueDate && temporaryTransactionData?.defaultBillData?.payAmount) {
                payAmount = Number(temporaryTransactionData?.defaultBillData?.payAmount);
            }
            form.setFieldsValue({ paymentAmount: payAmount || '' });

            payAmount
                ? setPaymentAmount(payAmount)
                : setSnackbarMessage({
                      visiable: true,
                      content: intl.get('notification.PAID_BILL'),
                  });
        } catch (error) {
            console.log('default payAmount', error);
        }
    };

    // check default payment amount
    useEffect(() => {
        !notAvailableInfoBill && handleSetDefaultPayAmount();
    }, [notAvailableInfoBill]);

    // fix bg color for input when keyboard push up
    useEffect(() => {
        document.body.style.backgroundColor = '#ffffff';

        return () => {
            document.body.style.backgroundColor = '';
        };
    }, []);

    // reset pin code
    useEffect(() => {
        if (temporaryData.pinCodeCheck === false) {
            dispatch(billActions.resetPincode());
        }
    }, [temporaryData.pinCodeCheck]);

    // set default field
    useEffect(() => {
        if (!notAvailableInfoBill) {
            let { accountNumber, accountName, outstandingAmount, dueDate } = temporaryTransactionData.defaultBillData;

            form.setFieldsValue({
                accountNumber: formatAccountNumber(accountNumber) ?? '',
                accountName: accountName ?? '',
                totalPayableAmount: outstandingAmount ?? '',
                dueDate: dueDate !== 'N/A' ? formatISODate(dueDate, FORMAT_DATE) : 'N/A',
            });
        }
    }, [temporaryTransactionData?.defaultBillData, notAvailableInfoBill]);

    // verify paymentAmount
    useEffect(() => {
        if (!paymentAmount) {
            setErrorMessage(paymentMessageText.errorMinimunAccount);
            setValidateSubmit(false);
        } else {
            if (paymentAmount < Number(paymentCondition?.minimumPayableAmount)) {
                if (!notAvailableInfoBill) {
                    setErrorMessage(paymentMessageText.errorMinimunAccount);
                }
                setValidateSubmit(false);
            } else if (paymentAmount > Number(paymentCondition?.maximumPayableAmount)) {
                setSnackbarMessage({
                    visiable: true,
                    content: paymentMessageText.errorMaxAccount,
                });
                setValidateSubmit(false);
            } else {
                setErrorMessage('');
                handleCloseBoxMessage();
                setValidateSubmit(true);
            }
        }
    }, [paymentAmount, paymentCondition, paymentMessageText]);

    const handleAllowClear = () => {
        setPaymentAmount(0);
        let el = document.getElementById('bill-payment-amount-input');
        el?.focus();
        resetPaymentAmount();
    };

    const resetPaymentAmount = () => {
        form.setFieldsValue({ paymentAmount: 0 });
    };

    return (
        <div className="page-bg-light">
            {snackbarMessage.visiable && <BoxMessage status="warning" onCloseBtn={handleCloseBoxMessage} content={snackbarMessage.content} />}
            <Breadcrumb onClick={handleBackScreen} />
            <div className={`biller-phone-form biller-accountInfo-form biller-form container`}>
                <BoxThumbnail src={currentBiller?.providerLogoUrl} />
                {currentBiller.productDisplayName && <h3 className="biller-phone-form__title">{currentBiller.productDisplayName}</h3>}
                <Form form={form} name="phoneCheck" onFinish={handleSubmit} initialValues={{ paymentAmount: paymentAmount || '' }}>
                    <FormRender formData={renderFormData} />
                    <div className={`biller-form__input biller-form__input--payment-item ${errorMessage && 'biller-form__input--error'}`}>
                        <Form.Item name="paymentAmount">
                            <NumericInput
                                id="bill-payment-amount-input"
                                onChange={(e) => setPaymentAmount(e as number)}
                                prefix={
                                    <div className="input-prefix">
                                        <Wallet2SVG className="input-prefix__icon" />
                                        <span className="input-prefix__label">{intl.get('label.PAYMENT_AMOUNT_LABEL')}</span>
                                        <span className="input-prefix__currency">RM</span>
                                    </div>
                                }
                                onFocus={() => !paymentAmount && resetPaymentAmount()}
                                {...propsNumberFormat}
                            />
                        </Form.Item>
                        {typeof paymentAmount === 'number' && paymentAmount > 0 && (
                            <div className="payment-amount__clear" onClick={handleAllowClear}>
                                <CloseSVG />
                            </div>
                        )}
                        {errorMessageHtml}
                    </div>

                    {notAvailableInfoBill && (
                        <div className="biller-form__information">
                            {intl.get('desc.BILL_INFO_DESC') + '.' + ' '}
                            <span className="btn-modal" onClick={() => setVisibleInforModal(true)}>
                                {intl.get('text.BILL_INFO_TEXT')}
                            </span>
                        </div>
                    )}

                    <Form.Item className="biller-form__submit" shouldUpdate>
                        <ButtonSubmition loadingAnimation={isHandling} isDisabled={!validateSubmit || isHandling}>
                            {intl.get('button.NEXT_BUTTON')}
                        </ButtonSubmition>
                    </Form.Item>
                </Form>
            </div>

            {notAvailableInfoBill && (
                <Modal
                    visible={visibleInforModal}
                    title={null}
                    closable={false}
                    footer={null}
                    maskClosable={false}
                    bodyStyle={{ height: '100%' }}
                    className="confirm-popup-bpt"
                    wrapClassName="confirm-popup-bpt-wrapper confirm-popup-bpt-wrapper--fullheight"
                >
                    <div className="modal-confirm">
                        <span className="modal-confirm__subtitle">{intl.get('text.BILL_INFO_TEXT')}</span>
                        <h2 className="modal-confirm__title">{intl.get('title.BILL_INFO_DRAWER_TITLE')}</h2>
                        <div className="modal-confirm__desc">
                            <p>{intl.get('desc.BILL_INFO_DRAWER_DESC')}</p>
                            <p>{intl.get('desc.BILL_INFO_DRAWER_EXTRA_DESC')} </p>
                            <ul>
                                <li>{intl.get('desc.BILL_INFO_DRAWER_BOTTOM_EXTRA_DESC')}:</li>
                                <li>- Utilities</li>
                                <li>- Syabas - Selangor</li>
                                <li>- Indah Water Konsortium</li>
                                <li>- Pengurusan Air Pahan Berhad</li>
                                <li>- Syariak Air Perlis</li>
                                <li>- Sarawak Energy</li>
                                <li>- Tenaga Nasional Berhad</li>
                            </ul>
                            <p>{intl.get('text.MORE_LATER_TEXT')}</p>
                        </div>
                        <div className="modal-confirm__control">
                            <div className="confirm-btn confirm-btn--primary" onClick={() => setVisibleInforModal(false)}>
                                <CheckmarkSVG />
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AccountInfoAndAmount;
