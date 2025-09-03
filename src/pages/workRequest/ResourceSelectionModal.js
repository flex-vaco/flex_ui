import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './ResourceSelectionModal.css';

function ResourceSelectionModal({ capabilityAreaIds, onResourceSelection, onClose, workRequest }) {
    const [resources, setResources] = useState([]);
    const [selectedResources, setSelectedResources] = useState([]);
    const [resourceAvailability, setResourceAvailability] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (capabilityAreaIds && capabilityAreaIds.length > 0) {
            fetchResourcesByCapabilityAreas();
        }
    }, [capabilityAreaIds]);

    const fetchResourcesByCapabilityAreas = () => {
        setIsLoading(true);
        axios.post('/workRequest/resourcesByCapabilityAreas', {
            capabilityAreaIds: capabilityAreaIds
        })
        .then(function (response) {
            setResources(response.data.resources);
            // Fetch availability for the loaded resources if workRequest has duration
            if (response.data.resources.length > 0 && workRequest?.duration_from && workRequest?.duration_to) {
                fetchResourceAvailability(response.data.resources);
            }
        })
        .catch(function (error) {
            console.log(error);
            Swal.fire({
                icon: 'error',
                title: 'Error fetching resources',
                text: 'Failed to load resources based on capability areas',
                showConfirmButton: true
            });
        })
        .finally(() => {
            setIsLoading(false);
        });
    };

    const fetchResourceAvailability = (resources) => {
        if (!workRequest?.duration_from || !workRequest?.duration_to) {
            return;
        }

        const empIds = resources.map(r => r.emp_id);
        
        axios.post('/empPrjAloc/resourceAvailability', {
            empIds: empIds,
            fromDate: workRequest.duration_from,
            toDate: workRequest.duration_to
        })
        .then(function (response) {
            if (response.data.resource_availability) {
                const availabilityMap = {};
                response.data.resource_availability.forEach(avail => {
                    availabilityMap[avail.emp_id] = avail;
                });
                setResourceAvailability(availabilityMap);
            }
        })
        .catch(function (error) {
            console.log('Error fetching resource availability:', error);
        });
    };

    const getAvailabilityDisplay = (empId) => {
        const availability = resourceAvailability[empId];
        if (!availability) {
            return { text: 'Loading...', class: 'availability-loading' };
        }
        
        if (availability.is_fully_available) {
            return { text: '40 hrs/week (Fully Available)', class: 'availability-full' };
        } else if (availability.available_hours > 0) {
            return { text: `${availability.available_hours} hrs/week available`, class: 'availability-partial' };
        } else {
            return { text: 'Fully Allocated', class: 'availability-none' };
        }
    };

    const handleResourceToggle = (resource) => { 
        const isSelected = selectedResources.some(r => r.emp_id === resource.emp_id);
        
        if (isSelected) {
            setSelectedResources(selectedResources.filter(r => r.emp_id !== resource.emp_id));
        } else {
            setSelectedResources([...selectedResources, resource]);
        }
    };

    const handleSelectAll = () => {
        if (selectedResources.length === filteredResources.length) {
            setSelectedResources([]);
        } else {
            setSelectedResources([...filteredResources]);
        }
    };

    const handleSubmit = () => {
        if (selectedResources.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Resources Selected',
                text: 'Please select at least one resource',
                showConfirmButton: true
            });
            return;
        }
        onResourceSelection(selectedResources);
    };

    const filteredResources = resources.filter(resource => 
        resource.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.primary_skills?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.secondary_skills?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isAllSelected = filteredResources.length > 0 && selectedResources.length === filteredResources.length;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Select Preferred Team</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="modal-body">
                    <div className="search-section">
                        <div className="search-input-group">
                            <span className="search-icon">
                                <i className="bi bi-search"></i>
                            </span>
                            <input
                                type="text"
                                placeholder="Search resources by name or skills..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </div>

                    <div className="selection-controls">
                        <label className="select-all-checkbox">
                            <input
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={handleSelectAll}
                            />
                            <span>Select All ({filteredResources.length} resources)</span>
                        </label>
                        <span className="selected-count">
                            Selected: {selectedResources.length}
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Loading resources...</p>
                        </div>
                    ) : (
                        <div className="resources-table-container">
                            <table className="resources-table">
                                <thead>
                                    <tr>
                                        <th width="50">Select</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Primary Skills</th>
                                        <th>Secondary Skills</th>
                                        <th>Experience</th>
                                        <th>Cost per Hour</th>
                                        <th>Availability</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredResources.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="empty-state">
                                                <i className="bi bi-people"></i>
                                                <p>No resources found matching the selected capability areas</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredResources.map((resource) => {
                                            const isSelected = selectedResources.some(r => r.emp_id === resource.emp_id);
                                            const availabilityDisplay = getAvailabilityDisplay(resource.emp_id);
                                            return (
                                                <tr key={resource.emp_id} className={isSelected ? 'selected-row' : ''}>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleResourceToggle(resource)}
                                                            className="resource-checkbox"
                                                        />
                                                    </td>
                                                    <td>
                                                        <div className="resource-name">
                                                            <strong>{resource.first_name} {resource.last_name}</strong>
                                                        </div>
                                                    </td>
                                                    <td>{resource.email || '-'}</td>
                                                    <td>
                                                        <div className="skills-container">
                                                            {resource.primary_skills ? 
                                                                resource.primary_skills.split(',').map((skill, index) => (
                                                                    <span key={index} className="skill-badge primary">
                                                                        {skill.trim()}
                                                                    </span>
                                                                ))
                                                                : '-'
                                                            }
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="skills-container">
                                                            {resource.secondary_skills ? 
                                                                resource.secondary_skills.split(',').map((skill, index) => (
                                                                    <span key={index} className="skill-badge secondary">
                                                                        {skill.trim()}
                                                                    </span>
                                                                ))
                                                                : '-'
                                                            }
                                                        </div>
                                                    </td>
                                                    <td>{resource.total_work_experience_years || '-'} Years</td>
                                                    <td>$ {resource.cost_per_hour || '-'}</td>
                                                    <td>
                                                        <span className={`availability-badge ${availabilityDisplay.class}`}>
                                                            {availabilityDisplay.text}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button 
                        type="button" 
                        className="btn btn-outline" 
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-success" 
                        onClick={handleSubmit}
                        disabled={selectedResources.length === 0}
                    >
                        <i className="bi bi-check-circle"></i>
                        Add Selected Resources ({selectedResources.length})
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ResourceSelectionModal; 