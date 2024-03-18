import React, { useCallback, ChangeEvent, forwardRef, startTransition } from 'react';
import { Input, InputRef, InputProps } from 'antd';
import { DEBOUNCE_SEARCH_TIME } from '../../constants';
import { SearchSVG } from '../../allSvg';
import './index.scss';
import { debounce } from '../../utils/common';

type SearchInputProps = {
    placeholder: string;
    debounceTime?: number;
    debounceMode?: boolean;
    onSearch: (searchText: string) => void;
    openPrefixIcon?: boolean;
};

const SearchInput: React.ForwardRefRenderFunction<InputRef, SearchInputProps & InputProps> = (
    { placeholder, debounceTime = DEBOUNCE_SEARCH_TIME, onSearch, openPrefixIcon = true, debounceMode = true, ...props },
    ref,
) => {
    const debouncedSearch = useCallback(
        debounce((nextValue) => onSearch(nextValue), debounceTime),
        [onSearch],
    );

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        debounceMode
            ? debouncedSearch(e.target.value)
            : startTransition(() => {
                  onSearch(e.target.value);
              });
    };

    return <Input {...props} placeholder={placeholder} prefix={openPrefixIcon ? <SearchSVG /> : ''} className="search-box" onChange={handleChange} ref={ref} />;
};

export default forwardRef(SearchInput);
