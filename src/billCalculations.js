// Bill calculation utilities and data
export const rates = [
  {
    level: 1,
    charge: 21.8,
    limit: 200
  },
  {
    level: 2,
    charge: 33.4,
    limit: 100
  },
  {
    level: 3,
    charge: 51.6,
    limit: 300
  },
  {
    level: 4,
    charge: 54.6,
    limit: 300
  }
];

const getDecimal = (num) => {
  return parseFloat(num).toFixed(2);
};

export const calculateBill = (kwhInput) => {
  if (!kwhInput || kwhInput <= 0) {
    return null;
  }

  let total = 0;
  let kwh = kwhInput;
  const icptRebate = {
    nongst: (kwh >= 300) ? (300 * 1.52 / 100) : 0,
    gst: (kwh > 300) ? ((kwh - 300) * 1.52 / 100) : 0
  };
  const gstRate = 0.06;

  const prices = {
    nongst: 0,
    gst: 0,
  };

  rates.forEach(rate => {
    const cent = (rate.charge / 100);

    if (rate.level === 4) {
      prices['gst'] += (kwh * cent);
      total += (kwh * cent);
      kwh = 0;
    } else if (kwh > rate.limit) {
      total += (rate.limit * cent);
      kwh -= rate.limit;

      if (rate.level < 3) {
        prices['nongst'] += (rate.limit * cent);
      } else {
        prices['gst'] += (rate.limit * cent);
      }
    } else if (kwh !== 0) {
      total += (kwh * cent);
      if (rate.level < 3) {
        prices['nongst'] += (kwh * cent);
      } else {
        prices['gst'] += (kwh * cent);
      }
      kwh = 0;
    }
  });

  total = prices['nongst'] - icptRebate['nongst'];
  const gstChargeable = prices['gst'] - icptRebate['gst'];
  
  return {
    total: getDecimal(total + gstChargeable),
    gst: getDecimal(gstChargeable * gstRate),
    icpt: getDecimal(icptRebate['gst'] + icptRebate['nongst']),
    gstTotal: getDecimal(total + gstChargeable + (gstChargeable * gstRate))
  };
};

export const calculateConsumable = (amount) => {
  if (!amount || amount <= 0) {
    return null;
  }

  let consumable = 0;
  const stages = {};

  rates.forEach(rate => {
    stages[rate.level] = {
      max: (rate.charge / 100 * rate.limit),
      limit: rate.limit,
      charge: (rate.charge / 100)
    };
  });

  let remainingAmount = amount;

  if (remainingAmount >= stages[1].max) {
    consumable += stages[1].limit;
    remainingAmount -= stages[1].max;
  } else {
    consumable = remainingAmount / stages[1].charge;
    remainingAmount = 0;
  }

  if (remainingAmount >= stages[2].max) {
    consumable += stages[2].limit;
    remainingAmount -= stages[2].max;
  } else {
    consumable += remainingAmount / stages[2].charge;
    remainingAmount = 0;
  }

  if (remainingAmount > 0) {
    remainingAmount -= (remainingAmount * 0.06);

    if (remainingAmount >= stages[3].max) {
      consumable += stages[3].limit;
      remainingAmount -= stages[3].max;
    } else {
      consumable += remainingAmount / stages[3].charge;
      remainingAmount = 0;
    }

    if (remainingAmount > 0) {
      consumable += remainingAmount / stages[4].charge;
    }
  }

  return consumable.toFixed(0);
};