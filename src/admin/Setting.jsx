import React from 'react'
import AdminLayout from './AdminLayout'
import Building from '../component/Building'

const Setting = () => {
  return (
    <AdminLayout>
        <div>Setting</div>
        <div className='flex gap-4'>
            <Building />
        </div>
    </AdminLayout>
  )
}

export default Setting