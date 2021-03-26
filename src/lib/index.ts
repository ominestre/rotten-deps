import { createFileReader, createConfig } from './config';
import { createOutdatedRequest, createDetailsRequest } from './npm-interactions';

import type { Config } from './config';
import type { OutdatedPackage } from './npm-interactions';

export interface ReportData {
  readonly name: string,
  readonly current: string,
  readonly latest: string,
  readonly daysOutdated: number,
  readonly isOutdated: boolean,
  readonly isIgnored: boolean,
  readonly isStale: boolean,
}

interface Reporter {
  setTotal(total: number): any,
  report(data: ReportData): any,
  done(): void,
}

/**
 * Compares the details on each dependency flagged as outdated in order to
 * determine how stale a verison actually is.
 *
 * @param r optional reporter object which has a function for setting the
 *  total number of outdated dependencies and another for reporting a
 *  single dependency's data. A usecase for this would be to hook into a
 *  progress bar or other progress related monitoring.
 */
export const generateReport = async (c: Config, r?: Reporter): Promise<ReportData[]|Error> => {
  const config = createConfig(c);
  const { rules } = config;

  const getOutdated = createOutdatedRequest();
  const outdated = await getOutdated();

  r?.setTotal(Object.keys(outdated).length);

  if (outdated instanceof Error) return outdated;

  try {
    const reportData: ReportData[] = [];

    for (const x of Object.entries(outdated)) {
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
      let isStale = false;

      const rule = rules.filter(x => x.dependencyName === name).shift();

      if (!rule) isOutdated = true;
      if (!rule && config.defaultExpiration && config.defaultExpiration > daysOutdated) isOutdated = false;
      if (rule && rule.daysUntilExpiration && rule.daysUntilExpiration <= daysOutdated) isOutdated = true;
      if (rule && rule.daysUntilExpiration && rule.daysUntilExpiration > daysOutdated) isStale = true;

      if (rule && rule.ignore) {
        isIgnored = true;
        isOutdated = false;
      }

      const data = {
        name,
        current: desiredDetails.current,
        latest: desiredDetails.latest,
        daysOutdated,
        isOutdated,
        isIgnored,
        isStale,
      };

      r?.report(data);

      reportData.push(data);
    }

    r?.done();
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
