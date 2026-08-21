package com.venturevital.dto;

public class AuthResponse {

    private String token;
    private String email;
    private String displayName;
    private String message;

    public AuthResponse() {}

    public AuthResponse(String token, String email, String displayName, String message) {
        this.token = token;
        this.email = email;
        this.displayName = displayName;
        this.message = message;
    }

    // Builder
    public static AuthResponseBuilder builder() { return new AuthResponseBuilder(); }

    public static class AuthResponseBuilder {
        private String token;
        private String email;
        private String displayName;
        private String message;

        public AuthResponseBuilder token(String token) { this.token = token; return this; }
        public AuthResponseBuilder email(String email) { this.email = email; return this; }
        public AuthResponseBuilder displayName(String displayName) { this.displayName = displayName; return this; }
        public AuthResponseBuilder message(String message) { this.message = message; return this; }

        public AuthResponse build() {
            return new AuthResponse(token, email, displayName, message);
        }
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
