import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const apiCredentialsInterceptor: HttpInterceptorFn = (req, next) => {
  // HttpOnly cookies are attached by the browser; JavaScript never reads a token.
  const apiRequest = req.url.startsWith(`${environment.apiBaseUrl}/`)
    ? req.clone({ withCredentials: true })
    : req;
  return next(apiRequest);
};
