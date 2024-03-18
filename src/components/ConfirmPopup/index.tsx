import React from 'react';
import { Modal } from 'antd';
import './index.scss';

interface IConfirmPopupProps {
    onConfirm: (data: boolean) => void;
    visibleModal: boolean;
    children: React.ReactNode;
    customClass?: string;
}

const ConfirmPopup: React.FC<IConfirmPopupProps> = ({ children, onConfirm, visibleModal = false, customClass }) => {
    return (
        <div>
            <Modal
                visible={visibleModal}
                title={null}
                closable={false}
                footer={null}
                onOk={() => onConfirm(true)}
                onCancel={() => onConfirm(false)}
                maskClosable={false}
                bodyStyle={{ height: '100%' }}
                width={'100%'}
                className={`confirm-popup-bpt ${customClass}`}
                wrapClassName="confirm-popup-bpt-wrapper"
            >
                {children}
            </Modal>
        </div>
    );
};

export default ConfirmPopup;
