import React from 'react';
import { Radio, RadioChangeEvent, Space } from 'antd';
import intl from 'react-intl-universal';

import Drawer from '../Drawer';

import './index.scss';

interface TransactionByTypeProps {
    onClose: () => void;
    visible: boolean;
    currentType: string;
    onSelectType: (e: RadioChangeEvent) => void;
}

const TransactionFilterByType: React.FC<TransactionByTypeProps> = ({ onClose, visible, currentType, onSelectType }) => {
    const typeArr = [
        {
            id: 0,
            label: intl.get('button.ALL_BUTTON'),
            value: 'All',
        },
        {
            id: 1,
            label: intl.get('title.ADD_BILLER_ELECTRICITY'),
            value: 'Electricity',
        },
        {
            id: 2,
            label: intl.get('title.ADD_BILLER_WATER'),
            value: 'Water',
        },
    ];

    return (
        <Drawer title={intl.get('title.TRANSACTION_FILTER_BY_CAT_TITLE')} onClose={onClose} visible={visible} closable={false} className="type-filter__drawer">
            <Radio.Group value={currentType} onChange={onSelectType}>
                <Space direction="vertical" size={'large'}>
                    {typeArr.map((item) => (
                        <Radio value={item.value} key={item.id}>
                            {item.label}
                        </Radio>
                    ))}
                </Space>
            </Radio.Group>
        </Drawer>
    );
};

export default TransactionFilterByType;
