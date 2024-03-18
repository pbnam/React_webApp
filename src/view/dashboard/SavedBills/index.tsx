import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Drawer } from 'antd';
import { useNavigate } from 'react-router-dom';
import intl from 'react-intl-universal';

import { convertCurrency, formatAccountNumber, formatISODate } from '../../../utils/common';
import './index.scss';

import { NoDataImg } from '../../../constants/ImgAsset';
import { FilterSVG, WastebasketSVG, Wastebasket2SVG, PencilSVG, PaymentSVG, PlusSVG, CheckmarkSVG, ChevronDownSVG } from '../../../allSvg';
import { CHANNEL_CLEVER_TAP } from '../../../constants';

import { deleteBill } from '../../../redux/bill/thunk';
import { billActions } from '../../../redux/bill/silce';

import { stepToAddBillUrl } from '../../../router';
import { RootState, useAppDispatch } from '../../../redux';
import { getBillsApi, IBillRes, convertAndCompareNewBills } from '../../../api/bill';
import { useContextStore } from '../../../App';

import { IWheelOptionType } from '../../../components/WheelPicker';
import OutletSection from '../../../components/OutletSection';
import ConfirmPopup from '../../../components/ConfirmPopup';
import { IParamGetBills, updateBillsData } from '../../../redux/bill/billThunk';
import Splash from '../../../components/Splash';
import useTranslate from '../../../customHooks/useTranslate';
import BoxThumbnail from '../../../components/BoxThumbnail';

interface SavedBillsProps {
    onPayNow: (item: IBillRes) => void;
    onChangeBillList: (item: IBillRes[]) => void;
}

interface IBoxLeftProps {
    selector: HTMLElement | undefined;
    startX: number;
    endX: number;
}

