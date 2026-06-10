import { z } from 'zod';

export const emptyToNull = z.preprocess(
  (val) => (val === "" ? null : val),
  z.any()
);