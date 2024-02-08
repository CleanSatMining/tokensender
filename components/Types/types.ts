export type Expense = {
  id: string;
  dateTime: number;
  siteId: string;
  csm: number;
  operator: number;
  electricity: number;
};

export type Site = {
  id: string;
  name: string;
  shortName: string;
  expenses: Expense[];
};
