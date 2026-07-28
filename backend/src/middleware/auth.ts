import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tfat_super_secure_jwt_secret_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: {
    UserID: number;
    Email: string;
    Role: string;
  };
}

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // "Bearer TOKEN"

    jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
      if (err) {
        return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
      }
      req.user = decoded;
      next();
    });
  } else {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
}

export function requireRole(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    if (!roles.includes(req.user.Role)) {
      return res.status(403).json({ error: `Forbidden: Role '${req.user.Role}' does not have permission` });
    }

    next();
  };
}
