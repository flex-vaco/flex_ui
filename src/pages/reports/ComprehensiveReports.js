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
        serviceLines: [],
        datePresets: []
    });
    // Set default date range
    const today = new Date();
    
    // Get user's line of business ID for non-administrator users
    const userLineOfBusinessId = AppFunc.activeUser?.line_of_business_id;
    const isAdministrator = AppFunc.activeUserRole === APP_CONSTANTS.USER_ROLES.ADMINISTRATOR;
    
    const [selectedFilters, setSelectedFilters] = useState({
        // Global filters
        vertical: isAdministrator ? 'all' : userLineOfBusinessId || 'all',
        serviceLine: 'all',
        
        // Individual section filters
        metrics: {
            vertical: isAdministrator ? 'all' : userLineOfBusinessId || 'all',
            serviceLine: 'all',
            datePreset: 'last_month',
            startDate: '',
            endDate: ''
        },
        utilization: {
            vertical: isAdministrator ? 'all' : userLineOfBusinessId || 'all',
            serviceLine: 'all',
            datePreset: 'last_month',
            startDate: '',
            endDate: ''
        },
        allocation: {
            vertical: isAdministrator ? 'all' : userLineOfBusinessId || 'all',
            serviceLine: 'all',
            datePreset: 'last_month',
            startDate: '',
            endDate: ''
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
            // Build metrics parameters using global filters and date filters
            const metricsParams = new URLSearchParams({
                metricsVertical: selectedFilters.vertical,
                metricsServiceLine: selectedFilters.serviceLine
            });

            // Add date filters for metrics
            if (selectedFilters.metrics.datePreset === 'custom') {
                metricsParams.append('metricsStartDate', selectedFilters.metrics.startDate);
                metricsParams.append('metricsEndDate', selectedFilters.metrics.endDate);
            } else {
                metricsParams.append('metricsDatePreset', selectedFilters.metrics.datePreset);
            }

            // Build utilization parameters using global filters
            const utilizationParams = new URLSearchParams({
                utilizationVertical: selectedFilters.vertical,
                utilizationServiceLine: selectedFilters.serviceLine
            });

            // Build allocation parameters using global filters
            const allocationParams = new URLSearchParams({
                allocationVertical: selectedFilters.vertical,
                allocationServiceLine: selectedFilters.serviceLine
            });

            // Combine all parameters
            const allParams = new URLSearchParams();
            [...metricsParams.entries()].forEach(([key, value]) => allParams.append(key, value));
            [...utilizationParams.entries()].forEach(([key, value]) => allParams.append(key, value));
            [...allocationParams.entries()].forEach(([key, value]) => allParams.append(key, value));

            // Fetch metrics
            const metricsResponse = await axios.get(`/reports/dashboard-metrics?${allParams}`);
            setMetrics(metricsResponse.data.metrics);

            // Fetch utilization trends using global filters and section-specific date filters
            const trendsPayload = {
                vertical: selectedFilters.vertical,
                serviceLine: selectedFilters.serviceLine,
                datePreset: selectedFilters.utilization.datePreset,
                groupBy: 'month'
            };
            
            if (selectedFilters.utilization.datePreset === 'custom') {
                trendsPayload.startDate = selectedFilters.utilization.startDate;
                trendsPayload.endDate = selectedFilters.utilization.endDate;
            }
            
            const trendsResponse = await axios.post('/reports/utilization-trends', trendsPayload);
            setUtilizationTrends(trendsResponse.data.chartData);

            // Fetch allocation forecast using global filters and section-specific date filters
            const forecastPayload = {
                vertical: selectedFilters.vertical,
                serviceLine: selectedFilters.serviceLine
            };
            
            if (selectedFilters.allocation.datePreset === 'custom') {
                forecastPayload.startDate = selectedFilters.allocation.startDate;
                forecastPayload.endDate = selectedFilters.allocation.endDate;
            }
            
            const forecastResponse = await axios.post('/reports/allocation-forecast', forecastPayload);
            setAllocationForecast(forecastResponse.data.chartData);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = async (filterType, value) => {
        if (filterType === 'vertical') {
            // When line of business changes, fetch service lines for that line of business
            try {
                const response = await axios.get(`/reports/service-lines/${value}`);
                setFilterOptions(prev => ({
                    ...prev,
                    serviceLines: response.data.serviceLines
                }));
                
                // Reset service line to 'all' when line of business changes and update all sections
                setSelectedFilters(prev => ({
                    ...prev,
                    [filterType]: value,
                    serviceLine: 'all',
                    metrics: {
                        ...prev.metrics,
                        vertical: value,
                        serviceLine: 'all'
                    },
                    utilization: {
                        ...prev.utilization,
                        vertical: value,
                        serviceLine: 'all'
                    },
                    allocation: {
                        ...prev.allocation,
                        vertical: value,
                        serviceLine: 'all'
                    }
                }));
            } catch (error) {
                console.error('Error fetching service lines:', error);
                setError('Failed to load service lines');
            }
        } else if (filterType === 'serviceLine') {
            // When service line changes, update all sections
            setSelectedFilters(prev => ({
                ...prev,
                [filterType]: value,
                metrics: {
                    ...prev.metrics,
                    serviceLine: value
                },
                utilization: {
                    ...prev.utilization,
                    serviceLine: value
                },
                allocation: {
                    ...prev.allocation,
                    serviceLine: value
                }
            }));
        } else {
        setSelectedFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
        }
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
                vertical: selectedFilters.vertical,
                serviceLine: selectedFilters.serviceLine,
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
            const forecastPayload = {
                vertical: selectedFilters.vertical,
                serviceLine: selectedFilters.serviceLine
            };
            
            if (selectedFilters.allocation.datePreset === 'custom') {
                forecastPayload.startDate = selectedFilters.allocation.startDate;
                forecastPayload.endDate = selectedFilters.allocation.endDate;
            }
            
            const forecastResponse = await axios.post('/reports/allocation-forecast', forecastPayload);
            setAllocationForecast(forecastResponse.data.chartData);
        } catch (error) {
            console.error('Error fetching allocation forecast:', error);
            setError('Failed to load allocation forecast data');
        }
    };

    const fetchMetricsData = async () => {
        try {
            // Build metrics parameters with date filters
            const metricsParams = new URLSearchParams({
                metricsVertical: selectedFilters.vertical,
                metricsServiceLine: selectedFilters.serviceLine
            });

            // Add date filters for metrics
            if (selectedFilters.metrics.datePreset === 'custom') {
                metricsParams.append('metricsStartDate', selectedFilters.metrics.startDate);
                metricsParams.append('metricsEndDate', selectedFilters.metrics.endDate);
            } else {
                metricsParams.append('metricsDatePreset', selectedFilters.metrics.datePreset);
            }

            const metricsResponse = await axios.get(`/reports/dashboard-metrics?${metricsParams}`);
            setMetrics(metricsResponse.data.metrics);
        } catch (error) {
            console.error('Error fetching metrics data:', error);
            setError('Failed to load metrics data');
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
        
        // If showing overall data (serviceLine === 'all'), aggregate all service lines
        if (selectedFilters.serviceLine === 'all') {
            return sortedPeriods.map(period => {
                const dataPoint = { period };
                let totalUtilization = 0;
                let totalWeight = 0;
                
                data.forEach(series => {
                    const point = series.data.find(p => p.period === period);
                    if (point) {
                        // Weight by the number of data points to get proper average
                        totalUtilization += point.utilization;
                        totalWeight += 1;
                    }
                });
                
                dataPoint['Overall'] = totalWeight > 0 ? (totalUtilization / totalWeight) : 0;
                return dataPoint;
            });
        } else {
            // Show individual service line data
            return sortedPeriods.map(period => {
                const dataPoint = { period };
                data.forEach(series => {
                    const point = series.data.find(p => p.period === period);
                    dataPoint[series.name] = point ? point.utilization : 0;
                });
                return dataPoint;
            });
        }
    };

    const formatAllocationData = (data) => {
        if (!data || data.length === 0) return [];
        
        // Get all unique weeks
        const allWeeks = new Set();
        data.forEach(series => {
            series.data.forEach(point => allWeeks.add(point.week));
        });
        
        const sortedWeeks = Array.from(allWeeks).sort();
        
        // If showing overall data (serviceLine === 'all'), aggregate all service lines
        if (selectedFilters.serviceLine === 'all') {
            return sortedWeeks.map(week => {
                const dataPoint = { week };
                let totalForecasted = 0;
                let totalBookable = 0;
                let totalPercentage = 0;
                let count = 0;
                
                data.forEach(series => {
                    const point = series.data.find(p => p.week === week);
                    if (point) {
                        totalForecasted += point.forecastedHours;
                        totalBookable += point.bookableHours;
                        totalPercentage += point.allocationPercentage;
                        count += 1;
                    }
                });
                
                dataPoint['Overall_forecasted'] = totalForecasted;
                dataPoint['Overall_bookable'] = totalBookable;
                dataPoint['Overall_percentage'] = count > 0 ? (totalPercentage / count) : 0;
                return dataPoint;
            });
        } else {
            // Show individual service line data
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
        }
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
                            <label htmlFor="service-line-filter">Service Line</label>
                            <select
                                id="service-line-filter"
                                value={selectedFilters.serviceLine}
                                onChange={(e) => handleFilterChange('serviceLine', e.target.value)}
                                className="filter-select"
                            >
                                {filterOptions.serviceLines.map(serviceLine => (
                                    <option key={serviceLine.id} value={serviceLine.id}>
                                        {serviceLine.name}
                                    </option>
                                ))}
                            </select>
                        </div>

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

                {/* Top Level Metrics Section */}
                <div className="report-section">
                    <div className="chart-container">
                        <div className="chart-header">
                            <div className="chart-title-section">
                                <h3>Top Level Metrics</h3>
                                <p>Key performance indicators for the selected time period</p>
                            </div>
                            <div className="chart-filters">
                                <div className="filter-group">
                                    <label>Date Range (for Active HC & Utilization %)</label>
                                    <select
                                        value={selectedFilters.metrics.datePreset}
                                        onChange={(e) => handleSectionFilterChange('metrics', 'datePreset', e.target.value)}
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
                                {selectedFilters.metrics.datePreset === 'custom' && (
                                    <>
                                        <div className="filter-group">
                                            <label>Start Date</label>
                                            <input
                                                type="date"
                                                value={selectedFilters.metrics.startDate}
                                                onChange={(e) => handleSectionFilterChange('metrics', 'startDate', e.target.value)}
                                                className="filter-input"
                                            />
                                        </div>
                                        <div className="filter-group">
                                            <label>End Date</label>
                                            <input
                                                type="date"
                                                value={selectedFilters.metrics.endDate}
                                                onChange={(e) => handleSectionFilterChange('metrics', 'endDate', e.target.value)}
                                                className="filter-input"
                                            />
                                        </div>
                                    </>
                                )}
                                <button
                                    onClick={() => {
                                        // Fetch metrics data with date filters
                                        fetchMetricsData();
                                    }}
                                    className="btn btn-primary apply-filter-btn"
                                >
                                    Apply Filter
                                </button>
                            </div>
                        </div>
                        <div className="chart-content">
                            {/* Metrics Cards */}
                            <div className="metrics-cards">
                                <div className="metric-card">
                                    <div className="metric-icon">
                                        <i className="fas fa-users"></i>
                                    </div>
                                    <div className="metric-content">
                                        <h3 className="metric-value">{metrics.activeHC}</h3>
                                        <p className="metric-label">Active Head Count</p>
                                        <p className="metric-description">Resources allocated to projects in the selected time period</p>
                                    </div>
                                </div>

                                <div className="metric-card">
                                    <div className="metric-icon">
                                        <i className="fas fa-chart-line"></i>
                                    </div>
                                    <div className="metric-content">
                                        <h3 className="metric-value">{metrics.utilizationPercentage}%</h3>
                                        <p className="metric-label">Utilization %</p>
                                        <p className="metric-description">Billed hours vs available hours in the selected time period</p>
                                    </div>
                                </div>

                                <div className="metric-card">
                                    <div className="metric-icon">
                                        <i className="fas fa-calendar-alt"></i>
                                    </div>
                                    <div className="metric-content">
                                        <h3 className="metric-value">{metrics.allocationForecastPercentage}%</h3>
                                        <p className="metric-label">Allocation Forecast %</p>
                                        <p className="metric-description">Current allocation forecast percentage</p>
                                    </div>
                                </div>
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
                                <p>
                                    {selectedFilters.serviceLine === 'all' ? 
                                     'Monthly utilization percentage - Combined data from all service lines' :
                                     'Monthly utilization percentage - Data for selected service line only'}
                                </p>
                            </div>
                            <div className="chart-filters">
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
                                    {selectedFilters.serviceLine === 'all' ? (
                                        <Line
                                            key="Overall"
                                            type="monotone"
                                            dataKey="Overall"
                                            stroke="#8884d8"
                                            strokeWidth={3}
                                            dot={{ r: 5 }}
                                        />
                                    ) : (
                                        utilizationTrends.map((series, index) => (
                                            <Line
                                                key={series.name}
                                                type="monotone"
                                                dataKey={series.name}
                                                stroke={`hsl(${index * 60}, 70%, 50%)`}
                                                strokeWidth={2}
                                                dot={{ r: 4 }}
                                            />
                                        ))
                                    )}
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
                                <h3>Allocation Forecast</h3>
                                <p>
                                    {selectedFilters.serviceLine === 'all' ? 
                                     'Forecasted allocation vs bookable hours - Combined data from all service lines' :
                                     'Forecasted allocation vs bookable hours - Data for selected service line only'}
                                </p>
                            </div>
                            {/* <div className="chart-filters">
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
                            </div> */}
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
                                    {selectedFilters.serviceLine === 'all' ? (
                                        <React.Fragment key="Overall">
                                            <Bar
                                                yAxisId="hours"
                                                dataKey="Overall_forecasted"
                                                stackId="a"
                                                fill="#8884d8"
                                                name="Overall - Forecasted"
                                            />
                                            <Bar
                                                yAxisId="hours"
                                                dataKey="Overall_bookable"
                                                stackId="a"
                                                fill="#82ca9d"
                                                name="Overall - Bookable"
                                            />
                                            <Line
                                                yAxisId="percentage"
                                                type="monotone"
                                                dataKey="Overall_percentage"
                                                stroke="#ff7300"
                                                strokeWidth={3}
                                                name="Overall - Allocation %"
                                            />
                                        </React.Fragment>
                                    ) : (
                                        allocationForecast.map((series, index) => (
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
                                        ))
                                    )}
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
