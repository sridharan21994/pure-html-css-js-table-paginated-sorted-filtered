(function(){

const headers = ['numericCode', 'capital', 'region', 'population', 'name'],
    sortable = {'region': 'asc', 'population':'asc', 'name':'asc'}, 
    filterable = ['capital', '', 'population', 'name'], 
    isPaginated = true

let data = [], references = {}, itemsPerPage = 5, current = 1, totalPages = 0, filteredData = []

const fetchData = async () => {
    fetch('https://restcountries.eu/rest/v2/all')
    .then(res => res.json())
    .then(res => {
        document.getElementById('empty').innerHTML = ''
        document.getElementById('select').style.display = 'block'
        data = res
        getReferencesAndHeader()
        if (isPaginated) {
            renderTable(res.slice(0,itemsPerPage))
            createPagers()
            createPagination(res)
        } else {
            renderTable(res)
        }
        references['tableHeader'].addEventListener('click', sortTable)
        addFilters()
    })
    .catch(err => {})
}
fetchData()


const resetValues = (data) => {
    current = 1
    if(isPaginated) {
        renderTable(data.slice(0, itemsPerPage))
        createPagination(data)
    } else renderTable(data)
}

const attachPagerListeners = () => {
    document.getElementById('pagination').addEventListener('click', e => changePagination(e.target.innerHTML))
    document.getElementById('prev').addEventListener('click', e => changePagination(current-1))
    document.getElementById('next').addEventListener('click', e => changePagination(current+1))
    document.getElementById('select').addEventListener('change', e => changeItemsPerPage(e))
}

const changeItemsPerPage = (e) => {
    console.log(e.target.value);
    itemsPerPage = Number(e.target.value)
    resetValues(data)
}

const resetInputs = (ignore = '') => {
    const inputs = document.getElementsByTagName('input')
    Array.prototype.slice.call(inputs).forEach(element => {
        if (element.id !== ignore) element.value = null
    });
}

const sortTable = (e) => {
    const key = e.target.innerHTML
    if (key && sortable[key]) {
        if (sortable[key] === 'desc') {
            data = data.sort((a,b) => (a[key] > b[key]) ? 1 : ((b[key] > a[key]) ? -1 : 0))
            sortable[key] = 'asc'
        } else {
            data = data.sort((a,b) => (a[key] < b[key]) ? 1 : ((b[key] < a[key]) ? -1 : 0))
            sortable[key] = 'desc'
        }
        resetValues(data)
        resetInputs()
        filteredData = []
    }
}

const changePagination = (value) => {
    if (value<1 || value>totalPages) return

    document.querySelector(`[data-value="${current}"]`).classList.remove('active')
    document.querySelector(`[data-value="${value}"]`).classList.add('active')
    current = Number(value)

    filteredData.length ?
    renderTable(filteredData.slice(value * itemsPerPage - itemsPerPage, value * itemsPerPage))
    :
    renderTable(data.slice(value * itemsPerPage - itemsPerPage, value * itemsPerPage))
}

const getReferencesAndHeader = () => {
    references['table'] = document.getElementById('table')
    references['tableHeader'] = document.getElementById('tableHeader')
    references['tableBody'] = document.getElementById('tableBody')
    references['pagination'] = document.getElementById('pagination')
    references['pagerButtons'] = document.getElementById('pagerButtons')

    const row = references['tableHeader'].insertRow()
    headers.forEach(element => {
        const cell = row.insertCell()
        cell.appendChild(document.createTextNode(element))
        sortable[element] ? cell.classList.add('sortable') : ''
    })
}

const addFilters = () => {
    const row = references['tableHeader'].insertRow()
    headers.forEach(element => {
        const cell = row.insertCell()
        if (filterable.indexOf(element)>-1) {
            const input = document.createElement('input')
            input.setAttribute('id', element)
            cell.appendChild(input)
            input.addEventListener('keyup', filterData)
        }
    })
}

const filterData = (e) => {
    if (e.target.id && e.target.value) {
        filteredData = data.filter(el => {
            return new RegExp(e.target.value, 'i').test(el[e.target.id])
        })
        resetValues(filteredData)
        resetInputs(e.target.id)
        if (isPaginated) createPagination(filteredData)
    } else {
        filteredData = []
        resetValues(data)
        resetInputs()
        if (isPaginated) createPagination(data)
    }
}
  
const renderTable = (values) => {
    references['tableBody'].innerHTML = null
    values.forEach(element => {
        const row = references['tableBody'].insertRow()
        headers.forEach(headerKey => {
            const cell = row.insertCell()
            cell.appendChild(document.createTextNode(element[headerKey]))
        })
    })
}

const createPagination = (values) => {

    let pageNumbers = []
    for (let i = 1; i <= Math.ceil(values.length / itemsPerPage); i++) {
      pageNumbers.push(i)
    }
    totalPages = pageNumbers.length
    const fragment = document.createDocumentFragment()

    pageNumbers.forEach(element => {
        const span = document.createElement('span')
        span.innerHTML = element
        span.dataset.value = element
        element == current ? span.className = 'active' : ''
        fragment.appendChild(span)
    })

    references['pagination'].innerHTML = null
    references['pagination'].appendChild(fragment)

}

const createPagers = () => {
    const prev = document.createElement('button')
    prev.innerHTML = 'Prev'
    prev.setAttribute('id', 'prev')
    references['pagerButtons'].appendChild(prev)

    const next = document.createElement('button')
    next.innerHTML = 'Next'
    next.setAttribute('id', 'next')
    references['pagerButtons'].appendChild(next)

    attachPagerListeners()

}

})()