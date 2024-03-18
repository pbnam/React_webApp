import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import intl from 'react-intl-universal';

import PublicLayout from '../../layout/PublicLayout';
import './index.scss';

import { Segmented } from 'antd';

import { WalletSVG, ArrowLeftSVG, PlusSVG } from '../../allSvg';
import { SuccessImg, UnsuccessImg, MoreBillerImg, AllBillPaidImg } from '../../constants/ImgAsset';
import { BACK_TO_FAV, CHANNEL_CLEVER_TAP } from '../../constants';

import { RootState, useAppDispatch } from '../../redux';
import { billActions } from '../../redux/bill/silce';

import { convertCurrency, convertSenToRM, formatISODate } from '../../utils/common';
import { stepToAddBillUrl } from '../../router';
import { useContextStore } from '../../App';
import { IBillRes } from '../../api/bill/interface';

import MyAccount from './MyAccount';
import SavedBills from './SavedBills';
import Breadcrumb from '../../components/Breadcrumb';
import CardCarousel from '../../components/CardsCarousel';
import BillButton, { sizeButton } from '../../components/Button';
import { BoxHightlightProps } from '../../components/BoxHightLight/interface';
import BoxMessage from '../../components/BoxMessage';
import BoxHightLight from '../../components/BoxHightLight';
import { postAccountNumber } from '../../redux/bill/thunk';
import ConfirmPopup from '../../components/ConfirmPopup';
import Splash from '../../components/Splash';
import { updateAccountSettings } from '../../redux/auth/thunk';
import { authActions } from '../../redux/auth/slice';
import { PIN_BLOCKED_CODE } from '../../constants/errorCode';
import BoxThumbnail from '../../components/BoxThumbnail';
import { useCancelToken } from '../../customHooks';

// eslint-disable-next-line no-unused-vars
enum DashboardTypeTab {
    // eslint-disable-next-line no-unused-vars
    Seg1 = 'Billers',
    // eslint-disable-next-line no-unused-vars
    Seg2 = 'Favourites',
}

interface IGreetingObj {
    text: string;
    src: string;
    status: 'unsuccess' | 'allpaid' | 'success';
}

