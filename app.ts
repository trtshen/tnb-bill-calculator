/// <reference types="angular" />

interface Rate {
    level: number;
    charge: number;
    limit: number;
}

interface IcptRebate {
    nongst: number;
    gst: number;
}

interface Prices {
    nongst: number;
    gst: number;
}

interface BillScope extends angular.IScope {
    kwh: number | null;
    gst: number;
    rates: Rate[];
    total: number;
    gstTotal: number;
    icpt: number;
    consumable: number | undefined;
    finance: number | undefined;
    calculate: () => void;
    refinance: (amount: number) => void;
}

const app: angular.IModule = angular.module('tnb', []);

app.controller('billCtrl', ['$scope', function($scope: BillScope) {
    $scope.kwh = null;
    $scope.gst = 0;
    $scope.rates = [
        { level: 1, charge: 21.8, limit: 200 },
        { level: 2, charge: 33.4, limit: 100 },
        { level: 3, charge: 51.6, limit: 300 },
        { level: 4, charge: 54.6, limit: 300 }
    ];

    function getDecimal(num: number): string {
        return parseFloat(num.toString()).toFixed(2);
    }

    $scope.calculate = function(): void {
        $scope.consumable = undefined;
        $scope.finance = undefined;

        if ($scope.kwh === null) return;

        let total = 0;
        let kwh = $scope.kwh;
        const icptRebate: IcptRebate = {
            nongst: (kwh >= 300) ? (300 * 1.52 / 100) : 0,
            gst: (kwh > 300) ? ((kwh - 300) * 1.52 / 100) : 0
        };
        const gstRate = 0.06;
        const prices: Prices = { nongst: 0, gst: 0 };

        $scope.rates.forEach((rate: Rate) => {
            const cent = rate.charge / 100;

            if (rate.level === 4) {
                prices.gst += (kwh * cent);
                total += (kwh * cent);
                kwh = 0;
            } else if (kwh > rate.limit) {
                total += (rate.limit * cent);
                kwh -= rate.limit;

                if (rate.level < 3) {
                    prices.nongst += (rate.limit * cent);
                } else {
                    prices.gst += (rate.limit * cent);
                }
            } else if (kwh !== 0) {
                total += (kwh * cent);
                if (rate.level < 3) {
                    prices.nongst += (kwh * cent);
                } else {
                    prices.gst += (kwh * cent);
                }
                kwh = 0;
            }
        });

        total = prices.nongst - icptRebate.nongst;
        const gstChargeable = prices.gst - icptRebate.gst;
        $scope.total = Number(getDecimal(total + gstChargeable));
        $scope.gst = Number(getDecimal(gstChargeable * gstRate));
        $scope.icpt = Number(getDecimal(icptRebate.gst + icptRebate.nongst));
        $scope.gstTotal = Number(getDecimal(total + gstChargeable + (gstChargeable * gstRate)));
    };

    $scope.refinance = function(amount: number): void {
        $scope.total = 0;
        $scope.kwh = null;

        let consumable = 0;
        const stages: { [key: number]: { max: number, limit: number, charge: number } } = {};

        $scope.rates.forEach((rate: Rate) => {
            stages[rate.level] = {
                max: (rate.charge / 100 * rate.limit),
                limit: rate.limit,
                charge: (rate.charge / 100)
            };
        });

        if (amount >= stages[1].max) {
            consumable += stages[1].limit;
            amount -= stages[1].max;
        } else {
            consumable = amount / stages[1].charge;
            amount = 0;
        }

        if (amount >= stages[2].max) {
            consumable += stages[2].limit;
            amount -= stages[2].max;
        } else {
            consumable += amount / stages[2].charge;
            amount = 0;
        }

        if (amount > 0) {
            amount -= (amount * 0.06);

            if (amount >= stages[3].max) {
                consumable += stages[3].limit;
                amount -= stages[3].max;
            } else {
                consumable += amount / stages[3].charge;
                amount = 0;
            }

            if (amount > 0) {
                consumable += amount / stages[4].charge;
            }
        }

        $scope.consumable = Number(consumable.toFixed(0));
    };
}]);