from fastapi import APIRouter
from app.schemas import LoginRequest, LoginResponse, VerifyRequest, VerifyResponse

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest):
    """
    Operator login endpoint.
    
    Security Limitation (Hackathon MVP):
    We are currently returning a deterministic mock token to allow the frontend to proceed
    without being blocked by complex JWT generation, signing, and JWKS verification.
    
    Production improvement:
    Implement standard OAuth2 flow returning signed JWTs with short expirations and refresh tokens.
    """
    return LoginResponse(
        access_token="demo-token",
        token_type="bearer"
    )

@router.post("/verify", response_model=VerifyResponse)
def verify_device(request: VerifyRequest):
    """
    Hardware device verification endpoint.
    
    Security Strategy:
    In production, IoT GPS devices will sign a cryptographic nonce using a hardware secure enclave.
    This prevents replay attacks where a malicious actor intercepts the network traffic and tries 
    to send spoofed GPS locations using a compromised access token.
    """
    return VerifyResponse(
        authenticated=True,
        device_id=request.device_id
    )
