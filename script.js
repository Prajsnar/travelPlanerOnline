let data = {};
let variables = {};
let currencyCode = "zł";
let currencyCost = 1;

function generateResultText(data, variables) {
    if (
        isNaN(data.kmCount) || data.kmCount <= 0 ||
        isNaN(data.fuelConsumption) || data.fuelConsumption <= 0 ||
        isNaN(data.litrCost) || data.litrCost <= 0 ||
        isNaN(data.stopsCount) || data.stopsCount < 0
    ) {
        alert('Uzupełnij pola poprawnymi danymi');
        return null;
    }
    return `
        Nazwa trasy: ${data.travelName}<br>
        Trasa liczy: ${data.kmCount.toFixed(2)} kilometrów<br>
        Auto spali: ${variables.fuelBurned.toFixed(2)} litrów paliwa<br>
        Przy cenie paliwa: ${data.litrCost.toFixed(2)} ${data.selectedCurrencyCode}/litr, koszt wyniesie ${variables.fuelCost.toFixed(2)}${data.selectedCurrencyCode}<br>
        Na jednego pasażera koszt wyniesie: ${(variables.fuelCost / data.passengerCount).toFixed(2)}${data.selectedCurrencyCode}<br>
        Liczba przystanków na trasie: ${data.stopsCount}<br> 
        `;
}

document.getElementById('calculate').addEventListener('click', () => {
    data = {
        travelName: $('#travelName').val(),
        kmCount: parseFloat($('#kmCount').val()),
        fuelConsumption: parseFloat($('#fuelConsumption').val()),
        litrCost: parseFloat($('#litrCost').val()),
        passengerCount: parseInt($('#passengerCount').val()),
        stopsCount: parseInt($('#stopsCount').val()),
        selectedCurrencyCode: currencyCode,
        selectedCurrencyCost: currencyCost,
    };

    variables = {
        fuelBurned: parseFloat((data.kmCount / 100) * data.fuelConsumption),
        fuelCost: parseFloat(((data.kmCount / 100) * data.fuelConsumption * data.litrCost) * currencyCost),
        passengerCost: parseFloat(((data.kmCount / 100) * data.fuelConsumption * data.litrCost) / data.passengerCount),
    };
    /* 
        Sprawdzanie checkboxów, wykonywanie akcji: 
        iskmDoubleChecked odpowiada za podwojenie podanej wartości KM przez użytkownika
        isDriverIncluded odpowiada za dodanie kierowcy do liczby pasażerów
        isAutoStopCalculation odpowiada za automatyczne obliczanie przystanków
    */

    const iskmDoubleChecked = document.getElementById('doubleKM');
    const isDriverIncluded = document.getElementById('driverIncluded');
    const isAutoStopCalculation = document.getElementById('stopsAuto');



    if (iskmDoubleChecked.classList.contains('active')) {
        data.kmCount *= 2;
        variables.fuelBurned *= 2;
        variables.fuelCost *= 2;
    }

    if (isDriverIncluded.classList.contains('active')) {
        data.passengerCount += 1;
    }


    if (isAutoStopCalculation.classList.contains('active')) {
        const fuelTankCapacity = 40;
        const fuelConsumption = data.fuelConsumption;
        const reserve = 70;
        const rangePerTank = (fuelTankCapacity / fuelConsumption) * 100;
        const distanceToCover = data.kmCount - reserve;

        data.stopsCount = Math.floor(distanceToCover / rangePerTank);
    }

    /* 
        Generowanie tekstu
    */


    const resultText = generateResultText(data, variables);
    if (resultText) {
        document.getElementById('resultText').innerHTML = resultText;
    }
});


/* 
    Zapisywanie danych do buttonów
*/

const savedList = document.getElementById('savedList');
const saveButton = document.getElementById('saveList');

function addSavedButton(data, variables) {
    const newButton = document.createElement('button');
    newButton.textContent = data.travelName;
    newButton.classList.add('newButton');
    savedList.appendChild(newButton);
    newButton.setAttribute('data-saved', JSON.stringify({ data, variables }));

    newButton.addEventListener('click', () => {
        const savedData = JSON.parse(newButton.getAttribute('data-saved'));
        document.getElementById('savedData').innerHTML = generateResultText(savedData.data, savedData.variables);
    });
};

/*
    Funkcje zapisujące przyciski do localStorage
*/

function saveToLocalStorage() {
    const buttons = savedList.querySelectorAll('button');
    const savedButtons = [];

    buttons.forEach(button => {
        const savedData = JSON.parse(button.getAttribute('data-saved'));
        savedButtons.push(savedData);
    });
    localStorage.setItem('savedButtons', JSON.stringify(savedButtons));
}

function loadFromLocalStorage() {
    const savedButtons = JSON.parse(localStorage.getItem('savedButtons')) || [];
    savedButtons.forEach(savedButton => {
        addSavedButton(savedButton.data, savedButton.variables);
    });
}

