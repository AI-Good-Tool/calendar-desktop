<template>
    <div class="right-panel">
        <!-- Date Info Card -->
        <div class="info-card today-info">
            <div class="date-summary">
                {{ dateSummary }}
            </div>
            <div class="create-btn-wrapper">
                <a-button type="text" class="create-schedule-btn" @click="showScheduleModal">
                    <plus-circle-filled style="color: #597ef7; font-size: 16px; margin-right: 8px" />
                    {{ t('rightPanel.createSchedule') }}
                </a-button>
            </div>
        </div>

        <!-- Lunar Detail Card -->
        <div v-if="subscribedIds.includes('lunar')" class="info-card lunar-card">
            <div class="lunar-date-header">{{ t('rightPanel.lunar.header', { date: lunarString }) }}</div>
            <div class="lunar-detail">
                {{ lunarYearInfo }}
            </div>
            <div class="yi-ji-container">
                <div class="yi-row">
                    <span class="yi-label">{{ t('rightPanel.lunar.yi') }}</span>
                    <span class="yi-content">{{ yi }}</span>
                </div>
                <div class="ji-row">
                    <span class="ji-label">{{ t('rightPanel.lunar.ji') }}</span>
                    <span class="ji-content">{{ ji }}</span>
                </div>
            </div>
        </div>

        <!-- My Schedule Card -->
        <div v-if="subscribedIds.includes('schedule')" class="info-card schedule-card">
            <div class="schedule-header">
                <div class="header-left">
                    <calendar-two-tone two-tone-color="#1890ff" />
                    <span class="schedule-title">{{ t('rightPanel.schedule.title') }}</span>
                </div>
                <a-button type="primary" size="small" shape="round" class="create-btn" @click="showScheduleModal">
                    <template #icon><plus-outlined /></template>
                    {{ t('rightPanel.schedule.new') }}
                </a-button>
            </div>

            <div v-if="todaySchedules.length === 0" class="empty-schedule-box">
                <div class="empty-icon">📂</div>
                <div class="empty-text">{{ t('rightPanel.schedule.empty') }}</div>
                <a-button type="link" size="small" @click="showScheduleModal">{{ t('rightPanel.schedule.addNow') }}</a-button>
            </div>
            <div v-else class="schedule-container">
                <div v-for="item in todaySchedules" :key="item.id" class="schedule-card-item">
                    <div class="type-indicator" :class="'indicator-' + item.type"></div>
                    <div class="item-body">
                        <div class="item-top">
                            <div class="item-info">
                                <div class="item-title-row">
                                    <span class="item-title">{{ item.title }}</span>
                                </div>
                                <div class="item-meta-row">
                                    <span class="item-type-tag" :class="'tag-' + item.type">
                                        {{ getScheduleTypeName(item.type) }}
                                    </span>
                                    <span class="item-time">
                                        <clock-circle-outlined style="font-size: 12px; margin-right: 4px" />
                                        {{ item.isAllDay ? t('common.allDay') : item.time }}
                                    </span>
                                </div>
                            </div>
                            <div class="item-ops">
                                <a-button type="text" size="small" class="op-btn" @click="editSchedule(item)">
                                    <template #icon><edit-outlined /></template>
                                </a-button>
                                <a-button
                                    type="text"
                                    size="small"
                                    danger
                                    class="op-btn"
                                    @click="deleteSchedule(item.id)"
                                >
                                    <template #icon><delete-outlined /></template>
                                </a-button>
                            </div>
                        </div>
                        <div v-if="item.location || item.note" class="item-extra">
                            <div v-if="item.location" class="extra-line">
                                <environment-outlined /> {{ item.location }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Subscribed Content Cards -->
        <div class="subscribed-cards">
            <!-- Weather Card -->
            <div
                v-if="subscribedIds.includes('weather') && weatherData"
                class="info-card weather-card clickable"
                @click="showForecastModal"
            >
                <div class="card-header">
                    <span class="card-title">{{
                        t('rightPanel.weather.cardTitle', { city: weatherManager.getCityDisplayName(weatherData.city) })
                    }}</span>
                    <div class="card-actions">
                        <reload-outlined
                            class="card-setting refresh-btn"
                            :class="{ spinning: weatherLoading }"
                            :title="t('rightPanel.weather.refresh')"
                            @click.stop="fetchWeather(true)"
                        />
                        <setting-outlined
                            class="card-setting"
                            :title="t('rightPanel.weather.settings')"
                            @click.stop="showWeatherSettings"
                        />
                    </div>
                </div>
                <div class="weather-main">
                    <div class="weather-icon">
                        <cloud-filled
                            v-if="weatherIconType(weatherData.weather) === 'cloud'"
                            style="font-size: 48px; color: #69c0ff"
                        />
                        <star-outlined
                            v-else-if="weatherIconType(weatherData.weather) === 'sun'"
                            style="font-size: 48px; color: #ffad14"
                        />
                        <span v-else style="font-size: 48px">🌧️</span>
                    </div>
                    <div class="weather-temp">
                        {{ weatherData.temp_day }}°C
                        <span class="weather-desc-tag">{{ weatherData.weather }}</span>
                    </div>
                </div>
                <div class="weather-detail-text">
                    {{ weatherData.temp_night }}°/{{ weatherData.temp_day }}°C<span v-if="weatherWindText">
                        | {{ weatherWindText }}</span
                    >
                </div>
                <div class="weather-more" @click="showForecastModal">{{ t('rightPanel.weather.viewForecast') }}</div>
            </div>

            <!-- World Clock Card -->
            <div v-if="subscribedIds.includes('worldClock')" class="info-card clock-card">
                <div class="card-header">
                    <span class="card-title">{{ t('rightPanel.clock.title') }}</span>
                </div>
                <div class="clocks-container">
                    <div v-for="clock in worldClocks" :key="clock.key" class="clock-item">
                        <div class="analog-clock">
                            <div class="hand hour" :style="{ transform: `rotate(${clock.hourDeg}deg)` }"></div>
                            <div class="hand min" :style="{ transform: `rotate(${clock.minDeg}deg)` }"></div>
                            <div class="hand sec" :style="{ transform: `rotate(${clock.secDeg}deg)` }"></div>
                        </div>
                        <div class="clock-info">
                            <div class="c-date">{{ clock.date }} {{ clock.time }}</div>
                            <div class="c-name">
                                {{ clock.name }} <span class="diff">{{ clock.hint }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Zodiac Card -->
            <div
                v-if="subscribedIds.includes('zodiac')"
                class="info-card zodiac-card"
                :class="{ 'locale-en': currentLocale !== 'zh-CN' }"
            >
                <div class="card-header">
                    <div class="card-title-group">
                        <span class="card-title">{{ t('rightPanel.zodiac.title') }}</span>
                        <a-select
                            v-model:value="zodiacType"
                            size="small"
                            class="zodiac-type-selector"
                            @change="fetchZodiac"
                            :bordered="false"
                            :dropdown-match-select-width="false"
                        >
                            <a-select-option v-for="zt in zodiacTypes" :key="zt.value" :value="zt.value">
                                {{ zt.name }}
                            </a-select-option>
                        </a-select>
                    </div>
                    <a-select
                        v-model:value="selectedZodiac"
                        size="small"
                        class="zodiac-selector"
                        @change="fetchZodiac"
                        :bordered="false"
                        :dropdown-match-select-width="false"
                    >
                        <a-select-option v-for="z in zodiacs" :key="z.value" :value="z.value">
                            {{ z.name }}
                        </a-select-option>
                    </a-select>
                </div>
                <div v-if="zodiacLoading" class="zodiac-loading">
                    <a-spin size="small" />
                </div>
                <div v-else-if="zodiacInfo" class="zodiac-content">
                    <!-- 今日/明日运势 -->
                    <template v-if="zodiacType === 'today' || zodiacType === 'tomorrow'">
                        <div class="zodiac-date">{{ zodiacInfo.time }}</div>
                        <div class="zodiac-main">
                            <div class="zodiac-fortune-item">
                                <span class="f-label">{{ t('rightPanel.zodiac.index.all') }}</span>
                                <a-rate :value="zodiacInfo.fortune.all" disabled class="small-rate" />
                            </div>
                            <div class="zodiac-fortune-item">
                                <span class="f-label">{{ t('rightPanel.zodiac.index.love') }}</span>
                                <a-rate :value="zodiacInfo.fortune.love" disabled class="small-rate" />
                            </div>
                            <div class="zodiac-fortune-item">
                                <span class="f-label">{{ t('rightPanel.zodiac.index.work') }}</span>
                                <a-rate :value="zodiacInfo.fortune.work" disabled class="small-rate" />
                            </div>
                            <div class="zodiac-fortune-item">
                                <span class="f-label">{{ t('rightPanel.zodiac.index.money') }}</span>
                                <a-rate :value="zodiacInfo.fortune.money" disabled class="small-rate" />
                            </div>
                            <div class="zodiac-fortune-item">
                                <span class="f-label">{{ t('rightPanel.zodiac.index.health') }}</span>
                                <a-rate :value="zodiacInfo.fortune.health" disabled class="small-rate" />
                            </div>
                        </div>
                        <div class="zodiac-tag-row">
                            <span class="z-tag">{{ t('rightPanel.zodiac.luckyColor', { v: zodiacInfo.luckycolor }) }}</span>
                            <span class="z-tag">{{ t('rightPanel.zodiac.luckyNumber', { v: zodiacInfo.luckynumber }) }}</span>
                            <span class="z-tag">{{ t('rightPanel.zodiac.match', { v: zodiacInfo.luckyconstellation }) }}</span>
                        </div>
                        <div class="zodiac-desc">{{ zodiacInfo.fortunetext.all }}</div>
                    </template>

                    <!-- 本周运势 -->
                    <template v-else-if="zodiacType === 'week'">
                        <div class="zodiac-date">{{ zodiacInfo.time }}</div>
                        <div class="zodiac-week-content">
                            <div class="week-item">
                                <div class="week-label">{{ t('rightPanel.zodiac.period.all') }}</div>
                                <div class="week-text">{{ zodiacInfo.fortunetext.all }}</div>
                            </div>
                            <div class="week-item">
                                <div class="week-label">{{ t('rightPanel.zodiac.period.work') }}</div>
                                <div class="week-text">{{ zodiacInfo.fortunetext.work }}</div>
                            </div>
                            <div class="week-item">
                                <div class="week-label">{{ t('rightPanel.zodiac.period.money') }}</div>
                                <div class="week-text">{{ zodiacInfo.fortunetext.money }}</div>
                            </div>
                            <div class="week-item">
                                <div class="week-label">{{ t('rightPanel.zodiac.period.love') }}</div>
                                <div class="week-text">{{ zodiacInfo.fortunetext.love }}</div>
                            </div>
                            <div class="week-item">
                                <div class="week-label">{{ t('rightPanel.zodiac.period.health') }}</div>
                                <div class="week-text">{{ zodiacInfo.fortunetext.health }}</div>
                            </div>
                        </div>
                    </template>

                    <!-- 本月运势 -->
                    <template v-else-if="zodiacType === 'month'">
                        <div class="zodiac-date">{{ zodiacInfo.time }}</div>
                        <div class="zodiac-month-content">
                            <div class="month-item">
                                <div class="month-label">{{ t('rightPanel.zodiac.period.all') }}</div>
                                <div class="month-text">{{ zodiacInfo.fortunetext.all }}</div>
                            </div>
                            <div class="month-item">
                                <div class="month-label">{{ t('rightPanel.zodiac.period.work') }}</div>
                                <div class="month-text">{{ zodiacInfo.fortunetext.work }}</div>
                            </div>
                            <div class="month-item">
                                <div class="month-label">{{ t('rightPanel.zodiac.period.money') }}</div>
                                <div class="month-text">{{ zodiacInfo.fortunetext.money }}</div>
                            </div>
                            <div class="month-item">
                                <div class="month-label">{{ t('rightPanel.zodiac.period.love') }}</div>
                                <div class="month-text">{{ zodiacInfo.fortunetext.love }}</div>
                            </div>
                            <div class="month-item">
                                <div class="month-label">{{ t('rightPanel.zodiac.period.health') }}</div>
                                <div class="month-text">{{ zodiacInfo.fortunetext.health }}</div>
                            </div>
                        </div>
                    </template>
                </div>
                <div v-else class="zodiac-empty">
                    {{ t('rightPanel.zodiac.failed') }}
                    <a-button type="link" size="small" @click="fetchZodiac">{{ t('common.refresh') }}</a-button>
                </div>
            </div>

            <!-- Huangli Card -->
            <div v-if="subscribedIds.includes('huangli')" class="info-card huangli-card">
                <div class="card-header">
                    <span class="card-title">{{ t('rightPanel.huangli.title') }}</span>
                </div>
                <div class="huangli-content">
                    <div class="h-item h-yi">
                        <div class="h-label">{{ t('rightPanel.lunar.yi') }}</div>
                        <div class="h-list">{{ yi }}</div>
                    </div>
                    <div class="h-item h-ji">
                        <div class="h-label">{{ t('rightPanel.lunar.ji') }}</div>
                        <div class="h-list">{{ ji }}</div>
                    </div>
                </div>
            </div>

            <!-- Edit Subscriptions Button -->
            <div class="edit-subscription-btn-container">
                <a-button shape="round" @click="$emit('edit-subscription')">{{ t('rightPanel.editSubscription') }}</a-button>
            </div>
        </div>

        <!-- Weather City Settings Modal -->
        <a-modal
            v-model:open="weatherSettingsVisible"
            :title="t('rightPanel.weather.settings')"
            width="400px"
            @ok="handleWeatherSettingsOk"
            :ok-text="t('common.ok')"
            :cancel-text="t('common.cancel')"
        >
            <div style="padding: 20px 0">
                <div style="margin-bottom: 12px; font-weight: 500">{{ t('rightPanel.weather.selectCity') }}</div>
                <a-select
                    v-model:value="weatherCityName"
                    style="width: 100%"
                    show-search
                    option-filter-prop="label"
                    :options="cityOptions"
                    :placeholder="t('rightPanel.weather.cityPlaceholder')"
                />
                <div style="margin-top: 12px; font-size: 12px; color: #8c8c8c">
                    {{ t('rightPanel.weather.cityTip') }}
                </div>
            </div>
        </a-modal>

        <!-- 未来天气预报弹窗 -->
        <a-modal
            v-model:open="forecastModalVisible"
            :title="t('rightPanel.weather.forecastTitle', { city: weatherManager.getCityDisplayName(weatherCityName) })"
            width="680px"
            :footer="null"
        >
            <div class="forecast-modal-body">
                <div class="forecast-modal-toolbar">
                    <div class="forecast-range-switch">
                        <span :class="{ active: forecastDays === 7 }" @click="forecastDays = 7">{{
                            t('rightPanel.weather.days', { n: 7 })
                        }}</span>
                        <span
                            v-if="supportedForecastDays >= 14"
                            :class="{ active: forecastDays === 14 }"
                            @click="forecastDays = 14"
                        >{{ t('rightPanel.weather.days', { n: 14 }) }}</span>
                    </div>
                    <a-button type="text" size="small" :loading="weatherLoading" @click="fetchWeather(true)">
                        <template #icon><reload-outlined /></template>
                        {{ t('common.refresh') }}
                    </a-button>
                </div>
                <div v-if="displayForecasts.length === 0" class="forecast-empty">
                    {{ t('rightPanel.weather.noForecast') }}
                </div>
                <div v-else class="forecast-grid" :class="{ 'grid-14': forecastDays === 14 }">
                    <div v-for="fc in displayForecasts" :key="fc.date" class="forecast-cell">
                        <div class="f-week">{{ formatForecastWeek(fc.date) }}</div>
                        <div class="f-day">{{ dayjs(fc.date).format(t('common.fmt.monthDay')) }}</div>
                        <div class="f-weather">{{ fc.dayweather }}</div>
                        <div class="f-temp">{{ fc.nighttemp }}° / {{ fc.daytemp }}°</div>
                        <div v-if="fc.daywind" class="f-wind">{{ fc.daywind }} {{ fc.daypower }}</div>
                    </div>
                </div>
            </div>
        </a-modal>

        <!-- 公农历转换弹窗 -->
        <a-modal
            v-model:open="calendarConverterVisible"
            :title="t('rightPanel.converter.title')"
            width="500px"
            :ok-text="t('common.ok')"
            :cancel-text="t('common.cancel')"
            @ok="calendarConverterVisible = false"
        >
            <div style="padding: 20px 0">
                <a-space direction="vertical" style="width: 100%" :size="16">
                    <div>
                        <div style="margin-bottom: 8px; font-weight: 500">{{ t('rightPanel.converter.pickDate') }}</div>
                        <a-date-picker v-model:value="converterDate" style="width: 100%" />
                    </div>
                    <a-divider />
                    <div v-if="converterDate">
                        <div style="margin-bottom: 12px; font-size: 16px; font-weight: 600; color: #1890ff">
                            {{ t('rightPanel.label.result') }}
                        </div>
                        <div class="converter-result">
                            <div class="result-item">
                                <span class="label">{{ t('rightPanel.label.solar') }}</span>
                                <span class="value">{{ converterDate.format(t('common.fmt.fullDate')) }}</span>
                            </div>
                            <div class="result-item">
                                <span class="label">{{ t('rightPanel.label.lunar') }}</span>
                                <span class="value">{{ getLunarDate(converterDate) }}</span>
                            </div>
                            <div class="result-item">
                                <span class="label">{{ t('rightPanel.label.ganZhi') }}</span>
                                <span class="value">{{ getLunarGanZhi(converterDate) }}</span>
                            </div>
                            <div class="result-item">
                                <span class="label">{{ t('rightPanel.label.animal') }}</span>
                                <span class="value">{{ t('rightPanel.lunar.animalYear', { animal: getLunarZodiac(converterDate) }) }}</span>
                            </div>
                            <div class="result-item" v-if="getLunarFestival(converterDate)">
                                <span class="label">{{ t('rightPanel.label.festival') }}</span>
                                <span class="value" style="color: #ff4d4f">{{ getLunarFestival(converterDate) }}</span>
                            </div>
                        </div>
                    </div>
                </a-space>
            </div>
        </a-modal>

        <!-- 节日大全弹窗 -->
        <a-modal
            v-model:open="holidayListVisible"
            :title="t('rightPanel.holidays.title', { year: 2026 })"
            width="600px"
            :ok-text="t('common.ok')"
            :cancel-text="t('common.cancel')"
            @ok="holidayListVisible = false"
        >
            <div style="max-height: 500px; overflow-y: auto">
                <a-tabs v-model:active-key="holidayTab">
                    <a-tab-pane key="legal" :tab="t('rightPanel.holidays.legal')">
                        <a-list :data-source="legalHolidays" size="small">
                            <template #renderItem="{ item }">
                                <a-list-item>
                                    <a-list-item-meta>
                                        <template #title>
                                            <span style="color: #ff4d4f; font-weight: 500">{{ item.name }}</span>
                                        </template>
                                        <template #description>
                                            {{ item.date }}
                                            <span v-if="item.days" style="margin-left: 8px; color: #52c41a">
                                                {{ t('rightPanel.holidays.daysOff', { n: item.days }, item.days) }}
                                            </span>
                                        </template>
                                    </a-list-item-meta>
                                </a-list-item>
                            </template>
                        </a-list>
                    </a-tab-pane>
                    <a-tab-pane key="traditional" :tab="t('rightPanel.holidays.traditional')">
                        <a-list :data-source="traditionalHolidays" size="small">
                            <template #renderItem="{ item }">
                                <a-list-item>
                                    <a-list-item-meta>
                                        <template #title>{{ item.name }}</template>
                                        <template #description>{{ item.lunarDate }}</template>
                                    </a-list-item-meta>
                                </a-list-item>
                            </template>
                        </a-list>
                    </a-tab-pane>
                    <a-tab-pane key="solar" :tab="t('rightPanel.holidays.solarTerms')">
                        <a-list :data-source="solarTerms" :grid="{ gutter: 16, column: 2 }" size="small">
                            <template #renderItem="{ item }">
                                <a-card size="small">
                                    <div style="text-align: center">
                                        <div style="font-weight: 500; margin-bottom: 4px">{{ item.name }}</div>
                                        <div style="color: #888; font-size: 12px">{{ item.date }}</div>
                                    </div>
                                </a-card>
                            </template>
                        </a-list>
                    </a-tab-pane>
                </a-tabs>
            </div>
        </a-modal>

        <!-- 日期计算弹窗 -->
        <a-modal
            v-model:open="dateCalculatorVisible"
            :title="t('rightPanel.calculator.title')"
            width="500px"
            :ok-text="t('common.ok')"
            :cancel-text="t('common.cancel')"
            @ok="dateCalculatorVisible = false"
        >
            <div style="padding: 20px 0">
                <a-space direction="vertical" style="width: 100%" :size="16">
                    <div>
                        <div style="margin-bottom: 8px; font-weight: 500">{{ t('rightPanel.calculator.start') }}</div>
                        <a-date-picker v-model:value="calcStartDate" style="width: 100%" />
                    </div>
                    <div>
                        <div style="margin-bottom: 8px; font-weight: 500">{{ t('rightPanel.calculator.end') }}</div>
                        <a-date-picker v-model:value="calcEndDate" style="width: 100%" />
                    </div>
                    <a-divider />
                    <div v-if="calcStartDate && calcEndDate">
                        <div style="margin-bottom: 12px; font-size: 16px; font-weight: 600; color: #1890ff">
                            {{ t('rightPanel.calculator.result') }}
                        </div>
                        <div class="converter-result">
                            <div class="result-item">
                                <span class="label">{{ t('rightPanel.calculator.days') }}</span>
                                <span class="value" style="color: #52c41a; font-size: 20px; font-weight: 600">
                                    {{ tUnit('day', Math.abs(calcEndDate.diff(calcStartDate, 'day'))) }}
                                </span>
                            </div>
                            <div class="result-item">
                                <span class="label">{{ t('rightPanel.calculator.weeks') }}</span>
                                <span class="value">{{
                                    tUnit('week', Math.floor(Math.abs(calcEndDate.diff(calcStartDate, 'day')) / 7))
                                }}</span>
                            </div>
                            <div class="result-item">
                                <span class="label">{{ t('rightPanel.calculator.months') }}</span>
                                <span class="value">{{
                                    tUnit('month', Math.abs(calcEndDate.diff(calcStartDate, 'month')))
                                }}</span>
                            </div>
                            <div class="result-item">
                                <span class="label">{{ t('rightPanel.calculator.years') }}</span>
                                <span class="value">{{
                                    tUnit('year', Math.abs(calcEndDate.diff(calcStartDate, 'year')))
                                }}</span>
                            </div>
                        </div>
                    </div>
                </a-space>
            </div>
        </a-modal>

        <!-- 倒数日弹窗 -->
        <a-modal
            v-model:open="countdownVisible"
            :title="t('rightPanel.countdown.title')"
            width="500px"
            :ok-text="t('common.ok')"
            :cancel-text="t('common.cancel')"
            @ok="countdownVisible = false"
        >
            <div style="padding: 20px 0">
                <a-space direction="vertical" style="width: 100%" :size="16">
                    <div>
                        <div style="margin-bottom: 8px; font-weight: 500">{{ t('rightPanel.countdown.target') }}</div>
                        <a-date-picker v-model:value="countdownTargetDate" style="width: 100%" />
                    </div>
                    <div>
                        <div style="margin-bottom: 8px; font-weight: 500">{{ t('rightPanel.countdown.eventName') }}</div>
                        <a-input v-model:value="countdownEventName" :placeholder="t('rightPanel.countdown.placeholder')" />
                    </div>
                    <a-divider />
                    <div v-if="countdownTargetDate">
                        <div style="margin-bottom: 12px; font-size: 16px; font-weight: 600; color: #1890ff">
                            {{ t('rightPanel.countdown.heading') }}
                        </div>
                        <div class="converter-result">
                            <div style="text-align: center; padding: 20px 0">
                                <div style="font-size: 14px; color: #666; margin-bottom: 8px">
                                    {{ countdownEventName || t('rightPanel.countdown.defaultName') }}
                                </div>
                                <div style="font-size: 48px; font-weight: 700; color: #1890ff; margin-bottom: 8px">
                                    {{ getCountdownDays(countdownTargetDate) }}
                                </div>
                                <div style="font-size: 16px; color: #666">
                                    {{ getCountdownSuffix(getCountdownDays(countdownTargetDate)) }}
                                </div>
                            </div>
                        </div>
                    </div>
                </a-space>
            </div>
        </a-modal>

        <!-- 万年历弹窗 -->
        <a-modal
            v-model:open="perpetualCalendarVisible"
            :title="t('rightPanel.perpetual.title')"
            width="600px"
            :ok-text="t('common.ok')"
            :cancel-text="t('common.cancel')"
            @ok="perpetualCalendarVisible = false"
        >
            <div style="padding: 20px 0">
                <a-space direction="vertical" style="width: 100%" :size="16">
                    <div>
                        <div style="margin-bottom: 8px; font-weight: 500">{{ t('rightPanel.label.date') }}</div>
                        <a-date-picker v-model:value="perpetualDate" style="width: 100%" />
                    </div>
                    <a-divider />
                    <div v-if="perpetualDate">
                        <div style="margin-bottom: 12px; font-size: 16px; font-weight: 600; color: #1890ff">
                            {{ t('rightPanel.perpetual.details') }}
                        </div>
                        <div class="converter-result">
                            <div class="result-item">
                                <span class="label">{{ t('rightPanel.label.solar') }}</span>
                                <span class="value">{{ perpetualDate.format(t('common.fmt.fullDateWeek')) }}</span>
                            </div>
                            <div class="result-item">
                                <span class="label">{{ t('rightPanel.label.lunar') }}</span>
                                <span class="value">{{ getLunarDate(perpetualDate) }}</span>
                            </div>
                            <div class="result-item">
                                <span class="label">{{ t('rightPanel.label.ganZhi') }}</span>
                                <span class="value">{{ getLunarGanZhi(perpetualDate) }}</span>
                            </div>
                            <div class="result-item">
                                <span class="label">{{ t('rightPanel.label.animal') }}</span>
                                <span class="value">{{ t('rightPanel.lunar.animalYear', { animal: getLunarZodiac(perpetualDate) }) }}</span>
                            </div>
                            <div class="result-item" v-if="getLunarFestival(perpetualDate)">
                                <span class="label">{{ t('rightPanel.label.festival') }}</span>
                                <span class="value" style="color: #ff4d4f">{{ getLunarFestival(perpetualDate) }}</span>
                            </div>
                            <div class="result-item" v-if="getPerpetualTerm(perpetualDate)">
                                <span class="label">{{ t('rightPanel.label.term') }}</span>
                                <span class="value" style="color: #52c41a">{{ getPerpetualTerm(perpetualDate) }}</span>
                            </div>
                        </div>
                    </div>
                </a-space>
            </div>
        </a-modal>

        <!-- 吉日查询弹窗 -->
        <a-modal
            v-model:open="luckyDayVisible"
            :title="t('rightPanel.lucky.title')"
            width="600px"
            :ok-text="t('common.ok')"
            :cancel-text="t('common.cancel')"
            @ok="luckyDayVisible = false"
        >
            <div style="padding: 20px 0">
                <a-space direction="vertical" style="width: 100%" :size="16">
                    <div>
                        <div style="margin-bottom: 8px; font-weight: 500">{{ t('rightPanel.label.date') }}</div>
                        <a-date-picker v-model:value="luckyDate" style="width: 100%" />
                    </div>
                    <a-divider />
                    <div v-if="luckyDate">
                        <div style="margin-bottom: 12px; font-size: 16px; font-weight: 600; color: #1890ff">
                            {{ t('rightPanel.lucky.heading') }}
                        </div>
                        <div class="converter-result">
                            <div style="margin-bottom: 16px">
                                <div
                                    style="
                                        font-weight: 600;
                                        color: #52c41a;
                                        margin-bottom: 8px;
                                        display: flex;
                                        align-items: center;
                                    "
                                >
                                    <span
                                        style="
                                            display: inline-block;
                                            width: 4px;
                                            height: 16px;
                                            background: #52c41a;
                                            margin-right: 8px;
                                        "
                                    ></span>
                                    {{ t('rightPanel.lunar.yi') }}
                                </div>
                                <div style="color: #333; line-height: 1.8; padding-left: 12px">
                                    {{ getLuckyYi(luckyDate) }}
                                </div>
                            </div>
                            <div>
                                <div
                                    style="
                                        font-weight: 600;
                                        color: #ff4d4f;
                                        margin-bottom: 8px;
                                        display: flex;
                                        align-items: center;
                                    "
                                >
                                    <span
                                        style="
                                            display: inline-block;
                                            width: 4px;
                                            height: 16px;
                                            background: #ff4d4f;
                                            margin-right: 8px;
                                        "
                                    ></span>
                                    {{ t('rightPanel.lunar.ji') }}
                                </div>
                                <div style="color: #333; line-height: 1.8; padding-left: 12px">
                                    {{ getLuckyJi(luckyDate) }}
                                </div>
                            </div>
                        </div>
                    </div>
                </a-space>
            </div>
        </a-modal>

        <!-- 日程管理弹窗 -->
        <ScheduleModal
            v-model="scheduleModalVisible"
            :initial-date="currentDateObj.format('YYYY-MM-DD')"
            :editing-schedule="editingSchedule"
            @saved="handleScheduleSaved"
        />
    </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted, createVNode } from 'vue';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import { Lunar, Solar, I18n as LunarI18n } from 'lunar-javascript';
import { useI18n } from 'vue-i18n';
import { tList, tUnit, isZh, currentLocale, lunarMonthDayText, translateHolidayName } from '../i18n';
import { appTimeZone, nowIn, zoneOffsetMinutes, zoneDiffHours, zoneCityName } from '../utils/timezone';
import {
    PlusCircleFilled,
    PlusOutlined,
    CloudFilled,
    CalendarOutlined,
    GiftOutlined,
    CalculatorOutlined,
    ClockCircleOutlined,
    CalendarTwoTone,
    StarOutlined,
    CheckSquareOutlined,
    HeartOutlined,
    EditOutlined,
    DeleteOutlined,
    EnvironmentOutlined,
    ExclamationCircleOutlined,
    SettingOutlined,
    EllipsisOutlined,
    ReloadOutlined
} from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
import ScheduleModal from './ScheduleModal.vue';
import scheduleManager from '../utils/scheduleManager';

dayjs.extend(weekOfYear);
dayjs.extend(dayOfYear);

const { t } = useI18n();

const props = defineProps(['selectedDate']);
const emit = defineEmits(['refresh-calendar']); // 添加事件以刷新日历

import { Modal, message } from 'ant-design-vue';
import { fetch } from '@tauri-apps/plugin-http';
import subscriptionManager from '../utils/subscriptionManager';
import settingsManager from '../utils/settingsManager';

// 订阅数据
const subscribedIds = subscriptionManager.subscribedIds;

// 工具栏可见性控制
const allToolsVisible = ref(false);
const calendarConverterVisible = ref(false);
const holidayListVisible = ref(false);
const dateCalculatorVisible = ref(false);
const countdownVisible = ref(false);
const perpetualCalendarVisible = ref(false);
const luckyDayVisible = ref(false);
const scheduleModalVisible = ref(false);

// 星座数据
const zodiacLoading = ref(false);
const zodiacInfo = ref(null);
const selectedZodiac = ref(localStorage.getItem('selected_zodiac') || '白羊座');
const zodiacType = ref(localStorage.getItem('zodiac_type') || 'today');

// 聚合数据API Key
// JUHE_ZODIAC_KEY 已经移至 settingsManager

const zodiacTypes = computed(() =>
    // 'tomorrow' 暂不开放
    ['today', 'week', 'month'].map((value) => ({ name: t(`rightPanel.zodiac.types.${value}`), value }))
);

// 星座中文名作为存储值和接口映射 key，显示名随语言
const zodiacMap = {
    白羊座: 'aries',
    金牛座: 'taurus',
    双子座: 'gemini',
    巨蟹座: 'cancer',
    狮子座: 'leo',
    处女座: 'virgo',
    天秤座: 'libra',
    天蝎座: 'scorpio',
    射手座: 'sagittarius',
    摩羯座: 'capricorn',
    水瓶座: 'aquarius',
    双鱼座: 'pisces'
};

const zodiacs = computed(() =>
    Object.entries(zodiacMap).map(([value, key]) => ({ name: t(`rightPanel.zodiac.signs.${key}`), value }))
);

async function fetchZodiac() {
    if (!subscriptionManager.isSubscribed('zodiac')) return;
    try {
        zodiacLoading.value = true;
        localStorage.setItem('selected_zodiac', selectedZodiac.value);
        localStorage.setItem('zodiac_type', zodiacType.value);

        // 使用设置中的地址和 Key
        let zodiacApi = settingsManager.get('zodiacApi');
        // 兜底：如果是旧的接口地址或者为空，强制换一下
        if (!zodiacApi || zodiacApi.includes('juhe.cn') || !zodiacApi.includes('xxapi.cn')) {
            zodiacApi = 'https://v2.xxapi.cn/api/horoscope';
        }

        // 新接口参数名为 type (英文/拼音) 和 time
        const typePara = zodiacMap[selectedZodiac.value] || 'aries';
        const url = `${zodiacApi}?type=${typePara}&time=${zodiacType.value}`;
        console.log('Fetching zodiac from:', url);

        const res = await fetch(url);
        const data = await res.json();

        // 兼容不同的状态码字段和类型
        const code = data.code !== undefined ? data.code : data.error_code;
        if (code == 200 || code == 0) {
            // 兼容直接在 root 或者在 data 字段里的数据
            const resultData = data.data || data;
            // 确保必需的字段存在
            if (resultData && resultData.fortunetext) {
                zodiacInfo.value = resultData;
            } else {
                console.error('返回数据格式不正确:', data);
                zodiacInfo.value = null;
            }
        } else {
            console.error('获取星座运势失败:', data.msg || data.reason || '未知错误');
            zodiacInfo.value = null;
        }
    } catch (e) {
        console.error('获取星座运势失败:', e);
        zodiacInfo.value = null;
    } finally {
        zodiacLoading.value = false;
    }
}

const weatherData = computed(() => weatherManager.selectedWeather.value);
const weatherForecasts = computed(() => weatherManager.weatherForecasts.value);
const weatherLoading = ref(false);

// 预报弹窗
const forecastModalVisible = ref(false);
function showForecastModal() {
    forecastModalVisible.value = true;
    // 打开弹窗时若还没有数据则拉取一次
    if (weatherForecasts.value.length === 0) {
        fetchWeather();
    }
}

// 预报天数切换（7/14 天），默认 7 天
const forecastDays = ref(7);
// 当前数据源支持的最大预报天数
const supportedForecastDays = computed(() => weatherManager.getSupportedDays());
// 实际展示的预报列表（跳过今天，接口支持多少天就展示多少）
const displayForecasts = computed(() =>
    weatherForecasts.value.slice(1, Math.min(forecastDays.value, supportedForecastDays.value) + 1)
);

function formatForecastWeek(dateStr) {
    const d = dayjs(dateStr);
    if (d.isSame(dayjs().add(1, 'day'), 'day')) return t('common.tomorrow');
    return tList('common.weekdaysBySunday')[d.day()];
}

// 天气描述可能是中文或英文（取决于数据源与翻译），两种关键词都匹配
const CLOUD_KEYWORDS = ['云', '阴', 'cloud', 'overcast'];
const SUN_KEYWORDS = ['晴', 'clear', 'sunny'];
function weatherIconType(text) {
    const s = String(text || '').toLowerCase();
    if (CLOUD_KEYWORDS.some((k) => s.includes(k))) return 'cloud';
    if (SUN_KEYWORDS.some((k) => s.includes(k))) return 'sun';
    return 'other';
}

// 风向、风力均为 weatherManager 输出的完整文本（如"东北风"、"3级"），这里只做拼接
const weatherWindText = computed(() => {
    const w = weatherData.value;
    if (!w) return '';
    return [w.daywind, w.daypower].filter(Boolean).join(' ');
});
const weatherSettingsVisible = ref(false);

const weatherCityName = ref(localStorage.getItem('weather_city_name') || '北京');

// 城市列表（新天气源均按城市名查询，不再使用高德 adcode）
const majorCities = [
    '北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安', '南京', '重庆',
    '苏州', '天津', '郑州', '长沙', '福州', '沈阳', '哈尔滨', '济南', '青岛', '大连',
    '宁波', '厦门', '昆明', '合肥', '南昌', '贵阳', '兰州', '太原', '石家庄', '长春',
    '乌鲁木齐', '呼和浩特', '海口', '三亚', '拉萨', '西宁', '银川', '南宁', '珠海', '佛山'
];

const cityOptions = computed(() =>
    majorCities.map((city) => ({ value: city, label: weatherManager.getCityDisplayName(city) }))
);

function showWeatherSettings() {
    weatherSettingsVisible.value = true;
}

function handleWeatherSettingsOk() {
    localStorage.setItem('weather_city_name', weatherCityName.value);
    weatherSettingsVisible.value = false;
    fetchWeather();
}

// 世界时钟逻辑
const now = ref(dayjs());
let clockTimer = null;

function updateClocks() {
    now.value = dayjs();
}

onMounted(() => {
    clockTimer = setInterval(updateClocks, 1000);
});

onUnmounted(() => {
    if (clockTimer) clearInterval(clockTimer);
});

// 第一个时钟为应用时区（跟随系统时即系统时区）；第二个默认北京，若与北京同偏移则改为纽约
const SHANGHAI_TZ = 'Asia/Shanghai';
const NEW_YORK_TZ = 'America/New_York';

function formatHourDiff(hours) {
    const sign = hours > 0 ? '+' : hours < 0 ? '-' : '±';
    return t('rightPanel.clock.diff', { diff: `${sign}${Number(Math.abs(hours).toFixed(2))}` });
}

function buildClock(tz, localTz, isLocal) {
    const time = nowIn(tz);
    return {
        key: isLocal ? 'local' : 'remote',
        name: zoneCityName(tz),
        hint: isLocal ? t('rightPanel.clock.local') : formatHourDiff(zoneDiffHours(localTz, tz)),
        date: time.format(t('common.fmt.monthDay')),
        time: time.format(t('common.fmt.timeSec')),
        hourDeg: (time.hour() % 12) * 30 + time.minute() * 0.5,
        minDeg: time.minute() * 6,
        secDeg: time.second() * 6
    };
}

const worldClocks = computed(() => {
    // 依赖 now 以每秒刷新（夏令时切换也会随之更新）
    void now.value;
    const localTz = appTimeZone.value;
    const remoteTz = zoneOffsetMinutes(localTz) !== zoneOffsetMinutes(SHANGHAI_TZ) ? SHANGHAI_TZ : NEW_YORK_TZ;
    return [buildClock(localTz, localTz, true), buildClock(remoteTz, localTz, false)];
});

// 假期数据
const holidayData = ref({});

// 模态框状态已移至顶部

// 日程管理相关已移至顶部
const todaySchedules = ref([]);
const editingSchedule = ref(null);

// 加载当天日程
async function loadTodaySchedules() {
    const dateStr = currentDateObj.value.format('YYYY-MM-DD');
    todaySchedules.value = await scheduleManager.getSchedulesByDate(dateStr);
}

// 显示日程弹窗
function showScheduleModal() {
    editingSchedule.value = null; // 清空编辑状态
    scheduleModalVisible.value = true;
}

// 编辑日程
function editSchedule(schedule) {
    editingSchedule.value = JSON.parse(JSON.stringify(schedule)); // 深拷贝
    scheduleModalVisible.value = true;
}

// 删除日程
async function deleteSchedule(id) {
    Modal.confirm({
        title: t('rightPanel.schedule.deleteTitle'),
        icon: createVNode(ExclamationCircleOutlined, { style: 'color: #ff4d4f' }),
        content: t('rightPanel.schedule.deleteContent'),
        okText: t('common.ok'),
        okType: 'danger',
        cancelText: t('common.cancel'),
        async onOk() {
            try {
                await scheduleManager.deleteSchedule(id);
                await loadTodaySchedules();
                emit('refresh-calendar'); // 刷新日历标记
                message.success(t('rightPanel.schedule.deleted'));
            } catch (e) {
                console.error('删除日程失败:', e);
                message.error(t('rightPanel.schedule.deleteFailed'));
            }
        }
    });
}

// 处理日程保存
function handleScheduleSaved(schedule) {
    console.log('日程已保存:', schedule);
    loadTodaySchedules();
    emit('refresh-calendar'); // 刷新日历标记
}

// 公农历转换相关
const converterDate = ref(dayjs());

// 日期计算相关
const calcStartDate = ref(dayjs());
const calcEndDate = ref(dayjs().add(30, 'day'));

// 倒数日相关
const countdownTargetDate = ref(dayjs().add(100, 'day'));
const countdownEventName = ref('');

// 万年历相关
const perpetualDate = ref(dayjs());

// 吉日查询相关
const luckyDate = ref(dayjs());

// 节日tab
const holidayTab = ref('legal');

const currentDateObj = computed(() => {
    return props.selectedDate ? dayjs(props.selectedDate.dateObj) : dayjs();
});

const dateSummary = computed(() => {
    const d = currentDateObj.value;
    const today = dayjs().startOf('day');
    const selected = d.startOf('day');
    const diff = selected.diff(today, 'day');

    let relativeStr = '';
    if (diff === 0) {
        relativeStr = t('common.today');
    } else if (diff === 1) {
        relativeStr = t('common.tomorrow');
    } else if (diff === -1) {
        relativeStr = t('common.yesterday');
    } else if (diff > 0) {
        relativeStr = t('rightPanel.rel.after', { n: diff }, diff);
    } else {
        relativeStr = t('rightPanel.rel.before', { n: -diff }, -diff);
    }

    return t('rightPanel.summary', { year: d.year(), week: d.week(), day: d.dayOfYear(), rel: relativeStr });
});

// 宜忌、节日等列表的分隔符
function joinList(list, zhSep = ' ') {
    return list.join(isZh() ? zhSep : ', ');
}

const lunarObj = computed(() => {
    return Lunar.fromDate(currentDateObj.value.toDate());
});

const lunarString = computed(() => lunarMonthDayText(lunarObj.value));

const lunarYearInfo = computed(() => {
    const l = lunarObj.value;
    return t('rightPanel.lunar.yearInfo', {
        year: l.getYearInGanZhi(),
        animal: l.getYearShengXiao(),
        month: l.getMonthInGanZhi(),
        day: l.getDayInGanZhi(),
        time: l.getTimeZhi()
    });
});

const yi = computed(() => joinList(lunarObj.value.getDayYi()));
const ji = computed(() => joinList(lunarObj.value.getDayJi()));

// 节日数据（name 为假期接口同款中文名，显示时翻译）
const LEGAL_HOLIDAYS = [
    { name: '元旦', date: '2026-01-01', days: 3 },
    { name: '春节', date: '2026-02-17~02-23', days: 7 },
    { name: '清明节', date: '2026-04-05~04-07', days: 3 },
    { name: '劳动节', date: '2026-05-01~05-03', days: 3 },
    { name: '端午节', date: '2026-06-25~06-27', days: 3 },
    { name: '中秋节', date: '2026-10-06~10-08', days: 3 },
    { name: '国庆节', date: '2026-10-01~10-07', days: 7 }
];
const legalHolidays = computed(() =>
    LEGAL_HOLIDAYS.map((h) => ({ ...h, name: translateHolidayName(h.name) }))
);

const TRADITIONAL_HOLIDAY_KEYS = [
    'chuXi', 'chunJie', 'yuanXiao', 'longTaiTou', 'qingMing', 'duanWu', 'qiXi',
    'zhongYuan', 'zhongQiu', 'chongYang', 'hanYi', 'dongZhi', 'laBa'
];
const traditionalHolidays = computed(() =>
    TRADITIONAL_HOLIDAY_KEYS.map((key) => ({
        name: t(`rightPanel.holidays.items.${key}.name`),
        lunarDate: t(`rightPanel.holidays.items.${key}.date`)
    }))
);

// key 对应 lunar-javascript 的 jq.* 词条，名称随其语言切换
const SOLAR_TERMS = [
    ['liChun', 2, 3, 5], ['yuShui', 2, 18, 20], ['jingZhe', 3, 5, 7], ['chunFen', 3, 20, 22],
    ['qingMing', 4, 4, 6], ['guYu', 4, 19, 21], ['liXia', 5, 5, 7], ['xiaoMan', 5, 20, 22],
    ['mangZhong', 6, 5, 7], ['xiaZhi', 6, 21, 22], ['xiaoShu', 7, 6, 8], ['daShu', 7, 22, 24],
    ['liQiu', 8, 7, 9], ['chuShu', 8, 22, 24], ['baiLu', 9, 7, 9], ['qiuFen', 9, 22, 24],
    ['hanLu', 10, 8, 9], ['shuangJiang', 10, 23, 24], ['liDong', 11, 7, 8], ['xiaoXue', 11, 22, 23],
    ['daXue', 12, 6, 8], ['dongZhi', 12, 21, 23], ['xiaoHan', 1, 5, 7], ['daHan', 1, 20, 21]
];
const solarTerms = computed(() => {
    const months = tList('common.monthsShort');
    return SOLAR_TERMS.map(([key, m, from, to]) => ({
        name: LunarI18n.getMessage(`jq.${key}`),
        date: t('rightPanel.holidays.termDate', { m, mon: months[m - 1], from, to })
    }));
});

function showCalendarConverter() {
    calendarConverterVisible.value = true;
}

function showHolidayList() {
    holidayListVisible.value = true;
}

function showDateCalculator() {
    dateCalculatorVisible.value = true;
}

import weatherManager from '../utils/weatherManager';

const router = useRouter();

function showAllTools() {
    router.push('/tools');
}

// 农历转换辅助函数
function getLunarDate(date) {
    const lunar = Lunar.fromDate(date.toDate());
    return t('rightPanel.lunar.fullDate', { year: lunar.getYearInChinese(), date: lunarMonthDayText(lunar) });
}

function getLunarGanZhi(date) {
    const lunar = Lunar.fromDate(date.toDate());
    return t('rightPanel.lunar.ganZhi', {
        year: lunar.getYearInGanZhi(),
        month: lunar.getMonthInGanZhi(),
        day: lunar.getDayInGanZhi()
    });
}

function getLunarZodiac(date) {
    const lunar = Lunar.fromDate(date.toDate());
    return lunar.getYearShengXiao();
}

function getLunarFestival(date) {
    const lunar = Lunar.fromDate(date.toDate());
    const festivals = lunar.getFestivals();
    return festivals.length > 0 ? joinList(festivals, '、') : null;
}

// 获取天气数据（多天气源，按城市名查询）
async function fetchWeather(manual = false) {
    if (!subscriptionManager.isSubscribed('weather')) return;
    try {
        weatherLoading.value = true;
        const result = await weatherManager.fetchWeather(weatherCityName.value);
        updateCurrentDayWeather();
        if (manual) {
            if (result) {
                message.success(t('rightPanel.weather.updated'));
            } else {
                message.warning(t('rightPanel.weather.refreshFailedCheck'));
            }
        }
    } catch (error) {
        console.error('Failed to fetch weather data:', error);
        if (manual) message.error(t('rightPanel.weather.refreshFailed'));
    } finally {
        weatherLoading.value = false;
    }
}

// 每 30 分钟自动刷新一次天气
const WEATHER_AUTO_REFRESH_MS = 30 * 60 * 1000;
let weatherTimer = null;

// 根据选中的日期更新显示的天气
function updateCurrentDayWeather() {
    const selectedDateStr = currentDateObj.value.format('YYYY-MM-DD');
    weatherManager.updateSelected(selectedDateStr, weatherCityName.value);
}

// 移除旧的根据代码获取天气的辅助函数，高德直接返回文字

// 获取假期数据
async function fetchHolidays() {
    try {
        const year = dayjs().year();
        const holidayApi = settingsManager.get('holidayApi');
        const response = await fetch(`${holidayApi}/${year}`);
        const data = await response.json();

        if (data.code === 0) {
            holidayData.value = data.holiday || {};
        }
    } catch (error) {
        console.error('获取假期数据失败:', error);
    }
}

onMounted(() => {
    fetchWeather();
    fetchHolidays();
    loadTodaySchedules();
    fetchZodiac();
    // 默认每 30 分钟自动刷新一次天气
    weatherTimer = setInterval(() => fetchWeather(false), WEATHER_AUTO_REFRESH_MS);
});

onUnmounted(() => {
    if (weatherTimer) clearInterval(weatherTimer);
});

// 显示新功能的函数
function showCountdown() {
    countdownVisible.value = true;
    allToolsVisible.value = false;
}

function showPerpetualCalendar() {
    perpetualCalendarVisible.value = true;
    allToolsVisible.value = false;
}

function showLuckyDay() {
    luckyDayVisible.value = true;
    allToolsVisible.value = false;
}

// 倒数日计算
function getCountdownDays(targetDate) {
    const today = dayjs();
    const target = dayjs(targetDate);
    return target.diff(today, 'day');
}

function getCountdownSuffix(days) {
    const n = Math.abs(days);
    return days >= 0 ? t('rightPanel.countdown.future', n) : t('rightPanel.countdown.past', n);
}

// 获取节气
function getPerpetualTerm(date) {
    const lunar = Lunar.fromDate(date.toDate());
    return lunar.getJieQi();
}

// 获取宜
function getLuckyYi(date) {
    const lunar = Lunar.fromDate(date.toDate());
    const yi = lunar.getDayYi();
    return yi.length > 0 ? joinList(yi) : t('rightPanel.lunar.noYi');
}

// 获取忌
function getLuckyJi(date) {
    const lunar = Lunar.fromDate(date.toDate());
    const ji = lunar.getDayJi();
    return ji.length > 0 ? joinList(ji) : t('rightPanel.lunar.noJi');
}

// 获取日程类型名称
const SCHEDULE_TYPES = ['todo', 'event', 'birthday', 'anniversary', 'countdown'];
function getScheduleTypeName(type) {
    return t(`rightPanel.scheduleType.${SCHEDULE_TYPES.includes(type) ? type : 'other'}`);
}

// 暴露方法给父组件
defineExpose({
    showAllTools,
    showCalendarConverter,
    showHolidayList,
    showDateCalculator,
    showScheduleModal
});

// 监听日期变化，更新天气和日程
watch(currentDateObj, () => {
    // 日期变化时先从已缓存的预报中更新，没匹配到再重新抓取
    updateCurrentDayWeather();
    if (!weatherData.value) {
        fetchWeather();
    }
    loadTodaySchedules();
});
</script>

<style scoped>
.right-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding-left: 16px;
    gap: 16px;
    font-size: 14px;
    overflow-x: hidden; /* 防止横向滚动 */
    overflow-y: auto; /* 允许纵向滚动 */
}

