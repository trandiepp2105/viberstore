import jwt
from datetime import timedelta, datetime, timezone  
SECRET_KEY="8a0f555758b5a3b3e4744cdab59eeb675d4973a57fee7b7369f1b6537acacc4c"
ALGORITHM="HS256"

def create_access_token(email: str, user_id: int, expires_delta: timedelta):
    
    expires = datetime.now(timezone.utc) + expires_delta 
    issued_at = datetime.now(timezone.utc) 
    payload = {'sub': email, 'id': user_id, 'exp': expires, 'iat': issued_at}
    access_token = jwt.encode(payload=payload, key=SECRET_KEY, algorithm=ALGORITHM)
    return access_token