saveButton.addEventListener('click', () => {
    if (data.travelName.trim() === '') {
        alert('Podaj nazwę trasy');
        return;
    }
    addSavedButton(data, variables);
    saveToLocalStorage();
});

loadFromLocalStorage();

/*
    Usuwanie przycisków z listy
*/

document.getElementById('clearList').addEventListener('click', () => {
    const areYouSure = prompt('Czy na pewno chcesz usunąć wszystkie trasy?');
    const connectedData = document.getElementById('connectedData');
    const savedData = document.getElementById('savedData');
    if (areYouSure && areYouSure.trim().toLowerCase() === 'tak') {
        savedList.innerHTML = '';
        connectedData.innerText = '';
        savedData.innerText = '';
        saveToLocalStorage();
    } else {
        return;
    }
});

/*
    Usuwanie przycisku po podaniu nazwy trasy
*/

function buttonToDelete(nameToDelete) {
    const buttons = savedList.querySelectorAll('button');

    buttons.forEach(button => {
        const savedData = JSON.parse(button.getAttribute('data-saved'));
        const connectedData = document.getElementById('connectedData');
        if (savedData.data.travelName === nameToDelete) {
            savedList.removeChild(button);
            connectedData.innerText = '';
            saveToLocalStorage();
        }
    });
}

document.getElementById('clearOne').addEventListener('click', () => {
    const nameToDelete = prompt('Podaj nazwę trasy do usunięcia');
    if (nameToDelete) {
        buttonToDelete(nameToDelete);
        saveToLocalStorage();
    }
});

/*
    Łączenie danych z tras - kilometrów, spalonego paliwa itd. 
*/

function addData() {

    let totalKmCount = 0;
    let totalFuelBurned = 0;
    let totalFuelCost = 0;
    let totalPassengerCost = 0;


    const buttons = savedList.querySelectorAll('button');
    const connectedData = document.getElementById('connectedData');

    buttons.forEach(button => {
        const savedData = JSON.parse(button.getAttribute('data-saved'));
        const kmCount = savedData.data.kmCount
        const fuelBurned = savedData.variables.fuelBurned
        const fuelCost = savedData.variables.fuelCost
        const passengerCost = (savedData.variables.fuelCost / savedData.data.passengerCount)

        totalKmCount += kmCount;
        totalFuelBurned += fuelBurned;
        totalFuelCost += fuelCost;
        totalPassengerCost += passengerCost;
    });
    if (
        isNaN(totalKmCount) || totalKmCount <= 0 ||
        isNaN(totalFuelBurned) || totalFuelBurned <= 0 ||
        isNaN(totalFuelCost) || totalFuelCost <= 0 ||
        isNaN(totalPassengerCost) || totalPassengerCost < 0
    ) {
        alert('Brak danych do połączenia');
        return null;
    } else {
        connectedData.innerText = `Łączna liczba kilometrów: ${totalKmCount.toFixed(2)} km
        Łączne spalanie paliwa: ${totalFuelBurned.toFixed(2)} litrów
        Łączny koszt paliwa: ${totalFuelCost.toFixed(2)} zł
        Średni koszt na pasażera: ${(totalPassengerCost / buttons.length).toFixed(2)} zł
        `}
}

document.getElementById('connectData').addEventListener('click', () => {
    addData();
});


/* 
    Fetchowanie danych i wprowadzenie ich do elementu na stronie
*/

function updateCurrencyCode(code) {
    currencyCode = code;
}

function updateCurrencyCost(cost) {
    currencyCost = cost;
}

async function currencyFetch() {

    try {
        const response = await fetch("https://api.nbp.pl/api/exchangerates/tables/A/");
        if (!response.ok) {
            throw new Error("Error (236)")
        }
        const data = await response.json();
        const currencyName = data[0].rates;
        const currencyList = document.getElementById('currency')

        currencyName.forEach((rates) => {
            const currencyCreate = document.createElement('li')
            currencyCreate.textContent = ` ${rates.currency} (${rates.code})`
            currencyCreate.classList.add('currency');

            currencyCreate.addEventListener('click', () => {
                const activeItems = document.querySelectorAll('.currency')
                const isActive = currencyCreate.classList.contains('active');

                activeItems.forEach((item) => item.classList.remove('active'));

                if (!isActive) {
                    currencyCreate.classList.add('active');
                    updateCurrencyCode(rates.code);
                    updateCurrencyCost(rates.mid);
                } else {
                    updateCurrencyCode("PLN");
                    updateCurrencyCost(1);
                }
            });

            currencyList.appendChild(currencyCreate)

        });
        console.log(data[0]);
    }
    catch (error) {
        console.error(error);
    }
}
currencyFetch();


/*
    Funkcje do zmiany koloru tła po kliknięciu
*/

document.querySelectorAll('.labelButton').forEach((label) => {
    label.addEventListener('click', () => {
            label.classList.toggle('active');
    });
});