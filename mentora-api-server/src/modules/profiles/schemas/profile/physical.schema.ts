import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Physical {
  @Prop({ type: [String], default: [] })
  accessibilityNeeds?: string[];
}
