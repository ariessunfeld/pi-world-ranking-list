export type Constant = "pi" | "e" | "sqrt2";

export type DatePrecision = "day" | "month" | "year" | "unknown";

export type RankingRecord = {
  id: string;
  constant: Constant;
  display_name: string;
  sort_name: string;
  country: string;
  continent: string;
  digits: number;
  date: string;
  date_text: string;
  date_precision: DatePrecision;
  notes: string;
  source_url: string;
  category_tags: string[];
  is_juggling: boolean;
  is_public: boolean;
};

export type Country = {
  name: string;
  continent: string;
};

export type RankedRecord = RankingRecord & {
  rank: number;
};

export type SpecialPage = {
  id: string;
  title: string;
  source_url: string;
  body: string;
  entries: Array<Record<string, string | number>>;
};
