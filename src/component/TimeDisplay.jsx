import React, { useEffect, useState } from 'react'
import moment from 'moment'
import 'moment/locale/th'

const TimeDisplay = () => {
    const [currentTime, setCurrentTime] = useState('')
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => { //1024
            setIsMobile(window.innerWidth < 1030);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [isMobile]);

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

    return (
        <div className="flex justify-between items-center mb-6">
            <span className={`${isMobile ? 'text-[14px]' : 'text-[20px]'} text-black font-bold`}>
                {currentTime}
            </span>
        </div>
    )
}


export default TimeDisplay
