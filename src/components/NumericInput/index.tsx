import React from 'react';
import { InputNumber, InputNumberProps } from 'antd';
import { CURRENCY_CURRENT, MAX_PAYMENT_AMOUNT } from '../../constants';

interface INumericInput extends InputNumberProps {}

const NumericInput: React.FC<INumericInput> = ({ ...props }) => {
    // Convert currency input from text input number
    // Example 1,234,567.89 to 1234567.89
    const currencyParser = (val: any) => {
        try {
            // for when the input gets clears
            if (typeof val === 'string' && !val.length) {
                val = '';
            }

            // detecting and parsing between comma and dot
            var group = new Intl.NumberFormat('en-US').format(1111).replace(/1/g, '');
            var decimal = new Intl.NumberFormat('en-US').format(1.1).replace(/1/g, '');
            var reversedVal = val.replace(new RegExp('\\' + group, 'g'), '');
            reversedVal = reversedVal.replace(new RegExp('\\' + decimal, 'g'), '.');
            //  => 1232.21 €

            // removing everything except the digits and dot
            reversedVal = reversedVal.replace(/[^0-9.]/g, '');
            //  => 1232.21

            // appending digits properly
            const digitsAfterDecimalCount = (reversedVal.split('.')[1] || []).length;
            reversedVal = reversedVal * Math.pow(10, digitsAfterDecimalCount - 2);

            return Number.isNaN(reversedVal) ? 0 : reversedVal;
        } catch (error) {
            console.error(error);
        }
    };

    const currencyFormatter = (value: any) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: CURRENCY_CURRENT,
        })
            .format(value)
            .slice(4);
    };

    const handleOnMaxlengthInput = (event: any) => {
        if (event.target?.value?.length > 14) {
            event.target.value = event.target.value.slice(0, 14);
            event.target.value = currencyFormatter(MAX_PAYMENT_AMOUNT);
        }
    };

    return (
        <InputNumber
            {...props}
            formatter={currencyFormatter}
            parser={currencyParser}
            bordered={false}
            max={MAX_PAYMENT_AMOUNT}
            onKeyUp={handleOnMaxlengthInput}
            onKeyDown={handleOnMaxlengthInput}
            onInput={handleOnMaxlengthInput}
            inputMode="numeric"
        />
    );
};

export default NumericInput;
