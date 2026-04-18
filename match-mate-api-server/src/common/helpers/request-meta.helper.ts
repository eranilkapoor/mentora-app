import { AppRequest } from '../interfaces/app-request.interface';

export const getRequestMeta = (req: AppRequest) => {
  return {
    platform: String(req.headers['x-platform'] || 'web'),
    deviceId: String(req.headers['x-device-id'] || 'unknown'),
    ip: req.ip,
    userAgent: req.headers['user-agent'] || '',
  };
};
