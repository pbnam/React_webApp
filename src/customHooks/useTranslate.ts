import { useMemo, useState } from 'react';
import intl from 'react-intl-universal';
import { CURRENT_LANGUAGE, LANGUAGE_SUPPORT } from '../constants';
import locales from '../locales';
import { getCookie } from '../utils/storage';

const useTranslate = () => {
    const [initLocalesCompleted, setInitLocalesCompleted] = useState(false);

    const loadLocales = async () => {
        try {
            let currentLocale: string = LANGUAGE_SUPPORT.includes(getCookie('language')?.toLowerCase() as string)
                ? (getCookie('language')?.toLowerCase() as string)
                : CURRENT_LANGUAGE;
            await intl.init({ currentLocale, locales });
        } catch (err) {
            console.error(err);
        } finally {
            setInitLocalesCompleted(true);
        }
    };

    const currentLanguage = useMemo(() => intl.getInitOptions().currentLocale?.toLowerCase(), [initLocalesCompleted]);

    return { currentLanguage, initLocalesCompleted, loadLocales };
};

export default useTranslate;