.info-card {
    background: white;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.subscribed-cards {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.today-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.date-summary {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 12px;
}

.create-btn-wrapper {
    width: 100%;
    text-align: center;
}
.create-schedule-btn {
    font-size: 15px;
    color: #597ef7;
}

.lunar-card {
    flex-grow: 1; /* allow it to expand slightly */
}

.lunar-date-header {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
}
.lunar-detail {
    color: #666;
    font-size: 12px;
    margin-bottom: 12px;
}
.yi-row,
.ji-row {
    display: flex;
    margin-bottom: 4px;
}
.yi-label {
    color: #52c41a;
    font-weight: bold;
    margin-right: 8px;
    min-width: 20px;
    flex-shrink: 0;
    white-space: nowrap;
}
.ji-label {
    color: #ff4d4f;
    font-weight: bold;
    margin-right: 8px;
    min-width: 20px;
    flex-shrink: 0;
    white-space: nowrap;
}
.yi-content,
.ji-content {
    color: #555;
    line-height: 1.4;
}

.weather-card {
    background: linear-gradient(to right bottom, #ffffff, #f0f5ff);
}
.weather-card.clickable {
    cursor: pointer;
    transition: box-shadow 0.2s;
}
.weather-card.clickable:hover {
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}
.weather-more {
    margin-top: 8px;
    font-size: 12px;
    color: #1890ff;
}
.weather-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.weather-temp {
    font-size: 32px;
    font-weight: 300;
    position: relative; /* 改为 relative 以支持内部标签 */
}
.weather-desc-tag {
    font-size: 12px;
    background: #faad14;
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    margin-left: 8px;
    vertical-align: middle;
}
.weather-detail-text {
    margin-top: 8px;
    font-size: 12px;
    color: #666;
}
.forecast-modal-body {
    padding: 8px 0;
}
.forecast-modal-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}
.forecast-range-switch {
    display: flex;
    background: #f0f2f5;
    border-radius: 6px;
    padding: 2px;
}
.forecast-range-switch span {
    padding: 3px 16px;
    font-size: 13px;
    cursor: pointer;
    border-radius: 4px;
    color: #666;
    transition: all 0.2s;
    user-select: none;
}
.forecast-range-switch span.active {
    background: #fff;
    color: #1890ff;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}
.forecast-empty {
    text-align: center;
    color: #999;
    padding: 40px 0;
    font-size: 13px;
}
.forecast-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
}
.forecast-grid.grid-14 {
    grid-template-columns: repeat(7, 1fr);
}
.forecast-cell {
    text-align: center;
    padding: 10px 4px;
    border-radius: 8px;
    background: #f7f9fc;
    border: 1px solid rgba(0, 0, 0, 0.04);
}
.forecast-cell .f-week {
    font-size: 13px;
    color: #333;
    font-weight: 500;
}
.forecast-cell .f-day {
    font-size: 11px;
    color: #aaa;
    margin-top: 1px;
}
.forecast-cell .f-weather {
    font-size: 12px;
    color: #555;
    margin: 6px 0 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.forecast-cell .f-temp {
    font-size: 12px;
    color: #1890ff;
}
.forecast-cell .f-wind {
    font-size: 11px;
    color: #bbb;
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.card-actions {
    display: flex;
    align-items: center;
    gap: 10px;
}
.refresh-btn.spinning {
    animation: weather-refresh-spin 1s linear infinite;
    color: #1890ff;
}
@keyframes weather-refresh-spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}
.card-title {
    font-size: 14px;
    font-weight: 500;
    color: #333;
}
.card-setting {
    cursor: pointer;
    color: #bfbfbf;
    font-size: 14px;
}
.card-setting:hover {
    color: #1890ff;
}

/* 保持 weather-air 作为兼容或备用 */
.weather-air {
    font-size: 12px;
    background: #faad14;
    color: white;
    padding: 1px 6px;
    border-radius: 4px;
    margin-left: 8px;
    vertical-align: middle;
}

.f-day {
    font-size: 11px;
    color: #bfbfbf;
}

/* 世界时钟样式 */
.clocks-container {
    display: flex;
    justify-content: space-around;
    padding: 8px 0;
}
.clock-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
}
.analog-clock {
    width: 64px;
    height: 64px;
    border: 2px solid #333;
    border-radius: 50%;
    position: relative;
    background: white;
}
.analog-clock::after {
    content: '';
    position: absolute;
    width: 4px;
    height: 4px;
    background: #333;
    border-radius: 50%;
    top: 50%;
    left: 50%;
    margin: -2px 0 0 -2px;
}
.hand {
    position: absolute;
    bottom: 50%;
    left: 50%;
    transform-origin: bottom center;
    background: #333;
    border-radius: 2px;
}
.hand.hour {
    width: 3px;
    height: 18px;
    margin-left: -1.5px;
}
.hand.min {
    width: 2px;
    height: 24px;
    margin-left: -1px;
}
.hand.sec {
    width: 1px;
    height: 28px;
    background: #ff4d4f;
    margin-left: -0.5px;
}
.clock-info {
    text-align: center;
}
.c-date {
    font-size: 12px;
    color: #8c8c8c;
    margin-bottom: 2px;
}
.c-name {
    font-size: 14px;
    color: #333;
    font-weight: 500;
}
.diff {
    font-size: 11px;
    color: #bfbfbf;
    font-weight: normal;
}

/* 城市限行样式 */
.traffic-content {
    display: flex;
    justify-content: space-between;
    padding: 10px 16px;
    background: #f8faff;
    border-radius: 8px;
}
.t-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.t-label {
    font-size: 12px;
    color: #8c8c8c;
}
.t-value {
    font-size: 18px;
    font-weight: 600;
    color: #333;
}

/* 星座运势样式 */
.zodiac-card {
    background: linear-gradient(to right bottom, #ffffff, #f9f0ff);
}
.zodiac-selector {
    width: 85px;
    margin-right: -8px;
}
.zodiac-selector :deep(.ant-select-selector),
.zodiac-type-selector :deep(.ant-select-selector) {
    color: #722ed1 !important;
    font-weight: 600;
}
.zodiac-type-selector {
    width: 70px;
    margin-right: 4px;
}
.zodiac-card.locale-en .zodiac-type-selector {
    width: 76px;
}
.zodiac-card.locale-en .zodiac-selector {
    width: 100px;
}
.zodiac-loading {
    padding: 20px;
    text-align: center;
}
.zodiac-date {
    font-size: 13px;
    color: #722ed1;
    margin-bottom: 8px;
    font-weight: 500;
}
.zodiac-main {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
}
.zodiac-fortune-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.f-label {
    font-size: 12px;
    color: #8c8c8c;
}
.small-rate {
    font-size: 12px;
}
.zodiac-tag-row {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
}
.z-tag {
    font-size: 11px;
    padding: 2px 8px;
    background: rgba(114, 46, 209, 0.1);
    color: #722ed1;
    border-radius: 4px;
}
.zodiac-desc {
    font-size: 13px;
    color: #595959;
    line-height: 1.6;
    /* 确保文本能正常换行显示 */
    white-space: pre-wrap;
    text-align: justify;
}
.zodiac-empty {
    text-align: center;
    padding: 10px;
    color: #bfbfbf;
    font-size: 12px;
}

/* 周期运势样式 (周/月) */
.zodiac-week-content,
.zodiac-month-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.week-item,
.month-item {
    background: rgba(255, 255, 255, 0.6);
    padding: 8px;
    border-radius: 6px;
    border: 1px dashed rgba(114, 46, 209, 0.2);
}
.week-label,
.month-label {
    font-size: 12px;
    font-weight: 600;
    color: #722ed1;
    margin-bottom: 4px;
}
.week-text,
.month-text {
    font-size: 13px;
    color: #595959;
    line-height: 1.5;
}

/* 年度运势样式 */
.zodiac-year-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.year-section {
    background: rgba(255, 255, 255, 0.6);
    padding: 10px;
    border-radius: 8px;
    border: 1px solid rgba(114, 46, 209, 0.15);
}
.year-title {
    font-size: 14px;
    font-weight: 600;
    color: #722ed1;
    margin-bottom: 6px;
    border-bottom: 1px solid rgba(114, 46, 209, 0.1);
    padding-bottom: 4px;
}
.year-subtitle {
    font-size: 13px;
    font-weight: 500;
    color: #333;
    margin-bottom: 6px;
}
.year-text {
    font-size: 13px;
    color: #595959;
    line-height: 1.6;
    text-indent: 2em;
    margin-bottom: 4px;
}

/* 黄历运势样式 */
.huangli-card {
    background: linear-gradient(to right bottom, #ffffff, #fff7e6);
}
.huangli-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.h-item {
    display: flex;
    gap: 12px;
}
.h-label {
    height: 24px;
    min-width: 24px;
    padding: 0 5px;
    border-radius: 12px;
    white-space: nowrap;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 12px;
}
.h-yi .h-label {
    background: #f6ffed;
    color: #52c41a;
    border: 1px solid #b7eb8f;
}
.h-ji .h-label {
    background: #fff1f0;
    color: #f5222d;
    border: 1px solid #ffa39e;
}
.h-list {
    font-size: 13px;
    color: #262626;
    line-height: 1.6;
}

.edit-subscription-btn-container {
    text-align: center;
    padding: 10px 0;
}
.edit-subscription-btn-container :deep(.ant-btn) {
    background: #f0f2f5;
    border: none;
    color: #595959;
    font-size: 13px;
    padding: 0 24px;
}
.edit-subscription-btn-container :deep(.ant-btn:hover) {
    background: #e6e8eb;
    color: #262626;
}

/* 公农历转换样式 */
.converter-result {
    background: #f5f7fa;
    padding: 16px;
    border-radius: 8px;
}
.result-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
}
.result-item:last-child {
    margin-bottom: 0;
}
.result-item .label {
    min-width: 80px;
    font-weight: 500;
    color: #666;
}
.result-item .value {
    color: #333;
    font-size: 15px;
}

/* 全部工具网格 */
.all-tools-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    padding: 16px 0;
}
.tool-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    border-radius: 12px;
    background: #f9f9f9;
    cursor: pointer;
    transition: all 0.3s;
    border: 2px solid transparent;
}
.tool-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    border-color: #1890ff;
    background: white;
}
.tool-card-icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin-bottom: 12px;
    transition: all 0.3s;
}
.tool-card:hover .tool-card-icon {
    transform: scale(1.1);
}
.tool-card-title {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 4px;
    color: #333;
}
.tool-card-desc {
    font-size: 12px;
    color: #999;
    text-align: center;
}

