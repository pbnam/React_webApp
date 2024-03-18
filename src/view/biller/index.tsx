import React, { useEffect, useRef } from 'react';
import Breadcrumb from '../../components/Breadcrumb';
import PublicLayout from '../../layout/PublicLayout';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import intl from 'react-intl-universal';

import './index.scss';
import { SearchSVG } from '../../allSvg';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../redux';
import { CHANNEL_CLEVER_TAP } from '../../constants';
import { useContextStore } from '../../App';
import { billActions } from '../../redux/bill/silce';
import { RouteConfig } from '../../router';
import PaymentServices, { IPaymentList } from '../dashboard/MyAccount/PaymentServices';
import PopularBiller from '../dashboard/MyAccount/PopularBiller';

const BillerView = () => {
    const { platformAccess, pinLog } = useSelector((state: RootState) => state.auth);

    let location = useLocation();
    const navigate = useNavigate();
    const { handlePushEventCleverTap, handleValidatorFeature } = useContextStore();
    let ClvertapSection = useRef('AddBiller');
    const dispatch = useAppDispatch();

    const handleSeeAllBtn = () => {
        navigate('/sebiller/all');
    };

    const handleClickPaymentItem = (item: IPaymentList) => {
        handleValidatorFeature(() => {
            navigate(item.url);
        });
    };

    const handleClickFromPopularBiller = (payload: { billerName: string; billerId: string }) => {
        navigate(`/sebiller/form/${payload?.billerId}`);
    };

    useEffect(() => {
        handlePushEventCleverTap({
            channel: platformAccess.type + '-' + CHANNEL_CLEVER_TAP,
            section: ClvertapSection.current,
        });
    }, []);

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

    return (
        <PublicLayout>
            <Breadcrumb breadName={intl.get('navigation.ADD_BILLER')} verticalStyle={true} className={location.state as string} />
            <div className="biller-content site-content container">
                <section className="biller-content__categories">
                    <div className="entry-header">
                        <div className="entry-header__summary">
                            <h3 className="entry-header__title">{intl.get('title.ADD_BILLER_TITLE')}</h3>
                            <span className="entry-header__subtitle">{intl.get('desc.ADD_BILLER_DESC')}.</span>
                        </div>
                        <div className="entry-header__search-icon">
                            <Link to="/sebiller/all">
                                <SearchSVG />
                            </Link>
                        </div>
                    </div>
                    <PaymentServices onClick={handleClickPaymentItem} />
                </section>
                <section className="bill-dashboard__popular">
                    <PopularBiller onClickTitleBtn={handleSeeAllBtn} onClickCard={handleClickFromPopularBiller} />
                </section>
            </div>
        </PublicLayout>
    );
};

export default BillerView;
