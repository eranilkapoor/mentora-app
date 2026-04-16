import { Prop, Schema } from '@nestjs/mongoose';
import { OccupationType } from 'src/common/enums';

@Schema({ _id: false })
export class Education {
  @Prop({ required: true })
  qualification!: string;

  @Prop()
  field?: string;

  @Prop()
  university?: string;

  @Prop({ enum: OccupationType })
  occupationType?: OccupationType;

  @Prop({ required: true })
  occupation!: string;

  @Prop()
  companyName?: string;

  @Prop()
  jobRole?: string;

  @Prop()
  annualIncomeAmount?: number;
}