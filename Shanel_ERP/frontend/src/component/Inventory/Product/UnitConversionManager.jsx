import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'react-feather';
import axios from 'axios';

const UnitConversionManager = ({ baseUnit, setBaseUnit, units, setUnits }) => {
    const [newUnit, setNewUnit] = useState({ unitName: '', conversionRate: '' });
    const [availableBaseUnits, setAvailableBaseUnits] = useState([]);
    const [availableAlternativeUnits, setAvailableAlternativeUnits] = useState([]);
    const [showNewBaseUnit, setShowNewBaseUnit] = useState(false);
    const [showNewAlternativeUnit, setShowNewAlternativeUnit] = useState(false);
    const [newBaseUnitName, setNewBaseUnitName] = useState('');
    const [newAlternativeUnitName, setNewAlternativeUnitName] = useState('');
    const [loading, setLoading] = useState(true);

    // Fetch available units on component mount
    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const [baseRes, altRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/inventory/available-base-units'),
                    axios.get('http://localhost:5000/api/inventory/available-alternative-units')
                ]);
                
                setAvailableBaseUnits(baseRes.data.units || []);
                setAvailableAlternativeUnits(altRes.data.units || []);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching available units:", err);
                setLoading(false);
            }
        };

        fetchUnits();
    }, []);

    const addUnit = () => {
        if (!newUnit.unitName.trim() || !newUnit.conversionRate) {
            alert('Please enter unit name and conversion rate');
            return;
        }

        const rate = parseFloat(newUnit.conversionRate);
        if (rate <= 0) {
            alert('Conversion rate must be greater than 0');
            return;
        }

        // Check for duplicate unit names
        if (units.some(u => u.unitName.toLowerCase() === newUnit.unitName.toLowerCase())) {
            alert('This unit already exists for this product');
            return;
        }

        setUnits([
            ...units,
            {
                id: Date.now(),
                unitName: newUnit.unitName,
                conversionRate: rate,
                isBaseUnit: false
            }
        ]);

        setNewUnit({ unitName: '', conversionRate: '' });
        setShowNewAlternativeUnit(false);
        setNewAlternativeUnitName('');
    };

    const removeUnit = (id) => {
        setUnits(units.filter(u => u.id !== id));
    };

    const handleBaseUnitChange = (e) => {
        const value = e.target.value;
        if (value === '__ADD_NEW__') {
            setShowNewBaseUnit(true);
            setNewBaseUnitName('');
        } else {
            setBaseUnit(value);
            setShowNewBaseUnit(false);
        }
    };

    const handleAlternativeUnitSelect = (unitName) => {
        if (units.some(u => u.unitName.toLowerCase() === unitName.toLowerCase())) {
            alert('This unit already exists for this product');
            return;
        }

        setNewUnit({ unitName, conversionRate: '' });
        setShowNewAlternativeUnit(false);
        setNewAlternativeUnitName('');
    };

    const addNewBaseUnit = () => {
        if (!newBaseUnitName.trim()) {
            alert('Please enter a base unit name');
            return;
        }

        setBaseUnit(newBaseUnitName);
        if (!availableBaseUnits.includes(newBaseUnitName)) {
            setAvailableBaseUnits([...availableBaseUnits, newBaseUnitName].sort());
        }
        setShowNewBaseUnit(false);
        setNewBaseUnitName('');
    };

    const addNewAlternativeUnit = () => {
        if (!newAlternativeUnitName.trim()) {
            alert('Please enter an alternative unit name');
            return;
        }

        handleAlternativeUnitSelect(newAlternativeUnitName);
        if (!availableAlternativeUnits.includes(newAlternativeUnitName)) {
            setAvailableAlternativeUnits([...availableAlternativeUnits, newAlternativeUnitName].sort());
        }
        setNewAlternativeUnitName('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            addUnit();
        }
    };

    const handleKeyPressNewBase = (e) => {
        if (e.key === 'Enter') {
            addNewBaseUnit();
        }
    };

    const handleKeyPressNewAlt = (e) => {
        if (e.key === 'Enter') {
            addNewAlternativeUnit();
        }
    };

    if (loading) {
        return <div className="p-3">Loading units...</div>;
    }

    return (
        <div className="mt-3 p-3 bg-light rounded-3 border">
            <label className="form-label mb-2 small fw-semibold text-muted">Unit Management</label>

            {/* Base Unit */}
            <div className="mb-3">
                <label className="form-label mb-1 small fw-semibold">Base Unit * (Select or Add New)</label>
                
                {showNewBaseUnit ? (
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control form-control-sm bg-white border"
                            placeholder="e.g., Packet, Kg, Jar"
                            value={newBaseUnitName}
                            onChange={(e) => setNewBaseUnitName(e.target.value)}
                            onKeyPress={handleKeyPressNewBase}
                            autoFocus
                        />
                        <button
                            type="button"
                            className="btn btn-sm btn-success"
                            onClick={addNewBaseUnit}
                        >
                            Add
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm btn-secondary"
                            onClick={() => {
                                setShowNewBaseUnit(false);
                                setNewBaseUnitName('');
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <div className="input-group">
                        <select
                            className="form-select form-select-sm bg-white border"
                            value={baseUnit}
                            onChange={handleBaseUnitChange}
                        >
                            <option value="">Select a base unit...</option>
                            {availableBaseUnits.map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                            ))}
                            <option value="__ADD_NEW__" className="fw-bold">+ Add New Base Unit</option>
                        </select>
                        <span className="input-group-text small text-muted" style={{ fontSize: '11px' }}>
                            = 1.0 (Base)
                        </span>
                    </div>
                )}
                <small className="text-muted d-block mt-1">All quantities stored in this smallest unit</small>
            </div>

            {/* Current Units Summary */}
            {units.length > 0 && (
                <div className="mb-3 p-2 bg-white rounded-2 border border-success-subtle">
                    <small className="fw-bold text-success">Alternative Units:</small>
                    <div className="d-flex flex-wrap gap-2 mt-2">
                        {units.map((unit) => (
                            <span
                                key={unit.id}
                                className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1"
                                style={{ fontSize: '12px' }}
                            >
                                1 {unit.unitName} = {unit.conversionRate} {baseUnit}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Add New Alternative Unit */}
            <div className="border-top pt-3">
                <label className="form-label mb-2 small fw-semibold">Add Alternative Unit</label>
                <div className="row g-2">
                    <div className="col-6">
                        {showNewAlternativeUnit ? (
                            <input
                                type="text"
                                className="form-control form-control-sm bg-white border"
                                placeholder="Enter new unit name (e.g., Card, Box)"
                                value={newAlternativeUnitName}
                                onChange={(e) => setNewAlternativeUnitName(e.target.value)}
                                onKeyPress={handleKeyPressNewAlt}
                                autoFocus
                            />
                        ) : (
                            <select
                                className="form-select form-select-sm bg-white border"
                                value={newUnit.unitName}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '__ADD_NEW__') {
                                        setShowNewAlternativeUnit(true);
                                        setNewAlternativeUnitName('');
                                    } else if (value) {
                                        handleAlternativeUnitSelect(value);
                                    }
                                }}
                            >
                                <option value="">Select unit...</option>
                                {availableAlternativeUnits.map(unit => (
                                    <option key={unit} value={unit}>{unit}</option>
                                ))}
                                <option value="__ADD_NEW__" className="fw-bold">+ Add New Alternative Unit</option>
                            </select>
                        )}
                    </div>
                    <div className="col-4">
                        <div className="input-group input-group-sm">
                            <span className="input-group-text small">1 unit =</span>
                            <input
                                type="number"
                                className="form-control form-control-sm bg-white border"
                                placeholder="Qty"
                                value={newUnit.conversionRate}
                                onChange={(e) => setNewUnit({ ...newUnit, conversionRate: e.target.value })}
                                onKeyPress={handleKeyPress}
                                step="0.01"
                                min="0.01"
                            />
                            <span className="input-group-text small text-muted">{baseUnit || 'unit'}</span>
                        </div>
                    </div>
                    <div className="col-2">
                        {showNewAlternativeUnit ? (
                            <div className="d-flex gap-1">
                                {newAlternativeUnitName.trim() ? (
                                    <>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-success flex-grow-1"
                                            onClick={addNewAlternativeUnit}
                                            title="Use this new unit"
                                            style={{ fontSize: '13px' }}
                                        >
                                            Use
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-secondary"
                                            onClick={() => {
                                                setShowNewAlternativeUnit(false);
                                                setNewAlternativeUnitName('');
                                            }}
                                            title="Cancel"
                                            style={{ fontSize: '13px' }}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : null}
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="btn btn-sm btn-success w-100 d-flex align-items-center justify-content-center gap-1"
                                onClick={addUnit}
                                style={{ fontSize: '13px' }}
                            >
                                <Plus size={14} /> Add
                            </button>
                        )}
                    </div>
                </div>
                <small className="text-muted d-block mt-2">
                    Example: Select "Card" from dropdown, enter "10" (meaning 1 Card = 10 Packets)
                </small>
            </div>

            {/* Listed Units */}
            {units.length > 0 && (
                <div className="mt-3 border-top pt-3">
                    <small className="fw-bold text-muted mb-2 d-block">Current Units:</small>
                    <div className="d-flex flex-column gap-2">
                        {units.map((unit, index) => (
                            <div
                                key={unit.id}
                                className="d-flex align-items-center justify-content-between p-2 bg-white rounded-2 border"
                            >
                                <div style={{ fontSize: '13px' }}>
                                    <span className="fw-bold">{unit.unitName}</span>
                                    <span className="text-muted ms-2">
                                        1 {unit.unitName} = {unit.conversionRate} {baseUnit}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger p-1"
                                    onClick={() => removeUnit(unit.id)}
                                    title="Remove unit"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnitConversionManager;
