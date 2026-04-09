export class SendMessageDto {
  roomId!: string;
  receiverId!: string;
  message!: string;
  createdAt?: Date;
}