/* 日程卡片优化样式 */
.schedule-card {
    padding: 14px !important;
}
.schedule-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
}
.header-left {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
}
.schedule-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.schedule-card-item {
    position: relative;
    background: #f8faff;
    border-radius: 10px;
    overflow: hidden;
    transition: all 0.2s;
    border: 1px solid transparent;
}
.schedule-card-item:hover {
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border-color: #e6f7ff;
}
.type-indicator {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
}
.indicator-event {
    background: #1890ff;
}
.indicator-todo {
    background: #52c41a;
}
.indicator-birthday {
    background: #eb2f96;
}
.indicator-anniversary {
    background: #f5222d;
}
.indicator-countdown {
    background: #722ed1;
}

.item-body {
    padding: 10px 12px 10px 14px;
}
.item-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}
.item-info {
    flex: 1;
    overflow: hidden;
}
.item-title {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 4px;
}
.item-meta-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}
.item-type-tag {
    font-size: 10px;
    padding: 0 6px;
    border-radius: 4px;
    line-height: 18px;
}
.tag-event {
    background: #e6f7ff;
    color: #1890ff;
}
.tag-todo {
    background: #f6ffed;
    color: #52c41a;
}
.tag-birthday {
    background: #fff0f6;
    color: #eb2f96;
}
.tag-anniversary {
    background: #fff1f0;
    color: #f5222d;
}
.tag-countdown {
    background: #f9f0ff;
    color: #722ed1;
}

.item-time {
    font-size: 12px;
    color: #8c8c8c;
}
.item-ops {
    display: flex;
    gap: 4px;
    opacity: 0.3;
    transition: all 0.2s;
}
.schedule-card-item:hover .item-ops {
    opacity: 1;
}
.op-btn {
    padding: 0 4px;
    height: 24px;
    width: 24px;
}
.item-extra {
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px dashed #f0f0f0;
    font-size: 12px;
    color: #8c8c8c;
}
.empty-schedule-box {
    text-align: center;
    padding: 24px 0;
    background: #fafafa;
    border-radius: 8px;
    border: 1px dashed #d9d9d9;
}
.empty-icon {
    font-size: 28px;
    margin-bottom: 8px;
}
.empty-text {
    color: #bfbfbf;
    font-size: 13px;
}
</style>
