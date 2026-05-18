import { BloodGroup, BodyType, Complexion } from "../common/enums";

export interface PhysicalData {
  height: string;
  weight?: string;
  bloodGroup?: BloodGroup;
  bodyType?: BodyType;
  complexion?: Complexion;
  disabilityStatus?: boolean;
  disabilityNote?: string;
}
