import { createFileReader, createConfig, hasValidRules } from './config';
import { createOutdatedRequest, createDetailsRequest } from './npm-interactions';

interface ReportData {
  name: string,
  current: string,
  latest: string,
  daysOutdated: number,
  isOutdated: boolean,
}

interface OutdatedDependency {
  current: string,
  wanted: string,
  latest: string,
  location: string,
}

const Maybe = function (x) { this._value = x; };
Maybe.of = (x) => new Maybe(x);
Maybe.prototype.map = function (f) { return Maybe.of(f(this._value)); };

// generateReport( config: object ) => Maybe()
export const generateReport = async (config) => {
  const isValid = hasValidRules(config.rules);

  if (!isValid) return Maybe.of(new Error('Configuration contains invalid rules'));

  const getOutdated = createOutdatedRequest();
  let outdated: object;

  try {
    outdated = await getOutdated();
  } catch (err) {
    return Maybe.of(err);
  }

  try {
    let reportData: ReportData[];

    Object.entries(outdated).forEach(async (val) => {
      const [name, desiredDetails]: [string, OutdatedDependency] = val;
      const getDetails = createDetailsRequest(name);
      const { time } = await getDetails();
      const currentTime = time[desiredDetails.current];
      const latestTime = time[desiredDetails.latest];
      const currentDay = new Date(currentTime).getUTCDay();
      const latestDay = new Date(latestTime).getUTCDay();
      const daysOutdated = currentDay - latestDay;

      let isOutdated: boolean;

      if (!config.rules[name]) isOutdated = true;
      else if (config.rules[name].ignore) isOutdated = false;
      else if (config.rules[name].daysUntilExpiration < daysOutdated) isOutdated = true;
      else isOutdated = false;

      reportData.push({
        name,
        current: desiredDetails.current,
        latest: desiredDetails.latest,
        daysOutdated,
        isOutdated,
      });
    });

    return Maybe.of(reportData);
  } catch (err) {
    return Maybe.of(err);
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
