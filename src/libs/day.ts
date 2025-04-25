import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

// 擴充插件
dayjs.extend(utc);
dayjs.extend(timezone);

// 設定預設時區為 Asia/Taipei
dayjs.tz.setDefault('Asia/Taipei');
