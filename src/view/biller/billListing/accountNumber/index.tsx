import React, { useEffect, useMemo, useState } from 'react';
import { Form } from 'antd';
import { useSelector } from 'react-redux';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import './index.scss';
import intl from 'react-intl-universal';

import { PhoneSVG, CloseSVG } from '../../../../allSvg';
import { eraseCookie, getCookie } from '../../../../utils/storage';
import { RootState, useAppDispatch } from '../../../../redux';
import { postAccountNumber } from '../../../../redux/bill/thunk';
import { IBiller } from '../../../../api/biller/interface';

import ButtonSubmition from '../../../../components/ButtonSubmition';
import FloatInput from '../../../../components/FloatInput';
import Breadcrumb from '../../../../components/Breadcrumb';
import BoxThumbnail from '../../../../components/BoxThumbnail';
import { useCancelToken } from '../../../../customHooks';

const AccountNumber: React.FC = () => {
    const billData = useSelector((state: RootState) => state.bill);
    const authData = useSelector((state: RootState) => state.auth.currentUser);
    let navigate = useNavigate();

    const { billerId } = useParams();
    const dispatch = useAppDispatch();

    const [invalidInputs, setInvalidInputs] = useState<any>({});
    const [checkedForm, setCheckedForm] = useState(false);

    const [form] = Form.useForm();

    const currentBiller = useOutletContext<IBiller>();

    const { newCancelToken } = useCancelToken();

    const handleSubmit = (data: any) => {
        if (authData && currentBiller) {
            handleInvalidInput('accountNumber', false);
            dispatch(
                postAccountNumber({
                    accountNumber: data?.accountNumber,
                    msisdn: authData.msisdn,
                    walletAccountId: authData?.walletAccountId,
                    merchantSettlementId: authData?.merchantSettlementId,
                    productId: currentBiller.productId,
                    categoryId: currentBiller.categoryId,
                    providerId: currentBiller.providerId,
                    cancelToken: newCancelToken(),
                }),
            )
                .then((res) => {
                    res.payload ? navigate(`/sebiller/infoandamount/${billerId}`) : handleInvalidInput('accountNumber', true);
                })
                .catch(() => {
                    handleInvalidInput('accountNumber', true);
                });
        }
    };

    const handleFailedSubmit = (data: any) => {
        console.log(data);
    };

    useEffect(() => {
        form.setFieldsValue({
            accountNumber: getCookie('accountNumber') ?? '',
        });
    }, [getCookie('accountNumber')]);

    // Unmouting: remove accountNumber cache
    useEffect(() => {
        // check disabled button to avoid blink btn color
        setCheckedForm(true);

        return () => {
            getCookie('accountNumber') && eraseCookie('accountNumber');
        };
    }, []);

    const handleInvalidInput = (key: string, value: boolean) => {
        setInvalidInputs((preState: { [x: string]: boolean }) => {
            preState[key] = value;
            return { ...preState };
        });
    };

    const renderErrorMessage = (check: boolean) => {
        return check && <span className="ant-form-item-explain">{intl.get('notification.ENTER_INCORRECT_ACCOUNT_NUMBER')}</span>;
    };

    // render Form input
    const renderAccountNumberInput = useMemo(() => {
        const keyName = 'accountNumber';
        return (
            <div className={`biller-phone-form__content ${invalidInputs.accountNumber ? 'error' : ''}`} key={keyName}>
                <Form.Item className="biller-form__input" name={keyName} rules={[{ required: true, message: '' }]}>
                    <FloatInput
                        prefix={
                            <div className="input-prefix">
                                <PhoneSVG className="input-prefix__icon" />
                                <span className="input-prefix__label">{intl.get('label.ACCOUNT_NUMBER_LABEL')}</span>
                            </div>
                        }
                        type="text"
                        bordered={false}
                        autoComplete="off"
                        onChange={(e) => {
                            String(e.currentTarget.value).length === 0 && handleInvalidInput(keyName, false);
                        }}
                        allowClear={{ clearIcon: <CloseSVG /> }}
                    />
                </Form.Item>
                {renderErrorMessage(invalidInputs.accountNumber)}
            </div>
        );
    }, [invalidInputs.accountNumber]);

    const renderFormInput = (productCode?: string) => {
        // eslint-disable-next-line no-undef
        let html: JSX.Element[] = [];

        switch (productCode) {
            default:
                html.push(renderAccountNumberInput);
                break;
        }

        return html;
    };

    return (
        <div className="page-bg-light">
            <Breadcrumb />
            <div className="biller-phone-form biller-form container">
                <BoxThumbnail src={currentBiller?.providerLogoUrl} />
                {currentBiller?.productDisplayName && <h3 className="biller-phone-form__title">{currentBiller?.productDisplayName}</h3>}
                <Form form={form} name="phoneCheck" onFinish={handleSubmit} onFinishFailed={handleFailedSubmit}>
                    {renderFormInput()}
                    <Form.Item className="biller-form__submit" shouldUpdate>
                        {({ getFieldsValue }) => {
                            const fieldsForm = getFieldsValue();
                            const keys = Object.keys(getFieldsValue());
                            const keysHasData = keys.filter((item) => !!fieldsForm[item]);
                            const isDisabled = !checkedForm || keysHasData.length !== Object.entries(fieldsForm).length || billData.isHandling;

                            return (
                                <ButtonSubmition loadingAnimation={billData.isHandling} isDisabled={isDisabled}>
                                    {intl.get('button.NEXT_BUTTON')}
                                </ButtonSubmition>
                            );
                        }}
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default AccountNumber;
