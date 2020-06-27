import { createFileReader, createConfig, hasValidRules } from './config';
import { createOutdatedRequest, createDetailsRequest } from './npm-interactions';

const main = config => {
  // TODO validate rules of config
  // TODO make npm outdated request
  // TODO make view request for each outdated dependency
  // TODO calculate delta between current version and latest
  // TODO generate current, latest, days-expired report
};

export const configuration = {
  createFileReader,
  createConfig,
  hasValidRules,
};

export const npm = {
  createOutdatedRequest,
  createDetailsRequest,
};

export default {
  configuration,
  npm,
};
