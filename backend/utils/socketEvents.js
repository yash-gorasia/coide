const ACTIONS = {
    JOIN: 'join',
    JOINED: 'joined',
    NEW_USER_JOINED: 'new-user-joined',
    DISCONNECTED: 'disconnected',
    SYNC_CODE: 'sync-code',
    CODE_CHANGE: 'code-change',
    CODE_EXECUTION_RESULT: 'code-execution-result',

    // WebRTC Events
    CALL_USER: 'call-user',
    INCOMING_CALL: 'incoming-call',
    CALL_ACCEPTED: 'call-accepted',

    // events for ICE candidates
    ICE_CANDIDATE: 'ice-candidate',
    ADD_ICE_CANDIDATE: 'add-ice-candidate'
}

export default ACTIONS;