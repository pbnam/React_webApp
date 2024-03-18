import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import intl from 'react-intl-universal';

import './index.scss';
import { Form, Drawer } from 'antd';

import { OutletSVG, ChevronSVG, MessageSVG, CalendarSVG, CheckmarkSVG, StopSVG, PhoneSVG } from '../../../../allSvg';

import Breadcrumb from '../../../../components/Breadcrumb';
import ButtonSubmition from '../../../../components/ButtonSubmition';
import WheelPicker, { IWheelOptionType } from '../../../../components/WheelPicker';
import OutletSection from '../../../../components/OutletSection';
import FloatInput from '../../../../components/FloatInput';

import { BACK_TO_FAV, monthDayData, weeklyDayData } from '../../../../constants';
import { createBill, editOutletAndTimeBill } from '../../../../redux/bill/thunk';
import { RouteConfig } from '../../../../router';
import { IBiller } from '../../../../api/biller/interface';
import { formatAccountNumber } from '../../../../utils/common';
import { IBillOutlet } from '../../../../api/interface';
import { IBillRes } from '../../../../api/bill/interface';
import { IPayloadCreateBill } from '../../../../redux/bill/billThunk';
import { RootState, useAppDispatch } from '../../../../redux';
import { IDataToUpdateBillOutlet } from '../../../../api/bill/outlet';
import { IDataUpdateReminder } from '../../../../api/bill/reminder';
import BoxMessage from '../../../../components/BoxMessage';
import BoxThumbnail from '../../../../components/BoxThumbnail';
import { useCancelToken } from '../../../../customHooks';

