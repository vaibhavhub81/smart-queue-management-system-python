from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from users.models import User

@database_sync_to_async
def get_user(token_key):
    try:
        token = AccessToken(token_key)
        user_id = token.payload.get('user_id')
        return User.objects.get(id=user_id)
    except (InvalidToken, TokenError, User.DoesNotExist):
        return AnonymousUser()

class TokenAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode("utf-8")
        token = dict(kv.split("=") for kv in query_string.split("&")).get("token", None)

        if token:
            scope['user'] = await get_user(token)
        else:
            scope['user'] = AnonymousUser()

        return await self.inner(scope, receive, send)

def TokenAuthMiddlewareStack(inner):
    return TokenAuthMiddleware(inner)
