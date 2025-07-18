import React, { useEffect, useState } from 'react'
import moment from 'moment'
import 'moment/locale/th'

moment.locale('th') // ตั้ง locale ไทย

const TimeDisplay = ({ isMobile, statusPieData }) => {
    const [currentTime, setCurrentTime] = useState('')
    const [dateRange, setDateRange] = useState({ start: null, end: null })
    const [rangeText, setRangeText] = useState('')
    const [activeButton, setActiveButton] = useState('today') // ใช้เก็บปุ่มที่ถูกเลือก

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
            case 'lastWeek':
                start = moment().subtract(1, 'weeks').startOf('week')
                end = moment().subtract(1, 'weeks').endOf('week')
                break
            case 'lastMonth':
                start = moment().subtract(1, 'months').startOf('month')
                end = moment().subtract(1, 'months').endOf('month')
                break
            case 'lastYear':
                start = moment().subtract(1, 'year').startOf('year')
                end = moment().subtract(1, 'year').endOf('year')
                break
            default:
                return
        }

        setDateRange({ start: start.toDate(), end: end.toDate() })

        const formatter = new Intl.DateTimeFormat('th-TH', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        })

        setRangeText(formatter.format(start) + ' น.' + ' - ' + formatter.format(end) + ' น.')

        // const formattedRange = `${start.format('ddddที่ D MMMM YYYY')} - ${end.format('ddddที่ D MMMM YYYY')}`
        // setRangeText(formattedRange)

        // console.log('ช่วงเวลา:', formattedRange)
    }

    const buttonClass = (type) =>
        `px-4 py-1 rounded-full ${isMobile ? 'text-[10px]' : 'text-[14px]'} font-medium border transition
            ${activeButton === type
            ? 'bg-[#837958] text-white'
            : 'bg-white text-[#837958] border-[#837958] hover:bg-[#f3f1ed]'
        }`

    return (
        <div className="flex flex-col gap-2 mb-6">
            <div className="flex justify-between items-center">
                <span className={`${isMobile ? 'text-[14px]' : 'text-[20px]'}${isMobile ? 'text-[14px]' : 'text-[20px]'} text-black font-bold`}>
                    {currentTime}
                </span>
            </div>
            <div className={`flex items-center`}>
                <button onClick={() => handleSelectRange('today')} className={buttonClass('today')}>
                    วันนี้
                </button>
                <button onClick={() => handleSelectRange('yesterday')} className={`ml-2 ${buttonClass('yesterday')}`}>
                    เมื่อวาน
                </button>
                <button onClick={() => handleSelectRange('lastWeek')} className={`ml-2 ${buttonClass('lastWeek')}`}>
                    สัปดาห์นี้
                </button>
                <button onClick={() => handleSelectRange('lastMonth')} className={`ml-2 ${buttonClass('lastMonth')}`}>
                    เดือนนี้
                </button>
                <button onClick={() => handleSelectRange('lastYear')} className={`ml-2 ${buttonClass('lastYear')}`}>
                    ปีนี้
                </button>
            </div>

            {rangeText && (
                <div className="text-[#837958] text-sm font-medium">
                    แสดงข้อมูล: {rangeText}
                </div>
            )}
        </div>
    )
}

export default TimeDisplay
