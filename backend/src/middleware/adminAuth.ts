import { Request, Response, NextFunction } from 'express';

const ADMIN_SECRET = process.env.ADMIN_API_SECRET || 'everified-admin-secret-change-me';

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7)
        : (req.headers['x-admin-key'] as string | undefined);

    if (!token || token !== ADMIN_SECRET) {
        return res.status(401).json({ error: 'Unauthorized admin access' });
    }
    next();
}

export function getAdminCredentials() {
    return {
        phone: process.env.ADMIN_PHONE || '9473928468',
        password: process.env.ADMIN_PASSWORD || 'Rajsahu@2000',
        secret: ADMIN_SECRET,
    };
}
