# 1.2.10
## Features Added
- CRM - integrated comment module with tickets, contacts, etc.
- CRM - assign to group
- Report scheduling
- Phone number configuration to .env
- Enable/Disable dialing modes from .env

## Bugs Fixed
- Retain campaign page state on refresh

## New Env Variables

- `REACT_APP_CAMPAIGN_REFRESH_INTERVAL` Refresh interval for campaign screen in seconds.
- `REACT_APP_SCHEDULED_REPORTS` 1 of enable report scheduling
- `REACT_APP_GET_LOGIN_TIME_FROM_3CX` 1 for get login time based on 3CX status change, 0 for get login time based on Uniconnect Login
- `REACT_APP_DIALING_MODES='1,2,3'` Enable dialing modes. 1 = Predictive, 2 = Preview, 3 = Power
REACT_APP_DIALING_MODES='1,2,3'

### Phone Number Support
- `REACT_APP_LOCAL_PHONE_NUMBER_LENTGH` Length of local phone numbers, without country code or leading 0, default = 9
- `REACT_APP_LOCAL_PHONE_NUMBER_PREFIX` Prefix for local phone numbers, default = '94'
- `REACT_APP_SUPPORT_IDD_NUMBERS` 1 for supporting international numbers
- `REACT_APP_LOCAL_PHONE_REGEX` Regex for local phone number validation in string format, without leading and trailing slash. Default to Sri Lankan numbers.