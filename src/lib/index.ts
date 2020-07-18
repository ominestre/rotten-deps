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
}

export const generateReport = async (config: Config): Promise<ReportData[]|Error> => {
  const maybeConfig = createConfig(config);
  switch (maybeConfig.kind) {
    case 'error':
      return maybeConfig.error;
    case 'config':
      const { rules } = maybeConfig;

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
          if (!rules[name]) isOutdated = true;
          else if (rules[name].daysUntilExpiration < daysOutdated) isOutdated = true;
          else if (rules[name].ignore) isOutdated = false;
    
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
