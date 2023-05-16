const
    valueInput = document.getElementById('valueInput'),
    fromCurrencyDropdown = document.getElementById('fromCurrencyDropdown'),
    toCurrencyDropdown = document.getElementById('toCurrencyDropdown'),
    messageBox = document.getElementById('messageBox'),
    wrapper = document.getElementById('wrapper')

const
    INTL_LOCALE = navigator.languages && navigator.languages.length ? navigator.languages[0] : navigator.language,
    MESSAGEBOX_CLASSES = {
        ERROR: 'alert-danger',
        PENDING: 'alert-warning',
        PRIMARY: 'alert-primary',
        SUCCESS: 'alert-success'
    },
    MESSAGES = {
        INITIAL: 'INFO: Aby rozpocząć obliczenia, wprowadź wartość i wybierz waluty.',
        MISSING_DATA: 'Brak danych niezbędnych do obliczeń!',
        PENDING: 'Ładowanie danych...',
    },
    PLN_OPTION = { currency: 'polski złoty', code: 'PLN', mid: 1 }

let currencies = null, toCurrency = null, fromCurrency = null

window.onload = async () => {
    updateMessageBox(MESSAGEBOX_CLASSES.PENDING, MESSAGES.PENDING)
    await setCurrencies()
    initializeCurrencyDropdowns()
    fromCurrency = currencies.find(item => item.code === PLN_OPTION.code)
    updateMessageBox(MESSAGEBOX_CLASSES.PRIMARY, MESSAGES.INITIAL)
    wrapper.classList.remove('d-none')
}

const computeValue = () => {
    if (toCurrency && fromCurrency) {
        const fromValueFormatted = getFormattedValue(fromCurrency.code, valueInput.value)
        const toValueFormatted = getFormattedValue(toCurrency.code, valueInput.value * (fromCurrency.rate / toCurrency.rate))
        updateMessageBox(MESSAGEBOX_CLASSES.SUCCESS, `${fromValueFormatted} => ${toValueFormatted}`)
    } else {
        updateMessageBox(MESSAGEBOX_CLASSES.ERROR, MESSAGES.MISSING_DATA)
    }
}

const currencyMapper = (array) => {
    return array.map(currency => {
        return { code: currency.code, name: currency.currency, rate: currency.mid }
    })
}

const fetchData = async () => {
    try {
        const response = await fetch('https://api.nbp.pl/api/exchangerates/tables/a/?format=json')
        return await response.json()
    }
    catch (ex) {
        updateMessageBox(MESSAGEBOX_CLASSES.ERROR, ex)
    }
}

const getFormattedValue = (currency, value) => {
    return new Intl.NumberFormat(INTL_LOCALE, {
        currency: currency,
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
        style: 'currency'
    }).format(value)
}

const handleFromCurrencyChange = (option) => {
    fromCurrency = currencies.find(item => item.code === option.value)
    computeValue()
}

const handleToCurrencyChange = (option) => {
    toCurrency = currencies.find(item => item.code === option.value)
    computeValue()
}

const initializeCurrencyDropdowns = () => {
    [fromCurrencyDropdown, toCurrencyDropdown].map(dropdown => {
        currencies.map(item => {
            const option = document.createElement('option')
            option.value = item.code
            option.innerText = `${item.code} - ${item.name}`
            option.dataset.rate = item.rate
            dropdown.append(option)
        })
    })
    fromCurrencyDropdown.value = PLN_OPTION.code
}

const setCurrencies = async () => {
    const cache = localStorage.getItem('table') ? JSON.parse(localStorage.getItem('table')) : null

    if (cache && cache.effectiveDate === new Intl.DateTimeFormat("fr-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).format(Date.now())) {
        currencies = currencyMapper(cache.rates)
    } else {
        const response = await fetchData()
        response[0].rates.push(PLN_OPTION)
        response[0].rates = response[0].rates.sort((a, b) => a.code.localeCompare(b.code))
        currencies = currencyMapper(response[0].rates)
        localStorage.setItem('table', JSON.stringify(response[0]))
    }
}

const swapCurrencies = () => {
    const fromCurrencyInitalDropdownValue = fromCurrencyDropdown.value
    fromCurrencyDropdown.value = toCurrencyDropdown.value
    toCurrencyDropdown.value = fromCurrencyInitalDropdownValue

    const fromCurrencyInitialValue = fromCurrency
    fromCurrency = toCurrency
    toCurrency = fromCurrencyInitialValue

    if (toCurrency && fromCurrency) computeValue()
}

const updateMessageBox = (type, message) => {
    messageBox.classList.remove(...Object.values(MESSAGEBOX_CLASSES))
    messageBox.classList.add(type)
    messageBox.innerText = message
}
