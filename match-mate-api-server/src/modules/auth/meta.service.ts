import { Injectable } from '@nestjs/common';

@Injectable()
export class MetaService {
  async verifyToken(token: string) {
    // Mock Facebook/Instagram profile
    return { id: 'meta123', email: 'testuser@gmail.com', name: 'Test User' };
  }
}
