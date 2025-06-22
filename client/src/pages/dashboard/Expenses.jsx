// HouseholdExpenses.jsx
import React, { useState } from 'react';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import '../../styles/Dashboard/expenses.css';

// Sample data - Asal app mein yeh API se aayega
const initialExpenses = [
    { id: 1, date: '2023-10-25', description: 'Groceries from BigBasket', category: 'Food', amount: 3200, paidBy: 'Rohan' },
    { id: 2, date: '2023-10-24', description: 'Electricity Bill', category: 'Utilities', amount: 1500, paidBy: 'Priya' },
    { id: 3, date: '2023-10-23', description: 'Petrol for Car', category: 'Transport', amount: 1000, paidBy: 'Rohan' },
    { id: 4, date: '2023-10-22', description: 'Movie Tickets', category: 'Entertainment', amount: 850, paidBy: 'Priya' },
    { id: 5, date: '2023-10-22', description: 'Kids School Fees', category: 'Education', amount: 7500, paidBy: 'Rohan' },
    { id: 6, date: '2023-10-20', description: 'Swiggy Dinner', category: 'Food', amount: 600, paidBy: 'Priya' },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

const HouseholdExpenses = () => {
    const [expenses, setExpenses] = useState(initialExpenses);
    const [formState, setFormState] = useState({
        description: '',
        category: 'Food',
        amount: '',
        date: new Date().toISOString().slice(0, 10),
        paidBy: 'Rohan'
    });

    // Calculate total expenses for the summary card
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Prepare data for the pie chart (spending by category)
    const categoryData = expenses.reduce((acc, expense) => {
        const existingCategory = acc.find(item => item.name === expense.category);
        if (existingCategory) {
            existingCategory.value += expense.amount;
        } else {
            acc.push({ name: expense.category, value: expense.amount });
        }
        return acc;
    }, []);
    
    // Prepare data for bar chart (spending over time)
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


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormState(prevState => ({ ...prevState, [name]: value }));
    };

    const handleAddExpense = (e) => {
        e.preventDefault();
        if (!formState.description || !formState.amount) {
            alert('Please fill out description and amount.');
            return;
        }
        const newExpense = {
            id: Date.now(),
            ...formState,
            amount: parseFloat(formState.amount)
        };
        setExpenses([newExpense, ...expenses]);
        // Reset form
        setFormState({
            description: '', category: 'Food', amount: '', 
            date: new Date().toISOString().slice(0, 10), paidBy: 'Rohan'
        });
    };
    
    const handleDelete = (id) => {
        setExpenses(expenses.filter(exp => exp.id !== id));
    };


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
                            <Tooltip />
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
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="amount" fill="#82ca9d" />
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
                        <select name="paidBy" value={formState.paidBy} onChange={handleInputChange}>
                            <option>Rohan</option>
                            <option>Priya</option>
                        </select>
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
                                <tr key={expense.id}>
                                    <td>{new Date(expense.date).toLocaleDateString('en-IN')}</td>
                                    <td>{expense.description}</td>
                                    <td><span className={`category-badge ${expense.category.toLowerCase()}`}>{expense.category}</span></td>
                                    <td>₹{expense.amount.toLocaleString('en-IN')}</td>
                                    <td>{expense.paidBy}</td>
                                    <td><button className="delete-btn" onClick={() => handleDelete(expense.id)}>Delete</button></td>
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