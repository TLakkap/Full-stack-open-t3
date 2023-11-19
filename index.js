require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express ()
const Person = require('./models/person')

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  console.log(error.name)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError'){
    return response.status(400).json({ error: error.message })
  } else if (error.name === 'ReferenceError'){
    return response.status(404).json({ error: error.message })
  }
  next(error)
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('requestData', (req) => {
  return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :requestData'))

app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then(persons => {
      res.json(persons)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      }else{
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.get('/info', (req, res, next) => {
  Person.find({})
    .then(persons => {
      res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${Date()}</p>`)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(response => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => {
      res.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body

  Person.findByIdAndUpdate(
    req.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }  //{ new true } is added because otherwise the object before updating would be returned
  )
    .then(updatedPerson => {
      if(updatedPerson !== null){
        res.json(updatedPerson)
      } else {
        next(error)
      }
    })
    .catch(error => next(error))
})

app.use(errorHandler)
app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})