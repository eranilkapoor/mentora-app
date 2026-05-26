import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { COLLECTIONS } from 'src/common/constants/collections';
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_PRIORITIES,
} from '../notification.constants';

export type NotificationChannelConfig = {
  inApp: boolean;
  push: boolean;
  email: boolean;
  sms: boolean;
};

export type NotificationDeliveryRules = {
  cooldownMinutes?: number;
  maxPerDay?: number;
  quietHours?: boolean;
};

export type NotificationStatus = 'draft' | 'active' | 'archived';

@Schema({
  collection: COLLECTIONS.NOTIFICATION_TEMPLATE,
  timestamps: true,
})
export class NotificationTemplate {
  // =========================================================
  //  UNIQUE IDENTIFIERS
  // =========================================================

  @Prop({
    required: true,
    uppercase: true,
    trim: true,
  })
  key!: string;
  // INTEREST_RECEIVED

  @Prop({
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  eventKey!: string;
  // interest.received

  // =========================================================
  //  LOCALIZATION
  // =========================================================

  @Prop({
    default: 'en',
    lowercase: true,
    trim: true,
    index: true,
  })
  locale!: string;

  // =========================================================
  //  BASIC DETAILS
  // =========================================================

  @Prop({
    required: true,
    trim: true,
  })
  name!: string;

  @Prop({
    type: String,
    enum: NOTIFICATION_CATEGORIES,
    required: true,
    index: true,
  })
  category!: (typeof NOTIFICATION_CATEGORIES)[number];

  @Prop({
    type: String,
    enum: NOTIFICATION_PRIORITIES,
    default: 'normal',
    index: true,
  })
  priority!: (typeof NOTIFICATION_PRIORITIES)[number];

  // =========================================================
  //  CONTENT
  // =========================================================

  @Prop({
    required: true,
    trim: true,
  })
  title!: string;

  @Prop({
    required: true,
    trim: true,
  })
  message!: string;

  @Prop()
  pushTitle?: string;

  @Prop()
  pushBody?: string;

  @Prop()
  emailSubject?: string;

  @Prop()
  emailBody?: string;

  @Prop()
  smsBody?: string;

  // =========================================================
  //  TEMPLATE VARIABLES
  // =========================================================

  @Prop({
    type: [String],
    default: [],
  })
  variables!: string[];

  // =========================================================
  //  CHANNELS
  // =========================================================

  @Prop({
    type: {
      inApp: {
        type: Boolean,
        default: true,
      },
      push: {
        type: Boolean,
        default: true,
      },
      email: {
        type: Boolean,
        default: false,
      },
      sms: {
        type: Boolean,
        default: false,
      },
    },
    default: {},
    _id: false,
  })
  channels!: NotificationChannelConfig;

  // =========================================================
  //  DELIVERY RULES
  // =========================================================

  @Prop({
    type: {
      cooldownMinutes: Number,
      maxPerDay: Number,
      quietHours: Boolean,
    },
    _id: false,
    default: {},
  })
  deliveryRules?: NotificationDeliveryRules;

  // =========================================================
  //  MOBILE SUPPORT
  // =========================================================

  @Prop()
  deepLink?: string;

  @Prop()
  imageUrl?: string;

  // =========================================================
  //  TAGS
  // =========================================================

  @Prop({
    type: [String],
    default: [],
    index: true,
  })
  tags!: string[];

  // =========================================================
  //  SYSTEM CONTROL
  // =========================================================

  @Prop({
    default: false,
    index: true,
  })
  mandatory!: boolean;
  // mandatory notifications ignore user opt-out

  @Prop({
    enum: ['draft', 'active', 'archived'],
    default: 'active',
    index: true,
  })
  status!: NotificationStatus;

  @Prop({
    default: true,
    index: true,
  })
  isActive!: boolean;

  // =========================================================
  //  AUDIT
  // =========================================================

  @Prop({
    default: 'system',
  })
  createdBy!: string;

  @Prop({
    default: 1,
  })
  version!: number;
}

export type NotificationTemplateDocument = NotificationTemplate & Document;

export const NotificationTemplateSchema =
  SchemaFactory.createForClass(NotificationTemplate);

// =========================================================
// INDEXES
// =========================================================

NotificationTemplateSchema.index(
  {
    key: 1,
    locale: 1,
  },
  {
    unique: true,
  },
);

NotificationTemplateSchema.index({
  category: 1,
  priority: 1,
});

NotificationTemplateSchema.index({
  eventKey: 1,
  locale: 1,
});

NotificationTemplateSchema.index({
  status: 1,
  isActive: 1,
});
