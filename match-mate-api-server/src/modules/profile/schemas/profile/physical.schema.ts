import { Prop, Schema } from '@nestjs/mongoose';
import { BodyType, Complexion } from 'src/common/enums';

@Schema({ _id: false })
export class Physical {
  @Prop({ required: true })
  heightLabel?: string;

  @Prop()
  weightKg?: number;

  @Prop()
  bloodGroup?: string;

  @Prop({ enum: BodyType })
  bodyType?: BodyType;

  @Prop({ enum: Complexion })
  complexion?: Complexion;

  @Prop({ default: false })
  disabilityStatus?: boolean;

  @Prop()
  disabilityNote?: string;
}