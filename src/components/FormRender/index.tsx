import React from 'react';
import { Form, Input, InputProps, InputRef } from 'antd';

interface IFormRenderProps {
    formData: any;
}

export interface IItemFormProps {
    type: string;
    name: string;
    addClass?: string;
    rules?: any;
    options: InputProps & React.RefAttributes<InputRef>;
}

const FormRender: React.FC<IFormRenderProps> = ({ formData }) => {
    return formData.map((item: IItemFormProps, key: number) => {
        let fieldItem = null;
        switch (item.type) {
            case 'text':
                fieldItem = (
                    <Form.Item className={`biller-form__input ${item.addClass}`} name={item?.name ?? ''} rules={item?.rules ?? ''}>
                        <Input {...item?.options} />
                    </Form.Item>
                );
                break;
            default:
                break;
        }

        return <React.Fragment key={key}>{fieldItem}</React.Fragment>;
    });
};

export default FormRender;
