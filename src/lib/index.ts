/**
 * Rotten Deps API
 * @module
 */

import { createFileReader, createConfig } from './config';
import { createOutdatedRequest, createDetailsRequest, PackageDetails } from './npm-interactions';

import type { Config } from './config';
import type { OutdatedPackage, OutdatedData } from './npm-interactions';

interface ReportData {
  name: string,
  current: string,
  latest: string,
  daysOutdated: number,
  isOutdated: boolean,
  isIgnored: boolean,
  isStale: boolean,
  daysAllowed: number | 'inf',
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

type CombinedPackageDetails = PackageDetails & OutdatedPackage;

const MILLISECONDS_IN_DAY = 86400000;

/**
 * Asynchronously fetches all the package details for the outdated dependencies then combines
 * the results with with the results of the outdated request to prevent juggling two sets of data.
 */
const getIndividualPackageDetails = async (outdated: OutdatedData): Promise<CombinedPackageDetails[] | Error> => {
  try {
    const detailsRequestPromises: Promise<PackageDetails | Error>[] = [];

    for (const x of Object.entries(outdated)) {
      const [name] = x;
      const getDetailsRequest = createDetailsRequest(name);
      detailsRequestPromises.push(getDetailsRequest());
    }

    const results = await Promise.all(detailsRequestPromises);
    const combinedPackageDetails: CombinedPackageDetails[] = [];

    results.forEach(val => {
      if (val instanceof Error) throw val;

      const outdatedData = outdated[val.name];
      combinedPackageDetails.push({
        ...outdatedData,
        ...val,
      });
    });

    return combinedPackageDetails;
  } catch (err) {
    if (err instanceof Error) return err;

    return new Error('Something unexpected happened retrieving individual package details');
  }
};

/**
 * Compares the details on each dependency flagged as outdated in order to
 * determine how stale a version actually is.
 *
 * @param r Optional reporter object with functions for hooking middleware into the report generation process
 */
export const generateReport = async (c: Config, r?: Reporter): Promise<ReportResponse | Error> => {
  const config = createConfig(c);
  const { rules } = config;

  const getOutdated = createOutdatedRequest();
  const outdated = await getOutdated();

  r?.setTotal(Object.keys(outdated).length);

  if (outdated instanceof Error) return outdated;

  const reportData: ReportData[] = [];
  let hasPreinstallWarning = false;

  const individualDetails = await getIndividualPackageDetails(outdated);

  if (individualDetails instanceof Error) return individualDetails;

  individualDetails.forEach(details => {
    // If the `current` prop is missing this most likely means `npm install` or `yarn install` wasn't run prior
    if (!details.current) hasPreinstallWarning = true;

    // The `time` prop in the npm response is actually a collection of versions and dates
    const { time: versionData } = details;

    const versions = Object.keys(versionData);

    /*  When running `npm outdated` without first installing the current version will be
      missing causing a breakdown in determination of days outdated. This will use the
      wanted version instead. */
    const currentVersion = !details.current
      ? details.wanted
      : details.current;

    const isPreRelease = (semver: string): boolean =>
      semver.includes('alpha') || semver.includes('beta') || semver.includes('pre');

    const getNext = (i: number): string => {
      if (isPreRelease(versions[i + 1])) {
        return getNext(i + 1);
      }

      return versions[i + 1];
    };

    const nextVersion = getNext(versions.indexOf(currentVersion));
    const nextVersionPublishDate = versionData[nextVersion];
    const nextVersionTime = new Date(nextVersionPublishDate).getTime();
    const currentTime = new Date().getTime();
    const daysOutdated = Math.floor((currentTime - nextVersionTime) / MILLISECONDS_IN_DAY);

    let isOutdated = false;
    let isIgnored = false;
    let isStale = false;
    let daysAllowed: number | 'inf' = 0;

    const rule = rules.filter(x => x.dependencyName === details.name).shift();

    if (!rule) isOutdated = true;

    if (!rule && config.defaultExpiration && config.defaultExpiration > daysOutdated) {
      isOutdated = false;
      daysAllowed = config.defaultExpiration;
    }

    if (rule && rule.daysUntilExpiration && rule.daysUntilExpiration <= daysOutdated) {
      isOutdated = true;
      daysAllowed = rule.daysUntilExpiration;
    }

    if (rule && rule.daysUntilExpiration && rule.daysUntilExpiration > daysOutdated) {
      isStale = true;
      daysAllowed = rule.daysUntilExpiration;
    }

    if (rule && rule.ignore) {
      isIgnored = true;
      isOutdated = false;
      daysAllowed = 'inf';
    }

    const data = {
      name: details.name,
      current: !details.current ? details.wanted : details.current,
      latest: details.latest,
      daysOutdated,
      isOutdated,
      isIgnored,
      isStale,
      daysAllowed,
    };

    r?.report(data);
    reportData.push(data);
  });

  r?.done();

  if (hasPreinstallWarning) {
    return {
      kind: 'warning',
      data: reportData,
      hasPreinstallWarning: true,
    };
  }

  return {
    kind: 'report',
    data: reportData,
  };
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
