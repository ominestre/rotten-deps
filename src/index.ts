import { createFileReader, createConfig } from './config';
import { createOutdatedRequest, createDetailsRequest } from './npm-interactions';

export const configuration = {
  createFileReader,
  createConfig,
};

export const npm = {
  createOutdatedRequest,
  createDetailsRequest,
};

export default {
  configuration,
  npm,
};
