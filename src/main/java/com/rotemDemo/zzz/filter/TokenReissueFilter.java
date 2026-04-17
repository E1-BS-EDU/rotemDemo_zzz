package com.rotemDemo.zzz.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

import com.rotemDemo.zzz.lib.common.util.JwtUtil;

public class TokenReissueFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(TokenReissueFilter.class);

    private static final List<String> PUBLIC_PREFIXES = List.of(
            "/login", "/loginOutPage", "/css", "/js", "/img", "/font", "/images",
            "/vendor", "/common", "/favicon", "/error", "/dept"
    );

    private final RestTemplate restTemplate;
    private final String zzzApiUrl;
    private final JwtUtil jwtUtil;

    public TokenReissueFilter(RestTemplate restTemplate, String zzzApiUrl, JwtUtil jwtUtil) {
        this.restTemplate = restTemplate;
        this.zzzApiUrl = zzzApiUrl;
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        if (shouldTryReissue(request)) {
            String refreshToken = getCookieValue(request, "RefreshToken");
            if (refreshToken != null) {
                if (tryReissueAndSetCookie(refreshToken, response)) {
                    log.info("토큰 재발급 성공, 재요청 처리 (URI: {})", request.getRequestURI());
                    response.sendRedirect(request.getRequestURI());
                    return;
                }
                log.warn("토큰 재발급 실패 → /login 리다이렉트");
                response.sendRedirect("/login");
                return;
            }
        }

        chain.doFilter(request, response);
    }

    private boolean shouldTryReissue(HttpServletRequest request) {
        if (!"GET".equalsIgnoreCase(request.getMethod())) return false;
        if (isAjaxRequest(request)) return false;
        if (isPublicPath(request.getRequestURI())) return false;
        String authToken = getCookieValue(request, "Authorization");
        // AccessToken이 없거나 만료된 경우 재발급 시도
        return authToken == null || !jwtUtil.validateToken(authToken);
    }

    private boolean isPublicPath(String uri) {
        if ("/".equals(uri)) return true;
        return PUBLIC_PREFIXES.stream().anyMatch(uri::startsWith);
    }

    private boolean tryReissueAndSetCookie(String refreshToken, HttpServletResponse response) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.COOKIE, "RefreshToken=" + refreshToken);
            headers.add(HttpHeaders.CONTENT_TYPE, "application/json");

            ResponseEntity<String> result = restTemplate.postForEntity(
                    zzzApiUrl + "/api/auth/reissue",
                    new HttpEntity<>("{}", headers),
                    String.class);

            if (result.getStatusCode() == HttpStatus.OK) {
                List<String> setCookies = result.getHeaders().get(HttpHeaders.SET_COOKIE);
                if (setCookies != null) {
                    setCookies.forEach(c -> response.addHeader(HttpHeaders.SET_COOKIE, c));
                }
                return true;
            }
        } catch (Exception e) {
            log.warn("토큰 재발급 요청 실패: {}", e.getMessage());
        }
        return false;
    }

    private String getCookieValue(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;
        for (Cookie c : cookies) {
            if (name.equals(c.getName())) return c.getValue();
        }
        return null;
    }

    private boolean isAjaxRequest(HttpServletRequest request) {
        if ("XMLHttpRequest".equalsIgnoreCase(request.getHeader("X-Requested-With"))) return true;
        String contentType = request.getContentType();
        if (contentType != null && contentType.contains("application/json")) return true;
        String accept = request.getHeader("Accept");
        return accept != null && accept.contains("application/json");
    }
}
