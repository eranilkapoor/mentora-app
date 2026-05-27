import { Prop, Schema } from '@nestjs/mongoose';
import { BloodGroup, BodyType, Complexion } from '@/common/enums';

@Schema({ _id: false })
export class Physical {
  @Prop({ required: true })
  height?: number;

  @Prop()
  weight?: number;

  @Prop()
  bloodGroup?: BloodGroup;

  @Prop({ enum: BodyType })
  bodyType?: BodyType;

  @Prop({ enum: Complexion })
  complexion?: Complexion;

  @Prop({ default: false })
  disabilityStatus?: boolean;

  @Prop()
  disabilityNote?: string;
}
