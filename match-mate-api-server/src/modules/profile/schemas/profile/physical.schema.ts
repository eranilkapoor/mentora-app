import { Prop, Schema } from '@nestjs/mongoose';
import { BloodGroup, BodyType, Complexion } from 'src/common/enums';

@Schema({ _id: false })
export class Physical {
  @Prop({ required: true })
  heightCm?: number;

  @Prop()
  weightKg?: number;

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
