import app from './app.config';
import db from './db.config';
import jwt from './jwt.config';
import redis from './redis.config';
import storage from './storage.config';
import throttle from './throttle.config';
import membership from './membership.config';

export default [app, db, jwt, redis, storage, throttle, membership];
