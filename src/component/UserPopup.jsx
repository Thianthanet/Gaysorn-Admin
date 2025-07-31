import React from "react";

const UserPopup = ({
  show,
  onClose,
  activeTab,
  setActiveTab,
  handleSubmit,
  customerData,
  technicianData,
  adminData,
  handleCustomerChange,
  handleTechnicianChange,
  handleAdminChange, // <--- รับ prop นี้เข้ามา
  buildings,
  companies, // เพื่อใช้ในอนาคตหากต้องการให้ลูกค้าเลือกบริษัทจาก dropdown
  units,     // เพื่อใช้ในอนาคตหากต้องการให้ลูกค้าเลือกยูนิตจาก dropdown
  selectedBuildings,
  handleBuildingToggle,
  errors,
  // isEditModeTechnicians ถูกลบออก เพราะเราจะคำนวณจาก technicianData.id
  // setAdminData ถูกลบออก เพราะเราจะใช้ handleAdminChange แทน
}) => {
  if (!show) return null;

  // ตรวจสอบโหมดแก้ไขสำหรับช่าง (Technician Edit Mode)
  const isTechnicianEditMode = !!technicianData.id && !!technicianData.userId;
  // ตรวจสอบโหมดแก้ไขสำหรับแอดมิน (Admin Edit Mode)
  const isAdminEditMode = !!adminData.id;

  // console.log("technicianData: ", technicianData)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="relative w-[520px] h-[620px] bg-white border border-[#BC9D72] rounded-xl p-2 shadow-lg overflow-y-auto">
        <h2 className="text-[18px] font-black text-[#837958] text-center mb-4 mt-4">
          {activeTab === "customers" && (customerData.id ? "แก้ไขข้อมูลลูกค้า" : "เพิ่มข้อมูลลูกค้า")}
          {activeTab === "technicians" && (technicianData.id ? "แก้ไขข้อมูลเจ้าหน้าที่" : "เพิ่มข้อมูลเจ้าหน้าที่")}
          {activeTab === "admin" && (adminData.id ? "แก้ไขข้อมูลแอดมิน" : "เพิ่มข้อมูลแอดมิน")}
        </h2>

        {/* Tabs */}
        <div className="flex w-fit mx-auto mb-2 rounded-xl border border-[#837958] overflow-hidden text-sm bg-[#F4F2ED]">
          <button
            className={`px-6 py-2 font-medium w-[108px] transition-all duration-300 ease-in-out
              ${activeTab === "customers" ? "bg-[#837958] text-white" : "text-[#837958]"}
              rounded-l-xl rounded-r-xl`} //ใช้ rounded-l-xl สำหรับปุ่มแรก
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('customers');
            }}
          >
            ลูกค้า
          </button>
          <button
            className={`px-6 py-2 font-medium w-[108px] transition-all duration-300 ease-in-out
              ${activeTab === "technicians" ? "bg-[#837958] text-white" : "text-[#837958]"}
              rounded-l-xl rounded-r-xl`} // ใช้ rounded-none สำหรับปุ่มกลาง
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('technicians');
            }}
          >
            เจ้าหน้าที่
          </button>
          <button 
            className={`px-6 py-2 font-medium w-[108px] transition-all duration-300 ease-in-out
              ${activeTab === "admin" ? "bg-[#837958] text-white" : "text-[#837958]"}
              rounded-l-xl rounded-r-xl`} //ใช้ rounded-r-xl สำหรับปุ่มสุดท้าย
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('admin');
            }}
          >
            แอดมิน
          </button>
        </div>

        <div className="flex justify-center">
          <div className="relative min-h-[400px]">
            <form onSubmit={handleSubmit}>
              {activeTab === 'customers' && (
                <>
                  <InputField
                    label="ชื่อ-สกุล"
                    required
                    name="name"
                    value={customerData.name}
                    onChange={handleCustomerChange}
                    error={errors.name}
                  />
                  <InputField
                    label="เบอร์โทรศัพท์"
                    name="phone"
                    value={customerData.phone}
                    onChange={handleCustomerChange}
                    maxLength={15}
                    inputMode="numeric"
                  />
                  <InputField
                    label="บริษัท"
                    required
                    name="companyName"
                    value={customerData.companyName}
                    onChange={handleCustomerChange}
                    error={errors.companyName}
                  />
                  <InputField
                    label="ยูนิต"
                    name="unitName"
                    value={customerData.unitName}
                    onChange={handleCustomerChange}
                  />

                  <div className="mb-2">
                    <label className="block text-[#BC9D72] mb-1 text-[12px]">
                      อาคาร<span className="text-red-500">*</span>
                    </label>
                    <select
                      name="buildingName"
                      value={customerData.buildingName}
                      onChange={handleCustomerChange}
                      className={`w-[320px] text-[12px] text-[#837958] border ${errors.buildingName
                          ? "border-red-500"
                          : "border-[#837958]"
                        } rounded-lg px-2 py-1.5 focus:outline-none`}
                    >
                      <option value="">เลือกอาคาร</option>
                      {buildings.map((building) => (
                        <option
                          key={building.id}
                          value={building.buildingName}
                        >
                          {building.buildingName}
                        </option>
                      ))}
                    </select>
                    {/* {errors.buildingName && (
                      <p className="text-red-500 text-xs mt-1">{errors.buildingName}</p>
                    )} */}
                  </div>

                  <InputField
                    label="อีเมล"
                    name="email"
                    value={customerData.email}
                    onChange={handleCustomerChange}
                    type="email"
                    error={errors.email}
                  />
                </>
              )}

              {activeTab === "technicians" && (
                <>
                  <InputField
                    label="ชื่อ-สกุล"
                    required
                    name="name"
                    value={technicianData.name}
                    onChange={handleTechnicianChange}
                    error={errors.name}
                  />
                  <InputField
                    label="เบอร์โทรศัพท์"
                    note="(การแก้ไขเบอร์โทรศัพท์ อาจทำให้ผู้ใช้งานต้องลงทะเบียนใหม่)"
                    name="phone"
                    value={technicianData.phone}
                    onChange={handleTechnicianChange}
                  />

                  {/* {console.log("technicianData: ", )} */}

                  {/* อาคารสำหรับช่าง จะแสดงเฉพาะเมื่ออยู่ในโหมดแก้ไข (อัปเดตข้อมูลช่าง) */}
                  {isTechnicianEditMode && (
                    <div className="mt-4 mb-4"> {/* เพิ่ม margin บน/ล่างเพื่อให้มีช่องว่าง */}
                      <label className="text-[#BC9D72] text-[12px] font-medium block mb-2">อาคาร</label>
                      <div className="grid grid-cols-1 gap-3 max-h-[120px] overflow-y-auto pr-2"> {/* ปรับ grid และเพิ่ม scrollbar */}
                        {buildings.map(building => (
                          <label key={building.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedBuildings.includes(building.id)}
                              onChange={() => handleBuildingToggle(building.id)}
                              className="h-3 w-3 text-[#BC9D72] accent-[#BC9D72] border-[1px] border-[#BC9D72] checked:bg-[#BC9D72] checked:border-[#BC9D72] cursor-pointer"
                            />
                            <span className="text-[#837958] text-[12px] font-medium">{building.buildingName}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === "admin" && (
                <>
                  <InputField
                    label="ชื่อผู้ใช้งาน"
                    required
                    name="username"
                    value={adminData.username}
                    onChange={handleAdminChange} // <--- ใช้ handleAdminChange
                    error={errors.username}
                  />
                  <InputField
                    label="รหัสผ่าน"
                    type="password"
                    name="password"
                    value={adminData.password}
                    onChange={handleAdminChange} // <--- ใช้ handleAdminChange
                    required={!isAdminEditMode} // <--- รหัสผ่านจำเป็นเฉพาะตอนสร้างใหม่
                    error={errors.password}
                    // note={isAdminEditMode ? "(ปล่อยว่างไว้หากไม่ต้องการเปลี่ยนรหัสผ่าน)" : ""} // เพิ่มข้อความสำหรับโหมดแก้ไข
                  />
                </>
              )}

              <div className="flex flex-col">
                <button
                  type="submit"
                  className={`w-full mb-2 mt-2 bg-[#837958] text-white text-[12px] font-bold py-2 rounded-xl hover:opacity-90 transition
                    ${activeTab === "technicians" ? (technicianData.id ? "mt-[134px]" : "mt-[262px]") : activeTab === "admin" ? "mt-[262px]" : ""}`}
                  // ลบการกำหนด mt- ที่ซับซ้อนออก ให้ใช้ margin-top ค่ากลางๆ แล้วให้เนื้อหาดันปุ่มลงมาเอง
                >
                  {activeTab === "customers" && (customerData.id ? "บันทึกข้อมูลลูกค้า" : "เพิ่มข้อมูลลูกค้า")}
                  {activeTab === "technicians" && (technicianData.id ? "บันทึกข้อมูลเจ้าหน้าที่" : "เพิ่มข้อมูลเจ้าหน้าที่")}
                  {activeTab === "admin" && (adminData.id ? "บันทึกข้อมูลแอดมิน" : "เพิ่มข้อมูลแอดมิน")}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full mb-2 bg-white text-[#837958] text-[12px] font-bold border-[1px] border-[#837958] py-2 rounded-xl hover:opacity-90 transition"
                >
                  ปิดหน้าต่างนี้
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputField = ({
  label,
  note,
  name,
  value,
  onChange,
  type = "text",
  required,
  maxLength,
  inputMode,
  error, // <--- รับ prop error เข้ามา
}) => (
  <div className="mb-2">
    <div className="flex items-center gap-1 mb-1">
      <label className="text-[#BC9D72] text-[12px] font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {note && (
        <span className="text-gray-500 text-[10px] font-normal">
          {note}
        </span>
      )}
    </div>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={label}
      maxLength={maxLength}
      inputMode={inputMode}
      // เพิ่ม class สำหรับ error
      className={`w-[320px] placeholder-[#BC9D72]/50 placeholder:text-[12px] border ${error ? "border-red-500" : "border-[#837958]"
        } rounded-lg px-3 py-1.5 text-sm focus:outline-none`}
    />
    {/*error && <p className="text-red-500 text-xs mt-1">{error}</p>} {/* แสดงข้อความ error */}
  </div>
);

export default UserPopup;