const SavedBills: React.FC<SavedBillsProps> = ({ onPayNow, onChangeBillList }) => {
    const { data: billData, total: totalSearch, page: currentSearch, limit: currentLimit } = useSelector((state: RootState) => state.bill.storeData);
    const { platformAccess, currentUser, pinLog } = useSelector((state: RootState) => state.auth);
    const outletData = useSelector((state: RootState) => state.auth.currentUser?.stores);

    // fix
    const [billsList, setBillsList] = useState(billData);

    const outletOnlyNameData = outletData ? outletData.map((item) => item.name) : [];

    const [wheelOption, setWheelOption] = useState<IWheelOptionType>({
        pickerOpen: false,
        data: [
            {
                id: 1,
                name: 'Outlet',
                values: ['All Outlets', ...outletOnlyNameData],
            },
        ],
        defaultSelection: 0,
        defaultItemIndex: 0,
        selection: '',
    });
    const [visibleOutletDrawer, setVisibleOutletDrawer] = useState(false);
    const [selectedSearchValue, setSelectedSearchValue] = useState<string | null>(null);

    // Edit state
    const [visibleEditDrawer, setVisibleEditDrawer] = useState(false);
    const [currentEditBill, setCurrentEditBill] = useState<IBillRes | null>(null);
    const [visibleDeletePopupModal, setVisibleDeletePopupModal] = useState(false);
    const { isHandling, messageData } = useSelector((state: RootState) => state.bill);

    const [param, setParam] = useState<IParamGetBills>({
        type: 'SEARCH',
        page: currentSearch,
        limit: 3,
        walletAccountId: currentUser?.walletAccountId as string,
        merchantSettlementId: currentUser?.merchantSettlementId as string,
        outletName: selectedSearchValue as string,
        sortField: 'dueDate',
        sortDirection: 'ASC',
    });

    let paramFilter = useRef({
        currentSearch,
        totalSearch,
        currentLimit,
        handling: true,
    });

    const { currentLanguage } = useTranslate();

    const dispatch = useAppDispatch();
    let navigate = useNavigate();
    const { handlePushEventCleverTap, handleValidatorFeature } = useContextStore();
    let ClvertapSection = useRef('Toggle');

    const boxLeftEl = useRef<IBoxLeftProps>({
        selector: undefined,
        startX: 0,
        endX: 0,
    });

    const onHandlePushEventCleverTap = (screen: string) => {
        handlePushEventCleverTap({
            channel: platformAccess.type + '-' + CHANNEL_CLEVER_TAP,
            section: ClvertapSection.current,
            screen,
        });
    };

    const handleAddBillerBtn = () => {
        handleValidatorFeature(() => {
            onHandlePushEventCleverTap('AddBiller');
            navigate('../biller');
        });
    };

    const htmlAddBillData = useMemo(() => {
        if (paramFilter.current.handling) {
            return (
                <div key={'none'} className="bill-card card-item bill-card--loading">
                    <Splash isOpen={true} />
                </div>
            );
        } else if (billsList?.length === 0) {
            const noneOb = {
                srcImg: NoDataImg,
                titleName: intl.get('title.DASHBOARD_HEADER_WITHOUT_BILLS_TITLE'),
                desc: intl.get('desc.DASHBOARD_HEADER_WITHOUT_BILLS_DESC'),
            };

            return (
                <div key={'none2'} className="bill-card bill-card--none">
                    <img src={noneOb.srcImg} />
                    <div className="entry-content">
                        <h3 className="entry-title">{noneOb.titleName}</h3>
                        <p>{noneOb.desc}</p>
                    </div>
                </div>
            );
        }
        return (
            <div key={'none'} className="bill-card card-item bill-card--addNew">
                <div className="bill-card__inner">
                    <div className="bill-button__icon">
                        <PlusSVG />
                    </div>
                    <span className="bill-button__name">{intl.get('title.ADD_MORE_BILLER_TITLE')}</span>
                    <a onClick={handleAddBillerBtn} className="bill-card__btn"></a>
                </div>
            </div>
        );
    }, [billsList, handleValidatorFeature, paramFilter.current.handling]);

    const styleDisableDoubleClick: React.CSSProperties = useMemo(() => {
        return isHandling ? { pointerEvents: 'none', opacity: '0.3' } : { pointerEvents: 'auto' };
    }, [isHandling]);

    const onHandleEditBill = (event: React.MouseEvent<HTMLElement>, item: IBillRes) => {
        event.stopPropagation();
        handleValidatorFeature(() => {
            setCurrentEditBill(item);
            onToggleEditDrawer();
        });
    };

    const handleTouchMove = (e: any) => {
        boxLeftEl.current.selector = e.currentTarget;
        boxLeftEl.current.startX = e.changedTouches[0].clientX;
    };

    const handleTouchEndMove = (e: any) => {
        if (boxLeftEl.current.startX - e.changedTouches[0].clientX > 50) {
            let billCardEls = document.querySelectorAll('.bill-card.open-remove');
            billCardEls.forEach((item) => {
                item.classList.remove('open-remove');
            });

            boxLeftEl.current.selector?.classList.add('open-remove');
        } else {
            boxLeftEl.current.selector?.classList.remove('open-remove');
        }
    };

    const loadMoreBill = () => {
        if (
            !paramFilter.current.handling &&
            Math.floor(window.innerHeight + document.documentElement.scrollTop) === document.scrollingElement?.scrollHeight &&
            paramFilter.current.currentSearch * paramFilter.current.currentLimit < paramFilter.current.totalSearch
        ) {
            setParam((pre) => ({
                ...pre,
                page: pre.page + 1,
                type: 'LOADMORE',
            }));
            paramFilter.current.handling = true;
        }
    };

    const renderBillStatus = (status: 'paid' | 'due', updatedAt: string, dueDate: string) => {
        // split status to 2 line only for bm language
        let preText = currentLanguage === 'bm' ? '\n' : '';
        let statusText = `${intl.get(`text.${status.toUpperCase()}_TEXT`)} ${intl.get(`text.ON_TEXT`)}` + preText;
        return (updatedAt && status === 'paid') || dueDate ? `${statusText} ${formatISODate(status === 'paid' ? updatedAt : dueDate)}` : `N/A`;
    };

    const htmlBillData = useMemo(() => {
        if (paramFilter.current.handling && param.type === 'SEARCH' && param.page === 1) {
            return htmlAddBillData;
        }

        let html = billsList?.map((item: IBillRes, index: any) => {
            const idItem = index === 0 ? { id: 'saved-bill-firstItem-target' } : null;

            return (
                <div key={item.id} {...idItem} className="bill-card card-item" onTouchStart={handleTouchMove} onTouchEnd={handleTouchEndMove}>
                    <div className="bill-card__inner" onClick={(e) => onHandleEditBill(e, item)} style={styleDisableDoubleClick}>
                        <div className="bill-card__header">
                            <div className="bill-header__top">
                                <BoxThumbnail height="auto" src={item.providerLogoUrl} className="bill-header__thumbnail" />
                                <h4 className="bill-header__company">{item.productDisplayName}</h4>
                            </div>
                            <div className="bill-header__btn">
                                <ChevronDownSVG className="arrow-edit-btn" />
                            </div>
                        </div>
                        <div className="bill-card__summary">
                            <div className="col-left">
                                <h4 className="bill-text__name">{item.outlet.name}</h4>
                                <span className="bill-text__phone">{formatAccountNumber(item?.accountNumber)}</span>
                            </div>
                            {item.status !== null && (
                                <div className="col-right">
                                    <h4 className="bill-text__price">
                                        {convertCurrency(item.status === 'due' ? Number(item?.outstandingAmount?.slice(3)) : Number(item.payAmount))}
                                    </h4>
                                    <span className={`bill-text__status bill-text__${item.status}`}>{renderBillStatus(item.status, item.updatedAt, item.dueDate)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="bill-card__quick-delete" onClick={() => handleQuickDelete(item)}>
                        <Wastebasket2SVG />
                    </div>
                </div>
            );
        });

        html?.push(htmlAddBillData);

        return html;
    }, [billsList, styleDisableDoubleClick, htmlAddBillData, param.type, param.page]);

    const handleQuickDelete = (item: IBillRes) => {
        setCurrentEditBill(item);
        onToggleDeletePopup();
    };

    const onOutletDrawerToogle = useCallback(() => {
        setVisibleOutletDrawer((pre) => !pre);
    }, []);

    const onSearchBill = useCallback((target: string) => {
        setParam((pre) => ({
            ...pre,
            page: 1,
            outletName: target,
            type: 'SEARCH',
        }));
        paramFilter.current.handling = true;
    }, []);

    const handleSearchOutlet = useCallback((value: string) => {
        setSelectedSearchValue(value);
        setVisibleOutletDrawer(false);
        onSearchBill(value);
    }, []);

    const onCheckmarkOutlet = useCallback((data: Partial<IWheelOptionType>) => {
        onOutletDrawerToogle();
        setWheelOption((prevState) => ({
            ...prevState,
            ...data,
        }));
        onSearchBill(data.selection === 'All Outlets' ? '' : (data.selection as string));
    }, []);

    // Edit fn
    const onToggleEditDrawer = () => {
        setVisibleEditDrawer((prevState) => !prevState);
    };

    // delete bill
    const onToggleDeletePopup = () => {
        setVisibleDeletePopupModal((prevState) => !prevState);
    };

    const handleRemoveBill = () => {
        onToggleDeletePopup();
        onToggleEditDrawer();
    };

    const handleConfirmDeleteBill = (check: any) => {
        if (pinLog.isBlocked) {
            dispatch(
                billActions.addBoxMessage({
                    content: intl.get('notification.ACCOUNT_BLOCKED'),
                    method: null,
                }),
            );
        } else {
            if (check) {
                dispatch(billActions.closeBoxMessage());
                currentEditBill &&
                    dispatch(
                        deleteBill({
                            id: currentEditBill.id,
                            walletAccountId: currentUser?.walletAccountId as string,
                            merchantSettlementId: currentUser?.merchantSettlementId as string,
                            productDisplayName: currentEditBill.productDisplayName,
                            outletName: currentEditBill?.outlet?.name,
                        }),
                    ).then(() => {
                        setBillsList((pre) => pre.filter((item) => item.id !== currentEditBill.id));
                        dispatch(
                            updateBillsData({
                                walletAccountId: currentUser?.walletAccountId as string,
                                merchantSettlementId: currentUser?.merchantSettlementId as string,
                            }),
                        );
                    });
            }
        }
        onToggleDeletePopup();
    };

    const handleEditBill = () => {
        dispatch(billActions.closeBoxMessage());
        currentEditBill && dispatch(billActions.directEditBill());
        navigate(`${stepToAddBillUrl.step5}/${currentEditBill?.productId}`, { state: currentEditBill });
    };

    const handleMakePayment = () => {
        currentEditBill && onPayNow(currentEditBill);
        onToggleEditDrawer();
    };

    const editFeatures = useMemo(() => {
        return [
            {
                id: 0,
                name: intl.get('button.DASHBOARD_REMOVE_BILL_BUTTON').replace(' ', '\n'),
                svg: <WastebasketSVG />,
                onHandle: handleRemoveBill,
            },
            {
                id: 1,
                name: intl.get('button.DASHBOARD_EDIT_DETAILS_BUTTON').replace(' ', '\n'),
                svg: <PencilSVG />,
                onHandle: handleEditBill,
            },
            {
                id: 2,
                name: intl.get('button.DASHBOARD_MAKE_PAYMENTS_BUTTON').replace(' ', '\n'),
                svg: <PaymentSVG />,
                onHandle: handleMakePayment,
            },
        ];
    }, [currentEditBill]);

    const handleLoadBill = (params: IParamGetBills) => {
        try {
            const { type, ...payload } = params;
            getBillsApi(payload)
                .then(async (res) => {
                    const merchantSettlementId = currentUser?.merchantSettlementId as string;
                    const walletAccountId = currentUser?.walletAccountId as string;
                    const newData = await convertAndCompareNewBills(res.data, walletAccountId, merchantSettlementId);

                    // reload data when have update data from boostLife
                    if (newData.hasUpdate) {
                        await dispatch(
                            updateBillsData({
                                walletAccountId,
                                merchantSettlementId,
                            }),
                        ).finally(() => {
                            setBillsList(billData);
                            paramFilter.current = {
                                ...paramFilter.current,
                                currentSearch: 1,
                            };
                            setParam((pre) => ({
                                ...pre,
                                page: 1,
                                outletName: '',
                                type: 'SEARCH',
                            }));
                        });
                    } else {
                        type === 'SEARCH' && payload.page === 1 ? setBillsList(newData.data) : setBillsList((pre) => [...pre, ...newData.data]);
                        paramFilter.current = {
                            ...paramFilter.current,
                            currentSearch: res.page,
                            totalSearch: res.total,
                            currentLimit: res.limit,
                        };
                    }
                })
                .finally(() => {
                    paramFilter.current.handling = false;
                });
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        paramFilter.current.handling && handleLoadBill(param);
    }, [param]);

    // load more bill
    useEffect(() => {
        window.addEventListener('scroll', loadMoreBill);
        return () => {
            onChangeBillList(billData);
            window.removeEventListener('scroll', loadMoreBill);
        };
    }, []);

    // auto close drawer when delete success
    useEffect(() => {
        if (!isHandling && messageData.isOpenMessage && messageData.method === 'delete' && visibleEditDrawer) {
            setVisibleEditDrawer(false);
        }
    }, [messageData, isHandling]);

    // cleverTap on pageView
    useEffect(() => {
        onHandlePushEventCleverTap('Favourites');
    }, []);

    // Update total outstanding on header
    useEffect(() => {
        onChangeBillList(billsList);
    }, [billsList]);

    return (
        <section className="bill-dashboard__saved-bill container" id="saved-bill-target">
            {(billsList?.length !== 0 || param.outletName !== null) && (
                <div className="bill-grid-filter">
                    <h4 className="bill-grid-filter__title">{intl.get('title.SAVED_BILLERS_TITLE')}</h4>
                    <FilterSVG onClick={onOutletDrawerToogle} />
                </div>
            )}
            <div className="bill-due-grid bill-due-box">{htmlBillData}</div>
            {/* Outlet */}
            <OutletSection
                onClose={onOutletDrawerToogle}
                visibleOutletDrawer={visibleOutletDrawer}
                onHandleSelect={onCheckmarkOutlet}
                onHandleSearch={handleSearchOutlet}
                wheelOption={wheelOption}
                selectedSearchValue={selectedSearchValue}
            />

            {/* Edit */}
            <Drawer
                placement={'bottom'}
                closable={false}
                onClose={onToggleEditDrawer}
                visible={visibleEditDrawer}
                key={'bottom-edit'}
                height={'auto'}
                className="biller-drawer edit-bill-drawer"
            >
                <div className="edit-bill-drawer__header">
                    <h2 className="header-name">{currentEditBill?.productDisplayName}</h2>
                    <p className="header-other">
                        {formatAccountNumber(currentEditBill?.accountNumber as string)} ({currentEditBill?.outlet.name})
                    </p>
                </div>
                <ul className="edit-bill-drawer__features">
                    {editFeatures.map((item) => {
                        if (currentEditBill?.status === 'paid' && item.id === 2) {
                            return null;
                        }
                        return (
                            <li className="edit-bill-drawer__feature" key={item.id} onClick={item.onHandle}>
                                <span className="svg-icon">{item.svg}</span>
                                <h5 className="entry-title">{item.name}</h5>
                            </li>
                        );
                    })}
                </ul>
            </Drawer>

            {/* Popup remove */}
            <ConfirmPopup visibleModal={visibleDeletePopupModal} onConfirm={handleConfirmDeleteBill}>
                <div className="modal-confirm">
                    <span className="modal-confirm__subtitle">{intl.get('text.REMOVE_BILL_MODAL_TEXT')}</span>
                    <h2 className="modal-confirm__title">{intl.get('title.REMOVE_BILL_MODAL_TITLE')}</h2>
                    <div className="modal-confirm__desc">{intl.get('desc.REMOVE_BILL_MODAL_DESC')}</div>
                    <div className="modal-confirm__control">
                        <div className="confirm-btn" onClick={() => handleConfirmDeleteBill(false)}>
                            <PlusSVG className="remove-rotate" />
                        </div>
                        <div className="confirm-btn confirm-btn--primary" onClick={() => handleConfirmDeleteBill(true)}>
                            <CheckmarkSVG />
                        </div>
                    </div>
                </div>
            </ConfirmPopup>
        </section>
    );
};

export default SavedBills;
