import { Drawer } from 'antd';
import React, { memo, useId, useMemo, useRef, useState } from 'react';
import WheelPicker, { IWheelOptionType } from '../WheelPicker';
import intl from 'react-intl-universal';

import { CheckmarkSVG, SearchSVG, ChevronSVG } from '../../allSvg';
import SearchInput from '../SearchInput/Index';
import { RootState, useAppDispatch } from '../../redux';
import { searchOutletName } from '../../redux/bill/thunk';
import { useSelector } from 'react-redux';
import HighLightText from '../HighLightText';
import './index.scss';
import { billActions } from '../../redux/bill/silce';
import { IBillOutlet } from '../../api/interface';

interface IOutletSectionProps {
    visibleOutletDrawer: boolean;
    wheelOption: IWheelOptionType;
    selectedSearchValue: string | null;
    onHandleSelect: (data: Partial<IWheelOptionType>) => void;
    onHandleSearch: (data: string) => void;
    onClose: () => void;
}

const OutletSection: React.FC<IOutletSectionProps> = ({ visibleOutletDrawer, wheelOption, selectedSearchValue, onHandleSelect, onClose, onHandleSearch }) => {
    const outletSearchData = useSelector((state: RootState) => state.bill.outletData);
    const { currentUser } = useSelector((state: RootState) => state.auth);
    const idRandom = useId();
    const currentScrollOutletIndex = useRef<number>(0);
    const currentScrollSectionOutletIndex = useRef<number>(0);
    const [openSearchOutlet, setOpenSearchOutlet] = useState(false);
    const dispatch = useAppDispatch();

    const currentSearch = useRef<string>('');

    const onToggleSearchOutlet = () => {
        setOpenSearchOutlet((preState) => !preState);
    };

    const onCheckmarkOutlet = () => {
        onHandleSelect({
            defaultSelection: currentScrollSectionOutletIndex.current,
            defaultItemIndex: currentScrollOutletIndex.current,
            selection: wheelOption.data[currentScrollSectionOutletIndex.current].values[currentScrollOutletIndex.current],
        });
    };

    const handleSearchOutlet = (value: string) => {
        onHandleSearch(value);
        onToggleSearchOutlet();
        currentSearch.current = '';
        dispatch(billActions.resetOutlet());
    };

    const handleFilterBiller = (filterText: string) => {
        dispatch(
            searchOutletName({
                page: 1,
                limit: 10,
                walletAccountId: currentUser?.walletAccountId as string,
                merchantSettlementId: currentUser?.merchantSettlementId as string,
                search: filterText,
                stores: currentUser?.stores as IBillOutlet[],
            }),
        );
        currentSearch.current = filterText;
    };

    const getOutletListHtml = useMemo(() => {
        if (outletSearchData.length > 0) {
            return outletSearchData.map((item: any) => {
                const addClass = item.name === selectedSearchValue ? 'outlet-item active' : 'outlet-item';
                return <HighLightText key={item.id} className={addClass} text={item.name} highlight={currentSearch.current} onHandle={() => handleSearchOutlet(item.name)} />;
            });
        } else {
            return currentSearch.current !== '' ? (
                <div className="outlet-list__none" key="none">
                    <h2>{intl.get('title.SEARCH_OUTLET_RESULT_NONE_TITLE')}</h2>
                    <p>{intl.get('desc.SEARCH_OUTLET_RESULT_NONE_DESC')}</p>
                </div>
            ) : (
                ''
            );
        }
    }, [outletSearchData, currentSearch.current, selectedSearchValue]);

    return (
        <>
            <Drawer placement={'bottom'} closable={false} onClose={onClose} visible={visibleOutletDrawer} key={'bottom'} height={'60%'} className="biller-drawer">
                <div className="biller-drawer__header">
                    <div className="section-title">
                        <h3 className="section-title__name">{intl.get('label.SELECT_OUTLET_LABEL')}</h3>
                        <span>{intl.get('desc.SELECT_OUTLET_DRAWER_DESC')}</span>
                    </div>
                    <SearchSVG onClick={onToggleSearchOutlet} />
                </div>
                {visibleOutletDrawer && (
                    <WheelPicker
                        data={wheelOption.data}
                        height={60}
                        parentHeight={250}
                        fontSize={16}
                        scrollerId="scroll-select-subject"
                        updateSelection={(selectedIndex: any, selectedSectionIndex: any) => {
                            currentScrollOutletIndex.current = selectedIndex;
                            currentScrollSectionOutletIndex.current = selectedSectionIndex;
                        }}
                        defaultSelection={wheelOption.defaultSelection}
                        defaultItemIndex={wheelOption.defaultItemIndex}
                    />
                )}
                <button className="entry-button__next" onClick={onCheckmarkOutlet}>
                    <CheckmarkSVG />
                </button>
            </Drawer>

            {/* Search Outlet */}
            <Drawer
                placement={'bottom'}
                closable={false}
                onClose={() => {
                    onToggleSearchOutlet();

                    // reset search input
                    currentSearch.current = '';
                    outletSearchData.length > 0 && dispatch(billActions.resetOutlet());
                }}
                visible={openSearchOutlet}
                key={`bottom-search--${idRandom}`}
                height={'60%'}
                className="biller-drawer biller-drawer--search-outlet"
            >
                <div className="biller-drawer__header">
                    <div className="section-title">
                        <h3 className="section-title__name">{intl.get('title.SEARCH_OUTLET_TITLE')}</h3>
                    </div>
                    <ChevronSVG onClick={onToggleSearchOutlet} className="arrow-svg" />
                </div>
                {openSearchOutlet && (
                    <SearchInput id="biller-search-outlet" placeholder={intl.get('title.SEARCH_OUTLET_TITLE')} onSearch={handleFilterBiller} openPrefixIcon={false} />
                )}
                <ul className="outlet-list">{getOutletListHtml}</ul>
            </Drawer>
        </>
    );
};

export default memo(OutletSection);
