import { verifyGatewayRequest } from '@justmic007/9-jobber-shared';
import { Application } from 'express';
import { authRoutes } from '@auth/routes/auth';

const BASE_PATH = '/api/v1/auth';

export function appRoutes(app: Application): void {
  app.use(BASE_PATH, verifyGatewayRequest /* verify if request is coming from the api gateway */, authRoutes);
}
