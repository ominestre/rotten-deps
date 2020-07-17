import { createFileReader, createConfig, hasValidRules } from './config';
import { createOutdatedRequest, createDetailsRequest } from './npm-interactions';

import type { Config } from './config';
import type { OutdatedPackage } from './npm-interactions';

export interface ReportData {
  name: string,
  current: string,
  latest: string,
  daysOutdated: number,
  isOutdated: boolean,
}

export const generateReport = async (config: Config): Promise<ReportData[]|Error> => {
  const isValid = hasValidRules(config.rules);

  if (!isValid) return new Error('Configuration contains invalid rules');

  const getOutdated = createOutdatedRequest();
  const outdated = await getOutdated();

  if (outdated instanceof Error) return outdated;

  try {
    const reportData = [];

    Object.entries(outdated).forEach(async (x) => {
      const [name, desiredDetails]: [string, OutdatedPackage] = x;
      const getDetails = createDetailsRequest(name);
      const details = await getDetails();

      if (details instanceof Error) return details;

      // it's the time prop in the npm response but it's a collection of versions and dates
      const { time: versions } = details;
      const currentVersion = versions[desiredDetails.current];
      const latestVersion = versions[desiredDetails.latest];
      const currentDate = new Date(currentVersion);
      const latestDate = new Date(latestVersion);
      const currentTime = currentDate.getTime();
      const latestTime = latestDate.getTime();

      // 86400000 represents the amount of milliseconds in a day
      const daysOutdated = Math.floor((latestTime - currentTime) / 86400000)

      let isOutdated = false;

      // TODO https://github.com/ominestre/rotten-deps/issues/5
      if (!config.rules[name]) isOutdated = true;
      else if (config.rules[name].daysUntilExpiration < daysOutdated) isOutdated = true;
      else if (config.rules[name].ignore) isOutdated = false;

      reportData.push({
        name,
        current: desiredDetails.current,
        latest: desiredDetails.latest,
        daysOutdated,
        isOutdated,
      });
    });

    return reportData;
  } catch (err) {
    return err;
  }
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
  generateReport,
};
