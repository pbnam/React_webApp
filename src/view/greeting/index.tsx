import React from 'react';
import intl from 'react-intl-universal';

import BillButton, { sizeButton } from '../../components/Button';
import { ObBoardingImg } from '../../constants/ImgAsset';
import './index.scss';

interface GreetingProps {
    onClose: () => void;
}

const Greeting: React.FC<GreetingProps> = ({ onClose }) => {
    return (
        <div className="bill-greeting page-bg-light">
            <div className="bill-greeting__img">
                <img src={ObBoardingImg} />
            </div>
            <div className="bill-greeting__content container">
                <div className="greeting-summary">
                    <h2 className="greeting-title">{intl.get('title.GREETING_TITLE')}</h2>
                    <div className="greeting-desc">{intl.get('desc.GREETING_DESC')}</div>
                </div>
                <BillButton fullWidth size={sizeButton.sizeXL} onClick={onClose}>
                    {intl.get('button.GREETING_BUTTON')}
                </BillButton>
            </div>
        </div>
    );
};

export default Greeting;
