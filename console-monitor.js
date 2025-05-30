// 控制台日志监控工具
// 在浏览器开发者工具中运行此脚本来监控应用日志

console.log('🔍 开始监控 Node App Manager 控制台日志...');

// 保存原始的 console 方法
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;
const originalInfo = console.info;

// 创建日志历史
window.logHistory = window.logHistory || [];

// 重写 console 方法以捕获日志
console.log = function(...args) {
    window.logHistory.push({ type: 'log', time: new Date().toISOString(), args });
    originalLog.apply(console, ['📋 LOG:', ...args]);
};

console.error = function(...args) {
    window.logHistory.push({ type: 'error', time: new Date().toISOString(), args });
    originalError.apply(console, ['❌ ERROR:', ...args]);
};

console.warn = function(...args) {
    window.logHistory.push({ type: 'warn', time: new Date().toISOString(), args });
    originalWarn.apply(console, ['⚠️ WARN:', ...args]);
};

console.info = function(...args) {
    window.logHistory.push({ type: 'info', time: new Date().toISOString(), args });
    originalInfo.apply(console, ['ℹ️ INFO:', ...args]);
};

// 监控未捕获的错误
window.addEventListener('error', (event) => {
    console.error('未捕获的错误:', event.error);
});

// 监控未捕获的 Promise 拒绝
window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的 Promise 拒绝:', event.reason);
});

// 提供查看日志历史的方法
window.showLogHistory = function(type = null) {
    const filtered = type ? 
        window.logHistory.filter(log => log.type === type) : 
        window.logHistory;
    
    console.table(filtered.map(log => ({
        时间: log.time,
        类型: log.type,
        消息: log.args.join(' ')
    })));
};

console.log('✅ 控制台监控已启用');
console.log('💡 使用 showLogHistory() 查看所有日志');
console.log('💡 使用 showLogHistory("error") 查看错误日志');
