import React, { useState } from 'react';
import intl from 'react-intl-universal';

import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Drawer from '../Drawer';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { CalendarPickerView } from '@mui/x-date-pickers';
import { ArrowLeftSVG, ChevronDownSVG, ChevronSVG } from '../../allSvg';

import './index.scss';
import moment from 'moment';
import BillButton, { sizeButton } from '../Button';
import { DateRange, QuickFilter } from '../../view/transaction';
import { DATE_FROM_API_FORMAT, TIME_RANGE_BETWEEN_TRANSACTION, YEAR_RANGE_FILTER } from '../../constants';
import { PickersActionBarProps } from '@mui/x-date-pickers/PickersActionBar';
import DialogActions from '@mui/material/DialogActions/DialogActions';

const MyActionBar = ({ onAccept, onCancel }: PickersActionBarProps) => {
    return (
        <DialogActions className="date-filter__action-bar">
            <BillButton hasOutline onClick={onCancel}>
                {intl.get('text.CANCEL_TEXT')}
            </BillButton>
            <BillButton onClick={onAccept}> {intl.get('text.APPLY_TEXT')} </BillButton>
        </DialogActions>
    );
};

interface TransactionFilterByDateProps {
    onClose: () => void;
    onConfirmFilter: () => void;
    onSelectQuickFilter: (index: number) => void;
    quickFilter: QuickFilter[];
    visible: boolean;
    onSelectStartDate: (date: moment.Moment | null) => void;
    onSelectEndDate: (date: moment.Moment | null) => void;
    selectedDatePicker: DateRange;
    enableReset: boolean;
    enableConfirm: boolean;
    onResetFilter: () => void;
}

const dateFormat = 'D MMM YYYY';

