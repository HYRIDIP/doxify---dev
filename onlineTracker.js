const onlineUsers = new Map();
const ONLINE_TIMEOUT = 5 * 60 * 1000; // 5 минут

function trackOnlineUser(req) {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    const identifier = `${ip}-${userAgent}`;
    
    onlineUsers.set(identifier, {
        ip: ip,
        userAgent: userAgent,
        lastSeen: Date.now(),
        userId: req.session.user ? req.session.user.id : null,
        username: req.session.user ? req.session.user.username : 'Guest'
    });
    
    // Очистка устаревших записей
    cleanupOnlineUsers();
}

function cleanupOnlineUsers() {
    const now = Date.now();
    for (const [key, user] of onlineUsers.entries()) {
        if (now - user.lastSeen > ONLINE_TIMEOUT) {
            onlineUsers.delete(key);
        }
    }
}

function getOnlineCount() {
    cleanupOnlineUsers();
    return onlineUsers.size;
}

function getOnlineUsers() {
    cleanupOnlineUsers();
    return Array.from(onlineUsers.values());
}

module.exports = {
    trackOnlineUser,
    getOnlineCount,
    getOnlineUsers
};
