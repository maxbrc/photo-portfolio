package api

import (
	"net/http"
	"strings"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

type loginRateLimiter struct {
	mu      sync.Mutex
	clients map[string]*loginClient
	limit   rate.Limit
	burst   int
	ttl     time.Duration
}

type loginClient struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

func newLoginRateLimiter(limit rate.Limit, burst int, ttl time.Duration) *loginRateLimiter {
	l := &loginRateLimiter{
		clients: make(map[string]*loginClient),
		limit:   limit,
		burst:   burst,
		ttl:     ttl,
	}
	go l.cleanupLoop()
	return l
}

func (l *loginRateLimiter) limiterFor(ip string) *rate.Limiter {
	l.mu.Lock()
	defer l.mu.Unlock()

	c, ok := l.clients[ip]
	if !ok {
		c = &loginClient{limiter: rate.NewLimiter(l.limit, l.burst)}
		l.clients[ip] = c
	}
	c.lastSeen = time.Now()
	return c.limiter
}

func (l *loginRateLimiter) cleanupLoop() {
	for range time.Tick(l.ttl) {
		l.mu.Lock()
		for ip, c := range l.clients {
			if time.Since(c.lastSeen) > l.ttl {
				delete(l.clients, ip)
			}
		}
		l.mu.Unlock()
	}
}

func clientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		return strings.TrimSpace(strings.Split(xff, ",")[0])
	}
	return r.RemoteAddr
}

func (l *loginRateLimiter) Middleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !l.limiterFor(clientIP(r)).Allow() {
			http.Error(w, "zu viele Anmeldeversuche, bitte warte einen Moment", http.StatusTooManyRequests)
			return
		}
		next(w, r)
	}
}