const Dashboard: React.FC = () => {
    const { currentUser, platformAccess, accountSetting, pinLog } = useSelector((state: RootState) => state.auth);

    const [isAccountTab, setAccountTab] = useState<DashboardTypeTab>(DashboardTypeTab.Seg1);
    const billDataStore = useSelector((state: RootState) => state.bill);
    const [targetOption, setTargetOption] = useState<BoxHightlightProps | null>(null);

    const [isOpenTutorial, setIsOpenTutorial] = useState(false);

    const [isGoToPayNow, setIsGoToPayNow] = useState(false);

    const [billsList, setBillsList] = useState(billDataStore.storeData.data);

    const [isOpenSaveMoreBiller, setIsOpenSaveMoreBiller] = useState(false);

    const idBtn = useId();

    let location = useLocation();
    let ClvertapSection = useRef('Home');

    const { handlePushEventCleverTap, handleValidatorFeature } = useContextStore();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { newCancelToken } = useCancelToken();

    const mockSegmented = useMemo(() => {
        return [
            {
                label: intl.get('title.DASHBOARD_BILLERS_TAB'),
                value: 'Billers',
            },
            {
                label: intl.get('title.DASHBOARD_FAVOURITES_TAB'),
                value: 'Favourites',
            },
        ];
    }, []);

    function* handleWindowEventHightLight() {
        dispatch(billActions.closeBoxMessage());
        setIsOpenTutorial(true);
        document.body.classList.remove('hightlight-open');

        yield true;
        setIsOpenTutorial(false);
        setIsOpenSaveMoreBiller(!isOpenSaveMoreBiller);
        document.body.classList.remove('hightlight-open', 'disable-click-insideApp');
        dispatch(
            updateAccountSettings({
                merchantSettlementId: currentUser?.merchantSettlementId as string,
                tutorialShowed: true,
            }),
        );
    }

    const handleClickToFav = () => {
        setAccountTab(DashboardTypeTab.Seg2);
        setTimeout(() => {
            let el = document.getElementById('saved-bill-target') as HTMLElement;
            window.scrollTo({
                top: el?.offsetTop ?? 0,
                behavior: 'smooth',
            });
        }, 200);
    };

    const validateAllPaid = useMemo(() => {
        return (
            billDataStore?.asapData.length === 0 &&
            billsList?.every((item: IBillRes) => item.status === 'paid') &&
            billDataStore?.storeData?.data?.length !== 0 &&
            billDataStore?.storeData?.data?.every((item: IBillRes) => item.status === 'paid')
        );
    }, [billDataStore?.storeData?.data, billDataStore?.asapData, billsList]);

    const greetingObj = useMemo((): IGreetingObj => {
        if (billDataStore?.storeData?.data?.length === 0) {
            return {
                text: intl.get('title.DASHBOARD_HEADER_WITHOUT_BILLS_TITLE'),
                src: UnsuccessImg,
                status: 'unsuccess',
            };
        } else if (validateAllPaid) {
            return {
                text: intl.get('title.DASHBOARD_HEADER_ALL_BILLS_PAID_TITLE'),
                src: AllBillPaidImg,
                status: 'allpaid',
            };
        }
        return {
            text: intl.get('title.DASHBOARD_HEADER_TITLE'),
            src: SuccessImg,
            status: 'success',
        };
    }, [billDataStore?.storeData?.data, validateAllPaid]);

    const outstanding = useMemo(() => {
        return !billsList?.length
            ? 0
            : billsList?.reduce((acc, currentBill) => {
                  return acc + Number(currentBill.status === 'due' ? currentBill?.outstandingAmount?.slice(3) : 0);
              }, 0);
    }, [billsList]);

    const onHandlePushEventCleverTap = (screen: string, action = '') => {
        handlePushEventCleverTap({
            channel: platformAccess.type + '-' + CHANNEL_CLEVER_TAP,
            section: ClvertapSection.current,
            screen,
            action,
        });
    };

    const handleSeeMoreBtn = () => {
        handleClickToFav();
        onHandlePushEventCleverTap('Card', 'SeeMore');
    };

    const handleAddBillerBtn = () => {
        handleValidatorFeature(() => {
            onHandlePushEventCleverTap('AddBiller');
            navigate('../biller');
        });
    };

    const htmlAddBillData = useMemo(() => {
        return (
            <div key={idBtn} className="bill-card card-item bill-card--addNew">
                <div className="bill-card__inner">
                    {validateAllPaid ? (
                        <div className="bill-button__wrapper" onClick={handleSeeMoreBtn}>
                            <span className="bill-button__icon">
                                <ArrowLeftSVG className="rotate-svg" />
                            </span>
                            <span className="bill-button__name">{intl.get('button.DASHBOARD_SEE_MORE_BUTTON')}</span>
                        </div>
                    ) : (
                        <div className="bill-button__wrapper" onClick={handleAddBillerBtn}>
                            <span className="bill-button__icon bill-button__icon--circle">
                                <PlusSVG />
                            </span>
                            <span className="bill-button__name">{intl.get('button.ADD_BILLER_BUTTON')}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }, [validateAllPaid, handleValidatorFeature]);

    const handlePayNow = (item: IBillRes, isBackFav = true) => {
        handleValidatorFeature(() => {
            setIsGoToPayNow(true);
            dispatch(
                postAccountNumber({
                    accountNumber: item.accountNumber,
                    msisdn: currentUser?.msisdn as string,
                    walletAccountId: currentUser?.walletAccountId as string,
                    merchantSettlementId: currentUser?.merchantSettlementId as string,
                    productId: item.productId,
                    categoryId: item.categoryId,
                    providerId: item.providerId,
                    cancelToken: newCancelToken(),
                }),
            )
                .then((res) => {
                    res.payload &&
                        navigate(`${stepToAddBillUrl.step2}/${item.productId}`, {
                            state: {
                                name: 'isPayNow',
                                isBackToFav: isBackFav,
                            },
                        });
                })
                .finally(() => setIsGoToPayNow(false));
            onHandlePushEventCleverTap('Card', 'PayNow');
        });
    };

    const htmlBillData = useMemo(() => {
        let html = billDataStore?.asapData.map((item: IBillRes) => {
            return (
                <div key={item.id} className="bill-card card-item">
                    <div className="bill-card__inner">
                        <BoxThumbnail height={'auto'} src={item?.providerLogoUrl} className="bill-card__thumbnail" />
                        <div className="bill-card__summary">
                            <div className="bill-text">
                                <span className="bill-text__name">{item.productDisplayName}</span>
                                <h3 className="bill-text__price">{convertCurrency(Number(item?.outstandingAmount?.slice(3)))}</h3>
                                <span className="bill-text__status bill-text__due">
                                    {intl.get('text.DUE_ON_TEXT')} {formatISODate(item.dueDate)}
                                </span>
                            </div>
                            <div className="bill-button-wrapper">
                                <BillButton onClick={() => handlePayNow(item, false)}>{intl.get('button.PAY_NOW_BUTTON')}</BillButton>
                            </div>
                        </div>
                    </div>
                </div>
            );
        });

        html.push(htmlAddBillData);

        return html;
    }, [billDataStore.asapData, htmlAddBillData]);

    const handleUnmountApp = () => {
        console.log('Disable App');
        window.close();
    };

    const handleCloseBoxMessage = () => {
        dispatch(billActions.closeBoxMessage());
        if (pinLog.isBlocked && !pinLog.checked) {
            dispatch(authActions.checkedPinLog());
        }
    };

    const handleConfirmSaveMoreBiller = (check: boolean) => {
        setIsOpenSaveMoreBiller(!isOpenSaveMoreBiller);
        dispatch(
            updateAccountSettings({
                merchantSettlementId: currentUser?.merchantSettlementId as string,
                saveBillerShowed: true,
            }),
        );
        check && navigate('../biller');
    };

    const boxMessageData = useMemo(() => {
        return billDataStore?.messageData?.isOpenMessage
            ? {
                  open: billDataStore?.messageData?.isOpenMessage,
                  content: billDataStore?.messageData?.content,
                  status: billDataStore?.messageData?.method === null ? 'warning' : 'default',
              }
            : {
                  open: false,
                  content: '',
                  status: 'default',
              };
    }, [billDataStore.messageData]);

    let genetorTutorial = handleWindowEventHightLight();

    // Step 1: tutorial progress
    useEffect(() => {
        if (!accountSetting.tutorialShowed && ['create', 'edit'].includes(billDataStore.messageData.method as string)) {
            handlePushEventCleverTap({
                channel: platformAccess.type + '-' + CHANNEL_CLEVER_TAP,
                section: 'Tutorial',
            });
            document.body.classList.add('disable-click-insideApp');
            setAccountTab(DashboardTypeTab.Seg2);

            const startTutorialInterval = setInterval(() => {
                let next = genetorTutorial.next();
                if (next.done) {
                    clearInterval(startTutorialInterval);
                }
            }, 3000);
        }
    }, [accountSetting.tutorialShowed, billDataStore.messageData.method]);

    // Step 2: tutorial hightlight box
    useEffect(() => {
        if (isOpenTutorial && isAccountTab === DashboardTypeTab.Seg2) {
            setTargetOption({
                selector: document.getElementById('saved-bill-firstItem-target') as HTMLElement,
                tooltipData: (
                    <div className="tooltip-content">
                        <h4 className="tooltip-title">{intl.get('title.BOX_HIGHLIGHT_TITLE')}</h4>
                        <p className="tooltip-desc">{intl.get('desc.BOX_HIGHLIGHT_DESC')}</p>
                    </div>
                ),
            });
        }
    }, [isOpenTutorial, isAccountTab]);

    // After create | delete | edit bill so switch to favourites
    useEffect(() => {
        !billDataStore.isHandling && billDataStore.messageData.isOpenMessage && billDataStore.messageData.method !== null && handleClickToFav();
    }, [billDataStore.isHandling, billDataStore.messageData.isOpenMessage]);

    // close auto message
    useEffect(() => {
        billDataStore.messageData.isOpenMessage && setTimeout(() => dispatch(billActions.closeBoxMessage()), 5000);
    }, [billDataStore.messageData.isOpenMessage]);

    const dispatchBlockedPin = () => {
        dispatch(
            billActions.addBoxMessage({
                content: intl.get('notification.ACCOUNT_BLOCKED'),
                method: null,
            }),
        );
        dispatch(authActions.checkedPinLog());
    };

    // mounting: when click paynow in fav, click back screen will back to fav
    useEffect(() => {
        if (location.state === BACK_TO_FAV) {
            handleClickToFav();
            window.history.replaceState({}, document.title);
        }
    }, []);

    // mounting: reset temporaryData
    useEffect(() => {
        billDataStore?.temporaryData?.stepDone.length !== 0 && dispatch(billActions.deleteTemporaryData());
        billDataStore?.temporaryTransactionData?.defaultBillData && dispatch(billActions.deleteTemporaryTransactionData());
    }, []);

    // mounting: cleverTap on pageView
    useEffect(() => {
        handlePushEventCleverTap({
            channel: platformAccess.type + '-' + CHANNEL_CLEVER_TAP,
            section: 'Home',
        });
    }, []);

    // mounting: check block pin or redirect from confirm view to dashboard when appear blocked pin
    useEffect(() => {
        ((pinLog.isBlocked && !pinLog.checked) || location.state === PIN_BLOCKED_CODE) && dispatchBlockedPin();
    }, []);

    // fix not going to top when back to this screen
    useEffect(() => {
        setTimeout(() => {
            document.documentElement.scrollTo(0, 0);
        }, 0);
    }, []);

    return (
        <PublicLayout>
            {boxMessageData.open && <BoxMessage onCloseBtn={handleCloseBoxMessage} status={boxMessageData.status as 'default' | 'warning'} content={boxMessageData.content} />}
            {isGoToPayNow && <Splash isOpen={billDataStore.isHandling} style={{ opacity: 0.6 }} />}
            <Breadcrumb breadName={intl.get('navigation.BILLS')} onClick={handleUnmountApp} />
            <div className="bill-dashboard">
                <header className="bill-dashboard__header">
                    <div className="header-wrapper container">
                        <h3 className="header-greeting">{greetingObj.text}</h3>
                        <div className="header-userInfor">
                            <div className="header-userInfor__wallet">
                                <div className="box-outstanding">
                                    <label className="box-outstanding__label">{intl.get('title.DASHBOARD_HEADER_OUTSTANDING_TITLE')}</label>
                                    <h2 className="box-outstanding__text">{convertCurrency(outstanding)}</h2>
                                </div>
                                <div className="box-wallet">
                                    <WalletSVG />
                                    <h4 className="box-wallet__name">{intl.get('title.WALLET_BALANCE_TITLE')}:</h4>
                                    <span className="box-wallet__price">{convertCurrency(convertSenToRM(currentUser?.balance.amount as number))}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <img src={greetingObj.src} className="header-bg" />
                </header>
                <div className="bill-dashboard__wrapper">
                    <div className="bill-dashboard__cards">
                        <div className="bill-due-list bill-due-box cards-list--horizontal">
                            <CardCarousel>{htmlBillData}</CardCarousel>
                        </div>
                    </div>
                    <div className="container">
                        <Segmented className="bill-segmented" block value={isAccountTab} options={mockSegmented} onChange={(e: any) => setAccountTab(e)} />
                    </div>
                    {isAccountTab === DashboardTypeTab.Seg1 ? <MyAccount /> : <SavedBills onPayNow={handlePayNow} onChangeBillList={setBillsList} />}
                </div>
            </div>
            {isOpenTutorial && isAccountTab === DashboardTypeTab.Seg2 && (
                <BoxHightLight
                    selector={targetOption?.selector as HTMLElement}
                    tooltipData={targetOption?.tooltipData}
                    isLastSection={targetOption?.isLastSection}
                    height={targetOption?.height}
                />
            )}

            {!accountSetting.saveBillerShowed && (
                <ConfirmPopup visibleModal={isOpenSaveMoreBiller} onConfirm={handleConfirmSaveMoreBiller} customClass="save-more-biller-popup">
                    <div className="save-more-biller-popup__content container">
                        <img className="entry-thumbnail" src={MoreBillerImg} />
                        <span className="entry-subtitle">{intl.get('title.ADD_MORE_BILLER_TITLE')}</span>
                        <h1 className="entry-title">{intl.get('title.ADDBILLER_MODAL_TITLE')}</h1>
                        <p className="entry-content">{intl.get('desc.ADDBILLER_MODAL_DESC')}</p>
                        <BillButton size={sizeButton.sizeXL} fullWidth={true} hasOutline={true} onClick={() => handleConfirmSaveMoreBiller(false)}>
                            {intl.get('button.ADDBILLER_MODAL_BUTTON')}
                        </BillButton>
                        <BillButton size={sizeButton.sizeXL} fullWidth={true} onClick={() => handleConfirmSaveMoreBiller(true)}>
                            {intl.get('button.ADD_BILLER_BUTTON')}
                        </BillButton>
                    </div>
                </ConfirmPopup>
            )}
        </PublicLayout>
    );
};

export default Dashboard;
