import { createFileReader, createConfig } from './config';
import { createOutdatedRequest, createDetailsRequest } from './npm-interactions';

import type { Config } from './config';
import type { OutdatedPackage } from './npm-interactions';

export interface ReportData {
  name: string,
  current: string,
  latest: string,
  daysOutdated: number,
  isOutdated: boolean,
  isIgnored: boolean,
}

export const generateReport = async (c: Config): Promise<ReportData[]|Error> => {
  const config = createConfig(c);
  const { rules } = config;

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
      let isIgnored = false;

      const rule = rules.filter(x => x.dependencyName === name).shift();

      if (!rule) isOutdated = true;
      if (rule && rule.daysUntilExpiration <= daysOutdated) isOutdated = true
      if (rule && rule.ignore) {
        isIgnored = true;
        isOutdated = false;
      }

      reportData.push({
        name,
        current: desiredDetails.current,
        latest: desiredDetails.latest,
        daysOutdated,
        isOutdated,
        isIgnored,
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
