import { ArrayNotEmpty, IsArray, IsMongoId } from 'class-validator';

export class AssignRolesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  roleIds!: string[];
}
