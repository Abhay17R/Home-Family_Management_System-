// HouseholdExpenses.jsx
import React, { useState, useEffect } from 'react'; // useEffect ko import karein

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import '../../styles/Dashboard/expenses.css';
import api from '../../api/axios'; // NEW: Aapka banaya hua API client import karein

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

const HouseholdExpenses = () => {
    // === STATE MANAGEMENT ===
    const [expenses, setExpenses] = useState([]); // Initial state ab ek empty array hai
    const [loading, setLoading] = useState(true);   // NEW: Loading state
    const [error, setError] = useState(null);        // NEW: Error state
    const [formState, setFormState] = useState({
        description: '',
        category: 'Food',
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        // 'paidBy' ab yahan zaroori nahi, backend handle karega
    });

    // === DATA FETCHING (useEffect) ===
    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                setLoading(true);
                // GET request bhejkar saare expenses fetch karein
                const response = await api.get('/expenses');
                // Backend se `response.data.expenses` mein data aa raha hai
                setExpenses(response.data.expenses);
                setError(null);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch data.');
                console.error("Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchExpenses();
    }, []); // Empty dependency array [] ka matlab yeh sirf ek baar chalega

    // === DATA PROCESSING FOR CHARTS ===
    // Yeh logic ab dynamic 'expenses' state par apne aap kaam karega
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const categoryData = expenses.reduce((acc, expense) => {
        const existingCategory = acc.find(item => item.name === expense.category);
        if (existingCategory) {
            existingCategory.value += expense.amount;
        } else {
            acc.push({ name: expense.category, value: expense.amount });
        }
        return acc;
    }, []);
    const dailySpending = expenses.reduce((acc, expense) => {
        const date = new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        const existingDate = acc.find(item => item.date === date);
        if (existingDate) {
            existingDate.amount += expense.amount;
        } else {
            acc.push({ date: date, amount: expense.amount });
        }
        return acc;
    }, []).sort((a,b) => new Date(a.date) - new Date(b.date));


    // === EVENT HANDLERS ===
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState(prevState => ({ ...prevState, [name]: value }));
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!formState.description || !formState.amount) {
            alert('Please fill out description and amount.');
            return;
        }
        
        try {
            // POST request bhejkar naya expense add karein
            const response = await api.post('/expenses', {
                ...formState,
                amount: parseFloat(formState.amount)
            });
            // State ko update karein, naya expense list mein sabse upar dikhega
            setExpenses([response.data.expense, ...expenses]);
            // Form ko reset karein
            setFormState({
                description: '', category: 'Food', amount: '', 
                date: new Date().toISOString().slice(0, 10)
            });
        } catch (err) {
            alert(err.response?.data?.message || 'Could not add expense.');
            console.error("Add Expense Error:", err);
        }
    };
    
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this transaction?")) return;

        try {
            // DELETE request bhejkar expense ko uski ID se delete karein
            await api.delete(`/expense/${id}`);
            // State se us expense ko filter karke hata dein
            setExpenses(expenses.filter(exp => exp._id !== id));
        } catch (err) {
            alert(err.response?.data?.message || 'Could not delete expense.');
            console.error("Delete Error:", err);
        }
    };

    // === RENDER LOGIC ===
    if (loading) {
        return <div className="expenses-container"><h1>Loading your expenses...</h1></div>;
    }

    if (error) {
        return <div className="expenses-container"><h1>Error: {error}</h1></div>;
    }

    return (
        <div className="expenses-container">
            <h1 className="main-title">Household Expenses</h1>

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="card">
                    <h3>Total Spending (This Month)</h3>
                    <p>₹{totalExpenses.toLocaleString('en-IN')}</p>
                </div>
                <div className="card">
                    <h3>Highest Spending Category</h3>
                    <p>{categoryData.length > 0 ? categoryData.reduce((max, cat) => cat.value > max.value ? cat : max).name : 'N/A'}</p>
                </div>
                 <div className="card">
                    <h3>Total Transactions</h3>
                    <p>{expenses.length}</p>
                </div>
            </div>

            {/* Charts/Graphs */}
            <div className="charts-section">
                <div className="chart-container">
                    <h3>Spending by Category</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                 <div className="chart-container">
                    <h3>Daily Spending Trend</h3>
                     <ResponsiveContainer width="100%" height={300}>
                         <BarChart data={dailySpending}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                            <Legend />
                            <Bar dataKey="amount" fill="#82ca9d" name="Spending" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Add Expense Form and Recent Expenses Table */}
            <div className="data-section">
                <div className="expense-form-container">
                    <h3>Add New Expense</h3>
                    <form className="expense-form" onSubmit={handleAddExpense}>
                        <input type="text" name="description" value={formState.description} onChange={handleInputChange} placeholder="Expense Description" required />
                        <input type="number" name="amount" value={formState.amount} onChange={handleInputChange} placeholder="Amount (₹)" required />
                        <select name="category" value={formState.category} onChange={handleInputChange}>
                            <option>Food</option>
                            <option>Utilities</option>
                            <option>Transport</option>
                            <option>Entertainment</option>
                            <option>Education</option>
                            <option>Health</option>
                            <option>Other</option>
                        </select>
                        {/* 'Paid By' dropdown hata diya gaya hai */}
                        <input type="date" name="date" value={formState.date} onChange={handleInputChange} required />
                        <button type="submit">Add Expense</button>
                    </form>
                </div>
                <div className="expense-table-container">
                    <h3>Recent Transactions</h3>
                    <table className="expense-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Paid By</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map(expense => (
                                // CHANGE: Key ab MongoDB ka `_id` hoga
                                <tr key={expense._id}> 
                                    <td>{new Date(expense.date).toLocaleDateString('en-IN')}</td>
                                    <td>{expense.description}</td>
                                    <td><span className={`category-badge ${expense.category.toLowerCase()}`}>{expense.category}</span></td>
                                    <td>₹{expense.amount.toLocaleString('en-IN')}</td>
                                    {/* CHANGE: 'paidBy' ab ek object hai, jismein 'name' hai */}
                                    <td>{expense.paidBy?.name || '...'}</td> 
                                    <td>
                                        {/* CHANGE: handleDelete ko ab `_id` pass hoga */}
                                        <button className="delete-btn" onClick={() => handleDelete(expense._id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HouseholdExpenses;