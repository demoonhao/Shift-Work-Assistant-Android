const CACHE_NAME = 'wife-shift-clock-v9';
const ASSETS = [
  'index.html',
  'manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdn-icons-png.flaticon.com/512/2997/2997155.png'
];

// 安装阶段：缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 使用相对路径进行缓存，自动适配子目录
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// 激活阶段：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 策略：网络优先，失败则降级到缓存
// 这能防止 Service Worker 在路径匹配错误时“投毒”返回 404
self.addEventListener('fetch', (event) => {
  // 只处理 GET 请求
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 如果网络请求成功，克隆一份存入缓存（可选，此处保持简单直接返回）
        return response;
      })
      .catch(() => {
        // 网络失败时（离线），尝试从缓存中匹配
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          
          // 如果是页面导航请求且没缓存，返回首页缓存
          if (event.request.mode === 'navigate') {
            return caches.match('index.html');
          }
        });
      })
  );
});