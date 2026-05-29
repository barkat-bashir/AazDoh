package com.aazdoh.auth;

import com.aazdoh.auth.dto.AuthResponse;
import com.aazdoh.auth.dto.LoginRequest;
import com.aazdoh.auth.dto.RegisterRequest;
import com.aazdoh.auth.service.AuthService;
import com.aazdoh.auth.service.JwtService;
import com.aazdoh.common.exception.BadRequestException;
import com.aazdoh.user.entity.AiPersona;
import com.aazdoh.user.entity.User;
import com.aazdoh.user.entity.UserRole;
import com.aazdoh.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    @Test
    void testRegisterSuccess() {
        RegisterRequest req = new RegisterRequest("barkat@aazdoh.com", "password123", "Barkat", "UTC");

        when(userRepository.existsByEmail("barkat@aazdoh.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(UUID.randomUUID());
            return u;
        });
        when(jwtService.generateAccessToken(any(), any(), any())).thenReturn("mock-access-token");
        when(jwtService.generateRefreshToken(any(), any())).thenReturn("mock-refresh-token");

        AuthResponse res = authService.register(req);

        assertNotNull(res);
        assertEquals("barkat@aazdoh.com", res.getEmail());
        assertEquals("mock-access-token", res.getAccessToken());
        assertEquals("mock-refresh-token", res.getRefreshToken());
    }

    @Test
    void testRegisterDuplicateEmailThrows() {
        RegisterRequest req = new RegisterRequest("barkat@aazdoh.com", "password123", "Barkat", "UTC");
        when(userRepository.existsByEmail("barkat@aazdoh.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(req));
    }
}
