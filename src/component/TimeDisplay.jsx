import React, { useEffect, useState } from 'react'
import moment from 'moment'
import 'moment/locale/th'

moment.locale('th') // ตั้ง locale ไทย

const TimeDisplay = ({ isMobile, onDataChange, activeButton, setActiveButton }) => {
    const [currentTime, setCurrentTime] = useState('')
    // const [rangeText, setRangeText] = useState('')
    // const [activeButton, setActiveButton] = useState('today')

    useEffect(() => {
        const updateTime = () => {
            const now = new Date()
            const formatter = new Intl.DateTimeFormat('th-TH', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            })
            setCurrentTime(formatter.format(now) + ' น.')
        }

        updateTime()
        const interval = setInterval(updateTime, 1000)
        handleSelectRange('today') // 👈 เรียกทันทีเมื่อโหลด
        return () => clearInterval(interval)
    }, [])

    const handleSelectRange = (type) => {
        setActiveButton(type)

        let start, end

        switch (type) {
            case 'today':
                start = moment().startOf('day')
                end = moment().endOf('day')
                break
            case 'yesterday':
                start = moment().subtract(1, 'days').startOf('day')
                end = moment().subtract(1, 'days').endOf('day')
                break
            case 'thisWeek': // ➕ เพิ่มกรณีนี้
                start = moment().startOf('isoWeek')  // วันจันทร์
                end = moment().endOf('isoWeek')      // วันอาทิตย์
                break
            case 'thisMonth':
                start = moment().startOf('month')
                end = moment().endOf('month')
                break
            case 'thisYear':
                start = moment().startOf('year')
                end = moment().endOf('year')
                break
            default:
                return
        }

        if (typeof onDataChange === 'function') {
            onDataChange({
                startDate: start.format('YYYY-MM-DD'),
                endDate: end.format('YYYY-MM-DD'),
            })
        }

        // แสดงข้อความช่วงเวลา
        // const formatter = new Intl.DateTimeFormat('th-TH', {
        //     weekday: 'long',
        //     year: 'numeric',
        //     month: 'long',
        //     day: 'numeric',
        //     hour: '2-digit',
        //     minute: '2-digit',
        //     second: '2-digit',
        // })

        // console.log("start: ", start)
        // console.log("end: ", end)
    }

    const buttonClass = (type) =>
        `px-3 py-1 rounded-full ${isMobile ? 'text-[10px]' : 'text-[12px]'} font-medium border transition
        ${activeButton === type
            ? 'bg-[#837958] text-white'
            : 'bg-white text-[#D9D9D9] border-[#D9D9D9] hover:bg-[#f3f1ed] hover:text-[#837958]'}`

    return (
        <div className="flex flex-col gap-2 mb-4">
            {/* วันเวลา และปุ่มเลือกช่วงเวลา */}
            <div className="flex justify-between items-end flex-wrap gap-2">
                <div>
                    <span className={`${isMobile ? 'text-[15px]' : 'text-[20px]'} text-black font-bold`}>
                        {currentTime}
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => handleSelectRange('today')} className={buttonClass('today')}>
                        วันนี้
                    </button>
                    <button onClick={() => handleSelectRange('yesterday')} className={buttonClass('yesterday')}>
                        เมื่อวาน
                    </button>
                    <button onClick={() => handleSelectRange('thisWeek')} className={buttonClass('thisWeek')}>
                        สัปดาห์นี้
                    </button>
                    <button onClick={() => handleSelectRange('thisMonth')} className={buttonClass('thisMonth')}>
                        เดือนนี้
                    </button>
                    <button onClick={() => handleSelectRange('thisYear')} className={buttonClass('thisYear')}>
                        ปีนี้
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TimeDisplay
