import React, { MutableRefObject, useMemo, useRef } from 'react';
import { Input, InputProps, InputRef } from 'antd';

const FloatInput: React.FC<InputProps> = ({ className, ...props }) => {
    const inputRef = useRef() as MutableRefObject<InputRef>;

    let maxLength = useRef<number | null>(props.maxLength ?? null);

    const addClass = useMemo(() => className + (props.value ? ' ant-input-has-value' : ''), [props.value]);

    // fix error maxLength attr for android browsers
    const handleOnMaxlengthInput = (event: any) => {
        if (maxLength.current && event.target.value.length > maxLength.current) {
            event.target.value = event.target.value.slice(0, maxLength.current);

            if (props.showCount) {
                let countHtml = inputRef.current?.input?.parentElement?.querySelector('.ant-input-show-count-suffix') as HTMLElement;
                countHtml.innerText = `${event.target.value.length} / ${maxLength.current}`;
            }
        }
    };

    return <Input {...props} ref={inputRef} className={addClass} onKeyUp={handleOnMaxlengthInput} onKeyDown={handleOnMaxlengthInput} onInput={handleOnMaxlengthInput} />;
};

export default FloatInput;
