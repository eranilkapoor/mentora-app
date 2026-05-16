import { Prop, Schema } from '@nestjs/mongoose';
import { OccupationType, Qualification } from 'src/common/enums';

@Schema({ _id: false })
export class Education {
  @Prop({ enum: Qualification, required: true })
  qualification!: Qualification;

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