const SaveBiller = () => {
    const billData = useSelector((state: RootState) => state.bill);
    const { currentUser } = useSelector((state: RootState) => state.auth);

    const currentScrollTimeIndex = useRef<number>(0);
    const currentScrollSectionTimeIndex = useRef<number>(1);

    const [selectedSearchValue, setSelectedSearchValue] = useState<string | null>(null);

    const currentBiller = useOutletContext<IBiller>();

    const outletData = useSelector((state: RootState) => state.auth.currentUser?.stores);

    const outletOnlyNameData = outletData ? outletData.map((item) => item.name) : [];

    const mockReminderSection = useMemo(
        () => [
            {
                id: 0,
                name: 'Weekly',
                values: weeklyDayData.map((item) => {
                    return intl.get(`text.${item.toUpperCase()}_TEXT`);
                }),
            },
            {
                id: 1,
                name: 'Monthly',
                values: monthDayData,
            },
        ],
        [],
    );

    // edit bill
    let location = useLocation();
    const dataEditBill = useMemo(() => {
        return (location.state as IBillRes) ?? ({} as IBillRes);
    }, [location.state]);

    const validateEditBillData = useMemo(() => {
        return dataEditBill && Object.keys(dataEditBill).length !== 0;
    }, [dataEditBill]);

    const [wheelOption, setWheelOption] = useState<IWheelOptionType>({
        pickerOpen: false,
        data: [
            {
                id: 1,
                name: 'Outlets',
                values: ['Others', ...outletOnlyNameData],
            },
        ],
        defaultSelection: 0,
        defaultItemIndex: 0,
        selection: 'Others',
    });

    const [wheelTimeOption, setWheelTimeOption] = useState<IWheelOptionType>({
        pickerOpen: false,
        data: [
            {
                id: 1,
                name: intl.get('text.WEEKLY_TEXT'),
                values: weeklyDayData.map((item) => {
                    return intl.get(`text.${item.toUpperCase()}_TEXT`);
                }),
            },
            {
                id: 2,
                name: intl.get('text.MONTHLY_TEXT'),
                values: monthDayData,
            },
        ],
        defaultSelection: 1,
        defaultItemIndex: 24,
        selection: '25',
    });

    const [form] = Form.useForm();
    const [visibleOutletDrawer, setVisibleOutletDrawer] = useState(false);
    const [visibleTimeDrawer, setVisibleTimeDrawer] = useState(false);

    const [openBoxMessage, setOpenBoxMessage] = useState(true);
    const [checkingSubmit, setCheckingSubmit] = useState<boolean>(false);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const timeOutMessage = useRef<any | null>(null);

    const { newCancelToken } = useCancelToken();

    const getOutletAvailableData = (searchTerm: string) => {
        return outletData?.find((item) => item.name === searchTerm) ?? ({} as IBillOutlet);
    };

    const handleSubmit = async (formData: any) => {
        let convertReminderData = convertFromWheelPickerToBe(wheelTimeOption.defaultItemIndex, wheelTimeOption.defaultSelection);

        let reminderData = await Promise.resolve({
            dayOfMonth: wheelTimeOption.defaultSelection === 1 ? convertReminderData.index : dataEditBill.reminder?.dayOfMonth ?? 25,
            dayOfWeek: wheelTimeOption.defaultSelection === 0 ? convertReminderData.index : dataEditBill.reminder?.dayOfWeek ?? 6,
            period: mockReminderSection.find((item) => item.id === wheelTimeOption.defaultSelection)?.name.toUpperCase(),
        });

        let availableOutlet = getOutletAvailableData(formData.outletName);

        let updateOutletData = {
            name: formData.outletName !== 'Others' ? formData.outletName : formData.otherName,
            outletId: availableOutlet?.outletId ?? null,
            type: availableOutlet?.outletId ? 'AVAILABLE' : 'OTHER',
        };

        if (validateEditBillData) {
            dispatch(
                editOutletAndTimeBill({
                    billId: dataEditBill.id,
                    outlet: updateOutletData as IDataToUpdateBillOutlet,
                    outletId: dataEditBill.outlet.id,
                    reminder: reminderData as IDataUpdateReminder,
                    reminderId: dataEditBill.reminder.id,
                    cancelToken: newCancelToken(),
                }),
            );
        } else {
            dispatch(
                createBill({
                    outlet: updateOutletData,
                    reminder: reminderData,
                    merchantSettlementId: currentUser?.merchantSettlementId,
                    accountNumber: billData?.temporaryTransactionData?.defaultBillData?.accountNumber,
                    categoryId: currentBiller?.categoryId,
                    productId: currentBiller?.productId,
                    providerId: currentBiller?.providerId,
                    walletAccountId: currentUser?.walletAccountId,
                    cancelToken: newCancelToken(),
                } as IPayloadCreateBill),
            );
        }
        setCheckingSubmit(true);
    };

    const onSubmitFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    const onOutletDrawerToogle = useCallback(() => {
        setVisibleOutletDrawer(!visibleOutletDrawer);
    }, [visibleOutletDrawer]);

    const onCheckmarkOutlet = useCallback(
        (data: Partial<IWheelOptionType>) => {
            onOutletDrawerToogle();
            setWheelOption((prevState: any) => ({
                ...prevState,
                ...data,
            }));
            setSelectedSearchValue(null);
        },
        [onOutletDrawerToogle, wheelOption],
    );

    const onTimeDrawerToogle = () => {
        setVisibleTimeDrawer(!visibleTimeDrawer);
    };

    const onCheckmarkTime = () => {
        onTimeDrawerToogle();
        setWheelTimeOption((prevState: any) => ({
            ...prevState,
            defaultSelection: currentScrollSectionTimeIndex.current,
            defaultItemIndex: currentScrollTimeIndex.current,
            selection: wheelTimeOption.data[currentScrollSectionTimeIndex.current].values[currentScrollTimeIndex.current],
        }));
    };

    const reminderValue = useMemo(() => {
        let preValue = '';
        if (wheelTimeOption.defaultSelection === 1) {
            switch (wheelTimeOption.selection) {
                case '1':
                    preValue = 'st';
                    break;

                case '2':
                    preValue = 'nd';
                    break;

                case '3':
                    preValue = 'rd';
                    break;

                default:
                    preValue = 'th';
                    break;
            }
        }
        return wheelTimeOption.data[wheelTimeOption.defaultSelection].name + ', ' + wheelTimeOption.selection + preValue;
    }, [currentScrollSectionTimeIndex, wheelTimeOption]);

    const otherProps = useMemo(() => {
        return wheelOption.defaultItemIndex !== 0 || selectedSearchValue
            ? {
                  suffix: (
                      <span className="box-icon">
                          <StopSVG className="icon-stop" />
                      </span>
                  ),
                  disabled: true,
                  placeholder: intl.get('label.ORTHERS_LABEL'),
                  prefix: (
                      <div className="input-prefix">
                          <MessageSVG className="input-prefix__icon" />
                      </div>
                  ),
              }
            : {
                  showCount: true,
                  prefix: (
                      <div className="input-prefix">
                          <MessageSVG className="input-prefix__icon" />
                          <span className="input-prefix__label">{intl.get('label.ORTHERS_LABEL')}</span>
                      </div>
                  ),
              };
    }, [wheelOption.defaultItemIndex, selectedSearchValue]);

    const handleSearchOutlet = useCallback((value: string) => {
        setSelectedSearchValue(value);
        setVisibleOutletDrawer(false);
    }, []);

    const handleBackScreen = () => {
        validateEditBillData ? navigate(`${RouteConfig.dashboard}`, { state: BACK_TO_FAV }) : navigate(-1);
    };

    const convertFromWheelPickerToBe = (index: number, section: number) => {
        if (section === 0) {
            index = index === 6 ? 0 : index + 1;
        } else {
            index++;
        }

        return {
            index,
            section,
        };
    };

    const convertFromBeToWheelPicker = (index: number, section: number) => {
        if (section === 0) {
            index = index === 0 ? 6 : index - 1;
        } else {
            index--;
        }

        return {
            index,
            section,
        };
    };

    // default for outlet EditBill
    useEffect(() => {
        if (validateEditBillData && dataEditBill?.outlet?.name) {
            setWheelOption((preState) => {
                return {
                    ...preState,
                    defaultItemIndex: outletOnlyNameData.findIndex((item) => item === dataEditBill?.outlet?.name) + 1,
                    selection: dataEditBill.outlet.type === 'AVAILABLE' ? dataEditBill.outlet.name : 'Others',
                };
            });
        }
    }, [validateEditBillData, dataEditBill]);

    // default for outlet EditBill
    useEffect(() => {
        if (validateEditBillData) {
            let selectionUpdate = mockReminderSection.find((item) => item.name.toUpperCase() === dataEditBill.reminder.period.toUpperCase());
            let indexValue = selectionUpdate?.name.toUpperCase() === 'WEEKLY' ? dataEditBill.reminder.dayOfWeek : dataEditBill.reminder.dayOfMonth;
            let defaultSelectionUpdate = mockReminderSection.findIndex((item) => item.name.toUpperCase() === dataEditBill.reminder.period.toUpperCase());
            let dataAfterConvert = convertFromBeToWheelPicker(indexValue, defaultSelectionUpdate);

            setWheelTimeOption((preState: any) => {
                return {
                    ...preState,
                    defaultSelection: defaultSelectionUpdate,
                    defaultItemIndex: dataAfterConvert.index,
                    selection: selectionUpdate?.values[dataAfterConvert.index],
                };
            });
        }
    }, [dataEditBill, validateEditBillData]);

    useEffect(() => {
        !!selectedSearchValue &&
            setWheelOption((prevState: any) => ({
                ...prevState,
                selection: selectedSearchValue,
            }));
    }, [selectedSearchValue]);

    useEffect(() => {
        billData.messageData.isOpenMessage && ['create', 'edit'].includes(billData.messageData.method as string) && navigate('/dashboard', { replace: true });
    }, [billData.messageData]);

    useEffect(() => {
        let otherNameData = '';
        if (!selectedSearchValue && wheelOption.defaultItemIndex === 0) {
            otherNameData = validateEditBillData && dataEditBill.outlet.type === 'OTHER' ? dataEditBill.outlet.name : '';
        }

        form.setFieldsValue({
            reminderTime: reminderValue,
            accountNumber: formatAccountNumber(dataEditBill.accountNumber) ?? '',
            outletName: wheelOption.selection ?? 'Others',
            otherName: otherNameData,
        });
    }, [form, wheelOption.selection, wheelOption.defaultItemIndex, selectedSearchValue, validateEditBillData, reminderValue]);

    // fix bg color for input when keyboard push up
    useEffect(() => {
        document.body.style.backgroundColor = '#ffffff';

        return () => {
            document.body.style.backgroundColor = '';
        };
    }, []);

    // auto close message box after 10s
    useEffect(() => {
        if (openBoxMessage && !validateEditBillData) {
            timeOutMessage.current = window.setTimeout(() => {
                setOpenBoxMessage(false);
            }, 1000 * 10);
        }
    }, [openBoxMessage, validateEditBillData]);

    // clearTimeout when box message closed
    useEffect(() => {
        !openBoxMessage && timeOutMessage.current && clearTimeout(timeOutMessage.current);
    }, [openBoxMessage, timeOutMessage.current]);

    return (
        <div className="save-bill-page page-bg-light">
            {openBoxMessage && !validateEditBillData && <BoxMessage content={intl.get('notification.SAVE_BILLER_NOTI')} onCloseBtn={() => setOpenBoxMessage(false)} />}
            <Breadcrumb onClick={handleBackScreen} />
            <div className={`biller-save-form biller-form container`}>
                <BoxThumbnail src={currentBiller?.providerLogoUrl} />
                {currentBiller.productDisplayName && <h3 className="biller-save-form__title">{currentBiller.productDisplayName}</h3>}
                <Form form={form} name="saveBillerCheck" onFinish={handleSubmit} onFinishFailed={onSubmitFailed} autoComplete="off">
                    {validateEditBillData && (
                        <Form.Item className="biller-form__input" name="accountNumber">
                            <FloatInput
                                prefix={
                                    <div className="input-prefix">
                                        <PhoneSVG className="input-prefix__icon" />
                                        <span className="input-prefix__label">{intl.get('label.ACCOUNT_NUMBER_LABEL')}</span>
                                    </div>
                                }
                                type="text"
                                bordered={false}
                                disabled
                                className="hello"
                            />
                        </Form.Item>
                    )}
                    <div onClick={onOutletDrawerToogle}>
                        <Form.Item className="biller-form__input" name="outletName" rules={[{ required: true, message: '' }]}>
                            <FloatInput
                                prefix={
                                    <div className="input-prefix">
                                        <OutletSVG className="input-prefix__icon" />
                                        <span className="input-prefix__label">{intl.get('label.SELECT_OUTLET_LABEL')}</span>
                                    </div>
                                }
                                type="text"
                                bordered={false}
                                suffix={
                                    <span className="box-icon">
                                        <ChevronSVG style={{ color: 'rgba(0,0,0,.45)' }} />
                                    </span>
                                }
                                disabled
                            />
                        </Form.Item>
                    </div>

                    <Form.Item className="biller-form__input" name="otherName">
                        <FloatInput type="text" bordered={false} maxLength={20} {...otherProps} />
                    </Form.Item>

                    <div onClick={onTimeDrawerToogle}>
                        <Form.Item className="biller-form__input" name="reminderTime" rules={[{ required: true, message: '' }]}>
                            <FloatInput
                                prefix={
                                    <div className="input-prefix">
                                        <CalendarSVG className="input-prefix__icon" />
                                        <span className="input-prefix__label">{intl.get('label.SET_REMINDER_LABEL')}</span>
                                    </div>
                                }
                                type="text"
                                bordered={false}
                                suffix={
                                    <span className="box-icon">
                                        <ChevronSVG style={{ color: 'rgba(0,0,0,.45)' }} />
                                    </span>
                                }
                                disabled
                            />
                        </Form.Item>
                    </div>

                    <Form.Item className="biller-form__submit" shouldUpdate>
                        {({ getFieldValue }) => {
                            const checkOutletValue = getFieldValue('outletName') !== 'Others' ? !getFieldValue('outletName') : !getFieldValue('otherName');

                            const isDisabled = checkOutletValue || billData.isHandling;

                            return (
                                <ButtonSubmition loadingAnimation={checkingSubmit && billData.isHandling} isDisabled={isDisabled}>
                                    {intl.get('button.SAVE_BILLER_BUTTON')}
                                </ButtonSubmition>
                            );
                        }}
                    </Form.Item>
                </Form>
            </div>

            {/* Outlet */}
            <OutletSection
                onClose={onOutletDrawerToogle}
                visibleOutletDrawer={visibleOutletDrawer}
                onHandleSelect={onCheckmarkOutlet}
                onHandleSearch={handleSearchOutlet}
                wheelOption={wheelOption}
                selectedSearchValue={selectedSearchValue}
            />

            {/* Set reminder */}
            <Drawer placement={'bottom'} closable={false} onClose={onTimeDrawerToogle} visible={visibleTimeDrawer} key={'bottom-2'} height={'60%'} className="biller-drawer">
                <div className="biller-drawer__header">
                    <div className="section-title">
                        <h3 className="section-title__name">{intl.get('label.SET_REMINDER_LABEL')}</h3>
                        <span>{intl.get('desc.SET_REMINDER_DRAWER_DESC')}</span>
                    </div>
                </div>
                {visibleTimeDrawer && (
                    <WheelPicker
                        data={wheelTimeOption.data}
                        height={60}
                        parentHeight={250}
                        fontSize={16}
                        scrollerId="scroll-time-select-subject"
                        updateSelection={(selectedIndex: any, selectedSectionIndex: any) => {
                            currentScrollTimeIndex.current = selectedIndex;
                            currentScrollSectionTimeIndex.current = selectedSectionIndex;
                        }}
                        defaultSelection={wheelTimeOption.defaultSelection}
                        defaultItemIndex={wheelTimeOption.defaultItemIndex}
                    />
                )}
                <button className="entry-button__next" onClick={onCheckmarkTime}>
                    <CheckmarkSVG />
                </button>
            </Drawer>
        </div>
    );
};

export default SaveBiller;
