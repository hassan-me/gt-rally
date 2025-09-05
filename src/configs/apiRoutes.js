export default {
    USER: {
      PROFILE: 'user/info',
      REGISTER_FCM_TOKEN: 'user/register_fcm_token',
    },
    AUTH: {
      SSO: 'auth_sso',
      LOGIN: 'signin',
      SIGN_UP: 'signup',
    },
    // RALLY: {
    //   BASE: 'rally',
    //   PUBLIC: 'public_rallies',
    //   CHECKPOINTS: 'checkpoint',
    //   GENERATE_ROUTE: 'generate_route',
    // },
    EVENT: {
      BASE: 'v1/events',
      MY_EVENTS: 'v1/events',
      CHECKPOINTS: 'checkpoint',
      PUBLIC: 'v1/events_web/public',
      GENERATE_ROUTE: 'generate_route',
      UPDATE_CHECKPOINT_ORDER: 'v1/events/update_checkpoint_order',
    },
    MAP: {
      GEOCODING: 'geocoding/v5/mapbox.places',
      DIRECTIONS: 'directions/v5/mapbox/driving',
      SEARCH_SUGGEST: 'search/searchbox/v1/suggest',
      SEARCH_RETRIEVE: 'search/searchbox/v1/retrieve',
    },
    GARAGE: {
      GARAGE: 'garage',
    },
    // RALLY_INVITES: {
    //   ACCEPTED: 'accepted',
    //   GET_RALLY_INVITES: 'invites',
    //   ACCEPT_REJECT_INVITE: 'invite',
    //   GET_RALLY_PARTICIPANTS: 'participants',
    //   GET_USER_RALLY_INVITES: 'invites_with_user_rallies',
    // },
    // INVITE_DRIVERS: {
    //   ALL_USERS: 'invites/all_users',
    //   INVITE_DRIVERS: 'send_invite_to_drivers',
    //   PREVIOUS_DRIVERS: 'drivers_from_prev_rallies',
    // },
    // USER_INVITES: {
    //   RALLY_INVITES: 'user_invites_from_rally_master',
    // },
    // NOTIFICATION: {
    //   NOTIFICATIONS: 'notifications',
    // },
  };