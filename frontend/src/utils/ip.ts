const ipRoot = APP_CONFIG_IP_ROOT; // ip dev

// Ip Chính => Mặc định dùng trong các useInitModel
// const ip3 = ipRoot + 'slink'; // ip dev
const ip3 = '/api';

// Ip khác
const ipNotif = ipRoot + 'notification'; // ip dev
const ipSlink = ipRoot + 'slink'; // ip dev

const currentRole = typeof window !== 'undefined' ? localStorage.getItem('currentRole') || '' : '';
const oneSignalClient = typeof window !== 'undefined' ? APP_CONFIG_ONE_SIGNAL_ID ?? '' : '';
const oneSignalRole = currentRole;
const sentryDSN = typeof window !== 'undefined' ? APP_CONFIG_SENTRY_DSN ?? '' : '';
const keycloakAuthority = typeof window !== 'undefined' ? APP_CONFIG_KEYCLOAK_AUTHORITY ?? '' : '';
const keycloakClientID = typeof window !== 'undefined' ? APP_CONFIG_PREFIX_OF_KEYCLOAK_CLIENT_ID ?? '' : '';

export {
	ip3,
	ipNotif,
	ipSlink,
	currentRole,
	oneSignalClient,
	oneSignalRole,
	sentryDSN,
	keycloakAuthority,
	keycloakClientID,
};
