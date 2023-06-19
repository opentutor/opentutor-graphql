/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface Setting {
  key: string;
  value: string | string[] | number | number[] | null;
}

export interface AppConfig {
  googleClientId: string;
  logoIcon: string;
  logoLargeIcon: string;
  featuredLessons: string[];
}

type ConfigKey = keyof AppConfig;
export const ConfigKeys: ConfigKey[] = [
  'googleClientId',
  'logoIcon',
  'logoLargeIcon',
  'featuredLessons',
];

export function getDefaultConfig(): AppConfig {
  return {
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    logoIcon: '',
    logoLargeIcon: '',
    featuredLessons: [],
  };
}

export interface SettingDoc extends Setting, Document {}

export const SettingSchema = new Schema<SettingDoc>(
  {
    key: { type: String, unique: true },
    value: { type: Schema.Types.Mixed },
  },
  { timestamps: true, collation: { locale: 'en', strength: 2 } }
);

SettingSchema.statics.getConfig = async function (args: {
  defaults?: Partial<AppConfig>;
}) {
  return (await this.find({ key: { $in: ConfigKeys } })).reduce(
    (acc: AppConfig, cur: Setting) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (acc as any)[cur.key] = cur.value;
      return acc;
    },
    args?.defaults || getDefaultConfig()
  );
};

SettingSchema.statics.saveConfig = async function (
  config: Partial<AppConfig>
): Promise<void> {
  await Promise.all(
    Object.getOwnPropertyNames(config).map((key) => {
      return this.findOneAndUpdate(
        { key },
        {
          $set: { value: config[key as keyof AppConfig] as string },
        },
        {
          upsert: true,
        }
      );
    })
  );
};

export interface SettingModel extends Model<SettingDoc> {
  getConfig(args?: { defaults?: Partial<AppConfig> }): Promise<AppConfig>;
  saveConfig(config: Partial<AppConfig>): Promise<void>;
}

export default mongoose.model<SettingDoc, SettingModel>(
  'Setting',
  SettingSchema
);
