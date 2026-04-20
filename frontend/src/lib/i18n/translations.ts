type TranslationValues = {
  app: {
    title: string
    admin: string
  }
  home: {
    heading: string
    subheading: string
    noEvents: string
    duration: string
    minutes: string
    adminDashboard: string
  }
  booking: {
    back: string
    duration: string
    min: string
    selectTime: string
    loadingSlots: string
    availableOn: string
    noSlots: string
    selected: string
    at: string
    confirmBooking: string
    free: string
    loading: string
  }
  month: {
    january: string; february: string; march: string;
    april: string; may: string; june: string;
    july: string; august: string; september: string;
    october: string; november: string; december: string;
  }
  weekDay: {
    mon: string; tue: string; wed: string; thu: string; fri: string; sat: string; sun: string;
  }
  weekDayFull: {
    monday: string; tuesday: string; wednesday: string;
    thursday: string; friday: string; saturday: string; sunday: string;
  }
  viewSwitcher: {
    month: string
    week: string
    list: string
  }
  confirm: {
    title: string
    selectedTime: string
    yourName: string
    email: string
    booking: string
    bookMeeting: string
  }
  success: {
    title: string
    message: string
    emailNote: string
    backToBooking: string
  }
  admin: {
    dashboard: string
    calendar: string
    upcoming: string
    noBookings: string
    manageEvents: string
    backToBooking: string
    backToDashboard: string
    confirmed: string
    cancelled: string
    total: string
    cancel: string
    cancelling: string
    cancelConfirm: string
    close: string
    noBookingsDay: string
    dateTime: string
    guest: string
    email: string
    status: string
  }
  events: {
    title: string
    createNew: string
    name: string
    description: string
    duration: string
    actions: string
    edit: string
    delete: string
    deleting: string
    deleteConfirm: string
    noEvents: string
    createTitle: string
    editTitle: string
    durationMinutes: string
    creating: string
    updating: string
    createBtn: string
    updateBtn: string
    cancelBtn: string
  }
  common: {
    loading: string
    error: string
    notFound: string
    eventTypeNotFound: string
  }
}

export type Locale = 'en' | 'ru'

