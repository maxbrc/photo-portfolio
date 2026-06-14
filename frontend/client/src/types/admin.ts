interface LoginComponentProps {
    setAccessToken: (newAccessToken: string) => void;
}

interface SuccessfullLoginResponse {
    access_token: string;
}

interface TokenValidationResponse {
    valid: boolean;
    leewayUsed: boolean;
}

export { LoginComponentProps, SuccessfullLoginResponse, TokenValidationResponse }