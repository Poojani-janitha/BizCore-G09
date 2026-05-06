import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Save, XCircle, Info, ChevronDown, PlusCircle, Layers } from 'react-feather';

const CreateAccountPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    accountCode: '',
    accountName: '',
    accountType: 'Asset',
    accountCategory: '',
    parentAccountId: '',
    isActive: true,
    description: ''
  });

  const accountTypes = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/accounts/create', {
        accountCode: formData.accountCode,
        accountName: formData.accountName,
        accountType: formData.accountType,
        accountCategory: formData.accountCategory,
        parentAccountId: formData.parentAccountId,
        description: formData.description,
        isActive: formData.isActive
      });
      if (res.data.success) {
        alert('Account created successfully');
        navigate('/finance');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create account');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl flex flex-col gap-8">
        
        {/* Breadcrumbs & Title */}
        <div className="flex flex-col gap-4">
          <div 
            onClick={() => navigate('/finance')}
            className="flex items-center gap-2 text-gray-500 hover:text-[#FF6B35] cursor-pointer transition-colors w-fit"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to General Ledger</span>
          </div>
          
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold text-cyan-950">Add New Account</h1>
              <p className="text-gray-500">Define a new account for your chart of accounts</p>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              
              {/* Section 1: Basic Information */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
                  <Info size={18} className="text-[#FF6B35]" />
                  <h2 className="text-lg font-semibold text-cyan-950">Basic Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Account Code */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Account Code *</label>
                    <input 
                      type="text" 
                      name="accountCode"
                      value={formData.accountCode}
                      onChange={handleChange}
                      placeholder="e.g. 1001"
                      required
                      className="h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] transition-all"
                    />
                  </div>

                  {/* Account Name */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Account Name *</label>
                    <input 
                      type="text" 
                      name="accountName"
                      value={formData.accountName}
                      onChange={handleChange}
                      placeholder="e.g. Petty Cash"
                      required
                      className="h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] transition-all"
                    />
                  </div>

                  {/* Account Type */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Account Type *</label>
                    <div className="relative">
                      <select 
                        name="accountType"
                        value={formData.accountType}
                        onChange={handleChange}
                        className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] transition-all cursor-pointer"
                      >
                        {accountTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Account Category */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Account Category</label>
                    <input 
                      type="text" 
                      name="accountCategory"
                      value={formData.accountCategory}
                      onChange={handleChange}
                      placeholder="e.g. Current Asset"
                      className="h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Hierarchy & Status */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
                  <Layers size={18} className="text-[#FF6B35]" />
                  <h2 className="text-lg font-semibold text-cyan-950">Hierarchy & Status</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Parent Account ID */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Parent Account ID (Optional)</label>
                    <input 
                      type="number" 
                      name="parentAccountId"
                      value={formData.parentAccountId}
                      onChange={handleChange}
                      placeholder="e.g. 1000"
                      className="h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] transition-all"
                    />
                  </div>

                  {/* Is Active */}
                  <div className="flex items-center gap-3 mt-8">
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF6B35]"></div>
                      <span className="ml-3 text-sm font-semibold text-gray-700">Is Account Active?</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Description */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Description</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe the purpose of this account..."
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35] transition-all resize-none"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 mt-4 pt-8 border-t border-gray-50">
                <button 
                  type="button"
                  onClick={() => navigate('/finance')}
                  className="px-6 h-12 flex items-center gap-2 text-gray-600 font-semibold hover:bg-gray-50 rounded-xl transition-all"
                >
                  <XCircle size={18} />
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-8 h-12 flex items-center gap-2 bg-[#FF6B35] text-white font-semibold rounded-xl hover:bg-[#e85a24] shadow-lg shadow-[#FF6B35]/20 transition-all"
                >
                  <Save size={18} />
                  Create Account
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccountPage;