export const translations: Record<Locale, TranslationValues> = {
  en: {
    app: {
      title: 'Calendar Booking',
      admin: 'Admin',
    },
    home: {
      heading: 'Book a Meeting',
      subheading: 'Select an event type to book a time slot',
      noEvents: 'No event types available yet.',
      duration: 'Duration',
      minutes: 'minutes',
      adminDashboard: 'Admin Dashboard',
    },
    booking: {
      back: 'Back',
      duration: 'Duration',
      min: 'min',
      selectTime: 'Select Time',
      loadingSlots: 'Loading slots...',
      availableOn: 'Available slots on',
      noSlots: 'No available slots',
      selected: 'Selected',
      at: 'at',
      confirmBooking: 'Confirm Booking',
      free: 'free',
      loading: 'Loading...',
    },
    month: {
      january: 'January', february: 'February', march: 'March',
      april: 'April', may: 'May', june: 'June',
      july: 'July', august: 'August', september: 'September',
      october: 'October', november: 'November', december: 'December',
    },
    weekDay: {
      mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun',
    },
    weekDayFull: {
      monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
      thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
    },
    viewSwitcher: {
      month: 'Month',
      week: 'Week',
      list: 'List',
    },
    confirm: {
      title: 'Confirm Booking',
      selectedTime: 'Selected time',
      yourName: 'Your Name',
      email: 'Email',
      booking: 'Booking...',
      bookMeeting: 'Book Meeting',
    },
    success: {
      title: 'Booking Confirmed!',
      message: 'Your meeting has been successfully booked.',
      emailNote: 'You will receive a confirmation email shortly.',
      backToBooking: 'Back to Booking',
    },
    admin: {
      dashboard: 'Admin Dashboard',
      calendar: 'Bookings Calendar',
      upcoming: 'Upcoming Bookings',
      noBookings: 'No upcoming bookings.',
      manageEvents: 'Manage Event Types',
      backToBooking: 'Back to Booking',
      backToDashboard: 'Back to Dashboard',
      confirmed: 'Confirmed',
      cancelled: 'Cancelled',
      total: 'Total',
      cancel: 'Cancel',
      cancelling: 'Cancelling...',
      cancelConfirm: 'Cancel this booking?',
      close: 'Close',
      noBookingsDay: 'No bookings',
      dateTime: 'Date/Time',
      guest: 'Guest',
      email: 'Email',
      status: 'Status',
    },
    events: {
      title: 'Event Types',
      createNew: 'Create New Event Type',
      name: 'Name',
      description: 'Description',
      duration: 'Duration',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      deleting: 'Deleting...',
      deleteConfirm: 'Are you sure you want to delete this event type?',
      noEvents: 'No event types created yet.',
      createTitle: 'Create Event Type',
      editTitle: 'Edit Event Type',
      durationMinutes: 'Duration (minutes)',
      creating: 'Creating...',
      updating: 'Updating...',
      createBtn: 'Create Event Type',
      updateBtn: 'Update Event Type',
      cancelBtn: 'Cancel',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      notFound: 'Not found',
      eventTypeNotFound: 'Event type not found',
    },
  },
  ru: {
    app: {
      title: 'Бронирование',
      admin: 'Админ',
    },
    home: {
      heading: 'Забронируйте встречу',
      subheading: 'Выберите тип события для бронирования времени',
      noEvents: 'Типы событий пока не созданы.',
      duration: 'Длительность',
      minutes: 'минут',
      adminDashboard: 'Панель администратора',
    },
    booking: {
      back: 'Назад',
      duration: 'Длительность',
      min: 'мин',
      selectTime: 'Выберите время',
      loadingSlots: 'Загрузка слотов...',
      availableOn: 'Свободные слоты на',
      noSlots: 'Нет свободных слотов',
      selected: 'Выбрано',
      at: 'в',
      confirmBooking: 'Подтвердить бронирование',
      free: 'своб.',
      loading: 'Загрузка...',
    },
    month: {
      january: 'Январь', february: 'Февраль', march: 'Март',
      april: 'Апрель', may: 'Май', june: 'Июнь',
      july: 'Июль', august: 'Август', september: 'Сентябрь',
      october: 'Октябрь', november: 'Ноябрь', december: 'Декабрь',
    },
    weekDay: {
      mon: 'Пн', tue: 'Вт', wed: 'Ср', thu: 'Чт', fri: 'Пт', sat: 'Сб', sun: 'Вс',
    },
    weekDayFull: {
      monday: 'Понедельник', tuesday: 'Вторник', wednesday: 'Среда',
      thursday: 'Четверг', friday: 'Пятница', saturday: 'Суббота', sunday: 'Воскресенье',
    },
    viewSwitcher: {
      month: 'Месяц',
      week: 'Неделя',
      list: 'Список',
    },
    confirm: {
      title: 'Подтверждение бронирования',
      selectedTime: 'Выбранное время',
      yourName: 'Ваше имя',
      email: 'Email',
      booking: 'Бронирование...',
      bookMeeting: 'Забронировать',
    },
    success: {
      title: 'Бронирование подтверждено!',
      message: 'Ваша встреча успешно забронирована.',
      emailNote: 'Вы получите письмо с подтверждением.',
      backToBooking: 'Назад к бронированию',
    },
    admin: {
      dashboard: 'Панель администратора',
      calendar: 'Календарь бронирований',
      upcoming: 'Предстоящие бронирования',
      noBookings: 'Нет предстоящих бронирований.',
      manageEvents: 'Управление типами событий',
      backToBooking: 'Назад к бронированию',
      backToDashboard: 'Назад к панели',
      confirmed: 'Подтверждено',
      cancelled: 'Отменено',
      total: 'Всего',
      cancel: 'Отменить',
      cancelling: 'Отмена...',
      cancelConfirm: 'Отменить это бронирование?',
      close: 'Закрыть',
      noBookingsDay: 'Нет бронирований',
      dateTime: 'Дата/Время',
      guest: 'Гость',
      email: 'Email',
      status: 'Статус',
    },
    events: {
      title: 'Типы событий',
      createNew: 'Создать тип события',
      name: 'Название',
      description: 'Описание',
      duration: 'Длительность',
      actions: 'Действия',
      edit: 'Редактировать',
      delete: 'Удалить',
      deleting: 'Удаление...',
      deleteConfirm: 'Вы уверены, что хотите удалить этот тип события?',
      noEvents: 'Типы событий пока не созданы.',
      createTitle: 'Создать тип события',
      editTitle: 'Редактировать тип события',
      durationMinutes: 'Длительность (минуты)',
      creating: 'Создание...',
      updating: 'Обновление...',
      createBtn: 'Создать',
      updateBtn: 'Сохранить',
      cancelBtn: 'Отмена',
    },
    common: {
      loading: 'Загрузка...',
      error: 'Ошибка',
      notFound: 'Не найдено',
      eventTypeNotFound: 'Тип события не найден',
    },
  },
} as const

export type TranslationKey = TranslationValues
