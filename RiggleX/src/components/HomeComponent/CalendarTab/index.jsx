import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import {
    DarkColor,
    DarkColor80,
    fonts,
    mainOrangeColor,
    mainWhiteColor,
} from '../../../utils/style/fonts';
import { normalize, RfH, RfW } from '../../../utils/helper';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getCurrentMonthString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
};

const CalendarTab = () => {
    const [selected, setSelected] = useState('2025-12-16');
    const [currentMonth, setCurrentMonth] = useState(getCurrentMonthString());

    const events = {
        '2025-12-16': 2,
    };

    const onPrevMonth = () => {
        const date = new Date(currentMonth);
        date.setMonth(date.getMonth() - 1);
        setCurrentMonth(date.toISOString().split('T')[0]);
    };

    const onNextMonth = () => {
        const date = new Date(currentMonth);
        date.setMonth(date.getMonth() + 1);
        setCurrentMonth(date.toISOString().split('T')[0]);
    };

    const monthLabel = new Date(currentMonth).toLocaleString('en-US', {
        month: 'long',
        year: 'numeric',
    });

    return (
        <View style={styles.container}>
            {/* ============ CUSTOM MONTH HEADER ============ */}
            <View style={styles.monthHeader}>
                <TouchableOpacity onPress={onPrevMonth}>
                    <Text style={styles.arrow}>‹</Text>
                </TouchableOpacity>

                <Text style={styles.monthText}>{monthLabel}</Text>

                <TouchableOpacity onPress={onNextMonth}>
                    <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>
            </View>

            {/* ============ CUSTOM WEEK DAY HEADER ============ */}
            <View style={styles.weekHeader}>
                {WEEK_DAYS.map((day, index) => {
                    const isWeekend = index === 0 || index === 6;
                    return (
                        <Text
                            key={day}
                            style={[
                                styles.weekText,
                                isWeekend && styles.weekendText,
                            ]}
                        >
                            {day}
                        </Text>
                    );
                })}
            </View>

            {/* ============ CALENDAR GRID ============ */}
            <View style={{ paddingHorizontal: RfW(0) }}>
                <Calendar
                    current={currentMonth}
                    hideExtraDays
                    // enableSwipeMonths
                    onDayPress={(day) => setSelected(day.dateString)}
                    onMonthChange={(month) =>
                        setCurrentMonth(`${month.year}-${String(month.month).padStart(2, '0')}-01`)
                    }
                    hideDayNames
                    hideArrows
                    disableMonthChange
                    renderHeader={() => null}
                    dayComponent={({ date }) => {
                        const isSelected = date.dateString === selected;
                        const dayIndex = new Date(date.dateString).getDay();
                        const isWeekend = dayIndex === 0 || dayIndex === 6;

                        return (
                            <View style={[styles.dayBox, isSelected && styles.selectedDay]}>
                                <Text
                                    style={[
                                        styles.dayText,
                                        isWeekend && styles.weekendDate,
                                        isSelected && styles.selectedText,
                                    ]}
                                >
                                    {date.day}
                                </Text>

                                {events[date.dateString] && (
                                    <View style={styles.eventBadge}>
                                        <Text style={styles.eventText}>
                                            ✓ {events[date.dateString]}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        );
                    }}
                    style={styles.calendar}
                />
            </View>
        </View>
    );
};

export default CalendarTab;

/* ======================= STYLES ======================= */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: mainWhiteColor,
        paddingHorizontal: RfW(10),
    },

    /* -------- Month Header -------- */
    monthHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: RfH(12),
        paddingHorizontal: RfW(10),
    },

    monthText: {
        fontSize: normalize(14),
        fontFamily: fonts.PoppinsMedium,
        color: DarkColor,
        top: RfH(4)
    },

    arrow: {
        fontSize: normalize(28),
        color: DarkColor80,
        paddingHorizontal: RfW(10),
    },

    /* -------- Week Header -------- */
    weekHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: RfH(8),
    },

    weekText: {
        width: RfW(51),
        textAlign: 'center',
        fontSize: 10,
        fontFamily: fonts.PoppinsMedium,
        color: '#B0B0B0',
    },

    weekendText: {
        color: 'red',
    },

    /* -------- Calendar -------- */
    calendar: {
        elevation: 0,
        shadowColor: 'transparent',
    },

    dayBox: {
        width: RfW(51),
        height: RfW(40),
        borderBottomWidth: 0.69,
        borderLeftWidth: 0.69,
        borderColor: '#E9E9E9',
        backgroundColor: mainWhiteColor,
        top: RfH(6),
    },

    dayText: {
        fontSize: 10,
        fontFamily: fonts.PoppinsSemiBold,
        color: DarkColor,
        left: RfW(6),
    },

    weekendDate: {
        color: 'red',
    },

    selectedDay: {
        backgroundColor: mainOrangeColor,
    },

    selectedText: {
        color: mainWhiteColor,
        fontWeight: '700',
    },

    eventBadge: {
        position: 'absolute',
        bottom: 4,
        left: 0,
        right: 0,
        alignItems: 'center',
    },

    eventText: {
        fontSize: 12,
        color: mainWhiteColor,
        fontFamily: fonts.PoppinsSemiBold,
    },
});
