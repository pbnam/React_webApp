import makeRequest from '../..';
import { BASE_API_BPT_URL } from '../../../constants';
import { ICancelToken } from '../../interface';

export interface IDataUpdateReminder extends ICancelToken {
    dayOfMonth: number;
    dayOfWeek: number;
    period: reminderPeriod;
}

// eslint-disable-next-line no-unused-vars
export enum reminderPeriod {
    // eslint-disable-next-line no-unused-vars
    WEEKLY = 'WEEKLY',
    // eslint-disable-next-line no-unused-vars
    MONTHLY = 'MONTHLY',
}

export const updateBillReminderApi = ({ cancelToken, ...data }: IDataUpdateReminder, reminderId: string) => {
    const url = `${BASE_API_BPT_URL}/custom-reminders/${reminderId}`;
    return makeRequest<any>({ url, method: 'PATCH', data, cancelToken });
};
