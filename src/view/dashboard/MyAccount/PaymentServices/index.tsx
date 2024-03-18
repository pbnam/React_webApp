import React, { useCallback, useMemo } from 'react';
import { WaterSVG, ElectricSVG, AllSVG } from '../../../../allSvg';
import './index.scss';
import intl from 'react-intl-universal';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../redux';
import { EnumBillerCatType } from '../../../../api/biller/interface';

export interface IPaymentList {
    icon: any;
    name: string;
    url: string;
}

interface IPaymentServices {
    onClick: (payload: IPaymentList) => void;
}

const PaymentServices: React.FC<IPaymentServices> = ({ onClick }) => {
    const { billerCat } = useSelector((state: RootState) => state.biller);

    const findCatUrl = useCallback((name: string) => {
        const id = billerCat.find((item) => item.categoryName.toLowerCase().includes(name))?.categoryId || name;
        return `/sebiller/${id}`;
    }, []);

    const paymentList = useMemo(
        () => [
            {
                icon: <ElectricSVG />,
                name: intl.get('title.ADD_BILLER_ELECTRICITY'),
                url: findCatUrl(EnumBillerCatType.electricity),
            },
            {
                icon: <WaterSVG />,
                name: intl.get('title.ADD_BILLER_WATER'),
                url: findCatUrl(EnumBillerCatType.water),
            },
            {
                icon: <AllSVG />,
                name: intl.get('title.ADD_BILLER_MORE'),
                url: findCatUrl(EnumBillerCatType.all),
            },
        ],
        [],
    );

    return (
        <ul className="bill-payment-categories row-flex">
            {paymentList.map((item, index) => {
                return (
                    <li className="payment-item col-flex-4" key={index}>
                        <div className="payment-item__inner">
                            {item.icon}
                            <h5 className="payment-item__name">{item.name}</h5>
                            {item.url && <a onClick={() => onClick(item)}></a>}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};

export default PaymentServices;