const TransactionFilterByDate: React.FC<TransactionFilterByDateProps> = ({
    onClose,
    visible,
    onConfirmFilter,
    quickFilter,
    onSelectQuickFilter,
    onSelectStartDate,
    onSelectEndDate,
    selectedDatePicker,
    enableReset,
    enableConfirm,
    onResetFilter,
}) => {
    const [isYearDialogOpening, setIsYearDialogOpening] = useState<boolean>(false);
    const disabledStartDate = (current: moment.Moment) => {
        const currentEndDate = selectedDatePicker.endDate;
        // Can not select days before today and today
        if (!currentEndDate) {
            return current && current < moment().subtract(YEAR_RANGE_FILTER, 'years').startOf('day');
        }

        return (
            current &&
            (current > moment(currentEndDate, DATE_FROM_API_FORMAT).endOf('day') ||
                current < moment(currentEndDate).subtract(TIME_RANGE_BETWEEN_TRANSACTION, 'days').startOf('day'))
        );
    };

    const disabledEndDate = (current: moment.Moment) => {
        const currentStartDate = selectedDatePicker.startDate;
        // Can not select days before today and today
        if (!currentStartDate) {
            return current && current < moment().subtract(YEAR_RANGE_FILTER, 'years').startOf('day');
        }

        return (
            current &&
            (current < moment(currentStartDate, DATE_FROM_API_FORMAT).startOf('day') ||
                current > moment(currentStartDate, DATE_FROM_API_FORMAT).add(TIME_RANGE_BETWEEN_TRANSACTION, 'days').endOf('day'))
        );
    };

    const disabledStartYear = (current: moment.Moment) => {
        const currentEndDate = selectedDatePicker.endDate;
        // Can not select days before today and today
        if (!currentEndDate) {
            return current && (current.year() > moment().year() || current.year() < moment().subtract(YEAR_RANGE_FILTER, 'years').year());
        }

        return (
            current &&
            (current.year() > moment(currentEndDate, DATE_FROM_API_FORMAT).year() ||
                current.year() < moment(currentEndDate, DATE_FROM_API_FORMAT).subtract(TIME_RANGE_BETWEEN_TRANSACTION, 'days').year() ||
                current.year() > moment().year())
        );
    };

    const disabledEndYear = (current: moment.Moment) => {
        const currentStartDate = selectedDatePicker.startDate;
        // Can not select days before today and today
        if (!currentStartDate) {
            return current && (current.year() > moment().year() || current.year() < moment().subtract(YEAR_RANGE_FILTER, 'years').year());
        }

        return (
            current &&
            (current.year() < moment(currentStartDate, DATE_FROM_API_FORMAT).year() ||
                current.year() > moment(currentStartDate, DATE_FROM_API_FORMAT).add(TIME_RANGE_BETWEEN_TRANSACTION, 'days').year() ||
                current.year() > moment().year())
        );
    };

    const handleRenderInput = (params: TextFieldProps) => (
        <TextField
            variant="standard"
            size="small"
            {...params}
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <ChevronSVG className="date-filter__range--icon" />
                    </InputAdornment>
                ),
            }}
        />
    );

    return (
        <LocalizationProvider dateAdapter={AdapterMoment}>
            <Drawer
                title={intl.get('title.TRANSACTION_FILTER_BY_DATE_TITLE')}
                onClose={() => {
                    setIsYearDialogOpening(false);
                    onClose();
                }}
                visible={visible}
                className="date-filter__drawer"
                closable={false}
                icon={
                    <div className={`date-filter__drawer-reset ${enableReset ? 'date-filter__drawer-reset--enable' : ''}`} onClick={onResetFilter}>
                        {intl.get('text.RESET_TEXT')}
                    </div>
                }
            >
                <div className="date-filter__button-wrapper">
                    {quickFilter.map((filter, index) => {
                        return (
                            <BillButton
                                size={sizeButton.sizeXL}
                                onClick={() => onSelectQuickFilter(index)}
                                key={index}
                                className={filter.isActive ? 'date-filter__button--active' : ''}
                            >
                                {filter.text}
                            </BillButton>
                        );
                    })}
                </div>
                <div className="date-filter__text">{intl.get('desc.TRANSACTION_FILTER_DRAWER_DESC')}</div>
                <div className="date-filter__range--wrapper">
                    <MobileDatePicker
                        label={intl.get('text.START_DATE_TEXT')}
                        DialogProps={{ className: `date-filter__dialog ${isYearDialogOpening ? 'date-filter__dialog-year' : ''} ` }}
                        className="date-filter__range--input"
                        value={selectedDatePicker.startDate}
                        onChange={(e: any) => {
                            onSelectStartDate(e);
                        }}
                        onClose={() => {
                            setIsYearDialogOpening(false);
                        }}
                        disableHighlightToday
                        shouldDisableDate={disabledStartDate}
                        shouldDisableYear={disabledStartYear}
                        disableFuture={true}
                        showDaysOutsideCurrentMonth={true}
                        showToolbar={false}
                        components={{ SwitchViewIcon: ChevronDownSVG, ActionBar: MyActionBar }}
                        onViewChange={(view: CalendarPickerView) => {
                            if (view === 'year') setIsYearDialogOpening(true);
                            else setIsYearDialogOpening(false);
                        }}
                        renderInput={(params) => handleRenderInput(params)}
                        inputFormat={dateFormat}
                    />
                    <ArrowLeftSVG className="date-filter__range--to" />
                    <MobileDatePicker
                        label={intl.get('text.END_DATE_TEXT')}
                        DialogProps={{ className: `date-filter__dialog ${isYearDialogOpening ? 'date-filter__dialog-year' : ''} ` }}
                        className="date-filter__range--input"
                        value={selectedDatePicker.endDate}
                        onChange={(e: any) => {
                            onSelectEndDate(e);
                        }}
                        onClose={() => {
                            setIsYearDialogOpening(false);
                        }}
                        disableHighlightToday
                        shouldDisableDate={disabledEndDate}
                        shouldDisableYear={disabledEndYear}
                        disableFuture={true}
                        showDaysOutsideCurrentMonth={true}
                        showToolbar={false}
                        components={{
                            SwitchViewIcon: ChevronDownSVG,
                            ActionBar: MyActionBar,
                        }}
                        onViewChange={(view: CalendarPickerView) => {
                            if (view === 'year') setIsYearDialogOpening(true);
                            else setIsYearDialogOpening(false);
                        }}
                        renderInput={(params) => handleRenderInput(params)}
                        inputFormat={dateFormat}
                    />
                </div>
                <BillButton fullWidth size={sizeButton.sizeXL} onClick={onConfirmFilter} className={`${!enableConfirm ? 'date-filter__confirm--disabled' : ''}`}>
                    {intl.get('button.CONFIRM_BUTTON')}
                </BillButton>
            </Drawer>
        </LocalizationProvider>
    );
};

export default TransactionFilterByDate;
