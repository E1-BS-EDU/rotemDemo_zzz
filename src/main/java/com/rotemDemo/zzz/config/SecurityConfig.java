package com.rotemDemo.zzz.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.client.RestTemplate;
import com.rotemDemo.common.filter.JwtFilter;
import com.rotemDemo.common.util.AuthHttpResponseUtil;
import com.rotemDemo.zzz.filter.TokenReissueFilter;
import com.rotemDemo.zzz.lib.common.util.JwtUtil;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtUtil jwtUtil;

    @Value("${app.services.zzz-api}")
    private String zzzApiUrl;

    public SecurityConfig(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // 1. iframe 허용
            .headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.sameOrigin())
            )

            // 2. 요청 권한 설정
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/",
                    "/login",
                    "/loginOutPage",
                    "/password-change",
                    "/css/**",
                    "/js/**",
                    "/img/**",
                    "/font/**",
                    "/images/**",
                    "/vendor/**",
                    "/common/**",
                    "/favicon.ico",
                    "/dept/**",
                    "/error/**"
                ).permitAll()
                .anyRequest().authenticated()
            )

            // 3. 세션 미사용 (JWT 기반이므로 STATELESS)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // 4. 토큰 재발급 필터 (브라우저 네비게이션, AccessToken 없을 때 서버사이드 reissue)
            .addFilterBefore(
                new JwtFilter(jwtUtil, "/login",
                    List.of("/login", "/loginOutPage", "/img", "/font", "/common", "/password-change", "/dept")),
                UsernamePasswordAuthenticationFilter.class
            )
            .addFilterBefore(
                new TokenReissueFilter(new RestTemplate(), zzzApiUrl, jwtUtil),
                JwtFilter.class
            )

            // 5. 인증 실패 처리
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) ->
                    AuthHttpResponseUtil.respondUnauthorizedOrRedirect(request, response, "/login")
                )
            )

            // 6. CSRF 비활성화
            .csrf(csrf -> csrf.disable());

        return http.build();
    }
}
