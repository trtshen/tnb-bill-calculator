import React, { useState } from 'react';
import { rates, calculateBill, calculateConsumable } from './billCalculations.js';

// TariffTable Component
export const TariffTable = () => {
  return (
    <section className="col-md-12">
      <table className="table table-striped">
        <thead>
          <tr>
            <th>No</th>
            <th>Tariff Block (kWh)</th>
            <th>Rate (cents)</th>
          </tr>
        </thead>
        <tbody>
          {rates.map((rate, index) => (
            <tr key={rate.level}>
              <td>{index + 1}</td>
              <td>{rate.limit}</td>
              <td>{rate.charge}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

// ConsumptionInput Component
export const ConsumptionInput = ({ kwh, setKwh, onCalculate }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onCalculate();
  };

  return (
    <section className="col-md-12">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <span className="input-group-addon" id="consumption">Consumption (kWh)</span>
          <input
            type="number"
            className="form-control"
            placeholder="kWh"
            aria-describedby="consumption"
            value={kwh || ''}
            onChange={(e) => setKwh(parseFloat(e.target.value) || null)}
            autoFocus
          />
        </div>
      </form>
    </section>
  );
};

// PredictionInput Component
export const PredictionInput = ({ finance, setFinance, onRefinance }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onRefinance(finance);
  };

  return (
    <section className="col-md-12 spacer">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <span className="input-group-addon" id="prediction">Predict consumable kWh (RM)</span>
          <input
            type="number"
            className="form-control"
            placeholder="currency in MYR"
            aria-describedby="prediction"
            value={finance || ''}
            onChange={(e) => setFinance(parseFloat(e.target.value) || null)}
          />
        </div>
      </form>
    </section>
  );
};

// BillingSummary Component
export const BillingSummary = ({ billData }) => {
  if (!billData || !billData.total || billData.total <= 0) {
    return null;
  }

  return (
    <section className="col-md-12 spacer">
      <div className="panel panel-default">
        <div className="panel-heading">Billing Summary</div>
        <table className="table table-striped">
          <tbody>
            <tr>
              <td width="50%">Total (Before GST)</td>
              <td>RM{billData.total}</td>
            </tr>
            <tr>
              <td>GST</td>
              <td>RM{billData.gst}</td>
            </tr>
            <tr>
              <td>ICPT Rebate (Valid till June 2016)</td>
              <td>RM{billData.icpt}</td>
            </tr>
            <tr>
              <td>Total (After GST)</td>
              <td>RM{billData.gstTotal}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};

// ConsumableSummary Component
export const ConsumableSummary = ({ consumable }) => {
  if (!consumable || consumable <= 0) {
    return null;
  }

  return (
    <section className="col-md-12 spacer">
      <div className="panel panel-default">
        <div className="panel-heading">Consumable kWh (Experimental)</div>
        <table className="table table-striped">
          <tbody>
            <tr>
              <td width="50%">Predicted Consumable kWh</td>
              <td>{consumable} kWh</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};

// NotesSection Component
export const NotesSection = () => {
  return (
    <section className="col-md-12 spacer">
      <div className="panel panel-default">
        <div className="panel-heading">Notes</div>
        <div className="panel-body">
          <p className="text-info">Minimum bill amount of Domestic Tariff is RM3.00</p>
          <p className="text-info">
            ICPT Rebate only available for consumption{' '}
            <a
              href="https://www.tnb.com.my/faq/tariff"
              target="_blank"
              rel="noopener noreferrer"
            >
              exceed 300 kWh
            </a>
          </p>
          <p className="text-info">
            ICPT abbr. of{' '}
            <strong>
              <a
                href="https://www.tnb.com.my/faq/tariff#what-is-imbalance-cost-pass-through-icpt"
                target="_blank"
                rel="noopener noreferrer"
              >
                Imbalance Cost Pass-Through
              </a>
            </strong>
          </p>
        </div>
      </div>
    </section>
  );
};

// Main App Component
export const App = () => {
  const [kwh, setKwh] = useState(null);
  const [finance, setFinance] = useState(null);
  const [billData, setBillData] = useState(null);
  const [consumable, setConsumable] = useState(null);

  const handleCalculate = () => {
    setConsumable(null);
    setFinance(null);
    
    const result = calculateBill(kwh);
    setBillData(result);
  };

  const handleRefinance = (amount) => {
    setBillData(null);
    setKwh(null);
    
    const result = calculateConsumable(amount);
    setConsumable(result);
  };

  return (
    <main className="text-center">
      <section>
        <header>
          <h1>TNB Calculator 2016 (Household)</h1>
          <p>Calculate your electricity bill here!</p>
        </header>
        <TariffTable />
        <ConsumptionInput
          kwh={kwh}
          setKwh={setKwh}
          onCalculate={handleCalculate}
        />
        <PredictionInput
          finance={finance}
          setFinance={setFinance}
          onRefinance={handleRefinance}
        />
        <ConsumableSummary consumable={consumable} />
        <BillingSummary billData={billData} />
        <NotesSection />
      </section>
    </main>
  );
};