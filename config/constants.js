export const permissions = {
  users: {
    all: "USERS_ALL",
    add: "USERS_ADD",
    edit: "USERS_EDIT",
    delete: "USERS_DELETE",
    view: "USERS_VIEW"
  },
  site: {
    all: "SITE_ALL",
    install: "SITE_INSTALL"
  },
  content: {
    all: "CONTENT_ALL",
    public: "CONTENT_PUBLIC"
  }
};

export const logLevels = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  VERBOSE: 3,
  DEBUG: 4,
  SILLY: 5
};

export const jwtCookies = {
  HEADERPAYLOAD: "_au1",
  SIGNATURE: "_au2"
};

export const dataPullNames = {
  WASTATE: "wastate",
  JOHNSHOPKINS: "johnshopkins"
};

export const fieldNamesByCounty = {
  COUNTY: "County",
  CASES: "Positive/Confirmed Cases",
  DEATHS: "Deaths"
};

export const fieldNamesByPosNeg = {
  RESULT: "Result",
  COUNT: "Number of Individuals Tested",
  PERCENT: "Percent"
};

export const fieldNamesByAge = {
  AGEGROUP: "Age Group",
  PCTCASES: "Percent of Cases",
  PCTDEATHS: "Percent of Deaths"
};

export const fieldNamesBySex = {
  SEX: "Sex at Birth",
  PCTCASES: "Percent of Cases",
  PCTDEATHS: "Percent of Deaths"
};

export const fieldNamesByRegion = {
  PROVINCE: "Province/State",
  COUNTRY: "Country/Region",
  LATITUDE: "Lat",
  LONGITUDE: "Long"
};

export const sortMethods = {
  NAME: "name",
  CASES: "cases",
  DEATHS: "deaths",
  CASESRATE: "casesRateOfChange",
  DEATHSRATE: "deathsRateOfChange",
  CASESPER100K: "casesPer100k",
  DEATHSPER100K: "deathsPer100k",
  CASESRATEMOVINGAVG: "movingAvg",
  NEWCASESMOVINGAVG: "newCasesMovingAvg",
  NEWCASESMOVINGAVGPER100k: "newCasesMovingAvgPer100k",
  NEWCASES: "newCases",
  NEWDEATHS: "newDeaths",
  NEWCASESPER100k: "newCasesPer100k",
  NEWDEATHSPER100k: "newDeathsPer100k",
  MORTALITYRATE: "mortalityRate"
}