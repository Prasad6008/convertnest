import React from 'react';
import { Calculator } from 'lucide-react';

export const CALCULATOR_TOOLS = [
  {
    id: 'gst-calculator',
    title: 'GST Calculator',
    description: 'Calculate GST inclusive/exclusive price.'
  },
  {
    id: 'emi-calculator',
    title: 'EMI Calculator',
    description: 'Calculate monthly loan EMI.'
  },
  {
    id: 'discount-calculator',
    title: 'Discount Calculator',
    description: 'Calculate discount and final price.'
  },
  {
    id: 'percentage-calculator',
    title: 'Percentage Calculator',
    description: 'Find percentage values quickly.'
  },
  {
    id: 'length-converter',
    title: 'Length Converter',
    description: 'Meter, feet, inch, km and mile.'
  },
  {
    id: 'weight-converter',
    title: 'Weight Converter',
    description: 'KG, gram, pound and ounce.'
  },
  {
    id: 'temperature-converter',
    title: 'Temperature Converter',
    description: 'Celsius, Fahrenheit and Kelvin.'
  },
  {
    id: 'data-storage',
    title: 'Data Storage Converter',
    description: 'KB, MB, GB and TB converter.'
  },
  {
    id: 'date-difference',
    title: 'Date Difference Calculator',
    description: 'Calculate days between dates.'
  },
  {
    id: 'number-to-words',
    title: 'Indian Number to Words',
    description: 'Convert rupee amount into words.'
  }
];

const lengthUnits = {
  meter: 1,
  kilometer: 1000,
  centimeter: 0.01,
  millimeter: 0.001,
  inch: 0.0254,
  foot: 0.3048,
  yard: 0.9144,
  mile: 1609.344
};

const weightUnits = {
  kilogram: 1,
  gram: 0.001,
  milligram: 0.000001,
  pound: 0.45359237,
  ounce: 0.0283495,
  ton: 1000
};

const dataUnits = {
  B: 1,
  KB: 1024,
  MB: 1024 ** 2,
  GB: 1024 ** 3,
  TB: 1024 ** 4
};

const unitMap = {
  'length-converter': Object.keys(lengthUnits),
  'weight-converter': Object.keys(weightUnits),
  'temperature-converter': ['C', 'F', 'K'],
  'data-storage': Object.keys(dataUnits)
};

function getInitialValues(toolId) {
  switch (toolId) {
    case 'length-converter':
      return { a: '', b: '', c: '', from: 'meter', to: 'foot' };

    case 'weight-converter':
      return { a: '', b: '', c: '', from: 'kilogram', to: 'gram' };

    case 'temperature-converter':
      return { a: '', b: '', c: '', from: 'C', to: 'F' };

    case 'data-storage':
      return { a: '', b: '', c: '', from: 'KB', to: 'MB' };

    default:
      return { a: '', b: '', c: '', from: '', to: '' };
  }
}

function emi(principal, annualRate, months) {
  const r = annualRate / 12 / 100;

  if (!months) return 0;
  if (!r) return principal / months;

  return (
    (principal * r * Math.pow(1 + r, months)) /
    (Math.pow(1 + r, months) - 1)
  );
}

function formatNumber(value, decimals = 6) {
  if (!Number.isFinite(value)) return '0';

  const fixed = Number(value.toFixed(decimals));

  return fixed.toLocaleString('en-IN', {
    maximumFractionDigits: decimals
  });
}

function convertTemperature(value, from, to) {
  let celsius = Number(value);

  if (from === 'F') celsius = ((celsius - 32) * 5) / 9;
  if (from === 'K') celsius = celsius - 273.15;

  if (to === 'F') return (celsius * 9) / 5 + 32;
  if (to === 'K') return celsius + 273.15;

  return celsius;
}

const ones = [
  '',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen'
];

const tens = [
  '',
  '',
  'twenty',
  'thirty',
  'forty',
  'fifty',
  'sixty',
  'seventy',
  'eighty',
  'ninety'
];

