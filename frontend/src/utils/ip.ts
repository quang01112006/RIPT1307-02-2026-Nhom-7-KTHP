const ipRoot = APP_CONFIG_IP_ROOT; // ip dev

// Ip Chính => Mặc định dùng trong các useInitModel
declare const APP_CONFIG_BACKEND_URL: string;
const ip3 = typeof APP_CONFIG_BACKEND_URL !== 'undefined' && APP_CONFIG_BACKEND_URL ? APP_CONFIG_BACKEND_URL : '/api';

// Ip khác
const ipNotif = ipRoot + 'notification'; // ip dev
const ipSlink = ipRoot + 'slink'; // ip dev

export { ip3, ipNotif, ipSlink };
