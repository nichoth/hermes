const { mode } = import.meta.env
const urlPrefix = (mode === 'development' ?
    (location.protocol + '//' + location.hostname + ':9999' +
        '/.netlify/functions') :
    '/api')

export const URL_PREFIX = urlPrefix

export default {
    avatarPath: 'avatar.jpg',
    profilePath: 'profile.json',
    logDirPath: 'log',
    blobDirPath: 'blob',
    URL_PREFIX: urlPrefix
}
