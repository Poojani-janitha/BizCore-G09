import React from 'react'
import { Save, Printer, Pause, FilePlus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next';

const ActionButtons = ({ setAction }) => {
    const { t } = useTranslation();

    const handleAction = (actionType) => {
        setAction(actionType);
    };

    return (
        <div className='d-flex flex-column h-100'>
            <h6 className="mb-3 fw-bold text-primary text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>{t('actionButtons.title')}</h6>

            <div className="row g-2 flex-grow-1">
                <div className="col-3">
                    <button
                        className="btn btn-success w-100 h-100 d-flex flex-column align-items-center justify-content-center shadow-sm border-0 py-2"
                        style={{ borderRadius: '10px', background: '#10b981' }}
                        onClick={() => handleAction('printAndSave')}
                    >
                        <Save size={20} className="mb-1" />
                        <span className="fw-bold" style={{ fontSize: '0.7rem' }}>{t('actionButtons.save')}</span>
                    </button>
                </div>

                <div className="col-3">
                    <button
                        className="btn btn-secondary w-100 h-100 d-flex flex-column align-items-center justify-content-center shadow-sm border-0 py-2"
                        style={{ borderRadius: '10px', background: '#4b5563' }}
                        onClick={() => handleAction('print')}
                    >
                        <Printer size={20} className="mb-1" />
                        <span className="fw-bold" style={{ fontSize: '0.7rem' }}>{t('actionButtons.print')}</span>
                    </button>
                </div>

                <div className="col-3">
                    <button
                        className="btn btn-warning text-white w-100 h-100 d-flex flex-column align-items-center justify-content-center shadow-sm border-0 py-2"
                        style={{ borderRadius: '10px', background: '#f59e0b' }}
                        onClick={() => handleAction('holdInvoice')}
                    >
                        <Pause size={20} className="mb-1" />
                        <span className="fw-bold" style={{ fontSize: '0.7rem' }}>{t('actionButtons.hold')}</span>
                    </button>
                </div>

                <div className="col-3">
                    <button
                        className="btn btn-danger w-100 h-100 d-flex flex-column align-items-center justify-content-center shadow-sm border-0 py-2"
                        style={{ borderRadius: '10px', background: '#ef4444' }}
                        onClick={() => handleAction('clear')}
                    >
                        <Trash2 size={20} className="mb-1" />
                        <span className="fw-bold" style={{ fontSize: '0.7rem' }}>{t('actionButtons.clear')}</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ActionButtons
