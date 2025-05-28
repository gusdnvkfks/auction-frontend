import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const useRemainingTime = (endTime) => {
    const [remainingText, setRemainingText] = useState('');

    useEffect(() => {
        if(!endTime) return;

        const isManual = endTime === '9999-12-31T23:59:59.000Z';
        if(isManual) {
            setRemainingText('수동마감');
            return;
        }

        const updateRemaining = () => {
            const now = dayjs();
            const end = dayjs.utc(endTime).local();
            const diffMs = end.diff(now);

            if (diffMs <= 1000) {
                setRemainingText('경매 마감됨');
                return;
            }

            const diffSeconds = Math.floor(diffMs / 1000);
            const diffMinutes = Math.floor(diffSeconds / 60);
            const diffHours = Math.floor(diffMinutes / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffMinutes < 60) {
                const m = String(diffMinutes).padStart(2, '0');
                const s = String(diffSeconds % 60).padStart(2, '0');
                setRemainingText(`${m}분 ${s}초 전`);
            }else if (diffHours < 24) {
                setRemainingText(`${diffHours}시간 전`);
            }else {
                setRemainingText(`${diffDays}일 전`);
            }
        };

        updateRemaining();
        const timer = setInterval(updateRemaining, 1000);

        return () => clearInterval(timer);
    }, [endTime]);

    return remainingText;
};

export default useRemainingTime;