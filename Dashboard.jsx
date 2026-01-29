import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./Dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const YEARS = ["2024", "2025", "2026"];

const ALL_EXPENSES = ["Food", "Rent", "Shopping", "Travel", "Bills"];
const ALL_INVESTMENTS = ["Bank", "Mutual Funds", "Stocks", "Crypto"];

export default function Dashboard() {
  const navigate = useNavigate();
  const dashboardRef = useRef();

  /* 🔐 AUTH */
  useEffect(() => {
    if (!localStorage.getItem("token")) navigate("/");
  }, [navigate]);

  /* LOGOUT (UNCHANGED) */
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  /* ===================== STATE ===================== */
  const [selectedMonth, setSelectedMonth] = useState("January");
  const [selectedYear, setSelectedYear] = useState("2025");

  const [activeExpenses, setActiveExpenses] = useState([]);
  const [activeInvestments, setActiveInvestments] = useState([]);

  const [monthlyBudget, setMonthlyBudget] = useState({});
  const [dataStore, setDataStore] = useState({}); // year → month → data

  /* ====== HELPERS ====== */
  const getMonthData = () => {
    return (
      dataStore?.[selectedYear]?.[selectedMonth] || {
        income: "",
        expenses: {},
        investments: {},
      }
    );
  };

  const current = getMonthData();

  const updateMonthData = (section, key, value) => {
    setDataStore(prev => ({
      ...prev,
      [selectedYear]: {
        ...prev[selectedYear],
        [selectedMonth]: {
          ...getMonthData(),
          [section]: {
            ...getMonthData()[section],
            [key]: value,
          },
        },
      },
    }));
  };

  /* RESET selections on month/year change */
  useEffect(() => {
    setActiveExpenses([]);
    setActiveInvestments([]);
  }, [selectedMonth, selectedYear]);

  /* ================= CALCULATIONS ================= */
  const totalExpense = activeExpenses.reduce(
    (sum, c) => sum + Number(current.expenses?.[c] || 0),
    0
  );

  const totalInvestment = activeInvestments.reduce(
    (sum, c) => sum + Number(current.investments?.[c] || 0),
    0
  );

  const balance =
    Number(current.income || 0) - totalExpense - totalInvestment;

  /* ================= BUDGET ALERTS ================= */
  const alerts = [];

  Object.keys(dataStore?.[selectedYear] || {}).forEach(month => {
    activeExpenses.forEach(cat => {
      if (
        Number(dataStore[selectedYear][month]?.expenses?.[cat]) >
        Number(monthlyBudget[cat])
      ) {
        alerts.push(`${month} → ${cat}`);
      }
    });
  });

  /* ================= CHART OPTIONS ================= */
  const chartOptions = {
    plugins: {
      legend: {
        labels: { color: "#fff", font: { weight: "bold" } },
      },
    },
    scales: {
      x: { ticks: { color: "#fff" }, grid: { color: "rgba(255,255,255,0.2)" } },
      y: { ticks: { color: "#fff" }, grid: { color: "rgba(255,255,255,0.2)" } },
    },
  };

  const expenseChart = {
    labels: activeExpenses,
    datasets: [{
      label: "Expenses",
      data: activeExpenses.map(e => Number(current.expenses?.[e] || 0)),
      backgroundColor: "#7BC5C1",
    }],
  };

  const investmentChart = {
    labels: activeInvestments,
    datasets: [{
      data: activeInvestments.map(i => Number(current.investments?.[i] || 0)),
      backgroundColor: ["#4ade80", "#60a5fa", "#fbbf24", "#f472b6"],
    }],
  };

  /* ================= MULTI-MONTH DOWNLOAD ================= */
  const [downloadMonths, setDownloadMonths] = useState([]);

  const handleDownloadPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");

    for (let i = 0; i < downloadMonths.length; i++) {
      setSelectedMonth(downloadMonths[i]);
      await new Promise(r => setTimeout(r, 300));

      const canvas = await html2canvas(dashboardRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, 0, w, h);
    }

    pdf.save(`Finance_${selectedYear}.pdf`);
  };

  return (
    <div className="dashboard" ref={dashboardRef}>
      {/* ACTIONS */}
      <div className="top-actions">
        <button className="download-btn" onClick={handleDownloadPDF}>
          Download PDF
        </button>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <h1>Personal Finance Dashboard</h1>

      {/* YEAR + MONTH */}
      <div className="filters">
        <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
          {YEARS.map(y => <option key={y}>{y}</option>)}
        </select>

        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
          {MONTHS.map(m => <option key={m}>{m}</option>)}
        </select>
      </div>

      {/* MULTI MONTH DOWNLOAD */}
      <h3>Select Months to Download</h3>
      <div className="insights">
        {MONTHS.map(m => (
          <label key={m} className="card">
            <input
              type="checkbox"
              checked={downloadMonths.includes(m)}
              onChange={() =>
                setDownloadMonths(prev =>
                  prev.includes(m)
                    ? prev.filter(x => x !== m)
                    : [...prev, m]
                )
              }
            />
            {m}
          </label>
        ))}
      </div>

      {/* INCOME */}
      <div className="filters">
        <input
          type="number"
          placeholder="Monthly Income"
          value={current.income}
          onChange={e =>
            setDataStore(prev => ({
              ...prev,
              [selectedYear]: {
                ...prev[selectedYear],
                [selectedMonth]: { ...current, income: e.target.value },
              },
            }))
          }
        />
      </div>

      {/* EXPENSE SELECT */}
      <h3>Select Expenses</h3>
      <div className="insights">
        {ALL_EXPENSES.map(cat => (
          <label key={cat} className="card">
            <input
              type="checkbox"
              checked={activeExpenses.includes(cat)}
              onChange={() =>
                setActiveExpenses(p =>
                  p.includes(cat) ? p.filter(x => x !== cat) : [...p, cat]
                )
              }
            />
            {cat}
          </label>
        ))}
      </div>

      {/* INVESTMENT SELECT */}
      <h3>Select Investments</h3>
      <div className="insights">
        {ALL_INVESTMENTS.map(cat => (
          <label key={cat} className="card">
            <input
              type="checkbox"
              checked={activeInvestments.includes(cat)}
              onChange={() =>
                setActiveInvestments(p =>
                  p.includes(cat) ? p.filter(x => x !== cat) : [...p, cat]
                )
              }
            />
            {cat}
          </label>
        ))}
      </div>

      {/* BUDGET */}
      <h3>Monthly Budget</h3>
      <div className="insights">
        {activeExpenses.map(cat => (
          <div className="card" key={cat}>
            <h4>{cat}</h4>
            <input
              type="number"
              placeholder="Budget"
              value={monthlyBudget[cat] || ""}
              onChange={e =>
                setMonthlyBudget({ ...monthlyBudget, [cat]: e.target.value })
              }
            />
          </div>
        ))}
      </div>

      {/* EXPENSE INPUT */}
      <h3>{selectedMonth} Expenses</h3>
      <div className="insights">
        {activeExpenses.map(cat => (
          <div className="card" key={cat}>
            <h4>{cat}</h4>
            <input
              type="number"
              placeholder="Expense"
              value={current.expenses?.[cat] || ""}
              onChange={e => updateMonthData("expenses", cat, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* INVESTMENT INPUT */}
      <h3>{selectedMonth} Investments</h3>
      <div className="insights">
        {activeInvestments.map(cat => (
          <div className="card" key={cat}>
            <h4>{cat}</h4>
            <input
              type="number"
              placeholder="Amount"
              value={current.investments?.[cat] || ""}
              onChange={e => updateMonthData("investments", cat, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* SUMMARY */}
      <div className="insights">
        <div className="card"><h3>Total Expense</h3><p>₹ {totalExpense}</p></div>
        <div className="card"><h3>Total Investment</h3><p>₹ {totalInvestment}</p></div>
        <div className="card"><h3>Balance</h3><p>₹ {balance}</p></div>
      </div>

      {/* ALERTS */}
      {alerts.length > 0 && (
        <div className="card" style={{ background: "rgba(255,0,0,0.25)" }}>
          <h3>⚠ Budget Exceeded</h3>
          <p>{alerts.join(", ")}</p>
        </div>
      )}

      {/* CHARTS (UNCHANGED) */}
      <div className="charts">
        <div className="chart-card">
          <h3>Expenses</h3>
          <Bar data={expenseChart} options={chartOptions} />
        </div>
        <div className="chart-card">
          <h3>Investments</h3>
          <Pie data={investmentChart} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}


