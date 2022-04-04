/**
 * Rotten Deps API
 * @module
 */

import { createFileReader, createConfig } from './config';
import { createOutdatedRequest, createDetailsRequest } from './npm-interactions';

import type { Config } from './config';
import type { OutdatedPackage } from './npm-interactions';

interface ReportData {
  name: string,
  current: string,
  latest: string,
  daysOutdated: number,
  isOutdated: boolean,
  isIgnored: boolean,
  isStale: boolean,
}

interface Report {
  kind: 'report',
  data: ReportData[],
}

interface ReportWithWarning {
  kind: 'warning',
  data: ReportData[],
  hasPreinstallWarning: boolean,
}

export type ReportResponse = Report | ReportWithWarning;

interface Reporter {
  setTotal(total: number): any,
  report(data: ReportData): any,
  done(): void,
}

const MILLISECONDS_IN_DAY = 86400000;

/**
 * Compares the details on each dependency flagged as outdated in order to
 * determine how stale a verison actually is.
 *
 * @param r optional reporter object which has a function for setting the
 *  total number of outdated dependencies and another for reporting a
 *  single dependency's data. A usecase for this would be to hook into a
 *  progress bar or other progress related monitoring.
 */
export const generateReport = async (c: Config, r?: Reporter): Promise<ReportResponse | Error> => {
  const config = createConfig(c);
  const { rules } = config;

  const getOutdated = createOutdatedRequest();
  const outdated = await getOutdated();

  r?.setTotal(Object.keys(outdated).length);

  if (outdated instanceof Error) return outdated;

  try {
    const reportData: ReportData[] = [];
    let hasPreinstallWarning = false;

    for (const x of Object.entries(outdated)) {
      const [name, desiredDetails]: [string, OutdatedPackage] = x;
      const getDetails = createDetailsRequest(name);
      const details = await getDetails();

      if (details instanceof Error) return details;
      if (!desiredDetails.current) hasPreinstallWarning = true;

      // it's the time prop in the npm response but it's a collection of versions and dates
      const { time: versionData } = details;
      const versions = Object.keys(versionData);

      /*  When running `npm outdated` without first installing the current version will be
          missing causing a breakdown in determination of days outdated. This will use the
          wanted version instead. */
      const currentVersion = !desiredDetails.current
        ? desiredDetails.wanted
        : desiredDetails.current;

      const isPreRelease = (semver: string): boolean => semver.includes('alpha') || semver.includes('beta') || semver.includes('pre');

      const getNext = (i: number): string => {
        if (isPreRelease(versions[i + 1])) {
          return getNext(i + 1);
        } else {
          return versions[i + 1];
        }
      };

      const nextVersion = getNext(versions.indexOf(currentVersion));
      const nextVersionPublishDate = versionData[nextVersion];
      const nextVersionTime = new Date(nextVersionPublishDate).getTime();
      const currentTime = new Date().getTime();

      const daysOutdated = Math.floor((currentTime - nextVersionTime) / MILLISECONDS_IN_DAY);

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
        current: !desiredDetails.current ? desiredDetails.wanted : desiredDetails.current,
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
    
    if (hasPreinstallWarning) {
      return {
        kind: 'warning',
        data: reportData,
        hasPreinstallWarning: true,
      };
    } else {
      return {
        kind: 'report',
        data: reportData,
      };
    }
  } catch (err) {
    if (err instanceof Error) return err;

    return new Error('Something unexpected happened generating the dependency report');
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
