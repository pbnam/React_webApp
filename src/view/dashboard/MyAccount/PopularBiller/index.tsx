import React from 'react';
import { useSelector } from 'react-redux';
import intl from 'react-intl-universal';
import './index.scss';

import SectionTitle from '../../../../components/SectionTitle';
import { RootState } from '../../../../redux';
import BoxThumbnail from '../../../../components/BoxThumbnail';

interface IPopularBiller {
    onClickTitleBtn: () => void;
    onClickCard: (data: { billerId: string; billerName: string }) => void;
}
const PopularBiller: React.FC<IPopularBiller> = ({ onClickTitleBtn, onClickCard }) => {
    const billerPopularData = useSelector((state: RootState) => state.biller.billerPopularData);

    return (
        <>
            <SectionTitle title={intl.get('title.DASHBOARD_POPULAR_TITLE')} labelButton={intl.get('button.SEE_ALL_BUTTON')} onClick={onClickTitleBtn} />
            <div className="biller-popular-list row-flex">
                {billerPopularData.map((item) => {
                    let payloadClick = {
                        billerId: item?.productId,
                        billerName: item?.productDisplayName,
                    };

                    return (
                        <div key={item.productId} className="popular-card col-flex-2">
                            <div className="popular-card__inner">
                                <BoxThumbnail height="auto" src={item?.providerLogoUrl} />
                                <div className="popular-card__summary">
                                    <h5 className="popular-name">{item?.productDisplayName}</h5>
                                    <p>{item?.categoryName}</p>
                                </div>
                                {/* <span className="popular-card__badge">New</span> */}
                                <div className="popular-card__btn" onClick={() => onClickCard(payloadClick)}></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default PopularBiller;
