const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express ()

app.use(express.json())
app.use(cors())

morgan.token('requestData', (req) => {
    return JSON.stringify(req.body);
  });

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :requestData'))

let persons = [
    {
      name: "Arto Hellas",
      number: "040-123456",
      id: 1
    },
    {
      name: "Ada Lovelace",
      number: "39-44-5323523",
      id: 2
    },
    {
      name: "Dan Abramov",
      number: "12-43-234345",
      id: 3
    },
    {
      name: "Mary Poppendieck",
      number: "39-23-6423122",
      id: 4
    }
  ]

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(person => person.id === id)

    if(person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})

app.get('/info', (req, res) => {
    const length = persons.length
    const date = Date()
    res.send('<p>Phonebook has info for ' + length + ' people</p><p>' + date + '</p>')
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(note => note.id !== id)

    res.status(204).end()
})

const generateId = () => {
    return Math.floor(Math.random() * 1000);
}

app.post('/api/persons', (req, res) => {
    const body = req.body
    
    const nameIndex = persons.findIndex(person => person.name === body.name)   

    if(!body.name) {
        return res.status(400).json({
            error: 'name missing'
        })
    }else if(!body.number) {
        return res.status(400).json({
            error: 'number missing'
        })
    }else if(nameIndex !== -1) {
        return res.status(400).json({
            error: 'name must be unique'
        })
    }
    
    const person = {
        name: body.name,
        number: body.number,
        id: generateId(),
    }

    persons = persons.concat(person)

    res.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})