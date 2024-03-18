import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import intl from 'react-intl-universal';

import { campaignDataMock } from '../../../mock';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux';
import { CHANNEL_CLEVER_TAP } from '../../../constants';
import { useContextStore } from '../../../App';

// components
import PaymentServices, { IPaymentList } from '../MyAccount/PaymentServices';
import SectionTitle from '../../../components/SectionTitle';
import CardCarousel from '../../../components/CardsCarousel';
import PopularBiller from './PopularBiller';

const MyAccount: React.FC = () => {
    const { platformAccess } = useSelector((state: RootState) => state.auth);

    const navigate = useNavigate();
    const { handlePushEventCleverTap, handleValidatorFeature } = useContextStore();
    let ClvertapSection = useRef('Home');

    const onHandlePushEventCleverTap = (screen: string, action?: string) => {
        handlePushEventCleverTap({
            channel: platformAccess.type + '-' + CHANNEL_CLEVER_TAP,
            section: ClvertapSection.current,
            screen,
            action,
        });
    };

    const handleSeeAllBtn = () => {
        navigate('../sebiller/all');
        onHandlePushEventCleverTap('More');
    };

    const handleClickPaymentItem = (item: IPaymentList) => {
        handleValidatorFeature(() => {
            navigate(item.url);
            onHandlePushEventCleverTap(item.name);
        });
    };

    const handleClickFromPopularBiller = (payload: { billerName: string; billerId: string }) => {
        navigate(`/sebiller/form/${payload?.billerId}`);
        onHandlePushEventCleverTap('PopularBillers', payload.billerName.replace(/\s+/g, ''));
    };

    return (
        <>
            <section className="bill-dashboard__categories container">
                <PaymentServices onClick={handleClickPaymentItem} />
            </section>

            {/* <section className="bill-dashboard__promotions">
                <div className="container">
                    <SectionTitle title={intl.get('title.DASHBOARD_CAMPAIGNS_TITLE')} />
                </div>
                <div className="bill-campaign-list cards-list--horizontal">
                    <CardCarousel>
                        {campaignDataMock.map((item: any, index) => {
                            return (
                                <div key={index} className="campaign-card card-item">
                                    <div className="campaign-card__inner">
                                        <div className="campaign-card__thumbnail">
                                            <img src={item.thumbnail} />
                                        </div>
                                        <div className="campaign-card__summary">
                                            <h3 className="campaign-name">{item.name}</h3>
                                            <p>{item.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </CardCarousel>
                </div>
            </section> */}

            <section className="bill-dashboard__popular container" id="bill-popular-target">
                <PopularBiller onClickTitleBtn={handleSeeAllBtn} onClickCard={handleClickFromPopularBiller} />
            </section>
        </>
    );
};

export default MyAccount;
