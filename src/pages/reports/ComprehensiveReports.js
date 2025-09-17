import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from "../../components/Layout";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ComposedChart } from 'recharts';
import './ComprehensiveReports.css';
import APP_CONSTANTS from "../../appConstants";
import * as AppFunc from "../../lib/AppFunctions";

function ComprehensiveReports() {
    const [filterOptions, setFilterOptions] = useState({
        verticals: [],
        datePresets: []
    });
    // Set default to next 8 weeks
    const today = new Date();
    const next8Weeks = new Date();
    next8Weeks.setDate(today.getDate() + 56); // 8 weeks
    
    // Get user's line of business ID for non-administrator users
    const userLineOfBusinessId = AppFunc.activeUser?.line_of_business_id;
    const isAdministrator = AppFunc.activeUserRole === APP_CONSTANTS.USER_ROLES.ADMINISTRATOR;
    
    const [selectedFilters, setSelectedFilters] = useState({
        // Global filters (for backward compatibility)
        vertical: isAdministrator ? 'all' : userLineOfBusinessId || 'all',
        datePreset: 'next_8_weeks',
        startDate: today.toISOString().split('T')[0],
        endDate: next8Weeks.toISOString().split('T')[0],
        
        // Individual section filters
        metrics: {
            vertical: isAdministrator ? 'all' : userLineOfBusinessId || 'all',
            datePreset: 'next_8_weeks',
            startDate: today.toISOString().split('T')[0],
            endDate: next8Weeks.toISOString().split('T')[0]
        },
        utilization: {
            vertical: isAdministrator ? 'all' : userLineOfBusinessId || 'all',
            datePreset: 'last_month',
            startDate: '',
            endDate: ''
        },
        allocation: {
            vertical: isAdministrator ? 'all' : userLineOfBusinessId || 'all',
            datePreset: 'next_8_weeks',
            startDate: today.toISOString().split('T')[0],
            endDate: next8Weeks.toISOString().split('T')[0]
        }
    });
    const [metrics, setMetrics] = useState({
        activeHC: 0,
        utilizationPercentage: 0,
        allocationForecastPercentage: 0
    });
    const [utilizationTrends, setUtilizationTrends] = useState([]);
    const [allocationForecast, setAllocationForecast] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFilterOptions();
        fetchDashboardData();
    }, []);

    const fetchFilterOptions = async () => {
        try {
            const response = await axios.get('/reports/filter-options');
            setFilterOptions(response.data);
        } catch (error) {
            console.error('Error fetching filter options:', error);
            setError('Failed to load filter options');
        }
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Build metrics parameters
            const metricsParams = new URLSearchParams({
                metricsVertical: selectedFilters.metrics.vertical,
                metricsDatePreset: selectedFilters.metrics.datePreset
            });
            
            if (selectedFilters.metrics.datePreset === 'custom') {
                metricsParams.append('metricsStartDate', selectedFilters.metrics.startDate);
                metricsParams.append('metricsEndDate', selectedFilters.metrics.endDate);
            } else if (selectedFilters.metrics.datePreset === 'next_8_weeks') {
                metricsParams.append('metricsStartDate', selectedFilters.metrics.startDate);
                metricsParams.append('metricsEndDate', selectedFilters.metrics.endDate);
            }

            // Build utilization parameters
            const utilizationParams = new URLSearchParams({
                utilizationVertical: selectedFilters.utilization.vertical,
                utilizationDatePreset: selectedFilters.utilization.datePreset
            });
            
            if (selectedFilters.utilization.datePreset === 'custom') {
                utilizationParams.append('utilizationStartDate', selectedFilters.utilization.startDate);
                utilizationParams.append('utilizationEndDate', selectedFilters.utilization.endDate);
            }

            // Build allocation parameters
            const allocationParams = new URLSearchParams({
                allocationVertical: selectedFilters.allocation.vertical,
                allocationDatePreset: selectedFilters.allocation.datePreset
            });
            
            if (selectedFilters.allocation.datePreset === 'custom') {
                allocationParams.append('allocationStartDate', selectedFilters.allocation.startDate);
                allocationParams.append('allocationEndDate', selectedFilters.allocation.endDate);
            } else if (selectedFilters.allocation.datePreset === 'next_8_weeks') {
                allocationParams.append('allocationStartDate', selectedFilters.allocation.startDate);
                allocationParams.append('allocationEndDate', selectedFilters.allocation.endDate);
            }

            // Combine all parameters
            const allParams = new URLSearchParams();
            [...metricsParams.entries()].forEach(([key, value]) => allParams.append(key, value));
            [...utilizationParams.entries()].forEach(([key, value]) => allParams.append(key, value));
            [...allocationParams.entries()].forEach(([key, value]) => allParams.append(key, value));

            // Fetch metrics
            const metricsResponse = await axios.get(`/reports/dashboard-metrics?${allParams}`);
            setMetrics(metricsResponse.data.metrics);

            // Fetch utilization trends
            const trendsPayload = {
                vertical: selectedFilters.utilization.vertical,
                datePreset: selectedFilters.utilization.datePreset,
                groupBy: 'month'
            };
            
            if (selectedFilters.utilization.datePreset === 'custom') {
                trendsPayload.startDate = selectedFilters.utilization.startDate;
                trendsPayload.endDate = selectedFilters.utilization.endDate;
            }
            
            const trendsResponse = await axios.post('/reports/utilization-trends', trendsPayload);
            setUtilizationTrends(trendsResponse.data.chartData);

            // Fetch allocation forecast
            const forecastResponse = await axios.post('/reports/allocation-forecast', {
                vertical: selectedFilters.allocation.vertical
            });
            setAllocationForecast(forecastResponse.data.chartData);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filterType, value) => {
        setSelectedFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const handleSectionFilterChange = (section, filterType, value) => {
        setSelectedFilters(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [filterType]: value
            }
        }));
    };

    const handleApplyFilters = () => {
        fetchDashboardData();
    };

    const fetchUtilizationTrends = async () => {
        try {
            const trendsPayload = {
                vertical: selectedFilters.utilization.vertical,
                datePreset: selectedFilters.utilization.datePreset,
                groupBy: 'month'
            };
            
            if (selectedFilters.utilization.datePreset === 'custom') {
                trendsPayload.startDate = selectedFilters.utilization.startDate;
                trendsPayload.endDate = selectedFilters.utilization.endDate;
            }
            
            const trendsResponse = await axios.post('/reports/utilization-trends', trendsPayload);
            setUtilizationTrends(trendsResponse.data.chartData);
        } catch (error) {
            console.error('Error fetching utilization trends:', error);
            setError('Failed to load utilization trends data');
        }
    };

    const fetchAllocationForecast = async () => {
        try {
            const forecastResponse = await axios.post('/reports/allocation-forecast', {
                vertical: selectedFilters.allocation.vertical
            });
            setAllocationForecast(forecastResponse.data.chartData);
        } catch (error) {
            console.error('Error fetching allocation forecast:', error);
            setError('Failed to load allocation forecast data');
        }
    };

    const formatUtilizationData = (data) => {
        if (!data || data.length === 0) return [];
        
        // Get all unique periods
        const allPeriods = new Set();
        data.forEach(series => {
            series.data.forEach(point => allPeriods.add(point.period));
        });
        
        const sortedPeriods = Array.from(allPeriods).sort();
        
        // Transform data for chart
        return sortedPeriods.map(period => {
            const dataPoint = { period };
            data.forEach(series => {
                const point = series.data.find(p => p.period === period);
                dataPoint[series.name] = point ? point.utilization : 0;
            });
            return dataPoint;
        });
    };

    const formatAllocationData = (data) => {
        if (!data || data.length === 0) return [];
        
        // Get all unique weeks
        const allWeeks = new Set();
        data.forEach(series => {
            series.data.forEach(point => allWeeks.add(point.week));
        });
        
        const sortedWeeks = Array.from(allWeeks).sort();
        
        // Transform data for chart
        return sortedWeeks.map(week => {
            const dataPoint = { week };
            data.forEach(series => {
                const point = series.data.find(p => p.week === week);
                if (point) {
                    dataPoint[`${series.name}_forecasted`] = point.forecastedHours;
                    dataPoint[`${series.name}_bookable`] = point.bookableHours;
                    dataPoint[`${series.name}_percentage`] = point.allocationPercentage;
                }
            });
            return dataPoint;
        });
    };

    const utilizationChartData = formatUtilizationData(utilizationTrends);
    const allocationChartData = formatAllocationData(allocationForecast);

    return (
        <Layout>
            <div className="comprehensive-reports">
                <div className="reports-header">
                    <h2 className="reports-title">Reports</h2>
                    <p className="reports-subtitle">Real-time insights into utilization, allocation, and workforce metrics</p>
                </div>

                {/* Filter Panel */}
                <div className="filter-panel">
                    <div className="filter-row">
                        {isAdministrator && (
                            <div className="filter-group">
                                <label htmlFor="vertical-filter">Line of Business</label>
                                <select
                                    id="vertical-filter"
                                    value={selectedFilters.vertical}
                                    onChange={(e) => handleFilterChange('vertical', e.target.value)}
                                    className="filter-select"
                                >
                                    {filterOptions.verticals.map(vertical => (
                                        <option key={vertical.id} value={vertical.id}>
                                            {vertical.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="filter-group">
                            <label htmlFor="date-preset-filter">Date Range</label>
                            <select
                                id="date-preset-filter"
                                value={selectedFilters.datePreset}
                                onChange={(e) => handleFilterChange('datePreset', e.target.value)}
                                className="filter-select"
                            >
                                {filterOptions.datePresets.map(preset => (
                                    <option key={preset.id} value={preset.id}>
                                        {preset.name}
                                    </option>
                                ))}
                                <option value="custom">Custom Range</option>
                            </select>
                        </div>

                        {selectedFilters.datePreset === 'custom' && (
                            <>
                                <div className="filter-group">
                                    <label htmlFor="start-date">Start Date</label>
                                    <input
                                        type="date"
                                        id="start-date"
                                        value={selectedFilters.startDate}
                                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                        className="filter-input"
                                    />
                                </div>
                                <div className="filter-group">
                                    <label htmlFor="end-date">End Date</label>
                                    <input
                                        type="date"
                                        id="end-date"
                                        value={selectedFilters.endDate}
                                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                        className="filter-input"
                                    />
                                </div>
                            </>
                        )}

                        <div className="filter-actions">
                            <button
                                onClick={handleApplyFilters}
                                disabled={loading}
                                className="btn btn-primary filter-btn"
                            >
                                {loading ? 'Loading...' : 'Apply Filters'}
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="error-message">
                        <p>{error}</p>
                    </div>
                )}

                {/* Metrics Section */}
                <div className="report-section">
                    {/* Metrics Cards */}
                <div className="metrics-cards">
                    <div className="metric-card">
                        <div className="metric-icon">
                            <i className="fas fa-users"></i>
                        </div>
                        <div className="metric-content">
                            <h3 className="metric-value">{metrics.activeHC}</h3>
                            <p className="metric-label">Active Head Count</p>
                            <p className="metric-description">Resources allocated to projects</p>
                        </div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-icon">
                            <i className="fas fa-chart-line"></i>
                        </div>
                        <div className="metric-content">
                            <h3 className="metric-value">{metrics.utilizationPercentage}%</h3>
                            <p className="metric-label">Utilization %</p>
                            <p className="metric-description">Billed hours vs available hours</p>
                        </div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-icon">
                            <i className="fas fa-calendar-alt"></i>
                        </div>
                        <div className="metric-content">
                            <h3 className="metric-value">{metrics.allocationForecastPercentage}%</h3>
                            <p className="metric-label">Allocation Forecast %</p>
                            <p className="metric-description">Next 8 weeks allocation</p>
                        </div>
                    </div>
                </div>
                </div>

                {/* Utilization Trends Section */}
                <div className="report-section">
                    {/* Utilization Trends Chart */}
                    <div className="chart-container">
                        <div className="chart-header">
                            <div className="chart-title-section">
                                <h3>Utilization Trends</h3>
                                <p>Monthly utilization percentage by line of business</p>
                            </div>
                            <div className="chart-filters">
                                {isAdministrator && (
                                    <div className="filter-group">
                                        <label>Line of Business</label>
                                        <select
                                            value={selectedFilters.utilization.vertical}
                                            onChange={(e) => handleSectionFilterChange('utilization', 'vertical', e.target.value)}
                                            className="filter-select"
                                        >
                                            {filterOptions.verticals.map(vertical => (
                                                <option key={vertical.id} value={vertical.id}>
                                                    {vertical.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div className="filter-group">
                                    <label>Date Range</label>
                                    <select
                                        value={selectedFilters.utilization.datePreset}
                                        onChange={(e) => handleSectionFilterChange('utilization', 'datePreset', e.target.value)}
                                        className="filter-select"
                                    >
                                        {filterOptions.datePresets.map(preset => (
                                            <option key={preset.id} value={preset.id}>
                                                {preset.name}
                                            </option>
                                        ))}
                                        <option value="custom">Custom Range</option>
                                    </select>
                                </div>
                                {selectedFilters.utilization.datePreset === 'custom' && (
                                    <>
                                        <div className="filter-group">
                                            <label>Start Date</label>
                                            <input
                                                type="date"
                                                value={selectedFilters.utilization.startDate}
                                                onChange={(e) => handleSectionFilterChange('utilization', 'startDate', e.target.value)}
                                                className="filter-input"
                                            />
                                        </div>
                                        <div className="filter-group">
                                            <label>End Date</label>
                                            <input
                                                type="date"
                                                value={selectedFilters.utilization.endDate}
                                                onChange={(e) => handleSectionFilterChange('utilization', 'endDate', e.target.value)}
                                                className="filter-input"
                                            />
                                        </div>
                                    </>
                                )}
                                <button
                                    onClick={() => {
                                        // Fetch only utilization trends data
                                        fetchUtilizationTrends();
                                    }}
                                    className="btn btn-primary apply-filter-btn"
                                >
                                    Apply Filter
                                </button>
                            </div>
                        </div>
                        <div className="chart-content">
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={utilizationChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="period" />
                                    <YAxis label={{ value: 'Utilization %', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip formatter={(value) => [`${value}%`, 'Utilization']} />
                                    <Legend />
                                    {utilizationTrends.map((series, index) => (
                                        <Line
                                            key={series.name}
                                            type="monotone"
                                            dataKey={series.name}
                                            stroke={`hsl(${index * 60}, 70%, 50%)`}
                                            strokeWidth={2}
                                            dot={{ r: 4 }}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Allocation Forecast Section */}
                <div className="report-section">
                    {/* Allocation Forecast Chart */}
                    <div className="chart-container">
                        <div className="chart-header">
                            <div className="chart-title-section">
                                <h3>Allocation Forecast (Next 8 Weeks)</h3>
                                <p>Forecasted allocation vs bookable hours</p>
                            </div>
                            <div className="chart-filters">
                                {isAdministrator && (
                                    <div className="filter-group">
                                        <label>Line of Business</label>
                                        <select
                                            value={selectedFilters.allocation.vertical}
                                            onChange={(e) => handleSectionFilterChange('allocation', 'vertical', e.target.value)}
                                            className="filter-select"
                                        >
                                            {filterOptions.verticals.map(vertical => (
                                                <option key={vertical.id} value={vertical.id}>
                                                    {vertical.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div className="filter-group">
                                    <label>Date Range</label>
                                    <select
                                        value={selectedFilters.allocation.datePreset}
                                        onChange={(e) => handleSectionFilterChange('allocation', 'datePreset', e.target.value)}
                                        className="filter-select"
                                    >
                                        {filterOptions.datePresets.map(preset => (
                                            <option key={preset.id} value={preset.id}>
                                                {preset.name}
                                            </option>
                                        ))}
                                        <option value="custom">Custom Range</option>
                                    </select>
                                </div>
                                {selectedFilters.allocation.datePreset === 'custom' && (
                                    <>
                                        <div className="filter-group">
                                            <label>Start Date</label>
                                            <input
                                                type="date"
                                                value={selectedFilters.allocation.startDate}
                                                onChange={(e) => handleSectionFilterChange('allocation', 'startDate', e.target.value)}
                                                className="filter-input"
                                            />
                                        </div>
                                        <div className="filter-group">
                                            <label>End Date</label>
                                            <input
                                                type="date"
                                                value={selectedFilters.allocation.endDate}
                                                onChange={(e) => handleSectionFilterChange('allocation', 'endDate', e.target.value)}
                                                className="filter-input"
                                            />
                                        </div>
                                    </>
                                )}
                                <button
                                    onClick={() => {
                                        // Fetch only allocation forecast data
                                        fetchAllocationForecast();
                                    }}
                                    className="btn btn-primary apply-filter-btn"
                                >
                                    Apply Filter
                                </button>
                            </div>
                        </div>
                        <div className="chart-content">
                            <ResponsiveContainer width="100%" height={400}>
                                <ComposedChart data={allocationChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="week" />
                                    <YAxis yAxisId="hours" label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                                    <YAxis yAxisId="percentage" orientation="right" label={{ value: 'Allocation %', angle: 90, position: 'insideRight' }} />
                                    <Tooltip />
                                    <Legend />
                                    {allocationForecast.map((series, index) => (
                                        <React.Fragment key={series.name}>
                                            <Bar
                                                yAxisId="hours"
                                                dataKey={`${series.name}_forecasted`}
                                                stackId="a"
                                                fill={`hsl(${index * 60}, 70%, 50%)`}
                                                name={`${series.name} - Forecasted`}
                                            />
                                            <Bar
                                                yAxisId="hours"
                                                dataKey={`${series.name}_bookable`}
                                                stackId="a"
                                                fill={`hsl(${index * 60}, 70%, 80%)`}
                                                name={`${series.name} - Bookable`}
                                            />
                                            <Line
                                                yAxisId="percentage"
                                                type="monotone"
                                                dataKey={`${series.name}_percentage`}
                                                stroke={`hsl(${index * 60}, 70%, 30%)`}
                                                strokeWidth={2}
                                                name={`${series.name} - Allocation %`}
                                            />
                                        </React.Fragment>
                                    ))}
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default ComprehensiveReports;
