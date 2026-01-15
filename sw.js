const CACHE_NAME = 'wife-shift-clock-v11';

// 仅缓存最基础的 Shell 文件
const PRE_CACHE = [
  './index.html',
  './manifest.json',
  'https://cdn-icons-png.flaticon.com/512/2997/2997155.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRE_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    ))
  );
  self.clients.claim();
});

// 核心：网络优先策略。如果网络通畅，永远不从缓存拿旧文件。
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 如果是有效响应且是本站资源，动态更新缓存
        if (response && response.status === 200 && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => {
        // 只有在彻底断网（fetch 报错）时才查缓存
        return caches.match(event.request).then((resp) => {
          if (resp) return resp;
          // 如果是页面跳转且没网，返回首页
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});