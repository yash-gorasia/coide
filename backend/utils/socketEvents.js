const ACTIONS = {
    JOIN: 'join',
    JOINED: 'joined',
    NEW_USER_JOINED: 'new-user-joined',
    DISCONNECTED: 'disconnected',
    SYNC_CODE: 'sync-code',
    CODE_CHANGE: 'code-change',
    CODE_EXECUTION_RESULT: 'code-execution-result',

    // File Management Events
    FILE_CREATED: 'file-created',
    FILE_UPDATED: 'file-updated',
    FILE_DELETED: 'file-deleted',
    FILE_OPENED: 'file-opened',
    SYNC_FILES: 'sync-files',

    // WebRTC Events
    CALL_USER: 'call-user',
    INCOMING_CALL: 'incoming-call',
    CALL_ACCEPTED: 'call-accepted',

    // events for ICE candidates
    ICE_CANDIDATE: 'ice-candidate',
    ADD_ICE_CANDIDATE: 'add-ice-candidate'
}

export default ACTIONS;