/**
 * Service Worker for PWA functionality
 * Provides offline support and caching
 */

const CACHE_NAME = 'personality-test-v1.0.0';
const STATIC_CACHE_URLS = [
    '/',
    '/index.html',
    '/js/data.js',
    '/js/calculator.js',
    '/js/storage.js',
    '/js/imageGenerator.js',
    '/js/app.js',
    '/manifest.json'
];

const DYNAMIC_CACHE_NAME = 'personality-test-dynamic-v1.0.0';

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_CACHE_URLS);
            })
            .then(() => {
                console.log('Static assets cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Failed to cache static assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    event.respondWith(
        caches.match(request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    console.log('Serving from cache:', request.url);
                    return cachedResponse;
                }
                
                console.log('Fetching from network:', request.url);
                return fetch(request)
                    .then(networkResponse => {
                        // Clone the response as it can only be consumed once
                        const responseClone = networkResponse.clone();
                        
                        // Cache successful responses
                        if (networkResponse.status === 200) {
                            caches.open(DYNAMIC_CACHE_NAME)
                                .then(cache => {
                                    cache.put(request, responseClone);
                                });
                        }
                        
                        return networkResponse;
                    })
                    .catch(error => {
                        console.error('Network request failed:', error);
                        
                        // Return offline page or fallback response
                        if (request.destination === 'document') {
                            return caches.match('/index.html');
                        }
                        
                        // Return empty response for other requests
                        return new Response('', {
                            status: 408,
                            statusText: 'Request Timeout'
                        });
                    });
            })
    );
});

// Background sync for saving test results when online
self.addEventListener('sync', event => {
    console.log('Background sync event:', event.tag);
    
    if (event.tag === 'save-test-result') {
        event.waitUntil(
            syncTestResults()
        );
    }
});

// Push notifications (if needed in the future)
self.addEventListener('push', event => {
    console.log('Push notification received:', event);
    
    const options = {
        body: '您的人格测试结果已准备就绪！',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
        },
        actions: [
            {
                action: 'explore',
                title: '查看结果',
                icon: '/icon-explore.png'
            },
            {
                action: 'close',
                title: '关闭',
                icon: '/icon-close.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('人格测试', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
    console.log('Notification click received:', event);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Helper function to sync test results
async function syncTestResults() {
    try {
        // Get pending results from IndexedDB or localStorage
        const pendingResults = await getPendingResults();
        
        if (pendingResults.length === 0) {
            console.log('No pending results to sync');
            return;
        }
        
        console.log(`Syncing ${pendingResults.length} pending results`);
        
        // Process each pending result
        for (const result of pendingResults) {
            try {
                // In a real app, you might send to a server
                // For now, just mark as synced in local storage
                await markResultAsSynced(result.id);
                console.log('Result synced:', result.id);
            } catch (error) {
                console.error('Failed to sync result:', result.id, error);
            }
        }
        
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Helper function to get pending results
async function getPendingResults() {
    // This would typically read from IndexedDB
    // For now, return empty array as we're using localStorage
    return [];
}

// Helper function to mark result as synced
async function markResultAsSynced(resultId) {
    // This would typically update IndexedDB
    // For now, just log the action
    console.log('Marking result as synced:', resultId);
}

// Error handler
self.addEventListener('error', event => {
    console.error('Service Worker error:', event.error);
});

// Unhandled rejection handler
self.addEventListener('unhandledrejection', event => {
    console.error('Service Worker unhandled rejection:', event.reason);
});

console.log('Service Worker loaded successfully');