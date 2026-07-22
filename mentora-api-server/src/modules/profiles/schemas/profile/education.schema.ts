import { Prop, Schema } from '@nestjs/mongoose';
import { Qualification } from '@/common/enums';

@Schema({ _id: false })
export class Education {
  @Prop({ enum: Qualification, required: true })
  qualification!: Qualification;

  @Prop()
  field?: string;

  @Prop()
  university?: string;

  @Prop({ required: true })
  occupation!: string;

  @Prop()
  previousEducationSummary?: string;

  @Prop()
  examScoreSummary?: string;

  @Prop()
  coursePreference?: string;

  @Prop({ type: [String], default: [] })
  preferredSubjects?: string[];
}
