type Split<S extends string, D extends string> = S extends `${infer F}${D}${infer R}` ? [F, ...Split<R, D>] : [S];

type ExpandRecursively<T> = T extends object ? (T extends infer O ? { [K in keyof O]: O[K] } : never) : T;

type CountColumns<Separator, Value, acc = []> = Value extends `${infer _}${Separator}${infer Rest}`
  ? Rest extends ""
    ? acc["length"]
    : CountColumns<Separator, Rest, [...acc, 1]>
  : [...acc, 1]["length"];

type GetHeaders<NewLine, Value> = Value extends `${infer Header}${NewLine}${infer _}` ? Header : Value;

type GetSamples<NewLine, Value, acc = []> = Value extends `${infer f}${NewLine}${infer Sample}`
  ? GetSamples<NewLine, Sample, [...acc, f]>
  : [...acc, Value];

type GetValues<NewLine, Value> = Value extends `${infer _}${NewLine}${infer V}` ? GetSamples<NewLine, V> : never;

type PaseColumns<D, Value, Values, acc = {}, s = []> = Value extends `${infer First}${D}${infer Rest}`
  ? Rest extends ""
    ? acc
    : PaseColumns<D, Rest, Values, acc & { [key in First]: GetType<Values[s["length"]], "YYYY-MM-DD"> }, [...s, 1]>
  : Value extends `${infer X}`
    ? acc & { [key in X]: GetType<Values[s["length"]], "YYYY-MM-DD"> }
    : never;

type ParseAllColumns<Separator, Columns, Values> = ExpandRecursively<PaseColumns<Separator, Columns, Values>>;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type ParseObject<Separator, NewLine, Input> = {
  size: CountColumns<Separator, GetHeaders<NewLine, Input>>;
  columns: ParseAllColumns<Separator, GetHeaders<NewLine, Input>, Split<GetValues<NewLine, Input>[0], Separator>>;
  sampleValues: GetValues<NewLine, Input>;
};

type IsNumber<V> = V extends `${number}` ? true : false;

interface ValidFormats {
  "YYYY-MM-DD": `${number}-${number}-${number}`;
  "YYYY-MM-DDTHH:mm:ss": `${number}-${number}-${number}T${number}:${number}:${number}`;
  "YYYY-MM-DDTHH:mm:ssZ": `${number}-${number}-${number}T${number}:${number}:${number}Z`;
}

type IsDate<V, F extends keyof ValidFormats> = V extends ValidFormats[F] ? true : false;

type GetType<V, F extends keyof ValidFormats> =
  IsNumber<V> extends true ? number : IsDate<V, F> extends true ? Date : string;

const sampleCsv = `Date,Open,High,Low,Close,Volume,Adj Close
2012-01-27,29.45,29.53,29.17,29.23,44187700,29.23
2012-01-26,29.61,29.70,29.40,29.50,49102800,29.50
2012-01-25,29.07,29.65,29.07,29.56,59231700,29.56
2012-01-24,29.47,29.57,29.18,29.34,51703300,29.34`;

type Sample = ParseObject<",", "\n", typeof sampleCsv>;