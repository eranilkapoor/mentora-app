export enum ChatRoomType {
  DIRECT = 'DIRECT',
}

export enum ChatRoomStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  BLOCKED = 'BLOCKED',
  REJECTED = 'REJECTED',
}

export enum ChatMessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  FILE = 'FILE',
  SYSTEM = 'SYSTEM',
}

export enum ChatMessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
}

export enum ChatModerationStatus {
  APPROVED = 'APPROVED',
  FLAGGED = 'FLAGGED',
  REJECTED = 'REJECTED',
}
