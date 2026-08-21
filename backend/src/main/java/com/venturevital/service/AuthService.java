package com.venturevital.service;

import com.venturevital.dto.AuthResponse;
import com.venturevital.dto.LoginRequest;
import com.venturevital.dto.SignupRequest;
import com.venturevital.model.User;
import com.venturevital.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtService jwtService, AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @SuppressWarnings("null")
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .displayName(request.getDisplayName())
                .build();

        userRepository.save(user);
        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .message("Account created successfully")
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .message("Signed in successfully")
                .build();
    }

    @SuppressWarnings("null")
    public AuthResponse googleLogin(String email, String displayName) {
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    // Create new user for first-time Google sign-in
                    User newUser = User.builder()
                            .email(email)
                            .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                            .displayName(displayName)
                            .build();
                    return userRepository.save(newUser);
                });

        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .message("Signed in with Google successfully")
                .build();
    }
}