function twoDigits(n) {
  if (n < 20) return ones[n];

  return `${tens[Math.floor(n / 10)]} ${ones[n % 10]}`.trim();
}

function numberToWords(num) {
  num = Math.floor(Number(num));

  if (!num) return 'zero';

  const parts = [];

  const crore = Math.floor(num / 10000000);
  num %= 10000000;

  const lakh = Math.floor(num / 100000);
  num %= 100000;

  const thousand = Math.floor(num / 1000);
  num %= 1000;

  const hundred = Math.floor(num / 100);
  num %= 100;

  if (crore) parts.push(`${twoDigits(crore)} crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} thousand`);
  if (hundred) parts.push(`${ones[hundred]} hundred`);
  if (num) parts.push(twoDigits(num));

  return parts.join(' ').replace(/\s+/g, ' ');
}

function isValidNumber(value) {
  return value !== '' && !Number.isNaN(Number(value));
}

export default function CalculatorTools({ tool }) {
  const [values, setValues] = React.useState(() => getInitialValues(tool.id));
  const [result, setResult] = React.useState('');

  React.useEffect(() => {
    setValues(getInitialValues(tool.id));
    setResult('');
  }, [tool.id]);

  function setValue(key, value) {
    setValues(prev => ({
      ...prev,
      [key]: value
    }));

    setResult('');
  }

  function calculate() {
    const a = Number(values.a);
    const b = Number(values.b);
    const c = Number(values.c);

    let output = '';

    try {
      switch (tool.id) {
        case 'gst-calculator': {
          if (!isValidNumber(values.a) || !isValidNumber(values.b)) {
            output = 'Please enter amount and GST percentage.';
            break;
          }

          const gst = (a * b) / 100;

          output = `Base Amount: ₹${a.toFixed(2)}
GST ${b}%: ₹${gst.toFixed(2)}
Total: ₹${(a + gst).toFixed(2)}`;
          break;
        }

        case 'emi-calculator': {
          if (
            !isValidNumber(values.a) ||
            !isValidNumber(values.b) ||
            !isValidNumber(values.c)
          ) {
            output = 'Please enter loan amount, interest rate and tenure.';
            break;
          }

          const monthly = emi(a, b, c);

          output = `Monthly EMI: ₹${monthly.toFixed(2)}
Total Payment: ₹${(monthly * c).toFixed(2)}
Interest: ₹${(monthly * c - a).toFixed(2)}`;
          break;
        }

        case 'discount-calculator': {
          if (!isValidNumber(values.a) || !isValidNumber(values.b)) {
            output = 'Please enter amount and discount percentage.';
            break;
          }

          const discount = (a * b) / 100;

          output = `Discount: ₹${discount.toFixed(2)}
Final Price: ₹${(a - discount).toFixed(2)}`;
          break;
        }

        case 'percentage-calculator': {
          if (!isValidNumber(values.a) || !isValidNumber(values.b)) {
            output = 'Please enter number and percentage.';
            break;
          }

          output = `${b}% of ${a} = ${formatNumber((a * b) / 100, 2)}`;
          break;
        }

        case 'length-converter': {
          if (!isValidNumber(values.a)) {
            output = 'Please enter a value.';
            break;
          }

          const converted =
            (a * lengthUnits[values.from]) / lengthUnits[values.to];

          output = `${formatNumber(a)} ${values.from} = ${formatNumber(
            converted
          )} ${values.to}`;
          break;
        }

        case 'weight-converter': {
          if (!isValidNumber(values.a)) {
            output = 'Please enter a value.';
            break;
          }

          const converted =
            (a * weightUnits[values.from]) / weightUnits[values.to];

          output = `${formatNumber(a)} ${values.from} = ${formatNumber(
            converted
          )} ${values.to}`;
          break;
        }

        case 'temperature-converter': {
          if (!isValidNumber(values.a)) {
            output = 'Please enter a temperature value.';
            break;
          }

          const converted = convertTemperature(a, values.from, values.to);

          output = `${formatNumber(a, 2)}°${values.from} = ${formatNumber(
            converted,
            2
          )}°${values.to}`;
          break;
        }

        case 'data-storage': {
          if (!isValidNumber(values.a)) {
            output = 'Please enter a storage value.';
            break;
          }

          const converted =
            (a * dataUnits[values.from]) / dataUnits[values.to];

          output = `${formatNumber(a)} ${values.from} = ${formatNumber(
            converted
          )} ${values.to}`;
          break;
        }

        case 'date-difference': {
          if (!values.a || !values.b) {
            output = 'Please choose both start date and end date.';
            break;
          }

          const start = new Date(values.a);
          const end = new Date(values.b);

          if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            output = 'Please choose valid dates.';
            break;
          }

          const days = Math.round(
            Math.abs(end - start) / (1000 * 60 * 60 * 24)
          );

          output = `${days} day(s)`;
          break;
        }

        case 'number-to-words': {
          if (!isValidNumber(values.a)) {
            output = 'Please enter an amount.';
            break;
          }

          output = `${numberToWords(a)} rupees only`;
          break;
        }

        default:
          output = 'Unsupported calculator.';
      }
    } catch {
      output = 'Something went wrong. Please check your input.';
    }

    setResult(output);
  }

  const isConverter = [
    'length-converter',
    'weight-converter',
    'temperature-converter',
    'data-storage'
  ].includes(tool.id);

  return (
    <div className="workspace">
      {tool.id === 'date-difference' ? (
        <div className="input-grid">
          <label className="input-group">
            <span>Start date</span>
            <input
              type="date"
              value={values.a}
              onChange={event => setValue('a', event.target.value)}
            />
          </label>

          <label className="input-group">
            <span>End date</span>
            <input
              type="date"
              value={values.b}
              onChange={event => setValue('b', event.target.value)}
            />
          </label>
        </div>
      ) : isConverter ? (
        <div className="input-grid">
          <label className="input-group">
            <span>Value</span>
            <input
              type="number"
              value={values.a}
              onChange={event => setValue('a', event.target.value)}
              // placeholder="Example: 1024"
            />
          </label>

          <label className="input-group">
            <span>From</span>
            <select
              value={values.from}
              onChange={event => setValue('from', event.target.value)}
            >
              {unitMap[tool.id].map(unit => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </label>

          <label className="input-group">
            <span>To</span>
            <select
              value={values.to}
              onChange={event => setValue('to', event.target.value)}
            >
              {unitMap[tool.id].map(unit => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : (
        <div className="input-grid">
          <label className="input-group">
            <span>
              {tool.id === 'emi-calculator'
                ? 'Loan Amount'
                : tool.id === 'number-to-words'
                  ? 'Amount'
                  : 'Amount / Number'}
            </span>

            <input
              type="number"
              value={values.a}
              onChange={event => setValue('a', event.target.value)}
              placeholder="Example: 1000"
            />
          </label>

          {!['number-to-words'].includes(tool.id) ? (
            <label className="input-group">
              <span>
                {tool.id === 'emi-calculator'
                  ? 'Annual Interest %'
                  : tool.id === 'gst-calculator'
                    ? 'GST %'
                    : 'Percentage %'}
              </span>

              <input
                type="number"
                value={values.b}
                onChange={event => setValue('b', event.target.value)}
                placeholder="Example: 18"
              />
            </label>
          ) : null}

          {tool.id === 'emi-calculator' ? (
            <label className="input-group">
              <span>Tenure in months</span>

              <input
                type="number"
                value={values.c}
                onChange={event => setValue('c', event.target.value)}
                placeholder="Example: 24"
              />
            </label>
          ) : null}
        </div>
      )}

      <button className="primary-btn" type="button" onClick={calculate}>
        <Calculator size={18} />
        Calculate
      </button>

      <div className="output-box">
        {result || 'Result will appear here.'}
      </div>
    </div>
  );
}