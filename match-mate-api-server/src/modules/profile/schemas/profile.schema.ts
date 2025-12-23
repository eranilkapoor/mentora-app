import { Schema, model, Document } from 'mongoose';

interface IProfile extends Document {
    userId: string;
    bio: string;
    avatarUrl: string;
    createdAt: Date;
    updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>({
    userId: { type: String, required: true, unique: true },
    bio: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

ProfileSchema.pre<IProfile>('save', function(next) {
    this.updatedAt = new Date();
    next();
});

const Profile = model<IProfile>('Profile', ProfileSchema);

export { Profile };
export type { IProfile };