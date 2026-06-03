import app from './app.config';
import db from './db.config';
import jwt from './jwt.config';
import redis from './redis.config';
import notification from './notification.config';
import payment from './payment.config';
import storage from './storage.config';
import throttle from './throttle.config';
import membership from './membership.config';
import chat from './chat.config';

export default [
  app,
  db,
  jwt,
  redis,
  notification,
  payment,
  storage,
  throttle,
  membership,
  chat,
];
