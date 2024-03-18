import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './index.scss';
import intl from 'react-intl-universal';

import { BillSvg, AddSvg, HistorySvg } from '../../allSvg';
import { useContextStore } from '../../App';

const Navigation: React.FC = () => {
    const location = useLocation();
    const { handleValidatorFeature } = useContextStore();
    const navigate = useNavigate();

    const navigationOb = useMemo(() => {
        return [
            {
                name: intl.get('navigation.BILLS'),
                icon: <BillSvg />,
                url: '/dashboard',
            },
            {
                name: intl.get('navigation.ADD_BILLER'),
                icon: <AddSvg />,
                url: '/biller',
            },
            {
                name: intl.get('navigation.TRANSACTION'),
                icon: <HistorySvg />,
                url: '/transaction',
            },
        ];
    }, []);

    const handleRequestRedirect = (item: any) => {
        if (item.name === 'Add biller') {
            handleValidatorFeature(() => {
                navigate(item?.url);
            });
        } else {
            navigate(item?.url);
        }
    };
    return (
        <div className="biller-navigation">
            <div className="row-flex">
                {navigationOb.map((item, index) => {
                    const addClass = location.pathname === item.url ? 'active' : '';

                    return (
                        <div className={`navigation-item col-flex-${navigationOb.length} ${addClass}`} key={index}>
                            <a onClick={() => handleRequestRedirect(item)}>
                                <span className="navigation-item__icon">{item.icon}</span>
                                <span className="navigation-item__name">{item.name}</span>
                            </a>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Navigation;
