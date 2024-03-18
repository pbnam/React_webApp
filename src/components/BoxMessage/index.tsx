import React from 'react';
import { CloseSVG } from '../../allSvg';
import './index.scss';

interface BoxMessageProps {
    onClickBox?: () => void;
    onCloseBtn: () => void;
    status?: 'default' | 'warning';
    content: string;
    id?: string;
}

const BoxMessage: React.FC<BoxMessageProps> = ({ onClickBox, onCloseBtn, status = 'default', content, id }) => {
    return (
        <div id={id} className={`bill-box-message bill-box-message--${status}`} onClick={onClickBox}>
            <div className="bill-box-message__inner container">
                <h4 className="box-title">{content}</h4>
                <div className="box-btn" onClick={onCloseBtn}>
                    <CloseSVG />
                </div>
            </div>
        </div>
    );
};

export default BoxMessage;
