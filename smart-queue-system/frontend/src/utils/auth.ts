import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
  role: string;
  user_id: number;
}

export const getAuthTokens = () => {
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  return { accessToken, refreshToken };
};

export const setAuthTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

export const removeAuthTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const getUserRole = (): string | null => {
  const { accessToken } = getAuthTokens();
  if (!accessToken) return null;

  try {
    const decoded: DecodedToken = jwtDecode(accessToken);
    return decoded.role;
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: DecodedToken = jwtDecode(token);
    return decoded.exp < Date.now() / 1000;
  } catch (error) {
    return true;
  }
};
