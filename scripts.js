const Modal = {
    open(){
        //Abrir modal
        //Adicionar a class active no modal
        document
        .querySelector('.modal-overlay')
        .classList
        .add('active')
    },
    close(){
        document
        .querySelector('.modal-overlay')
        .classList
        .remove('active')
        
    }
}

const Storage = {
    
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() { 
        let income = 0;
        //pegar todas as transações
        //para cada transação,
        Transaction.all.forEach(transaction => {
            //se ela for maior que zero 
            if(transaction.amount > 0) {
                //somar a uma variavel e retornar a variavel
                income += transaction.amount;
            } 
        })
        return income;
    },

    expenses() {
        let expense = 0;
        //pegar todas as transações
        //para cada transação,
        Transaction.all.forEach(transaction => {
            //se ela for maior que zero 
            if(transaction.amount < 0) {
                //somar a uma variavel e retornar a variavel
                expense += transaction.amount;
            }
        })
        return expense;
    },

    total() {
        //somar o total (entradas - saídas)
        return Transaction.incomes() + Transaction.expenses();
    }
       
} 

//Substuindo os dados do HTML por dados JS 
const DOM = {

    transactionsContainer: document.querySelector('#data-table, tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {

        //aqui verifica se o usuário está recebendo ou pagando algo, sendo assim 
        //muda a cor do valor da transação
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        //função que faz o valor ficar com cifrão
        const amount = Utils.formatCurrency(transaction.amount)
        
        //função que cria no HTML as linhas na tabela de transações
        const html = `       
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
            </td>       
        `
        return html
    },

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
        
} 

const Utils = {

     formatAmount(value) {
        value = Number(value.replace(/\,\./g, "")) * 100

        return value
     },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")   

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const Form = {
    //aqui está pegando estes dados do HTML
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        //os dados do html foram pegados, e aqui está transformando em variáveis
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
        
    validateFields() {
        //verifica se todas as informações foram preenchidas

        //está pegando os dados do objeto getValues
        const {description, amount, date} = Form.getValues()

        if ( 
            description.trim() === "" || 
            amount.trim() === "" ||
            date.trim() === "") {
                throw new Error ("Por favor, preencha todos os campos")
            }
    },

    formatValues() {
         //formatando os dados para salvar

         let { description, amount, date } = Form.getValues()

         amount = Utils.formatAmount(amount)

         date = Utils.formatDate(date)

         return {
             description,
             amount,
             date
         }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },
    
    submit(event) {
        event.preventDefault()
        
        try {

            //verifica se todas as informações foram preenchidas
            Form.validateFields()
            //formatando os dados para salvar
            const transaction = Form.formatValues()
            //salvar
            Transaction.add(transaction)
            //apagar os dados do formulario
            Form.clearFields()
            //modal feche
            Modal.close()

        } catch (error) {
            alert(error.message)
        }

    }
}

const App = {
    init() {

        Transaction.all.forEach(function(transaction, index){
            DOM.addTransaction(transaction, index)
        })
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload() {
      DOM.clearTransactions() 
      App.init() 
    }
 }

 App.init()

