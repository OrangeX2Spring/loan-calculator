"use client";

import { useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

interface MonthlyData {
  month: number;
  principal: number;
  interest: number;
}

interface LoanResult {
  monthly_payment: number;
  total_payment: number;
  data: MonthlyData[];
}

export default function LoanCalculator() {
  const [amount, setAmount] = useState(100000);
  const [rate, setRate] = useState(3.5);
  const [years, setYears] = useState(20);
  const [result, setResult] = useState<LoanResult | null>(null);

  const calculateLoan = async () => {
    const response = await fetch(
      `http://localhost:8080/calculate-loan?amount=${amount}&rate=${rate}&years=${years}`
    );
    const data = await response.json();
    setResult(data);
  };

  // Mock calculation function (replace API call)
  const calculateLoanMock = () => {
    // Simulating a simple loan calculation
    const months = years * 12;
    const monthlyRate = rate / 100 / 12;
    const monthlyPayment =
      (amount * monthlyRate * (1 + monthlyRate) ** months) /
      ((1 + monthlyRate) ** months - 1);
    const totalPayment = monthlyPayment * months;
    
    let remainingBalance = amount;
    const monthlyData = [];
    for (let i = 1; i <= months; i++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;
      monthlyData.push({
        month: i,
        principal: principalPayment,
        interest: interestPayment,
      });
    }

    setResult({ monthly_payment: monthlyPayment, total_payment: totalPayment, data: monthlyData });
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Loan & Insurance Calculator</h1>
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <label className="block mb-2">Loan Amount (€)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full p-2 border rounded mb-4"
        />
        <label className="block mb-2">Interest Rate (%)</label>
        <input
          type="number"
          value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
          className="w-full p-2 border rounded mb-4"
        />
        <label className="block mb-2">Loan Term (Years)</label>
        <input
          type="number"
          value={years}
          onChange={(e) => setYears(Number(e.target.value))}
          className="w-full p-2 border rounded mb-4"
        />
        <button
          onClick={calculateLoan}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          Calculate
        </button>
      </div>

      {result && (
        <div className="mt-6 w-full grid grid-cols-1 md:grid-cols-2 gap-6 px-4 md:px-8 max-w-[1200px]">
          <div className="bg-white p-4 rounded-lg shadow-md w-full">
            <h2 className="text-xl font-bold mb-2">Monthly Payment Breakdown</h2>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-gray-300 px-4 py-2">Month</th>
                  <th className="border border-gray-300 px-4 py-2">Principal (€)</th>
                  <th className="border border-gray-300 px-4 py-2">Interest (€)</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((entry) => (
                    <tr key={entry.month} className="odd:bg-gray-100">
                      <td className="border border-gray-300 px-4 py-2">{entry.month}</td>
                      <td className="border border-gray-300 px-4 py-2">{entry.principal.toFixed(2)}</td>
                      <td className="border border-gray-300 px-4 py-2">{entry.interest.toFixed(2)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md w-full flex justify-center">
            <div className="w-full h-[400px]">
              <h2 className="text-xl font-bold mb-2">Loan vs Interest Ratio</h2>
              <Bar
                data={{
                  labels: result.data.map((entry) => entry.month),
                  datasets: [
                    {
                      label: "Interest (€)",
                      data: result.data.map((entry) => entry.interest),
                      backgroundColor: "#EC4899",
                      stack: "Stack 0",
                    },
                    {
                      label: "Principal (€)",
                      data: result.data.map((entry) => entry.principal),
                      backgroundColor: "#4F46E5",
                      stack: "Stack 0",
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: { stacked: true },
                    y: { stacked: true },
                  },
                }}
                height={150}
              />
              </div>
          </div>
        </div>
      )}
    </div>
  );
}
