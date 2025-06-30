<template>
  <div class="date-picker" :class="containerClasses">
    <!-- 标签 -->
    <label v-if="label" :for="inputId" class="date-picker-label">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- 日期输入框容器 -->
    <div class="date-picker-container" :class="inputContainerClasses" ref="container">
      <!-- 输入框 -->
      <input
        :id="inputId"
        ref="input"
        type="text"
        :value="displayValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly || !editable"
        :required="required"
        :class="inputClasses"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
        @click="handleInputClick"
      />

      <!-- 日历图标 -->
      <button
        type="button"
        class="date-picker-trigger"
        @click="toggleCalendar"
        :disabled="disabled"
        title="选择日期"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      <!-- 日历面板 -->
      <transition name="calendar">
        <div
          v-if="isOpen"
          class="date-picker-calendar"
          :class="calendarClasses"
          ref="calendar"
        >
          <!-- 日历头部 -->
          <div class="calendar-header">
            <button
              type="button"
              class="calendar-nav-btn"
              @click="previousYear"
              title="上一年"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              class="calendar-nav-btn"
              @click="previousMonth"
              title="上个月"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div class="calendar-title">
              <button
                type="button"
                class="calendar-month-year"
                @click="toggleMonthYearPicker"
              >
                {{ currentMonthYear }}
              </button>
            </div>
            
            <button
              type="button"
              class="calendar-nav-btn"
              @click="nextMonth"
              title="下个月"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              type="button"
              class="calendar-nav-btn"
              @click="nextYear"
              title="下一年"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <!-- 星期标题 -->
          <div class="calendar-weekdays">
            <div
              v-for="weekday in weekdays"
              :key="weekday"
              class="calendar-weekday"
            >
              {{ weekday }}
            </div>
          </div>

          <!-- 日期网格 -->
          <div class="calendar-days">
            <button
              v-for="day in calendarDays"
              :key="day.key"
              type="button"
              :class="getDayClasses(day)"
              @click="selectDate(day)"
              :disabled="day.disabled"
            >
              {{ day.date }}
            </button>
          </div>

          <!-- 今天按钮 -->
          <div v-if="showToday" class="calendar-footer">
            <button
              type="button"
              class="calendar-today-btn"
              @click="selectToday"
            >
              今天
            </button>
          </div>
        </div>
      </transition>
    </div>

    <!-- 帮助文本或错误信息 -->
    <div v-if="helperText || errorMessage" class="date-picker-helper">
      <span :class="helperTextClasses">
        {{ errorMessage || helperText }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

let inputIdCounter = 0

interface CalendarDay {
  date: number
  fullDate: Date
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  disabled: boolean
  key: string
}

export default Vue.extend({
  name: 'DatePicker',
  props: {
    value: {
      type: [Date, String],
      default: null
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: '请选择日期'
    },
    helperText: {
      type: String,
      default: ''
    },
    errorMessage: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    editable: {
      type: Boolean,
      default: true
    },
    format: {
      type: String,
      default: 'YYYY-MM-DD'
    },
    size: {
      type: String,
      default: 'md',
      validator: (value: string) => ['sm', 'md', 'lg'].includes(value)
    },
    minDate: {
      type: [Date, String],
      default: null
    },
    maxDate: {
      type: [Date, String],
      default: null
    },
    showToday: {
      type: Boolean,
      default: true
    },
    firstDayOfWeek: {
      type: Number,
      default: 1, // 1 = Monday, 0 = Sunday
      validator: (value: number) => value >= 0 && value <= 6
    }
  },
  data() {
    return {
      inputId: `date-picker-${++inputIdCounter}`,
      isOpen: false,
      focused: false,
      currentDate: new Date(),
      showMonthYearPicker: false
    }
  },
  computed: {
    hasError(): boolean {
      return !!this.errorMessage
    },
    
    selectedDate(): Date | null {
      if (!this.value) return null
      return this.value instanceof Date ? this.value : new Date(this.value)
    },
    
    displayValue(): string {
      if (!this.selectedDate) return ''
      return this.formatDate(this.selectedDate)
    },
    
    currentMonthYear(): string {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth() + 1
      return `${year}年${month}月`
    },
    
    weekdays(): string[] {
      const days = ['日', '一', '二', '三', '四', '五', '六']
      // 根据 firstDayOfWeek 调整顺序
      return [...days.slice(this.firstDayOfWeek), ...days.slice(0, this.firstDayOfWeek)]
    },
    
    calendarDays(): CalendarDay[] {
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()
      
      // 当月第一天
      const firstDay = new Date(year, month, 1)
      // 当月最后一天
      const lastDay = new Date(year, month + 1, 0)
      
      // 计算日历开始日期（可能是上个月的日期）
      const startDate = new Date(firstDay)
      const dayOfWeek = (firstDay.getDay() - this.firstDayOfWeek + 7) % 7
      startDate.setDate(startDate.getDate() - dayOfWeek)
      
      const days: CalendarDay[] = []
      const today = new Date()
      
      // 生成6周的日期（42天）
      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)
        
        const isCurrentMonth = date.getMonth() === month
        const isToday = this.isSameDay(date, today)
        const isSelected = this.selectedDate ? this.isSameDay(date, this.selectedDate) : false
        const disabled = this.isDateDisabled(date)
        
        days.push({
          date: date.getDate(),
          fullDate: new Date(date),
          isCurrentMonth,
          isToday,
          isSelected,
          disabled,
          key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
        })
      }
      
      return days
    },
    
    containerClasses(): string[] {
      const classes = ['space-y-1', 'relative']
      
      if (this.disabled) {
        classes.push('opacity-50')
      }
      
      return classes
    },
    
    inputContainerClasses(): string[] {
      const classes = [
        'relative',
        'flex',
        'items-center',
        'border',
        'rounded-md',
        'transition-colors',
        'duration-200'
      ]

      // 尺寸
      switch (this.size) {
        case 'sm':
          classes.push('min-h-8')
          break
        case 'lg':
          classes.push('min-h-12')
          break
        default:
          classes.push('min-h-10')
          break
      }

      // 状态样式
      if (this.hasError) {
        classes.push('border-red-300', 'focus-within:border-red-500', 'focus-within:ring-red-500')
      } else if (this.focused || this.isOpen) {
        classes.push('border-blue-300', 'ring-1', 'ring-blue-500')
      } else {
        classes.push('border-gray-300', 'focus-within:border-blue-500', 'focus-within:ring-1', 'focus-within:ring-blue-500')
      }

      if (this.disabled) {
        classes.push('bg-gray-50', 'cursor-not-allowed')
      } else {
        classes.push('bg-white', 'hover:border-gray-400')
      }

      return classes
    },
    
    inputClasses(): string[] {
      const classes = [
        'flex-1',
        'border-0',
        'bg-transparent',
        'outline-none',
        'placeholder-gray-400',
        'text-gray-900'
      ]

      // 尺寸
      switch (this.size) {
        case 'sm':
          classes.push('px-3', 'py-1.5', 'text-sm')
          break
        case 'lg':
          classes.push('px-4', 'py-3', 'text-base')
          break
        default:
          classes.push('px-3', 'py-2', 'text-sm')
          break
      }

      if (this.disabled || this.readonly) {
        classes.push('cursor-not-allowed')
      }

      return classes
    },
    
    calendarClasses(): string[] {
      return [
        'absolute',
        'top-full',
        'left-0',
        'z-50',
        'mt-1',
        'bg-white',
        'dark:bg-gray-800',
        'border',
        'border-gray-200',
        'dark:border-gray-700',
        'rounded-md',
        'shadow-lg',
        'p-4',
        'min-w-80'
      ]
    },
    
    helperTextClasses(): string[] {
      const classes = ['text-xs']
      
      if (this.hasError) {
        classes.push('text-red-600')
      } else {
        classes.push('text-gray-500')
      }
      
      return classes
    }
  },
  watch: {
    isOpen(newValue) {
      if (newValue) {
        // 设置当前显示的月份为选中日期的月份（如果有选中日期）
        if (this.selectedDate) {
          this.currentDate = new Date(this.selectedDate)
        }
        this.$nextTick(() => {
          this.addClickOutsideListener()
        })
      } else {
        this.removeClickOutsideListener()
      }
    }
  },
  methods: {
    formatDate(date: Date): string {
      // 简单的日期格式化，实际项目中建议使用 date-fns 或 moment.js
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      
      return this.format
        .replace('YYYY', String(year))
        .replace('MM', month)
        .replace('DD', day)
    },
    
    parseDate(dateString: string): Date | null {
      // 简单的日期解析
      const match = dateString.match(/(\d{4})-(\d{2})-(\d{2})/)
      if (match) {
        const [, year, month, day] = match
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      }
      return null
    },
    
    isSameDay(date1: Date, date2: Date): boolean {
      return date1.getFullYear() === date2.getFullYear() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getDate() === date2.getDate()
    },
    
    isDateDisabled(date: Date): boolean {
      if (this.minDate) {
        const min = this.minDate instanceof Date ? this.minDate : new Date(this.minDate)
        if (date < min) return true
      }
      
      if (this.maxDate) {
        const max = this.maxDate instanceof Date ? this.maxDate : new Date(this.maxDate)
        if (date > max) return true
      }
      
      return false
    },
    
    getDayClasses(day: CalendarDay): string[] {
      const classes = [
        'calendar-day',
        'w-8',
        'h-8',
        'flex',
        'items-center',
        'justify-center',
        'text-sm',
        'rounded',
        'transition-colors',
        'duration-200'
      ]
      
      if (day.disabled) {
        classes.push('cursor-not-allowed', 'opacity-50')
      } else {
        classes.push('cursor-pointer', 'hover:bg-blue-50', 'dark:hover:bg-blue-900/30')
      }
      
      if (!day.isCurrentMonth) {
        classes.push('text-gray-400', 'dark:text-gray-600')
      } else {
        classes.push('text-gray-900', 'dark:text-gray-100')
      }
      
      if (day.isToday) {
        classes.push('font-semibold', 'text-blue-600', 'dark:text-blue-400')
      }
      
      if (day.isSelected) {
        classes.push('bg-blue-600', 'text-white', 'hover:bg-blue-700')
      }
      
      return classes
    },
    
    handleInput(event: Event) {
      if (!this.editable) return
      
      const target = event.target as HTMLInputElement
      const date = this.parseDate(target.value)
      
      if (date && !isNaN(date.getTime())) {
        this.$emit('input', date)
        this.$emit('change', date)
      }
    },
    
    handleFocus(event: Event) {
      this.focused = true
      this.$emit('focus', event)
    },
    
    handleBlur(event: Event) {
      this.focused = false
      this.$emit('blur', event)
    },
    
    handleKeydown(event: KeyboardEvent) {
      switch (event.key) {
        case 'Enter':
          event.preventDefault()
          this.toggleCalendar()
          break
        case 'Escape':
          this.isOpen = false
          break
      }
      
      this.$emit('keydown', event)
    },
    
    handleInputClick() {
      if (!this.disabled && !this.readonly) {
        this.toggleCalendar()
      }
    },
    
    toggleCalendar() {
      if (!this.disabled) {
        this.isOpen = !this.isOpen
      }
    },
    
    selectDate(day: CalendarDay) {
      if (day.disabled) return
      
      this.$emit('input', day.fullDate)
      this.$emit('change', day.fullDate)
      this.isOpen = false
    },
    
    selectToday() {
      const today = new Date()
      this.$emit('input', today)
      this.$emit('change', today)
      this.isOpen = false
    },
    
    previousMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1)
    },
    
    nextMonth() {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1)
    },
    
    previousYear() {
      this.currentDate = new Date(this.currentDate.getFullYear() - 1, this.currentDate.getMonth(), 1)
    },
    
    nextYear() {
      this.currentDate = new Date(this.currentDate.getFullYear() + 1, this.currentDate.getMonth(), 1)
    },
    
    toggleMonthYearPicker() {
      // 可以在这里实现月年选择器
      this.showMonthYearPicker = !this.showMonthYearPicker
    },
    
    handleClickOutside(event: Event) {
      const target = event.target as HTMLElement
      if (!this.$refs.container || !(this.$refs.container as HTMLElement).contains(target)) {
        this.isOpen = false
      }
    },
    
    addClickOutsideListener() {
      document.addEventListener('click', this.handleClickOutside)
    },
    
    removeClickOutsideListener() {
      document.removeEventListener('click', this.handleClickOutside)
    }
  },
  beforeDestroy() {
    this.removeClickOutsideListener()
  }
})
</script>

<style scoped>
.date-picker-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300;
}

.date-picker-trigger {
  @apply flex items-center justify-center px-2 text-gray-400 hover:text-gray-600 transition-colors duration-200;
}

.calendar-header {
  @apply flex items-center justify-between mb-4;
}

.calendar-nav-btn {
  @apply p-1 text-gray-400 hover:text-gray-600 rounded transition-colors duration-200;
}

.calendar-title {
  @apply flex-1 text-center;
}

.calendar-month-year {
  @apply text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200;
}

.calendar-weekdays {
  @apply grid grid-cols-7 gap-1 mb-2;
}

.calendar-weekday {
  @apply w-8 h-8 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400;
}

.calendar-days {
  @apply grid grid-cols-7 gap-1;
}

.calendar-footer {
  @apply mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center;
}

.calendar-today-btn {
  @apply px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors duration-200;
}

.date-picker-helper {
  @apply mt-1;
}

/* 日历动画 */
.calendar-enter-active,
.calendar-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.calendar-enter-from,
.calendar-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
