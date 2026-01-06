import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChartLine, FaShoppingBag, FaDollarSign, FaCrown } from 'react-icons/fa';

const Revenue = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        revenue: 0,
        orders: 0,
        averageOrderValue: 0,
        topProducts: []
    });

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const response = await axios.get('http://localhost:3005/api/analytics');
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#181539', color: 'white' }}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6" style={{ backgroundColor: '#181539', color: '#fff' }}>
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-yellow-500">Revenue & Analytics</h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Total Revenue */}
                    <div className="rounded-2xl p-6 shadow-lg relative overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', border: '1px solid rgba(255, 193, 7, 0.2)' }}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-400 mb-1">Total Earnings</p>
                                <h3 className="text-3xl font-bold text-white">${data.revenue.toLocaleString()}</h3>
                            </div>
                            <div className="p-3 rounded-full bg-green-500/20 text-green-500">
                                <FaDollarSign size={24} />
                            </div>
                        </div>
                    </div>

                    {/* Total Orders */}
                    <div className="rounded-2xl p-6 shadow-lg relative overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', border: '1px solid rgba(255, 193, 7, 0.2)' }}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-400 mb-1">Total Orders</p>
                                <h3 className="text-3xl font-bold text-white">{data.orders.toLocaleString()}</h3>
                            </div>
                            <div className="p-3 rounded-full bg-blue-500/20 text-blue-500">
                                <FaShoppingBag size={24} />
                            </div>
                        </div>
                    </div>

                    {/* Avg Order Value */}
                    <div className="rounded-2xl p-6 shadow-lg relative overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', border: '1px solid rgba(255, 193, 7, 0.2)' }}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gray-400 mb-1">Avg. Order Value</p>
                                <h3 className="text-3xl font-bold text-white">${data.averageOrderValue.toLocaleString()}</h3>
                            </div>
                            <div className="p-3 rounded-full bg-purple-500/20 text-purple-500">
                                <FaChartLine size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Products Table */}
                <div className="rounded-2xl p-6 shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', border: '1px solid rgba(255, 193, 7, 0.2)' }}>
                    <div className="flex items-center mb-6">
                        <FaCrown className="text-yellow-500 mr-3" size={20} />
                        <h2 className="text-xl font-bold text-white">Top Selling Products</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-gray-400 border-b border-gray-700">
                                    <th className="pb-4 pl-4">Rank</th>
                                    <th className="pb-4">Product Name</th>
                                    <th className="pb-4 text-center">Units Sold</th>
                                    <th className="pb-4 text-right pr-4">Revenue Generated</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-300">
                                {data.topProducts.map((item, index) => (
                                    <tr key={item._id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                                        <td className="py-4 pl-4 font-mono text-yellow-500">#{index + 1}</td>
                                        <td className="py-4 font-medium text-white">{item.name}</td>
                                        <td className="py-4 text-center">{item.totalSold}</td>
                                        <td className="py-4 text-right pr-4">${item.revenue.toLocaleString()}</td>
                                    </tr>
                                ))}
                                {data.topProducts.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-center py-8 text-gray-500">No sales data available yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Revenue;
