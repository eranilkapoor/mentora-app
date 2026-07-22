import { Prop, Schema } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Family {
  @Prop()
  fatherName?: string;

  @Prop()
  motherName?: string;

  @Prop()
  fatherOccupation?: string;

  @Prop()
  motherOccupation?: string;

  @Prop()
  guardianName?: string;

  @Prop()
  guardianRelation?: string;

  @Prop()
  primaryGuardianPhone?: string;

  @Prop()
  primaryGuardianEmail?: string;
}
