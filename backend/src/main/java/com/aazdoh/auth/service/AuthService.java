package com.aazdoh.auth.service;

import com.aazdoh.auth.dto.AuthResponse;
import com.aazdoh.auth.dto.ForgotPasswordRequest;
import com.aazdoh.auth.dto.LoginRequest;
import com.aazdoh.auth.dto.RefreshTokenRequest;
import com.aazdoh.auth.dto.RegisterRequest;
import com.aazdoh.auth.dto.ResetPasswordRequest;
import com.aazdoh.auth.entity.PasswordResetToken;
import com.aazdoh.auth.repository.PasswordResetTokenRepository;
import com.aazdoh.common.email.ResendEmailService;
import com.aazdoh.common.exception.BadRequestException;
import com.aazdoh.common.exception.UnauthorizedException;
import com.aazdoh.user.entity.AiPersona;
import com.aazdoh.user.entity.User;
import com.aazdoh.user.entity.UserRole;
import com.aazdoh.user.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final ResendEmailService emailService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager,
            PasswordResetTokenRepository passwordResetTokenRepository,
            ResendEmailService emailService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailService = emailService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new BadRequestException("An account with this email already exists");
        }

        User user = new User(
                request.getEmail().toLowerCase().trim(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName().trim(),
                request.getTimezone() != null ? request.getTimezone() : "UTC",
                AiPersona.BALANCED,
                UserRole.USER
        );

        User savedUser = userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole().name());
        String refreshToken = jwtService.generateRefreshToken(savedUser.getId(), savedUser.getEmail());

        return new AuthResponse(
                accessToken,
                refreshToken,
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getRole().name()
        );
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase().trim(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());

        return new AuthResponse(
                accessToken,
                refreshToken,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name()
        );
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String token = request.getRefreshToken();
        try {
            String email = jwtService.extractEmail(token);
            UUID userId = jwtService.extractUserId(token);

            if (!jwtService.isTokenValid(token, email)) {
                throw new UnauthorizedException("Invalid or expired refresh token");
            }

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new UnauthorizedException("User not found"));

            String newAccessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name());
            String newRefreshToken = jwtService.generateRefreshToken(user.getId(), user.getEmail());

            return new AuthResponse(
                    newAccessToken,
                    newRefreshToken,
                    user.getId(),
                    user.getEmail(),
                    user.getFullName(),
                    user.getRole().name()
            );
        } catch (Exception ex) {
            throw new UnauthorizedException("Invalid refresh token");
        }
    }

    @Transactional
    public void initiatePasswordReset(ForgotPasswordRequest request) {
        String cleanEmail = request.getEmail().toLowerCase().trim();
        Optional<User> userOpt = userRepository.findByEmail(cleanEmail);

        if (userOpt.isEmpty()) {
            // Security best practice: avoid user enumeration attacks by returning silently
            return;
        }

        User user = userOpt.get();

        // Delete any existing reset tokens for this user
        passwordResetTokenRepository.deleteByUserId(user.getId());

        // Generate secure random token
        String rawToken = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
        String tokenHash = hashToken(rawToken);

        OffsetDateTime expiresAt = OffsetDateTime.now().plusHours(1);
        PasswordResetToken resetToken = new PasswordResetToken(user, tokenHash, expiresAt);
        passwordResetTokenRepository.save(resetToken);

        // Send email via Resend
        emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), rawToken);
    }

    @Transactional
    public void completePasswordReset(ResetPasswordRequest request) {
        String tokenHash = hashToken(request.getToken().trim());
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BadRequestException("Invalid or expired password reset link"));

        if (resetToken.isUsed() || resetToken.isExpired()) {
            throw new BadRequestException("This password reset link has expired or has already been used");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }

    private String hashToken(String token) {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error hashing reset token", e);
        }
    }
}
