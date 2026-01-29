import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function BudgetSetup() {
  const navigate = useNavigate();

  const [income, setIncome] = useState(0);
  const [savings, setSavings] = useState(0);

  const [budgets, setBudgets] = useState({
    Food: 0,
    Rent: 0,
    Shopping: 0,
    Travel: 0,
    Bills: 0,
  });

  const [investments, setInvestments] = useState({
    MutualFunds: 0,
    Stocks: 0,
    Crypto: 0,
  });

  const handleSave = () => {
    const data = {
      income,
      savings,
      budgets,
      investments,
    };

    localStorage.setItem("financeProfile", JSON.stringify(data));
    navigate("/dashboard");
  };

  return (
    <div className="dashboard">
      <h1>Set Your Monthly Budget</h1>

      <div className="filters">
        <input
          type="number"
          placeholder="Monthly Income"
          onChange={(e) => setIncome(Number(e.target.value))}
        />
        <input
          type="number"
          placeholder="Savings Target"
          onChange={(e) => setSavings(Number(e.target.value))}
        />
      </div>

      <h2>Category Budgets</h2>
      <div className="insights">
        {Object.keys(budgets).map((key) => (
          <div className="card" key={key}>
            <h3>{key}</h3>
            <input
              type="number"
              placeholder="Budget"
              onChange={(e) =>
                setBudgets({ ...budgets, [key]: Number(e.target.value) })
              }
            />
          </div>
        ))}
      </div>

      <h2>Investments Plan</h2>
      <div className="insights">
        {Object.keys(investments).map((key) => (
          <div className="card" key={key}>
            <h3>{key}</h3>
            <input
              type="number"
              placeholder="Amount"
              onChange={(e) =>
                setInvestments({
                  ...investments,
                  [key]: Number(e.target.value),
                })
              }
            />
          </div>
        ))}
      </div>

      <button className="download-btn" onClick={handleSave}>
        Save & Go to Dashboard
      </button>
    </div>
  );
}
