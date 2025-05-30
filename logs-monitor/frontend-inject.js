// 自动前端日志监控
console.log('🤖 前端日志监控已激活');
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;
console.log = (...args) => { originalLog('🔍 LOG:', ...args); };
console.error = (...args) => { originalError('❌ ERROR:', ...args); };
console.warn = (...args) => { originalWarn('⚠️ WARN:', ...args); };
window.addEventListener('error', e => console.error('未捕获错误:', e.error));
window.addEventListener('unhandledrejection', e => console.error('Promise拒绝:', e.reason));
