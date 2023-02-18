const { mode } = import.meta.env

export const URL_PREFIX = (mode === 'development' ?
    (location.protocol + '//' + location.hostname + ':9999' +
        '/.netlify/functions') :
    '/api')

export const APP_INFO = {
    name: 'hermes',
    creator: 'snail-situation'
}

export const LOG_DIR_PATH = 'log'
export const BLOB_DIR_PATH = 'blob'
export const PROFILE_PATH = 'profile.json'
export const AVATAR_PATH = 'avatar.jpeg'
export const FRIENDS_PATH = 'friends.json'

export default {
    FRIENDS_PATH,
    AVATAR_PATH,
    PROFILE_PATH,
    LOG_DIR_PATH,
    BLOB_DIR_PATH,
    URL_PREFIX,
    APP_INFO
}
