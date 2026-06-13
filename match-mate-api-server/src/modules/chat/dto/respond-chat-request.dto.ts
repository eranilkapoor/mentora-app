import { IsIn } from 'class-validator';

export class RespondChatRequestDto {
  @IsIn(['ACCEPT', 'REJECT'])
  action!: 'ACCEPT' | 'REJECT';
}
