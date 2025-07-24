import React from 'react';
import AdminLayout from './AdminLayout';
import Building from '../component/Building';
import GroupChoices from '../component/GroupChoices';
import Company from '../component/Company';
import Unit from '../component/Unit';
import Draft from '../component/Draft';

const Setting = () => {
  return (
    <AdminLayout>
      <div className="text-2xl font-semibold mb-6">Setting</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#F4F2ED] shadow-md rounded-2xl border border-[#837958] p-6">
          <Building />
        </div>
        <div className="bg-[#F4F2ED] shadow-md rounded-2xl border border-[#837958] p-6">
          <GroupChoices />
        </div>
        {/* <div className="bg-white shadow-md rounded-2xl border border-gray-200 p-6">
          <Company />
        </div>
        <div className="bg-white shadow-md rounded-2xl border border-gray-200 p-6">
          <Unit />
        </div> */}
        <div className='bg-[#F4F2ED] shadow-md rounded-2xl border border-[#837958] p-6'>
          <Draft />
        </div>
      </div>
    </AdminLayout>
  );
};

export default Setting;
