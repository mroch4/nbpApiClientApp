var alertTypes = ['alert-danger', 'alert-primary', 'alert-success', 'alert-warning']

var cashInput = document.getElementsByTagName('input')[0]
var currencyDropdown = document.getElementsByClassName('form-select')[0]
var messageBox = document.getElementById('messageBox')

var baseUrl = 'http://api.nbp.pl/api/exchangerates/rates/a'

async function getCurrencyData(currency) {
    try {
        const response = await fetch(`${baseUrl}/${currency}/?format=json`);
        return await response.json()
    } catch (ex) {
        updateMessageBox(alertTypes[0], ex.toString())
    }
}

async function submitHandler() {
    var cashInputValue = cashInput.value
    var currencyDropdownVlaue = currencyDropdown.value

    if (cashInputValue && currencyDropdownVlaue) {
        updateMessageBox(alertTypes[3], 'Trwa kalkulacja...')

        var data = await getCurrencyData(currencyDropdown.value)
        var currencyRate = data.rates[0].mid
        var computedValue = (cashInputValue * currencyRate).toFixed(2)

        updateMessageBox(alertTypes[2], `${cashInputValue} ${currencyDropdownVlaue.toUpperCase()} to ${computedValue} PLN`)
    } else {
        updateMessageBox(alertTypes[0], 'Brak danych niezbędnych do obliczeń.')
    }
}

function updateMessageBox(alertType, message) {
    messageBox.classList.remove(...alertTypes)
    messageBox.classList.add(alertType)
    messageBox.innerText = message
}