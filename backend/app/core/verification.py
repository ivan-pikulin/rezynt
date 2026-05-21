import hashlib
from typing import Tuple
from itsdangerous import URLSafeTimedSerializer

from app.core.config import settings


class VerificationCodeGenerator:
    """Generates 6-digit codes from tokens using existing token infrastructure"""
    
    def __init__(self):
        self.serializer = URLSafeTimedSerializer(settings.SECRET_KEY)
    
    def generate_token_and_code(self, user_id: int, salt: str) -> Tuple[str, str]:
        """
        Generate both token and 6-digit code for verification
        
        Args:
            user_id: User ID to encode
            salt: Salt for token ('email-confirm' or 'password-reset')
            
        Returns:
            Tuple of (token, 6_digit_code)
        """
        # Generate token using existing logic
        token = self.serializer.dumps(str(user_id), salt=salt)
        
        # Generate 6-digit code from token hash
        code = self._token_to_code(token)
        
        return token, code
    
    def verify_code(self, code: str, token: str, salt: str, max_age: int) -> int:
        """
        Verify 6-digit code matches token and return user_id
        
        Args:
            code: 6-digit code from user
            token: Token to verify against
            salt: Salt used for token
            max_age: Maximum age in seconds
            
        Returns:
            User ID if valid
            
        Raises:
            ValueError: If code/token is invalid or expired
        """
        print(f"DEBUG: verify_code called with code={code}, token={token[:20]}..., salt={salt}, max_age={max_age}")
        
        # Verify token first
        try:
            user_id_str = self.serializer.loads(token, salt=salt, max_age=max_age)
            user_id = int(user_id_str)
            print(f"DEBUG: Token decoded successfully, user_id={user_id}")
        except Exception as e:
            print(f"DEBUG: Token decode failed: {e}")
            raise ValueError("Недействительный или просроченный токен")
        
        # Verify code matches token
        expected_code = self._token_to_code(token)
        print(f"DEBUG: Expected code: {expected_code}, received code: {code}")
        if code != expected_code:
            print(f"DEBUG: Code mismatch - expected: {expected_code}, received: {code}")
            raise ValueError("Недействительный код подтверждения")
        
        print(f"DEBUG: Code verification successful for user {user_id}")
        return user_id
    
    def _token_to_code(self, token: str) -> str:
        """Convert token to 6-digit code using hash"""
        # Create hash from token
        hash_obj = hashlib.sha256(token.encode()).hexdigest()
        
        # Extract 6 digits from hash
        digits_only = ''.join(c for c in hash_obj if c.isdigit())
        
        # Take first 6 digits, pad with zeros if needed
        code = digits_only[:6].ljust(6, '0')
        
        return code


# Global instance
verification_generator = VerificationCodeGenerator()
