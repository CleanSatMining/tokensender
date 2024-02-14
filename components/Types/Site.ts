export type CleanSatMiningSite = {
  id: string;
  name: string;
  shortName: string;
  operator: Operator | undefined;
  data: Site;
};

export type Operator = {
  name: string;
  logo: string;
  website: string;
};

export type Site = {
  name: string;
  location: {
    countryCode: string;
    name: string;
  };
  image: string;
  token: Token;
  status: MiningStatus;
  api: Api;
  mining: Mining;
  fees: Fees;
  vault: {
    btcAddress: string;
    xpub: string;
  };
};

export type Token = {
  address: string;
  price: number;
  supply: number;
  symbol: string;
  gnosisscanUrl: string;
};

export type TokenBalance = {
  address: string;
  balance: number;
  symbol: string;
  usd: number;
};

export type Api = {
  enable: boolean;
  username: string | undefined;
  url: string | undefined;
  contractor: Contractor | undefined;
};

export enum MiningStatus {
  active = 'active',
  inactive = 'inactive',
  stopped = 'stopped',
}

export enum Contractor {
  LUXOR = 'LUXOR',
  ANTPOOL = 'ANTPOOL',
}

export type Income = {
  usd: number;
  btc: number;
};

export type Mining = {
  startingDate: string;
  electricity: {
    usdPricePerKWH: number;
  };
  asics: {
    powerW: number;
    units: number;
    hashrateHs: number;
  };
  intallationCosts: {
    equipement: number;
  };
};

export type Yield = {
  usd: number;
  btc: number;
  apr: number;
};

export type Fees = {
  crowdfunding: {
    csm: number;
  };
  operational: {
    operator: {
      includeWithElectricity: boolean;
      rate: number; //BBGS, OP
    };
    csm: number;
    pool: number;
    taxe: number;
    provision: number;
  };
};

export enum FilterStatus {
  active = 'active',
  inactive = 'inactive',
  all = 'all-status',
}

export enum FilterSite {
  my = 'my-site',
  all = 'all-status',
}
