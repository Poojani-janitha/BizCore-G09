import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateEmployees, EMP_KEY } from '../../storeContext/employeesData';

const EmployeesPage = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const dragItem = useRef();
  const dragOverItem = useRef();

  useEffect(() => {
    const stored = localStorage.getItem(EMP_KEY);
    if (stored) {
      try { setEmployees(JSON.parse(stored)); } catch { setEmployees(generateEmployees()); }
    } else {
      const gen = generateEmployees();
      setEmployees(gen);
      localStorage.setItem(EMP_KEY, JSON.stringify(gen));
    }
    // no selected panel in this layout
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f6fa',
      padding: '28px 32px',
      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{
          margin: 0,
          fontSize: '26px',
          fontWeight: 800,
          color: '#1a1a2e',
          letterSpacing: '-0.5px',
        }}>
          <span style={{
            background: 'linear-gradient(135deg, #1e3a5f, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>Employees</span>
        </h1>
        <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>
          Employee directory · Manage profiles and roles
        </p>
      </div>

      <div className="mb-2 text-muted">Tip: drag cards to rearrange employee order.</div>
      <div className="row g-3">
        {employees.map((emp, index) => (
          <div className="col-sm-6 col-md-4" key={emp.id}
            onDragEnter={() => (dragOverItem.current = index)}>
            <div
              className="card"
              draggable
              onDragStart={(e) => { dragItem.current = index; e.dataTransfer.effectAllowed = 'move'; }}
              onDragOver={(e) => e.preventDefault()}
              onDragEnd={() => {
                const _employees = [...employees];
                const draggedItemContent = _employees.splice(dragItem.current, 1)[0];
                _employees.splice(dragOverItem.current, 0, draggedItemContent);
                dragItem.current = null;
                dragOverItem.current = null;
                setEmployees(_employees);
                try { localStorage.setItem(EMP_KEY, JSON.stringify(_employees)); } catch {}
              }}
              style={{ cursor: 'grab' }}
              onClick={() => navigate(`/hr/employees/${emp.id}`)}
            >
              <div className="card-body">
                <h5 className="card-title mb-1">{emp.name}</h5>
                <p className="mb-0"><small className="text-muted">{emp.role}</small></p>
                <p className="mb-0"><small className="text-muted">{emp.email}</small></p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeesPage;
