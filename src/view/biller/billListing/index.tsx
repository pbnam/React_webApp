import React, { MutableRefObject, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Affix, BackTop, InputRef, Segmented } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../../../components/Breadcrumb';
import SearchInput from '../../../components/SearchInput/Index';
import './index.scss';
import intl from 'react-intl-universal';

import { ChevronSVG } from '../../../allSvg';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../../redux';
import { EnumBillerCatType, IBiller, IBillerCat } from '../../../api/biller/interface';

import { NoSearchDataImg } from '../../../constants/ImgAsset';
import { useContextStore } from '../../../App';
import { CHANNEL_CLEVER_TAP } from '../../../constants';
import { billerActions } from '../../../redux/biller/slice';
import { billActions } from '../../../redux/bill/silce';
import { RouteConfig } from '../../../router';

const BillerListing: React.FC = () => {
    const [isType, setIsType] = useState(EnumBillerCatType.all);
    const { billerData, isLoaded, categoryBillerSelected, billerCat } = useSelector((state: RootState) => state.biller);
    const { platformAccess, pinLog } = useSelector((state: RootState) => state.auth);

    let navigate = useNavigate();

    const [isBackToTop, setIsBackToTop] = useState(false);
    const { catName } = useParams();

    const [isHasParam, setIsHasParam] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const { handlePushEventCleverTap } = useContextStore();
    let inputSearchRef = useRef() as MutableRefObject<InputRef>;

    let ClvertapSection = useRef('SelectBiller');
    const dispatch = useAppDispatch();

    const findBillerCatByParam = useCallback((target: string, type: keyof IBillerCat) => {
        return (
            billerCat.find((item) => item[type].toLowerCase().includes(target)) || {
                categoryId: target,
                categoryName: '',
            }
        );
    }, []);

    const mockSegmented = useMemo(() => {
        const getBillerCatId = (name: string) => findBillerCatByParam(name, 'categoryName')?.categoryId;

        return [
            {
                label: intl.get('button.ALL_BUTTON'),
                value: EnumBillerCatType.all,
            },
            {
                label: intl.get('title.ADD_BILLER_ELECTRICITY'),
                value: getBillerCatId(EnumBillerCatType.electricity),
            },
            {
                label: intl.get('title.ADD_BILLER_WATER'),
                value: getBillerCatId(EnumBillerCatType.water),
            },
        ];
    }, []);

    // tab name selected before select biller
    const paramBillerType = useMemo(() => {
        return categoryBillerSelected ? categoryBillerSelected : catName;
    }, [catName, categoryBillerSelected]);

    const billerByTab = useMemo(() => {
        // concat with ATX
        const billers = billerData;

        return isType === EnumBillerCatType.all ? billers : billers.filter((item: IBiller) => item.categoryId === isType);
    }, [isType]);

    const billerDataActive = useMemo(() => {
        try {
            let filterBySearchText = inputSearchRef.current.input?.value as string;

            return filterBySearchText
                ? billerByTab.filter((biller: IBiller) => biller.productDisplayName.toString().toUpperCase().includes(filterBySearchText.toUpperCase()))
                : billerByTab;
        } catch (error) {
            return billerByTab;
        }
    }, [billerByTab, isSearching]);

    const handleBiller = (id: any) => {
        navigate(`/sebiller/form/${id}`);
        dispatch(billerActions.selectedBiller(isType));
    };

    const handleFilterBiller = () => {
        setIsSearching(!isSearching);
    };

    const handleCheckBackToTop = () => {
        !isBackToTop && setIsBackToTop(true);
    };

    const handleChangeTab = (e: any) => {
        setIsType(e);
        !isHasParam && setIsHasParam(true);
    };

    const notFoundHtml = useMemo(() => {
        return (
            <div className="empty-biller__wrapper">
                <img className="empty-biller__img" src={NoSearchDataImg} />
                <h3 className="empty-biller__title">{intl.get('title.SEARCH_BILLER_WITHOUT_RESULT_TITLE')}</h3>
                <span className="empty-biller__desc">{intl.get('desc.SEARCH_BILLER_WITHOUT_RESULT_DESC')}</span>
            </div>
        );
    }, []);

    const handleBackView = () => {
        navigate(-1);
        categoryBillerSelected && dispatch(billerActions.clearSelectedBiller());
    };

    // Compare segmented with param url
    useEffect(() => {
        paramBillerType && setIsType(paramBillerType as EnumBillerCatType);
    }, [paramBillerType]);

    // check scroll
    useEffect(() => {
        window.addEventListener('scroll', handleCheckBackToTop);

        return () => {
            window.removeEventListener('scroll', handleCheckBackToTop);
        };
    }, []);

    // CleverTap on tab
    useEffect(() => {
        isLoaded &&
            isType !== 'all' &&
            handlePushEventCleverTap({
                channel: platformAccess.type + '-' + CHANNEL_CLEVER_TAP,
                section: ClvertapSection.current,
                screen: findBillerCatByParam(isType, 'categoryId')?.categoryName.replace(/ /g, ''),
            });
    }, [isType]);

    // pin blocked view
    useEffect(() => {
        if (pinLog?.isBlocked && pinLog.checked) {
            dispatch(
                billActions.addBoxMessage({
                    content: intl.get('notification.ACCOUNT_BLOCKED'),
                    method: null,
                }),
            );
            navigate(RouteConfig.dashboard);
        }
    }, []);

    // on to top when switch tab
    useLayoutEffect(() => {
        document.documentElement.scrollTo(0, 0);
    }, [isType]);

    return (
        <div className="biller-listing page">
            <Affix offsetTop={0}>
                <div className="biller-listing__wrapper">
                    <Breadcrumb breadName={intl.get('title.SELECT_BILLER_TITLE')} verticalStyle={true} onClick={handleBackView} />
                    <div className="biller-listing__header">
                        <div className="container">
                            <Segmented
                                className="biller-listing-segmented"
                                block
                                options={mockSegmented}
                                defaultValue={paramBillerType}
                                onChange={(e: any) => handleChangeTab(e)}
                            />
                        </div>
                    </div>
                </div>
            </Affix>
            <div className="biller-listing__content container">
                <div className="biller-listing-grid">
                    <SearchInput placeholder={intl.get('text.SEARCH_BILLER_TEXT')} onSearch={handleFilterBiller} ref={inputSearchRef} debounceMode={false} />
                    {billerDataActive.length <= 0 && notFoundHtml}
                    {billerDataActive.map((item: IBiller) => {
                        return (
                            <div className="card-item" key={item.productId} onClick={() => handleBiller(item.productId)}>
                                <div className="card-item__thumbnail">
                                    <img src={item.providerLogoUrl} />
                                </div>
                                <h5 className="card-item__name">{item.productDisplayName}</h5>
                            </div>
                        );
                    })}
                </div>
            </div>

            {isBackToTop && (
                <BackTop visibilityHeight={100}>
                    <div className="biller-backToTop">
                        <ChevronSVG />
                    </div>
                </BackTop>
            )}
        </div>
    );
};

export default BillerListing;
